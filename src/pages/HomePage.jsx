import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart, ClipboardList, Activity, BookOpen, Users, Dumbbell,
  Heart, Brain, Sparkles, Calendar, ArrowRight, Star, Shield,
  Moon, Sun, Leaf, Wind, CloudRain, Sunrise, CheckCircle,
  Play, Pause, Volume2, VolumeX, Clock, Target, Award,
  MessageCircle, Phone, Mail, Instagram, Twitter, Facebook,
  ChevronDown, Plus, Minus, Quote, User, Eye, EyeOff
} from "lucide-react";
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedMood, setSelectedMood] = useState(null);
  const [showBreathing, setShowBreathing] = useState(false);
  
  const getUserDisplayName = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName.split(' ')[0];
    }
    if (currentUser?.email) {
      const emailName = currentUser.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'there';
  };

  const moods = [
    { emoji: '😊', label: 'Great', color: 'from-green-400 to-emerald-500' },
    { emoji: '🙂', label: 'Good', color: 'from-blue-400 to-blue-500' },
    { emoji: '😐', label: 'Okay', color: 'from-yellow-400 to-orange-500' },
    { emoji: '😔', label: 'Difficult', color: 'from-purple-400 to-purple-500' },
    { emoji: '😰', label: 'Anxious', color: 'from-red-400 to-red-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50/30">
      {/* Clean Header */}
      <div className="w-full px-4 sm:px-8 lg:px-16 py-12">
        <div className="max-w-[1440px] mx-auto w-full">
        <motion.div 
          className="w-full"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-3xl font-light text-gray-900">
                Hello, {getUserDisplayName()}
              </h1>
              <p className="text-gray-600 mt-1">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <BarChart className="w-6 h-6" />
            </button>
          </div>
        </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-8 lg:px-16">
        <div className="max-w-[1440px] mx-auto w-full">
          {/* Mood Check Section */}
          <motion.div 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-2xl font-light text-gray-900 mb-8 text-center">
              How are you feeling today?
            </h2>
            <div className="flex justify-center space-x-6">
              {moods.map((mood, index) => (
                <motion.button
                  key={mood.label}
                  onClick={() => setSelectedMood(mood)}
                  className={`group flex flex-col items-center space-y-2 p-4 rounded-2xl transition-all ${
                    selectedMood?.label === mood.label 
                      ? 'bg-white shadow-lg scale-105' 
                      : 'hover:bg-white/50'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-4xl">{mood.emoji}</span>
                  <span className="text-sm text-gray-700 font-medium">{mood.label}</span>
                </motion.button>
              ))}
            </div>
            {selectedMood && (
              <motion.div 
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-gray-600">
                  Thank you for sharing. {selectedMood.label === 'Difficult' || selectedMood.label === 'Anxious' 
                    ? "We're here to support you." 
                    : "Keep nurturing your well-being."}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Main Action Cards - Horizontal Layout */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Check-in Card */}
            <motion.div
              className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300"
              whileHover={{ y: -5 }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Daily Check-in</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Take a moment to reflect on your emotional well-being with our guided assessment.
              </p>
              <Link
                to="/survey"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <span>Start Check-in</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </motion.div>

            {/* Meditation Card */}
            <motion.div
              className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300"
              whileHover={{ y: -5 }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Meditation</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Find your calm with guided meditations designed to reduce stress and anxiety.
              </p>
              <Link
                to="/meditation"
                className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                <span>Start Session</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </motion.div>

            {/* Sleep Stories Card */}
            <motion.div
              className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300"
              whileHover={{ y: -5 }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Moon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Sleep Stories</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Drift off peacefully with soothing bedtime stories and calming soundscapes.
              </p>
              <button
                onClick={() => setShowBreathing(true)}
                className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                <span>Listen Tonight</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </motion.div>
          </motion.div>

          {/* Quick Tools Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-light text-gray-900 mb-8">Quick Tools</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <QuickAction 
                icon={<Wind className="w-6 h-6" />}
                title="Breathing"
                link="#"
              />
              <QuickAction 
                icon={<Activity className="w-6 h-6" />}
                title="Body Scan"
                link="/meditation"
              />
              <QuickAction 
                icon={<Leaf className="w-6 h-6" />}
                title="Nature Sounds"
                link="/meditation"
              />
              <QuickAction 
                icon={<Target className="w-6 h-6" />}
                title="Focus Music"
                link="/meditation"
              />
            </div>
          </motion.div>

          {/* Progress Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 mb-16"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Wellness Journey</h3>
                <p className="text-gray-600">You've been taking great care of yourself</p>
              </div>
              <Link
                to="/dashboard"
                className="bg-white text-gray-700 px-6 py-3 rounded-2xl font-medium hover:bg-gray-50 transition-colors shadow-sm"
              >
                View Progress
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <p className="text-3xl font-light text-gray-900">7</p>
                <p className="text-sm text-gray-600 mt-1">Day Streak</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-light text-gray-900">23</p>
                <p className="text-sm text-gray-600 mt-1">Sessions</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-light text-gray-900">4.5h</p>
                <p className="text-sm text-gray-600 mt-1">Total Time</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Breathing Modal */}
      <AnimatePresence>
        {showBreathing && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBreathing(false)}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Wind className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Take a Deep Breath</h3>
                <p className="text-gray-600 mb-8">Follow the circle as it expands and contracts</p>
                <button
                  onClick={() => setShowBreathing(false)}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// WellnessTool Component
const WellnessTool = ({ title, icon, link, color, bgColor }) => {
  return (
    <Link to={link}>
      <motion.div
        className={`bg-gradient-to-br ${bgColor} rounded-3xl p-6 border border-white/50 hover:shadow-lg transition-all duration-300 text-center group`}
        whileHover={{ y: -5, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          className={`w-12 h-12 bg-gradient-to-r ${color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300`}
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <div className="text-white">
            {icon}
          </div>
        </motion.div>
        <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
        <div className="flex items-center justify-center text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
          <span>Explore</span>
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </motion.div>
    </Link>
  );
};

// Legacy Card Component (kept for compatibility)
const Card = ({ icon, title, description, buttonText, buttonLink, buttonStyle }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col justify-between">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-primary-500">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <Link
        to={buttonLink}
        className={`inline-block px-4 py-2 text-white text-sm font-medium rounded-lg transition ${buttonStyle}`}
      >
        {buttonText}
      </Link>
    </div>
  );
};

// Legacy QuickAction Component (kept for compatibility)
const QuickAction = ({ title, icon, link }) => {
  return (
    <Link
      to={link}
      className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex flex-col items-center justify-center hover:shadow-md transition"
    >
      <div className="mb-3 text-indigo-500">{icon}</div>
      <h4 className="font-medium text-gray-800">{title}</h4>
      <span className="text-xs text-gray-500 mt-1">Explore →</span>
    </Link>
  );
};

export default HomePage;
