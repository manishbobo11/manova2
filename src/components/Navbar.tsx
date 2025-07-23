import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bars3Icon, BellIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

export default function Navigation({ currentPage, setCurrentPage }: { currentPage: string, setCurrentPage: (page: string) => void }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [checkinDue, setCheckinDue] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navigationLinks = [
    { name: 'Home', page: 'landing' },
    { name: 'Demo', page: 'demo' },
    { name: 'Meditation', page: 'meditation' },
    { name: 'Exercise', page: 'exercise' },
    { name: 'Articles', page: 'articles' },
    { name: 'Community', page: 'community' }
  ];

  const handleNavClick = (page: string) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };

  React.useEffect(() => {
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
            const diffDays = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
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

  const homeRoute = currentUser ? '/home' : '/';
  const isLandingPage = location.pathname === '/';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="w-full px-[5%] lg:px-[8%]">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => handleNavClick('landing')}
            whileHover={{ scale: 1.02 }}
          >
            <div className="h-16 w-16">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=64&h=64&fit=crop"
                alt="Manova Logo" 
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="font-semibold text-xl text-gray-900 tracking-tight">
              Manova
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigationLinks.map((link, index) => (
              <motion.button
                key={link.name}
                onClick={() => handleNavClick(link.page)}
                className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  currentPage === link.page
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50/50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {link.name}
                {currentPage === link.page && (
                  <motion.div
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"
                    layoutId="activeTab"
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <motion.button
              onClick={() => handleNavClick('login')}
              className="text-sm font-medium text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-blue-50/50"
              whileHover={{ scale: 1.05 }}
            >
              Log In
            </motion.button>
            <motion.button
              onClick={() => handleNavClick('signup')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              Get Started
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:text-blue-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="lg:hidden bg-white/98 backdrop-blur-md border-t border-gray-100 shadow-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="px-[5%] py-6 space-y-4">
              {navigationLinks.map((link, index) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.page)}
                  className={`block w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                    currentPage === link.page
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50/50'
                  }`}
                >
                  {link.name}
                </button>
              ))}
              
              <div className="flex flex-col space-y-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleNavClick('login')}
                  className="text-center text-base font-medium text-gray-700 hover:text-blue-600 px-4 py-3 rounded-xl transition-all duration-300"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNavClick('signup')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-base font-medium px-6 py-4 rounded-xl shadow-lg"
                >
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
} 