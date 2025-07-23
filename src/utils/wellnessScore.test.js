/**
 * Test suite for the improved wellness score calculation
 * Tests various scenarios to ensure the new logic works correctly
 */

// Mock domains structure
const mockDomains = [
  {
    name: 'Work & Career',
    questions: [
      { id: 'work_1' },
      { id: 'work_2' },
      { id: 'work_3' },
      { id: 'work_4' },
      { id: 'work_5' }
    ]
  },
  {
    name: 'Personal Life',
    questions: [
      { id: 'personal_1' },
      { id: 'personal_2' },
      { id: 'personal_3' },
      { id: 'personal_4' },
      { id: 'personal_5' }
    ]
  },
  {
    name: 'Financial Stress',
    questions: [
      { id: 'financial_1' },
      { id: 'financial_2' },
      { id: 'financial_3' },
      { id: 'financial_4' },
      { id: 'financial_5' }
    ]
  },
  {
    name: 'Health',
    questions: [
      { id: 'health_1' },
      { id: 'health_2' },
      { id: 'health_3' },
      { id: 'health_4' },
      { id: 'health_5' }
    ]
  },
  {
    name: 'Self-Worth & Identity',
    questions: [
      { id: 'identity_1' },
      { id: 'identity_2' },
      { id: 'identity_3' },
      { id: 'identity_4' },
      { id: 'identity_5' }
    ]
  }
];

// Mock wellness score calculation function (simplified version for testing)
function calculateWellnessScore(responses, stressAnalysis = {}) {
  // Get domain scores
  const domainScores = mockDomains.map((domain) => {
    const scores = domain.questions.map(q => {
      const ai = stressAnalysis[q.id];
      return ai && typeof ai.score === 'number' ? ai.score : (responses[q.id] ?? 0);
    });

    const nonZeroScores = scores.filter(score => score > 0);
    const hasStress = scores.some(score => score >= 4);
    
    if (!hasStress) {
      return {
        domain: domain.name,
        score: 0,
        hasStress: false
      };
    }
    
    const average = nonZeroScores.length > 0
      ? nonZeroScores.reduce((sum, score) => sum + score, 0) / nonZeroScores.length
      : 0;
    const stressScore = Math.round((average / 10) * 100);
    
    return {
      domain: domain.name,
      score: stressScore,
      hasStress: true
    };
  });

  // Separate domains with stress from those without
  const stressDomains = domainScores.filter(d => d.hasStress);
  const nonStressDomains = domainScores.filter(d => !d.hasStress);

  // Define critical domains
  const criticalDomains = ['Work & Career', 'Self-Worth & Identity'];
  
  // Calculate weighted average stress score from stress-affected domains only
  let weightedStressScore = 0;
  let totalWeight = 0;
  
  if (stressDomains.length > 0) {
    stressDomains.forEach(domain => {
      const weight = criticalDomains.includes(domain.domain) ? 1.5 : 1.0;
      weightedStressScore += domain.score * weight;
      totalWeight += weight;
    });
    
    weightedStressScore = weightedStressScore / totalWeight;
  }

  // Calculate wellness score
  let wellnessScore = 10 - (weightedStressScore / 10);
  
  // Apply minimum score logic for users with mostly non-stressed domains
  if (nonStressDomains.length >= 3) {
    const criticalDomainStress = stressDomains
      .filter(d => criticalDomains.includes(d.domain))
      .map(d => d.score);
    
    const hasCriticalStress = criticalDomainStress.some(score => score > 70);
    
    if (!hasCriticalStress) {
      wellnessScore = Math.max(wellnessScore, 5);
    }
  }

  // Ensure score is within valid range (1-10)
  wellnessScore = Math.max(1, Math.min(10, Math.round(wellnessScore)));
  
  return {
    wellnessScore,
    stressDomains: stressDomains.map(d => ({ domain: d.domain, score: d.score })),
    nonStressDomains: nonStressDomains.map(d => d.domain),
    weightedStressScore
  };
}

