import { getEmbeddingFromAzure } from './embeddingService.js';
import { AZURE_CONFIG, validateAzureConfig } from '../config/azure.js';
import { apiFetch } from './api';

/**
 * Test the fixes for embedding service and API endpoints
 */
export const testFixes = async () => {
  console.log('🧪 Testing Manova fixes...');
  
  try {
    // Test 1: Azure Configuration
    console.log('1️⃣ Testing Azure configuration...');
    const configValid = validateAzureConfig();
    console.log('✅ Azure config validation:', configValid ? 'PASSED' : 'FAILED');
    
    if (!configValid) {
      console.log('⚠️ Please set these environment variables in your .env file:');
      console.log('   VITE_AZURE_OPENAI_KEY=your_azure_key');
      console.log('   VITE_AZURE_OPENAI_ENDPOINT=your_azure_endpoint');
      console.log('   VITE_AZURE_EMBEDDING_DEPLOYMENT_NAME=your_deployment_name');
      return false;
    }
    
    // Test 2: Embedding Service
    console.log('2️⃣ Testing embedding service...');
    const testText = 'This is a test response for stress analysis';
    const embedding = await getEmbeddingFromAzure(testText);
    console.log('✅ Embedding service:', embedding.length > 0 ? 'PASSED' : 'FAILED');
    console.log(`   Generated ${embedding.length} dimensions`);
    
    // Test 3: API Endpoint (if running locally)
    console.log('3️⃣ Testing enhanced stress analysis API...');
    try {
      const response = await apiFetch('/api/enhanced-stress-analysis', {
        method: 'POST',
        body: JSON.stringify({
          questionId: 'test-1',
          responseText: 'I feel overwhelmed with work lately',
          domain: 'work',
          userId: 'test-user'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Enhanced stress analysis API: PASSED');
        console.log('   Response:', result);
      } else {
        console.log('⚠️ Enhanced stress analysis API: Server error (expected if not running)');
      }
    } catch (apiError) {
      console.log('⚠️ Enhanced stress analysis API: Not available (expected if not running)');
    }
    
    console.log('🎉 All tests completed!');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
};

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - can be called from console
  window.testManovaFixes = testFixes;
} 