const { initFirebase, json, preflight } = require('./_helpers');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'GET') return json(405, { message: 'Method not allowed' });

  try {
    const db = initFirebase().firestore();
    const doc = await db.collection('config').doc('legal').get();
    const data = doc.exists ? doc.data() : { terms: '', privacy: '' };
    return json(200, data);
  } catch (e) {
    return json(500, { message: e.message });
  }
};
