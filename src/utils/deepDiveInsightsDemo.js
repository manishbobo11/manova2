/**
 * Demonstration of Deep Dive Insights functionality
 * Shows how AI-generated insights are stored and displayed per domain
 */

// Mock data to demonstrate the functionality
const mockDeepDiveSummaries = {
  "Work & Career": {
    summary: "I can see how challenging your work situation has been. The stress you're experiencing is completely valid, especially given the pressure you're under. You've been dealing with overwhelming workload and feeling undervalued, which can take a real toll on your wellbeing.",
    actionableSteps: [
      "Set clear boundaries around your work hours - try to stick to a specific end time",
      "Schedule regular 10-minute breaks throughout your day for mental refreshment",
      "Have an honest conversation with your manager about workload expectations",
      "Practice stress-reduction techniques like deep breathing during high-pressure moments"
    ],
    reflectionQuestions: [
      "What would it feel like to prioritize your wellbeing at work without guilt?",
      "If you could change one thing about your work environment, what would make the biggest difference?",
      "What support do you need that you're not currently getting from your workplace?"
    ],
    selfCompassion: "Remember, you're doing the best you can in a challenging situation. It's okay to need support and to take care of yourself. Your worth isn't defined by how much you can handle.",
    timestamp: "2024-01-15T10:30:00.000Z",
    domain: "Work & Career",
    reasons: ["overwhelming workload", "lack of recognition", "poor work-life balance"]
  },
  "Self-Worth & Identity": {
    summary: "Your responses suggest you're experiencing some self-doubt and questioning your worth. This is incredibly common and something many people struggle with. You mentioned feeling like an impostor and comparing yourself to others, which can be really exhausting.",
    actionableSteps: [
      "Practice daily self-affirmations - write down 3 things you did well each day",
      "Keep a journal of your accomplishments, no matter how small they seem",
      "Surround yourself with supportive people who remind you of your strengths",
      "Challenge negative self-talk by asking 'What evidence do I have for this thought?'"
    ],
    reflectionQuestions: [
      "What would you tell a friend who was feeling this way about themselves?",
      "What evidence do you have that contradicts these negative thoughts about yourself?",
      "What would it feel like to be kinder to yourself in moments of self-doubt?"
    ],
    selfCompassion: "You are worthy of love, respect, and happiness just as you are. Your struggles don't define your worth, and it's okay to not have everything figured out. You're growing and learning, and that's beautiful.",
    timestamp: "2024-01-15T11:15:00.000Z",
    domain: "Self-Worth & Identity",
    reasons: ["imposter syndrome", "comparison to others", "lack of self-compassion"]
  }
};

// Mock domain scores showing which domains have insights
const mockDomainScores = [
  { domain: "Work & Career", score: 75, hasStress: true },
  { domain: "Personal Life", score: 0, hasStress: false },
  { domain: "Financial Stress", score: 0, hasStress: false },
  { domain: "Health", score: 0, hasStress: false },
  { domain: "Self-Worth & Identity", score: 65, hasStress: true }
];

