/**
 * Check-in Processor Service
 * 
 * Processes user check-in responses and applies stress detection
 * using the enhanced stress detector utility.
 */

import { isStressfulResponse, analyzeStressWithMCP, batchStressAnalysis, detectStress } from '../utils/stressDetector.js';
import { analyzeStressLevel } from './aiSuggestions.js';
import { saveDeepDiveInsight } from './firebase.js';

/**
 * Process a complete check-in with stress analysis
 * @param {Object} checkinData - Complete check-in data
 * @param {string} userId - User ID
 * @returns {Object} - Processed check-in with stress analysis
 */
export async function processCheckin(checkinData, userId) {
  const {
    responses,
    domain,
    timestamp = new Date().toISOString(),
    metadata = {}
  } = checkinData;

  console.log('🔍 Processing check-in for domain:', domain);
  console.log('📊 Responses to analyze:', responses.length);

  // Initialize processing results
  const processingResults = {
    userId,
    domain,
    timestamp,
    metadata,
    flaggedQuestions: [],
    stressAnalysis: {},
    domainStressLevel: 'low',
    mcpProtocol: 'Support',
    recommendations: [],
    needsDeepDive: false,
    processingTime: Date.now()
  };

  try {
    // Process each answer with stress detection
    const stressResults = [];
    
    for (const answer of responses) {
      const {
        questionId,
        questionText,
        answerText,
        answerValue,
        domain: answerDomain = domain
      } = answer;

      console.log(`🔍 Analyzing: ${questionText} -> ${answerText}`);

      // Apply stress detection using the enhanced utility
      const stressAnalysis = isStressfulResponse(answerText, questionText, answerDomain);
      
      // Enhanced analysis with MCP protocol
      const mcpAnalysis = analyzeStressWithMCP(answerText, questionText, answerDomain);
      
      // AI stress analysis for additional insights
      let aiAnalysis = null;
      try {
        aiAnalysis = await analyzeStressLevel(answerText, questionText);
      } catch (error) {
        console.warn('AI stress analysis failed for question:', questionId, error);
      }

      const result = {
        questionId,
        questionText,
        answerText,
        answerValue,
        domain: answerDomain,
        stressAnalysis,
        mcpAnalysis,
        aiAnalysis,
        isFlagged: stressAnalysis.isStressful,
        timestamp: new Date().toISOString()
      };

      stressResults.push(result);

      // Flag questions that meet stress criteria
      if (stressAnalysis.isStressful) {
        processingResults.flaggedQuestions.push({
          ...result,
          priority: stressAnalysis.confidenceScore > 0.8 ? 'high' : 'medium'
        });
      }

      // Store individual stress analysis
      processingResults.stressAnalysis[questionId] = result;
    }

    // Batch analysis for overall assessment
    const batchResults = batchStressAnalysis(stressResults.map(r => ({
      responseText: r.answerText,
      questionText: r.questionText,
      domain: r.domain
    })));

    // Determine domain stress level and MCP protocol
    const domainStressLevel = determineDomainStressLevel(batchResults, stressResults);
    const mcpProtocol = determineMCPProtocol(batchResults, stressResults);
    const needsDeepDive = shouldTriggerDeepDive(batchResults, stressResults);

    // Generate recommendations based on stress analysis
    const recommendations = generateRecommendations(batchResults, stressResults, domain);

    // Update processing results
    processingResults.domainStressLevel = domainStressLevel;
    processingResults.mcpProtocol = mcpProtocol;
    processingResults.needsDeepDive = needsDeepDive;
    processingResults.recommendations = recommendations;
    processingResults.batchAnalysis = batchResults;
    processingResults.totalQuestions = responses.length;
    processingResults.flaggedCount = processingResults.flaggedQuestions.length;
    processingResults.processingTime = Date.now() - processingResults.processingTime;

    console.log('✅ Check-in processing complete:', {
      domain,
      totalQuestions: responses.length,
      flaggedCount: processingResults.flaggedQuestions.length,
      stressLevel: domainStressLevel,
      mcpProtocol,
      needsDeepDive
    });

    return processingResults;

  } catch (error) {
    console.error('❌ Error processing check-in:', error);
    throw new Error(`Failed to process check-in: ${error.message}`);
  }
}

/**
 * Determine overall domain stress level
 * @param {Object} batchResults - Batch analysis results
 * @param {Array} stressResults - Individual stress analysis results
 * @returns {string} - Stress level: 'low', 'moderate', 'high'
 */
