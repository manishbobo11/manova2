// Enhanced stress analysis using ManovaAgent's psychological reasoning

import { analyzeEnhancedStress } from "./ai/manovaAgent.js";

// Enhanced async analysis method with psychological reasoning
export const analyzeStressResponse = async (question, answer, emotion, domain = null, questionId = null) => {
  try {
    // Use the new enhanced psychological analysis
    const enhancedResult = await analyzeEnhancedStress(question, answer, domain);

    return {
      score: enhancedResult.enhancedScore,
      category: enhancedResult.enhancedIntensity, // Low, Moderate, High
      reason: enhancedResult.reason,
      // Enhanced format with psychological insights
      enhanced: {
        score: enhancedResult.enhancedScore,
        tag: enhancedResult.enhancedIntensity,
        emotion: enhancedResult.enhancedEmotion, // Burnout, Loneliness, Stable, etc.
        causeTag: 'psychological_analysis',
        intensity: enhancedResult.enhancedIntensity,
        labelColor: enhancedResult.enhancedScore >= 7 ? 'red' : enhancedResult.enhancedScore >= 4 ? 'yellow' : 'green',
        reason: enhancedResult.reason,
        needsDeepDive: enhancedResult.shouldTrigger,
        shouldTrigger: enhancedResult.shouldTrigger,
        timestamp: new Date().toISOString(),
        analysisVersion: '4.0-psychological'
      }
    };
  } catch (e) {
    console.error("Enhanced stress detection failed:", e);
    return { 
      score: 0, 
      category: "Low", 
      reason: "Psychological analysis failed",
      enhanced: {
        score: 0,
        tag: 'Low',
        emotion: 'Unknown',
        causeTag: 'analysis_failed',
        intensity: 'Low',
        labelColor: 'green',
        reason: 'Enhanced psychological analysis failed',
        needsDeepDive: false,
        shouldTrigger: false,
        timestamp: new Date().toISOString(),
        analysisVersion: '4.0-fallback'
      }
    };
  }
};

/**
 * Filter questions for deep dive based on stress analysis
 * @param {Array} allQuestions - All questions for the domain
 * @param {string} domainName - Name of the domain
 * @param {string} userId - User ID for context
 * @returns {Object} Filtering result with filtered questions and metadata
 */
export const filterDeepDiveQuestions = async (allQuestions, domainName, userId) => {
  try {
    // Filter questions based on ManovaAgent stress analysis only
    const filteredQuestions = allQuestions.filter((q) => {
      // Check if question belongs to current domain
      if (q.domain !== domainName) return false;
      
      // Use only ManovaAgent analysis - no static fallbacks
      if (q.aiAnalysis?.enhanced) {
        return q.aiAnalysis.enhanced.needsDeepDive || q.aiAnalysis.enhanced.score >= 7;
      }
      
      if (q.aiAnalysis) {
        return q.aiAnalysis.category === "High" || q.aiAnalysis.score >= 7;
      }
      
      // If no ManovaAgent analysis available, don't include in deep dive
      return false;
    });

    // Domain needs review if any questions triggered deep dive
    const domainNeedsReview = filteredQuestions.length > 0;

    return {
      filteredQuestions,
      domainNeedsReview,
      totalStressedQuestions: filteredQuestions.length,
      totalAnswers: allQuestions.length
    };
  } catch (error) {
    console.error('Error filtering deep dive questions:', error);
    return {
      filteredQuestions: [],
      domainNeedsReview: false,
      totalStressedQuestions: 0,
      totalAnswers: allQuestions.length
    };
  }
};

/**
 * Comprehensive stress analysis for a single response using LLM
 * @param {string} answer - User's answer
 * @param {string} question - Question text
 * @param {string} context - Domain context
 * @param {string} emotion - Detected emotion
 * @param {boolean} isPositive - Whether question is positive
 * @param {string} userId - User ID
 * @returns {Object} Comprehensive analysis result
 */
