import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSchool, FaSearch, FaSync } from 'react-icons/fa';
import { adminService } from '../../services/api';

const STATUS_LABEL = {
  pending: 'Pending',
  in_review: 'In Review',
  app_building: 'Building App',
  app_ready: 'App Ready',
  approved: 'Approved',
  active: 'Active',
  rejected: 'Rejected',
};

const FILTERS = ['pending', 'in_review', 'app_building', 'app_ready', 'active', 'rejected', 'all'];

const AdminDashboard = () => {
  const [schools, setSchools] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (currentFilter) => {
    setLoading(true);
    setError('');
    try {
      const result = await adminService.listSchools(
        currentFilter === 'all' ? undefined : currentFilter
      );
      setSchools(Array.isArray(result) ? result : []);
    } catch (err) {
      setSchools([]);
      setError(err?.message || 'Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const result = await adminService.listSchools(filter === 'all' ? undefined : filter);
        if (cancelled) return;
        setSchools(Array.isArray(result) ? result : []);
      } catch (err) {
        if (cancelled) return;
        setSchools([]);
        setError(err?.message || 'Failed to load schools');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filter]);

  const visible = (schools || []).filter(
    (s) =>
      (s.identity?.name || s.schoolName || '')
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-navy-gradient pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Super Admin</h1>
            <p className="text-sky-100/70">Manage school applications and app delivery</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => load(filter)}
              disabled={loading}
              className="px-4 py-2 border border-sky-500/30 text-sky-300 rounded-lg hover:bg-sky-500/10 flex items-center disabled:opacity-50"
              title="Refresh"
            >
              <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              to="/admin/users"
              className="px-4 py-2 border border-sky-500/30 text-sky-300 rounded-lg hover:bg-sky-500/10"
            >
              All Users
            </Link>
            <Link
              to="/admin/legal"
              className="px-4 py-2 border border-sky-500/30 text-sky-300 rounded-lg hover:bg-sky-500/10"
            >
              Legal Pages
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === f
                  ? 'bg-gold-gradient text-navy-950 shadow-gold-glow'
                  : 'bg-navy-900/60 text-sky-300 border border-sky-500/20 hover:border-gold-500/40'
              }`}
            >
              {f === 'all' ? 'All' : STATUS_LABEL[f]}
            </button>
          ))}
        </div>

        <div className="relative mb-6">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by school name or email"
            className="w-full pl-10 pr-4 py-3 bg-navy-900/60 border border-sky-500/30 text-white placeholder-sky-200/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => load(filter)}
              className="text-xs px-3 py-1 border border-rose-400/50 rounded-md hover:bg-rose-500/20"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <p className="text-sm text-sky-100/50 mb-3">
              {visible.length} {visible.length === 1 ? 'school' : 'schools'}
              {search && ` matching "${search}"`}
            </p>
            <div className="grid gap-4">
              {visible.map((s) => {
                const schoolId = s.id || s._id;
                return (
                  <motion.div
                    key={schoolId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-navy-900/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 shadow-inner-dark hover:border-gold-500/40 transition"
                  >
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        {s.identity?.logo ? (
                          <img
                            src={s.identity.logo}
                            alt=""
                            className="w-14 h-14 rounded-lg object-cover border border-gold-500/30"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-navy-950 border border-sky-500/30 flex items-center justify-center">
                            <FaSchool className="text-sky-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-white">
                            {s.identity?.name || s.schoolName}
                          </h3>
                          <p className="text-sm text-sky-100/60">
                            {s.email} · {s.phone}
                          </p>
                          <p className="text-xs text-sky-300/50 mt-1">
                            Applied{' '}
                            {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'} ·
                            Size: {s.schoolSize || '—'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            s.status === 'pending'
                              ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                              : s.status === 'rejected'
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              : s.status === 'active'
                              ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30'
                              : 'bg-navy-800 text-sky-200 border border-sky-500/20'
                          }`}
                        >
                          {STATUS_LABEL[s.status] || s.status}
                        </span>
                        <Link
                          to={`/admin/schools/${schoolId}`}
                          className="px-4 py-2 bg-gold-gradient text-navy-950 font-semibold rounded-lg shadow-gold-glow hover:shadow-gold-glow-lg transition text-sm"
                        >
                          Manage
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {visible.length === 0 && (
                <p className="text-center text-sky-100/50 py-12">
                  {search ? `No schools match "${search}".` : 'No schools in this state.'}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
