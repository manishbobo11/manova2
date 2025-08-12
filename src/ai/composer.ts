import { IntentClassification } from './intentRouter';
import { ToolResult } from './orchestrator';

interface ComposerContext {
  userMessage: string;
  userLanguage: string;
  languageOverride?: string;
  intent: IntentClassification;
  toolResult?: ToolResult;
  userContext?: {
    name?: string;
    stressLevel?: number;
    preferences?: any;
  };
}

interface ComposedReply {
  validation: string;
  actions: string[];
  nudge: string;
  cta: string;
  fullResponse: string;
}

/**
 * Main composer function that generates structured replies
 */
export async function composeReply(context: ComposerContext): Promise<ComposedReply> {
  const targetLanguage = context.languageOverride || context.userLanguage || 'en';
  
  // Generate each component
  const validation = await generateValidation(context, targetLanguage);
  const actions = await generateActions(context, targetLanguage);
  const nudge = await generateNudge(context, targetLanguage);
  const cta = await generateCTA(context, targetLanguage);
  
  // Compose full response
  const fullResponse = composeFullResponse({
    validation,
    actions,
    nudge,
    cta
  }, targetLanguage);
  
  return {
    validation,
    actions,
    nudge,
    cta,
    fullResponse
  };
}

/**
 * Generates validation statement (1-2 lines)
 */
async function generateValidation(context: ComposerContext, language: string): Promise<string> {
  const { intent, userMessage, userContext } = context;
  
  const validations = {
    en: {
      therapy_support: [
        "I hear you, and it's completely normal to feel this way.",
        "Your feelings are valid, and you're not alone in this.",
        "I understand this is challenging, and it's okay to feel overwhelmed."
      ],
      quick_tip: [
        "Great question! Let me share a practical approach.",
        "That's a smart thing to focus on. Here's what can help.",
        "I love that you're thinking about this. Here's a simple solution."
      ],
      plan_builder: [
        "Let's break this down into manageable steps.",
        "I'm excited to help you create a plan for this goal.",
        "This is a great goal to work toward. Let's make it happen."
      ],
      crisis: [
        "I'm here with you right now, and you're not alone.",
        "Your safety matters, and I want to help you get support."
      ],
      small_talk: [
        "It's nice to chat with you!",
        "I appreciate you taking the time to connect."
      ]
    },
    hi: {
      therapy_support: [
        "मैं आपकी बात सुन रहा हूं, और यह महसूस करना पूरी तरह सामान्य है।",
        "आपकी भावनाएं वैध हैं, और आप इसमें अकेले नहीं हैं।"
      ],
      quick_tip: [
        "बहुत अच्छा सवाल! मैं एक व्यावहारिक दृष्टिकोण साझा करता हूं।",
        "यह ध्यान केंद्रित करने के लिए एक स्मार्ट बात है।"
      ],
      plan_builder: [
        "चलिए इसे प्रबंधनीय कदमों में तोड़ते हैं।",
        "मैं आपकी इस लक्ष्य के लिए योजना बनाने में मदद करने के लिए उत्साहित हूं।"
      ],
      crisis: [
        "मैं अभी आपके साथ हूं, और आप अकेले नहीं हैं।",
        "आपकी सुरक्षा मायने रखती है।"
      ],
      small_talk: [
        "आपसे बात करना अच्छा लग रहा है!",
        "कनेक्ट करने के लिए समय निकालने के लिए धन्यवाद।"
      ]
    }
  };
  
  const languageValidations = validations[language as keyof typeof validations] || validations.en;
  const intentValidations = languageValidations[intent.intent as keyof typeof languageValidations] || languageValidations.therapy_support;
  
  // Select validation based on context
  const index = Math.floor(Math.random() * intentValidations.length);
  return intentValidations[index];
}

/**
 * Generates actionable bullet points (2-5 points)
 */
async function generateActions(context: ComposerContext, language: string): Promise<string[]> {
  const { intent, toolResult, userContext } = context;
  
  // Use tool results if available
  if (toolResult?.success && toolResult.data) {
    return formatToolResults(toolResult.data, intent.intent, language);
  }
  
  // Fallback actions based on intent
  const actions = {
    en: {
      therapy_support: [
        "Take 3 deep breaths right now",
        "Write down one thing you're grateful for",
        "Reach out to someone you trust",
        "Do something kind for yourself today"
      ],
      quick_tip: [
        "Start with just 2 minutes",
        "Make it enjoyable and sustainable",
        "Track your progress, no matter how small",
        "Celebrate every step forward"
      ],
      plan_builder: [
        "Break your goal into smaller steps",
        "Set specific times for each action",
        "Create accountability with a friend",
        "Review and adjust your plan weekly"
      ],
      crisis: [
        "Call KIRAN helpline at 1800-599-0019",
        "Stay with someone you trust",
        "Remove any harmful objects from your space",
        "Remember: this feeling will pass"
      ],
      small_talk: [
        "Share something positive from your day",
        "Ask about their interests or hobbies",
        "Express genuine curiosity about their life"
      ]
    },
    hi: {
      therapy_support: [
        "अभी 3 गहरी सांसें लें",
        "एक चीज़ लिखें जिसके लिए आप आभारी हैं",
        "किसी भरोसेमंद व्यक्ति से संपर्क करें",
        "आज अपने लिए कुछ अच्छा करें"
      ],
      quick_tip: [
        "सिर्फ 2 मिनट से शुरू करें",
        "इसे आनंददायक और टिकाऊ बनाएं",
        "अपनी प्रगति को ट्रैक करें",
        "हर छोटी सफलता का जश्न मनाएं"
      ],
      plan_builder: [
        "अपने लक्ष्य को छोटे कदमों में तोड़ें",
        "हर कार्य के लिए विशिष्ट समय निर्धारित करें",
        "दोस्त के साथ जवाबदेही बनाएं",
        "साप्ताहिक रूप से अपनी योजना की समीक्षा करें"
      ],
      crisis: [
        "KIRAN हेल्पलाइन 1800-599-0019 पर कॉल करें",
        "किसी भरोसेमंद व्यक्ति के साथ रहें",
        "अपने आसपास से हानिकारक वस्तुओं को हटा दें",
        "याद रखें: यह भावना गुजर जाएगी"
      ],
      small_talk: [
        "अपने दिन की कुछ सकारात्मक बात साझा करें",
        "उनकी रुचियों के बारे में पूछें",
        "उनके जीवन के बारे में वास्तविक जिज्ञासा व्यक्त करें"
      ]
    }
  };
  
  const languageActions = actions[language as keyof typeof actions] || actions.en;
  const intentActions = languageActions[intent.intent as keyof typeof languageActions] || languageActions.therapy_support;
  
  // Return 2-5 actions
  const count = Math.min(intentActions.length, Math.max(2, Math.floor(Math.random() * 3) + 2));
  return intentActions.slice(0, count);
}

