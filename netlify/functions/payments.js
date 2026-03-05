const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

// M-Pesa API configuration
const mpesaAuth = Buffer.from(
  `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
).toString('base64');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = event.path.replace('/.netlify/functions/payments/', '');
    const { httpMethod, body } = event;
    const data = body ? JSON.parse(body) : {};
    const token = event.headers.authorization?.replace('Bearer ', '');

    // Verify authentication
    if (!token) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    // Create Stripe Payment Intent
    if (path === 'create-intent' && httpMethod === 'POST') {
      const { amount, currency = 'kes' } = data;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency,
        metadata: { integration_check: 'accept_a_payment' },
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        }),
      };
    }

    // Confirm Payment
    if (path === 'confirm' && httpMethod === 'POST') {
      const { paymentIntentId } = data;

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
        }),
      };
    }

    // M-Pesa STK Push
    if (path === 'mpesa/stk-push' && httpMethod === 'POST') {
      const { phone, amount } = data;

      // Get access token
      const tokenResponse = await fetch(
        'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${mpesaAuth}`,
          },
        }
      );

      const { access_token } = await tokenResponse.json();

      // Generate timestamp
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      
      // Generate password
      const password = Buffer.from(
        `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
      ).toString('base64');

      // STK Push request
      const stkResponse = await fetch(
        'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            BusinessShortCode: process.env.MPESA_SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: amount,
            PartyA: phone.replace('+', ''),
            PartyB: process.env.MPESA_SHORTCODE,
            PhoneNumber: phone.replace('+', ''),
            CallBackURL: `${process.env.REACT_APP_URL}/.netlify/functions/payments/mpesa-callback`,
            AccountReference: 'EduManagerPro',
            TransactionDesc: 'Subscription Payment',
          }),
        }
      );

      const stkData = await stkResponse.json();

      if (stkData.ResponseCode === '0') {
        // Store transaction
        await db.collection('mpesaTransactions').add({
          checkoutRequestID: stkData.CheckoutRequestID,
          merchantRequestID: stkData.MerchantRequestID,
          phone,
          amount,
          status: 'pending',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            checkoutRequestID: stkData.CheckoutRequestID,
            message: 'STK Push sent. Please check your phone.',
          }),
        };
      } else {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Failed to initiate payment' }),
        };
      }
    }

    // M-Pesa Callback
    if (path === 'mpesa-callback' && httpMethod === 'POST') {
      const callbackData = JSON.parse(event.body);

      const { CheckoutRequestID, ResultCode, ResultDesc } = callbackData.Body.stkCallback;

      // Update transaction status
      const transactions = await db
        .collection('mpesaTransactions')
        .where('checkoutRequestID', '==', CheckoutRequestID)
        .limit(1)
        .get();

      if (!transactions.empty) {
        const transaction = transactions.docs[0];
        await transaction.ref.update({
          status: ResultCode === 0 ? 'completed' : 'failed',
          resultCode: ResultCode,
          resultDesc: ResultDesc,
          callbackData: callbackData,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        if (ResultCode === 0) {
          // Payment successful - activate subscription
          // You would update the school's subscription here
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true }),
      };
    }

    // Check M-Pesa Status
    if (path.startsWith('mpesa/status/') && httpMethod === 'GET') {
      const checkoutRequestID = path.split('/').pop();

      const transactions = await db
        .collection('mpesaTransactions')
        .where('checkoutRequestID', '==', checkoutRequestID)
        .limit(1)
        .get();

      if (transactions.empty) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Transaction not found' }),
        };
      }

      const transaction = transactions.docs[0].data();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: transaction.status,
          amount: transaction.amount,
        }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' }),
    };
  } catch (error) {
    console.error('Payments function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
