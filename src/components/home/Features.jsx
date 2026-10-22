import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaSchool, FaPaintBrush, FaMobile, FaEnvelope, 
  FaCreditCard, FaDatabase, FaChartLine, FaShieldAlt 
} from 'react-icons/fa';

const features = [
  {
    icon: FaSchool,
    title: 'Multi-School Isolation',
    description: 'Each school gets their own isolated instance with custom subdomain and complete data separation.',
  },
  {
    icon: FaPaintBrush,
    title: 'Custom Branding',
    description: 'Upload your school logo, set custom colors, and create a branded experience for your community.',
  },
  {
    icon: FaMobile,
    title: 'Branded Mobile App',
    description: 'Download a customized mobile app for your school that connects directly to your platform.',
  },
  {
    icon: FaEnvelope,
    title: 'Automated Notifications',
    description: 'Welcome emails, password resets, SMS alerts - all sent automatically via our integrated systems.',
  },
  {
    icon: FaCreditCard,
    title: 'Subscription Management',
    description: 'Automated billing, subscription tracking, and access control based on active subscription status.',
  },
  {
    icon: FaDatabase,
    title: 'Complete Data Isolation',
    description: "Each school's data is completely isolated, ensuring privacy and security across all tenants.",
  },
  {
    icon: FaChartLine,
    title: 'Advanced Analytics',
    description: 'Comprehensive reports and analytics to track student performance, attendance, and financials.',
  },
  {
    icon: FaShieldAlt,
    title: 'Enterprise Security',
    description: 'Role-based access control, data encryption, and regular security audits for complete peace of mind.',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-navy-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
         <div className="absolute top-20 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl" />
         <div className="absolute bottom-20 left-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-white">
            Everything You Need to <span className="text-gold-gradient">Succeed</span>
          </h2>
          <p className="text-xl text-sky-100/70 max-w-3xl mx-auto">
            A complete school management platform with multi-school isolation, custom branding, and mobile apps.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-navy-900/60 backdrop-blur-md border border-sky-500/20 rounded-2xl p-6 hover:border-gold-500/50 hover:shadow-gold-glow transition-all duration-300 hover:-translate-y-2"
            >
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300 pointer-events-none" />

              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-navy-950 border border-sky-500/30 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:border-gold-500/50 transition-all duration-300 shadow-inner">
                  <feature.icon className="text-2xl text-sky-400 group-hover:text-gold-400 transition-colors" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-sm text-sky-100/60 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
