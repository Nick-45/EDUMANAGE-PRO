const { initFirebase, requireRole, json, preflight } = require('./_helpers');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'GET') return json(405, { message: 'Method not allowed' });

  try {
    requireRole(event, 'super_admin');
    const id = event.queryStringParameters?.id;
    if (!id) return json(400, { message: 'Missing id' });

    const db = initFirebase().firestore();
    const doc = await db.collection('schools').doc(id).get();
    if (!doc.exists) return json(404, { message: 'Not found' });
    return json(200, { id: doc.id, ...doc.data() });
  } catch (e) {
    return json(401, { message: e.message });
  }
};
