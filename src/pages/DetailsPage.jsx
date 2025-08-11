import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Heart, DollarSign, User, Brain, Download, Sparkles, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { useAuth } from '../contexts/AuthContext';
import { getLastCheckin } from '../services/userSurveyHistory';
import { useNavigate } from 'react-router-dom';
import WellnessSummary from '../components/WellnessSummary';

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

const DetailsPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [checkinData, setCheckinData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overallScore, setOverallScore] = useState(0);
  const [mood, setMood] = useState('Neutral');
  const [checkinDate, setCheckinDate] = useState(null);

  // Fetch latest check-in data
  const fetchLatestCheckinData = async () => {
    if (!currentUser?.uid) {
      setError('No user logged in');
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Fetching latest check-in data for user:', currentUser.uid);
      setLoading(true);
      setError(null);
      
      const latestCheckin = await getLastCheckin(currentUser.uid);
      
      if (!latestCheckin) {
        console.log('⚠️ No check-in data found');
        setError('No check-in found. Please complete a wellness survey first.');
        setCheckinData(null);
        setLoading(false);
        return;
      }

      console.log('✅ Latest check-in data:', latestCheckin);
      
      // Extract and set real data with proper type checking
      setOverallScore(latestCheckin.wellnessScore || 0);
      setMood(latestCheckin.mood || 'Neutral');
      setCheckinDate(new Date(latestCheckin.timestamp));
      setCheckinData(latestCheckin);
      
    } catch (err) {
      console.error('❌ Error fetching check-in data:', err);
      setError('Failed to load assessment data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestCheckinData();
  }, [currentUser]);

  // PDF Download functionality
  const downloadPDF = () => {
    const element = document.getElementById('wellness-details-content');
    const opt = {
      margin: 1,
      filename: `wellness-details-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
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
          <p className="text-slate-600">Loading your wellness details...</p>
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
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Data Available</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={fetchLatestCheckinData}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  // Process domain scores from checkin data
  const domainScores = checkinData?.domainScores ? 
    Object.entries(checkinData.domainScores).map(([domain, responses]) => {
      // Calculate average score for this domain
      const scores = responses.map(r => r.stressScore || 0);
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const wellnessScore = Math.max(0, 10 - avgScore); // Convert stress to wellness (inverse)
      
      return {
        domain,
        score: Math.round(wellnessScore * 10) / 10,
        responses: responses.length,
        trend: avgScore <= 3 ? 'up' : avgScore <= 6 ? 'stable' : 'down'
      };
    }) : [];

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
            Wellness Details
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Comprehensive overview of your latest wellness assessment and emotional insights
          </p>
          {checkinDate && (
            <p className="text-sm text-slate-500 mt-2">
              Assessment completed on {checkinDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          )}
        </motion.div>

        {/* Main Content */}
        <div id="wellness-details-content">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Overall Wellness Score */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1 bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center"
            >
              <div className={`w-24 h-24 mx-auto mb-6 bg-gradient-to-br ${getScoreColor(overallScore)} rounded-full flex items-center justify-center shadow-lg`}>
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              
              <div className="mb-4">
                <div className={`text-6xl font-bold ${getScoreTextColor(overallScore)} mb-2`}>
                  {overallScore}
                </div>
                <div className="text-slate-500 text-lg font-medium">
                  Wellness Score
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 mb-6">
                <div className="text-slate-600 text-sm uppercase tracking-wide font-semibold mb-2">
                  Current Mood
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {mood}
                </div>
              </div>

              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                overallScore >= 8 ? 'bg-emerald-100 text-emerald-800' :
                overallScore >= 6 ? 'bg-yellow-100 text-yellow-800' :
                overallScore >= 4 ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {overallScore >= 8 ? 'Excellent' :
                 overallScore >= 6 ? 'Good' :
                 overallScore >= 4 ? 'Fair' : 'Needs Attention'}
              </div>
            </motion.div>

            {/* Domain Breakdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-slate-200 p-8"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <Brain className="w-6 h-6 mr-3 text-blue-600" />
                Domain Breakdown
              </h2>

              <div className="space-y-6">
                {domainScores.map((domain, index) => {
                  const IconComponent = domainIcons[domain.domain] || domainIcons.default;
                  return (
                    <motion.div
                      key={domain.domain}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="bg-slate-50 rounded-2xl p-6 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${getScoreColor(domain.score)} rounded-xl flex items-center justify-center shadow-sm`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              {domain.domain}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {domain.responses} responses analyzed
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreTextColor(domain.score)}`}>
                            {domain.score}
                          </div>
                          <div className="flex items-center justify-end mt-1">
                            {domain.trend === 'up' ? (
                              <TrendingUp className="w-4 h-4 text-emerald-500" />
                            ) : domain.trend === 'down' ? (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            ) : (
                              <div className="w-4 h-4 bg-slate-400 rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${getScoreColor(domain.score)} transition-all duration-500`}
                          style={{ width: `${Math.min(100, (domain.score / 10) * 100)}%` }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Emotional Summary */}
          {checkinData?.emotionSummary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 bg-white rounded-3xl shadow-xl border border-slate-200 p-8"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <Heart className="w-6 h-6 mr-3 text-pink-600" />
                AI Emotional Insights
              </h2>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <p className="text-base text-slate-700 leading-relaxed">
                  {typeof checkinData.emotionSummary === 'string' 
                    ? checkinData.emotionSummary 
                    : 'Emotional analysis completed based on your responses.'}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4"
        >
          <button
            onClick={downloadPDF}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-lg"
          >
            <Download className="w-5 h-5 mr-2" />
            Download PDF Report
          </button>
          
          <button
            onClick={fetchLatestCheckinData}
            className="inline-flex items-center px-6 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors duration-200 shadow-lg"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh Data
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default DetailsPage;