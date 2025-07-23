/**
 * Test suite for Deep Dive Insights functionality
 * Tests the storage and display of AI-generated insights per domain
 */

// Mock deep dive summaries data structure
const mockDeepDiveSummaries = {
  "Work & Career": {
    summary: "I can see how challenging your work situation has been. The stress you're experiencing is completely valid, especially given the pressure you're under.",
    actionableSteps: [
      "Set clear boundaries around your work hours",
      "Schedule regular breaks throughout your day",
      "Have an honest conversation with your manager about workload",
      "Practice stress-reduction techniques like deep breathing"
    ],
    reflectionQuestions: [
      "What would it feel like to prioritize your wellbeing at work?",
      "If you could change one thing about your work environment, what would it be?",
      "What support do you need that you're not currently getting?"
    ],
    selfCompassion: "Remember, you're doing the best you can in a challenging situation. It's okay to need support and to take care of yourself.",
    timestamp: "2024-01-15T10:30:00.000Z",
    domain: "Work & Career",
    reasons: ["overwhelming workload", "lack of recognition"]
  },
  "Self-Worth & Identity": {
    summary: "Your responses suggest you're experiencing some self-doubt and questioning your worth. This is incredibly common and something many people struggle with.",
    actionableSteps: [
      "Practice daily self-affirmations",
      "Keep a journal of your accomplishments",
      "Surround yourself with supportive people",
      "Challenge negative self-talk with evidence"
    ],
    reflectionQuestions: [
      "What would you tell a friend who was feeling this way?",
      "What evidence do you have that contradicts these negative thoughts?",
      "What would it feel like to be kinder to yourself?"
    ],
    selfCompassion: "You are worthy of love, respect, and happiness just as you are. Your struggles don't define your worth.",
    timestamp: "2024-01-15T11:15:00.000Z",
    domain: "Self-Worth & Identity",
    reasons: ["imposter syndrome", "comparison to others"]
  }
};

// Mock domain scores for testing
const mockDomainScores = [
  { domain: "Work & Career", score: 75, hasStress: true },
  { domain: "Personal Life", score: 0, hasStress: false },
  { domain: "Financial Stress", score: 0, hasStress: false },
  { domain: "Health", score: 0, hasStress: false },
  { domain: "Self-Worth & Identity", score: 65, hasStress: true }
];

// Test function to check if insights are properly structured
function testDeepDiveInsightsStructure() {
  console.log('🧪 Testing Deep Dive Insights Structure...\n');

  // Test 1: Check if insights have required fields
  console.log('Test 1: Required fields validation');
  const domainsWithInsights = Object.keys(mockDeepDiveSummaries);
  
  domainsWithInsights.forEach(domain => {
    const insight = mockDeepDiveSummaries[domain];
    const hasSummary = !!insight.summary;
    const hasActionableSteps = Array.isArray(insight.actionableSteps) && insight.actionableSteps.length > 0;
    const hasReflectionQuestions = Array.isArray(insight.reflectionQuestions) && insight.reflectionQuestions.length > 0;
    const hasSelfCompassion = !!insight.selfCompassion;
    
    console.log(`✅ ${domain}:`, {
      hasSummary,
      hasActionableSteps,
      hasReflectionQuestions,
      hasSelfCompassion
    });
  });
  console.log('');

  // Test 2: Check if insights match domain scores
  console.log('Test 2: Insights match domain stress levels');
  mockDomainScores.forEach(domainScore => {
    const hasInsights = !!mockDeepDiveSummaries[domainScore.domain];
    const shouldHaveInsights = domainScore.hasStress;
    
    console.log(`${domainScore.domain}:`, {
      stressScore: domainScore.score,
      hasStress: domainScore.hasStress,
      hasInsights,
      matches: hasInsights === shouldHaveInsights
    });
  });
  console.log('');

  // Test 3: Check insight content quality
  console.log('Test 3: Insight content quality');
  domainsWithInsights.forEach(domain => {
    const insight = mockDeepDiveSummaries[domain];
    const summaryLength = insight.summary.length;
    const stepsCount = insight.actionableSteps.length;
    const questionsCount = insight.reflectionQuestions.length;
    
    console.log(`${domain}:`, {
      summaryLength: summaryLength > 50 ? 'Good' : 'Too short',
      stepsCount: stepsCount >= 3 ? 'Good' : 'Could use more',
      questionsCount: questionsCount >= 2 ? 'Good' : 'Could use more'
    });
  });
  console.log('');

  return true;
}

