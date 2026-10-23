import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-950 border-t border-sky-500/10 text-white pt-16 pb-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-sky-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="flex items-center space-x-3 mb-4 group">
              <div className="w-10 h-10 bg-navy-900 border border-gold-500/30 rounded-xl flex items-center justify-center p-1.5 group-hover:shadow-gold-glow transition-all">
                <img src="/logo192.png" alt="EduPriva" className="w-full h-full object-contain" />
              </div>
              <span className="font-display font-bold text-2xl text-white tracking-wide">
                Edu<span className="text-gold-gradient">Priva</span>
              </span>
            </Link>
            
            <p className="text-sky-100/60 mb-6 text-sm leading-relaxed">
              Complete school management solution. Powering modern education with custom apps, branding, and seamless administration.
            </p>
            
            <div className="flex space-x-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-navy-900 border border-sky-500/20 rounded-lg flex items-center justify-center text-sky-400 hover:text-navy-950 hover:bg-gold-gradient hover:border-gold-500 transition-all">
                <FaFacebook />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-navy-900 border border-sky-500/20 rounded-lg flex items-center justify-center text-sky-400 hover:text-navy-950 hover:bg-gold-gradient hover:border-gold-500 transition-all">
                <FaTwitter />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-navy-900 border border-sky-500/20 rounded-lg flex items-center justify-center text-sky-400 hover:text-navy-950 hover:bg-gold-gradient hover:border-gold-500 transition-all">
                <FaLinkedin />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-navy-900 border border-sky-500/20 rounded-lg flex items-center justify-center text-sky-400 hover:text-navy-950 hover:bg-gold-gradient hover:border-gold-500 transition-all">
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
            <h4 className="text-lg font-semibold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-sky-100/60 hover:text-gold-400 transition text-sm">Home</Link>
              </li>
              <li>
                <a href="#features" className="text-sky-100/60 hover:text-gold-400 transition text-sm">Features</a>
              </li>
              <li>
                <a href="#pricing" className="text-sky-100/60 hover:text-gold-400 transition text-sm">Pricing</a>
              </li>
              <li>
                <a href="#ads" className="text-sky-100/60 hover:text-gold-400 transition text-sm">Partners</a>
              </li>
              <li>
                <Link to="/contact" className="text-sky-100/60 hover:text-gold-400 transition text-sm">Contact Support</Link>
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
            <h4 className="text-lg font-semibold mb-6 text-white">Our Solutions</h4>
            <ul className="space-y-3">
              <li>
                <a href="#pricing" className="text-sky-100/60 hover:text-gold-400 transition text-sm">Basic Plan</a>
              </li>
              <li>
                <a href="#pricing" className="text-sky-100/60 hover:text-gold-400 transition text-sm">Standard Plan</a>
              </li>
              <li>
                <a href="#pricing" className="text-sky-100/60 hover:text-gold-400 transition text-sm">Premium Plan</a>
              </li>
              <li>
                <Link to="/app-download" className="text-sky-100/60 hover:text-gold-400 transition text-sm">Branded Mobile Apps</Link>
              </li>
              <li>
                <Link to="/api-docs" className="text-sky-100/60 hover:text-gold-400 transition text-sm">API Documentation</Link>
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
            <h4 className="text-lg font-semibold mb-6 text-white">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-3 text-gold-400 flex-shrink-0" />
                <span className="text-sky-100/60 text-sm">Nairobi, Kenya</span>
              </li>
              <li className="flex items-center">
                <FaPhone className="mr-3 text-gold-400 flex-shrink-0" />
                <a href="tel:+254757357307" className="text-sky-100/60 hover:text-gold-400 transition text-sm">
                  +254 757 357 307
                </a>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-3 text-gold-400 flex-shrink-0" />
                <a href="mailto:info.edupriva@gmail.com" className="text-sky-100/60 hover:text-gold-400 transition text-sm">
                  info.edupriva@gmail.com
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-sky-500/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sky-100/40 text-sm">
            &copy; {currentYear} . System designed and maintained by <span className="text-gold-400">EduPriva Technologies</span>.
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-sky-100/40 hover:text-sky-300 text-sm transition">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sky-100/40 hover:text-sky-300 text-sm transition">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-sky-100/40 hover:text-sky-300 text-sm transition">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
