import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Heart, Timer, Flame, Brain, Sparkles, Sun, Moon, Target, Award, CheckCircle2, AlertCircle } from 'lucide-react';

const ExercisePage = () => {
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [isExercising, setIsExercising] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [showCompletion, setShowCompletion] = useState(false);
  const [progress, setProgress] = useState({
    weeklyGoal: { current: 3, target: 5 },
    moodScore: 8.5,
    focusTime: 45,
    energyLevel: 90
  });
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let interval;
    if (isExercising && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsExercising(false);
      setShowCompletion(true);
      // Update progress after completion
      setProgress(prev => ({
        ...prev,
        weeklyGoal: {
          ...prev.weeklyGoal,
          current: Math.min(prev.weeklyGoal.current + 1, prev.weeklyGoal.target)
        },
        focusTime: prev.focusTime + 2
      }));
      setTimeout(() => setShowCompletion(false), 3000);
    }
    return () => clearInterval(interval);
  }, [isExercising, timeLeft]);

  const workouts = [
    {
      id: 1,
      name: 'Mindful Breathing',
      duration: '2 min',
      intensity: 'Low',
      benefits: 'Reduces anxiety',
      icon: Brain,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      description: 'Focus on your breath to calm your mind and reduce stress.',
      steps: ['Find a comfortable position', 'Breathe in for 4 counts', 'Hold for 4 counts', 'Exhale for 4 counts'],
      audioGuide: 'https://example.com/breathing-guide.mp3'
    },
    {
      id: 2,
      name: 'Gratitude Practice',
      duration: '2 min',
      intensity: 'Low',
      benefits: 'Boosts mood',
      icon: Sparkles,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      description: 'List three things you\'re grateful for to shift your perspective.',
      steps: ['Close your eyes', 'Think of three things you appreciate', 'Feel the gratitude in your heart'],
      audioGuide: 'https://example.com/gratitude-guide.mp3'
    },
    {
      id: 3,
      name: 'Body Scan',
      duration: '2 min',
      intensity: 'Low',
      benefits: 'Improves awareness',
      icon: Sun,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Scan your body for tension and consciously release it.',
      steps: ['Start from your toes', 'Move up through your body', 'Notice any tension', 'Release as you go'],
      audioGuide: 'https://example.com/body-scan-guide.mp3'
    },
    {
      id: 4,
      name: 'Mindful Walking',
      duration: '2 min',
      intensity: 'Low',
      benefits: 'Grounds you',
      icon: Moon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Walk mindfully, focusing on each step and your surroundings.',
      steps: ['Walk slowly', 'Feel each step', 'Notice your surroundings', 'Stay present'],
      audioGuide: 'https://example.com/walking-guide.mp3'
    }
  ];

  const stats = [
    { 
      label: 'Weekly Goal', 
      value: `${progress.weeklyGoal.current}/${progress.weeklyGoal.target}`, 
      icon: Target, 
      color: 'text-blue-600', 
      progress: (progress.weeklyGoal.current / progress.weeklyGoal.target) * 100 
    },
    { 
      label: 'Mood Score', 
      value: progress.moodScore.toFixed(1), 
      icon: Heart, 
      color: 'text-indigo-600', 
      progress: (progress.moodScore / 10) * 100 
    },
    { 
      label: 'Focus Time', 
      value: `${progress.focusTime}m`, 
      icon: Timer, 
      color: 'text-blue-500', 
      progress: Math.min((progress.focusTime / 60) * 100, 100) 
    },
    { 
      label: 'Energy Level', 
      value: progress.energyLevel >= 80 ? 'High' : progress.energyLevel >= 50 ? 'Medium' : 'Low', 
      icon: Flame, 
      color: 'text-indigo-500', 
      progress: progress.energyLevel 
    }
  ];

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startExercise = () => {
    if (!selectedWorkout) {
      setErrorMessage('Please select an exercise to begin');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    setIsExercising(true);
    setTimeLeft(120);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg"
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mental Wellness Exercises</h1>
            <div className="flex items-center space-x-2 text-blue-600">
              <Award className="w-5 h-5" />
              <span className="text-sm font-medium">Your Journey</span>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {showError && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2"
              >
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-600">{errorMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                    <span className="text-sm text-gray-600">{stat.label}</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.progress}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-1.5 rounded-full ${stat.color.replace('text', 'bg')}`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Timer Display */}
          <AnimatePresence>
            {isExercising && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center mb-8"
              >
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {formatTime(timeLeft)}
                </div>
                <p className="text-gray-600">Time Remaining</p>
              </motion.div>
            )}
            {showCompletion && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center mb-8"
              >
                <div className="flex items-center justify-center space-x-2 text-2xl font-bold text-green-600 mb-2">
                  <CheckCircle2 className="w-8 h-8" />
                  <span>Exercise Completed! 🎉</span>
                </div>
                <p className="text-gray-600">Great job! Keep up the good work.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Workouts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workouts.map((workout, index) => {
              const Icon = workout.icon;
              return (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`${workout.bgColor} rounded-xl p-4 cursor-pointer transition-all ${
                    selectedWorkout === workout.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedWorkout(workout.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${workout.color} bg-opacity-10`}>
                      <Icon className={`w-6 h-6 ${workout.color}`} />
                    </div>
                    <span className="text-sm text-gray-500">{workout.duration}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{workout.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{workout.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Benefits: {workout.benefits}</span>
                      <span className="text-gray-500">Intensity: {workout.intensity}</span>
                    </div>
                    {selectedWorkout === workout.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 pt-3 border-t border-gray-200"
                      >
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Steps:</h4>
                        <ul className="space-y-1">
                          {workout.steps.map((step, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-center">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                              {step}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3">
                          <button
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle audio guide play
                            }}
                          >
                            <Activity className="w-4 h-4" />
                            <span>Play Audio Guide</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Start Exercise Button */}
          <div className="mt-8 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startExercise}
              disabled={!selectedWorkout || isExercising}
              className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                !selectedWorkout || isExercising
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isExercising ? 'Exercise in Progress...' : 'Start Exercise'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ExercisePage; 