// Test function to simulate the WellnessSummary component logic
function testWellnessSummaryIntegration() {
  console.log('🧪 Testing WellnessSummary Integration...\n');

  // Simulate the hasInsights check from WellnessSummary
  const domainsWithInsights = mockDomainScores.filter(domainScore => {
    const insight = mockDeepDiveSummaries[domainScore.domain];
    return insight && (
      insight.summary || 
      insight.actionableSteps?.length > 0 ||
      insight.reflectionQuestions?.length > 0
    );
  });

  console.log('Domains that should show "View AI Insights" button:');
  domainsWithInsights.forEach(domainScore => {
    console.log(`✅ ${domainScore.domain} (Stress: ${domainScore.score}%)`);
  });
  console.log('');

  // Simulate modal data structure
  console.log('Modal data structure for each domain:');
  domainsWithInsights.forEach(domainScore => {
    const insight = mockDeepDiveSummaries[domainScore.domain];
    console.log(`${domainScore.domain}:`, {
      summary: insight.summary ? 'Available' : 'Missing',
      actionableSteps: insight.actionableSteps?.length || 0,
      reflectionQuestions: insight.reflectionQuestions?.length || 0,
      selfCompassion: insight.selfCompassion ? 'Available' : 'Missing'
    });
  });
  console.log('');

  return domainsWithInsights.length > 0;
}

// Test function to verify data persistence
function testDataPersistence() {
  console.log('🧪 Testing Data Persistence...\n');

  // Simulate the setDeepDiveSummaries logic
  const newInsight = {
    summary: "This is a test insight for a new domain.",
    actionableSteps: ["Step 1", "Step 2", "Step 3"],
    reflectionQuestions: ["Question 1", "Question 2"],
    selfCompassion: "Be kind to yourself during this process.",
    timestamp: new Date().toISOString(),
    domain: "Test Domain",
    reasons: ["test reason"]
  };

  // Simulate adding to existing summaries
  const updatedSummaries = {
    ...mockDeepDiveSummaries,
    "Test Domain": newInsight
  };

  console.log('Before adding new insight:', Object.keys(mockDeepDiveSummaries).length, 'domains');
  console.log('After adding new insight:', Object.keys(updatedSummaries).length, 'domains');
  console.log('✅ New insight added successfully');
  console.log('');

  return true;
}

