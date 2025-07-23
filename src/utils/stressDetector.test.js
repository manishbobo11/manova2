/**
 * Stress Detector Test Suite
 * 
 * Tests the new stress detection functionality with consistent logic across domains
 */

import { isStressfulResponse, analyzeStressWithMCP, batchStressAnalysis } from './stressDetector.js';

/**
 * Test basic stress detection functionality
 */
export function testBasicStressDetection() {
  console.log('🧪 Testing Basic Stress Detection...\n');
  
  const testCases = [
    {
      response: "Very Often",
      question: "How often do you feel emotionally drained by your work?",
      domain: "Work & Career",
      expectedStressful: true,
      description: "High frequency response to emotional drain question"
    },
    {
      response: "Not at all",
      question: "How satisfied are you with your manager's support?",
      domain: "Work & Career", 
      expectedStressful: true,
      description: "Extreme negative response to support question"
    },
    {
      response: "Sometimes",
      question: "How often do you feel stressed?",
      domain: "Health",
      expectedStressful: false,
      description: "Moderate response to general stress question"
    },
    {
      response: "Rarely",
      question: "How often do you feel overwhelmed?",
      domain: "Personal Life",
      expectedStressful: false,
      description: "Low frequency response to overwhelm question"
    },
    {
      response: "I feel completely burned out and can't take it anymore",
      question: "How are you feeling about work lately?",
      domain: "Work & Career",
      expectedStressful: true,
      description: "Explicit burnout statement with red flags"
    }
  ];
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  testCases.forEach((testCase, index) => {
    const result = isStressfulResponse(testCase.response, testCase.question, testCase.domain);
    const passed = result.isStressful === testCase.expectedStressful;
    
    console.log(`Test ${index + 1}: ${testCase.description}`);
    console.log(`  Response: "${testCase.response}"`);
    console.log(`  Question: "${testCase.question}"`);
    console.log(`  Domain: ${testCase.domain}`);
    console.log(`  Expected Stressful: ${testCase.expectedStressful}`);
    console.log(`  Actual Stressful: ${result.isStressful}`);
    console.log(`  Sentiment Score: ${result.sentimentScore.toFixed(2)}`);
    console.log(`  Emotion: ${result.emotion}`);
    console.log(`  Intensity: ${result.intensity}`);
    console.log(`  Red Flags: ${result.redFlags.length > 0 ? result.redFlags.join(', ') : 'None'}`);
    console.log(`  Result: ${passed ? '✅ PASS' : '❌ FAIL'}\n`);
    
    if (passed) passedTests++;
  });
  
  console.log(`📊 Basic Stress Detection Results: ${passedTests}/${totalTests} tests passed\n`);
  return { passedTests, totalTests };
}

/**
 * Test MCP protocol integration
 */
export function testMCPProtocolIntegration() {
  console.log('🔍 Testing MCP Protocol Integration...\n');
  
  const testCases = [
    {
      response: "I'm completely overwhelmed and feel like I can't take it anymore",
      question: "How are you coping with work stress?",
      domain: "Work & Career",
      expectedProtocol: "Escalate",
      description: "High stress response with red flags"
    },
    {
      response: "Often",
      question: "How often do you feel anxious?",
      domain: "Health",
      expectedProtocol: "Monitor",
      description: "Moderate frequency response to anxiety question"
    },
    {
      response: "Rarely",
      question: "How often do you feel supported?",
      domain: "Personal Life",
      expectedProtocol: "Support",
      description: "Low frequency response to support question"
    },
    {
      response: "I feel hopeless and worthless, nothing helps",
      question: "How are you feeling about yourself?",
      domain: "Self-Worth & Identity",
      expectedProtocol: "Escalate",
      description: "Severe self-worth issues with red flags"
    }
  ];
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  testCases.forEach((testCase, index) => {
    const result = analyzeStressWithMCP(testCase.response, testCase.question, testCase.domain);
    const passed = result.mcp.protocol === testCase.expectedProtocol;
    
    console.log(`Test ${index + 1}: ${testCase.description}`);
    console.log(`  Response: "${testCase.response}"`);
    console.log(`  Expected Protocol: ${testCase.expectedProtocol}`);
    console.log(`  Actual Protocol: ${result.mcp.protocol}`);
    console.log(`  Urgency: ${result.mcp.urgency}`);
    console.log(`  Follow-up Needed: ${result.mcp.followUpNeeded}`);
    console.log(`  Recommended Actions: ${result.mcp.recommendedActions.length} actions`);
    console.log(`  Result: ${passed ? '✅ PASS' : '❌ FAIL'}\n`);
    
    if (passed) passedTests++;
  });
  
  console.log(`📊 MCP Protocol Results: ${passedTests}/${totalTests} tests passed\n`);
  return { passedTests, totalTests };
}

