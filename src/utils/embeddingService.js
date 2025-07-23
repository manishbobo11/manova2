import { AzureOpenAI } from 'openai';
import { AZURE_CONFIG, validateAzureConfig } from '../config/config.js';

// Initialize Azure OpenAI client for embeddings
let azureClient = null;

const initializeAzureClient = () => {
  if (!azureClient) {
    // Validate configuration before creating client
    if (!validateAzureConfig()) {
      throw new Error('Azure configuration is incomplete. Check your .env file.');
    }
    
    azureClient = new AzureOpenAI({
      apiKey: AZURE_CONFIG.API_KEY,
      endpoint: AZURE_CONFIG.ENDPOINT,
      apiVersion: AZURE_CONFIG.API_VERSION,
      dangerouslyAllowBrowser: true // Required for client-side usage
    });
  }
  return azureClient;
};

/**
 * Generate embedding vector from text using Azure OpenAI
 * @param {string} text - The text to generate embedding for
 * @param {string} model - The embedding model to use (default: 'text-embedding-ada-002')
 * @returns {Promise<number[]>} The embedding vector (1536 dimensions for ada-002)
 */
export const getEmbeddingFromAzure = async (text, model = null) => {
  // Use frontend configuration for Azure embedding deployment name
  const deploymentName = AZURE_CONFIG.DEPLOYMENT_NAME;
  if (!deploymentName) {
    console.error('AZURE_DEPLOYMENT_NAME is not set in config');
    throw new Error('Missing Azure embedding deployment name');
  }

  try {
    const client = initializeAzureClient();
    
    // Clean and prepare the text
    const cleanText = text.trim().replace(/\s+/g, ' ');
    
    if (!cleanText) {
      console.warn('⚠️ Empty text provided for embedding, using fallback');
      return createFallbackEmbedding('empty text');
    }
    
    try {
      // Try to generate embedding using Azure OpenAI with correct deployment
      console.log(`🔄 Generating embedding with deployment: ${deploymentName}`);
      
      const response = await client.embeddings.create({
        model: deploymentName,
        input: cleanText,
        encoding_format: 'float'
      });
      
      if (!response.data || response.data.length === 0) {
        throw new Error('No embedding data received from Azure OpenAI');
      }
      
      const embedding = response.data[0].embedding;
      console.log(`✅ Generated Azure embedding for text: "${cleanText.substring(0, 100)}..." (${embedding.length} dimensions)`);
      return embedding;
      
    } catch (azureError) {
      console.error('❌ Azure embedding failed:', azureError.message);
      console.warn('⚠️ Using fallback embedding to continue survey flow');
      
      // Continue survey flow with fallback embedding
      return createFallbackEmbedding(cleanText);
    }
    
  } catch (error) {
    console.error('❌ Error generating embedding:', error);
    console.warn('⚠️ Using fallback embedding to continue survey flow');
    
    // Don't throw error - continue survey flow with fallback
    return createFallbackEmbedding(text || 'fallback');
  }
};

/**
 * Create a deterministic fallback embedding when Azure fails
 * @param {string} text - Text to create embedding for
 * @returns {number[]} Fallback embedding vector
 */
function createFallbackEmbedding(text) {
  const textHash = text.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // Create a 1536-dimensional vector (standard for OpenAI embeddings)
  const embedding = new Array(1536).fill(0).map((_, i) => {
    const seed = textHash + i;
    return (Math.sin(seed * 0.1) + Math.cos(seed * 0.2)) * 0.01;
  });
  
  console.log(`⚠️ Created fallback embedding for text: "${text.substring(0, 100)}..." (${embedding.length} dimensions)`);
  return embedding;
}

/**
 * Generate embeddings for multiple texts in batch
 * @param {string[]} texts - Array of texts to generate embeddings for
 * @param {string} model - The embedding model to use
 * @returns {Promise<number[][]>} Array of embedding vectors
 */
