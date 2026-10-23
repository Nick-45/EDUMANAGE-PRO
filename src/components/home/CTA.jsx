import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRocket, FaCheckCircle } from 'react-icons/fa';

const CTA = () => {
  const navigate = useNavigate();

  return (
    // Applied the exact #142B4A navy background here
    <section className="py-24 bg-[#142B4A] relative overflow-hidden">
      
      {/* Decorative ambient glows */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full max-h-96 bg-gold-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto bg-[#142B4A]/80 backdrop-blur-xl border border-sky-500/20 p-10 md:p-14 rounded-3xl shadow-inner-dark shadow-gold-glow"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Ready to Transform Your <span className="text-gold-gradient">School?</span>
          </h2>
          <p className="text-lg md:text-xl text-sky-100/70 mb-10 max-w-2xl mx-auto">
            Join hundreds of schools already using our platform to streamline operations, manage fees, and enhance learning.
          </p>
          
          <button
            onClick={() => navigate('/signup')}
            className="px-8 py-4 bg-gold-gradient text-[#142B4A] rounded-xl font-bold shadow-gold-glow hover:shadow-gold-glow-lg bg-[length:200%_100%] hover:animate-shimmer transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center text-lg"
          >
            <FaRocket className="mr-2" />
            Start Your Application
          </button>
          
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-sky-200/60">
            <span className="flex items-center">
              <FaCheckCircle className="text-gold-400 mr-2" /> No credit card required
            </span>
            <span className="flex items-center">
              <FaCheckCircle className="text-gold-400 mr-2" /> Fast delivery time
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
