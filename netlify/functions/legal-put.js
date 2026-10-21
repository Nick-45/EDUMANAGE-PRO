const { initFirebase, requireRole, json, preflight } = require('./_helpers');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'PUT' && event.httpMethod !== 'POST')
    return json(405, { message: 'Method not allowed' });

  try {
    requireRole(event, 'super_admin');
    const { terms, privacy } = JSON.parse(event.body || '{}');
    const db = initFirebase().firestore();
    await db.collection('config').doc('legal').set(
      { terms: terms || '', privacy: privacy || '', updatedAt: new Date().toISOString() },
      { merge: true }
    );
    return json(200, { ok: true });
  } catch (e) {
    return json(401, { message: e.message });
  }
};
