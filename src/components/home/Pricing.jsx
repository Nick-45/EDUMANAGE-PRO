import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaTimes, FaCrown, FaGem } from 'react-icons/fa';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 2500,
    period: 'month',
    students: 200,
    features: [
      { name: 'Custom subdomain', included: true },
      { name: 'School branding', included: true },
      { name: 'WebView app', included: true },
      { name: 'Email support', included: true },
      { name: 'Basic reports', included: true },
      { name: 'Priority support', included: false },
      { name: 'Custom development', included: false },
    ],
    buttonText: 'Get Started',
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 5000,
    period: 'month',
    students: 500,
    features: [
      { name: 'Custom subdomain', included: true },
      { name: 'Advanced branding', included: true },
      { name: 'WebView app', included: true },
      { name: 'Priority support', included: true },
      { name: 'Advanced reports', included: true },
      { name: 'API access', included: true },
      { name: 'Custom development', included: false },
    ],
    buttonText: 'Get Started',
    popular: true,
    icon: FaCrown,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 10000,
    period: 'month',
    students: 'Unlimited',
    features: [
      { name: 'Custom domain', included: true },
      { name: 'Full white-label', included: true },
      { name: 'Custom mobile app', included: true },
      { name: '24/7 support', included: true },
      { name: 'Custom reports', included: true },
      { name: 'API access', included: true },
      { name: 'Custom development', included: true },
    ],
    buttonText: 'Contact Sales',
    popular: false,
    icon: FaGem,
  },
];

const Pricing = () => {
  const navigate = useNavigate();

  const handleSelectPlan = (plan) => {
    navigate(`/payment?plan=${plan.id}`);
  };

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Simple, <span className="text-primary-600">Transparent</span> Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your school. All plans include custom subdomain, branding, and mobile app.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${
                plan.popular ? 'transform scale-105 border-2 border-yellow-400' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  {plan.icon && <plan.icon className="text-3xl text-primary-600" />}
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold">KSh {plan.price.toLocaleString()}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>

                <p className="text-gray-600 mb-6">
                  Up to {plan.students} students
                </p>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      {feature.included ? (
                        <FaCheck className="text-green-500 mr-3 flex-shrink-0" />
                      ) : (
                        <FaTimes className="text-gray-300 mr-3 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 hover:shadow-lg transform hover:-translate-y-1'
                      : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:shadow-lg transform hover:-translate-y-1'
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
