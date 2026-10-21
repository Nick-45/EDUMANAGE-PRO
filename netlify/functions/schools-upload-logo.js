const { initFirebase, requireRole, json, preflight } = require('./_helpers');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'POST') return json(405, { message: 'Method not allowed' });

  try {
    const claims = requireRole(event, 'admin');
    const { dataUrl, schoolId: bodySchoolId } = JSON.parse(event.body || '{}');
    if (!dataUrl?.startsWith('data:image/')) return json(400, { message: 'Invalid image' });
    if (dataUrl.length > 3_000_000) return json(413, { message: 'Image too large (max ~2MB)' });

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const preset = process.env.CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !preset) return json(500, { message: 'Cloudinary not configured' });

    const form = new URLSearchParams();
    form.append('file', dataUrl);
    form.append('upload_preset', preset);
    form.append('folder', 'edupriva/logos');

    const resp = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: form,
    });
    if (!resp.ok) {
      const err = await resp.text();
      return json(502, { message: 'Cloudinary upload failed', detail: err });
    }
    const uploaded = await resp.json();
    const url = uploaded.secure_url;

    const db = initFirebase().firestore();
    const userDoc = await db.collection('users').doc(claims.sub).get();
    const user = userDoc.data();
    const schoolId = bodySchoolId || user?.schoolId;
    if (!schoolId) return json(404, { message: 'No school' });

    await db.collection('schools').doc(schoolId).update({
      'identity.logo': url,
      updatedAt: new Date().toISOString(),
    });

    return json(200, { url });
  } catch (e) {
    return json(401, { message: e.message });
  }
};
