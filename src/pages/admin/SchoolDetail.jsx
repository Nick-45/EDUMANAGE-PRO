import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaFilePdf, FaDownload, FaCheck, FaTimes, FaUpload, FaGlobe } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';
import jsPDF from 'jspdf';

const SchoolDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const [subdomain, setSubdomain] = useState('');
  const [apkFile, setApkFile] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get(`/admin/schools/${id}`);
      setSchool(data);
      setSubdomain(data.subdomain || '');
      setApkFile(data.app?.apkFile || '');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const exportPdf = () => {
    if (!school) return;
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(18); doc.text(`School Application — ${school.identity?.name || school.schoolName}`, 14, y); y += 10;
    doc.setFontSize(11);

    const rows = [
      ['Status', school.status],
      ['Admin', school.adminName],
      ['Email', school.email],
      ['Phone', school.phone],
      ['Students Range', school.schoolSize],
      ['Level', school.academic?.level],
      ['Motto', school.identity?.motto || '—'],
      ['P.O. Box', school.identity?.pobox || '—'],
      ['Physical Address', school.identity?.address || '—'],
      ['Website', school.identity?.website || '—'],
      ['Subdomain', school.subdomain ? `${school.subdomain}.edupriva.top` : 'Not assigned'],
      ['Plan', school.subscription?.plan || '—'],
      ['Classes', (school.academic?.classes || []).map(c => c.name).join(', ')],
      ['Streams', (school.academic?.streamNames || []).join(', ')],
      ['APK File', school.app?.apkFile || 'Not uploaded'],
    ];
    rows.forEach(([k, v]) => {
      doc.text(`${k}:`, 14, y);
      doc.text(String(v || '—'), 60, y, { maxWidth: 130 });
      y += 8;
    });
    if (school.identity?.logo) {
      try { doc.addImage(school.identity.logo, 'PNG', 150, 20, 40, 40); } catch {}
    }
    doc.save(`${(school.identity?.name || 'school').replace(/\s+/g, '_')}_application.pdf`);
  };

  const downloadLogo = () => {
    if (!school?.identity?.logo) return toast.error('No logo uploaded');
    const a = document.createElement('a');
    a.href = school.identity.logo;
    a.download = `${(school.identity?.name || 'school').replace(/\s+/g, '_')}_logo.png`;
    a.click();
  };

  const updateStatus = async (status, extra = {}) => {
    try {
      await api.patch(`/admin/schools/${id}/status`, { status, note, ...extra });
      toast.success(`Status updated to ${status}`);
      load();
    } catch (e) { toast.error(e.message || 'Update failed'); }
  };

  const saveSubdomain = async () => {
    try {
      await api.patch(`/admin/schools/${id}/subdomain`, { subdomain });
      toast.success('Subdomain assigned');
      load();
    } catch (e) { toast.error(e.message || 'Failed'); }
  };

  const saveApk = async () => {
    try {
      await api.patch(`/admin/schools/${id}/apk`, { apkFile });
      toast.success('APK filename recorded');
      load();
    } catch (e) { toast.error(e.message || 'Failed'); }
  };

  if (loading) return <div className="min-h-screen bg-navy-gradient pt-24 text-center text-sky-300">Loading…</div>;
  if (!school) return <div className="min-h-screen bg-navy-gradient pt-24 text-center text-rose-300">School not found</div>;

  return (
    <div className="min-h-screen bg-navy-gradient pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-3xl font-display font-bold text-white">
            {school.identity?.name || school.schoolName}
          </h1>
          <div className="flex gap-2">
            <button onClick={exportPdf} className="px-4 py-2 bg-gold-gradient text-navy-950 font-semibold rounded-lg shadow-gold-glow flex items-center">
              <FaFilePdf className="mr-2" /> Export PDF
            </button>
            {school.identity?.logo && (
              <button onClick={downloadLogo} className="px-4 py-2 border border-sky-400/50 text-sky-300 rounded-lg hover:bg-sky-500/10 flex items-center">
                <FaDownload className="mr-2" /> Download Logo
              </button>
            )}
          </div>
        </div>

        {/* Info panel */}
        <div className="bg-navy-900/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 mb-6 shadow-inner-dark">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div><span className="text-sky-100/60">Admin:</span> <span className="text-white">{school.adminName}</span></div>
            <div><span className="text-sky-100/60">Email:</span> <span className="text-white">{school.email}</span></div>
            <div><span className="text-sky-100/60">Phone:</span> <span className="text-white">{school.phone}</span></div>
            <div><span className="text-sky-100/60">Students Range:</span> <span className="text-white">{school.schoolSize}</span></div>
            <div><span className="text-sky-100/60">Level:</span> <span className="text-white">{school.academic?.level}</span></div>
            <div><span className="text-sky-100/60">Motto:</span> <span className="text-white">{school.identity?.motto || '—'}</span></div>
            <div><span className="text-sky-100/60">P.O. Box:</span> <span className="text-white">{school.identity?.pobox || '—'}</span></div>
            <div><span className="text-sky-100/60">Classes:</span> <span className="text-white">{(school.academic?.classes || []).map(c => c.name).join(', ') || '—'}</span></div>
            <div><span className="text-sky-100/60">Streams:</span> <span className="text-white">{(school.academic?.streamNames || []).join(', ') || '—'}</span></div>
          </div>
          {school.identity?.logo && (
            <div className="mt-4">
              <p className="text-sky-100/60 text-sm mb-2">Uploaded Logo:</p>
              <img src={school.identity.logo} alt="logo" className="w-24 h-24 rounded-lg border border-gold-500/30 object-cover" />
            </div>
          )}
        </div>

        {/* Subdomain assignment */}
        <div className="bg-navy-900/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 mb-6 shadow-inner-dark">
          <h2 className="text-white font-semibold mb-3 flex items-center"><FaGlobe className="mr-2 text-gold-400" /> Assign Subdomain</h2>
          <div className="flex gap-3 items-center">
            <input value={subdomain} onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="e.g. sunshine"
              className="flex-1 px-4 py-2 bg-navy-950/60 border border-sky-500/30 text-white placeholder-sky-200/40 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none" />
            <span className="text-gold-400 font-medium">.edupriva.top</span>
            <button onClick={saveSubdomain} className="px-4 py-2 bg-gold-gradient text-navy-950 font-semibold rounded-lg shadow-gold-glow">Save</button>
          </div>
        </div>

        {/* APK assignment */}
        <div className="bg-navy-900/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 mb-6 shadow-inner-dark">
          <h2 className="text-white font-semibold mb-1 flex items-center"><FaUpload className="mr-2 text-gold-400" /> Attach APK</h2>
          <p className="text-xs text-sky-100/60 mb-3">
            Upload the built APK to the repo root, then enter the exact filename here.
          </p>
          <div className="flex gap-3">
            <input value={apkFile} onChange={e => setApkFile(e.target.value)}
              placeholder="SunshineAcademy-1.0.0.apk"
              className="flex-1 px-4 py-2 bg-navy-950/60 border border-sky-500/30 text-white placeholder-sky-200/40 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none" />
            <button onClick={saveApk} className="px-4 py-2 bg-gold-gradient text-navy-950 font-semibold rounded-lg shadow-gold-glow">Save</button>
          </div>
        </div>

        {/* Status control */}
        <div className="bg-navy-900/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 shadow-inner-dark">
          <h2 className="text-white font-semibold mb-3">Application Decision</h2>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
            placeholder="Optional note to the applicant (visible to them)"
            className="w-full px-4 py-2 mb-4 bg-navy-950/60 border border-sky-500/30 text-white placeholder-sky-200/40 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none" />
          <div className="flex flex-wrap gap-3">
            <button onClick={() => updateStatus('in_review')} className="px-4 py-2 border border-sky-400/50 text-sky-300 rounded-lg hover:bg-sky-500/10">Mark In Review</button>
            <button onClick={() => updateStatus('app_building')} className="px-4 py-2 border border-sky-400/50 text-sky-300 rounded-lg hover:bg-sky-500/10">Building App</button>
            <button onClick={() => updateStatus('app_ready')} className="px-4 py-2 border border-gold-500/50 text-gold-300 rounded-lg hover:bg-gold-500/10 flex items-center"><FaCheck className="mr-2" /> App Ready</button>
            <button onClick={() => updateStatus('active')} className="px-4 py-2 bg-gold-gradient text-navy-950 font-semibold rounded-lg shadow-gold-glow flex items-center"><FaCheck className="mr-2" /> Approve & Activate</button>
            <button onClick={() => updateStatus('rejected')} className="px-4 py-2 bg-rose-500/15 border border-rose-500/40 text-rose-300 rounded-lg hover:bg-rose-500/25 flex items-center"><FaTimes className="mr-2" /> Reject</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDetail;
