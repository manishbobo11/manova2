import dotenv from 'dotenv';
import { Pinecone } from '@pinecone-database/pinecone';

dotenv.config();

const testPineconeConnection = async () => {
  try {
    console.log('🧪 Testing basic Pinecone connection...');
    
    const apiKey = process.env.PINECONE_API_KEY;
    const environment = 'us-east-1-aws';
    
    console.log('🔧 Config:', { 
      hasApiKey: !!apiKey, 
      environment,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'none'
    });

    if (!apiKey) {
      console.error('❌ Missing Pinecone API key');
      return;
    }

    const pinecone = new Pinecone({
      apiKey,
      environment,
    });

    console.log('✅ Pinecone client created successfully');

    // Try to list indexes to test basic connectivity
    try {
      console.log('🔍 Attempting to list indexes...');
      const indexes = await pinecone.listIndexes();
      console.log('✅ Successfully connected to Pinecone!');
      console.log('📊 Available indexes:', indexes);
      
    } catch (listError) {
      console.error('❌ Failed to list indexes:', listError.message);
      console.error('❌ This suggests a connectivity or authentication issue');
    }

  } catch (error) {
    console.error('🔥 Pinecone connection test failed:', error.message);
    console.error('🔥 Full error:', error);
  }
};

testPineconeConnection(); 