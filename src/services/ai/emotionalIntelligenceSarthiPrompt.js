/**
 * Emotionally Intelligent Sarthi Prompt Generator
 * Creates empathetic, practical, best friend responses with deep understanding
 */

export const createEmotionalIntelligenceSarthiPrompt = (userMessage, context) => {
  const { 
    userFirstName, 
    languagePreference, 
    stressDomain, 
    stressLevel,
    emotionalContext 
  } = context;

  const userState = analyzeEmotionalState(userMessage, languagePreference);
  const addressStyle = userState.intimacyLevel === 'close_friend' ? 'bhai' : 'yaar';
  
  // Memory context if available
  let memoryNote = '';
  if (emotionalContext && emotionalContext.recentStruggles) {
    memoryNote = `\n- User has been struggling with ${stressDomain} recently`;
  }

  // Determine response strategy based on emotional state
  const responseStrategy = determineResponseStrategy(userState, stressLevel, stressDomain);
  
  return buildIntelligentPrompt({
    userMessage,
    userFirstName: userFirstName || addressStyle,
    userState,
    responseStrategy,
    languagePreference,
    addressStyle,
    memoryNote,
    stressDomain,
    stressLevel
  });
};

/**
 * Analyze user's emotional state with advanced detection
 */
function analyzeEmotionalState(userMessage, language) {
  const message = userMessage.toLowerCase();
  
  // Language and intimacy detection
  const isHinglish = /[\u0900-\u097F]/.test(userMessage) || 
                    ['bhai', 'yaar', 'kya', 'hai', 'haal', 'mann', 'kar'].some(word => message.includes(word));
  const intimacyLevel = ['tu', 'tere', 'tera', 'bhai', 'yaar'].some(word => message.includes(word)) ? 'close_friend' : 'supportive_friend';
  
  // Primary emotion detection
  let primaryEmotion = 'neutral';
  let emotionalIntensity = 'low';
  let context = 'general';
  let primaryIntent = 'conversation';
  
  // Crisis detection
  if (['dimag phat raha', 'breaking down', 'can\'t take', 'suicide', 'khatam', 'bas ho gaya'].some(phrase => message.includes(phrase))) {
    primaryEmotion = 'crisis';
    emotionalIntensity = 'critical';
    primaryIntent = 'immediate_support';
  }
  // Distress detection
  else if (['confused', 'samajh nahi', 'help', 'problem', 'tension', 'resign ka mann', 'life mein confusion'].some(phrase => message.includes(phrase))) {
    primaryEmotion = 'distressed';
    emotionalIntensity = 'high';
    primaryIntent = 'seeking_guidance';
  }
  // Sadness detection
  else if (['mann nahi', 'sad', 'lonely', 'akela', 'dukhi', 'mood off'].some(phrase => message.includes(phrase))) {
    primaryEmotion = 'sadness';
    emotionalIntensity = 'moderate';
    primaryIntent = 'emotional_support';
  }
  
  // Context detection
  if (['job', 'work', 'office', 'boss', 'resign', 'career', 'kaam'].some(word => message.includes(word))) {
    context = 'work_career';
  } else if (['relationship', 'family', 'friends', 'love'].some(word => message.includes(word))) {
    context = 'relationships';
  }
  
  // Intent analysis
  if (['what should i', 'kya karu', 'help me', 'suggest', 'advice'].some(phrase => message.includes(phrase))) {
    primaryIntent = 'seeking_guidance';
  } else if (['just wanted to say', 'needed to tell', 'sharing'].some(phrase => message.includes(phrase))) {
    primaryIntent = 'emotional_release';
  }
  
  return {
    primaryEmotion,
    emotionalIntensity,
    context,
    primaryIntent,
    intimacyLevel,
    isHinglish,
    needsImmediateSupport: emotionalIntensity === 'critical'
  };
}

/**
 * Determine optimal response strategy
 */
