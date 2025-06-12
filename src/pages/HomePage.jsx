import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { currentUser } = useAuth();
  // Extract first name from displayName or email
  let firstName = 'User';
  if (currentUser) {
    if (currentUser.displayName) {
      firstName = currentUser.displayName.split(' ')[0];
    } else if (currentUser.email) {
      firstName = currentUser.email.split('@')[0].split(/[._]/)[0];
      firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white relative overflow-hidden flex flex-col pt-20">
      {/* Animated Floating Bubbles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-10 left-1/4 w-16 h-16 bg-orange-200 rounded-full opacity-60 animate-bubble-slow" />
        <div className="absolute top-1/2 left-1/3 w-10 h-10 bg-pink-200 rounded-full opacity-50 animate-bubble-medium" />
        <div className="absolute bottom-10 right-1/4 w-20 h-20 bg-blue-200 rounded-full opacity-40 animate-bubble-fast" />
      </div>
      {/* Wavy Divider (animated) at the top */}
      <div className="absolute top-0 left-0 w-full z-10 animate-wave">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-24">
          <path fill="#fff" d="M0,64L48,74.7C96,85,192,107,288,117.3C384,128,480,128,576,117.3C672,107,768,85,864,90.7C960,96,1056,128,1152,138.7C1248,149,1344,139,1392,133.3L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" />
        </svg>
      </div>
      {/* Hero Section */}
      <div className="w-full max-w-5xl mx-auto mt-4 sm:mt-8 mb-4 sm:mb-6 scale-content">
        <div className="text-center">
          <h1 className="responsive-heading font-bold text-gray-900 mb-1 sm:mb-2 leading-tight">
            {firstName}, Welcome to Your Wellness Journey
          </h1>
          <p className="responsive-text text-gray-600 mb-2 sm:mb-4">
            Track your progress, discover insights, and take steps towards better mental health
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          {/* Start Survey Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            whileHover={{ scale: 1.05, rotate: -2 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg"
          >
            <motion.img src="/icons/assessment.svg" alt="Assessment" className="w-8 h-8 mb-6" whileHover={{ scale: 1.2, rotate: -8 }} transition={{ type: 'spring', stiffness: 300 }} />
            <h2 className="responsive-heading font-semibold text-gray-900 mb-4">Start Assessment</h2>
            <p className="responsive-text text-gray-600 mb-6">
              Begin your bi-weekly check-in to track your current state and receive personalized recommendations
            </p>
            <Link
              to="/survey"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors duration-300 shadow-md hover:shadow-lg responsive-text"
            >
              Begin Bi-Weekly Check-In
            </Link>
          </motion.div>
          {/* View Dashboard Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            whileHover={{ scale: 1.05, rotate: 2 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-lg"
          >
            <motion.img src="/icons/analytics.svg" alt="Analytics" className="w-8 h-8 mb-6" whileHover={{ scale: 1.2, rotate: 8 }} transition={{ type: 'spring', stiffness: 300 }} />
            <h2 className="responsive-heading font-semibold text-gray-900 mb-4">View Analytics</h2>
            <p className="responsive-text text-gray-600 mb-6">
              Explore your progress over time with detailed insights and visual reports
            </p>
            <Link
              to="/dashboard"
              className="inline-block px-6 py-3 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-colors duration-300 shadow-md hover:shadow-lg responsive-text"
            >
              View Analytics
            </Link>
          </motion.div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 md:pb-16 z-10 w-full">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 md:mt-16"
        >
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: '/icons/meditation.svg', title: 'Meditation', link: '/meditation' },
              { icon: '/icons/exercise.svg', title: 'Exercise', link: '/exercise' },
              { icon: '/icons/articles.svg', title: 'Articles', link: '/articles' },
              { icon: '/icons/community.svg', title: 'Community', link: '/community' }
            ].map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.08, rotate: index % 2 === 0 ? -2 : 2 }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <motion.img src={action.icon} alt={action.title} className="w-6 h-6 mb-4" whileHover={{ scale: 1.2, rotate: index % 2 === 0 ? -8 : 8 }} transition={{ type: 'spring', stiffness: 300 }} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                <Link
                  to={action.link}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Explore →
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage; 