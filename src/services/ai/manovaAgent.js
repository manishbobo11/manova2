// Frontend-safe environment check
const isNode = typeof process !== 'undefined' && process.env;
const isBrowser = typeof window !== 'undefined';

// Import necessary services for context aggregation
import { getCheckinHistory } from '../userSurveyHistory.js';
import { ContextStore } from '../firebase.js';
import { querySimilarVectors } from '../../utils/vectorStore.js';
import { createUltimatePersonalizedSarthiPrompt } from './ultimatePersonalizedSarthiPrompt.js';

// 🧠 Context Aggregation Functions for Sarthi
/**
 * Aggregates complete user context for personalized Sarthi responses
 */
export const aggregateUserContext = async (userId) => {
  console.log(`🎯 Aggregating context for user ${userId}`);
  
  try {
    // Get user profile and context
    const userContext = await ContextStore.getUserContext(userId) || {};
    
    // Extract user first name
    const userFirstName = userContext.firstName || 
                         userContext.name?.split(' ')[0] || 
                         userContext.displayName?.split(' ')[0] || 
                         null;
    
    // Get language preference
    const languagePreference = userContext.languagePreference || 
                              localStorage.getItem(`manova_language_${userId}`) || 
                              'Hinglish';
    
    // Get recent check-in history
    const { checkins } = await getCheckinHistory(userId);
    
    let stressDomain = 'General';
    let stressLevel = 'Low';
    let emotionalContext = null;
    
    if (checkins && checkins.length > 0) {
      // Get latest stress domain from most recent check-in
      const latestCheckin = checkins[0];
      stressDomain = latestCheckin.domain || 'General';
      
      // Calculate stress level from recent check-ins (last 3)
      const recentCheckins = checkins.slice(0, 3);
      const avgStress = recentCheckins.reduce((sum, checkin) => {
        return sum + (checkin.stressScore || checkin.value || 0);
      }, 0) / recentCheckins.length;
      
      if (avgStress >= 4) stressLevel = 'Extreme';
      else if (avgStress >= 3) stressLevel = 'High';
      else if (avgStress >= 2) stressLevel = 'Moderate';
      else stressLevel = 'Low';
    }
    
    // Generate enhanced emotional context from vector history
    emotionalContext = await generateEmotionalContext(userId, checkins);
    
    const context = {
      userFirstName,
      stressDomain,
      stressLevel,
      emotionalContext,
      languagePreference,
      rawData: {
        userContext,
        checkins: checkins?.slice(0, 5) || [],
        timestamp: new Date().toISOString()
      }
    };
    
    console.log(`✅ Context aggregated:`, {
      firstName: userFirstName,
      domain: stressDomain,
      level: stressLevel,
      language: languagePreference
    });
    
    return context;
    
  } catch (error) {
    console.error('❌ Error aggregating user context:', error);
    return {
      userFirstName: null,
      stressDomain: 'General',
      stressLevel: 'Low',
      emotionalContext: {
        recentPatterns: 'Unable to retrieve past experiences at this time',
        dominantDomain: 'general',
        riskLevel: 'low',
        recurringThemes: []
      },
      languagePreference: 'Hinglish',
      rawData: { timestamp: new Date().toISOString() }
    };
  }
};

/**
 * Enhanced getUserEmotionalHistory with vector-based context
 */
export const getUserEmotionalHistory = async (userId, limit = 10) => {
  try {
    console.log(`📊 Fetching emotional history for user ${userId}`);
    
    // Get vector-based emotional history
    const vectorHistory = await querySimilarVectors(userId, new Array(1536).fill(0), limit);
    
    // Process and format the history
    const processedHistory = vectorHistory.map(entry => ({
      domain: entry.metadata?.domain || 'general',
      emotion: entry.metadata?.emotion || 'neutral',
      stressScore: entry.metadata?.stressScore || 0,
      response: entry.metadata?.response || '',
      timestamp: entry.metadata?.timestamp || new Date().toISOString(),
      question: entry.metadata?.question || ''
    }));
    
    console.log(`✅ Retrieved ${processedHistory.length} emotional history entries`);
    return processedHistory;
    
  } catch (error) {
    console.error('❌ Error fetching emotional history:', error);
    return [];
  }
};

/**
 * Generates contextual emotional summary from user's vector history
 */
