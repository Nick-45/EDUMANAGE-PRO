const PaymentService = require('../services/paymentService');
const Order = require('../models/Order');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

class PaymentController {
  // Initiate M-Pesa payment
  async initiateMpesa(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { orderId, phoneNumber } = req.body;
      const userId = req.user.id;

      // Fetch order
      const order = await Order.findOne({ 
        orderId,
        user: userId,
        'payment.status': { $in: ['pending', 'processing'] }
      });

      if (!order) {
        return res.status(404).json({ 
          success: false, 
          message: 'Order not found or already processed' 
        });
      }

      const result = await PaymentService.initiateMpesaPayment(order, phoneNumber);
      
      res.status(200).json(result);

    } catch (error) {
      logger.error('M-Pesa initiation error:', error);
      next(error);
    }
  }

  // Process card payment
  async processCard(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { orderId, cardNumber, expiry, cvc } = req.body;
      const userId = req.user.id;

      // Fetch order
      const order = await Order.findOne({ 
        orderId,
        user: userId,
        'payment.status': { $in: ['pending', 'processing'] }
      });

      if (!order) {
        return res.status(404).json({ 
          success: false, 
          message: 'Order not found or already processed' 
        });
      }

      const result = await PaymentService.processCardPayment(order, {
        cardNumber,
        expiry,
        cvc
      });

      res.status(200).json(result);

    } catch (error) {
      logger.error('Card payment error:', error);
      next(error);
    }
  }

  // Verify bank payment
  async verifyBank(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { orderId } = req.body;
      const userId = req.user.id;
      const proofFile = req.file;

      if (!proofFile) {
        return res.status(400).json({ 
          success: false, 
          message: 'Payment proof is required' 
        });
      }

      // Fetch order
      const order = await Order.findOne({ 
        orderId,
        user: userId,
        'payment.status': { $in: ['pending', 'processing'] }
      });

      if (!order) {
        return res.status(404).json({ 
          success: false, 
          message: 'Order not found or already processed' 
        });
      }

      const result = await PaymentService.verifyBankPayment(order, proofFile);
      
      res.status(200).json(result);

    } catch (error) {
      logger.error('Bank payment verification error:', error);
      next(error);
    }
  }

  // Check payment status
  async checkStatus(req, res, next) {
    try {
      const { paymentId } = req.params;

      const result = await PaymentService.checkPaymentStatus(paymentId);
      
      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      logger.error('Payment status check error:', error);
      next(error);
    }
  }

  // M-Pesa callback webhook
  async mpesaCallback(req, res, next) {
    try {
      const callbackData = req.body;
      
      // Process callback asynchronously
      PaymentService.handleMpesaCallback(callbackData);

      // Always respond with success to M-Pesa
      res.status(200).json({
        ResultCode: 0,
        ResultDesc: 'Success'
      });

    } catch (error) {
      logger.error('M-Pesa callback error:', error);
      // Still respond with success to prevent retries
      res.status(200).json({
        ResultCode: 0,
        ResultDesc: 'Success'
      });
    }
  }

  // Stripe webhook
  async stripeWebhook(req, res, next) {
    try {
      const sig = req.headers['stripe-signature'];
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

      let event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handleStripePaymentSuccess(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handleStripePaymentFailure(event.data.object);
          break;
        default:
          logger.info(`Unhandled Stripe event type: ${event.type}`);
      }

      res.json({ received: true });

    } catch (error) {
      logger.error('Stripe webhook error:', error);
      next(error);
    }
  }

  async handleStripePaymentSuccess(paymentIntent) {
    try {
      const { orderId } = paymentIntent.metadata;
      
      // Find and update payment
      const payment = await Payment.findOne({ 
        transactionId: paymentIntent.id 
      });

      if (payment) {
        payment.status = 'completed';
        payment.completedAt = new Date();
        await payment.save();

        // Update order
        await Order.findOneAndUpdate(
          { orderId },
          {
            'payment.status': 'completed',
            'payment.paymentDate': new Date(),
            status: 'confirmed'
          }
        );

        logger.info(`Stripe payment completed for order ${orderId}`);
      }

    } catch (error) {
      logger.error('Error handling Stripe payment success:', error);
    }
  }

  async handleStripePaymentFailure(paymentIntent) {
    try {
      const payment = await Payment.findOne({ 
        transactionId: paymentIntent.id 
      });

      if (payment) {
        payment.status = 'failed';
        await payment.save();

        await Order.findByIdAndUpdate(payment.order, {
          'payment.status': 'failed',
          status: 'failed'
        });

        logger.warn(`Stripe payment failed for payment ${payment.paymentId}`);
      }

    } catch (error) {
      logger.error('Error handling Stripe payment failure:', error);
    }
  }
}

module.exports = new PaymentController();
