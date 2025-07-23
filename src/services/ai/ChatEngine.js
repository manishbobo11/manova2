import { AZURE_CONFIG, validateAzureConfig } from '../../config/azure';
import { ContextStore } from '../firebase';
import { querySimilarVectors, getUserEmotionalHistory } from '../../utils/vectorStore';
import AgenticAI from './AgenticAI';

export class ChatEngine {
  constructor() {
    this.validateConfig();
    this.responseStructure = {
      text: '',
      summary: '',
      suggestions: [],
      journalPrompt: '',
      language: 'English',
      moodContext: ''
    };
    // Initialize Agentic AI system (inject this ChatEngine to avoid circular dependency)
    this.agenticAI = new AgenticAI();
    this.agenticAI.setChatEngine(this);
  }

  validateConfig() {
    if (!validateAzureConfig()) {
      throw new Error('Azure configuration is invalid');
    }
  }

  async generateResponse({ userMessage, userId, language = 'English', conversationHistory = [] }) {
    try {
      console.log(`🚀 ChatEngine processing: ${userId} | Message: "${userMessage.substring(0, 50)}..."`);
      
      // AGENTIC AI INTEGRATION: Check if we should use the agentic system
      const useAgenticAI = await this.shouldUseAgenticAI(userId, userMessage, conversationHistory);
      
      if (useAgenticAI) {
        console.log(`🤖 Using Agentic AI system for enhanced response`);
        
        try {
          // Delegate to Agentic AI system
          const agenticResponse = await this.agenticAI.generateAgenticResponse({
            userMessage,
            userId,
            language,
            conversationHistory
          });
          
          console.log(`✅ Agentic AI response generated successfully`);
          return agenticResponse;
          
        } catch (agenticError) {
          console.error('❌ Agentic AI failed, falling back to V2 system:', agenticError);
          // Continue to V2 system as fallback
        }
      }
      
      // V2 SYSTEM (Fallback or when Agentic AI not needed)
      console.log(`🔄 Using V2 ChatEngine system`);
      
      // Get user context and past check-ins
      const userContext = await this.getUserContext(userId);
      const pastCheckins = await this.getPastCheckins(userId);
      const stressPatterns = await this.getStressPatterns(userId, userMessage);

      // V2 UPGRADE: Get emotional trend summary
      const moodSummary = await this.getMoodSummary(userId, language);
      
      // V2 UPGRADE: Analyze if therapy suggestions needed
      const needsTherapyAdvice = this.detectTherapyNeeds(userMessage, conversationHistory);
      
      // V2 UPGRADE: Check if journal prompt is appropriate
      const needsJournalPrompt = this.detectJournalNeed(userMessage, moodSummary);

      // Build the enhanced V2 companion prompt
      const prompt = this.buildV2CompanionPrompt({
        userMessage,
        language,
        userContext,
        pastCheckins,
        stressPatterns,
        conversationHistory,
        moodSummary,
        needsTherapyAdvice,
        needsJournalPrompt
      });

      // Call Azure GPT-4o for enhanced response
      const response = await this.callAzureGPT(prompt);

      // Parse structured response
      const structuredResponse = this.parseV2Response(response, language);

      // V2 UPGRADE: Generate therapy suggestions if needed
      if (needsTherapyAdvice) {
        structuredResponse.suggestions = await this.generateTherapistSuggestion(userMessage, moodSummary, language);
      }

      // V2 UPGRADE: Generate journal prompt if needed
      if (needsJournalPrompt) {
        structuredResponse.journalPrompt = await this.suggestJournalPrompt(userMessage, moodSummary, language);
      }

      // Add mood context
      structuredResponse.moodContext = moodSummary;

      // Detect crisis intervention
      const crisisDetected = this.detectCrisisIntervention(userMessage, structuredResponse.text);

      // Determine emotional tone
      const emotion = this.determineEmotion(structuredResponse.text, crisisDetected);

      return {
        message: structuredResponse.text,
        emotion,
        crisisDetected,
        language,
        // V2 ENHANCED RESPONSE STRUCTURE
        summary: structuredResponse.summary,
        suggestions: structuredResponse.suggestions,
        journalPrompt: structuredResponse.journalPrompt,
        moodContext: structuredResponse.moodContext,
        systemUsed: 'v2_fallback'
      };
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  }

  /**
   * Determine if Agentic AI should be used for this interaction
   */
  async shouldUseAgenticAI(userId, userMessage, conversationHistory) {
    try {
      // Always use Agentic AI for users with emotional history
      if (userId && conversationHistory.length > 0) {
        return true;
      }
      
      // Use Agentic AI for first interactions to start building patterns
      if (userId) {
        return true;
      }
      
      // For complex emotional expressions, use Agentic AI
      const complexEmotionIndicators = [
        'confused', 'overwhelmed', 'stuck', 'lost', 'complicated',
        'mixed feelings', 'don\'t know', 'struggling', 'conflicted'
      ];
      
      const hasComplexEmotion = complexEmotionIndicators.some(indicator => 
        userMessage.toLowerCase().includes(indicator)
      );
      
      if (hasComplexEmotion) {
        return true;
      }
      
      // Default to Agentic AI for logged-in users
      return Boolean(userId);
      
    } catch (error) {
      console.error('Error determining Agentic AI usage:', error);
      return false; // Fallback to V2 system
    }
  }

  async getUserContext(userId) {
    try {
      if (!userId) return {};
      
      // Get user context from Firebase
      const userContext = await ContextStore.getUserContext(userId) || {};
      
      // Extract user name from various sources
      const userName = userContext.userName || 
                      userContext.displayName || 
                      userContext.name || 
                      'friend';
      
      // Get last check-in summary
      const lastCheckinSummary = userContext.lastCheckinSummary || 
                                userContext.lastCheckIn || 
                                (userContext.surveyHistory && userContext.surveyHistory.length > 0 ? 
                                 userContext.surveyHistory[0].summary : 
                                 'No previous check-ins');
      
      // Extract stress tags
      const recentStressTags = userContext.stressTriggers || 
                              userContext.recentStressTags || 
                              [];
      
      return {
        ...userContext,
        userName,
        lastCheckinSummary,
        recentStressTags
      };
    } catch (error) {
      console.error('Error getting user context:', error);
      return {
        userName: 'friend',
        lastCheckinSummary: 'No previous check-ins',
        recentStressTags: []
      };
    }
  }

  async getPastCheckins(userId) {
    try {
      if (!userId) return [];
      
      // Try to get recent check-ins from vector store
      const recentCheckins = await getUserEmotionalHistory(userId, 3);
      
      // If vector store is not available, try to get from Firebase
      if (!recentCheckins || recentCheckins.length === 0) {
        console.log('📝 No vector data available, trying Firebase fallback');
        const userContext = await this.getUserContext(userId);
        if (userContext && userContext.surveyHistory) {
          const recent = userContext.surveyHistory.slice(-3);
          return recent.map(entry => ({
            metadata: {
              response: entry.summary || entry.domain || 'Previous check-in',
              timestamp: entry.timestamp,
              domain: entry.domain || 'general'
            }
          }));
        }
      }
      
      return recentCheckins || [];
    } catch (error) {
      console.error('Error getting past check-ins:', error);
      return [];
    }
  }

  async getStressPatterns(userId, userMessage) {
    try {
      if (!userId || !userMessage) return [];
      
      // For now, return empty array since we need embeddings for similarity search
      // In a full implementation, you'd convert userMessage to embedding first
      // const embedding = await this.getEmbedding(userMessage);
      // const patterns = await querySimilarVectors(userId, embedding, 5);
      return [];
    } catch (error) {
      console.error('Error getting stress patterns:', error);
      return [];
    }
  }

  generateOpeningMessage({ userName, moodSummary, language }) {
    // Create emotional memory summary for natural reference
    const emotionalContext = this.buildEmotionalMemoryContext(moodSummary);
    
    // Generate personalized opening based on language
    const templates = {
      'English': this.generateEnglishOpening(userName, emotionalContext),
      'Hindi': this.generateHindiOpening(userName, emotionalContext),
      'Hinglish': this.generateHinglishOpening(userName, emotionalContext)
    };
    
    return templates[language] || templates['English'];
  }

  buildEmotionalMemoryContext(moodSummary) {
    if (!moodSummary || moodSummary === 'No previous check-ins') {
      return { isFirstTime: true, trend: 'neutral', context: '' };
    }
    
    const summary = moodSummary.toLowerCase();
    let trend = 'neutral';
    let context = '';
    
    // Detect emotional trends
    if (summary.includes('stress') || summary.includes('overwhelm') || summary.includes('pressure')) {
      trend = 'stressed';
      context = 'work stress';
    } else if (summary.includes('sad') || summary.includes('down') || summary.includes('low')) {
      trend = 'sad';
      context = 'feeling down';
    } else if (summary.includes('anxious') || summary.includes('worry') || summary.includes('concern')) {
      trend = 'anxious';
      context = 'anxiety';
    } else if (summary.includes('frustrated') || summary.includes('annoyed') || summary.includes('irritated')) {
      trend = 'frustrated';
      context = 'frustration';
    } else if (summary.includes('good') || summary.includes('positive') || summary.includes('better')) {
      trend = 'positive';
      context = 'doing well';
    }
    
    return { isFirstTime: false, trend, context };
  }

  generateEnglishOpening(userName, emotionalContext) {
    const name = userName || 'friend';
    
    if (emotionalContext.isFirstTime) {
      return `Hi ${name}! 🌟 I'm Sarthi, your personal wellness companion. How are you feeling today? I'm here to listen and support you.`;
    }
    
    const openings = {
      'stressed': `Hi ${name}! 🧠 I remember you were dealing with some work stress recently. How are you feeling today? I'm here if you need to talk through anything.`,
      'sad': `Hi ${name}! ❤️ I've been thinking about you - you seemed to be going through a tough time last we talked. How are things feeling today?`,
      'anxious': `Hi ${name}! 😌 I know you were feeling a bit anxious before. How's your headspace today? I'm here to help you work through whatever's on your mind.`,
      'frustrated': `Hi ${name}! 🌱 You seemed frustrated about some things last time. How are you feeling today? Sometimes a fresh perspective helps.`,
      'positive': `Hi ${name}! ✨ It's so good to see you again! You were doing well last time we talked. How are you feeling today?`,
      'neutral': `Hi ${name}! 🌟 How are you feeling today? I'm here to listen and support you through whatever's on your mind.`
    };
    
    return openings[emotionalContext.trend] || openings['neutral'];
  }

  generateHindiOpening(userName, emotionalContext) {
    const name = userName || 'यार';
    
    if (emotionalContext.isFirstTime) {
      return `नमस्ते ${name}! 😊 मैं Sarthi हूं, तुम्हारा wellness buddy… आज कैसा महसूस हो रहा है? मैं हूं ना तुम्हारे साथ 🤗`;
    }
    
    const openings = {
      'stressed': `नमस्ते ${name}… 😔 मुझे याद है तुम पिछली बार काम के stress में थे… आज कैसा लग रहा है? मैं हूं ना 🤗`,
      'sad': `हैलो ${name}… 😔 मैं तुम्हारे बारे में सोच रहा था… पिछली बार तुम उदास लग रहे थे। आज कैसा महसूस हो रहा है? 💫`,
      'anxious': `हैलो ${name}! 😌 पता है तुम anxiety में थे पहले… आज मन कैसा है? बात करना चाहते हो? 😊`,
      'frustrated': `हैलो ${name}! 🌱 पिछली बार तुम frustrated लग रहे थे… आज कैसा है? कभी कभी बात करने से दिमाग हल्का हो जाता है 😊`,
      'positive': `हैलो ${name}! 😊 तुमको देखकर बहुत खुशी हुई! पिछली बार तुम अच्छे mood में थे… आज कैसा लग रहा है? ✨`,
      'neutral': `हैलो ${name}! 😊 आज कैसा महसूस हो रहा है? जो भी मन में है, बताइए… मैं हूं ना 🤗`
    };
    
    return openings[emotionalContext.trend] || openings['neutral'];
  }

  generateHinglishOpening(userName, emotionalContext) {
    const name = userName || 'yaar';
    
    if (emotionalContext.isFirstTime) {
      return `Arre ${name}! 😊 Main Sarthi hoon, tumhara wellness buddy… Aaj kaise feel ho raha hai? Main hoon na tumhare saath 🤗`;
    }
    
    const openings = {
      'stressed': `Hey ${name}… 😔 Yaad hai last time tum work stress mein the? Aaj kaise feel ho raha hai bhai? Main hoon na 🤗`,
      'sad': `Arre ${name}… 😔 Main tumhare baare mein soch raha tha… last time tum thode down lag rahe the. Aaj kaise laga raha hai? 💫`,
      'anxious': `Hey ${name}! 😌 Pata hai tum anxiety mein the pehle… Aaj tumhara mood kaisa hai? Baat karni hai? 😊`,
      'frustrated': `Arre ${name}! 🌱 Last time tum frustrated lag rahe the yaar… Aaj kaisa feel ho raha hai? Kabhi kabhi baat karne se man halka ho jata hai na 😊`,
      'positive': `Hey ${name}! 😊 Bahut khushi hui tumko dekhkar! Last time tum good mood mein the… Aaj kaisa lag raha hai? ✨`,
      'neutral': `Hey ${name}! 😊 Aaj kaisa feel ho raha hai? Jo bhi man mein hai, batao na… main hoon tumhare saath 🤗`
    };
    
    return openings[emotionalContext.trend] || openings['neutral'];
  }

  async getFirstMessage({ userId, language }) {
    try {
      console.log(`🚀 V2: Generating first message for user ${userId} in ${language}`);
      
      // Get user context for name
      const userContext = await this.getUserContext(userId);
      const userName = userContext.userName || 'friend';
      
      // V2 UPGRADE: Get enhanced mood summary with trends
      const moodSummary = await this.getMoodSummary(userId, language);
      
      // Simple, friendly opening like a real friend
      const openingPrompt = `You are Sarthi, a caring friend checking in. Write a simple, natural greeting.

USER: ${userName}
LANGUAGE: ${language}
CONTEXT: ${moodSummary}

INSTRUCTIONS:
- Sound like a real friend, not a therapist or AI
- Keep it short and casual (1-2 sentences max)
- Use their name naturally
- NO flowery language, metaphors, or dramatic expressions

${language === 'Hinglish' ? 'STYLE: Mix Hindi-English casually. Examples: "Hey! Kya haal hai?", "Sab thik?"' : ''}
${language === 'Hindi' ? 'STYLE: Simple, friendly Hindi. Examples: "कैसे हो?", "क्या हाल है?"' : ''}
${language === 'English' ? 'STYLE: Casual English like texting. Examples: "Hey! How are things?", "What\'s up?"' : ''}

Write a simple greeting:`;

      // Call GPT to generate V2 personalized opening
      const openingMessage = await this.callAzureGPT(openingPrompt);
      
      return {
        message: openingMessage.trim(),
        emotion: 'supportive',
        language: language,
        // V2 ENHANCEMENT: Include mood context in first message response
        moodContext: moodSummary,
        summary: `Starting conversation with emotional memory: ${moodSummary}`,
        suggestions: [],
        journalPrompt: ''
      };
      
    } catch (error) {
      console.error('Error generating V2 first message:', error);
      
      // Fallback to simple greeting
      const userContext = await this.getUserContext(userId);
      const userName = userContext.userName || 'friend';
      
      const fallbackMessage = this.generateOpeningMessage({
        userName: userName,
        moodSummary: 'No previous check-ins',
        language: language
      });
      
      return {
        message: fallbackMessage,
        emotion: 'supportive',
        language: language,
        moodContext: '',
        summary: '',
        suggestions: [],
        journalPrompt: ''
      };
    }
  }

  // V2 UPGRADE: Enhanced Mood Summary with Pinecone vectors
  async getMoodSummary(userId, language) {
    try {
      console.log(`🧠 V2: Getting mood summary for user ${userId}`);
      
      // Get last 5 vectors from Pinecone for trend analysis
      const emotionalHistory = await getUserEmotionalHistory(userId, 5);
      
      if (!emotionalHistory || emotionalHistory.length === 0) {
        return 'New here! Looking forward to getting to know you and supporting you however I can.';
      }

      // Extract emotional patterns from vectors
      const patterns = emotionalHistory.map(entry => {
        const metadata = entry.metadata || {};
        return {
          mood: metadata.mood || 'neutral',
          domain: metadata.domain || 'general',
          stressScore: metadata.stressScore || 0,
          response: metadata.response || metadata.summary || 'Previous reflection',
          timestamp: metadata.timestamp || 'recent'
        };
      });

      // Simple summary of their recent emotional patterns
      const trendPrompt = `Look at this person's recent emotional check-ins and write a simple, caring summary.

Recent patterns:
${patterns.map((p, i) => `${i+1}. ${p.response} (${p.domain}, stress: ${p.stressScore}/10)`).join('\n')}

Write a simple summary that:
- Shows you understand what they've been going through
- Uses everyday language, not dramatic or poetic
- Acknowledges their feelings without being overly deep
- Sounds like a friend who remembers their struggles

${language === 'Hinglish' ? 'Example style: "Work stress zyada chal raha hai lately, and personal life mein bhi kuch tension hai"' : ''}
${language === 'Hindi' ? 'Example style: "काम में काफी तनाव रहा है और व्यक्तिगत जीवन में भी कुछ परेशानी है"' : ''}
${language === 'English' ? 'Example style: "Work has been pretty stressful lately, and some personal stuff too"' : ''}

Write a simple, caring summary (1 sentence):`;

      const moodSummary = await this.callAzureGPT(trendPrompt);
      console.log(`✅ V2: Generated mood summary: ${moodSummary}`);
      
      return moodSummary.trim();
      
    } catch (error) {
      console.error('Error in getMoodSummary:', error);
      return 'I\'m Sarthi, here to listen and support you through whatever you\'re feeling today.';
    }
  }

  // V2 UPGRADE: Detect when user needs therapy-style advice
  detectTherapyNeeds(userMessage, conversationHistory) {
    const message = userMessage.toLowerCase();
    const therapyTriggers = [
      'confused', 'lost', 'don\'t know what to do', 'stuck', 'overwhelming',
      'can\'t handle', 'falling apart', 'need help', 'what should i do',
      'advice', 'guidance', 'suggestion', 'how do i', 'struggling with'
    ];
    
    return therapyTriggers.some(trigger => message.includes(trigger));
  }

  // V2 UPGRADE: Detect when journal prompts would be helpful
  detectJournalNeed(userMessage, moodSummary) {
    const message = userMessage.toLowerCase();
    const journalTriggers = [
      'thinking about', 'reflecting on', 'been considering', 'wondering about',
      'feel like', 'going through', 'processing', 'complex', 'deep'
    ];
    
    const hasEmotionalDepth = journalTriggers.some(trigger => message.includes(trigger));
    const hasMoodContext = moodSummary && !moodSummary.includes('starting fresh');
    
    return hasEmotionalDepth || hasMoodContext;
  }

  // V2 UPGRADE: Generate practical actionable guidance
  async generateTherapistSuggestion(userMessage, moodSummary, language) {
    try {
      const guidancePrompt = `You're Sarthi, a caring buddy giving practical advice with warmth and emojis. Provide 2-3 realistic steps that feel like suggestions from a close friend.

Your friend's message: "${userMessage}"
What you know about them: ${moodSummary}
Language: ${language}

Create buddy-like suggestions that are:
- Warm and encouraging with emojis 😊 🌱 💫
- Actually doable today (not overwhelming)
- Sound like texting your bestie
- Use natural pauses with "…"
- Include emotional support phrases

${language === 'Hinglish' ? 'Style: "Arre, try this yaar – aaj 10 minutes apne thoughts likhna 📝 It might help clear your head, trust me! 😊"' : ''}
${language === 'Hindi' ? 'Style: "यार, आज ये करके देखो 😊 15 मिनट अपने लिए निकालो… मन को आराम मिलेगा 🌱"' : ''}
${language === 'English' ? 'Style: "Hey, try this – take 10 minutes tonight to write down what’s bugging you 📝 Sometimes getting it out helps, you know? 😊"' : ''}

Format as JSON array of 2-3 buddy-like suggestions with emojis: ["suggestion1", "suggestion2", "suggestion3"]`;

      const response = await this.callAzureGPT(guidancePrompt);
      
      try {
        return JSON.parse(response);
      } catch (parseError) {
        // Enhanced fallbacks based on language
        const fallbacks = {
          'Hinglish': [
            'Arre yaar, aaj raat 10 minutes apne liye time nikalo 😊 Just sit quietly… tumhara mind clear ho jayega, trust me! 🌱',
            'Try this bhai – teen choti things likhna jo tumhare control mein hain 📝 Pick one and work on it today 💫',
            'Kal morning socho na – is situation se kya seekh sakta hoon? 🤔 Sometimes tough times teach us the most 😊'
          ],
          'Hindi': [
            'यार, आज रात 15 मिनट अपने लिए निकालो 😊 बस शांत बैठो… मन को आराम मिलेगा 🌱',
            'ये करके देखो – तीन छोटी चीज़ें लिखो जो आपके कंट्रोल में हैं 📝 उनमें से एक पर काम करो 💫',
            'कल सुबह एक मिनट सोचो – इस हालात से क्या सीख सकते हैं? 🤔 कभी कभी मुश्किल वक्त कुछ सिखाते हैं 😊'
          ],
          'English': [
            'Hey, tonight try this – spend 10 minutes writing down what’s bugging you 📝 It really helps to get it out, trust me! 😊',
            'Quick idea: write down three small things you can actually control right now 💫 Pick one and tackle it today 🌱',
            'Tomorrow morning, take a sec to think – what can I learn from this mess? 🤔 Sometimes the tough stuff teaches us the most 😊'
          ]
        };
        return fallbacks[language] || fallbacks['English'];
      }
    } catch (error) {
      console.error('Error generating practical guidance:', error);
      return [];
    }
  }

  // V2 UPGRADE: Generate simple journal reflection prompts
  async suggestJournalPrompt(userMessage, moodSummary, language) {
    try {
      const reflectionPrompt = `You're Sarthi, a caring buddy suggesting a gentle journal prompt. Make it feel like a friend asking a thoughtful question, not a therapist giving homework.

Your friend's message: "${userMessage}"
What you know about them: ${moodSummary}
Language: ${language}

The prompt should:
- Feel like a caring friend asking a good question 😊
- Help them process feelings without being overwhelming
- Use warm, buddy-like language with emojis
- Be 1-2 sentences that feel supportive
- Include gentle encouragement

${language === 'Hinglish' ? 'Style: "Arre, try writing about this – what\'s one thing tumhare control mein hai right now that might help? 📝 Sometimes it helps to see our thoughts on paper, you know? 😊"' : ''}
${language === 'Hindi' ? 'Style: "यार, इस बारे में लिखकर देखो – आज जो मन में आ रहा है, उसमें क्या अच्छा निकाल सकते हैं? 📝 कभी कभी लिखने से मन हल्का हो जाता है 😊"' : ''}
${language === 'English' ? 'Style: "Here’s a gentle question for you – what’s one small thing that went well today, and how did it make you feel? 📝 Sometimes writing about the good stuff helps balance out the tough moments 😊"' : ''}

Generate ONE warm, buddy-like journal prompt with emoji:`;

      const response = await this.callAzureGPT(reflectionPrompt);
      return response.trim();
      
    } catch (error) {
      console.error('Error generating journal prompt:', error);
      
      // Simple fallback prompts
      const fallbacks = {
        'Hinglish': 'Jo feeling abhi sabse strong hai, agar you could tell someone about it openly, kya kehna chahoge? What do you need right now?',
        'Hindi': 'अभी आपको सबसे ज्यादा क्या परेशान कर रहा है? अगर किसी दोस्त को बताना हो तो क्या कहेंगे?',
        'English': 'What\'s the main thing on your mind right now? If you could tell a close friend, what would you say?'
      };
      return fallbacks[language] || fallbacks['English'];
    }
  }

  // V2 UPGRADE: Parse structured response from GPT
  parseV2Response(response, language) {
    try {
      // Try to parse if GPT returned JSON structure
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          text: parsed.text || response,
          summary: parsed.summary || '',
          suggestions: parsed.suggestions || [],
          journalPrompt: parsed.journalPrompt || '',
          language: language,
          moodContext: ''
        };
      }
    } catch (parseError) {
      console.log('V2: Response not in JSON format, using as text');
    }
    