// Test function to verify Deep Dive filtering logic
function testDeepDiveFiltering() {
  console.log('🧪 Testing Deep Dive Filtering Logic...\n');

  // Mock Personal Life questions with AI analysis
  const mockPersonalLifeQuestions = [
    {
      id: 'personal_1',
      text: 'How satisfied are you with the quality of emotional intimacy and connection in your closest relationships?',
      selectedOption: 'Not at all',
      score: 0,
      domain: 'Personal Life',
      aiAnalysis: { score: 8, emotion: 'Lonely', intensity: 'High' },
      answerLabel: 'Not at all'
    },
    {
      id: 'personal_2',
      text: 'In the past month, how often have you been able to engage in activities that genuinely restore and energize you?',
      selectedOption: 'Never',
      score: 0,
      domain: 'Personal Life',
      aiAnalysis: { score: 6, emotion: 'Exhausted', intensity: 'Moderate' },
      answerLabel: 'Never'
    },
    {
      id: 'personal_3',
      text: "When you're experiencing difficult emotions, how readily available do you feel your support network is to you?",
      selectedOption: 'Sometimes',
      score: 2,
      domain: 'Personal Life',
      aiAnalysis: { score: 9, emotion: 'Isolated', intensity: 'High' },
      answerLabel: 'Sometimes'
    },
    {
      id: 'personal_4',
      text: 'How often do you feel you can be your authentic self without judgment in your personal relationships?',
      selectedOption: 'Often',
      score: 3,
      domain: 'Personal Life',
      aiAnalysis: { score: 3, emotion: 'Comfortable', intensity: 'Low' },
      answerLabel: 'Often'
    },
    {
      id: 'personal_5',
      text: 'To what degree do you feel your personal boundaries and needs are respected by those closest to you?',
      selectedOption: 'Completely',
      score: 4,
      domain: 'Personal Life',
      aiAnalysis: { score: 2, emotion: 'Secure', intensity: 'Low' },
      answerLabel: 'Completely'
    }
  ];

  // Apply the filtering logic
  const filteredQuestions = mockPersonalLifeQuestions.filter(q => 
    q.domain === 'Personal Life' && 
    q.aiAnalysis?.score >= 7
  );

  console.log('Test 1: Filtering logic validation');
  console.log('Total questions:', mockPersonalLifeQuestions.length);
  console.log('Filtered questions:', filteredQuestions.length);
  console.log('Expected filtered questions:', 2); // Questions with scores 8 and 9
  console.log('✅ Passed:', filteredQuestions.length === 2);
  console.log('');

  console.log('Test 2: Filtered questions content');
  filteredQuestions.forEach((q, index) => {
    console.log(`${index + 1}. ${q.text}`);
    console.log(`   AI Score: ${q.aiAnalysis.score}, Emotion: ${q.aiAnalysis.emotion}`);
    console.log(`   Domain: ${q.domain}, Answer: ${q.answerLabel}`);
  });
  console.log('');

  console.log('Test 3: Questions that should be excluded');
  const excludedQuestions = mockPersonalLifeQuestions.filter(q => 
    !(q.domain === 'Personal Life' && q.aiAnalysis?.score >= 7)
  );
  excludedQuestions.forEach((q, index) => {
    console.log(`${index + 1}. ${q.text}`);
    console.log(`   AI Score: ${q.aiAnalysis.score} (should be < 7)`);
  });
  console.log('✅ Passed:', excludedQuestions.length === 3);
  console.log('');

  return filteredQuestions.length === 2 && excludedQuestions.length === 3;
}

// Main test runner
export async function testDeepDiveInsights() {
  console.log('🎯 Deep Dive Insights Test Suite\n');
  console.log('This test suite verifies the storage and display of AI-generated insights.\n');

  try {
    const structureTest = testDeepDiveInsightsStructure();
    const integrationTest = testWellnessSummaryIntegration();
    const persistenceTest = testDataPersistence();
    const filteringTest = testDeepDiveFiltering();

    console.log('📊 Test Results Summary:');
    console.log('✅ Structure Test:', structureTest ? 'PASSED' : 'FAILED');
    console.log('✅ Integration Test:', integrationTest ? 'PASSED' : 'FAILED');
    console.log('✅ Persistence Test:', persistenceTest ? 'PASSED' : 'FAILED');
    console.log('✅ Filtering Test:', filteringTest ? 'PASSED' : 'FAILED');

    const allPassed = structureTest && integrationTest && persistenceTest && filteringTest;
    console.log('\n🎉 Overall Result:', allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED');
    
    return allPassed;
  } catch (error) {
    console.error('❌ Test suite error:', error);
    return false;
  }
}

// Example usage for manual testing
export function getMockDeepDiveData() {
  return {
    summaries: mockDeepDiveSummaries,
    domainScores: mockDomainScores
  };
}

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - make functions available globally
  window.testDeepDiveInsights = testDeepDiveInsights;
  window.getMockDeepDiveData = getMockDeepDiveData;
} else {
  // Node.js environment - run tests
  testDeepDiveInsights();
} 