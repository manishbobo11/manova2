import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Play, Pause, Volume2, VolumeX, Heart, Waves, Sun, Moon, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

const MeditationPage = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(300); // 5 minutes in seconds
  const [isMuted, setIsMuted] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('inhale');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({
    weeklySessions: 3,
    totalTime: 45,
    currentStreak: 2,
    lastSession: '2024-03-15'
  });
  const audioRef = useRef(null);

  useEffect(() => {
    let interval;
    if (isPlaying && time > 0) {
      interval = setInterval(() => {
        setTime(prev => prev - 1);
      }, 1000);
    } else if (time === 0) {
      setIsPlaying(false);
      setShowCompletion(true);
      // Update progress after completion
      setProgress(prev => ({
        ...prev,
        weeklySessions: prev.weeklySessions + 1,
        totalTime: prev.totalTime + 5,
        currentStreak: prev.currentStreak + 1
      }));
      setTimeout(() => setShowCompletion(false), 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, time]);

  useEffect(() => {
    if (isPlaying) {
      const breathingInterval = setInterval(() => {
        setBreathingPhase(prev => {
          if (prev === 'inhale') return 'hold';
          if (prev === 'hold') return 'exhale';
          return 'inhale';
        });
      }, 4000);
      return () => clearInterval(breathingInterval);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (selectedSession) {
      try {
        // This would be replaced with actual audio file
        const audio = new Audio('https://example.com/meditation-guide.mp3');
        audioRef.current = audio;
        if (isPlaying) {
          audio.play();
        }
      } catch (err) {
        setError('Failed to load audio. Please try again.');
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [selectedSession, isPlaying]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (!selectedSession) {
      setError('Please select a meditation session first');
      setTimeout(() => setError(null), 3000);
      return;
    }
    setIsPlaying(!isPlaying);
    if (audioRef.current) {
      if (!isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  };

  const resetTimer = () => {
    setTime(300);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const guidedSessions = [
    {
      id: 1,
      title: 'Morning Mindfulness',
      duration: '10 min',
      icon: Sun,
      description: 'Start your day with clarity and purpose',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      audioUrl: 'https://example.com/morning-mindfulness.mp3',
      benefits: ['Increased focus', 'Reduced stress', 'Better mood']
    },
    {
      id: 2,
      title: 'Stress Relief',
      duration: '15 min',
      icon: Waves,
      description: 'Release tension and find calm',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      audioUrl: 'https://example.com/stress-relief.mp3',
      benefits: ['Deep relaxation', 'Anxiety reduction', 'Mental clarity']
    },
    {
      id: 3,
      title: 'Deep Focus',
      duration: '20 min',
      icon: Sparkles,
      description: 'Enhance concentration and mental clarity',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      audioUrl: 'https://example.com/deep-focus.mp3',
      benefits: ['Improved focus', 'Better memory', 'Enhanced creativity']
    },
    {
      id: 4,
      title: 'Evening Wind Down',
      duration: '15 min',
      icon: Moon,
      description: 'Prepare your mind for restful sleep',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      audioUrl: 'https://example.com/evening-wind-down.mp3',
      benefits: ['Better sleep', 'Reduced insomnia', 'Peaceful mind']
    }
  ];

  const progressStats = [
    { 
      label: 'This Week', 
      value: `${progress.weeklySessions} sessions`, 
      color: 'text-blue-600',
      progress: (progress.weeklySessions / 7) * 100
    },
    { 
      label: 'Total Time', 
      value: `${progress.totalTime} minutes`, 
      color: 'text-indigo-600',
      progress: Math.min((progress.totalTime / 120) * 100, 100)
    },
    { 
      label: 'Current Streak', 
      value: `${progress.currentStreak} days`, 
      color: 'text-purple-600',
      progress: (progress.currentStreak / 7) * 100
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg"
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mindful Moments</h1>
            <div className="flex items-center space-x-2 text-blue-600">
              <Waves className="w-5 h-5" />
              <span className="text-sm font-medium">Guided Meditation</span>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2"
              >
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-600">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex flex-col items-center space-y-8">
            {/* Breathing Animation */}
            <div className="relative w-72 h-72">
              <motion.div
                animate={{
                  scale: breathingPhase === 'inhale' ? 1.2 : breathingPhase === 'exhale' ? 0.8 : 1,
                  opacity: isPlaying ? 1 : 0.5
                }}
                transition={{
                  duration: 4,
                  ease: "easeInOut",
                  repeat: isPlaying ? Infinity : 0
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center"
              >
                <motion.div
                  animate={{
                    scale: breathingPhase === 'inhale' ? 1.1 : breathingPhase === 'exhale' ? 0.9 : 1,
                  }}
                  transition={{
                    duration: 4,
                    ease: "easeInOut",
                    repeat: isPlaying ? Infinity : 0
                  }}
                >
                  <Heart className="w-20 h-20 text-blue-400" />
                </motion.div>
              </motion.div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl font-bold text-blue-600">{formatTime(time)}</span>
              </div>
            </div>

            {/* Breathing Guide */}
            <AnimatePresence>
              {isPlaying && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center"
                >
                  <p className="text-2xl font-medium text-blue-600 capitalize">
                    {breathingPhase}...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Completion Message */}
            <AnimatePresence>
              {showCompletion && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center space-x-2 text-2xl font-bold text-green-600 mb-2">
                    <CheckCircle2 className="w-8 h-8" />
                    <span>Meditation Complete! 🎉</span>
                  </div>
                  <p className="text-gray-600">Great job! Keep up the good work.</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTimer}
                className="p-4 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetTimer}
                className="p-4 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <Timer size={24} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleMute}
                className="p-4 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </motion.button>
            </div>

            {/* Guided Sessions and Progress */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-4">Guided Sessions</h3>
                <div className="grid grid-cols-1 gap-4">
                  {guidedSessions.map((session) => {
                    const Icon = session.icon;
                    return (
                      <motion.div
                        key={session.id}
                        whileHover={{ scale: 1.02 }}
                        className={`${session.bgColor} rounded-xl p-4 cursor-pointer transition-all ${
                          selectedSession === session.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setSelectedSession(session.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${session.color} bg-opacity-10`}>
                            <Icon className={`w-5 h-5 ${session.color}`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{session.title}</h4>
                            <p className="text-sm text-gray-600">{session.description}</p>
                          </div>
                          <span className="ml-auto text-sm text-gray-500">{session.duration}</span>
                        </div>
                        {selectedSession === session.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3 pt-3 border-t border-gray-200"
                          >
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Benefits:</h5>
                            <ul className="space-y-1">
                              {session.benefits.map((benefit, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-center">
                                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-4">Your Progress</h3>
                <div className="grid grid-cols-1 gap-4">
                  {progressStats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">{stat.label}</span>
                        <span className={`font-semibold ${stat.color}`}>{stat.value}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.progress}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className={`h-1.5 rounded-full ${stat.color.replace('text', 'bg')}`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MeditationPage; 