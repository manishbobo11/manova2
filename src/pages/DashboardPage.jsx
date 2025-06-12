import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Activity, Brain, Heart, Shield, Zap, 
  TrendingUp, AlertTriangle, MessageCircle, X, DollarSign, User, Phone, AlertCircle, Sparkles, Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, orderBy, limit, getDocs, onSnapshot, getDoc, doc } from 'firebase/firestore';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';

const DOMAIN_META = {
  work: { label: 'Work & Career', icon: Activity, color: 'from-green-400 to-green-100' },
  personal: { label: 'Personal Life', icon: Heart, color: 'from-blue-400 to-blue-100' },
  financial: { label: 'Financial Stress', icon: Shield, color: 'from-yellow-400 to-yellow-100' },
  health: { label: 'Health', icon: Zap, color: 'from-teal-400 to-teal-100' },
  identity: { label: 'Self-Worth & Identity', icon: Brain, color: 'from-purple-400 to-purple-100' },
};

const domains = [
  { name: 'Work & Career', icon: Brain, color: 'bg-blue-500', key: 'work' },
  { name: 'Personal Life', icon: Heart, color: 'bg-red-500', key: 'personal' },
  { name: 'Financial Stress', icon: DollarSign, color: 'bg-green-500', key: 'financial' },
  { name: 'Health', icon: Activity, color: 'bg-orange-500', key: 'health' },
  { name: 'Self-Worth & Identity', icon: User, color: 'bg-purple-500', key: 'identity' },
];

const getWellnessLevel = (score) => {
  if (score <= 25) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
  if (score <= 50) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
  if (score <= 75) return { level: 'Moderate Concern', color: 'text-yellow-600', bg: 'bg-yellow-100' };
  return { level: 'High Concern', color: 'text-red-600', bg: 'bg-red-100' };
};

function calculateWellnessScore(responses) {
  const allResponses = Object.values(responses);
  const totalPossible = allResponses.length * 4;
  const actualScore = allResponses.reduce((sum, score) => sum + Number(score), 0);
  const invertedScore = totalPossible - actualScore;
  const scoreOutOf10 = Math.round((invertedScore / totalPossible) * 10);
  return Math.max(1, scoreOutOf10);
}

function analyzeEmotionalState(responses) {
  const domainScores = domains.map((domain) => {
    const domainResponses = Object.entries(responses)
      .filter(([k]) => k.startsWith(domain.key + '_'))
      .map(([, v]) => Number(v));
    const average = domainResponses.length > 0 ? domainResponses.reduce((sum, score) => sum + score, 0) / domainResponses.length : 0;
    return { domain: domain.name, score: average };
  });
  const concerns = domainScores
    .filter(d => d.score >= 2.5)
    .sort((a, b) => b.score - a.score)
    .map(d => d.domain);
  const avgScore = domainScores.reduce((sum, d) => sum + d.score, 0) / domainScores.length;
  let mood = 'positive';
  if (avgScore > 3) mood = 'very stressed';
  else if (avgScore > 2.5) mood = 'stressed';
  else if (avgScore > 2) mood = 'moderate';
  else if (avgScore > 1.5) mood = 'managing well';
  return { mood, primaryConcerns: concerns, domainScores };
}

const moodForecast = 'Mood stable for next week.';

// Add MCP protocol logic
function getMCPStage(wellnessScore, sentiment) {
  if (wellnessScore <= 3) {
    return {
      stage: 'Escalate',
      message: 'High risk detected. Immediate professional support recommended.',
      color: 'bg-red-100 text-red-700'
    };
  }
  if (wellnessScore <= 6 || (sentiment.primaryConcerns && sentiment.primaryConcerns.length > 0)) {
    return {
      stage: 'Monitor',
      message: 'Moderate risk. Please monitor and consider self-care or peer support.',
      color: 'bg-yellow-100 text-yellow-700'
    };
  }
  return {
    stage: 'Self-Care',
    message: 'You are doing well. Keep up your self-care routines!',
    color: 'bg-green-100 text-green-700'
  };
}

