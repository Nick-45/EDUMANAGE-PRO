import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';
import Navbar from '../components/layout/Navbar';
import { motion } from 'framer-motion';
import { 
  FaCheck, FaTimes, FaArrowLeft, FaExclamationTriangle, 
  FaSpinner, FaCreditCard, FaHistory, FaDownload, FaCrown
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Settings = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { school, loading: schoolLoading } = useSchool();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Plans updated to match your exact pricing and feature specs
  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      setupFee: 45000,
      installFee: 4500,
      features: ['Custom Mobile App', 'Fee Management', 'Student & Teacher Records', 'Results', 'Timetable']
    },
    {
      id: 'standard',
      name: 'Standard',
      setupFee: 55000,
      installFee: 4500,
      popular: true,
      features: ['Custom Mobile App', 'Everything in Basic', 'SMS Communication']
    },
    {
      id: 'premium',
      name: 'Premium',
      setupFee: 75000,
      installFee: 4500,
      features: ['Custom Mobile App', 'Everything in Standard', 'Transport', 'Accommodation', 'Health Records']
    }
  ];

  // Hardcoded for now until you build the subscription logic in the backend
  const [subscription, setSubscription] = useState({
    isActive: school?.status === 'active',
    plan: school?.subscription?.plan || 'inactive',
    startDate: school?.subscription?.startDate || null,
    endDate: school?.subscription?.endDate || null,
    billingHistory: []
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
    if (!schoolLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, schoolLoading, navigate]);

  const isPlanActive = (planId) => {
    return subscription?.isActive && subscription?.plan === planId;
  };

  const handleSubscribe = (planId) => {
    // Navigate to a payment page, passing the selected plan
    // You will build this logic later with Lipana/M-Pesa
    toast.success(`Selected ${planId} plan. Redirecting to payment...`);
    navigate(`/payment?plan=${planId}`);
  };

  const handleCancelSubscription = async () => {
    setUpdating(true);
    setTimeout(() => {
      setSubscription(prev => ({ ...prev, isActive: false, plan: 'inactive' }));
      setShowCancelModal(false);
      setUpdating(false);
      toast.success('Subscription cancelled');
    }, 1000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getDaysRemaining = () => {
    if (!subscription?.endDate) return 0;
    const diffTime = new Date(subscription.endDate) - new Date();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  if (authLoading || schoolLoading || loading) {
    return (
      <div className="min-h-screen bg-navy-gradient flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-navy-gradient pt-20 pb-12">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-sky-100/70 hover:text-gold-400 mb-6 group transition"
          >
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </motion.button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-display font-bold text-white mb-2">Subscription Settings</h1>
            <p className="text-sky-100/70">Manage your school's plan, view your app status, and manage billing.</p>
          </motion.div>

          {/* Current Plan Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-navy-900/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 mb-8 shadow-inner-dark"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Current Subscription</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center ${
                subscription?.isActive ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {updating && <FaSpinner className="animate-spin mr-2" />}
                {subscription?.isActive ? 'Active' : 'Inactive / Pending'}
              </span>
            </div>

            {subscription?.isActive ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-sky-100/60 mb-1">Plan</p>
                  <p className="text-2xl font-bold capitalize text-white">{subscription?.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-sky-100/60 mb-1">Billing Cycle</p>
                  <p className="text-2xl font-bold text-white">Termly</p>
                </div>
                <div>
                  <p className="text-sm text-sky-100/60 mb-1">Next Billing Date</p>
                  <p className="font-semibold text-white">{formatDate(subscription?.endDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-sky-100/60 mb-1">Days Remaining</p>
                  <p className="text-xl font-bold text-gold-400">{getDaysRemaining()} days</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FaTimes className="mx-auto text-4xl text-rose-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Active Subscription</h3>
                <p className="text-sky-100/60 mb-4">Choose a plan below to activate your platform.</p>
              </div>
            )}
          </motion.div>

          {/* Available Plans */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Available Plans</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-navy-900/80 backdrop-blur-xl rounded-2xl p-6 relative flex flex-col shadow-inner-dark ${
                    plan.popular ? 'border-2 border-gold-500 shadow-gold-glow' : 'border border-sky-500/20'
                  } ${isPlanActive(plan.id) ? 'ring-2 ring-gold-400' : ''}`}
                >
                  {plan.popular && (
                    <span className="absolute top-0 right-0 bg-gold-gradient text-navy-950 px-3 py-1 text-xs font-bold rounded-bl-lg rounded-tr-lg shadow-gold-glow">
                      Most Popular
                    </span>
                  )}
                  
                  {isPlanActive(plan.id) && (
                    <span className="absolute top-0 left-0 bg-sky-500 text-white px-3 py-1 text-xs font-bold rounded-br-lg rounded-tl-lg">
                      Current Plan
                    </span>
                  )}
                  
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-white">{plan.setupFee.toLocaleString()} <span className="text-sm font-normal text-sky-100/60">KES Setup</span></span>
                    <p className="text-sm text-gold-400 mt-1">+ {plan.installFee.toLocaleString()} KES install fee</p>
                    <p className="text-xs text-sky-200/50 mt-1">+ 45 KES / student / term</p>
                  </div>
                  
                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <FaCheck className="text-gold-400 mr-2 mt-1 flex-shrink-0 text-sm" />
                        <span className="text-sm text-sky-100/80">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isPlanActive(plan.id) || updating}
                    className={`w-full py-3 rounded-xl font-semibold transition flex items-center justify-center ${
                      isPlanActive(plan.id)
                        ? 'bg-navy-950 text-sky-500/50 cursor-not-allowed border border-sky-500/10'
                        : 'bg-gold-gradient text-navy-950 hover:shadow-gold-glow-lg'
                    }`}
                  >
                    {isPlanActive(plan.id) ? 'Active' : `Upgrade to ${plan.name}`}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Danger Zone */}
          {subscription?.isActive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-rose-500/5 backdrop-blur-xl border border-rose-500/30 rounded-2xl p-6 mt-12 shadow-inner-dark"
            >
              <div className="flex items-center text-rose-400 mb-4">
                <FaExclamationTriangle className="mr-2" />
                <h2 className="text-xl font-bold">Danger Zone</h2>
              </div>
              
              <p className="text-sky-100/70 mb-4 text-sm">
                Cancelling your subscription will hide your school's app from the app store and suspend platform access at the end of the current term.
              </p>
              
              <button
                onClick={() => setShowCancelModal(true)}
                disabled={updating}
                className="px-6 py-2 bg-rose-500/10 border border-rose-500/40 text-rose-300 rounded-lg hover:bg-rose-500/20 transition disabled:opacity-50"
              >
                Cancel Subscription
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-navy-900 border border-sky-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <h3 className="text-xl font-bold text-white mb-4">Cancel Subscription</h3>
            <p className="text-sky-100/70 mb-6 text-sm">
              Are you sure you want to cancel? You'll lose access to premium features at the end of your billing period.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border border-sky-500/30 text-sky-300 rounded-lg hover:bg-sky-500/10 transition"
                disabled={updating}
              >
                Keep It
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={updating}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition disabled:opacity-50"
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
