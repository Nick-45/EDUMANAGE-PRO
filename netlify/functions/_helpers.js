// netlify/functions/_helpers.js
// Not deployed as a function (underscore prefix).

const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

let initialized = false;

function initFirebase() {
  if (initialized) return admin;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT not set');
  const creds = JSON.parse(raw);
  if (creds.private_key) creds.private_key = creds.private_key.replace(/\\n/g, '\n');
  admin.initializeApp({ credential: admin.credential.cert(creds) });
  initialized = true;
  return admin;
}

const JWT_SECRET = () => process.env.JWT_SECRET || 'change-me';

function signJwt(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    JWT_SECRET(),
    { expiresIn: '7d' }
  );
}

function verifyJwt(event) {
  const h = event.headers.authorization || event.headers.Authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) throw new Error('Missing token');
  return jwt.verify(token, JWT_SECRET());
}

function requireRole(event, role) {
  const claims = verifyJwt(event);
  if (role && claims.role !== role) throw new Error('Forbidden');
  return claims;
}

const corsHeaders = () => ({
  'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
});

const json = (statusCode, body) => ({
  statusCode,
  headers: corsHeaders(),
  body: JSON.stringify(body),
});

const preflight = () => ({ statusCode: 204, headers: corsHeaders(), body: '' });

module.exports = {
  initFirebase,
  signJwt,
  verifyJwt,
  requireRole,
  json,
  preflight,
};
