import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Heart, 
  ChevronRight, 
  Loader2, 
  X,
  MessageCircle,
  TrendingUp,
  Lightbulb,
  Target,
  Activity,
  Shield,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { callOpenAI } from '../services/openai';
import mcpService from '../services/mcp';
import DeepDiveUI from './DeepDiveUI';
import { saveDeepDiveInsight, saveContributorsToDB } from '../services/firebase';
import { generateDynamicStressContributors, generateStressFactors } from '../utils/stressTagsGenerator';
import { domainInsightBuilder } from '../services/gptSuggestor';
import { getAuth } from 'firebase/auth';
import { saveStressTriggersToMemory } from '../services/ai/afterSurveySave';
import { generateTherapistInsight } from '../services/ai/manovaAgent';

const getEmotionColor = (emotion) => {
  const emotionMap = {
    frustration: 'bg-orange-100 text-orange-700 border-orange-200',
    anxiety: 'bg-red-100 text-red-700 border-red-200',
    sadness: 'bg-blue-100 text-blue-700 border-blue-200',
    stress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    overwhelm: 'bg-purple-100 text-purple-700 border-purple-200',
    default: 'bg-indigo-100 text-indigo-700 border-indigo-200'
  };
  return emotionMap[emotion?.toLowerCase()] || emotionMap.default;
};

const getEmotionIcon = (emotion) => {
  const emotionMap = {
    frustration: AlertCircle,
    anxiety: AlertCircle,
    sadness: Heart,
    stress: Brain,
    overwhelm: Brain,
    default: Heart
  };
  return emotionMap[emotion?.toLowerCase()] || emotionMap.default;
};

const sanitizeData = (data) => JSON.parse(JSON.stringify(data));

// Stress contributor options for the multi-select dropdown
const stressContributorOptions = [
  { value: 'feeling_overworked', label: 'Feeling overworked or stretched thin' },
  { value: 'unclear_expectations', label: 'Struggling with unclear expectations' },
  { value: 'not_appreciated', label: 'Not feeling appreciated or recognized' },
  { value: 'trouble_disconnecting', label: 'Trouble disconnecting after work' },
  { value: 'fear_disappointing', label: 'Fear of disappointing others' },
  { value: 'lack_of_support', label: 'Lack of support from colleagues or management' },
  { value: 'work_life_balance', label: 'Difficulty maintaining work-life balance' },
  { value: 'job_security', label: 'Concerns about job security or career growth' },
  { value: 'communication_issues', label: 'Communication challenges with team' },
  { value: 'technology_stress', label: 'Technology or system-related stress' },
  { value: 'meeting_overload', label: 'Too many meetings or interruptions' },
  { value: 'perfectionism', label: 'Perfectionism or high self-expectations' },
  { value: 'time_management', label: 'Time management difficulties' },
  { value: 'role_confusion', label: 'Unclear role or responsibilities' },
  { value: 'workplace_culture', label: 'Challenging workplace culture' }
];

// Custom styles for react-select
const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'white',
    borderColor: state.isFocused ? '#3b82f6' : '#e5e7eb',
    borderWidth: '2px',
    borderRadius: '12px',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
    '&:hover': {
      borderColor: '#3b82f6'
    }
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#dbeafe',
    borderRadius: '8px',
    padding: '2px'
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: '#1e40af',
    fontWeight: '500'
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: '#1e40af',
    '&:hover': {
      backgroundColor: '#bfdbfe',
      color: '#1e3a8a'
    }
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#dbeafe' : 'white',
    color: state.isSelected ? 'white' : '#374151',
    '&:hover': {
      backgroundColor: state.isSelected ? '#3b82f6' : '#dbeafe'
    }
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  })
};

// --- GPT prompt utility ---
const buildDeepDivePrompt = ({ text, selectedOption, emotion, score, customReason }) => `You are a helpful emotional wellness assistant. The user showed signs of stress on this question:

- Question: ${text}
- Selected Answer: ${selectedOption}
- Emotional Tone: ${emotion || 'Not detected'}
- Stress Score: ${typeof score === 'number' ? score : 'N/A'}
- Reason: ${customReason || 'None'}

Based on this, generate 3 personalized, specific follow-up options or clarifying questions that would help the user reflect or open up further. Respond with a JSON array of strings.`;

const fallbackDeepDive = ["No suggestions found."];



