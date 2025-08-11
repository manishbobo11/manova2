import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { testFirebaseConnection, checkNetworkStatus, logFirebaseConfig } from '../utils/firebaseTest';
import MoodPrompt from '../components/home/MoodPrompt';
import ToolsGrid from '../components/home/ToolsGrid';
import QuickTools from '../components/home/QuickTools';
import InsightsStrip from '../components/home/InsightsStrip';
import { homeContent } from '../content/home';

const HomePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Test Firebase connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      console.log('🔍 Testing Firebase connection on HomePage load...');
      checkNetworkStatus();
      logFirebaseConfig();
      
      try {
        const result = await testFirebaseConnection();
        if (!result.success) {
          console.warn('⚠️ Firebase connection issue detected:', result.message);
        }
      } catch (error) {
        console.error('❌ Firebase test failed:', error);
      }
    };
    
    testConnection();
  }, []);

  const getUserDisplayName = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName.split(' ')[0];
    }
    if (currentUser?.email) {
      const emailName = currentUser.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'friend';
  };

  const getDynamicGreeting = () => {
    const hour = new Date().getHours();
    const name = getUserDisplayName();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    
    return {
      text: `${greeting}, ${name}`,
      subtitle: homeContent.hero.subtitle,
    };
  };

  const greeting = getDynamicGreeting();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center"
        >
          <div>
            <motion.h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4">
              {greeting.text}
            </motion.h1>
            <motion.p className="text-lg md:text-xl text-slate-600 mb-6">
              {greeting.subtitle}
            </motion.p>
            <motion.div
              className="flex items-center space-x-2 text-slate-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-base font-medium">
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </motion.div>
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <button
                onClick={() => navigate(homeContent.hero.cta.href)}
                className="font-semibold py-3 px-6 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                style={{ 
                  backgroundColor: '#2563eb',
                  color: '#ffffff'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#2563eb';
                }}
              >
                <span style={{ color: '#ffffff' }}>{homeContent.hero.cta.label}</span>
              </button>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="bg-white rounded-lg shadow-sm ring-1 ring-slate-200 p-6 w-64 h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 flex items-center justify-center">
              <span className="text-6xl" aria-label="avatar">🧑‍💻</span>
            </div>
          </motion.div>
        </motion.section>

        {/* Mood Prompt Section */}
        <section className="mx-auto max-w-6xl px-6 mt-6">
          <MoodPrompt />
        </section>

        {/* Tools Grid Section */}
        <section className="mx-auto max-w-6xl px-6 mt-8">
          <ToolsGrid />
        </section>

        {/* Quick Tools Section */}
        <section className="mx-auto max-w-6xl px-6 mt-10">
          <QuickTools />
        </section>

        {/* Insights Strip Section */}
        <section className="mx-auto max-w-6xl px-6 my-12">
          <InsightsStrip />
        </section>
      </div>
    </main>
  );
};

export default HomePage;