function determineDomainStressLevel(batchResults, stressResults) {
  const { averageSentimentScore, overallStressLevel } = batchResults;
  
  // Count high-stress responses
  const highStressCount = stressResults.filter(r => 
    r.stressAnalysis.sentimentScore > 0.7 || 
    r.stressAnalysis.intensity === 'high'
  ).length;

  const totalQuestions = stressResults.length;
  const highStressPercentage = (highStressCount / totalQuestions) * 100;

  // Determine stress level based on multiple factors
  if (averageSentimentScore > 0.7 || highStressPercentage > 40) {
    return 'high';
  } else if (averageSentimentScore > 0.5 || highStressPercentage > 20) {
    return 'moderate';
  } else {
    return 'low';
  }
}

/**
 * Determine MCP protocol based on stress analysis
 * @param {Object} batchResults - Batch analysis results
 * @param {Array} stressResults - Individual stress analysis results
 * @returns {string} - MCP protocol: 'Support', 'Monitor', 'Escalate'
 */
function determineMCPProtocol(batchResults, stressResults) {
  const { averageSentimentScore, overallStressLevel } = batchResults;
  
  // Count escalated responses
  const escalatedCount = stressResults.filter(r => 
    r.mcpAnalysis.mcp.protocol === 'Escalate'
  ).length;

  const totalQuestions = stressResults.length;
  const escalatedPercentage = (escalatedCount / totalQuestions) * 100;

  // Determine protocol based on severity
  if (averageSentimentScore > 0.8 || escalatedPercentage > 30) {
    return 'Escalate';
  } else if (averageSentimentScore > 0.6 || escalatedPercentage > 10) {
    return 'Monitor';
  } else {
    return 'Support';
  }
}

/**
 * Determine if deep dive should be triggered
 * @param {Object} batchResults - Batch analysis results
 * @param {Array} stressResults - Individual stress analysis results
 * @returns {boolean} - Whether deep dive should be triggered
 */
function shouldTriggerDeepDive(batchResults, stressResults) {
  const { averageSentimentScore, overallStressLevel } = batchResults;
  
  // Count flagged questions
  const flaggedCount = stressResults.filter(r => r.isFlagged).length;
  const totalQuestions = stressResults.length;
  const flaggedPercentage = (flaggedCount / totalQuestions) * 100;

  // Trigger deep dive if:
  // 1. High average sentiment score
  // 2. High percentage of flagged questions
  // 3. Any escalated responses
  const hasEscalated = stressResults.some(r => r.mcpAnalysis.mcp.protocol === 'Escalate');
  
  return (
    averageSentimentScore > 0.6 ||
    flaggedPercentage > 25 ||
    hasEscalated
  );
}

/**
 * Generate recommendations based on stress analysis
 * @param {Object} batchResults - Batch analysis results
 * @param {Array} stressResults - Individual stress analysis results
 * @param {string} domain - Domain name
 * @returns {Array} - Array of recommendations
 */
function generateRecommendations(batchResults, stressResults, domain) {
  const recommendations = [];
  const { averageSentimentScore, overallStressLevel } = batchResults;

  // Domain-specific recommendations
  const domainRecommendations = {
    'Work & Career': [
      'Consider setting clearer boundaries between work and personal time',
      'Explore stress management techniques like deep breathing or meditation',
      'Consider discussing workload with your manager or HR',
      'Take regular breaks throughout your workday'
    ],
    'Personal Life': [
      'Prioritize activities that bring you joy and relaxation',
      'Consider reaching out to friends or family for support',
      'Practice self-compassion and acknowledge your feelings',
      'Explore hobbies or activities that help you recharge'
    ],
    'Financial Stress': [
      'Consider creating a budget to better understand your financial situation',
      'Explore financial counseling or planning resources',
      'Focus on building an emergency fund, even with small amounts',
      'Consider discussing financial concerns with a trusted advisor'
    ],
    'Health': [
      'Prioritize getting adequate sleep and rest',
      'Consider incorporating regular exercise into your routine',
      'Practice stress-reduction techniques like meditation or yoga',
      'Consider discussing health concerns with a healthcare provider'
    ],
    'Self-Worth & Identity': [
      'Practice self-compassion and positive self-talk',
      'Consider exploring your values and what matters most to you',
      'Celebrate your accomplishments, no matter how small',
      'Consider working with a therapist or counselor for support'
    ]
  };

  // Add domain-specific recommendations
  const domainSpecific = domainRecommendations[domain] || [];
  recommendations.push(...domainSpecific);

  // Add severity-based recommendations
  if (averageSentimentScore > 0.7) {
    recommendations.push(
      'Consider reaching out to a mental health professional for support',
      'Practice stress management techniques regularly',
      'Prioritize self-care activities in your daily routine'
    );
  } else if (averageSentimentScore > 0.5) {
    recommendations.push(
      'Monitor your stress levels and practice self-care',
      'Consider implementing stress-reduction techniques',
      'Reach out to your support network when needed'
    );
  } else {
    recommendations.push(
      'Continue monitoring your well-being regularly',
      'Maintain healthy habits and routines',
      'Stay connected with your support network'
    );
  }

  // Add recommendations based on flagged questions
  const flaggedQuestions = stressResults.filter(r => r.isFlagged);
  if (flaggedQuestions.length > 0) {
    const topConcerns = flaggedQuestions
      .slice(0, 3)
      .map(q => q.questionText)
      .join(', ');
    
    recommendations.push(
      `Focus on addressing concerns related to: ${topConcerns}`,
      'Consider exploring these areas further in future check-ins'
    );
  }

  return recommendations.slice(0, 8); // Limit to top 8 recommendations
}

