/**
 * User Persona Builder for Agentic AI
 * Classifies users into adaptive support modes based on emotional patterns
 */

import { querySimilarVectors } from '../../utils/vectorStore';

export class UserPersonaBuilder {
  constructor() {
    this.personaCache = new Map();
    this.supportModes = {
      EXPRESSIVE_SEEKER: 'expressive-seeker',
      GENTLE_AVOIDER: 'gentle-avoider', 
      REFLECTIVE_PROCESSOR: 'reflective-processor',
      ACTION_ORIENTED: 'action-oriented',
      BALANCED_EXPLORER: 'balanced-explorer'
    };
  }

  /**
   * Build comprehensive user persona from emotional history
   */
  async buildUserPersona(userId, emotionalHistory, currentState) {
    try {
      console.log(`👤 Building persona for user ${userId}`);
      
      // Check cache first
      if (this.personaCache.has(userId)) {
        const cached = this.personaCache.get(userId);
        if (this.isCacheValid(cached)) {
          return this.updatePersonaWithCurrentState(cached, currentState);
        }
      }
      
      // Analyze emotional patterns
      const patterns = this.analyzeEmotionalPatterns(emotionalHistory);
      const copingAnalysis = this.analyzeCopingStyles(emotionalHistory);
      const communicationAnalysis = this.analyzeCommunicationPreferences(emotionalHistory);
      const stressAnalysis = this.analyzeStressPatterns(emotionalHistory);
      
      // Classify support mode
      const supportMode = this.classifySupportMode(patterns, copingAnalysis, communicationAnalysis);
      
      // Build complete persona
      const persona = {
        userId,
        supportMode,
        primaryCopingStyle: copingAnalysis.primaryStyle,
        communicationPreference: communicationAnalysis.preferredStyle,
        emotionalTraits: this.extractEmotionalTraits(patterns, copingAnalysis),
        adaptiveStrategies: this.generateAdaptiveStrategies(supportMode, patterns),
        supportivePersonality: this.mapToSupportiveTraits(supportMode, copingAnalysis),
        responseTone: this.determineOptimalTone(communicationAnalysis, currentState),
        triggers: stressAnalysis.primaryTriggers,
        copingEffectiveness: copingAnalysis.effectiveness,
        lastUpdated: new Date(),
        confidence: this.calculateConfidence(emotionalHistory.length, patterns.consistency)
      };
      
      // Cache the persona
      this.personaCache.set(userId, persona);
      
      console.log(`✅ Built persona: ${persona.supportMode} (confidence: ${persona.confidence})`);
      
      return persona;
      
    } catch (error) {
      console.error('❌ Error building user persona:', error);
      return this.getDefaultPersona(userId, currentState);
    }
  }

