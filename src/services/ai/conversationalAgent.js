import { createChatCompletion } from './aiUtils';

/**
 * Enhanced AI conversational agent capable of multi-turn conversations with emotional intelligence.
 * @param {Array} conversationHistory - History of conversation turns
 * @param {Object} userContext - Additional user context and mood data
 * @returns {Promise<string>} - AI-generated response
 */
export const enhancedAIConversationalAgent = async (conversationHistory, userContext) => {
  const userMessage = conversationHistory[conversationHistory.length - 1];
  
  const companionPrompt = `
You are "Manova", an emotionally intelligent and caring mental wellness companion.
Your tone is like a calm, understanding friend—not robotic, not formal.

User's preferred language is: ${userContext.userLang || 'English'}.
User shared: "${userMessage}"
Their emotional context from past check-ins includes: ${userContext.last3Checkins || 'No recent check-ins available'}.
Current triggers: ${userContext.emotionalTriggers ? userContext.emotionalTriggers.join(", ") : 'None identified'}

Now respond in the user's preferred language (${userContext.userLang || 'English'}) in a compassionate and natural tone.
Acknowledge their feelings, ask thoughtful follow-ups if needed, and provide real, empathetic guidance.

Always include:
- A line of emotional validation (e.g., "I can understand why that would feel overwhelming…")
- A simple, practical suggestion (e.g., "Maybe taking a small walk can help you reconnect…")
- If language is Hinglish, mix Hindi and English naturally like a close friend would.

Respond now.
`;

  const completePrompt = companionPrompt;

  try {
    const response = await createChatCompletion(completePrompt, {
      model: 'gpt-4',
      temperature: 0.75,
      maxTokens: 150,
    });

    return response;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to generate AI response');
  }
};

/**
 * Identify crisis intervention points in the conversation based on keywords and emotional analysis.
 * @param {Array} conversationHistory - History of conversation turns
 * @returns {boolean} - True if crisis intervention is needed, false otherwise
 */
export const detectCrisisIntervention = (conversationHistory) => {
  const crisisKeywords = [
    'help', 'suicidal', 'crisis', 'emergency', 'despair', 'overwhelmed',
    'can’t go on', 'hopeless', 'give up'
  ];

  const recentTurn = conversationHistory[conversationHistory.length - 1];
  return crisisKeywords.some(keyword => recentTurn.toLowerCase().includes(keyword));
};

