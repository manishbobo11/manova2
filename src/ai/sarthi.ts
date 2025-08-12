import { AIClient, createAIClient } from './client';
import { classifyIntent, IntentClassification } from './intentRouter';
import { orchestrateResponse, OrchestratorContext } from './orchestrator';
import { composeReply, ComposerContext } from './composer';
import { criticCheck, CriticResult } from './critic';
import { Guardrails, createGuardrails } from './guardrails';
import { SarthiMemory, createSarthiMemory } from './memory';
import { toolDefinitions, ToolRegistry } from './tools';
import { SARTHI_FULL_PROMPT, SARTHI_CRISIS_PROMPT } from './prompts/sarthi-full';

interface SarthiConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  enableStreaming?: boolean;
  enableCrisisDetection?: boolean;
  enableMemory?: boolean;
  enableTools?: boolean;
}

interface SarthiResponse {
  content: string;
  intent: IntentClassification;
  isCrisis: boolean;
  crisisSeverity?: string;
  toolsUsed?: string[];
  confidence: number;
  language: string;
  timestamp: Date;
}

interface SarthiContext {
  userId: string;
  userLanguage: string;
  languageOverride?: string;
  userPreferences?: any;
  wellnessHistory?: any;
  currentStressLevel?: number;
}

/**
 * Main Sarthi class that integrates all components
 */
export class Sarthi {
  private aiClient: AIClient;
  private guardrails: Guardrails;
  private memory: SarthiMemory;
  private config: SarthiConfig;
  private tools: ToolRegistry;

  constructor(config: SarthiConfig) {
    this.config = {
      enableStreaming: true,
      enableCrisisDetection: true,
      enableMemory: true,
      enableTools: true,
      ...config
    };

    // Initialize AI client
    this.aiClient = createAIClient({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: config.model
    });

    // Initialize guardrails
    this.guardrails = createGuardrails({}, this.aiClient);

    // Initialize memory
    this.memory = createSarthiMemory();

    // Initialize tools (placeholder - implement actual tool functions)
    this.tools = this.initializeTools();
  }

