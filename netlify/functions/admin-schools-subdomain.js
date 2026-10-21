const { initFirebase, requireRole, json, preflight } = require('./_helpers');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'PATCH' && event.httpMethod !== 'POST')
    return json(405, { message: 'Method not allowed' });

  try {
    requireRole(event, 'super_admin');
    const { id, subdomain } = JSON.parse(event.body || '{}');
    const clean = (subdomain || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!id || !clean) return json(400, { message: 'Invalid subdomain' });

    const db = initFirebase().firestore();
    const dupe = await db.collection('schools').where('subdomain', '==', clean).get();
    const conflict = dupe.docs.find(d => d.id !== id);
    if (conflict) return json(409, { message: 'Subdomain already taken' });

    await db.collection('schools').doc(id).update({
      subdomain: clean,
      updatedAt: new Date().toISOString(),
    });
    return json(200, { ok: true, subdomain: clean });
  } catch (e) {
    return json(401, { message: e.message });
  }
};
