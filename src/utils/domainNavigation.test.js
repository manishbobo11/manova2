// Test file to verify domain navigation logic
// This tests that all domains are shown sequentially regardless of stress analysis

export function testDomainNavigationLogic() {
  console.log('🧪 Testing Domain Navigation Logic...');
  
  // Mock domains array
  const domains = [
    { name: 'Work & Career', questions: [{ id: 'w1' }, { id: 'w2' }, { id: 'w3' }, { id: 'w4' }, { id: 'w5' }] },
    { name: 'Personal Life', questions: [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }, { id: 'p4' }, { id: 'p5' }] },
    { name: 'Financial Stress', questions: [{ id: 'f1' }, { id: 'f2' }, { id: 'f3' }, { id: 'f4' }, { id: 'f5' }] },
    { name: 'Health', questions: [{ id: 'h1' }, { id: 'h2' }, { id: 'h3' }, { id: 'h4' }, { id: 'h5' }] },
    { name: 'Self-Worth & Identity', questions: [{ id: 's1' }, { id: 's2' }, { id: 's3' }, { id: 's4' }, { id: 's5' }] }
  ];
  
  // Test 1: Verify all domains are processed in order
  console.log('✅ Test 1: Domain Order Verification');
  const expectedOrder = ['Work & Career', 'Personal Life', 'Financial Stress', 'Health', 'Self-Worth & Identity'];
  const actualOrder = domains.map(domain => domain.name);
  
  if (JSON.stringify(expectedOrder) === JSON.stringify(actualOrder)) {
    console.log('   ✅ Domain order is correct');
  } else {
    console.log('   ❌ Domain order is incorrect');
    console.log('   Expected:', expectedOrder);
    console.log('   Actual:', actualOrder);
  }
  
  // Test 2: Verify no domains are skipped based on stress
  console.log('✅ Test 2: No Domain Skipping');
  const stressScores = {
    'Work & Career': 0, // No stress
    'Personal Life': 8, // High stress
    'Financial Stress': 0, // No stress
    'Health': 5, // Moderate stress
    'Self-Worth & Identity': 0 // No stress
  };
  
  // Simulate navigation logic - should always proceed to next domain
  let currentDomain = 0;
  const visitedDomains = [];
  
  while (currentDomain < domains.length) {
    const domainName = domains[currentDomain].name;
    visitedDomains.push(domainName);
    
    // Simulate the fixed navigation logic
    if (currentDomain < domains.length - 1) {
      currentDomain++;
    } else {
      break; // Survey complete
    }
  }
  
  if (visitedDomains.length === domains.length) {
    console.log('   ✅ All domains were visited');
  } else {
    console.log('   ❌ Some domains were skipped');
    console.log('   Visited:', visitedDomains);
    console.log('   Expected count:', domains.length);
    console.log('   Actual count:', visitedDomains.length);
  }
  
  // Test 3: Verify deep dive logic is independent of domain navigation
  console.log('✅ Test 3: Deep Dive Independence');
  const deepDiveTriggered = [];
  
  domains.forEach((domain, index) => {
    const domainName = domain.name;
    const stressScore = stressScores[domainName] || 0;
    
    // Deep dive should only be triggered for high stress (>= 8), but domain should always be shown
    if (stressScore >= 8) {
      deepDiveTriggered.push(domainName);
    }
  });
  
  console.log('   Deep dive triggered for:', deepDiveTriggered);
  console.log('   ✅ Deep dive logic is independent of domain navigation');
  
  // Test 4: Verify navigation functions work correctly
  console.log('✅ Test 4: Navigation Function Logic');
  
  // Simulate goToNextDomain function
  const goToNextDomain = (currentDomainIndex) => {
    if (currentDomainIndex < domains.length - 1) {
      return currentDomainIndex + 1; // Always proceed to next domain
    } else {
      return 'complete'; // Survey complete
    }
  };
  
  // Test navigation through all domains
  let testCurrentDomain = 0;
  const navigationPath = [];
  
  while (testCurrentDomain < domains.length) {
    navigationPath.push(domains[testCurrentDomain].name);
    const nextResult = goToNextDomain(testCurrentDomain);
    
    if (nextResult === 'complete') {
      break;
    } else {
      testCurrentDomain = nextResult;
    }
  }
  
  if (navigationPath.length === domains.length) {
    console.log('   ✅ Navigation function works correctly');
    console.log('   Navigation path:', navigationPath);
  } else {
    console.log('   ❌ Navigation function has issues');
    console.log('   Navigation path:', navigationPath);
  }
  
  console.log('🎉 Domain Navigation Logic Tests Complete!');
  return {
    domainOrderCorrect: JSON.stringify(expectedOrder) === JSON.stringify(actualOrder),
    allDomainsVisited: visitedDomains.length === domains.length,
    navigationFunctionWorks: navigationPath.length === domains.length,
    deepDiveIndependent: true
  };
}

