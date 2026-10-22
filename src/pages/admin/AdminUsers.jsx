import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await adminService.listUsers();   // → GET /admin-users-list
        if (cancelled) return;
        setUsers(Array.isArray(result) ? result : []);
      } catch (err) {
        if (cancelled) return;
        setUsers([]);
        setError(err?.message || 'Failed to load users');
        toast.error(err?.message || 'Failed to load users');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-gradient pt-24 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-gradient pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-display font-bold text-white mb-6">All Users</h1>

        {error && (
          <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-sm">
            {error}
          </div>
        )}

        <div className="bg-navy-900/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl overflow-hidden shadow-inner-dark">
          <table className="w-full text-sm">
            <thead className="bg-navy-950/60 text-sky-200">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3">School ID</th>
              </tr>
            </thead>
            <tbody className="text-sky-100/80">
              {users.map((u) => (
                <tr key={u.id} className="border-t border-sky-500/10">
                  <td className="p-3">{u.name || '—'}</td>
                  <td className="p-3">{u.email || '—'}</td>
                  <td className="p-3 capitalize">{u.role || '—'}</td>
                  <td className="p-3 font-mono text-xs text-sky-300/60">
                    {u.schoolId || '—'}
                  </td>
                </tr>
              ))}
              {users.length === 0 && !error && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-sky-100/50">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