/**
 * Process check-in and save deep dive insights if needed
 * @param {Object} checkinData - Complete check-in data
 * @param {string} userId - User ID
 * @returns {Object} - Processing results with optional deep dive data
 */
export async function processCheckinWithDeepDive(checkinData, userId) {
  const processingResults = await processCheckin(checkinData, userId);

  // If deep dive is needed, prepare data for deep dive component
  if (processingResults.needsDeepDive) {
    const deepDiveData = {
      domain: processingResults.domain,
      flaggedQuestions: processingResults.flaggedQuestions.map(q => ({
        id: q.questionId,
        text: q.questionText,
        selectedOption: q.answerText,
        score: q.answerValue,
        emotion: q.aiAnalysis?.emotion || q.stressAnalysis.emotion,
        intensity: q.aiAnalysis?.intensity || q.stressAnalysis.intensity,
        stressScore: q.aiAnalysis?.score || q.stressAnalysis.sentimentScore * 10,
        answerLabel: q.answerText,
        domain: q.domain,
        aiAnalysis: q.aiAnalysis ? {
          score: q.aiAnalysis.score,
          emotion: q.aiAnalysis.emotion,
          intensity: q.aiAnalysis.intensity
        } : null
      })),
      domainNeedsReview: processingResults.mcpProtocol === 'Monitor' || processingResults.mcpProtocol === 'Escalate',
      sometimesCount: processingResults.flaggedQuestions.filter(q => 
        q.answerText.toLowerCase().includes('sometimes')
      ).length,
      totalAnswers: processingResults.totalQuestions
    };

    processingResults.deepDiveData = deepDiveData;
  }

  return processingResults;
}

/**
 * Process multiple check-ins for trend analysis
 * @param {Array} checkins - Array of check-in data
 * @param {string} userId - User ID
 * @returns {Object} - Trend analysis results
 */
export async function processCheckinTrends(checkins, userId) {
  console.log('📈 Processing check-in trends for', checkins.length, 'check-ins');

  const processedCheckins = [];
  const trendAnalysis = {
    userId,
    totalCheckins: checkins.length,
    domains: {},
    overallTrend: 'stable',
    stressTrends: [],
    recommendations: []
  };

  try {
    // Process each check-in
    for (const checkin of checkins) {
      const processed = await processCheckin(checkin, userId);
      processedCheckins.push(processed);
    }

    // Analyze trends by domain
    const domainData = {};
    processedCheckins.forEach(checkin => {
      const domain = checkin.domain;
      if (!domainData[domain]) {
        domainData[domain] = [];
      }
      domainData[domain].push({
        timestamp: checkin.timestamp,
        stressLevel: checkin.domainStressLevel,
        mcpProtocol: checkin.mcpProtocol,
        flaggedCount: checkin.flaggedCount,
        averageSentiment: checkin.batchAnalysis.averageSentimentScore
      });
    });

    // Calculate trends for each domain
    Object.entries(domainData).forEach(([domain, data]) => {
      const sortedData = data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      if (sortedData.length >= 2) {
        const recent = sortedData[sortedData.length - 1];
        const previous = sortedData[sortedData.length - 2];
        
        const stressTrend = calculateTrend(recent.averageSentiment, previous.averageSentiment);
        const protocolTrend = recent.mcpProtocol !== previous.mcpProtocol;
        
        trendAnalysis.domains[domain] = {
          trend: stressTrend,
          currentLevel: recent.stressLevel,
          currentProtocol: recent.mcpProtocol,
          protocolChanged: protocolTrend,
          checkinCount: sortedData.length,
          recentData: recent,
          previousData: previous
        };
      }
    });

    // Calculate overall trend
    const overallTrend = calculateOverallTrend(trendAnalysis.domains);
    trendAnalysis.overallTrend = overallTrend;

    // Generate trend-based recommendations
    trendAnalysis.recommendations = generateTrendRecommendations(trendAnalysis);

    console.log('✅ Trend analysis complete:', {
      totalCheckins: checkins.length,
      domains: Object.keys(trendAnalysis.domains),
      overallTrend
    });

    return trendAnalysis;

  } catch (error) {
    console.error('❌ Error processing check-in trends:', error);
    throw new Error(`Failed to process check-in trends: ${error.message}`);
  }
}

