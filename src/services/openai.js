import mcpService from './mcp';

export async function callOpenAI(prompt) {
  try {
    const response = await mcpService._callOpenAIChat(prompt);
    return response?.choices?.[0]?.message?.content || response;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
} 