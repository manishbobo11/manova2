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
 * Generate therapeutic support response based on user's input
 * @param {Object} supportData - The therapeutic support data
 * @param {string} supportData.questionText - The original survey question
 * @param {string} supportData.userAnswer - User's selected response
 * @param {Array} supportData.contributors - Array of stress contributors selected
 * @param {string} supportData.userNote - User's additional text input
 * @returns {Promise<Object>} Therapeutic support response with 5 fields
 */
export const generateTherapistSupport = async (supportData) => {
  try {
    const { questionText, userAnswer, contributors, userNote } = supportData;

    console.log('🧠 Generating therapist support for:', {
      hasContributors: contributors && contributors.length > 0,
      hasUserNote: !!userNote,
      contributorsCount: contributors?.length || 0
    });

    // Create the therapist support prompt
    const therapistPrompt = `
You are a licensed therapist providing compassionate support to a client. Based on their wellness survey response, provide therapeutic guidance.

Context:
Question: "${questionText}"
User's Answer: "${userAnswer}"
${contributors && contributors.length > 0 ? `Stress Contributors: ${contributors.join(', ')}` : ''}
${userNote ? `Additional Note: "${userNote}"` : ''}

Provide a therapeutic response with exactly these 5 components:

1. A warm, empathetic opening that acknowledges their experience
2. Validation that normalizes their feelings in this situation
3. Two simple, personalized action steps they can take
4. A gentle self-care reminder
5. Professional insight on how this approach can reduce their stress

✅ Output only valid JSON in this format:
{
  "supportMessage": "Warm, therapist-like empathetic message here",
  "validation": "Normalize their feelings based on the situation",
  "actionSteps": ["Action 1", "Action 2"],
  "compassionReminder": "Gentle self-care message",
  "therapistInsight": "Professional insight on stress reduction"
}
Do not include anything else.
`;

    // Azure OpenAI configuration
    const azureKey = process.env.AZURE_OPENAI_API_KEY || process.env.VITE_AZURE_OPENAI_KEY;
    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || process.env.VITE_AZURE_OPENAI_ENDPOINT;
    const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || process.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME;
    const azureVersion = process.env.AZURE_OPENAI_API_VERSION || process.env.VITE_AZURE_OPENAI_API_VERSION;

    if (!azureKey || !azureEndpoint || !azureDeployment) {
      console.warn('⚠️ Missing Azure OpenAI configuration, using fallback support');
      return generateFallbackTherapistSupport(supportData);
    }

    console.log('📡 Calling Azure OpenAI for therapist support...');

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
            content: "You are a licensed therapist providing compassionate, professional mental health support. Your responses should be warm, validating, and therapeutically sound." 
          },
          { 
            role: "user", 
            content: therapistPrompt 
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
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
    console.log('🤖 Raw therapist support response:', rawResponse);

    // Parse and clean JSON response
    let cleanedResponse = rawResponse;
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
    }
    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
    }
    
    const parsedSupport = JSON.parse(cleanedResponse);
    
    // Validate the response structure
    const requiredFields = ['supportMessage', 'validation', 'actionSteps', 'compassionReminder', 'therapistInsight'];
    const missingFields = requiredFields.filter(field => !parsedSupport[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Invalid support structure - missing fields: ${missingFields.join(', ')}`);
    }

    if (!Array.isArray(parsedSupport.actionSteps)) {
      throw new Error('Invalid support structure - actionSteps must be an array');
    }

    console.log('✅ Therapist support generated successfully');

    return {
      success: true,
      ...parsedSupport,
      generated: 'ai',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Therapist support generation failed:', error.message);
    console.log('🔄 Using fallback therapist support');
    
    return generateFallbackTherapistSupport(supportData);
  }
};

/**
 * Generate fallback therapist support when AI fails
 * @param {Object} supportData - The therapeutic support data
 * @returns {Object} Fallback therapeutic support response
 */
const generateFallbackTherapistSupport = (supportData) => {
  const { questionText, userAnswer, contributors, userNote } = supportData;

  console.log('🔄 Generating fallback therapist support');

  // Determine stress level based on answer
  const isHighStress = userAnswer && (
    userAnswer.toLowerCase().includes('very often') ||
    userAnswer.toLowerCase().includes('always') ||
    userAnswer.toLowerCase().includes('extremely') ||
    userAnswer.toLowerCase().includes('completely')
  );

  const isLowStress = userAnswer && (
    userAnswer.toLowerCase().includes('never') ||
    userAnswer.toLowerCase().includes('rarely') ||
    userAnswer.toLowerCase().includes('not at all')
  );

  // Generate contextual support based on stress level and contributors
  let supportMessage, validation, actionSteps, compassionReminder, therapistInsight;

  if (isHighStress) {
    supportMessage = "I can hear that you're experiencing significant stress right now, and I want you to know that reaching out and reflecting on these feelings takes courage.";
    validation = "What you're feeling is completely understandable given the challenges you're facing. Many people experience similar struggles, and your emotional response is a normal reaction to difficult circumstances.";
    actionSteps = [
      "Take three deep breaths right now, focusing on slowing down your exhale",
      "Identify one small thing you can do today to reduce pressure on yourself"
    ];
    compassionReminder = "Remember that you're doing the best you can with the resources you have right now. Be gentle with yourself as you navigate this challenging time.";
    therapistInsight = "By acknowledging your stress and taking small, manageable steps, you're building emotional resilience and breaking the cycle of overwhelm that often intensifies our stress response.";
  } else if (isLowStress) {
    supportMessage = "It's wonderful that you're feeling relatively stable in this area. Recognizing and maintaining your well-being is just as important as addressing challenges.";
    validation = "Your sense of balance and control in this situation is a strength worth acknowledging. It's normal to have areas of life that feel more manageable than others.";
    actionSteps = [
      "Take a moment to appreciate what's working well for you in this area",
      "Consider how you might apply these successful strategies to other challenging areas of your life"
    ];
    compassionReminder = "Continue to nurture the positive patterns that are serving you well. Your emotional stability is a valuable resource.";
    therapistInsight = "Recognizing your areas of strength helps build confidence and provides a foundation for addressing other challenges with greater resilience and self-assurance.";
  } else {
    supportMessage = "Thank you for sharing your experience with me. It takes self-awareness to recognize and reflect on how different situations affect your well-being.";
    validation = "Your feelings about this situation are valid and important. It's completely normal to have mixed or moderate responses to life's challenges.";
    actionSteps = [
      "Spend a few minutes journaling about what specifically feels challenging in this area",
      "Reach out to someone you trust to share your thoughts and feelings"
    ];
    compassionReminder = "Give yourself permission to feel whatever comes up without judgment. Your emotional experience deserves attention and care.";
    therapistInsight = "By exploring your emotions with curiosity rather than judgment, you're developing emotional intelligence that will serve you well in managing future challenges.";
  }

  // Incorporate contributors if available
  if (contributors && contributors.length > 0) {
    const contributorContext = contributors.join(', ').toLowerCase();
    if (contributorContext.includes('work') || contributorContext.includes('career')) {
      actionSteps[1] = "Set one clear boundary between your work and personal time today";
    } else if (contributorContext.includes('financial') || contributorContext.includes('money')) {
      actionSteps[1] = "Write down three small expenses you could reduce this week";
    } else if (contributorContext.includes('relationship') || contributorContext.includes('social')) {
      actionSteps[1] = "Send a kind message to someone who makes you feel supported";
    }
  }

  // Incorporate user note if available
  if (userNote && userNote.trim().length > 0) {
    supportMessage += ` Your additional thoughts show great self-reflection and awareness.`;
  }

  console.log('✅ Fallback therapist support generated');

  return {
    success: true,
    supportMessage,
    validation,
    actionSteps,
    compassionReminder,
    therapistInsight,
    generated: 'fallback',
    timestamp: new Date().toISOString()
  };
};

export default {
  generateDeepDiveAnalysis,
  shouldGenerateDeepDive,
  formatDeepDiveForUI,
  generateTherapistSupport
};