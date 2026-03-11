const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendEmail } = require('./utils/email');

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
db.settings({ ignoreUndefinedProperties: true });

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
    const path = event.path.replace('/.netlify/functions/auth/', '');
    const { httpMethod, body } = event;

    let data = {};
    if (body) {
      try {
        data = JSON.parse(body);
      } catch (err) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid JSON body' }),
        };
      }
    }

    // =====================
    // SIGNUP
    // =====================
    if (path === 'signup' && httpMethod === 'POST') {
      const { schoolName, adminName, email, phone, schoolSize, password, subdomain } = data;

      if (!schoolName || !adminName || !email || !password || !subdomain) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing required fields' }),
        };
      }

      const existingSchool = await db
        .collection('schools')
        .where('subdomain', '==', subdomain)
        .limit(1)
        .get();

      if (!existingSchool.empty) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Subdomain already taken' }),
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const schoolRef = await db.collection('schools').add({
        name: schoolName,
        subdomain,
        adminEmail: email,
        phone,
        size: schoolSize,
        branding: {
          logo: null,
          primaryColor: '#4CAF50',
          secondaryColor: '#2E7D32',
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const userRef = await db.collection('users').add({
        schoolId: schoolRef.id,
        name: adminName,
        email,
        phone,
        role: 'admin',
        password: hashedPassword,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const token = jwt.sign(
        { userId: userRef.id, schoolId: schoolRef.id, email },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      try {
        await sendEmail({
          to: email,
          subject: 'Welcome to EduManagerPro!',
          template: 'welcome',
          data: {
            name: adminName,
            schoolName,
            subdomain: `${subdomain}.edumanagerpro.com`,
            loginUrl: `https://${subdomain}.edumanagerpro.com/login`,
          },
        });
      } catch (err) {
        console.error('Email send failed:', err);
      }

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          token,
          user: {
            id: userRef.id,
            name: adminName,
            email,
            role: 'admin',
            schoolId: schoolRef.id,
          },
        }),
      };
    }

    // =====================
    // LOGIN
    // =====================
    if (path === 'login' && httpMethod === 'POST') {
      const { email, password } = data;

      if (!email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Email and password are required' }),
        };
      }

      const users = await db
        .collection('users')
        .where('email', '==', email)
        .limit(1)
        .get();

      if (users.empty) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid credentials' }),
        };
      }

      const userDoc = users.docs[0];
      const user = { id: userDoc.id, ...userDoc.data() };

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid credentials' }),
        };
      }

      const schoolDoc = await db.collection('schools').doc(user.schoolId).get();
      const school = schoolDoc.data();

      const token = jwt.sign(
        { userId: user.id, schoolId: user.schoolId, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      try {
        await sendEmail({
          to: email,
          subject: 'New Login Detected',
          template: 'login-alert',
          data: {
            name: user.name,
            time: new Date().toLocaleString(),
            ip: event.headers['client-ip'] || 'Unknown',
          },
        });
      } catch (err) {
        console.error('Login email failed:', err);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            schoolId: user.schoolId,
            schoolName: school?.name || null,
            subdomain: school?.subdomain || null,
          },
        }),
      };
    }

    // =====================
    // GET CURRENT USER
    // =====================
    if (path === 'me' && httpMethod === 'GET') {
      const token = event.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Unauthorized' }),
        };
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userDoc = await db.collection('users').doc(decoded.userId).get();
        const schoolDoc = await db.collection('schools').doc(decoded.schoolId).get();

        if (!userDoc.exists || !schoolDoc.exists) {
          throw new Error('User not found');
        }

        const user = userDoc.data();
        const school = schoolDoc.data();

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            id: decoded.userId,
            name: user.name,
            email: user.email,
            role: user.role,
            schoolId: decoded.schoolId,
            schoolName: school.name,
            subdomain: school.subdomain,
          }),
        };
      } catch (error) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid token' }),
        };
      }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' }),
    };

  } catch (error) {
    console.error('Auth function error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
