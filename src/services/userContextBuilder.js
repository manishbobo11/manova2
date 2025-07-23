import { ContextStore } from './firebase';
import mcpService from './mcp';

/**
 * USAGE EXAMPLE:
 * 
 * import { contextualMemoryBuilder, generatePersonalizedQuestion } from '@/services/userContextBuilder';
 * import { callOpenAI } from '@/services/openai'; // your GPT API wrapper
 * 
 * // Basic usage
 * const userContext = contextualMemoryBuilder("Work", surveyHistory);
 * const memoryResponse = await callOpenAI(userContext.prompt);
 * const { summary } = JSON.parse(memoryResponse || "{}");
 * 
 * // Use this to modify question
 * const personalizedQ = summary
 *   ? `${summary} Is this still affecting you?`
 *   : defaultQuestion;
 * 
 * // Or use the utility function
 * const personalizedQuestion = await generatePersonalizedQuestion(
 *   "Work", 
 *   surveyHistory, 
 *   defaultQuestion, 
 *   callOpenAI
 * );
 */

/**
 * Builds contextual memory from survey history for a specific domain
 * @param {string} domain - The domain to analyze (e.g., "Work & Career", "Personal Life")
 * @param {Array} surveyHistory - Array of previous survey responses
 * @returns {Object} Context object with prompt and analysis
 */
export function contextualMemoryBuilder(domain, surveyHistory) {
  // 1. Filter check-ins for selected domain
  const domainResponses = surveyHistory
    .filter(entry => entry.domain === domain)
    .map(entry => entry.answer || "");

  // 2. Concatenate last 2 entries for context
  const recentText = domainResponses.slice(-2).join(" ");

  // 3. Prepare GPT prompt to extract emotional pattern
  const prompt = `
You're an AI mental wellness assistant. Given the following recent responses in the ${domain} domain, extract one key emotional concern that is recurring or significant.

Text: """${recentText}"""

Respond in this JSON format:
{
  "summary": "One-line reminder of user's concern",
  "emotionalTag": "short keyword tag"
}`;

  return {
    prompt,
    input: recentText,
    domain,
    responses: domainResponses
  };
}

/**
 * Analyzes stress patterns in user responses
 * @param {Array} responses - Array of response objects
 * @returns {Object} Analysis of stress patterns
 */
export function analyzeStressPatterns(responses) {
  if (!responses || !Array.isArray(responses)) return {};

  const patterns = {
    highStressDomains: [],
    recurringEmotions: new Map(),
    stressIntensity: 'low'
  };

  // Count emotions and identify high stress domains
  responses.forEach(response => {
    if (response.stressScore >= 3 || response.value >= 3) {
      patterns.highStressDomains.push(response.domain);
    }
    
    if (response.emotion) {
      const count = patterns.recurringEmotions.get(response.emotion) || 0;
      patterns.recurringEmotions.set(response.emotion, count + 1);
    }
  });

  // Calculate overall stress intensity
  const avgStress = responses.reduce((sum, r) => sum + (r.stressScore || r.value || 0), 0) / responses.length;
  patterns.stressIntensity = avgStress > 3 ? 'high' : avgStress > 2 ? 'medium' : 'low';

  return patterns;
}

/**
 * Builds a complete user context object
 * @param {string} userId - User ID
 * @param {Array} surveyHistory - Array of survey responses
 * @param {string} currentDomain - Current domain being analyzed
 * @returns {Promise<Object>} Complete context object
 */
export async function buildFullContext(userId, surveyHistory, currentDomain) {
  // Get existing context from ContextStore
  const existingContext = await ContextStore.getUserContext(userId);
  
  // Build new contextual memory
  const memory = contextualMemoryBuilder(currentDomain, surveyHistory);
  
  // Analyze stress patterns
  const patterns = analyzeStressPatterns(surveyHistory);
  
  // Combine everything into a rich context object
  return {
    userId,
    currentDomain,
    checkInCount: surveyHistory.length,
    lastCheckIn: surveyHistory[0]?.date || null,
    stressPatterns: patterns,
    contextualMemory: memory,
    previousContext: existingContext || {},
    historyDepth: surveyHistory.length
  };
}

/**
 * Updates the user's context in storage
 * @param {string} userId - User ID
 * @param {Object} newContext - New context to store
 * @returns {Promise<void>}
 */
export async function updateUserContext(userId, newContext) {
  try {
    await ContextStore.updateUserContext(userId, newContext);
  } catch (error) {
    console.error('Error updating user context:', error);
    throw error;
  }
}

/**
 * Generate a personalized question using contextual memory
 * @param {string} domain - The domain to analyze
 * @param {Array} surveyHistory - Array of previous survey responses
 * @param {string} defaultQuestion - The default question to fall back to
 * @param {Function} openAICall - Function to call OpenAI API
 * @returns {Promise<string>} Personalized question or default question
 */