  /**
   * Main method to process user message and generate response
   */
  async processMessage(
    userMessage: string,
    context: SarthiContext,
    chatHistory: Array<{role: string, content: string}> = []
  ): Promise<SarthiResponse> {
    const startTime = Date.now();
    const targetLanguage = context.languageOverride || context.userLanguage || 'en';

    try {
      // Step 1: Crisis Detection (if enabled)
      let crisisDetection = null;
      if (this.config.enableCrisisDetection) {
        crisisDetection = await this.guardrails.detectCrisis(userMessage, targetLanguage);
        
        if (crisisDetection.isCrisis) {
          const crisisResponse = await this.guardrails.overrideWithCrisisResponse(
            crisisDetection,
            targetLanguage,
            userMessage
          );

          // Log crisis interaction
          if (this.config.enableMemory) {
            await this.memory.writeTurnSummary({
              userId: context.userId,
              userMessage,
              sarthiResponse: crisisResponse,
              intent: 'crisis',
              confidence: crisisDetection.confidence,
              language: targetLanguage,
              emotionalTone: crisisDetection.severity === 'critical' ? 'crisis' : 'negative'
            });
          }

          return {
            content: crisisResponse,
            intent: {
              intent: 'crisis',
              confidence: crisisDetection.confidence,
              language: targetLanguage
            },
            isCrisis: true,
            crisisSeverity: crisisDetection.severity,
            confidence: crisisDetection.confidence,
            language: targetLanguage,
            timestamp: new Date()
          };
        }
      }

      // Step 2: Intent Classification
      const intent = await this.aiClient.classifyIntent(userMessage, chatHistory);

      // Step 3: Fast-path optimization for quick_tip
      if (intent.intent === 'quick_tip' && intent.confidence > 0.7) {
        try {
          const fastResponse = await this.aiClient.fastPathCompose(
            userMessage,
            targetLanguage,
            intent
          );

          const response: SarthiResponse = {
            content: fastResponse,
            intent,
            isCrisis: false,
            confidence: intent.confidence,
            language: targetLanguage,
            timestamp: new Date()
          };

          // Log interaction
          if (this.config.enableMemory) {
            await this.logInteraction(context, userMessage, fastResponse, intent);
          }

          return response;
        } catch (error) {
          console.warn('Fast path failed, falling back to full flow:', error);
        }
      }

      // Step 4: Full orchestration flow
      const orchestratorContext: OrchestratorContext = {
        userId: context.userId,
        userLanguage: targetLanguage,
        wellnessHistory: context.wellnessHistory,
        currentStressLevel: context.currentStressLevel,
        preferences: context.userPreferences
      };

      const response = await orchestrateResponse(userMessage, chatHistory, orchestratorContext);

      // Step 5: Response validation and revision
      const criticResult = await criticCheck(response, {
        intent: intent.intent,
        userLanguage: targetLanguage,
        originalMessage: userMessage
      });

      const finalResponse = criticResult.passed ? response : (criticResult.revisedResponse || response);

      // Step 6: Log interaction
      if (this.config.enableMemory) {
        await this.logInteraction(context, userMessage, finalResponse, intent);
      }

      return {
        content: finalResponse,
        intent,
        isCrisis: false,
        confidence: intent.confidence,
        language: targetLanguage,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Sarthi processing error:', error);
      
      // Fallback response
      const fallbackResponse = this.getFallbackResponse(targetLanguage);
      
      return {
        content: fallbackResponse,
        intent: {
          intent: 'therapy_support',
          confidence: 0.5,
          language: targetLanguage
        },
        isCrisis: false,
        confidence: 0.5,
        language: targetLanguage,
        timestamp: new Date()
      };
    }
  }

  /**
   * Stream response for real-time interaction
   */
  async *streamResponse(
    userMessage: string,
    context: SarthiContext,
    chatHistory: Array<{role: string, content: string}> = []
  ): AsyncGenerator<{content: string; done: boolean; error?: string}> {
    const targetLanguage = context.languageOverride || context.userLanguage || 'en';

    try {
      // Crisis detection first
      if (this.config.enableCrisisDetection) {
        const crisisDetection = await this.guardrails.detectCrisis(userMessage, targetLanguage);
        
        if (crisisDetection.isCrisis) {
          const crisisResponse = await this.guardrails.overrideWithCrisisResponse(
            crisisDetection,
            targetLanguage,
            userMessage
          );
          
          yield { content: crisisResponse, done: true };
          return;
        }
      }

      // Intent classification
      const intent = await this.aiClient.classifyIntent(userMessage, chatHistory);

      // Compose streaming response
      const composerContext: ComposerContext = {
        userMessage,
        userLanguage: targetLanguage,
        languageOverride: context.languageOverride,
        intent,
        userContext: {
          name: context.userId,
          stressLevel: context.currentStressLevel,
          preferences: context.userPreferences
        }
      };

      const stream = await this.aiClient.composeReply(composerContext, true);
      
      if (typeof stream === 'string') {
        yield { content: stream, done: true };
      } else {
        for await (const chunk of stream) {
          yield chunk;
        }
      }

    } catch (error) {
      console.error('Sarthi streaming error:', error);
      yield { 
        content: this.getFallbackResponse(targetLanguage), 
        done: true, 
        error: 'processing_error' 
      };
    }
  }

  /**
   * Get user context summary
   */
  async getUserContext(userId: string) {
    if (!this.config.enableMemory) {
      return null;
    }
    return await this.memory.fetchContextSummary(userId);
  }

  /**
   * Get recent conversation history
   */
  async getRecentHistory(userId: string, limit: number = 10) {
    if (!this.config.enableMemory) {
      return [];
    }
    return await this.memory.getRecentTurnSummaries(userId, limit);
  }

  /**
   * Clear user data (for privacy/GDPR compliance)
   */
  async clearUserData(userId: string) {
    if (this.config.enableMemory) {
      await this.memory.clearUserData(userId);
    }
  }

  /**
   * Get system statistics
   */
  getStats() {
    const stats: any = {
      config: {
        streaming: this.config.enableStreaming,
        crisisDetection: this.config.enableCrisisDetection,
        memory: this.config.enableMemory,
        tools: this.config.enableTools
      }
    };

    if (this.config.enableMemory) {
      stats.memory = this.memory.getMemoryStats();
    }

    return stats;
  }

  /**
   * Initialize tools (placeholder implementation)
   */
  private initializeTools(): ToolRegistry {
    return {
      fetch_checkins: async (userId: string, days: number = 30) => {
        // TODO: Implement actual check-in fetching
        return {
          avgWellness: 7.2,
          stressDomains: [
            { domain: 'work', score: 6.5 },
            { domain: 'relationships', score: 4.2 }
          ],
          lastCheckinDate: new Date().toISOString()
        };
      },
      suggest_micro_habits: async (domain: string) => {
        const habits = {
          sleep: ['Go to bed 15 minutes earlier', 'Avoid screens 1 hour before sleep'],
          exercise: ['Take a 10-minute walk', 'Do 5 push-ups'],
          mindfulness: ['Take 3 deep breaths', 'Notice 5 things you can see'],
          social: ['Send a message to a friend', 'Call family member'],
          nutrition: ['Drink a glass of water', 'Eat one healthy snack']
        };
        return habits[domain as keyof typeof habits] || ['Take a deep breath'];
      },
      create_action_plan: async (goal: string, horizon: 'today' | 'week') => {
        return {
          steps: ['Break down the goal', 'Set specific times', 'Track progress'],
          timebox: ['10 minutes', '30 minutes', '5 minutes']
        };
      },
      lookup_resources: async (topic: string, locale: string = 'en') => {
        return [
          {
            title: 'Resource for ' + topic,
            url: '#',
            type: 'article' as const,
            description: 'Helpful resource for ' + topic
          }
        ];
      }
    };
  }

  /**
   * Log interaction to memory
   */
  private async logInteraction(
    context: SarthiContext,
    userMessage: string,
    sarthiResponse: string,
    intent: IntentClassification
  ) {
    await this.memory.writeTurnSummary({
      userId: context.userId,
      userMessage,
      sarthiResponse,
      intent: intent.intent,
      confidence: intent.confidence,
      language: intent.language,
      stressLevel: context.currentStressLevel,
      emotionalTone: this.detectEmotionalTone(userMessage)
    });
  }

  /**
   * Detect emotional tone from user message
   */
  private detectEmotionalTone(message: string): 'positive' | 'neutral' | 'negative' | 'crisis' {
    const lowerMessage = message.toLowerCase();
    
    const positiveWords = ['happy', 'good', 'great', 'excited', 'joy', 'love', 'wonderful'];
    const negativeWords = ['sad', 'angry', 'frustrated', 'worried', 'anxious', 'depressed', 'hopeless'];
    const crisisWords = ['kill', 'suicide', 'die', 'end my life', 'hurt myself'];
    
    if (crisisWords.some(word => lowerMessage.includes(word))) {
      return 'crisis';
    }
    if (negativeWords.some(word => lowerMessage.includes(word))) {
      return 'negative';
    }
    if (positiveWords.some(word => lowerMessage.includes(word))) {
      return 'positive';
    }
    return 'neutral';
  }

  /**
   * Get fallback response in user's language
   */
  private getFallbackResponse(language: string): string {
    const fallbacks = {
      en: "I'm here to support you. Let's take this one step at a time. You're doing better than you think.",
      hi: "मैं आपकी सहायता के लिए यहां हूं। चलिए इसे एक-एक कदम करते हैं। आप सोचते हैं उससे बेहतर कर रहे हैं।",
      es: "Estoy aquí para apoyarte. Vamos a tomarlo paso a paso. Lo estás haciendo mejor de lo que crees."
    };
    
    return fallbacks[language as keyof typeof fallbacks] || fallbacks.en;
  }
}

/**
 * Factory function to create Sarthi instance
 */
export function createSarthi(config: SarthiConfig): Sarthi {
  return new Sarthi(config);
}

/**
 * Example usage and integration
 */
export async function exampleUsage() {
  // Create Sarthi instance
  const sarthi = createSarthi({
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-3.5-turbo',
    enableStreaming: true,
    enableCrisisDetection: true,
    enableMemory: true,
    enableTools: true
  });

  // Example context
  const context: SarthiContext = {
    userId: 'user123',
    userLanguage: 'en',
    currentStressLevel: 6
  };

  // Process a message
  const response = await sarthi.processMessage(
    "I'm feeling really stressed about work and can't sleep",
    context,
    [
      { role: 'user', content: 'Hello Sarthi' },
      { role: 'assistant', content: 'Hi! How are you feeling today?' }
    ]
  );

  console.log('Sarthi Response:', response);

  // Stream a response
  const stream = sarthi.streamResponse(
    "Can you help me with anxiety?",
    context
  );

  for await (const chunk of stream) {
    console.log('Streaming:', chunk.content);
    if (chunk.done) break;
  }

  // Get user context
  const userContext = await sarthi.getUserContext('user123');
  console.log('User Context:', userContext);
}
