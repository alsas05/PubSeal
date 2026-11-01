import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  ShieldAlert,
  CheckCircle2,
  Feather, 
  SearchCheck, 
  LayoutDashboard, 
  PlusCircle, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const navigate = useNavigate();
  const location = useLocation();

  // Scrollspy & scroll detection for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Detect active section on the landing page
      if (location.pathname === '/') {
        const howItWorks = document.getElementById('how-it-works');
        const features = document.getElementById('features');
        const scrollPos = window.scrollY + 180;

        if (features && scrollPos >= features.offsetTop) {
          setActiveSection('features');
        } else if (howItWorks && scrollPos >= howItWorks.offsetTop) {
          setActiveSection('how-it-works');
        } else {
          setActiveSection('home');
        }
      } else if (location.pathname === '/verify') {
        setActiveSection('verify');
      } else if (location.pathname === '/dashboard') {
        setActiveSection('dashboard');
      } else {
        setActiveSection(null);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  // Smooth scroll handler for anchor targets
  const handleNavClick = (e, sectionId) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);

    if (sectionId === 'home') {
      if (location.pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate('/');
      }
    } else if (sectionId === 'how-it-works' || sectionId === 'features') {
      if (location.pathname === '/') {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate(`/#${sectionId}`);
      }
    }
  };

  // Core navigation items
  const navItems = [
    { id: 'home', label: 'Home', type: 'scroll' },
    { id: 'how-it-works', label: 'How It Works', type: 'scroll' },
    { id: 'features', label: 'Features', type: 'scroll' },
    { id: 'verify', label: 'Verify Registry', type: 'route', path: '/verify', icon: SearchCheck },
    ...(isAuthenticated ? [{ id: 'dashboard', label: 'Dashboard', type: 'route', path: '/dashboard', icon: LayoutDashboard }] : [])
  ];

  // Active pill highlight target (hovered item takes precedence, otherwise current active section/page)
  const currentPillTarget = hoveredTab || activeSection;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-mocha-950/90 backdrop-blur-xl border-b border-gold-400/20 shadow-mocha-deep py-2.5 sm:py-3'
          : 'bg-mocha-950/75 backdrop-blur-md border-b border-mocha-800/80 py-3.5 sm:py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo & Brand with interactive spring hover */}
          <Link
            to="/"
            onClick={(e) => handleNavClick(e, 'home')}
            className="flex items-center space-x-3.5 group select-none"
          >
            <motion.div 
              whileHover={{ scale: 1.05, rotate: [0, -1, 1, 0] }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="relative flex items-center justify-center shrink-0"
            >
              <img
                src="/PubSeal_logo_gold_tight.png"
                alt="PubSeal Logo"
                className="h-13 sm:h-16 w-auto object-contain filter drop-shadow-[0_0_12px_rgba(203,159,84,0.45)] group-hover:drop-shadow-[0_0_20px_rgba(203,159,84,0.75)] transition-all duration-300"
              />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-wider text-mocha-50 group-hover:text-gold-300 transition-colors leading-tight">
                PUB<span className="text-gold-400">SEAL</span>
              </span>
              <span className="text-[10px] sm:text-[11px] tracking-widest uppercase font-mono text-gold-400/80 font-medium">
                Digital Ownership Registry
              </span>
            </div>
          </Link>

          {/* Interactive Floating Pill Bar with Animated Sliding Highlight (Aceternity UI inspired) */}
          <div className="hidden lg:flex items-center">
            <div 
              onMouseLeave={() => setHoveredTab(null)}
              className="relative flex items-center p-1.5 rounded-full bg-mocha-900/60 border border-mocha-800/90 backdrop-blur-md shadow-inner-gold space-x-1"
            >
              {navItems.map((item) => {
                const isCurrentActive = 
                  item.type === 'scroll' 
                    ? activeSection === item.id && location.pathname === '/'
                    : location.pathname === item.path;

                const isPillActive = currentPillTarget === item.id;
                const Icon = item.icon;

                return (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => setHoveredTab(item.id)}
                  >
                    {/* Animated Gliding Background Highlight */}
                    {isPillActive && (
                      <motion.div
                        layoutId="navbar-hover-pill"
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-gold-500/15 via-gold-400/20 to-gold-500/15 border border-gold-400/40 shadow-[0_0_15px_rgba(203,159,84,0.2)]"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}

                    {item.type === 'scroll' ? (
                      <button
                        type="button"
                        onClick={(e) => handleNavClick(e, item.id)}
                        className={`relative z-10 flex items-center space-x-1 px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-colors duration-200 ${
                          isCurrentActive
                            ? 'text-gold-300 font-semibold'
                            : 'text-mocha-200 hover:text-gold-100'
                        }`}
                      >
                        <span>{item.label}</span>
                        {isCurrentActive && (
                          <motion.span
                            layoutId="navbar-active-dot"
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gold-400 shadow-[0_0_8px_#cb9f54]"
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        )}
                      </button>
                    ) : (
                      <Link
                        to={item.path}
                        className={`relative z-10 flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-colors duration-200 ${
                          isCurrentActive
                            ? 'text-gold-300 font-semibold'
                            : 'text-mocha-200 hover:text-gold-100'
                        }`}
                      >
                        {Icon && <Icon className="w-3.5 h-3.5 text-gold-400" />}
                        <span>{item.label}</span>
                        {isCurrentActive && (
                          <motion.span
                            layoutId="navbar-active-dot"
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gold-400 shadow-[0_0_8px_#cb9f54]"
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        )}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Action CTA Buttons with Shimmer & Micro-Interactions */}
          <div className="hidden md:flex items-center space-x-3.5">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/register-work"
                    className="relative inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-gold-500 to-gold-400 text-mocha-950 shadow-md shadow-gold-500/20 hover:shadow-gold-glow transition-all duration-300 overflow-hidden group"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-mocha-950 transition-transform duration-300 group-hover:rotate-90" />
                    <span>Register Work</span>
                  </Link>
                </motion.div>

                {/* User Menu Dropdown */}
                <div className="relative">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-mocha-700 bg-mocha-900/80 hover:border-gold-400/50 transition-all text-xs text-mocha-200 hover:text-mocha-50 focus:outline-none"
                  >
                    <div className="w-7 h-7 rounded-full bg-gold-500/20 border border-gold-400/40 flex items-center justify-center text-xs font-serif font-bold text-gold-300">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'W'}
                    </div>
                    <span className="max-w-[110px] truncate font-medium">
                      {user?.name || 'Writer'}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-gold-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </motion.button>

                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl bg-mocha-950 border border-mocha-700/80 shadow-2xl py-2 z-50 text-xs backdrop-blur-xl"
                      >
                        <div className="px-4 py-2.5 border-b border-mocha-800 space-y-1">
                          <p className="font-medium text-mocha-100 truncate">{user?.name}</p>
                          <p className="text-[11px] text-mocha-400 truncate">{user?.email}</p>
                          <div className="pt-1">
                            {user?.isEmailVerified ? (
                              <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950/70 text-emerald-300 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Verified Author</span>
                              </span>
                            ) : (
                              <Link
                                to="/register?verify=true"
                                onClick={() => setUserDropdownOpen(false)}
                                className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-950/70 text-amber-300 border border-amber-500/40 hover:bg-amber-900/60 transition-colors"
                              >
                                <ShieldAlert className="w-3 h-3 text-amber-400" />
                                <span>Unverified • Verify Now</span>
                              </Link>
                            )}
                          </div>
                        </div>
                        <Link
                          to="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2.5 text-mocha-200 hover:bg-mocha-900 hover:text-gold-300 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-gold-400" />
                          <span>My Registered Works</span>
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2.5 text-mocha-200 hover:bg-mocha-900 hover:text-gold-300 transition-colors"
                        >
                          <User className="w-4 h-4 text-gold-400" />
                          <span>Profile & Security</span>
                        </Link>
                        <div className="border-t border-mocha-800 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2.5 px-4 py-2 text-left text-red-300 hover:bg-red-950/30 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link
                    to="/login"
                    className="px-3.5 py-2 text-xs font-medium text-mocha-200 hover:text-gold-200 transition-colors"
                  >
                    Sign In
                  </Link>
                </motion.div>

                {/* Animated Shimmer Button for Get Started */}
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/register"
                    className="relative group inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 bg-[length:200%_auto] hover:bg-right text-mocha-950 shadow-md shadow-gold-500/25 hover:shadow-[0_0_20px_rgba(203,159,84,0.4)] transition-all duration-500 overflow-hidden"
                  >
                    {/* Animated Light Sweep Effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />
                    <Feather className="w-3.5 h-3.5 text-mocha-950 transition-transform duration-300 group-hover:-rotate-12" />
                    <span className="relative z-10 font-bold tracking-wide">Get Started</span>
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile menu toggle button */}
          <div className="lg:hidden flex items-center">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-mocha-300 hover:text-gold-400 hover:bg-mocha-900 focus:outline-none transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Animated Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="lg:hidden overflow-hidden bg-mocha-950/98 border-b border-mocha-800 px-5 pt-4 pb-7 space-y-2 backdrop-blur-2xl"
          >
            {navItems.map((item, idx) => {
              const isCurrentActive = 
                item.type === 'scroll' 
                  ? activeSection === item.id && location.pathname === '/'
                  : location.pathname === item.path;

              if (item.type === 'scroll') {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={(e) => handleNavClick(e, item.id)}
                    className={`w-full text-left flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isCurrentActive
                        ? 'text-gold-300 bg-mocha-900/90 font-semibold'
                        : 'text-mocha-200 hover:bg-mocha-900 hover:text-gold-400'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px] font-mono text-mocha-400">0{idx + 1}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isCurrentActive
                      ? 'text-gold-300 bg-mocha-900/90 font-semibold'
                      : 'text-mocha-200 hover:bg-mocha-900 hover:text-gold-400'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {item.icon && <item.icon className="w-4 h-4 text-gold-400" />}
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-mocha-400">0{idx + 1}</span>
                </Link>
              );
            })}

            {isAuthenticated ? (
              <div className="pt-2 border-t border-mocha-800 space-y-2">
                <Link
                  to="/register-work"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center px-3.5 py-2.5 rounded-xl text-sm font-semibold text-mocha-950 bg-gradient-to-r from-gold-500 to-gold-400 shadow-sm"
                >
                  + Register New Work
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3.5 py-2.5 rounded-xl text-sm font-medium text-mocha-200 hover:bg-mocha-900 hover:text-gold-400"
                >
                  Profile & Settings
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-300 hover:bg-red-950/30"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-3 flex flex-col space-y-2.5 border-t border-mocha-800">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 rounded-xl border border-mocha-700 text-mocha-200 text-sm hover:text-gold-300 hover:bg-mocha-900"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 text-mocha-950 font-semibold text-sm hover:from-gold-400 hover:to-gold-300 shadow-gold-glow"
                >
                  Get Started
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