/**
 * Test domain-specific stress detection
 */
export function testDomainSpecificDetection() {
  console.log('🏢 Testing Domain-Specific Stress Detection...\n');
  
  const domains = [
    {
      name: "Work & Career",
      testCases: [
        { response: "Very Often", question: "How often do you feel overworked?", expectedStressful: true },
        { response: "Sometimes", question: "How satisfied are you with recognition?", expectedStressful: false },
        { response: "Not at all", question: "Do you feel supported by your manager?", expectedStressful: true }
      ]
    },
    {
      name: "Personal Life",
      testCases: [
        { response: "Often", question: "How often do you feel lonely?", expectedStressful: true },
        { response: "Rarely", question: "How satisfied are you with relationships?", expectedStressful: false },
        { response: "Sometimes", question: "How often do you engage in self-care?", expectedStressful: false }
      ]
    },
    {
      name: "Financial Stress",
      testCases: [
        { response: "Very Often", question: "How often do financial concerns worry you?", expectedStressful: true },
        { response: "Never", question: "How confident are you about financial security?", expectedStressful: false },
        { response: "Sometimes", question: "How often do you budget?", expectedStressful: false }
      ]
    },
    {
      name: "Health",
      testCases: [
        { response: "Poor", question: "How would you rate your sleep quality?", expectedStressful: true },
        { response: "Excellent", question: "How would you rate your energy levels?", expectedStressful: false },
        { response: "Fair", question: "How often do you exercise?", expectedStressful: false }
      ]
    },
    {
      name: "Self-Worth & Identity",
      testCases: [
        { response: "Often", question: "How often do you feel inadequate?", expectedStressful: true },
        { response: "Rarely", question: "How confident are you in your abilities?", expectedStressful: false },
        { response: "Sometimes", question: "How often do you compare yourself to others?", expectedStressful: false }
      ]
    }
  ];
  
  let totalPassed = 0;
  let totalTests = 0;
  
  domains.forEach(domain => {
    console.log(`📋 Testing ${domain.name}:`);
    let domainPassed = 0;
    
    domain.testCases.forEach((testCase, index) => {
      const result = isStressfulResponse(testCase.response, testCase.question, domain.name);
      const passed = result.isStressful === testCase.expectedStressful;
      
      console.log(`  Test ${index + 1}: "${testCase.response}" -> ${testCase.expectedStressful ? 'Stressful' : 'Not Stressful'}`);
      console.log(`    Result: ${result.isStressful ? 'Stressful' : 'Not Stressful'} (${passed ? '✅' : '❌'})`);
      console.log(`    Score: ${result.sentimentScore.toFixed(2)}, Emotion: ${result.emotion}, Intensity: ${result.intensity}`);
      
      if (passed) domainPassed++;
      totalTests++;
    });
    
    totalPassed += domainPassed;
    console.log(`  Domain Results: ${domainPassed}/${domain.testCases.length} passed\n`);
  });
  
  console.log(`📊 Domain-Specific Results: ${totalPassed}/${totalTests} tests passed\n`);
  return { passedTests: totalPassed, totalTests };
}

/**
 * Test batch stress analysis
 */