// Add this helper function at the top level
const cleanJSONResponse = (response) => {
  if (!response || typeof response !== 'string') {
    return '{}';
  }
  
  // Remove markdown code block syntax
  let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  
  // Find the first occurrence of { and last occurrence of }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace === -1 || lastBrace === -1) {
    console.warn('No JSON braces found in response:', response);
    return '{}';
  }
  
  // Extract only the JSON part
  cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  // More robust JSON cleaning
  try {
    // First, try to parse as-is to see if it's already valid
    JSON.parse(cleaned);
    return cleaned;
  } catch (initialError) {
    console.log('Initial JSON parse failed, attempting to clean:', initialError.message);
    
    // Fix common JSON issues
    // 1. Fix trailing commas
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
  
    // 2. Fix missing quotes around property names (more comprehensive)
  cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
  
    // 3. Fix unescaped quotes in string values (more robust)
  cleaned = cleaned.replace(/"([^"]*)"([^"]*)"([^"]*)"/g, '"$1\\"$2\\"$3"');
  
    // 4. Fix single quotes to double quotes
    cleaned = cleaned.replace(/'/g, '"');
    
    // 5. Fix missing quotes around string values
    cleaned = cleaned.replace(/:\s*([a-zA-Z][a-zA-Z0-9\s]*[a-zA-Z0-9])\s*([,}])/g, ': "$1"$2');
    
    // 6. Fix array values without quotes
    cleaned = cleaned.replace(/\[\s*([a-zA-Z][a-zA-Z0-9\s]*[a-zA-Z0-9])\s*([,}\]])/g, '["$1"$2');
    cleaned = cleaned.replace(/([a-zA-Z0-9\s]*[a-zA-Z0-9])\s*\]/g, '"$1"]');
    
    // 7. Remove any control characters that might break JSON
  cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, '');
  
    // 8. Fix common GPT formatting issues
    cleaned = cleaned.replace(/\n/g, ' ').replace(/\r/g, ' ');
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    // 9. Fix missing colons after property names
    cleaned = cleaned.replace(/"([^"]+)"\s+([a-zA-Z_][a-zA-Z0-9_]*)/g, '"$1": "$2"');
    
    // 10. Fix missing commas between properties
    cleaned = cleaned.replace(/"([^"]+)"\s*}\s*"([^"]+)"/g, '"$1"}, {"$2"');
    
    try {
      // Try to parse the cleaned version
      JSON.parse(cleaned);
  return cleaned;
    } catch (secondError) {
      console.error('JSON cleaning failed:', secondError.message);
      console.log('Cleaned response that failed:', cleaned);
      
      // Last resort: try to extract just the essential parts
      const insightMatch = cleaned.match(/"insight"\s*:\s*"([^"]+)"/);
      const tryThisMatch = cleaned.match(/"tryThis"\s*:\s*\[([^\]]+)\]/);
      const stressContributorsMatch = cleaned.match(/"stressContributors"\s*:\s*\[([^\]]+)\]/);
      const finalAdviceMatch = cleaned.match(/"finalAdvice"\s*:\s*"([^"]+)"/);
      
      // Build a minimal valid JSON
      const minimalJSON = {
        insight: insightMatch ? insightMatch[1] : "Your feelings are valid and worth acknowledging.",
        tryThis: tryThisMatch ? 
          tryThisMatch[1].split(',').map(s => s.trim().replace(/"/g, '')) : 
          ["Take a moment to reflect on what you've shared", "Consider reaching out for support if needed"],
        stressContributors: stressContributorsMatch ? 
          stressContributorsMatch[1].split(',').map(s => s.trim().replace(/"/g, '')) : 
          ["Feeling overwhelmed", "Lack of control", "Uncertainty"],
        finalAdvice: finalAdviceMatch ? finalAdviceMatch[1] : "Remember, you're not alone in feeling this way."
      };
      
      return JSON.stringify(minimalJSON);
    }
  }
};

/**
 * Build enhanced therapist support message with MCP protocol integration
 * @param {Array} selectedTags - Array of selected stress contributor tags
 * @param {string} customReason - User's free-text response
 * @param {string} emotion - Detected emotion from stress analysis
 * @param {string} domainName - Current domain being analyzed
 * @param {Array} highStressQuestions - Array of high-stress questions for context
 * @returns {Promise<Object>} - Object containing support message and MCP protocol data
 */
const buildTherapistSupport = async (selectedTags, customReason, emotion, domainName, highStressQuestions = []) => {
  try {
    // Convert selected tags to readable labels (now they should already be labels)
    const selectedTagLabels = selectedTags.map(tag => {
      // If it's already a string (label), use it directly
      if (typeof tag === 'string') {
        return tag;
      }
      // If it's an object with label property, use the label
      if (tag && tag.label) {
        return tag.label;
      }
      // Fallback: try to find in static options
      const option = stressContributorOptions.find(opt => opt.value === tag);
      return option ? option.label : tag;
    });

    // Enhanced MCP Protocol determination based on dynamic contributors
    let mcpProtocol = 'Support';
    const intenseKeywords = [
      'overwhelmed', 'burnout', 'exhausted', 'drained', 'anxious', 'fear', 
      'disappointing', 'perfectionism', 'security', 'toxic', 'hopeless', 
      'worthless', 'isolated', 'lonely', 'crisis', 'emergency'
    ];
    
    const hasIntenseWording = selectedTagLabels.some(label => 
      intenseKeywords.some(keyword => label.toLowerCase().includes(keyword))
    );
    
    const hasHighStressEmotion = ['overwhelmed', 'anxious', 'stressed', 'fear', 'hopeless'].includes(emotion?.toLowerCase());
    
    if (selectedTags.length >= 3 && (hasIntenseWording || hasHighStressEmotion)) {
      mcpProtocol = 'Escalate';
    } else if (selectedTags.length >= 2 || hasIntenseWording || hasHighStressEmotion) {
      mcpProtocol = 'Monitor';
    } else {
      mcpProtocol = 'Support';
    }

    // Enhanced prompt using the improved structure
    const personalizedPrompt = `
Based on the following user stress data, generate a supportive and empathetic message like a therapist would.

1. Stressed Questions:
${JSON.stringify(highStressQuestions, null, 2)}

2. Tags selected by user (stress contributors):
${JSON.stringify(selectedTagLabels, null, 2)}

3. Additional thoughts shared:
"${customReason || 'None provided'}"

4. Domain Context:
${domainName}

5. Emotional Tone:
${emotion || 'stress'}

Tone:
- Warm, human, gentle therapist
- Validate feelings (e.g., "It's completely okay to feel this way…")
- Avoid clinical tone
- Suggest 1–2 gentle, actionable tips to help
- Show deep understanding of their specific situation
- Include a gentle reminder about self-compassion

Output format:
{
  "title": "Personalized Support",
  "message": "<Therapist-style response>",
  "validation": "<Emotional validation statement>",
  "actionableSteps": ["<Step 1>", "<Step 2>"],
  "selfCompassion": "<Gentle self-compassion reminder>"
}

Write a 5-6 line human-like therapist response that flows naturally from validation to action steps. Be specific to their exact situation and avoid generic advice.`;

    const response = await callOpenAI(personalizedPrompt);
    
    // Clean and parse the response
    let cleanedResponse = response;
    if (typeof cleanedResponse === 'string') {
      cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      cleanedResponse = cleanedResponse.replace(/^\s+|\s+$/g, '');
    }
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleanedResponse || "{}");
    } catch (parseError) {
      console.error('Error parsing therapist support response:', parseError);
      console.log('Raw response:', response);
      console.log('Cleaned response:', cleanedResponse);
      // Fallback response
      parsedResponse = {
        title: "Personalized Support",
        message: "I can see this is really affecting you, and that's completely understandable. Your feelings are valid and worth acknowledging. Consider taking small steps to care for yourself, and remember that it's okay to ask for support when you need it.",
        validation: "Your feelings are completely valid and understandable given what you're experiencing.",
        actionableSteps: [
          "Take a moment to breathe deeply and acknowledge your feelings",
          "Consider reaching out to someone you trust for support"
        ],
        selfCompassion: "Remember, you're doing the best you can with what you have right now. That's enough."
      };
    }
    
    return {
      supportMessage: parsedResponse.message || "I can see this is really affecting you, and that's completely understandable. Your feelings are valid and worth acknowledging. Consider taking small steps to care for yourself, and remember that it's okay to ask for support when you need it.",
      title: parsedResponse.title || "Personalized Support",
      validation: parsedResponse.validation,
      actionableSteps: parsedResponse.actionableSteps || [],
      selfCompassion: parsedResponse.selfCompassion,
      mcpProtocol,
      selectedTags: selectedTagLabels,
      emotion,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error generating therapist support:', error);
    return {
      supportMessage: "I can see this is really affecting you, and that's completely understandable. Your feelings are valid and worth acknowledging. Consider taking small steps to care for yourself, and remember that it's okay to ask for support when you need it.",
      title: "Personalized Support",
      validation: "Your feelings are completely valid and understandable given what you're experiencing.",
      actionableSteps: [
        "Take a moment to breathe deeply and acknowledge your feelings",
        "Consider reaching out to someone you trust for support"
      ],
      selfCompassion: "Remember, you're doing the best you can with what you have right now. That's enough.",
      mcpProtocol: 'Support',
      selectedTags: selectedTags,
      emotion,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Build personalized support message based on user context
 * @param {Array} stressedQuestions - Array of questions with high stress responses
 * @param {Array} selectedTags - User-selected stress contributor tags
 * @param {string} customReason - User's free-text response
 * @param {string} domainName - Current domain being analyzed
 * @returns {Promise<Object>} - Personalized support message and structured data
 */
const buildPersonalizedSupport = async (stressedQuestions, selectedTags, customReason, domainName) => {
  try {
    // Extract high-stress responses and context
    const highStressResponses = stressedQuestions
      .filter(q => (q.aiAnalysis?.score || 0) >= 7 || q.intensity?.toLowerCase() === 'high')
      .slice(0, 2) // Top 2 high-stress responses
      .map(q => ({
        question: q.text,
        answer: q.answerLabel || q.selectedOption,
        emotion: q.emotion,
        intensity: q.intensity,
        stressScore: q.aiAnalysis?.score || q.stressScore
      }));

    // Get the primary emotion from stress analysis
    const primaryEmotion = highStressResponses.length > 0 
      ? highStressResponses[0].emotion 
      : 'stress';

    // Use the enhanced therapist support function
    const therapistSupport = await buildTherapistSupport(
      selectedTags,
      customReason,
      primaryEmotion,
      domainName,
      highStressResponses
    );

    return therapistSupport;
    
  } catch (error) {
    console.error('Error generating personalized support:', error);
    // Fallback response
    return {
      supportMessage: "I can see this is really affecting you, and that's completely understandable. Your feelings are valid and worth acknowledging. Consider taking small steps to care for yourself, and remember that it's okay to ask for support when you need it.",
      title: "Personalized Support",
      validation: "Your feelings are completely valid and understandable given what you're experiencing.",
      actionableSteps: [
        "Take a moment to breathe deeply and acknowledge your feelings",
        "Consider reaching out to someone you trust for support"
      ],
      selfCompassion: "Remember, you're doing the best you can with what you have right now. That's enough.",
      mcpProtocol: 'Support',
      selectedTags: selectedTags,
      emotion: 'stress',
      timestamp: new Date().toISOString()
    };
  }
};

// Add this function after the existing prompt building functions
const generateEmpatheticLine = async (question, selectedOption, stressScore) => {
  try {
    const prompt = `You are an empathetic mental wellness assistant. A user answered a survey question with signs of stress:

Question: "${question}"
Selected Answer: "${selectedOption}"
Stress Score: ${stressScore}/10

Generate ONE empathetic, supportive line (max 2 sentences) that acknowledges their feelings and shows understanding. Be warm, validating, and encouraging. Do not give advice - just show empathy.

Respond with ONLY the empathetic line, no quotes or formatting.`;

    const response = await callOpenAI(prompt);
    return response?.trim() || "I can see this is affecting you, and your feelings are completely valid.";
  } catch (error) {
    console.error('Error generating empathetic line:', error);
    return "I can see this is affecting you, and your feelings are completely valid.";
  }
};

const generateDomainSpecificStressContributors = async (question, selectedOption, domainName) => {
  try {
    const prompt = `You are a mental wellness assistant. Based on this survey response:

Question: "${question}"
Answer: "${selectedOption}"
Domain: "${domainName}"

Generate 6-8 specific stress contributors that are relevant to this domain and situation. These should be multi-select options for a dropdown.

For example, if it's work-related: "Feeling overworked", "Lack of recognition", "Poor work-life balance"
If it's personal life: "Relationship conflicts", "Financial worries", "Health concerns"

Return ONLY a JSON array of strings, no explanations:
["Contributor 1", "Contributor 2", "Contributor 3", ...]`;

    const response = await callOpenAI(prompt);
    
    // Clean and parse the response
    let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (parseError) {
      console.error('Failed to parse stress contributors JSON:', parseError);
    }
    
    // Fallback options
    return [
      "Feeling overwhelmed",
      "Lack of control",
      "Uncertainty about the future",
      "Difficulty balancing priorities",
      "Not feeling supported",
      "Perfectionism or high expectations"
    ];
  } catch (error) {
    console.error('Error generating stress contributors:', error);
    return [
      "Feeling overwhelmed",
      "Lack of control", 
      "Uncertainty",
      "Not feeling supported",
      "High expectations",
      "Difficulty balancing priorities"
    ];
  }
};

const generatePersonalizedSuggestions = async (questionsData, selectedDropdownValues, userReflectionText) => {
  try {
    setIsGeneratingSuggestions(true);
    
    // Prepare the data for Azure GPT
    const questionsText = questionsData.map(q => 
      `Question: "${q.text}"
Answer: "${q.selectedOption || q.answerLabel}"`
    ).join('\n\n');
    
    const dropdownText = selectedDropdownValues.length > 0 
      ? `Selected stress factors: ${selectedDropdownValues.join(', ')}`
      : 'No specific stress factors selected';
    
    const reflectionText = userReflectionText.trim() 
      ? `Additional thoughts: "${userReflectionText}"`
      : 'No additional thoughts provided';
    
    // REFINED LLM PROMPT: Root cause reasoning, rationale, timeframe, structured output
    const prompt = `You are a compassionate mental wellness expert. Analyze the user's high-stress answers and stress factors below. First, reason step-by-step about the likely root causes of their stress. Then, provide 3 highly actionable, concrete steps the user can take to reduce the stress shown in their answers.

For each suggestion:
- Reference the specific stressor or situation from the user's answers
- Justify why this action is helpful for this user's situation (1-2 sentences)
- Specify a clear timeframe or measurable outcome (immediate, today, this week, etc.)
- Provide a mix of immediate, short-term, and medium-term actions

Output ONLY a JSON array of objects, each with 'suggestion', 'why', and 'timeframe', like this:
[
  {"suggestion": "...", "why": "...", "timeframe": "immediate"},
  {"suggestion": "...", "why": "...", "timeframe": "this week"},
  {"suggestion": "...", "why": "...", "timeframe": "short-term"}
]

User context:
${questionsText}

${dropdownText}
${reflectionText}`;

    const response = await callOpenAI(prompt);
    
    // Clean and parse the response
    let cleanedResponse = response;
    if (typeof cleanedResponse === 'string') {
      cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    }
    
    try {
      const parsed = JSON.parse(cleanedResponse);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].suggestion) {
        return parsed;
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (parseError) {
      console.error('Error parsing suggestions:', parseError);
      // Return fallback suggestions in new structure
      return [
        {
          suggestion: "Take a 5-minute break right now to write down your top concern and one small step you can take today.",
          why: "This helps you externalize your stress and makes it easier to identify manageable actions.",
          timeframe: "immediate"
        },
        {
          suggestion: "Schedule a 15-minute 'worry time' tomorrow where you can fully process your feelings without judgment.",
          why: "Setting aside time for your worries can prevent them from intruding on your day and gives you permission to feel without guilt.",
          timeframe: "this week"
        },
        {
          suggestion: "Identify one trusted person you can share these feelings with this week.",
          why: "Social support is one of the most effective ways to reduce stress and gain perspective.",
          timeframe: "this week"
        }
      ];
    }
  } catch (error) {
    console.error('Error generating personalized suggestions:', error);
    // Return fallback suggestions in new structure
    return [
      {
        suggestion: "Practice deep breathing exercises for 5-10 minutes daily.",
        why: "Deep breathing calms your nervous system and can quickly reduce acute stress.",
        timeframe: "immediate"
      },
      {
        suggestion: "Break down overwhelming tasks into smaller, manageable steps.",
        why: "Small steps make big challenges feel less daunting and help you build momentum.",
        timeframe: "this week"
      },
      {
        suggestion: "Make time for activities that bring you joy and relaxation.",
        why: "Positive experiences help counterbalance stress and improve your overall mood.",
        timeframe: "short-term"
      }
    ];
  } finally {
    setIsGeneratingSuggestions(false);
  }
};



const DeepDiveFollowup = ({ 
  domainName, 
  onSave, 
  userId: propUserId, 
  isLoading = false, 
  deepDiveData, 
  stressedQuestions = [],
  flaggedQuestions = [],
  domainQuestions = [],
  goToNextDomain = null
}) => {
  // All hooks at the top, before any early returns
  const [selectedStressTags, setSelectedStressTags] = useState([]);
  const [customReason, setCustomReason] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisFeedback, setAnalysisFeedback] = useState('');
  const [showMobileTips, setShowMobileTips] = useState(false);
  const [typingDots, setTypingDots] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [questionInsights, setQuestionInsights] = useState([]);
  const [deepDiveOptions, setDeepDiveOptions] = useState({});
  const [loadingOptions, setLoadingOptions] = useState({});
  const [errorOptions, setErrorOptions] = useState({});
  const [selectedFollowUps, setSelectedFollowUps] = useState({});
  const [showInsightCard, setShowInsightCard] = useState(false);
  const [domainInsight, setDomainInsight] = useState(null);
  const [readyForNextDomain, setReadyForNextDomain] = useState(false);
  const [questionAnswers, setQuestionAnswers] = useState({});
  const [selectedTags, setSelectedTags] = useState({});
  const [answerIntensities, setAnswerIntensities] = useState({});
  const [isGeneratingSupport, setIsGeneratingSupport] = useState(false);
  const [generatedStressOptions, setGeneratedStressOptions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [enhancedTherapistData, setEnhancedTherapistData] = useState(null);
  const [therapistAdvice, setTherapistAdvice] = useState('');
  const [empatheticLines, setEmpatheticLines] = useState({});
  const [questionStressContributors, setQuestionStressContributors] = useState({});
  const [questionReflections, setQuestionReflections] = useState({});
  const [personalizedSuggestions, setPersonalizedSuggestions] = useState([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Per-question suggestion data state management
  const [questionSuggestions, setQuestionSuggestions] = useState({});
  const [questionDropdownOptions, setQuestionDropdownOptions] = useState({});
  const [questionUserInputs, setQuestionUserInputs] = useState({});
  const [questionLoadingStates, setQuestionLoadingStates] = useState({});

  // Generate per-question suggestions function
  const generatePerQuestionSuggestions = async (question, selectedDropdownValues, userInput) => {
    try {
      // Set loading state for this specific question
      setQuestionLoadingStates(prev => ({ ...prev, [question.id]: true }));
      
      const prompt = `You are a compassionate mental wellness expert. Based on this specific question and the user's context, provide personalized suggestions.

Question: "${question.text}"
User's Answer: "${question.selectedOption || question.answerLabel}"
Selected Stress Factors: ${selectedDropdownValues.length > 0 ? selectedDropdownValues.join(', ') : 'None selected'}
User's Additional Input: "${userInput || 'None provided'}"

Generate 2-3 personalized, practical suggestions that are:
1. Specific to this question and the user's situation
2. Actionable and realistic
3. Evidence-based for stress management
4. Warm and supportive in tone

Respond in this exact JSON format:
{
  "empathyLine": "A warm, validating statement about their experience",
  "suggestions": [
    "First practical suggestion",
    "Second practical suggestion",
    "Third practical suggestion (if applicable)"
  ],
  "dropdownOptions": [
    "Relevant stress factor 1",
    "Relevant stress factor 2",
    "Relevant stress factor 3"
  ]
}`;

      const response = await callOpenAI(prompt);
      
      // Clean and parse the response
      let cleanedResponse = response;
      if (typeof cleanedResponse === 'string') {
        cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      }
      
      try {
        const parsed = JSON.parse(cleanedResponse);
        
        // Validate and set defaults for missing fields
        const result = {
          empathyLine: parsed.empathyLine || "I can see this is affecting you, and your feelings are completely valid.",
          suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [
            "Take a moment to breathe deeply and acknowledge your feelings",
            "Consider what would help you feel more supported right now"
          ],
          dropdownOptions: Array.isArray(parsed.dropdownOptions) ? parsed.dropdownOptions : [
            "Feeling overwhelmed",
            "Lack of control",
            "Uncertainty about the situation"
          ]
        };
        
        // Update state for this question
        setQuestionSuggestions(prev => ({ ...prev, [question.id]: result.suggestions }));
        setQuestionDropdownOptions(prev => ({ ...prev, [question.id]: result.dropdownOptions }));
        setEmpatheticLines(prev => ({ ...prev, [question.id]: result.empathyLine }));
        
        return result;
        
      } catch (parseError) {
        console.error('Error parsing per-question suggestions:', parseError);
        
        // Set fallback data
        const fallbackResult = {
          empathyLine: "I can see this is affecting you, and your feelings are completely valid.",
          suggestions: [
            "Take a moment to breathe deeply and acknowledge your feelings",
            "Consider what would help you feel more supported right now"
          ],
          dropdownOptions: [
            "Feeling overwhelmed",
            "Lack of control",
            "Uncertainty about the situation"
          ]
        };
        
        setQuestionSuggestions(prev => ({ ...prev, [question.id]: fallbackResult.suggestions }));
        setQuestionDropdownOptions(prev => ({ ...prev, [question.id]: fallbackResult.dropdownOptions }));
        setEmpatheticLines(prev => ({ ...prev, [question.id]: fallbackResult.empathyLine }));
        
        return fallbackResult;
      }
    } catch (error) {
      console.error('Error generating per-question suggestions:', error);
      
      // Set fallback data on error
      const fallbackResult = {
        empathyLine: "I can see this is affecting you, and your feelings are completely valid.",
        suggestions: [
          "Take a moment to breathe deeply and acknowledge your feelings",
          "Consider what would help you feel more supported right now"
        ],
        dropdownOptions: [
          "Feeling overwhelmed",
          "Lack of control",
          "Uncertainty about the situation"
        ]
      };
      
      setQuestionSuggestions(prev => ({ ...prev, [question.id]: fallbackResult.suggestions }));
      setQuestionDropdownOptions(prev => ({ ...prev, [question.id]: fallbackResult.dropdownOptions }));
      setEmpatheticLines(prev => ({ ...prev, [question.id]: fallbackResult.empathyLine }));
      
      return fallbackResult;
    } finally {
      // Clear loading state for this question
      setQuestionLoadingStates(prev => ({ ...prev, [question.id]: false }));
    }
  };

  // Always use the userId prop if provided and valid
  let userId = propUserId;
  if (!userId) {
    try {
      const auth = getAuth();
      const firebaseUserId = auth.currentUser?.uid;
      if (firebaseUserId) {
        userId = firebaseUserId;
      }
    } catch (e) {
      // Firebase Auth not available or not initialized
    }
  }
  if (!userId) {
    console.warn('DeepDiveFollowup: No userId available after all attempts.');
  }

  // Now calculate questionsToShow after all state is initialized
  const questionsToShow = filteredQuestions.length > 0 
    ? filteredQuestions 
    : flaggedQuestions.length > 0 
      ? flaggedQuestions 
      : stressedQuestions;
  
  // Debug logging for questions to show
  console.log('🔍 DeepDiveFollowup received flaggedQuestions:', flaggedQuestions);
  console.log('🔍 DeepDiveFollowup received stressedQuestions:', stressedQuestions);
  console.log('🔍 DeepDiveFollowup received domainQuestions:', domainQuestions);
  console.log('🔍 DeepDiveFollowup will show questions:', questionsToShow);
  console.log('📊 Questions breakdown:');
  questionsToShow.forEach((q, index) => {
    console.log(`  ${index + 1}. ${q.text}`);
    console.log(`     Survey score: ${q.score}, AI stress score: ${q.stressScore}`);
    console.log(`     Emotion: ${q.emotion}, Intensity: ${q.intensity}`);
    console.log(`     Answer: ${q.answerLabel || q.selectedOption}`);
    console.log(`     Domain: ${q.domain}, AI Analysis Score: ${q.aiAnalysis?.score}`);
    console.log(`     AI Stress Category: ${q.aiStressCategory}, Deep Dive Eligible: ${q.deepDiveEligible}`);
  });

  // Additional debug for Personal Life domain
  if (domainName === 'Personal Life') {
    console.log('🧠 Personal Life Deep Dive Debug:');
    console.log('Domain Name:', domainName);
    console.log('Number of flagged questions:', flaggedQuestions.length);
    console.log('Number of stressed questions:', stressedQuestions.length);
    console.log('Number of domain questions:', domainQuestions.length);
    console.log('Number of questions to show:', questionsToShow.length);
    console.log('Questions with AI analysis scores >= 7:', questionsToShow.filter(q => q.aiAnalysis?.score >= 7).length);
    console.log('All questions with their AI scores:', questionsToShow.map(q => ({
      text: q.text,
      aiScore: q.aiAnalysis?.score,
      surveyScore: q.score,
      domain: q.domain,
      aiStressCategory: q.aiStressCategory,
      deepDiveEligible: q.deepDiveEligible
    })));
  }

  // New useEffect for improved filtering logic
  useEffect(() => {
    if (!userId || !domainName || !domainQuestions || domainQuestions.length === 0) {
      console.warn("Missing data or userId. Not continuing.");
      return;
    }

    // Add debug logging for deep dive trigger check
    console.log("Deep Dive Trigger Check", {
      domain: domainName,
      questions: domainQuestions.map(q => ({
        q: q.text,
        score: q.stressScore || q.score,
        stress: q.aiStressCategory || 'unknown',
        include: q.deepDiveEligible !== false,
        aiAnalysis: q.aiAnalysis,
        emotion: q.emotion,
        intensity: q.intensity
      }))
    });

    const stressedQuestions = domainQuestions.filter((q) => {
      // Check enhanced analysis first
      if (q.aiAnalysis?.enhanced) {
        const enhancedScore = q.aiAnalysis.enhanced.score;
        const enhancedIntensity = q.aiAnalysis.enhanced.intensity;
        return enhancedScore >= 7 || enhancedIntensity === 'High'; // Use enhanced analysis
      }
      
      // Fallback to legacy analysis
      return (
        q.aiStressCategory === "high" || // Legacy property
        (q.aiAnalysis?.score >= 7) || // Basic AI score
        (q.stressScore >= 7) || // Direct stress score
        q.intensity === 'High' // Legacy intensity
      );
    });

    const flaggedQuestions = stressedQuestions.filter(
      (q) => q.deepDiveEligible !== false && q.response !== null
    );

    console.log("DeepDiveFollowup received flaggedQuestions:", flaggedQuestions);
    console.log("Stressed questions count:", stressedQuestions.length);
    console.log("Flagged questions count:", flaggedQuestions.length);

    if (flaggedQuestions.length === 0) {
      // No stress detected - show positive message and continue to next domain
      console.log("No questions flagged for deep dive. Proceeding to next domain.");
      
      // Show a brief positive message before continuing
      setAnalysisFeedback('Great! No significant stress concerns detected in this domain.');
      
      // 🔥 IMMEDIATE: Continue to next domain without delay
      if (goToNextDomain && typeof goToNextDomain === 'function') {
        goToNextDomain();
      } else {
        // Fallback to onSave if goToNextDomain is not provided
        onSave({ continue: true, skip: true });
      }
      
      return;
    }

    // Update the questions to show with the filtered flagged questions
    console.log("Setting filtered questions:", flaggedQuestions);
    setFilteredQuestions(flaggedQuestions);
  }, [domainQuestions, userId, domainName, goToNextDomain, onSave]);

  useEffect(() => {
    if (isAnalyzing || isGeneratingSupport) {
      const interval = setInterval(() => {
        setTypingDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing, isGeneratingSupport]);

  // Generate empathetic lines and stress contributors for each question
  useEffect(() => {
    let cancelled = false;
    async function generateQuestionData() {
      if (!questionsToShow.length) return;
      
      const newEmpatheticLines = {};
      const newStressContributors = {};
      
      for (const question of questionsToShow) {
        if (cancelled) break;
        
        try {
          // Generate empathetic line
          const empatheticLine = await generateEmpatheticLine(
            question.text,
            question.selectedOption || question.answerLabel,
            question.stressScore || question.aiAnalysis?.score || 7
          );
          newEmpatheticLines[question.id] = empatheticLine;
          
          // Generate domain-specific stress contributors
          const stressContributors = await generateDomainSpecificStressContributors(
            question.text,
            question.selectedOption || question.answerLabel,
            domainName
          );
          newStressContributors[question.id] = stressContributors;
          
        } catch (error) {
          console.error(`Error generating data for question ${question.id}:`, error);
          // Set fallback values
          newEmpatheticLines[question.id] = "I can see this is affecting you, and your feelings are completely valid.";
          newStressContributors[question.id] = [
            "Feeling overwhelmed",
            "Lack of control",
            "Uncertainty",
            "Not feeling supported",
            "High expectations",
            "Difficulty balancing priorities"
          ];
        }
      }
      
      if (!cancelled) {
        setEmpatheticLines(newEmpatheticLines);
        setQuestionStressContributors(newStressContributors);
      }
    }
    
    generateQuestionData();
    
    return () => {
      cancelled = true;
    };
  }, [questionsToShow, domainName]);

  // Fetch GPT deep dive options for each stressed question
  useEffect(() => {
    let cancelled = false;
    async function fetchDeepDiveOptions() {
      if (!questionsToShow.length) return;
      const loading = {};
      questionsToShow.forEach(q => { loading[q.id] = true; });
      setLoadingOptions(loading);
      setErrorOptions({});
      const results = await Promise.all(questionsToShow.map(async (q) => {
        try {
          const prompt = buildDeepDivePrompt({
            text: q.text,
            selectedOption: q.selectedOption,
            emotion: q.emotion,
            score: q.score,
            customReason: q.customReason || q.textInput || ''
          });
          const res = await mcpService.generateResponse(userId, prompt);
          let content = res?.choices?.[0]?.message?.content?.trim() || res;
          content = content.replace(/```json|```/g, '').trim();
          let parsed;
          try {
            parsed = JSON.parse(content);
            if (!Array.isArray(parsed)) parsed = fallbackDeepDive;
          } catch (e) {
            parsed = fallbackDeepDive;
          }
          return { id: q.id, options: parsed, error: null };
        } catch (err) {
          return { id: q.id, options: fallbackDeepDive, error: 'No suggestions found.' };
        }
      }));
      if (!cancelled) {
        const optionsObj = {};
        const loadingObj = {};
        const errorObj = {};
        results.forEach(({ id, options, error }) => {
          optionsObj[id] = options;
          loadingObj[id] = false;
          if (error) errorObj[id] = error;
        });
        setDeepDiveOptions(optionsObj);
        setLoadingOptions(loadingObj);
        setErrorOptions(errorObj);
      }
    }
    fetchDeepDiveOptions();
    return () => { cancelled = true; };
  }, [userId, questionsToShow]);

  // Fetch GPT suggestions for each stressed question


  // Generate dynamic stress contributor suggestions based on high-stress questions
  useEffect(() => {
    if (questionsToShow.length > 0) {
      // Use the new dynamic stress contributor generator
      const dynamicContributors = generateDynamicStressContributors(questionsToShow, domainName);
      
      // Convert to the format expected by react-select
      const stressOptions = dynamicContributors.map(contributor => ({
        value: contributor.value,
        label: contributor.label
      }));
      
      // Set the generated stress options as default selections (up to 3)
      const defaultSelections = stressOptions.slice(0, 3);
      setSelectedStressTags(defaultSelections);
      
      // Set all generated options for the DeepDiveUI component
      setGeneratedStressOptions(dynamicContributors.map(c => c.label));
      
      console.log('🎯 Dynamic stress contributors generated:', dynamicContributors);
      console.log('🎯 Stress options for react-select:', stressOptions);
      console.log('🎯 Default selections:', defaultSelections);
    }
  }, [questionsToShow, domainName]);

  // Helper to get flagged questions (HIGH stress only - >= 7)
  const getFlaggedQuestions = () => {
    return (flaggedQuestions.length > 0 ? flaggedQuestions : stressedQuestions).filter(q => (q.stressScore || 0) >= 7);
  };

  // Effect: On domain or flagged questions change, reset stress tags/options and generate new options
  useEffect(() => {
    setSelectedStressTags([]); // Only clear on domain/flaggedQuestions change
    const flaggedQs = getFlaggedQuestions();
    if (!flaggedQs.length) {
      // No stressed questions, auto-advance
      if (goToNextDomain) goToNextDomain();
      return;
    }
    
    // Use dynamic stress contributors instead of static factors
    const dynamicContributors = generateDynamicStressContributors(flaggedQs, domainName);
    const contributorLabels = dynamicContributors.map(c => c.label);
    
    // If we have dynamic contributors, use them; otherwise fall back to generated factors
    if (contributorLabels.length > 0) {
      setGeneratedStressOptions(contributorLabels);
    } else {
      // Fallback: Generate stress factors for each flagged question
      (async () => {
        const allFactors = [];
        for (const q of flaggedQs) {
          const factors = await generateStressFactors(q.text, domainName);
          allFactors.push(...factors);
        }
        // Deduplicate and limit to 5
        const unique = Array.from(new Set(allFactors)).slice(0, 5);
        setGeneratedStressOptions(unique);
      })();
    }
  }, [domainName, flaggedQuestions, stressedQuestions]);

  const analyzeCognitiveBiases = async (journalText) => {
    // Commented out cognitive bias analysis as journaling is removed
    return null;
  };

  // Helper to normalize selectedStressTags to array of strings
  const getSelectedTagValues = () =>
    selectedStressTags.map(tag => (typeof tag === 'string' ? tag : tag.label || tag.value));

  const handleSubmit = async () => {
    setValidationError('');

    // Step 2: Check for userId before saving
    if (!userId || !domainName) {
      console.error('No userId found in DeepDiveFollowup. userId:', userId, 'domainName:', domainName);
      setValidationError('Session error. Please refresh the page and try again.');
      return;
    }

    // Collect all per-question data
    const allQuestionData = {};
    let hasAnySelections = false;
    
    for (const question of questionsToShow) {
      const questionTags = selectedTags[question.id] || [];
      const questionReflection = questionReflections[question.id] || '';
      const empatheticLine = empatheticLines[question.id] || '';
      const stressContributors = questionStressContributors[question.id] || [];
      
      if (questionTags.length > 0 || questionReflection.trim()) {
        hasAnySelections = true;
      }
      
      allQuestionData[question.id] = {
        questionText: question.text,
        selectedAnswer: question.selectedOption || question.answerLabel,
        stressScore: question.stressScore || question.aiAnalysis?.score,
        empatheticLine,
        stressContributors,
        selectedTags: questionTags,
        reflection: questionReflection,
        timestamp: new Date().toISOString()
      };
    }
    
    // Also check global selections for backward compatibility
    const globalTagValues = getSelectedTagValues();
    if (globalTagValues.length > 0 || customReason.trim()) {
      hasAnySelections = true;
    }
    
    if (!hasAnySelections) {
      setValidationError('Please select at least one stress contributor or provide a reflection before continuing.');
      return;
    }

    const allReasons = [...globalTagValues];
    if (customReason.trim()) {
      allReasons.push(customReason.trim());
    }

    setIsAnalyzing(true);
    setAnalysisFeedback('Analyzing your response');
    setIsGeneratingSupport(true);

    // Step 3: Log userId before saving
    console.log('Saving deep dive insight for userId:', userId);

    try {
      // Generate personalized support message using the enhanced function
      const personalizedSupport = await buildPersonalizedSupport(
        questionsToShow,
        globalTagValues,
        customReason,
        domainName
      );

      // Use the enhanced therapist support data
      const therapistSupport = personalizedSupport;

      // Call the new generateTherapistInsight function
      try {
        const therapistResponse = await generateTherapistInsight({
          userId: userId,
          domain: domainName,
          selectedTriggers: globalTagValues,
          userText: customReason || "No additional thoughts provided",
        });
        
        setTherapistAdvice(therapistResponse);
        console.log('Generated therapist advice:', therapistResponse);
      } catch (error) {
        console.error('Error generating therapist insight:', error);
        setTherapistAdvice('I can see you\'re dealing with some challenges. Your feelings are valid and worth acknowledging. Consider taking small steps to care for yourself, and remember that it\'s okay to ask for support when you need it.');
      }

      // Generate highly personalized, therapist-style advice
      const personalizedAdvicePrompt = `
You are an experienced therapist providing personalized mental health support. Your client has shared:

Domain: ${domainName}
Selected stress factors: ${therapistSupport.selectedTags.join(', ')}
Additional thoughts: ${customReason || 'None provided'}
Emotional tone: ${therapistSupport.emotion}
MCP Protocol: ${therapistSupport.mcpProtocol}

Based on their specific situation, provide a warm, human-like response that includes:

1. Emotional validation that shows deep understanding of their exact experience
2. 3-4 specific, actionable steps tailored to their situation
3. 2-3 reflection questions a therapist would ask to help them explore deeper
4. A gentle reminder about self-compassion

Respond in this JSON format:
{
  "validation": "A warm, validating statement that shows deep understanding of their specific situation",
  "actionableSteps": ["Step 1", "Step 2", "Step 3", "Step 4"],
  "reflectionQuestions": ["Question 1", "Question 2", "Question 3"],
  "selfCompassion": "A gentle reminder about being kind to themselves"
}
`;

      const adviceResponse = await callOpenAI(personalizedAdvicePrompt);
      
      // Clean and parse the response
      let cleanedResponse = adviceResponse;
      if (typeof cleanedResponse === 'string') {
        cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        cleanedResponse = cleanedResponse.replace(/^\s+|\s+$/g, '');
      }
      
      let adviceData;
      try {
        adviceData = JSON.parse(cleanedResponse || "{}");
      } catch (parseError) {
        console.error('Error parsing advice response:', parseError);
        // Fallback advice
        adviceData = {
          validation: "I can see how challenging this situation is for you, and your feelings are completely valid.",
          actionableSteps: [
            "Take a moment to breathe deeply and acknowledge your feelings",
            "Identify one small step you can take today to help yourself",
            "Consider reaching out to someone you trust for support",
            "Practice self-compassion by treating yourself as you would a good friend"
          ],
          reflectionQuestions: [
            "What would it feel like to give yourself permission to not have all the answers right now?",
            "If you could talk to yourself with the same kindness you'd offer a friend, what would you say?",
            "What would help you feel more supported in this situation?"
          ],
          selfCompassion: "Remember, you're doing the best you can with what you have right now. That's enough."
        };
      }

      // Use the enhanced personalized support data
      setAiSummary(therapistSupport.supportMessage);
      
      // Store enhanced therapist data for UI display
      setEnhancedTherapistData({
        title: therapistSupport.title,
        validation: therapistSupport.validation,
        actionableSteps: therapistSupport.actionableSteps,
        selfCompassion: therapistSupport.selfCompassion
      });

      // Generate personalized suggestions using Azure GPT
      try {
        const suggestions = await generatePersonalizedSuggestions(
          questionsToShow,
          globalTagValues,
          customReason
        );
        setPersonalizedSuggestions(suggestions);
        console.log('Generated personalized suggestions:', suggestions);
      } catch (error) {
        console.error('Error generating personalized suggestions:', error);
        // Set fallback suggestions in the correct structure
        setPersonalizedSuggestions([
          {
            suggestion: "Practice deep breathing exercises for 5-10 minutes daily.",
            why: "Deep breathing calms your nervous system and can quickly reduce acute stress.",
            timeframe: "immediate"
          },
          {
            suggestion: "Break down overwhelming tasks into smaller, manageable steps.",
            why: "Small steps make big challenges feel less daunting and help you build momentum.",
            timeframe: "this week"
          },
          {
            suggestion: "Make time for activities that bring you joy and relaxation.",
            why: "Positive experiences help counterbalance stress and improve your overall mood.",
            timeframe: "short-term"
          }
        ]);
      }

      const submission = {
        userId,
        domain: domainName,
        reasons: globalTagValues,
        customReason: customReason || null,
        aiSummary: therapistSupport.supportMessage,
        personalizedAdvice: adviceData,
        enhancedTherapistSupport: {
          title: therapistSupport.title,
          validation: therapistSupport.validation,
          actionableSteps: therapistSupport.actionableSteps,
          selfCompassion: therapistSupport.selfCompassion
        },
        mcpProtocol: therapistSupport.mcpProtocol,
        selectedTags: therapistSupport.selectedTags,
        emotion: therapistSupport.emotion,
        perQuestionData: allQuestionData,
        empatheticLines,
        questionStressContributors,
        questionReflections,
        timestamp: new Date().toISOString()
      };

      // Use sanitizeData before saving
      await saveDeepDiveInsight(userId, domainName, sanitizeData(submission));

      // Save stress triggers to vector memory
      await saveStressTriggersToMemory({
        userId: userId,
        domain: domainName,
        selectedTriggers: globalTagValues,
        customInputText: customReason || "",
        perQuestionData: allQuestionData
      });

      // Call parent onSave without continuing
      await onSave({ continue: false, data: submission });
      
      setAnalysisFeedback('Thank you for sharing. Your insights have been saved.');
      setIsComplete(true);
      setIsAnalyzing(false);
      setIsGeneratingSupport(false);
    } catch (error) {
      console.error('Error saving deep dive:', error);
      setAnalysisFeedback('There was an error saving your response. Please try again.');
      setIsAnalyzing(false);
      setIsGeneratingSupport(false);
    }
  };

  const handleContinue = async () => {
    // Prevent double-clicking
    if (isTransitioning) {
      console.log('🚫 Transition already in progress, ignoring click');
      return;
    }

    const globalTagValues = getSelectedTagValues();
    if (!userId || !domainName || (globalTagValues.length === 0 && !customReason.trim())) {
      setValidationError('Please select at least one reason or provide a custom response before continuing.');
      return;
    }

    console.log("💾 Saving selections:", globalTagValues);

    // Set transitioning state immediately to prevent double-clicks
    setIsTransitioning(true);

    try {
      // Clear current UI state first for immediate visual feedback
      setValidationError('');
      
      // Prepare final insights data
      const finalInsights = {
        userId,
        domain: domainName,
        reasons: globalTagValues,
        customReason: customReason?.trim() || null,
        aiSummary: aiSummary || null,
        timestamp: new Date().toISOString(),
        continue: true
      };

      // Run all save operations in parallel for faster performance
      const savePromises = [
        saveContributorsToDB(userId, domainName, globalTagValues),
        saveStressTriggersToMemory({
          userId: userId,
          domain: domainName,
          selectedTriggers: globalTagValues,
          customInputText: customReason || "",
        }),
        saveDeepDiveInsight(userId, domainName, sanitizeData(finalInsights))
      ];

      // Execute all saves in parallel
      console.log('⚡ Executing parallel saves for faster transition...');
      await Promise.all(savePromises);
      
      // Clear state for current domain
      setSelectedStressTags([]);
      setCustomReason('');
      setAiSummary('');
      setIsComplete(false);
      
      console.log('✅ All data saved successfully, transitioning to next domain...');
      
      // Trigger next domain immediately
      if (goToNextDomain) {
        goToNextDomain();
      } else {
        await onSave(finalInsights);
      }
      
      // Reset transitioning state after successful completion
      setIsTransitioning(false);
      
    } catch (error) {
      console.error('❌ Error saving deep dive insights or contributors:', error);
      setValidationError('Failed to save your insights. Please try again.');
      // Reset transitioning state on error
      setIsTransitioning(false);
    }
  };

  const renderEmotionIcon = (emotion) => {
    const Icon = getEmotionIcon(emotion);
    return Icon ? <Icon className="w-4 h-4 mr-1" /> : null;
  };

  const isAllDeepDiveComplete = () => {
    return selectedStressTags.length > 0 || customReason.trim().length > 0;
  };

  const handleShowInsight = async () => {
    if (!isAllDeepDiveComplete()) {
      setValidationError('Please select at least one reason or provide a custom response before continuing.');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Calculate average intensity based on stressed questions
      const avgIntensity = questionsToShow.reduce((sum, q) => sum + (q.score || 0), 0) / questionsToShow.length;
      
      // Extract tags from responses and reasons
      const tags = [
        ...getSelectedTagValues(),
        ...questionsToShow.flatMap(q => q.tags || [])
      ];

      // Build answers array for the domain insight
      const answers = questionsToShow.map(q => ({
        question: q.text,
        answer: q.selectedOption,
        score: q.score
      }));

      const prompt = domainInsightBuilder(domainName, answers, tags, avgIntensity);
      const gptRes = await callOpenAI(prompt);
      
      // Clean and parse the response with better error handling
      const cleanedResponse = cleanJSONResponse(gptRes);
      console.log('Cleaned response:', cleanedResponse); // Debug log
      
      try {
        const parsed = JSON.parse(cleanedResponse);
        setDomainInsight({
          summary: parsed.summary || "Unable to generate summary at this time.",
          tips: Array.isArray(parsed.tips) ? parsed.tips : ["Take a moment to reflect on your responses.", "Consider discussing these feelings with someone you trust."],
          stressLevel: parsed.stressLevel || "Moderate"
        });
        setShowInsightCard(true);
      } catch (parseError) {
        console.error('Error parsing domain insight:', parseError);
        console.log('Raw response:', gptRes);
        console.log('Cleaned response that failed to parse:', cleanedResponse);
        
        // Fallback response if parsing fails
        setDomainInsight({
          summary: "We've analyzed your responses and noticed some patterns worth discussing. Your feelings are valid and it's important to acknowledge them.",
          tips: [
            "Take time to reflect on what you've shared",
            "Consider discussing these feelings with someone you trust",
            "Remember that it's okay to take things one step at a time"
          ],
          stressLevel: "Moderate"
        });
        setShowInsightCard(true);
      }
    } catch (error) {
      console.error('Error generating domain insight:', error);
      setValidationError('Unable to generate insights at this time. Please try again.');
      
      // Final fallback if everything fails
      setDomainInsight({
        summary: "Thank you for sharing your experiences. Your responses show self-awareness, which is a valuable strength.",
        tips: [
          "Continue to monitor your feelings and needs",
          "Reach out for support when you need it",
          "Practice self-compassion during difficult times"
        ],
        stressLevel: "Moderate"
      });
      setShowInsightCard(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNextDomain = async () => {
    setReadyForNextDomain(true);
    
    // Save all insights before moving to next domain
    const finalInsights = {
      userId: propUserId,
      domain: domainName,
      reasons: getSelectedTagValues(),
      customReason: customReason?.trim() || null,
      aiSummary: aiSummary || null,
      domainInsight: domainInsight || null,
      timestamp: new Date().toISOString()
    };

    try {
      await saveDeepDiveInsight(propUserId, domainName, finalInsights);
      await onSave({
        data: finalInsights,
        continue: true
      });
    } catch (error) {
      console.error('Error saving deep dive insights:', error);
      setValidationError('Failed to save your insights. Please try again.');
    }
  };

  // Handler for updating answers
  const handleAnswerChange = (questionId, answer) => {
    setQuestionAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Handler for updating tags
  const handleTagsChange = (questionId, tags) => {
    setSelectedTags(prev => ({
      ...prev,
      [questionId]: tags
    }));
    
    // Also update the global selectedStressTags for backward compatibility
    if (questionId === 'global') {
      setSelectedStressTags(tags);
    }
    
    // Trigger per-question suggestions when dropdown selections change
    const question = questionsToShow.find(q => q.id === questionId);
    if (question) {
      const userInput = questionUserInputs[questionId] || '';
      handleQuestionUserInput(questionId, userInput);
    }
  };

  // Handler for updating intensity
  const handleIntensityChange = (questionId, intensity) => {
    setAnswerIntensities(prev => ({
      ...prev,
      [questionId]: intensity
    }));
  };

  // Handler for per-question user input and suggestions
  const handleQuestionUserInput = async (questionId, userInput) => {
    // Update user input state
    setQuestionUserInputs(prev => ({ ...prev, [questionId]: userInput }));
    
    // Get the question data
    const question = questionsToShow.find(q => q.id === questionId);
    if (!question) return;
    
    // Get selected dropdown values for this question
    const selectedDropdownValues = selectedTags[questionId] || [];
    
    // Generate per-question suggestions
    await generatePerQuestionSuggestions(question, selectedDropdownValues, userInput);
  };

  // Store deep dive response
  const storeDeepDiveResponse = async (questionId) => {
    const currentQ = {
      question: questionsToShow.find(q => q.id === questionId)?.text,
      answer: questionAnswers[questionId],
      tags: selectedTags[questionId] || [],
      intensity: answerIntensities[questionId] || 5,
      timestamp: new Date().toISOString()
    };

    try {
      // Update local state first
      setQuestionInsights(prev => ([
        ...prev,
        {
          questionId,
          ...currentQ
        }
      ]));

      // Then store in Firestore
      await saveDeepDiveInsight(userId, domainName, {
        questionId,
        ...currentQ
      });
    } catch (error) {
      console.error('Error storing deep dive response:', error);
      setValidationError('Failed to save your response. Please try again.');
    }
  };

  // Conditional rendering logic - handle early returns after all hooks have been called
  if (questionsToShow.length === 0) {
    // Check if we're still waiting for domain questions to be processed
    if (domainQuestions.length > 0 && filteredQuestions.length === 0) {
      console.log('⏳ Waiting for question filtering to complete...');
      return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 font-body flex items-center justify-center">
          <div className="text-center p-8">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-heading text-gray-800 mb-4">Processing Questions</h2>
            <p className="text-gray-600">
              Analyzing your responses to determine which areas need deeper exploration...
            </p>
          </div>
        </div>
      );
    }
    
    // No questions to show - automatically continue to next domain
    console.log('✅ No deep dive questions found. Continuing to next domain.');
    
    // 🔥 IMMEDIATE: Continue to next domain without delay
    if (goToNextDomain && typeof goToNextDomain === 'function') {
      goToNextDomain();
    } else {
      onSave({ continue: true, skip: true });
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 font-body flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-heading text-gray-800 mb-4">Great Progress!</h2>
          <p className="text-gray-600 mb-6">
            No significant stress concerns detected in this domain. Continuing to the next section...
          </p>
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 font-body">
      {/* Full Width Container - Edge to Edge Design */}
      <div className="w-full">
        {/* Deep Dive Block with Soft Pastel Background */}
        <div className="p-6" style={{backgroundColor: '#FFF7F0'}}>
          {/* Flex Layout - Main content and Sidebar */}
          <div className="flex flex-row gap-6 min-h-screen">
            
            {/* Main Content Area - Questions and Form */}
            <div className="w-2/3 bg-transparent">
            {/* Mobile Header - Only shown on mobile */}
            <div className="xl:hidden px-4 py-4 mb-4">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">What's Causing Your Stress?</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {domainName} – Let's explore what's been building up emotionally.
                </p>
              </div>
              {deepDiveData?.rootEmotion && (
                <div className="flex justify-center">
                  <span className="inline-flex items-center px-3 py-2 rounded-xl text-sm font-medium bg-white/90 text-blue-700 backdrop-blur-sm border border-blue-200 shadow-sm">
                    {renderEmotionIcon(deepDiveData.rootEmotion)}
                    <span className="ml-2">{deepDiveData.rootEmotion}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Header - Only shown on desktop */}
            <div className="hidden xl:block mb-6 px-4 xl:px-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">What's Causing Your Stress?</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {domainName} – Let's explore what's been building up emotionally.
                </p>
              </div>
              {deepDiveData?.rootEmotion && (
                <div className="flex justify-center">
                  <motion.span
                    initial={false}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={false}
                    transition={{ duration: 0.15 }}
                    className="inline-flex items-center px-4 py-2 rounded-xl text-base font-medium bg-white/90 text-blue-700 backdrop-blur-sm border border-blue-200 shadow-sm"
                  >
                    {renderEmotionIcon(deepDiveData.rootEmotion)}
                    <span className="ml-2">{deepDiveData.rootEmotion}</span>
                  </motion.span>
                </div>
              )}
            </div>

            {/* Questions and Form Content */}
            <div className="px-4 xl:px-8">
              <motion.div 
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                exit={false}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-3xl shadow-lg border border-gray-100"
              >

              {/* Content - Now expands naturally without fixed height */}
                <div className="px-6 lg:px-8 py-6 lg:py-8">
                  {/* Motivational Quote - Enhanced styling */}
                <motion.div
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={false}
                  transition={{ duration: 0.15 }}
                    className="mb-8 p-6 lg:p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-sm"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xl lg:text-2xl font-bold text-blue-900 mb-3 leading-tight">
                        "Every step toward understanding yourself is a step toward healing."
                      </p>
                        <p className="text-base lg:text-lg text-blue-700 leading-relaxed">
                        Take a moment to reflect on what's been on your mind lately.
                      </p>
                    </div>
                  </div>
                </motion.div>

                  {/* Stressed Questions - Enhanced Card Layout with better spacing */}
                  <div className="space-y-4">
                  {questionsToShow.map((q, idx) => (
                    <div
                    key={q.id}
                      className="rounded-2xl shadow-md p-6 mb-6 bg-white border border-gray-100"
                    >
                      {/* ❓ Question Text - bold, larger font */}
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                          <span className="mr-2">❓</span>
                          {q.text}
                        </h3>
                        <div className="flex items-center gap-2">
                          {/* Stress Score Badge */}
                          {(q.stressScore || q.aiAnalysis?.enhanced?.score) && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                              Score: {q.aiAnalysis?.enhanced?.score || q.stressScore}/10
                            </span>
                          )}
                          {/* Stress Tag */}
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            {(() => {
                              const score = q.aiAnalysis?.enhanced?.score || q.stressScore || 0;
                              if (score >= 8) return 'High Stress';
                              if (score >= 5) return 'Moderate Stress';
                              return 'Low Stress';
                            })()}
                          </span>
                        </div>
                      </div>

                      {/* 💬 User's Answer - lighter font, italic */}
                      {q.selectedOption && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center mb-2">
                            <span className="mr-2">💬</span>
                            <span className="font-medium text-gray-700 text-sm">Your Answer:</span>
                          </div>
                          <p className="text-gray-600 italic font-light">{q.selectedOption}</p>
                        </div>
                      )}

                      {/* 💡 AI Insight - light blue bubble with card elevation */}
                      {empatheticLines[q.id] && (
                        <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
                          <div className="flex items-center mb-2">
                            <span className="mr-2">💡</span>
                            <span className="font-medium text-blue-700 text-sm">AI Insight:</span>
                          </div>
                          <p className="text-blue-700 italic">"{empatheticLines[q.id]}"</p>
                        </div>
                      )}

                      {/* 📌 Contributors Dropdown - refined with card elevation */}
                      {questionStressContributors[q.id] && (
                        <div className="mb-4 p-4 bg-orange-50 rounded-xl border border-orange-100 shadow-sm">
                          <div className="flex items-center mb-3">
                            <span className="mr-2">📌</span>
                            <span className="font-medium text-orange-700 text-sm">What's Contributing to This?</span>
                          </div>
                          <DeepDiveUI
                            stressOptions={questionStressContributors[q.id]}
                            selectedStressTags={selectedTags[q.id] || []}
                            onStressTagsChange={(tags) => handleTagsChange(q.id, tags)}
                            maxSelections={3}
                            placeholder="Choose stress contributors..."
                            className="w-full"
                            questionId={q.id}
                            isLoading={loadingOptions[q.id] || false}
                          />
                        </div>
                      )}

                      {/* ✅ Suggestions - bulleted with green tick icons and card elevation */}
                      {(questionSuggestions[q.id] || questionLoadingStates[q.id]) && (
                        <div className="p-4 bg-green-50 rounded-xl border border-green-100 shadow-sm">
                          <div className="flex items-center mb-3">
                            <span className="mr-2">✅</span>
                            <span className="font-medium text-green-700 text-sm">Suggestions:</span>
                          </div>
                          {questionLoadingStates[q.id] ? (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                              Generating personalized suggestions...
                            </div>
                          ) : questionSuggestions[q.id] ? (
                            <ul className="space-y-2">
                              {questionSuggestions[q.id].map((suggestion, index) => (
                                <li key={index} className="flex items-start text-sm text-green-700">
                                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                  <span>{suggestion}</span>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      )}
                        </div>
            ))}
                  </div>

                  {/* Input Section - Enhanced styling */}
                  <div className="space-y-8">

                  {/* Additional Thoughts */}
                    <div className="p-6 lg:p-8 bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl border border-gray-200 shadow-sm">
                      <label htmlFor="customReason" className="block text-base lg:text-lg font-bold text-gray-900 mb-4">
                  Anything else you'd like to share?
                </label>
                <textarea
                  id="customReason"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Share your thoughts here..."
                        className="w-full h-32 px-4 lg:px-6 py-4 lg:py-6 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-base lg:text-lg leading-relaxed shadow-md"
                />
              </div>

                    {/* Submit Button - Enhanced styling */}
              {!isAnalyzing && !aiSummary && (
                <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.1 }}
                  onClick={handleSubmit}
                      disabled={isLoading || !Object.values(selectedTags).some(tags => tags.length > 0) && !customReason.trim()}
                        className={`w-full py-4 lg:py-6 px-6 lg:px-8 rounded-xl font-bold text-white flex items-center justify-center transition-all text-base lg:text-lg shadow-lg hover:shadow-xl ${
                        isLoading || (!Object.values(selectedTags).some(tags => tags.length > 0) && !customReason.trim())
                          ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                  }`}
                >
                  {isLoading ? (
                    <>
                            <Loader2 className="w-5 h-5 lg:w-6 lg:h-6 mr-3 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue
                            <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 ml-3" />
                    </>
                  )}
                </motion.button>
              )}

                  {/* Skip Option */}
                  <div className="text-center">
                    <button
                      onClick={() => onSave({ continue: true, skip: true })}
                        className="text-base lg:text-lg text-gray-500 hover:text-gray-700 transition-colors font-medium"
                    >
                      Skip Analysis
                    </button>
                  </div>
            </div>

                  {/* AI Response - Enhanced styling */}
            {aiSummary && (
              <motion.div
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    exit={false}
                    transition={{ duration: 0.15 }}
                      className="mt-8 p-6 lg:p-8 bg-gradient-to-br from-purple-50 via-lavender-50 to-blue-50 rounded-2xl border border-purple-100 shadow-lg shadow-purple-100/50 relative"
                    >
                      <div className="flex items-center mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                            <Heart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl lg:text-2xl font-bold text-blue-900 leading-tight">
                            Personalized Support
                          </h3>
                            <p className="text-base lg:text-lg text-blue-600 leading-relaxed">
                            Tailored advice based on your specific situation
                          </p>
                        </div>
                      </div>
                  
                      {/* MCP Protocol Indicator - Floating top-right */}
                      {(() => {
                        const mcpLevel = selectedStressTags.length >= 3 ? 'Escalate' : 
                                       selectedStressTags.length >= 2 ? 'Monitor' : 'Support';
                        const mcpColors = {
                          'Support': 'bg-green-100 text-green-700 border-green-200',
                          'Monitor': 'bg-yellow-100 text-yellow-700 border-yellow-200',
                          'Escalate': 'bg-red-100 text-red-700 border-red-200'
                        };
                        
                        return (
                          <div className="absolute top-4 right-4">
                              <div className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${mcpColors[mcpLevel]}`}>
                              MCP: {mcpLevel}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    
                      <div className="space-y-6 text-base lg:text-lg text-gray-700 leading-relaxed">
                      {/* Main Support Message */}
                        {/* HIDDEN: Personalized support message */}
                        {/* <div className="p-6 bg-white/70 rounded-xl border border-blue-200 shadow-sm">
                          <p className="italic text-blue-900 mb-3 font-semibold">
                          💙 Your personalized support message:
                        </p>
                          <p className="leading-relaxed">
                          {aiSummary}
                        </p>
                      </div> */}

                      {/* Enhanced Structured Support (if available) */}
                      {(() => {
                        // Use the stored enhanced therapist data
                        const enhancedData = enhancedTherapistData;
                        
                        if (enhancedData) {
                          return (
                            <>
                              {/* HIDDEN: Validation Section */}
                              {/* {enhancedData.validation && (
                                  <div className="p-6 bg-green-50 rounded-xl border border-green-200 shadow-sm">
                                    <p className="text-green-900 font-bold mb-3">💚 Emotional Validation:</p>
                                    <p className="text-gray-700 leading-relaxed">{enhancedData.validation}</p>
                                </div>
                              )} */}

                              {/* HIDDEN: Actionable Steps */}
                              {/* {enhancedData.actionableSteps && enhancedData.actionableSteps.length > 0 && (
                                  <div className="p-6 bg-purple-50 rounded-xl border border-purple-200 shadow-sm">
                                    <p className="text-purple-900 font-bold mb-3">🎯 Actionable Steps:</p>
                                    <ul className="space-y-3">
                                    {enhancedData.actionableSteps.map((step, index) => (
                                      <li key={index} className="flex items-start">
                                          <span className="text-purple-600 mr-3 mt-1 text-lg">•</span>
                                          <span className="text-gray-700 leading-relaxed">{step}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )} */}

                              {/* HIDDEN: Self Compassion */}
                              {/* {enhancedData.selfCompassion && (
                                  <div className="p-6 bg-orange-50 rounded-xl border border-orange-200 shadow-sm">
                                    <p className="text-orange-900 font-bold mb-3">💛 Self-Compassion Reminder:</p>
                                    <p className="text-gray-700 italic leading-relaxed">{enhancedData.selfCompassion}</p>
                                </div>
                              )} */}
                            </>
                          );
                        }
                        return null;
                      })()}

                      {/* New Therapist Insight from generateTherapistInsight */}
                      {therapistAdvice && (
                        <div className="p-6 bg-gradient-to-br from-lavender-50 via-purple-50 to-indigo-50 rounded-xl border border-lavender-200 shadow-md shadow-lavender-100/30">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-lavender-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                              <MessageCircle className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-lavender-900 font-bold text-lg">🤗 AI Therapist Insight</p>
                          </div>
                          <p className="text-gray-700 leading-relaxed italic">
                            "{therapistAdvice}"
                          </p>
                        </div>
                      )}

                  </div>

                    <motion.button
                      onClick={handleContinue}
                      className={`mx-auto mt-6 block w-fit py-6 lg:py-8 px-8 lg:px-10 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white rounded-2xl font-bold hover:from-emerald-600 hover:via-teal-600 hover:to-blue-600 transition-all flex items-center justify-center shadow-xl hover:shadow-2xl text-lg lg:text-xl ${isTransitioning || (getSelectedTagValues().length === 0 && !customReason.trim()) ? 'opacity-70 cursor-not-allowed' : 'opacity-100'}`}
                      disabled={isLoading || isTransitioning || (getSelectedTagValues().length === 0 && !customReason.trim())}
                      whileHover={{ scale: isTransitioning ? 1 : 1.02 }}
                      whileTap={{ scale: isTransitioning ? 1 : 0.98 }}
                    >
                      {isTransitioning ? (
                        <>
                          <Loader2 className="w-6 h-6 lg:w-7 lg:h-7 mr-3 animate-spin" />
                          Transitioning...
                        </>
                      ) : (
                        <>
                          Continue to Next Section
                          <ChevronRight className="w-6 h-6 lg:w-7 lg:h-7 ml-3" />
                        </>
                      )}
                    </motion.button>
              </motion.div>
            )}
              </div>
              </motion.div>
            </div>

            {/* Mobile Tips and Help Section - Collapsible for screens <768px */}
            <div className="xl:hidden px-4 mt-6">
              <button
                onClick={() => setShowMobileTips(!showMobileTips)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-md border border-gray-100 mb-4"
              >
                <div className="flex items-center space-x-3">
                  <Lightbulb className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-gray-900">Tips & Help</span>
                </div>
                <motion.div
                  animate={{ rotate: showMobileTips ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </motion.div>
              </button>

              <AnimatePresence>
                {showMobileTips && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {/* Tips Card */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                          <Lightbulb className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="font-bold text-gray-900">Tips</h3>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                          <p className="text-sm text-gray-600">Be honest with your responses for better insights</p>
                        </div>
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                          <p className="text-sm text-gray-600">Take your time to reflect on each question</p>
                        </div>
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                          <p className="text-sm text-gray-600">Share additional thoughts for personalized support</p>
                        </div>
                      </div>
                    </div>

                    {/* Need Help Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Heart className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="font-bold text-blue-900">Need Help?</h3>
                      </div>

                      <p className="text-sm text-blue-700 mb-3">
                        Remember, this is a safe space. Your responses help us provide better support.
                      </p>
                      
                      <div className="flex items-center space-x-2 text-sm text-blue-600">
                        <Shield className="w-4 h-4" />
                        <span>Your data is secure and private</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

            {/* Sidebar - Enhanced styling with flex positioning */}
            <aside className="w-1/3 sticky top-10 h-fit space-y-6">
            {/* Progress Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Progress</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-base text-gray-600">Questions Answered</span>
                  <span className="text-base font-bold text-gray-900">{questionsToShow.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base text-gray-600">Stress Contributors</span>
                  <span className="text-base font-bold text-gray-900">{selectedStressTags.length}/3</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(selectedStressTags.length / 3) * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                  />
                </div>
              </div>
            </motion.div>

            {/* Tips Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Tips</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Be honest with your responses for better insights
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Take your time to reflect on each question
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Share additional thoughts for personalized support
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Support Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100 p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-blue-900">Need Help?</h3>
              </div>

              <p className="text-sm text-blue-700 leading-relaxed mb-4">
                Remember, this is a safe space. Your responses help us provide better support.
              </p>
              
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <Shield className="w-4 h-4" />
                <span>Your data is secure and private</span>
              </div>
            </motion.div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeepDiveFollowup;
