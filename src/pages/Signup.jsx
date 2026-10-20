import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaSchool,
  FaEye,
  FaEyeSlash,
  FaArrowRight
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { z } from 'zod';

const signupSchema = z.object({
  schoolName: z.string().min(3, 'School name must be at least 3 characters'),
  adminName: z.string().min(2, 'Admin name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number required'),
  schoolSize: z.string().min(1, 'Please select school size'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
});

const Signup = () => {
  const [formData, setFormData] = useState({
    schoolName: '',
    adminName: '',
    email: '',
    phone: '',
    schoolSize: '',
    password: '',
    confirmPassword: '',
    terms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      signupSchema.parse(formData);

      if (!formData.terms) {
        toast.error('Please accept the terms and conditions');
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords don't match");
        setLoading(false);
        return;
      }

      // Generate subdomain
      const subdomain = formData.schoolName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .slice(0, 20);

      await signup({
        schoolName: formData.schoolName,
        adminName: formData.adminName,
        email: formData.email,
        phone: formData.phone,
        schoolSize: formData.schoolSize,
        password: formData.password,
        subdomain
      });

      navigate('/setup');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = {};
        error.errors.forEach((err) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      } else {
        toast.error(error.message || 'Signup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const generatedSubdomain = formData.schoolName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  // Shared input classes
  const inputBase =
    'w-full py-3 bg-navy-950/60 border border-sky-500/30 placeholder-sky-200/40 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent sm:text-sm transition';
  const iconBase =
    'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none';
  const iconColor = 'text-sky-400';
  const labelBase = 'block text-sm font-medium text-sky-100 mb-2';
  const errorText = 'text-rose-400 text-sm mt-1';

  return (
    <div className="min-h-screen bg-navy-gradient relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative ambient glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 bg-gold-500/15 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-2xl w-full space-y-8 bg-navy-900/80 backdrop-blur-xl p-10 rounded-2xl border border-sky-500/20 shadow-inner-dark shadow-gold-glow"
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
            Create Your Account
          </h2>

          <p className="mt-2 text-sm text-sky-100/70">
            Start your 14-day free trial. No credit card required.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">

            {/* School Name */}
            <div>
              <label className={labelBase}>School Name *</label>

              <div className="relative">
                <div className={iconBase}>
                  <FaSchool className={iconColor} />
                </div>

                <input
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleChange}
                  className={`${inputBase} pl-10`}
                  placeholder="Sunshine Academy"
                />
              </div>

              {formData.schoolName && (
                <p className="text-xs text-sky-300/70 mt-1">
                  Your school URL:{' '}
                  <span className="text-gold-400 font-medium">
                    {generatedSubdomain}.edumanagerpro.com
                  </span>
                </p>
              )}

              {errors.schoolName && (
                <p className={errorText}>{errors.schoolName}</p>
              )}
            </div>

            {/* Admin Name */}
            <div>
              <label className={labelBase}>Admin Name *</label>

              <div className="relative">
                <div className={iconBase}>
                  <FaUser className={iconColor} />
                </div>

                <input
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  className={`${inputBase} pl-10`}
                  placeholder="John Doe"
                />
              </div>

              {errors.adminName && (
                <p className={errorText}>{errors.adminName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className={labelBase}>Email Address *</label>

              <div className="relative">
                <div className={iconBase}>
                  <FaEnvelope className={iconColor} />
                </div>

                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${inputBase} pl-10`}
                  placeholder="admin@school.com"
                />
              </div>

              {errors.email && (
                <p className={errorText}>{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className={labelBase}>Phone *</label>

              <div className="relative">
                <div className={iconBase}>
                  <FaPhone className={iconColor} />
                </div>

                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`${inputBase} pl-10`}
                  placeholder="+1 555 123 4567"
                />
              </div>

              {errors.phone && (
                <p className={errorText}>{errors.phone}</p>
              )}
            </div>

            {/* School Size */}
            <div>
              <label className={labelBase}>School Size *</label>

              <select
                name="schoolSize"
                value={formData.schoolSize}
                onChange={handleChange}
                className={inputBase}
              >
                <option value="">Select school size</option>
                <option value="0-200">0-200 students</option>
                <option value="200-500">200-500 students</option>
                <option value="500-1000">500-1000 students</option>
                <option value="1000+">1000+ students</option>
              </select>

              {errors.schoolSize && (
                <p className={errorText}>{errors.schoolSize}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className={labelBase}>Password *</label>

              <div className="relative">
                <div className={iconBase}>
                  <FaLock className={iconColor} />
                </div>

                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`${inputBase} pl-10 pr-10`}
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

              {errors.password && (
                <p className={errorText}>{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className={labelBase}>Confirm Password *</label>

              <div className="relative">
                <div className={iconBase}>
                  <FaLock className={iconColor} />
                </div>

                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`${inputBase} pl-10 pr-10`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-sky-400 hover:text-gold-400 transition" />
                  ) : (
                    <FaEye className="h-5 w-5 text-sky-400 hover:text-gold-400 transition" />
                  )}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className={errorText}>{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                className="h-4 w-4 mr-2 text-gold-500 focus:ring-gold-400 border-sky-500/40 bg-navy-950 rounded"
              />

              <span className="text-sm text-sky-100/80">
                I agree to the Terms of Service
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center items-center py-3 px-4 text-sm font-semibold rounded-lg text-navy-950 bg-gold-gradient shadow-gold-glow hover:shadow-gold-glow-lg bg-[length:200%_100%] hover:animate-shimmer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-900 focus:ring-gold-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating account...
              </div>
            ) : (
              <>
                Create Account
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-center text-sm text-sky-100/70">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-gold-400 hover:text-gold-300 transition"
            >
              Sign in
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Signup;
