import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../../firebase/config';

const Stats = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [dynamicSchoolsCount, setDynamicSchoolsCount] = useState(0);

  // 1. Fetch dynamic active schools count from Firestore
  useEffect(() => {
    const fetchActiveSchools = async () => {
      try {
        // Query only schools with status === 'active'
        const q = query(collection(db, 'schools'), where('status', '==', 'active'));
        
        // getCountFromServer is highly efficient and only counts documents without downloading them
        const snapshot = await getCountFromServer(q);
        setDynamicSchoolsCount(snapshot.data().count);
      } catch (error) {
        console.error('Failed to fetch dynamic school stats:', error);
      }
    };

    fetchActiveSchools();
  }, []);

  // 2. Define defaults and add the dynamic count
  const BASE_DEFAULT_SCHOOLS = 500;
  const BASE_DEFAULT_STUDENTS = 75000;
  const BASE_DEFAULT_TEACHERS = 15000;

  const stats = [
    { 
      value: BASE_DEFAULT_SCHOOLS + dynamicSchoolsCount, 
      label: 'Schools' 
    },
    { value: BASE_DEFAULT_STUDENTS, label: 'Students' },
    { value: BASE_DEFAULT_TEACHERS, label: 'Teachers' },
    { value: 99, label: 'Satisfaction', suffix: '%' },
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 border-y border-sky-500/20 relative overflow-hidden">
      {/* Background Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-gold-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center relative"
            >
              {/* Divider lines for desktop */}
              {index !== 0 && (
                <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-16 bg-sky-500/20" />
              )}
              
              <div className="text-4xl md:text-5xl font-display font-bold mb-3 text-gold-gradient tracking-tight">
                {inView ? (
                  <Counter end={stat.value} suffix={stat.suffix} />
                ) : (
                  '0'
                )}
              </div>
              <p className="text-sm md:text-base font-medium text-sky-100/70 uppercase tracking-widest">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Counter component
const Counter = ({ end, suffix = '' }) => {
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = end / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [end]);
  
  return <>{count.toLocaleString()}{suffix}</>;
};

export default Stats;