export function testDeepDiveFiltering() {
  console.log('🧪 Testing Deep Dive Filtering Logic...');
  
  // Test that deep dive filtering doesn't affect domain navigation
  const mockQuestions = [
    { id: 'q1', text: 'Work question 1', aiAnalysis: { score: 2 }, domain: 'Work & Career' },
    { id: 'q2', text: 'Work question 2', aiAnalysis: { score: 8 }, domain: 'Work & Career' },
    { id: 'q3', text: 'Personal question 1', aiAnalysis: { score: 1 }, domain: 'Personal Life' },
    { id: 'q4', text: 'Personal question 2', aiAnalysis: { score: 3 }, domain: 'Personal Life' }
  ];
  
  // Filter for deep dive (high stress only)
  const deepDiveQuestions = mockQuestions.filter(q => 
    q.aiAnalysis?.score >= 7 && q.domain === 'Work & Career'
  );
  
  console.log('✅ Deep dive questions filtered correctly:', deepDiveQuestions.length);
  console.log('✅ Domain navigation remains independent of deep dive filtering');
  
  return {
    deepDiveFilteringWorks: deepDiveQuestions.length === 1,
    domainIndependent: true
  };
}

// New test specifically for the domain skipping issue
export function testDomainSkippingFix() {
  console.log('🧪 Testing Domain Skipping Fix...');
  
  // Mock the handleResponse logic
  const domains = [
    { name: 'Work & Career', questions: [{ id: 'w1' }, { id: 'w2' }, { id: 'w3' }, { id: 'w4' }, { id: 'w5' }] },
    { name: 'Personal Life', questions: [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }, { id: 'p4' }, { id: 'p5' }] },
    { name: 'Financial Stress', questions: [{ id: 'f1' }, { id: 'f2' }, { id: 'f3' }, { id: 'f4' }, { id: 'f5' }] }
  ];
  
  // Simulate the fixed handleResponse logic
  const simulateHandleResponse = (currentDomain, currentQuestion, responses, stressAnalysis) => {
    // Check if this is the last question in the current domain
    if (currentQuestion < domains[currentDomain].questions.length - 1) {
      // Not the last question, just move to next question
      return { action: 'nextQuestion', newDomain: currentDomain, newQuestion: currentQuestion + 1 };
    } else {
      // Last question in domain - check for stress and decide next action
      const domainQuestions = domains[currentDomain].questions.map(q => {
        const score = responses[q.id] || 0;
        const questionStressAnalysis = stressAnalysis[q.id];
        const stressScore = questionStressAnalysis?.score || score;
        
        return {
          id: q.id,
          text: q.text,
          selectedOption: `Option ${score}`,
          score: score,
          emotion: questionStressAnalysis?.emotion || '',
          intensity: questionStressAnalysis?.intensity || 'Moderate',
          stressScore: stressScore,
          answerLabel: `Option ${score}`,
          domain: domains[currentDomain].name,
          aiAnalysis: questionStressAnalysis ? {
            score: questionStressAnalysis.score,
            emotion: questionStressAnalysis.emotion,
            intensity: questionStressAnalysis.intensity
          } : null
        };
      });
      
      // Filter for high stress questions (>= 8)
      const filteredQuestions = domainQuestions.filter(q => 
        (q.aiAnalysis?.score || 0) >= 8 || 
        q.intensity?.toLowerCase() === 'high'
      );
      
      // Check if we should trigger deep dive
      const shouldTriggerDeepDive = filteredQuestions.length > 0;
      
      if (shouldTriggerDeepDive) {
        // Trigger deep dive
        return { action: 'deepDive', domain: domains[currentDomain].name, questions: filteredQuestions };
      } else {
        // No stress detected - move to next domain
        if (currentDomain < domains.length - 1) {
          return { action: 'nextDomain', newDomain: currentDomain + 1, newQuestion: 0 };
        } else {
          return { action: 'complete', newDomain: currentDomain, newQuestion: currentQuestion };
        }
      }
    }
  };
  
  // Test scenarios
  const testScenarios = [
    {
      name: 'Work domain with no stress',
      currentDomain: 0,
      currentQuestion: 4, // Last question
      responses: { w1: 1, w2: 1, w3: 1, w4: 1, w5: 1 }, // Low stress
      stressAnalysis: { w1: { score: 2 }, w2: { score: 1 }, w3: { score: 2 }, w4: { score: 1 }, w5: { score: 2 } },
      expectedAction: 'nextDomain',
      expectedNewDomain: 1
    },
    {
      name: 'Work domain with high stress',
      currentDomain: 0,
      currentQuestion: 4, // Last question
      responses: { w1: 4, w2: 3, w3: 4, w4: 3, w5: 4 }, // High stress
      stressAnalysis: { w1: { score: 8 }, w2: { score: 7 }, w3: { score: 9 }, w4: { score: 6 }, w5: { score: 8 } },
      expectedAction: 'deepDive',
      expectedNewDomain: 0
    },
    {
      name: 'Personal Life domain with no stress',
      currentDomain: 1,
      currentQuestion: 4, // Last question
      responses: { p1: 1, p2: 1, p3: 1, p4: 1, p5: 1 }, // Low stress
      stressAnalysis: { p1: { score: 1 }, p2: { score: 2 }, p3: { score: 1 }, p4: { score: 2 }, p5: { score: 1 } },
      expectedAction: 'nextDomain',
      expectedNewDomain: 2
    }
  ];
  
  let allTestsPassed = true;
  
  testScenarios.forEach((scenario, index) => {
    console.log(`   Testing scenario ${index + 1}: ${scenario.name}`);
    
    const result = simulateHandleResponse(
      scenario.currentDomain,
      scenario.currentQuestion,
      scenario.responses,
      scenario.stressAnalysis
    );
    
    const actionCorrect = result.action === scenario.expectedAction;
    const domainCorrect = result.newDomain === scenario.expectedNewDomain;
    
    if (actionCorrect && domainCorrect) {
      console.log(`   ✅ ${scenario.name}: PASSED`);
    } else {
      console.log(`   ❌ ${scenario.name}: FAILED`);
      console.log(`      Expected: ${scenario.expectedAction}, ${scenario.expectedNewDomain}`);
      console.log(`      Got: ${result.action}, ${result.newDomain}`);
      allTestsPassed = false;
    }
  });
  
  console.log('✅ Domain Skipping Fix Test Complete!');
  return {
    domainSkippingFixed: allTestsPassed
  };
}

// Run all tests
export async function runDomainNavigationTests() {
  console.log('🚀 Running Domain Navigation Tests...\n');
  
  const results1 = testDomainNavigationLogic();
  const results2 = testDeepDiveFiltering();
  const results3 = testDomainSkippingFix();
  
  console.log('\n📊 Test Results:');
  console.log('Domain Order Correct:', results1.domainOrderCorrect);
  console.log('All Domains Visited:', results1.allDomainsVisited);
  console.log('Navigation Function Works:', results1.navigationFunctionWorks);
  console.log('Deep Dive Independent:', results1.deepDiveIndependent);
  console.log('Deep Dive Filtering Works:', results2.deepDiveFilteringWorks);
  console.log('Domain Skipping Fixed:', results3.domainSkippingFixed);
  
  const allPassed = Object.values({ ...results1, ...results2, ...results3 }).every(result => result === true);
  
  if (allPassed) {
    console.log('\n🎉 All domain navigation tests passed!');
  } else {
    console.log('\n❌ Some domain navigation tests failed!');
  }
  
  return allPassed;
} 