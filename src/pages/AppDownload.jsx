import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';
import Navbar from '../components/layout/Navbar';
import { motion } from 'framer-motion';
import {
  FaAndroid, FaQrcode, FaDownload,
  FaArrowLeft, FaCopy, FaShare, FaSpinner,
  FaClock, FaInfoCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import QRCode from 'qrcode.react';

const AppDownload = () => {
  const { isAuthenticated } = useAuth();
  const { school } = useSchool();
  const navigate = useNavigate();
  const [showQRCode, setShowQRCode] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  const apkFile = school?.app?.apkFile;
  const apkUrl = apkFile ? `/${apkFile}` : null;
  const schoolName = school?.identity?.name || school?.schoolName || 'Your School';
  const schoolLogo = school?.identity?.logo || '/logo192.png';
  const subdomain = school?.subdomain;
  const schoolUrl = subdomain ? `${subdomain}.edupriva.top` : null;

  const handleDirectDownload = () => {
    if (!apkUrl) {
      toast.error('Your app is not yet available. Please wait for approval.');
      return;
    }
    setDownloading(true);
    const link = document.createElement('a');
    link.href = apkUrl;
    link.download = apkFile;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(
      <div>
        <p className="font-medium">Download Started!</p>
        <p className="text-sm">{apkFile} is being downloaded.</p>
      </div>,
      { duration: 4000 }
    );
    setDownloading(false);
  };

  const copySubdomain = () => {
    if (!schoolUrl) return toast.error('Subdomain not yet assigned');
    navigator.clipboard.writeText(schoolUrl);
    toast.success('URL copied to clipboard!');
  };

  const shareApp = () => {
    if (!schoolUrl) return toast.error('Subdomain not yet assigned');
    if (navigator.share) {
      navigator.share({
        title: `${schoolName} Mobile App`,
        text: `Download the official ${schoolName} mobile app`,
        url: `https://${schoolUrl}/app`,
      }).catch(() => copySubdomain());
    } else {
      copySubdomain();
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-navy-gradient pt-20 pb-12 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 bg-gold-500/15 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 py-8 max-w-6xl relative">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl font-display font-bold mb-4 text-white">
              Your School's <span className="text-gold-gradient">{schoolName} App</span>
            </h1>
            <p className="text-xl text-sky-100/70 max-w-3xl mx-auto">
              Download the branded mobile app for your school. Available for Android devices.
            </p>
          </motion.div>

          {/* School Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-navy-900/80 backdrop-blur-xl border border-gold-500/30 rounded-2xl shadow-gold-glow p-8 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <img src={schoolLogo} alt={schoolName}
                  className="w-16 h-16 rounded-xl bg-navy-950 border border-gold-500/30 p-1 object-contain" />
                <div>
                  <h2 className="text-2xl font-display font-bold mb-1 text-white">{schoolName}</h2>
                  <p className="text-sky-100/70">Your school's branded mobile app</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-navy-950/60 border border-sky-500/30 rounded-lg px-4 py-2">
                  <span className="text-xs text-sky-200/70">Your URL:</span>
                  <div className="flex items-center mt-1">
                    <code className="text-gold-400 font-medium text-sm">
                      {schoolUrl || 'Pending assignment'}
                    </code>
                    <button onClick={copySubdomain} disabled={!schoolUrl}
                      className="ml-2 p-1 hover:bg-sky-500/20 rounded disabled:opacity-40" title="Copy URL">
                      <FaCopy className="text-sky-300" />
                    </button>
                  </div>
                </div>
                <button onClick={shareApp} disabled={!schoolUrl}
                  className="bg-navy-950/60 border border-sky-500/30 p-3 rounded-lg hover:bg-sky-500/20 transition disabled:opacity-40"
                  title="Share App">
                  <FaShare className="text-sky-300" />
                </button>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="bg-navy-900/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl shadow-inner-dark p-8">
                <h3 className="text-2xl font-display font-bold mb-6 text-white">Download App</h3>

                {/* App Info Card */}
                <div className="bg-navy-950/60 border border-sky-500/20 rounded-xl p-6 mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <img src={schoolLogo} alt="App Icon"
                      className="w-20 h-20 rounded-2xl shadow-gold-glow border border-gold-500/30 object-contain bg-navy-950 p-1" />
                    <div>
                      <h4 className="text-xl font-bold text-white">{schoolName}</h4>
                      <p className="text-sky-100/60">Version {school?.app?.version || '1.0.0'}</p>
                      <div className="flex items-center mt-2 text-sm text-sky-200/70">
                        <FaAndroid className="mr-1 text-gold-400" />
                        <span>Android App • ~25MB</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-navy-900/60 border border-sky-500/20 rounded-lg p-3 text-center">
                      <p className="text-xs text-sky-200/60">Size</p>
                      <p className="font-semibold text-white">25 MB</p>
                    </div>
                    <div className="bg-navy-900/60 border border-sky-500/20 rounded-lg p-3 text-center">
                      <p className="text-xs text-sky-200/60">Updated</p>
                      <p className="font-semibold text-white">
                        {school?.app?.uploadedAt ? new Date(school.app.uploadedAt).toLocaleDateString() : 'Pending'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Download Button / Gate */}
                {!apkUrl ? (
                  <div className="p-6 bg-navy-950/60 border border-sky-500/30 rounded-xl text-center mb-4">
                    <FaClock className="text-3xl text-sky-400 mx-auto mb-3" />
                    <h4 className="font-semibold text-white mb-2">App Not Yet Available</h4>
                    <p className="text-sm text-sky-100/60">
                      Your branded app is being prepared by our team. You'll be able to download it once approved.
                    </p>
                  </div>
                ) : (
                  <button onClick={handleDirectDownload} disabled={downloading}
                    className="w-full py-4 bg-gold-gradient text-navy-950 rounded-xl font-semibold shadow-gold-glow hover:shadow-gold-glow-lg bg-[length:200%_100%] hover:animate-shimmer transition flex items-center justify-center text-lg mb-4 disabled:opacity-50">
                    {downloading ? (
                      <><FaSpinner className="animate-spin mr-2" /> Preparing Download...</>
                    ) : (
                      <><FaDownload className="mr-2" /> Download {apkFile}</>
                    )}
                  </button>
                )}

                {/* QR Toggle */}
                <button onClick={() => setShowQRCode(!showQRCode)} disabled={!apkUrl}
                  className="w-full py-3 border-2 border-sky-400/50 text-sky-300 rounded-xl font-semibold hover:bg-sky-500/10 flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed">
                  <FaQrcode className="mr-2" />
                  {showQRCode ? 'Hide QR Code' : 'Show QR Code for Mobile'}
                </button>

                {showQRCode && apkUrl && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-6 bg-navy-950/60 border border-sky-500/20 rounded-xl text-center">
                    <h4 className="font-semibold mb-3 text-white">Scan with your phone</h4>
                    <div className="inline-block p-4 bg-white rounded-xl">
                      <QRCode
                        value={`${window.location.origin}${apkUrl}`}
                        size={200}
                        level="H"
                        includeMargin={true}
                        imageSettings={{ src: '/logo192.png', height: 40, width: 40, excavate: true }}
                      />
                    </div>
                    <p className="text-sm text-sky-100/60 mt-3">
                      Scan this QR code with your phone to download directly
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Right Column */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div className="bg-navy-900/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl shadow-inner-dark p-8">
                <h3 className="text-2xl font-display font-bold mb-6 text-white">Installation Instructions</h3>

                {/* Phone Mockup */}
                <div className="relative mx-auto w-64 h-128 bg-navy-950 rounded-3xl p-3 shadow-gold-glow border border-gold-500/20 mb-8">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-5 bg-navy-950 rounded-b-xl"></div>
                  <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
                    <div className="h-16 bg-gold-gradient flex items-center px-4">
                      <img src={schoolLogo} alt="App Icon" className="w-8 h-8 rounded-lg bg-white/20 p-0.5" />
                      <span className="ml-2 text-navy-950 text-sm font-semibold truncate">{schoolName}</span>
                    </div>
                    <div className="p-4">
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-20 bg-gray-100 rounded mt-4"></div>
                        <div className="h-10 bg-gold-200 rounded flex items-center justify-center text-navy-800 text-xs font-semibold">
                          App Preview
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  {[
                    ['Download the APK', 'Click the download button above to get the app file'],
                    ['Open the downloaded file', 'Find the APK in your Downloads folder and tap to install'],
                    ['Allow installation from unknown sources', 'Tap "Settings" and enable "Install unknown apps"'],
                    ['Complete installation', 'Tap "Install" and wait for the process to finish'],
                    ['Open the app', 'Find the app icon on your home screen and tap to open'],
                  ].map(([title, desc], i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gold-500/15 border border-gold-500/40 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-gold-400 font-bold text-sm">{i + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{title}</h4>
                        <p className="text-sm text-sky-100/60">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Security Note */}
                <div className="mt-6 p-4 bg-sky-500/10 rounded-lg border border-sky-500/30">
                  <div className="flex items-start">
                    <FaInfoCircle className="text-sky-400 mr-2 mt-1 flex-shrink-0" />
                    <div>
                      <h5 className="font-medium text-sky-200 text-sm">Security Note</h5>
                      <p className="text-xs text-sky-100/70 mt-1">
                        This is a safe, official app from EduPriva. The "unknown sources" warning appears because you're installing outside the Play Store. This is normal for enterprise apps.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-8 text-center">
            <button onClick={() => navigate('/dashboard')}
              className="inline-flex items-center text-sky-200/70 hover:text-gold-400 transition">
              <FaArrowLeft className="mr-2" /> Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppDownload;