/**
 * Calculate trend between two values
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {string} - Trend: 'improving', 'worsening', 'stable'
 */
function calculateTrend(current, previous) {
  const difference = current - previous;
  const threshold = 0.1; // 10% threshold for significant change
  
  if (Math.abs(difference) < threshold) {
    return 'stable';
  } else if (difference < 0) {
    return 'improving';
  } else {
    return 'worsening';
  }
}

/**
 * Calculate overall trend across all domains
 * @param {Object} domains - Domain trend data
 * @returns {string} - Overall trend
 */
function calculateOverallTrend(domains) {
  const trends = Object.values(domains).map(d => d.trend);
  const improving = trends.filter(t => t === 'improving').length;
  const worsening = trends.filter(t => t === 'worsening').length;
  const stable = trends.filter(t => t === 'stable').length;

  if (worsening > improving && worsening > stable) {
    return 'worsening';
  } else if (improving > worsening && improving > stable) {
    return 'improving';
  } else {
    return 'stable';
  }
}

/**
 * Generate recommendations based on trend analysis
 * @param {Object} trendAnalysis - Trend analysis results
 * @returns {Array} - Array of recommendations
 */
function generateTrendRecommendations(trendAnalysis) {
  const recommendations = [];

  if (trendAnalysis.overallTrend === 'worsening') {
    recommendations.push(
      'Your stress levels have been increasing. Consider reaching out for professional support.',
      'Focus on stress management techniques and self-care practices.',
      'Consider discussing your concerns with trusted friends or family members.'
    );
  } else if (trendAnalysis.overallTrend === 'improving') {
    recommendations.push(
      'Great progress! Your stress levels are improving. Keep up the good work!',
      'Continue with the strategies that have been working for you.',
      'Consider sharing what has been helpful with others who might benefit.'
    );
  } else {
    recommendations.push(
      'Your stress levels have remained stable. Continue monitoring and practicing self-care.',
      'Consider exploring new stress management techniques to further improve your well-being.',
      'Stay connected with your support network and maintain healthy routines.'
    );
  }

  // Add domain-specific trend recommendations
  Object.entries(trendAnalysis.domains).forEach(([domain, data]) => {
    if (data.trend === 'worsening') {
      recommendations.push(
        `Your ${domain} stress has been increasing. Consider focusing on this area.`
      );
    } else if (data.trend === 'improving') {
      recommendations.push(
        `Great progress in ${domain}! Keep up the positive changes.`
      );
    }
  });

  return recommendations.slice(0, 6); // Limit to top 6 recommendations
}

/**
 * Export check-in data for external analysis
 * @param {Object} processingResults - Processing results
 * @returns {Object} - Exported data format
 */
export function exportCheckinData(processingResults) {
  return {
    metadata: {
      userId: processingResults.userId,
      domain: processingResults.domain,
      timestamp: processingResults.timestamp,
      processingTime: processingResults.processingTime
    },
    summary: {
      totalQuestions: processingResults.totalQuestions,
      flaggedCount: processingResults.flaggedCount,
      stressLevel: processingResults.domainStressLevel,
      mcpProtocol: processingResults.mcpProtocol,
      needsDeepDive: processingResults.needsDeepDive
    },
    analysis: {
      batchAnalysis: processingResults.batchAnalysis,
      stressAnalysis: processingResults.stressAnalysis,
      recommendations: processingResults.recommendations
    },
    flaggedQuestions: processingResults.flaggedQuestions.map(q => ({
      questionId: q.questionId,
      questionText: q.questionText,
      answerText: q.answerText,
      priority: q.priority,
      stressScore: q.stressAnalysis.sentimentScore,
      emotion: q.stressAnalysis.emotion,
      intensity: q.stressAnalysis.intensity,
      mcpProtocol: q.mcpAnalysis.mcp.protocol
    }))
  };
}

export default {
  processCheckin,
  processCheckinWithDeepDive,
  processCheckinTrends,
  exportCheckinData
}; 