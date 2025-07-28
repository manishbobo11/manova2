/**
 * Deep Dive Analysis Service
 * Provides personalized root cause analysis and coping strategies
 * for high-stress survey responses using Azure OpenAI GPT-4o
 */

/**
 * Generate personalized deep-dive prompt template
 * @param {Object} data - The analysis data
 * @param {string} data.question - The survey question
 * @param {string} data.answer - User's answer
 * @param {number} data.stressScore - Stress score (1-10)
 * @param {string} data.emotion - Detected emotion
 * @param {string} data.intensity - Stress intensity level
 * @returns {string} Formatted deep-dive prompt
 */
const generateDeepDivePrompt = ({ question, answer, stressScore, emotion, intensity }) => `
You are a compassionate mental wellness expert helping users explore their emotional challenges.

Question: "${question}"
User Response: "${answer}"
Stress Score: ${stressScore}/10
Emotion: ${emotion}
Intensity: ${intensity}

Based on this response: "${answer}", return top 3 root-level stress contributors that could explain their emotional discomfort. Each contributor should be short and specific.

Also provide 3 personalized coping strategies that are practical and emotionally intelligent.

✅ Output only valid JSON in this format:
{
  "causes": ["Cause 1", "Cause 2", "Cause 3"],
  "solutions": ["Tip 1", "Tip 2", "Tip 3"]
}
Do not include anything else.
`;

/**
 * Generate personalized deep-dive analysis for high-stress responses
 * @param {Object} analysisData - The stress analysis data
 * @param {string} analysisData.question - The survey question
 * @param {string} analysisData.answer - User's answer
 * @param {number} analysisData.stressScore - Stress score (1-10)
 * @param {string} analysisData.emotion - Detected emotion
 * @param {string} analysisData.intensity - Stress intensity level
 * @param {string} analysisData.domain - Wellness domain
 * @returns {Promise<Object>} Deep dive analysis with causes and solutions
 */
