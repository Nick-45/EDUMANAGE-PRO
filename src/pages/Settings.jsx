import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';
import Navbar from '../components/layout/Navbar';
import { motion } from 'framer-motion';
import { 
  FaCreditCard, 
  FaCheck, 
  FaTimes,
  FaArrowLeft,
  FaExclamationTriangle,
  FaDownload,
  FaHistory
} from 'react-icons/fa';

const Settings = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { school, subscription, loading: schoolLoading } = useSchool();
  const navigate = useNavigate();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

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

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 29,
      features: [
        'Up to 100 students',
        '10 teachers',
        'Basic reports',
        'Email support',
        'Mobile app access'
      ]
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 79,
      popular: true,
      features: [
        'Up to 500 students',
        '50 teachers',
        'Advanced reports',
        'Priority support',
        'Custom branding',
        'API access',
        'Attendance tracking'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 199,
      features: [
        'Unlimited students',
        'Unlimited teachers',
        'Custom reports',
        '24/7 phone support',
        'White labeling',
        'Dedicated account manager',
        'SMS notifications',
        'Advanced security'
      ]
    }
  ];

  const billingHistory = [
    { date: '2024-01-15', amount: 79.00, status: 'paid', invoice: 'INV-2024-001' },
    { date: '2023-12-15', amount: 79.00, status: 'paid', invoice: 'INV-2023-089' },
    { date: '2023-11-15', amount: 79.00, status: 'paid', invoice: 'INV-2023-078' },
  ];

  const handleUpgrade = (planId) => {
    setSelectedPlan(planId);
    setShowUpgradeModal(true);
  };

  const confirmUpgrade = () => {
    // Handle upgrade logic here
    setShowUpgradeModal(false);
    // Show success message or redirect to payment
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    // Handle cancellation logic here
    setShowCancelModal(false);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 group"
          >
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </motion.button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Subscription Settings</h1>
            <p className="text-gray-600">
              Manage your plan, billing information, and subscription details
            </p>
          </motion.div>

          {/* Current Plan Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-lg p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Current Plan</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                subscription?.status === 'active' 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-red-100 text-red-600'
              }`}>
                {subscription?.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Plan</p>
                <p className="text-2xl font-bold capitalize">{subscription?.plan || 'Professional'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Price</p>
                <p className="text-2xl font-bold">$79.00 <span className="text-sm font-normal text-gray-600">/month</span></p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Start Date</p>
                <p className="font-semibold">
                  {subscription?.startDate ? new Date(subscription.startDate).toLocaleDateString() : 'Jan 15, 2024'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Next Billing</p>
                <p className="font-semibold">
                  {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'Feb 15, 2024'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Payment Method */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-6 mb-8"
          >
            <h2 className="text-xl font-bold mb-6">Payment Method</h2>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">
                  VISA
                </div>
                <div>
                  <p className="font-semibold">Visa ending in 4242</p>
                  <p className="text-sm text-gray-600">Expires 12/25</p>
                </div>
              </div>
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                Edit
              </button>
            </div>

            <button className="mt-4 text-primary-600 hover:text-primary-700 font-medium">
              + Add new payment method
            </button>
          </motion.div>

          {/* Available Plans */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold mb-6">Available Plans</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white rounded-lg shadow-lg p-6 relative ${
                    plan.popular ? 'border-2 border-primary-600' : ''
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute top-0 right-0 bg-primary-600 text-white px-3 py-1 text-sm rounded-bl-lg rounded-tr-lg">
                      Most Popular
                    </span>
                  )}
                  
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={plan.name.toLowerCase() === subscription?.plan}
                    className={`w-full py-2 rounded-lg transition ${
                      plan.name.toLowerCase() === subscription?.plan
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {plan.name.toLowerCase() === subscription?.plan ? 'Current Plan' : 'Upgrade'}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Billing History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-lg p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Billing History</h2>
              <button className="flex items-center text-primary-600 hover:text-primary-700">
                <FaDownload className="mr-2" />
                Download All
              </button>
            </div>
            
            <div className="space-y-3">
              {billingHistory.map((bill, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <FaHistory className="text-gray-400" />
                    <div>
                      <p className="font-medium">{new Date(bill.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                      <p className="text-sm text-gray-600">{bill.invoice}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold">${bill.amount}</span>
                    <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">
                      {bill.status}
                    </span>
                    <button className="text-primary-600 hover:text-primary-700 text-sm">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-lg p-6 border-2 border-red-200"
          >
            <div className="flex items-center text-red-600 mb-4">
              <FaExclamationTriangle className="mr-2" />
              <h2 className="text-xl font-bold">Danger Zone</h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              Once you cancel your subscription, all your data will be permanently deleted within 30 days.
            </p>
            
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Cancel Subscription
            </button>
          </motion.div>
        </div>
      </div>

      {/* Upgrade Confirmation Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md mx-4"
          >
            <h3 className="text-xl font-bold mb-4">Confirm Upgrade</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to upgrade to the {plans.find(p => p.id === selectedPlan)?.name} plan? 
              Your next billing date will be adjusted accordingly.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpgrade}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Confirm Upgrade
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md mx-4"
          >
            <h3 className="text-xl font-bold mb-4">Cancel Subscription</h3>
            <p className="text-gray-600 mb-6">
              We're sorry to see you go! Are you sure you want to cancel your subscription? 
              Your access will continue until the end of your billing period.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Keep Subscription
              </button>
              <button
                onClick={confirmCancel}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Yes, Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Settings;
