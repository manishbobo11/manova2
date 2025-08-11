import { ContextStore } from './firebase';
import { toFirestoreSafe } from '../utils/firestoreSafe';
import { getCheckinHistory } from './userSurveyHistory';
import { contextualMemoryBuilder } from './userContextBuilder';
import { apiFetch } from '../lib/api';

function getDeepDivePrompt(domain, answers) {
  const context = answers.map(a => `Q: ${a.id}, Score: ${a.answer}`).join('\n');
  return `
You are an AI mental wellness assistant helping understand stress patterns in the domain: "${domain}".

Based on the following responses:
${context}

Return ONLY a valid JSON object with this exact structure:
{
  "checkboxes": ["Possible reasons like workload, recognition issues"],
  "textboxPrompt": "Share anything else that may be on your mind?",
  "rootEmotion": "e.g., frustration, helplessness, etc."
}

Do not include any explanations, markdown, or anything else. Only return the JSON object.`.trim();
}

function extractValidJSON(text) {
  const jsonRegex = /```json([\s\S]*?)```/;
  const match = text.match(jsonRegex);

  try {
    if (match && match[1]) {
      return JSON.parse(match[1].trim());
    } else {
      // Try to parse the entire text if no ```json block
      return JSON.parse(text);
    }
  } catch (err) {
    console.error('Failed to parse JSON:', err);
    throw new Error('Unable to parse valid JSON from GPT response');
  }
}

class MCPService {
  constructor() {
    this.systemPrompt = `You are an empathetic AI wellness assistant. Use the provided user context to personalize your responses.
    Always maintain a supportive and understanding tone. Never share or reference specific personal details from the context unless the user brings them up first.`;
  }

  async _callOpenAIChat(prompt) {
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      throw new Error('Prompt must be a valid non-empty string');
    }

    const response = await apiFetch('/api/openai-chat', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error('Failed to parse response from OpenAI backend');
    }

    if (!response.ok) {
      throw new Error(`OpenAI Error: ${data.error || response.statusText}`);
    }

    if (!data.reply || typeof data.reply !== 'string') {
      throw new Error('OpenAI reply is missing or invalid');
    }

