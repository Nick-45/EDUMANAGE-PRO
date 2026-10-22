import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaTimes, FaCrown, FaGem, FaRocket, FaCalculator } from 'react-icons/fa';

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    setupFee: 45000,
    installFee: 4500,
    students: 'Up to 200',
    description: 'Perfect for small schools getting started with digital management.',
    features: [
      { name: 'Customized Mobile App', included: true },
      { name: 'Fee Management', included: true },
      { name: 'Student & Teacher Records', included: true },
      { name: 'Results & Grading', included: true },
      { name: 'Timetable Management', included: true },
      { name: 'SMS Communication', included: false },
      { name: 'Transport Management', included: false },
      { name: 'Accommodation (Boarding)', included: false },
      { name: 'Health Records', included: false },
    ],
    popular: false,
    icon: FaRocket,
  },
  {
    id: 'standard',
    name: 'Standard',
    setupFee: 55000,
    installFee: 4500,
    students: 'Up to 500',
    description: 'Advanced features for growing schools that need better communication.',
    features: [
      { name: 'Customized Mobile App', included: true },
      { name: 'Fee Management', included: true },
      { name: 'Student & Teacher Records', included: true },
      { name: 'Results & Grading', included: true },
      { name: 'Timetable Management', included: true },
      { name: 'SMS Communication', included: true },
      { name: 'Transport Management', included: false },
      { name: 'Accommodation (Boarding)', included: false },
      { name: 'Health Records', included: false },
    ],
    popular: true,
    icon: FaCrown,
  },
  {
    id: 'premium',
    name: 'Premium',
    setupFee: 75000,
    installFee: 4500,
    students: 'Unlimited',
    description: 'The complete package for institutions requiring full-scale management.',
    features: [
      { name: 'Customized Mobile App', included: true },
      { name: 'Fee Management', included: true },
      { name: 'Student & Teacher Records', included: true },
      { name: 'Results & Grading', included: true },
      { name: 'Timetable Management', included: true },
      { name: 'SMS Communication', included: true },
      { name: 'Transport Management', included: true },
      { name: 'Accommodation (Boarding)', included: true },
      { name: 'Health Records', included: true },
    ],
    popular: false,
    icon: FaGem,
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const [studentCount, setStudentCount] = useState(300);

  const handleSelectPlan = (plan) => {
    navigate(`/payment?plan=${plan.id}&students=${studentCount}`);
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
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-white">
            One-Time Setup. <span className="text-gold-gradient">Custom App Included.</span>
          </h2>
          <p className="text-xl text-sky-100/70 max-w-3xl mx-auto">
            Every plan includes a fully customized mobile app for your school. Pay a one-time setup fee, then choose a termly per-student subscription.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
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
                  <span className="text-4xl font-bold text-white">KSh {plan.setupFee.toLocaleString()}</span>
                  <span className="text-sky-100/60 ml-2">one-time</span>
                </div>
                <p className="text-sm text-gold-400 font-medium flex items-center">
                  + KSh {plan.installFee.toLocaleString()} installation & onboarding
                </p>
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-white mb-4">What's included:</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      {feature.included ? (
                        <FaCheck className="text-gold-400 mt-1 mr-3 flex-shrink-0 text-sm" />
                      ) : (
                        <FaTimes className="text-sky-500/20 mt-1 mr-3 flex-shrink-0 text-sm" />
                      )}
                      <span className={feature.included ? 'text-sky-100/90 text-sm' : 'text-sky-100/30 text-sm'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gold-gradient text-navy-950 shadow-gold-glow hover:shadow-gold-glow-lg hover:-translate-y-1'
                    : 'bg-sky-500/10 text-sky-300 border border-sky-400/50 hover:bg-sky-500/20'
                }`}
              >
                Get {plan.name}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Termly Subscription Calculator */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6, delay: 0.3 }}
           className="mt-16 max-w-3xl mx-auto bg-navy-900/60 border border-sky-500/30 rounded-2xl p-8 backdrop-blur-md text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <FaCalculator className="text-2xl text-gold-400 mr-3" />
            <h3 className="text-xl font-display font-bold text-white">Termly Subscription Calculator</h3>
          </div>
          <p className="text-sky-100/70 mb-6 text-sm">
            All plans run on a termly subscription of <strong className="text-gold-400">KSh 45 per student, per term</strong>. 
            Estimate your recurring cost below.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="w-full md:w-1/2 text-left">
              <label className="text-xs text-sky-200/60 uppercase tracking-wider mb-2 block">Number of Students</label>
              <input 
                type="number" 
                min="10" 
                max="5000"
                value={studentCount}
                onChange={(e) => setStudentCount(Number(e.target.value))}
                className="w-full px-4 py-3 bg-navy-950 border border-sky-500/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div className="w-full md:w-1/2 bg-navy-950/80 rounded-lg p-4 border border-sky-500/20 text-left">
               <p className="text-xs text-sky-200/60 uppercase tracking-wider mb-1">Estimated Cost Per Term</p>
               <p className="text-3xl font-bold text-gold-400">
                 KSh {(studentCount * 45).toLocaleString()}
               </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
