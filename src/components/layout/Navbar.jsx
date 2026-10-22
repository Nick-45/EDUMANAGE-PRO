import React, { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { Menu, Transition } from '@headlessui/react';
import { 
  FaUser, FaCog, FaSignOutAlt, FaBars, FaTimes, 
  FaShieldAlt, FaDownload, FaTachometerAlt
} from 'react-icons/fa';

const Navbar = () => {
  const { user, isAuthenticated, logout, isSuperAdmin } = useAuth();
  const { school } = useSchool();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  // Determine user display name and avatar
  const displayName = isSuperAdmin ? user?.name : (school?.identity?.name || user?.name || 'Admin');
  const schoolLogo = school?.identity?.logo;
  const initials = displayName?.charAt(0).toUpperCase() || 'A';

  // Check if we are on the homepage to show anchor links
  const isHomePage = location.pathname === '/';

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${
      scrolled 
        ? 'bg-navy-950/90 backdrop-blur-xl border-sky-500/20 py-2 shadow-lg' 
        : 'bg-navy-950/50 backdrop-blur-sm border-transparent py-4'
    }`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-navy-900 border border-gold-500/30 rounded-xl flex items-center justify-center p-1.5 group-hover:shadow-gold-glow transition-all">
            <img src="/logo192.png" alt="EduPriva" className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-bold text-2xl text-white tracking-wide">
            Edu<span className="text-gold-gradient">Priva</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          
          {/* Public Links (only show if not logged in) */}
          {!isAuthenticated && isHomePage && (
            <div className="flex items-center space-x-8 mr-4">
              <a href="#features" className="text-sky-100/70 hover:text-gold-400 transition font-medium">Features</a>
              <a href="#pricing" className="text-sky-100/70 hover:text-gold-400 transition font-medium">Pricing</a>
            </div>
          )}

          {/* User Profile Dropdown / Auth Buttons */}
          {isAuthenticated ? (
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-3 focus:outline-none bg-navy-900/50 border border-sky-500/20 hover:border-gold-500/40 px-2 py-1.5 rounded-full transition">
                <div className="w-8 h-8 rounded-full bg-navy-950 text-sky-400 flex items-center justify-center border border-sky-500/30 overflow-hidden">
                  {schoolLogo ? (
                    <img src={schoolLogo} alt="Logo" className="w-full h-full object-cover" />
                  ) : isSuperAdmin ? (
                    <FaShieldAlt className="text-gold-400" />
                  ) : (
                    <span className="font-bold text-sm">{initials}</span>
                  )}
                </div>
                <span className="text-sky-100 font-medium pr-2 text-sm max-w-[150px] truncate">
                  {displayName}
                </span>
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
                <Menu.Items className="absolute right-0 mt-3 w-56 bg-navy-900/95 backdrop-blur-xl border border-sky-500/30 rounded-xl shadow-2xl py-2 focus:outline-none">
                  <div className="px-4 py-2 border-b border-sky-500/20 mb-2">
                    <p className="text-xs text-sky-200/50 uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm font-semibold text-white truncate">{user?.email}</p>
                  </div>

                  {isSuperAdmin ? (
                    <Menu.Item>
                      {({ active }) => (
                        <Link to="/admin" className={`${active ? 'bg-sky-500/10 text-gold-400' : 'text-sky-100'} flex items-center px-4 py-2 text-sm transition`}>
                          <FaShieldAlt className="mr-3" /> Super Admin Panel
                        </Link>
                      )}
                    </Menu.Item>
                  ) : (
                    <>
                      <Menu.Item>
                        {({ active }) => (
                          <Link to="/dashboard" className={`${active ? 'bg-sky-500/10 text-gold-400' : 'text-sky-100'} flex items-center px-4 py-2 text-sm transition`}>
                            <FaTachometerAlt className="mr-3" /> Dashboard
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link to="/app-download" className={`${active ? 'bg-sky-500/10 text-gold-400' : 'text-sky-100'} flex items-center px-4 py-2 text-sm transition`}>
                            <FaDownload className="mr-3" /> My App
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link to="/settings" className={`${active ? 'bg-sky-500/10 text-gold-400' : 'text-sky-100'} flex items-center px-4 py-2 text-sm transition`}>
                            <FaCog className="mr-3" /> Settings
                          </Link>
                        )}
                      </Menu.Item>
                    </>
                  )}

                  <div className="border-t border-sky-500/20 mt-2 pt-2">
                    <Menu.Item>
                      {({ active }) => (
                        <button onClick={handleLogout} className={`${active ? 'bg-rose-500/10' : ''} flex items-center w-full text-left px-4 py-2 text-sm text-rose-400 transition`}>
                          <FaSignOutAlt className="mr-3" /> Sign Out
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2 border border-sky-500/30 text-sky-300 rounded-lg font-semibold hover:bg-sky-500/10 transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-5 py-2 bg-gold-gradient text-navy-950 rounded-lg font-bold shadow-gold-glow hover:shadow-gold-glow-lg transition"
              >
                Get Started
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-sky-300 hover:text-gold-400 p-2"
          >
            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navy-900 border-b border-sky-500/20 shadow-xl absolute w-full left-0">
          <div className="px-4 py-4 space-y-3 flex flex-col">
            {!isAuthenticated ? (
              <>
                {isHomePage && (
                  <>
                    <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sky-100 py-2 border-b border-sky-500/10">Features</a>
                    <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-sky-100 py-2 border-b border-sky-500/10">Pricing</a>
                  </>
                )}
                <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} className="text-left text-sky-100 py-2">Login</button>
                <button onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }} className="text-left text-gold-400 font-bold py-2 mt-2">Get Started</button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 py-2 border-b border-sky-500/10 mb-2">
                  <div className="w-10 h-10 rounded-full bg-navy-950 border border-sky-500/30 flex items-center justify-center text-sky-400 overflow-hidden">
                    {schoolLogo ? <img src={schoolLogo} alt="Logo" className="w-full h-full object-cover"/> : isSuperAdmin ? <FaShieldAlt className="text-gold-400"/> : <span>{initials}</span>}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{displayName}</div>
                    <div className="text-xs text-sky-200/50">{user?.email}</div>
                  </div>
                </div>
                {isSuperAdmin ? (
                  <button onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }} className="text-left text-gold-400 font-medium py-2">Super Admin Panel</button>
                ) : (
                  <>
                    <button onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }} className="text-left text-sky-100 py-2">Dashboard</button>
                    <button onClick={() => { navigate('/app-download'); setMobileMenuOpen(false); }} className="text-left text-sky-100 py-2">My App</button>
                    <button onClick={() => { navigate('/settings'); setMobileMenuOpen(false); }} className="text-left text-sky-100 py-2">Settings</button>
                  </>
                )}
                <button onClick={handleLogout} className="text-left text-rose-400 font-medium py-2 mt-2 border-t border-sky-500/10">Sign Out</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
