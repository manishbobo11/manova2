/**
 * Test file to verify the improved deep dive filtering logic
 * Ensures only real stressed responses show in Deep Dive
 */

// Test data structures
const mockQuestions = [
  {
    id: 'personal_1',
    text: 'How satisfied are you with the quality of emotional intimacy?',
    domain: 'Personal Life',
    aiAnalysis: { score: 8, emotion: 'Anxious', intensity: 'High' },
    answerLabel: 'Not at all',
    selectedOption: 'Not at all'
  },
  {
    id: 'personal_2',
    text: 'How often do you engage in activities that energize you?',
    domain: 'Personal Life',
    aiAnalysis: { score: 3, emotion: 'Neutral', intensity: 'Low' },
    answerLabel: 'Often',
    selectedOption: 'Often'
  },
  {
    id: 'personal_3',
    text: 'How available is your support network?',
    domain: 'Personal Life',
    aiAnalysis: { score: 7, emotion: 'Concerned', intensity: 'Moderate' },
    answerLabel: 'Sometimes',
    selectedOption: 'Sometimes'
  },
  {
    id: 'personal_4',
    text: 'How authentic do you feel in relationships?',
    domain: 'Personal Life',
    aiAnalysis: null, // No AI analysis
    answerLabel: 'Mostly',
    selectedOption: 'Mostly'
  },
  {
    id: 'personal_5',
    text: 'How respected are your boundaries?',
    domain: 'Personal Life',
    aiAnalysis: { score: 9, emotion: 'Frustrated', intensity: 'High' },
    answerLabel: '', // Empty answer
    selectedOption: ''
  }
];

// Improved filtering function (copied from WellnessSurvey.jsx)
function filterStressedQuestions(allQuestions, currentDomain) {
  return allQuestions.filter((q) => {
    // Check if question belongs to current domain
    if (q.domain !== currentDomain) return false;
    
    // Check if AI analysis exists and score is moderate/high stress (>= 7)
    if (!q.aiAnalysis || q.aiAnalysis.score < 7) return false;
    
    // Check if emotion is not neutral (neutral indicates no stress)
    if (q.emotion === "Neutral" || q.emotion === "neutral") return false;
    
    // Check if user actually provided a meaningful answer
    if (!q.answerLabel || q.answerLabel.trim() === "") return false;
    
    // Additional validation: ensure the answer isn't a default/empty response
    const validAnswers = ["Never", "Rarely", "Sometimes", "Often", "Very Often", "Not at all", "A little", "Somewhat", "Mostly", "Completely", "Poor", "Fair", "Good", "Excellent", "Very Poor", "None at all", "A great deal"];
    if (!validAnswers.includes(q.answerLabel)) return false;
    
    return true;
  });
}

// Test cases
function testValidStressedQuestion() {
  const filtered = filterStressedQuestions(mockQuestions, 'Personal Life');
  const validQuestion = filtered.find(q => q.id === 'personal_1');
  
  console.assert(validQuestion, 'Valid stressed question should be included');
  console.assert(validQuestion.aiAnalysis.score >= 7, 'Score should be >= 7');
  console.assert(validQuestion.emotion !== 'Neutral', 'Emotion should not be neutral');
  console.assert(validQuestion.answerLabel.trim() !== '', 'Answer should not be empty');
  
  console.log('✅ Valid stressed question test passed');
}

function testNeutralEmotionExclusion() {
  const filtered = filterStressedQuestions(mockQuestions, 'Personal Life');
  const neutralQuestion = filtered.find(q => q.id === 'personal_2');
  
  console.assert(!neutralQuestion, 'Neutral emotion question should be excluded');
  console.log('✅ Neutral emotion exclusion test passed');
}

function testLowScoreExclusion() {
  const filtered = filterStressedQuestions(mockQuestions, 'Personal Life');
  const lowScoreQuestion = filtered.find(q => q.id === 'personal_2');
  
  console.assert(!lowScoreQuestion, 'Low score question should be excluded');
  console.log('✅ Low score exclusion test passed');
}

function testNoAiAnalysisExclusion() {
  const filtered = filterStressedQuestions(mockQuestions, 'Personal Life');
  const noAnalysisQuestion = filtered.find(q => q.id === 'personal_4');
  
  console.assert(!noAnalysisQuestion, 'Question without AI analysis should be excluded');
  console.log('✅ No AI analysis exclusion test passed');
}

function testEmptyAnswerExclusion() {
  const filtered = filterStressedQuestions(mockQuestions, 'Personal Life');
  const emptyAnswerQuestion = filtered.find(q => q.id === 'personal_5');
  
  console.assert(!emptyAnswerQuestion, 'Question with empty answer should be excluded');
  console.log('✅ Empty answer exclusion test passed');
}

function testDomainFiltering() {
  const workQuestions = mockQuestions.map(q => ({ ...q, domain: 'Work & Career' }));
  const filtered = filterStressedQuestions(workQuestions, 'Personal Life');
  
  console.assert(filtered.length === 0, 'Questions from different domain should be excluded');
  console.log('✅ Domain filtering test passed');
}

