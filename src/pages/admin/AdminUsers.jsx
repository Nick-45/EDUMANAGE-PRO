import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  useEffect(() => { api.get('/admin/users').then(({ data }) => setUsers(data)); }, []);
  return (
    <div className="min-h-screen bg-navy-gradient pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-display font-bold text-white mb-6">All Users</h1>
        <div className="bg-navy-900/80 border border-sky-500/20 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-navy-950/60 text-sky-200">
              <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Email</th><th className="text-left p-3">Role</th><th className="text-left p-3">School</th></tr>
            </thead>
            <tbody className="text-sky-100/80">
              {users.map(u => (
                <tr key={u._id} className="border-t border-sky-500/10">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 capitalize">{u.role}</td>
                  <td className="p-3">{u.schoolName || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AdminUsers;
