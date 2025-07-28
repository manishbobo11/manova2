import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, TrendingUp, TrendingDown, Activity, BarChart3, Clock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserCheckins } from '../services/userSurveyHistory';

const AssessmentHistory = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('date'); // 'date', 'score'

  useEffect(() => {
    const loadAssessments = async () => {
      if (!currentUser?.uid) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const checkins = await getUserCheckins(currentUser.uid);
        
        // Transform checkins into assessment format
        const formattedAssessments = checkins.map(checkin => ({
          id: checkin.id,
          date: new Date(checkin.timestamp),
          wellnessScore: checkin.wellnessScore || 0,
          stressScore: checkin.stressScore || 0,
          mood: checkin.mood || 'neutral',
          domains: checkin.domainResponses ? Object.entries(checkin.domainResponses).map(([domain, score]) => ({
            name: domain,
            score: Number(score) * 25 // Convert 0-4 scale to 0-100 percentage
          })) : [],
          responses: checkin.responses || {}
        }));
        
        setAssessments(formattedAssessments);
      } catch (err) {
        console.error('Error loading assessment history:', err);
        setError('Failed to load assessment history. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadAssessments();
  }, [currentUser?.uid]);

  const sortedAssessments = [...assessments].sort((a, b) => {
    if (sortBy === 'date') {
      return b.date - a.date; // Most recent first
    } else if (sortBy === 'score') {
      return b.wellnessScore - a.wellnessScore; // Highest score first
    }
    return 0;
  });

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-blue-600 bg-blue-100';
    if (score >= 4) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score) => {
    if (score >= 6) return TrendingUp;
    return TrendingDown;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
          <h2 className="text-2xl font-bold text-black mb-4">Loading assessment history...</h2>
          <p className="text-[#777] font-medium">Gathering your wellness journey data</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <motion.div 
          className="bg-white rounded-3xl p-12 shadow-lg border border-[#D8D8D8] text-center max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Activity className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-4">Unable to load history</h2>
          <p className="text-[#777] mb-6 font-medium">{error}</p>
          <motion.button 
            onClick={() => navigate('/dashboard')}
            className="bg-[#007CFF] hover:bg-[#0066CC] text-white px-6 py-3 rounded-2xl transition-all duration-300 flex items-center space-x-3 mx-auto font-bold shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-[#D8D8D8] sticky top-0 z-10">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center">
              <motion.button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 px-4 py-2 bg-white text-[#777] rounded-2xl border border-[#C5C5C5] hover:bg-gray-50 transition-all duration-300 mr-6"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back</span>
              </motion.button>
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">Assessment History</h1>
                <p className="text-[#777]">Review your wellness journey over time</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <motion.button
                  onClick={() => setSortBy('date')}
                  className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                    sortBy === 'date'
                      ? 'bg-[#007CFF] text-white shadow-md'
                      : 'bg-white text-[#777] hover:bg-gray-50 border border-[#C5C5C5]'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  By Date
                </motion.button>
                <motion.button
                  onClick={() => setSortBy('score')}
                  className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                    sortBy === 'score'
                      ? 'bg-[#007CFF] text-white shadow-md'
                      : 'bg-white text-[#777] hover:bg-gray-50 border border-[#C5C5C5]'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  By Score
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10">
        {assessments.length === 0 ? (
          <motion.div
            className="max-w-4xl mx-auto text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="bg-white rounded-3xl p-12 shadow-lg border border-[#D8D8D8] relative overflow-hidden"
              whileHover={{ y: -4, scale: 1.01 }}
            >
              <div className="w-20 h-20 bg-[#007CFF] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                <BarChart3 className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-black mb-6">No assessments yet</h2>
              <p className="text-[#777] mb-8 text-lg leading-relaxed">
                Complete your first wellness check-in to start tracking your journey and see your assessment history.
              </p>
              <motion.button
                onClick={() => navigate('/survey')}
                className="bg-[#007CFF] hover:bg-[#0066CC] text-white px-8 py-4 rounded-2xl transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Take Your First Assessment
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          <>
            {/* Summary Stats */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-3xl shadow-lg border border-[#D8D8D8] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#007CFF] rounded-2xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-black">{assessments.length}</span>
                </div>
                <h3 className="font-semibold text-black mb-2">Total Assessments</h3>
                <p className="text-sm text-[#777]">Completed check-ins</p>
              </div>

              <div className="bg-white rounded-3xl shadow-lg border border-[#D8D8D8] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#007CFF] rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-black">
                    {assessments.length > 0 ? Math.round(assessments.reduce((sum, a) => sum + a.wellnessScore, 0) / assessments.length) : 0}
                  </span>
                </div>
                <h3 className="font-semibold text-black mb-2">Average Score</h3>
                <p className="text-sm text-[#777]">Overall wellness</p>
              </div>

              <div className="bg-white rounded-3xl shadow-lg border border-[#D8D8D8] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#007CFF] rounded-2xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-black">
                    {assessments.length > 0 ? assessments[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                  </span>
                </div>
                <h3 className="font-semibold text-black mb-2">Latest Assessment</h3>
                <p className="text-sm text-[#777]">Most recent check-in</p>
              </div>
            </motion.div>

            {/* Assessment Cards */}
            <div className="space-y-6">
              {sortedAssessments.map((assessment, index) => {
                const ScoreIcon = getScoreIcon(assessment.wellnessScore);
                
                return (
                  <motion.div
                    key={assessment.id}
                    className="bg-white rounded-3xl shadow-lg border border-[#D8D8D8] p-6 hover:shadow-xl transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      {/* Left: Date and Score */}
                      <div className="flex items-center space-x-6 mb-4 lg:mb-0">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl flex items-center justify-center border border-blue-100 mb-2">
                            <Calendar className="w-8 h-8 text-[#007CFF]" />
                          </div>
                          <p className="text-xs text-[#777] font-medium">
                            {assessment.date.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-2xl ${getScoreColor(assessment.wellnessScore)}`}>
                              <ScoreIcon className="w-5 h-5" />
                              <span className="font-bold text-2xl">{assessment.wellnessScore}/10</span>
                            </div>
                            <p className="text-xs text-[#777] mt-1">Wellness Score</p>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-3xl mb-1">{getMoodEmoji(assessment.mood)}</div>
                            <p className="text-xs text-[#777] capitalize">{assessment.mood.replace('_', ' ')}</p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Domain Breakdown */}
                      {assessment.domains.length > 0 && (
                        <div className="flex-1 lg:max-w-md">
                          <h4 className="text-sm font-semibold text-black mb-3">Stress Domains</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {assessment.domains.slice(0, 4).map((domain, domainIndex) => (
                              <div key={domainIndex} className="bg-gray-50 rounded-2xl p-3">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-medium text-black truncate">{domain.name}</span>
                                  <span className="text-xs font-bold text-[#777]">{Math.round(domain.score)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-1.5 rounded-full ${
                                      domain.score < 40 ? 'bg-green-500' :
                                      domain.score < 60 ? 'bg-yellow-500' :
                                      'bg-red-500'
                                    }`}
                                    style={{ width: `${domain.score}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                          {assessment.domains.length > 4 && (
                            <p className="text-xs text-[#777] mt-2 text-center">
                              +{assessment.domains.length - 4} more domains
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AssessmentHistory;