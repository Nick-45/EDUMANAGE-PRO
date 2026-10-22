import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const school = await authService.getCurrentUser();
      const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
      setUser({
        ...(storedUser || {}),
        schoolId: school?.id || storedUser?.schoolId || null,
        role: storedUser?.role || 'admin',
      });
    } catch (error) {
      // A 401 already clears the token via the axios interceptor.
      // For other errors (e.g. super_admin has no school → 404),
      // fall back to the cached user so role persists on refresh.
      const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
      if (storedUser) setUser(storedUser);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      if (!response?.token) {
        throw new Error('Server did not return a token');
      }
      setToken(response.token);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user || {}));
      setUser(response.user);
      return response;
    } catch (error) {
      const msg =
        typeof error === 'string' ? error : error?.message || 'Login failed';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authService.signup(userData);
      if (!response?.token) {
        throw new Error('Server did not return a token');
      }
      setToken(response.token);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user || {}));
      setUser(response.user);
      return response;
    } catch (error) {
      const msg =
        typeof error === 'string' ? error : error?.message || 'Signup failed';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  const forgotPassword = async (email) => {
    try {
      if (authService.forgotPassword) {
        await authService.forgotPassword(email);
      }
      toast.success('Password reset email sent!');
    } catch (error) {
      const msg =
        typeof error === 'string' ? error : error?.message || 'Failed to send reset email';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const resetPassword = async (resetToken, password) => {
    try {
      if (authService.resetPassword) {
        await authService.resetPassword(resetToken, password);
      }
      toast.success('Password reset successfully!');
    } catch (error) {
      const msg =
        typeof error === 'string' ? error : error?.message || 'Failed to reset password';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === 'super_admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