export async function generatePersonalizedQuestion(domain, surveyHistory, defaultQuestion, openAICall) {
  try {
    if (!surveyHistory || surveyHistory.length === 0) {
      return defaultQuestion;
    }

    // Use contextualMemoryBuilder to analyze previous responses
    const userContext = contextualMemoryBuilder(domain, surveyHistory);
    
    // Call OpenAI to get emotional pattern summary
    const memoryResponse = await openAICall(userContext.prompt);
    const content = memoryResponse?.choices?.[0]?.message?.content || memoryResponse;
    
    // Parse the response to get the summary
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.warn('Failed to parse contextual memory response:', e);
      return defaultQuestion;
    }

    const { summary } = parsed || {};

    // Use the summary to personalize the question
    if (summary && summary.trim()) {
      const personalizedQ = `${summary} Is this still affecting you?`;
      return personalizedQ;
    }

    // Fallback to default question
    return defaultQuestion;
  } catch (error) {
    console.error('Error generating personalized question:', error);
    return defaultQuestion;
  }
}

/**
 * 🧠 sentimentWeightBuilder: Computes emotional weight score
 * @param {number} intensity - 1-10 scale
 * @param {string} frequency - 'rarely', 'sometimes', 'often', 'always'
 * @returns {object} { weight: number, intensityLevel: number, frequencyLevel: string }
 */
export function sentimentWeightBuilder(intensity, frequency) {
  const scaleMap = {
    rarely: 1,
    sometimes: 2,
    often: 3,
    always: 4
  };

  const frequencyScore = scaleMap[frequency?.toLowerCase()] || 2;
  const weight = intensity * frequencyScore;

  return {
    weight, // final stress impact score
    intensityLevel: intensity,
    frequencyLevel: frequency
  };
}

/**
 * Analyzes emotional impact and classifies risk level
 * @param {string} question - The survey question
 * @param {string} answer - User's answer
 * @param {number} intensity - Emotional intensity (1-10)
 * @param {string} frequency - Frequency of occurrence
 * @param {number} weight - Calculated weighted score
 * @returns {string} Formatted prompt for AI analysis
 */
export function buildEmotionalImpactPrompt(question, answer, intensity, frequency, weight) {
  return `
User response analysis:
Q: "${question}"
A: "${answer}"
Emotional Intensity: ${intensity}/10
Frequency: ${frequency}
Weighted Score: ${weight}

Summarize emotional impact and classify risk level (Low/Moderate/High).
Respond in:
{
  "analysis": "short paragraph",
  "riskLevel": "Low | Moderate | High"
}
`;
}

/**
 * Analyzes emotional impact and returns risk classification
 * @param {string} question - The survey question
 * @param {string} answer - User's answer
 * @param {number} intensity - Emotional intensity (1-10)
 * @param {string} frequency - Frequency of occurrence
 * @param {Function} openAICall - Function to call OpenAI API
 * @returns {Promise<Object>} Analysis with risk level
 */
export async function analyzeEmotionalImpact(question, answer, intensity, frequency, openAICall) {
  try {
    // Calculate weighted score
    const weightData = sentimentWeightBuilder(intensity, frequency);
    
    // Build prompt for analysis
    const prompt = buildEmotionalImpactPrompt(question, answer, intensity, frequency, weightData.weight);
    
    // Call OpenAI for analysis
    const response = await openAICall(prompt);
    const content = response?.choices?.[0]?.message?.content || response;
    
    // Parse response
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.warn('Failed to parse emotional impact response:', e);
      return {
        analysis: "Unable to analyze emotional impact at this time.",
        riskLevel: "Moderate"
      };
    }

    return {
      analysis: parsed.analysis || "Analysis not available",
      riskLevel: parsed.riskLevel || "Moderate",
      weight: weightData.weight,
      intensity: intensity,
      frequency: frequency
    };
  } catch (error) {
    console.error('Error analyzing emotional impact:', error);
    return {
      analysis: "Error analyzing emotional impact",
      riskLevel: "Moderate",
      weight: 0,
      intensity: intensity,
      frequency: frequency
    };
  }
}

/**
 * Detects cognitive biases in user's journal text
 * @param {string} journalText - The user's journal entry text
 * @returns {string} Formatted prompt for AI analysis
 */
export function mcpBiasDetector(journalText) {
  const prompt = `
You are an AI mental health assistant trained in cognitive distortion detection.

Analyze this journal entry:

"""${journalText}"""

Detect if the user is exhibiting any of the following cognitive biases:
- Self-blame
- Overgeneralization
- Catastrophizing
- Helplessness
- Negative filtering

Respond in this JSON format:
{
  "biases": ["Self-blame", "Helplessness"],
  "reframe": "You might be taking too much responsibility. Try reminding yourself of what is beyond your control."
}
`;

  return prompt;
} 