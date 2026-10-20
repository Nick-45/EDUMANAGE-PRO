import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminGuard = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-navy-950" />;
  if (!isAuthenticated || user?.role !== 'super_admin') return <Navigate to="/login" replace />;
  return children;
};

export default AdminGuard;
