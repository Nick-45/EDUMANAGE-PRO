import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-display font-bold mb-4">
              <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                EduManagerPro
              </span>
            </h3>
            <p className="text-gray-400 mb-4">
              Complete school management solution with multi-school isolation, custom branding, and mobile apps.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition"
              >
                <FaFacebook />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition"
              >
                <FaTwitter />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition"
              >
                <FaLinkedin />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition"
              >
                <FaInstagram />
              </a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary-500 transition">
                  Home
                </Link>
              </li>
              <li>
                <a href="#features" className="text-gray-400 hover:text-primary-500 transition">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-400 hover:text-primary-500 transition">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-gray-400 hover:text-primary-500 transition">
                  Testimonials
                </a>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-primary-500 transition">
                  Contact
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold mb-4">Products</h4>
            <ul className="space-y-2">
              <li>
                <a href="#pricing" className="text-gray-400 hover:text-primary-500 transition">
                  Starter Plan
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-400 hover:text-primary-500 transition">
                  Professional Plan
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-400 hover:text-primary-500 transition">
                  Enterprise Plan
                </a>
              </li>
              <li>
                <Link to="/app-download" className="text-gray-400 hover:text-primary-500 transition">
                  Mobile App
                </Link>
              </li>
              <li>
                <Link to="/api-docs" className="text-gray-400 hover:text-primary-500 transition">
                  API Documentation
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-3 text-primary-500 flex-shrink-0" />
                <span className="text-gray-400">Nairobi, Kenya</span>
              </li>
              <li className="flex items-center">
                <FaPhone className="mr-3 text-primary-500 flex-shrink-0" />
                <a href="tel:+254114963959" className="text-gray-400 hover:text-primary-500 transition">
                  +254 114 963 959
                </a>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-3 text-primary-500 flex-shrink-0" />
                <a href="mailto:info@edumanagerpro.com" className="text-gray-400 hover:text-primary-500 transition">
                  info@edumanagerpro.com
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              &copy; {currentYear} EduManagerPro. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-500 hover:text-primary-500 text-sm transition">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-500 hover:text-primary-500 text-sm transition">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-500 hover:text-primary-500 text-sm transition">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
