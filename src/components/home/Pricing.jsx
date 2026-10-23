import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaTimes, FaCrown, FaGem, FaRocket, FaCalculator } from 'react-icons/fa';

// Data for One-Time Payment
const oneTimePlans = [
  {
    id: 'basic-ot',
    name: 'Basic System',
    price: 45000,
    installFee: 4500,
    description: 'Perfect for small schools wanting a custom app and core management.',
    features: [
      'Customized Mobile App',
      'Fee Management',
      'Student & Teacher Records',
      'Results & Grading',
      'Timetable Management',
    ],
    missingFeatures: ['SMS Communication', 'Transport', 'Accommodation', 'Health Records'],
    popular: false,
    icon: FaRocket,
  },
  {
    id: 'standard-ot',
    name: 'Standard System',
    price: 55000,
    installFee: 4500,
    description: 'Advanced features for growing schools that need communication tools.',
    features: [
      'Everything in Basic',
      'Customized Mobile App',
      'SMS Communication',
    ],
    missingFeatures: ['Transport', 'Accommodation', 'Health Records'],
    popular: true,
    icon: FaCrown,
  },
  {
    id: 'premium-ot',
    name: 'Premium System',
    price: 75000,
    installFee: 4500,
    description: 'The complete package for institutions requiring full-scale management.',
    features: [
      'Everything in Standard',
      'Customized Mobile App',
      'Transport Management',
      'Accommodation (Boarding)',
      'Health Records',
    ],
    missingFeatures: [],
    popular: false,
    icon: FaGem,
  },
];