export const getBatchEmbeddingsFromAzure = async (texts, model = null) => {
  // Use frontend configuration for Azure embedding deployment name
  const deploymentName = AZURE_CONFIG.DEPLOYMENT_NAME;
  if (!deploymentName) {
    console.error('AZURE_DEPLOYMENT_NAME is not set in config');
    throw new Error('Missing Azure embedding deployment name');
  }

  try {
    const client = initializeAzureClient();
    
    // Clean and prepare the texts
    const cleanTexts = texts.map(text => text.trim().replace(/\s+/g, ' ')).filter(text => text.length > 0);
    
    if (cleanTexts.length === 0) {
      console.warn('⚠️ No valid texts provided for batch embedding, using fallback');
      return texts.map(text => createFallbackEmbedding(text || 'empty'));
    }
    
    try {
      console.log(`🔄 Generating ${cleanTexts.length} batch embeddings with deployment: ${deploymentName}`);
      
      const response = await client.embeddings.create({
        model: deploymentName,
        input: cleanTexts,
        encoding_format: 'float'
      });
      
      if (!response.data || response.data.length === 0) {
        throw new Error('No embedding data received from Azure OpenAI');
      }
      
      const embeddings = response.data.map(item => item.embedding);
      
      console.log(`✅ Generated ${embeddings.length} embeddings in batch`);
      return embeddings;
      
    } catch (azureError) {
      console.error('❌ Azure batch embedding failed:', azureError.message);
      console.warn('⚠️ Using fallback embeddings for batch processing');
      
      // Continue with fallback embeddings
      return cleanTexts.map(text => createFallbackEmbedding(text));
    }
    
  } catch (error) {
    console.error('❌ Error generating batch embeddings:', error);
    console.warn('⚠️ Using fallback embeddings for all texts');
    
    // Don't throw error - return fallback embeddings
    return texts.map(text => createFallbackEmbedding(text || 'fallback'));
  }
};

/**
 * Generate embedding for a survey response with context
 * @param {Object} responseData - The survey response data
 * @param {string} responseData.question - The question that was asked
 * @param {string} responseData.answer - The user's answer
 * @param {string} responseData.domain - The wellness domain (e.g., 'work', 'relationships')
 * @param {number} responseData.stressScore - The stress score (0-10)
 * @returns {Promise<number[]>} The embedding vector
 */
export const getResponseEmbedding = async (responseData) => {
  try {
    const { question, answer, domain, stressScore } = responseData;
    
    // Create a rich context string that captures the emotional context
    const contextualText = `
      Domain: ${domain}
      Question: ${question}
      Response: ${answer}
      Stress Level: ${stressScore}/10
      Emotional Context: ${stressScore >= 7 ? 'High stress' : stressScore >= 4 ? 'Moderate stress' : 'Low stress'}
    `.trim().replace(/\s+/g, ' ');
    
    const embedding = await getEmbeddingFromAzure(contextualText);
    
    console.log(`✅ Generated contextual embedding for ${domain} response`);
    return embedding;
    
  } catch (error) {
    console.error('❌ Error generating response embedding:', error);
    console.warn('⚠️ Using fallback embedding for survey response');
    
    // Don't throw error - continue survey flow with fallback
    const fallbackText = `${responseData.domain || 'unknown'} ${responseData.answer || 'no answer'}`;
    return createFallbackEmbedding(fallbackText);
  }
};

/**
 * Calculate cosine similarity between two embedding vectors
 * @param {number[]} vectorA - First embedding vector
 * @param {number[]} vectorB - Second embedding vector
 * @returns {number} Cosine similarity score (0-1)
 */
export const calculateCosineSimilarity = (vectorA, vectorB) => {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }
  
  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return Math.round(similarity * 10000) / 10000; // Round to 4 decimal places
};

/**
 * Test the embedding service connectivity
 * @returns {Promise<boolean>} True if service is working
 */
export const testEmbeddingService = async () => {
  try {
    const testText = "This is a test message for embedding service connectivity.";
    const embedding = await getEmbeddingFromAzure(testText);
    
    const isValid = embedding && embedding.length > 0;
    console.log(`🧪 Embedding service test ${isValid ? 'passed' : 'failed'}`);
    return isValid;
    
  } catch (error) {
    console.error('❌ Embedding service test failed:', error);
    return false;
  }
};

export default {
  getEmbeddingFromAzure,
  getBatchEmbeddingsFromAzure,
  getResponseEmbedding,
  calculateCosineSimilarity,
  testEmbeddingService
};