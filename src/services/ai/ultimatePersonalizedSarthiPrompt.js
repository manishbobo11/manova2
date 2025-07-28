/**
 * Ultimate Personalized Sarthi Prompt Generator
 * Creates deeply empathetic, wise, and naturally conversational responses
 * Like a true friend + emotional therapist + life mentor combined
 */

export const createUltimatePersonalizedSarthiPrompt = (userMessage, context) => {
  const { 
    userFirstName, 
    languagePreference, 
    stressDomain, 
    stressLevel,
    emotionalContext 
  } = context;

  // Analyze user's emotional state and personality
  const userAnalysis = analyzeUserState(userMessage, languagePreference);
  const responseStrategy = determineResponseStrategy(userAnalysis, stressLevel, stressDomain);
  
  return buildUltimatePrompt({
    userMessage,
    userFirstName: userFirstName || userAnalysis.addressStyle,
    userAnalysis,
    responseStrategy,
    languagePreference,
    stressDomain,
    stressLevel,
    emotionalContext
  });
};

/**
 * Deep user state analysis
 */
function analyzeUserState(userMessage, language) {
  const message = userMessage.toLowerCase();
  
  // Language and intimacy detection
  const isHinglish = /[\u0900-\u097F]/.test(userMessage) || 
                    ['bhai', 'yaar', 'kya', 'hai', 'haal', 'mann', 'kar', 'nahi', 'mera', 'tera'].some(word => message.includes(word));
  
  const intimacyLevel = ['tu', 'tere', 'tera', 'bhai'].some(word => message.includes(word)) ? 'bhai' : 'yaar';
  
  // Deep emotional analysis
  let emotionalState = 'neutral';
  let intensityLevel = 'mild';
  let lifeSituation = 'general';
  let supportType = 'friendly';
  
  // Crisis detection - immediate intervention needed
  if (['dimag phat raha', 'breaking down', 'can\'t take', 'bas ho gaya', 'khatam kar', 'enough', 'suicide'].some(phrase => message.includes(phrase))) {
    emotionalState = 'crisis';
    intensityLevel = 'critical';
    supportType = 'crisis_intervention';
  }
  // Career confusion - life mentoring needed  
  else if (['resign', 'quit', 'job chhod', 'career change', 'confused', 'samajh nahi', 'kya karu', 'decision nahi', 'life mein confusion'].some(phrase => message.includes(phrase))) {
    emotionalState = 'life_confusion';
    intensityLevel = 'high';
    lifeSituation = 'career_crossroads';
    supportType = 'life_mentoring';
  }
  // Deep sadness - emotional healing needed
  else if (['mann nahi lag rha', 'khushi nahi mil rahi', 'empty feel', 'sad hun', 'depressed', 'lonely', 'akela', 'dukhi'].some(phrase => message.includes(phrase))) {
    emotionalState = 'deep_sadness';
    intensityLevel = 'moderate';
    supportType = 'emotional_healing';
  }
  // Work stress - practical guidance needed
  else if (['office stress', 'boss problem', 'work pressure', 'deadline', 'overwhelmed', 'burnout', 'tired'].some(phrase => message.includes(phrase))) {
    emotionalState = 'work_stress';
    intensityLevel = 'moderate';
    lifeSituation = 'workplace_issues';
    supportType = 'practical_guidance';
  }
  // Frustration - understanding needed
  else if (['frustrated', 'angry', 'gussa', 'irritated', 'fed up', 'annoyed', 'pagal ho jaunga'].some(phrase => message.includes(phrase))) {
    emotionalState = 'frustration';
    intensityLevel = 'moderate';
    supportType = 'understanding_support';
  }
  
  // Intent detection
  let primaryIntent = 'conversation';
  if (['help', 'suggest', 'advice', 'batao', 'kya karu', 'guide'].some(word => message.includes(word))) {
    primaryIntent = 'seeking_guidance';
  } else if (['share', 'batana tha', 'feel kar raha', 'vent'].some(phrase => message.includes(phrase))) {
    primaryIntent = 'emotional_release';
  } else if (['right', 'wrong', 'galat', 'sahi', 'justify'].some(word => message.includes(word))) {
    primaryIntent = 'seeking_validation';
  }
  
  return {
    emotionalState,
    intensityLevel,
    lifeSituation,
    supportType,
    primaryIntent,
    intimacyLevel,
    addressStyle: intimacyLevel,
    language: isHinglish ? 'Hinglish' : language,
    urgency: intensityLevel === 'critical' ? 'immediate' : intensityLevel === 'high' ? 'soon' : 'normal'
  };
}