// Personalized greeting function
function getPersonalizedGreeting(name, wellnessScore, sentiment) {
  if (wellnessScore >= 7) {
    return `Welcome back, ${name}! You're doing great. Keep up your self-care.`;
  }
  if (wellnessScore >= 5) {
    return `Hi ${name}, remember to take some time for yourself this week.`;
  }
  if (wellnessScore < 5) {
    return `Hi ${name}, we noticed you've had a tough week. We're here for you.`;
  }
  return `Welcome, ${name}!`;
}

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      type: 'bot',
      message: "Hi! I'm ARIA, your AI wellness companion. How can I help you today?",
      timestamp: new Date(),
      avatar: '🤖'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [responses, setResponses] = useState({});
  const [wellnessScore, setWellnessScore] = useState(0);
  const [sentiment, setSentiment] = useState({});
  const [lastCheckinDate, setLastCheckinDate] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [highestStressDomain, setHighestStressDomain] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mostCommonConcern, setMostCommonConcern] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  const [nextCheckin, setNextCheckin] = useState(null);
  const [completionRate, setCompletionRate] = useState(null);
  const [totalResponses, setTotalResponses] = useState(null);
  const [trendPeriod, setTrendPeriod] = useState(30);
  const [trendData, setTrendData] = useState([]);
  const [hasProactiveChat, setHasProactiveChat] = useState(false);
  const [deepDiveInsights, setDeepDiveInsights] = useState(null);
  const [loadingDeepDive, setLoadingDeepDive] = useState(true);

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      console.error('Firestore query aborted: userId is undefined', { currentUser });
      return;
    }
    console.log('Firestore query userId:', currentUser.uid);
    setLoading(true);
    const q = query(
        collection(db, 'checkins'),
        where('userId', '==', currentUser.uid),
        orderBy('completedAt', 'desc'),
        limit(1)
      );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setResponses(data.responses || {});
        setLastCheckinDate(data.completedAt?.toDate());
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (Object.keys(responses).length === 0) return;
    setWellnessScore(calculateWellnessScore(responses));
    setSentiment(analyzeEmotionalState(responses));
  }, [responses]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser || !currentUser.uid) {
        console.error('Firestore query aborted: userId is undefined', { currentUser });
        return;
      }
      console.log('Firestore query userId:', currentUser.uid);
      try {
        // Fetch last 5 check-ins for trend data
        const checkinQuery = query(
          collection(db, 'checkins'),
          where('userId', '==', currentUser.uid),
          orderBy('completedAt', 'desc'),
          limit(5)
        );
        
        const snapshot = await getDocs(checkinQuery);
        const docs = snapshot.docs.map(doc => doc.data());
        
        if (docs.length > 0) {
          // Process domain scores from latest check-in
          const latestResponses = docs[0].responses || {};
          const scores = {};
          let highestScore = 0;
          let highestDomain = null;
          
          Object.keys(DOMAIN_META).forEach(domain => {
            const values = Object.entries(latestResponses)
              .filter(([key]) => key.startsWith(domain + '_'))
              .map(([, value]) => Number(value));
              
            if (values.length > 0) {
              const avg = values.reduce((a, b) => a + b, 0) / values.length;
              const score = Math.round(avg * 20); // Convert 1-5 scale to 0-100%
              scores[domain] = score;
              
              if (score > highestScore) {
                highestScore = score;
                highestDomain = domain;
              }
            } else {
              scores[domain] = 0;
            }
          });
          
          setHighestStressDomain(highestDomain);
          
          // Prepare trend data
          const trend = docs.map((data, idx) => {
            const responses = data.responses || {};
            let sum = 0, count = 0;
            
            Object.keys(DOMAIN_META).forEach(domain => {
              const values = Object.entries(responses)
                .filter(([key]) => key.startsWith(domain + '_'))
                .map(([, value]) => Number(value));
                
              if (values.length > 0) {
                const avg = values.reduce((a, b) => a + b, 0) / values.length;
                sum += avg * 20;
                count++;
              }
            });
            
            const wellnessScore = count ? 10 - (sum / count) / 10 : 0;
            
          return {
            name: `Check-in ${docs.length - idx}`,
              wellness: wellnessScore,
              date: data.completedAt?.toDate().toLocaleDateString(),
          };
        }).reverse();
          
          setMonthlyTrend(trend);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      console.error('Firestore query aborted: userId is undefined', { currentUser });
      return;
    }
    console.log('Firestore query userId:', currentUser.uid);
    const fetchMonthlyCheckins = async () => {
      const now = new Date();
      const monthAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      const q = query(
        collection(db, 'checkins'),
        where('userId', '==', currentUser.uid),
        orderBy('completedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs
        .map(doc => doc.data())
        .filter(doc => doc.completedAt && doc.completedAt.toDate() >= monthAgo)
        .sort((a, b) => a.completedAt.toDate() - b.completedAt.toDate());
      const trend = docs.map((doc, idx) => ({
        date: doc.completedAt?.toDate().toLocaleDateString(),
        wellness: calculateWellnessScore(doc.responses || {})
      }));
      setMonthlyTrend(trend);
    };
    fetchMonthlyCheckins();
  }, [currentUser, responses]);

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      console.error('Firestore query aborted: userId is undefined', { currentUser });
      return;
    }
    console.log('Firestore query userId:', currentUser.uid);
    const fetchTrendData = async () => {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - trendPeriod);
      const q = query(
        collection(db, 'checkins'),
        where('userId', '==', currentUser.uid),
        orderBy('completedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs
        .map(doc => doc.data())
        .filter(doc => doc.completedAt && doc.completedAt.toDate() >= startDate)
        .sort((a, b) => a.completedAt.toDate() - b.completedAt.toDate());
      const trend = docs.map(doc => ({
        date: doc.completedAt?.toDate().toLocaleDateString(),
        wellness: calculateWellnessScore(doc.responses || {})
      }));
      setTrendData(trend);
    };
    fetchTrendData();
  }, [currentUser, trendPeriod]);

  const calculateDomainScore = (domainKey) => {
    const domain = domains.find(d => d.key === domainKey);
    const domainResponses = Object.entries(responses)
      .filter(([k]) => k.startsWith(domainKey + '_'))
      .map(([, v]) => Number(v));
    const average = domainResponses.length > 0 ? domainResponses.reduce((sum, score) => sum + score, 0) / domainResponses.length : 0;
    return Math.round(average * 25); // Convert to percentage
  };

  const wellnessLevel = getWellnessLevel(wellnessScore);

  // Extract username from email
  const username = currentUser?.email ? 
    currentUser.email.split('@')[0].replace(/\./g, ' ') : 'User';

  const userData = {
    name: username.charAt(0).toUpperCase() + username.slice(1),
    avatar: username.split(' ').map(n => n[0]).join('').toUpperCase()
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const userMessage = { 
      type: 'user', 
      message: newMessage, 
      timestamp: new Date(), 
      avatar: '👤' 
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // Simulate ARIA's response
    setTimeout(() => {
      const botResponse = {
        type: 'bot',
        message: "I understand your concerns. Let me help you with some personalized strategies. What's your immediate priority right now?",
        timestamp: new Date(),
        avatar: '🤖'
      };
      setChatMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  useEffect(() => {
    if (sentiment.primaryConcerns && sentiment.primaryConcerns.length > 0) {
      setMostCommonConcern(sentiment.primaryConcerns[0]);
    }
  }, [sentiment]);

  useEffect(() => {
    if (lastCheckinDate) {
      const responseTimeMs = new Date() - lastCheckinDate;
      const responseTimeMinutes = responseTimeMs / (1000 * 60);
      setResponseTime(responseTimeMinutes.toFixed(2));
    }
  }, [lastCheckinDate]);

  useEffect(() => {
    if (lastCheckinDate) {
      const nextCheckinDate = new Date(lastCheckinDate);
      nextCheckinDate.setDate(nextCheckinDate.getDate() + 7);
      const nextCheckinMs = nextCheckinDate - new Date();
      const nextCheckinMinutes = nextCheckinMs / (1000 * 60);
      setNextCheckin(nextCheckinMinutes.toFixed(2));
    }
  }, [lastCheckinDate]);

  useEffect(() => {
    if (responses) {
      const completionRate = (Object.keys(responses).length / 20) * 100;
      setCompletionRate(completionRate.toFixed(2));
    }
  }, [responses]);

  useEffect(() => {
    if (responses) {
      const totalResponses = Object.keys(responses).length;
      setTotalResponses(totalResponses);
    }
  }, [responses]);

  const stressLevelLabel = wellnessScore >= 7 ? 'low' : (wellnessScore >= 5 ? 'moderate' : 'high');

  // Add MCP protocol logic
  const mcp = getMCPStage(wellnessScore, sentiment);

  // MCP-based proactive chatbot engagement
  useEffect(() => {
    if (!sentiment.mood || hasProactiveChat) return;
    if (sentiment.mood === 'very stressed' || sentiment.mood === 'stressed') {
      setTimeout(() => {
        setChatOpen(true);
        setChatMessages(prev => [
          ...prev,
          {
            type: 'bot',
            message: `Hi ${userData.name}, I noticed you've been feeling ${sentiment.mood}. Would you like to talk or try a relaxation exercise?`,
            timestamp: new Date(),
            avatar: '🤖'
          }
        ]);
        setHasProactiveChat(true);
      }, 2000);
    } else if (sentiment.mood === 'positive') {
      setTimeout(() => {
        setChatOpen(true);
        setChatMessages(prev => [
          ...prev,
          {
            type: 'bot',
            message: `Keep up the great work, ${userData.name}! Want a new wellness tip?`,
            timestamp: new Date(),
            avatar: '🤖'
          }
        ]);
        setHasProactiveChat(true);
      }, 2000);
    }
  }, [sentiment.mood, userData.name, hasProactiveChat]);

  // Personalized greeting
  const greeting = getPersonalizedGreeting(userData.name, wellnessScore, sentiment);

  useEffect(() => {
    const fetchDeepDiveInsights = async () => {
      if (!currentUser || !currentUser.uid) return;
      setLoadingDeepDive(true);
      try {
        const insights = {};
        for (const d of domains) {
          const ref = doc(db, `users/${currentUser.uid}/deep_dive_insights/${d.name}`);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            insights[d.name] = snap.data();
          }
        }
        setDeepDiveInsights(insights);
      } catch (e) {
        setDeepDiveInsights({});
      } finally {
        setLoadingDeepDive(false);
      }
    };
    fetchDeepDiveInsights();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center pt-8 pb-8 px-4">
      {/* Glassmorphism Header */}
      <header className="w-full bg-gradient-to-r from-blue-500/60 to-blue-300/40 backdrop-blur-xl shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: 'linear' }} className="flex items-center space-x-2">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900 tracking-tight">Manova</span>
          </motion.div>
          <nav className="flex space-x-4">
            <button className="px-4 py-2 rounded-full bg-white/60 text-blue-700 font-semibold shadow hover:bg-blue-100 transition">Dashboard</button>
            <button className="px-4 py-2 rounded-full bg-white/60 text-blue-700 font-semibold shadow hover:bg-blue-100 transition">Survey</button>
            <button className="px-4 py-2 rounded-full bg-white/60 text-blue-700 font-semibold shadow hover:bg-blue-100 transition">Therapists</button>
          </nav>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-900 font-bold text-lg shadow">{userData.avatar}</div>
          </div>
        </div>
      </header>

      {/* Personalized Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-3xl mx-auto mt-8 mb-4 text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2">{greeting}</h1>
      </motion.div>

      {/* Adaptive Dashboard Content */}
      {wellnessScore < 5 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-red-100 p-4 rounded-lg mb-4 max-w-2xl w-full text-center"
        >
          <h3 className="text-red-700 font-bold mb-2">You may benefit from extra support</h3>
          <button onClick={() => navigate('/therapists')} className="btn bg-red-600 text-white">Connect with a Therapist</button>
          <button onClick={() => navigate('/meditation')} className="btn bg-indigo-600 text-white ml-2">Try a Guided Meditation</button>
        </motion.div>
      )}
      {wellnessScore >= 5 && wellnessScore < 7 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-yellow-100 p-4 rounded-lg mb-4 max-w-2xl w-full text-center"
        >
          <h3 className="text-yellow-700 font-bold mb-2">Self-care suggestions</h3>
          <ul className="list-disc ml-5 text-yellow-800 text-left inline-block">
            <li>Take a short walk outdoors</li>
            <li>Check in with a friend</li>
            <li>Try a breathing exercise</li>
          </ul>
        </motion.div>
      )}
      {wellnessScore >= 7 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-green-100 p-4 rounded-lg mb-4 max-w-2xl w-full text-center"
        >
          <h3 className="text-green-700 font-bold mb-2">Keep up the good work!</h3>
          <p>Explore new wellness articles or set a new goal.</p>
          <button onClick={() => navigate('/articles')} className="btn bg-blue-600 text-white mt-2">Explore Articles</button>
        </motion.div>
      )}

      {/* Hero Section */}
      <section className="w-full bg-gradient-to-br from-blue-50 to-blue-100 py-10 px-4 flex flex-col items-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col items-center mb-4">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className={`w-32 h-32 rounded-full flex items-center justify-center mb-2 ${wellnessScore >= 7 ? 'bg-blue-100' : wellnessScore >= 5 ? 'bg-yellow-100' : 'bg-red-100'}`}> 
              <span className={`text-5xl font-bold ${wellnessScore >= 7 ? 'text-blue-600' : wellnessScore >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>{wellnessScore}</span>
              <span className="text-2xl text-blue-700">/10</span>
            </motion.div>
            <span className="text-lg text-blue-900 font-semibold">Your Bi-Weekly Wellness Score</span>
            <p className="text-blue-700 mt-2 text-center">{wellnessScore >= 7 ? "You're doing great! Keep up the good work." : wellnessScore >= 5 ? "You're managing, but there's room for improvement." : "You may benefit from additional support and self-care."}</p>
          </div>
          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-6">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.03 }} transition={{ duration: 0.5, delay: 0.1 * 0 }} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 flex flex-col items-center hover:shadow-xl">
              <span className="text-xs text-blue-500 font-semibold mb-1">Last Check-in</span>
              <span className="text-lg font-bold text-blue-900">{lastCheckinDate ? lastCheckinDate.toLocaleDateString() : '--'}</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.03 }} transition={{ duration: 0.5, delay: 0.1 * 1 }} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 flex flex-col items-center hover:shadow-xl">
              <span className="text-xs text-blue-500 font-semibold mb-1">Total Responses</span>
              <span className="text-lg font-bold text-blue-900">{totalResponses || '--'}</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.03 }} transition={{ duration: 0.5, delay: 0.1 * 2 }} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 flex flex-col items-center hover:shadow-xl">
              <span className="text-xs text-blue-500 font-semibold mb-1">Completion Rate</span>
              <span className="text-lg font-bold text-blue-900">{completionRate || '--'}%</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.03 }} transition={{ duration: 0.5, delay: 0.1 * 3 }} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 flex flex-col items-center hover:shadow-xl">
              <span className="text-xs text-blue-500 font-semibold mb-1">Next Check-in</span>
              <span className="text-lg font-bold text-blue-900">{nextCheckin || '--'}</span>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Main Card Section */}
      <div className="w-full max-w-5xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100 flex flex-col md:flex-row md:items-center md:justify-between">
          {/* Wellness Score */}
          <div className="flex-1 flex flex-col items-center md:items-start mb-6 md:mb-0">
            <div className="text-4xl font-bold text-blue-700 mb-2">{wellnessScore}/10</div>
            <div className="text-sm text-gray-500 mb-2">Wellness Score</div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${wellnessScore >= 7 ? 'bg-green-100 text-green-700' : wellnessScore >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{wellnessScore >= 7 ? 'Low Stress' : wellnessScore >= 5 ? 'Moderate Stress' : 'High Stress'}</span>
          </div>
          {/* Most Common Concern */}
          <div className="flex-1 flex flex-col items-center md:items-start mb-6 md:mb-0">
            <div className="text-sm text-gray-500 mb-1">Most Common Concern</div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold text-red-600">{mostCommonConcern || '--'}</span>
              {mostCommonConcern && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">High Priority</span>}
            </div>
          </div>
          {/* Key Metrics */}
          <div className="flex-1 flex flex-col items-center md:items-start">
            <div className="text-sm text-gray-500 mb-1">Key Metrics</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-blue-700">{responseTime || '--'}</span>
                <span className="text-xs text-gray-500">Response Time</span>
                </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-blue-700">{nextCheckin || '--'}</span>
                <span className="text-xs text-gray-500">Next Check-in</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-blue-700">{completionRate || '--'}%</span>
                <span className="text-xs text-gray-500">Completion Rate</span>
                  </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-blue-700">{totalResponses || '--'}</span>
                <span className="text-xs text-gray-500">Total Responses</span>
              </div>
            </div>
          </div>
        </div>
                </div>

      {/* Trends Section */}
      <div className="w-full max-w-5xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-blue-700">Stress Level Trends</h2>
            <div className="flex space-x-2">
                <button 
                className={`px-3 py-1 rounded-lg text-sm font-medium border ${trendPeriod === 30 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-200'}`}
                onClick={() => setTrendPeriod(30)}
                >
                30 Days
                </button>
              <button 
                className={`px-3 py-1 rounded-lg text-sm font-medium border ${trendPeriod === 90 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-200'}`}
                onClick={() => setTrendPeriod(90)}
              >
                90 Days
              </button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line type="monotone" dataKey="wellness" stroke="#4fc3f7" strokeWidth={3} name="Wellness Score" dot={{ fill: '#4fc3f7', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Analysis Summary Section */}
      <div className={`w-full max-w-5xl mx-auto mb-8 rounded-2xl shadow-lg p-6 border border-blue-100 ${mcp.color}`}>
        <h3 className="text-lg font-bold mb-2">MCP Protocol Stage: {mcp.stage}</h3>
        <p>{mcp.message}</p>
      </div>

      {/* Emotional State Analysis Section */}
      <div className="w-full max-w-5xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Current Analysis</h3>
          <div className="mb-2 text-gray-700">
            <span className="font-medium">Current mood:</span> <span className="capitalize">{sentiment.mood || '--'}</span>
          </div>
          {sentiment.primaryConcerns && sentiment.primaryConcerns.length > 0 && (
            <div className="mb-2 text-gray-700">
              <span className="font-medium">Primary areas of concern:</span> {sentiment.primaryConcerns.join(', ')}
            </div>
          )}
          {(!sentiment.primaryConcerns || sentiment.primaryConcerns.length === 0) && (
            <div className="mb-2 text-gray-500">No major concerns detected.</div>
          )}
          </div>
        </div>

        {/* Detailed Stress Analysis Section */}
        <div className="w-full max-w-5xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">Detailed Stress Analysis</h2>
            {loadingDeepDive ? (
              <div className="text-blue-600">Loading insights...</div>
            ) : deepDiveInsights && Object.keys(deepDiveInsights).length > 0 ? (
              Object.entries(deepDiveInsights).map(([domain, insight]) => {
                const meta = domains.find(d => d.name === domain);
                return (
                  <div key={domain} className="mb-8 border-b pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-center mb-2">
                      {meta && <meta.icon className={`w-6 h-6 mr-2 ${meta.color}`} />}
                      <span className="text-lg font-semibold text-gray-800 mr-3">{domain}</span>
                      {insight.rootEmotion && (
                        <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium mr-2">{insight.rootEmotion}</span>
                      )}
                      {insight.updatedAt && (
                        <span className="text-xs text-gray-400 ml-auto">{new Date(insight.updatedAt).toLocaleString()}</span>
                      )}
                    </div>
                    {insight.reasons && insight.reasons.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-2">
                        {insight.reasons.map((r, i) => (
                          <span key={i} className="inline-block bg-blue-50 text-blue-800 px-2 py-1 rounded text-xs">{r}</span>
                        ))}
                      </div>
                    )}
                    {insight.customText && (
                      <div className="bg-gray-50 border-l-4 border-blue-300 p-4 rounded mb-2 mt-2">
                        <div className="italic text-gray-700 mb-1">“{insight.customText}”</div>
                        <div className="flex flex-wrap gap-2 text-xs mt-1">
                          {insight.sentiment && (
                            <span className={`px-2 py-1 rounded-full font-medium ${insight.sentiment === 'Negative' ? 'bg-red-100 text-red-700' : insight.sentiment === 'Positive' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{insight.sentiment}</span>
                          )}
                          {insight.emotion && (
                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">{insight.emotion}</span>
                          )}
                          {insight.tags && Array.isArray(insight.tags) && insight.tags.map((tag, i) => (
                            <span key={i} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-gray-500">No detailed stress analysis available yet.</div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Domain Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Domain Cards */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Domain Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {domains.map((domain, index) => {
                  const score = calculateDomainScore(domain.key);
                  const wellness = getWellnessLevel(score);
                  const Icon = domain.icon;
                  return (
                    <GlassCard
                      key={domain.key}
                      icon={Icon}
                      title={domain.name}
                      value={`${score}%`}
                      status={wellness.level}
                      accent={domain.color.replace('bg-', 'from-').replace('500', '400') + ' to-blue-200'}
                      className="h-full"
                    >
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className={`h-2 rounded-full ${score <= 25 ? 'bg-green-500' : score <= 50 ? 'bg-blue-500' : score <= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        />
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </div>

            {/* Trend Chart */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Wellness Trends</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="wellness" 
                      stroke="#4fc3f7" 
                      strokeWidth={3} 
                      name="Wellness Score" 
                      dot={{ fill: '#4fc3f7', r: 4 }} 
                    />
                </LineChart>
              </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/survey')}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>Take Survey Again</span>
                </button>
                
                {wellnessScore < 5 && (
                  <button
                    onClick={() => navigate('/therapists')}
                    className="w-full bg-red-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <AlertCircle className="w-5 h-5" />
                    <span>Consult a Therapist</span>
                  </button>
                )}
                
                <button
                  onClick={() => setChatOpen(true)}
                  className="w-full bg-purple-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Chat with ARIA</span>
                </button>
              </div>
            </div>

            {/* Last Check-in Info */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Last Check-in</h3>
              {lastCheckinDate && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium text-gray-900">
                      {lastCheckinDate.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Time</span>
                    <span className="font-medium text-gray-900">
                      {lastCheckinDate.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="pt-3 border-t">
                    <button
                      onClick={() => navigate('/survey')}
                      className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Take New Survey →
                    </button>
                </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button for ARIA Chat */}
      {!chatOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 animate-pulse"
          aria-label="Open ARIA Chat"
        >
          <MessageCircle className="w-7 h-7" />
        </motion.button>
      )}

      {/* ARIA Chat Modal */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center z-50"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white/90 backdrop-blur-xl w-full md:w-96 h-[500px] md:rounded-2xl shadow-2xl flex flex-col"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-4 md:rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-lg">🤖</span>
                  </div>
                  <div>
                    <h3 className="font-bold">ARIA</h3>
                    <p className="text-blue-100 text-xs">AI Wellness Coach</p>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="text-blue-100 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {chatMessages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: msg.type === 'user' ? 40 : -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs flex items-start space-x-2 ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-xs text-blue-900">
                        {msg.avatar}
                      </div>
                      <div className={`px-3 py-2 rounded-xl text-sm ${msg.type === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 border'}`}>
                        {msg.message}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="p-4 border-t bg-white">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type message..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardPage; 