import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaBullhorn } from 'react-icons/fa';

// 1. Define your internal ads/partnerships here
const internalAds = [
  {
    id: 1,
    title: 'Premium School Supplies',
    description: 'Get 20% off bulk orders of exercise books and stationery for the new term.',
    ctaText: 'Shop Now',
    link: 'https://example.com/supplies',
    bgColor: 'bg-gradient-to-r from-sky-900 to-navy-900',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 2,
    title: 'School Transport Management',
    description: 'Track your school buses in real-time with our GPS partner. Integrated directly with EduPriva.',
    ctaText: 'Learn More',
    link: 'https://example.com/transport',
    bgColor: 'bg-gradient-to-r from-gold-900 to-navy-900',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=400',
  }
];

const AdSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Note: This is the ID you will get from your Google AdSense dashboard
  const ADSENSE_CLIENT_ID = 'ca-pub-XXXXXXXXXXXXXXXX'; 
  const ADSENSE_SLOT_ID = 'XXXXXXXXXX'; 

  useEffect(() => {
    // 2. Load Google AdSense script dynamically
    const scriptId = 'google-adsense-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
      script.crossOrigin = 'anonymous';
      script.async = true;
      document.head.appendChild(script);
    }

    // 3. Initialize the ad (must be called after script loads)
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense initialization error:', e);
    }
  }, []);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % internalAds.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + internalAds.length) % internalAds.length);
  };

  const currentAd = internalAds[currentIndex];

  return (
    <section id="ads" className="py-16 bg-navy-gradient relative overflow-hidden border-y border-sky-500/10">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <div className="flex items-center justify-center mb-8 text-sky-100/40 text-sm uppercase tracking-widest font-semibold">
          <FaBullhorn className="mr-2" /> Sponsored & Partner Content
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          
          {/* LEFT SIDE: Your Internal Carousel Ad */}
          <div className="relative">
            <motion.div
              key={currentAd.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className={`rounded-2xl shadow-xl overflow-hidden border border-sky-500/20 ${currentAd.bgColor}`}
            >
              <div className="md:flex items-center">
                <div className="md:w-1/2 h-48 md:h-full">
                  <img 
                    src={currentAd.image} 
                    alt={currentAd.title} 
                    className="w-full h-full object-cover opacity-80 mix-blend-overlay"
                  />
                </div>
                <div className="p-6 md:w-1/2 text-white">
                  <h3 className="text-xl font-display font-bold mb-2">{currentAd.title}</h3>
                  <p className="text-sm text-white/70 mb-6">{currentAd.description}</p>
                  <a 
                    href={currentAd.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-white text-navy-950 text-sm font-bold rounded-lg hover:bg-gray-100 transition"
                  >
                    {currentAd.ctaText}
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Carousel Controls */}
            {internalAds.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 backdrop-blur-sm">
                  <FaChevronLeft size={12} />
                </button>
                <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 backdrop-blur-sm">
                  <FaChevronRight size={12} />
                </button>
              </>
            )}
          </div>

          {/* RIGHT SIDE: Google AdSense Container */}
          <div className="bg-navy-900/50 border border-sky-500/20 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden">
            <span className="absolute top-2 right-2 text-[10px] text-sky-100/30 uppercase tracking-widest">Ad</span>
            
            {/* 
              Google AdSense Tag
              Replace data-ad-client and data-ad-slot with your actual IDs 
            */}
            <ins className="adsbygoogle w-full"
                 style={{ display: 'block', minHeight: '200px' }}
                 data-ad-client={ADSENSE_CLIENT_ID}
                 data-ad-slot={ADSENSE_SLOT_ID}
                 data-ad-format="auto"
                 data-full-width-responsive="true">
            </ins>
            
            {/* Fallback placeholder if AdSense is blocked by an adblocker */}
            <div className="text-center absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
               <span className="text-sky-200 text-sm">Advertisement Space</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AdSection;
