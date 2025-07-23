/**
 * Utility functions for stress analysis optimization and data processing
 * Part of Layer 1 AI system
 */

/**
 * Calculate comprehensive stress metrics from survey responses
 * @param {Array} responses - Array of survey responses with stress analysis
 * @returns {Object} Comprehensive stress metrics
 */
export const calculateStressMetrics = (responses) => {
  if (!responses || responses.length === 0) {
    return {
      averageStressScore: 0,
      highStressCount: 0,
      moderateStressCount: 0,
      lowStressCount: 0,
      stressByDomain: {},
      overallRiskLevel: 'low'
    };
  }

  const stressScores = responses.map(r => r.stressScore || r.aiAnalysis?.enhanced?.score || r.aiAnalysis?.score || 0);
  const averageStressScore = stressScores.reduce((sum, score) => sum + score, 0) / stressScores.length;

  const highStressCount = stressScores.filter(score => score >= 7).length;
  const moderateStressCount = stressScores.filter(score => score >= 4 && score < 7).length;
  const lowStressCount = stressScores.filter(score => score < 4).length;

  // Calculate stress by domain
  const stressByDomain = {};
  responses.forEach(response => {
    const domain = response.domain;
    const stressScore = response.stressScore || response.aiAnalysis?.enhanced?.score || response.aiAnalysis?.score || 0;
    
    if (!stressByDomain[domain]) {
      stressByDomain[domain] = {
        scores: [],
        averageScore: 0,
        highStressCount: 0,
        totalQuestions: 0
      };
    }
    
    stressByDomain[domain].scores.push(stressScore);
    stressByDomain[domain].totalQuestions++;
    if (stressScore >= 7) {
      stressByDomain[domain].highStressCount++;
    }
  });

  // Calculate averages for each domain
  Object.keys(stressByDomain).forEach(domain => {
    const domainData = stressByDomain[domain];
    domainData.averageScore = domainData.scores.reduce((sum, score) => sum + score, 0) / domainData.scores.length;
  });

  // Determine overall risk level
  let overallRiskLevel = 'low';
  if (highStressCount >= 5 || averageStressScore >= 8) {
    overallRiskLevel = 'critical';
  } else if (highStressCount >= 3 || averageStressScore >= 6) {
    overallRiskLevel = 'high';
  } else if (highStressCount >= 1 || averageStressScore >= 4) {
    overallRiskLevel = 'moderate';
  }

  return {
    averageStressScore: Math.round(averageStressScore * 100) / 100,
    highStressCount,
    moderateStressCount,
    lowStressCount,
    stressByDomain,
    overallRiskLevel,
    totalResponses: responses.length
  };
};

/**
 * Identify stress triggers from responses
 * @param {Array} responses - Array of survey responses with stress analysis
 * @returns {Array} Array of identified stress triggers
 */
export const identifyStressTriggers = (responses) => {
  const triggers = [];
  
  const highStressResponses = responses.filter(r => {
    const stressScore = r.stressScore || r.aiAnalysis?.enhanced?.score || r.aiAnalysis?.score || 0;
    return stressScore >= 7;
  });

  highStressResponses.forEach(response => {
    const trigger = {
      question: response.question,
      answer: response.answer,
      domain: response.domain,
      stressScore: response.stressScore || response.aiAnalysis?.enhanced?.score || response.aiAnalysis?.score || 0,
      emotion: response.aiAnalysis?.emotion || response.emotion || '',
      causeTag: response.aiAnalysis?.causeTag || response.causeTag || '',
      intensity: response.aiAnalysis?.intensity || response.intensity || 'High'
    };
    
    triggers.push(trigger);
  });

  return triggers.sort((a, b) => b.stressScore - a.stressScore);
};

/**
 * Generate stress summary report
 * @param {Object} stressMetrics - Result from calculateStressMetrics
 * @param {Array} triggers - Result from identifyStressTriggers
 * @returns {Object} Comprehensive stress summary
 */
