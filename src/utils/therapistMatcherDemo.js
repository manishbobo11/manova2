/**
 * Demo script to test the therapist matching functionality
 * Run this in the browser console or as a standalone test
 */

import { getTherapistSuggestions, getQuickTherapistRecommendation } from '../services/therapistMatcher.js';

// Demo user profiles for testing
const testUsers = [
  {
    name: "High Stress Work User",
    userStressDomain: "work",
    userPreferredLanguage: "English",
    userCurrentCheckinSummary: "User experiencing high stress levels (3/10) with work deadlines and feeling overwhelmed",
    currentWellness: { score: 3, mood: 'very stressed' }
  },
  {
    name: "Relationship Issues User",
    userStressDomain: "relationships",
    userPreferredLanguage: "Hindi",
    userCurrentCheckinSummary: "User dealing with family conflicts (5/10) and feeling emotionally drained",
    currentWellness: { score: 5, mood: 'stressed' }
  },
  {
    name: "Health Anxiety User",
    userStressDomain: "health",
    userPreferredLanguage: "English",
    userCurrentCheckinSummary: "User worried about chronic health condition (4/10) with high anxiety levels",
    currentWellness: { score: 4, mood: 'stressed' }
  },
  {
    name: "Well-functioning User",
    userStressDomain: "general",
    userPreferredLanguage: "Hinglish",
    userCurrentCheckinSummary: "User in good mental state (8/10) seeking preventive wellness support",
    currentWellness: { score: 8, mood: 'positive' }
  }
];

/**
 * Demo function to test therapist matching for all user types
 */
export async function runTherapistMatchingDemo() {
  console.log("🏥 Manova Therapist Matching Demo");
  console.log("=" .repeat(50));

  for (const user of testUsers) {
    console.log(`\n👤 Testing: ${user.name}`);
    console.log(`   Domain: ${user.userStressDomain}`);
    console.log(`   Language: ${user.userPreferredLanguage}`);
    console.log(`   Wellness: ${user.currentWellness.score}/10 (${user.currentWellness.mood})`);
    
    try {
      // Get quick recommendation
      const quickRec = getQuickTherapistRecommendation(
        user.currentWellness.score, 
        user.currentWellness.mood
      );
      console.log(`   🎯 Quick Rec: ${quickRec.urgency} - ${quickRec.message}`);
      
      // Get therapist matches
      const matches = await getTherapistSuggestions({
        userStressDomain: user.userStressDomain,
        userPreferredLanguage: user.userPreferredLanguage,
        userCurrentCheckinSummary: user.userCurrentCheckinSummary
      });
      
      console.log(`   ✅ Found ${matches.length} therapist matches:`);
      matches.forEach((therapist, index) => {
        console.log(`      ${index + 1}. ${therapist.name} (${therapist.matchScore}% match)`);
        console.log(`         Specialty: ${therapist.specialty}`);
        console.log(`         Reason: ${therapist.reason.substring(0, 80)}...`);
        console.log(`         Contact: ${therapist.email}`);
      });
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log("\n" + "=" .repeat(50));
  console.log("✨ Demo completed! Check the results above.");
}

/**
 * Test specific matching scenarios
 */
export function testSpecificScenarios() {
  console.log("\n🔬 Testing Specific Scenarios");
  console.log("=" .repeat(30));
  
  // Test different urgency levels
  const urgencyTests = [
    { score: 2, mood: 'very stressed', expected: 'high' },
    { score: 4, mood: 'stressed', expected: 'medium' },
    { score: 6, mood: 'moderate', expected: 'low' },
    { score: 9, mood: 'positive', expected: 'none' }
  ];
  
  urgencyTests.forEach(test => {
    const result = getQuickTherapistRecommendation(test.score, test.mood);
    const match = result.urgency === test.expected ? '✅' : '❌';
    console.log(`${match} Score ${test.score} (${test.mood}) -> ${result.urgency} urgency`);
  });
}

/**
 * Benchmark the matching performance
 */
export async function benchmarkMatching() {
  console.log("\n⚡ Performance Benchmark");
  console.log("=" .repeat(25));
  
  const iterations = 100;
  const startTime = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    await getTherapistSuggestions({
      userStressDomain: "work",
      userPreferredLanguage: "English",
      userCurrentCheckinSummary: "Test user for benchmarking"
    });
  }
  
  const endTime = performance.now();
  const avgTime = (endTime - startTime) / iterations;
  
  console.log(`📊 Processed ${iterations} matches in ${(endTime - startTime).toFixed(2)}ms`);
  console.log(`⚡ Average time per match: ${avgTime.toFixed(2)}ms`);
  console.log(avgTime < 50 ? '✅ Performance: Excellent' : 
              avgTime < 100 ? '✅ Performance: Good' : 
              '⚠️ Performance: Needs optimization');
}

// Export for use in console or other modules
export default {
  runTherapistMatchingDemo,
  testSpecificScenarios,
  benchmarkMatching,
  testUsers
};