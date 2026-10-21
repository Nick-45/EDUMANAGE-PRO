const { initFirebase, requireRole, json, preflight } = require('./_helpers');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'POST') return json(405, { message: 'Method not allowed' });

  try {
    const claims = requireRole(event, 'admin');
    const body = JSON.parse(event.body || '{}');
    const db = initFirebase().firestore();
    const now = new Date().toISOString();

    const userDoc = await db.collection('users').doc(claims.sub).get();
    if (!userDoc.exists) return json(404, { message: 'User not found' });
    const user = userDoc.data();
    if (!user.schoolId) return json(404, { message: 'No school linked' });

    const ref = db.collection('schools').doc(user.schoolId);
    const updates = {
      identity: body.identity || {},
      academic: body.academic || {},
      subscription: body.subscription || {},
      theme: body.theme || {},
      status: body.status || 'pending',
      updatedAt: now,
      statusHistory: initFirebase().firestore.FieldValue.arrayUnion({
        status: body.status || 'pending',
        at: now,
      }),
    };

    await ref.update(updates);
    return json(200, { ok: true });
  } catch (e) {
    return json(401, { message: e.message });
  }
};
