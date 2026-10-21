const { initFirebase, requireRole, json, preflight } = require('./_helpers');

// Node 18+ has global fetch; fall back to node-fetch on older runtimes.
const fetchFn =
  typeof fetch !== 'undefined'
    ? fetch
    : (...args) => import('node-fetch').then(({ default: f }) => f(...args));

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'POST') return json(405, { message: 'Method not allowed' });

  // 1. Auth — keep separate so auth failures return 401, not 500
  let claims;
  try {
    claims = requireRole(event, 'admin');
  } catch (e) {
    return json(401, { message: e.message || 'Unauthorized' });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { dataUrl, schoolId: bodySchoolId } = body;

    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      return json(400, { message: 'Invalid image data URL' });
    }
    if (dataUrl.length > 3_000_000) {
      return json(413, { message: 'Image too large (max ~2MB)' });
    }

    // 2. Cloudinary config
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const preset = process.env.CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !preset) {
      return json(500, { message: 'Cloudinary not configured' });
    }

    // 3. Upload to Cloudinary
    const form = new URLSearchParams();
    form.append('file', dataUrl);
    form.append('upload_preset', preset);
    form.append('folder', 'edupriva/logos');

    const resp = await fetchFn(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: form }
    );

    if (!resp.ok) {
      const err = await resp.text();
      console.error('Cloudinary error:', resp.status, err);
      return json(502, { message: 'Cloudinary upload failed', detail: err });
    }

    const uploaded = await resp.json();
    const url = uploaded.secure_url;
    if (!url) {
      return json(502, { message: 'Cloudinary returned no URL' });
    }

    // 4. Resolve the school — prefer body, else look up the user
    const admin = initFirebase();
    const db = admin.firestore();

    let schoolId = bodySchoolId;

    if (!schoolId) {
      // claims.sub is the JWT `sub` claim. Our signJwt() sets it from user.id.
      const userId = claims.sub || claims.id || claims.userId;
      if (!userId) {
        return json(401, { message: 'Token missing user id' });
      }

      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return json(404, { message: 'User not found' });
      }
      schoolId = userDoc.data().schoolId;
    }

    if (!schoolId) {
      return json(404, { message: 'No school linked to this account' });
    }

    // 5. Persist
    await db.collection('schools').doc(schoolId).update({
      'identity.logo': url,
      updatedAt: new Date().toISOString(),
    });

    return json(200, { url, schoolId });
  } catch (e) {
    console.error('schools-upload-logo error:', e);
    return json(500, { message: e.message || 'Server error' });
  }
};
