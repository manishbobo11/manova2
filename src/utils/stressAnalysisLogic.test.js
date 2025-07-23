// Test file to verify stress analysis logic and deep dive triggering
import { 
  calculateStressScore, 
  detectEmotion, 
  detectIntensity, 
  comprehensiveStressAnalysis,
  filterDeepDiveQuestions 
} from '../services/stressAnalysisLogic.js';

export async function testStressScoreCalculation() {
  console.log('🧪 Testing Stress Score Calculation...');
  
  const testCases = [
    // High stress cases (should get scores >= 7)
    { answer: 'Very Often', expected: 'high', description: 'Very Often should be high stress' },
    { answer: 'Always', expected: 'high', description: 'Always should be high stress' },
    { answer: 'Not at all', expected: 'high', description: 'Not at all should be high stress' },
    { answer: 'Never', expected: 'high', description: 'Never should be high stress' },
    { answer: 'Poor', expected: 'high', description: 'Poor should be high stress' },
    { answer: 'Very Poor', expected: 'high', description: 'Very Poor should be high stress' },
    
    // Moderate stress cases (should get scores 5-6)
    { answer: 'Often', expected: 'moderate', description: 'Often should be moderate stress' },
    { answer: 'Sometimes', expected: 'moderate', description: 'Sometimes should be moderate stress' },
    { answer: 'Fair', expected: 'moderate', description: 'Fair should be moderate stress' },
    { answer: 'A little', expected: 'moderate', description: 'A little should be moderate stress' },
    
    // Low stress cases (should get scores < 5)
    { answer: 'Rarely', expected: 'low', description: 'Rarely should be low stress' },
    { answer: 'Good', expected: 'low', description: 'Good should be low stress' },
    { answer: 'Excellent', expected: 'low', description: 'Excellent should be low stress' },
    { answer: 'A great deal', expected: 'low', description: 'A great deal should be low stress' }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const { answer, expected, description } of testCases) {
    try {
      const score = await calculateStressScore(answer, 'Test question', null, false, 'test-user');
      const actual = score >= 7 ? 'high' : score >= 5 ? 'moderate' : 'low';
      
      if (actual === expected) {
        console.log(`✅ ${description}: ${answer} -> Score ${score} (${actual})`);
        passed++;
      } else {
        console.log(`❌ ${description}: ${answer} -> Score ${score} (${actual}), expected ${expected}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${description}: Error - ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  return { passed, failed, total: testCases.length };
}

export async function testDeepDiveTriggering() {
  console.log('\n🧪 Testing Deep Dive Triggering...');
  
  const testQuestions = [
    {
      text: 'How often do you feel overwhelmed at work?',
      selectedOption: 'Very Often',
      answerLabel: 'Very Often',
      domain: 'Work & Career'
    },
    {
      text: 'How satisfied are you with your sleep quality?',
      selectedOption: 'Poor',
      answerLabel: 'Poor',
      domain: 'Health'
    },
    {
      text: 'How often do financial concerns worry you?',
      selectedOption: 'Sometimes',
      answerLabel: 'Sometimes',
      domain: 'Financial Stress'
    },
    {
      text: 'How confident do you feel about your future?',
      selectedOption: 'Excellent',
      answerLabel: 'Excellent',
      domain: 'Self-Worth & Identity'
    }
  ];
  
  const result = await filterDeepDiveQuestions(testQuestions, 'Work & Career', 'test-user');
  
  console.log('🔍 Filtering Results:');
  console.log(`- Total questions: ${testQuestions.length}`);
  console.log(`- Filtered questions: ${result.filteredQuestions.length}`);
  console.log(`- Domain needs review: ${result.domainNeedsReview}`);
  
  for (let i = 0; i < result.filteredQuestions.length; i++) {
    const q = result.filteredQuestions[i];
    try {
      const analysis = await comprehensiveStressAnalysis(q.answerLabel, q.text, q.domain, null, false, 'test-user');
      console.log(`\n📋 Question ${i + 1}:`);
      console.log(`  Text: ${q.text}`);
      console.log(`  Answer: ${q.answerLabel}`);
      console.log(`  Stress Score: ${analysis.score}`);
      console.log(`  Emotion: ${analysis.emotion}`);
      console.log(`  Intensity: ${analysis.intensity}`);
      console.log(`  Stress Level: ${q.stressLevel}`);
      console.log(`  Include in Deep Dive: ${q.includeInDeepDive}`);
    } catch (error) {
      console.log(`\n📋 Question ${i + 1}: Error analyzing - ${error.message}`);
    }
  }
  
  const shouldTriggerDeepDive = result.filteredQuestions.length > 0 || result.domainNeedsReview;
  console.log(`\n🚀 Should trigger deep dive: ${shouldTriggerDeepDive}`);
  
  return {
    shouldTriggerDeepDive,
    filteredCount: result.filteredQuestions.length,
    domainNeedsReview: result.domainNeedsReview
  };
}

export async function testComprehensiveAnalysis() {
  console.log('\n🧪 Testing Comprehensive Stress Analysis...');
  
  const testCases = [
    {
      answer: 'Very Often',
      question: 'How often do you feel stressed?',
      context: 'work',
      expectedStress: 'high'
    },
    {
      answer: 'Poor',
      question: 'How is your sleep quality?',
      context: 'health',
      expectedStress: 'high'
    },
    {
      answer: 'Sometimes',
      question: 'How often do you worry?',
      context: 'personal',
      expectedStress: 'moderate'
    },
    {
      answer: 'Excellent',
      question: 'How confident do you feel?',
      context: 'identity',
      expectedStress: 'low'
    }
  ];
  
  for (const { answer, question, context, expectedStress } of testCases) {
    try {
      const analysis = await comprehensiveStressAnalysis(answer, question, context, null, false, 'test-user');
      const actualStress = analysis.score >= 7 ? 'high' : analysis.score >= 5 ? 'moderate' : 'low';
      
      console.log(`\n📊 Analysis for "${answer}" in "${question}":`);
      console.log(`  Stress Score: ${analysis.score}`);
      console.log(`  Emotion: ${analysis.emotion}`);
      console.log(`  Intensity: ${analysis.intensity}`);
      console.log(`  Should Trigger Deep Dive: ${analysis.shouldTriggerDeepDive}`);
      console.log(`  Expected: ${expectedStress}, Actual: ${actualStress}`);
      
      if (actualStress === expectedStress) {
        console.log(`  ✅ Stress level matches expectation`);
      } else {
        console.log(`  ❌ Stress level mismatch`);
      }
    } catch (error) {
      console.log(`\n📊 Analysis for "${answer}" in "${question}": Error - ${error.message}`);
    }
  }
}

export async function runStressAnalysisTests() {
  console.log('🚀 Running Stress Analysis Logic Tests...\n');
  
  const scoreResults = await testStressScoreCalculation();
  const deepDiveResults = await testDeepDiveTriggering();
  await testComprehensiveAnalysis();
  
  console.log('\n📈 Summary:');
  console.log(`- Stress Score Tests: ${scoreResults.passed}/${scoreResults.total} passed`);
  console.log(`- Deep Dive Triggering: ${deepDiveResults.shouldTriggerDeepDive ? '✅ Working' : '❌ Not working'}`);
  console.log(`- Filtered Questions: ${deepDiveResults.filteredCount}`);
  
  const allPassed = scoreResults.failed === 0 && deepDiveResults.shouldTriggerDeepDive;
  console.log(`\n🎯 Overall Result: ${allPassed ? '✅ All tests passed' : '❌ Some tests failed'}`);
  
  return allPassed;
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runStressAnalysisTests();
} 