    // Fallback: treat entire response as text
    return {
      text: response,
      summary: '',
      suggestions: [],
      journalPrompt: '',
      language: language,
      moodContext: ''
    };
  }

  // V2 UPGRADE: Human-like companion prompt with empathy
  buildV2CompanionPrompt({ userMessage, language, userContext, pastCheckins, stressPatterns, conversationHistory, moodSummary, needsTherapyAdvice, needsJournalPrompt }) {
    const displayName = userContext.userName || "friend";
    const recentMessages = conversationHistory.slice(-4).map(msg => 
      `${msg.type === 'user' ? 'User' : 'Sarthi'}: ${msg.content}`
    ).join('\n');

    return `You are Sarthi – a caring buddy who genuinely cares about your friend. Talk like someone who's known them for years and really gets them.

🤗 USER CONTEXT:
Your friend: ${displayName}
Language: ${language}
What you know: ${moodSummary}
Recent chat: ${recentMessages}

💬 TALK LIKE A CARING BUDDY:
- Use natural pauses with "…" and warm emojis 😊 🌱 🤗 💫
- Sound like you're texting your best friend who's going through something
- Empathize first: "Yaar, that must’ve been tough… 😔"
- Use Hinglish naturally if possible: "Samajh aa gaya, kya scene hai?"
- Be real, not robotic - like "Arre, that’s so frustrating! 😩"
- Keep it short and sweet, like real conversations

📝 CURRENT MESSAGE FROM ${displayName}:
"${userMessage}"

😊 HOW TO RESPOND AS A BUDDY:
1. Empathize first: "That sounds really tough, yaar… 😔" or "Arre, I totally get it 🤗"
2. Show you’re listening: "Tell me more" or "Kya hua exactly?"
3. Suggest something helpful but realistic, like a friend would

😊 BUDDY LANGUAGE FOR ${language}:
${language === 'Hindi' ? '- Talk like a caring dost in everyday Hindi with emojis\n- Use "Yaar, क्या बात है? 🤔", "समझ आ गया… 😔"\n- Add warmth: "मैं हूँ ना, बताओ 🤗"' : ''}
${language === 'Hinglish' ? '- Mix Hindi-English like real friends with heart emojis\n- "Arre yaar, that sounds tough… 😩 Samajh aa gaya"\n- "Kya scene hai bhai? 🤔 Main hoon na, batao"\n- Use natural flow: "Stress ho raha hai? 😔 Let’s figure this out together 💫"' : ''}
${language === 'English' ? '- Text like you\'re messaging your bestie with emojis\n- "Oh no, that sounds super stressful… 😔 I’m here for you 🤗"\n- "That makes total sense! 😊 How are you handling it?"\n- Be genuine: "Ugh, I totally get why that’s frustrating 😩"' : ''}

✅ BUDDY EXAMPLES:
- "Arre yaar, that sounds super tough… 😔 Kaise handle kar rahe ho?"
- "Oh no… I totally get why you’d feel stressed about that 😩 What’s been the hardest part?"
- "Samajh aa gaya bhai… 🤗 Main hoon na, kya help kar sakta hoon?"
- "That makes complete sense! 😊 Want to talk through it? 💫"
- "Work stress? Uff, been there… 😩 Tell me what happened?"

❌ AVOID BEING:
- Robotic or formal
- Too long-winded (keep it like texting)
- Therapist-like
- Without emojis/warmth
- Cold or distant

${needsTherapyAdvice ? '\n🧠 THERAPY INTEGRATION: Include gentle, actionable guidance with emotional reasoning' : ''}
${needsJournalPrompt ? '\n✍️ REFLECTION READY: User seems open to deeper self-exploration' : ''}

RESPOND AS SARTHI TO ${displayName} LIKE YOUR CLOSEST BUDDY WHO REALLY CARES:`;
  }

  async createMoodSummary(emotionalHistory, language) {
    try {
      if (!emotionalHistory || emotionalHistory.length === 0) {
        return 'No previous check-ins available';
      }

      // Extract emotional patterns from history
      const emotionalEntries = emotionalHistory.map(entry => {
        const metadata = entry.metadata || {};
        return {
          response: metadata.response || metadata.summary || 'Previous check-in',
          domain: metadata.domain || 'general',
          timestamp: metadata.timestamp || 'recent',
          stressScore: metadata.stressScore || 0
        };
      });

      // Create summary prompt for GPT
      const summaryPrompt = `Analyze these emotional check-ins and create a brief, natural summary of the user's recent emotional patterns. Focus on overall trends and feelings.

Recent Check-ins:
${emotionalEntries.map(entry => `- ${entry.response} (${entry.domain} domain, stress: ${entry.stressScore}/10)`).join('\n')}

Create a 1-2 sentence summary that captures:
- Main emotional themes (stress, sadness, anxiety, positivity, etc.)
- Overall trend (improving, struggling, stable)
- Key areas of concern if any

Write it naturally, as if describing a friend's recent emotional state. Don't mention "check-ins" or "data".`;

      // Get GPT summary
      const summary = await this.callAzureGPT(summaryPrompt);
      return summary;
      
    } catch (error) {
      console.error('Error creating mood summary:', error);
      
      // Fallback to simple pattern detection
      if (emotionalHistory && emotionalHistory.length > 0) {
        const responses = emotionalHistory.map(entry => 
          entry.metadata?.response || entry.metadata?.summary || ''
        ).join(' ').toLowerCase();
        
        if (responses.includes('stress') || responses.includes('overwhelm')) {
          return 'Recently dealing with stress and feeling overwhelmed';
        } else if (responses.includes('sad') || responses.includes('down')) {
          return 'Going through some difficult emotional moments';
        } else if (responses.includes('anxious') || responses.includes('worry')) {
          return 'Experiencing some anxiety and worries';
        } else if (responses.includes('good') || responses.includes('positive')) {
          return 'Generally doing well with positive emotional state';
        }
      }
      
      return 'Mixed emotional patterns from recent experiences';
    }
  }

  buildCompanionPrompt({ userMessage, language, userContext, pastCheckins, stressPatterns, conversationHistory }) {
    const recentMessages = conversationHistory.slice(-6).map(msg => 
      `${msg.type === 'user' ? 'User' : 'Sarthi'}: ${msg.content}`
    ).join('\n');

    const pastCheckinsText = pastCheckins.length > 0 
      ? pastCheckins.map(checkin => `- ${checkin.metadata?.response || checkin.summary || checkin.content || 'Previous check-in'}`).join('\n')
      : 'No recent check-ins available';

    const stressPatternsText = stressPatterns.length > 0
      ? stressPatterns.map(pattern => `- ${pattern.summary || pattern.content}`).join('\n')
      : 'No similar patterns found';

    const stressTagsText = userContext.recentStressTags && userContext.recentStressTags.length > 0
      ? userContext.recentStressTags.join(', ')
      : 'No specific stress patterns identified';

    // Handle memory recall requests
    const isMemoryRecall = userMessage.toLowerCase().includes('remember') || 
                          userMessage.toLowerCase().includes('last time') || 
                          userMessage.toLowerCase().includes('before') ||
                          userMessage.toLowerCase().includes('previous');

    // Check if this is a conversation starter (first message)
    const isConversationStart = conversationHistory.length === 0 || 
                               conversationHistory.length === 1; // Only greeting message

    let languageInstructions = '';
    if (language === 'Hindi') {
      languageInstructions = 'Respond in friendly, fluent Hindi with human tone. Use warm, caring Hindi expressions and be naturally conversational. Start with "नमस्ते" for greetings.';
    } else if (language === 'Hinglish') {
      languageInstructions = 'Respond in a mix of Hindi and English like close friends talk casually. Use expressions like "yaar", "bas", "kya baat hai", "kaise ho", etc. Be warm and colloquial. Start with "Hi" for greetings.';
    } else {
      languageInstructions = 'Respond in professional, warm English. Be caring and supportive. Start with "Hi" for greetings.';
    }

    // Ensure we have a display name with fallback
    const displayName = userContext.userName || "friend";

    // Generate personalized opening message if this is a conversation start
    if (isConversationStart) {
      const openingMessage = this.generateOpeningMessage({
        userName: displayName,
        moodSummary: userContext.lastCheckinSummary,
        language: language
      });
      
      return `You are Sarthi – an emotionally intelligent AI companion. 

CONTEXT: This is the start of a new conversation. Use this personalized opening message as your response:

"${openingMessage}"

IMPORTANT: 
- Use this EXACT opening message as your response
- Don't add extra commentary or analysis
- Keep the warm, natural tone
- This message already includes the user's name and emotional context

LANGUAGE: ${language}
${languageInstructions}`;
    }

    return `You are Sarthi – a personalized AI emotional companion.

📌 Context:
You have access to the user's past check-ins, including:
- stress domains (e.g., Work, Personal, Identity)
- emotional tone (e.g., frustration, sadness, confusion)
- timestamps

🎯 Objective:
Use this past data to naturally bring up emotional trends and offer support like a deeply caring friend who remembers everything.

🧠 Behavior:
- If user had high stress in "Work" domain 2 times, gently mention it when conversation starts.
- Don't ask again about solved issues — adapt.
- Offer follow-up clarity, validation, or advice when asked.
- If user says "meri checkins dekh", start from the most emotionally intense one with care.

🌐 Language:
Continue in user's chosen language (${language}). Your tone must be **empathetic**, **natural**, and **non-robotic**.

✅ Personalize every reply with name, warmth, emotional awareness, and emotional memory.

🔹 Personalization Rule:
If the user's name is provided (userName = "${displayName}"), always greet them by name naturally in your very first message.
NEVER use "friend" or generic greetings like "Hi there" if name is known.
Only use "friend" if the name is not available.

DO NOT repeat data or quote check-in responses verbatim. Speak like a memory-driven friend.

ALWAYS use the name "${displayName}" in the first line naturally if provided.

You are a caring friend who really understands people. Show genuine care and understanding of their emotional journey.

User's name: ${displayName}
User's preferred language: ${language}
User just shared: "${userMessage}"

EMOTIONAL MEMORY & CONTEXT:
- Last check-in summary: ${userContext.lastCheckinSummary}
- Recent stress patterns: ${stressTagsText}
- Current mood: ${userContext.mood || 'Not specified'}
- Past conversations: ${recentMessages}

${isMemoryRecall ? `
MEMORY RECALL REQUEST DETECTED:
The user is asking about something from before. Reference their last check-in summary: "${userContext.lastCheckinSummary}" 
and stress patterns: "${stressTagsText}". Be specific about what you remember and use their name ${displayName} while recalling.
` : ''}

EXAMPLES BY LANGUAGE:
- English: "Hi ${displayName}! I've been thinking about how work has been weighing on you lately. How are you feeling today? 💙"
- Hindi: "नमस्ते ${displayName}! पिछली बार आपने काम के बारे में परेशानी बताई थी। आज कैसा लग रहा है? 😊"
- Hinglish: "Hi ${displayName}! Tumne last week bataya tha ki personal life thodi heavy chal rahi hai. Aaj uss baare mein kuch badla ya wohi chal raha hai? 🌟"

MEMORY-DRIVEN EXAMPLES:
- "Main tumhare liye hoon, jaise pehle bhi tha jab tumne Work domain mein overwhelm feel kiya tha."
- "I remember you mentioned feeling confused about your identity last time. Has that clarity come to you?"
- "Tumhara stress pattern dekh raha hun - work aur personal dono mein thoda heavy lag raha hai lately."

LANGUAGE INSTRUCTIONS:
${languageInstructions}

ALWAYS use the name in the first line naturally if provided. Make them feel emotionally seen and cared for.

RESPONSE STYLE:
- Always use their name "${displayName}" in your response naturally
- Sound like a loyal, caring friend who remembers their struggles
- Show emotional connection and empathy
- Use soft, human tone — never robotic
- Reference their past experiences when relevant
- Keep responses under 150 words
- Add gentle wisdom like a caring friend would give

EMOTIONAL VALIDATION:
- Acknowledge their feelings with empathy
- Show you remember their journey
- Offer gentle, practical guidance
- Use warm, caring language

Respond now as Sarthi to ${displayName}:`;
  }

  async callAzureGPT(prompt) {
    try {
      const endpoint = AZURE_CONFIG.OPENAI_ENDPOINT;
      const apiKey = AZURE_CONFIG.OPENAI_KEY;
      const deploymentName = AZURE_CONFIG.OPENAI_DEPLOYMENT_NAME;
      const apiVersion = AZURE_CONFIG.OPENAI_API_VERSION;

      const url = `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 200,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`Azure API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error calling Azure GPT:', error);
      throw error;
    }
  }

  detectCrisisIntervention(userMessage, aiResponse) {
    const crisisKeywords = [
      'suicide', 'suicidal', 'kill myself', 'end my life', 'self harm', 'self-harm',
      'hurt myself', 'want to die', 'death', 'overdose', 'cutting', 'hopeless',
      'no point', 'give up', 'can\'t go on', 'nobody cares', 'worthless',
      'मरना', 'आत्महत्या', 'जान देना', 'मर जाना'
    ];

    const text = (userMessage + ' ' + aiResponse).toLowerCase();
    return crisisKeywords.some(keyword => text.includes(keyword.toLowerCase()));
  }

  determineEmotion(response, crisisDetected) {
    if (crisisDetected) return 'concerned';
    
    const emotionKeywords = {
      'calm': ['breathe', 'relax', 'peace', 'gentle', 'slowly'],
      'supportive': ['understand', 'here for you', 'support', 'care'],
      'encouraging': ['you can', 'believe', 'strong', 'capable', 'progress'],
      'validating': ['valid', 'normal', 'okay to feel', 'makes sense']
    };

    const lowerResponse = response.toLowerCase();
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(keyword => lowerResponse.includes(keyword))) {
        return emotion;
      }
    }

    return 'supportive';
  }

  /**
   * Reset session memory for a user
   * @param {string} userId - User ID to reset memory for
   */
  resetSessionMemory(userId) {
    try {
      console.log(`🧹 ChatEngine: Resetting session memory for user ${userId}`);
      this.agenticAI.resetSessionMemory(userId);
    } catch (error) {
      console.error('❌ Error in ChatEngine resetSessionMemory:', error);
    }
  }

  /**
   * Reset persona state to default "Sarthi" friendly guide
   * @param {string} userId - User ID to reset persona for
   */
  resetPersonaState(userId) {
    try {
      console.log(`🔄 ChatEngine: Resetting persona state for user ${userId}`);
      this.agenticAI.resetPersonaState(userId);
    } catch (error) {
      console.error('❌ Error in ChatEngine resetPersonaState:', error);
    }
  }

  /**
   * Complete session reset - clears memory and resets persona
   * @param {string} userId - User ID to reset
   */
  resetSession(userId) {
    try {
      console.log(`🔄 ChatEngine: Performing complete session reset for user ${userId}`);
      this.agenticAI.resetSession(userId);
    } catch (error) {
      console.error('❌ Error in ChatEngine resetSession:', error);
    }
  }
}