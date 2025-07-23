/**
 * Enhanced Stress Analysis Test Suite
 * 
 * This file demonstrates the improved stress detection capabilities
 * with various test cases to validate the enhanced logic.
 */

import { 
  matchesStressKeyword, 
  analyzeAnswerSensitivity, 
  calculateStressScore, 
  detectEmotion, 
  detectIntensity,
  comprehensiveStressAnalysis,
  filterDeepDiveQuestions,
  analyzeDomainForReview,
  getDomainsNeedingReview
} from '../services/stressAnalysisLogic';

// Test cases for different scenarios
const testCases = [
  // High stress cases
  {
    name: "High Stress - Very Often",
    answer: "Very Often",
    question: "How often do you feel overwhelmed at work?",
    expectedScore: 10,
    expectedEmotion: "Stressed",
    expectedIntensity: "High"
  },
  {
    name: "High Stress - Always",
    answer: "Always",
    question: "Do you feel burned out?",
    expectedScore: 10,
    expectedEmotion: "Overwhelmed",
    expectedIntensity: "High"
  },
  
  // Moderate stress cases
  {
    name: "Moderate Stress - Sometimes with keywords",
    answer: "Sometimes I feel anxious and overwhelmed",
    question: "How do you feel about your workload?",
    expectedScore: 6,
    expectedEmotion: "Anxious",
    expectedIntensity: "Moderate"
  },
  {
    name: "Moderate Stress - Often",
    answer: "Often",
    question: "How frequently do you work overtime?",
    expectedScore: 8,
    expectedEmotion: "Stressed",
    expectedIntensity: "High"
  },
  
  // Low stress cases
  {
    name: "Low Stress - Never",
    answer: "Never",
    question: "Do you feel stressed about your job?",
    expectedScore: 2,
    expectedEmotion: "Calm",
    expectedIntensity: "Low"
  },
  {
    name: "Low Stress - Not at all",
    answer: "Not at all",
    question: "Are you worried about your finances?",
    expectedScore: 2,
    expectedEmotion: "Calm",
    expectedIntensity: "Low"
  },
  
  // Edge cases
  {
    name: "Edge Case - Sometimes without keywords",
    answer: "Sometimes",
    question: "How often do you exercise?",
    expectedScore: 2,
    expectedEmotion: "Neutral",
    expectedIntensity: "Low"
  },
  {
    name: "Edge Case - Rarely with stress keywords",
    answer: "Rarely, but when I do I feel completely drained",
    question: "How often do you feel tired?",
    expectedScore: 6,
    expectedEmotion: "Overwhelmed",
    expectedIntensity: "Moderate"
  }
];

// Context-specific test cases
const contextTestCases = [
  {
    name: "Work Context - Burnout",
    answer: "I feel burned out and exhausted",
    question: "How are you feeling about your work?",
    context: "work",
    expectedScore: 10,
    expectedEmotion: "Overwhelmed",
    expectedIntensity: "High"
  },
  {
    name: "Personal Context - Lonely",
    answer: "I feel lonely and disconnected",
    question: "How are your relationships?",
    context: "personal",
    expectedScore: 8,
    expectedEmotion: "Sad",
    expectedIntensity: "High"
  },
  {
    name: "Financial Context - Money stress",
    answer: "I'm worried about money and bills",
    question: "How are your finances?",
    context: "financial",
    expectedScore: 8,
    expectedEmotion: "Anxious",
    expectedIntensity: "High"
  }
];

// Test data
const testAnswers = [
  "Sometimes",
  "Often", 
  "Very Often",
  "Never",
  "Rarely",
  "Sometimes I feel overwhelmed",
  "I'm often stressed about work",
  "I never have time to relax",
  "Sometimes financial concerns worry me",
  "I'm sometimes anxious about relationships"
];

const testQuestions = [
  "How often do you feel stressed?",
  "How satisfied are you with your work?",
  "How often do financial concerns worry you?",
  "How connected do you feel to others?",
  "How often do you feel overwhelmed?"
];