export const generateStressSummary = (stressMetrics, triggers) => {
  const primaryStressDomains = Object.entries(stressMetrics.stressByDomain)
    .filter(([domain, data]) => data.averageScore >= 6)
    .sort((a, b) => b[1].averageScore - a[1].averageScore)
    .map(([domain, data]) => ({
      domain,
      averageScore: data.averageScore,
      highStressCount: data.highStressCount,
      totalQuestions: data.totalQuestions
    }));

  const topStressTriggers = triggers.slice(0, 3);

  return {
    overallRisk: stressMetrics.overallRiskLevel,
    averageStress: stressMetrics.averageStressScore,
    totalHighStressResponses: stressMetrics.highStressCount,
    primaryStressDomains,
    topStressTriggers,
    needsAttention: stressMetrics.overallRiskLevel === 'high' || stressMetrics.overallRiskLevel === 'critical',
    recommendProfessionalHelp: stressMetrics.overallRiskLevel === 'critical' || stressMetrics.highStressCount >= 5,
    summary: generateTextSummary(stressMetrics, primaryStressDomains, topStressTriggers)
  };
};

/**
 * Generate human-readable text summary
 * @param {Object} stressMetrics - Stress metrics
 * @param {Array} primaryStressDomains - Primary stress domains
 * @param {Array} topStressTriggers - Top stress triggers
 * @returns {string} Human-readable summary
 */
function generateTextSummary(stressMetrics, primaryStressDomains, topStressTriggers) {
  let summary = '';

  if (stressMetrics.overallRiskLevel === 'critical') {
    summary = `Your responses indicate significant stress across multiple areas. With ${stressMetrics.highStressCount} high-stress responses, `;
  } else if (stressMetrics.overallRiskLevel === 'high') {
    summary = `Your responses show elevated stress levels that warrant attention. With ${stressMetrics.highStressCount} high-stress responses, `;
  } else if (stressMetrics.overallRiskLevel === 'moderate') {
    summary = `Your responses indicate manageable stress levels with some areas of concern. `;
  } else {
    summary = `Your responses show generally healthy stress levels. `;
  }

  if (primaryStressDomains.length > 0) {
    const domainNames = primaryStressDomains.map(d => d.domain).join(', ');
    summary += `The primary areas of concern are: ${domainNames}. `;
  }

  if (topStressTriggers.length > 0) {
    summary += `Key stress triggers include responses related to ${topStressTriggers.map(t => t.emotion || t.causeTag).filter(Boolean).join(', ')}.`;
  }

  return summary;
}

/**
 * Compare current stress levels with historical patterns
 * @param {Object} currentMetrics - Current stress metrics
 * @param {Array} historicalData - Historical stress data from vector storage
 * @returns {Object} Comparison analysis
 */
export const compareWithHistory = (currentMetrics, historicalData) => {
  if (!historicalData || historicalData.length === 0) {
    return {
      hasHistoricalData: false,
      trend: 'no_data',
      message: 'No historical data available for comparison'
    };
  }

  const historicalScores = historicalData
    .map(entry => entry.metadata?.stressScore || 0)
    .filter(score => score > 0);

  if (historicalScores.length === 0) {
    return {
      hasHistoricalData: false,
      trend: 'no_data',
      message: 'No valid historical stress scores available'
    };
  }

  const historicalAverage = historicalScores.reduce((sum, score) => sum + score, 0) / historicalScores.length;
  const currentAverage = currentMetrics.averageStressScore;

  const difference = currentAverage - historicalAverage;
  const percentageChange = ((difference / historicalAverage) * 100);

  let trend = 'stable';
  let message = '';

  if (Math.abs(percentageChange) < 10) {
    trend = 'stable';
    message = 'Your stress levels are consistent with your historical patterns';
  } else if (percentageChange > 20) {
    trend = 'increasing';
    message = `Your stress levels have increased by ${Math.round(percentageChange)}% compared to your historical average`;
  } else if (percentageChange < -20) {
    trend = 'decreasing';
    message = `Your stress levels have decreased by ${Math.round(Math.abs(percentageChange))}% compared to your historical average`;
  } else if (percentageChange > 0) {
    trend = 'slightly_increasing';
    message = 'Your stress levels are slightly higher than usual';
  } else {
    trend = 'slightly_decreasing';
    message = 'Your stress levels are slightly lower than usual';
  }

  return {
    hasHistoricalData: true,
    historicalAverage: Math.round(historicalAverage * 100) / 100,
    currentAverage: Math.round(currentAverage * 100) / 100,
    difference: Math.round(difference * 100) / 100,
    percentageChange: Math.round(percentageChange * 100) / 100,
    trend,
    message,
    dataPoints: historicalScores.length
  };
};

export default {
  calculateStressMetrics,
  identifyStressTriggers,
  generateStressSummary,
  compareWithHistory
};