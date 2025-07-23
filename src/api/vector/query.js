import { Pinecone } from '@pinecone-database/pinecone';

/**
 * Server-side API endpoint for vector query operations
 * Handles similarity search and user history retrieval
 */

let pinecone = null;
let index = null;

const initializePinecone = async () => {
  if (!pinecone) {
    const apiKey = process.env.PINECONE_API_KEY;
    const environment = process.env.PINECONE_ENVIRONMENT;
    
    if (!apiKey) {
      throw new Error('PINECONE_API_KEY environment variable is required');
    }
    if (!environment) {
      throw new Error('PINECONE_ENVIRONMENT environment variable is required');
    }
    
    pinecone = new Pinecone({
      apiKey,
      environment,
    });
  }
  
  if (!index) {
    const indexName = process.env.PINECONE_INDEX_NAME || 'manova-emotions';
    index = pinecone.index(indexName);
    console.log(`🔌 Server connected to Pinecone index: ${indexName}`);
  }
  
  return { pinecone, index };
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { userId, embedding, topK = 3, operation = 'similarity' } = req.body;

    // Validate required fields
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'userId must be a non-empty string'
      });
    }

    console.log(`🔍 Processing vector query for user: ${userId}, operation: ${operation}`);

    // Initialize Pinecone connection
    const { index } = await initializePinecone();
    
    let queryResponse;
    
    if (operation === 'similarity') {
      // Similarity search operation
      if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'embedding array is required for similarity search'
        });
      }
      
      console.log(`🔄 Performing similarity search with ${embedding.length}D vector`);
      
      queryResponse = await index.query({
        vector: embedding,
        topK,
        filter: {
          userId: { $eq: userId }
        },
        includeMetadata: true,
        includeValues: false
      });
      
    } else if (operation === 'history') {
      // User history retrieval operation
      const limit = Math.min(topK, 50); // Cap at 50 for performance
      
      console.log(`🔄 Retrieving user history (limit: ${limit})`);
      
      // Use a dummy vector for history retrieval
      const dummyVector = new Array(1536).fill(0);
      
      queryResponse = await index.query({
        vector: dummyVector,
        topK: limit,
        filter: {
          userId: { $eq: userId }
        },
        includeMetadata: true,
        includeValues: false
      });
      
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid operation. Use "similarity" or "history"'
      });
    }
    
    // Process and format the results
    const results = queryResponse.matches.map(match => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata,
      similarity: Math.round((match.score || 0) * 100) / 100
    }));
    
    // Sort by timestamp for history operation
    if (operation === 'history') {
      results.sort((a, b) => {
        const timestampA = new Date(a.metadata?.timestamp || 0);
        const timestampB = new Date(b.metadata?.timestamp || 0);
        return timestampB - timestampA; // Most recent first
      });
    }
    
    console.log(`✅ Query completed. Found ${results.length} results for user ${userId}`);
    
    return res.status(200).json({
      success: true,
      operation,
      userId,
      resultCount: results.length,
      results,
      metadata: {
        topK,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error in vector query API:', error);
    
    // Determine error type for better user feedback
    let statusCode = 500;
    let errorMessage = 'Internal server error during vector query';
    
    if (error.message.includes('authentication') || error.message.includes('API key')) {
      statusCode = 401;
      errorMessage = 'Authentication failed with Pinecone';
    } else if (error.message.includes('index') || error.message.includes('not found')) {
      statusCode = 404;
      errorMessage = 'Pinecone index not found';
    } else if (error.message.includes('dimensions') || error.message.includes('vector')) {
      statusCode = 400;
      errorMessage = 'Invalid vector dimensions or format';
    }
    
    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}