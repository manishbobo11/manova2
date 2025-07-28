// Test script for new Friendly Companion System
import { ChatEngine } from './src/services/ai/ChatEngine.js';

console.log('🧪 Testing Friendly Companion System...\n');

// Initialize ChatEngine
const chatEngine = new ChatEngine();

// Test tone detection
console.log('1. Testing tone detection:');
const testMessages = [
  "Tu kaisa hai bhai?",
  "How are you doing today?", 
  "Yaar I'm so fucking stressed about work",
  "I think I want to resign from my job",
  "Main bohot confused hoon, help me"
];

testMessages.forEach(message => {
  console.log(`Message: "${message}"`);
  const tone = chatEngine.detectUserTone(message, 'Hinglish');
  console.log(`Detected tone:`, tone);
  console.log('---');
});

// Test follow-up analysis  
console.log('\n2. Testing follow-up analysis:');
const mockEmotionalMemory = {
  hasHistory: true,
  stressAreas: ['Work & Career'],
  summary: 'Recent stress in work, feeling overwhelmed'
};

testMessages.forEach(message => {
  console.log(`Message: "${message}"`);
  const followUp = chatEngine.analyzeForFollowUp(message, mockEmotionalMemory);
  console.log(`Follow-up analysis:`, followUp);
  console.log('---');
});

console.log('\n✅ Static tests completed! Run in browser for full response generation.');