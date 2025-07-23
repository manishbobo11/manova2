// Detailed test script for the vector query endpoint
const testVectorQueryDetailed = async () => {
  try {
    console.log('🧪 Testing /api/vector/query endpoint with detailed logging...');
    
    const testData = {
      userId: 'test-user-123',
      embedding: Array.from({length: 1536}, () => Math.random()), // OpenAI embedding size
      topK: 3,
      filter: {
        domain: 'health'
      }
    };

    console.log('📤 Sending request with data:', {
      userId: testData.userId,
      embeddingLength: testData.embedding.length,
      topK: testData.topK,
      filter: testData.filter
    });

    const response = await fetch('http://localhost:8001/api/vector/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response body:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      if (result.mock) {
        console.log('⚠️  Endpoint returned mock response - Pinecone may not be configured or accessible');
        console.log('💡 Check your Pinecone credentials and index configuration');
      } else {
        console.log('✅ Vector query endpoint is working with real Pinecone!');
      }
    } else {
      console.log('❌ Vector query endpoint failed');
    }
    
  } catch (error) {
    console.error('🔥 Test failed:', error.message);
  }
};

// Run the test
testVectorQueryDetailed(); 