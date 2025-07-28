import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, Heart, DollarSign, User, Brain, Download, Sparkles, X, Lightbulb, RotateCcw, Phone, Users, Loader2 } from "lucide-react";
import html2pdf from 'html2pdf.js';
import { useAuth } from '../contexts/AuthContext';
import { getLastCheckin } from '../services/userSurveyHistory';

// Domain icon mapping
const domainIcons = {
  "Work & Career": Activity,
  "Personal Life": Heart,
  "Financial Stress": DollarSign,
  "Health": Activity,
  "Self-Worth & Identity": User,
  "default": Brain
};

// Insight Modal Component for Deep Dive Insights
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

const WellnessScore = ({ 
  className = "",
  onTakeSurveyAgain = null,
  onViewDashboard = null
}) => {
  const { currentUser } = useAuth();
  
  // Real data state from Firestore
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkinData, setCheckinData] = useState(null);
  
  // Derived state from real data
  const [domainScores, setDomainScores] = useState([]);
  const [overallScore, setOverallScore] = useState(null);
  const [mood, setMood] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState("");
  const [checkinDate, setCheckinDate] = useState(null);
  const [emotionalSummary, setEmotionalSummary] = useState("");
  const [personalizedSuggestions, setPersonalizedSuggestions] = useState([]);
  const [deepDiveSummaries, setDeepDiveSummaries] = useState({});
  
  // Modal state
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);

  // Fetch latest check-in data from Firestore
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
        setCheckinData(null);
        setLoading(false);
        return;
      }

      console.log('✅ Latest check-in data fetched:', latestCheckin);
      setCheckinData(latestCheckin);
      
      // Extract and set real data
      // Ensure overallScore is a number
      const wellnessScore = latestCheckin.wellnessScore;
      if (typeof wellnessScore === 'number' && !isNaN(wellnessScore)) {
        setOverallScore(wellnessScore);
      } else {
        setOverallScore(0);
      }
      // Ensure mood is a string, not an object
      const moodData = latestCheckin.mood;
      if (typeof moodData === 'object' && moodData !== null) {
        setMood('Neutral');
      } else {
        setMood(moodData || 'Neutral');
      }
      // Ensure checkinDate is a valid date
      const timestamp = latestCheckin.timestamp;
      if (timestamp) {
        try {
          setCheckinDate(new Date(timestamp));
        } catch (error) {
          console.warn('Invalid timestamp:', timestamp);
          setCheckinDate(null);
        }
      } else {
        setCheckinDate(null);
      }
      // Ensure emotionalSummary is a string, not an object
      const emotionSummaryData = latestCheckin.emotionSummary;
      if (typeof emotionSummaryData === 'object' && emotionSummaryData !== null) {
        // If it's an object, extract the mood or create a summary
        const mood = emotionSummaryData.mood || 'neutral';
        const concerns = emotionSummaryData.primaryConcerns || [];
        const summary = `Your emotional state reflects ${mood} mood. ${concerns.length > 0 ? `Primary concerns include: ${concerns.join(', ')}.` : ''}`;
        setEmotionalSummary(summary);
      } else {
        setEmotionalSummary(emotionSummaryData || '');
      }
      // Ensure personalizedSuggestions is an array, not an object or other type
      const suggestionsData = latestCheckin.personalizedSuggestions;
      if (Array.isArray(suggestionsData)) {
        setPersonalizedSuggestions(suggestionsData);
      } else {
        setPersonalizedSuggestions([]);
      }
      // Ensure deepDiveSummaries is an object, not an array or other type
      const deepDiveData = latestCheckin.deepDiveSummaries;
      if (typeof deepDiveData === 'object' && deepDiveData !== null && !Array.isArray(deepDiveData)) {
        setDeepDiveSummaries(deepDiveData);
      } else {
        setDeepDiveSummaries({});
      }
      
      // Process domain scores from domainResponses or responses
      const processedDomainScores = processDomainScores(latestCheckin);
      setDomainScores(Array.isArray(processedDomainScores) ? processedDomainScores : []);
      
      // Generate dynamic recommendations and summary
      const scoreValue = typeof latestCheckin.wellnessScore === 'number' && !isNaN(latestCheckin.wellnessScore) ? latestCheckin.wellnessScore : 0;
      const dynamicRecommendations = generateDynamicRecommendations(processedDomainScores, scoreValue);
      const dynamicSummary = generateDynamicSummary(scoreValue, processedDomainScores);
      
      // Ensure recommendations is an array, not an object
      const recommendationsData = latestCheckin.personalizedSuggestions;
      if (Array.isArray(recommendationsData)) {
        setRecommendations(recommendationsData);
      } else {
        setRecommendations(dynamicRecommendations);
      }
      // Ensure summary is a string, not an object
      const summaryData = latestCheckin.summary;
      if (typeof summaryData === 'object' && summaryData !== null) {
        setSummary(dynamicSummary);
      } else {
        setSummary(summaryData || dynamicSummary);
      }
      
    } catch (err) {
      console.error('❌ Error fetching check-in data:', err);
      setError('Failed to load assessment data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Process domain scores from Firestore data
  const processDomainScores = (checkinData) => {
    const domains = [
      { name: "Work & Career", icon: Activity },
      { name: "Personal Life", icon: Heart },
      { name: "Financial Stress", icon: DollarSign },
      { name: "Health", icon: Activity },
      { name: "Self-Worth & Identity", icon: User }
    ];

    if (checkinData.domainResponses) {
      // Use domain responses if available
      return domains.map(domain => {
        const score = checkinData.domainResponses[domain.name];
        return {
          domain: domain.name,
          score: Number(score) * 25, // Convert 0-4 scale to 0-100 percentage
          insight: deepDiveSummaries[domain.name] || null
        };
      }).filter(item => item.score !== undefined);
    } else if (checkinData.responses) {
      // Fallback: calculate from raw responses
      const responseValues = Object.values(checkinData.responses).map(v => Number(v || 0));
      const questionsPerDomain = Math.ceil(responseValues.length / domains.length);
      
      return domains.map((domain, domainIndex) => {
        const startIndex = domainIndex * questionsPerDomain;
        const endIndex = Math.min(startIndex + questionsPerDomain, responseValues.length);
        const domainResponses = responseValues.slice(startIndex, endIndex);
        
        if (domainResponses.length === 0) return null;
        
        const avgResponse = domainResponses.reduce((sum, val) => sum + val, 0) / domainResponses.length;
        const stressScore = (avgResponse / 4) * 100; // Convert 0-4 to 0-100
        
        return {
          domain: domain.name,
          score: Math.round(stressScore),
          insight: deepDiveSummaries[domain.name] || null
        };
      }).filter(Boolean);
    }
    
    return [];
  };

  // Generate dynamic recommendations based on real data
  const generateDynamicRecommendations = (domainScores, wellnessScore) => {
    const recommendations = [];
    const sortedDomains = Array.isArray(domainScores) ? domainScores.sort((a, b) => b.score - a.score) : [];
    const topStressDomain = sortedDomains[0];
    
    if (wellnessScore < 4) {
      recommendations.push(`Your assessment indicates significant stress levels. Consider reaching out for professional support to develop personalized coping strategies.`);
      if (topStressDomain) {
        recommendations.push(`Focus on ${topStressDomain.domain} as your primary area of concern - this domain shows the highest stress levels (${topStressDomain.score}%).`);
      }
    } else if (wellnessScore < 6) {
      if (topStressDomain) {
        recommendations.push(`Your wellness assessment shows some areas needing attention. Consider focusing on stress management techniques for ${topStressDomain.domain} (${topStressDomain.score}% stress level).`);
      }
      recommendations.push(`Explore mindfulness practices, regular exercise, or talking to a counselor to improve your overall well-being.`);
    } else if (wellnessScore < 8) {
      if (topStressDomain) {
        recommendations.push(`You're managing well overall! Pay attention to ${topStressDomain.domain} to maintain your positive wellness trajectory.`);
      }
      recommendations.push(`Continue your current wellness practices and consider building stronger daily routines.`);
    } else {
      recommendations.push(`Excellent wellness management! You're thriving across most life domains.`);
      recommendations.push(`Maintain your current strategies and consider sharing your success with others who might benefit.`);
    }
    
    return recommendations;
  };

  // Generate dynamic summary based on real data
  const generateDynamicSummary = (wellnessScore, domainScores) => {
    const topConcerns = Array.isArray(domainScores) ? domainScores.sort((a, b) => b.score - a.score).slice(0, 2) : [];
    
    if (wellnessScore >= 8) {
      return `🎉 Outstanding! You're maintaining exceptional wellness across all life domains. Your stress management strategies are highly effective, and you're demonstrating remarkable emotional resilience. Keep up the excellent work!`;
    } else if (wellnessScore >= 6) {
      return `✨ Great progress! You're managing your wellness effectively overall. Consider focusing your attention on the domains showing higher stress levels - small improvements here can significantly enhance your overall well-being.`;
    } else if (wellnessScore >= 4) {
      return `💡 Your assessment reveals some areas requiring attention. This is completely normal and shows great self-awareness. Consider exploring additional stress management techniques and don't hesitate to seek support when needed.`;
    } else {
      return `🤝 Your assessment indicates elevated stress levels across multiple life areas. This takes courage to acknowledge. Professional support can be incredibly valuable in developing personalized coping strategies and building resilience.`;
    }
  };

  // Helper functions
  const handleViewInsights = (domain, insight) => {
    setSelectedInsight({ domain, insight });
    setIsInsightModalOpen(true);
  };

  const closeInsightModal = () => {
    setIsInsightModalOpen(false);
    setSelectedInsight(null);
  };

  const getStatusColor = (score) => {
    if (score < 35) return { label: "Good", color: "text-green-600", bg: "bg-green-50" };
    if (score < 55) return { label: "Moderate Concern", color: "text-yellow-700", bg: "bg-yellow-50" };
    return { label: "High Concern", color: "text-red-600", bg: "bg-red-50" };
  };

  const getSummaryMessage = (score, topConcerns) => {
    if (score >= 8) {
      return `You're doing great overall! Keep up your excellent wellness practices.`;
    } else if (score >= 6) {
      return `You're managing well overall. Consider paying more attention to: ${Array.isArray(topConcerns) ? topConcerns.map(d => d.domain).join(", ") : 'your wellness areas'}`;
    } else if (score >= 4) {
      return `You may benefit from additional support. Focus on: ${Array.isArray(topConcerns) ? topConcerns.map(d => d.domain).join(", ") : 'your wellness areas'}`;
    } else {
      return `Consider reaching out for professional support. Your main concerns are: ${Array.isArray(topConcerns) ? topConcerns.map(d => d.domain).join(", ") : 'your wellness areas'}`;
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchLatestCheckinData();
  }, [currentUser?.uid]);

  // Sort domains by stress level for display
  const sortedDomains = Array.isArray(domainScores) ? domainScores.sort((a, b) => b.score - a.score) : [];
  const topConcerns = sortedDomains.slice(0, 2);

  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-600 bg-green-100";
    if (score >= 6) return "text-blue-600 bg-blue-100";
    if (score >= 4) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getProgressColor = (score) => {
    if (score > 55) return 'from-red-400 to-rose-500';
    if (score > 35) return 'from-amber-400 to-orange-500';
    return 'from-emerald-400 to-teal-500';
  };

  const getDomainColor = (score) => {
    if (score <= 25) return "text-green-600";
    if (score <= 50) return "text-blue-600";
    if (score <= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const handleDownloadPDF = () => {
    // Create a clean version of the component for PDF
    const element = document.getElementById('wellness-report');
    if (!element) {
      console.error('Wellness report element not found');
      return;
    }

    // PDF options with dynamic filename
    const assessmentDate = checkinDate ? checkinDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `Manova_Wellness_Assessment_${assessmentDate}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
        allowTaint: false
      },
      jsPDF: { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'portrait'
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // Add header with Manova logo and assessment date
    const originalContent = element.innerHTML;
    const assessmentDateFormatted = checkinDate ? checkinDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'Recent Assessment';
    
    const pdfHeader = `
      <div style="text-align: center; margin-bottom: 30px; padding: 20px; border-bottom: 2px solid #007CFF;">
        <h1 style="font-size: 36px; color: #1e3a8a; font-family: 'Dancing Script', cursive; margin: 0;">Manova</h1>
        <p style="color: #777; margin: 5px 0 0 0; font-size: 16px;">Wellness Assessment Report</p>
        <p style="color: #777; margin: 5px 0 0 0; font-size: 14px;">Assessment Date: ${assessmentDateFormatted}</p>
        <p style="color: #777; margin: 5px 0 0 0; font-size: 12px;">Generated on ${new Date().toLocaleDateString()}</p>
      </div>
    `;
    
    element.innerHTML = pdfHeader + originalContent;

    // Generate PDF
    html2pdf().set(opt).from(element).save().then(() => {
      // Restore original content
      element.innerHTML = originalContent;
      console.log('PDF generated successfully');
    }).catch(error => {
      console.error('Error generating PDF:', error);
      // Restore original content on error
      element.innerHTML = originalContent;
    });
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 ${className}`}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-slate-200 rounded-2xl mx-auto mb-6 animate-pulse"></div>
              <div className="h-8 bg-slate-200 rounded-lg w-96 mx-auto mb-4 animate-pulse"></div>
              <div className="h-4 bg-slate-200 rounded-lg w-64 mx-auto animate-pulse"></div>
            </div>
            
            {/* Overall Score Skeleton */}
            <div className="bg-white rounded-2xl p-12 shadow-xl border border-slate-200/50">
              <div className="flex items-center justify-center mb-8">
                <div className="w-20 h-20 bg-slate-200 rounded-2xl mr-6 animate-pulse"></div>
                <div className="space-y-3">
                  <div className="h-6 bg-slate-200 rounded-lg w-48 animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded-lg w-36 animate-pulse"></div>
                </div>
              </div>
              <div className="text-center">
                <div className="h-20 bg-slate-200 rounded-lg w-32 mx-auto mb-4 animate-pulse"></div>
                <div className="h-10 bg-slate-200 rounded-xl w-40 mx-auto animate-pulse"></div>
              </div>
            </div>
            
            {/* Domain Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-slate-200 rounded-lg animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-24 animate-pulse"></div>
                        <div className="h-3 bg-slate-200 rounded w-16 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-slate-200 rounded-full w-16 animate-pulse"></div>
                  </div>
                  <div className="mb-6">
                    <div className="h-3 bg-slate-200 rounded-full w-full animate-pulse"></div>
                  </div>
                  <div className="h-8 bg-slate-200 rounded-xl w-full animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 ${className}`}>
        <div className="max-w-4xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-red-200/50 p-12 text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-red-200 to-red-300 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <X className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Error Loading Assessment</h3>
            <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">{error}</p>
            <motion.button
              onClick={fetchLatestCheckinData}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Try Again</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Empty state - no check-in data
  if (!checkinData || domainScores.length === 0) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 ${className}`}>
        <div className="max-w-4xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-12 text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Activity className="w-12 h-12 text-slate-500" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-4">No Assessment Data Available</h3>
            <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">Complete your first wellness check-in to see your personalized assessment and insights</p>
            <motion.button
              onClick={onTakeSurveyAgain || (() => window.location.href = '/survey')}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Take Assessment
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 ${className}`}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div id="wellness-report" className="space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h1 className="text-4xl font-bold text-slate-900 mb-3">Your Wellness Assessment</h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">A comprehensive evaluation of your mental and emotional well-being across key life domains</p>
            </motion.div>
          </div>

          {/* Overall Score Section */}
          {overallScore !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-12 shadow-xl border border-slate-200/50 text-center relative overflow-hidden"
            >
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-indigo-50/40 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl mr-6">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Overall Wellness Score</h2>
                    <p className="text-slate-600">Based on your latest check-in assessment</p>
                    {checkinDate && (
                      <p className="text-sm text-slate-500 mt-1">
                        Assessment Date: {checkinDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                </div>
                
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="text-8xl font-bold bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                    {overallScore}/10
                  </div>
                  <div className={`inline-flex px-6 py-3 rounded-xl text-lg font-semibold shadow-lg ${
                    overallScore >= 8 ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                    overallScore >= 6 ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' :
                    overallScore >= 4 ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' :
                    'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                  }`}>
                    {typeof mood === 'string' ? mood : (mood && typeof mood === 'object' && mood.mood ? mood.mood : 'Neutral')}
                  </div>
                  <div className="mt-6 w-full bg-slate-100 rounded-full h-2 max-w-md mx-auto">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${overallScore * 10}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Emotional Summary from Real Data */}
          {emotionalSummary && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">Emotional Analysis</h3>
                  <div className="space-y-3 text-slate-700">
                    <p className="leading-relaxed">{
                      typeof emotionalSummary === 'string'
                        ? emotionalSummary
                        : emotionalSummary && typeof emotionalSummary === 'object'
                          ? `Mood: ${emotionalSummary.mood || 'N/A'}. Primary Concerns: ${(emotionalSummary.primaryConcerns || []).join(', ')}`
                          : 'Emotional analysis data is being processed...'
                    }</p>
                    {Array.isArray(topConcerns) && topConcerns.length > 0 && (
                      <p>
                        Primary focus areas: <span className="font-semibold text-indigo-600">{topConcerns.map(d => d.domain).join(" & ")}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Domain Breakdown */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-10"
            >
              <h3 className="text-3xl font-bold text-slate-900 mb-3">Stress Domain Analysis</h3>
              <p className="text-slate-600 text-lg">Detailed breakdown of stress levels across different life areas</p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.isArray(domainScores) ? domainScores.map(({ domain, score }, index) => {
                const Icon = domainIcons[domain] || domainIcons.default;
                const { label, color, bg } = getStatusColor(score);
                const hasInsights = deepDiveSummaries[domain] && (
                  deepDiveSummaries[domain].summary || 
                  deepDiveSummaries[domain].actionableSteps?.length > 0 ||
                  deepDiveSummaries[domain].reflectionQuestions?.length > 0
                );

                return (
                  <motion.div
                    key={domain}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200/50 hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 bg-gradient-to-br ${getProgressColor(score)} rounded-lg flex items-center justify-center shadow-sm`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg mb-1">{domain}</h4>
                          <p className="text-slate-600 text-sm">Stress Level: {score}%</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${bg} ${color}`}>
                        {label}
                      </span>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">Intensity</span>
                        <span className="text-sm font-bold text-slate-900">{score}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 1.5, delay: 0.6 + index * 0.1, ease: "easeOut" }}
                          className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor(score)}`}
                        />
                      </div>
                    </div>
                    
                    {/* View Insights Button - Always show for real data */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.8 }}
                      onClick={() => {
                        const insight = deepDiveSummaries[domain] || {
                          summary: `Your ${domain} stress level is at ${score}%. ${score > 60 ? 'This indicates higher stress in this area.' : score > 30 ? 'This shows moderate stress levels.' : 'This shows good management in this area.'}`,
                          actionableSteps: [
                            `Focus on identifying the main stressors in ${domain}`,
                            `Consider practical steps to address these challenges`,
                            `Set small, achievable goals for improvement`
                          ],
                          reflectionQuestions: [
                            `What specific aspects of ${domain} cause you the most stress?`,
                            `What strategies have worked for you in the past?`,
                            `What support do you need to improve this area?`
                          ],
                          selfCompassion: `Remember that managing stress in ${domain} is an ongoing process. Be patient with yourself as you work toward improvement.`
                        };
                        handleViewInsights(domain, insight);
                      }}
                      className="w-full flex items-center justify-center space-x-2 bg-slate-50 hover:bg-slate-100 text-slate-700 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 border border-slate-200 group-hover:border-slate-300"
                    >
                      <Brain className="w-4 h-4" />
                      <span>View Insights</span>
                    </motion.button>
                  </motion.div>
                );
              }) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-slate-600">Domain analysis data is being processed...</p>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations Section - Real Data */}
          {overallScore !== null && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personalized Recommendations */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">Personalized Recommendations</h3>
                    <div className="space-y-3">
                      {Array.isArray(recommendations) ? recommendations.slice(0, 2).map((rec, index) => (
                        <p key={index} className="text-slate-700 leading-relaxed">
                          • {typeof rec === 'string' ? rec : (rec && typeof rec === 'object' ? JSON.stringify(rec) : 'Recommendation is being processed...')}
                        </p>
                      )) : (
                        <p className="text-slate-700 leading-relaxed">
                          • Personalized recommendations are being generated...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Assessment Summary */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">Assessment Summary</h3>
                    <p className="text-slate-700 leading-relaxed">
                      {typeof summary === 'string' ? summary : (summary && typeof summary === 'object' ? JSON.stringify(summary) : 'Assessment summary is being processed...')}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Therapy Support CTA - Based on Real Score */}
          {overallScore !== null && overallScore < 6 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl shadow-xl border border-red-200/50 p-8"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Professional Support Available</h3>
                <p className="text-slate-700 leading-relaxed mb-6 max-w-2xl mx-auto">
                  Based on your wellness score of {overallScore}/10, professional guidance could be beneficial. 
                  Our certified therapists are here to provide personalized support and evidence-based strategies.
                  {Array.isArray(topConcerns) && topConcerns.length > 0 && (
                    <span> Focus areas include: {topConcerns.map(d => d.domain).join(", ")}.</span>
                  )}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <motion.button
                    onClick={() => window.open('/therapist-booking', '_blank')}
                    className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Users className="w-5 h-5" />
                    <span>Book a Session</span>
                  </motion.button>
                  <motion.button
                    onClick={() => window.open('tel:1800-599-0019', '_self')}
                    className="bg-white border-2 border-red-300 text-red-600 hover:bg-red-50 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Phone className="w-5 h-5" />
                    <span>Crisis Support: 1800-599-0019</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          {(onViewDashboard || onTakeSurveyAgain) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="flex flex-col sm:flex-row justify-center gap-6"
            >
              {onViewDashboard && (
                <motion.button 
                  onClick={onViewDashboard}
                  className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl px-8 py-4 text-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>View Dashboard</span>
                </motion.button>
              )}
              {onTakeSurveyAgain && (
                <motion.button 
                  onClick={onTakeSurveyAgain}
                  className="bg-white border-2 border-slate-300 text-slate-700 rounded-xl px-8 py-4 text-lg font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Take Survey Again</span>
                </motion.button>
              )}
            </motion.div>
          )}
        </div>
        
        {/* Download PDF Button - Bottom Right */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.3, duration: 0.3 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <motion.button
            onClick={handleDownloadPDF}
            className="flex items-center space-x-3 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl transition-all duration-300 font-semibold shadow-2xl hover:shadow-emerald-500/25 hover:scale-105"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-5 h-5" />
            <span>Download Report</span>
          </motion.button>
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

export default WellnessScore; 