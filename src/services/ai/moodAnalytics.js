import { analyzeStressLevel } from '../aiSuggestions';

/**
 * Generate AI-powered mood insights and predictions
 * @param {Object} moodData - User's mood data
 * @param {string} period - Time period for analysis
 * @returns {Promise<Object>} Generated insights
 */
export const generateMoodInsights = async (moodData, period = '7d') => {
  try {
    // Simulate AI analysis - in production this would call OpenAI
    const insights = {
      moodTrend: calculateTrend(moodData.moodScores),
      stressTrend: calculateTrend(moodData.stressLevels),
      stabilityTrend: calculateStabilityTrend(moodData.moodScores),
      riskTrend: calculateRiskTrend(moodData.stressLevels),
      predictiveInsight: await generatePredictiveInsight(moodData),
      recommendations: generateRecommendations(moodData)
    };

    return insights;
  } catch (error) {
    console.error('Error generating mood insights:', error);
    return {
      moodTrend: 0,
      stressTrend: 0,
      stabilityTrend: 0,
      riskTrend: 0,
      predictiveInsight: "Unable to generate insights at this time.",
      recommendations: []
    };
  }
};

const calculateTrend = (scores) => {
  if (!scores || scores.length < 2) return 0;
  const recent = scores.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const previous = scores.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
  return ((recent - previous) / previous * 100).toFixed(1);
};

const calculateStabilityTrend = (scores) => {
  if (!scores || scores.length < 2) return 0;
  const variance = scores.reduce((acc, score, i, arr) => {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return acc + Math.pow(score - mean, 2);
  }, 0) / scores.length;
  return Math.max(0, 100 - variance * 10).toFixed(1);
};

const calculateRiskTrend = (stressLevels) => {
  if (!stressLevels || stressLevels.length === 0) return 0;
  const highStressCount = stressLevels.filter(level => level > 7).length;
  return ((highStressCount / stressLevels.length) * 100).toFixed(1);
};

const generatePredictiveInsight = async (moodData) => {
  const insights = [
    "Based on your recent patterns, your stress levels tend to peak on weekdays. Consider scheduling more relaxation time during the week.",
    "Your mood shows improvement when you engage in physical activities. Maintaining a regular exercise routine could help stabilize your emotional well-being.",
    "You show resilience in bouncing back from challenging periods. Your coping strategies are working well - keep it up!",
    "Recent data suggests you respond well to social interactions. Consider reaching out to friends or family when feeling low.",
    "Your sleep patterns seem to correlate with mood changes. Focusing on sleep hygiene might improve your overall well-being."
  ];
  
  return insights[Math.floor(Math.random() * insights.length)];
};

const generateRecommendations = (moodData) => {
  return [
    {
      title: "Mindful Breathing",
      description: "Practice deep breathing exercises to reduce immediate stress"
    },
    {
      title: "Physical Activity",
      description: "Engage in light exercise to boost endorphins and mood"
    },
    {
      title: "Social Connection",
      description: "Reach out to a friend or family member for emotional support"
    }
  ];
};
