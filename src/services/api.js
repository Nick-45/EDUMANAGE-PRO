import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    throw error.response?.data || error.message;
  }
);

// --- Auth ---
export const authService = {
  login: (email, password) => api.post('/auth-login', { email, password }),
  signup: (data) => api.post('/auth-signup', data),
  getCurrentUser: () => api.get('/schools-me'),
};

// --- Schools (user-side) ---
export const schoolService = {
  getMySchool: () => api.get('/schools-me'),
  submitApplication: (data) => api.post('/schools-apply', data),
  uploadLogo: (dataUrl) => api.post('/schools-upload-logo', { dataUrl }),
};

// --- Admin (super admin) ---
export const adminService = {
  listSchools: (status) =>
    api.get('/admin-schools-list', { params: status ? { status } : {} }),
  getSchool: (id) => api.get('/admin-schools-get', { params: { id } }),
  updateStatus: (id, status, note) =>
    api.patch('/admin-schools-status', { id, status, note }),
  setSubdomain: (id, subdomain) =>
    api.patch('/admin-schools-subdomain', { id, subdomain }),
  setApk: (id, payload) => api.patch('/admin-schools-apk', { id, ...payload }),
  listUsers: () => api.get('/admin-users-list'),
  getLegal: () => api.get('/legal-get'),
  saveLegal: (terms, privacy) => api.put('/legal-put', { terms, privacy }),
};

// --- Legal (public) ---
export const legalService = {
  get: () => api.get('/legal-get'),
};

export default api;
