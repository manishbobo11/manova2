import { IntentClassification } from './intentRouter';
import { ToolResult } from './orchestrator';

interface AIModelConfig {
  temperature: number;
  top_p: number;
  max_tokens: number;
  timeout: number;
}

interface PromptTemplate {
  id: string;
  template: string;
  config: AIModelConfig;
  cacheKey?: string;
}

interface StreamingResponse {
  content: string;
  done: boolean;
  error?: string;
}

interface CachedResponse {
  response: string;
  timestamp: number;
  ttl: number;
}

// Model configurations for different components
const MODEL_CONFIGS = {
  router: {
    temperature: 0.2,
    top_p: 0.9,
    max_tokens: 200,
    timeout: 12000
  },
  planner: {
    temperature: 0.4,
    top_p: 0.9,
    max_tokens: 300,
    timeout: 12000
  },
  composer: {
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 350,
    timeout: 12000
  },
  critic: {
    temperature: 0.3,
    top_p: 0.9,
    max_tokens: 200,
    timeout: 12000
  }
} as const;

// In-memory cache for prompt templates and responses
const promptCache = new Map<string, string>();
const responseCache = new Map<string, CachedResponse>();

// Cache TTL settings (in milliseconds)
const CACHE_TTL = {
  promptTemplates: 24 * 60 * 60 * 1000, // 24 hours
  responses: 5 * 60 * 1000, // 5 minutes
  intentClassification: 2 * 60 * 1000 // 2 minutes
};

/**
 * Main AI client class
 */