    return {
      choices: [{
        message: {
          content: data.reply
        }
      }]
    };
  }

  async generateResponse(userId, userMessage) {
    const context = await ContextStore.getUserContext(userId);
    const messages = [
      { role: 'system', content: this.systemPrompt },
      { role: 'system', content: this._formatContextForPrompt(context) },
      { role: 'user', content: userMessage }
    ];
    const content = await this._callOpenAIChat(messages.map(m => m.content).join('\n'));
    // Update context with new insights
    await this._updateContextWithInsights(userId, context, userMessage, content);
    return content;
  }

  async generateSurveyQuestions(userId) {
    const context = await ContextStore.getUserContext(userId);
    const messages = [
      { role: 'system', content: this.systemPrompt },
      { role: 'system', content: this._formatContextForPrompt(context) },
      { role: 'user', content: 'Generate 3 personalized wellness survey questions based on the user\'s context.' }
    ];
    return await this._callOpenAIChat(messages.map(m => m.content).join('\n'));
  }

  /**
   * Generate an adaptive survey question based on user context and optionally previous answer.
   * If previousAnswer is null, generate an empathetic opening question referencing major stress points.
   * If previousAnswer is provided, generate a follow-up question based on both context and the previous answer.
   */
  async generateAdaptiveSurveyQuestion(userId, previousAnswer = null, previousQuestions = []) {
    const context = await ContextStore.getUserContext(userId);
    let userPrompt;
    if (!previousAnswer) {
      userPrompt = `Given the user's context, generate an empathetic, conversational opening survey question that gently addresses their most significant recent stress triggers or domains. Reference their history and emotional patterns, and make the question feel supportive.`;
    } else {
      userPrompt = `Given the user's context and their last answer: "${previousAnswer}", and the previous questions: [${previousQuestions.map(q => `"${q}"`).join(', ')}], generate a highly personalized, empathetic follow-up survey question. The question should naturally build on their previous response, show understanding, and encourage further reflection or sharing. Do NOT repeat any previous questions.`;
    }
    const messages = [
      { role: 'system', content: this.systemPrompt },
      { role: 'system', content: this._formatContextForPrompt(context) },
      { role: 'user', content: userPrompt }
    ];
    return (await this._callOpenAIChat(messages.map(m => m.content).join('\n'))).trim();
  }

  _formatContextForPrompt(context) {
    if (!context) return 'No previous context available.';
    
    let contextString = `User Context:\n    - Recent Mood: ${context.mood || 'Not recorded'}\n    - Survey History: ${context.surveyHistory?.length || 0} surveys completed\n    - Stress Triggers: ${context.stressTriggers?.join(', ') || 'None identified'}\n    - Coping Strategies: ${context.copingStrategies?.join(', ') || 'None identified'}`;
    
    // Add contextual memory if available
    if (context.contextualMemory) {
      const memory = context.contextualMemory;
      if (memory.input && memory.domain) {
        contextString += `\n    - Recent ${memory.domain} Concerns: ${memory.input}`;
      }
    }
    
    // Add stress patterns if available
    if (context.stressPatterns) {
      const patterns = context.stressPatterns;
      if (patterns.highStressDomains && patterns.highStressDomains.length > 0) {
        contextString += `\n    - High Stress Domains: ${patterns.highStressDomains.join(', ')}`;
      }
      if (patterns.stressIntensity) {
        contextString += `\n    - Overall Stress Intensity: ${patterns.stressIntensity}`;
      }
    }
    
    contextString += `\n    Use this context to personalize your response while maintaining privacy.`;
    return contextString;
  }

  async _updateContextWithInsights(userId, insights) {
    try {
      // Only keep allowed fields in insights
      const allowedFields = ['userId', 'domain', 'reasons', 'customReason', 'timestamp'];
      const safeInsights = {};
      for (const key of allowedFields) {
        if (insights && insights[key] !== undefined) {
          safeInsights[key] = insights[key];
        }
      }
      // Log the safe insights
      console.log('Sanitized insights to save:', JSON.stringify(safeInsights, null, 2));
      // Get current context
      const currentContext = await ContextStore.getUserContext(userId) || {};
      // Update the context with the sanitized insights
      const updatedContext = {
        ...currentContext,
        insights: safeInsights,
        lastUpdated: new Date().toISOString()
      };
      await ContextStore.updateUserContext(userId, updatedContext);
    } catch (error) {
      console.error('Failed to update context with insights:', error);
      // Fallback: do not update insights if sanitization fails
    }
  }

  /**
   * Generate deep dive follow-up options for a domain based on user answers using ManovaAgent stress detection.
   * Returns: { checkboxes: [string], textboxPrompt: string, rootEmotion: string, stressedQuestions: [object] }
   */
  async generateDeepDiveFollowup(domain, answers) {
    // Import ManovaAgent for enhanced psychological stress detection
    const { analyzeEnhancedStress } = await import('./ai/manovaAgent.js');
    
    // Use ManovaAgent to analyze each answer for stress
    const stressedQuestions = [];
    let highestStressLevel = 0;
    let dominantEmotion = 'concern';
    
    for (const answer of answers) {
      try {
        // Use enhanced psychological analysis for each question-answer pair
        const enhancedResult = await analyzeEnhancedStress(
          `Question ${answer.id}: ${answer.text || 'Survey question'}`,
          answer.answer?.toString() || 'No answer provided',
          domain
        );
        
        // Track highest stress for overall emotion using psychological insights
        if (enhancedResult.enhancedScore > highestStressLevel) {
          highestStressLevel = enhancedResult.enhancedScore;
          dominantEmotion = enhancedResult.enhancedEmotion.toLowerCase();
        }
        
        // Add to stressed questions if shouldTrigger is true (psychological assessment)
        if (enhancedResult.shouldTrigger) {
          stressedQuestions.push({
            id: answer.id,
            text: answer.text,
            answer: answer.answer,
            stressLevel: enhancedResult.enhancedIntensity,
            stressScore: enhancedResult.enhancedScore,
            emotion: enhancedResult.enhancedEmotion,
            reason: enhancedResult.reason,
            psychologicalAnalysis: true
          });
        }
      } catch (error) {
        console.warn(`Failed to analyze stress for question ${answer.id}:`, error);
        // If ManovaAgent fails, don't add to stressed questions - only use LLM analysis
      }
    }

    // Generate contextual deep dive based on ManovaAgent analysis
    const prompt = `
You are a wellness AI therapist. Based on ManovaAgent stress analysis for domain "${domain}":

Stressed Questions Found: ${stressedQuestions.length}
Highest Stress Level: ${highestStressLevel}/10
Dominant Emotion: ${dominantEmotion}
Survey Answers: ${JSON.stringify(answers)}

Generate a deep dive JSON in this format:
{
  "rootEmotion": "anxiety|frustration|overwhelm|sadness|stress|concern",
  "checkboxes": ["Specific stress trigger 1", "Specific stress trigger 2", "Specific stress trigger 3", "Specific stress trigger 4"],
  "textboxPrompt": "Gentle, empathetic prompt encouraging sharing"
}

Make the checkboxes highly specific to the ${domain} domain and the stress patterns detected. Use the dominant emotion "${dominantEmotion}" to guide the tone.
Strictly output only valid JSON.
`;

    try {
      const response = await this._callOpenAIChat(prompt);
      let content = response?.choices?.[0]?.message?.content || response;
      // Remove code fences if present
      content = content.replace(/```json|```/g, '').trim();
      const result = JSON.parse(content);
      
      // Add ManovaAgent analysis results to the response
      result.stressedQuestions = stressedQuestions;
      result.stressAnalysis = {
        highestStressLevel,
        dominantEmotion,
        totalStressedQuestions: stressedQuestions.length
      };
      
      return result;
    } catch (error) {
      console.error('Error generating deep dive followup:', error);
      // Return a fallback response with ManovaAgent results if parsing fails
      return {
        rootEmotion: dominantEmotion,
        checkboxes: [
          "Feeling overwhelmed with current demands",
          "Need for better support systems",
          "Difficulty managing stress levels",
          "Looking for effective coping strategies"
        ],
        textboxPrompt: "Would you like to share more about what's been weighing on your mind lately?",
        stressedQuestions,
        stressAnalysis: {
          highestStressLevel,
          dominantEmotion,
          totalStressedQuestions: stressedQuestions.length
        }
      };
    }
  }

  /**
   * Analyze user free text from deep dive follow-up.
   * Returns: { sentiment: string, emotion: string, tags: [string] }
   */
  async analyzeDeepDiveText(userText, domain, context) {
    const prompt = `Analyze the following text about ${domain} stress and provide insights about the user's emotional state and root causes:

User's text: "${userText}"

Previous context: ${JSON.stringify(context)}

Please provide a JSON response with the following structure:
{
  "sentiment": "positive/negative/neutral",
  "rootEmotion": "primary emotion (e.g., frustration, anxiety, overwhelm)",
  "intensity": "low/medium/high",
  "keyThemes": ["theme1", "theme2", "theme3"],
  "suggestedActions": ["action1", "action2", "action3"]
}

Focus on extracting the root emotion and understanding the underlying causes of stress.`;

    try {
      const response = await this._callOpenAIChat(prompt);
      const content = response.choices[0].message.content;
      const parsed = extractValidJSON(content);
      
      if (!parsed) {
        throw new Error('Failed to parse GPT response');
      }

      return {
        sentiment: parsed.sentiment,
        rootEmotion: parsed.rootEmotion,
        intensity: parsed.intensity,
        keyThemes: parsed.keyThemes,
        suggestedActions: parsed.suggestedActions,
        rawAnalysis: parsed
      };
    } catch (error) {
      console.error('Error in analyzeDeepDiveText:', error);
      throw error;
    }
  }
}

