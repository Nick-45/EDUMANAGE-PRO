import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const LegalEditor = () => {
  const [terms, setTerms] = useState('');
  const [privacy, setPrivacy] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/admin/legal');
        setTerms(data.terms || '');
        setPrivacy(data.privacy || '');
      } finally { setLoading(false); }
    })();
  }, []);

  const save = async () => {
    try {
      await api.put('/admin/legal', { terms, privacy });
      toast.success('Legal pages saved');
    } catch { toast.error('Save failed'); }
  };

  if (loading) return <div className="min-h-screen bg-navy-gradient pt-24 text-center text-sky-300">Loading…</div>;

  return (
    <div className="min-h-screen bg-navy-gradient pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-display font-bold text-white mb-6">Legal Pages</h1>
        <div className="space-y-6">
          <div className="bg-navy-900/80 border border-sky-500/20 rounded-2xl p-6">
            <label className="block text-sky-100 font-semibold mb-2">Terms of Service (Markdown)</label>
            <textarea value={terms} onChange={e => setTerms(e.target.value)} rows={12}
              className="w-full px-4 py-3 bg-navy-950/60 border border-sky-500/30 text-white rounded-lg font-mono text-sm focus:ring-2 focus:ring-sky-400 outline-none" />
          </div>
          <div className="bg-navy-900/80 border border-sky-500/20 rounded-2xl p-6">
            <label className="block text-sky-100 font-semibold mb-2">Privacy Policy (Markdown)</label>
            <textarea value={privacy} onChange={e => setPrivacy(e.target.value)} rows={12}
              className="w-full px-4 py-3 bg-navy-950/60 border border-sky-500/30 text-white rounded-lg font-mono text-sm focus:ring-2 focus:ring-sky-400 outline-none" />
          </div>
          <button onClick={save} className="px-6 py-3 bg-gold-gradient text-navy-950 font-semibold rounded-lg shadow-gold-glow">Save Legal Pages</button>
        </div>
      </div>
    </div>
  );
};

export default LegalEditor;
