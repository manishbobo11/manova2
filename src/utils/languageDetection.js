/**
 * Language Detection Utility for Sarthi
 * Detects English, Hindi, and Hinglish dynamically from user messages
 */

import { franc } from 'franc';

/**
 * Enhanced language detection with Hinglish support
 * @param {string} text - User message to analyze
 * @returns {string} - Detected language: 'English', 'Hindi', or 'Hinglish'
 */
export function detectMessageLanguage(text) {
  if (!text || text.trim().length === 0) {
    return 'English'; // Default fallback
  }

  const message = text.toLowerCase();
  
  // Define Hinglish markers (common Hindi words in Roman script)
  const hinglishMarkers = [
    'bhai', 'yaar', 'kya', 'hai', 'haal', 'mann', 'kar', 'nahi', 'mera', 'tera',
    'karu', 'batao', 'samajh', 'paisa', 'dimag', 'bas', 'khatam', 'arre', 'acha',
    'thik', 'chal', 'koi', 'matlab', 'sach', 'jhooth', 'pagal', 'dimaag',
    'pareshan', 'tension', 'gussa', 'khushi', 'dukh', 'pata', 'lagta', 'lagti',
    'dekh', 'sun', 'bol', 'keh', 'gaya', 'jaana', 'aana', 'hona', 'karna',
    'accha', 'bura', 'sahi', 'galat', 'theek', 'baat', 'bhi', 'toh', 'waise'
  ];

  // Define strong Hindi indicators (common Hindi phrases in Roman script)
  const strongHinglishPhrases = [
    'kya kar raha', 'kya kar rahe', 'kya scene', 'kaise ho', 'kya haal',
    'mann nahi', 'dimag phat', 'bas ho gaya', 'samajh nahi', 'pata nahi',
    'kya karu', 'kaise karu', 'batao na', 'arre yaar', 'bhai sahab'
  ];

  // Check for Devanagari script (pure Hindi)
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  
  // Use franc for basic language detection
  const francLangCode = franc(text, { minLength: 3 });
  
  // Count Hinglish markers in the text
  const hinglishCount = hinglishMarkers.filter(marker => 
    message.includes(marker)
  ).length;

  // Check for strong Hinglish phrases
  const hasStrongHinglishPhrase = strongHinglishPhrases.some(phrase => 
    message.includes(phrase)
  );

  // Enhanced detection logic
  if (hasDevanagari) {
    // If contains Devanagari script, it's likely Hindi (unless mixed with English)
    const englishWordCount = text.split(/\s+/).filter(word => 
      /^[a-zA-Z]+$/.test(word) && word.length > 2
    ).length;
    const totalWords = text.split(/\s+/).length;
    
    if (englishWordCount > totalWords * 0.3) {
      return 'Hinglish'; // Mixed script
    }
    return 'Hindi';
  }

  if (hasStrongHinglishPhrase || hinglishCount >= 2) {
    return 'Hinglish';
  }

  // Single Hinglish word in otherwise English text
  if (hinglishCount === 1 && text.split(/\s+/).length > 3) {
    return 'Hinglish';
  }

  // Use franc results with custom logic
  switch (francLangCode) {
    case 'hin':
      return 'Hindi';
    case 'eng':
      return hinglishCount > 0 ? 'Hinglish' : 'English';
    default:
      // For unidentified languages, use Hinglish markers as fallback
      return hinglishCount > 0 ? 'Hinglish' : 'English';
  }
}

/**
 * Get language instruction for GPT prompts
 * @param {string} detectedLanguage - Language detected from user message
 * @returns {string} - Instruction for GPT on how to respond
 */
export function getLanguageInstruction(detectedLanguage) {
  switch (detectedLanguage) {
    case 'Hindi':
      return 'LANGUAGE INSTRUCTION: Respond in Hindi (Devanagari script). Use natural, empathetic Hindi expressions.';
    
    case 'Hinglish':
      return 'LANGUAGE INSTRUCTION: Respond in Hinglish (Hindi-English mix in Roman script). Use the same mix of Hindi and English words as the user. Examples: "yaar", "bhai", "kya scene hai", "tension mat le", etc. Be natural and relatable.';
    
    case 'English':
    default:
      return 'LANGUAGE INSTRUCTION: Respond in English. Use clear, empathetic, and supportive language.';
  }
}

/**
 * Validate language consistency in conversation
 * @param {Array} conversationHistory - Previous messages in conversation
 * @param {string} currentLanguage - Currently detected language
 * @returns {Object} - Language preference and switching info
 */
export function analyzeLanguagePattern(conversationHistory, currentLanguage) {
  if (!conversationHistory || conversationHistory.length === 0) {
    return {
      preferredLanguage: currentLanguage,
      isLanguageSwitching: false,
      switchCount: 0,
      consistency: 'new_conversation'
    };
  }

  // Analyze last 5 user messages for language pattern
  const userMessages = conversationHistory
    .filter(msg => msg.type === 'user')
    .slice(-5)
    .map(msg => detectMessageLanguage(msg.content));

  const languageFrequency = userMessages.reduce((acc, lang) => {
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {});

  const mostFrequentLanguage = Object.keys(languageFrequency)
    .reduce((a, b) => languageFrequency[a] > languageFrequency[b] ? a : b);

  const isLanguageSwitching = userMessages.length > 1 && 
    userMessages[userMessages.length - 1] !== userMessages[userMessages.length - 2];

  const uniqueLanguages = [...new Set(userMessages)].length;
  
  return {
    preferredLanguage: mostFrequentLanguage || currentLanguage,
    isLanguageSwitching,
    switchCount: uniqueLanguages,
    consistency: uniqueLanguages === 1 ? 'consistent' : 'mixed',
    recentPattern: userMessages,
    currentSwitch: isLanguageSwitching ? 
      `${userMessages[userMessages.length - 2]} → ${currentLanguage}` : null
  };
}

/**
 * Create adaptive language prompt based on conversation context
 * @param {string} userMessage - Current user message
 * @param {Array} conversationHistory - Previous conversation
 * @returns {Object} - Language analysis and instruction
 */
export function getAdaptiveLanguageContext(userMessage, conversationHistory) {
  const detectedLanguage = detectMessageLanguage(userMessage);
  const languagePattern = analyzeLanguagePattern(conversationHistory, detectedLanguage);
  const languageInstruction = getLanguageInstruction(detectedLanguage);

  // Add special handling for language switching
  let adaptiveInstruction = languageInstruction;
  
  if (languagePattern.isLanguageSwitching) {
    adaptiveInstruction += `\n\nNOTE: User switched from ${languagePattern.currentSwitch}. Acknowledge the language switch naturally and respond in ${detectedLanguage}.`;
  }

  if (languagePattern.consistency === 'mixed' && languagePattern.switchCount > 2) {
    adaptiveInstruction += `\n\nCONVERSATION CONTEXT: User is comfortable mixing languages. Feel free to be flexible with language mixing if it feels natural.`;
  }

  return {
    detectedLanguage,
    languageInstruction: adaptiveInstruction,
    languagePattern,
    isLanguageSwitching: languagePattern.isLanguageSwitching,
    preferredLanguage: languagePattern.preferredLanguage
  };
}