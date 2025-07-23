import { filterDeepDiveQuestions } from '../services/stressAnalysisLogic.js';

export function testPersonalLifeDeepDiveFix() {
  console.log('🧪 Testing Personal Life Domain Deep Dive Fix...');
  
  // Mock Personal Life questions with high stress responses
  const personalLifeQuestions = [
    {
      id: 'personal_1',
      text: 'How often do you feel lonely or isolated?',
      selectedOption: 'Very Often',
      answerLabel: 'Very Often',
      domain: 'Personal Life',
      isPositive: false
    },
    {
      id: 'personal_2',
      text: 'How satisfied are you with your social relationships?',
      selectedOption: 'Not at all',
      answerLabel: 'Not at all',
      domain: 'Personal Life',
      isPositive: true
    },
    {
      id: 'personal_3',
      text: 'How often do you feel overwhelmed by personal responsibilities?',
      selectedOption: 'Sometimes',
      answerLabel: 'Sometimes',
      domain: 'Personal Life',
      isPositive: false
    }
  ];

  // Test the filtering function
  const result = filterDeepDiveQuestions(personalLifeQuestions, 'Personal Life');
  
  console.log('📊 Filtering Result:', {
    totalQuestions: personalLifeQuestions.length,
    filteredQuestions: result.filteredQuestions.length,
    domainNeedsReview: result.domainNeedsReview,
    sometimesCount: result.sometimesCount,
    totalAnswers: result.totalAnswers
  });

  // Check if questions are properly flagged
  result.filteredQuestions.forEach((q, index) => {
    console.log(`✅ Question ${index + 1}:`, {
      text: q.text,
      stressLevel: q.stressLevel,
      includeInDeepDive: q.includeInDeepDive,
      answer: q.answerLabel
    });
  });

  // Verify the fix is working
  const hasHighStressQuestions = result.filteredQuestions.some(q => 
    q.stressLevel === 'high' || q.stressLevel === 'moderate'
  );

  if (hasHighStressQuestions) {
    console.log('✅ SUCCESS: Personal Life domain deep dive fix is working!');
    console.log('✅ High/moderate stress questions are being properly flagged for deep dive.');
  } else {
    console.log('❌ FAILURE: Personal Life domain deep dive fix is not working!');
    console.log('❌ No high/moderate stress questions were flagged for deep dive.');
  }

  return {
    success: hasHighStressQuestions,
    filteredCount: result.filteredQuestions.length,
    domainNeedsReview: result.domainNeedsReview
  };
}

export function testPersonalLifeStressDetection() {
  console.log('🧪 Testing Personal Life Stress Detection...');
  
  // Test different stress levels
  const testCases = [
    {
      question: 'How often do you feel lonely?',
      answer: 'Very Often',
      expectedStress: 'high',
      description: 'High stress response'
    },
    {
      question: 'How satisfied are you with relationships?',
      answer: 'Not at all',
      expectedStress: 'high',
      description: 'High stress response (inverted)'
    },
    {
      question: 'How often do you feel supported?',
      answer: 'Sometimes',
      expectedStress: 'moderate',
      description: 'Moderate stress response'
    },
    {
      question: 'How often do you feel happy?',
      answer: 'Always',
      expectedStress: 'low',
      description: 'Low stress response'
    }
  ];

  let passedTests = 0;
  let totalTests = testCases.length;

  testCases.forEach((testCase, index) => {
    const question = {
      id: `test_${index}`,
      text: testCase.question,
      selectedOption: testCase.answer,
      answerLabel: testCase.answer,
      domain: 'Personal Life',
      isPositive: testCase.question.includes('satisfied') || testCase.question.includes('happy')
    };

    const result = filterDeepDiveQuestions([question], 'Personal Life');
    const isIncluded = result.filteredQuestions.length > 0;
    const stressLevel = result.filteredQuestions[0]?.stressLevel || 'low';

    const passed = (testCase.expectedStress === 'high' || testCase.expectedStress === 'moderate') === isIncluded;
    
    if (passed) {
      passedTests++;
      console.log(`✅ Test ${index + 1} PASSED: ${testCase.description}`);
    } else {
      console.log(`❌ Test ${index + 1} FAILED: ${testCase.description}`);
      console.log(`   Expected: ${testCase.expectedStress}, Got: ${stressLevel}, Included: ${isIncluded}`);
    }
  });

  console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  return passedTests === totalTests;
}

export async function runPersonalLifeDeepDiveTests() {
  console.log('🚀 Running Personal Life Deep Dive Tests...\n');
  
  const fixTest = testPersonalLifeDeepDiveFix();
  console.log('\n');
  
  const detectionTest = testPersonalLifeStressDetection();
  console.log('\n');
  
  const overallSuccess = fixTest.success && detectionTest;
  
  if (overallSuccess) {
    console.log('🎉 ALL TESTS PASSED: Personal Life domain deep dive is working correctly!');
  } else {
    console.log('❌ SOME TESTS FAILED: Personal Life domain deep dive needs attention.');
  }
  
  return {
    fixTest: fixTest.success,
    detectionTest: detectionTest,
    overallSuccess
  };
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runPersonalLifeDeepDiveTests().then(results => {
    console.log('Final Results:', results);
    process.exit(results.overallSuccess ? 0 : 1);
  });
} 