const bcrypt = require('bcryptjs');
const { initFirebase, signJwt, json, preflight } = require('./_helpers');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'POST') return json(405, { message: 'Method not allowed' });

  try {
    const { schoolName, adminName, email, phone, schoolSize, password } = JSON.parse(event.body || '{}');
    if (!schoolName || !email || !password) return json(400, { message: 'Missing required fields' });

    const db = initFirebase().firestore();
    const emailKey = email.toLowerCase();

    const existing = await db.collection('users').where('email', '==', emailKey).limit(1).get();
    if (!existing.empty) return json(409, { message: 'Email already registered' });

    const now = new Date().toISOString();
    const hash = await bcrypt.hash(password, 10);

    const schoolRef = db.collection('schools').doc();
    const userRef = db.collection('users').doc();

    const batch = db.batch();
    batch.set(schoolRef, {
      schoolName,
      adminName,
      email: emailKey,
      phone: phone || '',
      schoolSize: schoolSize || '',
      subdomain: null,
      status: 'pending',
      statusHistory: [{ status: 'pending', at: now }],
      identity: { name: schoolName, logo: null, motto: '', address: '', pobox: '', phone: phone || '', email: emailKey, website: '' },
      academic: { level: null, classes: [], streamNames: [], subjects: [] },
      subscription: { plan: 'basic', status: 'pending', startDate: now },
      theme: { primaryColor: '#1B5E20', secondaryColor: '#D4AF37', darkMode: true },
      app: { apkFile: null, version: null, uploadedAt: null },
      createdAt: now,
      updatedAt: now,
    });
    batch.set(userRef, {
      name: adminName,
      email: emailKey,
      password: hash,
      role: 'admin',
      schoolId: schoolRef.id,
      createdAt: now,
    });
    await batch.commit();

    const token = signJwt({ id: userRef.id, role: 'admin', email: emailKey });
    return json(201, {
      token,
      user: { id: userRef.id, name: adminName, email: emailKey, role: 'admin', schoolId: schoolRef.id },
    });
  } catch (e) {
    return json(500, { message: e.message });
  }
};
