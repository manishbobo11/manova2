// Enhanced stress analysis using ManovaAgent's psychological reasoning

import { analyzeEnhancedStress } from "../services/ai/manovaAgent.js";

// Enhanced async analysis method with psychological reasoning
export const analyzeStressResponse = async (question, answer, emotion, domain = 'General') => {
  try {
    // Use the new enhanced psychological analysis
    const enhancedResult = await analyzeEnhancedStress(question, answer, domain);

    return {
      score: enhancedResult.enhancedScore,
      category: enhancedResult.enhancedIntensity, // Low, Moderate, High
      reason: enhancedResult.reason,
      emotion: enhancedResult.enhancedEmotion, // Burnout, Loneliness, Stable, etc.
      shouldTrigger: enhancedResult.shouldTrigger
    };
  } catch (e) {
    console.error("Enhanced stress detection failed:", e);
    return { 
      score: 0, 
      category: "Low", 
      reason: "Psychological analysis failed",
      emotion: "Unknown",
      shouldTrigger: false
    };
  }
};