import { getUserEmotionalHistory, querySimilarVectors, cleanupOldVectors } from '../utils/vectorStore';
import { getResponseEmbedding } from '../utils/embeddingService';

/**
 * Comprehensive emotional pattern analysis service for Layer 1 AI system
 */

/**
 * Analyze user's emotional patterns after survey completion
 * @param {string} userId - User's unique identifier
 * @param {Array} currentResponses - Current survey responses with stress analysis
 * @returns {Promise<Object>} Pattern analysis results
 */
export const analyzeEmotionalPatterns = async (userId, currentResponses) => {
  try {
    console.log(`🧠 Starting emotional pattern analysis for user ${userId}`);
    
    // Step 1: Get user's emotional history (last 10 entries)
    const emotionalHistory = await getUserEmotionalHistory(userId, 10);
    console.log(`📊 Retrieved ${emotionalHistory.length} historical emotional entries`);
    
    // Step 2: Analyze current responses for high stress patterns
    const highStressResponses = currentResponses.filter(response => {
      const stressScore = response.stressScore || response.aiAnalysis?.enhanced?.score || response.aiAnalysis?.score || 0;
      return stressScore >= 7;
    });
    
    console.log(`🚨 Found ${highStressResponses.length} high stress responses in current survey`);
    
    // Step 3: For each high stress response, find similar past responses
    const similarityAnalysis = [];
    
    for (const response of highStressResponses) {
      try {
        // Generate embedding for current response
        const responseData = {
          question: response.question || response.text,
          answer: response.answer || response.selectedOption || response.answerLabel,
          domain: response.domain,
          stressScore: response.stressScore || response.aiAnalysis?.enhanced?.score || response.aiAnalysis?.score || 0
        };
        
        const currentEmbedding = await getResponseEmbedding(responseData);
        
        // Query for similar past responses
        const similarResponses = await querySimilarVectors(userId, currentEmbedding, 3);
        
        // Filter for high stress similar responses
        const highStressSimilar = similarResponses.filter(similar => {
          const similarStressScore = similar.metadata?.stressScore || 0;
          return similarStressScore >= 7 && similar.similarity > 0.7; // High similarity threshold
        });
        
        if (highStressSimilar.length >= 2) {
          similarityAnalysis.push({
            currentResponse: responseData,
            similarResponses: highStressSimilar,
            patternStrength: highStressSimilar.length,
            averageSimilarity: highStressSimilar.reduce((sum, r) => sum + r.similarity, 0) / highStressSimilar.length,
            domain: response.domain,
            isRecurringPattern: true
          });
        }
      } catch (error) {
        console.error('Error analyzing similarity for response:', error);
      }
    }
    
    // Step 4: Determine if deep-dive mode should be triggered
    const shouldTriggerDeepDive = similarityAnalysis.length > 0;
    const recurringPatterns = similarityAnalysis.filter(analysis => analysis.isRecurringPattern);
    
    // Step 5: Generate recommendations
    const recommendations = generateRecommendations(similarityAnalysis, emotionalHistory);
    
    const analysisResult = {
      userId,
      timestamp: new Date().toISOString(),
      emotionalHistoryCount: emotionalHistory.length,
      currentHighStressCount: highStressResponses.length,
      recurringPatternsFound: recurringPatterns.length,
      shouldTriggerDeepDive,
      shouldRecommendTherapist: recurringPatterns.length >= 2,
      patternAnalysis: similarityAnalysis,
      recommendations,
      summary: {
        hasRecurringStress: recurringPatterns.length > 0,
        primaryStressDomains: [...new Set(recurringPatterns.map(p => p.domain))],
        riskLevel: getRiskLevel(recurringPatterns.length, highStressResponses.length),
        confidence: calculateConfidence(similarityAnalysis)
      }
    };
    
    console.log(`✅ Emotional pattern analysis completed:`, {
      recurringPatterns: analysisResult.recurringPatternsFound,
      shouldTriggerDeepDive: analysisResult.shouldTriggerDeepDive,
      shouldRecommendTherapist: analysisResult.shouldRecommendTherapist,
      primaryDomains: analysisResult.summary.primaryStressDomains
    });
    
    return analysisResult;
    
  } catch (error) {
    console.error('❌ Error in emotional pattern analysis:', error);
    return {
      userId,
      error: error.message,
      shouldTriggerDeepDive: false,
      shouldRecommendTherapist: false,
      summary: { hasRecurringStress: false, riskLevel: 'low', confidence: 0 }
    };
  }
};

/**
 * Generate personalized recommendations based on pattern analysis
 * @param {Array} similarityAnalysis - Array of similarity analysis results
 * @param {Array} emotionalHistory - User's emotional history
 * @returns {Object} Recommendations object
 */
