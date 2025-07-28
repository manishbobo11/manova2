import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wind, Play, Pause, RotateCcw, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

// CSS variables for consistent theming
const cssVars = `
  :root {
    --primary-blue: #007CFF;
    --primary-blue-hover: #0066CC;
    --border-gray: #C5C5C5;
    --text-gray: #777;
    --border-light: #D8D8D8;
  }
`;

const BreathingPage = () => {
  const { addToast } = useToast();
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathCount, setBreathCount] = useState(0);
  const [phase, setPhase] = useState('ready'); // ready, inhale, exhale

  useEffect(() => {
    document.title = 'Manova | Breathing Exercise';
    const style = document.createElement("style");
    style.textContent = cssVars;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const startBreathingExercise = () => {
    setIsBreathing(true);
    setBreathCount(0);
    setPhase('inhale');
    
    const breathingCycle = (count = 0) => {
      if (count >= 6) { // 6 breaths
        setIsBreathing(false);
        setPhase('ready');
        addToast('Breathing exercise completed! 🌟', 'success');
        return;
      }
      
      // Inhale phase
      setPhase('inhale');
      setTimeout(() => {
        // Hold briefly
        setTimeout(() => {
          // Exhale phase
          setPhase('exhale');
          setTimeout(() => {
            setBreathCount(count + 1);
            breathingCycle(count + 1);
          }, 4000); // 4s exhale
        }, 500); // Brief hold
      }, 4000); // 4s inhale
    };
    
    breathingCycle();
  };

  const stopBreathing = () => {
    setIsBreathing(false);
    setBreathCount(0);
    setPhase('ready');
  };

  const resetExercise = () => {
    stopBreathing();
    addToast('Exercise reset', 'info');
  };

  return (
      <div className="w-full bg-white min-h-screen">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-20">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Link 
              to="/home"
              className="inline-flex items-center text-[#007CFF] hover:text-[#0066CC] font-medium mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            
            <h1 className="text-[48px] font-bold font-inter leading-normal text-balance mb-8">
              <span className="text-black">Breathing </span>
              <span className="text-[#007CFF]">Exercise</span>
            </h1>
            <p className="text-[20px] font-normal font-inter text-black leading-[32px] w-full max-w-[704px] mx-auto text-balance">
              Take a moment to center yourself with guided breathing. Follow the circle as it expands and contracts to find your calm.
            </p>
          </motion.div>

          {/* Main Breathing Exercise */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-16"
          >
            {/* Breathing Circle */}
            <div className="relative mb-12">
              <motion.div 
                className="w-64 h-64 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto flex items-center justify-center relative overflow-hidden shadow-2xl"
                animate={isBreathing ? {
                  scale: phase === 'inhale' ? [1, 1.3] : phase === 'exhale' ? [1.3, 1] : 1,
                  boxShadow: [
                    "0 20px 60px rgba(59, 130, 246, 0.3)",
                    "0 30px 80px rgba(147, 51, 234, 0.5)",
                    "0 20px 60px rgba(59, 130, 246, 0.3)"
                  ]
                } : {}}
                transition={isBreathing ? {
                  duration: phase === 'inhale' ? 4 : phase === 'exhale' ? 4 : 0.5,
                  ease: "easeInOut"
                } : {}}
              >
                <Wind className="w-20 h-20 text-white" />
                
                {/* Breathing indicator */}
                {isBreathing && (
                  <motion.div
                    className="absolute inset-0 border-4 border-white rounded-full"
                    animate={{
                      scale: phase === 'inhale' ? [1, 1.1] : phase === 'exhale' ? [1.1, 1] : 1,
                      opacity: [0.3, 0.7, 0.3]
                    }}
                    transition={{
                      duration: phase === 'inhale' ? 4 : phase === 'exhale' ? 4 : 0.5,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </motion.div>
              
              {/* Progress indicator */}
              {isBreathing && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                  <p className="text-[18px] font-bold font-inter text-black">
                    {breathCount}/6 breaths
                  </p>
                </div>
              )}
            </div>

            {/* Instruction Text */}
            <div className="mb-8">
              <h2 className="text-[32px] font-bold font-inter text-black mb-4">
                {!isBreathing 
                  ? 'Ready to Begin?' 
                  : phase === 'inhale' 
                    ? 'Breathe In...' 
                    : phase === 'exhale' 
                      ? 'Breathe Out...' 
                      : 'Breathe with the circle'
                }
              </h2>
              <p className="text-[18px] font-normal font-inter text-[#777] max-w-2xl mx-auto">
                {!isBreathing 
                  ? 'Follow the expanding and contracting circle. Inhale for 4 seconds, then exhale for 4 seconds.'
                  : `${phase === 'inhale' ? 'Inhale slowly through your nose' : 'Exhale gently through your mouth'} - ${4 - Math.floor((Date.now() % 4500) / 1000)}s`
                }
              </p>
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center space-x-4">
              {!isBreathing ? (
                <motion.button
                  onClick={startBreathingExercise}
                  className="bg-[#007CFF] hover:bg-[#0066CC] text-white px-8 py-4 rounded-2xl font-bold font-inter transition-all duration-300 flex items-center space-x-2 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-5 h-5" />
                  <span>Start Breathing</span>
                </motion.button>
              ) : (
                <>
                  <motion.button
                    onClick={stopBreathing}
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-2xl font-bold font-inter transition-all duration-300 flex items-center space-x-2 shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Pause className="w-5 h-5" />
                    <span>Stop</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={resetExercise}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-2xl font-bold font-inter transition-all duration-300 flex items-center space-x-2 shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>Reset</span>
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 border border-[#D8D8D8]"
          >
            <h3 className="text-[28px] font-bold font-inter text-black mb-6 text-center">
              Benefits of Breathing Exercises
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">🧘</span>
                </div>
                <h4 className="text-[18px] font-bold font-inter text-black mb-2">Reduces Stress</h4>
                <p className="text-[14px] font-normal font-inter text-[#777]">
                  Calms your nervous system and reduces cortisol levels
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">💙</span>
                </div>
                <h4 className="text-[18px] font-bold font-inter text-black mb-2">Improves Focus</h4>
                <p className="text-[14px] font-normal font-inter text-[#777]">
                  Enhances concentration and mental clarity
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <h4 className="text-[18px] font-bold font-inter text-black mb-2">Boosts Energy</h4>
                <p className="text-[14px] font-normal font-inter text-[#777]">
                  Increases oxygen flow and natural energy levels
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
  );
};

export default BreathingPage;