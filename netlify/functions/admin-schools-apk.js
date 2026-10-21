const { initFirebase, requireRole, json, preflight } = require('./_helpers');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'PATCH' && event.httpMethod !== 'POST')
    return json(405, { message: 'Method not allowed' });

  try {
    requireRole(event, 'super_admin');
    const { id, apkFile, dataUrl, version } = JSON.parse(event.body || '{}');
    if (!id) return json(400, { message: 'Missing school id' });

    const db = initFirebase().firestore();
    const now = new Date().toISOString();

    let finalFile = null;
    let finalUrl = null;

    if (apkFile) {
      finalFile = apkFile.trim();
      finalUrl = `/${finalFile}`;
    } else if (dataUrl?.startsWith('data:')) {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const preset = process.env.CLOUDINARY_UPLOAD_PRESET;
      if (!cloudName || !preset) return json(500, { message: 'Cloudinary not configured' });

      const form = new URLSearchParams();
      form.append('file', dataUrl);
      form.append('upload_preset', preset);
      form.append('folder', 'edupriva/apks');

      const resp = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
        method: 'POST',
        body: form,
      });
      if (!resp.ok) return json(502, { message: 'Cloudinary upload failed', detail: await resp.text() });

      const uploaded = await resp.json();
      finalFile = uploaded.public_id.split('/').pop();
      finalUrl = uploaded.secure_url;
    } else {
      return json(400, { message: 'Provide apkFile or dataUrl' });
    }

    await db.collection('schools').doc(id).update({
      'app.apkFile': finalFile,
      'app.apkUrl': finalUrl,
      'app.version': version || '1.0.0',
      'app.uploadedAt': now,
      updatedAt: now,
    });

    return json(200, { ok: true, apkFile: finalFile, apkUrl: finalUrl });
  } catch (e) {
    return json(401, { message: e.message });
  }
};
