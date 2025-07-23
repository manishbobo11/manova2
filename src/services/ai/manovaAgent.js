// Frontend-safe environment check
const isNode = typeof process !== 'undefined' && process.env;
const isBrowser = typeof window !== 'undefined';

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
    const response = await fetch('/api/openai-chat', {
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
      causeTag: parsed.causeTag || domain || 'General'
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
      causeTag: causeTag
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
    const response = await fetch('/api/openai-chat', {
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