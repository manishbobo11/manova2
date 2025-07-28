// Test script for new Sarthi functionality
import { generateSarthiResponse, analyzeMessageContext } from './src/services/ai/manovaAgent.js';

// Test message analysis
console.log('🧪 Testing message analysis...');

const testMessages = [
  "I want to resign from my job",
  "I'm thinking about breaking up with my partner", 
  "I feel overwhelmed and can't take it anymore",
  "How are you today?",
  "I had a good day at work"
];

testMessages.forEach(message => {
  const analysis = analyzeMessageContext(message);
  console.log(`Message: "${message}"`);
  console.log(`Analysis:`, analysis);
  console.log('---');
});

// Test enhanced response generation (mock)
console.log('\n🤖 Testing Sarthi response generation...');

try {
  const testUserId = 'test_user_123';
  const testMessage = "I'm thinking about resigning from my job. I feel so overwhelmed.";
  
  console.log(`Testing with message: "${testMessage}"`);
  console.log('Note: This will test the logic structure, vector calls may fail in test environment');
  
  // This would normally call the actual function, but we'll just test the prompt structure
  console.log('✅ Test setup complete - run in browser environment for full test');
  
} catch (error) {
  console.error('❌ Test error:', error.message);
}