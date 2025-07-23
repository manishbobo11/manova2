import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Heart, 
  Activity, 
  Book, 
  Music, 
  Coffee, 
  Moon, 
  Sun, 
  Users, 
  Target, 
  Calendar,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { generateSmartRecommendations } from '../services/ai/smartRecommendations';

const SmartWellnessRecommendations = ({ userId, moodData, stressPatterns }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [personalizedInsights, setPersonalizedInsights] = useState(null);

  const categories = {
    all: { label: 'All', icon: Sparkles, color: 'text-purple-600' },
    mindfulness: { label: 'Mindfulness', icon: Brain, color: 'text-blue-600' },
    physical: { label: 'Physical', icon: Activity, color: 'text-green-600' },
    social: { label: 'Social', icon: Users, color: 'text-pink-600' },
    creative: { label: 'Creative', icon: Music, color: 'text-orange-600' },
    routine: { label: 'Routine', icon: Calendar, color: 'text-indigo-600' }
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const smartRecs = await generateSmartRecommendations({
          userId,
          moodData,
          stressPatterns,
          timeOfDay: new Date().getHours(),
          preferences: getUserPreferences(userId)
        });
        setRecommendations(smartRecs.recommendations);
        setPersonalizedInsights(smartRecs.insights);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (moodData && stressPatterns) {
      fetchRecommendations();
    }
  }, [userId, moodData, stressPatterns]);

  const getUserPreferences = (userId) => {
    // In a real app, this would come from user profile/settings
    return {
      preferredActivities: ['meditation', 'exercise', 'journaling'],
      availableTime: '15-30min',
      fitnessLevel: 'moderate',
      socialPreference: 'balanced'
    };
  };

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.category === selectedCategory);

  const RecommendationCard = ({ recommendation, index }) => {
    const IconComponent = getRecommendationIcon(recommendation.type);
    
    return (
      <motion.div
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -2 }}
      >
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-full ${getRecommendationColor(recommendation.priority)}`}>
            <IconComponent className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{recommendation.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityStyle(recommendation.priority)}`}>
                {recommendation.priority}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-3">{recommendation.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {recommendation.duration}
                </span>
                <span className="flex items-center">
                  <Target className="h-4 w-4 mr-1" />
                  {recommendation.difficulty}
                </span>
              </div>
              <motion.button
                className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 font-medium"
                whileHover={{ x: 2 }}
                onClick={() => handleRecommendationClick(recommendation)}
              >
                <span>Try it</span>
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const getRecommendationIcon = (type) => {
    const iconMap = {
      meditation: Brain,
      exercise: Activity,
      breathing: Heart,
      journaling: Book,
      music: Music,
      social: Users,
      sleep: Moon,
      morning: Sun,
      break: Coffee
    };
    return iconMap[type] || Activity;
  };

  const getRecommendationColor = (priority) => {
    const colorMap = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colorMap[priority] || 'bg-gray-500';
  };

  const getPriorityStyle = (priority) => {
    const styleMap = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return styleMap[priority] || 'bg-gray-100 text-gray-800';
  };

  const handleRecommendationClick = (recommendation) => {
    // Track recommendation engagement
    // Navigate to detailed recommendation view or execute action
    console.log('Recommendation clicked:', recommendation);
  };

  const InsightCard = ({ insight }) => (
    <motion.div
      className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-start space-x-3">
        <Brain className="h-6 w-6 text-indigo-600 mt-1" />
        <div>
          <h3 className="font-semibold text-indigo-900 mb-2">Personalized Insight</h3>
          <p className="text-indigo-800 text-sm leading-relaxed">{insight}</p>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating personalized recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Wellness Recommendations</h1>
        <p className="text-gray-600">AI-powered suggestions tailored to your current emotional state</p>
      </div>

      {/* Personalized Insight */}
      {personalizedInsights && (
        <InsightCard insight={personalizedInsights} />
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {Object.entries(categories).map(([key, category]) => {
          const IconComponent = category.icon;
          return (
            <motion.button
              key={key}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-200 ${
                selectedCategory === key
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(key)}
            >
              <IconComponent className="h-4 w-4" />
              <span className="text-sm font-medium">{category.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecommendations.map((recommendation, index) => (
          <RecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
            index={index}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredRecommendations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Sparkles className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
          <p className="text-gray-600">
            Complete a wellness check-in to get personalized recommendations.
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.button
            className="flex flex-col items-center space-y-2 p-4 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Brain className="h-6 w-6 text-indigo-600" />
            <span className="text-sm font-medium">5-min Meditation</span>
          </motion.button>
          <motion.button
            className="flex flex-col items-center space-y-2 p-4 rounded-lg border border-gray-200 hover:border-green-300 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Activity className="h-6 w-6 text-green-600" />
            <span className="text-sm font-medium">Quick Exercise</span>
          </motion.button>
          <motion.button
            className="flex flex-col items-center space-y-2 p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Heart className="h-6 w-6 text-blue-600" />
            <span className="text-sm font-medium">Breathing Exercise</span>
          </motion.button>
          <motion.button
            className="flex flex-col items-center space-y-2 p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Book className="h-6 w-6 text-purple-600" />
            <span className="text-sm font-medium">Journal Entry</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default SmartWellnessRecommendations;
