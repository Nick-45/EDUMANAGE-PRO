import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';
import Navbar from '../components/layout/Navbar';
import { motion } from 'framer-motion';
import { 
  FaCheck, 
  FaTimes,
  FaArrowLeft,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaSpinner,
  FaCreditCard,
  FaHistory,
  FaDownload
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { school, loading: schoolLoading } = useSchool();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [billingHistory, setBillingHistory] = useState([]);

  // Payment links from Lipana.dev
  const paymentLinks = {
    basic: {
      monthly: 'https://lipana.dev/pay/basic-monthly',
      termly: 'https://lipana.dev/pay/basic-termly',
      yearly: 'https://lipana.dev/pay/basic-yearly'
    },
    premium: {
      monthly: 'https://lipana.dev/pay/premium-monthly',
      termly: 'https://lipana.dev/pay/premium-termly',
      yearly: 'https://lipana.dev/pay/premium-yearly'
    },
    enterprise: {
      monthly: 'https://lipana.dev/pay/enterprise-monthly',
      termly: 'https://lipana.dev/pay/enterprise-termly',
      yearly: 'https://lipana.dev/pay/enterprise-yearly'
    }
  };

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 3500,
      currency: 'KES',
      durations: {
        monthly: 31,
        termly: 95,
        yearly: 300
      },
      features: [
        'Up to 100 students',
        '10 teachers',
        'Basic reports',
        'Email support',
        'Mobile app access'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 5500,
      currency: 'KES',
      popular: true,
      durations: {
        monthly: 31,
        termly: 95,
        yearly: 300
      },
      features: [
        'Up to 500 students',
        '50 teachers',
        'Advanced reports',
        'Priority support',
        'Custom branding',
        'API access',
        'Attendance tracking',
        'SMS notifications'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 7500,
      currency: 'KES',
      durations: {
        monthly: 31,
        termly: 95,
        yearly: 300
      },
      features: [
        'Unlimited students',
        'Unlimited teachers',
        'Custom reports',
        '24/7 phone support',
        'White labeling',
        'Dedicated account manager',
        'Advanced analytics',
        'Priority API access'
      ]
    }
  ];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Load subscription data from Netlify function
  useEffect(() => {
    const loadSubscription = async () => {
      if (school?.id) {
        try {
          setLoading(true);
          
          // Call Netlify function to check subscription
          const response = await fetch(
            `/.netlify/functions/check-subscription?schoolId=${school.id}`
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch subscription');
          }
          
          const data = await response.json();
          
          setSubscription({
            ...data,
            isActive: data.isActive || false,
            plan: data.plan || 'inactive',
            duration: data.duration || 'monthly'
          });

          setBillingHistory(data.recentBilling || []);
          
        } catch (error) {
          console.error('Error loading subscription:', error);
          toast.error('Failed to load subscription data');
        } finally {
          setLoading(false);
        }
      }
    };

    loadSubscription();
  }, [school]);

  // Function to check if current plan is active
  const isPlanActive = (planId) => {
    return subscription?.isActive && subscription?.plan === planId;
  };

  // Poll for subscription updates after payment
  const startPollingSubscription = () => {
    let attempts = 0;
    const maxAttempts = 30;
    const interval = setInterval(async () => {
      attempts++;
      
      try {
        const response = await fetch(
          `/.netlify/functions/check-subscription?schoolId=${school.id}`
        );
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.isActive) {
            clearInterval(interval);
            setSubscription({
              ...data,
              isActive: true
            });
            toast.success('Subscription activated successfully!');
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
      
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        toast.error('Payment verification timeout. Please check your subscription status later.');
      }
    }, 5000); // Check every 5 seconds
  };

  const handleSubscribe = (planId, duration) => {
    const plan = plans.find(p => p.id === planId);
    const link = paymentLinks[planId]?.[duration];
    
    if (link) {
      // Create URL with metadata
      const paymentUrl = new URL(link);
      
      // Add metadata as query parameters
      paymentUrl.searchParams.append('metadata[schoolId]', school.id);
      paymentUrl.searchParams.append('metadata[schoolName]', school.name);
      paymentUrl.searchParams.append('metadata[plan]', planId);
      paymentUrl.searchParams.append('metadata[duration]', duration);
      paymentUrl.searchParams.append('metadata[amount]', plan.price);
      
      // Add return URLs
      const returnUrl = `${window.location.origin}/payment/success?schoolId=${school.id}`;
      const cancelUrl = `${window.location.origin}/payment/cancelled`;
      
      paymentUrl.searchParams.append('callback_url', returnUrl);
      paymentUrl.searchParams.append('cancel_url', cancelUrl);
      
      // Open payment link in new tab
      window.open(paymentUrl.toString(), '_blank');
      
      // Show toast notification
      toast.success('Redirecting to payment page...');
      
      // Start polling for subscription update
      startPollingSubscription();
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setUpdating(true);
      
      // Call your cancellation endpoint (you'll need to create this)
      const response = await fetch('/.netlify/functions/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schoolId: school.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      setSubscription(prev => ({
        ...prev,
        status: 'cancelled',
        isActive: false
      }));

      setShowCancelModal(false);
      toast.success('Subscription cancelled successfully');
      
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = () => {
    if (!subscription?.endDate) return 0;
    const end = new Date(subscription.endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const downloadInvoice = (invoice) => {
    // Implement invoice download
    toast.info('Invoice download feature coming soon');
  };

  if (authLoading || schoolLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
              Manage your plan and subscription details
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
              <h2 className="text-xl font-bold">Current Subscription</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center ${
                subscription?.isActive 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-red-100 text-red-600'
              }`}>
                {updating && <FaSpinner className="animate-spin mr-2" />}
                {subscription?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {subscription?.isActive ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Plan</p>
                  <p className="text-2xl font-bold capitalize">{subscription?.plan || 'Premium'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="text-2xl font-bold capitalize">{subscription?.duration || 'Monthly'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Start Date</p>
                  <p className="font-semibold">{formatDate(subscription?.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">End Date</p>
                  <p className="font-semibold">{formatDate(subscription?.endDate)}</p>
                </div>
                <div className="lg:col-span-4">
                  <p className="text-sm text-gray-600 mb-1">Days Remaining</p>
                  <p className="text-xl font-bold text-primary-600">{getDaysRemaining()} days</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FaTimes className="mx-auto text-4xl text-red-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">No Active Subscription</h3>
                <p className="text-gray-600 mb-4">Choose a plan below to get started</p>
              </div>
            )}
          </motion.div>

          {/* Billing History Section */}
          {billingHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-lg shadow-lg p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center">
                  <FaHistory className="mr-2 text-primary-600" />
                  Billing History
                </h2>
                <button
                  onClick={() => {/* Download all invoices */}}
                  className="text-primary-600 hover:text-primary-700 flex items-center text-sm"
                >
                  <FaDownload className="mr-1" />
                  Download All
                </button>
              </div>
              
              <div className="space-y-3">
                {billingHistory.map((bill, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <FaCreditCard className="text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium">{formatDate(bill.paymentDate)}</p>
                        <p className="text-sm text-gray-600">{bill.invoice}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-semibold">{bill.amount} {bill.currency}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        bill.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {bill.status}
                      </span>
                      <button
                        onClick={() => downloadInvoice(bill.invoice)}
                        className="text-primary-600 hover:text-primary-700 text-sm"
                      >
                        <FaDownload />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Available Plans */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold mb-6">Available Plans</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white rounded-lg shadow-lg p-6 relative ${
                    plan.popular ? 'border-2 border-primary-600' : ''
                  } ${isPlanActive(plan.id) ? 'ring-2 ring-green-500' : ''}`}
                >
                  {plan.popular && (
                    <span className="absolute top-0 right-0 bg-primary-600 text-white px-3 py-1 text-sm rounded-bl-lg rounded-tr-lg">
                      Most Popular
                    </span>
                  )}
                  
                  {isPlanActive(plan.id) && (
                    <span className="absolute top-0 left-0 bg-green-600 text-white px-3 py-1 text-sm rounded-br-lg rounded-tl-lg">
                      Current Plan
                    </span>
                  )}
                  
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">{plan.price.toLocaleString()} {plan.currency}</span>
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

                  {/* Duration Options */}
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Select Duration:</p>
                    {Object.entries(plan.durations).map(([duration, days]) => (
                      <button
                        key={duration}
                        onClick={() => handleSubscribe(plan.id, duration)}
                        disabled={isPlanActive(plan.id) || updating}
                        className={`w-full py-2 px-3 rounded-lg text-sm transition flex items-center justify-between ${
                          isPlanActive(plan.id)
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                      >
                        <span className="capitalize">{duration}</span>
                        <span className="flex items-center">
                          <FaCalendarAlt className="mr-1 text-primary-600" />
                          {days} days
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Danger Zone - Only show if subscription is active */}
          {subscription?.isActive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-lg p-6 border-2 border-red-200"
            >
              <div className="flex items-center text-red-600 mb-4">
                <FaExclamationTriangle className="mr-2" />
                <h2 className="text-xl font-bold">Danger Zone</h2>
              </div>
              
              <p className="text-gray-600 mb-4">
                Once you cancel your subscription, you'll lose access to premium features at the end of your billing period.
              </p>
              
              <button
                onClick={() => setShowCancelModal(true)}
                disabled={updating}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Processing...' : 'Cancel Subscription'}
              </button>
            </motion.div>
          )}
        </div>
      </div>

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
              Are you sure you want to cancel your subscription? You'll continue to have access until{' '}
              <span className="font-semibold">{formatDate(subscription?.endDate)}</span>.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={updating}
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={updating}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {updating ? 'Processing...' : 'Yes, Cancel'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Settings;
