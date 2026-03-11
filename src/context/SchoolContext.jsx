import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { schoolService } from '../services/api';
import toast from 'react-hot-toast';

const SchoolContext = createContext();

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within SchoolProvider');
  }
  return context;
};

export const SchoolProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user?.schoolId) {
      loadSchool();
      loadSubscription();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadSchool = async () => {
    try {
      const schoolData = await schoolService.getSchool(user.schoolId);
      setSchool(schoolData);
    } catch (error) {
      console.error('Failed to load school:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscription = async () => {
    try {
      const subData = await schoolService.getSubscription(user.schoolId);
      setSubscription(subData);
    } catch (error) {
      console.error('Failed to load subscription:', error);
    }
  };

  const updateSchool = async (data) => {
    try {
      const updated = await schoolService.updateSchool(school.id, data);
      setSchool(updated);
      toast.success('School updated successfully');
      return updated;
    } catch (error) {
      toast.error(error.message || 'Failed to update school');
      throw error;
    }
  };

  // -----------------------
  // UPLOAD LOGO (Base64)
  // -----------------------
  const uploadLogo = async (file) => {
  if (!file) throw new Error("No file provided");

  // Convert File to Base64
  const base64Image = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file); // File object required
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

  // Send base64 image to backend
  const updated = await schoolService.uploadLogo(school.id, { image: base64Image });
  setSchool(updated);
  toast.success('Logo uploaded successfully');
  return updated;
};

  const subscribe = async (planId, paymentDetails) => {
    try {
      const result = await schoolService.subscribe(school.id, planId, paymentDetails);
      setSubscription(result.subscription);
      toast.success('Subscription activated successfully');
      return result;
    } catch (error) {
      toast.error(error.message || 'Failed to activate subscription');
      throw error;
    }
  };

  const cancelSubscription = async () => {
    try {
      await schoolService.cancelSubscription(school.id);
      setSubscription(null);
      toast.success('Subscription cancelled');
    } catch (error) {
      toast.error(error.message || 'Failed to cancel subscription');
      throw error;
    }
  };

  const value = {
    school,
    subscription,
    loading,
    updateSchool,
    uploadLogo,
    subscribe,
    cancelSubscription,
    isActive: subscription?.status === 'active',
  };

  return <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>;
};
