import mcpService from './mcp';
import { callOpenAI } from './openai';
import { analyzeStressResponse } from './stressAnalysisLogic.js';

/**
 * Generate emotional suggestions using OpenAI with improved error handling
 * @param {Array} selectedOptions - Array of selected stress options with labels
 * @param {Function} callOpenAI - OpenAI API wrapper function
 * @returns {Promise<Object>} Suggestion data with summary, insight, and tips
 */
export async function generateEmotionalSuggestions(selectedOptions, callOpenAI) {
  // Step 1: Collect relevant tags from user's responses
  const stressTags = selectedOptions?.map(opt => opt.label).join(", ") || "";

  // Step 2: Build better prompt with more context and personalization
  const prompt = `
You're a licensed therapist assistant AI. The user is experiencing stress related to: ${stressTags}.

Based on their responses, provide:

1. A short, empathetic summary that validates their specific experience and emotions.
2. A compassionate insight that:
   - Normalizes their struggle
   - Connects to common human experiences
   - Highlights their self-awareness in recognizing these challenges
3. Three highly specific, actionable tips that:
   - Are directly relevant to their mentioned stressors
   - Can be implemented immediately
   - Include a clear timeframe or measurable outcome
   - Consider their current emotional state
   - Build on their existing coping mechanisms

Respond in this JSON format:
{
  "summary": "A validating, personalized response to their specific situation",
  "insight": "A two-line therapeutic insight connecting their experience to broader human patterns",
  "tips": [
    "Immediate action with timeframe",
    "Medium-term strategy with clear steps",
    "Longer-term coping mechanism with measurable outcome"
  ]
}
`;

  // Step 3: Improved and safe call
  let suggestionData = null;
  try {
    const aiResponse = await callOpenAI(prompt);
    const content = typeof aiResponse === 'string'
      ? aiResponse
      : aiResponse?.choices?.[0]?.message?.content || '';
    // Sanitize response before parsing
    const cleanedContent = cleanJSONResponse(content);
    suggestionData = JSON.parse(cleanedContent);
  } catch (err) {
    console.error("💥 GPT Suggestion Parse Error", err);
    suggestionData = {
      summary: "I hear how challenging this is for you, and it's completely valid to feel this way.",
      insight: "When we're dealing with multiple stressors, it's natural to feel overwhelmed. Your awareness of these feelings is actually a sign of emotional intelligence.",
      tips: [
        "Take a 5-minute break right now to write down your top concern and one small step you can take today.",
        "Schedule a 15-minute 'worry time' tomorrow where you can fully process your feelings without judgment.",
        "Identify one trusted person you can share these feelings with this week."
      ]
    };
  }

  return suggestionData;
}

// Helper function to clean JSON response
const cleanJSONResponse = (response) => {
  // Remove markdown code block syntax
  let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  // Trim whitespace
  cleaned = cleaned.trim();
  // If the response starts with a newline or any whitespace followed by {, clean it
  cleaned = cleaned.replace(/^\s*\n*\s*{/, '{');
  // If the response ends with a newline or any whitespace followed by }, clean it
  cleaned = cleaned.replace(/}\s*\n*\s*$/, '}');
  return cleaned;
};

/**
 * Generate personalized coping strategies based on user's stress patterns
 * @param {string} userId - User ID for context
 * @param {Array} stressFactors - Array of stress factors
 * @param {string} domain - Domain of stress (work, personal, etc.)
 * @returns {Promise<Object>} Coping strategies and insights
 */
