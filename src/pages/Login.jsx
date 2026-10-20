import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-gradient relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative ambient glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 bg-gold-500/15 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-md w-full space-y-8 bg-navy-900/80 backdrop-blur-xl p-10 rounded-2xl border border-sky-500/20 shadow-inner-dark shadow-gold-glow"
      >
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-navy-950 border border-gold-500/40 shadow-gold-glow flex items-center justify-center p-3">
              <img
                src="/logo192.png"
                alt="School Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-display font-bold text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-sky-100/70">
            Sign in to your school dashboard
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-sky-100 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-sky-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 bg-navy-950/60 border border-sky-500/30 placeholder-sky-200/40 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent sm:text-sm transition"
                  placeholder="admin@school.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-sky-100 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-sky-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 pr-10 bg-navy-950/60 border border-sky-500/30 placeholder-sky-200/40 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent sm:text-sm transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-sky-400 hover:text-gold-400 transition" />
                  ) : (
                    <FaEye className="h-5 w-5 text-sky-400 hover:text-gold-400 transition" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-gold-500 focus:ring-gold-400 border-sky-500/40 bg-navy-950 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-sky-100/80">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="font-medium text-gold-400 hover:text-gold-300 transition"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 text-sm font-semibold rounded-lg text-navy-950 bg-gold-gradient shadow-gold-glow hover:shadow-gold-glow-lg bg-[length:200%_100%] hover:animate-shimmer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-900 focus:ring-gold-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-sky-100/70">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-gold-400 hover:text-gold-300 transition">
                Sign up for free
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