const mcpService = new MCPService();
export default mcpService;

/**
 * Generate 3-5 adaptive, personalized check-in questions for a user based on their history.
 * @param {object} params { domain, lastCheckin, moodScore, userId }
 * @returns {Promise<string[]>}
 */
export async function generateAdaptiveQuestions({ domain, lastCheckin, moodScore, userId }) {
  // 1. Fetch past check-ins if lastCheckin not provided
  let checkins = [];
  if (!lastCheckin) {
    const history = await getCheckinHistory(userId);
    checkins = history.checkins || [];
  } else {
    checkins = [lastCheckin];
  }
  if (!checkins || checkins.length === 0) {
    // Fallback: return static questions
    return [
      "How have you been feeling overall this week?",
      "What's one thing that's been on your mind lately?",
      "Is there a domain (work, personal, finance) that's been more stressful than usual?"
    ];
  }

  // 2. Extract most recent stress domains and concerns
  const last = checkins[checkins.length - 1];
  const responses = last.responses || {};
  // Assume responses is an object: { domain: { value, emotion, tags } }
  const highStressDomains = [];
  const concerns = [];
  for (const [d, resp] of Object.entries(responses)) {
    if ((resp.stressScore && resp.stressScore >= 3) || (resp.value && resp.value >= 3)) {
      highStressDomains.push(d);
      if (resp.tags && Array.isArray(resp.tags)) {
        concerns.push(...resp.tags);
      } else if (resp.emotion) {
        concerns.push(resp.emotion);
      } else if (typeof resp === 'string') {
        concerns.push(resp);
      }
    }
  }

  // 3. Build GPT prompt
  const prompt = `This user previously showed stress in [${highStressDomains.join(', ') || 'none'}]. Their last concerns were: [${concerns.map(c => `'${c}'`).join(', ') || 'none'}].\nNow generate 3 personalized, conversational check-in questions to explore these domains deeper.\n\nCurrent domain: ${domain || 'unknown'}\nMood score: ${moodScore !== undefined ? moodScore : 'unknown'}`;

  // 4. Call GPT-4 API
  const gptResponse = await mcpService.generateResponse(userId, prompt);
  let content = gptResponse?.choices?.[0]?.message?.content || gptResponse;
  // Remove code fences if present
  content = content.replace(/```json|```/g, '').trim();

  // 5. Parse questions (assume GPT returns a numbered or bulleted list)
  const questions = content
    .split(/\n|\r/)
    .map(line => line.replace(/^\d+\.|^- /, '').trim())
    .filter(line => line.length > 0);

  // Return 3-5 questions
  return questions.slice(0, 5);
}