export class AIClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(config: {
    apiKey: string;
    baseUrl?: string;
    model?: string;
  }) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    this.model = config.model || 'gpt-3.5-turbo';
  }

  /**
   * Fast-path optimization for quick_tip intent without tools
   */
  async fastPathCompose(
    userMessage: string,
    userLanguage: string,
    intent: IntentClassification
  ): Promise<string> {
    if (intent.intent !== 'quick_tip' || intent.confidence < 0.7) {
      throw new Error('Fast path not applicable');
    }

    const prompt = await this.getCachedPrompt('quick_tip_fast', {
      userMessage,
      language: userLanguage
    });

    try {
      const response = await this.callModel(prompt, 'composer', {
        enableStreaming: false,
        useCache: true
      });
      return response;
    } catch (error) {
      console.warn('Fast path failed, falling back to full flow:', error);
      throw error;
    }
  }

  /**
   * Intent classification with optimized settings
   */
  async classifyIntent(
    message: string,
    history: Array<{role: string, content: string}>
  ): Promise<IntentClassification> {
    const cacheKey = `intent:${this.hashMessage(message + JSON.stringify(history.slice(-3)))}`;
    
    // Check cache first
    const cached = this.getCachedResponse(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached.response);
      } catch {
        // Invalid cached response, continue with API call
      }
    }

    const prompt = await this.getCachedPrompt('intent_classification', {
      message,
      history: history.slice(-3)
    });

    const response = await this.callModel(prompt, 'router', {
      enableStreaming: false,
      useCache: true
    });

    try {
      const result = JSON.parse(response);
      this.cacheResponse(cacheKey, response, CACHE_TTL.intentClassification);
      return result;
    } catch (error) {
      console.error('Failed to parse intent classification:', error);
      return {
        intent: 'therapy_support',
        confidence: 0.5,
        language: 'en'
      };
    }
  }

  /**
   * Plan creation with streaming support
   */
  async createPlan(
    context: {
      intent: IntentClassification;
      userMessage: string;
      chatHistory: Array<{role: string, content: string}>;
      userContext: any;
    }
  ): Promise<any> {
    const prompt = await this.getCachedPrompt('plan_creation', context);

    return await this.callModel(prompt, 'planner', {
      enableStreaming: false,
      useCache: false // Plans are context-specific, don't cache
    });
  }

  /**
   * Response composition with streaming
   */
  async composeReply(
    context: {
      intent: IntentClassification;
      toolResult?: ToolResult;
      userMessage: string;
      userLanguage: string;
      chatHistory: Array<{role: string, content: string}>;
    },
    enableStreaming: boolean = true
  ): Promise<string | AsyncGenerator<StreamingResponse>> {
    const prompt = await this.getCachedPrompt('response_composition', context);

    if (enableStreaming) {
      return this.callModelStreaming(prompt, 'composer');
    } else {
      return await this.callModel(prompt, 'composer', {
        enableStreaming: false,
        useCache: true
      });
    }
  }

  /**
   * Response validation and revision
   */
  async validateAndRevise(
    response: string,
    context: {
      intent: string;
      userLanguage: string;
      originalMessage: string;
    }
  ): Promise<string> {
    const prompt = await this.getCachedPrompt('response_validation', {
      response,
      ...context
    });

    return await this.callModel(prompt, 'critic', {
      enableStreaming: false,
      useCache: false
    });
  }

  /**
   * Core model calling function with timeout and error handling
   */
  private async callModel(
    prompt: string,
    component: keyof typeof MODEL_CONFIGS,
    options: {
      enableStreaming: boolean;
      useCache: boolean;
    } = { enableStreaming: false, useCache: true }
  ): Promise<string> {
    const config = MODEL_CONFIGS[component];
    const cacheKey = options.useCache ? this.hashMessage(prompt) : null;

    // Check cache if enabled
    if (cacheKey) {
      const cached = this.getCachedResponse(cacheKey);
      if (cached) {
        return cached.response;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: config.temperature,
          top_p: config.top_p,
          max_tokens: config.max_tokens,
          stream: options.enableStreaming
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      if (options.enableStreaming) {
        throw new Error('Streaming should use callModelStreaming method');
      }

      const data = await response.json();
      const result = data.choices[0]?.message?.content || '';

      // Cache successful response
      if (cacheKey) {
        this.cacheResponse(cacheKey, result, CACHE_TTL.responses);
      }

      return result;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn(`Model call timed out for ${component}`);
        return this.getFallbackResponse(component);
      }

      console.error(`Model call failed for ${component}:`, error);
      return this.getFallbackResponse(component);
    }
  }

  /**
   * Streaming model call
   */
  private async *callModelStreaming(
    prompt: string,
    component: keyof typeof MODEL_CONFIGS
  ): AsyncGenerator<StreamingResponse> {
    const config = MODEL_CONFIGS[component];
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: config.temperature,
          top_p: config.top_p,
          max_tokens: config.max_tokens,
          stream: true
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              yield { content: '', done: true };
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                yield { content, done: false };
              }
            } catch (error) {
              console.warn('Failed to parse streaming response:', error);
            }
          }
        }
      }

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn(`Streaming model call timed out for ${component}`);
        yield { content: this.getFallbackResponse(component), done: true, error: 'timeout' };
        return;
      }

      console.error(`Streaming model call failed for ${component}:`, error);
      yield { content: this.getFallbackResponse(component), done: true, error: 'api_error' };
    }
  }

  /**
   * Get cached prompt template
   */
  private async getCachedPrompt(
    templateId: string,
    variables: Record<string, any>
  ): Promise<string> {
    const cacheKey = `prompt:${templateId}`;
    let template = promptCache.get(cacheKey);

    if (!template) {
      template = await this.loadPromptTemplate(templateId);
      promptCache.set(cacheKey, template);
      
      // Set cache expiry
      setTimeout(() => {
        promptCache.delete(cacheKey);
      }, CACHE_TTL.promptTemplates);
    }

    return this.interpolateTemplate(template, variables);
  }

  /**
   * Load prompt template (placeholder - implement based on your template system)
   */
  private async loadPromptTemplate(templateId: string): Promise<string> {
    // TODO: Implement template loading from your system
    const templates: Record<string, string> = {
      intent_classification: `Analyze this user message and classify the intent. Return JSON only.

Message: "{{message}}"
Recent context: {{history}}

Classify into one of these intents:
- therapy_support: Emotional support, mental health concerns, relationship issues
- quick_tip: Practical advice, daily tips, simple solutions
- plan_builder: Goal setting, habit formation, long-term planning
- crisis: Urgent mental health crisis, self-harm, severe distress
- small_talk: Casual conversation, greetings, general chat

Return JSON: {"intent": "intent_name", "confidence": 0.0-1.0, "language": "detected_language"}`,

      quick_tip_fast: `You are Sarthi. Provide a quick, practical tip for: "{{userMessage}}"

Respond in {{language}} with:
- 1 sentence validation
- 2-3 actionable bullet points
- Keep under 100 words`,

      response_composition: `You are Sarthi. Generate a warm, solution-oriented response.

Intent: {{intent.intent}}
Language: {{userLanguage}}
{{#if toolResult}}Tool Result: {{JSON.stringify toolResult.data}}{{/if}}

User Message: "{{userMessage}}"

Respond in {{userLanguage}} with:
- 1-2 sentences validation
- 2-5 actionable bullet points
- Optional motivational nudge
- Keep under 180 words`,

      response_validation: `Validate this response: "{{response}}"

User message: "{{originalMessage}}"
Intent: {{intent}}
Language: {{userLanguage}}

Check for:
- Empathy and validation
- Concrete, actionable steps
- Language consistency
- No medical/clinical claims

If issues found, provide a concise revision.`
    };

    return templates[templateId] || 'Default prompt template';
  }

  /**
   * Interpolate template variables
   */
  private interpolateTemplate(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const value = key.split('.').reduce((obj: any, k: string) => obj?.[k], variables);
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Cache management
   */
  private getCachedResponse(key: string): CachedResponse | null {
    const cached = responseCache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached;
    }
    responseCache.delete(key);
    return null;
  }

  private cacheResponse(key: string, response: string, ttl: number): void {
    responseCache.set(key, {
      response,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Simple hash function for cache keys
   */
  private hashMessage(message: string): string {
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Fallback responses for error cases
   */
  private getFallbackResponse(component: keyof typeof MODEL_CONFIGS): string {
    const fallbacks = {
      router: JSON.stringify({
        intent: 'therapy_support',
        confidence: 0.5,
        language: 'en'
      }),
      planner: JSON.stringify({
        toolNeeded: false,
        strategy: 'general_support'
      }),
      composer: "I'm here to support you. Let's take this one step at a time. You're doing better than you think.",
      critic: "Response looks good to me."
    };

    return fallbacks[component] || fallbacks.composer;
  }
}

/**
 * Factory function to create AI client
 */
export function createAIClient(config: {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}): AIClient {
  return new AIClient(config);
}
