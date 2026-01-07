const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const config = require('../config/env');

class PaymentService {
  constructor() {
    this.stripe = require('stripe')(config.STRIPE_SECRET_KEY);
  }

  // M-Pesa Payment
  async initiateMpesaPayment(order, phoneNumber) {
    try {
      // Get M-Pesa access token
      const auth = Buffer.from(`${config.MPESA_CONSUMER_KEY}:${config.MPESA_CONSUMER_SECRET}`).toString('base64');
      
      const tokenResponse = await axios.get(
        'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        {
          headers: { Authorization: `Basic ${auth}` }
        }
      );

      const accessToken = tokenResponse.data.access_token;

      // Generate timestamp
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      
      // Generate password
      const password = Buffer.from(
        `${config.MPESA_SHORTCODE}${config.MPESA_PASSKEY}${timestamp}`
      ).toString('base64');

      // STK Push request
      const stkResponse = await axios.post(
        'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        {
          BusinessShortCode: config.MPESA_SHORTCODE,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: order.package.price,
          PartyA: phoneNumber,
          PartyB: config.MPESA_SHORTCODE,
          PhoneNumber: phoneNumber,
          CallBackURL: `${config.SERVER_URL}/api/payments/mpesa/callback`,
          AccountReference: order.orderId,
          TransactionDesc: `Payment for ${order.package.name}`
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Create payment record
      const payment = await Payment.create({
        order: order._id,
        user: order.user,
        method: 'mpesa',
        amount: order.package.price,
        status: 'initiated',
        phoneNumber,
        mpesaResponse: stkResponse.data,
        transactionId: stkResponse.data.CheckoutRequestID,
        metadata: {
          checkoutId: stkResponse.data.CheckoutRequestID
        }
      });

      // Update order with payment info
      await Order.findByIdAndUpdate(order._id, {
        'payment.method': 'mpesa',
        'payment.status': 'processing',
        'payment.transactionId': stkResponse.data.CheckoutRequestID
      });

      logger.info(`M-Pesa payment initiated for order ${order.orderId}`, {
        checkoutRequestId: stkResponse.data.CheckoutRequestID,
        amount: order.package.price
      });

      return {
        success: true,
        paymentId: payment.paymentId,
        checkoutRequestId: stkResponse.data.CheckoutRequestID,
        message: 'STK Push sent to your phone'
      };

    } catch (error) {
      logger.error('M-Pesa payment initiation failed:', error);
      throw new Error(`Payment initiation failed: ${error.message}`);
    }
  }

  // Process card payment with Stripe
  async processCardPayment(order, cardDetails) {
    try {
      // Create Stripe payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(order.package.price * 100), // Convert to cents
        currency: order.package.currency.toLowerCase(),
        payment_method_data: {
          type: 'card',
          card: {
            number: cardDetails.cardNumber,
            exp_month: cardDetails.expiry.split('/')[0],
            exp_year: cardDetails.expiry.split('/')[1],
            cvc: cardDetails.cvc
          }
        },
        description: `Payment for ${order.package.name}`,
        metadata: {
          orderId: order.orderId,
          package: order.package.type
        }
      });

      // Confirm payment
      const confirmedIntent = await this.stripe.paymentIntents.confirm(paymentIntent.id);

      // Create payment record
      const payment = await Payment.create({
        order: order._id,
        user: order.user,
        method: 'card',
        amount: order.package.price,
        currency: order.package.currency,
        status: confirmedIntent.status === 'succeeded' ? 'completed' : 'failed',
        transactionId: confirmedIntent.id,
        receiptNumber: confirmedIntent.charges.data[0]?.receipt_number,
        stripeResponse: confirmedIntent,
        metadata: {
          stripePaymentIntent: confirmedIntent.id
        },
        completedAt: confirmedIntent.status === 'succeeded' ? new Date() : null
      });

      // Update order
      const orderStatus = confirmedIntent.status === 'succeeded' ? 'completed' : 'failed';
      await Order.findByIdAndUpdate(order._id, {
        'payment.method': 'card',
        'payment.status': orderStatus,
        'payment.transactionId': confirmedIntent.id,
        'payment.receiptNumber': confirmedIntent.charges.data[0]?.receipt_number,
        'payment.paymentDate': new Date(),
        status: orderStatus
      });

      logger.info(`Card payment processed for order ${order.orderId}`, {
        status: confirmedIntent.status,
        amount: order.package.price
      });