export function testBatchStressAnalysis() {
  console.log('📦 Testing Batch Stress Analysis...\n');
  
  const mockResponses = [
    {
      responseText: "Very Often",
      questionText: "How often do you feel emotionally drained?",
      domain: "Work & Career"
    },
    {
      responseText: "Sometimes",
      questionText: "How often do you feel supported?",
      domain: "Personal Life"
    },
    {
      responseText: "Rarely",
      questionText: "How often do you feel anxious?",
      domain: "Health"
    },
    {
      responseText: "Not at all",
      questionText: "How confident are you about finances?",
      domain: "Financial Stress"
    },
    {
      responseText: "Often",
      questionText: "How often do you feel inadequate?",
      domain: "Self-Worth & Identity"
    }
  ];
  
  const result = batchStressAnalysis(mockResponses);
  
  console.log('📊 Batch Analysis Results:');
  console.log(`  Total Responses: ${result.individualResults.length}`);
  console.log(`  High Stress Count: ${result.highStressCount}`);
  console.log(`  Average Sentiment Score: ${result.averageSentimentScore.toFixed(2)}`);
  console.log(`  Overall Stress Level: ${result.overallStressLevel}`);
  console.log(`  MCP Protocol: ${result.mcpProtocol}`);
  console.log(`  Domains Needing Attention: ${result.domainsNeedingAttention.join(', ')}`);
  
  console.log('\n📋 Individual Results:');
  result.individualResults.forEach((response, index) => {
    console.log(`  ${index + 1}. ${response.domain}: ${response.stressAnalysis.isStressful ? 'Stressful' : 'Not Stressful'} (${response.stressAnalysis.sentimentScore.toFixed(2)})`);
  });
  
  console.log('\n✅ Batch Analysis Test Complete\n');
  return result;
}

/**
 * Test emotion and intensity detection
 */
export function testEmotionIntensityDetection() {
  console.log('😊 Testing Emotion and Intensity Detection...\n');
  
  const testCases = [
    {
      response: "I feel completely overwhelmed and exhausted",
      question: "How are you feeling?",
      expectedEmotion: "overwhelmed",
      expectedIntensity: "high",
      description: "High intensity overwhelmed emotion"
    },
    {
      response: "Sometimes I feel a bit worried",
      question: "How often do you feel anxious?",
      expectedEmotion: "anxious",
      expectedIntensity: "moderate",
      description: "Moderate intensity anxious emotion"
    },
    {
      response: "Rarely do I feel stressed",
      question: "How often do you feel stressed?",
      expectedEmotion: "neutral",
      expectedIntensity: "low",
      description: "Low intensity neutral emotion"
    },
    {
      response: "I feel great and satisfied",
      question: "How are you feeling overall?",
      expectedEmotion: "positive",
      expectedIntensity: "low",
      description: "Positive emotion with low stress"
    }
  ];
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  testCases.forEach((testCase, index) => {
    const result = isStressfulResponse(testCase.response, testCase.question);
    const emotionPassed = result.emotion === testCase.expectedEmotion;
    const intensityPassed = result.intensity === testCase.expectedIntensity;
    const passed = emotionPassed && intensityPassed;
    
    console.log(`Test ${index + 1}: ${testCase.description}`);
    console.log(`  Response: "${testCase.response}"`);
    console.log(`  Expected Emotion: ${testCase.expectedEmotion}, Actual: ${result.emotion} (${emotionPassed ? '✅' : '❌'})`);
    console.log(`  Expected Intensity: ${testCase.expectedIntensity}, Actual: ${result.intensity} (${intensityPassed ? '✅' : '❌'})`);
    console.log(`  Overall Result: ${passed ? '✅ PASS' : '❌ FAIL'}\n`);
    
    if (passed) passedTests++;
  });
  
  console.log(`📊 Emotion/Intensity Results: ${passedTests}/${totalTests} tests passed\n`);
  return { passedTests, totalTests };
}

/**
 * Run all stress detector tests
 */
