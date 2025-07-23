import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Clock, 
  Globe, 
  Video, 
  MapPin, 
  Mail, 
  Star,
  ChevronRight,
  Heart,
  Brain,
  Shield,
  AlertCircle
} from 'lucide-react';
import { getTherapistSuggestions, getQuickTherapistRecommendation } from '../services/therapistMatcher';

const TherapistRecommendations = ({ 
  userStressDomain, 
  userPreferredLanguage = "English", 
  currentWellness,
  userCurrentCheckinSummary,
  className = "" 
}) => {
  const [therapistMatches, setTherapistMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(null);
  const [quickRecommendation, setQuickRecommendation] = useState(null);

  // Load therapist recommendations when component mounts or user data changes
  useEffect(() => {
    if (userStressDomain && currentWellness) {
      loadTherapistRecommendations();
      generateQuickRecommendation();
    }
  }, [userStressDomain, userPreferredLanguage, currentWellness]);

  const loadTherapistRecommendations = async () => {
    try {
      setLoading(true);
      const matches = await getTherapistSuggestions({
        userStressDomain,
        userPreferredLanguage,
        userCurrentCheckinSummary: userCurrentCheckinSummary || generateCurrentSummary()
      });
      setTherapistMatches(matches);
    } catch (error) {
      console.error('Error loading therapist recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQuickRecommendation = () => {
    const recommendation = getQuickTherapistRecommendation(
      currentWellness.score, 
      currentWellness.mood
    );
    setQuickRecommendation(recommendation);
  };

  const generateCurrentSummary = () => {
    if (!currentWellness) return "User seeking general wellness support";
    
    const { score, mood } = currentWellness;
    if (score <= 3) return `User experiencing high stress levels (${score}/10) and feeling ${mood}`;
    if (score <= 5) return `User managing moderate stress (${score}/10) with ${mood} mood`;
    if (score <= 7) return `User in stable condition (${score}/10) but could benefit from preventive care`;
    return `User in good mental health (${score}/10) seeking ongoing wellness support`;
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'from-red-500 to-rose-600';
      case 'medium': return 'from-amber-500 to-orange-600';
      case 'low': return 'from-blue-500 to-indigo-600';
      default: return 'from-green-500 to-emerald-600';
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'high': return <AlertCircle className="w-5 h-5" />;
      case 'medium': return <Clock className="w-5 h-5" />;
      case 'low': return <Brain className="w-5 h-5" />;
      default: return <Heart className="w-5 h-5" />;
    }
  };

  if (!userStressDomain && !currentWellness) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Quick Recommendation Banner */}
      {quickRecommendation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl shadow-xl backdrop-blur-sm p-6 border border-white/30 transition-all hover:shadow-2xl bg-gradient-to-br ${
            quickRecommendation.urgency === 'high' 
              ? 'from-red-50/80 to-pink-50/80' 
              : quickRecommendation.urgency === 'medium'
              ? 'from-amber-50/80 to-orange-50/80'
              : 'from-blue-50/80 to-indigo-50/80'
          }`}
        >
          <div className="flex items-start space-x-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${getUrgencyColor(quickRecommendation.urgency)} rounded-2xl flex items-center justify-center shadow-sm text-white`}>
              {getUrgencyIcon(quickRecommendation.urgency)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Professional Support Recommendation
              </h3>
              <p className="text-gray-700 mb-3 leading-relaxed">
                {quickRecommendation.message}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  {quickRecommendation.action}
                </span>
                <motion.button
                  onClick={loadTherapistRecommendations}
                  className="flex items-center space-x-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  whileHover={{ x: 5 }}
                >
                  <span>Find Therapists</span>
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Therapist Matches */}
      {therapistMatches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl shadow-xl backdrop-blur-sm bg-white/70 p-6 border border-white/30 transition-all hover:shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Recommended Therapists</h3>
              <p className="text-sm text-gray-600 mt-1">
                Matched based on your {userStressDomain} stress and {userPreferredLanguage} language preference
              </p>
            </div>
            {loading && (
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          <div className="space-y-4">
            {therapistMatches.map((therapist, index) => (
              <motion.div
                key={therapist.email}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-white/40 hover:bg-white/80 transition-all cursor-pointer"
                onClick={() => setShowDetails(showDetails === index ? null : index)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Therapist Avatar */}
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-md">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Therapist Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-bold text-gray-900">{therapist.name}</h4>
                        {therapist.matchScore && (
                          <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                            <Star className="w-3 h-3 fill-current" />
                            <span>{therapist.matchScore}% match</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-indigo-600 font-semibold mb-2">{therapist.specialty}</p>
                      <p className="text-sm text-gray-600 leading-relaxed mb-3">{therapist.reason}</p>
                      
                      {/* Quick Info Row */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Globe className="w-3 h-3" />
                          <span>{therapist.language}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{therapist.availability}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {therapist.mode.includes('Online') ? 
                            <Video className="w-3 h-3" /> : 
                            <MapPin className="w-3 h-3" />
                          }
                          <span>{therapist.mode}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`mailto:${therapist.email}?subject=Therapy Consultation Request&body=Hi ${therapist.name}, I found your profile through Manova and would like to schedule a consultation for ${userStressDomain} stress management.`);
                    }}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Mail className="w-4 h-4" />
                    <span>Contact</span>
                  </motion.button>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {showDetails === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h5 className="font-semibold text-gray-700 mb-2">Background</h5>
                          <p className="text-gray-600 mb-2">{therapist.bio}</p>
                          <p className="text-gray-500">
                            <span className="font-medium">Experience:</span> {therapist.experience}
                          </p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-700 mb-2">Credentials</h5>
                          <p className="text-gray-600 mb-2">{therapist.credentials}</p>
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4 text-green-600" />
                            <span className="text-green-600 text-xs font-medium">Verified Professional</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Load More Button */}
          <motion.button
            onClick={loadTherapistRecommendations}
            disabled={loading}
            className="w-full mt-4 py-3 text-center text-sm font-medium text-gray-600 hover:text-gray-700 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.01 }}
          >
            {loading ? 'Finding more matches...' : 'Find more therapists'}
          </motion.button>
        </motion.div>
      )}

      {/* No Matches State */}
      {!loading && therapistMatches.length === 0 && userStressDomain && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl shadow-xl backdrop-blur-sm bg-white/70 p-8 border border-white/30 text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Finding Your Perfect Match</h3>
          <p className="text-gray-600 mb-4">
            We're working to connect you with therapists who specialize in {userStressDomain} stress and speak {userPreferredLanguage}.
          </p>
          <motion.button
            onClick={loadTherapistRecommendations}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Search Again
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default TherapistRecommendations;