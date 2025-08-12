interface IntentClassification {
  intent: 'therapy_support' | 'quick_tip' | 'plan_builder' | 'crisis' | 'small_talk';
  confidence: number;
  language: string;
}

/**
 * Classifies user intent from message and chat history
 * @param message - Current user message
 * @param history - Previous chat messages for context
 * @returns Promise<IntentClassification> - Intent classification with confidence and language
 */
export async function classifyIntent(
  message: string, 
  history: Array<{role: string, content: string}> = []
): Promise<IntentClassification> {
  
  const prompt = `Analyze this user message and classify the intent. Return JSON only.

Message: "${message}"
Recent context: ${history.slice(-3).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Classify into one of these intents:
- therapy_support: Emotional support, mental health concerns, relationship issues
- quick_tip: Practical advice, daily tips, simple solutions
- plan_builder: Goal setting, habit formation, long-term planning
- crisis: Urgent mental health crisis, self-harm, severe distress
- small_talk: Casual conversation, greetings, general chat

Return JSON: {"intent": "intent_name", "confidence": 0.0-1.0, "language": "detected_language"}`;

  try {
    // Call your AI model here (OpenAI, Azure, etc.)
    // This is a placeholder - replace with your actual model call
    const response = await callAIModel(prompt);
    
    let classification: IntentClassification;
    
    try {
      classification = JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse intent classification:', parseError);
      return {
        intent: 'therapy_support',
        confidence: 0.5,
        language: 'en'
      };
    }

    // Validate and clamp confidence
    if (classification.confidence < 0.55) {
      classification.intent = 'therapy_support';
      classification.confidence = 0.5;
    }

    // Ensure confidence is between 0 and 1
    classification.confidence = Math.max(0, Math.min(1, classification.confidence));

    // Validate intent
    const validIntents = ['therapy_support', 'quick_tip', 'plan_builder', 'crisis', 'small_talk'];
    if (!validIntents.includes(classification.intent)) {
      classification.intent = 'therapy_support';
    }

    return classification;

  } catch (error) {
    console.error('Intent classification failed:', error);
    return {
      intent: 'therapy_support',
      confidence: 0.5,
      language: 'en'
    };
  }
}

/**
 * Placeholder function for AI model call
 * Replace this with your actual model implementation
 */
async function callAIModel(prompt: string): Promise<string> {
  // TODO: Implement your AI model call here
  // Example with OpenAI:
  /*
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
    max_tokens: 100
  });
  return response.choices[0].message.content || '';
  */
  
  // Fallback for now
  return JSON.stringify({
    intent: 'therapy_support',
    confidence: 0.7,
    language: 'en'
  });
}

/**
 * Helper function to get intent description
 */
export function getIntentDescription(intent: string): string {
  const descriptions = {
    therapy_support: 'Emotional support and mental health guidance',
    quick_tip: 'Practical advice and daily tips',
    plan_builder: 'Goal setting and habit formation',
    crisis: 'Crisis intervention and urgent support',
    small_talk: 'Casual conversation and general chat'
  };
  return descriptions[intent as keyof typeof descriptions] || 'General support';
}
