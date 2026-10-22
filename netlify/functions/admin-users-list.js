const { initFirebase, requireRole, json, preflight } = require('./_helpers');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'GET') return json(405, { message: 'Method not allowed' });

  // 1. Auth — separate from the try/catch so 401s are clearly 401s
  let claims;
  try {
    claims = requireRole(event, 'super_admin');
  } catch (e) {
    return json(401, { message: e.message || 'Unauthorized' });
  }

  // 2. Data fetch — anything that fails here is a real server error
  try {
    const db = initFirebase().firestore();
    const snap = await db.collection('users').get();

    const users = snap.docs.map((d) => {
      const data = d.data();
      // Never leak password hashes to the client
      delete data.password;
      return { id: d.id, ...data };
    });

    // Sort alphabetically by name, then email — makes the UI predictable
    users.sort((a, b) => {
      const an = (a.name || '').toLowerCase();
      const bn = (b.name || '').toLowerCase();
      if (an < bn) return -1;
      if (an > bn) return 1;
      return (a.email || '').localeCompare(b.email || '');
    });

    return json(200, users);
  } catch (e) {
    console.error('admin-users-list error:', e);
    return json(500, { message: e.message || 'Failed to load users' });
  }
};
