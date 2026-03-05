import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FaGraduationCap, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { school } = useSchool();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-lg py-2' : 'bg-transparent py-4'
    }`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center text-white text-xl">
            <FaGraduationCap />
          </div>
          <span className="font-display font-bold text-2xl bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
            EduManagerPro
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-gray-700 hover:text-primary-600 transition">Features</a>
          <a href="#pricing" className="text-gray-700 hover:text-primary-600 transition">Pricing</a>
          <a href="#testimonials" className="text-gray-700 hover:text-primary-600 transition">Testimonials</a>
          {isAuthenticated ? (
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-3 focus:outline-none">
                <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center">
                  {school?.logo ? (
                    <img src={school.logo} alt={school.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <span className="text-lg font-semibold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-gray-700 font-medium">{school?.name || user?.name}</span>
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/dashboard"
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } flex items-center px-4 py-2 text-sm text-gray-700`}
                      >
                        <FaUser className="mr-3" /> Dashboard
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/settings"
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } flex items-center px-4 py-2 text-sm text-gray-700`}
                      >
                        <FaCog className="mr-3" /> Settings
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } flex items-center w-full text-left px-4 py-2 text-sm text-red-600`}
                      >
                        <FaSignOutAlt className="mr-3" /> Logout
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          ) : (
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-5 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:shadow-lg transition"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
