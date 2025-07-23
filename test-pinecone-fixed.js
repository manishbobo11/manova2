import dotenv from 'dotenv';
import { Pinecone } from '@pinecone-database/pinecone';

dotenv.config();

const testPineconeFixed = async () => {
  try {
    console.log('🧪 Testing Pinecone with correct environment...');
    
    const apiKey = process.env.PINECONE_API_KEY;
    const environment = 'us-east-1-aws'; // Use correct environment
    const indexName = process.env.PINECONE_INDEX_NAME;
    
    console.log('🔧 Config:', { 
      hasApiKey: !!apiKey, 
      environment, 
      indexName,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'none'
    });

    if (!apiKey || !indexName) {
      console.error('❌ Missing Pinecone configuration');
      return;
    }

    const pinecone = new Pinecone({
      apiKey,
      environment,
    });

    console.log('✅ Pinecone client created successfully');

    // Try to access the index
    try {
      const index = pinecone.index(indexName);
      console.log('✅ Index accessed successfully');
      
      // Try to get index stats
      const stats = await index.describeIndexStats();
      console.log('📊 Index stats:', stats);
      
      // Try a simple query
      const testEmbedding = Array.from({length: 1536}, () => Math.random());
      const queryResponse = await index.query({
        vector: testEmbedding,
        topK: 1,
        includeMetadata: true
      });
      
      console.log('✅ Query successful:', {
        matches: queryResponse.matches?.length || 0,
        total: queryResponse.total || 0
      });
      
    } catch (indexError) {
      console.error('❌ Index access failed:', indexError.message);
      console.error('❌ Full error:', indexError);
    }

  } catch (error) {
    console.error('🔥 Pinecone test failed:', error.message);
    console.error('🔥 Full error:', error);
  }
};

testPineconeFixed(); 