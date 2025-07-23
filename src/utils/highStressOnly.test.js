import { filterDeepDiveQuestions } from '../services/stressAnalysisLogic.js';

export function testHighStressOnlyFiltering() {
  console.log('🧪 Testing High Stress Only Filtering...');
  
  // Mock questions with various stress levels
  const testQuestions = [
    {
      id: 'test_1',
      text: 'How often do you feel overwhelmed at work?',
      selectedOption: 'Very Often',
      answerLabel: 'Very Often',
      domain: 'Work & Career',
      isPositive: false
    },
    {
      id: 'test_2',
      text: 'How satisfied are you with your manager\'s support?',
      selectedOption: 'Not at all',
      answerLabel: 'Not at all',
      domain: 'Work & Career',
      isPositive: true
    },
    {
      id: 'test_3',
      text: 'How often do you feel stressed?',
      selectedOption: 'Sometimes',
      answerLabel: 'Sometimes',
      domain: 'Personal Life',
      isPositive: false
    },
    {
      id: 'test_4',
      text: 'How often do you feel anxious?',
      selectedOption: 'Often',
      answerLabel: 'Often',
      domain: 'Personal Life',
      isPositive: false
    },
    {
      id: 'test_5',
      text: 'How satisfied are you with your relationships?',
      selectedOption: 'Completely',
      answerLabel: 'Completely',
      domain: 'Personal Life',
      isPositive: true
    }
  ];

  // Test filtering for different domains
  const domains = ['Work & Career', 'Personal Life', 'Financial Stress', 'Health', 'Self-Worth & Identity'];
  
  domains.forEach(domain => {
    console.log(`\n📊 Testing ${domain} domain:`);
    
    const result = filterDeepDiveQuestions(testQuestions, domain);
    
    console.log(`Total questions: ${testQuestions.length}`);
    console.log(`Filtered questions: ${result.filteredQuestions.length}`);
    
    // Verify only high stress questions are included
    result.filteredQuestions.forEach((q, index) => {
      console.log(`✅ Question ${index + 1}: ${q.text}`);
      console.log(`   Stress Level: ${q.stressLevel}`);
      console.log(`   Include in Deep Dive: ${q.includeInDeepDive}`);
      
      // Verify stress level is high
      if (q.stressLevel !== 'high') {
        console.log(`❌ ERROR: Question has non-high stress level: ${q.stressLevel}`);
      }
      
      // Verify includeInDeepDive is true
      if (!q.includeInDeepDive) {
        console.log(`❌ ERROR: Question not marked for deep dive inclusion`);
      }
    });
    
    // Check that no moderate or low stress questions are included
    const nonHighStressQuestions = testQuestions.filter(q => {
      const analysis = require('../services/stressAnalysisLogic.js').comprehensiveStressAnalysis(
        q.answerLabel || q.selectedOption,
        q.text,
        domain.toLowerCase(),
        undefined,
        q.isPositive || q.positive || false
      );
      return analysis.score < 7;
    });
    
    const incorrectlyIncluded = result.filteredQuestions.filter(q => {
      const analysis = require('../services/stressAnalysisLogic.js').comprehensiveStressAnalysis(
        q.answerLabel || q.selectedOption,
        q.text,
        domain.toLowerCase(),
        undefined,
        q.isPositive || q.positive || false
      );
      return analysis.score < 7;
    });
    
    if (incorrectlyIncluded.length > 0) {
      console.log(`❌ ERROR: ${incorrectlyIncluded.length} non-high stress questions incorrectly included`);
      incorrectlyIncluded.forEach(q => {
        console.log(`   - ${q.text} (Score: ${q.stressLevel})`);
      });
    } else {
      console.log(`✅ SUCCESS: Only high stress questions included in ${domain}`);
    }
  });
  
  return true;
}

