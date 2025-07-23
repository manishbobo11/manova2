// Test script for the new /api/vector/query endpoint
const testVectorQuery = async () => {
  try {
    console.log('🧪 Testing /api/vector/query endpoint...');
    
    const testData = {
      userId: 'test-user-123',
      embedding: [0.1, 0.2, 0.3, 0.4, 0.5], // Sample embedding
      topK: 3,
      filter: {
        domain: 'health'
      }
    };

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
      console.log('✅ Vector query endpoint is working!');
    } else {
      console.log('❌ Vector query endpoint failed');
    }
    
  } catch (error) {
    console.error('🔥 Test failed:', error.message);
  }
};

// Run the test
testVectorQuery(); 