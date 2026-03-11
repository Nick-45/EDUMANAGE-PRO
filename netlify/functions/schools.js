const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;

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

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async (event) => {

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {

    const token = event.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const path = event.path.replace('/.netlify/functions/schools/', '');
    const parts = path.split('/');
    const schoolId = parts[0];
    const action = parts[1];

    if (decoded.schoolId !== schoolId) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Forbidden' }),
      };
    }

    // ======================
    // GET SCHOOL
    // ======================

    if (event.httpMethod === 'GET' && !action) {

      const schoolDoc = await db.collection('schools').doc(schoolId).get();

      if (!schoolDoc.exists) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'School not found' }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          id: schoolDoc.id,
          ...schoolDoc.data(),
        }),
      };

    }

    // ======================
    // GET SUBSCRIPTION
    // ======================

    if (event.httpMethod === 'GET' && action === 'subscription') {

      const subscriptionDoc = await db
        .collection('subscriptions')
        .where('schoolId', '==', schoolId)
        .where('status', '==', 'active')
        .limit(1)
        .get();

      const subscription = subscriptionDoc.empty
        ? null
        : {
            id: subscriptionDoc.docs[0].id,
            ...subscriptionDoc.docs[0].data(),
          };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(subscription),
      };

    }

    // ======================
    // UPDATE SCHOOL
    // ======================

    if (event.httpMethod === 'PUT' && !action) {

      const updates = JSON.parse(event.body);

      await db.collection('schools').doc(schoolId).update({
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const updatedDoc = await db.collection('schools').doc(schoolId).get();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          id: updatedDoc.id,
          ...updatedDoc.data(),
        }),
      };

    }

    // ======================
    // UPLOAD LOGO (CLOUDINARY)
    // ======================

    if (event.httpMethod === 'POST' && action === 'logo') {

    let body;

if (event.isBase64Encoded) {
  body = JSON.parse(Buffer.from(event.body, 'base64').toString());
} else {
  body = JSON.parse(event.body);
}

const { image } = body;

      if (!image) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Image required' }),
        };
      }

      // Upload to Cloudinary
      const upload = await cloudinary.uploader.upload(image, {
        folder: 'school_logos',
        public_id: `school-${schoolId}`,
        overwrite: true,
      });

      const logoUrl = upload.secure_url;

      // Save URL to Firestore
      await db.collection('schools').doc(schoolId).update({
        'identity.logo': logoUrl,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ logoUrl }),
      };

    }

    // ======================
    // SUBSCRIBE PLAN
    // ======================

    if (event.httpMethod === 'POST' && action === 'subscribe') {

      const { planId, paymentIntentId } = JSON.parse(event.body);

      const plans = {
        starter: { price: 2500, students: 200 },
        professional: { price: 5000, students: 500 },
        enterprise: { price: 10000, students: 'unlimited' },
      };

      const plan = plans[planId];

      if (!plan) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid plan' }),
        };
      }

      const subscriptionRef = await db.collection('subscriptions').add({
        schoolId,
        plan: planId,
        price: plan.price,
        students: plan.students,
        status: 'active',
        startDate: admin.firestore.FieldValue.serverTimestamp(),
        endDate: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        ),
        paymentIntentId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await db.collection('schools').doc(schoolId).update({
        subscriptionId: subscriptionRef.id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const subscriptionDoc = await subscriptionRef.get();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          subscription: {
            id: subscriptionRef.id,
            ...subscriptionDoc.data(),
          },
        }),
      };

    }

    // ======================
    // CANCEL SUBSCRIPTION
    // ======================

    if (event.httpMethod === 'POST' && action === 'cancel-subscription') {

      const subscriptions = await db
        .collection('subscriptions')
        .where('schoolId', '==', schoolId)
        .where('status', '==', 'active')
        .limit(1)
        .get();

      if (!subscriptions.empty) {
        await subscriptions.docs[0].ref.update({
          status: 'cancelled',
          cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true }),
      };

    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' }),
    };

  } catch (error) {

    console.error('Schools function error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
    };

  }

};
