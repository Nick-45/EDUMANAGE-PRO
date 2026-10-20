import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';
import Navbar from '../components/layout/Navbar';
import { motion } from 'framer-motion';
import { FaUsers, FaChalkboardTeacher, FaBook, FaChartLine, FaCheckCircle, FaClock, FaTimesCircle, FaDownload } from 'react-icons/fa';

const STATUS_FLOW = [
  { key: 'pending',     label: 'Application Received' },
  { key: 'in_review',   label: 'Under Review' },
  { key: 'app_building',label: 'Building Your App' },
  { key: 'app_ready',   label: 'App Ready — Awaiting Subdomain' },
  { key: 'active',      label: 'Active' },
];

const STATUS_ORDER = { pending: 0, in_review: 1, app_building: 2, app_ready: 3, active: 4, rejected: -1 };

const Dashboard = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { school, subscription, loading: schoolLoading } = useSchool();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/');
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading || schoolLoading) {
    return (
      <div className="min-h-screen bg-navy-gradient flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const status = school?.status || 'pending';
  const isRejected = status === 'rejected';
  const isActive = status === 'active';

  const stats = [
    { label: 'Students Range', value: school?.schoolSize || '—', icon: FaUsers, accent: 'from-sky-500 to-sky-400' },
    { label: 'Teachers Range', value: school?.teacherRange || '—', icon: FaChalkboardTeacher, accent: 'from-gold-500 to-gold-400' },
    { label: 'Classes', value: school?.academic?.classes?.length || '—', icon: FaBook, accent: 'from-sky-400 to-sky-300' },
    { label: 'Streams per Class', value: school?.academic?.streamNames?.length || '—', icon: FaChartLine, accent: 'from-gold-400 to-gold-300' },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-navy-gradient pt-20 pb-12">
        <div className="container mx-auto px-4 py-8">

          {/* Welcome */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-display font-bold text-white mb-2">
              Welcome back, {school?.identity?.name || school?.schoolName || 'School Admin'}!
            </h1>
            <p className="text-sky-100/70">
              {isActive ? "Here's what's happening with your school today." : 'Track your application progress below.'}
            </p>
          </motion.div>

          {/* Application Progress */}
          {!isActive && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="mb-8 p-6 bg-navy-900/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl shadow-inner-dark">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">Account Setup Progress</h2>
                  <p className="text-sm text-sky-100/60">Your school account is being prepared.</p>
                </div>
                {isRejected ? (
                  <div className="flex items-center text-rose-400 font-semibold">
                    <FaTimesCircle className="mr-2" /> Application Rejected
                  </div>
                ) : (
                  <div className="flex items-center text-gold-400 font-semibold">
                    <FaClock className="mr-2" /> {STATUS_FLOW.find(s => s.key === status)?.label || 'Processing'}
                  </div>
                )}
              </div>

              {!isRejected && (
                <div className="flex items-center">
                  {STATUS_FLOW.map((s, i) => {
                    const reached = STATUS_ORDER[status] >= STATUS_ORDER[s.key];
                    return (
                      <React.Fragment key={s.key}>
                        <div className="flex flex-col items-center min-w-[90px]">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition ${
                            reached ? 'bg-gold-gradient border-gold-500 text-navy-950 shadow-gold-glow' : 'bg-navy-800 border-sky-500/30 text-sky-400/50'
                          }`}>
                            {reached ? <FaCheckCircle /> : i + 1}
                          </div>
                          <span className={`text-xs mt-2 text-center ${reached ? 'text-gold-400' : 'text-sky-100/40'}`}>{s.label}</span>
                        </div>
                        {i < STATUS_FLOW.length - 1 && (
                          <div className={`flex-1 h-1 mx-2 rounded ${STATUS_ORDER[status] > STATUS_ORDER[s.key] ? 'bg-gold-500' : 'bg-navy-700'}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}

              {isRejected && school?.rejectionReason && (
                <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-sm text-rose-300">
                  <strong>Reason:</strong> {school.rejectionReason}
                </div>
              )}
            </motion.div>
          )}

          {/* Subscription Status (only when active) */}
          {isActive && subscription && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="mb-8 p-6 bg-gold-gradient text-navy-950 rounded-2xl shadow-gold-glow">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm opacity-80">Current Plan</p>
                  <p className="text-xl font-bold capitalize">{subscription.plan} Plan</p>
                </div>
                <div>
                  <p className="text-sm opacity-80">Status</p>
                  <p className="text-xl font-bold">{subscription.status === 'active' ? 'Active' : 'Inactive'}</p>
                </div>
                <div>
                  <p className="text-sm opacity-80">Next Billing</p>
                  <p className="text-xl font-bold">
                    {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats — using RANGES not totals */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                className="bg-navy-900/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 shadow-inner-dark">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.accent} flex items-center justify-center text-navy-950 text-xl shadow-lg`}>
                    <stat.icon />
                  </div>
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                </div>
                <p className="text-sky-100/70 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* School Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-navy-900/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 mb-8 shadow-inner-dark">
            <h2 className="text-xl font-display font-bold text-white mb-4">School Information</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div><p className="text-sky-100/60 mb-1">School Name</p><p className="font-semibold text-white">{school?.identity?.name || '—'}</p></div>
              <div><p className="text-sky-100/60 mb-1">Subdomain</p>
                <p className="font-semibold text-gold-400">
                  {school?.subdomain ? `${school.subdomain}.edupriva.top` : 'Pending assignment'}
                </p>
              </div>
              <div><p className="text-sky-100/60 mb-1">Admin Email</p><p className="font-semibold text-white">{school?.email || '—'}</p></div>
              <div><p className="text-sky-100/60 mb-1">Phone</p><p className="font-semibold text-white">{school?.phone || '—'}</p></div>
              <div><p className="text-sky-100/60 mb-1">Motto</p><p className="font-semibold text-white">{school?.identity?.motto || '—'}</p></div>
              <div><p className="text-sky-100/60 mb-1">P.O. Box</p><p className="font-semibold text-white">{school?.identity?.pobox || '—'}</p></div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="grid md:grid-cols-3 gap-6">
            <button onClick={() => navigate('/setup')}
              className="p-6 bg-navy-900/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl hover:border-gold-500/50 hover:shadow-gold-glow transition text-left shadow-inner-dark">
              <h3 className="font-semibold text-white mb-2">Update School Info</h3>
              <p className="text-sm text-sky-100/60">Edit branding, motto, and academic structure</p>
            </button>

            <button
              onClick={() => navigate('/app-download')}
              disabled={!school?.app?.apkFile}
              className={`p-6 rounded-2xl transition text-left border shadow-inner-dark ${
                school?.app?.apkFile
                  ? 'bg-navy-900/80 backdrop-blur-xl border-sky-500/20 hover:border-gold-500/50 hover:shadow-gold-glow'
                  : 'bg-navy-900/40 border-sky-500/10 opacity-60 cursor-not-allowed'
              }`}>
              <h3 className="font-semibold text-white mb-2 flex items-center">
                {school?.app?.apkFile ? <FaDownload className="mr-2 text-gold-400" /> : <FaClock className="mr-2 text-sky-400/50" />}
                Download Mobile App
              </h3>
              <p className="text-sm text-sky-100/60">
                {school?.app?.apkFile ? 'Your branded app is ready' : 'App will be available after approval'}
              </p>
            </button>

            <button onClick={() => navigate('/settings')}
              className="p-6 bg-navy-900/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl hover:border-gold-500/50 hover:shadow-gold-glow transition text-left shadow-inner-dark">
              <h3 className="font-semibold text-white mb-2">Manage Subscription</h3>
              <p className="text-sm text-sky-100/60">Update plan or billing info</p>
            </button>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
