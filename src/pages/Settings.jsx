import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';
import Navbar from '../components/layout/Navbar';
import { motion } from 'framer-motion';
import { 
  FaCog, 
  FaCreditCard, 
  FaPalette, 
  FaUsers, 
  FaBell, 
  FaShieldAlt,
  FaCheck,
  FaTimes,
  FaEdit,
  FaSave,
  FaUpload
} from 'react-icons/fa';

const Settings = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { school, subscription, updateSchool, loading: schoolLoading } = useSchool();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    adminEmail: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    website: '',
    logo: null,
    primaryColor: '#4f46e5',
    secondaryColor: '#10b981'
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (school) {
      setFormData({
        name: school.name || '',
        adminEmail: school.adminEmail || '',
        phone: school.phone || '',
        address: school.address || '',
        city: school.city || '',
        state: school.state || '',
        zipCode: school.zipCode || '',
        country: school.country || '',
        website: school.website || '',
        logo: school.logo || null,
        primaryColor: school.primaryColor || '#4f46e5',
        secondaryColor: school.secondaryColor || '#10b981'
      });
    }
  }, [school]);

  if (authLoading || schoolLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you'd upload to server and get URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logo: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      await updateSchool(formData);
      setSaveStatus('success');
      setIsEditing(false);
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: FaCog },
    { id: 'branding', label: 'Branding', icon: FaPalette },
    { id: 'subscription', label: 'Subscription', icon: FaCreditCard },
    { id: 'users', label: 'Users & Roles', icon: FaUsers },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'security', label: 'Security', icon: FaShieldAlt },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">Settings</h1>
              <p className="text-gray-600">
                Manage your school settings and preferences
              </p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center"
              >
                <FaEdit className="mr-2" /> Edit Settings
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                {saveStatus === 'saving' && (
                  <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                )}
                {saveStatus === 'success' && (
                  <div className="flex items-center text-green-600">
                    <FaCheck className="mr-1" /> Saved!
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div className="flex items-center text-red-600">
                    <FaTimes className="mr-1" /> Error saving
                  </div>
                )}
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center"
                >
                  <FaSave className="mr-2" /> Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form data
                    setFormData({
                      name: school.name || '',
                      adminEmail: school.adminEmail || '',
                      phone: school.phone || '',
                      address: school.address || '',
                      city: school.city || '',
                      state: school.state || '',
                      zipCode: school.zipCode || '',
                      country: school.country || '',
                      website: school.website || '',
                      logo: school.logo || null,
                      primaryColor: school.primaryColor || '#4f46e5',
                      secondaryColor: school.secondaryColor || '#10b981'
                    });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </motion.div>

          {/* Settings Layout */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="md:w-64 space-y-1"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <tab.icon className="mr-3" />
                  {tab.label}
                </button>
              ))}
            </motion.div>

            {/* Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 bg-white rounded-lg shadow-lg p-6"
            >
              {/* General Settings */}
              {activeTab === 'general' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">General Settings</h2>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          School Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Admin Email
                        </label>
                        <input
                          type="email"
                          name="adminEmail"
                          value={formData.adminEmail}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website
                        </label>
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:bg-gray-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:bg-gray-100"
                      />
                    </div>

                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Branding Settings */}
              {activeTab === 'branding' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Branding Settings</h2>
                  <div className="space-y-8">
                    {/* Logo Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        School Logo
                      </label>
                      <div className="flex items-center space-x-6">
                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {formData.logo ? (
                            <img src={formData.logo} alt="School logo" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-gray-400 text-4xl">🏫</span>
                          )}
                        </div>
                        {isEditing && (
                          <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition cursor-pointer">
                            <FaUpload className="inline mr-2" />
                            Upload Logo
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Colors */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Primary Color
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            name="primaryColor"
                            value={formData.primaryColor}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-12 h-12 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            name="primaryColor"
                            value={formData.primaryColor}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:bg-gray-100"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Secondary Color
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            name="secondaryColor"
                            value={formData.secondaryColor}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-12 h-12 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            name="secondaryColor"
                            value={formData.secondaryColor}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:bg-gray-100"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="p-6 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold mb-4">Preview</h3>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" 
                             style={{ backgroundColor: formData.primaryColor }}>
                          <FaPalette />
                        </div>
                        <button className="px-4 py-2 text-white rounded-lg"
                                style={{ backgroundColor: formData.primaryColor }}>
                          Primary Button
                        </button>
                        <button className="px-4 py-2 text-white rounded-lg"
                                style={{ backgroundColor: formData.secondaryColor }}>
                          Secondary Button
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Subscription Settings */}
              {activeTab === 'subscription' && subscription && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Subscription Details</h2>
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm opacity-90">Current Plan</p>
                          <p className="text-2xl font-bold capitalize">{subscription.plan}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm opacity-90">Status</p>
                          <p className={`text-xl font-semibold ${
                            subscription.status === 'active' ? 'text-green-300' : 'text-red-300'
                          }`}>
                            {subscription.status === 'active' ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm opacity-90">Start Date</p>
                          <p className="font-semibold">
                            {new Date(subscription.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm opacity-90">End Date</p>
                          <p className="font-semibold">
                            {new Date(subscription.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-semibold mb-4">Plan Features</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center text-green-600">
                          <FaCheck className="mr-2" /> Up to 500 students
                        </li>
                        <li className="flex items-center text-green-600">
                          <FaCheck className="mr-2" /> 50 teachers
                        </li>
                        <li className="flex items-center text-green-600">
                          <FaCheck className="mr-2" /> Mobile app access
                        </li>
                        <li className="flex items-center text-green-600">
                          <FaCheck className="mr-2" /> Custom branding
                        </li>
                        <li className="flex items-center text-green-600">
                          <FaCheck className="mr-2" /> 24/7 support
                        </li>
                      </ul>
                    </div>

                    <button
                      onClick={() => navigate('/billing')}
                      className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                    >
                      Manage Subscription
                    </button>
                  </div>
                </div>
              )}

              {/* Users & Roles */}
              {activeTab === 'users' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Users & Roles</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Administrators</h3>
                      <button className="px-3 py-1 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
                        Add Admin
                      </button>
                    </div>
                    
                    <div className="border rounded-lg divide-y">
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                            JD
                          </div>
                          <div>
                            <p className="font-medium">John Doe</p>
                            <p className="text-sm text-gray-600">john@example.com</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">
                          Super Admin
                        </span>
                      </div>
                      
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                            JS
                          </div>
                          <div>
                            <p className="font-medium">Jane Smith</p>
                            <p className="text-sm text-gray-600">jane@example.com</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                          Admin
                        </span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="font-semibold mb-3">Role Permissions</h3>
                      <div className="border rounded-lg p-4">
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" defaultChecked disabled />
                            <span>Manage users</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" defaultChecked disabled />
                            <span>Manage classes</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" defaultChecked disabled />
                            <span>View reports</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" defaultChecked disabled />
                            <span>Manage billing</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Notification Settings</h2>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">Email Notifications</h3>
                          <p className="text-sm text-gray-600">Receive updates via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked disabled={!isEditing} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                      <div className="space-y-2 ml-4">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" defaultChecked disabled={!isEditing} />
                          <span>New student registrations</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" defaultChecked disabled={!isEditing} />
                          <span>Attendance reports</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" defaultChecked disabled={!isEditing} />
                          <span>Payment confirmations</span>
                        </label>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">Push Notifications</h3>
                          <p className="text-sm text-gray-600">Mobile app notifications</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked disabled={!isEditing} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Security Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Enable 2FA</p>
                          <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" disabled={!isEditing} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Session Management</h3>
                      <div className="border rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-3">Active sessions: 1</p>
                        <button className="text-red-600 hover:text-red-700 text-sm">
                          Log out all devices
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Change Password</h3>
                      <div className="space-y-3">
                        <input
                          type="password"
                          placeholder="Current password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                          disabled={!isEditing}
                        />
                        <input
                          type="password"
                          placeholder="New password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                          disabled={!isEditing}
                        />
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                          disabled={!isEditing}
                        />
                        <button
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                          disabled={!isEditing}
                        >
                          Update Password
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
