const { initFirebase, requireRole, json, preflight } = require('./_helpers');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'GET') return json(405, { message: 'Method not allowed' });

  try {
    requireRole(event, 'super_admin');
    const status = event.queryStringParameters?.status;
    const db = initFirebase().firestore();

    let query = db.collection('schools');
    if (status && status !== 'all') query = query.where('status', '==', status);

    const snap = await query.get();
    const schools = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    schools.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return json(200, schools);
  } catch (e) {
    return json(401, { message: e.message });
  }
};
