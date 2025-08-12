const { Pinecone } = require('@pinecone-database/pinecone');

const querySimilarVectorsHandler = async (req, res) => {
  try {
    const { userId, embedding, topK = 5, filter = {} } = req.body;
    
    console.log('🔍 Vector query request received:', {
      userId,
      embeddingLength: embedding ? embedding.length : 0,
      topK,
      filter
    });

    // Validate required fields
    if (!userId || !embedding) {
      console.error('❌ Missing required fields:', { userId: !!userId, embedding: !!embedding });
      return res.status(400).json({ error: 'Missing required fields: userId, embedding' });
    }

    // Check if Pinecone credentials are available
    const apiKey = process.env.PINECONE_API_KEY;
    const environment = process.env.PINECONE_ENVIRONMENT || 'us-east-1-aws'; // Use correct default
    const indexName = process.env.PINECONE_INDEX_NAME;

    if (!apiKey || !environment || !indexName) {
      console.error('❌ Missing Pinecone credentials:', { 
        hasApiKey: !!apiKey, 
        hasEnvironment: !!environment, 
        hasIndexName: !!indexName 
      });
      return res.status(500).json({ error: 'Pinecone configuration missing' });
    }

    console.log('🔧 Pinecone config:', { environment, indexName });

    const pinecone = new Pinecone();

    // Try to get the index
    let index;
    try {
      index = pinecone.index(indexName);
      console.log('✅ Pinecone index accessed successfully');
    } catch (indexError) {
      console.error('❌ Failed to access Pinecone index:', indexError.message);
      return res.status(500).json({
        error: 'Pinecone index not accessible',
        message: indexError.message
      });
    }

    // Prepare query parameters
    const queryParams = {
      vector: embedding,
      topK: Math.min(topK, 10), // Limit to max 10 results
      includeMetadata: true,
      includeValues: false
    };

    // Add filter if provided
    if (Object.keys(filter).length > 0) {
      queryParams.filter = filter;
    }

    // Add user filter to ensure we only get user's own data
    if (!queryParams.filter) {
      queryParams.filter = {};
    }
    queryParams.filter.userId = { $eq: userId };

    console.log('🔍 Querying with params:', queryParams);

    // Try to query the vector
    try {
      const queryResponse = await index.query(queryParams);
      
      console.log('✅ Vector query successful, found matches:', queryResponse.matches?.length || 0);
      
      return res.status(200).json({
        matches: queryResponse.matches || [],
        total: queryResponse.matches?.length || 0
      });
    } catch (queryError) {
      console.error('❌ Vector query failed:', queryError.message);
      return res.status(500).json({
        error: 'Vector query failed',
        message: queryError.message
      });
    }

  } catch (err) {
    console.error('🔥 Vector query failed:', err.message);
    console.error('🔥 Error details:', err);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: err.message
    });
  }
};

const upsertVectorHandler = async (req, res) => {
  try {
    const { userId, embedding, metadata } = req.body;
    
    console.log('📝 Vector upsert request received:', {
      userId,
      embeddingLength: embedding ? embedding.length : 0,
      metadata
    });

    // Validate required fields
    if (!userId || !embedding || !metadata) {
      console.error('❌ Missing required fields:', { userId: !!userId, embedding: !!embedding, metadata: !!metadata });
      return res.status(400).json({ error: 'Missing required fields: userId, embedding, metadata' });
    }

    // Check if Pinecone credentials are available
    const apiKey = process.env.PINECONE_API_KEY;
    const environment = process.env.PINECONE_ENVIRONMENT || 'us-east-1-aws'; // Use correct default
    const indexName = process.env.PINECONE_INDEX_NAME;

    if (!apiKey || !indexName) {
      console.error('❌ Missing Pinecone credentials:', { 
        hasApiKey: !!apiKey, 
        hasEnvironment: !!environment, 
        hasIndexName: !!indexName 
      });
      return res.status(500).json({ error: 'Pinecone configuration missing' });
    }

    console.log('🔧 Pinecone config:', { environment, indexName });

    const pinecone = new Pinecone();

    // Try to get the index
    let index;
    try {
      index = pinecone.index(indexName);
      console.log('✅ Pinecone index accessed successfully');
    } catch (indexError) {
      console.error('❌ Failed to access Pinecone index:', indexError.message);
      return res.status(500).json({
        error: 'Pinecone index not accessible',
        message: indexError.message
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

    // Try to upsert the vector
    try {
      console.log(`📤 Upserting vector to Pinecone:`, {
        id: vectorId,
        dimensions: embedding.length,
        metadataKeys: Object.keys(finalMetadata)
      });
      
      const upsertResponse = await index.upsert([vectorData]);
      
      console.log('✅ Vector upserted successfully to Pinecone:', {
        vectorId: vectorId,
        upsertedCount: upsertResponse.upsertedCount || 1
      });

      return res.status(200).json({
        success: true,
        insertedCount: upsertResponse.upsertedCount || 1,
        id: vectorId
      });

    } catch (upsertError) {
      console.error('❌ Vector upsert failed:', upsertError.message);
      return res.status(500).json({
        error: 'Vector upsert failed',
        message: upsertError.message
      });
    }

  } catch (err) {
    console.error('🔥 Vector upsert failed:', err.message);
    console.error('🔥 Error details:', err);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: err.message
    });
  }
}; 

module.exports = {
  querySimilarVectorsHandler,
  upsertVectorHandler
}; 