import { getOpenAICompletion } from './aiUtils';

/**
 * Function to generate context-aware wellness recommendations based on user's mood and stress patterns
 * @param {Object} moodData - The user's mood data
 * @returns {Promise<Object[]>} Generated wellness recommendations
 */
export const generateWellnessRecommendations = async (moodData) => {
  try {
    // Generate input prompt for AI model
    const prompt = `
    This is a personal wellness assistant AI. Based on the following mood and stress patterns, please generate personalized wellness interventions and activities.

    Mood Level Log:
    ${moodData.entries.map(entry => `Date: ${entry.date}, Mood: ${entry.mood}, Stress: ${entry.stress}`).join('\n')}

    Consider stress levels, mood variations, recent trends, and suggest appropriate interventions.`;

    const response = await getOpenAICompletion(prompt, {
      temperature: 0.7,
      maxTokens: 150,
      stop: ["Interventions:"],
    });

    // Parse AI's response to extract interventions
    const interventions = response.split('\n').filter(line => line.trim() !== '');
    return interventions.map((intervention, index) => ({
      id: index + 1,
      title: `Intervention ${index + 1}`,
      description: intervention
    }));

  } catch (error) {
    console.error('Failed to generate wellness recommendations:', error);
    throw new Error('Failed to generate wellness recommendations');
  }
};
