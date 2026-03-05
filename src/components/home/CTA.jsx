import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRocket } from 'react-icons/fa';

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Ready to Transform Your School?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join hundreds of schools already using our platform to streamline operations and enhance learning.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center"
          >
            <FaRocket className="mr-2" />
            Start Free Trial
          </button>
          <p className="text-white/80 text-sm mt-4">
            No credit card required • 14-day free trial
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
