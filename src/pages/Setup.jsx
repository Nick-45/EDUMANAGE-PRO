import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';
import Navbar from '../components/layout/Navbar';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaCloudUploadAlt, FaCheck, FaArrowRight } from 'react-icons/fa';

const SCHOOL_LEVELS = [
  { value: 'primary', label: 'Primary School' },
  { value: 'junior_school', label: 'Junior School' },
  { value: 'senior_school', label: 'Senior School' },
  { value: 'secondary', label: 'Secondary School' },
  { value: 'mixed', label: 'Mixed (Primary + Secondary)' },
];

const Setup = () => {
  const { user } = useAuth();
  const { school, submitApplication, uploadLogo } = useSchool();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Identity
    name: '', motto: '', address: '', pobox: '', phone: '', email: '', website: '',
    // Academic
    level: 'junior_school',
    classPrefix: 'Grade',
    classNumbers: '1,2,3',
    streamNames: 'North,South',
    subjects: 'Mathematics,English,Kiswahili,Science',
    // Theme
    primaryColor: '#1B5E20',
    secondaryColor: '#D4AF37',
    darkMode: true,
    // Subscription
    plan: 'basic',
    // Terms
    acceptTerms: false,
    acceptPrivacy: false
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    if (!school) return;
    setFormData(prev => ({
      ...prev,
      name: school.identity?.name || school.schoolName || '',
      motto: school.identity?.motto || '',
      address: school.identity?.address || '',
      pobox: school.identity?.pobox || '',
      phone: school.identity?.phone || school.phone || '',
      email: school.identity?.email || school.email || '',
      website: school.identity?.website || '',
      level: school.academic?.level || 'junior_school',
      primaryColor: school.theme?.primaryColor || '#1B5E20',
      secondaryColor: school.theme?.secondaryColor || '#D4AF37',
      darkMode: school.theme?.darkMode ?? true,
      plan: school.subscription?.plan || 'basic'
    }));
    if (school.identity?.logo) setLogoPreview(school.identity.logo);
  }, [school]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const generateClasses = (prefix, numbers, streams) => {
    const streamList = streams.split(',').map(s => s.trim()).filter(Boolean);
    return numbers.split(',').map(num => ({
      id: num.trim(),
      name: `${prefix} ${num.trim()}`,
      sections: ['A', 'B'],
      streams: streamList
    }));
  };

  const generateSubjects = (subjectString) =>
    subjectString.split(',').map(sub => ({
      id: sub.trim().toLowerCase().replace(/\s/g, ''),
      name: sub.trim(),
      category: 'core'
    }));

  const handleSubmitApplication = async () => {
    if (!formData.acceptTerms || !formData.acceptPrivacy) {
      toast.error('Please accept the Terms of Service and Privacy Policy');
      return;
    }
    setLoading(true);
    try {
      // Upload logo first (so super admin sees it in the review queue)
      if (logoFile) {
        await uploadLogo(logoFile);
      }

      const classes = generateClasses(formData.classPrefix, formData.classNumbers, formData.streamNames);
      const subjects = generateSubjects(formData.subjects);

      await submitApplication({
        identity: {
          name: formData.name, motto: formData.motto, address: formData.address,
          pobox: formData.pobox, phone: formData.phone, email: formData.email,
          website: formData.website
        },
        academic: {
          level: formData.level,
          classPrefix: formData.classPrefix,
          classes,
          subjects,
          streamNames: formData.streamNames.split(',').map(s => s.trim()).filter(Boolean)
        },
        subscription: { plan: formData.plan, status: 'pending' },
        theme: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          darkMode: formData.darkMode
        },
        status: 'pending'
      });

      toast.success('Application submitted! Our team will review it shortly.');
      setStep(3);
    } catch (error) {
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const inputBase = 'w-full px-4 py-2 bg-navy-950/60 border border-sky-500/30 placeholder-sky-200/40 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 transition';
  const labelBase = 'block text-sm font-medium text-sky-100 mb-2';

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-navy-gradient pt-20 pb-12">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Step indicators */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    i < step ? 'bg-gold-gradient text-navy-950 shadow-gold-glow' :
                    i === step ? 'bg-gold-gradient text-navy-950 ring-4 ring-gold-500/20 shadow-gold-glow' :
                    'bg-navy-800 text-sky-300/60 border border-sky-500/20'
                  }`}>
                    {i < step ? <FaCheck /> : i}
                  </div>
                  {i < 3 && <div className={`flex-1 h-1 mx-2 ${i < step ? 'bg-gold-500' : 'bg-navy-700'}`} />}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-sky-100/70">
              <span>School Info</span>
              <span>Academic & Plan</span>
              <span>Complete</span>
            </div>
          </div>

          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-navy-900/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl shadow-inner-dark shadow-gold-glow p-8">
              <h2 className="text-2xl font-display font-bold text-white mb-6">School Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={labelBase}>School Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={inputBase} placeholder="Sunshine Academy" />
                </div>
                <div>
                  <label className={labelBase}>Motto</label>
                  <input type="text" name="motto" value={formData.motto} onChange={handleInputChange} className={inputBase} placeholder="Knowledge is Power" />
                </div>
                <div>
                  <label className={labelBase}>Highest School Level *</label>
                  <select name="level" value={formData.level} onChange={handleInputChange} className={inputBase}>
                    {SCHOOL_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelBase}>P.O. Box *</label>
                  <input type="text" name="pobox" value={formData.pobox} onChange={handleInputChange} className={inputBase} placeholder="P.O. Box 1234, Nairobi" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelBase}>Physical Address *</label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} className={inputBase} rows={2} placeholder="123 School Road, City" />
                </div>
                <div>
                  <label className={labelBase}>Phone *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={inputBase} />
                </div>
                <div>
                  <label className={labelBase}>Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputBase} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelBase}>Website</label>
                  <input type="url" name="website" value={formData.website} onChange={handleInputChange} className={inputBase} placeholder="https://yourschool.ac.ke" />
                </div>
              </div>

              {/* Logo upload */}
              <div className="mt-6 border-2 border-dashed border-sky-500/30 bg-navy-950/40 p-6 text-center rounded-xl hover:border-gold-500/50 transition">
                {logoPreview ? (
                  <img src={logoPreview} alt="School Logo" className="max-h-32 mx-auto mb-3 rounded-lg" />
                ) : (
                  <FaCloudUploadAlt className="text-5xl text-sky-400 mx-auto mb-3" />
                )}
                <input type="file" id="logo" accept="image/*" onChange={handleLogoChange} className="hidden" />
                <button type="button" onClick={() => document.getElementById('logo').click()}
                  className="px-4 py-2 bg-sky-500/10 border border-sky-400/40 text-sky-300 rounded-lg hover:bg-sky-500/20 transition">
                  {logoPreview ? 'Change Logo' : 'Upload School Logo'}
                </button>
                <p className="text-xs text-sky-300/60 mt-2">PNG or JPG, max 2MB. Used on your school's app icon.</p>
              </div>

              <div className="flex justify-end mt-6">
                <button onClick={() => setStep(2)} className="px-6 py-3 bg-gold-gradient text-navy-950 font-semibold rounded-lg shadow-gold-glow hover:shadow-gold-glow-lg transition flex items-center">
                  Next <FaArrowRight className="ml-2" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-navy-900/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl shadow-inner-dark shadow-gold-glow p-8">
              <h2 className="text-2xl font-display font-bold text-white mb-6">Academic Structure & Plan</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={labelBase}>Class Prefix</label>
                  <input type="text" name="classPrefix" value={formData.classPrefix} onChange={handleInputChange} className={inputBase} placeholder="Grade / Form / Standard" />
                </div>
                <div>
                  <label className={labelBase}>Class Numbers (comma separated)</label>
                  <input type="text" name="classNumbers" value={formData.classNumbers} onChange={handleInputChange} className={inputBase} placeholder="1,2,3,4" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelBase}>Number of Streams & Stream Names (comma separated)</label>
                  <input type="text" name="streamNames" value={formData.streamNames} onChange={handleInputChange} className={inputBase} placeholder="North,South,East,West" />
                  <p className="text-xs text-sky-300/60 mt-1">
                    {formData.streamNames.split(',').filter(s => s.trim()).length} streams will be created per class.
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className={labelBase}>Subjects (comma separated)</label>
                  <textarea name="subjects" value={formData.subjects} onChange={handleInputChange} className={inputBase} rows={2} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelBase}>Subscription Plan</label>
                  <select name="plan" value={formData.plan} onChange={handleInputChange} className={inputBase}>
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <label className="flex items-start text-sm text-sky-100/80">
                  <input type="checkbox" name="acceptTerms" checked={formData.acceptTerms} onChange={handleInputChange}
                    className="h-4 w-4 mt-1 mr-3 text-gold-500 focus:ring-gold-400 border-sky-500/40 bg-navy-950 rounded" />
                  <span>
                    I accept the <a href="/terms" target="_blank" className="text-gold-400 hover:text-gold-300 underline">Terms of Service</a>.
                  </span>
                </label>
                <label className="flex items-start text-sm text-sky-100/80">
                  <input type="checkbox" name="acceptPrivacy" checked={formData.acceptPrivacy} onChange={handleInputChange}
                    className="h-4 w-4 mt-1 mr-3 text-gold-500 focus:ring-gold-400 border-sky-500/40 bg-navy-950 rounded" />
                  <span>
                    I have read and accept the <a href="/privacy" target="_blank" className="text-gold-400 hover:text-gold-300 underline">Privacy Policy</a>.
                  </span>
                </label>
              </div>

              <div className="flex justify-between mt-8">
                <button onClick={() => setStep(1)} className="px-6 py-3 border-2 border-sky-400/50 text-sky-300 rounded-lg hover:bg-sky-500/10 transition">
                  Back
                </button>
                <button onClick={handleSubmitApplication} disabled={loading}
                  className="px-6 py-3 bg-gold-gradient text-navy-950 font-semibold rounded-lg shadow-gold-glow hover:shadow-gold-glow-lg transition flex items-center disabled:opacity-50">
                  {loading ? 'Submitting...' : 'Submit Application'} <FaArrowRight className="ml-2" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-navy-900/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl shadow-inner-dark shadow-gold-glow p-8 text-center">
              <div className="w-20 h-20 bg-gold-500/15 border border-gold-500/40 rounded-full flex items-center justify-center mx-auto mb-6 shadow-gold-glow">
                <FaCheck className="text-3xl text-gold-400" />
              </div>
              <h2 className="text-3xl font-display font-bold text-white mb-3">Application Submitted!</h2>
              <p className="text-sky-100/70 mb-6 max-w-lg mx-auto">
                Our team will review your school information and begin building your branded mobile app.
                You can track progress from your dashboard.
              </p>
              <button onClick={() => navigate('/dashboard')}
                className="px-8 py-3 bg-gold-gradient text-navy-950 font-semibold rounded-lg shadow-gold-glow hover:shadow-gold-glow-lg transition">
                Go to Dashboard
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default Setup;