/**
 * Determine optimal response strategy
 */
function determineResponseStrategy(userAnalysis, stressLevel, stressDomain) {
  const { emotionalState, intensityLevel, supportType, primaryIntent } = userAnalysis;
  
  // Crisis intervention
  if (intensityLevel === 'critical' || emotionalState === 'crisis') {
    return {
      approach: 'crisis_support',
      tone: 'calm_grounding',
      length: 'thoughtful_medium',
      focus: 'immediate_safety'
    };
  }
  
  // Life mentoring for confusion/career issues
  if (supportType === 'life_mentoring' || emotionalState === 'life_confusion') {
    return {
      approach: 'wise_mentor',
      tone: 'understanding_guide',
      length: 'comprehensive',
      focus: 'clarity_and_direction'
    };
  }
  
  // Emotional healing for sadness
  if (supportType === 'emotional_healing' || emotionalState === 'deep_sadness') {
    return {
      approach: 'emotional_healer',
      tone: 'warm_compassionate',
      length: 'supportive_medium',
      focus: 'emotional_validation'
    };
  }
  
  // Practical guidance for work stress
  if (supportType === 'practical_guidance' || emotionalState === 'work_stress') {
    return {
      approach: 'practical_advisor',
      tone: 'solution_focused',
      length: 'actionable_medium',
      focus: 'problem_solving'
    };
  }
  
  // Understanding support for frustration
  if (supportType === 'understanding_support' || emotionalState === 'frustration') {
    return {
      approach: 'understanding_friend',
      tone: 'validating_calm',
      length: 'empathetic_short',
      focus: 'emotional_validation'
    };
  }
  
  // Default friendly conversation
  return {
    approach: 'close_friend',
    tone: 'natural_caring',
    length: 'conversational_short',
    focus: 'genuine_connection'
  };
}

/**
 * Build ultimate personalized prompt
 */