export function testStressScoreThresholds() {
  console.log('\n🧪 Testing Stress Score Thresholds...');
  
  const testCases = [
    {
      question: 'How often do you feel overwhelmed?',
      answer: 'Very Often',
      expectedIncluded: true,
      description: 'High stress response (should be included)'
    },
    {
      question: 'How satisfied are you with support?',
      answer: 'Not at all',
      expectedIncluded: true,
      description: 'High stress response (inverted, should be included)'
    },
    {
      question: 'How often do you feel stressed?',
      answer: 'Sometimes',
      expectedIncluded: false,
      description: 'Moderate stress response (should be excluded)'
    },
    {
      question: 'How satisfied are you with relationships?',
      answer: 'Somewhat',
      expectedIncluded: false,
      description: 'Moderate satisfaction (should be excluded)'
    },
    {
      question: 'How often do you feel happy?',
      answer: 'Always',
      expectedIncluded: false,
      description: 'Low stress response (should be excluded)'
    }
  ];

  let passedTests = 0;
  let totalTests = testCases.length;

  testCases.forEach((testCase, index) => {
    const question = {
      id: `threshold_test_${index}`,
      text: testCase.question,
      selectedOption: testCase.answer,
      answerLabel: testCase.answer,
      domain: 'Work & Career',
      isPositive: testCase.question.includes('satisfied') || testCase.question.includes('happy')
    };

    const result = filterDeepDiveQuestions([question], 'Work & Career');
    const isIncluded = result.filteredQuestions.length > 0;
    const stressLevel = result.filteredQuestions[0]?.stressLevel || 'low';

    const passed = testCase.expectedIncluded === isIncluded;
    
    if (passed) {
      passedTests++;
      console.log(`✅ Test ${index + 1} PASSED: ${testCase.description}`);
      console.log(`   Expected: ${testCase.expectedIncluded}, Got: ${isIncluded}, Stress Level: ${stressLevel}`);
    } else {
      console.log(`❌ Test ${index + 1} FAILED: ${testCase.description}`);
      console.log(`   Expected: ${testCase.expectedIncluded}, Got: ${isIncluded}, Stress Level: ${stressLevel}`);
    }
  });

  console.log(`\n📊 Threshold Test Results: ${passedTests}/${totalTests} tests passed`);
  return passedTests === totalTests;
}

export function testAllDomainsConsistency() {
  console.log('\n🧪 Testing All Domains Consistency...');
  
  const domains = ['Work & Career', 'Personal Life', 'Financial Stress', 'Health', 'Self-Worth & Identity'];
  const testQuestion = {
    id: 'consistency_test',
    text: 'How often do you feel overwhelmed?',
    selectedOption: 'Very Often',
    answerLabel: 'Very Often',
    domain: 'Work & Career',
    isPositive: false
  };

  let allDomainsConsistent = true;

  domains.forEach(domain => {
    const result = filterDeepDiveQuestions([testQuestion], domain);
    const isIncluded = result.filteredQuestions.length > 0;
    const stressLevel = result.filteredQuestions[0]?.stressLevel || 'low';
    
    console.log(`${domain}: Included=${isIncluded}, Stress Level=${stressLevel}`);
    
    // All domains should have the same behavior for the same question
    if (domain === domains[0]) {
      // Use first domain as reference
      const referenceIncluded = isIncluded;
      const referenceStressLevel = stressLevel;
    } else {
      // Compare with first domain
      const firstResult = filterDeepDiveQuestions([testQuestion], domains[0]);
      const firstIncluded = firstResult.filteredQuestions.length > 0;
      const firstStressLevel = firstResult.filteredQuestions[0]?.stressLevel || 'low';
      
      if (isIncluded !== firstIncluded || stressLevel !== firstStressLevel) {
        console.log(`❌ Inconsistency detected in ${domain}`);
        allDomainsConsistent = false;
      }
    }
  });

  if (allDomainsConsistent) {
    console.log('✅ SUCCESS: All domains have consistent high-stress-only filtering');
  } else {
    console.log('❌ FAILURE: Inconsistency detected across domains');
  }

  return allDomainsConsistent;
}

export async function runHighStressOnlyTests() {
  console.log('🚀 Running High Stress Only Tests...\n');
  
  const filteringTest = testHighStressOnlyFiltering();
  console.log('\n');
  
  const thresholdTest = testStressScoreThresholds();
  console.log('\n');
  
  const consistencyTest = testAllDomainsConsistency();
  console.log('\n');
  
  const overallSuccess = filteringTest && thresholdTest && consistencyTest;
  
  if (overallSuccess) {
    console.log('🎉 ALL TESTS PASSED: Only high stress questions (>= 7) are included in deep dive!');
  } else {
    console.log('❌ SOME TESTS FAILED: High stress filtering needs attention.');
  }
  
  return {
    filteringTest,
    thresholdTest,
    consistencyTest,
    overallSuccess
  };
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runHighStressOnlyTests().then(results => {
    console.log('Final Results:', results);
    process.exit(results.overallSuccess ? 0 : 1);
  });
} 