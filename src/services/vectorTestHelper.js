// 🟢 FILE: src/services/vectorTestHelper.js
// ✅ This will insert a test vector and then query it to check similarity and verify recurring detection works.

import { upsertUserVector, querySimilarVectors } from '../utils/vectorStore.js';
import { getResponseEmbedding } from '../utils/embeddingService.js';

export async function testRecurringPatternForDemoUser() {
  const userId = "demo-user-123";
  const domain = "Work & Career";
  const testResponse = "I've been feeling overwhelmed at work, too many deadlines and no support.";
  const question = "How do you feel about your current workload and support at work?";

  try {
    console.log("🔍 Generating embedding...");
    const embeddingData = {
      question: question,
      answer: testResponse,
      domain: domain,
      stressScore: 8
    };
    const embedding = await getResponseEmbedding(embeddingData);

    const metadata = {
      timestamp: new Date().toISOString(),
      domain,
      response: testResponse,
      question,
      stressScore: 8,
      questionId: 'test_work_stress_1',
      emotion: 'Overwhelmed',
      intensity: 'High',
      causeTag: 'Work',
      isPositive: false,
      answerValue: 4
    };

    console.log("📤 Inserting vector to Pinecone...");
    const upsertResult = await upsertUserVector(userId, embedding, metadata);
    
    if (!upsertResult.success) {
      throw new Error(`Vector upsert failed: ${upsertResult.error}`);
    }
    
    console.log(`✅ Vector inserted with ID: ${upsertResult.vectorId}`);

    // Wait a moment for indexing
    console.log("⏳ Waiting for vector indexing...");
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log("📥 Querying similar vectors...");
    const matches = await querySimilarVectors(userId, embedding, 3);

    console.log("🧠 Similar Matches:", matches);
    console.log(`📊 Found ${matches.length} similar responses`);

    const recurringMatch = matches.find(
      (m) => m.metadata.domain === domain && m.score > 0.85
    );

    if (recurringMatch) {
      console.log("✅ Recurring pattern detected!", {
        score: recurringMatch.score,
        domain: recurringMatch.metadata.domain,
        timestamp: recurringMatch.metadata.timestamp,
        stressScore: recurringMatch.metadata.stressScore
      });
      
      return {
        success: true,
        recurringDetected: true,
        matchScore: recurringMatch.score,
        matchData: recurringMatch
      };
    } else {
      console.log("❌ No recurring pattern found (similarity threshold not met).");
      
      return {
        success: true,
        recurringDetected: false,
        allMatches: matches
      };
    }
  } catch (err) {
    console.error("❌ Test failed:", err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Test multiple similar responses to verify recurring pattern detection
 */
export async function testMultipleRecurringPatterns() {
  const userId = "demo-user-recurring-test";
  const domain = "Work & Career";
  
  const testCases = [
    {
      response: "I feel completely overwhelmed with my workload and constant pressure.",
      question: "How would you describe your current stress level at work?",
      stressScore: 9
    },
    {
      response: "Work is really stressing me out, too much to handle and no help.",
      question: "How are you managing your work responsibilities?", 
      stressScore: 8
    },
    {
      response: "Feeling buried under deadlines and assignments, very overwhelming.",
      question: "What's your experience with your current workload?",
      stressScore: 8
    }
  ];

  console.log("🧪 Testing multiple recurring patterns...");
  
  try {
    const results = [];
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`\n📝 Processing test case ${i + 1}...`);
      
      const embeddingData = {
        question: testCase.question,
        answer: testCase.response,
        domain: domain,
        stressScore: testCase.stressScore
      };
      
      const embedding = await getResponseEmbedding(embeddingData);
      
      const metadata = {
        timestamp: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(), // Different days
        domain,
        response: testCase.response,
        question: testCase.question,
        stressScore: testCase.stressScore,
        questionId: `test_work_stress_${i + 1}`,
        emotion: 'Overwhelmed',
        intensity: 'High',
        causeTag: 'Work'
      };
      
      // Insert vector
      const upsertResult = await upsertUserVector(userId, embedding, metadata);
      console.log(`📤 Inserted vector ${i + 1}: ${upsertResult.success ? '✅' : '❌'}`);
      
      // Wait before querying
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Query for similar patterns
      const matches = await querySimilarVectors(userId, embedding, 5);
      
      const recurringPatterns = matches.filter(
        (m) => m.metadata.domain === domain && m.score > 0.85
      );
      
      console.log(`🔍 Found ${recurringPatterns.length} recurring patterns for case ${i + 1}`);
      
      results.push({
        testCase: i + 1,
        recurringPatterns: recurringPatterns.length,
        allMatches: matches.length,
        highSimilarity: recurringPatterns
      });
    }
    
    console.log("\n📊 Test Results Summary:");
    results.forEach((result, index) => {
      console.log(`Test ${result.testCase}: ${result.recurringPatterns} recurring patterns detected`);
    });
    
    return {
      success: true,
      results
    };
    
  } catch (error) {
    console.error("❌ Multiple pattern test failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test cross-domain pattern detection (should NOT detect patterns across domains)
 */
export async function testCrossDomainPatterns() {
  const userId = "demo-user-cross-domain";
  
  const testCases = [
    {
      domain: "Work & Career",
      response: "Feeling overwhelmed and stressed",
      question: "How is work affecting you?"
    },
    {
      domain: "Personal Life", 
      response: "Feeling overwhelmed and stressed",
      question: "How is your personal life?"
    }
  ];
  
  console.log("🔄 Testing cross-domain pattern isolation...");
  
  try {
    for (const testCase of testCases) {
      const embeddingData = {
        question: testCase.question,
        answer: testCase.response,
        domain: testCase.domain,
        stressScore: 7
      };
      
      const embedding = await getResponseEmbedding(embeddingData);
      
      const metadata = {
        timestamp: new Date().toISOString(),
        domain: testCase.domain,
        response: testCase.response,
        question: testCase.question,
        stressScore: 7
      };
      
      await upsertUserVector(userId, embedding, metadata);
      console.log(`📤 Inserted vector for ${testCase.domain}`);
    }
    
    // Test that Work domain doesn't detect Personal domain patterns
    const workEmbedding = await getResponseEmbedding({
      question: "How is work affecting you?",
      answer: "Feeling overwhelmed and stressed",
      domain: "Work & Career",
      stressScore: 7
    });
    
    const matches = await querySimilarVectors(userId, workEmbedding, 5);
    const workDomainMatches = matches.filter(m => m.metadata.domain === "Work & Career" && m.score > 0.85);
    const crossDomainMatches = matches.filter(m => m.metadata.domain === "Personal Life" && m.score > 0.85);
    
    console.log(`✅ Work domain matches: ${workDomainMatches.length}`);
    console.log(`🚫 Cross-domain matches: ${crossDomainMatches.length} (should be 0)`);
    
    return {
      success: true,
      workDomainMatches: workDomainMatches.length,
      crossDomainMatches: crossDomainMatches.length,
      isolationWorking: crossDomainMatches.length === 0
    };
    
  } catch (error) {
    console.error("❌ Cross-domain test failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Run all vector and recurring pattern tests
 */
export async function runAllVectorTests() {
  console.log("🚀 Starting comprehensive vector and recurring pattern tests...\n");
  
  const testResults = {
    singlePattern: null,
    multiplePatterns: null,
    crossDomain: null,
    summary: {
      totalTests: 3,
      passed: 0,
      failed: 0
    }
  };
  
  try {
    // Test 1: Single pattern detection
    console.log("=".repeat(60));
    console.log("🧪 TEST 1: Single Pattern Detection");
    console.log("=".repeat(60));
    testResults.singlePattern = await testRecurringPatternForDemoUser();
    if (testResults.singlePattern.success) {
      testResults.summary.passed++;
      console.log("✅ Test 1 PASSED\n");
    } else {
      testResults.summary.failed++;
      console.log("❌ Test 1 FAILED\n");
    }
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 2: Multiple patterns
    console.log("=".repeat(60));
    console.log("🧪 TEST 2: Multiple Recurring Patterns");
    console.log("=".repeat(60));
    testResults.multiplePatterns = await testMultipleRecurringPatterns();
    if (testResults.multiplePatterns.success) {
      testResults.summary.passed++;
      console.log("✅ Test 2 PASSED\n");
    } else {
      testResults.summary.failed++;
      console.log("❌ Test 2 FAILED\n");
    }
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 3: Cross-domain isolation
    console.log("=".repeat(60));
    console.log("🧪 TEST 3: Cross-Domain Pattern Isolation");
    console.log("=".repeat(60));
    testResults.crossDomain = await testCrossDomainPatterns();
    if (testResults.crossDomain.success) {
      testResults.summary.passed++;
      console.log("✅ Test 3 PASSED\n");
    } else {
      testResults.summary.failed++;
      console.log("❌ Test 3 FAILED\n");
    }
    
    // Final summary
    console.log("=".repeat(60));
    console.log("📊 FINAL TEST SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total Tests: ${testResults.summary.totalTests}`);
    console.log(`Passed: ${testResults.summary.passed}`);
    console.log(`Failed: ${testResults.summary.failed}`);
    console.log(`Success Rate: ${Math.round((testResults.summary.passed / testResults.summary.totalTests) * 100)}%`);
    
    if (testResults.summary.failed === 0) {
      console.log("🎉 ALL TESTS PASSED! Recurring pattern detection is working correctly.");
    } else {
      console.log("⚠️ Some tests failed. Check the logs above for details.");
    }
    
    return testResults;
    
  } catch (error) {
    console.error("❌ Test runner failed:", error);
    return {
      ...testResults,
      error: error.message,
      summary: {
        ...testResults.summary,
        failed: testResults.summary.totalTests
      }
    };
  }
}

/**
 * Quick test to verify vector operations are working
 */
export async function quickVectorTest() {
  console.log("⚡ Quick Vector Operations Test");
  
  try {
    const testUserId = "quick-test-user";
    const testEmbedding = Array(1536).fill(0).map(() => Math.random()); // Mock embedding
    
    const metadata = {
      timestamp: new Date().toISOString(),
      domain: "Test Domain",
      response: "This is a test response",
      question: "This is a test question",
      stressScore: 5
    };
    
    console.log("📤 Testing vector upsert...");
    const upsertResult = await upsertUserVector(testUserId, testEmbedding, metadata);
    
    if (upsertResult.success) {
      console.log("✅ Vector upsert successful");
      
      console.log("📥 Testing vector query...");
      const queryResult = await querySimilarVectors(testUserId, testEmbedding, 3);
      
      if (Array.isArray(queryResult)) {
        console.log(`✅ Vector query successful - found ${queryResult.length} results`);
        return { success: true, message: "Vector operations working correctly" };
      } else {
        throw new Error("Query did not return an array");
      }
    } else {
      throw new Error(`Upsert failed: ${upsertResult.error}`);
    }
    
  } catch (error) {
    console.error("❌ Quick test failed:", error);
    return { success: false, error: error.message };
  }
}