export async function generateCopingStrategies(userId, stressFactors, domain) {
  try {
    const prompt = `As an empathetic wellness assistant, provide validation and coping strategies for someone experiencing stress in their ${domain}. They mentioned: ${stressFactors.join(', ')}.

Please respond in this JSON format:
{
  "validation": "A brief, empathetic acknowledgment of their feelings",
  "strategies": ["3-4 specific, actionable coping strategies"],
  "selfCompassion": "A gentle reminder about self-compassion"
}`;

    const response = await callOpenAI(prompt);
    
    // Clean the response before parsing
    const cleanedResponse = cleanJSONResponse(response);
    
    try {
      const parsed = JSON.parse(cleanedResponse);
      return {
        validation: parsed.validation || "I hear how challenging this is for you.",
        strategies: parsed.strategies || ["Take a moment to breathe deeply", "Consider talking to someone you trust"],
        selfCompassion: parsed.selfCompassion || "Remember to be kind to yourself during this time."
      };
    } catch (parseError) {
      console.error('💥 Coping Strategies Parse Error', parseError);
      // Fallback response if parsing fails
      return {
        validation: "I understand this is a difficult situation.",
        strategies: [
          "Take a moment to breathe deeply",
          "Consider talking to someone you trust",
          "Remember that it's okay to take breaks"
        ],
        selfCompassion: "Be patient with yourself as you navigate this challenge."
      };
    }
  } catch (error) {
    console.error('Error generating coping strategies:', error);
    // Default fallback response
    return {
      validation: "I understand this is a difficult situation.",
      strategies: [
        "Take a moment to breathe deeply",
        "Consider talking to someone you trust",
        "Remember that it's okay to take breaks"
      ],
      selfCompassion: "Be patient with yourself as you navigate this challenge."
    };
  }
}

/**
 * Generate personalized wellness insights based on user context
 * @param {string} userId - User ID
 * @param {Object} userContext - User's wellness context
 * @returns {Promise<Object>} Personalized insights and recommendations
 */
export async function generateWellnessInsights(userId, userContext) {
  const prompt = `
You're an AI wellness coach analyzing a user's wellness patterns.

User Context:
- Recent stress levels: ${userContext.stressIntensity || 'unknown'}
- High stress domains: ${userContext.highStressDomains?.join(', ') || 'none'}
- Recent concerns: ${userContext.contextualMemory?.input || 'none'}

Provide:
1. A personalized insight about their current wellness state
2. 2-3 specific recommendations for improvement
3. A positive affirmation

Respond in JSON format:
{
  "insight": "...",
  "recommendations": ["...", "...", "..."],
  "affirmation": "..."
}
`;

  let insightData = null;
  try {
    const response = await mcpService._callOpenAIChat(prompt);
    const content = response?.choices?.[0]?.message?.content || response;
    // Sanitize response before parsing
    const cleanedContent = cleanJSONResponse(content);
    insightData = JSON.parse(cleanedContent);
  } catch (err) {
    console.error("💥 Wellness Insights Parse Error", err);
    insightData = {
      insight: "You're showing awareness of your wellness needs, which is a great first step.",
      recommendations: [
        "Consider setting aside 10 minutes daily for self-reflection",
        "Explore stress management techniques that work for you",
        "Build a support network of trusted friends or colleagues"
      ],
      affirmation: "You have the strength and wisdom to navigate challenges and grow through them."
    };
  }

  return insightData;
}

/**
 * Analyzes the stress level and emotional state from a user's answer to a wellness question
 * @param {string} answer - The user's answer text
 * @param {string} question - The question that was asked
 * @param {boolean} isPositive - Whether the question is positive or neutral
 * @param {string} userId - User ID for MCP memory access
 * @returns {Promise<Object>} Analysis result with score, emotion, and intensity
 */
export async function analyzeStressLevel(answer, question, isPositive = false, userId = null) {
  // If question is an object, extract isPositive
  let positive = isPositive;
  if (typeof question === 'object' && question !== null) {
    positive = question.isPositive || question.positive || false;
    question = question.text || question;
  }
  
  try {
    // Call the Express server API route for stress analysis
    const res = await fetch("http://localhost:3001/api/analyze-stress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer, emotion: null }),
    });

    if (!res.ok) {
      throw new Error(`API request failed: ${res.status}`);
    }

    const { data } = await res.json();
    
    // Use data.stress_level, data.reason etc.
    return { 
      score: data.stress_level === "High" ? 9 : data.stress_level === "Moderate" ? 6 : 2,
      emotion: data.stress_level === "High" ? 'Stressed' : data.stress_level === "Moderate" ? 'Concerned' : 'Calm',
      intensity: data.stress_level === "High" ? 'High' : data.stress_level === "Moderate" ? 'Moderate' : 'Low',
      reason: data.reason || 'No reason provided',
      confidence: data.confidence || 'medium'
    };
  } catch (error) {
    console.error('Error in analyzeStressLevel:', error);
    // Fallback to basic analysis
    return { 
      score: 2, // Default low stress
      emotion: 'Neutral', 
      intensity: 'Low',
      reason: 'Fallback - failed to analyze',
      confidence: 'low'
    };
  }
} 