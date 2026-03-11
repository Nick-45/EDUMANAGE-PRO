const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

// Firebase Init
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


// TRIGGER GITHUB BUILD
const triggerBuild = async (school, platform, buildId) => {

  const response = await fetch(
    `https://api.github.com/repos/${process.env.GITHUB_REPO}/actions/workflows/build-apk.yml/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({
        ref: "main",
        inputs: {
          school_name: school.name,
          subdomain: school.subdomain,
          logo: school.logo || "",
          platform,
          build_id: buildId
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error("Failed to trigger GitHub build");
  }

};


exports.handler = async (event) => {

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {

    const token = event.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const path = event.path.replace('/.netlify/functions/apps/', '');



    // GENERATE APP
    if (path === 'generate' && event.httpMethod === 'POST') {

      const { schoolId, platform } = JSON.parse(event.body);

      if (decoded.schoolId !== schoolId) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ error: 'Forbidden' })
        };
      }

      const schoolDoc = await db.collection('schools').doc(schoolId).get();

      if (!schoolDoc.exists) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'School not found' })
        };
      }

      const school = schoolDoc.data();

      if (!['android','ios'].includes(platform)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid platform' })
        };
      }

      // CREATE BUILD RECORD
      const buildRef = await db.collection('appBuilds').add({
        schoolId,
        subdomain: school.subdomain,
        platform,
        status: 'building',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // TRIGGER GITHUB BUILD
      await triggerBuild(school, platform, buildRef.id);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          buildId: buildRef.id,
          status: 'building'
        }),
      };

    }



    // GET BUILD STATUS
    if (path.startsWith('status/') && event.httpMethod === 'GET') {

      const buildId = path.split('/')[1];

      const buildDoc = await db.collection('appBuilds').doc(buildId).get();

      if (!buildDoc.exists) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Build not found' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(buildDoc.data()),
      };

    }



    // DOWNLOAD
    if (path.startsWith('download/') && event.httpMethod === 'GET') {

      const buildId = path.split('/')[1];

      const buildDoc = await db.collection('appBuilds').doc(buildId).get();

      if (!buildDoc.exists) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Build not found' })
        };
      }

      const build = buildDoc.data();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          downloadUrl: build.downloadUrl || null,
          status: build.status
        }),
      };

    }

    return { statusCode: 404, headers };

  } catch (error) {

    console.error('Apps function error:', error);

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