export async function runAllStressDetectorTests() {
  console.log('🚀 Running All Stress Detector Tests...\n');
  console.log('='.repeat(60) + '\n');
  
  const results = {
    basic: testBasicStressDetection(),
    mcp: testMCPProtocolIntegration(),
    domain: testDomainSpecificDetection(),
    emotion: testEmotionIntensityDetection(),
    batch: testBatchStressAnalysis()
  };
  
  console.log('='.repeat(60));
  console.log('📊 FINAL TEST RESULTS:');
  console.log('='.repeat(60));
  
  const totalPassed = results.basic.passedTests + results.mcp.passedTests + 
                     results.domain.passedTests + results.emotion.passedTests;
  const totalTests = results.basic.totalTests + results.mcp.totalTests + 
                    results.domain.totalTests + results.emotion.totalTests;
  
  console.log(`✅ Basic Stress Detection: ${results.basic.passedTests}/${results.basic.totalTests}`);
  console.log(`🔍 MCP Protocol Integration: ${results.mcp.passedTests}/${results.mcp.totalTests}`);
  console.log(`🏢 Domain-Specific Detection: ${results.domain.passedTests}/${results.domain.totalTests}`);
  console.log(`😊 Emotion/Intensity Detection: ${results.emotion.passedTests}/${results.emotion.totalTests}`);
  console.log(`📦 Batch Analysis: ✅ Complete`);
  
  console.log('\n' + '='.repeat(60));
  console.log(`🎯 OVERALL: ${totalPassed}/${totalTests} tests passed (${((totalPassed/totalTests)*100).toFixed(1)}%)`);
  console.log('='.repeat(60) + '\n');
  
  if (totalPassed === totalTests) {
    console.log('🎉 All stress detector tests passed! The utility is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please review the implementation.');
  }
  
  return {
    totalPassed,
    totalTests,
    successRate: (totalPassed/totalTests)*100,
    allPassed: totalPassed === totalTests
  };
}

/**
 * Performance test for stress detector
 */
export function testStressDetectorPerformance() {
  console.log('⚡ Testing Stress Detector Performance...\n');
  
  const testResponses = [
    "Very Often", "Sometimes", "Rarely", "Not at all", "Often",
    "I feel overwhelmed", "I'm doing okay", "I feel great", "I'm struggling",
    "I can't take it anymore", "I'm managing", "I feel supported", "I feel alone"
  ];
  
  const testQuestions = [
    "How often do you feel stressed?",
    "How are you coping?",
    "How do you feel about work?",
    "How satisfied are you?",
    "How often do you feel supported?"
  ];
  
  const domains = ["Work & Career", "Personal Life", "Financial Stress", "Health", "Self-Worth & Identity"];
  
  const iterations = 1000;
  const startTime = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    const response = testResponses[Math.floor(Math.random() * testResponses.length)];
    const question = testQuestions[Math.floor(Math.random() * testQuestions.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    
    isStressfulResponse(response, question, domain);
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  const averageTime = duration / iterations;
  
  console.log(`⚡ Performance Results:`);
  console.log(`  Total Iterations: ${iterations}`);
  console.log(`  Total Time: ${duration.toFixed(2)}ms`);
  console.log(`  Average Time per Analysis: ${averageTime.toFixed(4)}ms`);
  console.log(`  Operations per Second: ${(1000/averageTime).toFixed(0)}`);
  
  const isPerformant = averageTime < 1; // Should be under 1ms per analysis
  console.log(`  Performance: ${isPerformant ? '✅ Good' : '❌ Needs Optimization'}\n`);
  
  return {
    iterations,
    totalTime: duration,
    averageTime,
    opsPerSecond: 1000/averageTime,
    isPerformant
  };
}

export default {
  testBasicStressDetection,
  testMCPProtocolIntegration,
  testDomainSpecificDetection,
  testBatchStressAnalysis,
  testEmotionIntensityDetection,
  testStressDetectorPerformance,
  runAllStressDetectorTests
}; 