// Test cases
export async function testWellnessScoreCalculation() {
  console.log('🧪 Testing Wellness Score Calculation...\n');

  // Test Case 1: All domains with zero stress
  console.log('Test Case 1: All domains with zero stress');
  const responses1 = {
    'work_1': 0, 'work_2': 0, 'work_3': 0, 'work_4': 0, 'work_5': 0,
    'personal_1': 0, 'personal_2': 0, 'personal_3': 0, 'personal_4': 0, 'personal_5': 0,
    'financial_1': 0, 'financial_2': 0, 'financial_3': 0, 'financial_4': 0, 'financial_5': 0,
    'health_1': 0, 'health_2': 0, 'health_3': 0, 'health_4': 0, 'health_5': 0,
    'identity_1': 0, 'identity_2': 0, 'identity_3': 0, 'identity_4': 0, 'identity_5': 0
  };
  
  const result1 = calculateWellnessScore(responses1);
  console.log('Expected: High wellness score (8-10), no stress domains');
  console.log('Result:', result1);
  console.log('✅ Passed:', result1.wellnessScore >= 8 && result1.stressDomains.length === 0);
  console.log('');

  // Test Case 2: Most domains with zero stress, one domain with moderate stress
  console.log('Test Case 2: Most domains with zero stress, one domain with moderate stress');
  const responses2 = {
    'work_1': 0, 'work_2': 0, 'work_3': 0, 'work_4': 0, 'work_5': 0,
    'personal_1': 0, 'personal_2': 0, 'personal_3': 0, 'personal_4': 0, 'personal_5': 0,
    'financial_1': 0, 'financial_2': 0, 'financial_3': 0, 'financial_4': 0, 'financial_5': 0,
    'health_1': 0, 'health_2': 0, 'health_3': 0, 'health_4': 0, 'health_5': 0,
    'identity_1': 4, 'identity_2': 3, 'identity_3': 4, 'identity_4': 0, 'identity_5': 0
  };
  
  const result2 = calculateWellnessScore(responses2);
  console.log('Expected: Good wellness score (6-8), one stress domain (Self-Worth)');
  console.log('Result:', result2);
  console.log('✅ Passed:', result2.wellnessScore >= 6 && result2.stressDomains.length === 1);
  console.log('');

  // Test Case 3: Critical domain with high stress
  console.log('Test Case 3: Critical domain with high stress');
  const responses3 = {
    'work_1': 0, 'work_2': 0, 'work_3': 0, 'work_4': 0, 'work_5': 0,
    'personal_1': 0, 'personal_2': 0, 'personal_3': 0, 'personal_4': 0, 'personal_5': 0,
    'financial_1': 0, 'financial_2': 0, 'financial_3': 0, 'financial_4': 0, 'financial_5': 0,
    'health_1': 0, 'health_2': 0, 'health_3': 0, 'health_4': 0, 'health_5': 0,
    'identity_1': 8, 'identity_2': 9, 'identity_3': 8, 'identity_4': 7, 'identity_5': 8
  };
  
  const result3 = calculateWellnessScore(responses3);
  console.log('Expected: Lower wellness score due to critical domain stress');
  console.log('Result:', result3);
  console.log('✅ Passed:', result3.wellnessScore < 6 && result3.stressDomains.length === 1);
  console.log('');

  // Test Case 4: Multiple domains with stress, including critical domains
  console.log('Test Case 4: Multiple domains with stress, including critical domains');
  const responses4 = {
    'work_1': 6, 'work_2': 7, 'work_3': 5, 'work_4': 6, 'work_5': 5,
    'personal_1': 0, 'personal_2': 0, 'personal_3': 0, 'personal_4': 0, 'personal_5': 0,
    'financial_1': 4, 'financial_2': 5, 'financial_3': 4, 'financial_4': 3, 'financial_5': 4,
    'health_1': 0, 'health_2': 0, 'health_3': 0, 'health_4': 0, 'health_5': 0,
    'identity_1': 0, 'identity_2': 0, 'identity_3': 0, 'identity_4': 0, 'identity_5': 0
  };
  
  const result4 = calculateWellnessScore(responses4);
  console.log('Expected: Moderate wellness score, two stress domains (Work & Financial)');
  console.log('Result:', result4);
  console.log('✅ Passed:', result4.stressDomains.length === 2);
  console.log('');

  // Test Case 5: AI stress analysis data
  console.log('Test Case 5: AI stress analysis data');
  const responses5 = {
    'work_1': 0, 'work_2': 0, 'work_3': 0, 'work_4': 0, 'work_5': 0,
    'personal_1': 0, 'personal_2': 0, 'personal_3': 0, 'personal_4': 0, 'personal_5': 0,
    'financial_1': 0, 'financial_2': 0, 'financial_3': 0, 'financial_4': 0, 'financial_5': 0,
    'health_1': 0, 'health_2': 0, 'health_3': 0, 'health_4': 0, 'health_5': 0,
    'identity_1': 0, 'identity_2': 0, 'identity_3': 0, 'identity_4': 0, 'identity_5': 0
  };
  
  const stressAnalysis5 = {
    'work_1': { score: 7, emotion: 'Anxious', intensity: 'High' },
    'work_2': { score: 6, emotion: 'Frustrated', intensity: 'Moderate' }
  };
  
  const result5 = calculateWellnessScore(responses5, stressAnalysis5);
  console.log('Expected: Lower wellness score due to AI-detected stress');
  console.log('Result:', result5);
  console.log('✅ Passed:', result5.stressDomains.length > 0);
  console.log('');

  console.log('🎉 All wellness score calculation tests completed!');
}

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - make function available globally
  window.testWellnessScoreCalculation = testWellnessScoreCalculation;
} else {
  // Node.js environment - run tests
  testWellnessScoreCalculation();
} 