// Test domain answers for "Sometimes" pattern detection
const testDomainAnswers = {
  "Work & Career": ["Sometimes", "Often", "Sometimes", "Rarely", "Sometimes"],
  "Personal Life": ["Never", "Rarely", "Sometimes", "Sometimes", "Often"],
  "Financial Stress": ["Sometimes", "Sometimes", "Rarely", "Never", "Sometimes"],
  "Health": ["Never", "Rarely", "Rarely", "Sometimes", "Never"],
  "Self-Worth & Identity": ["Sometimes", "Sometimes", "Sometimes", "Rarely", "Sometimes"]
};

/**
 * Run all tests
 */
export async function runEnhancedStressAnalysisTests() {
  console.log('🧪 Running Enhanced Stress Analysis Tests...\n');
  
  let passedTests = 0;
  let totalTests = 0;
  
  // Test basic functionality
  console.log('📋 Basic Functionality Tests:');
  testCases.forEach(testCase => {
    totalTests++;
    const result = comprehensiveStressAnalysis(testCase.answer, testCase.question);
    
    const scoreMatch = Math.abs(result.score - testCase.expectedScore) <= 2;
    const emotionMatch = result.emotion === testCase.expectedEmotion || 
                        (testCase.expectedEmotion === 'Stressed' && ['Stressed', 'Anxious', 'Overwhelmed'].includes(result.emotion));
    const intensityMatch = result.intensity === testCase.expectedIntensity;
    
    const passed = scoreMatch && emotionMatch && intensityMatch;
    if (passed) passedTests++;
    
    console.log(`  ${passed ? '✅' : '❌'} ${testCase.name}`);
    console.log(`    Expected: Score=${testCase.expectedScore}, Emotion=${testCase.expectedEmotion}, Intensity=${testCase.expectedIntensity}`);
    console.log(`    Got: Score=${result.score}, Emotion=${result.emotion}, Intensity=${result.intensity}`);
    console.log(`    Should Trigger: ${result.shouldTriggerDeepDive} (${result.confidence} confidence)`);
    console.log('');
  });
  
  // Test context-specific functionality
  console.log('📋 Context-Specific Tests:');
  contextTestCases.forEach(testCase => {
    totalTests++;
    const result = comprehensiveStressAnalysis(testCase.answer, testCase.question, testCase.context);
    
    const scoreMatch = Math.abs(result.score - testCase.expectedScore) <= 2;
    const emotionMatch = result.emotion === testCase.expectedEmotion || 
                        (testCase.expectedEmotion === 'Stressed' && ['Stressed', 'Anxious', 'Overwhelmed'].includes(result.emotion));
    const intensityMatch = result.intensity === testCase.expectedIntensity;
    
    const passed = scoreMatch && emotionMatch && intensityMatch;
    if (passed) passedTests++;
    
    console.log(`  ${passed ? '✅' : '❌'} ${testCase.name}`);
    console.log(`    Context: ${testCase.context}`);
    console.log(`    Expected: Score=${testCase.expectedScore}, Emotion=${testCase.expectedEmotion}, Intensity=${testCase.expectedIntensity}`);
    console.log(`    Got: Score=${result.score}, Emotion=${result.emotion}, Intensity=${result.intensity}`);
    console.log(`    Should Trigger: ${result.shouldTriggerDeepDive} (${result.confidence} confidence)`);
    console.log('');
  });
  
  // Test keyword matching
  console.log('📋 Keyword Matching Tests:');
  const keywordTests = [
    { text: "I feel burned out", expected: true },
    { text: "I'm doing great", expected: false },
    { text: "Sometimes I feel anxious", expected: true },
    { text: "Never felt better", expected: false },
    { text: "I'm overwhelmed with work", expected: true }
  ];
  
  keywordTests.forEach(test => {
    totalTests++;
    const result = matchesStressKeyword(test.text);
    const passed = result === test.expected;
    if (passed) passedTests++;
    
    console.log(`  ${passed ? '✅' : '❌'} "${test.text}" -> ${result} (expected: ${test.expected})`);
  });
  
  console.log('\n📊 Test Results:');
  console.log(`  Passed: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
  
  return {
    passed: passedTests,
    total: totalTests,
    percentage: Math.round(passedTests/totalTests*100)
  };
}

/**
 * Test the enhanced filtering logic
 */
export function testEnhancedFiltering() {
  console.log('\n🔍 Testing Enhanced Filtering Logic...\n');
  
  const mockQuestions = [
    {
      text: "How often do you feel overwhelmed at work?",
      selectedOption: "Very Often",
      answerLabel: "Very Often",
      domain: "Work & Career"
    },
    {
      text: "How satisfied are you with your relationships?",
      selectedOption: "Sometimes",
      answerLabel: "Sometimes I feel lonely",
      domain: "Personal Life"
    },
    {
      text: "How often do you exercise?",
      selectedOption: "Sometimes",
      answerLabel: "Sometimes",
      domain: "Health"
    },
    {
      text: "How confident do you feel about your finances?",
      selectedOption: "Not at all",
      answerLabel: "Not at all - I'm worried about money",
      domain: "Financial Stress"
    }
  ];
  
  console.log('📋 Work & Career Domain:');
  const workFiltered = filterDeepDiveQuestions(mockQuestions, "Work & Career");
  console.log(`  Questions: ${mockQuestions.length}, Filtered: ${workFiltered.length}`);
  workFiltered.forEach(q => {
    console.log(`  ✅ "${q.text}" -> "${q.answerLabel}"`);
  });
  
  console.log('\n📋 Personal Life Domain:');
  const personalFiltered = filterDeepDiveQuestions(mockQuestions, "Personal Life");
  console.log(`  Questions: ${mockQuestions.length}, Filtered: ${personalFiltered.length}`);
  personalFiltered.forEach(q => {
    console.log(`  ✅ "${q.text}" -> "${q.answerLabel}"`);
  });
  
  console.log('\n📋 Financial Stress Domain:');
  const financialFiltered = filterDeepDiveQuestions(mockQuestions, "Financial Stress");
  console.log(`  Questions: ${mockQuestions.length}, Filtered: ${financialFiltered.length}`);
  financialFiltered.forEach(q => {
    console.log(`  ✅ "${q.text}" -> "${q.answerLabel}"`);
  });
}

/**
 * Demonstrate the enhanced sensitivity improvements
 */
export function demonstrateEnhancedSensitivity() {
  console.log('\n🎯 Demonstrating Enhanced Sensitivity Improvements...\n');
  
  const sensitivityTests = [
    {
      name: "Traditional Logic (Would Miss)",
      answer: "Sometimes I feel anxious and overwhelmed",
      question: "How do you feel about your workload?",
      traditionalScore: 5, // Traditional logic might give this
      enhancedScore: 6,    // Enhanced logic should catch this
      explanation: "Enhanced logic detects 'anxious' and 'overwhelmed' keywords even with 'Sometimes'"
    },
    {
      name: "Context-Aware Detection",
      answer: "I feel disconnected from my team",
      question: "How do you feel about your work relationships?",
      traditionalScore: 4,
      enhancedScore: 7,
      explanation: "Enhanced logic recognizes 'disconnected' as a work-related stress indicator"
    },
    {
      name: "Emotional Nuance",
      answer: "Rarely, but when I do I feel completely drained",
      question: "How often do you feel tired?",
      traditionalScore: 3,
      enhancedScore: 6,
      explanation: "Enhanced logic catches emotional intensity even with 'Rarely' frequency"
    }
  ];
  
  sensitivityTests.forEach(test => {
    const result = comprehensiveStressAnalysis(test.answer, test.question);
    
    console.log(`📋 ${test.name}`);
    console.log(`  Question: "${test.question}"`);
    console.log(`  Answer: "${test.answer}"`);
    console.log(`  Traditional Score: ${test.traditionalScore}/10`);
    console.log(`  Enhanced Score: ${result.score}/10`);
    console.log(`  Enhanced Emotion: ${result.emotion}`);
    console.log(`  Enhanced Intensity: ${result.intensity}`);
    console.log(`  Should Trigger Deep Dive: ${result.shouldTriggerDeepDive}`);
    console.log(`  Confidence: ${result.confidence}`);
    console.log(`  Reason: ${result.reason}`);
    console.log(`  Explanation: ${test.explanation}`);
    console.log('');
  });
}

// Test the new domain review functionality
export function testDomainReviewFunctionality() {
  console.log('🏗️ Testing Domain Review Functionality...\n');

  // Test getDomainsNeedingReview
  const domainsNeedingReview = getDomainsNeedingReview(testDomainAnswers);
  
  console.log('📊 Domains Needing Review:', domainsNeedingReview);
  
  // Validate results
  const expectedDomains = ["Work & Career", "Personal Life", "Financial Stress", "Self-Worth & Identity"];
  const actualDomains = domainsNeedingReview.map(d => d.domain);
  
  expectedDomains.forEach(domain => {
    if (!actualDomains.includes(domain)) {
      throw new Error(`Expected ${domain} to need review`);
    }
  });
  
  if (actualDomains.includes("Health")) {
    throw new Error('Health domain should not need review (only 1 "Sometimes" answer)');
  }

  console.log('✅ Domain review functionality tests passed');
}

export async function testPersonalizedSupportGeneration() {
  console.log('🧠 Testing Personalized Support Generation...');
  
  // Mock data for testing
  const mockStressedQuestions = [
    {
      text: "How often do you feel emotionally drained by your work?",
      answerLabel: "Very Often",
      emotion: "overwhelmed",
      intensity: "High",
      aiAnalysis: { score: 8.5 }
    },
    {
      text: "To what extent do you feel your manager supports your challenges?",
      answerLabel: "Not at all",
      emotion: "frustrated",
      intensity: "High",
      aiAnalysis: { score: 7.2 }
    }
  ];
  
  const mockSelectedReasons = ["Lack of recognition", "Feeling undervalued"];
  const mockCustomReason = "I feel like my hard work goes unnoticed and I'm starting to lose motivation.";
  const mockDomainName = "Work & Career";
  
  try {
    // Import the function dynamically (since it's in a component)
    const { buildPersonalizedSupport } = await import('../components/DeepDiveFollowup.jsx');
    
    const supportMessage = await buildPersonalizedSupport(
      mockStressedQuestions,
      mockSelectedReasons,
      mockCustomReason,
      mockDomainName
    );
    
    console.log('✅ Personalized Support Generated:', supportMessage);
    console.log('📊 Message Length:', supportMessage.length, 'characters');
    console.log('🔍 Contains validation:', supportMessage.toLowerCase().includes('valid') || supportMessage.toLowerCase().includes('understand'));
    console.log('🔍 Contains action steps:', supportMessage.toLowerCase().includes('try') || supportMessage.toLowerCase().includes('consider'));
    
    return {
      success: true,
      message: supportMessage,
      length: supportMessage.length,
      hasValidation: supportMessage.toLowerCase().includes('valid') || supportMessage.toLowerCase().includes('understand'),
      hasActionSteps: supportMessage.toLowerCase().includes('try') || supportMessage.toLowerCase().includes('consider')
    };
    
  } catch (error) {
    console.error('❌ Error testing personalized support:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function testTherapistSupportWithReactSelect() {
  console.log('🧠 Testing Enhanced Therapist Support with React-Select...');
  
  // Mock data for testing
  const mockSelectedTags = ['feeling_overworked', 'fear_disappointing', 'perfectionism'];
  const mockCustomReason = "I feel like I'm constantly falling short and letting people down. I can't seem to meet my own high standards.";
  const mockEmotion = "frustration";
  const mockDomainName = "Work & Career";
  
  try {
    // Import the function dynamically (since it's in a component)
    const { buildTherapistSupport } = await import('../components/DeepDiveFollowup.jsx');
    
    const therapistSupport = await buildTherapistSupport(
      mockSelectedTags,
      mockCustomReason,
      mockEmotion,
      mockDomainName
    );
    
    console.log('✅ Enhanced Therapist Support Generated:', therapistSupport);
    console.log('📊 Support Message Length:', therapistSupport.supportMessage.length, 'characters');
    console.log('🔍 MCP Protocol:', therapistSupport.mcpProtocol);
    console.log('🔍 Selected Tags:', therapistSupport.selectedTags);
    console.log('🔍 Emotion:', therapistSupport.emotion);
    console.log('🔍 Contains validation:', therapistSupport.supportMessage.toLowerCase().includes('valid') || therapistSupport.supportMessage.toLowerCase().includes('understand'));
    console.log('🔍 Contains action steps:', therapistSupport.supportMessage.toLowerCase().includes('try') || therapistSupport.supportMessage.toLowerCase().includes('consider'));
    
    // Test MCP Protocol logic
    const expectedProtocol = mockSelectedTags.length >= 3 ? 'Escalate' : 
                           mockSelectedTags.length >= 2 ? 'Monitor' : 'Support';
    console.log('🔍 MCP Protocol Logic:', {
      selectedCount: mockSelectedTags.length,
      expectedProtocol,
      actualProtocol: therapistSupport.mcpProtocol,
      correct: therapistSupport.mcpProtocol === expectedProtocol
    });
    
    return {
      success: true,
      therapistSupport,
      messageLength: therapistSupport.supportMessage.length,
      mcpProtocol: therapistSupport.mcpProtocol,
      selectedTags: therapistSupport.selectedTags,
      emotion: therapistSupport.emotion,
      hasValidation: therapistSupport.supportMessage.toLowerCase().includes('valid') || therapistSupport.supportMessage.toLowerCase().includes('understand'),
      hasActionSteps: therapistSupport.supportMessage.toLowerCase().includes('try') || therapistSupport.supportMessage.toLowerCase().includes('consider'),
      mcpProtocolCorrect: therapistSupport.mcpProtocol === expectedProtocol
    };
    
  } catch (error) {
    console.error('❌ Error testing enhanced therapist support:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export function demonstrateReactSelectIntegration() {
  console.log('🎭 Demonstrating React-Select Integration...\n');
  
  const stressContributorOptions = [
    { value: 'feeling_overworked', label: 'Feeling overworked or stretched thin' },
    { value: 'unclear_expectations', label: 'Struggling with unclear expectations' },
    { value: 'not_appreciated', label: 'Not feeling appreciated or recognized' },
    { value: 'trouble_disconnecting', label: 'Trouble disconnecting after work' },
    { value: 'fear_disappointing', label: 'Fear of disappointing others' },
    { value: 'lack_of_support', label: 'Lack of support from colleagues or management' },
    { value: 'work_life_balance', label: 'Difficulty maintaining work-life balance' },
    { value: 'job_security', label: 'Concerns about job security or career growth' },
    { value: 'communication_issues', label: 'Communication challenges with team' },
    { value: 'technology_stress', label: 'Technology or system-related stress' },
    { value: 'meeting_overload', label: 'Too many meetings or interruptions' },
    { value: 'perfectionism', label: 'Perfectionism or high self-expectations' },
    { value: 'time_management', label: 'Time management difficulties' },
    { value: 'role_confusion', label: 'Unclear role or responsibilities' },
    { value: 'workplace_culture', label: 'Challenging workplace culture' }
  ];
  
  console.log('📋 Available Stress Contributor Options:');
  stressContributorOptions.forEach((option, index) => {
    console.log(`   ${index + 1}. ${option.label} (${option.value})`);
  });
  
  console.log('\n💡 React-Select Features:');
  console.log('   • Multi-select with up to 3 selections');
  console.log('   • Custom styling with blue theme');
  console.log('   • Placeholder text: "Choose stress contributors..."');
  console.log('   • Disabled options when 3 already selected');
  console.log('   • Real-time selection counter');
  
  console.log('\n🔍 MCP Protocol Logic:');
  console.log('   • 1 selection = Support (Green)');
  console.log('   • 2 selections = Monitor (Yellow)');
  console.log('   • 3 selections = Escalate (Red)');
  console.log('   • Intense keywords boost protocol level');
  
  console.log('\n🎯 Example User Journey:');
  console.log('   1. User selects "Feeling overworked" and "Fear of disappointing others"');
  console.log('   2. MCP Protocol: Monitor (2 selections + intense keywords)');
  console.log('   3. AI generates personalized therapist response');
  console.log('   4. Response includes validation + actionable steps');
}

export async function runAllEnhancedTests() {
  console.log('🚀 Running All Enhanced Stress Analysis Tests...\n');
  
  // Run existing tests
  await runEnhancedStressAnalysisTests();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Run new personalized support test
  await testPersonalizedSupportGeneration();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Run new therapist support test
  await testTherapistSupportWithReactSelect();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Run enhanced personalized prompt test
  await testEnhancedPersonalizedPrompt();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Demonstrate enhanced prompt structure
  demonstrateEnhancedPromptStructure();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Demonstrate react-select integration
  demonstrateReactSelectIntegration();
  console.log('\n' + '='.repeat(50) + '\n');
  
  console.log('✅ All Enhanced Tests Complete!');
}

export function demonstratePersonalizedSupport() {
  console.log('🎭 Demonstrating Personalized Support Examples...\n');
  
  const examples = [
    {
      domain: "Work & Career",
      context: {
        stressedQuestions: [
          { text: "How often do you feel emotionally drained?", answer: "Very Often", emotion: "overwhelmed" },
          { text: "Do you feel supported by your manager?", answer: "Not at all", emotion: "frustrated" }
        ],
        selectedReasons: ["Lack of recognition", "Feeling undervalued"],
        customReason: "I feel like my hard work goes unnoticed and I'm starting to lose motivation."
      }
    },
    {
      domain: "Personal Life", 
      context: {
        stressedQuestions: [
          { text: "How satisfied are you with your relationships?", answer: "A little", emotion: "lonely" },
          { text: "How often do you engage in restorative activities?", answer: "Rarely", emotion: "exhausted" }
        ],
        selectedReasons: ["Lack of connection", "No time for self-care"],
        customReason: "I feel isolated and don't have time to take care of myself."
      }
    },
    {
      domain: "Financial Stress",
      context: {
        stressedQuestions: [
          { text: "How often do financial concerns keep you awake?", answer: "Often", emotion: "anxious" },
          { text: "How confident do you feel about unexpected expenses?", answer: "Not at all", emotion: "worried" }
        ],
        selectedReasons: ["Living paycheck to paycheck", "No emergency savings"],
        customReason: "I'm constantly worried about money and feel like I'm one emergency away from disaster."
      }
    }
  ];
  
  examples.forEach((example, index) => {
    console.log(`📋 Example ${index + 1}: ${example.domain}`);
    console.log(`   High-stress responses: ${example.context.stressedQuestions.map(q => 
      `"${q.text}" - "${q.answer}" (${q.emotion})`
    ).join('; ')}`);
    console.log(`   Selected factors: ${example.context.selectedReasons.join(', ')}`);
    console.log(`   Additional thoughts: "${example.context.customReason}"`);
    console.log(`   Expected focus: ${getExpectedFocus(example.domain, example.context)}`);
    console.log('');
  });
  
  console.log('💡 The AI will generate unique, therapeutic responses for each context, focusing on:');
  console.log('   • Emotional validation specific to their situation');
  console.log('   • Actionable steps tailored to their exact circumstances');
  console.log('   • Self-compassion reminders relevant to their domain');
  console.log('   • Natural, conversational tone as if speaking directly to them');
}

function getExpectedFocus(domain, context) {
  switch (domain) {
    case "Work & Career":
      return "Workplace boundaries, communication with management, finding recognition";
    case "Personal Life":
      return "Building connections, self-care practices, setting boundaries";
    case "Financial Stress":
      return "Financial planning, stress management, seeking support";
    default:
      return "General stress management and self-compassion";
  }
}

export async function testEnhancedPersonalizedPrompt() {
  console.log('🧠 Testing Enhanced Personalized Prompt Structure...');
  
  // Mock data for testing the new prompt structure
  const mockHighStressQuestions = [
    {
      question: "How often do you feel emotionally drained by work?",
      answer: "Very Often",
      emotion: "overwhelmed",
      intensity: "high",
      stressScore: 8
    },
    {
      question: "How satisfied are you with your manager's support?",
      answer: "Not at all",
      emotion: "frustrated",
      intensity: "high", 
      stressScore: 9
    }
  ];
  
  const mockSelectedTags = ["Feeling overworked", "Lack of support from management"];
  const mockCustomReason = "I feel like I'm constantly giving 110% but never getting the recognition or support I need. It's exhausting.";
  const mockDomainName = "Work & Career";
  const mockEmotion = "overwhelmed";
  
  try {
    // Import the function dynamically (since it's in a component)
    const { buildTherapistSupport } = await import('../components/DeepDiveFollowup.jsx');
    
    const therapistSupport = await buildTherapistSupport(
      mockSelectedTags,
      mockCustomReason,
      mockEmotion,
      mockDomainName,
      mockHighStressQuestions
    );
    
    console.log('✅ Enhanced Personalized Prompt Test Results:');
    console.log('📊 Support Message Length:', therapistSupport.supportMessage.length, 'characters');
    console.log('🔍 Title:', therapistSupport.title);
    console.log('🔍 Validation:', therapistSupport.validation);
    console.log('🔍 Actionable Steps Count:', therapistSupport.actionableSteps?.length || 0);
    console.log('🔍 Self-Compassion:', therapistSupport.selfCompassion);
    console.log('🔍 MCP Protocol:', therapistSupport.mcpProtocol);
    console.log('🔍 Selected Tags:', therapistSupport.selectedTags);
    console.log('🔍 Emotion:', therapistSupport.emotion);
    
    // Test the structured output format
    const hasStructuredOutput = therapistSupport.title && 
                               therapistSupport.validation && 
                               therapistSupport.actionableSteps && 
                               therapistSupport.selfCompassion;
    
    console.log('🔍 Has Structured Output:', hasStructuredOutput);
    console.log('🔍 Contains validation keywords:', 
      therapistSupport.supportMessage.toLowerCase().includes('valid') || 
      therapistSupport.supportMessage.toLowerCase().includes('understand') ||
      therapistSupport.supportMessage.toLowerCase().includes('okay'));
    
    console.log('🔍 Contains action keywords:', 
      therapistSupport.supportMessage.toLowerCase().includes('try') || 
      therapistSupport.supportMessage.toLowerCase().includes('consider') ||
      therapistSupport.supportMessage.toLowerCase().includes('take'));
    
    // Test MCP Protocol logic with the new data
    const expectedProtocol = mockSelectedTags.length >= 3 ? 'Escalate' : 
                           mockSelectedTags.length >= 2 ? 'Monitor' : 'Support';
    
    console.log('🔍 MCP Protocol Logic:', {
      selectedCount: mockSelectedTags.length,
      expectedProtocol,
      actualProtocol: therapistSupport.mcpProtocol,
      correct: therapistSupport.mcpProtocol === expectedProtocol
    });
    
    return {
      success: true,
      therapistSupport,
      messageLength: therapistSupport.supportMessage.length,
      hasStructuredOutput,
      mcpProtocol: therapistSupport.mcpProtocol,
      selectedTags: therapistSupport.selectedTags,
      emotion: therapistSupport.emotion,
      hasValidation: therapistSupport.supportMessage.toLowerCase().includes('valid') || 
                    therapistSupport.supportMessage.toLowerCase().includes('understand') ||
                    therapistSupport.supportMessage.toLowerCase().includes('okay'),
      hasActionSteps: therapistSupport.supportMessage.toLowerCase().includes('try') || 
                     therapistSupport.supportMessage.toLowerCase().includes('consider') ||
                     therapistSupport.supportMessage.toLowerCase().includes('take'),
      mcpProtocolCorrect: therapistSupport.mcpProtocol === expectedProtocol
    };
    
  } catch (error) {
    console.error('❌ Error testing enhanced personalized prompt:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export function demonstrateEnhancedPromptStructure() {
  console.log('🎭 Demonstrating Enhanced Personalized Prompt Structure...\n');
  
  const examples = [
    {
      scenario: "High Work Stress with Multiple Contributors",
      context: {
        highStressQuestions: [
          { question: "How often do you feel emotionally drained?", answer: "Very Often", emotion: "overwhelmed", stressScore: 8 },
          { question: "Do you feel supported by your manager?", answer: "Not at all", emotion: "frustrated", stressScore: 9 }
        ],
        selectedTags: ["Feeling overworked", "Lack of support", "Perfectionism"],
        customReason: "I feel like I'm constantly giving 110% but never getting the recognition or support I need.",
        domain: "Work & Career",
        emotion: "overwhelmed"
      }
    },
    {
      scenario: "Personal Life Stress with Isolation",
      context: {
        highStressQuestions: [
          { question: "How satisfied are you with your relationships?", answer: "A little", emotion: "lonely", stressScore: 7 },
          { question: "How often do you engage in restorative activities?", answer: "Rarely", emotion: "exhausted", stressScore: 8 }
        ],
        selectedTags: ["Lack of connection", "No time for self-care"],
        customReason: "I feel isolated and don't have time to take care of myself or build meaningful relationships.",
        domain: "Personal Life",
        emotion: "lonely"
      }
    },
    {
      scenario: "Financial Stress with Anxiety",
      context: {
        highStressQuestions: [
          { question: "How often do financial concerns keep you awake?", answer: "Often", emotion: "anxious", stressScore: 8 },
          { question: "How confident do you feel about unexpected expenses?", answer: "Not at all", emotion: "worried", stressScore: 9 }
        ],
        selectedTags: ["Living paycheck to paycheck", "No emergency savings"],
        customReason: "I'm constantly worried about money and feel like I'm one emergency away from disaster.",
        domain: "Financial Stress",
        emotion: "anxious"
      }
    }
  ];
  
  examples.forEach((example, index) => {
    console.log(`📋 Example ${index + 1}: ${example.scenario}`);
    console.log(`   Domain: ${example.context.domain}`);
    console.log(`   High-stress responses: ${example.context.highStressQuestions.map(q => 
      `"${q.question}" - "${q.answer}" (${q.emotion}, score: ${q.stressScore})`
    ).join('; ')}`);
    console.log(`   Selected factors: ${example.context.selectedTags.join(', ')}`);
    console.log(`   Additional thoughts: "${example.context.customReason}"`);
    console.log(`   Primary emotion: ${example.context.emotion}`);
    console.log(`   Expected MCP Protocol: ${example.context.selectedTags.length >= 3 ? 'Escalate' : 
                                 example.context.selectedTags.length >= 2 ? 'Monitor' : 'Support'}`);
    console.log('');
  });
  
  console.log('💡 The Enhanced Personalized Prompt will generate:');
  console.log('   • Structured JSON output with title, message, validation, actionableSteps, and selfCompassion');
  console.log('   • Context-aware responses based on high-stress questions');
  console.log('   • Emotion-specific validation and coping strategies');
  console.log('   • Domain-appropriate action steps');
  console.log('   • Gentle self-compassion reminders');
  console.log('   • Accurate MCP protocol assignment based on stress intensity');
}

// Export for use in other test files
export default {
  runEnhancedStressAnalysisTests,
  testEnhancedFiltering,
  demonstrateEnhancedSensitivity
}; 