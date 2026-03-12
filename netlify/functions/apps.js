const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

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

// Verify build callback signature
const verifyBuildCallback = (payload, signature) => {
  const secret = process.env.BUILD_CALLBACK_SECRET;
  
  if (!secret) {
    console.error('BUILD_CALLBACK_SECRET not set');
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

// TRIGGER GITHUB BUILD
const triggerBuild = async (school, platform, buildId) => {
  const response = await fetch(
    `https://api.github.com/repos/${process.env.CORDOVA_REPO}/actions/workflows/build-apk.yml/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CORDOVA_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json"
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
    const text = await response.text();
    console.error("GitHub API ERROR:", text);
    throw new Error(`GitHub build trigger failed: ${text}`);
  }
};

// UPDATE BUILD STATUS
const updateBuildStatus = async (buildId, status, downloadUrl = null, errorMessage = null) => {
  try {
    const buildRef = db.collection('appBuilds').doc(buildId);
    const updateData = {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (downloadUrl) {
      updateData.downloadUrl = downloadUrl;
      updateData.completedAt = admin.firestore.FieldValue.serverTimestamp();
    }
    
    if (errorMessage) {
      updateData.error = errorMessage;
    }
    
    await buildRef.update(updateData);
    console.log(`Build ${buildId} status updated to ${status}`);
    
    // Also update the school's app reference
    if (status === 'completed' && downloadUrl) {
      const buildDoc = await buildRef.get();
      const buildData = buildDoc.data();
      
      if (buildData.schoolId) {
        const schoolRef = db.collection('schools').doc(buildData.schoolId);
        await schoolRef.update({
          [`app.${buildData.platform}`]: {
            buildId,
            downloadUrl,
            buildDate: admin.firestore.FieldValue.serverTimestamp(),
            status: 'available'
          }
        });
      }
    }
  } catch (error) {
    console.error('Error updating build status:', error);
  }
};

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Build-Signature',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = event.path.replace('/.netlify/functions/apps/', '');
    console.log('Request path:', path);
    console.log('HTTP Method:', event.httpMethod);

    // PUBLIC WEBHOOK ENDPOINT - No JWT required
    // BUILD COMPLETION CALLBACK from GitHub Actions
    if (path === 'build-complete' && event.httpMethod === 'POST') {
      console.log('📱 Build completion callback received');
      
      // Verify signature
      const signature = event.headers['x-build-signature'];
      const payload = JSON.parse(event.body);
      
      if (!verifyBuildCallback(payload, signature)) {
        console.error('Invalid signature for build callback');
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid signature' })
        };
      }

      const { buildId, status, downloadUrl, error } = payload;
      
      if (!buildId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing buildId' })
        };
      }

      console.log(`Build ${buildId} completed with status: ${status}`);

      // Update build status in Firestore
      await updateBuildStatus(
        buildId, 
        status, 
        downloadUrl, 
        error
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Build status updated' 
        }),
      };
    }

    // All other endpoints require JWT authentication
    const token = event.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

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

      if (!['android', 'ios'].includes(platform)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid platform' })
        };
      }

      // Check if there's already a build in progress
      const existingBuilds = await db.collection('appBuilds')
        .where('schoolId', '==', schoolId)
        .where('platform', '==', platform)
        .where('status', 'in', ['pending', 'building'])
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (!existingBuilds.empty) {
        const existingBuild = existingBuilds.docs[0].data();
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({ 
            error: 'Build already in progress',
            buildId: existingBuilds.docs[0].id,
            status: existingBuild.status
          })
        };
      }

      // CREATE BUILD RECORD
      const buildRef = await db.collection('appBuilds').add({
        schoolId,
        subdomain: school.subdomain,
        platform,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        requestedBy: decoded.schoolId
      });

      console.log('Build record created:', buildRef.id);

      // TRIGGER GITHUB BUILD (fire and forget)
      triggerBuild(school, platform, buildRef.id)
        .then(() => updateBuildStatus(buildRef.id, 'building'))
        .catch(async (error) => {
          console.error('Failed to trigger build:', error);
          await updateBuildStatus(buildRef.id, 'failed', null, error.message);
        });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          buildId: buildRef.id,
          status: 'pending',
          message: 'Build request received. You will be notified when it\'s ready.'
        }),
      };
    }

    // GET BUILD STATUS
    if (path.startsWith('status/') && event.httpMethod === 'GET') {
      const buildId = path.split('/')[1];
      console.log('Checking status for build:', buildId);

      const buildDoc = await db.collection('appBuilds').doc(buildId).get();

      if (!buildDoc.exists) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Build not found' })
        };
      }

      const buildData = buildDoc.data();
      
      // Verify the requester owns this build
      if (buildData.schoolId !== decoded.schoolId) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ error: 'Forbidden' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ...buildData,
          createdAt: buildData.createdAt?.toDate().toISOString(),
          updatedAt: buildData.updatedAt?.toDate().toISOString(),
          completedAt: buildData.completedAt?.toDate().toISOString()
        }),
      };
    }

    // DOWNLOAD
    if (path.startsWith('download/') && event.httpMethod === 'GET') {
      const buildId = path.split('/')[1];
      console.log('Download request for build:', buildId);

      const buildDoc = await db.collection('appBuilds').doc(buildId).get();

      if (!buildDoc.exists) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Build not found' })
        };
      }

      const build = buildDoc.data();
      
      // Verify the requester owns this build
      if (build.schoolId !== decoded.schoolId) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ error: 'Forbidden' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          downloadUrl: build.downloadUrl || null,
          status: build.status,
          platform: build.platform,
          createdAt: build.createdAt?.toDate().toISOString(),
          completedAt: build.completedAt?.toDate().toISOString()
        }),
      };
    }

    // LIST BUILDS for a school
    if (path === 'list' && event.httpMethod === 'GET') {
      const schoolId = decoded.schoolId;
      console.log('Listing builds for school:', schoolId);

      const buildsSnapshot = await db.collection('appBuilds')
        .where('schoolId', '==', schoolId)
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();

      const builds = [];
      buildsSnapshot.forEach(doc => {
        const data = doc.data();
        builds.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate().toISOString(),
          updatedAt: data.updatedAt?.toDate().toISOString(),
          completedAt: data.completedAt?.toDate().toISOString()
        });
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ builds }),
      };
    }

    return { 
      statusCode: 404, 
      headers, 
      body: JSON.stringify({ error: 'Not found' }) 
    };

  } catch (error) {
    console.error('Apps function error:', error);
    console.error('Error stack:', error.stack);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
    };
  }
};
