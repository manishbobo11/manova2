/**
 * Test file to verify the loading state fix
 * Ensures insights are only rendered when all required data is ready
 */

// Test data structures
const validPersonalizedData = {
  insight: "I can see this is really affecting you, and that's completely understandable.",
  tryThis: [
    "Take a moment to breathe deeply",
    "Consider talking to someone you trust"
  ],
  stressFactors: [
    "Feeling overwhelmed",
    "Lack of control", 
    "Uncertainty"
  ],
  reflectionQuestion: "Remember, you're not alone in feeling this way. Many people struggle with similar concerns, and it's okay to ask for help when you need it."
};

const invalidPersonalizedData = {
  insight: "", // Empty insight
  tryThis: [], // Empty array
  stressFactors: ["Feeling overwhelmed"],
  reflectionQuestion: "" // Empty reflection question
};

const partialPersonalizedData = {
  insight: "I can see this is really affecting you.",
  tryThis: ["Take a moment to breathe deeply"],
  stressFactors: ["Feeling overwhelmed"],
  reflectionQuestion: "Remember, you're not alone." // Missing
};

// Test function to validate data readiness
function validateDataReadiness(personalizedData) {
  const questionData = personalizedData;
  return questionData && 
    questionData.insight && 
    questionData.insight.trim().length > 0 &&
    questionData.tryThis && 
    Array.isArray(questionData.tryThis) && 
    questionData.tryThis.length > 0 &&
    questionData.tryThis.every(item => item && item.trim().length > 0) &&
    questionData.reflectionQuestion &&
    questionData.reflectionQuestion.trim().length > 0;
}

// Test cases
function testValidData() {
  console.log('✅ Testing valid data...');
  const isValid = validateDataReadiness(validPersonalizedData);
  console.log('Valid data should be ready:', isValid);
  return isValid === true;
}

function testInvalidData() {
  console.log('❌ Testing invalid data...');
  const isValid = validateDataReadiness(invalidPersonalizedData);
  console.log('Invalid data should not be ready:', isValid);
  return isValid === false;
}

function testPartialData() {
  console.log('⚠️ Testing partial data...');
  const isValid = validateDataReadiness(partialPersonalizedData);
  console.log('Partial data should not be ready:', isValid);
  return isValid === false;
}

function testEmptyData() {
  console.log('🚫 Testing empty data...');
  const isValid = validateDataReadiness(null);
  console.log('Empty data should not be ready:', isValid);
  return isValid === false;
}

function testUndefinedData() {
  console.log('❓ Testing undefined data...');
  const isValid = validateDataReadiness(undefined);
  console.log('Undefined data should not be ready:', isValid);
  return isValid === false;
}

// Main test function
export async function testLoadingStateFix() {
  console.log('🧪 Testing Loading State Fix\n');
  
  const tests = [
    { name: 'Valid Data', test: testValidData },
    { name: 'Invalid Data', test: testInvalidData },
    { name: 'Partial Data', test: testPartialData },
    { name: 'Empty Data', test: testEmptyData },
    { name: 'Undefined Data', test: testUndefinedData }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const testCase of tests) {
    try {
      const result = testCase.test();
      if (result) {
        console.log(`✅ ${testCase.name}: PASSED\n`);
        passedTests++;
      } else {
        console.log(`❌ ${testCase.name}: FAILED\n`);
      }
    } catch (error) {
      console.log(`💥 ${testCase.name}: ERROR - ${error.message}\n`);
    }
  }

  console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! The loading state fix is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please review the implementation.');
  }

  return passedTests === totalTests;
}

// Example usage of the validation function (similar to what's used in components)
export function shouldRenderInsights(personalizedData, questionId) {
  const questionData = personalizedData[questionId];
  const isDataReady = validateDataReadiness(questionData);
  
  // Only render if data is completely ready, otherwise show nothing
  if (!isDataReady) {
    return false; // Don't show loading state or partial content
  }
  
  return true; // Safe to render the insights
}

// Test the shouldRenderInsights function
export function testShouldRenderInsights() {
  console.log('🧪 Testing shouldRenderInsights function\n');
  
  const testCases = [
    {
      name: 'Valid question data',
      personalizedData: { 'question1': validPersonalizedData },
      questionId: 'question1',
      expected: true
    },
    {
      name: 'Invalid question data',
      personalizedData: { 'question1': invalidPersonalizedData },
      questionId: 'question1',
      expected: false
    },
    {
      name: 'Missing question data',
      personalizedData: { 'question1': validPersonalizedData },
      questionId: 'question2',
      expected: false
    },
    {
      name: 'Empty personalized data',
      personalizedData: {},
      questionId: 'question1',
      expected: false
    }
  ];

  let passedTests = 0;
  let totalTests = testCases.length;

  for (const testCase of testCases) {
    try {
      const result = shouldRenderInsights(testCase.personalizedData, testCase.questionId);
      const passed = result === testCase.expected;
      
      if (passed) {
        console.log(`✅ ${testCase.name}: PASSED (expected ${testCase.expected}, got ${result})`);
        passedTests++;
      } else {
        console.log(`❌ ${testCase.name}: FAILED (expected ${testCase.expected}, got ${result})`);
      }
    } catch (error) {
      console.log(`💥 ${testCase.name}: ERROR - ${error.message}`);
    }
  }

  console.log(`\n📊 shouldRenderInsights Results: ${passedTests}/${totalTests} tests passed`);
  return passedTests === totalTests;
} 