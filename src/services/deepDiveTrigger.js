/**
 * Deep Dive Trigger Service for Layer 1 AI System
 * Determines when and how to trigger deep dive mode based on emotional patterns
 */

import { calculateStressMetrics, identifyStressTriggers, generateStressSummary } from './stressAnalysisUtils';

/**
 * Advanced deep dive trigger logic based on multiple factors
 * @param {Array} currentResponses - Current survey responses
 * @param {Object} patternAnalysis - Result from emotional pattern analysis
 * @param {Array} historicalData - Historical emotional data
 * @returns {Object} Deep dive trigger decision
 */
export const determineDeepDiveTrigger = (currentResponses, patternAnalysis, historicalData = []) => {
  try {
    console.log('🎯 Determining deep dive trigger based on comprehensive analysis...');
    
    // Calculate stress metrics for current responses
    const stressMetrics = calculateStressMetrics(currentResponses);
    const stressTriggers = identifyStressTriggers(currentResponses);
    const stressSummary = generateStressSummary(stressMetrics, stressTriggers);
    
    // Initialize trigger decision
    const triggerDecision = {
      shouldTrigger: false,
      triggerType: 'none',
      priority: 'low',
      reasons: [],
      recommendations: [],
      focusAreas: [],
      confidence: 0,
      data: {
        stressMetrics,
        stressTriggers,
        stressSummary,
        patternAnalysis
      }
    };
    
    // Factor 1: Current high stress responses
    if (stressMetrics.highStressCount >= 1) {
      triggerDecision.shouldTrigger = true;
      triggerDecision.reasons.push(`${stressMetrics.highStressCount} high-stress responses detected`);
      triggerDecision.focusAreas.push(...stressTriggers.map(t => t.domain));
      triggerDecision.confidence += 0.3;
    }
    
    // Factor 2: Recurring patterns from emotional analysis
    if (patternAnalysis && patternAnalysis.recurringPatternsFound > 0) {
      triggerDecision.shouldTrigger = true;
      triggerDecision.reasons.push(`${patternAnalysis.recurringPatternsFound} recurring stress patterns identified`);
      triggerDecision.focusAreas.push(...patternAnalysis.summary.primaryStressDomains);
      triggerDecision.confidence += 0.4;
      
      if (patternAnalysis.recurringPatternsFound >= 2) {
        triggerDecision.priority = 'high';
        triggerDecision.triggerType = 'recurring_patterns';
        triggerDecision.recommendations.push('Consider professional consultation');
      }
    }
    
    // Factor 3: Overall risk level
    if (stressSummary.overallRisk === 'critical') {
      triggerDecision.shouldTrigger = true;
      triggerDecision.priority = 'critical';
      triggerDecision.triggerType = 'critical_stress';
      triggerDecision.reasons.push('Critical stress levels detected');
      triggerDecision.recommendations.push('Immediate attention recommended');
      triggerDecision.confidence += 0.5;
    } else if (stressSummary.overallRisk === 'high') {
      triggerDecision.shouldTrigger = true;
      triggerDecision.priority = 'high';
      triggerDecision.triggerType = 'high_stress';
      triggerDecision.reasons.push('High stress levels detected');
      triggerDecision.confidence += 0.3;
    }
    
    // Factor 4: Multiple stressed domains
    const stressedDomains = Object.entries(stressMetrics.stressByDomain)
      .filter(([domain, data]) => data.averageScore >= 6);
    
    if (stressedDomains.length >= 2) {
      triggerDecision.shouldTrigger = true;
      triggerDecision.reasons.push(`${stressedDomains.length} domains showing elevated stress`);
      triggerDecision.focusAreas.push(...stressedDomains.map(([domain]) => domain));
      triggerDecision.confidence += 0.2;
    }
    
    // Factor 5: Historical comparison (if available)
    if (historicalData.length > 0) {
      const historicalScores = historicalData
        .map(entry => entry.metadata?.stressScore || 0)
        .filter(score => score > 0);
      
      if (historicalScores.length > 0) {
        const historicalAverage = historicalScores.reduce((sum, score) => sum + score, 0) / historicalScores.length;
        const currentAverage = stressMetrics.averageStressScore;
        const increase = ((currentAverage - historicalAverage) / historicalAverage) * 100;
        
        if (increase > 25) {
          triggerDecision.shouldTrigger = true;
          triggerDecision.reasons.push(`${Math.round(increase)}% increase from historical baseline`);
          triggerDecision.confidence += 0.2;
        }
      }
    }
    
    // Normalize confidence score
    triggerDecision.confidence = Math.min(triggerDecision.confidence, 1.0);
    
    // Remove duplicate focus areas
    triggerDecision.focusAreas = [...new Set(triggerDecision.focusAreas)];
    
    // Determine final trigger type if not set
    if (triggerDecision.shouldTrigger && triggerDecision.triggerType === 'none') {
      if (triggerDecision.confidence >= 0.7) {
        triggerDecision.triggerType = 'high_confidence';
      } else if (triggerDecision.confidence >= 0.4) {
        triggerDecision.triggerType = 'moderate_confidence';
      } else {
        triggerDecision.triggerType = 'low_confidence';
      }
    }
    
    // Add general recommendations based on priority
    if (triggerDecision.priority === 'critical') {
      triggerDecision.recommendations.unshift('Consider immediate professional support');
      triggerDecision.recommendations.push('Take steps to reduce immediate stressors');
    } else if (triggerDecision.priority === 'high') {
      triggerDecision.recommendations.push('Schedule time for stress management');
      triggerDecision.recommendations.push('Consider professional consultation');
    } else if (triggerDecision.shouldTrigger) {
      triggerDecision.recommendations.push('Focus on identified stress areas');
      triggerDecision.recommendations.push('Implement stress reduction techniques');
    }
    
    console.log('🎯 Deep dive trigger analysis complete:', {
      shouldTrigger: triggerDecision.shouldTrigger,
      triggerType: triggerDecision.triggerType,
      priority: triggerDecision.priority,
      confidence: triggerDecision.confidence,
      reasonCount: triggerDecision.reasons.length,
      focusAreas: triggerDecision.focusAreas
    });
    
    return triggerDecision;
    
  } catch (error) {
    console.error('❌ Error in deep dive trigger determination:', error);
    return {
      shouldTrigger: false,
      triggerType: 'error',
      priority: 'low',
      reasons: ['Error in analysis'],
      recommendations: [],
      focusAreas: [],
      confidence: 0,
      error: error.message
    };
  }
};