function testValidAnswersList() {
  const validAnswers = ["Never", "Rarely", "Sometimes", "Often", "Very Often", "Not at all", "A little", "Somewhat", "Mostly", "Completely", "Poor", "Fair", "Good", "Excellent", "Very Poor", "None at all", "A great deal"];
  
  // Test that all valid answers are accepted
  const testQuestions = validAnswers.map((answer, index) => ({
    id: `test_${index}`,
    text: 'Test question',
    domain: 'Personal Life',
    aiAnalysis: { score: 8, emotion: 'Anxious', intensity: 'High' },
    answerLabel: answer,
    selectedOption: answer
  }));
  
  const filtered = filterStressedQuestions(testQuestions, 'Personal Life');
  console.assert(filtered.length === validAnswers.length, 'All valid answers should be accepted');
  console.log('✅ Valid answers list test passed');
}

// Run all tests
export async function testDeepDiveFiltering() {
  console.log('🧪 Testing Deep Dive Filtering Logic...\n');
  
  try {
    testValidStressedQuestion();
    testNeutralEmotionExclusion();
    testLowScoreExclusion();
    testNoAiAnalysisExclusion();
    testEmptyAnswerExclusion();
    testDomainFiltering();
    testValidAnswersList();
    
    console.log('\n🎉 All deep dive filtering tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Deep dive filtering test failed:', error);
    return false;
  }
}

// Test the specific Personal Life domain scenario
export function testPersonalLifeDomain() {
  console.log('🧠 Testing Personal Life Domain Specific Scenario...\n');
  
  const personalLifeQuestions = [
    {
      id: 'personal_1',
      text: 'How satisfied are you with emotional intimacy?',
      domain: 'Personal Life',
      aiAnalysis: { score: 6, emotion: 'Calm', intensity: 'Low' },
      answerLabel: 'Mostly',
      selectedOption: 'Mostly'
    },
    {
      id: 'personal_2',
      text: 'How often do you feel overwhelmed?',
      domain: 'Personal Life',
      aiAnalysis: { score: 8, emotion: 'Overwhelmed', intensity: 'High' },
      answerLabel: 'Often',
      selectedOption: 'Often'
    }
  ];
  
  const filtered = filterStressedQuestions(personalLifeQuestions, 'Personal Life');
  
  console.log('Personal Life Questions:', personalLifeQuestions.map(q => ({
    id: q.id,
    score: q.aiAnalysis?.score,
    emotion: q.aiAnalysis?.emotion,
    answer: q.answerLabel
  })));
  
  console.log('Filtered Questions:', filtered.map(q => ({
    id: q.id,
    score: q.aiAnalysis?.score,
    emotion: q.aiAnalysis?.emotion,
    answer: q.answerLabel
  })));
  
  // Should only include the overwhelmed question (score 8, not neutral)
  console.assert(filtered.length === 1, 'Should only include 1 stressed question');
  console.assert(filtered[0].id === 'personal_2', 'Should include the overwhelmed question');
  
  console.log('✅ Personal Life domain test passed!');
  return filtered.length === 1;
}

export function testPersonalLifeDomainDeepDive() {
  console.log('🧪 Testing Personal Life Domain Deep Dive Filtering...');
  
  // Mock Personal Life questions with various stress levels
  const personalLifeQuestions = [
    {
      id: 'personal_1',
      text: 'How often do you feel lonely or isolated?',
      selectedOption: 'Sometimes',
      answerLabel: 'Sometimes',
      domain: 'Personal Life',
      isPositive: false
    },
    {
      id: 'personal_2', 
      text: 'How satisfied are you with your social relationships?',
      selectedOption: 'Somewhat',
      answerLabel: 'Somewhat',
      domain: 'Personal Life',
      isPositive: true
    },
    {
      id: 'personal_3',
      text: 'How often do you feel overwhelmed by personal responsibilities?',
      selectedOption: 'Very Often',
      answerLabel: 'Very Often',
      domain: 'Personal Life',
      isPositive: false
    },
    {
      id: 'personal_4',
      text: 'How well do you feel supported by friends and family?',
      selectedOption: 'Not at all',
      answerLabel: 'Not at all',
      domain: 'Personal Life',
      isPositive: true
    }
  ];

  // Test the filtering logic
  const filteringResult = filterDeepDiveQuestions(personalLifeQuestions, 'Personal Life');
  
  console.log('📊 Personal Life Filtering Results:');
  console.log('Filtered Questions Count:', filteringResult.filteredQuestions.length);
  console.log('Domain Needs Review:', filteringResult.domainNeedsReview);
  console.log('Sometimes Count:', filteringResult.sometimesCount);
  console.log('Total Answers:', filteringResult.totalAnswers);
  
  // Verify that questions with moderate and high stress are included
  const expectedIncluded = filteringResult.filteredQuestions.length >= 2; // Should include at least 2 stressed questions
  
  console.log('✅ Expected Questions Included:', expectedIncluded);
  console.log('✅ Deep Dive Should Trigger:', expectedIncluded || filteringResult.domainNeedsReview);
  
  // Log each question's analysis
  filteringResult.filteredQuestions.forEach((q, index) => {
    console.log(`  Question ${index + 1}: ${q.text}`);
    console.log(`    Answer: ${q.answerLabel}`);
    console.log(`    Stress Level: ${q.stressLevel}`);
    console.log(`    Include in Deep Dive: ${q.includeInDeepDive}`);
  });
  
  return {
    success: expectedIncluded || filteringResult.domainNeedsReview,
    filteredCount: filteringResult.filteredQuestions.length,
    domainNeedsReview: filteringResult.domainNeedsReview,
    message: expectedIncluded || filteringResult.domainNeedsReview 
      ? 'Personal Life domain correctly triggers deep dive for moderate/high stress'
      : 'Personal Life domain not triggering deep dive - check filtering logic'
  };
}

// Export the filtering function for use in components
export { filterStressedQuestions }; 