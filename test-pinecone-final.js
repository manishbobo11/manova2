import dotenv from 'dotenv';
import { Pinecone } from '@pinecone-database/pinecone';

dotenv.config();

const testPineconeFinal = async () => {
  try {
    console.log('🧪 Final Pinecone Configuration Test');
    console.log('=====================================');
    
    const apiKey = process.env.PINECONE_API_KEY;
    const environment = process.env.PINECONE_ENVIRONMENT;
    const indexName = process.env.PINECONE_INDEX_NAME;
    
    console.log('📋 Environment Variables:');
    console.log('  API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : '❌ Not set');
    console.log('  Environment:', environment || '❌ Not set');
    console.log('  Index Name:', indexName || '❌ Not set');
    console.log('');
    
    if (!apiKey || !environment || !indexName) {
      console.error('❌ Missing required Pinecone configuration');
      return;
    }
    
    console.log('🔧 Creating Pinecone client...');
    const pinecone = new Pinecone({
      apiKey,
      environment,
    });
    
    console.log('✅ Pinecone client created successfully');
    console.log('');
    
    console.log('🔍 Testing index access...');
    const index = pinecone.index(indexName);
    console.log('✅ Index object created');
    console.log('');
    
    console.log('📊 Getting index stats...');
    try {
      const stats = await index.describeIndexStats();
      console.log('✅ Index stats retrieved successfully:');
      console.log('  Total vectors:', stats.totalVectorCount || 0);
      console.log('  Dimensions:', stats.dimension || 0);
      console.log('  Namespaces:', Object.keys(stats.namespaces || {}).length);
      console.log('');
      console.log('🎉 Pinecone connection is working correctly!');
    } catch (statsError) {
      console.error('❌ Failed to get index stats:', statsError.message);
      console.log('');
      console.log('🔍 This could mean:');
      console.log('  1. The index does not exist');
      console.log('  2. The API key does not have access to this index');
      console.log('  3. The environment is incorrect');
      console.log('  4. There is a network connectivity issue');
    }
    
  } catch (error) {
    console.error('🔥 Test failed:', error.message);
    console.error('🔥 Full error:', error);
  }
};

testPineconeFinal(); 