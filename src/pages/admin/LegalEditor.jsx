import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { legalService } from '../../services/api';

const LegalEditor = () => {
  const [terms, setTerms] = useState('');
  const [privacy, setPrivacy] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await legalService.get();
        if (cancelled) return;
        setTerms(result?.terms || '');
        setPrivacy(result?.privacy || '');
      } catch (err) {
        if (cancelled) return;
        setTerms('');
        setPrivacy('');
        toast.error(err?.message || 'Failed to load legal pages');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await legalService.save(terms, privacy);
      toast.success('Legal pages saved');
    } catch (err) {
      toast.error(err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-gradient pt-24 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-gradient pt-24 pb-12">
      <Helmet>
        <title>Legal Pages — Admin</title>
      </Helmet>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Legal Pages</h1>
            <p className="text-sky-100/70">
              Edit the Terms of Service and Privacy Policy shown to users.
            </p>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="px-6 py-3 bg-gold-gradient text-navy-950 font-semibold rounded-lg shadow-gold-glow hover:shadow-gold-glow-lg transition disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Legal Pages'}
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-navy-900/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 shadow-inner-dark">
            <label className="block text-sky-100 font-semibold mb-2">
              Terms of Service (Markdown)
            </label>
            <textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              rows={14}
              placeholder="# Terms of Service&#10;&#10;Write in Markdown…"
              className="w-full px-4 py-3 bg-navy-950/60 border border-sky-500/30 text-white rounded-lg font-mono text-sm focus:ring-2 focus:ring-sky-400 outline-none"
            />
          </div>

          <div className="bg-navy-900/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 shadow-inner-dark">
            <label className="block text-sky-100 font-semibold mb-2">
              Privacy Policy (Markdown)
            </label>
            <textarea
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              rows={14}
              placeholder="# Privacy Policy&#10;&#10;Write in Markdown…"
              className="w-full px-4 py-3 bg-navy-950/60 border border-sky-500/30 text-white rounded-lg font-mono text-sm focus:ring-2 focus:ring-sky-400 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalEditor;
