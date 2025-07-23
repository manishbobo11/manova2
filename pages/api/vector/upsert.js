import { Pinecone } from '@pinecone-database/pinecone';

/**
 * Vector upsert API endpoint - Production Pinecone functionality
 * Accepts POST with: { userId, embedding, metadata }
 * Returns: { insertedCount, status, id }
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { userId, embedding, metadata = {} } = req.body;

    // Validate required fields
    if (!userId || !embedding || !Array.isArray(embedding)) {
      console.error('❌ Missing or invalid required fields for vector upsert:', { 
        userId, 
        hasEmbedding: !!embedding, 
        isArray: Array.isArray(embedding) 
      });
      return res.status(400).json({ 
        error: 'Missing or invalid required fields: userId, embedding (array)' 
      });
    }

    // Validate embedding dimensions (Azure OpenAI returns 1536 floats)
    if (embedding.length !== 1536) {
      console.error(`❌ Invalid embedding dimensions: ${embedding.length}, expected 1536`);
      return res.status(400).json({ 
        error: `Invalid embedding dimensions: ${embedding.length}, expected 1536`
      });
    }

    // Validate embedding values are numbers
    if (!embedding.every(val => typeof val === 'number' && !isNaN(val))) {
      console.error('❌ Embedding contains non-numeric values');
      return res.status(400).json({ 
        error: 'Embedding must contain only numeric values'
      });
    }

    // Get Pinecone configuration from environment variables
    const apiKey = process.env.PINECONE_API_KEY;
    const environment = process.env.PINECONE_ENVIRONMENT;
    const indexName = process.env.PINECONE_INDEX_NAME || 'manova-emotions';

    if (!apiKey) {
      console.error('❌ Missing PINECONE_API_KEY environment variable');
      return res.status(500).json({ 
        error: 'Pinecone API key not configured'
      });
    }

    if (!environment) {
      console.error('❌ Missing PINECONE_ENVIRONMENT environment variable');
      return res.status(500).json({ 
        error: 'Pinecone environment not configured'
      });
    }

    console.log(`📝 Processing vector upsert for user ${userId}`);
    console.log(`   Embedding dimensions: ${embedding.length}`);
    console.log(`   Pinecone config: environment=${environment}, index=${indexName}`);

    // Initialize Pinecone client
    const pinecone = new Pinecone({
      apiKey,
      environment,
    });

    // Get the index and validate existence
    let index;
    try {
      index = pinecone.Index(indexName);
      console.log('✅ Pinecone index accessed successfully');
      
      // Validate index existence and health
      const stats = await index.describeIndexStats();
      console.log("🧪 Pinecone Index Stats:", stats);
      
      if (!stats) {
        throw new Error('Index stats returned null - index may not exist');
      }
      
      console.log(`📊 Index health: ${stats.totalVectorCount || 0} vectors, ${stats.dimension || 0} dimensions`);
      
    } catch (indexError) {
      console.error('❌ Failed to access or validate Pinecone index:', indexError.message);
      return res.status(500).json({ 
        error: `Failed to access Pinecone index '${indexName}': ${indexError.message}`
      });
    }

    // Generate unique vector ID
    const vectorId = `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Ensure metadata includes userId for filtering
    const finalMetadata = {
      ...metadata,
      userId: userId,
      timestamp: new Date().toISOString()
    };

    const vectorData = {
      id: vectorId,
      values: embedding,
      metadata: finalMetadata
    };

    console.log(`📤 Upserting vector to Pinecone:`, {
      id: vectorId,
      dimensions: embedding.length,
      metadataKeys: Object.keys(finalMetadata)
    });

    // Perform the upsert operation with additional validation
    try {
      const namespace = ""; // Use empty string as default namespace
      
      console.log(`📤 Attempting upsert with vector:`, {
        id: vectorId,
        dimensions: embedding.length,
        namespace: namespace || 'default',
        metadataKeys: Object.keys(finalMetadata)
      });
      
      const upsertResponse = await index.namespace(namespace).upsert([vectorData]);
      
      console.log('✅ Vector upsert successful:', {
        vectorId: vectorId,
        upsertedCount: upsertResponse.upsertedCount || 1,
        namespace: namespace || 'default'
      });

      // Validate the upsert response
      if (!upsertResponse || (upsertResponse.upsertedCount !== undefined && upsertResponse.upsertedCount === 0)) {
        console.warn('⚠️ Upsert completed but no vectors were inserted');
        return res.status(500).json({ 
          error: 'Vector upsert completed but no vectors were inserted'
        });
      }

      // Return actual success message from Pinecone
      return res.status(200).json({
        insertedCount: upsertResponse.upsertedCount || 1,
        status: 'success',
        id: vectorId
      });

    } catch (upsertError) {
      console.error('❌ Pinecone upsert operation failed:', upsertError.message);
      console.error('❌ Full upsert error:', upsertError);
      console.error('❌ Vector data that failed:', {
        id: vectorData.id,
        valuesDimensions: vectorData.values?.length,
        metadataKeys: Object.keys(vectorData.metadata || {})
      });
      
      return res.status(500).json({ 
        error: `Vector upsert failed: ${upsertError.message}`
      });
    }

  } catch (error) {
    console.error('❌ Vector upsert handler failed:', error.message);
    console.error('❌ Full error details:', error);
    
    return res.status(500).json({ 
      error: `Internal server error: ${error.message}`
    });
  }
} 