/**
 * Generate a therapist-style reflection and 3 practical tips based on user history and current check-in.
 * @param {string} userId
 * @param {object} currentCheckin { domain, answers, emotions }
 * @returns {Promise<{reflection: string, tips: string[]}>}
 */
export async function generateTherapistReflection(userId, currentCheckin) {
  // 1. Fetch previous check-ins
  const { checkins } = await getCheckinHistory(userId);
  let historySummary = '';
  if (checkins && checkins.length > 0) {
    // Summarize stress patterns by domain
    const domainPatterns = {};
    checkins.forEach(checkin => {
      if (checkin.responses) {
        Object.entries(checkin.responses).forEach(([domain, resp]) => {
          if (!domainPatterns[domain]) domainPatterns[domain] = [];
          if (resp.emotion) domainPatterns[domain].push(resp.emotion);
          if (resp.text) domainPatterns[domain].push(resp.text);
          if (typeof resp === 'string') domainPatterns[domain].push(resp);
        });
      }
    });
    historySummary = Object.entries(domainPatterns)
      .map(([domain, arr]) => `- ${domain}: ${arr.join(', ')}`)
      .join('\n');
    // Add last session note if available
    const last = checkins[checkins.length - 1];
    if (last && last.responses) {
      const lastDomain = Object.keys(last.responses)[0];
      const lastResp = last.responses[lastDomain];
      if (lastResp && lastResp.text) {
        historySummary += `\n- Last session: ${lastResp.text}`;
      }
    }
  } else {
    historySummary = 'No significant stress patterns yet.';
  }

  // 2. Add current check-in context
  const currentContext = `Current check-in: Domain: ${currentCheckin.domain}, Answers: ${JSON.stringify(currentCheckin.answers)}, Emotions: ${currentCheckin.emotions}`;

  // 3. Build GPT prompt
  const prompt = `The user has had the following stress patterns:\n${historySummary}\n${currentContext}\n\nNow generate a thoughtful therapist-style reflection (2–3 lines) + 3 gentle, practical recommendations across self-care, communication, and support-building.\n\nRespond ONLY in this JSON format:\n{\n  "reflection": "...",\n  "tips": ["tip1", "tip2", "tip3"]\n}`;

  // 4. Call GPT-4 API
  const gptResponse = await mcpService.generateResponse(userId, prompt);
  let content = gptResponse?.choices?.[0]?.message?.content || gptResponse;
  // Remove code fences if present
  content = content.replace(/```json|```/g, '').trim();
  // Parse JSON
  let parsed;
  try {
    parsed = JSON.parse(content);
    } catch (e) {
    // fallback: try to extract JSON
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      return {
        reflection: "You have been juggling a lot lately. Remember, it's okay to seek support and take small steps for your well-being.",
        tips: [
          "Try setting 1 clear goal for the week and letting go of less urgent ones.",
          "Have a calm conversation with your manager about support you need.",
          "Set a 10-minute evening routine to mentally disconnect from work."
        ]
      };
    }
  }
  return parsed;
}

