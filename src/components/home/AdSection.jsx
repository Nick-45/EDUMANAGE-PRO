import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaBullhorn, FaImage } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, query, where, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase/config';

const AdSection = () => {
  const [internalAds, setInternalAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const adsenseRef = useRef(null);

  const ADSENSE_CLIENT_ID = 'ca-pub-3493778872805373'; 
  const ADSENSE_SLOT_ID = '7352622150'; 

  // Fetch Ads from Firestore
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const q = query(collection(db, 'ads'), where('active', '==', true));
        const snapshot = await getDocs(q);
        const adsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        adsData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setInternalAds(adsData);
      } catch (err) {
        console.error('Failed to load internal ads:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  // Load Google AdSense Script (Only once)
  useEffect(() => {
    const scriptId = 'google-adsense-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
      script.crossOrigin = 'anonymous';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Fix for SPA: Forcefully clear the old ad before pushing a new one
  useEffect(() => {
    // Only push if we are on the homepage (where the ad section lives)
    if (location.pathname !== '/') return;

    const timer = setTimeout(() => {
      try {
        // If the element exists, clear its innerHTML to remove the old ad
        if (adsenseRef.current) {
          adsenseRef.current.innerHTML = '';
        }
        // Push the new ad
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.warn('AdSense push error (handled):', e);
      }
    }, 300); // 300ms delay ensures React has painted the DOM

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Log Impression
  useEffect(() => {
    if (internalAds.length > 0 && internalAds[currentIndex]) {
      const currentAdId = internalAds[currentIndex].id;
      updateDoc(doc(db, 'ads', currentAdId), { impressions: increment(1) }).catch(() => {});
    }
  }, [currentIndex, internalAds]);

  const next = () => setCurrentIndex((prev) => (prev + 1) % internalAds.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + internalAds.length) % internalAds.length);
  
  const handleAdClick = async () => {
    if (!internalAds[currentIndex]) return;
    try {
      await updateDoc(doc(db, 'ads', internalAds[currentIndex].id), { clicks: increment(1) });
    } catch (err) {}
  };

  if (loading || internalAds.length === 0) return null;

  const currentAd = internalAds[currentIndex];

  return (
    <section id="ads" className="py-16 bg-navy-gradient relative overflow-hidden border-y border-sky-500/10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-center mb-8 text-sky-100/40 text-sm uppercase tracking-widest font-semibold">
          <FaBullhorn className="mr-2" /> Sponsored & Partner Content
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          
          {/* LEFT SIDE: In-House Ad */}
          <div className="relative">
            <motion.div
              key={currentAd.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className={`rounded-2xl shadow-xl overflow-hidden border border-sky-500/20 bg-gradient-to-r ${currentAd.bgColor || 'from-sky-900 to-navy-900'}`}
            >
              <div className="md:flex items-center">
                {/* IMAGE FIX: Added a robust image checker */}
                <div className="md:w-1/2 h-48 md:h-full bg-navy-950 relative flex items-center justify-center overflow-hidden">
                  {currentAd.image ? (
                    <img 
                      src={currentAd.image} 
                      alt={currentAd.title} 
                      className="w-full h-full object-cover opacity-80 mix-blend-overlay absolute inset-0"
                      onError={(e) => {
                        // If image fails to load, hide it and show fallback icon
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback Icon (Shows if no image URL or if image fails to load) */}
                  <div 
                    className={`w-full h-full flex flex-col items-center justify-center opacity-30 ${currentAd.image ? 'hidden' : 'flex'}`}
                  >
                    <FaImage className="text-4xl text-sky-400 mb-2" />
                    <span className="text-xs text-sky-200 uppercase tracking-widest">No Image</span>
                  </div>
                </div>

                <div className="p-6 md:w-1/2 text-white relative z-10">
                  <h3 className="text-xl font-display font-bold mb-2">{currentAd.title}</h3>
                  <p className="text-sm text-white/70 mb-6">{currentAd.description}</p>
                  <a 
                    href={currentAd.link} 
                    onClick={handleAdClick}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-white text-navy-950 text-sm font-bold rounded-lg hover:bg-gray-100 transition"
                  >
                    {currentAd.ctaText}
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Controls */}
            {internalAds.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 backdrop-blur-sm z-20">
                  <FaChevronLeft size={12} />
                </button>
                <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 backdrop-blur-sm z-20">
                  <FaChevronRight size={12} />
                </button>
              </>
            )}
          </div>

          {/* RIGHT SIDE: Google AdSense */}
          <div className="bg-navy-900/50 border border-sky-500/20 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden">
            <span className="absolute top-2 right-2 text-[10px] text-sky-100/30 uppercase tracking-widest">Ad</span>
            
            {/* Added ref to control the ad element directly */}
            <ins 
              ref={adsenseRef}
              className="adsbygoogle w-full"
              style={{ display: 'block', minHeight: '200px' }}
              data-ad-client={ADSENSE_CLIENT_ID}
              data-ad-slot={ADSENSE_SLOT_ID}
              data-ad-format="auto"
              data-full-width-responsive="true">
            </ins>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AdSection;
