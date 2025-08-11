import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Bell, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserCheckins } from '../../services/userSurveyHistory';
import FeedbackModal from '../FeedbackModal';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [checkinDue, setCheckinDue] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle feedback modal
  const openFeedbackForm = () => {
    setIsFeedbackOpen(true);
  };

  // Check for check-in due notification
  useEffect(() => {
    const fetchLastCheckin = async () => {
      if (!currentUser) return;
      try {
        const checkins = await getUserCheckins(currentUser.uid);
        
        if (checkins.length > 0) {
          const sortedCheckins = checkins
            .filter(doc => doc.completedAt)
            .sort((a, b) => {
              const aTime = a.completedAt?.toDate ? a.completedAt.toDate() : new Date(a.completedAt);
              const bTime = b.completedAt?.toDate ? b.completedAt.toDate() : new Date(b.completedAt);
              return bTime - aTime;
            });
          
          if (sortedCheckins.length > 0) {
            const lastData = sortedCheckins[0];
            const lastDate = lastData.completedAt?.toDate ? lastData.completedAt.toDate() : new Date(lastData.completedAt);
            
            if (lastDate) {
              const now = new Date();
              const diffDays = (now - lastDate) / (1000 * 60 * 60 * 24);
              setCheckinDue(diffDays >= 13);
            } else {
              setCheckinDue(true);
            }
          } else {
            setCheckinDue(true);
          }
        } else {
          setCheckinDue(true);
        }
      } catch (err) {
        console.error('Error fetching last check-in:', err);
        setCheckinDue(false);
      }
    };
    fetchLastCheckin();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Navigation links for authenticated users
  const authenticatedNavigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Survey Insights', href: '/survey-insight' },
    { name: 'Survey', href: '/survey' },
    { name: 'Articles', href: '/articles' },
    { name: 'Community', href: '/community' },
    { name: 'Feedback', href: '#', action: openFeedbackForm },
  ];

  // Navigation links for landing page (unauthenticated users)
  const landingNavigation = [
    { name: 'About', href: '/about' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Support', href: '/support' },
    { name: 'Community', href: '/community-landing' },
  ];

  const isActiveLink = (href) => {
    return location.pathname === href;
  };

  return (
    <>
      {/* Main Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-white border-none">
        <div className="px-16 py-6 flex items-center justify-between">
          {/* Brand Text */}
          <Link to={currentUser ? "/home" : "/"} className="flex items-center">
            <h1 className="text-[48px] italic font-script text-[#1e3a8a] hover:text-[#1E40AF] transition-colors duration-300">
              Manova
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex gap-12 items-center">
            {currentUser ? (
              // Authenticated user navigation
              authenticatedNavigation.map((link) => (
                link.action ? (
                  <button
                    key={link.name}
                    onClick={link.action}
                    className="text-[18px] font-semibold text-[#111827] hover:text-[#2563EB] transition duration-200 flex items-center space-x-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{link.name}</span>
                  </button>
                ) : (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`text-[18px] font-semibold text-[#111827] hover:text-[#2563EB] transition duration-200 ${
                      isActiveLink(link.href)
                        ? 'text-[#2563EB]'
                        : ''
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              ))
            ) : (
              // Landing page navigation
              landingNavigation.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-[18px] font-semibold text-[#111827] hover:text-[#2563EB] transition duration-200 ${
                    isActiveLink(link.href)
                      ? 'text-[#2563EB]'
                      : ''
                  }`}
                >
                  {link.name}
                </Link>
              ))
            )}
          </div>

          {/* Desktop Right Side */}
          <div className="flex items-center justify-end">
            {currentUser ? (
              // Authenticated user buttons
              <div className="flex items-center space-x-8">
                {/* Notification Icon */}
                <button 
                  className="relative p-2 rounded-full hover:bg-blue-100 transition-colors" 
                  onClick={() => setShowNotif((v) => !v)}
                >
                  <Bell className="h-5 w-5 text-gray-700" />
                  {checkinDue && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>
                
                {/* Notification Dropdown */}
                {showNotif && checkinDue && (
                  <div className="absolute right-0 mt-12 w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Bell className="h-5 w-5 text-[#2563EB]" />
                      <span className="font-semibold text-gray-800">Check-In Reminder</span>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">It's time for your check-in! Stay on top of your wellness journey.</p>
                    <Link 
                      to="/survey" 
                      className="inline-block mt-2 px-4 py-2 bg-[#2563EB] text-white rounded-lg font-medium text-sm hover:bg-[#1d4ed8] transition-colors"
                    >
                      Go to Check-In
                    </Link>
                  </div>
                )}

                {/* User info */}
                <span className="text-gray-800 text-sm font-medium truncate max-w-xs" title={currentUser.displayName || currentUser.email}>
                  {currentUser.displayName || currentUser.email}
                </span>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-700 hover:text-[#2563EB] font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              // Unauthenticated user auth buttons
              <div className="flex items-center space-x-8">
                <Link
                  to="/login"
                  className="text-[16px] font-medium text-[#1e3a8a] hover:underline transition duration-200"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="ml-6 px-6 py-3 text-[16px] font-medium bg-[#2563eb] text-white rounded-full shadow-sm hover:bg-[#1e40af] transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-blue-100 transition-colors duration-300"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu */}
            <motion.div
              className="fixed top-[84px] left-0 right-0 bg-white z-50 lg:hidden border-none"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-full px-16 py-6">
                {/* Mobile Navigation Links */}
                <div className="space-y-4 mb-6">
                  {currentUser ? (
                    // Authenticated user mobile menu
                    authenticatedNavigation.map((link, index) => (
                      <motion.div
                        key={link.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {link.action ? (
                          <button
                            onClick={() => {
                              link.action();
                              setIsMobileMenuOpen(false);
                            }}
                            className="w-full flex items-center space-x-3 py-3 px-4 rounded-lg font-medium transition-all duration-300 text-gray-700 hover:text-[#2563EB] hover:bg-blue-100 text-left"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>{link.name}</span>
                          </button>
                        ) : (
                          <Link
                            to={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                              isActiveLink(link.href)
                                ? 'text-[#2563EB] bg-gray-50'
                                : 'text-gray-700 hover:text-[#2563EB] hover:bg-blue-100'
                            }`}
                          >
                            {link.name}
                          </Link>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    // Landing page mobile menu
                    landingNavigation.map((link, index) => (
                      <motion.div
                        key={link.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          to={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`block py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                            isActiveLink(link.href)
                              ? 'text-[#2563EB] bg-gray-50'
                              : 'text-gray-700 hover:text-[#2563EB] hover:bg-blue-100'
                          }`}
                        >
                          {link.name}
                        </Link>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Mobile Auth Buttons */}
                <div className="pt-4 border-t border-gray-200">
                  {currentUser ? (
                    // Authenticated user mobile buttons
                    <div className="space-y-3">
                      {/* Notification for mobile */}
                      <button 
                        className="relative p-3 rounded-lg hover:bg-blue-100 transition-colors w-full text-left flex items-center gap-3" 
                        onClick={() => setShowNotif((v) => !v)}
                      >
                        <Bell className="h-5 w-5 text-gray-700" />
                        {checkinDue && (
                          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                        <span className="font-medium text-[#111827]">Notifications</span>
                      </button>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-gray-700 hover:text-[#2563EB] font-medium transition-colors text-left"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    // Unauthenticated user mobile buttons
                    <div className="space-y-3">
                      <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full px-4 py-3 text-center text-[16px] text-[#1e3a8a] hover:underline font-medium transition-colors"
                      >
                        Log In
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full px-4 py-3 text-center text-[16px] bg-[#2563EB] text-white rounded-full font-medium hover:bg-[#1e40af] transition-colors shadow-sm"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />
    </>
  );
};

export default Navbar;