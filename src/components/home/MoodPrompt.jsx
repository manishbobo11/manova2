import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Smile, Meh, Frown, Angry, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { saveMoodToFirestore } from '../../services/moodService';
import { homeContent } from '../../content/home';

const MoodPrompt = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { currentUser } = useAuth();

  const iconMap = {
    excellent: Smile,
    good: Heart,
    okay: Meh,
    difficult: Frown,
    struggling: Angry
  };

  const colorMap = {
    excellent: { color: 'text-green-600', bgColor: 'bg-green-50' },
    good: { color: 'text-blue-600', bgColor: 'bg-blue-50' },
    okay: { color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    difficult: { color: 'text-orange-600', bgColor: 'bg-orange-50' },
    struggling: { color: 'text-red-600', bgColor: 'bg-red-50' }
  };

  const moods = homeContent.moodPrompt.moods.map(mood => ({
    id: mood.key,
    label: mood.label,
    emoji: mood.emoji,
    icon: iconMap[mood.key],
    ...colorMap[mood.key]
  }));

  const handleMoodSelection = async (mood) => {
    setSelectedMood(mood.id);
    
    try {
      // Save mood to Firestore
      const userId = currentUser?.uid;
      
      if (userId) {
        await saveMoodToFirestore(userId, {
          label: mood.label,
          emoji: mood.id,
          color: mood.color
        });
      }
      
      // Show success toast
      addToast(`Mood recorded: ${mood.label}`, 'success');
      
      // Navigate to survey after a brief delay
      setTimeout(() => {
        navigate(homeContent.moodPrompt.onSelectRoute);
      }, 1000);
      
    } catch (error) {
      console.error('Error saving mood:', error);
      addToast('Could not save mood, but you can still continue', 'warning');
      
      // Still navigate to survey even if save fails
      setTimeout(() => {
        navigate(homeContent.moodPrompt.onSelectRoute);
      }, 1000);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
          {homeContent.moodPrompt.title}
        </h2>
        <p className="text-slate-600 text-lg">
          {homeContent.moodPrompt.subtitle}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {moods.map((mood) => (
          <motion.button
            key={mood.id}
            onClick={() => handleMoodSelection(mood)}
            className={`flex flex-col items-center p-4 rounded-xl transition-all duration-200 ${
              selectedMood === mood.id
                ? `bg-blue-600 text-white ring-2 ring-blue-300 shadow-lg`
                : `${mood.bgColor} ${mood.color} hover:shadow-md hover:scale-105`
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={selectedMood !== null}
          >
            <mood.icon className={`w-8 h-8 mb-2 ${
              selectedMood === mood.id ? 'text-white' : mood.color
            }`} />
            <span className={`font-medium text-sm ${
              selectedMood === mood.id ? 'text-white' : mood.color
            }`}>
              {mood.label}
            </span>
          </motion.button>
        ))}
      </div>

      {selectedMood && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center gap-2 text-blue-600">
            <Activity className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Taking you to your wellness check-in...</span>
          </div>
        </motion.div>
      )}
    </motion.section>
  );
};

export default MoodPrompt;
