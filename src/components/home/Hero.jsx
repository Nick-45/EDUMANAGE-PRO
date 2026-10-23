import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaRocket, FaPlay, FaGraduationCap, FaChartLine, FaMobileAlt, FaTimes } from 'react-icons/fa';

const Hero = () => {
  const [showVideo, setShowVideo] = useState(false);

  // Prevent background scrolling when video modal is open
  useEffect(() => {
    if (showVideo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showVideo]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <section className="min-h-screen flex items-center pt-24 pb-12 bg-navy-gradient relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            
            {/* Left Text Section */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex-1 text-center lg:text-left"
            >
              <motion.div
                variants={itemVariants}
                className="inline-block px-4 py-2 bg-sky-500/10 border border-sky-500/30 text-sky-300 rounded-full text-sm font-semibold mb-6"
              >
                <FaRocket className="inline mr-2 text-gold-400" />
                Next-Gen School Management
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-5xl md:text-6xl font-display font-bold mb-6 text-white leading-tight"
              >
                Transform Your School with{' '}
                <span className="text-gold-gradient">
                  Cloud-Based
                </span>{' '}
                Management
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-xl text-sky-100/70 mb-8 max-w-2xl mx-auto lg:mx-0"
              >
                The complete, custom-branded platform for modern schools. 
                Manage students, fees, results, and communication seamlessly.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-wrap gap-4 justify-center lg:justify-start mb-10"
              >
                <div className="flex items-center text-sky-100/90 bg-navy-900/60 border border-sky-500/20 px-4 py-2 rounded-lg">
                  <FaGraduationCap className="text-gold-400 mr-2" />
                  <span className="text-sm font-medium">Student Records</span>
                </div>
                <div className="flex items-center text-sky-100/90 bg-navy-900/60 border border-sky-500/20 px-4 py-2 rounded-lg">
                  <FaChartLine className="text-gold-400 mr-2" />
                  <span className="text-sm font-medium">Fee Management</span>
                </div>
                <div className="flex items-center text-sky-100/90 bg-navy-900/60 border border-sky-500/20 px-4 py-2 rounded-lg">
                  <FaMobileAlt className="text-gold-400 mr-2" />
                  <span className="text-sm font-medium">Custom Apps</span>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex flex-wrap gap-4 justify-center lg:justify-start"
              >
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-gold-gradient text-navy-950 rounded-xl font-bold shadow-gold-glow hover:shadow-gold-glow-lg bg-[length:200%_100%] hover:animate-shimmer transform hover:-translate-y-1 transition-all duration-300 flex items-center"
                >
                  <FaRocket className="inline mr-2" />
                  Start Your Application
                </Link>
                <button
                  onClick={() => setShowVideo(true)}
                  className="px-8 py-4 border-2 border-sky-400/50 text-sky-300 rounded-xl font-semibold hover:bg-sky-500/10 hover:border-sky-400 transition-all duration-300 flex items-center group"
                >
                  <FaPlay className="inline mr-2 group-hover:scale-110 transition-transform" />
                  View Live Demo
                </button>
              </motion.div>
            </motion.div>

            {/* Right Image / Mockup Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex-1 relative w-full max-w-lg mx-auto lg:mx-0"
            >
              {/* Main Dashboard Mockup */}
              <div className="bg-navy-900/80 backdrop-blur-xl border border-sky-500/30 rounded-2xl shadow-2xl overflow-hidden animate-float">
                {/* Mockup Header */}
                <div className="h-16 bg-navy-950 border-b border-sky-500/20 flex items-center px-4">
                  <div className="w-8 h-8 bg-gold-gradient rounded-lg mr-3 shadow-gold-glow"></div>
                  <div className="flex-1 h-3 bg-sky-500/20 rounded-full"></div>
                  <div className="w-8 h-8 bg-sky-500/20 rounded-full ml-4"></div>
                </div>
                
                {/* Mockup Body */}
                <div className="p-6">
                  {/* Chart Area */}
                  <div className="flex gap-4 mb-6">
                     <div className="w-2/3 h-32 bg-navy-950 border border-sky-500/20 rounded-lg p-3 flex items-end justify-between gap-2">
                        <div className="w-1/6 bg-sky-500/40 rounded-t h-[40%]"></div>
                        <div className="w-1/6 bg-gold-500/60 rounded-t h-[70%]"></div>
                        <div className="w-1/6 bg-sky-500/40 rounded-t h-[50%]"></div>
                        <div className="w-1/6 bg-gold-500/80 rounded-t h-[90%] shadow-gold-glow"></div>
                        <div className="w-1/6 bg-sky-500/40 rounded-t h-[60%]"></div>
                     </div>
                     <div className="w-1/3 h-32 bg-navy-950 border border-sky-500/20 rounded-lg p-3 flex flex-col justify-center items-center">
                        <div className="w-12 h-12 rounded-full border-4 border-gold-500 border-t-transparent animate-spin mb-2"></div>
                        <div className="h-2 w-12 bg-sky-500/20 rounded-full"></div>
                     </div>
                  </div>
                  {/* List Area */}
                  <div className="space-y-3">
                     {[1, 2, 3].map((i) => (
                       <div key={i} className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/30"></div>
                         <div className="flex-1 space-y-2">
                           <div className="h-2 bg-sky-500/20 rounded-full w-3/4"></div>
                           <div className="h-2 bg-sky-500/10 rounded-full w-1/2"></div>
                         </div>
                       </div>
                     ))}
                  </div>
                </div>
              </div>

              {/* Floating Decorative Icons - The Play button now opens the video */}
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-gold-gradient rounded-2xl shadow-gold-glow flex items-center justify-center text-navy-950 text-2xl animate-float">
                <FaRocket />
              </div>
              <button 
                onClick={() => setShowVideo(true)}
                className="absolute -bottom-6 -left-6 w-16 h-16 bg-navy-900 border border-sky-400/50 rounded-2xl shadow-sky-glow flex items-center justify-center text-sky-400 text-2xl animate-float hover:text-gold-400 hover:border-gold-500/50 transition-colors cursor-pointer" 
                style={{ animationDelay: '0.5s' }}
                aria-label="Play Demo Video"
              >
                <FaPlay className="ml-1" />
              </button>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Video Modal Overlay */}
      <AnimatePresence>
        {showVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/90 backdrop-blur-md"
          >
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={() => setShowVideo(false)}></div>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl bg-navy-900 border border-sky-500/30 rounded-2xl shadow-2xl overflow-hidden z-10"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-navy-950 border-b border-sky-500/20">
                <div className="flex items-center text-sky-100 font-medium">
                  <FaPlay className="text-gold-400 mr-2 text-sm" /> EduPriva Platform Demo
                </div>
                <button 
                  onClick={() => setShowVideo(false)}
                  className="text-sky-100/60 hover:text-rose-400 hover:bg-rose-500/10 p-2 rounded-lg transition-colors"
                >
                  <FaTimes size={18} />
                </button>
              </div>
              
              {/* Video Player */}
              <div className="aspect-video bg-black relative flex items-center justify-center">
                <video 
                  src="/demo.mp4" 
                  controls 
                  autoPlay 
                  className="w-full h-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Hero;
