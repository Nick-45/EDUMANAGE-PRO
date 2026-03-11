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
  FaGraduationCap,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl"
      >
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center">
              <FaGraduationCap className="text-3xl text-white" />
            </div>
          </div>

          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create Your Account
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Start your 14-day free trial. No credit card required.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">

            {/* School Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School Name *
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <FaSchool className="text-gray-400" />
                </div>

                <input
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleChange}
                  className="w-full pl-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600"
                  placeholder="Sunshine Academy"
                />
              </div>

              {formData.schoolName && (
                <p className="text-xs text-gray-500 mt-1">
                  Your school URL: {generatedSubdomain}.edumanagerpro.com
                </p>
              )}

              {errors.schoolName && (
                <p className="text-red-500 text-sm">{errors.schoolName}</p>
              )}
            </div>

            {/* Admin Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Name *
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <FaUser className="text-gray-400" />
                </div>

                <input
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  className="w-full pl-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600"
                  placeholder="John Doe"
                />
              </div>

              {errors.adminName && (
                <p className="text-red-500 text-sm">{errors.adminName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <FaEnvelope className="text-gray-400" />
                </div>

                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600"
                />
              </div>

              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <FaPhone className="text-gray-400" />
                </div>

                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600"
                />
              </div>
            </div>

            {/* School Size */}
            <select
              name="schoolSize"
              value={formData.schoolSize}
              onChange={handleChange}
              className="w-full py-3 border rounded-lg focus:ring-2 focus:ring-primary-600"
            >
              <option value="">Select school size</option>
              <option value="0-200">0-200 students</option>
              <option value="200-500">200-500 students</option>
              <option value="500-1000">500-1000 students</option>
              <option value="1000+">1000+ students</option>
            </select>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full py-3 pl-10 border rounded-lg focus:ring-2 focus:ring-primary-600"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full py-3 pl-10 border rounded-lg focus:ring-2 focus:ring-primary-600"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-3 top-3"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Terms */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                className="mr-2"
              />

              <span className="text-sm">
                I agree to the Terms of Service
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 text-white rounded-lg"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600">
              Sign in
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Signup;
