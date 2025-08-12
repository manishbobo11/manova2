/**
 * Test script for the streaming Sarthi endpoint
 * Run with: node test-streaming-endpoint.js
 */

const fetch = require('node-fetch');

async function testStreamingEndpoint() {
  console.log('🧪 Testing streaming endpoint...');
  
  try {
    // Test without auth (should return 401)
    console.log('\n1. Testing without authentication...');
    const noAuthResponse = await fetch('http://localhost:3000/api/sarthi/stream?message=Hello');
    console.log(`Status: ${noAuthResponse.status}`);
    console.log(`Expected: 401 (Unauthorized)`);
    
    // Test with invalid auth
    console.log('\n2. Testing with invalid authentication...');
    const invalidAuthResponse = await fetch('http://localhost:3000/api/sarthi/stream?message=Hello', {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    console.log(`Status: ${invalidAuthResponse.status}`);
    console.log(`Expected: 401 (Invalid token)`);
    
    // Test with missing message parameter
    console.log('\n3. Testing with missing message parameter...');
    const noMessageResponse = await fetch('http://localhost:3000/api/sarthi/stream', {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    console.log(`Status: ${noMessageResponse.status}`);
    console.log(`Expected: 400 (Missing message)`);
    
    console.log('\n✅ Basic endpoint validation tests completed');
    console.log('\n📝 Note: Full streaming test requires valid Firebase auth token');
    console.log('   To test with real auth, use the frontend at /streaming-chat');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testStreamingEndpoint();