export async function demonstrateDeepDiveInsights() {
  console.log('🎯 Deep Dive Insights Demo\n');
  console.log('This demo shows how AI-generated insights are stored and displayed per domain.\n');

  // Scenario 1: Show which domains have insights
  console.log('📊 Scenario 1: Domains with AI Insights');
  console.log('Based on the survey responses, these domains have deep dive insights:\n');
  
  mockDomainScores.forEach(domainScore => {
    const hasInsights = !!mockDeepDiveSummaries[domainScore.domain];
    const icon = hasInsights ? '🧠' : '⚪';
    console.log(`${icon} ${domainScore.domain}: ${domainScore.score}% stress ${hasInsights ? '(Has AI Insights)' : '(No insights)'}`);
  });
  console.log('');

  // Scenario 2: Show insight content for Work & Career
  console.log('📊 Scenario 2: Work & Career Insights');
  const workInsights = mockDeepDiveSummaries["Work & Career"];
  console.log('Summary:', workInsights.summary);
  console.log('\nActionable Steps:');
  workInsights.actionableSteps.forEach((step, index) => {
    console.log(`  ${index + 1}. ${step}`);
  });
  console.log('\nReflection Questions:');
  workInsights.reflectionQuestions.forEach((question, index) => {
    console.log(`  ${index + 1}. "${question}"`);
  });
  console.log('\nSelf-Compassion Reminder:', workInsights.selfCompassion);
  console.log('');

  // Scenario 3: Show insight content for Self-Worth & Identity
  console.log('📊 Scenario 3: Self-Worth & Identity Insights');
  const identityInsights = mockDeepDiveSummaries["Self-Worth & Identity"];
  console.log('Summary:', identityInsights.summary);
  console.log('\nActionable Steps:');
  identityInsights.actionableSteps.forEach((step, index) => {
    console.log(`  ${index + 1}. ${step}`);
  });
  console.log('\nReflection Questions:');
  identityInsights.reflectionQuestions.forEach((question, index) => {
    console.log(`  ${index + 1}. "${question}"`);
  });
  console.log('\nSelf-Compassion Reminder:', identityInsights.selfCompassion);
  console.log('');

  // Scenario 4: User Experience Flow
  console.log('📊 Scenario 4: User Experience Flow');
  console.log('1. User completes survey and identifies high-stress domains');
  console.log('2. For domains with stress >= 70%, deep dive follow-up is triggered');
  console.log('3. User provides additional context and receives AI-generated insights');
  console.log('4. Insights are saved and displayed on the final wellness score screen');
  console.log('5. User can click "View AI Insights" to revisit personalized advice');
  console.log('6. Modal displays comprehensive AI suggestions for ongoing support');
  console.log('');

  // Scenario 5: Benefits of Persistent Insights
  console.log('📊 Scenario 5: Benefits of Persistent Insights');
  console.log('✅ No Regeneration: Insights are reused, saving API calls and time');
  console.log('✅ Consistent Advice: Same personalized guidance across sessions');
  console.log('✅ Actionable Content: Users can revisit and act on suggestions');
  console.log('✅ Progress Tracking: Insights provide baseline for improvement');
  console.log('✅ Accessibility: Easy access to AI advice when needed most');
  console.log('');

  // Scenario 6: Technical Implementation
  console.log('📊 Scenario 6: Technical Implementation');
  console.log('Data Structure:');
  console.log('- Insights stored in deepDiveSummaries state object');
  console.log('- Keyed by domain name for easy lookup');
  console.log('- Includes summary, actionable steps, reflection questions, and self-compassion');
  console.log('- Timestamped for tracking when insights were generated');
  console.log('- Reasons field captures what triggered the deep dive');
  console.log('');

  console.log('🎉 Demo completed! The deep dive insights provide ongoing value to users.');
  console.log('Users can now revisit AI-generated advice whenever they need support.');
}

// Example of how the WellnessSummary component would use this data
export function demonstrateWellnessSummaryIntegration() {
  console.log('🔧 WellnessSummary Integration Example\n');
  
  // Simulate the hasInsights check
  const domainsWithInsights = mockDomainScores.filter(domainScore => {
    const insight = mockDeepDiveSummaries[domainScore.domain];
    return insight && (
      insight.summary || 
      insight.actionableSteps?.length > 0 ||
      insight.reflectionQuestions?.length > 0
    );
  });

  console.log('Domains that would show "View AI Insights" button:');
  domainsWithInsights.forEach(domainScore => {
    console.log(`✅ ${domainScore.domain} (${domainScore.score}% stress)`);
  });
  console.log('');

  console.log('Modal would display:');
  domainsWithInsights.forEach(domainScore => {
    const insight = mockDeepDiveSummaries[domainScore.domain];
    console.log(`${domainScore.domain}:`);
    console.log(`  - Summary: ${insight.summary.substring(0, 100)}...`);
    console.log(`  - Actionable Steps: ${insight.actionableSteps.length} items`);
    console.log(`  - Reflection Questions: ${insight.reflectionQuestions.length} items`);
    console.log(`  - Self-Compassion: Available`);
    console.log('');
  });
}

// Run demo if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - make functions available globally
  window.demonstrateDeepDiveInsights = demonstrateDeepDiveInsights;
  window.demonstrateWellnessSummaryIntegration = demonstrateWellnessSummaryIntegration;
} else {
  // Node.js environment - run demo
  demonstrateDeepDiveInsights();
  console.log('\n' + '='.repeat(50) + '\n');
  demonstrateWellnessSummaryIntegration();
} 