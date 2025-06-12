import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, BellIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

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
        const checkinQuery = query(
          collection(db, 'checkins'),
          where('userId', '==', currentUser.uid),
          orderBy('completedAt', 'desc'),
          limit(1)
        );
        const snapshot = await getDocs(checkinQuery);
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          const lastDate = data.completedAt?.toDate();
          if (lastDate) {
            const now = new Date();
            const diffDays = (now - lastDate) / (1000 * 60 * 60 * 24);
            setCheckinDue(diffDays >= 13); // 13+ days triggers notification
          } else {
            setCheckinDue(true); // No date, show notification
          }
        } else {
          setCheckinDue(true); // No check-ins, show notification
        }
      } catch (err) {
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

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Dashboard', href: '/dashboard' },
  ];

  const homeRoute = currentUser ? '/home' : '/';

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <Link to={homeRoute} className="flex items-center gap-2">
              <img src="/manova-logo.png" alt="Manova Logo" className="h-12 md:h-16 w-auto transition-all duration-300" />
              <span className="text-3xl md:text-4xl font-medium tracking-wide text-blue-900 font-sans" style={{ letterSpacing: '0.02em' }}>
                MANOVA
              </span>
            </Link>
          </div>
          {/* Navigation Links */}
          <div className="hidden md:flex space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.name === 'Home' ? homeRoute : item.href}
                className={`font-sans font-semibold px-2 py-1 text-lg md:text-xl transition-colors relative ${location.pathname === item.href || (item.name === 'Home' && location.pathname === homeRoute) ? 'text-blue-600 after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 after:bg-blue-600 after:rounded-full' : 'text-gray-900 hover:text-blue-600'}`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          {/* Notification Icon & User Info */}
          <div className="hidden md:flex items-center space-x-4 relative">
            <button className="relative p-2 rounded-full hover:bg-blue-50 transition-colors" onClick={() => setShowNotif((v) => !v)}>
              <BellIcon className="h-7 w-7 text-blue-700" />
              {checkinDue && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            {/* Notification Dropdown */}
            {showNotif && checkinDue && (
              <div className="absolute right-0 mt-12 w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-50 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <BellIcon className="h-5 w-5 text-blue-700" />
                  <span className="font-semibold text-gray-800 text-base">Check-In Reminder</span>
                </div>
                <p className="text-gray-700 text-sm mb-2">It's time for your check-in! Stay on top of your wellness journey.</p>
                <Link to="/survey" className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors">Go to Check-In</Link>
              </div>
            )}
            {currentUser && (
              <span className="text-gray-700 text-base font-sans font-medium mr-2 truncate max-w-xs" title={currentUser.displayName || currentUser.email}>
                {currentUser.displayName || currentUser.email}
              </span>
            )}
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="btn text-base font-sans font-medium ml-2"
              >
                Logout
              </button>
            ) : (
              <Link to="/login" className="btn text-base font-sans font-medium ml-2">
                Login
              </Link>
            )}
          </div>
          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-full text-gray-900 hover:text-blue-600 focus:outline-none"
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
        <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} bg-white/90 rounded-b-xl shadow-lg mt-2 px-4 py-2`}>
          <div className="flex flex-col space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.name === 'Home' ? homeRoute : item.href}
                className="font-sans font-semibold text-gray-900 hover:text-blue-600 transition-colors px-2 py-1 text-lg"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <button className="relative p-2 rounded-full hover:bg-blue-50 transition-colors w-fit self-start" onClick={() => setShowNotif((v) => !v)}>
              <BellIcon className="h-7 w-7 text-blue-700" />
              {checkinDue && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            {showNotif && checkinDue && (
              <div className="absolute right-0 mt-12 w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-50 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <BellIcon className="h-5 w-5 text-blue-700" />
                  <span className="font-semibold text-gray-800 text-base">Check-In Reminder</span>
                </div>
                <p className="text-gray-700 text-sm mb-2">It's time for your check-in! Stay on top of your wellness journey.</p>
                <Link to="/survey" className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors">Go to Check-In</Link>
              </div>
            )}
            {currentUser ? (
              <button
                onClick={() => {
                  setIsOpen(false);
                  setTimeout(() => handleLogout(), 150);
                }}
                className="btn text-base font-sans font-medium w-full"
              >
                Logout
              </button>
            ) : (
              <Link to="/login" className="btn text-base font-sans font-medium w-full" onClick={() => setIsOpen(false)}>
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar; 