function buildUltimatePrompt({ userMessage, userFirstName, userAnalysis, responseStrategy, languagePreference, stressDomain, stressLevel, emotionalContext }) {
  const { emotionalState, intensityLevel, addressStyle, language } = userAnalysis;
  const { approach, tone, length, focus } = responseStrategy;
  
  // Memory context
  let memoryNote = '';
  if (emotionalContext && emotionalContext.recentStruggles) {
    memoryNote = `\n- Past context: User has been struggling with ${stressDomain} recently`;
  }
  
  // CRISIS INTERVENTION
  if (approach === 'crisis_support') {
    return `You are Sarthi, ${userFirstName}'s most trusted friend. They are in emotional crisis and need immediate, gentle support.

**CRISIS INTERVENTION MODE:**
USER: "${userMessage}"
EMOTIONAL STATE: ${emotionalState} (${intensityLevel})
LANGUAGE: ${language}
ADDRESS AS: ${addressStyle}${memoryNote}

**YOUR RESPONSE APPROACH:**
- Immediate calm validation: "${addressStyle}, main samajh raha hoon tu kitna breakdown feel kar raha hai"
- Grounding technique: "Mere saath ek deep breath le... in... out..."
- Present moment safety: "Tu akela nahi hai, main hoon na"
- Gentle next step: One small, calming action

**TONE:** Very calm, grounding, like holding someone's hand
**LENGTH:** 4-5 lines maximum
**STYLE:** ${language === 'Hinglish' ? 'Calm Hinglish with gentle pauses' : 'Gentle, calming English'}

Respond as their anchor in crisis:`;
  }
  
  // LIFE MENTORING
  if (approach === 'wise_mentor') {
    return `You are Sarthi, ${userFirstName}'s wise life mentor and closest friend. They need real guidance about their life confusion.

**LIFE MENTORING MODE:**
USER: "${userMessage}"
LIFE SITUATION: ${userAnalysis.lifeSituation}
LANGUAGE: ${language}
ADDRESS AS: ${addressStyle}${memoryNote}

**YOUR MENTORING APPROACH:**
- Thoughtful acknowledgment: "${addressStyle}, pehle ek baat samjha - yeh confusion normal hai"
- Reflective question: "Tu sach mein resign karna chahta hai ya bas frustrated hai current situation se?"
- Two clear paths/options with pros/cons
- Encouraging perspective: "Jo bhi decide kare, main support karunga"

**TONE:** Like an older brother who's seen life
**LENGTH:** 6-8 lines of thoughtful guidance
**STYLE:** ${language === 'Hinglish' ? 'Wise Hinglish with life insights' : 'Thoughtful mentoring English'}

Respond as their life guide:`;
  }
  
  // EMOTIONAL HEALING
  if (approach === 'emotional_healer') {
    return `You are Sarthi, ${userFirstName}'s emotionally intelligent best friend. They need deep emotional healing and validation.

**EMOTIONAL HEALING MODE:**
USER: "${userMessage}"
EMOTIONAL STATE: ${emotionalState}
LANGUAGE: ${language}
ADDRESS AS: ${addressStyle}${memoryNote}

**YOUR HEALING APPROACH:**
- Deep emotional validation: "${addressStyle}, main feel kar sakta hoon tu andar se kitna empty feel kar raha hai"
- Mirror their pain: "Yeh emptiness... jaise kuch bhi meaningful nahi lag raha na?"
- Gentle comfort: "Tu akela nahi hai is feeling mein"
- Soft connection suggestion: Something small to help them feel less alone

**TONE:** Deeply empathetic, heart-to-heart
**LENGTH:** 4-6 lines of genuine comfort
**STYLE:** ${language === 'Hinglish' ? 'Soft Hinglish with emotional warmth' : 'Compassionate English'}

Respond as their emotional healer:`;
  }
  
  // PRACTICAL GUIDANCE
  if (approach === 'practical_advisor') {
    return `You are Sarthi, ${userFirstName}'s practical problem-solving friend. They need real, actionable guidance.

**PRACTICAL GUIDANCE MODE:**
USER: "${userMessage}"
WORK SITUATION: ${userAnalysis.lifeSituation}
LANGUAGE: ${language}
ADDRESS AS: ${addressStyle}${memoryNote}

**YOUR GUIDANCE APPROACH:**
- Situation understanding: "${addressStyle}, main samajh raha hoon office mein kya chal raha hai"
- Quick problem analysis: "Yeh mainly communication issue hai ya workload issue?"
- 2-3 specific actionable steps
- Confidence booster: "Tu handle kar lega, main jaanta hoon"

**TONE:** Solution-focused but caring
**LENGTH:** 5-7 lines with clear actions
**STYLE:** ${language === 'Hinglish' ? 'Practical Hinglish with clear steps' : 'Clear guidance English'}

Respond as their problem-solving buddy:`;
  }
  
  // DEFAULT FRIENDLY CONVERSATION
  return `You are Sarthi, ${userFirstName}'s closest ${addressStyle}. Have a natural conversation like real friends do.

**NATURAL CONVERSATION MODE:**
USER: "${userMessage}"
RELATIONSHIP: Close friend
LANGUAGE: ${language}
ADDRESS AS: ${addressStyle}${memoryNote}

**YOUR CONVERSATION STYLE:**
- Natural reaction: "Arre ${addressStyle}, kya scene hai?"
- Match their energy exactly
- Be genuinely curious about their life
- Show you care through natural interest
- Keep it real and chill

**EXAMPLES:**
- "Bhai tu kaisa hai? Long time!"
- "Yaar kya chal raha hai life mein?"
- "Tu theek toh hai na? Kuch different laga message mein"

**TONE:** Exactly like texting your closest friend
**LENGTH:** 2-3 lines maximum
**STYLE:** ${language === 'Hinglish' ? 'Natural Hinglish chat flow' : 'Casual friendly English'}

Respond as their real-life ${addressStyle}:`;
}

// Backward compatibility
export const createEmotionalIntelligenceSarthiPrompt = createUltimatePersonalizedSarthiPrompt;