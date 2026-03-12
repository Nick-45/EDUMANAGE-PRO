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
  FaClock, FaExclamationTriangle
} from 'react-icons/fa';
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
  const [existingBuildId, setExistingBuildId] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Check for existing builds on component mount
  useEffect(() => {
    if (school?.id) {
      checkExistingBuilds();
    }
  }, [school]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const checkExistingBuilds = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/.netlify/functions/apps/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const activeBuild = data.builds?.find(
          build => ['pending', 'building'].includes(build.status)
        );
        
        if (activeBuild) {
          setBuildStatus(activeBuild.status);
          setBuildId(activeBuild.id);
          setExistingBuildId(activeBuild.id);
          // Start polling for this existing build
          pollBuildStatus(activeBuild.id);
          
          toast.success(
            `Found an existing ${activeBuild.platform} build in progress`,
            { duration: 4000 }
          );
        }
      }
    } catch (error) {
      console.error('Error checking existing builds:', error);
    }
  };

  const handleGenerateApp = async (platform) => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/.netlify/functions/apps/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          schoolId: school.id,
          platform: platform
        })
      });

      const data = await response.json();

      // Handle 409 Conflict - Build already in progress
      if (response.status === 409) {
       toast.success(
  <div>
    <p className="font-medium">Build Already in Progress</p>
    <p className="text-sm">A {platform} build is already being generated.</p>
  </div>,
  { 
    icon: '⏳',
    duration: 5000 
  }
         );
        
        setBuildStatus(data.status || 'building');
        setBuildId(data.buildId);
        setExistingBuildId(data.buildId);
        pollBuildStatus(data.buildId);
        setDownloading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start build');
      }

      // Success - build started
      toast.success('App generation started. This may take a few minutes.');
      setBuildId(data.buildId);
      setBuildStatus('pending');
      setExistingBuildId(data.buildId);
      
      // Start polling for status
      pollBuildStatus(data.buildId);

    } catch (error) {
      console.error('Error generating app:', error);
      toast.error(error.message || 'Failed to generate app');
      setBuildStatus(null);
      setBuildId(null);
    } finally {
      setDownloading(false);
    }
  };

  const pollBuildStatus = (id) => {
    // Clear any existing interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/.netlify/functions/apps/status/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch status');
        }

        const status = await response.json();
        
        if (status.status === 'completed') {
          setBuildStatus('completed');
          setBuildId(id);
          clearInterval(interval);
          setPollingInterval(null);
          toast.success('Your app is ready for download!');
        } else if (status.status === 'failed') {
          setBuildStatus('failed');
          clearInterval(interval);
          setPollingInterval(null);
          toast.error(status.error || 'App generation failed. Please try again.');
        } else {
          setBuildStatus(status.status);
        }
      } catch (error) {
        console.error('Error polling build status:', error);
      }
    }, 5000);

    setPollingInterval(interval);
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/.netlify/functions/apps/download/${buildId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }

      const data = await response.json();
      
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
        toast.success('Download started!');
      } else {
        throw new Error('No download URL available');
      }
    } catch (error) {
      console.error('Error downloading app:', error);
      toast.error(error.message || 'Failed to download app');
    } finally {
      setDownloading(false);
    }
  };

  const handleRetry = () => {
    setBuildStatus(null);
    setBuildId(null);
    setExistingBuildId(null);
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

  const getStatusBadge = () => {
    if (!buildStatus) return null;

    const statusConfig = {
      'pending': {
        icon: <FaClock className="animate-pulse" />,
        text: 'Pending',
        className: 'bg-yellow-100 text-yellow-800'
      },
      'building': {
        icon: <FaSpinner className="animate-spin" />,
        text: 'Building',
        className: 'bg-blue-100 text-blue-800'
      },
      'completed': {
        icon: <FaCheckCircle />,
        text: 'Ready',
        className: 'bg-green-100 text-green-800'
      },
      'failed': {
        icon: <FaExclamationTriangle />,
        text: 'Failed',
        className: 'bg-red-100 text-red-800'
      }
    };

    const config = statusConfig[buildStatus] || statusConfig['pending'];
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
        <span className="mr-2">{config.icon}</span>
        {config.text}
      </span>
    );
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
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">Choose Platform</h3>
                  {buildStatus && getStatusBadge()}
                </div>
                
                <div className="space-y-4 mb-8">
                  <button
                    onClick={() => setSelectedPlatform('android')}
                    disabled={buildStatus === 'building' || buildStatus === 'pending'}
                    className={`w-full p-6 rounded-xl border-2 transition-all ${
                      selectedPlatform === 'android'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    } ${buildStatus === 'building' || buildStatus === 'pending' ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    disabled={buildStatus === 'building' || buildStatus === 'pending'}
                    className={`w-full p-6 rounded-xl border-2 transition-all ${
                      selectedPlatform === 'ios'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    } ${buildStatus === 'building' || buildStatus === 'pending' ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                        <FaSpinner className="animate-spin mr-2" />
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

                {buildStatus === 'pending' && (
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <FaClock className="text-yellow-600 mr-3 animate-pulse" />
                      <div>
                        <p className="font-medium text-yellow-800">Build pending...</p>
                        <p className="text-sm text-yellow-600">Your build request is queued and will start soon</p>
                      </div>
                    </div>
                  </div>
                )}

                {buildStatus === 'building' && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <FaSpinner className="text-blue-600 mr-3 animate-spin" />
                      <div>
                        <p className="font-medium text-blue-800">Building your app...</p>
                        <p className="text-sm text-blue-600">This may take a few minutes. We'll notify you when it's ready.</p>
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
                        disabled={downloading}
                        className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center disabled:opacity-50"
                      >
                        {downloading ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <FaDownload className="mr-2" />
                            Download {selectedPlatform === 'android' ? 'APK' : 'IPA'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {buildStatus === 'failed' && (
                  <div className="mt-6 p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center text-red-800 mb-2">
                      <FaExclamationTriangle className="mr-2" />
                      <span className="font-medium">App generation failed</span>
                    </div>
                    <p className="text-sm text-red-600 mb-3">Please try again or contact support</p>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleRetry}
                        className="flex-1 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleGenerateApp(selectedPlatform)}
                        className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                )}

                {/* Show existing build info */}
                {existingBuildId && buildStatus !== 'completed' && buildStatus !== 'failed' && (
                  <div className="mt-4 text-sm text-gray-500 text-center">
                    Build ID: {existingBuildId.slice(0, 8)}...
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
                {buildStatus === 'completed' && (
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
                )}

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
