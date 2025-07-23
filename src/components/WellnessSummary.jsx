import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, RotateCcw, Activity, Heart, DollarSign, User, Brain, X, Lightbulb } from 'lucide-react';
import { UserContext } from '../contexts/UserContext';

// Domain icon mapping
const domainIcons = {
  "Work & Career": Activity,
  "Personal Life": Heart,
  "Financial Stress": DollarSign,
  "Health": Activity,
  "Self-Worth & Identity": User,
  "default": Brain
};

// Insight Modal Component
const InsightModal = ({ isOpen, onClose, domain, insight }) => {
  if (!isOpen || !insight) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-xl w-full max-w-2xl sm:max-w-3xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">
                  AI Insights
                </h2>
                <p className="text-sm sm:text-base text-slate-600">{domain}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg sm:rounded-xl transition-colors duration-200"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Summary */}
            {insight.summary && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-200">
                <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm mx-auto sm:mx-0">
                    <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2 sm:mb-3">Summary</h3>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                      {insight.summary}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actionable Steps */}
            {insight.actionableSteps && insight.actionableSteps.length > 0 && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm mx-auto sm:mx-0">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 text-center sm:text-left">Actionable Steps</h3>
                </div>
                <ul className="space-y-3 sm:space-y-4">
                  {insight.actionableSteps.map((step, index) => (
                    <li key={index} className="flex items-start space-x-3 sm:space-x-4">
                      <span className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold shadow-sm">
                        {index + 1}
                      </span>
                      <span className="text-sm sm:text-base text-slate-700 leading-relaxed pt-0.5 sm:pt-1">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reflection Questions */}
            {insight.reflectionQuestions && insight.reflectionQuestions.length > 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-amber-200">
                <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm mx-auto sm:mx-0">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 text-center sm:text-left">Reflection Questions</h3>
                </div>
                <ul className="space-y-3 sm:space-y-4">
                  {insight.reflectionQuestions.map((question, index) => (
                    <li key={index} className="flex items-start space-x-3 sm:space-x-4">
                      <span className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold shadow-sm">
                        ?
                      </span>
                      <span className="text-sm sm:text-base text-slate-700 italic leading-relaxed pt-0.5 sm:pt-1">"{question}"</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Self Compassion */}
            {insight.selfCompassion && (
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-rose-200">
                <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm mx-auto sm:mx-0">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2 sm:mb-3">Self-Compassion Reminder</h3>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed italic">
                      {insight.selfCompassion}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 lg:p-8 border-t border-slate-200 flex-shrink-0">
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-lg sm:rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const WellnessSummary = ({ 
  domainScores = [], 
  overallScore = 0, 
  mood = "", 
  onViewDashboard, 
  onTakeSurveyAgain,
  className = "",
  // New props for MCP analysis
  lastCheckin = null,
  dominantEmotions = { tone: "neutral", keywords: [] },
  // New prop for deep dive insights
  deepDiveSummaries = {}
}) => {
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);

  // Use UserContext if available, otherwise fall back to props
  const userContext = useContext(UserContext);
  
  // Merge context data with props
  const finalLastCheckin = lastCheckin || userContext?.lastCheckin;
  const finalDominantEmotions = dominantEmotions || userContext?.dominantEmotions || { tone: "neutral", keywords: [] };
  const finalDomainScores = domainScores.length > 0 ? domainScores : (userContext?.domainScores || []);
  const finalOverallScore = overallScore || finalLastCheckin?.wellnessScore || 0;
  const finalMood = mood || userContext?.userMood || "neutral";

  // Sort domains by score (highest stress first)
  const sortedDomains = finalDomainScores.sort((a, b) => b.score - a.score);
  const topConcerns = sortedDomains.slice(0, 2);

  const getStatusColor = (score) => {
    if (score < 35) return { label: "Good", color: "text-green-600", bg: "bg-green-50" };
    if (score < 55) return { label: "Moderate Concern", color: "text-yellow-700", bg: "bg-yellow-50" };
    return { label: "High Concern", color: "text-red-600", bg: "bg-red-50" };
  };

  const getSummaryMessage = (score, topConcerns) => {
    if (score >= 8) {
      return `You're doing great overall! Keep up your excellent wellness practices.`;
    } else if (score >= 6) {
      return `You're managing well overall. Consider paying more attention to: ${topConcerns.map(d => d.domain).join(", ")}`;
    } else if (score >= 4) {
      return `You may benefit from additional support. Focus on: ${topConcerns.map(d => d.domain).join(", ")}`;
    } else {
      return `Consider reaching out for professional support. Your main concerns are: ${topConcerns.map(d => d.domain).join(", ")}`;
    }
  };

  const handleViewInsights = (domain, insight) => {
    setSelectedInsight({ domain, insight });
    setIsInsightModalOpen(true);
  };

  const closeInsightModal = () => {
    setIsInsightModalOpen(false);
    setSelectedInsight(null);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 ${className}`}>
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-6">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Wellness Assessment
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Your personalized wellness insights and recommendations
          </p>
        </motion.div>

        {/* Overall Score Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 max-w-lg mx-auto"
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-lg mb-6">
              <span className="text-3xl font-bold text-white">{finalOverallScore}</span>
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Overall Wellness Score</h2>
            <p className="text-slate-600 capitalize">{finalMood}</p>
            <div className="mt-6 w-full bg-slate-100 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${finalOverallScore * 10}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* AI Analysis Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">AI Analysis Summary</h3>
              <div className="space-y-3 text-slate-700">
                <p>
                  Your emotional tone reflects <span className="font-semibold text-blue-600">{finalDominantEmotions.tone}</span> 
                  with keywords: <span className="italic text-slate-600">{finalDominantEmotions.keywords.join(", ")}</span>.
                </p>
                <p>
                  Primary focus areas: <span className="font-semibold text-indigo-600">{topConcerns.map(d => d.domain).join(" & ")}</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Domain Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {finalDomainScores.map(({ domain, score }, index) => {
            const { label, color, bg } = getStatusColor(score);
            const Icon = domainIcons[domain] || domainIcons.default;
            const hasInsights = deepDiveSummaries[domain] && (
              deepDiveSummaries[domain].summary || 
              deepDiveSummaries[domain].actionableSteps?.length > 0 ||
              deepDiveSummaries[domain].reflectionQuestions?.length > 0
            );

            // Professional color scheme
            const getScoreColor = (score) => {
              if (score > 55) return 'from-red-400 to-rose-500';
              if (score > 35) return 'from-amber-400 to-orange-500';
              return 'from-emerald-400 to-teal-500';
            };

            return (
              <motion.div 
                key={domain} 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${getScoreColor(score)} rounded-lg flex items-center justify-center shadow-sm`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{domain}</h3>
                      <p className="text-sm text-slate-500">{score}% stress level</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${bg} ${color}`}>
                    {label}
                  </span>
                </div>
                
                <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                    className={`h-2 bg-gradient-to-r ${getScoreColor(score)} rounded-full`}
                  />
                </div>
                
                {/* AI Insights Button */}
                {hasInsights && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.8 }}
                    onClick={() => handleViewInsights(domain, deepDiveSummaries[domain])}
                    className="w-full flex items-center justify-center space-x-2 bg-slate-50 hover:bg-slate-100 text-slate-700 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 border border-slate-200 group-hover:border-slate-300"
                  >
                    <Brain className="w-4 h-4" />
                    <span>View Insights</span>
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Recommendations Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Suggestion */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Recommendation</h3>
                <p className="text-slate-700 leading-relaxed">
                  Consider focusing on <span className="font-semibold text-amber-600">{topConcerns[0]?.domain}</span> 
                  as it shows elevated stress signals. Journaling or discussing this area with a trusted person may help.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Summary</h3>
                <p className="text-slate-700 leading-relaxed">
                  {getSummaryMessage(finalOverallScore, topConcerns)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <button 
            onClick={onViewDashboard}
            className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl px-8 py-3.5 text-base font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center space-x-2"
          >
            <TrendingUp className="w-5 h-5" />
            <span>View Dashboard</span>
          </button>
          <button 
            onClick={onTakeSurveyAgain}
            className="bg-white border border-slate-300 text-slate-700 rounded-xl px-8 py-3.5 text-base font-medium hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Take Survey Again</span>
          </button>
        </motion.div>
      </div>

      {/* Insight Modal */}
      <InsightModal
        isOpen={isInsightModalOpen}
        onClose={closeInsightModal}
        domain={selectedInsight?.domain}
        insight={selectedInsight?.insight}
      />
    </div>
  );
};

export default WellnessSummary; 