/**
 * Test Pinecone connection with the configured credentials
 */
export const testPineconeConnection = async () => {
  console.log('🧪 Testing Pinecone connection...');
  
  try {
    // Test the backend vector upsert endpoint
    const testEmbedding = new Array(1536).fill(0.1);
    const testMetadata = {
      questionId: 'test-pinecone-connection',
      domain: 'test',
      timestamp: new Date().toISOString()
    };
    
    console.log('📡 Testing vector upsert to Pinecone...');
    
    const response = await fetch('http://localhost:8001/api/vector/upsert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test-user-pinecone',
        embedding: testEmbedding,
        metadata: testMetadata
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Pinecone connection successful!');
      console.log('   Response:', result);
      return true;
    } else {
      const errorText = await response.text();
      console.log('❌ Pinecone connection failed');
      console.log('   Status:', response.status);
      console.log('   Error:', errorText);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Pinecone test error:', error.message);
    console.log('💡 Make sure the backend server is running: npm run server');
    return false;
  }
};

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - can be called from console
  window.testPineconeConnection = testPineconeConnection;
} 