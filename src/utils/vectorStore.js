/**
 * Frontend Vector Store Service - Uses API endpoints instead of direct Pinecone SDK
 * This avoids browser compatibility issues with the Pinecone client
 */

import { apiFetch } from '../lib/api';

/**
 * Upsert a user's emotional vector into Pinecone
 * @param {string} userId - The user's unique identifier
 * @param {number[]} embedding - The vector embedding (typically 1536 dimensions for OpenAI)
 * @param {Object} metadata - Additional metadata to store with the vector
 * @param {string} metadata.timestamp - ISO timestamp of the check-in
 * @param {string} metadata.domain - The wellness domain (e.g., 'work', 'relationships')
 * @param {number} metadata.stressScore - The stress score (0-10)
 * @param {string} metadata.response - The original user response
 * @param {string} metadata.question - The question that was asked
 * @returns {Promise<Object>} The upsert response from Pinecone
 */
export const upsertUserVector = async (userId, embedding, metadata = {}) => {
  try {
    console.log(`📝 Upserting vector for user ${userId} via API`);
    console.log(`🔗 API URL: /api/vector/upsert`);
    
    const response = await apiFetch(`/api/vector/upsert`, {
      method: 'POST',
      body: JSON.stringify({
        userId,
        embedding,
        metadata
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: Failed to upsert vector`);
    }

    // Handle different response formats for upsert
    if (data.error) {
      throw new Error(data.error);
    }
    
    // Handle standard success response with insertedCount
    if (data.status === 'success' || data.insertedCount) {
      const vectorId = data.id || data.vectorId || `mock_${userId}_${Date.now()}`;
      console.log(`✅ Vector upserted successfully for user ${userId}:`, vectorId);
      return {
        success: true,
        vectorId: vectorId,
        insertedCount: data.insertedCount
      };
    }
    
    // Handle legacy success format
    if (data.success) {
      const vectorId = data.id || data.vectorId || `mock_${userId}_${Date.now()}`;
      console.log(`✅ Vector upserted successfully for user ${userId}:`, vectorId);
      return {
        success: true,
        vectorId: vectorId,
        metadata: data.metadata || {}
      };
    }
    
    // Handle mock/fallback response format
    if (data.mock && data.message) {
      const vectorId = data.id || data.vectorId || `mock_${userId}_${Date.now()}`;
      console.log(`🔧 Using mock vector service: ${data.message}. Vector ID: ${vectorId}`);
      return {
        success: true,
        vectorId: vectorId,
        metadata: data.metadata || {}
      };
    }
    
    // If we get here but no explicit failure, assume success
    console.log(`✅ Vector upsert completed for user ${userId} (assuming success)`);
    return {
      success: true,
      vectorId: data.vectorId || `assumed_${userId}_${Date.now()}`,
      metadata: data.metadata || {}
    };
    
  } catch (error) {
    console.error('❌ Error upserting user vector:', error);
    
    // Don't throw error to avoid breaking survey flow
    console.warn('⚠️ Vector upsert failed, but survey will continue');
    return {
      success: false,
      error: error.message,
      vectorId: null
    };
  }
};

/**
 * Query for similar emotional vectors from a specific user's past check-ins
 * @param {string} userId - The user's unique identifier
 * @param {number[]} embedding - The query vector embedding
 * @param {number} topK - Number of most similar vectors to return (default: 3)
 * @returns {Promise<Array>} Array of the most similar past check-ins with scores
 */
export const querySimilarVectors = async (userId, embedding, topK = 3) => {
  try {
    console.log(`🔍 Querying similar vectors for user ${userId} via API`);
    console.log(`🔗 API URL: /api/vector/query`);
    console.log(`📊 Request params: userId=${userId}, topK=${topK}, embeddingLength=${embedding?.length}`);
    
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      console.warn('⚠️ Invalid userId provided to querySimilarVectors');
      return [];
    }
    
    if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
      console.warn('⚠️ Invalid embedding provided to querySimilarVectors');
      return [];
    }
    
    const requestBody = {
      userId,
      embedding,
      topK,
      operation: 'similarity'
    };
    
    console.log('📤 Sending request to vector API...');
    const response = await apiFetch(`/api/vector/query`, {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    console.log(`📥 Response status: ${response.status} ${response.statusText}`);
    
    let data;
    try {
      data = await response.json();
      console.log('📋 Response data:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('❌ Failed to parse response JSON:', parseError);
      throw new Error('Invalid JSON response from vector API');
    }

    if (!response.ok) {
      console.error(`❌ HTTP error ${response.status}:`, data);
      throw new Error(data.error || `HTTP ${response.status}: Failed to query vectors`);
    }

    // Handle different response formats
    if (data.success === false) {
      console.warn('⚠️ API returned success: false:', data.error || 'Unknown error');
      // Don't throw here, just return empty results for graceful degradation
      return [];
    }
    
    // Handle the actual response format: {matches: [], message: '...', mock: true}
    if (data.hasOwnProperty('matches')) {
      const matches = Array.isArray(data.matches) ? data.matches : [];
      console.log(`✅ Found ${matches.length} similar responses for user ${userId}`);
      
      if (data.mock) {
        console.log('🔧 Using mock/fallback vector service');
      }
      if (data.message) {
        console.log(`📝 Vector API message: ${data.message}`);
      }
      
      return matches;
    }
    
    // Handle standard success response format
    if (data.results && Array.isArray(data.results)) {
      console.log(`✅ Found ${data.results.length} similar responses for user ${userId}`);
      return data.results;
    }
    
    // Handle legacy response format without success field
    if (Array.isArray(data)) {
      console.log(`✅ Found ${data.length} similar responses for user ${userId} (legacy format)`);
      return data;
    }
    
    // Handle empty results with message
    if (data.message && (data.matches === undefined || (Array.isArray(data.matches) && data.matches.length === 0))) {
      console.log(`📝 Vector API message: ${data.message}`);
      return [];
    }
    
    // If we get here, the response format is unexpected
    console.warn('⚠️ Unexpected response format from vector API:', data);
    return [];
    
  } catch (error) {
    console.error('❌ Error querying similar vectors:', error);
    
    // Check if it's a network/connection error
    if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
      console.warn('🌐 Network error detected - vector API may be unavailable');
    } else if (error.message.includes('Invalid JSON')) {
      console.warn('📄 JSON parsing error - API response format issue');
    } else {
      console.warn('⚠️ Unexpected error in vector query');
    }
    
    console.warn('⚠️ Similar vector query failed, returning empty results for graceful degradation');
    
    // Return empty array instead of throwing to avoid breaking the flow
    return [];
  }
};

/**
 * Get user's emotional history summary
 * @param {string} userId - The user's unique identifier
 * @param {number} limit - Maximum number of recent vectors to retrieve (default: 10)
 * @returns {Promise<Array>} Array of user's recent emotional check-ins
 */
export const getUserEmotionalHistory = async (userId, limit = 10) => {
  try {
    console.log(`📊 Retrieving emotional history for user ${userId} via API`);
    

    
    const response = await apiFetch(`/api/vector/query`, {
      method: 'POST',
      body: JSON.stringify({
        userId,
        topK: limit,
        operation: 'history',
        // Add a dummy embedding for history queries since API expects it
        embedding: new Array(1536).fill(0)
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn(`⚠️ Vector API error (${response.status}): ${data.error || 'Unknown error'}`);
      return [];
    }

    // Handle different response formats
    if (data.success === false) {
      console.warn('⚠️ Vector API returned success: false:', data.error || 'Unknown error');
      return [];
    }
    
    // Handle the response format: {matches: [], message: '...', mock: true}
    if (data.hasOwnProperty('matches') && Array.isArray(data.matches)) {
      console.log(`✅ Retrieved ${data.matches.length} emotional history entries for user ${userId}`);
      return data.matches.map(match => ({
        id: match.id,
        metadata: match.metadata,
        timestamp: new Date(match.metadata?.timestamp || Date.now())
      }));
    }
    
    // Handle standard success response format
    if (data.results && Array.isArray(data.results)) {
      console.log(`✅ Retrieved ${data.results.length} emotional history entries for user ${userId}`);
      return data.results.map(result => ({
        id: result.id,
        metadata: result.metadata,
        timestamp: new Date(result.metadata?.timestamp || Date.now())
      }));
    }
    
    // Handle empty results
    console.log(`📝 No emotional history found for user ${userId}`);
    return [];
    
  } catch (error) {
    console.error('❌ Error retrieving user emotional history:', error);
    console.warn('⚠️ Emotional history retrieval failed, returning empty array');
    
    // Return empty array instead of throwing to avoid breaking the flow
    return [];
  }
};

/**
 * Delete old vectors for a user (cleanup utility)
 * @param {string} userId - The user's unique identifier
 * @param {number} keepRecent - Number of most recent vectors to keep (default: 50)
 * @returns {Promise<Object>} Deletion response
 */
export const cleanupOldVectors = async (userId, keepRecent = 50) => {
  try {
    console.log(`🧹 Vector cleanup requested for user ${userId} (keep ${keepRecent} recent)`);
    
    // For now, we'll just log this and return success
    // In a full implementation, you'd need a separate API endpoint for cleanup
    // or implement cleanup as a background job on the server
    
    const history = await getUserEmotionalHistory(userId, Math.min(keepRecent + 10, 100));
    
    if (history.length > keepRecent) {
      console.log(`⚠️ User ${userId} has ${history.length} vectors, cleanup recommended`);
      // TODO: Implement server-side cleanup API endpoint
      return { 
        message: `Cleanup recommended: ${history.length} vectors found, keeping ${keepRecent}`,
        needsCleanup: true,
        vectorCount: history.length
      };
    }
    
    console.log(`✅ No cleanup needed for user ${userId} (${history.length} vectors)`);
    return { 
      message: 'No cleanup needed',
      needsCleanup: false,
      vectorCount: history.length
    };
    
  } catch (error) {
    console.error('❌ Error in vector cleanup check:', error);
    console.warn('⚠️ Vector cleanup check failed, but continuing');
    
    // Don't throw error to avoid breaking the flow
    return { 
      message: 'Cleanup check failed', 
      error: error.message,
      needsCleanup: false
    };
  }
};

/**
 * Reset vector context for a user (clear all embeddings for fresh start)
 * @param {string} userId - The user's unique identifier
 * @returns {Promise<Object>} Reset response
 */
export const resetVectorContext = async (userId) => {
  try {
    console.log(`🔄 Resetting vector context for user ${userId}`);
    
    // Note: Reset endpoint is not implemented in the backend yet
    // For now, we'll just log and return success
    console.log('🔧 Vector reset endpoint not implemented yet, skipping reset');
    
    return {
      success: true,
      message: 'Vector reset not implemented yet, continuing with session reset',
      skipped: true
    };
    
  } catch (error) {
    console.error('❌ Error resetting vector context:', error);
    return { 
      success: true, 
      message: 'Vector reset failed, continuing with session reset',
      skipped: true
    };
  }
};

export default {
  upsertUserVector,
  querySimilarVectors,
  getUserEmotionalHistory,
  cleanupOldVectors,
  resetVectorContext
};