/**
 * Generate a follow-up question for a specific domain and previous answer.
 * @param {string} userId
 * @param {string} domain
 * @param {string} prevQuestion
 * @param {string} prevAnswer
 * @param {string} emotionalTag
 * @returns {Promise<{question: string, emotionalCue: string, followUpOptions: string[]}>}
 */
export async function generateFollowupQuestion(userId, domain, prevQuestion, prevAnswer, emotionalTag) {
  const prompt = `
You are Manova's intelligent wellness engine.

The user previously answered this in the '${domain}' domain:
- Question: ${prevQuestion} → '${prevAnswer}'
- Emotional tag: '${emotionalTag}'

Now create a *follow-up question* for the next check-in that dives deeper into this issue. Avoid generic tone.

Reply with a JSON object:
{
  question: string,
  emotionalCue: string,
  followUpOptions: string[]
}
  `.trim();

  const gptResponse = await mcpService.generateResponse(userId, prompt);
  let content = gptResponse?.choices?.[0]?.message?.content || gptResponse;
  // Remove code fences if present
  content = content.replace(/```json|```/g, '').trim();
  // Parse JSON
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    // fallback: try to extract JSON
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      return {
        question: "What would help you feel more supported by your manager?",
        emotionalCue: "frustration",
        followUpOptions: [
          "Discuss expectations with your manager",
          "Seek feedback on your work",
          "Identify one thing that would make you feel more valued"
        ]
      };
    }
  }
  return parsed;
} 

/**
 * Generate psychological causes and solutions for a user's answer.
 * Returns: { causes: [...], solutions: [...] }
 */
export async function generateCausesAndSolutions(answer) {
  const prompt = `The user answered: "${answer}". Identify 3 psychological reasons why this may cause stress. Then give 3 simple, personalized suggestions.

Return ONLY a valid JSON object with this exact structure:
{
  "causes": ["...", "...", "..."],
  "solutions": ["...", "...", "..."]
}
Do not include any explanations, markdown, or anything else. Only return the JSON object.`;

  try {
    // Replace with your LLM API call (e.g., OpenAI, Claude, etc.)
    const completion = await callClaude(prompt); // or callOpenAI(prompt)
    const cleaned = completion.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn("⚠️ Cause/solution generation failed, using fallback");
    return {
      causes: ["Unable to determine cause"],
      solutions: [
        "Consider journaling your feelings",
        "Try speaking to a therapist",
        "Practice mindfulness or relaxation techniques"
      ]
    };
  }
} 