  /**
   * Analyze emotional patterns from history
   */
  analyzeEmotionalPatterns(emotionalHistory) {
    if (!emotionalHistory || emotionalHistory.length === 0) {
      return { dominantEmotions: [], consistency: 0, emotionalRange: 'limited' };
    }
    
    const emotions = new Map();
    const domains = new Map();
    const intensities = [];
    
    emotionalHistory.forEach(entry => {
      const metadata = entry.metadata || {};
      
      // Count emotions
      const emotion = metadata.primaryEmotion || metadata.emotion;
      if (emotion) {
        emotions.set(emotion, (emotions.get(emotion) || 0) + 1);
      }
      
      // Count domains
      const domain = metadata.domain;
      if (domain) {
        domains.set(domain, (domains.get(domain) || 0) + 1);
      }
      
      // Track intensities
      const intensity = metadata.intensity;
      if (intensity) {
        intensities.push(intensity);
      }
    });
    
    // Calculate consistency
    const totalEntries = emotionalHistory.length;
    const mostFrequentEmotion = Math.max(...emotions.values());
    const consistency = mostFrequentEmotion / totalEntries;
    
    // Determine emotional range
    const uniqueEmotions = emotions.size;
    const emotionalRange = uniqueEmotions > 5 ? 'wide' : uniqueEmotions > 2 ? 'moderate' : 'narrow';
    
    return {
      dominantEmotions: Array.from(emotions.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([emotion, count]) => ({ emotion, count, percentage: (count / totalEntries) * 100 })),
      dominantDomains: Array.from(domains.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
      consistency,
      emotionalRange,
      averageIntensity: this.calculateAverageIntensity(intensities),
      totalInteractions: totalEntries
    };
  }

  /**
   * Analyze coping styles from emotional history
   */
  analyzeCopingStyles(emotionalHistory) {
    const copingStyles = new Map();
    const effectivenessMap = new Map();
    
    emotionalHistory.forEach(entry => {
      const metadata = entry.metadata || {};
      const copingStyle = metadata.copingStyle;
      const score = entry.score || 0.5;
      
      if (copingStyle) {
        copingStyles.set(copingStyle, (copingStyles.get(copingStyle) || 0) + 1);
        
        // Track effectiveness
        if (!effectivenessMap.has(copingStyle)) {
          effectivenessMap.set(copingStyle, []);
        }
        effectivenessMap.get(copingStyle).push(score);
      }
    });
    
    // Calculate effectiveness scores
    const effectiveness = new Map();
    effectivenessMap.forEach((scores, style) => {
      const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      effectiveness.set(style, avg);
    });
    
    // Determine primary style
    const primaryStyle = Array.from(copingStyles.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'reflective';
    
    return {
      primaryStyle,
      allStyles: Array.from(copingStyles.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([style, count]) => ({ style, count })),
      effectiveness: Array.from(effectiveness.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([style, score]) => ({ style, score })),
      adaptability: copingStyles.size > 2 ? 'high' : copingStyles.size > 1 ? 'moderate' : 'low'
    };
  }

  /**
   * Analyze communication preferences
   */
  analyzeCommunicationPreferences(emotionalHistory) {
    const tones = new Map();
    const responsePatterns = new Map();
    const needsMap = new Map();
    
    emotionalHistory.forEach(entry => {
      const metadata = entry.metadata || {};
      
      // Analyze tone preferences
      const tone = metadata.tone;
      if (tone) {
        tones.set(tone, (tones.get(tone) || 0) + 1);
      }
      
      // Analyze emotional needs
      const need = metadata.emotionalNeed;
      if (need) {
        needsMap.set(need, (needsMap.get(need) || 0) + 1);
      }
      
      // Analyze response length preferences
      const responseLength = metadata.responseLength || 'medium';
      responsePatterns.set(responseLength, (responsePatterns.get(responseLength) || 0) + 1);
    });
    
    const preferredTone = Array.from(tones.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'casual';
    
    const preferredNeed = Array.from(needsMap.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'validation';
    
    return {
      preferredTone,
      preferredNeed,
      preferredStyle: this.mapToneToStyle(preferredTone, preferredNeed),
      communicationPatterns: {
        tones: Array.from(tones.entries()),
        needs: Array.from(needsMap.entries()),
        responsePreferences: Array.from(responsePatterns.entries())
      }
    };
  }

  /**
   * Analyze stress patterns and triggers
   */
  analyzeStressPatterns(emotionalHistory) {
    const triggers = new Map();
    const stressLevels = [];
    const stressContexts = new Map();
    
    emotionalHistory.forEach(entry => {
      const metadata = entry.metadata || {};
      
      // Collect stress triggers
      const stressThemes = metadata.stressThemes || [];
      stressThemes.forEach(theme => {
        triggers.set(theme, (triggers.get(theme) || 0) + 1);
      });
      
      // Track stress levels
      const stressScore = metadata.stressScore;
      if (stressScore !== undefined) {
        stressLevels.push(Number(stressScore));
      }
      
      // Analyze stress contexts
      if (stressScore > 6) {
        const domain = metadata.domain;
        if (domain) {
          stressContexts.set(domain, (stressContexts.get(domain) || 0) + 1);
        }
      }
    });
    
    const averageStress = stressLevels.length > 0 
      ? stressLevels.reduce((sum, level) => sum + level, 0) / stressLevels.length 
      : 5;
    
    return {
      primaryTriggers: Array.from(triggers.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([trigger]) => trigger),
      averageStressLevel: averageStress,
      highStressContexts: Array.from(stressContexts.entries())
        .sort((a, b) => b[1] - a[1]),
      stressVolatility: this.calculateStressVolatility(stressLevels)
    };
  }

  /**
   * Classify user into support mode
   */
  classifySupportMode(patterns, copingAnalysis, communicationAnalysis) {
    const { primaryStyle } = copingAnalysis;
    const { preferredNeed, preferredTone } = communicationAnalysis;
    const { consistency, emotionalRange } = patterns;
    
    // Decision tree for support mode classification
    if (primaryStyle === 'expressive' && preferredNeed === 'validation') {
      return this.supportModes.EXPRESSIVE_SEEKER;
    }
    
    if (primaryStyle === 'avoidant' || preferredTone === 'withdrawn') {
      return this.supportModes.GENTLE_AVOIDER;
    }
    
    if (primaryStyle === 'reflective' && emotionalRange === 'wide') {
      return this.supportModes.REFLECTIVE_PROCESSOR;
    }
    
    if (primaryStyle === 'action_seeking' || preferredNeed === 'clarity') {
      return this.supportModes.ACTION_ORIENTED;
    }
    
    return this.supportModes.BALANCED_EXPLORER;
  }

  /**
   * Extract emotional traits
   */
  extractEmotionalTraits(patterns, copingAnalysis) {
    const traits = [];
    
    // Based on dominant emotions
    const dominantEmotion = patterns.dominantEmotions[0]?.emotion;
    if (dominantEmotion) {
      const emotionTraits = {
        'stressed': ['resilient', 'goal-oriented'],
        'anxious': ['sensitive', 'thoughtful'],
        'frustrated': ['determined', 'passionate'],
        'sad': ['empathetic', 'introspective'],
        'happy': ['optimistic', 'energetic'],
        'confused': ['seeking-clarity', 'open-minded']
      };
      
      traits.push(...(emotionTraits[dominantEmotion] || []));
    }
    
    // Based on coping style
    const copingTraits = {
      'expressive': ['communicative', 'emotionally-aware'],
      'avoidant': ['independent', 'self-reliant'],
      'reflective': ['thoughtful', 'analytical'],
      'action_seeking': ['decisive', 'solution-focused']
    };
    
    traits.push(...(copingTraits[copingAnalysis.primaryStyle] || []));
    
    // Based on consistency
    if (patterns.consistency > 0.7) {
      traits.push('consistent');
    } else if (patterns.consistency < 0.3) {
      traits.push('variable');
    }
    
    return [...new Set(traits)];
  }

  /**
   * Generate adaptive strategies for support mode
   */
  generateAdaptiveStrategies(supportMode, patterns) {
    const strategies = {
      [this.supportModes.EXPRESSIVE_SEEKER]: [
        'Use deeper metaphors and emotional mirroring',
        'Validate feelings extensively before offering solutions',
        'Encourage emotional expression and storytelling',
        'Reference past emotional experiences for connection'
      ],
      [this.supportModes.GENTLE_AVOIDER]: [
        'Use invitation-based language, not demands',
        'Offer choices rather than direct suggestions',
        'Respect emotional boundaries and pace',
        'Focus on gentle presence over active intervention'
      ],
      [this.supportModes.REFLECTIVE_PROCESSOR]: [
        'Ask thoughtful questions that encourage self-discovery',
        'Provide space for contemplation between responses',
        'Use philosophical or reflective approaches',
        'Support their natural analytical tendencies'
      ],
      [this.supportModes.ACTION_ORIENTED]: [
        'Give clear, direct guidance with caring clarity',
        'Focus on practical solutions and next steps',
        'Be decisive and confident in recommendations',
        'Structure responses with actionable outcomes'
      ],
      [this.supportModes.BALANCED_EXPLORER]: [
        'Adapt approach based on current emotional state',
        'Mix validation with gentle guidance',
        'Use varied response styles to maintain engagement',
        'Encourage exploration of different coping methods'
      ]
    };
    
    return strategies[supportMode] || strategies[this.supportModes.BALANCED_EXPLORER];
  }

  /**
   * Map support mode to supportive traits
   */
  mapToSupportiveTraits(supportMode, copingAnalysis) {
    const traitMappings = {
      [this.supportModes.EXPRESSIVE_SEEKER]: {
        primary: 'care',
        secondary: ['empathy', 'emotional_wisdom'],
        approach: 'heart-centered'
      },
      [this.supportModes.GENTLE_AVOIDER]: {
        primary: 'calm',
        secondary: ['patience', 'gentle_presence'],
        approach: 'non-intrusive'
      },
      [this.supportModes.REFLECTIVE_PROCESSOR]: {
        primary: 'wisdom',
        secondary: ['clarity', 'philosophical_depth'],
        approach: 'contemplative'
      },
      [this.supportModes.ACTION_ORIENTED]: {
        primary: 'clarity',
        secondary: ['decisive_action', 'confident_guidance'],
        approach: 'directive'
      },
      [this.supportModes.BALANCED_EXPLORER]: {
        primary: 'adaptability',
        secondary: ['care', 'wisdom', 'calm'],
        approach: 'flexible'
      }
    };
    
    return traitMappings[supportMode] || traitMappings[this.supportModes.BALANCED_EXPLORER];
  }

  /**
   * Determine optimal response tone
   */
  determineOptimalTone(communicationAnalysis, currentState) {
    const { preferredTone } = communicationAnalysis;
    const currentIntensity = currentState?.intensity || 'moderate';
    
    // Adjust tone based on current state
    if (currentIntensity === 'very_high') {
      return 'calm_supportive';
    } else if (currentIntensity === 'high') {
      return 'gentle_reassuring';
    } else if (preferredTone === 'casual') {
      return 'warm_casual';
    } else if (preferredTone === 'open') {
      return 'encouraging_open';
    } else {
      return 'balanced_supportive';
    }
  }

  // Helper methods
  calculateAverageIntensity(intensities) {
    if (intensities.length === 0) return 'moderate';
    
    const intensityMap = { low: 1, moderate: 2, high: 3, very_high: 4 };
    const reverseMap = { 1: 'low', 2: 'moderate', 3: 'high', 4: 'very_high' };
    
    const avg = intensities.reduce((sum, intensity) => {
      return sum + (intensityMap[intensity] || 2);
    }, 0) / intensities.length;
    
    const rounded = Math.round(avg);
    return reverseMap[rounded] || 'moderate';
  }

  calculateStressVolatility(stressLevels) {
    if (stressLevels.length < 2) return 'stable';
    
    const mean = stressLevels.reduce((sum, level) => sum + level, 0) / stressLevels.length;
    const variance = stressLevels.reduce((sum, level) => sum + Math.pow(level - mean, 2), 0) / stressLevels.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev > 2.5) return 'highly_volatile';
    if (stdDev > 1.5) return 'moderately_volatile';
    return 'stable';
  }

  mapToneToStyle(tone, need) {
    if (tone === 'open' && need === 'validation') return 'expressive_validation';
    if (tone === 'withdrawn' || tone === 'defensive') return 'gentle_approach';
    if (tone === 'urgent') return 'direct_support';
    return 'balanced_approach';
  }

  calculateConfidence(historyLength, consistency) {
    let confidence = Math.min(historyLength * 10, 70); // Base confidence from history
    confidence += consistency * 30; // Consistency bonus
    return Math.min(Math.round(confidence), 100);
  }

  isCacheValid(cachedPersona) {
    const ageMs = Date.now() - cachedPersona.lastUpdated.getTime();
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 days
    return ageMs < maxAgeMs;
  }

  updatePersonaWithCurrentState(persona, currentState) {
    return {
      ...persona,
      currentState,
      lastUpdated: new Date(),
      responseTone: this.determineOptimalTone(
        { preferredTone: persona.responseTone }, 
        currentState
      )
    };
  }

  getDefaultPersona(userId, currentState) {
    return {
      userId,
      supportMode: this.supportModes.BALANCED_EXPLORER,
      primaryCopingStyle: currentState?.copingStyle || 'reflective',
      communicationPreference: 'balanced_approach',
      emotionalTraits: ['open-minded', 'seeking-growth'],
      adaptiveStrategies: this.generateAdaptiveStrategies(this.supportModes.BALANCED_EXPLORER, {}),
      supportivePersonality: this.mapToSupportiveTraits(this.supportModes.BALANCED_EXPLORER, {}),
      responseTone: 'warm_casual',
      triggers: [],
      copingEffectiveness: [],
      lastUpdated: new Date(),
      confidence: 20
    };
  }
}

export default UserPersonaBuilder;