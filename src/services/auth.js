import { authService as apiAuth } from './api';

export const authService = {
  login: async (email, password) => {
    return apiAuth.login(email, password);
  },

  signup: async (userData) => {
    return apiAuth.signup(userData);
  },

  getCurrentUser: async () => {
    return apiAuth.getCurrentUser();
  },

  forgotPassword: async (email) => {
    return apiAuth.forgotPassword(email);
  },

  resetPassword: async (token, password) => {
    return apiAuth.resetPassword(token, password);
  },
};
