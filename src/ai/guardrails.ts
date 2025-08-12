interface CrisisDetection {
  isCrisis: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  keywords: string[];
  confidence: number;
  detectedLanguage: string;
  crisisType?: 'self_harm' | 'suicidal' | 'violence' | 'acute_distress' | 'panic';
}

interface CrisisResponse {
  immediateResponse: string;
  nextSteps: string[];
  helplineInfo: string;
  breathingExercise?: string;
  shouldDeferAdvice: boolean;
  requiresHumanIntervention: boolean;
}

interface GuardrailsConfig {
  crisisKeywords: Record<string, string[]>; // language -> keywords
  severityThresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  enableLLMDetection: boolean;
  llmConfidenceThreshold: number;
}

// Default crisis keywords by language
const DEFAULT_CRISIS_KEYWORDS = {
  en: [
    // Self-harm and suicidal ideation
    'kill myself', 'end my life', 'want to die', 'suicide', 'self-harm',
    'hurt myself', 'cut myself', 'overdose', 'take pills', 'jump off',
    'hang myself', 'shoot myself', 'no reason to live', 'better off dead',
    'everyone would be better', 'no one would miss me', 'can\'t take it anymore',
    'tired of living', 'life is not worth it', 'want to disappear',
    
    // Acute distress and panic
    'panic attack', 'can\'t breathe', 'heart attack', 'going crazy',
    'losing my mind', 'mental breakdown', 'nervous breakdown',
    'complete breakdown', 'falling apart', 'losing control',
    'can\'t function', 'can\'t cope', 'overwhelmed completely',
    
    // Violence and harm to others
    'hurt someone', 'kill someone', 'violent thoughts', 'want to hurt',
    'anger out of control', 'losing my temper', 'violent urges',
    
    // Crisis indicators
    'emergency', 'urgent help', 'immediate danger', 'right now',
    'this moment', 'can\'t wait', 'need help now', 'desperate',
    'hopeless', 'helpless', 'trapped', 'no way out'
  ],
  hi: [
    // Self-harm and suicidal ideation in Hindi
    'मैं मर जाऊंगा', 'जान दे दूंगा', 'आत्महत्या', 'खुद को मार लूंगा',
    'जीने का मन नहीं', 'मरना चाहता हूं', 'खुद को नुकसान', 'काट लूंगा',
    'गोली मार लूंगा', 'फांसी लगा लूंगा', 'ओवरडोज', 'गोलियां खा लूंगा',
    'जीने का कोई मतलब नहीं', 'सब बेहतर होगा', 'कोई याद नहीं करेगा',
    'बर्दाश्त नहीं हो रहा', 'जीवन व्यर्थ है', 'गायब हो जाना चाहता हूं',
    
    // Acute distress
    'पैनिक अटैक', 'सांस नहीं आ रही', 'दिल का दौरा', 'पागल हो रहा हूं',
    'दिमाग खराब हो गया', 'मानसिक टूटन', 'पूरी तरह टूट गया',
    'कंट्रोल नहीं हो रहा', 'काम नहीं कर पा रहा', 'सहन नहीं हो रहा',
    
    // Crisis indicators
    'आपातकाल', 'तुरंत मदद', 'खतरा', 'अभी', 'इस वक्त', 'इंतजार नहीं',
    'निराश', 'लाचार', 'फंस गया', 'कोई रास्ता नहीं'
  ],
  es: [
    // Spanish crisis keywords
    'matarme', 'suicidarme', 'acabar con mi vida', 'morir', 'autolesionarme',
    'cortarme', 'sobredosis', 'colgarme', 'dispararme', 'no quiero vivir',
    'ataque de pánico', 'no puedo respirar', 'infarto', 'me estoy volviendo loco',
    'emergencia', 'ayuda urgente', 'desesperado', 'sin esperanza'
  ]
};

// Default configuration
const DEFAULT_CONFIG: GuardrailsConfig = {
  crisisKeywords: DEFAULT_CRISIS_KEYWORDS,
  severityThresholds: {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4
  },
  enableLLMDetection: true,
  llmConfidenceThreshold: 0.7
};