export const generateDeepDiveAnalysis = async (analysisData) => {
  try {
    const {
      question,
      answer,
      stressScore,
      emotion,
      intensity,
      domain
    } = analysisData;

    console.log('🧠 Generating deep-dive analysis for:', {
      domain,
      stressScore,
      emotion,
      intensity
    });

    // Create the personalized deep-dive prompt using the improved template
    const deepDivePrompt = generateDeepDivePrompt({
      question,
      answer,
      stressScore,
      emotion,
      intensity
    });

    // Azure OpenAI configuration
    const azureKey = process.env.AZURE_OPENAI_API_KEY || process.env.VITE_AZURE_OPENAI_KEY;
    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || process.env.VITE_AZURE_OPENAI_ENDPOINT;
    const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || process.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME;
    const azureVersion = process.env.AZURE_OPENAI_API_VERSION || process.env.VITE_AZURE_OPENAI_API_VERSION;

    if (!azureKey || !azureEndpoint || !azureDeployment) {
      console.warn('⚠️ Missing Azure OpenAI configuration, using fallback analysis');
      return generateFallbackAnalysis(analysisData);
    }

    console.log('📡 Calling Azure OpenAI for deep-dive analysis...');

    // Call Azure OpenAI GPT-4o
    const endpoint = `${azureEndpoint}/openai/deployments/${azureDeployment}/chat/completions?api-version=${azureVersion}`;
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": azureKey
      },
      body: JSON.stringify({
        messages: [
          { 
            role: "system", 
            content: "You are a compassionate wellness coach and mental health expert. Provide insightful, practical guidance in JSON format." 
          },
          { 
            role: "user", 
            content: deepDivePrompt 
          }
        ],
        temperature: 0.7,
        max_tokens: 400,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Azure OpenAI error:', errorData);
      throw new Error(`Azure OpenAI API failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response structure from Azure OpenAI');
    }

    const rawResponse = data.choices[0].message.content.trim();
    console.log('🤖 Raw deep-dive response:', rawResponse);

    // Parse and clean JSON response
    let cleanedResponse = rawResponse;
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
    }
    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
    }
    
    const parsedAnalysis = JSON.parse(cleanedResponse);
    
    // Validate the response structure
    if (!parsedAnalysis.causes || !parsedAnalysis.solutions) {
      throw new Error('Invalid analysis structure - missing causes or solutions');
    }

    if (!Array.isArray(parsedAnalysis.causes) || !Array.isArray(parsedAnalysis.solutions)) {
      throw new Error('Invalid analysis structure - causes and solutions must be arrays');
    }

    console.log('✅ Deep-dive analysis generated successfully:', {
      causesCount: parsedAnalysis.causes.length,
      solutionsCount: parsedAnalysis.solutions.length
    });

    return {
      success: true,
      causes: parsedAnalysis.causes,
      solutions: parsedAnalysis.solutions,
      generated: 'ai',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Deep-dive analysis failed:', error.message);
    console.log('🔄 Using fallback analysis');
    
    return generateFallbackAnalysis(analysisData);
  }
};

/**
 * Generate fallback deep-dive analysis when AI fails
 * @param {Object} analysisData - The stress analysis data
 * @returns {Object} Fallback analysis with generic causes and solutions
 */
const generateFallbackAnalysis = (analysisData) => {
  const { domain, stressScore, emotion, intensity } = analysisData;

  console.log('🔄 Generating fallback deep-dive analysis');

  // Domain-specific fallback causes and solutions
  const fallbackData = {
    'Work & Career': {
      causes: [
        'Heavy workload and unrealistic deadlines creating chronic pressure',
        'Lack of work-life balance leading to burnout and exhaustion',
        'Unclear expectations or insufficient support from management'
      ],
      solutions: [
        'Practice time-blocking to prioritize urgent tasks and set boundaries',
        'Communicate with your supervisor about workload concerns and seek support',
        'Take short breaks every hour to reset your mental energy'
      ]
    },
    'Financial Security': {
      causes: [
        'Insufficient emergency savings creating anxiety about unexpected expenses',
        'Monthly expenses exceeding income leading to ongoing financial stress',
        'Lack of clear financial planning causing uncertainty about the future'
      ],
      solutions: [
        'Create a simple budget to track spending and identify areas to cut costs',
        'Start small by saving $1-5 per day to build an emergency fund gradually',
        'Consider speaking with a financial counselor or using budgeting apps'
      ]
    },
    'Personal Relationships': {
      causes: [
        'Communication breakdowns leading to misunderstandings and conflict',
        'Unmet emotional needs creating feelings of isolation or resentment',
        'Different life goals or values causing relationship tension'
      ],
      solutions: [
        'Practice active listening and express your needs clearly and kindly',
        'Schedule regular check-ins with important people in your life',
        'Consider couples or family counseling if conflicts persist'
      ]
    },
    'Health & Wellness': {
      causes: [
        'Chronic stress weakening immune system and overall physical health',
        'Poor sleep patterns disrupting emotional regulation and energy levels',
        'Neglecting self-care due to overwhelming responsibilities'
      ],
      solutions: [
        'Establish a consistent sleep schedule and create a calming bedtime routine',
        'Start with 10-15 minutes of daily movement or gentle exercise',
        'Practice deep breathing exercises when feeling overwhelmed'
      ]
    }
  };

  // Get domain-specific data or use generic fallback
  const domainData = fallbackData[domain] || {
    causes: [
      'Overwhelming responsibilities creating chronic stress and anxiety',
      'Lack of effective coping strategies for managing difficult situations',
      'Insufficient support systems during challenging times'
    ],
    solutions: [
      'Break large problems into smaller, manageable steps',
      'Reach out to trusted friends, family, or professionals for support',
      'Practice mindfulness or relaxation techniques to manage stress'
    ]
  };

  console.log('✅ Fallback deep-dive analysis generated');

  return {
    success: true,
    causes: domainData.causes,
    solutions: domainData.solutions,
    generated: 'fallback',
    timestamp: new Date().toISOString()
  };
};

/**
 * Validate if a response qualifies for deep-dive analysis
 * @param {Object} stressAnalysis - The stress analysis result
 * @returns {boolean} Whether deep-dive analysis should be generated
 */
export const shouldGenerateDeepDive = (stressAnalysis) => {
  const stressScore = stressAnalysis.enhanced?.score || stressAnalysis.score || 0;
  const intensity = stressAnalysis.enhanced?.intensity || stressAnalysis.intensity || 'Low';
  
  // Generate deep-dive for high stress scores (7+) or high intensity
  return stressScore >= 7 || intensity === 'High';
};

/**
 * Format deep-dive analysis for frontend display
 * @param {Object} analysis - The deep-dive analysis result
 * @param {Object} responseData - Original response data
 * @returns {Object} Formatted analysis for UI
 */
export const formatDeepDiveForUI = (analysis, responseData) => {
  return {
    questionId: responseData.questionId,
    domain: responseData.domain,
    stressLevel: 'high',
    analysis: {
      causes: analysis.causes,
      solutions: analysis.solutions,
      generatedBy: analysis.generated,
      timestamp: analysis.timestamp
    },
    recommendations: {
      immediate: analysis.solutions.slice(0, 2), // First 2 solutions as immediate actions
      longTerm: analysis.solutions.slice(2), // Remaining solutions as long-term
      severity: 'high',
      followUp: analysis.generated === 'ai' ? 'Consider speaking with a mental health professional if stress persists' : 'Professional support may be beneficial for ongoing concerns'
    }
  };
};

/**
 * Generate enhanced therapeutic support response with contextual empathy
 * @param {string} userMessage - The user's written text describing their feelings
 * @param {Array} selectedContributors - Dropdown selections (e.g., ["boss", "self-doubt", "relationship"])  
 * @param {Array} emotionHistory - Last 3 vector entries from Pinecone emotional history
 * @returns {Promise<string>} Wise mentor-style therapeutic response in user's language
 */
export const generateTherapistSupport = async (userMessage, selectedContributors = [], emotionHistory = []) => {
  try {
    console.log('🧠 Generating enhanced therapist support:', {
      hasUserMessage: !!userMessage,
      contributorsCount: selectedContributors.length,
      historyCount: emotionHistory.length
    });

    // Import language detection from manovaAgent
    const { detectLanguagePreference } = await import('./ai/manovaAgent.js');
    
    // Detect user's language preference from their message
    const userLanguage = detectLanguagePreference(userMessage);
    const isHinglish = userLanguage === 'Hinglish';
    const isHindi = userLanguage === 'Hindi';
    
    console.log(`🗣️ Detected language: ${userLanguage}`);

    // Check if we have enough context or should use fallback
    if (!userMessage || userMessage.trim().length === 0) {
      return generateTherapistFallback(userLanguage);
    }

    if (emotionHistory.length === 0) {
      return generateTherapistFallback(userLanguage);
    }

    // Analyze emotional patterns from history
    const emotionalContext = analyzeEmotionalPatterns(emotionHistory);
    
    // Create context-aware therapeutic prompt
    const therapeuticPrompt = createTherapeuticPrompt(
      userMessage, 
      selectedContributors, 
      emotionalContext,
      userLanguage
    );

    // Call Azure OpenAI for therapeutic response
    const therapeuticResponse = await callAzureForTherapy(therapeuticPrompt);
    
    if (!therapeuticResponse) {
      return generateTherapistFallback(userLanguage);
    }

    console.log('✅ Enhanced therapist support generated successfully');
    return therapeuticResponse;

  } catch (error) {
    console.error('❌ Enhanced therapist support generation failed:', error.message);
    const { detectLanguagePreference } = await import('./ai/manovaAgent.js');
    const userLanguage = detectLanguagePreference(userMessage || '');
    return generateTherapistFallback(userLanguage);
  }
};

/**
 * Analyze emotional patterns from user's vector history
 * @param {Array} emotionHistory - Last 3 vector entries from Pinecone
 * @returns {Object} Analyzed emotional context
 */
const analyzeEmotionalPatterns = (emotionHistory) => {
  if (!emotionHistory || emotionHistory.length === 0) {
    return {
      recentPatterns: 'This is our first conversation',
      dominantStressors: [],
      emotionalIntensity: 'moderate',
      recurringThemes: []
    };
  }

  // Extract stress domains and scores
  const stressDomains = emotionHistory.map(entry => entry.metadata?.domain || 'general');
  const stressScores = emotionHistory.map(entry => entry.metadata?.stressScore || 0);
  const emotions = emotionHistory.map(entry => entry.metadata?.emotion || 'neutral');
  
  // Calculate dominant patterns
  const domainCounts = {};
  stressDomains.forEach(domain => {
    domainCounts[domain] = (domainCounts[domain] || 0) + 1;
  });
  
  const dominantStressors = Object.entries(domainCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([domain]) => domain);
  
  const avgStressScore = stressScores.reduce((sum, score) => sum + score, 0) / stressScores.length;
  const emotionalIntensity = avgStressScore >= 7 ? 'high' : avgStressScore >= 4 ? 'moderate' : 'low';
  
  const recentConcerns = emotionHistory
    .filter(entry => entry.metadata?.stressScore >= 5)
    .map(entry => `${entry.metadata?.domain}: ${entry.metadata?.emotion}`)
    .slice(0, 2);

  return {
    recentPatterns: recentConcerns.length > 0 ? 
      `Recent stress in: ${recentConcerns.join(', ')}` : 
      'Generally managing stress well',
    dominantStressors,
    emotionalIntensity,
    recurringThemes: stressDomains,
    avgStressLevel: avgStressScore
  };
};

/**
 * Create therapeutic prompt with emotional context and language awareness
 */
const createTherapeuticPrompt = (userMessage, selectedContributors, emotionalContext, userLanguage) => {
  const contributorsText = selectedContributors.length > 0 ? 
    `\nCurrent stress contributors: ${selectedContributors.join(', ')}` : '';
  
  const emotionalHistoryText = emotionalContext.recentPatterns !== 'This is our first conversation' ?
    `\nEmotional history context: ${emotionalContext.recentPatterns}
Recent stress patterns: ${emotionalContext.dominantStressors.join(', ')}
Emotional intensity level: ${emotionalContext.emotionalIntensity}` : '';

  const languageInstructions = userLanguage === 'Hinglish' ? 
    'Respond in natural Hinglish (Hindi-English mix) like "Main samajh raha hoon", "Tu strong hai", etc.' :
    userLanguage === 'Hindi' ? 
    'Respond in natural Hindi like a caring friend would speak.' :
    'Respond in warm, natural English.';

  return `You are a wise mentor and therapist who deeply understands human emotions. You combine professional insight with the warmth of someone who truly believes in the user.

User's current message: "${userMessage}"${contributorsText}${emotionalHistoryText}

Your task is to provide therapeutic support in exactly 2 parts:

PART 1 - EMPATHIZE: Start with deep emotional validation that shows you understand what they're going through. Use emotional cues from their message and acknowledge their specific situation with genuine care.

PART 2 - GUIDE: Suggest ONE small, realistic coping idea that's specific to their situation. Make it actionable and domain-specific (e.g., "write a boundary message to your boss", "journal what you felt today", "can you take one step toward what feels right?").

IMPORTANT RULES:
- ${languageInstructions}
- Be a wise mentor who believes in them, not a generic counselor
- Never give "you'll be fine" responses - instead validate emotions and guide clearly
- Your response should feel like someone who truly understands and has wisdom to share
- Keep total response to 3-4 sentences maximum
- Make the coping suggestion very specific and immediately actionable

Response format: Just provide the therapeutic response directly, no JSON or formatting.`;
};

/**
 * Call Azure OpenAI for therapeutic response generation
 */
const callAzureForTherapy = async (therapeuticPrompt) => {
  try {
    // Azure OpenAI configuration
    const azureKey = process.env.AZURE_OPENAI_API_KEY || process.env.VITE_AZURE_OPENAI_KEY;
    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || process.env.VITE_AZURE_OPENAI_ENDPOINT;
    const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || process.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME;
    const azureVersion = process.env.AZURE_OPENAI_API_VERSION || process.env.VITE_AZURE_OPENAI_API_VERSION;

    if (!azureKey || !azureEndpoint || !azureDeployment) {
      console.warn('⚠️ Missing Azure OpenAI configuration');
      return null;
    }

    console.log('📡 Calling Azure OpenAI for enhanced therapeutic response...');

    const endpoint = `${azureEndpoint}/openai/deployments/${azureDeployment}/chat/completions?api-version=${azureVersion}`;
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": azureKey
      },
      body: JSON.stringify({
        messages: [
          { 
            role: "system", 
            content: "You are a wise mentor and therapist who combines deep emotional understanding with practical guidance. Your responses should be warm, validating, and provide clear direction." 
          },
          { 
            role: "user", 
            content: therapeuticPrompt 
          }
        ],
        temperature: 0.8,
        max_tokens: 300,
        stream: false
      })
    });

    if (!response.ok) {
      console.error('❌ Azure OpenAI error:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid response structure from Azure OpenAI');
      return null;
    }

    const therapeuticResponse = data.choices[0].message.content.trim();
    console.log('🤖 Enhanced therapeutic response generated');
    
    return therapeuticResponse;

  } catch (error) {
    console.error('❌ Azure OpenAI call failed:', error.message);
    return null;
  }
};

/**
 * Generate fallback therapeutic response when AI fails or no context available
 * @param {string} userLanguage - Detected user language (English, Hindi, Hinglish)
 * @returns {string} Fallback therapeutic response
 */
const generateTherapistFallback = (userLanguage) => {
  console.log('🔄 Generating fallback therapeutic response');
  
  if (userLanguage === 'Hinglish') {
    return "Main samajh raha hoon, yeh thoda heavy lag raha hoga. Tera saath hoon — ab bol, ek choti si shuruaat kya ho sakti hai?";
  } else if (userLanguage === 'Hindi') {
    return "मैं समझ रहा हूं, यह थोड़ा भारी लग रहा होगा। तुम्हारे साथ हूं — अब बताओ, एक छोटी सी शुरुआत क्या हो सकती है?";
  } else {
    return "I can sense this feels heavy right now. I'm here with you — tell me, what could be one small step to start with?";
  }
};


export default {
  generateDeepDiveAnalysis,
  shouldGenerateDeepDive,
  formatDeepDiveForUI,
  generateTherapistSupport
};