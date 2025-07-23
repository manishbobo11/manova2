import { Pinecone } from '@pinecone-database/pinecone';

/**
 * Server-side API endpoint for vector upsert operations
 * This handles Pinecone operations safely on the server-side to avoid browser SDK issues
 */

let pinecone = null;
let index = null;

const initializePinecone = async () => {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || "pcsk_2mEsDs_CxvhYsZbQbS1LWBCUjgF2Hkub9Wjr3bXXHPEaeuvqSgbDM6YjqbSPyS3aFPeD7C",
    });
  }
  
  if (!index) {
    const indexName = process.env.PINECONE_INDEX_NAME || 'manova-memory';
    index = pinecone.index(indexName);
    console.log(`🔌 Server connected to Pinecone index: ${indexName}`);
  }
  
  return { pinecone, index };
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }
  try {
    const { userId, embedding, metadata } = req.body;
    if (!userId || !embedding || !Array.isArray(embedding)) {
      return res.status(400).json({ success: false, error: 'Missing or invalid required fields: userId, embedding (array)' });
    }

    if (typeof userId !== 'string' || userId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'userId must be a non-empty string'
      });
    }

    if (embedding.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'embedding array cannot be empty'
      });
    }

    console.log(`📝 Processing vector upsert for user: ${userId}`);
    console.log(`📊 Embedding dimensions: ${embedding.length}`);

    // Initialize Pinecone connection
    const { index } = await initializePinecone();
    
    // Generate a unique vector ID
    const vectorId = `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Prepare the vector object with comprehensive metadata
    const vectorObject = {
      id: vectorId,
      values: embedding,
      metadata: {
        userId,
        timestamp: new Date().toISOString(),
        ...metadata // Include all provided metadata
      }
    };

    console.log(`🔄 Upserting vector with ID: ${vectorId}`);
    
    // Upsert the vector to Pinecone
    const upsertResponse = await index.upsert([vectorObject]);
    
    console.log(`✅ Vector upserted successfully for user ${userId}`);
    
    return res.status(200).json({ success: true, message: 'Vector upserted successfully' });
  } catch (error) {
    if (error.message.includes('index') || error.message.includes('not found')) {
      return res.status(404).json({ success: false, error: 'Pinecone index not found', details: error.message });
    }
    console.error('Vector upsert failed:', error);
    return res.status(500).json({ success: false, error: 'Vector upsert failed', details: error.message });
  }
}