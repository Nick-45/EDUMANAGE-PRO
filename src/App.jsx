import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { FirebaseProvider } from './context/FirebaseContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Setup from './pages/Setup';
import Payment from './pages/Payment';
import AppDownload from './pages/AppDownload';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Settings from './pages/Settings';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

// Admin
import AdminGuard from './pages/admin/AdminGuard';
import AdminDashboard from './pages/admin/AdminDashboard';
import SchoolDetail from './pages/admin/SchoolDetail';
import AdminUsers from './pages/admin/AdminUsers';
import LegalEditor from './pages/admin/LegalEditor';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-gradient flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <FirebaseProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />

        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/setup" element={<PrivateRoute><Setup /></PrivateRoute>} />
        <Route path="/payment" element={<PrivateRoute><Payment /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/app-download" element={<PrivateRoute><AppDownload /></PrivateRoute>} />

        {/* Super Admin */}
        <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
        <Route path="/admin/schools/:id" element={<AdminGuard><SchoolDetail /></AdminGuard>} />
        <Route path="/admin/users" element={<AdminGuard><AdminUsers /></AdminGuard>} />
        <Route path="/admin/legal" element={<AdminGuard><LegalEditor /></AdminGuard>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </FirebaseProvider>
  );
}

export default App;
