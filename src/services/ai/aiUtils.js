/**
 * AI utilities for OpenAI integration
 * Mock implementations for demonstration - replace with actual OpenAI API calls
 */

/**
 * Create a chat completion using OpenAI API (mock implementation)
 * @param {string} prompt - The prompt for the AI
 * @param {Object} options - Options for the API call
 * @returns {Promise<string>} The AI response
 */
export const createChatCompletion = async (prompt, options = {}) => {
  // Mock implementation - replace with actual OpenAI API call
  console.log('Mock AI call with prompt:', prompt);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Generate mock responses based on prompt content
  const responses = [
    "I understand you're going through a challenging time. It's completely normal to feel this way, and I want you to know that your feelings are valid.",
    "Thank you for sharing that with me. It takes courage to open up about how you're feeling. What you're experiencing is more common than you might think.",
    "I hear you, and I want you to know that you're not alone in this. Many people face similar challenges, and there are ways to work through these feelings.",
    "It sounds like you're dealing with a lot right now. That must feel overwhelming. Let's take this one step at a time.",
    "I appreciate you trusting me with your feelings. What you're going through is significant, and it's important that we address it together."
  ];
  
  // Check for crisis keywords and respond appropriately
  const lowerPrompt = prompt.toLowerCase();
  const crisisKeywords = ['suicidal', 'kill myself', 'end it all', 'hopeless', 'can\'t go on'];
  
  if (crisisKeywords.some(keyword => lowerPrompt.includes(keyword))) {
    return "I'm very concerned about what you've shared. Your life has value, and there are people who want to help. Please consider reaching out to KIRAN Mental Health Helpline at 1800-599-0019 (24/7) or consult a nearby hospital. You don't have to go through this alone.";
  }
  
  return responses[Math.floor(Math.random() * responses.length)];
};

/**
 * Get OpenAI completion (mock implementation)
 * @param {string} prompt - The prompt for the AI
 * @param {Object} options - Options for the API call
 * @returns {Promise<string>} The AI response
 */
export const getOpenAICompletion = async (prompt, options = {}) => {
  // Mock implementation - replace with actual OpenAI API call
  console.log('Mock AI completion call with prompt:', prompt);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
  
  // Generate mock wellness recommendations
  const recommendations = [
    "Try a 5-minute breathing exercise to help center yourself",
    "Consider taking a short walk outside to get fresh air and movement",
    "Practice gratitude by writing down three things you're thankful for",
    "Listen to calming music or nature sounds for relaxation",
    "Reach out to a friend or family member for social connection"
  ];
  
  return recommendations.join('\n');
};
