// Test script for Emotionally Intelligent Sarthi System
import { ChatEngine } from './src/services/ai/ChatEngine.js';

console.log('🧠 Testing Emotionally Intelligent Sarthi...\n');

// Initialize ChatEngine
const chatEngine = new ChatEngine();

// Test emotional tone detection
console.log('1. Testing Emotional Tone Detection:');
const emotionalMessages = [
  "Bhai kuch samajh nahi aa raha, dimag phat raha hai",
  "Tu kaisa hai yaar? Main thoda stress mein hoon",
  "I'm feeling overwhelmed at work, can't handle it anymore",
  "Boss ke saath fight ho gaya, ab naukri jaane ka dar hai",
  "Yaar, tu kaisa hai? Main akela feel kar raha hoon"
];

emotionalMessages.forEach(message => {
  console.log(`Message: "${message}"`);
  const emotionalTone = chatEngine.detectEmotionalTone(message, 'Hinglish');
  console.log(`Emotional Analysis:`, emotionalTone);
  console.log('---');
});

// Test emotional intelligence helper functions
console.log('\n2. Testing Emotional Intelligence Functions:');

// Mock emotional data
const mockEmotionalData = [
  {
    domain: 'Work & Career',
    emotion: 'stressed',
    stressScore: 8,
    response: 'Boss constantly criticizing my work, feeling like I can\\'t do anything right',
    timestamp: '2024-01-15'
  },
  {
    domain: 'Work & Career', 
    emotion: 'overwhelmed',
    stressScore: 7,
    response: 'Too many deadlines, working late every day',
    timestamp: '2024-01-10'
  },
  {
    domain: 'Personal',
    emotion: 'lonely',
    stressScore: 6,
    response: 'Friends are busy, feeling disconnected from everyone',
    timestamp: '2024-01-08'
  }
];

// Test recurring struggles identification
const recurringStruggles = chatEngine.identifyRecurringStruggles(mockEmotionalData);
console.log('Recurring Struggles:', recurringStruggles);

// Test emotional triggers extraction
const emotionalTriggers = chatEngine.extractEmotionalTriggers(mockEmotionalData);
console.log('Emotional Triggers:', emotionalTriggers);

// Test coping patterns analysis
const copingPatterns = chatEngine.analyzeCopingPatterns(mockEmotionalData);
console.log('Coping Patterns:', copingPatterns);

// Test practical solution generation
console.log('\n3. Testing Practical Solution Generation:');

const mockPersonalContext = {
  isRecurringPattern: true,
  relatedStruggle: { domain: 'Work & Career', emotion: 'stressed', frequency: 2 }
};

const mockEmotionalIntelligence = {
  coping_patterns: ['social_support'],
  recurring_struggles: [{ domain: 'Work & Career', emotion: 'stressed', frequency: 2 }],
  emotional_triggers: [{ type: 'authority_figures', domain: 'Work & Career' }]
};

const practicalSolution = chatEngine.generatePracticalSolution(
  mockPersonalContext, 
  mockEmotionalIntelligence, 
  'Hinglish'
);
console.log('Generated Solution:', practicalSolution);

console.log('\n4. Example Response Scenarios:');

// Scenario 1: Breaking down user with bhai mode
console.log('Scenario 1 - Breaking down user (Hinglish, bhai mode):');
console.log('User: "Bhai kuch samajh nahi aa raha, dimag phat raha hai"');
console.log('Expected Response Style: Immediate comfort + memory reference + specific action');

// Scenario 2: Work stress continuation 
console.log('\nScenario 2 - Work stress (recurring pattern):');
console.log('User: "Boss ne phir se meeting mein embarrass kiya"');
console.log('Expected Response: Reference past authority trigger + practical boundary setting');

// Scenario 3: Simple check-in with history
console.log('\nScenario 3 - Simple check-in with emotional memory:');
console.log('User: "Tu kaisa hai bhai?"');
console.log('Expected Response: Match bhai tone + check in on known stress areas');

console.log('\n✅ Static tests completed!');
console.log('🎯 Key Features Implemented:');
console.log('- Deep emotional intelligence from Pinecone vectors');
console.log('- Bhai-level tone matching');
console.log('- Recurring pattern recognition');
console.log('- Practical, personalized solutions');
console.log('- Emotional trigger awareness');
console.log('- Language-adaptive personality (Hindi/English/Hinglish)');
console.log('\n🚀 Run in browser with real vector data for full experience!');