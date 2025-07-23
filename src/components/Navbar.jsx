import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, BellIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { getUserCheckins } from '../services/userSurveyHistory';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [checkinDue, setCheckinDue] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchLastCheckin = async () => {
      if (!currentUser) return;
      try {
        const checkins = await getUserCheckins(currentUser.uid);
        
        if (checkins.length > 0) {
          // Sort by completedAt and get the most recent
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
              setCheckinDue(diffDays >= 13); // 13+ days triggers notification
            } else {
              setCheckinDue(true); // No date, show notification
            }
          } else {
            setCheckinDue(true); // No check-ins with completedAt, show notification
          }
        } else {
          setCheckinDue(true); // No check-ins, show notification
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
      navigate('/'); // Redirect to landing page after logout
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Navigation links for authenticated users
  const authenticatedNavigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Survey', href: '/survey' },
    { name: 'Articles', href: '/articles' },
    { name: 'Community', href: '/community' },
  ];

  // Navigation links for landing page (unauthenticated users)
  const landingNavigation = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Blog', href: '#blog' },
  ];

  const homeRoute = currentUser ? '/home' : '/';
  const isLandingPage = location.pathname === '/';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100">
      <div className="w-full px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <Link to={homeRoute} className="flex items-center gap-2">
              <img src="/images/logo.svg" alt="Manova Logo" className="h-10 md:h-12 w-auto transition-all duration-300" />
              <span className="text-2xl md:text-3xl font-bold tracking-wide text-gray-900 font-sans">
                MANOVA
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            {currentUser ? (
              // Authenticated user navigation
              authenticatedNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`font-medium px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors relative group ${
                    location.pathname === item.href ? 'text-primary-600' : ''
                  }`}
                >
                  {item.name}
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${
                    location.pathname === item.href ? 'scale-x-100' : ''
                  }`}></span>
                </Link>
              ))
            ) : (
              // Landing page navigation
              landingNavigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="font-medium px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors relative group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                </a>
              ))
            )}
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser && (
              <>
                {/* Notification Icon */}
                <button 
                  className="relative p-2 rounded-full hover:bg-gray-100 transition-colors" 
                  onClick={() => setShowNotif((v) => !v)}
                >
                  <BellIcon className="h-6 w-6 text-gray-700" />
                  {checkinDue && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>
                
                {/* Notification Dropdown */}
                {showNotif && checkinDue && (
                  <div className="absolute right-0 mt-12 w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-50">
                    <div className="flex items-center gap-2 mb-2">
                      <BellIcon className="h-5 w-5 text-primary-600" />
                      <span className="font-semibold text-gray-800">Check-In Reminder</span>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">It's time for your check-in! Stay on top of your wellness journey.</p>
                    <Link 
                      to="/survey" 
                      className="inline-block mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium text-sm hover:bg-primary-700 transition-colors"
                    >
                      Go to Check-In
                    </Link>
                  </div>
                )}

                {/* User info */}
                <span className="text-gray-700 text-sm font-medium truncate max-w-xs" title={currentUser.displayName || currentUser.email}>
                  {currentUser.displayName || currentUser.email}
                </span>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            )}

            {/* Auth buttons for unauthenticated users */}
            {!currentUser && (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Signup
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none transition-colors"
            >
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} bg-white/95 backdrop-blur-md rounded-b-xl shadow-lg border border-gray-100 mt-2 px-4 py-4`}>
          <div className="flex flex-col space-y-3">
            {currentUser ? (
              // Authenticated user mobile menu
              <>
                {authenticatedNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="font-medium text-neutral-700 hover:text-primary-600 transition-colors px-2 py-2 rounded-lg hover:bg-neutral-50"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {/* Notification for mobile */}
                <button 
                  className="relative p-2 rounded-lg hover:bg-neutral-50 transition-colors w-fit self-start" 
                  onClick={() => setShowNotif((v) => !v)}
                >
                  <BellIcon className="h-6 w-6 text-gray-700" />
                  {checkinDue && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>

                {showNotif && checkinDue && (
                  <div className="bg-neutral-50 rounded-lg p-4 mt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <BellIcon className="h-5 w-5 text-primary-600" />
                      <span className="font-semibold text-gray-800 text-sm">Check-In Reminder</span>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">It's time for your check-in!</p>
                    <Link 
                      to="/survey" 
                      className="inline-block px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Go to Check-In
                    </Link>
                  </div>
                )}

                <button
                  onClick={() => {
                    setIsOpen(false);
                    setTimeout(() => handleLogout(), 150);
                  }}
                  className="text-left font-medium text-neutral-700 hover:text-primary-600 transition-colors px-2 py-2 rounded-lg hover:bg-neutral-50"
                >
                  Logout
                </button>
              </>
            ) : (
              // Landing page mobile menu
              <>
                {landingNavigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="font-medium text-neutral-700 hover:text-primary-600 transition-colors px-2 py-2 rounded-lg hover:bg-neutral-50"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                <div className="pt-2 border-t border-gray-200">
                  <Link 
                    to="/login" 
                    className="block font-medium text-neutral-700 hover:text-primary-600 transition-colors px-2 py-2 rounded-lg hover:bg-neutral-50"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="block font-medium text-neutral-700 hover:text-primary-600 transition-colors px-2 py-2 rounded-lg hover:bg-neutral-50"
                    onClick={() => setIsOpen(false)}
                  >
                    Signup
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar; 