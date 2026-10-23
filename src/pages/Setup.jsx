import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';
import Navbar from '../components/layout/Navbar';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaCloudUploadAlt, FaCheck, FaArrowRight, FaRocket, FaSyncAlt, FaCrown, FaGem } from 'react-icons/fa';

const SCHOOL_LEVELS = [
  { value: 'primary', label: 'Primary School' },
  { value: 'junior_school', label: 'Junior School' },
  { value: 'senior_school', label: 'Senior School' },
  { value: 'secondary', label: 'Secondary School' },
  { value: 'mixed', label: 'Mixed (Primary + Secondary)' },
];

const Setup = () => {
  const { user } = useAuth();
  const { school, submitApplication, updateSchool, uploadLogo } = useSchool();
  const navigate = useNavigate();

  const submitFn = submitApplication || updateSchool;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '', motto: '', address: '', pobox: '', phone: '', email: '', website: '',
    level: 'junior_school',
    classPrefix: 'Grade',
    classNumbers: '1,2,3',
    streamNames: 'North,South',
    subjects: 'Mathematics,English,Kiswahili,Science',
    // Subscription Model
    billingModel: 'one-time', // 'one-time' or 'termly'
    tier: 'basic', // 'basic', 'standard', 'premium'
    primaryColor: '#1B5E20',
    secondaryColor: '#D4AF37',
    darkMode: true,
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
      billingModel: school.subscription?.billingModel || 'one-time',
      tier: school.subscription?.tier || 'basic',
      primaryColor: school.theme?.primaryColor || '#1B5E20',
      secondaryColor: school.theme?.secondaryColor || '#D4AF37',
      darkMode: school.theme?.darkMode ?? true,
    }));
    if (school.identity?.logo) setLogoPreview(school.identity.logo);
  }, [school]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleModelChange = (model) => {
    setFormData({ ...formData, billingModel: model });
  };

  const handleTierChange = (tier) => {
    setFormData({ ...formData, tier });
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

    if (typeof submitFn !== 'function') {
      toast.error('School context is misconfigured. Please refresh.');
      return;
    }
    if (logoFile && typeof uploadLogo !== 'function') {
      toast.error('School context is misconfigured. Please refresh.');
      return;
    }

    setLoading(true);
    try {
      const classes = generateClasses(formData.classPrefix, formData.classNumbers, formData.streamNames);
      const subjects = generateSubjects(formData.subjects);

      // 1. Save the application with the new billing model and tier
      await submitFn({
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
        subscription: { 
          billingModel: formData.billingModel, // 'one-time' or 'termly'
          tier: formData.tier,                 // 'basic', 'standard', 'premium'
          status: 'pending' 
        },
        theme: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          darkMode: formData.darkMode
        },
        status: 'pending'
      });

      // 2. Upload the logo
      if (logoFile) {
        try {
          await uploadLogo(logoFile);
        } catch (logoErr) {
          console.error('Logo upload failed:', logoErr);
          toast.error('School saved, but logo upload failed. You can retry from Settings.');
        }
      }

      toast.success('Application submitted! Our team will review it shortly.');
      setStep(3);
    } catch (error) {
      toast.error(error?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const inputBase = 'w-full px-4 py-2 bg-navy-950/60 border border-sky-500/30 placeholder-sky-200/40 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 transition';
  const labelBase = 'block text-sm font-medium text-sky-100 mb-2';

  // Pricing data for display
  const tierDetails = {
    basic: { name: 'Basic', price: '45,000' },
    standard: { name: 'Standard', price: '55,000' },
    premium: { name: 'Premium', price: '75,000' }
  };

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

          {/* STEP 1: School Info */}
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

          {/* STEP 2: Academic & Plan */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-navy-900/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl shadow-inner-dark shadow-gold-glow p-8">
              <h2 className="text-2xl font-display font-bold text-white mb-6">Academic Structure</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div>
                  <label className={labelBase}>Class Prefix</label>
                  <input type="text" name="classPrefix" value={formData.classPrefix} onChange={handleInputChange} className={inputBase} placeholder="Grade / Form / Standard" />
                </div>
                <div>
                  <label className={labelBase}>Class Numbers (comma separated)</label>
                  <input type="text" name="classNumbers" value={formData.classNumbers} onChange={handleInputChange} className={inputBase} placeholder="1,2,3,4" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelBase}>Stream Names (comma separated)</label>
                  <input type="text" name="streamNames" value={formData.streamNames} onChange={handleInputChange} className={inputBase} placeholder="North,South,East,West" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelBase}>Subjects (comma separated)</label>
                  <textarea name="subjects" value={formData.subjects} onChange={handleInputChange} className={inputBase} rows={2} />
                </div>
              </div>

              <h2 className="text-2xl font-display font-bold text-white mb-6 border-t border-sky-500/20 pt-8">Select Your Plan</h2>
              
              <div className="space-y-6">
                {/* 1. Billing Model */}
                <div>
                  <label className={labelBase}>Business Model</label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div 
                      onClick={() => handleModelChange('one-time')}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.billingModel === 'one-time' ? 'border-gold-500 bg-gold-500/10 shadow-gold-glow' : 'border-sky-500/20 bg-navy-950/40 hover:border-sky-500/40'}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <FaRocket className={formData.billingModel === 'one-time' ? 'text-gold-400' : 'text-sky-400'} />
                        <h3 className="font-bold text-white">Customized System</h3>
                      </div>
                      <p className="text-xs text-sky-100/60">One-time setup fee + installation. Own the system forever.</p>
                    </div>
                    
                    <div 
                      onClick={() => handleModelChange('termly')}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.billingModel === 'termly' ? 'border-gold-500 bg-gold-500/10 shadow-gold-glow' : 'border-sky-500/20 bg-navy-950/40 hover:border-sky-500/40'}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <FaSyncAlt className={formData.billingModel === 'termly' ? 'text-gold-400' : 'text-sky-400'} />
                        <h3 className="font-bold text-white">Termly Subscription</h3>
                      </div>
                      <p className="text-xs text-sky-100/60">Pay KSh 45 per student, per term. Flexible recurring billing.</p>
                    </div>
                  </div>
                </div>

                {/* 2. Tier Selection (Only show if One-Time) */}
                {formData.billingModel === 'one-time' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                    <label className={labelBase}>Select Tier</label>
                    <div className="grid md:grid-cols-3 gap-4">
                      {['basic', 'standard', 'premium'].map((tierKey) => {
                        const details = tierDetails[tierKey];
                        const isSelected = formData.tier === tierKey;
                        return (
                          <div
                            key={tierKey}
                            onClick={() => handleTierChange(tierKey)}
                            className={`cursor-pointer p-4 rounded-xl border-2 text-center transition-all ${isSelected ? 'border-gold-500 bg-gold-500/10 shadow-gold-glow' : 'border-sky-500/20 bg-navy-950/40 hover:border-sky-500/40'}`}
                          >
                            <h3 className="font-bold text-white mb-1">{details.name}</h3>
                            <p className="text-gold-400 font-semibold">KSh {details.price}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* If Termly, show what they get */}
                {formData.billingModel === 'termly' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                    <div className="p-4 bg-navy-950/40 border border-sky-500/20 rounded-xl">
                      <p className="text-sm text-sky-100/80">
                        <strong className="text-white">Note:</strong> The termly subscription includes all <strong className="text-gold-400">Premium</strong> tier features. 
                        Your final invoice will be calculated based on your total student enrollment.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Legal Checkboxes */}
              <div className="mt-8 space-y-3 pt-6 border-t border-sky-500/20">
                <label className="flex items-start text-sm text-sky-100/80 cursor-pointer">
                  <input type="checkbox" name="acceptTerms" checked={formData.acceptTerms} onChange={handleInputChange}
                    className="h-4 w-4 mt-1 mr-3 text-gold-500 focus:ring-gold-400 border-sky-500/40 bg-navy-950 rounded cursor-pointer" />
                  <span>
                    I accept the <a href="/terms" target="_blank" className="text-gold-400 hover:text-gold-300 underline">Terms of Service</a>.
                  </span>
                </label>
                <label className="flex items-start text-sm text-sky-100/80 cursor-pointer">
                  <input type="checkbox" name="acceptPrivacy" checked={formData.acceptPrivacy} onChange={handleInputChange}
                    className="h-4 w-4 mt-1 mr-3 text-gold-500 focus:ring-gold-400 border-sky-500/40 bg-navy-950 rounded cursor-pointer" />
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

          {/* STEP 3: Complete */}
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
