import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart, ClipboardList, Activity, BookOpen, Users, Dumbbell,
  Heart, Brain, Sparkles, Calendar, ArrowRight, Star, Shield,
  Moon, Sun, Leaf, Wind, CloudRain, Sunrise, CheckCircle,
  Play, Pause, Volume2, VolumeX, Clock, Target, Award,
  MessageCircle, Phone, Mail, Instagram, Twitter, Facebook,
  ChevronDown, Plus, Minus, Quote, User, Eye, EyeOff, X,
  Headphones, Music, TreePine, Coffee, Zap, RotateCcw,
  Waves, CloudSnow, Mountain
} from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { saveMoodToFirestore } from '../services/moodService';

const HomePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedMood, setSelectedMood] = useState(null);
  const [showFocusMusicModal, setShowFocusMusicModal] = useState(false);
  const [showNatureSoundsModal, setShowNatureSoundsModal] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
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

  // Get user gender for character avatar (default to neutral)
  const getUserGender = () => {
    // This could be retrieved from user profile/preferences
    return currentUser?.gender || 'neutral';
  };

  const getCharacterAvatar = (gender) => {
    const avatars = {
      male: "👨‍💻",
      female: "👩‍💻", 
      neutral: "🧑‍💻"
    };
    return avatars[gender] || avatars.neutral;
  };

  const getDynamicGreeting = () => {
    const hour = new Date().getHours();
    const name = getUserDisplayName();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    const emoji = hour < 12 ? "☀️" : hour < 18 ? "🌤️" : "🌙";
    
    return {
      text: `Hi ${name}, ${greeting}! Ready to recharge your mind? ${emoji}`,
      timeGreeting: greeting
    };
  };

  const moods = [
    { emoji: '😊', label: 'Excellent', color: 'from-green-400 to-emerald-500', value: 5 },
    { emoji: '🙂', label: 'Good', color: 'from-blue-400 to-blue-500', value: 4 },
    { emoji: '😐', label: 'Okay', color: 'from-yellow-400 to-orange-500', value: 3 },
    { emoji: '😔', label: 'Difficult', color: 'from-purple-400 to-purple-500', value: 2 },
    { emoji: '😰', label: 'Struggling', color: 'from-red-400 to-red-500', value: 1 }
  ];

  const handleMoodSelection = async (mood) => {
    setSelectedMood(mood);
    
    try {
      if (currentUser?.uid) {
        await saveMoodToFirestore(currentUser.uid, mood);
        addToast(`Mood saved! You're feeling ${mood.label.toLowerCase()} today`, 'success');
      } else {
        addToast(`Thanks for sharing! You're feeling ${mood.label.toLowerCase()}`, 'info');
      }
    } catch (error) {
      console.error('Error saving mood:', error);
      addToast('Thanks for sharing your mood!', 'info');
    }
  };

  const mainFeatureCards = [
    {
      title: "Daily Check-in",
      description: "Take a moment to reflect on your emotional well-being with our guided assessment.",
      icon: Heart,
      gradient: "from-sky-400 to-blue-500",
      action: () => navigate("/survey"),
      buttonText: "Start Check-in",
      isActive: true
    },
    {
      title: "Meditation",
      description: "Find your calm with guided meditations designed to reduce stress and anxiety.",
      icon: Brain,
      gradient: "from-purple-400 to-indigo-500",
      action: () => navigate("/meditation"),
      buttonText: "Start Session",
      isActive: true
    },
    {
      title: "Sleep Stories",
      description: "Drift off peacefully with soothing bedtime stories and calming soundscapes.",
      icon: Moon,
      gradient: "from-indigo-400 to-purple-500",
      action: () => navigate("/sleep"),
      buttonText: "Listen Tonight",
      isActive: true
    }
  ];

  const focusPlaylists = [
    { name: "LoFi Hip Hop", duration: "3h", genre: "Chill Beats" },
    { name: "Nature Focus", duration: "2h", genre: "Ambient" },
    { name: "Deep Work", duration: "4h", genre: "Electronic" },
    { name: "Study Vibes", duration: "2.5h", genre: "Instrumental" }
  ];

  const natureSounds = [
    { 
      name: "Rain", 
      icon: CloudRain, 
      description: "Gentle rainfall sounds",
      color: "from-blue-400 to-blue-600"
    },
    { 
      name: "Forest", 
      icon: TreePine, 
      description: "Birds chirping and rustling leaves",
      color: "from-green-400 to-green-600"
    },
    { 
      name: "Ocean", 
      icon: Waves, 
      description: "Calming ocean waves",
      color: "from-cyan-400 to-blue-500"
    }
  ];

  const playNatureSound = (sound) => {
    localStorage.setItem('preferredNatureSound', sound.name);
    setPlayingAudio(sound.name);
    setIsPlaying(true);
    addToast(`Playing ${sound.name} sounds 🎵`, 'success');
    
    setTimeout(() => {
      setIsPlaying(false);
      setPlayingAudio(null);
    }, 30000);
  };

  const quickToolsData = [
    {
      title: "Breathing",
      icon: Wind,
      description: "4-7-8 breathing exercise",
      action: () => navigate('/breathing'),
      gradient: "from-cyan-400 to-blue-500"
    },
    {
      title: "Focus Music",
      icon: Headphones,
      description: "LoFi & study playlists",
      action: () => setShowFocusMusicModal(true),
      gradient: "from-purple-400 to-pink-500"
    },
    {
      title: "Nature Sounds",
      icon: TreePine,
      description: "Rain, forest, ocean",
      action: () => setShowNatureSoundsModal(true),
      gradient: "from-green-400 to-emerald-500"
    },
    {
      title: "Body Scan",
      icon: Activity,
      description: "Mindful body awareness",
      action: () => setShowComingSoonModal("Body Scan"),
      gradient: "from-orange-400 to-red-500"
    }
  ];

  const greeting = getDynamicGreeting();
  const userGender = getUserGender();
  const characterAvatar = getCharacterAvatar(userGender);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="w-full max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-20 py-8">
        
        {/* Header with Character Avatar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="flex flex-col items-center mb-8">
            {/* Animated Character Avatar */}
            <motion.div
              className="text-8xl mb-6 animate-bounce"
              animate={{ 
                y: [0, -10, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {characterAvatar}
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-semibold text-black mb-4 font-body leading-snug tracking-tight"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
            >
              {greeting.text}
            </motion.h1>
            
            <motion.p 
              className="text-lg font-medium text-gray-600 max-w-4xl font-body leading-normal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
            >
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </motion.p>
          </div>
        </motion.div>

        {/* Interactive Mood Check Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-16 px-4"
        >
          <h2 className="text-lg font-medium text-gray-800 mb-8 text-center font-body leading-normal">
            How are you feeling today?
          </h2>
          <div className="flex justify-center flex-wrap gap-4 mb-6">
            {moods.map((mood, index) => (
              <motion.button
                key={mood.label}
                onClick={() => handleMoodSelection(mood)}
                className={`group flex flex-col items-center space-y-3 p-6 rounded-3xl transition-all duration-300 backdrop-blur-sm border ${
                  selectedMood?.label === mood.label 
                    ? 'bg-white/80 shadow-2xl scale-105 border-blue-400' 
                    : 'bg-white/60 hover:bg-white/80 shadow-lg border-white/50 hover:scale-105'
                }`}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span 
                  className="text-5xl mb-2"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {mood.emoji}
                </motion.span>
                <span className="text-sm font-medium text-gray-900">{mood.label}</span>
                {selectedMood?.label === mood.label && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-3 h-3 bg-blue-500 rounded-full"
                  />
                )}
              </motion.button>
            ))}
          </div>
          
          {selectedMood && (
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 max-w-2xl mx-auto border border-white/50 shadow-lg">
                <p className="text-sm font-medium text-gray-800 leading-normal">
                  {selectedMood.label === 'Difficult' || selectedMood.label === 'Struggling' 
                    ? `Thank you for sharing, ${getUserDisplayName()}. Remember, it's okay to have difficult days. We're here to support you through this. 💙` 
                    : `Wonderful to hear you're feeling ${selectedMood.label.toLowerCase()}, ${getUserDisplayName()}! Keep nurturing your well-being. 🌟`}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Main Feature Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-16 px-4"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-12 text-center font-body leading-normal">
            Your Wellness Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {mainFeatureCards.map((card, index) => (
              <motion.div
                key={card.title}
                className="bg-white/70 backdrop-blur-sm shadow-xl rounded-3xl p-8 transition-all duration-300 group border border-white/50 hover:bg-white/80"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ y: -12, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className={`w-16 h-16 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <card.icon className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 font-body">{card.title}</h3>
                <p className="text-gray-600 mb-6 leading-normal font-body">
                  {card.description}
                </p>
                <motion.button
                  onClick={card.action}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-6 rounded-2xl text-sm font-medium transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{card.buttonText}</span>
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Tools Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mb-16 px-4"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-12 text-center font-body leading-normal">
            Quick Tools
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {quickToolsData.map((tool, index) => (
              <motion.button
                key={tool.title}
                onClick={tool.action}
                className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-3xl shadow-lg p-8 flex flex-col items-center justify-center hover:bg-white/80 transition-all duration-300 group"
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ y: -8, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div 
                  className={`w-16 h-16 bg-gradient-to-br ${tool.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:shadow-xl`}
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <tool.icon className="w-8 h-8 text-white" />
                </motion.div>
                <h4 className="text-xl font-semibold text-gray-800 text-center mb-2 font-body">{tool.title}</h4>
                <p className="text-sm text-gray-600 text-center leading-normal font-body">
                  {tool.description}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Analytics Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="text-center px-4"
        >
          <motion.button 
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-16 py-5 rounded-3xl text-sm font-medium transition-all duration-300 flex items-center space-x-4 mx-auto shadow-xl hover:shadow-2xl font-body"
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <BarChart className="w-7 h-7" />
            <span>View Your Analytics</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Focus Music Modal */}
      <AnimatePresence>
        {showFocusMusicModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFocusMusicModal(false)}
          >
            <motion.div
              className="bg-white/95 backdrop-blur-md rounded-3xl p-8 max-w-lg w-full border border-white/50 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Headphones className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Focus Music</h3>
                <p className="text-gray-600">
                  Choose your perfect focus soundtrack
                </p>
              </div>
              
              <div className="space-y-3 mb-6">
                {focusPlaylists.map((playlist, index) => (
                  <motion.button
                    key={playlist.name}
                    className="w-full bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-4 flex items-center justify-between hover:bg-white/80 transition-all duration-300"
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      addToast(`Playing ${playlist.name} 🎵`, 'success');
                      setShowFocusMusicModal(false);
                    }}
                  >
                    <div className="flex items-center">
                      <Play className="w-5 h-5 text-blue-500 mr-3" />
                      <div className="text-left">
                        <p className="font-bold text-gray-900">{playlist.name}</p>
                        <p className="text-sm text-gray-600">{playlist.genre} • {playlist.duration}</p>
                      </div>
                    </div>
                    <Music className="w-5 h-5 text-gray-500" />
                  </motion.button>
                ))}
              </div>
              
              <motion.button
                onClick={() => setShowFocusMusicModal(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-2xl font-semibold transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nature Sounds Modal */}
      <AnimatePresence>
        {showNatureSoundsModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNatureSoundsModal(false)}
          >
            <motion.div
              className="bg-white/95 backdrop-blur-md rounded-3xl p-8 max-w-lg w-full border border-white/50 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <TreePine className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Nature Sounds</h3>
                <p className="text-gray-600">
                  Choose your calming soundscape
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-4 mb-6">
                {natureSounds.map((sound, index) => (
                  <motion.button
                    key={sound.name}
                    className={`w-full bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-4 flex items-center justify-between hover:bg-white/80 transition-all duration-300 ${
                      playingAudio === sound.name ? 'ring-2 ring-blue-400' : ''
                    }`}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => playNatureSound(sound)}
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 bg-gradient-to-br ${sound.color} rounded-full flex items-center justify-center mr-3`}>
                        <sound.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900">{sound.name}</p>
                        <p className="text-sm text-gray-600">{sound.description}</p>
                      </div>
                    </div>
                    {playingAudio === sound.name && isPlaying ? (
                      <Pause className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Play className="w-5 h-5 text-gray-500" />
                    )}
                  </motion.button>
                ))}
              </div>
              
              <motion.button
                onClick={() => setShowNatureSoundsModal(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-2xl font-semibold transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coming Soon Modal */}
      <AnimatePresence>
        {showComingSoonModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowComingSoonModal(null)}
          >
            <motion.div
              className="bg-white/95 backdrop-blur-md rounded-3xl p-8 max-w-md w-full border border-white/50 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{showComingSoonModal}</h3>
                <p className="text-gray-600 mb-8">
                  We're working hard to bring you this amazing feature. Stay tuned for updates!
                </p>
                <motion.button
                  onClick={() => setShowComingSoonModal(null)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Got it!
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;