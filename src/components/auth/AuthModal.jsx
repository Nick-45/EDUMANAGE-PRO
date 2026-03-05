import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  schoolName: z.string().min(3, 'School name is required'),
  adminName: z.string().min(2, 'Admin name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number required'),
  schoolSize: z.string().min(1, 'Please select school size'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const AuthModal = ({ isOpen, onClose, mode: initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    schoolName: '',
    adminName: '',
    email: '',
    phone: '',
    schoolSize: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
    // Clear error for this field
    if (errors[e.target.id]) {
      setErrors({
        ...errors,
        [e.target.id]: undefined,
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      loginSchema.parse({
        email: formData.email,
        password: formData.password,
      });

      await login(formData.email, formData.password);
      onClose();
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = {};
        error.errors.forEach((err) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      } else {
        setErrors({ form: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      signupSchema.parse(formData);

      const subdomain = formData.schoolName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20);

      await signup({
        ...formData,
        subdomain,
      });

      onClose();
      navigate('/setup');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = {};
        error.errors.forEach((err) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      } else {
        setErrors({ form: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-gray-600">
                  {mode === 'login'
                    ? 'Sign in to your school dashboard'
                    : 'Start your 14-day free trial'}
                </p>
              </div>

              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setMode('login')}
                  className={`flex-1 py-2 rounded-lg font-semibold transition ${
                    mode === 'login'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setMode('signup')}
                  className={`flex-1 py-2 rounded-lg font-semibold transition ${
                    mode === 'signup'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {errors.form && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {errors.form}
                </div>
              )}

              <form onSubmit={mode === 'login' ? handleLogin : handleSignup}>
                {mode === 'signup' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        School Name
                      </label>
                      <input
                        type="text"
                        id="schoolName"
                        value={formData.schoolName}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent ${
                          errors.schoolName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g., Sunshine Academy"
                      />
                      {errors.schoolName && (
                        <p className="mt-1 text-sm text-red-600">{errors.schoolName}</p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Admin Name
                      </label>
                      <input
                        type="text"
                        id="adminName"
                        value={formData.adminName}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent ${
                          errors.adminName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="John Doe"
                      />
                      {errors.adminName && (
                        <p className="mt-1 text-sm text-red-600">{errors.adminName}</p>
                      )}
                    </div>
                  </>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="admin@school.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                {mode === 'signup' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="+254 700 000 000"
                      />
                      {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        School Size
                      </label>
                      <select
                        id="schoolSize"
                        value={formData.schoolSize}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent ${
                          errors.schoolSize ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select size</option>
                        <option value="0-200">0-200 students</option>
                        <option value="200-500">200-500 students</option>
                        <option value="500-1000">500-1000 students</option>
                        <option value="1000+">1000+ students</option>
                      </select>
                      {errors.schoolSize && (
                        <p className="mt-1 text-sm text-red-600">{errors.schoolSize}</p>
                      )}
                    </div>
                  </>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {mode === 'signup' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : mode === 'login' ? (
                    'Sign In'
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
