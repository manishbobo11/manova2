import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, Brain, Heart, Calendar, Activity, Target, Award,
  MessageCircle, Phone, TrendingUp, TrendingDown, AlertTriangle,
  RefreshCw, BarChart3, Clock, Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserCheckins } from '../services/userSurveyHistory';
import WellnessGraph from '../components/WellnessGraph';
import SarthiChatbox from '../components/SarthiChatbox';
import ChatHistoryWidget from '../components/ChatHistoryWidget';
import TherapistRecommendations from '../components/TherapistRecommendations';
import TherapistLandingSection from '../components/TherapistLandingSection';
import { ChatSessionProvider } from '../contexts/ChatSessionContext';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Core state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allCheckins, setAllCheckins] = useState([]);
  const [viewPeriod, setViewPeriod] = useState(30); // 7, 30, or 90 days
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Derived state for current wellness status
  const [currentWellness, setCurrentWellness] = useState({
    score: 0,
    mood: 'neutral',
    lastCheckinDate: null
  });
  
  // Chatbot state
  const [showChatbot, setShowChatbot] = useState(false);
  const [resumeSessionId, setResumeSessionId] = useState(null);
  const newChatFunctionRef = useRef(null);

  // Handle resuming a chat session
  const handleResumeChat = (sessionId) => {
    console.log('🔄 Resuming chat session:', sessionId);
    setResumeSessionId(sessionId);
    setShowChatbot(true);
  };

  // Daily goals (static for now as requested)
  const dailyGoals = [
    { id: 1, text: '10 minutes meditation', icon: Brain },
    { id: 2, text: 'Gratitude journaling', icon: Heart },
    { id: 3, text: '30 minutes walk', icon: Activity },
    { id: 4, text: 'Connect with a friend', icon: MessageCircle }
  ];

  // Helper functions for wellness calculations
  const calculateWellnessScore = (responses) => {
    try {
      if (!responses || Object.keys(responses).length === 0) return 0;
      const allResponses = Object.values(responses);
      if (allResponses.length === 0) return 0;
      
      const totalPossible = allResponses.length * 4;
      const actualScore = allResponses.reduce((sum, score) => sum + Number(score || 0), 0);
      const invertedScore = totalPossible - actualScore;
      const scoreOutOf10 = Math.round((invertedScore / totalPossible) * 10);
      return Math.max(1, Math.min(10, scoreOutOf10));
    } catch (err) {
      console.warn('Error calculating wellness score:', err);
      return 0;
    }
  };

  const calculateStressScore = (responses) => {
    try {
      if (!responses || Object.keys(responses).length === 0) return 0;
      const allResponses = Object.values(responses).map(v => Number(v || 0));
      if (allResponses.length === 0) return 0;
      
      const avgStress = allResponses.reduce((sum, score) => sum + score, 0) / allResponses.length;
      return Math.round(avgStress * 10) / 10;
    } catch (err) {
      console.warn('Error calculating stress score:', err);
      return 0;
    }
  };

  const analyzeMood = (responses) => {
    try {
      if (!responses || Object.keys(responses).length === 0) return 'neutral';
      
      const scores = Object.values(responses).map(v => Number(v || 0));
      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      
      if (avgScore > 3) return 'very stressed';
      if (avgScore > 2.5) return 'stressed';
      if (avgScore > 2) return 'moderate';
      if (avgScore > 1.5) return 'managing well';
      return 'positive';
    } catch (err) {
      console.warn('Error analyzing mood:', err);
      return 'neutral';
    }
  };

  // Memoized calculations for performance
  const historicalMetrics = useMemo(() => {
    try {
      if (!allCheckins || allCheckins.length === 0) {
        return {
          avgWellness: 0,
          avgStress: 0,
          totalCheckins: 0,
          stabilityScore: 0,
          checkInRate30d: 0,
          hasData: false
        };
      }

      // Calculate wellness and stress scores for all check-ins
      const wellnessScores = allCheckins
        .map(checkin => calculateWellnessScore(checkin.responses))
        .filter(score => score > 0);
      
      const stressScores = allCheckins
        .map(checkin => calculateStressScore(checkin.responses))
        .filter(score => score >= 0);

      // Calculate averages from ALL check-ins
      const avgWellness = wellnessScores.length > 0 ? 
        wellnessScores.reduce((a, b) => a + b, 0) / wellnessScores.length : 0;
      
      const avgStress = stressScores.length > 0 ? 
        stressScores.reduce((a, b) => a + b, 0) / stressScores.length : 0;
      
      // Calculate stability (consistency) from wellness scores
      let stabilityScore = 0;
      if (wellnessScores.length > 1) {
        const mean = avgWellness;
        const variance = wellnessScores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / wellnessScores.length;
        stabilityScore = Math.max(0, 100 - (variance * 10));
      } else if (wellnessScores.length === 1) {
        stabilityScore = 100; // Perfect stability with one data point
      }

      // Calculate 30-day check-in rate
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const recent30dCheckins = allCheckins.filter(checkin => {
        const checkinDate = checkin.timestamp?.toDate ? 
          checkin.timestamp.toDate() : 
          new Date(checkin.timestamp);
        return checkinDate >= thirtyDaysAgo;
      });
      const checkInRate30d = Math.min(100, Math.round((recent30dCheckins.length / 30) * 100));

      return {
        avgWellness: Math.round(avgWellness * 10) / 10,
        avgStress: Math.round(avgStress * 10) / 10,
        totalCheckins: allCheckins.length,
        stabilityScore: Math.round(stabilityScore),
        checkInRate30d,
        hasData: allCheckins.length > 0
      };
    } catch (err) {
      console.warn('Error calculating historical metrics:', err);
      return {
        avgWellness: 0,
        avgStress: 0,
        totalCheckins: 0,
        stabilityScore: 0,
        checkInRate30d: 0,
        hasData: false
      };
    }
  }, [allCheckins]);

  // Memoized filtered check-ins for view period
  const filteredCheckins = useMemo(() => {
    try {
      if (!allCheckins || allCheckins.length === 0) return [];
      
      const now = new Date();
      const cutoffDate = new Date(now.getTime() - viewPeriod * 24 * 60 * 60 * 1000);
      
      return allCheckins
        .filter(checkin => {
          const checkinDate = checkin.timestamp?.toDate ? 
            checkin.timestamp.toDate() : 
            new Date(checkin.timestamp);
          return checkinDate >= cutoffDate;
        })
        .sort((a, b) => {
          const aTime = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
          const bTime = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
          return aTime - bTime; // Ascending order for proper trend display
        });
    } catch (err) {
      console.warn('Error filtering check-ins:', err);
      return [];
    }
  }, [allCheckins, viewPeriod]);

  // Memoized AI insights based on last N check-ins
  const aiInsights = useMemo(() => {
    try {
      if (!allCheckins || allCheckins.length === 0) return null;
      
      // Use last 3 check-ins for insights, or all if less than 3
      const recentCheckins = allCheckins.slice(0, Math.min(3, allCheckins.length));
      
      // Calculate average wellness from recent check-ins
      const recentWellnessScores = recentCheckins
        .map(checkin => calculateWellnessScore(checkin.responses))
        .filter(score => score > 0);
      
      if (recentWellnessScores.length === 0) return null;
      
      const avgRecentWellness = recentWellnessScores.reduce((a, b) => a + b, 0) / recentWellnessScores.length;
      
      let insight = '';
      let recommendations = [];
      
      if (avgRecentWellness >= 8) {
        insight = "Your recent check-ins show excellent mental wellness! You're demonstrating strong emotional resilience and effective stress management strategies.";
        recommendations = ['Mindfulness', 'Social Connection', 'Maintain Routine'];
      } else if (avgRecentWellness >= 6) {
        insight = "Your wellness scores are in a good range. Your recent patterns suggest you're managing well overall, with some minor areas for growth.";
        recommendations = ['Exercise', 'Sleep Hygiene', 'Stress Management'];
      } else if (avgRecentWellness >= 4) {
        insight = "Your recent responses indicate some areas that could benefit from focused attention. Consider implementing structured self-care routines.";
        recommendations = ['Mindfulness', 'Exercise', 'Social Connection', 'Professional Support'];
      } else {
        insight = "Your recent check-ins indicate significant stress levels. It's important to prioritize your mental health and consider professional support.";
        recommendations = ['Professional Support', 'Crisis Resources', 'Mindfulness', 'Social Connection'];
      }
      
      return {
        insight,
        recommendations,
        basedOnCheckins: recentCheckins.length,
        avgScore: Math.round(avgRecentWellness * 10) / 10
      };
    } catch (err) {
      console.warn('Error generating AI insights:', err);
      return null;
    }
  }, [allCheckins]);

  // User display helpers
  const getUserDisplayName = () => {
    if (currentUser?.displayName) return currentUser.displayName;
    if (currentUser?.email) {
      const emailName = currentUser.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'User';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const userName = getUserDisplayName();
    if (hour < 12) return `Good morning, ${userName}! ☀️`;
    if (hour < 17) return `Good afternoon, ${userName}! 🌤️`;
    return `Good evening, ${userName}! 🌙`;
  };

  // Load full check-in array from Firestore
  const loadAllCheckins = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!currentUser?.uid) {
        throw new Error('User not authenticated');
      }

      console.log('📊 Loading full check-in history for user:', currentUser.uid);
      
      const checkinsData = await getUserCheckins(currentUser.uid);
      
      if (!Array.isArray(checkinsData)) {
        console.warn('Invalid check-ins data format:', checkinsData);
        setAllCheckins([]);
        return;
      }

      // Sort check-ins by timestamp (newest first)
      const sortedCheckins = checkinsData.sort((a, b) => {
        const aTime = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
        const bTime = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
        return bTime - aTime;
      });

      setAllCheckins(sortedCheckins);
      console.log(`✅ Loaded ${sortedCheckins.length} total check-ins`);

      // Set current wellness state from latest check-in
      if (sortedCheckins.length > 0) {
        const latestCheckin = sortedCheckins[0];
        if (latestCheckin.responses) {
          const score = calculateWellnessScore(latestCheckin.responses);
          const mood = analyzeMood(latestCheckin.responses);
          const lastDate = latestCheckin.timestamp?.toDate ? 
            latestCheckin.timestamp.toDate() : 
            new Date(latestCheckin.timestamp);
          
          setCurrentWellness({
            score,
            mood,
            lastCheckinDate: lastDate
          });
        }
      } else {
        setCurrentWellness({
          score: 0,
          mood: 'neutral',
          lastCheckinDate: null
        });
      }
    } catch (err) {
      console.error('Error loading check-ins:', err);
      setError(err.message);
      setAllCheckins([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate next check-in date
  const getNextCheckinInfo = () => {
    if (!currentWellness.lastCheckinDate) return { daysUntil: 0, message: 'Ready now' };
    
    const nextDate = new Date(currentWellness.lastCheckinDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const daysUntil = Math.max(0, Math.ceil((nextDate - now) / (1000 * 60 * 60 * 24)));
    
    return {
      daysUntil,
      message: daysUntil > 0 ? 'Stay consistent!' : 'Ready now'
    };
  };

  const nextCheckinInfo = getNextCheckinInfo();

  // Load data on component mount
  useEffect(() => {
    loadAllCheckins();
  }, [currentUser?.uid]);

  // Mood emoji mapping
  const getMoodEmoji = (mood) => {
    const emojiMap = {
      'very stressed': '😰',
      'stressed': '😟',
      'moderate': '😐',
      'managing well': '🙂',
      'positive': '😊',
      'neutral': '😐'
    };
    return emojiMap[mood] || '😐';
  };

  // Emotion-matching accent colors
  const getWellnessColors = (score, mood) => {
    if (score >= 8 || mood === 'positive' || mood === 'managing well') {
      return 'from-emerald-500 to-teal-600'; // Green for positive
    } else if (score >= 6 || mood === 'moderate') {
      return 'from-amber-500 to-orange-600'; // Orange for moderate
    } else if (mood === 'stressed' || mood === 'very stressed') {
      return 'from-rose-500 to-red-600'; // Red for stressed
    } else {
      return 'from-slate-500 to-gray-600'; // Gray for neutral/tired
    }
  };

  // Premium Loading state
  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Premium 3D Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        
        {/* Main content with backdrop blur */}
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <motion.div 
            className="backdrop-blur-lg bg-white/40 rounded-3xl p-12 shadow-xl border border-white/20 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="relative w-20 h-20 mx-auto mb-8"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-0 rounded-full border-4 border-blue-200/50"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </motion.div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">Loading your wellness dashboard...</h2>
            <p className="text-gray-700 font-medium">Analyzing your complete check-in history</p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Premium Error state
  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Premium 3D Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        
        {/* Main content with backdrop blur */}
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <motion.div 
            className="backdrop-blur-lg bg-white/40 rounded-3xl p-12 shadow-xl border border-white/20 text-center max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <AlertTriangle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-900 to-pink-900 bg-clip-text text-transparent mb-4">Unable to load dashboard</h2>
            <p className="text-gray-700 mb-6 font-medium">{error}</p>
            <motion.button 
              onClick={loadAllCheckins}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-2xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 flex items-center space-x-3 mx-auto font-bold shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-5 h-5" />
              <span>Try Again</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Premium Empty state - no check-ins
  if (!historicalMetrics.hasData) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Premium 3D Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        
        {/* Main content with backdrop blur */}
        <div className="relative z-10 w-full px-4 sm:px-8 lg:px-16 py-8">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="flex justify-between items-start mb-12"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="backdrop-blur-lg bg-white/40 rounded-3xl p-6 shadow-xl border border-white/20">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">{getGreeting()}</h1>
                <p className="text-gray-700 font-medium">{new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
              <motion.button 
                onClick={loadAllCheckins}
                className="backdrop-blur-lg bg-white/40 text-gray-700 px-6 py-3 rounded-2xl border border-white/20 hover:bg-white/60 transition-all duration-300 flex items-center space-x-3 shadow-xl hover:shadow-2xl"
                disabled={loading}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                <span className="font-medium">Refresh</span>
              </motion.button>
            </motion.div>

            <motion.div
              className="max-w-2xl mx-auto text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="backdrop-blur-lg bg-white/40 rounded-3xl p-12 shadow-xl border border-white/20 relative overflow-hidden group"
                whileHover={{ y: -4, scale: 1.01 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-3xl"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                    <Brain className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">Start your wellness journey</h2>
                  <p className="text-gray-700 mb-8 text-lg leading-relaxed">
                    Complete your first check-in to track your wellness progress and get personalized insights.
                  </p>
                  <motion.button
                    onClick={() => navigate('/survey')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Take Your First Check-in
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard with data - Full Screen Professional Design
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-[#edf4ff] via-[#fef9ff] to-[#e7fdf4] font-inter text-gray-800">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-purple-300/15 to-indigo-300/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-teal-300/15 to-cyan-300/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-r from-lavender-300/15 to-sky-300/15 rounded-full blur-3xl"></div>
      </div>
      
      {/* Full screen container */}
      <div className="relative z-10 w-full h-screen flex flex-col">
        {/* Fixed header bar */}
        <div className="flex-shrink-0 bg-white/70 backdrop-blur-xl border-b border-white/30 shadow-lg">
          <div className="w-full px-6 lg:px-8 py-4">
            <motion.div 
              className="flex justify-between items-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-indigo-800 to-purple-700 bg-clip-text text-transparent font-inter">{getGreeting()}</h1>
                <p className="text-sm text-gray-600 mt-1">{new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
              <div className="flex items-center space-x-4">
                {currentWellness.lastCheckinDate && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Last check-in</p>
                    <p className="text-sm font-medium text-gray-700 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {currentWellness.lastCheckinDate.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                
                {/* Theme Toggle */}
                <motion.button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 rounded-xl bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-white/80 transition-all duration-200 shadow-sm hover:shadow-md"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDarkMode ? (
                    <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </motion.button>

                <motion.button 
                  onClick={loadAllCheckins}
                  className="bg-white/90 text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:bg-white transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md hover:scale-105"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="text-sm font-medium">Refresh</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-6">
            
            {/* Top Row - 4 Summary Cards */}
            <div className="grid grid-cols-12 gap-6 mb-6">
              {/* Current Wellness Score */}
              <motion.div 
                className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-xl shadow-lg bg-white/70 backdrop-blur-xl p-4 border border-white/30 transition-all hover:shadow-2xl hover:bg-white/80 hover:scale-105"
                whileHover={{ y: -3, scale: 1.01 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${getWellnessColors(currentWellness.score, currentWellness.mood)} rounded-xl flex items-center justify-center shadow-sm`}>
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-neutral-900">{currentWellness.score}/10</span>
                </div>
                <h3 className="font-semibold text-gray-700 mb-2">Wellness Score</h3>
                <p className="text-sm text-gray-600">
                  {currentWellness.score >= 8 ? 'Excellent state' : 
                   currentWellness.score >= 6 ? 'Good wellness' : 
                   currentWellness.score >= 4 ? 'Needs attention' : 'Seek support'}
                </p>
              </motion.div>

              {/* Current Mood */}
              <motion.div 
                className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-xl shadow-lg bg-white/70 backdrop-blur-xl p-4 border border-white/30 transition-all hover:shadow-2xl hover:bg-white/80 hover:scale-105"
                whileHover={{ y: -3, scale: 1.01 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${getWellnessColors(currentWellness.score, currentWellness.mood)} rounded-xl flex items-center justify-center shadow-sm`}>
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl">{getMoodEmoji(currentWellness.mood)}</span>
                </div>
                <h3 className="font-semibold text-gray-700 mb-2">Current Mood</h3>
                <p className="text-sm text-gray-600 capitalize">
                  {currentWellness.mood.replace('_', ' ')}
                </p>
              </motion.div>

              {/* Check-in Rate */}
              <motion.div 
                className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-xl shadow-lg bg-white/70 backdrop-blur-xl p-4 border border-white/30 transition-all hover:shadow-2xl hover:bg-white/80 hover:scale-105"
                whileHover={{ y: -3, scale: 1.01 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-sm">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-neutral-900">{historicalMetrics.checkInRate30d}%</span>
                </div>
                <h3 className="font-semibold text-gray-700 mb-2">Check-in Rate</h3>
                <p className="text-sm text-gray-600">Last 30 days</p>
              </motion.div>

              {/* Next Check-in */}
              <motion.div 
                className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-xl shadow-lg bg-white/70 backdrop-blur-xl p-4 border border-white/30 transition-all hover:shadow-2xl hover:bg-white/80 hover:scale-105"
                whileHover={{ y: -3, scale: 1.01 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-neutral-900">
                    {nextCheckinInfo.daysUntil > 0 ? `${nextCheckinInfo.daysUntil}d` : 'Today'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-700 mb-2">Next Check-in</h3>
                <p className="text-sm text-gray-600">{nextCheckinInfo.message}</p>
              </motion.div>
            </div>

            {/* Middle Section - Main Content + Sidebar */}
            <div className="grid grid-cols-12 gap-6">
              {/* Left Column - 75% width (9 columns) */}
              <div className="col-span-12 xl:col-span-9 space-y-6">
                
                {/* Analytics Header */}
                <motion.div 
                  className="rounded-xl shadow-lg bg-white/70 backdrop-blur-xl p-6 border border-white/30 transition-all hover:shadow-2xl hover:bg-white/80"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">Analytics Dashboard</h2>
                      <p className="text-sm text-gray-600">Track your wellness journey over time</p>
                    </div>
                    <div className="flex space-x-2">
                      {[7, 30, 90].map((period) => (
                        <motion.button
                          key={period}
                          onClick={() => setViewPeriod(period)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 ${
                            viewPeriod === period
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {period}d
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Historical Metrics Grid */}
                <motion.div 
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <div className="rounded-xl shadow-lg bg-white/70 backdrop-blur-xl p-4 border border-white/30 transition-all hover:shadow-2xl hover:bg-white/80 hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">Avg Wellness</p>
                        <p className="text-2xl font-bold text-neutral-900">{historicalMetrics.avgWellness}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{historicalMetrics.totalCheckins} check-ins</p>
                  </div>
                  
                  <div className="rounded-xl shadow-lg bg-white/70 backdrop-blur-xl p-4 border border-white/30 transition-all hover:shadow-2xl hover:bg-white/80 hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">Avg Stress</p>
                        <p className="text-2xl font-bold text-neutral-900">{historicalMetrics.avgStress}</p>
                      </div>
                      <TrendingDown className="h-8 w-8 text-red-600" />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{historicalMetrics.totalCheckins} check-ins</p>
                  </div>
                  
                  <div className="rounded-xl shadow-lg bg-white/70 backdrop-blur-xl p-4 border border-white/30 transition-all hover:shadow-2xl hover:bg-white/80 hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">Total Data</p>
                        <p className="text-2xl font-bold text-neutral-900">{historicalMetrics.totalCheckins}</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Historic records</p>
                  </div>
                  
                  <div className="rounded-xl shadow-lg bg-white/70 backdrop-blur-xl p-4 border border-white/30 transition-all hover:shadow-2xl hover:bg-white/80 hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">Stability</p>
                        <p className="text-2xl font-bold text-neutral-900">{historicalMetrics.stabilityScore}%</p>
                      </div>
                      <Target className="h-8 w-8 text-purple-600" />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Consistency</p>
                  </div>
                </motion.div>

                {/* Wellness Trends Chart */}
                {filteredCheckins.length > 0 && (
                  <motion.div 
                    className="rounded-xl shadow-lg bg-white/70 backdrop-blur-xl border border-white/30 transition-all hover:shadow-2xl hover:bg-white/80"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            Wellness Trends
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {filteredCheckins.length} check-in{filteredCheckins.length !== 1 ? 's' : ''} • Last {viewPeriod} days
                          </p>
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          Updated {new Date().toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <WellnessGraph checkins={filteredCheckins} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* AI Insights */}
                {aiInsights && (
                  <motion.div 
                    className="rounded-xl shadow-lg bg-gradient-to-br from-purple-50/80 to-indigo-50/80 backdrop-blur-xl p-6 border border-white/30 transition-all hover:shadow-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-md">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">AI Insights</h3>
                        <p className="text-xs text-gray-600">
                          Based on {aiInsights.basedOnCheckins} check-ins • Avg: {aiInsights.avgScore}/10
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-800 mb-4 leading-relaxed">
                      {aiInsights.insight}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {aiInsights.recommendations.map(tag => (
                        <span 
                          key={tag} 
                          className="px-3 py-1 bg-white/80 rounded-full text-xs font-medium text-purple-800 shadow-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Right Column - 25% width (3 columns) */}
              <div className="col-span-12 xl:col-span-3 space-y-6">
                
                {/* Daily Goals */}
                <motion.div 
                  className="rounded-xl shadow-lg bg-white/70 backdrop-blur-xl p-6 border border-white/30 transition-all hover:shadow-2xl hover:bg-white/80"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Goals</h3>
                  <div className="space-y-3">
                    {dailyGoals.map(goal => (
                      <div 
                        key={goal.id}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors hover:scale-105"
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 shadow-sm">
                          <goal.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="flex-1 text-sm font-medium text-gray-800">
                          {goal.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Crisis Support */}
                <motion.div 
                  className="rounded-xl shadow-lg bg-gradient-to-br from-red-50/80 to-pink-50/80 backdrop-blur-xl p-6 border border-white/30 transition-all hover:shadow-2xl"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <h3 className="text-lg font-bold text-red-900 mb-3">Crisis Support</h3>
                  <p className="text-sm text-gray-700 mb-4">24/7 help available</p>
                  <motion.button 
                    onClick={() => window.open('tel:988', '_self')}
                    className="w-full bg-gradient-to-r from-red-400 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-red-500 hover:to-red-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call 988</span>
                  </motion.button>
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    Free, confidential support
                  </p>
                </motion.div>

                {/* Quick Actions */}
                <motion.div 
                  className="rounded-xl shadow-lg bg-white/70 backdrop-blur-xl p-6 border border-white/30 transition-all hover:shadow-2xl hover:bg-white/80"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <motion.button
                      onClick={() => navigate('/survey')}
                      className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 px-4 rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-teal-500/25 hover:shadow-xl hover:ring-2 hover:ring-teal-300 flex items-center justify-center space-x-2 hover:scale-105"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Take Survey</span>
                    </motion.button>
                    <motion.button
                      onClick={() => setShowChatbot(true)}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-purple-500/25 hover:shadow-2xl hover:ring-2 hover:ring-purple-300 flex items-center justify-center space-x-2 hover:scale-105"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Heart className="w-4 h-4" />
                      <span>Chat with Sarthi</span>
                    </motion.button>
                    <motion.button
                      onClick={loadAllCheckins}
                      className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors text-sm font-semibold flex items-center justify-center space-x-2 hover:scale-105"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Refresh</span>
                    </motion.button>
                  </div>
                </motion.div>

                {/* Therapist Landing Section */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <TherapistLandingSection />
                </motion.div>

                {/* Chat History Widget */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <ChatHistoryWidget 
                    userId={currentUser?.uid} 
                    onResumeChat={handleResumeChat}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manova Chatbot Modal */}
      {showChatbot && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowChatbot(false)}
        >
          <motion.div
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] max-h-[90vh] overflow-hidden flex flex-col mx-4 md:mx-0"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 md:px-6 border-b border-gray-200 bg-white shadow-sm rounded-t-lg z-10">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100">
                  <img 
                    src="/images/mascot.svg" 
                    alt="Sarthi Avatar"
                    className="w-10 h-10 object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800 truncate">
                    Sarthi – Your Emotional Wellness Companion
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Here to listen, understand, and support.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 flex-shrink-0">
                <motion.button
                  onClick={() => {
                    if (newChatFunctionRef.current) {
                      newChatFunctionRef.current();
                    } else {
                      console.log('New chat function not available yet');
                    }
                  }}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all shadow-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">New Chat</span>
                </motion.button>
                
                <button
                  onClick={() => setShowChatbot(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatSessionProvider userId={currentUser?.uid}>
                <SarthiChatbox 
                  userId={currentUser?.uid}
                  onNewChat={(startNewChatFn) => {
                    // Store the function reference to use in the header
                    newChatFunctionRef.current = startNewChatFn;
                  }}
                />
              </ChatSessionProvider>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardPage;