/**
 * Agentic AI System for Sarthi Companion
 * Learns emotional patterns, adapts support style, and evolves with user
 */

import { querySimilarVectors, upsertUserVector } from '../../utils/vectorStore.js';
import { getResponseEmbedding } from '../../utils/embeddingService.js';
import { AZURE_CONFIG, validateAzureConfig, getFormattedEndpoint } from '../../config/azure.js';
import { getCheckinHistory } from '../userSurveyHistory.js';
import { buildSarthiPersonalizationContext } from '../userContextBuilder.js';

export class AgenticAI {
  constructor() {
    this.chatEngine = null; // Will be injected to avoid circular dependency
    this.emotionalMemory = new Map();
    this.userPersonas = new Map();
    this.currentPersona = 'Sarthi'; // Default persona
  }

  // Method to inject ChatEngine to avoid circular dependency
  setChatEngine(chatEngine) {
    this.chatEngine = chatEngine;
  }

  /**
   * Main entry point for agentic conversation
   * Wraps around existing ChatEngine with emotional intelligence
   */
  async generateAgenticResponse({ userMessage, userId, language = 'English', conversationHistory = [] }) {
    try {
      console.log(`🤖 Agentic AI processing for user ${userId}`);
      
      // NEW: Try enhanced personalization system first
      try {
        console.log(`🎯 Attempting enhanced Sarthi personalization...`);
        
        // Get user context and survey history
        const userContext = await this.getUserContext(userId);
        const { checkins: surveyHistory } = await getCheckinHistory(userId);
        
        // Build personalized context using new system
        const personalizationContext = await buildSarthiPersonalizationContext(
          userId,
          surveyHistory,
          userContext,
          userMessage,
          querySimilarVectors
        );
        
        console.log(`✅ Enhanced personalization context built:`, {
          domain: personalizationContext.currentStressDomain,
          level: personalizationContext.stressLevel,
          language: personalizationContext.languagePreference,
          name: personalizationContext.userFirstName
        });
        
        // Use enhanced personalized prompt
        const enhancedPrompt = this.buildEnhancedSarthiPrompt(userMessage, personalizationContext);
        
        // Call Azure GPT with enhanced prompt
        const response = await this.callAzureGPT(enhancedPrompt);
        
        // Store the enhanced interaction
        await this.storeEnhancedInteraction(userId, userMessage, response, personalizationContext);
        
        // Create enhanced feedback loop entry
        await this.createEnhancedFeedbackEntry(userId, userMessage, response, personalizationContext);
        
        // Return enhanced response
        const enhancedResponse = {
          message: response.trim(),
          language: personalizationContext.languagePreference,
          personalizationContext,
          agenticEnhanced: true,
          enhancedSarthi: true
        };
        
        console.log(`✅ Enhanced Sarthi response generated successfully`);
        return enhancedResponse;
        
      } catch (enhancedError) {
        console.error('❌ Enhanced Sarthi personalization failed, falling back to original Agentic AI:', enhancedError);
        // Continue with original Agentic AI flow
      }
      
      // ORIGINAL AGENTIC AI SYSTEM (Fallback)
      console.log(`🔄 Using original Agentic AI system`);
      
      // Step 1: Learn from current interaction
      const currentEmotionalState = await this.analyzeCurrentEmotion(userMessage, language);
      
      // Step 2: Retrieve emotional history and patterns
      const emotionalMemory = await this.getEmotionalMemory(userId, userMessage);
      
      // Step 3: Determine user's adaptive support mode
      const userPersona = await this.determineUserPersona(userId, emotionalMemory, currentEmotionalState);
      
      // Step 4: Generate contextually adapted response
      const agenticResponse = await this.generateAdaptiveResponse({
        userMessage,
        userId,
        language,
        conversationHistory,
        emotionalMemory,
        userPersona,
        currentEmotionalState
      });
      
      // Step 5: Store interaction for future learning
      await this.storeInteractionMemory(userId, userMessage, agenticResponse, currentEmotionalState);
      
      // Step 6: Create feedback loop entry
      await this.createFeedbackEntry(userId, userMessage, agenticResponse, emotionalMemory);
      
      return agenticResponse;
      
    } catch (error) {
      console.error('❌ Error in Agentic AI processing:', error);
      
      // Fallback to basic response
      console.log('🔄 Falling back to basic response...');
      return await this.generateFallbackResponse({
        userMessage,
        userId,
        language,
        conversationHistory
      });
    }
  }

  /**
   * Analyze current emotional state from user message
   */
  async analyzeCurrentEmotion(userMessage, language) {
    try {
      const emotionPrompt = `Analyze the emotional state in this message and classify the user's coping style.

Message: "${userMessage}"
Language: ${language}

Return a JSON object with:
{
  "primaryEmotion": "stressed|sad|anxious|frustrated|happy|confused|overwhelmed",
  "intensity": "low|moderate|high|very_high",
  "copingStyle": "expressive|avoidant|reflective|action_seeking",
  "emotionalNeed": "validation|guidance|comfort|clarity|space",
  "tone": "casual|urgent|withdrawn|open|defensive",
  "stressThemes": ["work", "relationships", "identity", "future", "health"]
}`;

      const response = await this.callAzureGPT(emotionPrompt);
      
      try {
        return JSON.parse(response);
      } catch (parseError) {
        // Fallback emotional state
        return {
          primaryEmotion: 'neutral',
          intensity: 'moderate',
          copingStyle: 'reflective',
          emotionalNeed: 'validation',
          tone: 'casual',
          stressThemes: []
        };
      }
    } catch (error) {
      console.error('Error analyzing current emotion:', error);
      return null;
    }
  }

  /**
   * Retrieve and analyze emotional memory from Pinecone
   */
  async getEmotionalMemory(userId, currentMessage) {
    try {
      console.log(`🧠 Retrieving emotional memory for user ${userId}`);
      
      // Generate embedding for current message
      const currentEmbedding = await getResponseEmbedding({
        question: 'Current emotional state',
        answer: currentMessage,
        domain: 'emotional_pattern',
        stressScore: 5
      });
      
      // Query similar emotional patterns
      const similarMemories = await querySimilarVectors(userId, currentEmbedding, 10);
      
      if (!similarMemories || similarMemories.length === 0) {
        console.log('📝 No emotional memory found, starting fresh');
        return {
          patterns: [],
          copingHistory: [],
          triggers: [],
          successfulStrategies: [],
          emotionalFingerprint: 'new_user'
        };
      }
      
      // Analyze memory patterns
      const patterns = this.analyzeEmotionalPatterns(similarMemories);
      const copingHistory = this.extractCopingHistory(similarMemories);
      const triggers = this.identifyTriggers(similarMemories);
      const successfulStrategies = this.findSuccessfulStrategies(similarMemories);
      
      console.log(`✅ Retrieved ${similarMemories.length} emotional memories`);
      
      return {
        patterns,
        copingHistory,
        triggers,
        successfulStrategies,
        emotionalFingerprint: this.generateEmotionalFingerprint(patterns, copingHistory),
        rawMemories: similarMemories
      };
      
    } catch (error) {
      console.error('Error retrieving emotional memory:', error);
      return { patterns: [], copingHistory: [], triggers: [], successfulStrategies: [] };
    }
  }

  /**
   * Determine user's adaptive support mode based on emotional history
   */
  async determineUserPersona(userId, emotionalMemory, currentState) {
    try {
      // Check if we have cached persona
      if (this.userPersonas.has(userId)) {
        const cached = this.userPersonas.get(userId);
        // Update with current state
        cached.lastSeen = new Date();
        cached.currentState = currentState;
        return cached;
      }
      
      // Analyze patterns to determine persona
      const persona = await this.buildUserPersona(emotionalMemory, currentState);
      
      // Cache for future use
      this.userPersonas.set(userId, {
        ...persona,
        userId,
        createdAt: new Date(),
        lastSeen: new Date(),
        currentState
      });
      
      console.log(`👤 Determined user persona: ${persona.supportMode} (${persona.communicationStyle})`);
      
      return persona;
      
    } catch (error) {
      console.error('Error determining user persona:', error);
      
      // Fallback persona
      return {
        supportMode: 'balanced',
        communicationStyle: 'casual_supportive',
        adaptiveTraits: ['empathetic', 'gentle'],
        preferredApproach: 'validation_first'
      };
    }
  }

  /**
   * Build user persona from emotional patterns
   */
  async buildUserPersona(emotionalMemory, currentState) {
    const { patterns, copingHistory, triggers } = emotionalMemory;
    
    // Determine primary coping style
    const copingStyles = copingHistory.map(h => h.style);
    const dominantCoping = this.getMostFrequent(copingStyles) || currentState?.copingStyle || 'reflective';
    
    // Determine communication preference
    const communicationNeeds = patterns.map(p => p.emotionalNeed);
    const dominantNeed = this.getMostFrequent(communicationNeeds) || 'validation';
    
    // Map to support modes
    const supportModeMap = {
      'expressive': 'deep_mirroring',
      'avoidant': 'gentle_invitation',
      'reflective': 'thoughtful_guidance',
      'action_seeking': 'clear_direction'
    };
    
    const supportMode = supportModeMap[dominantCoping] || 'balanced';
    
    // Determine supportive traits to emphasize
    const supportiveTraits = this.selectSupportiveTraits(dominantCoping, dominantNeed, triggers);
    
    return {
      supportMode,
      communicationStyle: this.determineCommunicationStyle(dominantCoping, dominantNeed),
      adaptiveTraits: supportiveTraits,
      preferredApproach: this.determineApproach(dominantNeed),
      copingStyleHistory: copingHistory,
      primaryTriggers: triggers.slice(0, 3),
      emotionalFingerprint: emotionalMemory.emotionalFingerprint
    };
  }

  /**
   * Generate adaptive response based on user persona and memory
   */
  async generateAdaptiveResponse({ userMessage, userId, language, conversationHistory, emotionalMemory, userPersona, currentEmotionalState }) {
    try {
      // Build adaptive prompt based on persona
      const adaptivePrompt = this.buildAdaptivePrompt({
        userMessage,
        language,
        emotionalMemory,
        userPersona,
        currentEmotionalState,
        conversationHistory
      });
      
      // Generate base response with adaptive context - use fallback method to avoid circular dependency
      const baseResponse = await this.generateFallbackResponse({
        userMessage: adaptivePrompt,
        userId,
        language,
        conversationHistory
      });
      
      // Apply caring persona layer
      const enhancedResponse = await this.applyCaringPersonaLayer(baseResponse, userPersona, language);
      
      // Add internal journal memory references
      const journalEnhancedResponse = await this.addJournalMemoryReferences(enhancedResponse, emotionalMemory, language);
      
      return journalEnhancedResponse;
      
    } catch (error) {
      console.error('Error generating adaptive response:', error);
      
      // Fallback to standard response
      return await this.generateFallbackResponse({
        userMessage,
        userId,
        language,
        conversationHistory
      });
    }
  }

  /**
   * Build adaptive prompt based on user persona
   */
  buildAdaptivePrompt({ userMessage, language, emotionalMemory, userPersona, currentEmotionalState, conversationHistory }) {
    const { supportMode, adaptiveTraits, primaryTriggers } = userPersona;
    const { successfulStrategies, patterns } = emotionalMemory;
    
    // Detect stress domain from emotional state
    const stressDomain = currentEmotionalState?.stressThemes?.length > 0 
      ? currentEmotionalState.stressThemes[0] 
      : 'general';
    
    // Create persona-specific guidance
    const supportModeInstructions = {
      'deep_mirroring': 'Use deeper metaphors and direct emotional mirroring. Be expressive and emotionally resonant.',
      'gentle_invitation': 'Use invitation-based language. Be gentle and non-demanding. Offer choices rather than directions.',
      'thoughtful_guidance': 'Provide thoughtful, reflective responses. Use questions that encourage self-discovery.',
      'clear_direction': 'Give firm, clear direction with caring clarity. Be decisive and action-oriented.'
    };
    
    const adaptiveContext = `Act as a mental wellness assistant for the Manova platform. Your responses should:
- Feel emotionally supportive, like a close companion
- Offer solutions tailored to the user's concerns
- Use a friendly, conversational tone
- Be context-aware: reflect on the user's past check-ins and emotional patterns
- Reply in ${language} based on the user's preference
- Use emojis occasionally to make it feel more human
- Be encouraging but non-prescriptive

Avoid any language that sounds like role-play (e.g. "I am your friend" or "You can trust me"). Instead, behave naturally like a caring assistant.

Response format:
- Use a friendly opening
- Reflect back what the user is going through
- Offer 2-3 practical, empathetic suggestions
- Close with a motivational or caring note

User data:
- Latest check-in summary: ${currentEmotionalState?.primaryEmotion} (${currentEmotionalState?.intensity}) - ${currentEmotionalState?.copingStyle} coping style
- Detected stress domain: ${stressDomain}
- User language preference: ${language}
- Support Mode: ${supportMode}
- Communication Style: ${supportModeInstructions[supportMode] || 'Balanced approach'}
- Known Triggers: ${primaryTriggers.join(', ') || 'None identified'}
- Successful Strategies: ${successfulStrategies.join(', ') || 'Building repertoire'}

Past emotional patterns:
${patterns.length > 0 ? patterns.map(p => `- ${p.theme} (${p.frequency} times)`).join('\n') : '- No established patterns yet'}

User Message: "${userMessage}"`;

    return adaptiveContext;
  }

  /**
   * Apply caring persona layer to response
   */
  async applyCaringPersonaLayer(baseResponse, userPersona, language) {
    try {
      const { adaptiveTraits, supportMode } = userPersona;
      
      const krishnaPrompt = `Act as a mental wellness assistant for the Manova platform. Your responses should:
- Feel emotionally supportive, like a close companion
- Offer solutions tailored to the user's concerns
- Use a friendly, conversational tone
- Be context-aware and reflect on the user's emotional patterns
- Reply in ${language} based on the user's preference
- Use emojis occasionally to make it feel more human
- Be encouraging but non-prescriptive

Avoid any language that sounds like role-play (e.g. "I am your friend" or "You can trust me"). Instead, behave naturally like a caring assistant.

Response format:
- Use a friendly opening
- Reflect back what the user is going through
- Offer 2-3 practical, empathetic suggestions
- Close with a motivational or caring note

Original response to enhance: "${baseResponse.message}"
Support Mode: ${supportMode}
Traits to Emphasize: ${adaptiveTraits.join(', ')}

Enhanced response:`;

      const enhancedMessage = await this.callAzureGPT(krishnaPrompt);
      
      return {
        ...baseResponse,
        message: enhancedMessage.trim(),
        agenticEnhanced: true,
        persona: userPersona.supportMode,
        supportiveTraits: adaptiveTraits
      };
      
    } catch (error) {
      console.error('Error applying caring persona layer:', error);
      
      // If it's a content filter error, return a simplified response
      if (error.message && (error.message.includes('content_filter') || error.message.includes('CONTENT_FILTER'))) {
        console.warn('⚠️ Content filter triggered in caring persona, using original response');
        return {
          ...baseResponse,
          message: baseResponse.message,
          agenticEnhanced: false,
          contentFiltered: true
        };
      }
      
      return baseResponse;
    }
  }

  /**
   * Add journal memory references to response
   */
  async addJournalMemoryReferences(response, emotionalMemory, language) {
    try {
      const { rawMemories } = emotionalMemory;
      
      if (!rawMemories || rawMemories.length === 0) {
        return response;
      }
      
      // Find relevant memories to reference
      const relevantMemories = rawMemories
        .filter(m => m.metadata?.response && m.score > 0.8)
        .slice(0, 2);
      
      if (relevantMemories.length === 0) {
        return response;
      }
      
      // Create memory references
      const memoryReferences = relevantMemories.map(memory => {
        const response_text = memory.metadata.response;
        const domain = memory.metadata.domain;
        const timestamp = memory.metadata.timestamp;
        
        // Create natural reference based on language
        if (language === 'Hinglish') {
          return `Pichhli baar bhi jab ${domain} mein similar feel hua tha, tab tumne "${response_text.substring(0, 50)}..." kaha tha.`;
        } else if (language === 'Hindi') {
          return `पिछली बार भी जब ${domain} में ऐसा लगा था, तब आपने कहा था कि "${response_text.substring(0, 50)}..."`;
        } else {
          return `I remember last time when you felt similar about ${domain}, you mentioned "${response_text.substring(0, 50)}..."`;
        }
      });
      
      // Add memory reference to response if appropriate
      if (memoryReferences.length > 0 && response.message.length < 200) {
        const memoryRef = memoryReferences[0];
        const enhancedMessage = `${response.message}\n\n${memoryRef}`;
        
        return {
          ...response,
          message: enhancedMessage,
          memoryReferences: relevantMemories.length
        };
      }
      
      return response;
      
    } catch (error) {
      console.error('Error adding journal memory references:', error);
      return response;
    }
  }

  /**
   * Store interaction for future learning
   */
  async storeInteractionMemory(userId, userMessage, response, emotionalState) {
    try {
      console.log(`💾 Storing interaction memory for user ${userId}`);
      
      // Create comprehensive interaction record
      const interactionData = {
        question: 'Agentic AI Interaction',
        answer: `User: ${userMessage} | Response: ${response.message}`,
        domain: 'agentic_interaction',
        stressScore: this.mapEmotionToStress(emotionalState?.primaryEmotion, emotionalState?.intensity)
      };
      
      // Generate embedding
      const embedding = await getResponseEmbedding(interactionData);
      
      // Prepare metadata
      const metadata = {
        timestamp: new Date().toISOString(),
        domain: 'agentic_interaction',
        userMessage: userMessage,
        responseMessage: response.message,
        primaryEmotion: emotionalState?.primaryEmotion || 'neutral',
        intensity: emotionalState?.intensity || 'moderate',
        copingStyle: emotionalState?.copingStyle || 'reflective',
        supportMode: response.persona || 'balanced',
        supportiveTraits: response.supportiveTraits?.join(',') || '',
        interactionType: 'agentic_ai',
        agenticVersion: '1.0'
      };
      
      // Store in Pinecone
      const vectorResult = await upsertUserVector(userId, embedding, metadata);
      
      if (vectorResult.success) {
        console.log(`✅ Agentic interaction stored: ${vectorResult.vectorId}`);
      } else {
        console.warn(`⚠️ Failed to store agentic interaction: ${vectorResult.error}`);
      }
      
    } catch (error) {
      console.error('❌ Error storing interaction memory:', error);
    }
  }

  /**
   * Create feedback loop entry for continuous learning
   */
  async createFeedbackEntry(userId, userMessage, response, emotionalMemory) {
    try {
      // Analyze response quality based on emotional appropriateness
      const feedbackData = {
        userId,
        timestamp: new Date().toISOString(),
        userMessage,
        responseMessage: response.message,
        emotionalMemoryUsed: emotionalMemory.patterns.length > 0,
        personalizedLevel: this.calculatePersonalizationLevel(response, emotionalMemory),
        adaptiveTraits: response.supportiveTraits || [],
        supportMode: response.persona || 'balanced'
      };
      
      // Store feedback entry with special flag
      const feedbackMetadata = {
        timestamp: new Date().toISOString(),
        domain: 'feedback_loop',
        interactionType: 'agentic_feedback',
        support_feedback: true,
        personalizationLevel: feedbackData.personalizedLevel,
        memoryUsage: emotionalMemory.patterns.length,
        responseQuality: 'pending_user_feedback'
      };
      
      // Create feedback embedding
      const feedbackEmbedding = await getResponseEmbedding({
        question: 'Agentic AI Feedback',
        answer: `Interaction quality assessment: ${JSON.stringify(feedbackData)}`,
        domain: 'feedback_loop',
        stressScore: 0
      });
      
      // Store feedback vector
      await upsertUserVector(userId, feedbackEmbedding, feedbackMetadata);
      
      console.log(`📊 Feedback loop entry created for user ${userId}`);
      
    } catch (error) {
      console.error('❌ Error creating feedback entry:', error);
    }
  }

  // Helper methods for pattern analysis
  analyzeEmotionalPatterns(memories) {
    const patterns = new Map();
    
    memories.forEach(memory => {
      const emotion = memory.metadata?.primaryEmotion || memory.metadata?.emotion;
      const domain = memory.metadata?.domain;
      
      if (emotion && domain) {
        const key = `${emotion}_${domain}`;
        patterns.set(key, (patterns.get(key) || 0) + 1);
      }
    });
    
    return Array.from(patterns.entries())
      .map(([key, frequency]) => {
        const [emotion, domain] = key.split('_');
        return { theme: `${emotion} in ${domain}`, frequency, emotion, domain };
      })
      .sort((a, b) => b.frequency - a.frequency);
  }

  extractCopingHistory(memories) {
    return memories
      .filter(m => m.metadata?.copingStyle)
      .map(m => ({
        style: m.metadata.copingStyle,
        timestamp: m.metadata.timestamp,
        effectiveness: m.score || 0.5
      }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  identifyTriggers(memories) {
    const triggers = new Map();
    
    memories.forEach(memory => {
      const stressThemes = memory.metadata?.stressThemes || [];
      stressThemes.forEach(theme => {
        triggers.set(theme, (triggers.get(theme) || 0) + 1);
      });
    });
    
    return Array.from(triggers.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([trigger]) => trigger);
  }

  findSuccessfulStrategies(memories) {
    return memories
      .filter(m => m.metadata?.responseQuality === 'helpful' || m.score > 0.85)
      .map(m => m.metadata?.response || 'effective_interaction')
      .slice(0, 3);
  }

  generateEmotionalFingerprint(patterns, copingHistory) {
    if (patterns.length === 0) return 'new_user';
    
    const dominantPattern = patterns[0];
    const dominantCoping = this.getMostFrequent(copingHistory.map(h => h.style));
    
    return `${dominantPattern.emotion}_${dominantCoping}_${patterns.length > 3 ? 'complex' : 'simple'}`;
  }

  getMostFrequent(arr) {
    if (!arr || arr.length === 0) return null;
    
    const frequency = new Map();
    arr.forEach(item => frequency.set(item, (frequency.get(item) || 0) + 1));
    
    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0];
  }

  selectSupportiveTraits(copingStyle, emotionalNeed, triggers) {
    const traitMap = {
      'expressive': ['care', 'clarity'],
      'avoidant': ['calm', 'patience'],
      'reflective': ['wisdom', 'gentle_guidance'],
      'action_seeking': ['clarity', 'decisive_action']
    };
    
    const needMap = {
      'validation': ['care', 'empathy'],
      'guidance': ['clarity', 'wisdom'],
      'comfort': ['calm', 'reassurance'],
      'clarity': ['clarity', 'decisive_action'],
      'space': ['patience', 'gentle_presence']
    };
    
    const baseTraits = traitMap[copingStyle] || ['care', 'calm'];
    const needTraits = needMap[emotionalNeed] || ['empathy'];
    
    return [...new Set([...baseTraits, ...needTraits])];
  }

  determineCommunicationStyle(copingStyle, emotionalNeed) {
    if (copingStyle === 'expressive' && emotionalNeed === 'validation') {
      return 'emotionally_resonant';
    } else if (copingStyle === 'avoidant') {
      return 'gentle_supportive';
    } else if (copingStyle === 'action_seeking') {
      return 'direct_guidance';
    } else {
      return 'casual_supportive';
    }
  }

  determineApproach(emotionalNeed) {
    const approachMap = {
      'validation': 'validation_first',
      'guidance': 'solution_oriented',
      'comfort': 'comfort_focused',
      'clarity': 'clarity_focused',
      'space': 'gentle_presence'
    };
    
    return approachMap[emotionalNeed] || 'validation_first';
  }

  mapEmotionToStress(emotion, intensity) {
    const emotionMap = {
      'stressed': { low: 3, moderate: 6, high: 8, very_high: 10 },
      'anxious': { low: 4, moderate: 6, high: 8, very_high: 9 },
      'frustrated': { low: 3, moderate: 5, high: 7, very_high: 9 },
      'sad': { low: 2, moderate: 4, high: 6, very_high: 8 },
      'overwhelmed': { low: 5, moderate: 7, high: 9, very_high: 10 },
      'confused': { low: 2, moderate: 4, high: 6, very_high: 7 },
      'happy': { low: 0, moderate: 0, high: 0, very_high: 0 }
    };
    
    return emotionMap[emotion]?.[intensity] || 5;
  }

  calculatePersonalizationLevel(response, emotionalMemory) {
    let level = 0;
    
    if (response.agenticEnhanced) level += 2;
    if (response.supportiveTraits?.length > 0) level += 2;
    if (response.memoryReferences > 0) level += 3;
    if (emotionalMemory.patterns.length > 0) level += 2;
    if (response.persona !== 'balanced') level += 1;
    
    return Math.min(level, 10);
  }

  /**
   * Azure GPT API call method (self-contained to avoid circular dependency)
   */
  async callAzureGPT(prompt) {
    try {
      // Validate Azure config first
      if (!validateAzureConfig()) {
        throw new Error('Azure configuration is invalid or missing');
      }

      const endpoint = getFormattedEndpoint(AZURE_CONFIG.OPENAI_ENDPOINT);
      const deploymentName = AZURE_CONFIG.OPENAI_DEPLOYMENT_NAME;
      const apiVersion = AZURE_CONFIG.OPENAI_API_VERSION;
      const apiKey = AZURE_CONFIG.OPENAI_KEY;

      if (!endpoint || !deploymentName || !apiVersion || !apiKey) {
        throw new Error('Missing required Azure configuration values');
      }

      const url = `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;
      
      console.log(`🔄 Calling Azure API: ${url}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
          top_p: 0.95,
          frequency_penalty: 0,
          presence_penalty: 0
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          // If not JSON, use the text directly
          throw new Error(`Azure API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        // Check if it's a content filter error
        if (errorData.error?.code === 'content_filter' || 
            errorData.error?.innererror?.code === 'ResponsibleAIPolicyViolation') {
          console.warn('🛡️ Content filter triggered, will use static fallback');
          throw new Error(`CONTENT_FILTER: ${errorData.error?.message || 'Content filtered'}`);
        }
        
        throw new Error(`Azure API error: ${response.status} - ${errorData.error?.message || errorText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error calling Azure GPT:', error);
      throw error;
    }
  }

  /**
   * Generate fallback response without circular dependency
   */
  async generateFallbackResponse({ userMessage, userId, language, conversationHistory }) {
    try {
      // Check if Azure config is available
      if (!validateAzureConfig()) {
        console.warn('Azure config not available, using static fallback');
        throw new Error('Azure configuration not available');
      }

      const fallbackPrompt = `Act as a mental wellness assistant for the Manova platform. Your responses should:
- Feel emotionally supportive, like a close companion
- Offer solutions tailored to the user's concerns
- Use a friendly, conversational tone
- Be context-aware: reflect on the user's emotional state
- Reply in ${language} based on the user's preference
- Use emojis occasionally to make it feel more human
- Be encouraging but non-prescriptive

Avoid any language that sounds like role-play (e.g. "I am your friend" or "You can trust me"). Instead, behave naturally like a caring assistant.

Response format:
- Use a friendly opening
- Reflect back what the user is going through
- Offer 2-3 practical, empathetic suggestions
- Close with a motivational or caring note

User Message: "${userMessage}"
Language: ${language}

Response:`;

      const response = await this.callAzureGPT(fallbackPrompt);
      
      return {
        message: response.trim(),
        emotion: 'supportive',
        language: language,
        fallbackResponse: true
      };
    } catch (error) {
      console.error('Error generating fallback response, using static response:', error);
      
      // If content filter triggered, use safer static responses
      if (error.message && error.message.includes('CONTENT_FILTER')) {
        console.warn('🛡️ Content filter in fallback, using safe static response');
        return {
          message: language === 'Hindi' ? 'मैं आपकी मदद करने के लिए यहां हूं। कैसा लग रहा है?' : 
                   language === 'Hinglish' ? 'Main yahan hun आपके लिए। How are you feeling?' :
                   'I\'m here to support you. How are you feeling?',
          emotion: 'supportive',
          language: language,
          staticFallback: true
        };
      }
      
      // Ultra-fallback with more contextual responses
      const getContextualResponse = (userMsg, lang) => {
        const lowerMsg = userMsg.toLowerCase();
        
        if (lowerMsg.includes('stress') || lowerMsg.includes('tension') || lowerMsg.includes('परेशान')) {
          return {
            'Hindi': 'लगता है stress हो रहा है। यह normal है। कुछ बातें मन में चल रही हैं क्या? मैं हूं ना यहां।',
            'Hinglish': 'Lag raha hai stress feel हो रहा है। It\'s okay, samajh sakta hun। Batao क्या scene है।',
            'English': 'Sounds like you\'re feeling stressed. That\'s completely normal. Tell me what\'s going on.'
          };
        } else if (lowerMsg.includes('sad') || lowerMsg.includes('upset') || lowerMsg.includes('दुखी')) {
          return {
            'Hindi': 'समझ रहा हूं कि upset feel हो रहा है। आपकी feelings matter करती हैं। मैं हूं ना सुनने के लिए।',
            'Hinglish': 'Samajh aa raha hai कि तुम sad feel कर रहे हो। Your feelings valid हैं। Batao क्या हुआ है?',
            'English': 'I can see you\'re feeling down. Your feelings are completely valid. I\'m here to listen.'
          };
        } else {
          return {
            'Hindi': 'Main Sarthi हूं, तुम्हारा साथी। कुछ बातें मन में चल रही हैं क्या? यहां हूं सुनने के लिए।',
            'Hinglish': 'Main Sarthi हूं, tumhara friend। आज कैसा feel कर रहे हो? Share करो जो भी मन में है।',
            'English': 'I\'m Sarthi, your companion. I\'m here to listen and support you. How are you feeling today?'
          };
        }
      };
      
      const contextualResponses = getContextualResponse(userMessage, language);
      
      return {
        message: contextualResponses[language] || contextualResponses['English'],
        emotion: 'supportive',
        language: language,
        fallbackResponse: true,
        technicalIssue: true
      };
    }
  }

  /**
   * Reset session memory for a user (clear emotional memory cache)
   * @param {string} userId - User ID to reset memory for
   */
  resetSessionMemory(userId) {
    try {
      console.log(`🧹 Resetting session memory for user ${userId}`);
      
      // Clear emotional memory cache
      this.emotionalMemory.delete(userId);
      
      // Clear user persona cache
      this.userPersonas.delete(userId);
      
      console.log(`✅ Session memory reset for user ${userId}`);
    } catch (error) {
      console.error('❌ Error resetting session memory:', error);
    }
  }

  /**
   * Builds enhanced Sarthi prompt with deep personalization
   * @param {string} userMessage - Current user message
   * @param {Object} personalizationContext - Enhanced context data
   * @returns {string} Personalized system prompt
   */
  buildEnhancedSarthiPrompt(userMessage, personalizationContext) {
    const {
      currentStressDomain,
      stressLevel,
      pastCheckinSummary,
      languagePreference,
      userFirstName
    } = personalizationContext;

    const nameAddress = userFirstName ? userFirstName : 'friend';
    
    return `You are Sarthi, the user's trusted emotional wellness companion. Speak like a caring friend.

- The user is currently feeling stress in the ${currentStressDomain} domain.
- Their recent check-ins show a pattern of: ${pastCheckinSummary}.
- Their emotional tone is: ${stressLevel}.
- Speak in ${languagePreference} language with emotionally empathetic tone.
- Refer to user as "${nameAddress}" if addressing them directly.
- Include warm emojis occasionally. Show you truly care.
- Offer practical, personalized advice – not generic tips.

Current Context:
- Stress Domain: ${currentStressDomain}
- Stress Level: ${stressLevel} 
- Language: ${languagePreference}
- Past Pattern: ${pastCheckinSummary}

Response Guidelines:
- Use a friendly opening that acknowledges their current state
- Reflect back what they're going through in the ${currentStressDomain} domain
- Offer 2-3 practical, empathetic suggestions specific to ${stressLevel} stress level
- Close with a motivational or caring note
- Speak naturally in ${languagePreference} with appropriate cultural context

Now respond to: "${userMessage}"`;
  }

  /**
   * Stores enhanced interaction with personalization context
   * @param {string} userId - User ID
   * @param {string} userMessage - User's message
   * @param {string} response - AI's response
   * @param {Object} personalizationContext - Enhanced context data
   */
  async storeEnhancedInteraction(userId, userMessage, response, personalizationContext) {
    try {
      console.log(`💾 Storing enhanced interaction for user ${userId}`);
      
      // Get embedding for the interaction
      const embedding = await getResponseEmbedding(`${userMessage} ${response}`);
      
      if (embedding) {
        const metadata = {
          timestamp: new Date().toISOString(),
          domain: personalizationContext.currentStressDomain,
          userMessage: userMessage,
          responseMessage: response,
          stressLevel: personalizationContext.stressLevel,
          languagePreference: personalizationContext.languagePreference,
          userFirstName: personalizationContext.userFirstName,
          pastCheckinSummary: personalizationContext.pastCheckinSummary,
          interactionType: 'enhanced_sarthi',
          enhancedVersion: '1.0'
        };

        // Store in vector database
        await upsertUserVector(userId, embedding, metadata);
        
        console.log(`✅ Enhanced interaction stored successfully`);
      }
    } catch (error) {
      console.error('❌ Error storing enhanced interaction:', error);
      // Don't throw error to avoid breaking the flow
    }
  }

  /**
   * Gets user context for enhanced personalization
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User context object
   */
  async getUserContext(userId) {
    try {
      if (!userId) return {};
      
      // Try to get context from ContextStore if available
      if (this.chatEngine?.getUserContext) {
        return await this.chatEngine.getUserContext(userId);
      }
      
      // Fallback: return empty context
      return {};
    } catch (error) {
      console.error('Error getting user context in AgenticAI:', error);
      return {};
    }
  }

  /**
   * Creates enhanced feedback loop entry with deep personalization context
   * @param {string} userId - User ID
   * @param {string} userMessage - User's message
   * @param {string} response - AI's response
   * @param {Object} personalizationContext - Enhanced context data
   */
  async createEnhancedFeedbackEntry(userId, userMessage, response, personalizationContext) {
    try {
      console.log(`📝 Creating enhanced feedback entry for user ${userId}`);
      
      // Calculate sentiment score
      const sentimentScore = this.calculateSentimentScore(userMessage, response);
      
      // Get embedding for the feedback entry
      const embedding = await getResponseEmbedding(`${userMessage} ${response}`);
      
      if (embedding) {
        const feedbackMetadata = {
          timestamp: new Date().toISOString(),
          domain: personalizationContext.currentStressDomain,
          emotion: personalizationContext.stressLevel,
          messageSummary: userMessage.substring(0, 100), // First 100 chars
          llmResponse: response.substring(0, 200), // First 200 chars
          sentimentScore: sentimentScore,
          languagePreference: personalizationContext.languagePreference,
          userFirstName: personalizationContext.userFirstName,
          pastCheckinSummary: personalizationContext.pastCheckinSummary,
          feedbackType: 'enhanced_sarthi_feedback',
          interactionQuality: this.assessInteractionQuality(userMessage, response),
          personalizationLevel: this.calculatePersonalizationLevel(personalizationContext),
          memoryUsage: personalizationContext.rawData?.surveyHistory?.length || 0,
          responseQuality: 'pending_user_feedback' // To be updated when user provides feedback
        };

        // Store feedback entry in vector database
        await upsertUserVector(userId, embedding, feedbackMetadata);
        
        console.log(`✅ Enhanced feedback entry created successfully`);
      }
    } catch (error) {
      console.error('❌ Error creating enhanced feedback entry:', error);
      // Don't throw error to avoid breaking the flow
    }
  }

  /**
   * Calculates sentiment score from user message and AI response
   * @param {string} userMessage - User's message
   * @param {string} response - AI's response
   * @returns {number} Sentiment score between 0-10
   */
  calculateSentimentScore(userMessage, response) {
    try {
      // Simple sentiment analysis based on keywords
      const userWords = userMessage.toLowerCase();
      const responseWords = response.toLowerCase();
      
      // Negative indicators
      const negativeWords = ['sad', 'depressed', 'anxious', 'stressed', 'worried', 'upset', 'frustrated', 'angry', 'tired', 'overwhelmed'];
      const positiveWords = ['happy', 'good', 'better', 'great', 'excellent', 'calm', 'peaceful', 'confident', 'hopeful', 'grateful'];
      
      let score = 5; // Neutral starting point
      
      // Check user message sentiment
      negativeWords.forEach(word => {
        if (userWords.includes(word)) score -= 1;
      });
      
      positiveWords.forEach(word => {
        if (userWords.includes(word)) score += 1;
      });
      
      // Check response sentiment (AI should be supportive)
      if (responseWords.includes('understand') || responseWords.includes('support') || responseWords.includes('help')) {
        score += 0.5;
      }
      
      // Clamp between 0-10
      return Math.max(0, Math.min(10, score));
    } catch (error) {
      console.error('Error calculating sentiment score:', error);
      return 5; // Default neutral score
    }
  }

  /**
   * Assesses the quality of the interaction
   * @param {string} userMessage - User's message
   * @param {string} response - AI's response
   * @returns {string} Quality assessment
   */
  assessInteractionQuality(userMessage, response) {
    try {
      const responseLength = response.length;
      const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(response);
      const hasPersonalization = response.toLowerCase().includes('you') || response.toLowerCase().includes('your');
      
      if (responseLength > 100 && hasEmojis && hasPersonalization) {
        return 'high';
      } else if (responseLength > 50 && (hasEmojis || hasPersonalization)) {
        return 'medium';
      } else {
        return 'low';
      }
    } catch (error) {
      console.error('Error assessing interaction quality:', error);
      return 'medium';
    }
  }

  /**
   * Calculates personalization level based on context richness
   * @param {Object} personalizationContext - Enhanced context data
   * @returns {number} Personalization level 1-10
   */
  calculatePersonalizationLevel(personalizationContext) {
    try {
      let level = 1;
      
      if (personalizationContext.userFirstName) level += 2;
      if (personalizationContext.currentStressDomain !== 'General') level += 2;
      if (personalizationContext.stressLevel !== 'Low') level += 1;
      if (personalizationContext.pastCheckinSummary !== 'This seems like a new experience for you') level += 2;
      if (personalizationContext.languagePreference !== 'English') level += 1;
      if (personalizationContext.rawData?.surveyHistory?.length > 0) level += 1;
      
      return Math.min(10, level);
    } catch (error) {
      console.error('Error calculating personalization level:', error);
      return 5;
    }
  }

  /**
   * Reset persona state to default "Sarthi" friendly guide
   * @param {string} userId - User ID to reset persona for
   */
  resetPersonaState(userId) {
    try {
      console.log(`🔄 Resetting persona state to default for user ${userId}`);
      
      // Reset current persona to default
      this.currentPersona = 'Sarthi';
      
      // Clear any stored persona for this user
      this.userPersonas.delete(userId);
      
      console.log(`✅ Persona reset to "Sarthi" for user ${userId}`);
    } catch (error) {
      console.error('❌ Error resetting persona state:', error);
    }
  }

  /**
   * Complete session reset - clears memory and resets persona
   * @param {string} userId - User ID to reset
   */
  resetSession(userId) {
    try {
      console.log(`🔄 Performing complete session reset for user ${userId}`);
      
      this.resetSessionMemory(userId);
      this.resetPersonaState(userId);
      
      console.log(`✅ Complete session reset completed for user ${userId}`);
    } catch (error) {
      console.error('❌ Error during complete session reset:', error);
    }
  }
}

export default AgenticAI;