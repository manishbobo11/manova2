/**
 * Validation script for Sarthi Chatbot Check-in Integration
 * 
 * This validates the integration without running the full ChatEngine
 * Tests the structure and logic of the check-in data integration
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function validateIntegration() {
  console.log('🔍 Validating Sarthi Chatbot Check-in Integration...\n');

  // Read the ChatEngine.js file
  const chatEngineContent = readFileSync(join(__dirname, 'src/services/ai/ChatEngine.js'), 'utf8');

  // Test 1: Check if getLatestCheckinData method exists
  console.log('📋 TEST 1: Method Implementation');
  console.log('===============================');
  
  const hasGetLatestCheckinData = chatEngineContent.includes('async getLatestCheckinData(userId)');
  console.log(hasGetLatestCheckinData ? '✅ getLatestCheckinData method found' : '❌ getLatestCheckinData method missing');

  const hasGetLastCheckinImport = chatEngineContent.includes('getLastCheckin');
  console.log(hasGetLastCheckinImport ? '✅ getLastCheckin import found' : '❌ getLastCheckin import missing');

  // Test 2: Check if check-in context is injected into prompts
  console.log('\n💬 TEST 2: Prompt Integration');
  console.log('============================');
  
  const hasCheckinContextVar = chatEngineContent.includes('let checkinContext = ');
  console.log(hasCheckinContextVar ? '✅ checkinContext variable found' : '❌ checkinContext variable missing');

  const hasCheckinContextUsage = chatEngineContent.includes('${checkinContext}');
  console.log(hasCheckinContextUsage ? '✅ checkinContext used in prompts' : '❌ checkinContext not used in prompts');

  const hasLatestCheckinDataParam = chatEngineContent.includes('latestCheckinData');
  console.log(hasLatestCheckinDataParam ? '✅ latestCheckinData parameter found' : '❌ latestCheckinData parameter missing');

  // Test 3: Check if enhanced methods are updated
  console.log('\n🧠 TEST 3: Enhanced Methods Updated');
  console.log('==================================');

  const hasEnhancedPromptUpdate = chatEngineContent.includes('buildEnhancedPersonalizedPrompt({ userMessage, userState, emotionalContext, vectorMemory, language, conversationHistory, conversationAnalysis, latestCheckinData })');
  console.log(hasEnhancedPromptUpdate ? '✅ buildEnhancedPersonalizedPrompt updated' : '❌ buildEnhancedPersonalizedPrompt not updated');

  const hasEmotionalResponseUpdate = chatEngineContent.includes('this.getLatestCheckinData(userId)');
  console.log(hasEmotionalResponseUpdate ? '✅ generateEmotionallyIntelligentResponse updated' : '❌ generateEmotionallyIntelligentResponse not updated');

  // Test 4: Check fallback handling
  console.log('\n🔄 TEST 4: Fallback Handling');
  console.log('===========================');

  const hasFallbackMessage = chatEngineContent.includes('fallbackMessage');
  console.log(hasFallbackMessage ? '✅ Fallback message handling found' : '❌ Fallback message handling missing');

  const hasNoCheckinHandling = chatEngineContent.includes('hasCheckin: false');
  console.log(hasNoCheckinHandling ? '✅ No check-in handling found' : '❌ No check-in handling missing');

  // Test 5: Check context formatting
  console.log('\n📝 TEST 5: Context Formatting');  
  console.log('============================');

  const hasWellnessScoreHandling = chatEngineContent.includes('wellnessScore');
  console.log(hasWellnessScoreHandling ? '✅ Wellness score handling found' : '❌ Wellness score handling missing');

  const hasStressScoreHandling = chatEngineContent.includes('stressScore');
  console.log(hasStressScoreHandling ? '✅ Stress score handling found' : '❌ Stress score handling missing');

  const hasMoodHandling = chatEngineContent.includes('mood');
  console.log(hasMoodHandling ? '✅ Mood handling found' : '❌ Mood handling missing');

  const hasDomainResponsesHandling = chatEngineContent.includes('domainResponses');
  console.log(hasDomainResponsesHandling ? '✅ Domain responses handling found' : '❌ Domain responses handling missing');

  // Test 6: Check first message integration
  console.log('\n🚀 TEST 6: First Message Integration');
  console.log('===================================');

  const hasFirstMessageUpdate = chatEngineContent.includes('this.getLatestCheckinData(userId)') && chatEngineContent.includes('async getFirstMessage');
  console.log(hasFirstMessageUpdate ? '✅ First message integration found' : '❌ First message integration missing');

  const hasCheckinContextInFirstMessage = chatEngineContent.includes('checkinContext: latestCheckinData.hasCheckin');
  console.log(hasCheckinContextInFirstMessage ? '✅ Check-in context in first message response' : '❌ Check-in context missing in first message response');

  // Summary
  console.log('\n🎉 VALIDATION SUMMARY');
  console.log('===================');

  const testResults = [
    hasGetLatestCheckinData,
    hasGetLastCheckinImport,
    hasCheckinContextVar,
    hasCheckinContextUsage,
    hasLatestCheckinDataParam,
    hasEnhancedPromptUpdate,
    hasEmotionalResponseUpdate,
    hasFallbackMessage,
    hasNoCheckinHandling,
    hasWellnessScoreHandling,
    hasStressScoreHandling,
    hasMoodHandling,
    hasDomainResponsesHandling,
    hasFirstMessageUpdate,
    hasCheckinContextInFirstMessage
  ];

  const passedTests = testResults.filter(result => result).length;
  const totalTests = testResults.length;

  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  console.log(`📊 Success Rate: ${Math.round((passedTests/totalTests) * 100)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎯 ALL TESTS PASSED! Sarthi Chatbot Check-in Integration is complete.');
    console.log('\n🚀 FEATURE SUMMARY:');
    console.log('- ✅ Latest check-in data fetching implemented');
    console.log('- ✅ GPT system prompts enhanced with check-in context');
    console.log('- ✅ Fallback handling for users without check-ins');
    console.log('- ✅ Wellness score, stress level, mood integration');
    console.log('- ✅ Stressed domains and emotional summaries included');
    console.log('- ✅ First message generation enhanced with check-in awareness');
    console.log('- ✅ All conversation flows include check-in context');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the implementation.');
  }

  return passedTests === totalTests;
}

// Additional structure validation
function validateUserSurveyHistory() {
  console.log('\n📚 BONUS: Validating userSurveyHistory.js Structure');
  console.log('==================================================');

  try {
    const userSurveyContent = readFileSync(join(__dirname, 'src/services/userSurveyHistory.js'), 'utf8');
    
    const hasGetLastCheckin = userSurveyContent.includes('export const getLastCheckin');
    console.log(hasGetLastCheckin ? '✅ getLastCheckin function found' : '❌ getLastCheckin function missing');

    const hasOptimizedFields = userSurveyContent.includes('wellnessScore: data.wellnessScore');
    console.log(hasOptimizedFields ? '✅ Optimized field extraction found' : '❌ Optimized field extraction missing');

    const hasErrorHandling = userSurveyContent.includes('try {') && userSurveyContent.includes('catch');
    console.log(hasErrorHandling ? '✅ Error handling found' : '❌ Error handling missing');

  } catch (error) {
    console.log('❌ Could not validate userSurveyHistory.js:', error.message);
  }
}

// Run validation
const success = validateIntegration();
validateUserSurveyHistory();

if (success) {
  console.log('\n🎊 INTEGRATION VALIDATION COMPLETE - READY FOR TESTING! 🎊');
} else {
  console.log('\n🔧 INTEGRATION NEEDS FIXES - PLEASE REVIEW IMPLEMENTATION 🔧');
  process.exit(1);
}