/**
 * Generate specific deep dive questions based on trigger analysis
 * @param {Object} triggerDecision - Result from determineDeepDiveTrigger
 * @returns {Array} Array of targeted deep dive questions
 */
export const generateDeepDiveQuestions = (triggerDecision) => {
  const questions = [];
  
  if (!triggerDecision.shouldTrigger) {
    return questions;
  }
  
  const focusAreas = triggerDecision.focusAreas;
  const stressTriggers = triggerDecision.data?.stressTriggers || [];
  
  // General stress exploration questions
  if (triggerDecision.triggerType === 'high_stress' || triggerDecision.triggerType === 'critical_stress') {
    questions.push({
      id: 'stress_impact',
      text: 'How is this stress currently affecting your daily life and relationships?',
      type: 'open_text',
      category: 'impact_assessment'
    });
    
    questions.push({
      id: 'stress_duration',
      text: 'How long have you been experiencing these stress levels?',
      type: 'multiple_choice',
      options: ['Less than a week', '1-2 weeks', '1-3 months', '3-6 months', 'More than 6 months'],
      category: 'duration_assessment'
    });
  }
  
  // Work-specific questions
  if (focusAreas.includes('Work & Career')) {
    questions.push({
      id: 'work_support',
      text: 'What specific aspects of your work environment contribute most to your stress?',
      type: 'multiple_select',
      options: ['Workload', 'Management', 'Colleagues', 'Job security', 'Work-life balance', 'Career growth'],
      category: 'work_stress'
    });
  }
  
  // Relationship-specific questions
  if (focusAreas.includes('Relationships')) {
    questions.push({
      id: 'relationship_support',
      text: 'Who in your life provides the most emotional support during stressful times?',
      type: 'open_text',
      category: 'support_system'
    });
  }
  
  // Recurring pattern questions
  if (triggerDecision.triggerType === 'recurring_patterns') {
    questions.push({
      id: 'pattern_awareness',
      text: 'Have you noticed these stress patterns before? What usually helps you cope?',
      type: 'open_text',
      category: 'pattern_exploration'
    });
    
    questions.push({
      id: 'coping_strategies',
      text: 'Which coping strategies have you tried recently?',
      type: 'multiple_select',
      options: ['Exercise', 'Meditation', 'Talking to friends', 'Professional help', 'Hobbies', 'Time off'],
      category: 'coping_assessment'
    });
  }
  
  // Professional help readiness
  if (triggerDecision.priority === 'critical' || triggerDecision.priority === 'high') {
    questions.push({
      id: 'professional_help_openness',
      text: 'How do you feel about speaking with a mental health professional?',
      type: 'multiple_choice',
      options: ['Very open to it', 'Somewhat interested', 'Unsure', 'Prefer to try other methods first', 'Not interested'],
      category: 'help_seeking'
    });
  }
  
  return questions;
};

