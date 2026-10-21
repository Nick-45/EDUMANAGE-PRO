const { initFirebase, requireRole, json, preflight } = require('./_helpers');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'GET') return json(405, { message: 'Method not allowed' });

  try {
    requireRole(event, 'super_admin');
    const db = initFirebase().firestore();
    const snap = await db.collection('users').get();
    const users = snap.docs.map(d => {
      const data = d.data();
      delete data.password;
      return { id: d.id, ...data };
    });
    return json(200, users);
  } catch (e) {
    return json(401, { message: e.message });
  }
};
