import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';
import Navbar from '../components/layout/Navbar';
import { motion } from 'framer-motion';
import { FaUsers, FaChalkboardTeacher, FaBook, FaChartLine } from 'react-icons/fa';

const Dashboard = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { school, subscription, loading: schoolLoading } = useSchool();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading || schoolLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Students', value: '450', icon: FaUsers, color: 'bg-blue-500' },
    { label: 'Total Teachers', value: '32', icon: FaChalkboardTeacher, color: 'bg-green-500' },
    { label: 'Total Classes', value: '24', icon: FaBook, color: 'bg-purple-500' },
    { label: 'Attendance Rate', value: '96%', icon: FaChartLine, color: 'bg-yellow-500' },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {school?.name || 'School Admin'}!
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your school today.
            </p>
          </motion.div>

          {/* Subscription Status */}
          {subscription && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8 p-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Current Plan</p>
                  <p className="text-xl font-semibold capitalize">{subscription.plan} Plan</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Status</p>
                  <p className="text-xl font-semibold text-green-300">
                    {subscription.status === 'active' ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Next Billing</p>
                  <p className="text-xl font-semibold">
                    {new Date(subscription.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                    <stat.icon />
                  </div>
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* School Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-lg p-6 mb-8"
          >
            <h2 className="text-xl font-bold mb-4">School Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">School Name</p>
                <p className="font-semibold">{school?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Subdomain</p>
                <p className="font-semibold text-primary-600">
                  {school?.subdomain}.edumanagerpro.com
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Admin Email</p>
                <p className="font-semibold">{school?.adminEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Phone</p>
                <p className="font-semibold">{school?.phone}</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-3 gap-6"
          >
            <button
              onClick={() => navigate('/setup')}
              className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition text-left"
            >
              <h3 className="font-semibold mb-2">Customize Branding</h3>
              <p className="text-sm text-gray-600">
                Upload your logo and customize colors
              </p>
            </button>

            <button
              onClick={() => navigate('/app-download')}
              className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition text-left"
            >
              <h3 className="font-semibold mb-2">Download Mobile App</h3>
              <p className="text-sm text-gray-600">
                Get your branded school app
              </p>
            </button>

            <button
              onClick={() => navigate('/settings')}
              className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition text-left"
            >
              <h3 className="font-semibold mb-2">Manage Subscription</h3>
              <p className="text-sm text-gray-600">
                Update plan or billing info
              </p>
            </button>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
