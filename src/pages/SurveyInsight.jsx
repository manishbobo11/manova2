import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Heart, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  User, 
  Lightbulb,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Clock,
  Star,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserSurveyInsights } from '../services/userSurveyHistory';

// Domain icon mapping
const domainIcons = {
  "Work & Career": Activity,
  "Personal Life": Heart,
  "Financial Stress": DollarSign,
  "Health": Activity,
  "Self-Worth & Identity": User,
  "default": Brain
};

// Color schemes for different wellness score ranges
const getScoreColor = (score) => {
  if (score >= 8) return 'from-emerald-500 to-teal-600';
  if (score >= 6) return 'from-yellow-500 to-orange-500';
  if (score >= 4) return 'from-orange-500 to-red-500';
  return 'from-red-500 to-red-600';
};

const getScoreTextColor = (score) => {
  if (score >= 8) return 'text-emerald-700';
  if (score >= 6) return 'text-yellow-700';
  if (score >= 4) return 'text-orange-700';
  return 'text-red-700';
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

const SurveyInsight = () => {
  const { currentUser } = useAuth();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch survey insights with useCallback to prevent re-renders
  const fetchInsights = useCallback(async () => {
    if (!currentUser?.uid) {
      setError('No user logged in');
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Fetching survey insights for user:', currentUser.uid);
      setLoading(true);
      setError(null);
      
      const userInsights = await getUserSurveyInsights(currentUser.uid);
      setInsights(userInsights);
      
      console.log('✅ Loaded insights:', userInsights.length);
      
    } catch (err) {
      console.error('❌ Error fetching survey insights:', err);
      setError('Failed to load your survey insights. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  // Format timestamp
  const formatDate = (timestamp) => {
    try {
      let date;
      if (timestamp?.toDate) {
        date = timestamp.toDate();
      } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      } else {
        date = new Date(timestamp);
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Unknown date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-slate-600">Loading your survey insights...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8 max-w-md mx-4 text-center"
        >
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Unable to Load Data</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={fetchInsights}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Survey Insights
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Comprehensive view of your wellness journey with insights from all your past assessments
          </p>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-200">
              <Brain className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                {insights.length} Assessment{insights.length !== 1 ? 's' : ''} Completed
              </span>
            </div>
            <button
              onClick={fetchInsights}
              className="inline-flex items-center px-4 py-2 bg-white text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Insights Grid */}
        {insights.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl p-12 text-center"
          >
            <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Brain className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">No Insights Yet</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Complete your first wellness assessment to start building your insights history.
            </p>
            <motion.button
              onClick={() => window.location.href = '/survey'}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Activity className="w-5 h-5 mr-2" />
              Take Assessment
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8"
              >
                {/* Header with Score and Timestamp */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${getScoreColor(insight.wellnessScore)} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className={`text-3xl font-bold ${getScoreTextColor(insight.wellnessScore)}`}>
                        {insight.wellnessScore || 0}
                      </div>
                      <div className="text-slate-500 text-sm font-medium">
                        Wellness Score
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 text-slate-500 text-sm mb-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(insight.createdAt || insight.timestamp)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getMoodEmoji(insight.mood)}</span>
                      <span className="text-sm font-medium text-slate-600 capitalize">
                        {insight.mood?.replace('_', ' ') || 'Neutral'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stressed Domains */}
                {insight.stressedDomains && insight.stressedDomains.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
                      Stress Areas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {insight.stressedDomains.map((domain) => {
                        const IconComponent = domainIcons[domain] || domainIcons.default;
                        return (
                          <div
                            key={domain}
                            className="inline-flex items-center space-x-2 bg-red-50 text-red-700 px-3 py-2 rounded-xl border border-red-200"
                          >
                            <IconComponent className="w-4 h-4" />
                            <span className="text-sm font-medium">{domain}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* AI Summary */}
                {insight.aiSummary && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-purple-500" />
                      AI Summary
                    </h4>
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-200">
                      <p className="text-slate-700 leading-relaxed">
                        {insight.aiSummary}
                      </p>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {insight.recommendations && insight.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                      Recommendations
                    </h4>
                    <div className="space-y-2">
                      {insight.recommendations.slice(0, 3).map((recommendation, idx) => (
                        <div
                          key={idx}
                          className="flex items-start space-x-3 bg-green-50 rounded-xl p-3 border border-green-200"
                        >
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-green-800 leading-relaxed">
                            {recommendation}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Domain Breakdown Preview */}
                {insight.domainBreakdown && Object.keys(insight.domainBreakdown).length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">
                      Domain Scores
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(insight.domainBreakdown).slice(0, 4).map(([domain, data]) => {
                        const IconComponent = domainIcons[domain] || domainIcons.default;
                        return (
                          <div key={domain} className="flex items-center space-x-2">
                            <IconComponent className="w-4 h-4 text-slate-500" />
                            <span className="text-xs text-slate-600 truncate">{domain}</span>
                            <span className={`text-xs font-bold ${data.hasStress ? 'text-red-600' : 'text-green-600'}`}>
                              {data.hasStress ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyInsight;