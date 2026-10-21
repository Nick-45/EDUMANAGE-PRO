const { initFirebase, requireRole, json, preflight } = require('./_helpers');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'GET') return json(405, { message: 'Method not allowed' });

  try {
    const claims = requireRole(event);
    const db = initFirebase().firestore();

    const userDoc = await db.collection('users').doc(claims.sub).get();
    if (!userDoc.exists) return json(404, { message: 'User not found' });
    const user = userDoc.data();
    if (!user.schoolId) return json(404, { message: 'No school linked' });

    const schoolDoc = await db.collection('schools').doc(user.schoolId).get();
    if (!schoolDoc.exists) return json(404, { message: 'School not found' });

    return json(200, { id: schoolDoc.id, ...schoolDoc.data() });
  } catch (e) {
    return json(401, { message: e.message });
  }
};
