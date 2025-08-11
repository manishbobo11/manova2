import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { buttonStyles, cardStyles, chipStyles, typography } from '../utils/designSystem';
import { 
  Sparkles, Brain, Heart, Calendar, Activity, Target, Award,
  MessageCircle, Phone, TrendingUp, TrendingDown, AlertTriangle,
  RefreshCw, BarChart3, Clock, Plus, Users, Star, Globe, X, Download,
  DollarSign, User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserCheckins, getLastCheckin } from '../services/userSurveyHistory';
import WellnessGraph from '../components/WellnessGraph';
import WellnessScore from '../components/WellnessScore';
import SarthiChatbox from '../components/SarthiChatbox';
import ChatHistoryWidget from '../components/ChatHistoryWidget';
import TherapistRecommendations from '../components/TherapistRecommendations';
import TherapistLandingSection from '../components/TherapistLandingSection';
import { ChatSessionProvider } from '../contexts/ChatSessionContext';
import html2pdf from 'html2pdf.js';

// CSS variables for exact Figma colors (matching landing page)
const cssVars = `
  :root {
    --primary-blue: #007CFF;
    --primary-blue-hover: #0066CC;
    --border-gray: #C5C5C5;
    --text-gray: #777;
    --border-light: #D8D8D8;
  }
`;

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Core state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allCheckins, setAllCheckins] = useState([]);
  const [viewPeriod, setViewPeriod] = useState(30); // 7, 30, or 90 days
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [showPastAssessments, setShowPastAssessments] = useState(false);
  const [assessmentData, setAssessmentData] = useState(null);
  const [loadingAssessment, setLoadingAssessment] = useState(false);
  const [surveyInsights, setSurveyInsights] = useState([]);
  const [realTimeInsights, setRealTimeInsights] = useState(null);
  
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

  // Add CSS variables on component mount
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = cssVars;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Handle resuming a chat session
  const handleResumeChat = (sessionId) => {
    console.log('🔄 Resuming chat session:', sessionId);
    setResumeSessionId(sessionId);
    setShowChatbot(true);
  };

  // Dynamic daily goals based on user's wellness level
  const dailyGoals = useMemo(() => {
    const goals = [];
    
    // Base goals for everyone
    goals.push({ id: 1, text: 'Take 5 deep breaths', icon: Brain, completed: false });
    
    // Wellness-based goals
    if (currentWellness.score < 6) {
      goals.push({ id: 2, text: 'Connect with someone you trust', icon: MessageCircle, completed: false });
      goals.push({ id: 3, text: '10 minutes of self-care', icon: Heart, completed: false });
              } else {
      goals.push({ id: 2, text: 'Practice gratitude for 3 things', icon: Heart, completed: false });
      goals.push({ id: 3, text: '15 minutes physical activity', icon: Activity, completed: false });
    }
    
    // Mood-based goals
    if (currentWellness.mood === 'very stressed' || currentWellness.mood === 'stressed') {
      goals.push({ id: 4, text: 'Take a calming break', icon: Clock, completed: false });
            } else {
      goals.push({ id: 4, text: 'Try something new today', icon: Star, completed: false });
    }
    
    return goals;
  }, [currentWellness.score, currentWellness.mood]);

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

  // Historical metrics calculation
  const historicalMetrics = useMemo(() => {
    if (!allCheckins || allCheckins.length === 0) {
      return {
        hasData: false,
        totalCheckins: 0,
        avgWellness: 0,
        avgStress: 0,
        checkInRate30d: 0,
        stabilityScore: 0
      };
    }

    const totalCheckins = allCheckins.length;
    
    // Calculate average wellness with fallback calculation
    const validWellnessScores = allCheckins.map(checkin => {
      let score = checkin.wellnessScore;
      if (!score && checkin.responses) {
        // Calculate from responses if wellness score is missing
        score = calculateWellnessScore(checkin.responses);
      }
      return score || 0;
    });
    
    const avgWellness = Math.round(
      validWellnessScores.reduce((sum, score) => sum + score, 0) / totalCheckins
    );
    
    const avgStress = Math.round(
      allCheckins.reduce((sum, checkin) => sum + (checkin.stressScore || 0), 0) / totalCheckins * 10
    ) / 10;
    
    // Calculate 30-day check-in rate
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCheckins = allCheckins.filter(checkin => 
      new Date(checkin.timestamp) > thirtyDaysAgo
    );
    const checkInRate30d = Math.round((recentCheckins.length / 30) * 100);
    
    // Calculate stability score (consistency in check-ins)
    const checkinDates = allCheckins.map(c => new Date(c.timestamp).toDateString());
    const uniqueDates = [...new Set(checkinDates)];
    const stabilityScore = Math.round((uniqueDates.length / Math.max(1, totalCheckins)) * 100);

            return {
      hasData: true,
      totalCheckins,
      avgWellness,
      avgStress,
      checkInRate30d,
      stabilityScore
    };
  }, [allCheckins]);

  // Filter checkins based on view period and ensure they have wellness scores
  const filteredCheckins = useMemo(() => {
    if (!allCheckins || allCheckins.length === 0) return [];
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - viewPeriod);
    
    return allCheckins
      .filter(checkin => new Date(checkin.timestamp) >= cutoffDate)
      .map(checkin => {
        // Ensure each checkin has a wellness score for graph display
        let wellnessScore = checkin.wellnessScore;
        if (!wellnessScore && checkin.responses) {
          wellnessScore = calculateWellnessScore(checkin.responses);
        }
        return {
          ...checkin,
          wellnessScore: wellnessScore || 0
        };
      })
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [allCheckins, viewPeriod]);

  // AI Insights based on real user data patterns
  const aiInsights = useMemo(() => {
    if (!historicalMetrics.hasData) return null;
    
    const { avgWellness, avgStress, totalCheckins, checkInRate30d } = historicalMetrics;
    let insight = '';
    let recommendations = [];
    
    // Generate insights based on actual data patterns
    if (avgWellness >= 8) {
      insight = `You're maintaining excellent wellness! Your average score of ${avgWellness}/10 across ${totalCheckins} check-ins shows strong emotional regulation.`;
      recommendations = ['Maintain current routine', 'Help others with your experience', 'Set new growth goals'];
    } else if (avgWellness >= 6) {
      insight = `Your wellness journey shows solid progress with an average of ${avgWellness}/10. You're building good habits with ${totalCheckins} total check-ins.`;
      recommendations = ['Strengthen daily practices', 'Explore new wellness areas', 'Track what works best'];
    } else if (avgWellness >= 4) {
      insight = `Your check-ins show you're working on improvement. With ${totalCheckins} data points, we can see patterns to build on.`;
      recommendations = ['Focus on stress management', 'Build consistent routines', 'Consider professional support'];
    } else {
      insight = `Your ${totalCheckins} check-ins show you're taking important steps. Every check-in helps build awareness and growth.`;
      recommendations = ['Prioritize self-care', 'Reach out for support', 'Celebrate small wins'];
    }
    
    // Add specific insights based on patterns
    if (checkInRate30d < 30) {
      recommendations.push('Try weekly check-ins');
    }
    
    // Analyze recent trends from actual data
    if (filteredCheckins.length >= 2) {
      const recent = filteredCheckins.slice(-2);
      const trend = recent[1].wellnessScore - recent[0].wellnessScore;
      if (trend > 1) {
        insight += ' Your recent trend shows positive improvement!';
      } else if (trend < -1) {
        recommendations.unshift('Focus on recent challenges');
      }
    }
    
    return {
      insight,
      recommendations: recommendations.slice(0, 3), // Limit to 3 recommendations
      basedOnCheckins: totalCheckins,
      avgScore: avgWellness,
      avgStress,
      trendAnalysis: filteredCheckins.length >= 2
    };
  }, [historicalMetrics, filteredCheckins]);

  // Helper functions
  const getUserDisplayName = () => {
    if (!currentUser) return 'User';
    return currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = getUserDisplayName();
    
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 17) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  };

  const loadAllCheckins = async (forceRefresh = false) => {
    if (!currentUser?.uid) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🔄 Loading check-ins for user ${currentUser.uid}${forceRefresh ? ' (forced refresh)' : ''}`);
      const checkins = await getUserCheckins(currentUser.uid);
      console.log(`✅ Loaded ${checkins.length} check-ins`);
      
      setAllCheckins(checkins);
      setLastUpdated(new Date());
      
      // Calculate current wellness from most recent check-in
      if (checkins && checkins.length > 0) {
        // Sort checkins by timestamp to get the most recent one
        const sortedCheckins = checkins.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        const latestCheckin = sortedCheckins[0];
        
        // Debug logging to inspect the data structure
        console.log('🔍 Latest check-in structure:', {
          id: latestCheckin.id,
          timestamp: latestCheckin.timestamp,
          wellnessScore: latestCheckin.wellnessScore,
          stressScore: latestCheckin.stressScore,
          mood: latestCheckin.mood,
          hasResponses: !!latestCheckin.responses,
          keys: Object.keys(latestCheckin)
        });
        
        // Calculate wellness score if not available (for backward compatibility)
        let wellnessScore = latestCheckin.wellnessScore;
        if (!wellnessScore && latestCheckin.responses) {
          // Calculate from responses if wellness score is missing
          wellnessScore = calculateWellnessScore(latestCheckin.responses);
          console.log('📊 Calculated wellness score from responses:', wellnessScore);
        }
        
        // Determine mood from various sources
        let mood = latestCheckin.mood || analyzeMood(latestCheckin.responses) || 'neutral';
        
        setCurrentWellness({
          score: wellnessScore || 0,
          mood: mood,
          lastCheckinDate: new Date(latestCheckin.timestamp)
        });
        
        console.log(`📊 Final wellness score set: ${wellnessScore || 0}, mood: ${mood}`);
      }
    } catch (err) {
      console.error('Error loading check-ins:', err);
      setError('Failed to load your wellness data. Please try again.');
        } finally {
      setLoading(false);
    }
  };

  const getNextCheckinInfo = () => {
    if (!currentWellness.lastCheckinDate) {
      return { daysUntil: 0, message: 'Start your journey' };
    }
    
    const now = new Date();
    const lastCheckin = new Date(currentWellness.lastCheckinDate);
    const daysSince = Math.floor((now - lastCheckin) / (1000 * 60 * 60 * 24));
    const daysUntil = Math.max(0, 7 - daysSince);
    
    if (daysUntil === 0) {
      return { daysUntil: 0, message: 'Due today' };
    } else if (daysUntil === 1) {
      return { daysUntil: 1, message: 'Due tomorrow' };
    } else {
      return { daysUntil, message: `${daysUntil} days away` };
    }
  };

  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      'very stressed': '😰',
      'stressed': '😟',
      'moderate': '😐',
      'managing well': '🙂',
      'positive': '😊',
      'neutral': '😐'
    };
    return moodEmojis[mood] || '😐';
  };

  const getWellnessColors = (score, mood) => {
    if (score >= 8) return 'from-emerald-500 to-green-600';
    if (score >= 6) return 'from-blue-500 to-indigo-600';
    if (score >= 4) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  // Function to format responses for domain scores (matches WellnessSurvey logic)
  const formatResponsesForWellnessScore = (responses, domainResponses) => {
    const domains = [
      { name: "Work & Career", icon: Activity },
      { name: "Personal Life", icon: Heart },
      { name: "Financial Stress", icon: DollarSign },
      { name: "Health", icon: Activity },
      { name: "Self-Worth & Identity", icon: User }
    ];

    if (domainResponses) {
      // Use domain responses if available
      return domains.map(domain => {
        const score = domainResponses[domain.name];
        return {
          domain: domain.name,
          score: Number(score) * 25 // Convert 0-4 scale to 0-100 percentage
        };
      }).filter(item => item.score !== undefined);
    } else if (responses) {
      // Fallback: calculate from raw responses
      const responseValues = Object.values(responses).map(v => Number(v || 0));
      const questionsPerDomain = Math.ceil(responseValues.length / domains.length);
      
      return domains.map((domain, domainIndex) => {
        const startIndex = domainIndex * questionsPerDomain;
        const endIndex = Math.min(startIndex + questionsPerDomain, responseValues.length);
        const domainResponses = responseValues.slice(startIndex, endIndex);
        
        if (domainResponses.length === 0) return null;
        
        const avgResponse = domainResponses.reduce((sum, val) => sum + val, 0) / domainResponses.length;
        const stressScore = (avgResponse / 4) * 100; // Convert 0-4 to 0-100
        
        return {
          domain: domain.name,
          score: Math.round(stressScore)
        };
      }).filter(Boolean);
    }
    
    return [];
  };

  // Function to generate recommendations based on domain scores
  const generateRecommendations = (domainScores, overallScore) => {
    const recommendations = [];
    const sortedDomains = domainScores.sort((a, b) => b.score - a.score);
    const topStressDomain = sortedDomains[0];
    
    if (overallScore < 4) {
      recommendations.push(`Your assessment indicates significant stress levels. Consider reaching out for professional support to develop personalized coping strategies.`);
      recommendations.push(`Focus on ${topStressDomain.domain} as your primary area of concern - this domain shows the highest stress levels.`);
    } else if (overallScore < 6) {
      recommendations.push(`Your wellness assessment shows some areas needing attention. Consider focusing on stress management techniques for ${topStressDomain.domain}.`);
      recommendations.push(`Explore mindfulness practices, regular exercise, or talking to a counselor to improve your overall well-being.`);
    } else if (overallScore < 8) {
      recommendations.push(`You're managing well overall! Pay attention to ${topStressDomain.domain} to maintain your positive wellness trajectory.`);
      recommendations.push(`Continue your current wellness practices and consider building stronger daily routines.`);
    } else {
      recommendations.push(`Excellent wellness management! You're thriving across most life domains.`);
      recommendations.push(`Maintain your current strategies and consider sharing your success with others who might benefit.`);
    }
    
    return recommendations;
  };

  // Function to generate summary message
  const generateSummaryMessage = (overallScore, topConcerns) => {
    if (overallScore >= 8) {
      return `🎉 Outstanding! You're maintaining exceptional wellness across all life domains. Your stress management strategies are highly effective, and you're demonstrating remarkable emotional resilience. Keep up the excellent work!`;
    } else if (overallScore >= 6) {
      return `✨ Great progress! You're managing your wellness effectively overall. Consider focusing your attention on the domains showing higher stress levels - small improvements here can significantly enhance your overall well-being.`;
    } else if (overallScore >= 4) {
      return `💡 Your assessment reveals some areas requiring attention. This is completely normal and shows great self-awareness. Consider exploring additional stress management techniques and don't hesitate to seek support when needed.`;
    } else {
      return `🤝 Your assessment indicates elevated stress levels across multiple life areas. This takes courage to acknowledge. Professional support can be incredibly valuable in developing personalized coping strategies and building resilience.`;
    }
  };

  // Function to handle viewing past assessments with real-time data fetching
  const handleViewPastAssessments = async () => {
    if (!currentUser?.uid) {
      console.error('No user ID available');
      return;
    }

    setLoadingAssessment(true);
    
    try {
      console.log('🔄 Fetching latest check-in data for assessment...');
      
      // Fetch the most recent check-in data
      const latestCheckin = await getLastCheckin(currentUser.uid);
      
      if (!latestCheckin) {
        console.warn('No check-in data found');
        setAssessmentData(null);
        setShowPastAssessments(true);
        setLoadingAssessment(false);
        return;
      }

      console.log('✅ Latest check-in data fetched:', {
        timestamp: latestCheckin.timestamp,
        wellnessScore: latestCheckin.wellnessScore,
        hasDomainResponses: !!latestCheckin.domainResponses,
        hasResponses: !!latestCheckin.responses
      });
      
      // Format domain scores for WellnessScore component
      const domainScores = formatResponsesForWellnessScore(
        latestCheckin.responses, 
        latestCheckin.domainResponses
      );
      
      // Calculate wellness score if not available
      let wellnessScore = latestCheckin.wellnessScore;
      if (!wellnessScore && latestCheckin.responses) {
        wellnessScore = calculateWellnessScore(latestCheckin.responses);
      }
      
      // Sort domains by stress level for recommendations
      const sortedDomains = domainScores.sort((a, b) => b.score - a.score);
      const topConcerns = sortedDomains.slice(0, 2);
      
      // Generate dynamic recommendations and summary
      const recommendations = generateRecommendations(domainScores, wellnessScore);
      const summaryMessage = generateSummaryMessage(wellnessScore, topConcerns);
      
      // Prepare comprehensive assessment data with real-time values
      const assessmentData = {
        // Core data
        domainScores,
        overallScore: wellnessScore || 0,
        mood: latestCheckin.mood || analyzeMood(latestCheckin.responses) || 'Managing Well',
        checkinDate: new Date(latestCheckin.timestamp),
        
        // Enhanced data
        recommendations,
        summary: summaryMessage,
        dominantEmotions: latestCheckin.dominantEmotions || {
          tone: wellnessScore >= 7 ? 'positive' : wellnessScore >= 5 ? 'neutral' : 'concerned',
          keywords: topConcerns.map(d => d.domain.toLowerCase().replace(' & ', ' '))
        },
        deepDiveSummaries: latestCheckin.deepDiveSummaries || {},
        
        // Raw data for reference
        latestCheckin
      };
      
      console.log('📊 Assessment data prepared:', {
        domainCount: domainScores.length,
        overallScore: assessmentData.overallScore,
        recommendationCount: recommendations.length,
        hasSummary: !!summaryMessage
      });
      
      setAssessmentData(assessmentData);
      setShowPastAssessments(true);
      
    } catch (error) {
      console.error('❌ Error fetching assessment data:', error);
      setError('Failed to load assessment data. Please try again.');
    } finally {
      setLoadingAssessment(false);
    }
  };

  // PDF download is now handled by the WellnessScore component itself

  // Load data on mount and when user changes
  useEffect(() => {
    if (currentUser?.uid) {
      loadAllCheckins();
    }
  }, [currentUser?.uid]);

  // Handle navigation from check-in completion
  useEffect(() => {
    if (location.state?.fromCheckin) {
      console.log('🎯 Detected navigation from check-in, refreshing data...');
      loadAllCheckins(true); // Force refresh
      
      // Show update notification
      setShowUpdateNotification(true);
      setTimeout(() => setShowUpdateNotification(false), 4000);
      
      // Clear the navigation state to prevent repeated refreshes
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.fromCheckin]);

  const nextCheckinInfo = getNextCheckinInfo();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="relative w-20 h-20 mx-auto mb-8"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 rounded-full border-4 border-[#D8D8D8]"></div>
            <div className="absolute inset-0 rounded-full border-4 border-[#007CFF] border-t-transparent"></div>
          </motion.div>
          <h2 className={`${typography.h3} mb-4`}>Loading your wellness dashboard...</h2>
          <p className={`${typography.body} font-medium`}>Analyzing your complete check-in history</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
  return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <motion.div 
          className="bg-white rounded-3xl p-12 shadow-lg border border-[#D8D8D8] text-center max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className={`${typography.h3} mb-4`}>Unable to load dashboard</h2>
          <p className={`${typography.body} mb-6 font-medium`}>{error}</p>
          <motion.button 
            onClick={() => loadAllCheckins(true)}
            className={`${buttonStyles.primary} flex items-center space-x-3 mx-auto`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className="w-5 h-5" />
            <span>Try Again</span>
          </motion.button>
        </motion.div>
        </div>
    );
  }

  // Debug logging removed - dashboard ready for production

  // Empty state - no check-ins
  if (!historicalMetrics.hasData) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="w-full max-w-[1440px] mx-auto px-4 py-8">
          <motion.div 
            className="flex justify-between items-start mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={`${cardStyles.base} rounded-2xl`}>
              <h1 className={`${typography.h1} mb-3`}>{getGreeting()}</h1>
              <p className={`${typography.body} font-medium`}>{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
          <motion.button
              onClick={() => loadAllCheckins(true)}
              className={`${buttonStyles.outline} flex items-center space-x-3`}
              disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span className="font-medium">Refresh</span>
          </motion.button>
          </motion.div>

          <motion.div
            className="max-w-4xl mx-auto text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className={`${cardStyles.base} ${cardStyles.hover} relative overflow-hidden group rounded-2xl`}
              whileHover={{ y: -4, scale: 1.01 }}
            >
              <div className="w-20 h-20 on-brand bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Brain className="h-10 w-10 text-white" />
              </div>
              <h2 className={`${typography.h2} mb-6`}>Start your wellness journey</h2>
              <p className={`${typography.bodyLarge} mb-8`}>
                Complete your first check-in to track your wellness progress and get personalized insights.
              </p>
          <motion.button
                onClick={() => navigate('/survey')}
                className={`${buttonStyles.primary} text-lg`}
                style={{ 
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: '600'
                }}
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: '#1d4ed8'
                }}
                whileTap={{ scale: 0.95 }}
          >
                <span style={{ color: '#ffffff' }}>Take Your First Check-in</span>
          </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main dashboard with data - Clean Professional Design
  return (
    <>
      <div className="min-h-screen bg-neutral-50">
        {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="w-full max-w-[1440px] mx-auto px-4 py-4">
        <motion.div 
            className="flex justify-between items-center"
            initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">{getGreeting()}</h1>
              <p className="text-[#777]">{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
            <div className="flex items-center space-x-4">
              {currentWellness.lastCheckinDate && (
                <div className="text-right">
                  <p className="text-xs text-[#777]">Last check-in</p>
                  <p className="text-sm font-medium text-black flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {currentWellness.lastCheckinDate.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
              
              <motion.button
                onClick={() => loadAllCheckins(true)}
                className="px-4 py-2 rounded-2xl border border-[#C5C5C5] hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
                style={{ 
                  backgroundColor: '#ffffff',
                  color: '#374151'
                }}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} style={{ color: '#374151' }} />
                <span className="text-sm font-medium" style={{ color: '#374151' }}>Refresh</span>
              </motion.button>
          </div>
        </motion.div>
        </div>
      </div>

      {/* Update Notification */}
      {showUpdateNotification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-24 right-6 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-lg z-50 flex items-center space-x-3"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="font-medium">✨ Dashboard updated with your latest check-in!</span>
        </motion.div>
      )}

      {/* Main Content - Professional Dashboard Layout */}
      <div className="max-w-[1440px] mx-auto px-4 py-10 grid grid-cols-12 gap-6 relative overflow-hidden">
        
        {/* Left Section - Main Dashboard Content (9 columns) */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          
          {/* Top Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Current Mood */}
              <motion.div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 transition-all hover:shadow-md hover:-translate-y-1"
            whileHover={{ y: -3 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#007CFF] rounded-2xl flex items-center justify-center shadow-sm">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
              <span className="text-3xl">{getMoodEmoji(currentWellness.mood)}</span>
                </div>
            <h3 className="font-semibold text-black mb-2">Current Mood</h3>
            <p className="text-sm text-[#777] capitalize">
              {currentWellness.mood.replace('_', ' ')}
                </p>
              </motion.div>

          {/* Check-in Rate */}
              <motion.div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 transition-all hover:shadow-md hover:-translate-y-1"
            whileHover={{ y: -3 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#007CFF] rounded-2xl flex items-center justify-center shadow-sm">
                    <Award className="w-6 h-6 text-white" />
                  </div>
              <span className="text-3xl font-bold text-black">{historicalMetrics.checkInRate30d}%</span>
                </div>
            <h3 className="font-semibold text-black mb-2">Check-in Rate</h3>
            <p className="text-sm text-[#777]">Last 30 days</p>
              </motion.div>

              {/* Next Check-in */}
              <motion.div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 transition-all hover:shadow-md hover:-translate-y-1"
            whileHover={{ y: -3 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#007CFF] rounded-2xl flex items-center justify-center shadow-sm">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
              <span className="text-xl font-bold text-black">
                {nextCheckinInfo.daysUntil > 0 ? `${nextCheckinInfo.daysUntil}d` : 'Today'}
                  </span>
                </div>
            <h3 className="font-semibold text-black mb-2">Next Check-in</h3>
            <p className="text-sm text-[#777]">{nextCheckinInfo.message}</p>
              </motion.div>
          </div>
          
          {/* Analytics Dashboard Section */}
            
            {/* Analytics Header */}
            <motion.div 
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
                    <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-black mb-1">Analytics Dashboard</h2>
                  <p className="text-sm text-[#777]">Track your wellness journey over time</p>
                </div>
                      <div className="flex items-center space-x-4">
                        <motion.button
                          onClick={handleViewPastAssessments}
                          disabled={loadingAssessment}
                          className="flex items-center space-x-2 px-4 py-2 rounded-2xl border transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50"
                          style={{ 
                            backgroundColor: '#ffffff',
                            color: '#007CFF',
                            borderColor: '#007CFF'
                          }}
                          whileHover={{ scale: loadingAssessment ? 1 : 1.02 }}
                          whileTap={{ scale: loadingAssessment ? 1 : 0.98 }}
                        >
                          {loadingAssessment ? (
                            <>
                              <div className="w-4 h-4 border-2 border-[#007CFF] border-t-transparent rounded-full animate-spin" />
                              <span style={{ color: '#007CFF' }}>Loading Assessment...</span>
                            </>
                          ) : (
                            <>
                              <Calendar className="w-4 h-4" style={{ color: '#007CFF' }} />
                              <span style={{ color: '#007CFF' }}>📅 View Past Assessments</span>
                            </>
                          )}
                        </motion.button>
                        
                        <div className="flex space-x-2">
                  {[7, 30, 90].map((period) => (
                    <motion.button
                            key={period}
                      onClick={() => setViewPeriod(period)}
                      className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200`}
                      style={viewPeriod === period ? {
                        backgroundColor: '#007CFF',
                        color: '#ffffff'
                      } : {
                        backgroundColor: '#ffffff',
                        color: '#374151',
                        border: '1px solid #C5C5C5'
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span style={{ color: viewPeriod === period ? '#ffffff' : '#374151' }}>{period}d</span>
                    </motion.button>
                        ))}
                        </div>
                      </div>
                    </div>
            </motion.div>

            {/* Historical Metrics Grid */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="bg-white rounded-3xl shadow-lg border border-[#D8D8D8] p-4 transition-all hover:shadow-xl hover:scale-105">
                        <div className="flex items-center justify-between">
                          <div>
                    <p className="text-xs text-[#777] uppercase tracking-wide font-medium">Avg Wellness</p>
                    <p className="text-2xl font-bold text-black">{historicalMetrics.avgWellness}</p>
                          </div>
                  <TrendingUp className="h-8 w-8 text-[#007CFF]" />
                        </div>
                <p className="text-xs text-[#777] mt-1">{historicalMetrics.totalCheckins} check-ins</p>
                      </div>
              
              <div className="bg-white rounded-3xl shadow-lg border border-[#D8D8D8] p-4 transition-all hover:shadow-xl hover:scale-105">
                        <div className="flex items-center justify-between">
                          <div>
                    <p className="text-xs text-[#777] uppercase tracking-wide font-medium">Avg Stress</p>
                    <p className="text-2xl font-bold text-black">{historicalMetrics.avgStress}</p>
                          </div>
                  <TrendingDown className="h-8 w-8 text-[#007CFF]" />
                        </div>
                <p className="text-xs text-[#777] mt-1">{historicalMetrics.totalCheckins} check-ins</p>
                      </div>
              
              <div className="bg-white rounded-3xl shadow-lg border border-[#D8D8D8] p-4 transition-all hover:shadow-xl hover:scale-105">
                        <div className="flex items-center justify-between">
                          <div>
                    <p className="text-xs text-[#777] uppercase tracking-wide font-medium">Total Data</p>
                    <p className="text-2xl font-bold text-black">{historicalMetrics.totalCheckins}</p>
                          </div>
                  <BarChart3 className="h-8 w-8 text-[#007CFF]" />
                        </div>
                <p className="text-xs text-[#777] mt-1">Historic records</p>
                      </div>
              
              <div className="bg-white rounded-3xl shadow-lg border border-[#D8D8D8] p-4 transition-all hover:shadow-xl hover:scale-105">
                        <div className="flex items-center justify-between">
                          <div>
                    <p className="text-xs text-[#777] uppercase tracking-wide font-medium">Stability</p>
                    <p className="text-2xl font-bold text-black">{historicalMetrics.stabilityScore}%</p>
                          </div>
                  <Target className="h-8 w-8 text-[#007CFF]" />
                        </div>
                <p className="text-xs text-[#777] mt-1">Consistency</p>
                      </div>
            </motion.div>

            {/* Wellness Trends Chart */}
            {filteredCheckins.length > 0 && (
              <motion.div 
                className="bg-white rounded-3xl shadow-lg border border-[#D8D8D8]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-black">
                        Wellness Trends
                      </h3>
                      <p className="text-sm text-[#777] mt-1">
                        {filteredCheckins.length} check-in{filteredCheckins.length !== 1 ? 's' : ''} • Last {viewPeriod} days
                      </p>
                    </div>
                    <div className="text-xs text-[#777] bg-gray-100 px-3 py-1 rounded-full">
                      {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
                      </div>
                      </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <WellnessGraph checkins={filteredCheckins} />
                    </div>
                  </div>
              </motion.div>
                )}

                {/* AI Insights */}
            {aiInsights && (
                <motion.div 
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#007CFF] rounded-2xl flex items-center justify-center mr-3 shadow-md">
                    <Brain className="w-6 h-6 text-white" />
                    </div>
                  <div>
                    <h3 className="text-lg font-bold text-black">AI Insights</h3>
                    <p className="text-xs text-[#777]">
                      Based on {aiInsights.basedOnCheckins} check-ins • Avg: {aiInsights.avgScore}/10
                    </p>
                  </div>
                </div>
                <p className="text-black mb-4 leading-relaxed">
                  {aiInsights.insight}
                  </p>
                  <div className="flex flex-wrap gap-2">
                  {aiInsights.recommendations.map(tag => (
                    <span 
                      key={tag} 
                      className="px-3 py-1 bg-blue-50 rounded-full text-xs font-medium text-[#007CFF] border border-blue-100"
                    >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
            )}

            {/* Past Assessments Section - Full Modal/Expandable View */}
            {showPastAssessments && (
              <motion.div
                id="past-assessments-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => setShowPastAssessments(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header with Close button */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-[#D8D8D8] flex-shrink-0">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-3xl font-bold text-black mb-2">
                          {assessmentData ? (
                            `Wellness Assessment - ${assessmentData.checkinDate.toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}`
                          ) : (
                            'Wellness Assessment'
                          )}
                        </h3>
                        <p className="text-[#777] text-lg">
                          {loadingAssessment ? (
                            'Loading your comprehensive wellness evaluation...'
                          ) : assessmentData ? (
                            'Your comprehensive wellness evaluation with AI insights and recommendations'
                          ) : (
                            'Assessment data from your latest check-in'
                          )}
                        </p>
                      </div>
                      <motion.button
                        onClick={() => setShowPastAssessments(false)}
                        className="flex items-center justify-center w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <X className="w-6 h-6 text-gray-700" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto">
                    {loadingAssessment ? (
                      // Loading State
                      <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                          <div className="w-16 h-16 border-4 border-[#007CFF] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                          <h3 className="text-xl font-semibold text-black mb-2">Loading Assessment Data</h3>
                          <p className="text-[#777]">Fetching your latest wellness check-in...</p>
                        </div>
                      </div>
                    ) : assessmentData && assessmentData.domainScores.length > 0 ? (
                      // Assessment Data Available
                      <div className="bg-white">
                        <div id="wellness-assessment-pdf" className="p-6">
                          <WellnessScore 
                            onViewDashboard={() => {
                              setShowPastAssessments(false);
                              // Already on dashboard, just close modal
                            }}
                            onTakeSurveyAgain={() => {
                              setShowPastAssessments(false);
                              navigate('/survey');
                            }}
                            className="min-h-0 bg-transparent shadow-none"
                          />
                        </div>
                      </div>
                    ) : (
                      // No Assessment Data Available
                      <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
                          <Calendar className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-black mb-4">No Assessment Data Available</h3>
                        <p className="text-[#777] text-lg mb-8 max-w-md mx-auto">
                          {assessmentData === null ? (
                            'No check-in data found. Take your first wellness assessment to see your comprehensive report.'
                          ) : (
                            'This check-in doesn\'t contain detailed wellness assessment data. Take a new assessment to see your comprehensive wellness report.'
                          )}
                        </p>
                        <motion.button
                          onClick={() => {
                            setShowPastAssessments(false);
                            navigate('/survey');
                          }}
                          className="px-8 py-4 bg-[#007CFF] hover:bg-[#0066CC] text-white rounded-2xl transition-all duration-300 text-lg font-semibold shadow-lg hover:shadow-xl"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Take Assessment
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
        </div>
        
        {/* Right Section - Support Tools (3 columns) */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
              {/* Daily Goals */}
                <motion.div 
                className="w-full bg-white rounded-xl shadow-md border border-gray-200 p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                >
              <h3 className="text-lg font-bold text-black mb-4">Daily Goals</h3>
                  <div className="space-y-3">
                    {dailyGoals.map(goal => (
                  <div 
                        key={goal.id}
                    className={`flex items-center space-x-3 p-3 rounded-2xl transition-colors hover:scale-105 ${
                      goal.completed ? 'bg-green-50 border border-green-100' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                      goal.completed ? 'bg-green-500' : 'bg-[#007CFF]'
                    }`}>
                      <goal.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className={`flex-1 text-sm font-medium ${
                      goal.completed ? 'text-green-800' : 'text-black'
                        }`}>
                          {goal.text}
                        </span>
                    {goal.completed && (
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                    ))}
                  </div>
                </motion.div>

            {/* Crisis Support */}
                <motion.div 
              className="w-full bg-white rounded-xl shadow-md border border-gray-200 p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
                >
              <h3 className="text-lg font-bold text-black mb-3">Crisis Support</h3>
              <p className="text-sm text-[#777] mb-4">24/7 help available</p>
                      <motion.button
                onClick={() => window.open('tel:1800-599-0019', '_self')}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.99 }}
              >
                <Phone className="w-4 h-4" />
                <span>Call KIRAN 1800-599-0019</span>
                      </motion.button>
              <p className="text-xs text-[#777] mt-2 text-center">
                Free, confidential support
              </p>
                </motion.div>

            {/* Quick Actions */}
                <motion.div 
              className="w-full bg-white rounded-xl shadow-md border border-gray-200 p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <h3 className="text-lg font-bold text-black mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {/* Therapist CTA for low wellness scores */}
                {currentWellness.score < 6 && (
                  <motion.button
                    onClick={() => navigate('/therapist-booking')}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-2xl transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.99 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Users className="w-4 h-4" />
                    <span>Consult a Therapist</span>
                  </motion.button>
                )}
                <motion.button
                  onClick={() => navigate('/survey')}
                  className="w-full py-3 px-4 rounded-2xl transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 hover:scale-105"
                  style={{ 
                    backgroundColor: '#007CFF',
                    color: '#ffffff'
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    backgroundColor: '#0066CC'
                  }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: '#ffffff' }} />
                  <span style={{ color: '#ffffff' }}>Take Survey</span>
                </motion.button>
                <motion.button
                  onClick={() => setShowChatbot(true)}
                  className="w-full py-3 px-4 rounded-2xl transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 hover:scale-105"
                  style={{ 
                    backgroundColor: '#007CFF',
                    color: '#ffffff'
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    backgroundColor: '#0066CC'
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Heart className="w-4 h-4" style={{ color: '#ffffff' }} />
                  <span style={{ color: '#ffffff' }}>Chat with Sarthi</span>
                </motion.button>
                <motion.button
                  onClick={() => loadAllCheckins(true)}
                  className="w-full py-3 px-4 rounded-2xl border transition-colors text-sm font-semibold flex items-center justify-center space-x-2 hover:scale-105"
                  style={{ 
                    backgroundColor: '#ffffff',
                    color: '#374151',
                    border: '1px solid #C5C5C5'
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <RefreshCw className="w-4 h-4" style={{ color: '#374151' }} />
                  <span style={{ color: '#374151' }}>Refresh</span>
                </motion.button>
            </div>
          </motion.div>

          {/* Professional Therapy Card */}
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="w-full"
            >
              <TherapistLandingSection className="w-full" />
          </motion.div>
        </div>
      </div>

      {/* Update Notification */}
      {showUpdateNotification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-24 right-6 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-lg z-50 flex items-center space-x-3"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="font-medium">✨ Dashboard updated with your latest check-in!</span>
        </motion.div>
      )}


        {/* Manova Chatbot Modal */}
      {showChatbot && (
          <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          onClick={() => setShowChatbot(false)}
          >
            <motion.div
            className="bg-white rounded-none md:rounded-2xl shadow-2xl w-full max-w-[980px] md:max-w-[1040px] h-[92vh] md:h-[82vh] overflow-hidden flex flex-col"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex-1 overflow-hidden">
              <ChatSessionProvider 
                userId={currentUser?.uid}
                userContext={{
                  displayName: currentUser?.displayName,
                  email: currentUser?.email,
                  uid: currentUser?.uid
                }}
              >
                <SarthiChatbox 
                  userId={currentUser?.uid}
                  onClose={() => setShowChatbot(false)}
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
    </>
  );
};

export default DashboardPage;