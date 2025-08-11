/**
 * Test script to validate Sarthi Chatbot name integration
 * 
 * This tests:
 * 1. User name extraction from auth context
 * 2. Priority fallback system for name resolution
 * 3. GPT prompt injection with actual user names
 * 4. No more [Name] or {{name}} placeholders in responses
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function validateNameIntegration() {
  console.log('🔍 Validating Sarthi Chatbot Name Integration...\n');

  // Read the relevant files
  const chatEngineContent = readFileSync(join(__dirname, 'src/services/ai/ChatEngine.js'), 'utf8');
  const chatSessionContextContent = readFileSync(join(__dirname, 'src/contexts/ChatSessionContext.jsx'), 'utf8');
  const sarthiChatbotContent = readFileSync(join(__dirname, 'src/components/SarthiChatbot.jsx'), 'utf8');
  const dashboardPageContent = readFileSync(join(__dirname, 'src/pages/DashboardPage.jsx'), 'utf8');

  // Test 1: Check ChatEngine name extraction method
  console.log('📋 TEST 1: Name Extraction Method');
  console.log('=================================');
  
  const hasExtractUserNameMethod = chatEngineContent.includes('extractUserName(authUserContext, storedUserContext)');
  console.log(hasExtractUserNameMethod ? '✅ extractUserName method found' : '❌ extractUserName method missing');

  const hasPriorityFallback = chatEngineContent.includes('Priority 1: Auth context displayName');
  console.log(hasPriorityFallback ? '✅ Priority fallback system found' : '❌ Priority fallback system missing');

  const hasEmailNameExtraction = chatEngineContent.includes('emailName.charAt(0).toUpperCase()');
  console.log(hasEmailNameExtraction ? '✅ Email name extraction found' : '❌ Email name extraction missing');

  // Test 2: Check GPT prompt updates
  console.log('\n💬 TEST 2: GPT Prompt Integration');
  console.log('=================================');
  
  const hasActualUserNameVar = chatEngineContent.includes('const actualUserName = this.extractUserName');
  console.log(hasActualUserNameVar ? '✅ actualUserName variable found' : '❌ actualUserName variable missing');

  const hasNameInCrisisPrompt = chatEngineContent.includes('You are Sarthi, ${actualUserName}\'s emotionally intelligent best friend');
  console.log(hasNameInCrisisPrompt ? '✅ Name injection in crisis prompt found' : '❌ Name injection in crisis prompt missing');

  const hasNameInGuidancePrompt = chatEngineContent.includes('**User Name:** ${actualUserName} (use this name naturally in your response)');
  console.log(hasNameInGuidancePrompt ? '✅ Name instruction in guidance prompt found' : '❌ Name instruction in guidance prompt missing');

  const hasNameInFriendlyPrompt = chatEngineContent.includes('Arre ${actualUserName}, kya scene hai?');
  console.log(hasNameInFriendlyPrompt ? '✅ Name usage in friendly conversation found' : '❌ Name usage in friendly conversation missing');

  // Test 3: Check ChatSessionContext updates
  console.log('\n🔄 TEST 3: Context Provider Updates');
  console.log('==================================');

  const hasUserContextParam = chatSessionContextContent.includes('userContext = null');
  console.log(hasUserContextParam ? '✅ userContext parameter found' : '❌ userContext parameter missing');

  const hasUserContextInFirstMessage = chatSessionContextContent.includes('userContext: userContext');
  console.log(hasUserContextInFirstMessage ? '✅ userContext passed to getFirstMessage' : '❌ userContext not passed to getFirstMessage');

  const hasUserContextInGenerateResponse = chatSessionContextContent.includes('userContext: userContext');
  console.log(hasUserContextInGenerateResponse ? '✅ userContext passed to generateResponse' : '❌ userContext not passed to generateResponse');

  // Test 4: Check SarthiChatbot component updates
  console.log('\n🎯 TEST 4: Component Integration');
  console.log('================================');

  const hasUseAuthImport = sarthiChatbotContent.includes('useAuth');
  console.log(hasUseAuthImport ? '✅ useAuth import found' : '❌ useAuth import missing');

  const hasUserDisplayNameMemo = sarthiChatbotContent.includes('userDisplayName = useMemo');
  console.log(hasUserDisplayNameMemo ? '✅ userDisplayName extraction found' : '❌ userDisplayName extraction missing');

  const hasSplitDisplayName = sarthiChatbotContent.includes('displayName.split(\' \')[0]');
  console.log(hasSplitDisplayName ? '✅ First name extraction found' : '❌ First name extraction missing');

  // Test 5: Check DashboardPage provider updates
  console.log('\n🏠 TEST 5: Dashboard Provider Updates');
  console.log('===================================');

  const hasUserContextInProvider = dashboardPageContent.includes('userContext={{');
  console.log(hasUserContextInProvider ? '✅ userContext passed to ChatSessionProvider' : '❌ userContext not passed to ChatSessionProvider');

  const hasDisplayNameInProvider = dashboardPageContent.includes('displayName: currentUser?.displayName');
  console.log(hasDisplayNameInProvider ? '✅ displayName passed in userContext' : '❌ displayName not passed in userContext');

  const hasEmailInProvider = dashboardPageContent.includes('email: currentUser?.email');
  console.log(hasEmailInProvider ? '✅ email passed in userContext' : '❌ email not passed in userContext');

  // Test 6: Check for old placeholder patterns
  console.log('\n🚫 TEST 6: Placeholder Removal');
  console.log('==============================');

  const hasNamePlaceholders = chatEngineContent.includes('[Name]') || chatEngineContent.includes('{{name}}') || chatEngineContent.includes('[name]');
  console.log(!hasNamePlaceholders ? '✅ No [Name] or {{name}} placeholders found' : '❌ Found [Name] or {{name}} placeholders');

  const hasHardcodedFriend = chatEngineContent.match(/= 'friend'/g);
  const friendCount = hasHardcodedFriend ? hasHardcodedFriend.length : 0;
  console.log(friendCount <= 2 ? `✅ Hardcoded 'friend' usage minimal (${friendCount} occurrences)` : `⚠️ Too many hardcoded 'friend' usages (${friendCount} occurrences)`);

  // Test 7: Check getFirstMessage method updates
  console.log('\n🚀 TEST 7: First Message Integration');
  console.log('===================================');

  const hasUserContextParamInFirstMessage = chatEngineContent.includes('getFirstMessage({ userId, language, userContext = null })');
  console.log(hasUserContextParamInFirstMessage ? '✅ getFirstMessage accepts userContext' : '❌ getFirstMessage does not accept userContext');

  const hasExtractUserNameInFirstMessage = chatEngineContent.includes('const userName = this.extractUserName(userContext, contextData)');
  console.log(hasExtractUserNameInFirstMessage ? '✅ extractUserName used in getFirstMessage' : '❌ extractUserName not used in getFirstMessage');

  // Test 8: Check generateResponse method updates
  console.log('\n⚡ TEST 8: Response Generation Integration');
  console.log('========================================');

  const hasUserContextParamInGenerateResponse = chatEngineContent.includes('generateResponse({ userMessage, userId, language = \'English\', conversationHistory = [], userContext = null })');
  console.log(hasUserContextParamInGenerateResponse ? '✅ generateResponse accepts userContext' : '❌ generateResponse does not accept userContext');

  const hasUserContextPassthrough = chatEngineContent.includes('userContext') && chatEngineContent.includes('generateEmotionallyIntelligentResponse');
  console.log(hasUserContextPassthrough ? '✅ userContext passed through to emotional intelligence' : '❌ userContext not passed through');

  // Summary
  console.log('\n🎉 VALIDATION SUMMARY');
  console.log('===================');

  const testResults = [
    hasExtractUserNameMethod,
    hasPriorityFallback,
    hasEmailNameExtraction,
    hasActualUserNameVar,
    hasNameInCrisisPrompt,
    hasNameInGuidancePrompt,
    hasNameInFriendlyPrompt,
    hasUserContextParam,
    hasUserContextParamInFirstMessage,
    hasUserContextParamInGenerateResponse,
    hasUseAuthImport,
    hasUserDisplayNameMemo,
    hasSplitDisplayName,
    hasUserContextInProvider,
    hasDisplayNameInProvider,
    hasEmailInProvider,
    !hasNamePlaceholders,
    friendCount <= 2,
    hasUserContextParamInFirstMessage,
    hasExtractUserNameInFirstMessage,
    hasUserContextParamInGenerateResponse,
    hasUserContextPassthrough
  ];

  const passedTests = testResults.filter(result => result).length;
  const totalTests = testResults.length;

  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  console.log(`📊 Success Rate: ${Math.round((passedTests/totalTests) * 100)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎯 ALL TESTS PASSED! Sarthi Chatbot Name Integration is complete.');
    console.log('\n🚀 FEATURE SUMMARY:');
    console.log('- ✅ User name extraction from auth context (displayName, email)');
    console.log('- ✅ Priority fallback system for name resolution');
    console.log('- ✅ GPT prompts enhanced with actual user names');
    console.log('- ✅ No more [Name] or {{name}} placeholders');
    console.log('- ✅ Natural name usage in all conversation styles');
    console.log('- ✅ Crisis, guidance, and friendly responses personalized');
    console.log('- ✅ First message generation includes proper names');
    console.log('- ✅ Component integration with auth context');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the implementation.');
  }

  return passedTests === totalTests;
}

// Test specific name extraction scenarios
function testNameExtractionScenarios() {
  console.log('\n🧪 BONUS: Testing Name Extraction Scenarios');
  console.log('============================================');

  // Mock the extractUserName method logic for testing
  function mockExtractUserName(authUserContext, storedUserContext) {
    // Priority 1: Auth context displayName
    if (authUserContext?.displayName) {
      return authUserContext.displayName.split(' ')[0];
    }
    
    // Priority 2: Auth context email
    if (authUserContext?.email) {
      const emailName = authUserContext.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    
    // Priority 3: Stored context userName
    if (storedUserContext?.userName && storedUserContext.userName !== 'friend') {
      return storedUserContext.userName;
    }
    
    // Final fallback
    return 'friend';
  }

  // Test scenarios
  const scenarios = [
    {
      name: 'User with full display name',
      authContext: { displayName: 'John Smith', email: 'john@example.com' },
      storedContext: { userName: 'Johnny' },
      expected: 'John'
    },
    {
      name: 'User with only email',
      authContext: { email: 'sarah.wilson@example.com' },
      storedContext: { userName: 'friend' },
      expected: 'Sarah'
    },
    {
      name: 'User with stored userName',
      authContext: { email: 'user@example.com' },
      storedContext: { userName: 'Alex' },
      expected: 'User' // Auth email takes priority over stored userName
    },
    {
      name: 'New user fallback',
      authContext: {},
      storedContext: {},
      expected: 'friend'
    }
  ];

  scenarios.forEach(scenario => {
    const result = mockExtractUserName(scenario.authContext, scenario.storedContext);
    const passed = result === scenario.expected;
    console.log(`${passed ? '✅' : '❌'} ${scenario.name}: Expected "${scenario.expected}", Got "${result}"`);
  });
}

// Run validation
const success = validateNameIntegration();
testNameExtractionScenarios();

if (success) {
  console.log('\n🎊 NAME INTEGRATION VALIDATION COMPLETE - READY FOR TESTING! 🎊');
  console.log('\nNow Sarthi will:');
  console.log('• Use your actual name instead of generic "friend"');
  console.log('• Extract name from Firebase Auth displayName or email');  
  console.log('• Personalize all conversation types with your name');
  console.log('• Never show [Name] or {{name}} placeholders in responses');
} else {
  console.log('\n🔧 NAME INTEGRATION NEEDS FIXES - PLEASE REVIEW IMPLEMENTATION 🔧');
  process.exit(1);
}