export const generateEmotionalContext = async (userId, checkins) => {
  try {
    // Get recent emotional history from vectors
    const emotionalHistory = await getUserEmotionalHistory(userId, 5);
    
    if (!emotionalHistory || emotionalHistory.length === 0) {
      return {
        recentPatterns: 'This is our first conversation',
        dominantDomain: 'general',
        riskLevel: 'low',
        recurringThemes: []
      };
    }
    
    // Analyze patterns
    const domainCounts = {};
    const emotionCounts = {};
    let highStressCount = 0;
    
    emotionalHistory.forEach(entry => {
      const domain = entry.domain || 'general';
      const emotion = entry.emotion || 'neutral';
      
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      
      if (entry.stressScore >= 7) highStressCount++;
    });
    
    const dominantDomain = Object.entries(domainCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'general';
    
    const dominantEmotion = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';
    
    // Determine risk level
    let riskLevel = 'low';
    if (highStressCount >= 3) riskLevel = 'high';
    else if (highStressCount >= 2) riskLevel = 'moderate';
    
    // Extract recent specific concerns
    const recentConcerns = emotionalHistory
      .slice(0, 3)
      .filter(entry => entry.stressScore >= 5)
      .map(entry => `${entry.domain}: ${entry.emotion}`);
    
    return {
      recentPatterns: recentConcerns.length > 0 
        ? `Recent stress in: ${recentConcerns.join(', ')}` 
        : `Generally feeling ${dominantEmotion} about ${dominantDomain}`,
      dominantDomain,
      dominantEmotion,
      riskLevel,
      recurringThemes: recentConcerns,
      historyCount: emotionalHistory.length
    };
    
  } catch (error) {
    console.error('Error generating emotional context:', error);
    return {
      recentPatterns: 'Unable to retrieve emotional context',
      dominantDomain: 'general',
      riskLevel: 'low',
      recurringThemes: []
    };
  }
};

/**
 * Enhanced emotional analysis with confusion and sadness detection
 */
export const analyzeMessageContext = (userMessage, languagePreference = 'Hinglish') => {
  const message = userMessage.toLowerCase();
  
  // Detect serious life decisions
  const seriousTopics = {
    resignation: ['resign', 'quit', 'leave job', 'leaving work', 'job change'],
    relationships: ['break up', 'divorce', 'ending relationship', 'leave him', 'leave her'],
    health: ['suicide', 'self harm', 'depression', 'panic attack', 'mental health'],
    major_decisions: ['moving out', 'changing career', 'dropping out', 'big decision']
  };
  
  // Enhanced emotional state detection
  const confusionIndicators = [
    'confused', 'samajh nahi aa raha', 'don\'t know what to do', 'kya karu', 
    'unclear', 'mixed up', 'uncertain', 'lost', 'stuck', 'kuch samajh nahi',
    'clarity nahi hai', 'decision nahi le sakta'
  ];
  
  const sadnessIndicators = [
    'sad', 'down', 'depressed', 'udaas', 'mann nahi kar raha', 'feeling low',
    'empty', 'lonely', 'akela', 'dukhi', 'hopeless', 'defeated', 'broken',
    'hurt', 'pain', 'dard', 'cry', 'crying', 'tears'
  ];
  
  const emotionScore = calculateEmotionScore(message);
  const confusionScore = confusionIndicators.filter(indicator => message.includes(indicator)).length;
  const sadnessScore = sadnessIndicators.filter(indicator => message.includes(indicator)).length;
  
  let detectedTopic = null;
  let severity = 'low';
  let primaryEmotion = 'neutral';
  
  // Detect primary emotional state
  if (confusionScore > 0) primaryEmotion = 'confused';
  else if (sadnessScore > 0) primaryEmotion = 'sad';
  else if (emotionScore >= 7) primaryEmotion = 'distressed';
  
  for (const [topic, keywords] of Object.entries(seriousTopics)) {
    if (keywords.some(keyword => message.includes(keyword))) {
      detectedTopic = topic;
      if (topic === 'health') severity = 'high';
      else if (topic === 'resignation' || topic === 'relationships') severity = 'moderate';
      break;
    }
  }
  
  // Detect emotional intensity
  const highIntensity = ['can\'t take it', 'breaking down', 'overwhelmed', 'desperate', 'exhausted'];
  const isHighIntensity = highIntensity.some(phrase => message.includes(phrase));
  
  return {
    seriousTopic: detectedTopic,
    severity,
    isHighIntensity,
    needsExploration: detectedTopic !== null,
    primaryEmotion,
    emotionScore,
    confusionScore,
    sadnessScore,
    needsFollowUp: confusionScore > 0,
    needsEmpathy: sadnessScore > 0 || emotionScore >= 6
  };
};

/**
 * Calculate overall emotional intensity score
 */
function calculateEmotionScore(message) {
  const highStressWords = ['crisis', 'breaking', 'can\'t', 'desperate', 'overwhelmed'];
  const mediumStressWords = ['stressed', 'tired', 'worried', 'anxious', 'frustrated'];
  
  let score = 0;
  highStressWords.forEach(word => {
    if (message.includes(word)) score += 3;
  });
  mediumStressWords.forEach(word => {
    if (message.includes(word)) score += 1;
  });
  
  return Math.min(score, 10);
}

/**
 * Detect user's language preference from their message
 */
export const detectLanguagePreference = (userMessage) => {
  const hindiPattern = /[\u0900-\u097F]/;
  const hinglishWords = ['bhai', 'yaar', 'kya', 'hai', 'haal', 'kar', 'nahi', 'mera', 'tera', 'tu'];
  
  if (hindiPattern.test(userMessage)) {
    return 'Hindi';
  } else if (hinglishWords.some(word => userMessage.toLowerCase().includes(word))) {
    return 'Hinglish';
  } else {
    return 'English';
  }
};

/**
 * Creates deeply personal, emotionally intelligent Sarthi prompt with enhanced tone rules
 */
export const createSarthiPrompt = (userMessage, context, emotionalContext) => {
  const { userFirstName, stressDomain, stressLevel, languagePreference } = context;
  const messageAnalysis = analyzeMessageContext(userMessage, languagePreference);
  
  // Detect user's actual language preference from their message
  const detectedLanguage = detectLanguagePreference(userMessage);
  const finalLanguage = detectedLanguage || languagePreference;
  
  // Detect bhai-level intimacy from message
  const message = userMessage.toLowerCase();
  const isBhaiMode = ['tu', 'tere', 'tera', 'bhai', 'yaar'].some(word => message.includes(word));
  const nameAddress = isBhaiMode ? 'bhai' : (userFirstName || 'yaar');
  
  // Detect emotional crisis
  const isBreakingDown = ['dimag phat raha', 'samajh nahi aa raha', 'can\'t take it', 'ho gaya bas'].some(phrase => message.includes(phrase));
  
  // Build deep emotional memory context
  let emotionalMemorySection = '';
  if (emotionalContext && emotionalContext.recentPatterns !== 'This is our first conversation') {
    emotionalMemorySection = `

**Deep Emotional Memory (like a best friend remembers):**
- ${emotionalContext.recentPatterns}
- Recurring struggles: ${emotionalContext.dominantDomain} (${emotionalContext.riskLevel} risk)
${emotionalContext.recurringThemes.length > 0 ? `- Patterns you've noticed: ${emotionalContext.recurringThemes.join(', ')}` : ''}
- Support style they need: ${emotionalContext.riskLevel === 'high' ? 'intensive_support' : 'gentle_guidance'}`;
  }
  
  // Build current struggle analysis
  let currentStruggleSection = '';
  if (stressDomain && stressDomain !== 'General') {
    currentStruggleSection = `

**Current Pattern Recognition:**
- This relates to their ${stressDomain} struggles (stress level: ${stressLevel})
- ${emotionalContext?.recurringThemes?.includes(stressDomain) ? 'This is a recurring pattern for them' : 'New area of concern'}`;
  }
  
  // Generate practical solution based on their history
  let practicalSolution = '';
  if (isBreakingDown) {
    practicalSolution = languagePreference === 'Hinglish' ? 
      'Kal ek kaam kar: 30 mins phone silent karke terrace pe bethna, kuch na sochke chill kar' :
      languagePreference === 'Hindi' ? 
      'कल एक काम करो: 30 मिनट फोन बंद करके छत पर बैठना, कुछ न सोचकर आराम करो' :
      'Tomorrow, try this: 30 mins with phone off, just sit somewhere peaceful and breathe';
  } else if (stressDomain === 'Work & Career') {
    practicalSolution = languagePreference === 'Hinglish' ? 
      'Aaj office mein kisi ek trusted person se honestly baat kar. Bas vent out kar' :
      'Talk honestly to one trusted person at work today. Just vent it out';
  } else {
    practicalSolution = languagePreference === 'Hinglish' ? 
      'Bas ek deep breath le aur 15 mins ke liye sab band kar. Tu handle kar lega' :
      'Just take a deep breath and pause everything for 15 mins. You can handle this';
  }
  
  // Language-specific personality
  let personalityInstructions = '';
  if (languagePreference === 'Hinglish' && isBhaiMode) {
    personalityInstructions = `

**Your Bhai Personality:**
- Use "tu", "tera", "bhai" naturally like close friends
- Mix Hindi-English: "Arre bhai, samajh aa gaya tera point"
- Be emotionally grounded, not dramatic
- Examples: "Tu tension mat le", "Main hoon na", "Chal figure out karte hain"
- End with specific action from solution above`;
  } else if (languagePreference === 'Hindi') {
    personalityInstructions = `

**Your Dost Personality:**
- Natural Hindi like talking to close friend: "यार", "मैं हूं ना"
- Be warm and understanding
- End with practical suggestion from solution above`;
  } else {
    personalityInstructions = `

**Your Friend Personality:**
- Talk like emotionally intelligent best friend
- Be genuine, grounded, never robotic
- End with realistic action from solution above`;
  }
  
  // Generate tone-specific response based on emotional analysis
  const toneInstructions = generateToneInstructions(messageAnalysis, finalLanguage, nameAddress);
  const fallbackSupport = generateFallbackSupport(messageAnalysis, finalLanguage);
  
  return `You are Sarthi, the user's emotionally intelligent best friend and mentor. You combine the warmth of a close friend with the wisdom of someone who truly understands life.

**CORE PERSONALITY RULES:**
1. **Language tone = emotionally intelligent + mentor + best friend**
2. **If user is confused, ask follow-up: "${finalLanguage === 'Hinglish' ? 'Kis cheez ko leke confusion ho raha hai?' : finalLanguage === 'Hindi' ? 'किस बात को लेकर confusion हो रहा है?' : 'What exactly is confusing you?'}"}**
3. **If user is sad/down, respond with empathy + relatable thought + one small suggestion (no over-coaching)**
4. **Match user's language preference — they're using ${finalLanguage}, so respond in ${finalLanguage}**
5. **Use emojis only where needed — one max per message 😊**
6. **Never end a reply abruptly — leave scope for user to reply with feelings/thoughts**
7. **Address as: ${nameAddress}**

**Current Emotional Context:**
- Their message: "${userMessage}"
- Primary emotion: ${messageAnalysis.primaryEmotion}
- Emotion score: ${messageAnalysis.emotionScore}/10
- Confusion level: ${messageAnalysis.confusionScore > 0 ? 'High' : 'Low'}
- Needs empathy: ${messageAnalysis.needsEmpathy ? 'Yes' : 'No'}${emotionalMemorySection}

${toneInstructions}

**RESPONSE REQUIREMENTS:**
- Match their ${finalLanguage} language naturally
- Keep conversational (2-4 lines max)
- ${messageAnalysis.needsFollowUp ? 'Include specific follow-up question about their confusion' : ''}
- ${messageAnalysis.needsEmpathy ? 'Lead with empathy, then gentle suggestion' : ''}
- Always end with engagement/question to continue conversation
- ONE emoji max, only if it enhances empathy

**FALLBACK EMOTIONAL SUPPORT:**
${fallbackSupport}

**Examples for ${finalLanguage}:**
${generateLanguageExamples(finalLanguage, nameAddress, messageAnalysis.primaryEmotion)}

Respond as Sarthi with emotional intelligence:`;}

/**
 * Generate tone-specific instructions based on emotional analysis
 */
function generateToneInstructions(messageAnalysis, language, nameAddress) {
  let instructions = '';
  
  if (messageAnalysis.primaryEmotion === 'confused') {
    instructions = `**CONFUSION RESPONSE MODE:**
- Don't immediately give solutions
- Ask clarifying question: "${language === 'Hinglish' ? 'Kis cheez ko leke confusion ho raha hai?' : language === 'Hindi' ? 'किस बात को लेकर confusion हो रहा है?' : 'What exactly is confusing you?'}"
- Show understanding: "${language === 'Hinglish' ? 'Samajh aa gaya, confusing situation hai' : 'I can understand the confusion'}"
- Keep door open for deeper conversation`;
  } else if (messageAnalysis.primaryEmotion === 'sad') {
    instructions = `**SADNESS RESPONSE MODE:**
- Lead with deep empathy: "${language === 'Hinglish' ? nameAddress + ', lagta hai andar se heavy feel ho raha hai' : 'I can feel that you\'re hurting inside'}"
- Share relatable thought: "${language === 'Hinglish' ? 'Main samajh sakta hoon, kabhi kabhi aisa lagta hai' : 'These feelings are completely valid'}"
- ONE small, gentle suggestion (not overwhelming advice)
- No over-coaching or long solutions`;
  } else {
    instructions = `**SUPPORTIVE FRIEND MODE:**
- Be present and caring
- Show genuine interest in their thoughts
- Offer support without being pushy`;
  }
  
  return instructions;
}

/**
 * Generate fallback emotional support check
 */
function generateFallbackSupport(messageAnalysis, language) {
  if (messageAnalysis.emotionScore >= 7 || messageAnalysis.confusionScore > 1) {
    return language === 'Hinglish' ? 
      'Tu akela nahi hai bro, I\'m right here. 😊' :
      language === 'Hindi' ? 
      'तुम अकेले नहीं हो यार, मैं हूं ना तुम्हारे साथ। 😊' :
      'You\'re not alone in this, I\'m right here with you. 😊';
  }
  return 'I\'m here to listen and support you.';
}

/**
 * Generate language-specific examples
 */
function generateLanguageExamples(language, nameAddress, emotion) {
  if (language === 'Hinglish') {
    if (emotion === 'confused') {
      return `- "Arre ${nameAddress}, samajh aa gaya confusion hai. Kis cheez ko leke exactly?"
- "Batao yaar, main hoon na saath mein figure out karne ke liye. Kya chal raha hai mann mein?"`;
    } else if (emotion === 'sad') {
      return `- "${nameAddress}, andar se heavy lag raha hai na? Main samajh sakta hoon. Kya hua exactly?"
- "Yaar, ye feeling bilkul normal hai. Thoda rest le aur batao kya share karna hai?"`;
    }
    return `- "Arre ${nameAddress}, kya scene hai? Sab theek?"
- "Bro, main hoon na tera saath. Batao kya chal raha hai?"`;
  } else if (language === 'Hindi') {
    return `- "${nameAddress}, क्या हाल है? मैं हूं ना तुम्हारे साथ।"
- "बताओ यार, क्या बात है? मैं सुनने के लिए हूं।"`;
  } else {
    return `- "Hey ${nameAddress}, I can sense something's on your mind. What's going on?"
- "I'm here for you. Want to talk about what you're feeling?"`;
  }
}

/**
 * Enhance response tone to follow the 10 emotional intelligence rules
 */
async function enhanceResponseTone(sarthiReply, messageAnalysis, language, context) {
  console.log(`🎨 Enhancing response tone for ${language} with emotion: ${messageAnalysis.primaryEmotion}`);
  
  try {
    let enhancedReply = sarthiReply;
    
    // Rule 1: Language tone = emotionally intelligent + mentor + best friend (already handled in prompt)
    
    // Rule 2: If user is confused, ensure follow-up question is present
    if (messageAnalysis.needsFollowUp && messageAnalysis.confusionScore > 0) {
      const confusionFollowUp = language === 'Hinglish' ? 
        'Kis cheez ko leke confusion ho raha hai?' :
        language === 'Hindi' ? 
        'किस बात को लेकर confusion हो रहा है?' :
        'What exactly is confusing you?';
      
      if (!enhancedReply.includes(confusionFollowUp) && 
          !enhancedReply.toLowerCase().includes('confusion') &&
          !enhancedReply.toLowerCase().includes('confusing')) {
        enhancedReply += ` ${confusionFollowUp}`;
      }
    }
    
    // Rule 3: If user is sad/down, ensure empathy + relatable thought + small suggestion
    if (messageAnalysis.needsEmpathy && messageAnalysis.sadnessScore > 0) {
      const empathyPhrases = {
        'Hinglish': ['andar se heavy', 'samajh aa gaya', 'main feel kar sakta hoon'],
        'Hindi': ['मैं समझ सकता हूं', 'दिल से लग रहा है', 'ये feeling बिल्कुल normal है'],
        'English': ['I can feel that', 'I understand', 'what you\'re going through']
      };
      
      const hasEmpathy = empathyPhrases[language]?.some(phrase => 
        enhancedReply.toLowerCase().includes(phrase.toLowerCase())
      );
      
      if (!hasEmpathy) {
        const empathyPrefix = language === 'Hinglish' ? 
          'Bhai, andar se heavy lag raha hai na? Main samajh sakta hoon. ' :
          language === 'Hindi' ? 
          'यार, मैं समझ सकता हूं कि कैसा लग रहा होगा। ' :
          'I can understand that you\'re feeling heavy inside. ';
        enhancedReply = empathyPrefix + enhancedReply;
      }
    }
    
    // Rule 4: Language matching (already handled in prompt and detection)
    
    // Rule 5: Emoji check - ensure only one emoji max
    const emojiCount = (enhancedReply.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}😊😔💙❤️]/gu) || []).length;
    if (emojiCount > 1) {
      // Keep only the first emoji
      enhancedReply = enhancedReply.replace(/([\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}😊😔💙❤️])/gu, (match, emoji, offset) => {
        return enhancedReply.indexOf(emoji) === offset ? emoji : '';
      });
    }
    
    // Rule 6: Never end abruptly - ensure conversation continuation
    const conversationEnders = [
      'How does that sound?', 'What are your thoughts?', 'Kya lagta hai?', 'क्या लगता है?',
      'Share with me', 'Batao yaar', 'बताओ यार', 'How are you feeling about this?',
      'Kaise feel ho raha hai?', 'Any thoughts?', 'What do you think?'
    ];
    
    const hasEnder = conversationEnders.some(ender => 
      enhancedReply.toLowerCase().includes(ender.toLowerCase())
    );
    
    if (!hasEnder && !enhancedReply.endsWith('?')) {
      const engagementEnder = language === 'Hinglish' ? 
        ' Kya lagta hai tujhe?' :
        language === 'Hindi' ? 
        ' क्या लगता है तुम्हें?' :
        ' What are your thoughts?';
      enhancedReply += engagementEnder;
    }
    
    // Rule 7: Fallback emotional support check
    if (messageAnalysis.emotionScore >= 7 || messageAnalysis.confusionScore > 1) {
      const fallbackSupport = language === 'Hinglish' ? 
        'Tu akela nahi hai bro, I\'m right here. 😊' :
        language === 'Hindi' ? 
        'तुम अकेले नहीं हो यार, मैं हूं ना तुम्हारे साथ। 😊' :
        'You\'re not alone in this, I\'m right here with you. 😊';
      
      if (!enhancedReply.toLowerCase().includes('akela nahi') && 
          !enhancedReply.toLowerCase().includes('not alone') &&
          !enhancedReply.toLowerCase().includes('अकेले नहीं')) {
        enhancedReply = enhancedReply + ` ${fallbackSupport}`;
      }
    }
    
    console.log(`✅ Tone enhancement completed for ${language}`);
    return enhancedReply;
    
  } catch (error) {
    console.error('❌ Error enhancing response tone:', error);
    return sarthiReply; // Return original if enhancement fails
  }
}

/**
 * Main Sarthi response generation function
 */
export const generateSarthiResponse = async (userId, userMessage, languagePreference = 'Hinglish') => {
  console.log(`🤖 Generating enhanced Sarthi response for user ${userId}`);
  
  try {
    // Aggregate user context
    const context = await aggregateUserContext(userId);
    
    // Detect user's actual language preference from their message
    const detectedLanguage = detectLanguagePreference(userMessage);
    const finalLanguage = detectedLanguage || languagePreference;
    
    // Override language preference with detected or provided
    context.languagePreference = finalLanguage;
    
    // Enhanced emotional analysis
    const messageAnalysis = analyzeMessageContext(userMessage, finalLanguage);
    console.log(`🧠 Emotional analysis:`, {
      emotion: messageAnalysis.primaryEmotion,
      score: messageAnalysis.emotionScore,
      needsFollowUp: messageAnalysis.needsFollowUp,
      needsEmpathy: messageAnalysis.needsEmpathy
    });
    
    // Create personalized system prompt with emotional context
    const systemPrompt = createSarthiPrompt(userMessage, context, context.emotionalContext);
    
    console.log(`📝 Generated Sarthi prompt for ${context.stressDomain} stress (${context.stressLevel})`);
    
    // Call ultimate personalized Sarthi response generation  
    const ultimateSarthiPrompt = createUltimatePersonalizedSarthiPrompt(userMessage, context);
    
    // Call Azure GPT-4o with ultimate personalized Sarthi prompt
    const response = await fetch('http://localhost:8001/api/openai-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: ultimateSarthiPrompt,
        userId: userId
      }),
    });

    if (!response.ok) {
      throw new Error(`Sarthi API error! status: ${response.status}`);
    }

    const result = await response.json();
    const sarthiReply = result.reply;
    
    console.log(`✅ Sarthi response generated successfully`);
    
    // Store conversation in Firestore for learning
    await storeSarthiConversation(userId, userMessage, sarthiReply, context);
    
    // Post-process response to ensure tone rules are followed
    const enhancedReply = await enhanceResponseTone(sarthiReply, messageAnalysis, finalLanguage, context);
    
    return {
      message: enhancedReply,
      context: context,
      sarthiEnhanced: true,
      language: finalLanguage,
      emotionalAnalysis: messageAnalysis,
      toneApplied: true,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error generating Sarthi response:', error);
    
    // Fallback response based on context
    const fallbackContext = await aggregateUserContext(userId);
    const nameAddress = fallbackContext.userFirstName ? `${fallbackContext.userFirstName} bhai` : 'bhai';
    
    let fallbackResponse = `Hey ${nameAddress}, I'm here to listen and support you. `;
    
    if (fallbackContext.stressLevel === 'High' || fallbackContext.stressLevel === 'Extreme') {
      fallbackResponse += `It sounds like you're going through a tough time. Take a deep breath — you're not alone in this. 💙`;
    } else {
      fallbackResponse += `How are you feeling today? I'm here whenever you need to talk. 😊`;
    }
    
    return {
      message: fallbackResponse,
      context: fallbackContext,
      sarthiEnhanced: false,
      fallback: true,
      language: languagePreference,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Stores Sarthi conversation for learning and feedback loop
 */
export const storeSarthiConversation = async (userId, userMessage, sarthiReply, context) => {
  try {
    console.log(`💾 Storing Sarthi conversation for user ${userId}`);
    
    const conversationData = {
      userId: userId,
      userMessage: userMessage,
      sarthiReply: sarthiReply,
      context: context,
      timestamp: new Date().toISOString(),
      stressDomain: context.stressDomain,
      stressLevel: context.stressLevel,
      languageUsed: context.languagePreference,
      conversationType: 'sarthi_emotional_support'
    };
    
    // Store in Firestore
    await ContextStore.updateUserContext(userId, {
      lastSarthiConversation: conversationData,
      lastConversationTimestamp: new Date().toISOString()
    });
    
    console.log(`✅ Sarthi conversation stored successfully`);
    
  } catch (error) {
    console.error('❌ Error storing Sarthi conversation:', error);
    // Don't throw error to avoid breaking the flow
  }
};

// Frontend-safe prompt template (LangChain-style API without dependencies)
const stressPrompt = {
  format: async ({ question, answer, emotion }) => {
    return `You are a therapist assistant. Analyze the following answer:

Question: ${question}
Answer: ${answer}
Emotion: ${emotion}

Is the user showing signs of stress? Reply with a JSON:
{
  "stress_level": "High/Moderate/Low",
  "reason": "Explain in 1-2 lines"
}`;
  }
};

// Enhanced getStressLevel method with integrated analyzeEnhancedStress data
export const getStressLevel = async ({ question, answer, emotion, domain = 'General' }) => {
  console.log('🔍 getStressLevel called with:', { question, answer, emotion, domain });
  
  try {
    // Get enhanced stress analysis from Azure GPT-4o
    const enhancedAnalysis = await analyzeEnhancedStress(question, answer, domain);
    console.log('📊 Enhanced analysis received:', enhancedAnalysis);
    
    // Convert enhanced score to traditional stress level categories
    let stressLevel = "Low";
    if (enhancedAnalysis.enhancedScore >= 7) {
      stressLevel = "High";
    } else if (enhancedAnalysis.enhancedScore >= 4) {
      stressLevel = "Moderate";
    }
    
    // Create comprehensive response object
    const comprehensiveResponse = {
      // Traditional format for backward compatibility
      stress_level: stressLevel,
      reason: enhancedAnalysis.reason,
      
      // Enhanced data from Azure GPT-4o analysis
      enhanced: {
        score: enhancedAnalysis.enhancedScore,
        emotion: enhancedAnalysis.enhancedEmotion,
        intensity: enhancedAnalysis.enhancedIntensity,
        causeTag: enhancedAnalysis.causeTag
      },
      
      // Additional metadata
      timestamp: new Date().toISOString(),
      domain: domain,
      analysisMethod: 'azure_gpt4o_enhanced'
    };
    
    console.log('✅ Final comprehensive response:', comprehensiveResponse);
    return JSON.stringify(comprehensiveResponse);
    
  } catch (error) {
    console.error('❌ getStressLevel: Enhanced analysis failed, using fallback:', error);
    
    // Intelligent fallback based on answer patterns
    let stressLevel = "Low";
    let reason = "Analysis completed using pattern recognition due to service unavailability";
    let enhancedScore = 3;
    let enhancedEmotion = "Stable";
    let enhancedIntensity = "Low";
    
    const lowerAnswer = answer?.toLowerCase() || '';
    if (['very often', 'always', 'completely', 'extremely'].some(phrase => lowerAnswer.includes(phrase))) {
      stressLevel = "High";
      enhancedScore = 8;
      enhancedEmotion = "Overwhelm";
      enhancedIntensity = "High";
      reason = "High frequency response patterns suggest significant stress levels requiring attention";
    } else if (['often', 'mostly', 'frequently'].some(phrase => lowerAnswer.includes(phrase))) {
      stressLevel = "Moderate";
      enhancedScore = 5;
      enhancedEmotion = "Tension";
      enhancedIntensity = "Moderate";
      reason = "Moderate frequency response patterns indicate manageable stress levels";
    } else if (['never', 'not at all', 'rarely'].some(phrase => lowerAnswer.includes(phrase))) {
      // Context-aware interpretation for "never" responses
      const isNegativeQuestion = ['stress', 'overwhelm', 'anxious', 'worried', 'tired'].some(keyword => 
        question.toLowerCase().includes(keyword));
      
      if (isNegativeQuestion) {
        // "Never stressed" = good
        stressLevel = "Low";
        enhancedScore = 2;
        enhancedEmotion = "Stable";
        enhancedIntensity = "Low";
        reason = "Minimal stress indicators detected, suggesting good emotional regulation";
      } else {
        // "Never supported" = bad
        stressLevel = "High";
        enhancedScore = 7;
        enhancedEmotion = "Loneliness";
        enhancedIntensity = "High";
        reason = "Lack of positive experiences detected, indicating potential isolation or unmet needs";
      }
    }
    
    const fallbackResponse = {
      stress_level: stressLevel,
      reason: reason,
      enhanced: {
        score: enhancedScore,
        emotion: enhancedEmotion,
        intensity: enhancedIntensity,
        causeTag: 'intelligent_fallback'
      },
      timestamp: new Date().toISOString(),
      domain: domain,
      analysisMethod: 'pattern_recognition_fallback'
    };
    
    console.log('🔄 Fallback response:', fallbackResponse);
    return JSON.stringify(fallbackResponse);
  }
};

// Export the generateTherapistInsight function for backward compatibility
export async function generateTherapistInsight({ userId, domain, selectedTriggers, userText }) {
  const systemPrompt = `
You are a compassionate mental wellness expert helping someone experiencing stress in the '${domain}' domain.
They are struggling with: ${selectedTriggers.join(", ")}.
Their comment: "${userText}"

Respond as a human therapist would:
- Acknowledge their emotions
- Suggest 2-3 coping mechanisms
- Be comforting but practical
- Don't repeat the same structure each time
`;

  try {
    const response = await fetch("/api/gptTherapist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain,
        stressSignals: selectedTriggers.join(", "),
        userNote: userText
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.therapistAdvice;
  } catch (error) {
    console.error('Error generating therapist insight:', error);
    // Fallback response
    return `I can see you're dealing with some challenges in your ${domain.toLowerCase()} life. Your feelings are completely valid, and it's important to acknowledge them. Consider taking small steps to care for yourself, and remember that it's okay to ask for support when you need it.`;
  }
}

// Create a singleton class for backward compatibility
class ManovaAgent {
  constructor() {
    this.isInitialized = true;
    console.log('LangChain ManovaAgent: Initialized with server API integration');
    
    // Debug: Show environment context
    if (isNode) {
      console.log('🔍 ManovaAgent Environment: Node.js (server-side)');
    } else {
      console.log('🔍 ManovaAgent Environment: Browser (frontend-safe mode)');
    }
  }

  async initialize() {
    this.isInitialized = true;
  }

  async getStressLevel(params) {
    // Ensure domain is passed through
    const enhancedParams = {
      domain: 'General',
      ...params
    };
    return await getStressLevel(enhancedParams);
  }
  
  // Direct access to enhanced stress analysis
  async analyzeEnhancedStress(question, answer, domain) {
    return await analyzeEnhancedStress(question, answer, domain);
  }

  // Placeholder methods for backward compatibility
  async analyzeWellnessResponse(userResponse, question, domain) {
    console.log('LangChain ManovaAgent: Using fallback wellness analysis');
    return {
      stressLevel: 5,
      emotion: 'neutral',
      intensity: 'moderate',
      concerns: [],
      supportiveMessage: 'Thank you for sharing. I\'m here to support you.',
      recommendations: [],
      needsFollowUp: false
    };
  }

  async generatePersonalizedInsights(userId, surveyResponses, domain) {
    console.log('LangChain ManovaAgent: Using fallback insights');
    return {
      summary: 'Based on your responses, I can see you\'re navigating some challenges.',
      keyInsights: ['Your responses show thoughtful self-reflection'],
      personalizedRecommendations: ['Consider exploring stress management techniques'],
      copingStrategies: ['Practice deep breathing exercises'],
      followUpQuestions: ['What would help you feel more supported?']
    };
  }
}

// Build structured prompt for stress analysis
function buildPrompt({ question, answer, context, instruction }) {
  return `
You are a psychologist AI trained in emotional stress detection.

Question: ${question}
User Answer: ${answer}
Context: ${context || 'General wellness assessment'}

${instruction}

Return ONLY valid JSON in this format:
{
  "enhancedScore": (0 to 10),
  "enhancedEmotion": "string (e.g., Burnout, Loneliness, Stable)",
  "enhancedIntensity": "Low | Moderate | High",
  "reason": "Human-style psychological explanation",
  "shouldTrigger": true/false
}
`.trim();
}

// Enhanced safe JSON parser for Azure GPT-4o responses
function cleanAndParseEnhancedResponse(responseText) {
  console.log('🧹 Cleaning and parsing GPT-4o response:', responseText);
  
  try {
    // Remove markdown code blocks and trim
    let cleaned = responseText
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();
    
    // Find JSON boundaries
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    
    // Try to parse the cleaned JSON
    const parsed = JSON.parse(cleaned);
    console.log('✅ Successfully parsed JSON:', parsed);
    
    // Validate required fields
    if (typeof parsed.enhancedScore === 'number' && 
        parsed.enhancedEmotion && 
        parsed.enhancedIntensity && 
        parsed.reason) {
      return parsed;
    } else {
      console.warn('⚠️ Parsed JSON missing required fields:', parsed);
      throw new Error('Missing required fields in parsed JSON');
    }
    
  } catch (error) {
    console.error('❌ Failed to parse enhanced stress JSON:', error);
    console.log('🔄 Using intelligent fallback structure');
    
    // Return a structured fallback that will be handled by the calling function
    return {
      enhancedScore: null, // Will trigger fallback logic
      enhancedEmotion: null,
      enhancedIntensity: null,
      reason: null,
      causeTag: 'json_parse_error'
    };
  }
}

// Context-aware LLM-based stress scoring logic with proper question interpretation
function calculateStressScoreLLM(questionText, userAnswer) {
  const normalizedAnswer = userAnswer.trim().toLowerCase();
  const normalizedQuestion = questionText.toLowerCase();
  
  // Determine if the question is about positive or negative experiences
  const isNegativeQuestion = [
    'stress', 'overwhelm', 'exhaust', 'drain', 'trouble', 'problem', 'difficult', 
    'worried', 'anxious', 'lonely', 'isolated', 'burnout', 'tired'
  ].some(keyword => normalizedQuestion.includes(keyword));
  
  const isPositiveQuestion = [
    'support', 'valued', 'satisfied', 'happy', 'enjoy', 'fulfil', 'accomplish',
    'connected', 'loved', 'appreciated', 'motivated', 'energized'
  ].some(keyword => normalizedQuestion.includes(keyword));
  
  // Define answer intensity levels
  const neverRarely = ['never', 'not at all', 'rarely', 'very rarely'].some(cue => normalizedAnswer.includes(cue));
  const sometimes = ['sometimes', 'somewhat', 'occasionally'].some(cue => normalizedAnswer.includes(cue));
  const oftenAlways = ['often', 'very often', 'always', 'completely', 'mostly'].some(cue => normalizedAnswer.includes(cue));
  
  // Context-aware scoring logic
  if (isNegativeQuestion) {
    // For negative questions: "Never stressed" = good (low stress)
    if (neverRarely) {
      return { score: 2, emotion: "Calm", intensity: "Low", causeTag: "context_aware_negative" };
    } else if (sometimes) {
      return { score: 5, emotion: "Concerned", intensity: "Moderate", causeTag: "context_aware_negative" };
    } else if (oftenAlways) {
      return { score: 8, emotion: "High", intensity: "Critical", causeTag: "context_aware_negative" };
    }
  } else if (isPositiveQuestion) {
    // For positive questions: "Never supported" = bad (high stress)
    if (neverRarely) {
      return { score: 8, emotion: "High", intensity: "Critical", causeTag: "context_aware_positive" };
    } else if (sometimes) {
      return { score: 5, emotion: "Concerned", intensity: "Moderate", causeTag: "context_aware_positive" };
    } else if (oftenAlways) {
      return { score: 2, emotion: "Calm", intensity: "Low", causeTag: "context_aware_positive" };
    }
  } else {
    // Neutral questions: fall back to original logic
    if (neverRarely) {
      return { score: 6, emotion: "Concerned", intensity: "Moderate", causeTag: "neutral_fallback" };
    } else if (sometimes) {
      return { score: 5, emotion: "Concerned", intensity: "Moderate", causeTag: "neutral_fallback" };
    } else if (oftenAlways) {
      return { score: 4, emotion: "Neutral", intensity: "Mild", causeTag: "neutral_fallback" };
    }
  }
  
  // Default fallback
  return { score: 4, emotion: "Neutral", intensity: "Mild", causeTag: "fallback" };
}

// Enhanced stress analysis with psychological reasoning and human psychology mapping
export const analyzeEnhancedStress = async (question, answer, domain) => {
  console.log('🔍 analyzeEnhancedStress called with:', { question, answer, domain });
  
  // Enhanced prompt for Azure GPT-4o analysis
  const enhancedPrompt = `
You are an AI mental wellness evaluator. Based on the user's answer to a wellness check-in question, return an objective stress analysis.

Return this EXACT JSON only:
{
  "enhancedScore": number (1-10, where 10 = extremely stressed),
  "enhancedEmotion": string (e.g. "Anxious", "Calm", "Overwhelmed", etc.),
  "enhancedIntensity": string ("Low" | "Moderate" | "High"),
  "reason": string (briefly explain the emotional reasoning),
  "causeTag": string ("Work", "Personal", "Health", "Finance", etc.)
}

Question: """${question}"""
User Response: """${answer}"""

Analyze both content and tone of the answer. Focus on emotional signals, intensity, and context. If the user response is neutral, return a low score and 'Calm' emotion.
`;

  try {
    // Call Azure GPT-4o for enhanced psychological analysis
    console.log('📡 Calling Azure GPT-4o for stress analysis...');
    const response = await fetch('http://localhost:8001/api/openai-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: enhancedPrompt
      }),
    });

    if (!response.ok) {
      throw new Error(`Azure GPT-4o API error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('🤖 Azure GPT-4o raw response:', result.reply);
    
    // Parse the enhanced analysis using safe parser
    const parsed = cleanAndParseEnhancedResponse(result.reply);
    console.log('📊 Parsed analysis result:', parsed);
    
    // Validate required fields and ensure consistent structure
    const validatedResult = {
      enhancedScore: typeof parsed.enhancedScore === 'number' ? 
        Math.max(1, Math.min(10, parsed.enhancedScore)) : 5, // Default to moderate if invalid (1-10 scale)
      enhancedEmotion: parsed.enhancedEmotion || 'Stressed',
      enhancedIntensity: parsed.enhancedIntensity || 'Moderate',
      reason: parsed.reason || 'Psychological analysis completed based on response patterns.',
      causeTag: parsed.causeTag || domain || 'General',
      shouldTrigger: false // Will be set based on score and intensity below
    };
    
    // Ensure intensity is valid (updated to match new 3-level system)
    if (!['Low', 'Moderate', 'High'].includes(validatedResult.enhancedIntensity)) {
      validatedResult.enhancedIntensity = 'Moderate';
    }
    
    // Ensure causeTag is a valid category
    const validCauseTags = ['Work', 'Personal', 'Health', 'Finance', 'Family', 'Relationship', 'Academic', 'Social', 'General'];
    if (!validCauseTags.includes(validatedResult.causeTag)) {
      // Map common domain names to valid cause tags
      const domainLower = domain?.toLowerCase() || '';
      if (domainLower.includes('work') || domainLower.includes('career') || domainLower.includes('job')) {
        validatedResult.causeTag = 'Work';
      } else if (domainLower.includes('personal') || domainLower.includes('life')) {
        validatedResult.causeTag = 'Personal';
      } else if (domainLower.includes('health') || domainLower.includes('physical') || domainLower.includes('mental')) {
        validatedResult.causeTag = 'Health';
      } else if (domainLower.includes('finance') || domainLower.includes('money') || domainLower.includes('financial')) {
        validatedResult.causeTag = 'Finance';
      } else if (domainLower.includes('family') || domainLower.includes('relationship')) {
        validatedResult.causeTag = 'Family';
      } else {
        validatedResult.causeTag = 'General';
      }
    }
    
    // Set shouldTrigger based on score and intensity
    validatedResult.shouldTrigger = validatedResult.enhancedScore >= 7 || validatedResult.enhancedIntensity === 'High';
    
    console.log('✅ Final validated analysis:', validatedResult);
    return validatedResult;
    
  } catch (error) {
    console.error('❌ Error in Azure GPT-4o analysis, using intelligent fallback:', error);
    
    // Intelligent fallback with context-aware scoring
    const llmScore = calculateStressScoreLLM(question, answer);
    const domainLower = domain?.toLowerCase() || '';
    
    // Domain-specific psychological mapping
    let enhancedEmotion = 'Stress';
    let reason = 'Analysis based on response patterns and psychological indicators.';
    let enhancedIntensity = 'Moderate';
    
    // Map LLM score to psychological context (convert to 1-10 scale)
    let finalScore = Math.max(1, Math.min(10, llmScore.score));
    let causeTag = 'General';
    
    // Map domain to causeTag
    if (domainLower.includes('work') || domainLower.includes('career') || domainLower.includes('job')) {
      causeTag = 'Work';
    } else if (domainLower.includes('personal') || domainLower.includes('life')) {
      causeTag = 'Personal';
    } else if (domainLower.includes('health') || domainLower.includes('physical') || domainLower.includes('mental')) {
      causeTag = 'Health';
    } else if (domainLower.includes('finance') || domainLower.includes('money') || domainLower.includes('financial')) {
      causeTag = 'Finance';
    } else if (domainLower.includes('family') || domainLower.includes('relationship')) {
      causeTag = 'Family';
    }
    
    if (finalScore >= 7) {
      enhancedIntensity = 'High';
      if (causeTag === 'Personal' || causeTag === 'Family') {
        enhancedEmotion = 'Lonely';
        reason = 'High stress detected in personal relationships, suggesting emotional isolation and disconnection.';
      } else if (causeTag === 'Work') {
        enhancedEmotion = 'Overwhelmed';
        reason = 'High stress detected in work environment, indicating potential burnout and overwhelming demands.';
      } else {
        enhancedEmotion = 'Anxious';
        reason = 'High stress levels detected requiring attention and support.';
      }
    } else if (finalScore >= 4) {
      enhancedIntensity = 'Moderate';
      enhancedEmotion = 'Stressed';
      reason = 'Moderate stress levels detected, manageable with appropriate coping strategies.';
    } else {
      enhancedIntensity = 'Low';
      enhancedEmotion = 'Calm';
      reason = 'Low stress detected, indicating good emotional regulation and well-being.';
    }
    
    const fallbackResult = {
      enhancedScore: finalScore,
      enhancedEmotion,
      enhancedIntensity,
      reason,
      causeTag: causeTag,
      shouldTrigger: finalScore >= 7 || enhancedIntensity === 'High'
    };
    
    console.log('🔄 Fallback analysis result:', fallbackResult);
    return fallbackResult;
  }
};

// Generate therapeutic insights using server API
export const generateInsight = async ({ question, answer }) => {
  const prompt = `
You are a licensed therapist AI working for Manova. Based on the user's answer, generate:
1. A short emotional interpretation (therapistNote)
2. Two actionable coping strategies (tryTips[])
3. Three stress contributors related to this situation (stressReasons[])

Input:
Question: "${question}"
Answer: "${answer}"

Output format:
{
  therapistNote: "...",
  tryTips: ["...", "..."],
  stressReasons: ["...", "...", "..."]
}
  `;

  try {
    // Use the server API for therapeutic insights
    const response = await fetch('http://localhost:8001/api/openai-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Try to parse the response as JSON
    try {
      return JSON.parse(result.reply);
    } catch (parseError) {
      console.warn('Failed to parse therapeutic insight as JSON, using fallback');
      throw parseError;
    }
    
  } catch (error) {
    console.error('Error generating therapeutic insight:', error);
    
    // Intelligent fallback based on answer patterns
    let therapistNote = "I can see you're navigating some challenges right now.";
    let tryTips = ["Take a few deep breaths when feeling overwhelmed", "Try to identify one small step you can take today"];
    let stressReasons = ["Life pressures", "Emotional overwhelm", "Need for support"];
    
    const lowerAnswer = answer?.toLowerCase() || '';
    
    if (['very often', 'always', 'extremely'].some(phrase => lowerAnswer.includes(phrase))) {
      therapistNote = "Your response indicates you're experiencing significant stress right now, and that's completely valid.";
      tryTips = ["Consider reaching out to a trusted friend or counselor", "Practice grounding techniques like the 5-4-3-2-1 method"];
      stressReasons = ["High stress levels", "Overwhelming circumstances", "Need for professional support"];
    } else if (['never', 'not at all', 'rarely'].some(phrase => lowerAnswer.includes(phrase))) {
      therapistNote = "It sounds like you're managing this area well, which is wonderful.";
      tryTips = ["Continue the positive practices you're already doing", "Stay mindful of any changes in this area"];
      stressReasons = ["Maintaining current balance", "Ongoing self-awareness", "Preventive care"];
    }
    
    return {
      therapistNote,
      tryTips,
      stressReasons
    };
  }
};

// Export singleton instance for backward compatibility
const manovaAgent = new ManovaAgent();
export default manovaAgent;