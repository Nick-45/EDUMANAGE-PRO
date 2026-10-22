import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaEye, FaEyeSlash, FaChartBar } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, increment } from 'firebase/firestore';

const AdminAds = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ctaText: 'Learn More',
    link: 'https://',
    image: '',
    bgColor: 'from-sky-900 to-navy-900'
  });

  const db = getFirestore();

  const fetchAds = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'ads'));
      const adsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by newest first
      adsData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setAds(adsData);
    } catch (err) {
      toast.error('Failed to load ads');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'ads'), {
        ...formData,
        active: true,
        impressions: 0,
        clicks: 0,
        createdAt: Date.now()
      });
      toast.success('Ad created successfully');
      setIsCreating(false);
      setFormData({ title: '', description: '', ctaText: 'Learn More', link: 'https://', image: '', bgColor: 'from-sky-900 to-navy-900' });
      fetchAds();
    } catch (err) {
      toast.error('Failed to create ad');
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, 'ads', id), { active: !currentStatus });
      toast.success(`Ad ${!currentStatus ? 'activated' : 'paused'}`);
      fetchAds();
    } catch (err) {
      toast.error('Failed to update ad');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ad?')) return;
    try {
      await deleteDoc(doc(db, 'ads', id));
      toast.success('Ad deleted');
      fetchAds();
    } catch (err) {
      toast.error('Failed to delete ad');
    }
  };

  return (
    <div className="min-h-screen bg-navy-gradient pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Manage Advertisements</h1>
            <p className="text-sky-100/70">Create and track your in-house sponsored content</p>
          </div>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="px-4 py-2 bg-gold-gradient text-navy-950 font-semibold rounded-lg shadow-gold-glow flex items-center hover:shadow-gold-glow-lg transition"
          >
            <FaPlus className="mr-2" /> {isCreating ? 'Cancel' : 'Create New Ad'}
          </button>
        </div>

        {/* Create Ad Form */}
        {isCreating && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-navy-900/80 backdrop-blur-xl border border-sky-500/30 rounded-2xl p-6 mb-8 shadow-inner-dark"
          >
            <form onSubmit={handleCreate} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-sky-200 mb-1 block">Ad Title</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 bg-navy-950 border border-sky-500/30 text-white rounded-lg focus:ring-2 focus:ring-sky-400 outline-none" />
              </div>
              <div>
                <label className="text-xs text-sky-200 mb-1 block">CTA Button Text</label>
                <input required value={formData.ctaText} onChange={e => setFormData({...formData, ctaText: e.target.value})}
                  className="w-full px-4 py-2 bg-navy-950 border border-sky-500/30 text-white rounded-lg focus:ring-2 focus:ring-sky-400 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-sky-200 mb-1 block">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={2}
                  className="w-full px-4 py-2 bg-navy-950 border border-sky-500/30 text-white rounded-lg focus:ring-2 focus:ring-sky-400 outline-none" />
              </div>
              <div>
                <label className="text-xs text-sky-200 mb-1 block">Link URL</label>
                <input required type="url" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})}
                  className="w-full px-4 py-2 bg-navy-950 border border-sky-500/30 text-white rounded-lg focus:ring-2 focus:ring-sky-400 outline-none" />
              </div>
              <div>
                <label className="text-xs text-sky-200 mb-1 block">Image URL (Optional)</label>
                <input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})}
                  className="w-full px-4 py-2 bg-navy-950 border border-sky-500/30 text-white rounded-lg focus:ring-2 focus:ring-sky-400 outline-none" />
              </div>
              <div className="md:col-span-2 flex justify-end mt-2">
                <button type="submit" className="px-6 py-2 bg-gold-gradient text-navy-950 font-bold rounded-lg hover:shadow-gold-glow">
                  Save Ad
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Ads List */}
        {loading ? (
          <div className="text-center py-12"><div className="w-12 h-12 mx-auto border-4 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : ads.length === 0 ? (
          <div className="text-center py-12 text-sky-100/50">No ads created yet.</div>
        ) : (
          <div className="grid gap-4">
            {ads.map(ad => (
              <div key={ad.id} className={`bg-navy-900/80 backdrop-blur-xl border rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 transition ${ad.active ? 'border-sky-500/30' : 'border-rose-500/20 opacity-70'}`}>
                
                <div className="flex items-center gap-4 flex-1">
                  {ad.image ? (
                     <img src={ad.image} alt="" className="w-16 h-16 rounded-lg object-cover mix-blend-overlay bg-navy-950" />
                  ) : (
                     <div className="w-16 h-16 rounded-lg bg-navy-950 border border-sky-500/20 flex items-center justify-center text-sky-500/30 text-xs">No Img</div>
                  )}
                  <div>
                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                      {ad.title}
                      {!ad.active && <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full uppercase">Paused</span>}
                    </h3>
                    <p className="text-sm text-sky-100/60 line-clamp-1">{ad.description}</p>
                    <a href={ad.link} target="_blank" rel="noreferrer" className="text-xs text-gold-400 hover:underline">{ad.link}</a>
                  </div>
                </div>

                <div className="flex items-center gap-6 px-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{ad.impressions || 0}</div>
                    <div className="text-[10px] text-sky-200 uppercase tracking-wider">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{ad.clicks || 0}</div>
                    <div className="text-[10px] text-sky-200 uppercase tracking-wider">Clicks</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => toggleActive(ad.id, ad.active)} title={ad.active ? "Pause Ad" : "Activate Ad"}
                    className={`p-2 rounded-lg border transition ${ad.active ? 'border-sky-500/30 text-sky-300 hover:bg-sky-500/10' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'}`}>
                    {ad.active ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  <button onClick={() => handleDelete(ad.id)} title="Delete Ad"
                    className="p-2 border border-rose-500/30 text-rose-400 rounded-lg hover:bg-rose-500/10 transition">
                    <FaTrash />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAds;
