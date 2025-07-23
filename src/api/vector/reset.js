import { Pinecone } from '@pinecone-database/pinecone';

/**
 * Server-side API endpoint for vector reset operations
 * Handles clearing user's vector embeddings for fresh chat sessions
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
    const { userId, operation = 'reset_context' } = req.body;

    // Validate required fields
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'userId must be a non-empty string'
      });
    }

    if (operation !== 'reset_context') {
      return res.status(400).json({
        success: false,
        error: 'Invalid operation. Only "reset_context" is supported.'
      });
    }

    console.log(`🔄 Processing vector reset for user: ${userId}, operation: ${operation}`);

    // Initialize Pinecone connection
    const { index } = await initializePinecone();
    
    // Delete all vectors for this user
    console.log(`🗑️ Deleting all vectors for user: ${userId}`);
    
    const deleteResponse = await index.deleteMany({
      filter: {
        userId: { $eq: userId }
      }
    });

    console.log(`✅ Vector reset completed for user ${userId}`);
    
    return res.status(200).json({
      success: true,
      message: 'Vector context cleared successfully',
      deletedCount: deleteResponse.deletedCount || 0,
      userId: userId
    });

  } catch (error) {
    console.error('❌ Error in vector reset operation:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error during vector reset'
    });
  }
} 