/**
 * Enhanced Stress Analysis Service
 * Provides per-question stress analysis with detailed emotional and contextual insights
 */

import { apiFetch } from '../lib/api';

/**
 * Analyze individual survey question response for stress indicators
 * @param {string} question - The survey question text
 * @param {string} answer - User's response/answer
 * @param {string} domain - Survey domain (Work & Career, Personal Life, etc.)
 * @param {string} questionId - Unique identifier for the question
 * @returns {Promise<Object>} Enhanced analysis result
 */
export async function analyzeQuestionStress(question, answer, domain, questionId) {
  try {
    console.log(`🔍 Analyzing stress for question ${questionId}:`, { question, answer, domain });
    
    // Call enhanced stress analysis API
    const response = await apiFetch('/api/enhanced-stress-analysis', {
      method: 'POST',
      body: JSON.stringify({
        questionId,
        responseText: answer,
        domain,
        userId: 'demo-user-123' // Add userId for API compatibility
      })
    });

    console.log(`📡 API response status: ${response.status}`);

    if (!response.ok) {
      console.error(`❌ API call failed with status ${response.status}: ${response.statusText}`);
      throw new Error(`API call failed: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json();
    console.log('📊 Raw API response:', result);
    
    // Check if result has the expected structure from our simple API
    if (result.enhancedScore !== undefined && result.emotion && result.causeTag) {
      // Simple API response format: { questionId, enhancedScore, emotion, causeTag }
      const enhancedResult = {
        questionId: result.questionId || questionId,
        enhancedScore: result.enhancedScore,
        emotion: result.emotion,
        causeTag: result.causeTag,
        timestamp: new Date().toISOString(),
        analysisVersion: '2.0'
      };
      
      console.log('✅ Analysis successful:', enhancedResult);
      return enhancedResult;
    }
    
    // Check if result has the complex API structure
    if (result.success && result.data) {
      // Complex API response format: { success: true, data: { ... } }
      const data = result.data;
      
      if (!data.enhancedScore && !data.score) {
        throw new Error('Missing enhancedScore/score in API response data');
      }
      if (!data.emotion && !data.tag) {
        throw new Error('Missing emotion/tag in API response data');
      }
      if (!data.causeTag) {
        throw new Error('Missing causeTag in API response data');
      }
      
      const enhancedResult = {
        questionId,
        enhancedScore: data.enhancedScore || data.score,
        emotion: data.emotion || data.tag,
        causeTag: data.causeTag,
        timestamp: new Date().toISOString(),
        analysisVersion: '2.0'
      };
      
      console.log('✅ Analysis successful (complex format):', enhancedResult);
      return enhancedResult;
    }
    
    // If neither format is recognized, throw detailed error
    console.error('❌ Unexpected API response format:', result);
    throw new Error(`Unexpected API response format. Expected enhancedScore, emotion, causeTag. Got: ${Object.keys(result).join(', ')}`);

  } catch (error) {
    console.error('❌ Enhanced stress analysis failed:', error.message);
    console.log('🔄 Using fallback analysis instead');
    
    // Return fallback analysis with consistent format
    const fallbackResult = createLocalFallbackAnalysis(question, answer, domain, questionId);
    
    // Ensure fallback has the required fields
    const consistentResult = {
      questionId,
      enhancedScore: fallbackResult.score || 5,
      emotion: fallbackResult.tag || fallbackResult.emotion || 'Moderate Stress',
      causeTag: fallbackResult.causeTag || 'general_stress',
      timestamp: new Date().toISOString(),
      analysisVersion: '2.0-fallback'
    };
    
    console.log('✅ Fallback analysis:', consistentResult);
    return consistentResult;
  }
}

/**
 * Batch analyze multiple questions for comprehensive stress assessment
 * @param {Array} questionResponses - Array of {question, answer, domain, questionId}
 * @returns {Promise<Object>} Batch analysis results
 */
export async function batchAnalyzeStress(questionResponses) {
  const results = {};
  const errors = [];

  // Process questions in parallel but with reasonable rate limiting
  const batchSize = 3;
  const batches = [];
  
  for (let i = 0; i < questionResponses.length; i += batchSize) {
    batches.push(questionResponses.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const batchPromises = batch.map(async ({ question, answer, domain, questionId }) => {
      try {
        const analysis = await analyzeQuestionStress(question, answer, domain, questionId);
        results[questionId] = analysis;
      } catch (error) {
        errors.push({ questionId, error: error.message });
        results[questionId] = createLocalFallbackAnalysis(question, answer, domain, questionId);
      }
    });

    await Promise.all(batchPromises);
    
    // Small delay between batches to avoid rate limiting
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return {
    results,
    errors,
    summary: generateBatchSummary(results)
  };
}

/**
 * Generate summary of stress analysis across all questions
 * @param {Object} analysisResults - Results from batch analysis
 * @returns {Object} Summary statistics and insights
 */
function generateBatchSummary(analysisResults) {
  const analyses = Object.values(analysisResults);
  
  if (analyses.length === 0) {
    return {
      overallStressLevel: 'None',
      primaryCauseAreas: [],
      dominantEmotions: [],
      questionsNeedingDeepDive: [],
      riskFactors: []
    };
  }

  // Calculate stress level distribution
  const stressLevels = analyses.map(a => a.stressLevel);
  const stressCount = {
    None: stressLevels.filter(s => s === 'None').length,
    Mild: stressLevels.filter(s => s === 'Mild').length,
    Moderate: stressLevels.filter(s => s === 'Moderate').length,
    High: stressLevels.filter(s => s === 'High').length
  };

  // Determine overall stress level
  let overallStressLevel = 'None';
  if (stressCount.High > 0) overallStressLevel = 'High';
  else if (stressCount.Moderate > 1) overallStressLevel = 'Moderate';
  else if (stressCount.Moderate === 1 || stressCount.Mild > 2) overallStressLevel = 'Mild';

  // Find primary cause areas
  const causeAreas = analyses.map(a => a.causeArea);
  const causeCount = {};
  causeAreas.forEach(cause => {
    causeCount[cause] = (causeCount[cause] || 0) + 1;
  });
  const primaryCauseAreas = Object.entries(causeCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([cause]) => cause);

  // Find dominant emotions
  const allEmotions = analyses.flatMap(a => a.emotionTone || []);
  const emotionCount = {};
  allEmotions.forEach(emotion => {
    emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
  });
  const dominantEmotions = Object.entries(emotionCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([emotion]) => emotion);

  // Find questions needing deep dive
  const questionsNeedingDeepDive = analyses
    .filter(a => a.needsDeepDive)
    .map(a => a.questionId);

  // Identify risk factors
  const riskFactors = [];
  if (stressCount.High >= 2) riskFactors.push('Multiple high-stress areas');
  if (stressCount.Moderate >= 3) riskFactors.push('Widespread moderate stress');
  if (dominantEmotions.includes('overwhelmed')) riskFactors.push('Feeling overwhelmed');
  if (dominantEmotions.includes('anxious')) riskFactors.push('Anxiety indicators');

  return {
    overallStressLevel,
    primaryCauseAreas,
    dominantEmotions,
    questionsNeedingDeepDive,
    riskFactors,
    stressDistribution: stressCount,
    totalQuestions: analyses.length
  };
}

/**
 * Create local fallback analysis when API is unavailable
 * @param {string} question - The survey question
 * @param {string} answer - User's answer
 * @param {string} domain - Survey domain
 * @param {string} questionId - Question identifier
 * @returns {Object} Fallback analysis
 */
function createLocalFallbackAnalysis(question, answer, domain, questionId) {
  try {
    const lowerAnswer = answer.toLowerCase();
    
    console.log('🔄 Creating fallback analysis for:', { questionId, answer, domain });
    
    // New simplified scoring logic based on frequency words
    let score = 2; // default
    if (answer.includes('Very Often')) score = 9;
    else if (answer.includes('Often')) score = 7;
    else if (answer.includes('Sometimes')) score = 5;
    else if (answer.includes('Rarely')) score = 3;
    else if (answer.includes('Never')) score = 1;
    
    console.log('📊 Fallback score assigned:', { answer, score });
    
    // Determine emotion based on score
    const emotion = score >= 7 ? 'Burnout Risk' : score >= 5 ? 'Stressed' : 'Stable';
    
    const result = {
      questionId,
      baseScore: score,
      enhancedScore: score,
      emotion: emotion,
      causeTag: 'overwork',
      timestamp: new Date().toISOString(),
      analysisVersion: '2.0-fallback'
    };
    
    console.log('✅ Fallback analysis complete:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Error in fallback analysis:', error.message);
    // Return safe fallback if even the fallback fails
    return {
      questionId,
      baseScore: 2,
      enhancedScore: 2,
      emotion: 'Stable',
      causeTag: 'overwork',
      timestamp: new Date().toISOString(),
      analysisVersion: '2.0-emergency-fallback'
    };
  }
}

/**
 * Check if a question response needs immediate attention
 * @param {Object} analysis - Analysis result from analyzeQuestionStress
 * @returns {boolean} True if needs immediate attention
 */
export function needsImmediateAttention(analysis) {
  const criticalKeywords = ['suicide', 'self-harm', 'hurt myself', 'end it all', 'can\'t go on'];
  const criticalEmotions = ['hopeless', 'suicidal'];
  
  return analysis.stressLevel === 'High' && 
         (analysis.keywords?.some(keyword => criticalKeywords.some(critical => keyword.includes(critical))) ||
          analysis.emotionTone?.some(emotion => criticalEmotions.includes(emotion)));
}

/**
 * Generate personalized recommendations based on stress analysis
 * @param {Object} analysis - Analysis result
 * @returns {Array} Array of recommendation objects
 */
export function generateStressRecommendations(analysis) {
  const recommendations = [];

  switch (analysis.stressLevel) {
    case 'High':
      recommendations.push({
        type: 'immediate',
        title: 'Consider Professional Support',
        description: 'Your responses indicate significant stress. Consider speaking with a mental health professional.',
        action: 'Find resources'
      });
      break;
      
    case 'Moderate':
      recommendations.push({
        type: 'coping',
        title: 'Stress Management Techniques',
        description: 'Try mindfulness exercises, deep breathing, or short walks to help manage stress.',
        action: 'Learn techniques'
      });
      break;
      
    case 'Mild':
      recommendations.push({
        type: 'preventive',
        title: 'Maintain Balance',
        description: 'Keep up healthy habits and stay aware of stress triggers.',
        action: 'Build habits'
      });
      break;
  }

  // Add cause-specific recommendations
  switch (analysis.causeArea) {
    case 'Work':
      recommendations.push({
        type: 'targeted',
        title: 'Work-Life Balance',
        description: 'Consider setting boundaries, taking breaks, or discussing workload with your supervisor.',
        action: 'Workplace wellness'
      });
      break;
      
    case 'Financial':
      recommendations.push({
        type: 'targeted',
        title: 'Financial Planning',
        description: 'Consider meeting with a financial advisor or exploring budgeting resources.',
        action: 'Financial resources'
      });
      break;
  }

  return recommendations;
}

export { analyzeQuestionStress as default };