function generateRecommendations(similarityAnalysis, emotionalHistory) {
  const recommendations = {
    immediate: [],
    longTerm: [],
    professional: []
  };
  
  const recurringPatterns = similarityAnalysis.filter(analysis => analysis.isRecurringPattern);
  const primaryDomains = [...new Set(recurringPatterns.map(p => p.domain))];
  
  if (recurringPatterns.length >= 2) {
    recommendations.immediate.push("Consider taking a break to assess recurring stress patterns");
    recommendations.immediate.push("Practice stress-reduction techniques before situations that typically trigger stress");
    
    recommendations.professional.push("Schedule a consultation with a mental health professional");
    recommendations.professional.push("Consider counseling to address recurring stress patterns");
  }
  
  if (primaryDomains.includes('Work & Career')) {
    recommendations.immediate.push("Evaluate work-life balance and boundary setting");
    recommendations.longTerm.push("Develop career stress management strategies");
  }
  
  if (primaryDomains.includes('Relationships')) {
    recommendations.immediate.push("Focus on communication skills and relationship boundaries");
    recommendations.longTerm.push("Consider relationship counseling or communication workshops");
  }
  
  if (primaryDomains.includes('Self-Worth & Identity')) {
    recommendations.immediate.push("Practice self-compassion and positive self-talk");
    recommendations.longTerm.push("Explore self-worth building activities and therapy");
  }
  
  return recommendations;
}

/**
 * Calculate risk level based on recurring patterns
 * @param {number} recurringPatternsCount - Number of recurring patterns found
 * @param {number} currentHighStressCount - Number of current high stress responses
 * @returns {string} Risk level: 'low', 'moderate', 'high'
 */
function getRiskLevel(recurringPatternsCount, currentHighStressCount) {
  if (recurringPatternsCount >= 3 || currentHighStressCount >= 5) {
    return 'high';
  } else if (recurringPatternsCount >= 2 || currentHighStressCount >= 3) {
    return 'moderate';
  } else if (recurringPatternsCount >= 1 || currentHighStressCount >= 1) {
    return 'low-moderate';
  }
  return 'low';
}

/**
 * Calculate confidence level for the analysis
 * @param {Array} similarityAnalysis - Array of similarity analysis results
 * @returns {number} Confidence score 0-1
 */
function calculateConfidence(similarityAnalysis) {
  if (similarityAnalysis.length === 0) return 0;
  
  const avgSimilarity = similarityAnalysis.reduce((sum, analysis) => 
    sum + analysis.averageSimilarity, 0) / similarityAnalysis.length;
  
  const patternStrength = similarityAnalysis.reduce((sum, analysis) => 
    sum + analysis.patternStrength, 0) / similarityAnalysis.length;
  
  // Combine similarity and pattern strength for confidence
  return Math.min((avgSimilarity * 0.6 + (patternStrength / 3) * 0.4), 1);
}

/**
 * Perform vector cleanup for storage optimization
 * @param {string} userId - User's unique identifier
 * @param {number} keepRecent - Number of recent vectors to keep (default: 50)
 * @returns {Promise<Object>} Cleanup result
 */
export const performVectorCleanup = async (userId, keepRecent = 50) => {
  try {
    console.log(`🧹 Starting vector cleanup for user ${userId}`);
    const cleanupResult = await cleanupOldVectors(userId, keepRecent);
    console.log(`✅ Vector cleanup completed for user ${userId}:`, cleanupResult);
    return cleanupResult;
  } catch (error) {
    console.error('❌ Error during vector cleanup:', error);
    return { error: error.message };
  }
};

/**
 * Deep dive trigger based on emotional patterns
 * @param {Object} patternAnalysis - Result from analyzeEmotionalPatterns
 * @returns {Object} Deep dive configuration
 */
export const generateDeepDiveTrigger = (patternAnalysis) => {
  if (!patternAnalysis.shouldTriggerDeepDive) {
    return {
      shouldTrigger: false,
      reason: 'No recurring stress patterns detected'
    };
  }
  
  const trigger = {
    shouldTrigger: true,
    reason: `Detected ${patternAnalysis.recurringPatternsFound} recurring stress patterns`,
    priority: patternAnalysis.summary.riskLevel,
    recommendTherapist: patternAnalysis.shouldRecommendTherapist,
    focusDomains: patternAnalysis.summary.primaryStressDomains,
    confidence: patternAnalysis.summary.confidence,
    recommendations: patternAnalysis.recommendations
  };
  
  return trigger;
};

export default {
  analyzeEmotionalPatterns,
  performVectorCleanup,
  generateDeepDiveTrigger
};