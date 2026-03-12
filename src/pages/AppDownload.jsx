import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';
import Navbar from '../components/layout/Navbar';
import { motion } from 'framer-motion';
import { 
  FaAndroid, FaApple, FaQrcode, FaDownload, 
  FaMobile, FaTablet, FaLaptop, FaCheckCircle,
  FaArrowLeft, FaCopy, FaShare, FaSpinner,
  FaClock, FaExclamationTriangle, FaInfoCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import QRCode from 'qrcode.react';

const AppDownload = () => {
  const { isAuthenticated } = useAuth();
  const { school } = useSchool();
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState('android');
  const [showQRCode, setShowQRCode] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleDirectDownload = () => {
    setDownloading(true);
    
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = '/EDUMANAGE Pro.apk';
    link.download = 'EDUMANAGE Pro.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    toast.success(
      <div>
        <p className="font-medium">Download Started!</p>
        <p className="text-sm">Your app is being downloaded.</p>
      </div>,
      { duration: 4000 }
    );
    
    setDownloading(false);
  };

  const copySubdomain = () => {
    navigator.clipboard.writeText(`${school?.subdomain}.edumanagerpro.com`);
    toast.success('URL copied to clipboard!');
  };

  const shareApp = () => {
    if (navigator.share) {
      navigator.share({
        title: `${school?.name} Mobile App`,
        text: `Download the official ${school?.name} mobile app`,
        url: `https://${school?.subdomain}.edumanagerpro.com/app`,
      }).catch(() => {
        copySubdomain();
      });
    } else {
      copySubdomain();
    }
  };

  const toggleQRCode = () => {
    setShowQRCode(!showQRCode);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-display font-bold mb-4">
              Your School's <span className="text-primary-600">Mobile App</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Download the branded mobile app for your school. Available for Android devices.
            </p>
          </motion.div>

          {/* School Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-xl p-8 text-white mb-8"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                {school?.logo ? (
                  <img 
                    src={school.logo} 
                    alt={school.name} 
                    className="w-16 h-16 rounded-xl bg-white/20 p-1"
                  />
                ) : (
                  <img 
                    src="/logo192.png" 
                    alt="EduManager Pro" 
                    className="w-16 h-16 rounded-xl bg-white/20 p-1"
                  />
                )}
                <div>
                  <h2 className="text-2xl font-bold mb-2">{school?.name}</h2>
                  <p className="opacity-90">Your school's branded mobile app</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-lg px-4 py-2">
                  <span className="text-sm opacity-90">Your URL:</span>
                  <div className="flex items-center mt-1">
                    <code className="bg-white/10 px-2 py-1 rounded">
                      {school?.subdomain}.edumanagerpro.com
                    </code>
                    <button
                      onClick={copySubdomain}
                      className="ml-2 p-1 hover:bg-white/20 rounded"
                      title="Copy URL"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
                <button
                  onClick={shareApp}
                  className="bg-white/20 p-3 rounded-lg hover:bg-white/30 transition"
                  title="Share App"
                >
                  <FaShare />
                </button>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Download Options */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold mb-6">Download App</h3>
                
                {/* App Info Card */}
                <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-6 mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <img 
                      src="/logo192.png" 
                      alt="App Icon" 
                      className="w-20 h-20 rounded-2xl shadow-lg"
                    />
                    <div>
                      <h4 className="text-xl font-bold">EDUMANAGE Pro</h4>
                      <p className="text-gray-600">Version 1.0.0</p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <FaAndroid className="mr-1 text-green-600" />
                        <span>Android App • ~25MB</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-white/60 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Size</p>
                      <p className="font-semibold">25 MB</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Updated</p>
                      <p className="font-semibold">Mar 2024</p>
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <button
                  onClick={handleDirectDownload}
                  disabled={downloading}
                  className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 flex items-center justify-center text-lg mb-4"
                >
                  {downloading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Preparing Download...
                    </>
                  ) : (
                    <>
                      <FaDownload className="mr-2" />
                      Download EDUMANAGE Pro.apk
                    </>
                  )}
                </button>

                {/* QR Code Toggle */}
                <button
                  onClick={toggleQRCode}
                  className="w-full py-3 border-2 border-primary-600 text-primary-600 rounded-xl font-semibold hover:bg-primary-50 flex items-center justify-center"
                >
                  <FaQrcode className="mr-2" />
                  {showQRCode ? 'Hide QR Code' : 'Show QR Code for Mobile'}
                </button>

                {/* QR Code Display */}
                {showQRCode && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-6 bg-gray-50 rounded-xl text-center"
                  >
                    <h4 className="font-semibold mb-3">Scan with your phone</h4>
                    <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-xl">
                      <QRCode
                        value={`${window.location.origin}/EDUMANAGE Pro.apk`}
                        size={200}
                        level="H"
                        includeMargin={true}
                        imageSettings={{
                          src: "/logo192.png",
                          height: 40,
                          width: 40,
                          excavate: true,
                        }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                      Scan this QR code with your phone to download directly
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Right Column - Instructions & Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold mb-6">Installation Instructions</h3>
                
                {/* Phone Mockup */}
                <div className="relative mx-auto w-64 h-128 bg-gray-900 rounded-3xl p-3 shadow-2xl mb-8">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-b-xl"></div>
                  <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
                    <div className="h-16 bg-gradient-to-r from-primary-600 to-primary-700 flex items-center px-4">
                      <img 
                        src="/logo192.png" 
                        alt="App Icon" 
                        className="w-8 h-8 rounded-lg"
                      />
                      <span className="ml-2 text-white text-sm font-medium truncate">
                        {school?.name || 'School Name'}
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-20 bg-gray-200 rounded mt-4"></div>
                        <div className="h-10 bg-primary-100 rounded flex items-center justify-center text-primary-600 text-xs">
                          App Preview
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Installation Steps */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Download the APK</h4>
                      <p className="text-sm text-gray-600">Click the download button above to get the app file</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Open the downloaded file</h4>
                      <p className="text-sm text-gray-600">Find the APK in your Downloads folder and tap to install</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Allow installation from unknown sources</h4>
                      <p className="text-sm text-gray-600">You may see a warning. Tap "Settings" and enable "Install unknown apps"</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 font-bold">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Complete installation</h4>
                      <p className="text-sm text-gray-600">Tap "Install" and wait for the process to finish</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 font-bold">5</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Open the app</h4>
                      <p className="text-sm text-gray-600">Find the app icon on your home screen and tap to open</p>
                    </div>
                  </div>
                </div>

                {/* Security Note */}
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start">
                    <FaInfoCircle className="text-yellow-600 mr-2 mt-1 flex-shrink-0" />
                    <div>
                      <h5 className="font-medium text-yellow-800 text-sm">Security Note</h5>
                      <p className="text-xs text-yellow-700 mt-1">
                        This is a safe, official app from EduManager Pro. The "unknown sources" warning appears because you're installing outside the Play Store. This is normal for enterprise apps.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Back to Dashboard */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center text-gray-600 hover:text-primary-600"
            >
              <FaArrowLeft className="mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppDownload;
