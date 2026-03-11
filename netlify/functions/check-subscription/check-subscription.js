const admin = require('firebase-admin');

// Initialize Firebase Admin (reuse the same initialization)
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

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  // Only accept GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Get school ID from query parameters
    const schoolId = event.queryStringParameters?.schoolId;

    if (!schoolId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'School ID required' }),
      };
    }

    const schoolRef = db.collection('schools').doc(schoolId);
    const schoolDoc = await schoolRef.get();

    if (!schoolDoc.exists) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'School not found' }),
      };
    }

    const data = schoolDoc.data();
    const subscription = data.subscription || {};

    // Check if subscription is active
    const now = new Date();
    const endDate = subscription.endDate?.toDate ? subscription.endDate.toDate() : subscription.endDate;
    const isActive = endDate ? new Date(endDate) > now : false;

    // Calculate days remaining
    let daysRemaining = 0;
    if (endDate && isActive) {
      const diffTime = new Date(endDate) - now;
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Get recent billing history
    const billingHistory = data.billingHistory || [];
    const recentBilling = billingHistory.slice(-5).reverse();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ...subscription,
        isActive,
        daysRemaining,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        startDate: subscription.startDate ? new Date(subscription.startDate).toISOString() : null,
        lastPayment: subscription.lastPayment ? new Date(subscription.lastPayment).toISOString() : null,
        recentBilling,
        schoolName: data.name
      }),
    };

  } catch (error) {
    console.error('Error checking subscription:', error);
    
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