/**
 * Create a personalized message based on trigger analysis
 * @param {Object} triggerDecision - Result from determineDeepDiveTrigger
 * @returns {Object} Personalized message object
 */
export const createPersonalizedMessage = (triggerDecision) => {
  if (!triggerDecision.shouldTrigger) {
    return {
      title: 'Great Job! 🌟',
      message: 'Your responses indicate healthy stress levels. Keep up the good work with your wellness journey!',
      tone: 'positive',
      actionItems: ['Continue current wellness practices', 'Maintain work-life balance']
    };
  }
  
  let title = '';
  let message = '';
  let tone = 'supportive';
  const actionItems = [];
  
  switch (triggerDecision.priority) {
    case 'critical':
      title = 'We\'re Here to Support You 🤗';
      message = 'I notice you\'re experiencing significant stress across multiple areas. This takes courage to acknowledge, and support is available.';
      tone = 'compassionate';
      actionItems.push('Consider reaching out to a mental health professional');
      actionItems.push('Connect with trusted friends or family');
      actionItems.push('Take immediate steps to reduce daily stressors');
      break;
      
    case 'high':
      title = 'Let\'s Address These Patterns Together 💪';
      message = `I've identified some recurring stress patterns, particularly in ${triggerDecision.focusAreas.join(' and ')}. Let's explore strategies to help you feel better.`;
      tone = 'encouraging';
      actionItems.push('Focus on the stressed areas we identified');
      actionItems.push('Consider professional guidance');
      actionItems.push('Implement targeted stress reduction techniques');
      break;
      
    default:
      title = 'Understanding Your Stress Patterns 🧠';
      message = `Your responses show some areas that could benefit from attention. Let's explore these patterns to help you develop better coping strategies.`;
      tone = 'supportive';
      actionItems.push('Reflect on the stress triggers we identified');
      actionItems.push('Practice stress management techniques');
      actionItems.push('Monitor these patterns over time');
      break;
  }
  
  return {
    title,
    message,
    tone,
    actionItems,
    focusAreas: triggerDecision.focusAreas,
    confidence: triggerDecision.confidence
  };
};

export default {
  determineDeepDiveTrigger,
  generateDeepDiveQuestions,
  createPersonalizedMessage
};