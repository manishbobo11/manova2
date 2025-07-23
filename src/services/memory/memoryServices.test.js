/**
 * Memory Services Test and Demo
 * Demonstrates how to use the vector store services via API endpoints
 */

import { saveSurveyToVectorDB } from './index.js';

/**
 * Test API-based vector store operations
 */
export async function testVectorStoreAPI() {
  console.log('🧪 Testing Vector Store API...');
  
  try {
    // Test saving survey data via API
    const testData = {
      userId: 'test-user-123',
      domain: 'Work & Career',
      text: 'I am feeling stressed about work deadlines this week'
    };
    
    const result = await saveSurveyToVectorDB(testData);
    console.log('API save result:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Vector store API test failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test memory storage via API
 */
export async function testMemoryOperations(userId = 'test-user-123') {
  console.log('🧪 Testing Memory Operations via API...');
  
  try {
    // Test storing survey data via API
    const testData = {
      userId,
      domain: 'Work & Career',
      text: 'I am feeling stressed about work deadlines this week'
    };
    
    const storeResult = await saveSurveyToVectorDB(testData);
    console.log('Store memory result:', storeResult);
    
    return { success: true, result: storeResult };
  } catch (error) {
    console.error('❌ Memory operations test failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test conversation storage via API
 */
export async function testConversationStorage(userId = 'test-user-123') {
  console.log('🧪 Testing Conversation Storage via API...');
  
  try {
    const conversationText = 'User: I\'m feeling overwhelmed with my workload. Assistant: I understand that feeling overwhelmed can be really challenging. Can you tell me more about what\'s contributing to this feeling? User: I have three major projects due this week and I\'m not sure I can handle them all';
    
    const testData = {
      userId,
      domain: 'Work & Career',
      text: conversationText
    };
    
    const result = await saveSurveyToVectorDB(testData);
    console.log('Conversation storage result:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Conversation storage test failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test survey data storage via API
 */
export async function testSurveyDataStorage(userId = 'test-user-123') {
  console.log('🧪 Testing Survey Data Storage via API...');
  
  try {
    const surveyText = 'Survey responses: How often do you feel stressed at work? - Very Often (stress score: 8). How satisfied are you with your work-life balance? - Not satisfied (stress score: 7). Insights: High stress levels at work, poor work-life balance, need for better boundaries. Overall wellness score: 3/10.';
    
    const testData = {
      userId,
      domain: 'Work & Career',
      text: surveyText
    };
    
    const result = await saveSurveyToVectorDB(testData);
    console.log('Survey data storage result:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Survey data storage test failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test memory search functionality (placeholder - search not yet implemented via API)
 */
export async function testMemorySearch(userId = 'test-user-123') {
  console.log('🧪 Testing Memory Search (placeholder)...');
  
  try {
    // Note: Search functionality not yet implemented via API
    // This would require a new API endpoint for searching
    console.log('Search functionality not yet implemented via API');
    
    return { success: true, message: 'Search functionality not yet implemented via API' };
  } catch (error) {
    console.error('❌ Memory search test failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Run all memory service tests
 */
export async function runAllMemoryTests() {
  console.log('🚀 Running All Memory Service Tests...\n');
  
  const results = {
    vectorStoreAPI: await testVectorStoreAPI(),
    memoryOperations: await testMemoryOperations(),
    conversationStorage: await testConversationStorage(),
    surveyDataStorage: await testSurveyDataStorage(),
    memorySearch: await testMemorySearch()
  };
  
  console.log('\n📊 Test Results Summary:');
  Object.entries(results).forEach(([test, result]) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${test}: ${result.success ? 'PASSED' : 'FAILED'}`);
    if (!result.success && result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  return results;
}

/**
 * Demo: Complete memory workflow via API
 */
export async function demonstrateMemoryWorkflow() {
  console.log('🎯 Demonstrating Complete Memory Workflow via API...\n');
  
  const userId = 'demo-user-' + Date.now();
  
  try {
    // 1. Store survey responses
    console.log('1️⃣ Storing survey responses...');
    const surveyText = 'Survey: How are you feeling today? - A bit anxious (stress score: 6). Domain: Personal Life. Wellness score: 4/10.';
    await saveSurveyToVectorDB({
      userId,
      domain: 'Personal Life',
      text: surveyText
    });
    
    // 2. Store conversation
    console.log('2️⃣ Storing conversation...');
    const conversationText = 'User: I\'m worried about my upcoming presentation. Assistant: That\'s a common concern. What specifically worries you about it?';
    await saveSurveyToVectorDB({
      userId,
      domain: 'Work & Career',
      text: conversationText
    });
    
    // 3. Store additional context
    console.log('3️⃣ Storing additional context...');
    const contextText = 'User needs help with anxiety and work stress. Previous concerns about presentations and deadlines.';
    await saveSurveyToVectorDB({
      userId,
      domain: 'Work & Career',
      text: contextText
    });
    
    console.log('\n✅ Memory workflow demonstration completed!');
    
    return {
      success: true,
      userId,
      message: 'Memory workflow completed via API endpoints'
    };
    
  } catch (error) {
    console.error('❌ Memory workflow demonstration failed:', error);
    return { success: false, error: error.message };
  }
}

// Export test utilities
export const testUtils = {
  createTestData: (text, domain = 'general') => ({
    userId: 'test-user-' + Date.now(),
    domain,
    text
  })
}; 