/**
 * Guardrails class for crisis detection and response
 */
export class Guardrails {
  private config: GuardrailsConfig;
  private aiClient?: any; // Will be injected for LLM detection

  constructor(config: Partial<GuardrailsConfig> = {}, aiClient?: any) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.aiClient = aiClient;
  }

  /**
   * Main crisis detection function
   */
  async detectCrisis(message: string, language: string = 'en'): Promise<CrisisDetection> {
    // Step 1: Keyword-based detection
    const keywordDetection = this.detectCrisisKeywords(message, language);
    
    // Step 2: LLM-based detection (if enabled and keywords suggest crisis)
    let llmDetection: Partial<CrisisDetection> = {};
    if (this.config.enableLLMDetection && 
        (keywordDetection.isCrisis || keywordDetection.confidence > 0.3)) {
      llmDetection = await this.detectCrisisWithLLM(message, language);
    }

    // Step 3: Combine results
    const combinedDetection = this.combineDetections(keywordDetection, llmDetection);
    
    return combinedDetection;
  }

  /**
   * Generate crisis response based on detection
   */
  generateCrisisResponse(detection: CrisisDetection, userLanguage: string = 'en'): CrisisResponse {
    const responses = this.getCrisisResponses(userLanguage);
    
    let response: CrisisResponse;
    
    switch (detection.severity) {
      case 'critical':
        response = responses.critical;
        break;
      case 'high':
        response = responses.high;
        break;
      case 'medium':
        response = responses.medium;
        break;
      case 'low':
        response = responses.low;
        break;
      default:
        response = responses.medium;
    }

    // Customize based on crisis type if available
    if (detection.crisisType) {
      response = this.customizeResponseForCrisisType(response, detection.crisisType, userLanguage);
    }

    return response;
  }

  /**
   * Override normal composer with crisis response
   */
  async overrideWithCrisisResponse(
    detection: CrisisDetection,
    userLanguage: string,
    userMessage: string
  ): Promise<string> {
    const crisisResponse = this.generateCrisisResponse(detection, userLanguage);
    
    // Log crisis detection for safety monitoring
    await this.logCrisisDetection(detection, userMessage);
    
    return crisisResponse.immediateResponse;
  }

  /**
   * Keyword-based crisis detection
   */
  private detectCrisisKeywords(message: string, language: string): CrisisDetection {
    const keywords = this.config.crisisKeywords[language] || this.config.crisisKeywords.en;
    const lowerMessage = message.toLowerCase();
    
    const foundKeywords: string[] = [];
    let severityScore = 0;
    
    // Check for keyword matches
    keywords.forEach(keyword => {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        foundKeywords.push(keyword);
        
        // Score based on keyword severity
        if (this.isHighSeverityKeyword(keyword)) {
          severityScore += 2;
        } else if (this.isMediumSeverityKeyword(keyword)) {
          severityScore += 1;
        } else {
          severityScore += 0.5;
        }
      }
    });

    // Determine severity level
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (severityScore >= this.config.severityThresholds.critical) {
      severity = 'critical';
    } else if (severityScore >= this.config.severityThresholds.high) {
      severity = 'high';
    } else if (severityScore >= this.config.severityThresholds.medium) {
      severity = 'medium';
    }

    // Determine crisis type
    const crisisType = this.determineCrisisType(foundKeywords);

    return {
      isCrisis: foundKeywords.length > 0,
      severity,
      keywords: foundKeywords,
      confidence: Math.min(0.9, foundKeywords.length * 0.3),
      detectedLanguage: language,
      crisisType
    };
  }

  /**
   * LLM-based crisis detection
   */
  private async detectCrisisWithLLM(message: string, language: string): Promise<Partial<CrisisDetection>> {
    if (!this.aiClient) {
      return {};
    }

    try {
      const prompt = `Analyze this message for crisis indicators. Return JSON only.

Message: "${message}"
Language: ${language}

Check for:
- Self-harm or suicidal thoughts
- Acute mental health crisis
- Violence towards self or others
- Panic or extreme distress
- Urgent need for help

Return JSON: {
  "isCrisis": boolean,
  "severity": "low|medium|high|critical",
  "confidence": 0.0-1.0,
  "crisisType": "self_harm|suicidal|violence|acute_distress|panic|null",
  "reasoning": "brief explanation"
}`;

      const response = await this.aiClient.callModel(prompt, 'critic', {
        enableStreaming: false,
        useCache: false
      });

      try {
        const result = JSON.parse(response);
        return {
          isCrisis: result.isCrisis || false,
          severity: result.severity || 'low',
          confidence: result.confidence || 0.5,
          crisisType: result.crisisType || undefined
        };
      } catch (parseError) {
        console.error('Failed to parse LLM crisis detection:', parseError);
        return {};
      }
    } catch (error) {
      console.error('LLM crisis detection failed:', error);
      return {};
    }
  }

  /**
   * Combine keyword and LLM detection results
   */
  private combineDetections(
    keywordDetection: CrisisDetection,
    llmDetection: Partial<CrisisDetection>
  ): CrisisDetection {
    // If LLM detection has higher confidence, use it
    if (llmDetection.confidence && llmDetection.confidence > keywordDetection.confidence) {
      return {
        ...keywordDetection,
        isCrisis: llmDetection.isCrisis || keywordDetection.isCrisis,
        severity: llmDetection.severity || keywordDetection.severity,
        confidence: llmDetection.confidence,
        crisisType: llmDetection.crisisType || keywordDetection.crisisType
      };
    }

    return keywordDetection;
  }

  /**
   * Get crisis responses by language
   */
  private getCrisisResponses(language: string): Record<string, CrisisResponse> {
    const responses = {
      en: {
        critical: {
          immediateResponse: `I'm here with you right now, and I'm very concerned about what you're sharing. Your safety is the most important thing. Please call KIRAN immediately at 1800-599-0019 - this is a 24/7 crisis helpline. You are not alone, and there are people who want to help you. Your life matters.`,
          nextSteps: [
            'Call KIRAN helpline: 1800-599-0019',
            'Stay with someone you trust',
            'Remove any harmful objects from your space',
            'Remember: this feeling will pass'
          ],
          helplineInfo: 'KIRAN: 1800-599-0019 (24/7 crisis support)',
          breathingExercise: 'Take 4 slow breaths: inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat.',
          shouldDeferAdvice: true,
          requiresHumanIntervention: true
        },
        high: {
          immediateResponse: `I'm concerned about what you're sharing. Please know you're not alone. For immediate support, call KIRAN at 1800-599-0019. This is a 24/7 crisis helpline. Your safety matters, and there are people who want to help you.`,
          nextSteps: [
            'Call KIRAN helpline: 1800-599-0019',
            'Reach out to someone you trust',
            'Take deep breaths',
            'You're not alone in this'
          ],
          helplineInfo: 'KIRAN: 1800-599-0019 (24/7 crisis support)',
          breathingExercise: 'Breathe in slowly for 4 counts, hold for 4, breathe out for 4. Repeat 5 times.',
          shouldDeferAdvice: true,
          requiresHumanIntervention: false
        },
        medium: {
          immediateResponse: `I hear you, and I want to make sure you're safe. If you're having thoughts of harming yourself, please call KIRAN at 1800-599-0019. You don't have to go through this alone.`,
          nextSteps: [
            'Call KIRAN if you need immediate support: 1800-599-0019',
            'Talk to someone you trust',
            'Practice deep breathing',
            'Remember: this moment doesn't define your future'
          ],
          helplineInfo: 'KIRAN: 1800-599-0019 (24/7 crisis support)',
          shouldDeferAdvice: false,
          requiresHumanIntervention: false
        },
        low: {
          immediateResponse: `I'm here to support you. If you ever feel overwhelmed or have thoughts of harming yourself, please know that KIRAN is available 24/7 at 1800-599-0019. You're not alone.`,
          nextSteps: [
            'Keep KIRAN number handy: 1800-599-0019',
            'Talk to someone you trust',
            'Practice self-care',
            'You're doing better than you think'
          ],
          helplineInfo: 'KIRAN: 1800-599-0019 (24/7 crisis support)',
          shouldDeferAdvice: false,
          requiresHumanIntervention: false
        }
      },
      hi: {
        critical: {
          immediateResponse: `मैं अभी आपके साथ हूं, और मैं आपकी सुरक्षा के बारे में बहुत चिंतित हूं। कृपया तुरंत KIRAN को 1800-599-0019 पर कॉल करें - यह 24/7 क्राइसिस हेल्पलाइन है। आप अकेले नहीं हैं, और आपकी जान मायने रखती है।`,
          nextSteps: [
            'KIRAN हेल्पलाइन कॉल करें: 1800-599-0019',
            'किसी भरोसेमंद व्यक्ति के साथ रहें',
            'अपने आसपास से हानिकारक वस्तुओं को हटा दें',
            'याद रखें: यह भावना गुजर जाएगी'
          ],
          helplineInfo: 'KIRAN: 1800-599-0019 (24/7 क्राइसिस सपोर्ट)',
          breathingExercise: '4 धीमी सांसें लें: 4 गिनती तक सांस लें, 4 तक रोकें, 4 तक छोड़ें, 4 तक रोकें। दोहराएं।',
          shouldDeferAdvice: true,
          requiresHumanIntervention: true
        },
        high: {
          immediateResponse: `मैं आपकी बात सुन रहा हूं और चिंतित हूं। कृपया KIRAN को 1800-599-0019 पर कॉल करें। यह 24/7 क्राइसिस हेल्पलाइन है। आपकी सुरक्षा मायने रखती है।`,
          nextSteps: [
            'KIRAN हेल्पलाइन कॉल करें: 1800-599-0019',
            'किसी भरोसेमंद व्यक्ति से बात करें',
            'गहरी सांसें लें',
            'आप इसमें अकेले नहीं हैं'
          ],
          helplineInfo: 'KIRAN: 1800-599-0019 (24/7 क्राइसिस सपोर्ट)',
          breathingExercise: '4 गिनती तक धीरे सांस लें, 4 तक रोकें, 4 तक छोड़ें। 5 बार दोहराएं।',
          shouldDeferAdvice: true,
          requiresHumanIntervention: false
        },
        medium: {
          immediateResponse: `मैं आपकी बात सुन रहा हूं और आपकी सुरक्षा सुनिश्चित करना चाहता हूं। अगर आपको खुद को नुकसान पहुंचाने के विचार आ रहे हैं, तो कृपया KIRAN को 1800-599-0019 पर कॉल करें।`,
          nextSteps: [
            'अगर तुरंत सहायता चाहिए तो KIRAN कॉल करें: 1800-599-0019',
            'किसी भरोसेमंद व्यक्ति से बात करें',
            'गहरी सांसें लें',
            'याद रखें: यह क्षण आपके भविष्य को परिभाषित नहीं करता'
          ],
          helplineInfo: 'KIRAN: 1800-599-0019 (24/7 क्राइसिस सपोर्ट)',
          shouldDeferAdvice: false,
          requiresHumanIntervention: false
        },
        low: {
          immediateResponse: `मैं आपकी सहायता के लिए यहां हूं। अगर आप कभी भी अभिभूत महसूस करते हैं, तो KIRAN 24/7 उपलब्ध है: 1800-599-0019। आप अकेले नहीं हैं।`,
          nextSteps: [
            'KIRAN नंबर हाथ में रखें: 1800-599-0019',
            'किसी भरोसेमंद व्यक्ति से बात करें',
            'आत्म-देखभाल करें',
            'आप सोचते हैं उससे बेहतर कर रहे हैं'
          ],
          helplineInfo: 'KIRAN: 1800-599-0019 (24/7 क्राइसिस सपोर्ट)',
          shouldDeferAdvice: false,
          requiresHumanIntervention: false
        }
      }
    };

    return responses[language as keyof typeof responses] || responses.en;
  }

  /**
   * Customize response based on crisis type
   */
  private customizeResponseForCrisisType(
    response: CrisisResponse,
    crisisType: string,
    language: string
  ): CrisisResponse {
    const customizations: Record<string, Partial<CrisisResponse>> = {
      self_harm: {
        nextSteps: [
          ...response.nextSteps,
          'Remove sharp objects from your environment',
          'Stay in a safe space'
        ]
      },
      panic: {
        breathingExercise: 'Box breathing: Inhale 4, hold 4, exhale 4, hold 4. Focus on counting.',
        nextSteps: [
          'Find a quiet, safe place',
          'Practice box breathing',
          'Ground yourself: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste'
        ]
      },
      violence: {
        immediateResponse: response.immediateResponse + ' If you're having thoughts of harming others, please call emergency services immediately.',
        nextSteps: [
          'Call emergency services if needed',
          'Remove yourself from the situation',
          'Find a safe space',
          ...response.nextSteps
        ]
      }
    };

    const customization = customizations[crisisType];
    return customization ? { ...response, ...customization } : response;
  }

  /**
   * Helper functions for keyword severity
   */
  private isHighSeverityKeyword(keyword: string): boolean {
    const highSeverity = [
      'kill myself', 'suicide', 'end my life', 'want to die',
      'hurt someone', 'kill someone', 'violent thoughts',
      'panic attack', 'heart attack', 'can\'t breathe',
      'मैं मर जाऊंगा', 'आत्महत्या', 'जान दे दूंगा',
      'खुद को मार लूंगा', 'किसी को मार दूंगा'
    ];
    return highSeverity.some(high => keyword.toLowerCase().includes(high));
  }

  private isMediumSeverityKeyword(keyword: string): boolean {
    const mediumSeverity = [
      'self-harm', 'hurt myself', 'cut myself', 'overdose',
      'going crazy', 'losing my mind', 'mental breakdown',
      'खुद को नुकसान', 'काट लूंगा', 'ओवरडोज',
      'पागल हो रहा हूं', 'दिमाग खराब'
    ];
    return mediumSeverity.some(medium => keyword.toLowerCase().includes(medium));
  }

  /**
   * Determine crisis type from keywords
   */
  private determineCrisisType(keywords: string[]): 'self_harm' | 'suicidal' | 'violence' | 'acute_distress' | 'panic' | undefined {
    const lowerKeywords = keywords.map(k => k.toLowerCase());
    
    if (lowerKeywords.some(k => k.includes('kill') || k.includes('suicide') || k.includes('die'))) {
      return 'suicidal';
    }
    if (lowerKeywords.some(k => k.includes('hurt') || k.includes('cut') || k.includes('harm'))) {
      return 'self_harm';
    }
    if (lowerKeywords.some(k => k.includes('violent') || k.includes('anger'))) {
      return 'violence';
    }
    if (lowerKeywords.some(k => k.includes('panic') || k.includes('can\'t breathe'))) {
      return 'panic';
    }
    if (lowerKeywords.some(k => k.includes('breakdown') || k.includes('crazy') || k.includes('losing'))) {
      return 'acute_distress';
    }
    
    return undefined;
  }

  /**
   * Log crisis detection for safety monitoring
   */
  private async logCrisisDetection(detection: CrisisDetection, userMessage: string): Promise<void> {
    // TODO: Implement logging to your monitoring system
    console.warn('CRISIS DETECTED:', {
      severity: detection.severity,
      crisisType: detection.crisisType,
      confidence: detection.confidence,
      keywords: detection.keywords,
      timestamp: new Date().toISOString(),
      messageLength: userMessage.length
    });
  }
}

/**
 * Factory function to create guardrails instance
 */
export function createGuardrails(config?: Partial<GuardrailsConfig>, aiClient?: any): Guardrails {
  return new Guardrails(config, aiClient);
}
