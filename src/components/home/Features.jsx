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
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: FaPaintBrush,
    title: 'Custom Branding',
    description: 'Upload your school logo, set custom colors, and create a branded experience for your community.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: FaMobile,
    title: 'Branded Mobile App',
    description: 'Download a branded WebView app for your school that points to your subdomain.',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: FaEnvelope,
    title: 'Automated Notifications',
    description: 'Welcome emails, password resets, subscription confirmations - all sent automatically via SMTP.',
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    icon: FaCreditCard,
    title: 'Subscription Management',
    description: 'Automated billing, subscription tracking, and access control based on active subscription status.',
    color: 'from-red-500 to-red-600',
  },
  {
    icon: FaDatabase,
    title: 'Complete Data Isolation',
    description: "Each school's data is completely isolated, ensuring privacy and security across all tenants.",
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    icon: FaChartLine,
    title: 'Advanced Analytics',
    description: 'Comprehensive reports and analytics to track student performance, attendance, and financials.',
    color: 'from-pink-500 to-pink-600',
  },
  {
    icon: FaShieldAlt,
    title: 'Enterprise Security',
    description: 'Role-based access control, data encryption, and regular security audits for complete peace of mind.',
    color: 'from-teal-500 to-teal-600',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Everything You Need to <span className="text-primary-600">Succeed</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Complete school management platform with multi-school isolation, custom branding, and mobile apps.
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
              className="group relative bg-gray-50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="text-2xl text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
