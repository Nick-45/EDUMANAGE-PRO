const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const busboy = require('busboy');

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
const bucket = admin.storage().bucket();

exports.handler = async (event, context) => {
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
    const schoolId = path.split('/')[0];

    // Verify user has access to this school
    if (decoded.schoolId !== schoolId) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Forbidden' }),
      };
    }

    // Get school
    if (event.httpMethod === 'GET') {
      const schoolDoc = await db.collection('schools').doc(schoolId).get();
      
      if (!schoolDoc.exists) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'School not found' }),
        };
      }

      // Get subscription
      const subscriptionDoc = await db
        .collection('subscriptions')
        .where('schoolId', '==', schoolId)
        .where('status', '==', 'active')
        .limit(1)
        .get();

      const school = schoolDoc.data();
      const subscription = subscriptionDoc.empty ? null : subscriptionDoc.docs[0].data();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          id: schoolDoc.id,
          ...school,
          subscription,
        }),
      };
    }

    // Update school
    if (event.httpMethod === 'PUT') {
      const updates = JSON.parse(event.body);

      await db.collection('schools').doc(schoolId).update({
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const updated = await db.collection('schools').doc(schoolId).get();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          id: updated.id,
          ...updated.data(),
        }),
      };
    }

    // Upload logo
    if (event.httpMethod === 'POST' && path.includes('/logo')) {
      return new Promise((resolve) => {
        const bb = busboy({ headers: event.headers });

        bb.on('file', async (fieldname, file, filename) => {
          const filePath = `schools/${schoolId}/logo-${Date.now()}.png`;
          const fileUpload = bucket.file(filePath);

          const stream = fileUpload.createWriteStream({
            metadata: {
              contentType: 'image/png',
            },
          });

          stream.on('error', (error) => {
            console.error('Upload error:', error);
            resolve({
              statusCode: 500,
              headers,
              body: JSON.stringify({ error: 'Upload failed' }),
            });
          });

          stream.on('finish', async () => {
            // Make public
            await fileUpload.makePublic();

            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

            // Update school with logo URL
            await db.collection('schools').doc(schoolId).update({
              'branding.logo': publicUrl,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            resolve({
              statusCode: 200,
              headers,
              body: JSON.stringify({ logoUrl: publicUrl }),
            });
          });

          file.pipe(stream);
        });

        bb.on('error', (error) => {
          console.error('Busboy error:', error);
          resolve({
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Upload failed' }),
          });
        });

        bb.end(event.body);
      });
    }

    // Subscribe to plan
    if (event.httpMethod === 'POST' && path.includes('/subscribe')) {
      const { planId, paymentIntentId } = JSON.parse(event.body);

      // Get plan details
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

      // Create subscription
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

      // Update school with subscription
      await db.collection('schools').doc(schoolId).update({
        subscriptionId: subscriptionRef.id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Send confirmation email
      // You would trigger an email here

      const subscription = await subscriptionRef.get();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          subscription: {
            id: subscriptionRef.id,
            ...subscription.data(),
          },
        }),
      };
    }

    // Cancel subscription
    if (event.httpMethod === 'POST' && path.includes('/cancel-subscription')) {
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
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
