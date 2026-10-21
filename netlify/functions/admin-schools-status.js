const { initFirebase, requireRole, json, preflight } = require('./_helpers');

const ALLOWED = ['pending', 'in_review', 'app_building', 'app_ready', 'approved', 'active', 'rejected'];

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'PATCH' && event.httpMethod !== 'POST')
    return json(405, { message: 'Method not allowed' });

  try {
    requireRole(event, 'super_admin');
    const { id, status, note } = JSON.parse(event.body || '{}');
    if (!id || !ALLOWED.includes(status)) return json(400, { message: 'Invalid status' });

    const admin = initFirebase();
    const db = admin.firestore();
    const now = new Date().toISOString();

    const update = {
      status,
      updatedAt: now,
      statusHistory: admin.firestore.FieldValue.arrayUnion({ status, note: note || null, at: now }),
    };
    if (status === 'rejected') update.rejectionReason = note || null;

    await db.collection('schools').doc(id).update(update);
    return json(200, { ok: true });
  } catch (e) {
    return json(401, { message: e.message });
  }
};
