import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';
import Navbar from '../components/layout/Navbar';
import { motion } from 'framer-motion';
import { 
  FaAndroid, FaApple, FaQrcode, FaDownload, 
  FaMobile, FaTablet, FaLaptop, FaCheckCircle,
  FaArrowLeft, FaCopy, FaShare
} from 'react-icons/fa';
import { appService } from '../services/api';
import toast from 'react-hot-toast';
import QRCode from 'qrcode.react';

const AppDownload = () => {
  const { isAuthenticated } = useAuth();
  const { school } = useSchool();
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState('android');
  const [buildStatus, setBuildStatus] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [buildId, setBuildId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleGenerateApp = async (platform) => {
    setDownloading(true);
    try {
      const response = await appService.generateApp(school.id, platform);
      setBuildId(response.buildId);
      setBuildStatus('generating');
      toast.success('App generation started. This may take a few minutes.');
      
      // Poll for status
      pollBuildStatus(response.buildId);
    } catch (error) {
      toast.error(error.message || 'Failed to generate app');
      setDownloading(false);
    }
  };

  const pollBuildStatus = async (id) => {
    const interval = setInterval(async () => {
      try {
        const status = await appService.getAppStatus(id);
        if (status.status === 'completed') {
          setBuildStatus('completed');
          setBuildId(id);
          clearInterval(interval);
          setDownloading(false);
          toast.success('App is ready for download!');
        } else if (status.status === 'failed') {
          setBuildStatus('failed');
          clearInterval(interval);
          setDownloading(false);
          toast.error('App generation failed. Please try again.');
        }
      } catch (error) {
        console.error('Error polling build status:', error);
      }
    }, 5000);
  };

  const handleDownload = async () => {
    try {
      const blob = await appService.downloadApp(buildId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${school?.subdomain}-${selectedPlatform}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download started!');
    } catch (error) {
      toast.error('Failed to download app');
    }
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
      });
    } else {
      copySubdomain();
    }
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
              Download a branded mobile app for your school. Available for Android and iOS.
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
              <div>
                <h2 className="text-2xl font-bold mb-2">{school?.name}</h2>
                <p className="opacity-90">Your school's branded mobile app</p>
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
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
                <button
                  onClick={shareApp}
                  className="bg-white/20 p-3 rounded-lg hover:bg-white/30 transition"
                >
                  <FaShare />
                </button>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Platform Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold mb-6">Choose Platform</h3>
                
                <div className="space-y-4 mb-8">
                  <button
                    onClick={() => setSelectedPlatform('android')}
                    className={`w-full p-6 rounded-xl border-2 transition-all ${
                      selectedPlatform === 'android'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-xl ${
                        selectedPlatform === 'android' ? 'bg-primary-600' : 'bg-gray-200'
                      } flex items-center justify-center mr-4`}>
                        <FaAndroid className={`text-2xl ${
                          selectedPlatform === 'android' ? 'text-white' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-semibold text-lg">Android App</h4>
                        <p className="text-gray-600">APK file for Android devices</p>
                      </div>
                      {selectedPlatform === 'android' && (
                        <FaCheckCircle className="text-primary-600 text-2xl" />
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedPlatform('ios')}
                    className={`w-full p-6 rounded-xl border-2 transition-all ${
                      selectedPlatform === 'ios'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-xl ${
                        selectedPlatform === 'ios' ? 'bg-primary-600' : 'bg-gray-200'
                      } flex items-center justify-center mr-4`}>
                        <FaApple className={`text-2xl ${
                          selectedPlatform === 'ios' ? 'text-white' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-semibold text-lg">iOS App</h4>
                        <p className="text-gray-600">IPA file for iOS devices</p>
                      </div>
                      {selectedPlatform === 'ios' && (
                        <FaCheckCircle className="text-primary-600 text-2xl" />
                      )}
                    </div>
                  </button>
                </div>

                {!buildStatus && (
                  <button
                    onClick={() => handleGenerateApp(selectedPlatform)}
                    disabled={downloading}
                    className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 flex items-center justify-center"
                  >
                    {downloading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Generating App...
                      </>
                    ) : (
                      <>
                        <FaDownload className="mr-2" />
                        Generate {selectedPlatform === 'android' ? 'Android' : 'iOS'} App
                      </>
                    )}
                  </button>
                )}

                {buildStatus === 'generating' && (
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                      <div>
                        <p className="font-medium text-yellow-800">Building your app...</p>
                        <p className="text-sm text-yellow-600">This may take a few minutes</p>
                      </div>
                    </div>
                  </div>
                )}

                {buildStatus === 'completed' && (
                  <div className="mt-6 space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center text-green-800 mb-3">
                        <FaCheckCircle className="mr-2" />
                        <span className="font-medium">App is ready!</span>
                      </div>
                      <button
                        onClick={handleDownload}
                        className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center"
                      >
                        <FaDownload className="mr-2" />
                        Download {selectedPlatform === 'android' ? 'APK' : 'IPA'}
                      </button>
                    </div>
                  </div>
                )}

                {buildStatus === 'failed' && (
                  <div className="mt-6 p-4 bg-red-50 rounded-lg">
                    <p className="text-red-800 font-medium">App generation failed</p>
                    <p className="text-sm text-red-600 mt-1">Please try again or contact support</p>
                    <button
                      onClick={() => handleGenerateApp(selectedPlatform)}
                      className="mt-3 w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right Column - Preview & QR Code */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold mb-6">App Preview</h3>
                
                {/* Phone Mockup */}
                <div className="relative mx-auto w-64 h-128 bg-gray-900 rounded-3xl p-3 shadow-2xl mb-8">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-b-xl"></div>
                  <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
                    <div className="h-16 bg-gradient-to-r from-primary-600 to-primary-700 flex items-center px-4">
                      {school?.logo ? (
                        <img src={school.logo} alt="" className="w-8 h-8 rounded-lg" />
                      ) : (
                        <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
                      )}
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
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="text-center">
                  <h4 className="font-semibold mb-3">Scan to Download</h4>
                  <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-xl">
                    <QRCode
                      value={`https://${school?.subdomain}.edumanagerpro.com/download/${selectedPlatform}`}
                      size={150}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    Scan with your phone to download the app directly
                  </p>
                </div>

                {/* Instructions */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Installation Instructions:</h4>
                  <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                    <li>Download the app file using the button above</li>
                    <li>Transfer the file to your mobile device</li>
                    <li>Open the file and allow installation from unknown sources</li>
                    <li>Open the app and log in with your credentials</li>
                  </ol>
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