/**
 * Generates motivational nudge (1 line)
 */
async function generateNudge(context: ComposerContext, language: string): Promise<string> {
  const { intent, userContext } = context;
  
  const nudges = {
    en: {
      therapy_support: [
        "You're doing better than you think.",
        "Every step forward counts, no matter how small.",
        "You have more strength than you realize."
      ],
      quick_tip: [
        "Small steps lead to big changes.",
        "Progress over perfection.",
        "You've got this!"
      ],
      plan_builder: [
        "You're capable of amazing things.",
        "Your future self will thank you.",
        "Every expert was once a beginner."
      ],
      crisis: [
        "You matter, and help is available.",
        "This moment doesn't define your future.",
        "You're not alone in this."
      ],
      small_talk: [
        "Connection is a beautiful thing.",
        "Every conversation is an opportunity to grow."
      ]
    },
    hi: {
      therapy_support: [
        "आप सोचते हैं उससे बेहतर कर रहे हैं।",
        "हर छोटा कदम भी मायने रखता है।",
        "आपमें आपकी सोच से ज्यादा ताकत है।"
      ],
      quick_tip: [
        "छोटे कदम बड़े बदलाव लाते हैं।",
        "परफेक्शन से ज्यादा प्रगति महत्वपूर्ण है।",
        "आप यह कर सकते हैं!"
      ],
      plan_builder: [
        "आप अद्भुत चीजें करने में सक्षम हैं।",
        "आपका भविष्य का स्वयं आपको धन्यवाद देगा।",
        "हर विशेषज्ञ कभी शुरुआती था।"
      ],
      crisis: [
        "आप महत्वपूर्ण हैं, और मदद उपलब्ध है।",
        "यह क्षण आपके भविष्य को परिभाषित नहीं करता।",
        "आप इसमें अकेले नहीं हैं।"
      ],
      small_talk: [
        "कनेक्शन एक सुंदर चीज़ है।",
        "हर बातचीत बढ़ने का अवसर है।"
      ]
    }
  };
  
  const languageNudges = nudges[language as keyof typeof nudges] || nudges.en;
  const intentNudges = languageNudges[intent.intent as keyof typeof languageNudges] || languageNudges.therapy_support;
  
  const index = Math.floor(Math.random() * intentNudges.length);
  return intentNudges[index];
}

/**
 * Generates call-to-action
 */
async function generateCTA(context: ComposerContext, language: string): Promise<string> {
  const ctas = {
    en: "Want me to break this into a day plan?",
    hi: "क्या आप चाहते हैं कि मैं इसे दिन की योजना में तोड़ दूं?",
    es: "¿Quieres que lo divida en un plan diario?",
    fr: "Voulez-vous que je le divise en un plan quotidien?"
  };
  
  return ctas[language as keyof typeof ctas] || ctas.en;
}

/**
 * Composes the full response from components
 */
function composeFullResponse(components: {
  validation: string;
  actions: string[];
  nudge: string;
  cta: string;
}, language: string): string {
  const { validation, actions, nudge, cta } = components;
  
  // Format actions as bullets
  const actionBullets = actions.map(action => `• ${action}`).join('\n');
  
  // Compose full response
  const response = `${validation}\n\n${actionBullets}\n\n${nudge} ${cta}`;
  
  return response;
}

/**
 * Formats tool results into actionable items
 */
function formatToolResults(data: any, intent: string, language: string): string[] {
  if (Array.isArray(data)) {
    return data.slice(0, 4); // Limit to 4 items
  }
  
  if (data.steps && Array.isArray(data.steps)) {
    return data.steps.slice(0, 4);
  }
  
  if (data.avgWellness !== undefined) {
    return [
      `Your average wellness score is ${data.avgWellness}/10`,
      "Focus on one stress domain at a time",
      "Celebrate small improvements",
      "Track your progress daily"
    ];
  }
  
  // Fallback
  return ["Take a deep breath", "Be kind to yourself", "You're making progress"];
}