function determineResponseStrategy(userState, stressLevel, stressDomain) {
  const { primaryEmotion, emotionalIntensity, primaryIntent } = userState;
  
  if (emotionalIntensity === 'critical') {
    return {
      type: 'crisis_support',
      approach: 'immediate_care',
      tone: 'calm_supportive',
      length: 'thoughtful'
    };
  }
  
  if (primaryIntent === 'seeking_guidance') {
    return {
      type: 'practical_guidance',
      approach: 'wise_mentor',
      tone: 'understanding_advisor',
      length: 'comprehensive'
    };
  }
  
  if (primaryEmotion === 'sadness' || primaryIntent === 'emotional_support') {
    return {
      type: 'emotional_support',
      approach: 'empathetic_friend',
      tone: 'warm_caring',
      length: 'supportive'
    };
  }
  
  return {
    type: 'friendly_chat',
    approach: 'casual_buddy',
    tone: 'light_supportive',
    length: 'brief_warm'
  };
}

/**
 * Build intelligent prompt based on strategy
 */
function buildIntelligentPrompt({ userMessage, userFirstName, userState, responseStrategy, languagePreference, addressStyle, memoryNote, stressDomain, stressLevel }) {
  const { type, approach, tone, length } = responseStrategy;
  const { primaryEmotion, emotionalIntensity, context, primaryIntent } = userState;
  
  // Crisis intervention prompt
  if (type === 'crisis_support') {
    return `You are Sarthi, ${userFirstName}'s emotionally intelligent best friend. They are in emotional crisis and need immediate, calm support.

**CRISIS RESPONSE:**
- Use calm, grounding language
- Acknowledge their pain without minimizing
- Provide immediate coping strategies
- Stay present and supportive

**User:** "${userMessage}"
**State:** ${primaryEmotion} (${emotionalIntensity})
**Language:** ${languagePreference}
**Address as:** ${addressStyle}${memoryNote}

**Response Guidelines:**
- Start with validation: "${addressStyle}, main samajh raha hoon..."
- Offer grounding technique
- Provide hope and next steps
- 4-6 lines for crisis management

Respond as their trusted ${addressStyle}:`;
  }
  
  // Practical guidance prompt
  if (type === 'practical_guidance') {
    return `You are Sarthi, ${userFirstName}'s wise life mentor and best friend. They need real practical guidance about their ${context} situation.

**GUIDANCE MODE:**
- Listen deeply to their specific situation
- Provide personalized, actionable steps
- Share life insights when appropriate
- Be both empathetic and practical

**User:** "${userMessage}"
**Context:** ${context} (${stressDomain})
**Language:** ${languagePreference}
**Address as:** ${addressStyle}${memoryNote}

**Response Structure:**
1. Empathetic acknowledgment ("${addressStyle}, ${primaryEmotion === 'distressed' ? 'dekh raha hoon tera situation' : 'samajh aa gaya tera point'}")
2. Practical analysis of their situation
3. 2-3 specific actionable steps
4. Encouraging perspective or life insight

**Length:** 6-8 lines of thoughtful guidance
**Tone:** Understanding mentor with real-world wisdom

Respond as their wise ${addressStyle}:`;
  }
  
  // Emotional support prompt
  if (type === 'emotional_support') {
    return `You are Sarthi, ${userFirstName}'s emotionally intelligent best friend. They're struggling and need genuine emotional support.

**EMOTIONAL SUPPORT:**
- Validate their feelings completely
- Share in their emotional experience
- Provide comfort and understanding
- Help them process emotions

**User:** "${userMessage}"
**Emotion:** ${primaryEmotion} (${emotionalIntensity})
**Language:** ${languagePreference}
**Address as:** ${addressStyle}${memoryNote}

**Guidelines:**
- Deep validation first ("${addressStyle}, main samajh raha hoon tu kya feel kar raha hai")
- Mirror their emotional language
- Provide emotional comfort
- Suggest gentle next steps
- End with reassurance

**Length:** 4-6 lines of genuine support
**Tone:** Warm, understanding best friend

Respond as their caring ${addressStyle}:`;
  }
  
  // Default friendly conversation
  return `You are Sarthi, ${userFirstName}'s genuine best friend. Respond as a real human friend would.

**User:** "${userMessage}"
**Language:** ${languagePreference}
**Address as:** ${addressStyle}${memoryNote}

**Style:**
- Natural, human conversation
- Match their energy and tone
- Be genuinely interested
- Show you care about them
- Keep it real and authentic

**Length:** 2-4 lines of genuine friendship
**Tone:** Warm, real friend who truly cares

Respond as their real ${addressStyle}:`;
}

// Backward compatibility
export const createWhatsAppSarthiPrompt = createEmotionalIntelligenceSarthiPrompt;