// Data for Termly Subscription
const termlyPlans = [
  {
    id: 'basic-termly',
    name: 'Basic',
    pricePerStudent: 20,
    description: 'Core management tools for everyday school operations.',
    features: [
      'Customized Mobile App',
      'Fee Management',
      'Student & Teacher Records',
      'Results & Grading',
      'Timetable Management',
    ],
    missingFeatures: ['SMS Communication', 'Transport', 'Accommodation', 'Health Records'],
    popular: false,
    icon: FaRocket,
  },
  {
    id: 'standard-termly',
    name: 'Standard',
    pricePerStudent: 35,
    description: 'Adds SMS communication to keep parents informed.',
    features: [
      'Everything in Basic',
      'Customized Mobile App',
      'SMS Communication',
    ],
    missingFeatures: ['Transport', 'Accommodation', 'Health Records'],
    popular: true,
    icon: FaCrown,
  },
  {
    id: 'premium-termly',
    name: 'Premium',
    pricePerStudent: 45,
    description: 'The complete package with transport, boarding, and health records.',
    features: [
      'Everything in Standard',
      'Customized Mobile App',
      'Transport Management',
      'Accommodation (Boarding)',
      'Health Records',
    ],
    missingFeatures: [],
    popular: false,
    icon: FaGem,
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const [billingMode, setBillingMode] = useState('one-time'); // 'one-time' or 'termly'
  const [studentCount, setStudentCount] = useState(300);

  const handleSelectPlan = (planId) => {
    if (billingMode === 'one-time') {
      navigate(`/payment?plan=${planId}&type=one-time`);
    } else {
      navigate(`/payment?plan=${planId}&type=termly&students=${studentCount}`);
    }
  };

  return (
    <section id="pricing" className="py-24 bg-navy-gradient relative overflow-hidden">
      {/* Background Glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-white">
            Flexible Options to <span className="text-gold-gradient">Suit Your School</span>
          </h2>
          <p className="text-xl text-sky-100/70 max-w-3xl mx-auto mb-10">
            Choose a one-time customized system to own forever, or a recurring termly subscription based on your student population.
          </p>

          {/* Toggle Switch */}
          <div className="inline-flex items-center p-1 bg-navy-950 border border-sky-500/30 rounded-full">
            <button
              onClick={() => setBillingMode('one-time')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                billingMode === 'one-time'
                  ? 'bg-gold-gradient text-navy-950 shadow-gold-glow'
                  : 'text-sky-300 hover:text-white'
              }`}
            >
              One-Time Purchase
            </button>
            <button
              onClick={() => setBillingMode('termly')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                billingMode === 'termly'
                  ? 'bg-gold-gradient text-navy-950 shadow-gold-glow'
                  : 'text-sky-300 hover:text-white'
              }`}
            >
              Termly Subscription
            </button>
          </div>
        </motion.div>

        {/* Global Student Calculator (Only shown in Termly mode) */}
        {billingMode === 'termly' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            className="max-w-md mx-auto mb-10 bg-navy-900/80 p-6 rounded-2xl border border-sky-500/30 text-center shadow-inner-dark"
          >
            <label className="text-xs text-sky-200/60 uppercase tracking-wider mb-2 block">
              Enter Total Number of Students
            </label>
            <div className="relative max-w-[200px] mx-auto">
              <FaCalculator className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500/50" />
              <input 
                type="number" 
                min="10" 
                max="5000"
                value={studentCount}
                onChange={(e) => setStudentCount(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 bg-navy-950 border border-sky-500/30 text-white text-center font-bold text-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>
            <p className="text-xs text-sky-100/50 mt-2">Prices below will update automatically</p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* ========================================== */}
          {/* ONE-TIME PURCHASE VIEW                     */}
          {/* ========================================== */}
          {billingMode === 'one-time' && (
            <motion.div
              key="one-time-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
            >
              {oneTimePlans.map((plan, index) => (
                <div
                  key={plan.id}
                  className={`relative bg-navy-900/80 backdrop-blur-xl rounded-3xl border ${
                    plan.popular ? 'border-gold-500 shadow-gold-glow transform lg:-translate-y-4' : 'border-sky-500/20 shadow-inner-dark'
                  } p-8 flex flex-col`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gold-gradient text-navy-950 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-gold-glow">
                      Most Popular
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-display font-bold text-white">{plan.name}</h3>
                    <plan.icon className={`text-3xl ${plan.popular ? 'text-gold-400' : 'text-sky-400'}`} />
                  </div>

                  <p className="text-sm text-sky-100/60 mb-6 h-10">{plan.description}</p>

                  <div className="mb-6 pb-6 border-b border-sky-500/20">
                    <div className="flex items-baseline mb-2">
                      <span className="text-4xl font-bold text-white">KSh {plan.price.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gold-400 font-medium">
                      + KSh {plan.installFee.toLocaleString()} installation & onboarding
                    </p>
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white mb-4">What's included:</p>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <FaCheck className="text-gold-400 mt-1 mr-3 flex-shrink-0 text-sm" />
                          <span className="text-sky-100/90 text-sm">{feature}</span>
                        </li>
                      ))}
                      {plan.missingFeatures.map((feature, i) => (
                        <li key={`missing-${i}`} className="flex items-start">
                          <FaTimes className="text-sky-500/20 mt-1 mr-3 flex-shrink-0 text-sm" />
                          <span className="text-sky-100/30 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gold-gradient text-navy-950 shadow-gold-glow hover:shadow-gold-glow-lg hover:-translate-y-1'
                        : 'bg-sky-500/10 text-sky-300 border border-sky-400/50 hover:bg-sky-500/20'
                    }`}
                  >
                    Purchase {plan.name}
                  </button>
                </div>
              ))}
            </motion.div>
          )}

          {/* ========================================== */}
          {/* TERMLY SUBSCRIPTION VIEW                   */}
          {/* ========================================== */}
          {billingMode === 'termly' && (
            <motion.div
              key="termly-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
            >
              {termlyPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative bg-navy-900/80 backdrop-blur-xl rounded-3xl border ${
                    plan.popular ? 'border-gold-500 shadow-gold-glow transform lg:-translate-y-4' : 'border-sky-500/20 shadow-inner-dark'
                  } p-8 flex flex-col`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gold-gradient text-navy-950 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-gold-glow">
                      Most Popular
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-display font-bold text-white">{plan.name}</h3>
                    <plan.icon className={`text-3xl ${plan.popular ? 'text-gold-400' : 'text-sky-400'}`} />
                  </div>

                  <p className="text-sm text-sky-100/60 mb-6 h-10">{plan.description}</p>

                  <div className="mb-6 pb-6 border-b border-sky-500/20">
                    <div className="flex items-baseline mb-1">
                      <span className="text-4xl font-bold text-white">KSh {plan.pricePerStudent}</span>
                      <span className="text-sky-100/60 text-sm ml-2">/ student / term</span>
                    </div>
                    <p className="text-sm text-gold-400 font-medium mt-2">
                      Estimated Total: KSh {(plan.pricePerStudent * studentCount).toLocaleString()} / term
                    </p>
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white mb-4">What's included:</p>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <FaCheck className="text-gold-400 mt-1 mr-3 flex-shrink-0 text-sm" />
                          <span className="text-sky-100/90 text-sm">{feature}</span>
                        </li>
                      ))}
                      {plan.missingFeatures.map((feature, i) => (
                        <li key={`missing-${i}`} className="flex items-start">
                          <FaTimes className="text-sky-500/20 mt-1 mr-3 flex-shrink-0 text-sm" />
                          <span className="text-sky-100/30 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gold-gradient text-navy-950 shadow-gold-glow hover:shadow-gold-glow-lg hover:-translate-y-1'
                        : 'bg-sky-500/10 text-sky-300 border border-sky-400/50 hover:bg-sky-500/20'
                    }`}
                  >
                    Subscribe to {plan.name}
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};

export default Pricing;