      return {
        success: confirmedIntent.status === 'succeeded',
        paymentId: payment.paymentId,
        transactionId: confirmedIntent.id,
        status: confirmedIntent.status
      };

    } catch (error) {
      logger.error('Card payment processing failed:', error);
      throw new Error(`Payment processing failed: ${error.message}`);
    }
  }

  // Verify bank payment
  async verifyBankPayment(order, proofFile) {
    try {
      // Upload proof to S3
      const s3Service = require('./s3Service');
      const proofUrl = await s3Service.uploadPaymentProof(proofFile, order.orderId);

      // Create pending payment record
      const payment = await Payment.create({
        order: order._id,
        user: order.user,
        method: 'bank',
        amount: order.package.price,
        status: 'pending',
        bankDetails: {
          proofUrl: proofUrl,
          transactionReference: `BANK-${Date.now()}`
        }
      });

      // Update order
      await Order.findByIdAndUpdate(order._id, {
        'payment.method': 'bank',
        'payment.status': 'pending',
        status: 'processing'
      });

      // Send notification to admin for manual verification
      const emailService = require('./emailService');
      await emailService.sendPaymentVerificationRequest({
        orderId: order.orderId,
        amount: order.package.price,
        proofUrl: proofUrl,
        userEmail: order.user.email
      });

      logger.info(`Bank payment verification requested for order ${order.orderId}`);

      return {
        success: true,
        paymentId: payment.paymentId,
        message: 'Payment proof submitted. Our team will verify it within 24 hours.'
      };

    } catch (error) {
      logger.error('Bank payment verification failed:', error);
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }

  // Check payment status
  async checkPaymentStatus(paymentId) {
    try {
      const payment = await Payment.findOne({ paymentId })
        .populate('order', 'orderId status package')
        .populate('user', 'email fullName');

      if (!payment) {
        throw new Error('Payment not found');
      }

      // For M-Pesa, check callback status
      if (payment.method === 'mpesa' && payment.status === 'initiated') {
        const status = await this.checkMpesaCallback(payment.transactionId);
        if (status === 'success') {
          payment.status = 'completed';
          payment.completedAt = new Date();
          await payment.save();

          // Update order
          await Order.findByIdAndUpdate(payment.order, {
            'payment.status': 'completed',
            status: 'confirmed'
          });
        }
      }

      return {
        paymentId: payment.paymentId,
        status: payment.status,
        method: payment.method,
        amount: payment.amount,
        currency: payment.currency,
        transactionId: payment.transactionId,
        createdAt: payment.createdAt,
        completedAt: payment.completedAt,
        order: payment.order
      };

    } catch (error) {
      logger.error('Error checking payment status:', error);
      throw error;
    }
  }

  // M-Pesa callback handler
  async handleMpesaCallback(callbackData) {
    try {
      const { Body: { stkCallback: callback } } = callbackData;
      
      const payment = await Payment.findOne({ 
        transactionId: callback.CheckoutRequestID 
      });

      if (!payment) {
        logger.warn('M-Pesa callback for unknown payment:', callback.CheckoutRequestID);
        return;
      }

      if (callback.ResultCode === 0) {
        // Payment successful
        payment.status = 'completed';
        payment.completedAt = new Date();
        payment.receiptNumber = callback.CallbackMetadata?.Item?.find(
          item => item.Name === 'MpesaReceiptNumber'
        )?.Value;
        payment.mpesaResponse = callback;

        await payment.save();

        // Update order
        await Order.findByIdAndUpdate(payment.order, {
          'payment.status': 'completed',
          'payment.receiptNumber': payment.receiptNumber,
          'payment.paymentDate': new Date(),
          status: 'confirmed'
        });

        logger.info(`M-Pesa payment completed for order ${payment.order.orderId}`);

        // Send confirmation email
        const emailService = require('./emailService');
        await emailService.sendPaymentConfirmation(payment);

      } else {
        // Payment failed
        payment.status = 'failed';
        payment.mpesaResponse = callback;
        await payment.save();

        await Order.findByIdAndUpdate(payment.order, {
          'payment.status': 'failed',
          status: 'failed'
        });

        logger.warn(`M-Pesa payment failed for order ${payment.order.orderId}:`, callback.ResultDesc);
      }

    } catch (error) {
      logger.error('Error handling M-Pesa callback:', error);
    }
  }
}

module.exports = new PaymentService();
