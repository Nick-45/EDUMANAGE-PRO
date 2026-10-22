import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaFilePdf, FaDownload, FaCheck, FaTimes, FaUpload, FaGlobe } from 'react-icons/fa';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import { adminService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// ---------- Brand palette (matches tailwind.config.js) ----------
const NAVY = [10, 20, 40];       // #0a1428
const NAVY_DEEP = [18, 32, 64];  // #122040
const SKY = [56, 198, 255];      // #38c6ff
const GOLD = [212, 175, 55];     // #d4af37
const WHITE = [255, 255, 255];
const LIGHT_SKY = [239, 249, 255]; // #eff9ff

// ---------- Asset loader (logo) ----------
const loadImageAsDataUrl = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve({ dataUrl: canvas.toDataURL('image/png'), width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = src;
  });

const SchoolDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [school, setSchool] = useState(null);
  const [subdomain, setSubdomain] = useState('');
  const [apkFile, setApkFile] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = async () => {
    setError('');
    try {
      const result = await adminService.getSchool(id);
      setSchool(result);
      setSubdomain(result?.subdomain || '');
      setApkFile(result?.app?.apkFile || '');
    } catch (err) {
      setError(err?.message || 'Failed to load school');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  // ---------- Branded PDF export ----------
  const exportPdf = async () => {
    if (!school) return;
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 15;

      // ===== HEADER BAND =====
      doc.setFillColor(...NAVY_DEEP);
      doc.rect(0, 0, pageW, 28, 'F');

      // Sky-blue accent line under header
      doc.setFillColor(...SKY);
      doc.rect(0, 28, pageW, 1.2, 'F');

      // Platform logo (top-left in the header)
      try {
        const { dataUrl, width, height } = await loadImageAsDataUrl('/logo192.png');
        const logoSize = 16;
        const ratio = width / height;
        const logoW = logoSize * ratio;
        doc.addImage(dataUrl, 'PNG', margin, 6, logoW, logoSize);
      } catch {
        /* logo failed — continue without it */
      }

      // Platform name + contact (top-right, white on navy)
      doc.setTextColor(...WHITE);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Edupriva Technologies', pageW - margin, 11, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(200, 220, 255);
      doc.text('info.edupriva@gmail.com  ·  +254 757 357 307', pageW - margin, 16, { align: 'right' });
      doc.text('www.edupriva.top', pageW - margin, 20, { align: 'right' });

      // ===== TITLE =====
      let y = 42;
      doc.setTextColor(...NAVY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('School Application Report', margin, y);
      y += 6;

      doc.setFontSize(12);
      doc.setTextColor(...SKY);
      doc.text(school.identity?.name || school.schoolName || 'Unnamed School', margin, y);
      y += 8;

      // Sky accent rule
      doc.setDrawColor(...SKY);
      doc.setLineWidth(0.6);
      doc.line(margin, y, pageW - margin, y);
      y += 8;

      // ===== META BAR (generated date + admin name) =====
      const now = new Date();
      const generatedAt = now.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const adminName = user?.name || user?.email || 'Super Admin';

      doc.setFillColor(...LIGHT_SKY);
      doc.roundedRect(margin, y, pageW - margin * 2, 12, 2, 2, 'F');
      doc.setTextColor(...NAVY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Generated:', margin + 3, y + 4.5);
      doc.text('By:', margin + 3, y + 9);

      doc.setFont('helvetica', 'normal');
      doc.text(generatedAt, margin + 25, y + 4.5);
      doc.text(`${adminName} (Super Admin)`, margin + 25, y + 9);

      y += 20;

      // ===== SCHOOL INFO GRID =====
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...NAVY);
      doc.text('School Information', margin, y);
      y += 5;

      const infoRows = [
        ['Status', school.status || '—'],
        ['Admin Name', school.adminName || '—'],
        ['Email', school.email || '—'],
        ['Phone', school.phone || '—'],
        ['Students Range', school.schoolSize || '—'],
        ['Level', school.academic?.level || '—'],
        ['Motto', school.identity?.motto || '—'],
        ['P.O. Box', school.identity?.pobox || '—'],
        ['Physical Address', school.identity?.address || '—'],
        ['Website', school.identity?.website || '—'],
        ['Subdomain', school.subdomain ? `${school.subdomain}.edupriva.top` : 'Not assigned'],
        ['Subscription Plan', school.subscription?.plan || '—'],
        ['Classes', (school.academic?.classes || []).map((c) => c.name).join(', ') || '—'],
        ['Streams', (school.academic?.streamNames || []).join(', ') || '—'],
        ['APK File', school.app?.apkFile || 'Not uploaded'],
      ];

      doc.setFontSize(9);
      const rowH = 7;
      const colLabelW = 45;
      infoRows.forEach(([k, v], idx) => {
        // Alternating row background
        if (idx % 2 === 0) {
          doc.setFillColor(248, 251, 255);
          doc.rect(margin, y - 4, pageW - margin * 2, rowH, 'F');
        }
        doc.setTextColor(...NAVY_DEEP);
        doc.setFont('helvetica', 'bold');
        doc.text(`${k}`, margin + 2, y);

        doc.setTextColor(40, 50, 70);
        doc.setFont('helvetica', 'normal');
        doc.text(String(v || '—'), margin + colLabelW, y, {
          maxWidth: pageW - margin - colLabelW - 2,
        });
        y += rowH;
      });

      y += 4;

      // ===== LOGO PANEL =====
      if (school.identity?.logo) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...NAVY);
        doc.text('School Logo', margin, y);
        y += 4;

        try {
          let logoData = school.identity.logo;
          // If it's a remote URL, fetch and convert to base64 first
          if (!logoData.startsWith('data:')) {
            const res = await fetch(logoData);
            const blob = await res.blob();
            logoData = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            });
          }
          // Bordered frame
          doc.setDrawColor(...SKY);
          doc.setLineWidth(0.4);
          doc.rect(margin, y, 34, 34);
          doc.addImage(logoData, 'PNG', margin + 2, y + 2, 30, 30);
          y += 40;
        } catch {
          doc.setFontSize(9);
          doc.setTextColor(150, 150, 150);
          doc.text('(Logo could not be embedded)', margin, y);
          y += 8;
        }
      }

      // ===== FOOTER =====
      const footerY = pageH - 16;
      doc.setFillColor(...NAVY_DEEP);
      doc.rect(0, footerY, pageW, 16, 'F');
      doc.setFillColor(...SKY);
      doc.rect(0, footerY, pageW, 0.8, 'F');

      doc.setTextColor(...WHITE);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const year = now.getFullYear();
      doc.text(
        `© ${year} mrak. All rights reserved.`,
        margin,
        footerY + 6
      );
      doc.text(
        'System designed and maintained by Edupriva Technologies',
        margin,
        footerY + 11
      );

      doc.setTextColor(...SKY);
      doc.setFont('helvetica', 'bold');
      doc.text('Edupriva', pageW - margin, footerY + 6, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(200, 220, 255);
      doc.text('info.edupriva@gmail.com', pageW - margin, footerY + 11, { align: 'right' });

      // ===== SAVE =====
      const safe = (school.identity?.name || school.schoolName || 'school').replace(/\s+/g, '_');
      doc.save(`${safe}_application_${year}.pdf`);
    } catch (e) {
      console.error('PDF export error:', e);
      toast.error('PDF export failed');
    }
  };

  const downloadLogo = async () => {
    if (!school?.identity?.logo) return toast.error('No logo uploaded');
    const logoUrl = school.identity.logo;
    const filename = `${(school.identity?.name || school.schoolName || 'school').replace(
      /\s+/g,
      '_'
    )}_logo.png`;

    try {
      if (!logoUrl.startsWith('data:')) {
        const res = await fetch(logoUrl);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const a = document.createElement('a');
        a.href = logoUrl;
        a.download = filename;
        a.click();
      }
    } catch {
      window.open(logoUrl, '_blank');
    }
  };

  const updateStatus = async (status) => {
    setBusy(status);
    try {
      await adminService.updateStatus(id, status, note);
      toast.success(`Status updated to ${status}`);
      await load();
    } catch (e) {
      toast.error(e?.message || 'Update failed');
    } finally {
      setBusy('');
    }
  };

  const saveSubdomain = async () => {
    setBusy('subdomain');
    try {
      await adminService.setSubdomain(id, subdomain);
      toast.success('Subdomain assigned');
      await load();
    } catch (e) {
      toast.error(e?.message || 'Failed to save subdomain');
    } finally {
      setBusy('');
    }
  };

  const saveApk = async () => {
    setBusy('apk');
    try {
      await adminService.setApk(id, { apkFile });
      toast.success('APK filename recorded');
      await load();
    } catch (e) {
      toast.error(e?.message || 'Failed to save APK');
    } finally {
      setBusy('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-gradient pt-24 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-navy-gradient pt-24 text-center px-4">
        <p className="text-rose-300 mb-4">{error}</p>
        <button
          onClick={load}
          className="px-4 py-2 bg-gold-gradient text-navy-950 font-semibold rounded-lg shadow-gold-glow"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen bg-navy-gradient pt-24 text-center text-rose-300">
        School not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-gradient pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-3xl font-display font-bold text-white">
            {school.identity?.name || school.schoolName || 'Unnamed School'}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={exportPdf}
              className="px-4 py-2 bg-gold-gradient text-navy-950 font-semibold rounded-lg shadow-gold-glow flex items-center"
            >
              <FaFilePdf className="mr-2" /> Export PDF
            </button>
            {school.identity?.logo && (
              <button
                onClick={downloadLogo}
                className="px-4 py-2 border border-sky-400/50 text-sky-300 rounded-lg hover:bg-sky-500/10 flex items-center"
              >
                <FaDownload className="mr-2" /> Download Logo
              </button>
            )}
          </div>
        </div>

        {/* Info panel */}
        <div className="bg-navy-900/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 mb-6 shadow-inner-dark">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div><span className="text-sky-100/60">Admin:</span> <span className="text-white">{school.adminName || '—'}</span></div>
            <div><span className="text-sky-100/60">Email:</span> <span className="text-white">{school.email || '—'}</span></div>
            <div><span className="text-sky-100/60">Phone:</span> <span className="text-white">{school.phone || '—'}</span></div>
            <div><span className="text-sky-100/60">Students Range:</span> <span className="text-white">{school.schoolSize || '—'}</span></div>
            <div><span className="text-sky-100/60">Level:</span> <span className="text-white">{school.academic?.level || '—'}</span></div>
            <div><span className="text-sky-100/60">Motto:</span> <span className="text-white">{school.identity?.motto || '—'}</span></div>
            <div><span className="text-sky-100/60">P.O. Box:</span> <span className="text-white">{school.identity?.pobox || '—'}</span></div>
            <div><span className="text-sky-100/60">Classes:</span> <span className="text-white">{(school.academic?.classes || []).map((c) => c.name).join(', ') || '—'}</span></div>
            <div><span className="text-sky-100/60">Streams:</span> <span className="text-white">{(school.academic?.streamNames || []).join(', ') || '—'}</span></div>
            <div><span className="text-sky-100/60">Status:</span> <span className="text-gold-400 font-semibold capitalize">{school.status || '—'}</span></div>
          </div>
          {school.identity?.logo && (
            <div className="mt-4">
              <p className="text-sky-100/60 text-sm mb-2">Uploaded Logo:</p>
              <img
                src={school.identity.logo}
                alt="logo"
                className="w-24 h-24 rounded-lg border border-gold-500/30 object-cover"
              />
            </div>
          )}
        </div>

        {/* Subdomain assignment */}
        <div className="bg-navy-900/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 mb-6 shadow-inner-dark">
          <h2 className="text-white font-semibold mb-3 flex items-center">
            <FaGlobe className="mr-2 text-gold-400" /> Assign Subdomain
          </h2>
          <div className="flex flex-wrap gap-3 items-center">
            <input
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="e.g. sunshine"
              className="flex-1 min-w-[200px] px-4 py-2 bg-navy-950/60 border border-sky-500/30 text-white placeholder-sky-200/40 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
            />
            <span className="text-gold-400 font-medium">.edupriva.top</span>
            <button
              onClick={saveSubdomain}
              disabled={busy === 'subdomain'}
              className="px-4 py-2 bg-gold-gradient text-navy-950 font-semibold rounded-lg shadow-gold-glow disabled:opacity-50"
            >
              {busy === 'subdomain' ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        {/* APK assignment */}
        <div className="bg-navy-900/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 mb-6 shadow-inner-dark">
          <h2 className="text-white font-semibold mb-1 flex items-center">
            <FaUpload className="mr-2 text-gold-400" /> Attach APK
          </h2>
          <p className="text-xs text-sky-100/60 mb-3">
            Upload the built APK to the repo root, then enter the exact filename here.
          </p>
          <div className="flex flex-wrap gap-3">
            <input
              value={apkFile}
              onChange={(e) => setApkFile(e.target.value)}
              placeholder="SunshineAcademy-1.0.0.apk"
              className="flex-1 min-w-[200px] px-4 py-2 bg-navy-950/60 border border-sky-500/30 text-white placeholder-sky-200/40 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
            />
            <button
              onClick={saveApk}
              disabled={busy === 'apk'}
              className="px-4 py-2 bg-gold-gradient text-navy-950 font-semibold rounded-lg shadow-gold-glow disabled:opacity-50"
            >
              {busy === 'apk' ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        {/* Status control */}
        <div className="bg-navy-900/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 shadow-inner-dark">
          <h2 className="text-white font-semibold mb-3">Application Decision</h2>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Optional note to the applicant (visible to them)"
            className="w-full px-4 py-2 mb-4 bg-navy-950/60 border border-sky-500/30 text-white placeholder-sky-200/40 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
          />
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => updateStatus('in_review')}
              disabled={!!busy}
              className="px-4 py-2 border border-sky-400/50 text-sky-300 rounded-lg hover:bg-sky-500/10 disabled:opacity-50"
            >
              Mark In Review
            </button>
            <button
              onClick={() => updateStatus('app_building')}
              disabled={!!busy}
              className="px-4 py-2 border border-sky-400/50 text-sky-300 rounded-lg hover:bg-sky-500/10 disabled:opacity-50"
            >
              Building App
            </button>
            <button
              onClick={() => updateStatus('app_ready')}
              disabled={!!busy}
              className="px-4 py-2 border border-gold-500/50 text-gold-300 rounded-lg hover:bg-gold-500/10 flex items-center disabled:opacity-50"
            >
              <FaCheck className="mr-2" /> App Ready
            </button>
            <button
              onClick={() => updateStatus('active')}
              disabled={!!busy}
              className="px-4 py-2 bg-gold-gradient text-navy-950 font-semibold rounded-lg shadow-gold-glow flex items-center disabled:opacity-50"
            >
              <FaCheck className="mr-2" /> Approve & Activate
            </button>
            <button
              onClick={() => updateStatus('rejected')}
              disabled={!!busy}
              className="px-4 py-2 bg-rose-500/15 border border-rose-500/40 text-rose-300 rounded-lg hover:bg-rose-500/25 flex items-center disabled:opacity-50"
            >
              <FaTimes className="mr-2" /> Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDetail;
