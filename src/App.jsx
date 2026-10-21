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

  useEffect(() => {
    if (isAuthenticated && user) {
      loadSchool();
    } else {
      setSchool(null);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.schoolId]);

  const loadSchool = async () => {
    try {
      const schoolData = await schoolService.getMySchool();
      setSchool(schoolData);
    } catch (error) {
      // A 401 is already handled by the axios interceptor (redirects to /).
      // For 404s during onboarding the school may simply not exist yet — keep null.
      if (error?.status !== 404) {
        console.error('Failed to load school:', error);
      }
      setSchool(null);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => loadSchool();

  // Submit or update the full school application (Setup step 2)
  const updateSchool = async (data) => {
    try {
      await schoolService.submitApplication(data);
      await loadSchool();
      toast.success('School information saved');
      return school;
    } catch (error) {
      toast.error(error.message || 'Failed to save school');
      throw error;
    }
  };

  // Alias used by the new Setup page
  const submitApplication = updateSchool;

  // -----------------------
  // UPLOAD LOGO (Base64 → Cloudinary)
  // -----------------------
  const uploadLogo = async (file) => {
    if (!file) throw new Error('No file provided');

    const base64Image = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

    try {
      const result = await schoolService.uploadLogo(base64Image);
      await loadSchool();
      toast.success('Logo uploaded successfully');
      return result;
    } catch (error) {
      toast.error(error.message || 'Failed to upload logo');
      throw error;
    }
  };

  // Subscription helpers (read-only for now; wiring lives in Settings/Payment)
  const subscribe = async (planId, paymentDetails) => {
    try {
      const result = await schoolService.subscribe(planId, paymentDetails);
      await loadSchool();
      toast.success('Subscription activated successfully');
      return result;
    } catch (error) {
      toast.error(error.message || 'Failed to activate subscription');
      throw error;
    }
  };

  const cancelSubscription = async () => {
    try {
      await schoolService.cancelSubscription();
      await loadSchool();
      toast.success('Subscription cancelled');
    } catch (error) {
      toast.error(error.message || 'Failed to cancel subscription');
      throw error;
    }
  };

  // Derived values used across the app
  const subscription = school?.subscription || null;
  const status = school?.status || null;
  const isActive = status === 'active';
  const isPending = ['pending', 'in_review', 'app_building', 'app_ready'].includes(status);
  const isRejected = status === 'rejected';
  const hasApp = !!school?.app?.apkFile;

  const value = {
    school,
    subscription,
    loading,
    refresh,
    updateSchool,
    submitApplication,
    uploadLogo,
    subscribe,
    cancelSubscription,
    // status convenience flags
    status,
    isActive,
    isPending,
    isRejected,
    hasApp,
  };

  return <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>;
};
