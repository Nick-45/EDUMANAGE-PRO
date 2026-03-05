import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaRocket, FaPlay, FaCheckCircle } from 'react-icons/fa';

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="min-h-screen flex items-center pt-20 pb-12 bg-gradient-to-br from-primary-50 via-white to-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 text-center lg:text-left"
          >
            <motion.div
              variants={itemVariants}
              className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-6"
            >
              <FaRocket className="inline mr-2" />
              SaaS School Management Platform
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-6xl font-display font-bold mb-6"
            >
              Transform Your School with{' '}
              <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                Cloud-Based
              </span>{' '}
              Management
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0"
            >
              Complete school management solution with multi-school isolation, custom branding, and mobile apps.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-4 justify-center lg:justify-start mb-8"
            >
              <div className="flex items-center text-gray-700">
                <FaCheckCircle className="text-primary-600 mr-2" />
                <span>Multi-school</span>
              </div>
              <div className="flex items-center text-gray-700">
                <FaCheckCircle className="text-primary-600 mr-2" />
                <span>Custom Branding</span>
              </div>
              <div className="flex items-center text-gray-700">
                <FaCheckCircle className="text-primary-600 mr-2" />
                <span>Mobile Apps</span>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-4 justify-center lg:justify-start"
            >
              <Link
                to="/signup"
                className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
              >
                <FaRocket className="inline mr-2" />
                Start Free Trial
              </Link>
              <button
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-all duration-300"
              >
                <FaPlay className="inline mr-2" />
                Live Demo
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 relative"
          >
            <div className="relative w-full max-w-lg mx-auto">
              {/* Dashboard Preview */}
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-float">
                <div className="h-16 bg-gradient-to-r from-primary-600 to-primary-700 flex items-center px-4">
                  <div className="w-8 h-8 bg-white/20 rounded-lg mr-3"></div>
                  <div className="flex-1 h-4 bg-white/20 rounded-full"></div>
                  <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-20 bg-gray-100 rounded-lg animate-pulse-slow"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Icons */}
              <div className="absolute -top-10 -right-10 w-16 h-16 bg-primary-600 rounded-2xl shadow-lg flex items-center justify-center text-white text-2xl animate-float">
                <FaRocket />
              </div>
              <div className="absolute -bottom-10 -left-10 w-16 h-16 bg-yellow-400 rounded-2xl shadow-lg flex items-center justify-center text-gray-800 text-2xl animate-float" style={{ animationDelay: '0.5s' }}>
                <FaPlay />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
