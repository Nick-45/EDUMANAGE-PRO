import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';
import Navbar from '../components/layout/Navbar';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaCloudUploadAlt, FaCheck, FaArrowRight } from 'react-icons/fa';

const Setup = () => {
  const { user } = useAuth();
  const { school, updateSchool, uploadLogo } = useSchool();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: school?.name || '',
    motto: school?.motto || '',
    address: school?.address || '',
    phone: school?.phone || '',
    email: school?.email || '',
    website: school?.website || '',
    primaryColor: school?.branding?.primaryColor || '#4CAF50',
    secondaryColor: school?.branding?.secondaryColor || '#2E7D32',
    logo: null,
  });

  const [logoPreview, setLogoPreview] = useState(school?.branding?.logo || null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, logo: file });
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveSchool = async () => {
    setLoading(true);
    try {
      await updateSchool({
        name: formData.name,
        motto: formData.motto,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        branding: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
        },
      });

      if (formData.logo) {
        await uploadLogo(formData.logo);
      }

      toast.success('School information saved!');
      setStep(2);
    } catch (error) {
      toast.error(error.message || 'Failed to save school information');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    navigate('/dashboard');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      i < step
                        ? 'bg-primary-600 text-white'
                        : i === step
                        ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {i < step ? <FaCheck /> : i}
                  </div>
                  {i < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        i < step ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>School Info</span>
              <span>Branding</span>
              <span>Complete</span>
            </div>
          </div>

          {/* Step 1: School Information */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold mb-6">School Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School Motto
                  </label>
                  <input
                    type="text"
                    name="motto"
                    value={formData.motto}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={handleSaveSchool}
                  disabled={loading || !formData.name}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 flex items-center"
                >
                  {loading ? 'Saving...' : 'Next Step'}
                  {!loading && <FaArrowRight className="ml-2" />}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Branding */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold mb-6">Customize Your Branding</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    School Logo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {logoPreview ? (
                      <div className="mb-4">
                        <img
                          src={logoPreview}
                          alt="Logo Preview"
                          className="max-h-32 mx-auto"
                        />
                      </div>
                    ) : (
                      <FaCloudUploadAlt className="text-5xl text-gray-400 mx-auto mb-4" />
                    )}
                    <input
                      type="file"
                      id="logo"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <button
                      onClick={() => document.getElementById('logo').click()}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Choose Logo
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      Recommended: 200x200px PNG with transparency
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Brand Colors
                  </label>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Primary Color
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          name="primaryColor"
                          value={formData.primaryColor}
                          onChange={handleInputChange}
                          className="w-12 h-12 rounded border"
                        />
                        <input
                          type="text"
                          name="primaryColor"
                          value={formData.primaryColor}
                          onChange={handleInputChange}
                          className="flex-1 px-4 py-2 border rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Secondary Color
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          name="secondaryColor"
                          value={formData.secondaryColor}
                          onChange={handleInputChange}
                          className="w-12 h-12 rounded border"
                        />
                        <input
                          type="text"
                          name="secondaryColor"
                          value={formData.secondaryColor}
                          onChange={handleInputChange}
                          className="flex-1 px-4 py-2 border rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-3">Preview:</p>
                    <div className="space-y-2">
                      <button
                        className="px-4 py-2 rounded-lg text-white w-full"
                        style={{ backgroundColor: formData.primaryColor }}
                      >
                        Primary Button
                      </button>
                      <button
                        className="px-4 py-2 rounded-lg text-white w-full"
                        style={{ backgroundColor: formData.secondaryColor }}
                      >
                        Secondary Button
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8 space-x-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Complete */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg p-8 text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCheck className="text-3xl text-green-600" />
              </div>
              
              <h2 className="text-3xl font-bold mb-4">Setup Complete!</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Your school has been successfully configured. You can now access your dashboard and start managing your school.
              </p>

              <div className="bg-gray-50 rounded-lg p-6 mb-8 max-w-md mx-auto">
                <p className="text-sm text-gray-600 mb-2">Your School URL:</p>
                <p className="text-lg font-mono text-primary-600">
                  {school?.subdomain}.edumanagerpro.com
                </p>
                <button
                  onClick={() => navigator.clipboard.writeText(`${school?.subdomain}.edumanagerpro.com`)}
                  className="text-sm text-primary-600 hover:text-primary-700 mt-2"
                >
                  Copy URL
                </button>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleComplete}
                  className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => navigate('/app-download')}
                  className="px-8 py-3 border border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50"
                >
                  Download Mobile App
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default Setup;
