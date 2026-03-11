const admin = require('firebase-admin');
const crypto = require('crypto');

// Initialize Firebase Admin only once
let firebaseApp;
if (!admin.apps.length) {
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

// Map payment links to subscription details
const planMapping = {
  'https://lipana.dev/pay/basic-monthly': {
    plan: 'basic',
    duration: 'monthly',
    days: 31,
    price: 3500
  },
  'https://lipana.dev/pay/basic-termly': {
    plan: 'basic',
    duration: 'termly',
    days: 95,
    price: 10500 // 3500 * 3
  },
  'https://lipana.dev/pay/basic-yearly': {
    plan: 'basic',
    duration: 'yearly',
    days: 300,
    price: 35000 // 3500 * 10 (approx)
  },
  'https://lipana.dev/pay/premium-monthly': {
    plan: 'premium',
    duration: 'monthly',
    days: 31,
    price: 5500
  },
  'https://lipana.dev/pay/premium-termly': {
    plan: 'premium',
    duration: 'termly',
    days: 95,
    price: 16500 // 5500 * 3
  },
  'https://lipana.dev/pay/premium-yearly': {
    plan: 'premium',
    duration: 'yearly',
    days: 300,
    price: 55000 // 5500 * 10
  },
  'https://lipana.dev/pay/enterprise-monthly': {
    plan: 'enterprise',
    duration: 'monthly',
    days: 31,
    price: 7500
  },
  'https://lipana.dev/pay/enterprise-termly': {
    plan: 'enterprise',
    duration: 'termly',
    days: 95,
    price: 22500 // 7500 * 3
  },
  'https://lipana.dev/pay/enterprise-yearly': {
    plan: 'enterprise',
    duration: 'yearly',
    days: 300,
    price: 75000 // 7500 * 10
  }
};

// Verify webhook signature
const verifySignature = (payload, signature) => {
  const secret = process.env.LIPANA_WEBHOOK_SECRET;
  
  if (!secret) {
    console.error('LIPANA_WEBHOOK_SECRET not set');
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
};

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-lipana-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Get signature from headers
    const signature = event.headers['x-lipana-signature'];
    
    if (!signature) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'No signature provided' }),
      };
    }

    // Parse webhook payload
    const payload = JSON.parse(event.body);

    // Verify webhook signature
    const isValid = verifySignature(payload, signature);
    
    if (!isValid) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid signature' }),
      };
    }

    const {
      event: webhookEvent,
      data: {
        transaction_id,
        amount,
        currency,
        status,
        payment_link,
        customer_email,
        customer_phone,
        metadata,
        payment_date
      }
    } = payload;

    // Only process successful payments
    if (webhookEvent !== 'payment.success' || status !== 'completed') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Event ignored - not a successful payment' }),
      };
    }

    // Extract school ID from metadata
    const schoolId = metadata?.schoolId;
    
    if (!schoolId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No school ID in metadata' }),
      };
    }

    // Get plan details from payment link
    const planDetails = planMapping[payment_link];
    
    if (!planDetails) {
      console.error('Invalid payment link:', payment_link);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid payment link' }),
      };
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + planDetails.days);

    // Get school reference
    const schoolRef = db.collection('schools').doc(schoolId);
    
    // Run transaction to update subscription
    await db.runTransaction(async (transaction) => {
      const schoolDoc = await transaction.get(schoolRef);
      
      if (!schoolDoc.exists) {
        throw new Error('School not found');
      }

      // Create billing record
      const billingRecord = {
        transactionId: transaction_id,
        amount: parseFloat(amount) || planDetails.price,
        currency: currency || 'KES',
        plan: planDetails.plan,
        duration: planDetails.duration,
        paymentDate: new Date(payment_date || Date.now()),
        startDate,
        endDate,
        invoice: `INV-${Date.now()}-${schoolId.slice(0, 4)}`,
        status: 'paid',
        customerEmail: customer_email,
        customerPhone: customer_phone
      };

      // Update subscription
      transaction.update(schoolRef, {
        'subscription.plan': planDetails.plan,
        'subscription.duration': planDetails.duration,
        'subscription.startDate': startDate,
        'subscription.endDate': endDate,
        'subscription.status': 'active',
        'subscription.lastPayment': new Date(),
        'subscription.transactionId': transaction_id,
        'subscription.updatedAt': new Date(),
        'subscription.amount': planDetails.price,
        'subscription.currency': 'KES',
        // Add to billing history
        billingHistory: admin.firestore.FieldValue.arrayUnion(billingRecord)
      });
    });

    console.log(`✅ Subscription updated for school ${schoolId}: ${planDetails.plan} - ${planDetails.duration}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Webhook processed successfully',
        subscription: {
          schoolId,
          plan: planDetails.plan,
          duration: planDetails.duration,
          startDate,
          endDate,
          daysRemaining: planDetails.days
        }
      }),
    };

  } catch (error) {
    console.error('❌ Webhook error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
    };
  }
};
