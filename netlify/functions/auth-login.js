const bcrypt = require('bcryptjs');
const { initFirebase, signJwt, json, preflight } = require('./_helpers');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'POST') return json(405, { message: 'Method not allowed' });

  try {
    const { email, password } = JSON.parse(event.body || '{}');
    const db = initFirebase().firestore();
    const snap = await db.collection('users').where('email', '==', (email || '').toLowerCase()).limit(1).get();
    if (snap.empty) return json(401, { message: 'Invalid credentials' });

    const doc = snap.docs[0];
    const user = { id: doc.id, ...doc.data() };
    const ok = await bcrypt.compare(password || '', user.password);
    if (!ok) return json(401, { message: 'Invalid credentials' });

    const token = signJwt(user);
    return json(200, {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, schoolId: user.schoolId },
    });
  } catch (e) {
    return json(500, { message: e.message });
  }
};
