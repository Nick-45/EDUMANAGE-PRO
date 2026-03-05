import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Stats = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const stats = [
    { value: 500, label: 'Schools' },
    { value: 75000, label: 'Students' },
    { value: 15000, label: 'Teachers' },
    { value: 99, label: 'Satisfaction', suffix: '%' },
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
      <div className="container mx-auto px-4">
        <div ref={ref} className="grid md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center text-white"
            >
              <div className="text-5xl font-bold mb-2">
                {inView ? (
                  <Counter end={stat.value} suffix={stat.suffix} />
                ) : (
                  '0'
                )}
              </div>
              <p className="text-lg opacity-90">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Simple counter component
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
  
  return <>{count}{suffix}</>;
};

export default Stats;
