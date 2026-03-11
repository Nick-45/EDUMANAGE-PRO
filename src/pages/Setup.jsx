import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';
import Navbar from '../components/layout/Navbar';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaCloudUploadAlt, FaCheck, FaArrowRight } from 'react-icons/fa';

const planFeatures = {
  free: {
    attendanceModule: true,
    resultsModule: true
  },
  basic: {
    attendanceModule: true,
    resultsModule: true,
    exams: true,
    timetable: true
  },
  premium: {
    mpesaPayments: true,
    smsNotifications: true,
    attendanceModule: true,
    resultsModule: true,
    exams: true,
    timetable: true,
    libraryModule: true,
    transportModule: true
  },
  enterprise: {
    mpesaPayments: true,
    smsNotifications: true,
    emailNotifications: true,
    attendanceModule: true,
    resultsModule: true,
    exams: true,
    timetable: true,
    libraryModule: true,
    transportModule: true,
    hostelModule: true,
    inventory: true
  }
};

const Setup = () => {
  const { user } = useAuth();
  const { school, updateSchool, uploadLogo } = useSchool();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    motto: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo: null,
    primaryColor: '#1B5E20',
    secondaryColor: '#D4AF37',
    darkMode: true,
    plan: 'basic',
    classPrefix: 'Grade',
    classNumbers: '1,2,3',
    subjects: 'Mathematics,English,Kiswahili,Science'
  });

  const [logoPreview, setLogoPreview] = useState(null);

  /*
  LOAD SCHOOL DATA FROM CONTEXT
  (data created during signup)
  */

  useEffect(() => {
    if (!school) return;

    setFormData(prev => ({
      ...prev,
      name: school.identity?.name || school.schoolName || '',
      motto: school.identity?.motto || '',
      address: school.identity?.address || '',
      phone: school.identity?.phone || school.phone || '',
      email: school.identity?.email || school.email || '',
      website: school.identity?.website || '',
      primaryColor: school.theme?.primaryColor || '#1B5E20',
      secondaryColor: school.theme?.secondaryColor || '#D4AF37',
      darkMode: school.theme?.darkMode ?? true,
      plan: school.subscription?.plan || 'basic'
    }));

    if (school.identity?.logo) {
      setLogoPreview(school.identity.logo);
    }

  }, [school]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setFormData({
      ...formData,
      logo: file
    });

    setLogoPreview(URL.createObjectURL(file));
  };

  const generateClasses = (prefix, numbers) => {
    return numbers.split(',').map(num => ({
      id: num.trim(),
      name: `${prefix} ${num.trim()}`,
      sections: ["A", "B"]
    }));
  };

  const generateSubjects = (subjectString) => {
    return subjectString.split(',').map(sub => ({
      id: sub.trim().toLowerCase().replace(/\s/g, ''),
      name: sub.trim(),
      category: 'core'
    }));
  };

  const handleSaveSchool = async () => {
    setLoading(true);

    try {

      const classes = generateClasses(
        formData.classPrefix,
        formData.classNumbers
      );

      const subjects = generateSubjects(formData.subjects);

      const features = planFeatures[formData.plan];

      await updateSchool({
        identity: {
          name: formData.name,
          motto: formData.motto,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          website: formData.website
        },

        subscription: {
          plan: formData.plan,
          startDate: new Date().toISOString(),
          status: 'active'
        },

        academic: {
          classes,
          subjects
        },

        features,

        theme: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          darkMode: formData.darkMode
        }

      });

      if (formData.logo) {
        await uploadLogo(formData.logo);
      }

      toast.success("School configuration saved!");
      setStep(3);

    } catch (error) {

      toast.error(error.message || "Failed to save school");

    } finally {

      setLoading(false);

    }
  };

  const handleComplete = () => {
    navigate('/dashboard');
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">

          {/* Steps */}
          <div className="mb-8">

            <div className="flex items-center justify-between">

              {[1,2,3].map(i => (

                <div key={i} className="flex items-center flex-1">

                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold
                    ${i < step
                      ? 'bg-primary-600 text-white'
                      : i === step
                      ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                      : 'bg-gray-200 text-gray-600'}`}>

                    {i < step ? <FaCheck/> : i}

                  </div>

                  {i < 3 && (
                    <div className={`flex-1 h-1 mx-2 ${i < step ? 'bg-primary-600' : 'bg-gray-200'}`} />
                  )}

                </div>

              ))}

            </div>

            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>School Info</span>
              <span>Academic & Plan</span>
              <span>Complete</span>
            </div>

          </div>

          {/* STEP 1 */}

          {step === 1 && (

            <motion.div
              initial={{opacity:0,y:20}}
              animate={{opacity:1,y:0}}
              className="bg-white rounded-lg shadow-lg p-8"
            >

              <h2 className="text-2xl font-bold mb-6">
                School Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="School Name"
                  className="w-full px-4 py-2 border rounded-lg"
                />

                <input
                  type="text"
                  name="motto"
                  value={formData.motto}
                  onChange={handleInputChange}
                  placeholder="School Motto"
                  className="w-full px-4 py-2 border rounded-lg"
                />

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Address"
                  className="col-span-2 w-full px-4 py-2 border rounded-lg"
                />

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone"
                  className="w-full px-4 py-2 border rounded-lg"
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="w-full px-4 py-2 border rounded-lg"
                />

              </div>

              {/* LOGO */}

              <div className="mt-6">

                <div className="border-2 border-dashed border-gray-300 p-4 text-center rounded-lg">

                  {logoPreview
                    ? <img src={logoPreview} className="max-h-32 mx-auto mb-2"/>
                    : <FaCloudUploadAlt className="text-5xl text-gray-400 mx-auto mb-2"/>
                  }

                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />

                  <button
                    onClick={() => document.getElementById('logo').click()}
                    className="px-4 py-2 bg-gray-100 rounded-lg"
                  >
                    Choose Logo
                  </button>

                </div>

              </div>

              <div className="flex justify-end mt-6">

                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg flex items-center"
                >
                  Next Step
                  <FaArrowRight className="ml-2"/>
                </button>

              </div>

            </motion.div>

          )}

          {/* STEP 3 */}

          {step === 3 && (

            <motion.div
              initial={{opacity:0,y:20}}
              animate={{opacity:1,y:0}}
              className="bg-white rounded-lg shadow-lg p-8 text-center"
            >

              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCheck className="text-3xl text-green-600"/>
              </div>

              <h2 className="text-3xl font-bold mb-4">
                Setup Complete!
              </h2>

              <button
                onClick={handleComplete}
                className="px-8 py-3 bg-primary-600 text-white rounded-lg"
              >
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
