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
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (isAuthenticated && user?.schoolId) {
        await Promise.all([loadSchool(), loadSubscription()]);
      }
      setLoading(false);
    };
    init();
  }, [isAuthenticated, user]);

  const loadSchool = async () => {
    try {
      if (!user?.schoolId) return;
      const schoolData = await schoolService.getSchool(user.schoolId);
      setSchool(schoolData);
    } catch (error) {
      console.error('Failed to load school:', error);
    }
  };

  const loadSubscription = async () => {
    try {
      if (!user?.schoolId) return;
      const subData = await schoolService.getSubscription(user.schoolId);
      setSubscription(subData);
    } catch (error) {
      console.error('Failed to load subscription:', error);
    }
  };

  const updateSchool = async (data) => {
    try {
      if (!school?.id) throw new Error('No school loaded');
      const updated = await schoolService.updateSchool(school.id, data);
      setSchool(updated);
      toast.success('School updated successfully');
      return updated;
    } catch (error) {
      toast.error(error.message || 'Failed to update school');
      throw error;
    }
  };

  const uploadLogo = async ({ image }) => {
    try {
      if (!school?.id) throw new Error('No school loaded');
      const updated = await schoolService.uploadLogo(school.id, { image });
      setSchool(updated);
      toast.success('Logo uploaded successfully');
      return updated;
    } catch (error) {
      toast.error(error.message || 'Failed to upload logo');
      throw error;
    }
  };

  const subscribe = async (planId, paymentDetails) => {
    try {
      if (!school?.id) throw new Error('No school loaded');
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
      if (!school?.id) throw new Error('No school loaded');
      await schoolService.cancelSubscription(school.id);
      setSubscription(null);
      toast.success('Subscription cancelled');
    } catch (error) {
      toast.error(error.message || 'Failed to cancel subscription');
      throw error;
    }
  };

  return (
    <SchoolContext.Provider
      value={{
        school,
        subscription,
        loading,
        updateSchool,
        uploadLogo,
        subscribe,
        cancelSubscription,
        isActive: subscription?.status === 'active',
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};