export const comprehensiveStressAnalysis = async (answer, question, context, emotion = null, isPositive = false, userId = null) => {
  try {
    // Use ManovaAgent-based analyzeStressResponse function
    const analysis = await analyzeStressResponse(question, answer, emotion);
    
    // Use ManovaAgent results directly without static thresholds
    const shouldTriggerDeepDive = analysis.enhanced?.needsDeepDive || analysis.category === "High";
    const domainNeedsReview = shouldTriggerDeepDive || analysis.category === "Moderate";
    
    // Confidence is based on ManovaAgent's analysis quality
    const confidence = analysis.enhanced?.analysisVersion === '3.0-llm' ? 'high' : 'medium';
    
    return {
      score: analysis.score,
      emotion: analysis.category === "High" ? 'Stressed' : analysis.category === "Moderate" ? 'Concerned' : 'Calm',
      intensity: analysis.category,
      reason: analysis.reason,
      confidence,
      shouldTriggerDeepDive,
      domainNeedsReview
    };
  } catch (error) {
    console.error('Error in comprehensive stress analysis:', error);
    // Return minimal fallback - no stress detected if ManovaAgent fails
    return {
      score: 0,
      emotion: 'Neutral',
      intensity: 'Low',
      reason: 'ManovaAgent analysis failed',
      confidence: 'low',
      shouldTriggerDeepDive: false,
      domainNeedsReview: false
    };
  }
};

/**
 * Enhanced analysis integration for survey responses
 * @param {Array} responses - Array of survey responses with {question, answer, domain, questionId}
 * @param {string} userId - User ID for context
 * @returns {Promise<Object>} Enhanced analysis results
 */
export const enhancedAnalysisIntegration = async (responses, userId) => {
  try {
    console.log('🔍 Enhanced Analysis Integration: Processing', responses.length, 'responses');
    
    // Process each response using LLM analysis
    const analysisResults = {};
    const errors = [];
    
    for (const response of responses) {
      try {
        const analysis = await analyzeStressResponse(
          response.question,
          response.answer || response.answerLabel,
          null, // emotion - will be detected by LLM
          response.domain,
          response.questionId || `${response.domain}_${Date.now()}`
        );
        
        analysisResults[response.questionId] = analysis;
      } catch (error) {
        console.error(`Error analyzing response ${response.questionId}:`, error);
        errors.push({ questionId: response.questionId, error: error.message });
        
        // Add fallback analysis
        analysisResults[response.questionId] = {
          score: 2,
          category: 'Low',
          reason: 'Analysis failed',
          enhanced: {
            score: 2,
            tag: 'Low',
            causeTag: 'error',
            intensity: 'Low',
            needsDeepDive: false
          }
        };
      }
    }
    
    // Generate summary based on ManovaAgent categories
    const analyses = Object.values(analysisResults);
    const highStressCount = analyses.filter(a => a.category === "High").length;
    const moderateStressCount = analyses.filter(a => a.category === "Moderate").length;
    const overallStressLevel = highStressCount > 0 ? 'High' : moderateStressCount > 0 ? 'Moderate' : 'Low';
    
    const summary = {
      overallStressLevel,
      questionsNeedingDeepDive: analyses.filter(a => a.enhanced?.needsDeepDive).map(a => a.questionId),
      highStressCount,
      moderateStressCount,
      totalQuestions: analyses.length
    };
    
    console.log('✅ Enhanced Analysis Integration complete:', summary);
    
    return {
      success: true,
      analysisResults,
      summary,
      errors
    };
    
  } catch (error) {
    console.error('Enhanced analysis integration failed:', error);
    return {
      success: false,
      error: error.message,
      analysisResults: {},
      summary: {
        overallStressLevel: 'Low',
        questionsNeedingDeepDive: [],
        highStressCount: 0,
        moderateStressCount: 0,
        totalQuestions: 0
      }
    };
  }
};