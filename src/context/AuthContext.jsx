import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth';
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
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      setToken(response.token);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      toast.success('Login successful!');
      return response;
    } catch (error) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authService.signup(userData);
      setToken(response.token);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      toast.success('Account created successfully!');
      return response;
    } catch (error) {
      toast.error(error.message || 'Signup failed');
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
  };

  const forgotPassword = async (email) => {
    try {
      await authService.forgotPassword(email);
      toast.success('Password reset email sent!');
    } catch (error) {
      toast.error(error.message || 'Failed to send reset email');
      throw error;
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await authService.resetPassword(token, password);
      toast.success('Password reset successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to reset password');
      throw error;
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
