import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/.netlify/functions';

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

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (data) => api.post('/auth/signup', data),
  getCurrentUser: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

export const schoolService = {
  getSchool: (id) => api.get(`/schools/${id}`),
  updateSchool: (id, data) => api.put(`/schools/${id}`, data),
  uploadLogo: (id, formData) => api.post(`/schools/${id}/logo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getSubscription: (id) => api.get(`/schools/${id}/subscription`),
  subscribe: (id, planId, paymentDetails) => api.post(`/schools/${id}/subscribe`, { planId, ...paymentDetails }),
  cancelSubscription: (id) => api.post(`/schools/${id}/cancel-subscription`),
};

export const paymentService = {
  createPaymentIntent: (amount, currency = 'kes') => api.post('/payments/create-intent', { amount, currency }),
  confirmPayment: (paymentIntentId) => api.post('/payments/confirm', { paymentIntentId }),
  mpesaSTKPush: (phone, amount) => api.post('/payments/mpesa/stk-push', { phone, amount }),
  mpesaStatus: (checkoutRequestId) => api.get(`/payments/mpesa/status/${checkoutRequestId}`),
};

export const appService = {
  generateApp: (schoolId, platform) => api.post(`/apps/generate`, { schoolId, platform }),
  downloadApp: (buildId) => api.get(`/apps/download/${buildId}`, { responseType: 'blob' }),
  getAppStatus: (buildId) => api.get(`/apps/status/${buildId}`),
};

export default api;
