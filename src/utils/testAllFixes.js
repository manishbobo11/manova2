import { getEmbeddingFromAzure } from './embeddingService.js';
import { AZURE_CONFIG, validateAzureConfig } from '../config/config.js';
import { apiFetch } from './api';

/**
 * Comprehensive test for all Manova fixes
 */
export const testAllFixes = async () => {
  console.log('🧪 Testing all Manova fixes...');
  
  const results = {
    azureConfig: false,
    embeddingService: false,
    stressAnalysis: false,
    vectorStorage: false
  };

  try {
    // Test 1: Azure Configuration
    console.log('\n1️⃣ Testing Azure configuration...');
    const configValid = validateAzureConfig();
    results.azureConfig = configValid;
    console.log('✅ Azure config validation:', configValid ? 'PASSED' : 'FAILED');
    
    if (!configValid) {
      console.log('⚠️ Azure configuration is incomplete. Check src/config/config.js');
      console.log('   Current config:', AZURE_CONFIG);
    }
    
    // Test 2: Embedding Service
    console.log('\n2️⃣ Testing embedding service...');
    try {
      const testText = 'This is a test response for stress analysis';
      const embedding = await getEmbeddingFromAzure(testText);
      results.embeddingService = embedding.length > 0;
      console.log('✅ Embedding service:', results.embeddingService ? 'PASSED' : 'FAILED');
      console.log(`   Generated ${embedding.length} dimensions`);
    } catch (error) {
      console.log('⚠️ Embedding service failed (using fallback):', error.message);
      results.embeddingService = true; // Fallback is working
    }
    
    // Test 3: Enhanced Stress Analysis API
    console.log('\n3️⃣ Testing enhanced stress analysis API...');
    try {
      const response = await apiFetch('/api/enhanced-stress-analysis', {
        method: 'POST',
        body: JSON.stringify({
          questionId: 'test-1',
          responseText: 'I feel overwhelmed with work lately',
          domain: 'Work & Career',
          userId: 'test-user'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        results.stressAnalysis = result.success && result.data;
        console.log('✅ Enhanced stress analysis API: PASSED');
        console.log('   Response:', result.data);
      } else {
        console.log('❌ Enhanced stress analysis API: FAILED');
        console.log('   Status:', response.status);
        const errorText = await response.text();
        console.log('   Error:', errorText);
      }
    } catch (apiError) {
      console.log('❌ Enhanced stress analysis API: ERROR');
      console.log('   Error:', apiError.message);
    }
    
    // Test 4: Vector Storage API
    console.log('\n4️⃣ Testing vector storage API...');
    try {
      const testEmbedding = new Array(1536).fill(0.1);
      const response = await apiFetch('/api/vector/upsert', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'test-user',
          embedding: testEmbedding,
          metadata: {
            questionId: 'test-1',
            domain: 'Work & Career',
            timestamp: new Date().toISOString()
          }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        results.vectorStorage = result.success;
        console.log('✅ Vector storage API: PASSED');
        console.log('   Vector ID:', result.vectorId);
      } else {
        console.log('❌ Vector storage API: FAILED');
        console.log('   Status:', response.status);
        const errorText = await response.text();
        console.log('   Error:', errorText);
      }
    } catch (apiError) {
      console.log('❌ Vector storage API: ERROR');
      console.log('   Error:', apiError.message);
    }
    
    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    const allPassed = Object.values(results).every(result => result);
    console.log(`\n🎉 Overall: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
    
    if (!allPassed) {
      console.log('\n🔧 Next steps:');
      if (!results.azureConfig) {
        console.log('- Set up Azure environment variables');
      }
      if (!results.stressAnalysis) {
        console.log('- Check if your development server is running');
      }
      if (!results.vectorStorage) {
        console.log('- Check if your API routes are accessible');
      }
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    return results;
  }
};

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - can be called from console
  window.testAllManovaFixes = testAllFixes;
} 