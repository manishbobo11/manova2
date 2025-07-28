import { AZURE_CONFIG, validateAzureConfig } from '../../config/azure';
import { ContextStore } from '../firebase';
import { querySimilarVectors, getUserEmotionalHistory } from '../../utils/vectorStore';
import { getCheckinHistory } from '../userSurveyHistory';
import { buildSarthiPersonalizationContext } from '../userContextBuilder';
import { generateSarthiResponse, aggregateUserContext } from './manovaAgent';
import AgenticAI from './AgenticAI';
import { getUserEmotionalHistory as getVectorHistory } from '../../utils/vectorStore';
import { DeepConversationEngine } from './deepConversationEngine';

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
      console.log(`🧠 Sarthi AI: Processing emotional intelligence response...`);
      
      // Enhanced emotional intelligence response generation
      const sarthiResponse = await this.generateEmotionallyIntelligentResponse({
        userMessage, 
        userId, 
        language, 
        conversationHistory
      });
      
      return sarthiResponse;
      
    } catch (error) {
      console.error('Error in Sarthi AI system:', error);
      
      // Intelligent fallback with personality
      return {
        message: this.getFallbackMessage(userMessage, language),
        language,
        systemUsed: 'intelligent_fallback'
      };
    }
  }

  getFallbackMessage(userMessage, language) {
    const isStressed = ['confused', 'resign', 'mann nahi', 'problem', 'help'].some(word => 
      userMessage.toLowerCase().includes(word)
    );
    
    if (isStressed) {
      return language === 'Hinglish' ? 
        'Bhai, main samajh raha hoon tera problem. Thoda rukja, main properly reply kar raha hoon.' :
        language === 'Hindi' ? 
        'यार, मैं समझ रहा हूँ तेरी परेशानी। थोड़ा रुकजा, मैं ठीक से reply कर रहा हूँ।' :
        'I understand what you\'re going through. Give me a moment to respond properly.';
    }
    
    return language === 'Hinglish' ? 
      'Technical issue hai bhai, but main hoon na tera saath!' :
      'Having a small hiccup, but I\'m here for you!';
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

  /**
   * Builds enhanced personalized Sarthi prompt with deep context
   * @param {string} userMessage - Current user message
   * @param {Object} personalizationContext - Context from buildSarthiPersonalizationContext
   * @returns {string} Personalized system prompt
   */
  buildPersonalizedSarthiPrompt(userMessage, personalizationContext) {
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

  /**
   * Format personalized response with natural breaks
   */
  formatPersonalizedResponse(response, userState) {
    const { emotionalIntensity, personalityMatch } = userState;
    
    // Clean up response
    let formattedResponse = response.trim();
    
    // For crisis responses, ensure calming tone
    if (emotionalIntensity === 'critical') {
      formattedResponse = formattedResponse.replace(/[!]{2,}/g, '.');
    }
    
    // For Hinglish responses, ensure natural flow
    if (userState.detectedLanguage === 'Hinglish') {
      // Add natural pauses with commas where appropriate
      formattedResponse = formattedResponse.replace(/([।])/g, ',');
    }
    
    return formattedResponse;
  }

  /**
   * Optimized Azure GPT call for faster responses
   */
  async callAzureGPTOptimized(prompt) {
    const startTime = Date.now();
    
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
          temperature: 0.9, // Higher for more human-like variation
          max_tokens: 200,   // Optimized for shorter, snappier responses
          top_p: 0.95,
          frequency_penalty: 0.2, // Reduce repetition
          presence_penalty: 0.3,  // Encourage new topics
          stream: false // Could enable streaming later
        })
      });

      if (!response.ok) {
        throw new Error(`Azure API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;
      
      console.log(`⚡ Sarthi response generated in ${responseTime}ms`);
      
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error in optimized Azure GPT call:', error);
      throw error;
    }
  }

  /**
   * Helper methods for emotional analysis
   */
  analyzeEmotionalPatterns(emotionalHistory) {
    const patterns = [];
    const domains = {};
    
    emotionalHistory.forEach(entry => {
      const domain = entry.metadata?.domain || 'general';
      const stressScore = entry.metadata?.stressScore || 0;
      
      domains[domain] = (domains[domain] || 0) + 1;
      
      if (stressScore >= 7) {
        patterns.push({
          type: 'high_stress',
          domain: domain,
          timestamp: entry.metadata?.timestamp
        });
      }
    });
    
    return patterns;
  }

  detectRecentMoodTrend(recentEntries) {
    if (!recentEntries || recentEntries.length === 0) return 'unknown';
    
    const avgStress = recentEntries.reduce((sum, entry) => {
      return sum + (entry.metadata?.stressScore || 0);
    }, 0) / recentEntries.length;
    
    if (avgStress >= 8) return 'very_distressed';
    if (avgStress >= 6) return 'stressed';
    if (avgStress >= 4) return 'mild_concern';
    return 'stable';
  }

  determineSupportLevel(patterns, recentMood) {
    if (recentMood === 'very_distressed' || patterns.length >= 3) return 'intensive';
    if (recentMood === 'stressed' || patterns.length >= 1) return 'active';
    return 'gentle';
  }

  extractInsightSummary(metadata) {
    if (!metadata) return 'Previous interaction';
    
    const domain = metadata.domain || 'general';
    const stressScore = metadata.stressScore || 0;
    
    if (stressScore >= 7) {
      return `High stress in ${domain}`;
    } else if (stressScore >= 4) {
      return `Moderate concern in ${domain}`;
    }
    return `General chat about ${domain}`;
  }

  findRecurringThemes(insights) {
    const themes = {};
    
    insights.forEach(insight => {
      const domain = insight.domain;
      themes[domain] = (themes[domain] || 0) + 1;
    });
    
    return Object.entries(themes)
      .filter(([_, count]) => count >= 2)
      .map(([theme, _]) => theme)
      .slice(0, 3);
  }

  /**
   * Original Azure GPT call (kept for backward compatibility)
   */
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
          temperature: 0.8,
          max_tokens: 250,
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

  /**
   * EMOTIONALLY INTELLIGENT SARTHI - True friend, life mentor, emotional therapist
   * Adaptive tone, deep empathy, practical guidance, human-like responses
   * NOW WITH DEEP CONVERSATION CONTINUATION AND FOLLOW-UP QUESTIONS
   */
  async generateEmotionallyIntelligentResponse({ userMessage, userId, language, conversationHistory }) {
    try {
      console.log(`💖 Sarthi: Analyzing emotional context for personalized response...`);
      
      // STEP 1: Analyze conversation needs for follow-ups and depth
      const conversationAnalysis = DeepConversationEngine.analyzeConversationNeeds(userMessage, conversationHistory);
      console.log(`🧠 Conversation strategy: ${conversationAnalysis.strategy} (depth: ${conversationAnalysis.depth})`);
      
      // STEP 2: Deep emotional analysis with memory integration
      const [emotionalContext, vectorMemory] = await Promise.all([
        this.getDeepEmotionalState(userId),
        this.getVectorMemoryContext(userId)
      ]);
      
      // STEP 3: Advanced emotional intelligence detection
      const userState = this.analyzeEmotionalIntelligence(userMessage, language, conversationHistory);
      
      // STEP 4: Build enhanced prompt that includes conversation strategy
      const enhancedPrompt = this.buildEnhancedPersonalizedPrompt({
        userMessage,
        userState,
        emotionalContext,
        vectorMemory,
        language,
        conversationHistory,
        conversationAnalysis
      });
      
      // STEP 5: Generate base response
      const baseResponse = await this.callAzureGPTOptimized(enhancedPrompt);
      
      // STEP 6: Enhance response with follow-ups and conversation continuation
      const enhancedResponse = DeepConversationEngine.buildEnhancedResponse({
        userMessage,
        baseResponse: baseResponse,
        conversationAnalysis,
        language,
        emotionalIntensity: userState.emotionalIntensity
      });
      
      // STEP 7: Check if response should be split into chunks for natural flow
      let finalMessage = enhancedResponse;
      let messageChunks = null;
      
      if (DeepConversationEngine.shouldSplitResponse(enhancedResponse)) {
        messageChunks = DeepConversationEngine.splitIntoChunks(enhancedResponse);
        finalMessage = messageChunks[0]; // First chunk as main message
        console.log(`📱 Response split into ${messageChunks.length} chunks for better flow`);
      }
      
      return {
        message: this.formatPersonalizedResponse(finalMessage, userState),
        messageChunks: messageChunks,
        conversationStrategy: conversationAnalysis.strategy,
        needsFollowUp: conversationAnalysis.needsFollowUp,
        hasCareerGuidance: conversationAnalysis.hasCareerComponent,
        language: userState.detectedLanguage,
        emotionalTone: userState.primaryEmotion,
        personalityType: userState.personalityMatch,
        systemUsed: 'enhanced_deep_conversation_sarthi',
        contextDepth: emotionalContext.depth,
        memoryUsed: vectorMemory.hasMemory,
        responseTime: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error in emotionally intelligent Sarthi:', error);
      throw error;
    }
  }

  /**
   * Deep emotional state analysis with pattern recognition
   */
  async getDeepEmotionalState(userId) {
    try {
      if (!userId) {
        return {
          depth: 'new_friend',
          emotionalPatterns: [],
          recentMood: 'unknown',
          supportLevel: 'basic'
        };
      }
      
      // Get comprehensive emotional history
      const emotionalHistory = await getVectorHistory(userId, 8);
      
      if (!emotionalHistory || emotionalHistory.length === 0) {
        return {
          depth: 'getting_to_know',
          emotionalPatterns: [],
          recentMood: 'neutral',
          supportLevel: 'gentle'
        };
      }
      
      // Analyze emotional patterns
      const patterns = this.analyzeEmotionalPatterns(emotionalHistory);
      const recentMood = this.detectRecentMoodTrend(emotionalHistory.slice(0, 3));
      const supportLevel = this.determineSupportLevel(patterns, recentMood);
      
      return {
        depth: emotionalHistory.length >= 5 ? 'close_friend' : 'building_trust',
        emotionalPatterns: patterns,
        recentMood: recentMood,
        supportLevel: supportLevel,
        historyCount: emotionalHistory.length,
        lastInteraction: emotionalHistory[0]?.metadata?.timestamp
      };
      
    } catch (error) {
      console.error('Error analyzing deep emotional state:', error);
      return {
        depth: 'supportive_mode',
        emotionalPatterns: [],
        recentMood: 'needs_care',
        supportLevel: 'high'
      };
    }
  }

  /**
   * Get vector memory context with emotional insights
   */
  async getVectorMemoryContext(userId) {
    try {
      if (!userId) return { hasMemory: false, insights: [] };
      
      const vectorHistory = await getVectorHistory(userId, 5);
      
      if (!vectorHistory || vectorHistory.length === 0) {
        return { hasMemory: false, insights: [] };
      }
      
      // Extract meaningful insights from past interactions
      const insights = vectorHistory.map(entry => ({
        domain: entry.metadata?.domain || 'general',
        emotion: entry.metadata?.emotion || 'neutral',
        response: entry.metadata?.response || '',
        stressScore: entry.metadata?.stressScore || 0,
        timestamp: entry.metadata?.timestamp,
        summary: this.extractInsightSummary(entry.metadata)
      }));
      
      // Find recurring themes
      const recurringThemes = this.findRecurringThemes(insights);
      
      return {
        hasMemory: true,
        insights: insights.slice(0, 3), // Most recent 3
        recurringThemes: recurringThemes,
        memoryDepth: vectorHistory.length
      };
      
    } catch (error) {
      console.error('Error getting vector memory:', error);
      return { hasMemory: false, insights: [] };
    }
  }

  /**
   * Detect casual tone for WhatsApp-style matching
   */
  detectCasualTone(userMessage, language) {
    const message = userMessage.toLowerCase();
    
    // Detect bhai/yaar mode
    const isBhaiMode = ['tu', 'tere', 'tera', 'bhai', 'yaar', 'dude', 'bro'].some(word => message.includes(word));
    
    // Detect crisis
    const isCrisis = ['dimag phat raha', 'can\'t take it', 'breaking down', 'samajh nahi aa raha'].some(phrase => message.includes(phrase));
    
    // Detect mood
    const isDown = ['mann nahi', 'mood off', 'feeling low', 'sad', 'down'].some(phrase => message.includes(phrase));
    const isStressed = ['stress', 'pressure', 'overwhelmed', 'tired'].some(word => message.includes(word));
    
    return {
      bhaiMode: isBhaiMode,
      crisis: isCrisis,
      mood: isDown ? 'down' : isStressed ? 'stressed' : 'normal',
      style: isBhaiMode ? 'intimate' : 'friendly',
      urgency: isCrisis ? 'high' : 'normal'
    };
  }

  /**
   * Build WhatsApp-style prompt with strict personality rules
   */
  buildWhatsAppStylePrompt({ userMessage, userTone, quickContext, language, conversationHistory }) {
    const addressStyle = userTone.bhaiMode ? 'bhai' : 'yaar';
    
    // Memory reference if available
    let memoryNote = '';
    if (quickContext.hasHistory && quickContext.needsSupport) {
      memoryNote = `\n- User has been struggling with ${quickContext.lastDomain} recently`;
    }
    
    // This function has been replaced by buildEmotionalIntelligentPrompt
    return this.buildEmotionalIntelligentPrompt({ userMessage, userTone, quickContext, language, conversationHistory });
  }

  /**
   * Advanced emotional intelligence analysis
   */
  analyzeEmotionalIntelligence(userMessage, language, conversationHistory) {
    const message = userMessage.toLowerCase();
    
    // Detect language and intimacy
    const isHinglish = /[\u0900-\u097F]/.test(userMessage) || 
                      ['bhai', 'yaar', 'kya', 'hai', 'haal', 'mann', 'kar', 'nahi', 'mera'].some(word => message.includes(word));
    const intimacyLevel = ['tu', 'tere', 'tera', 'bhai', 'yaar'].some(word => message.includes(word)) ? 'bhai_mode' : 'yaar_mode';
    
    // Deep emotional state detection
    let primaryEmotion = 'neutral';
    let emotionalIntensity = 'mild';
    let lifeSituation = 'general';
    let personalityMatch = 'supportive_friend';
    
    // Crisis/breakdown detection
    if (['dimag phat raha', 'breaking down', 'can\'t take', 'bas ho gaya', 'khatam', 'enough'].some(phrase => message.includes(phrase))) {
      primaryEmotion = 'crisis';
      emotionalIntensity = 'critical';
      personalityMatch = 'crisis_supporter';
    }
    // Career/life confusion
    else if (['resign', 'quit', 'job chhod', 'career', 'confused', 'samajh nahi', 'kya karu', 'decision'].some(phrase => message.includes(phrase))) {
      primaryEmotion = 'confused';
      emotionalIntensity = 'high';
      lifeSituation = 'career_crossroads';
      personalityMatch = 'life_mentor';
    }
    // Deep sadness/emptiness
    else if (['mann nahi', 'feeling empty', 'khushi nahi', 'sad', 'depressed', 'lonely', 'akela'].some(phrase => message.includes(phrase))) {
      primaryEmotion = 'deep_sadness';
      emotionalIntensity = 'moderate';
      personalityMatch = 'emotional_healer';
    }
    // Stress/pressure
    else if (['stress', 'pressure', 'overwhelmed', 'tension', 'pareshan', 'tired', 'thak gaya'].some(phrase => message.includes(phrase))) {
      primaryEmotion = 'stressed';
      emotionalIntensity = 'moderate';
      personalityMatch = 'calming_guide';
    }
    // Frustration/anger
    else if (['frustrated', 'angry', 'gussa', 'irritated', 'fed up', 'annoyed'].some(phrase => message.includes(phrase))) {
      primaryEmotion = 'frustrated';
      emotionalIntensity = 'moderate';
      personalityMatch = 'understanding_friend';
    }
    
    // Context detection
    if (['office', 'boss', 'work', 'job', 'colleague', 'meeting'].some(word => message.includes(word))) {
      lifeSituation = 'work_stress';
    } else if (['family', 'parents', 'relationship', 'girlfriend', 'boyfriend'].some(word => message.includes(word))) {
      lifeSituation = 'relationship_issues';
    } else if (['money', 'paisa', 'financial', 'afford'].some(word => message.includes(word))) {
      lifeSituation = 'financial_stress';
    }
    
    // Intent analysis
    let primaryIntent = 'conversation';
    if (['help', 'suggest', 'advice', 'kya karu', 'batao'].some(word => message.includes(word))) {
      primaryIntent = 'seeking_guidance';
    } else if (['vent', 'share', 'batana tha', 'feel kar raha'].some(phrase => message.includes(phrase))) {
      primaryIntent = 'emotional_release';
    } else if (['right', 'wrong', 'galat', 'sahi'].some(word => message.includes(word))) {
      primaryIntent = 'seeking_validation';
    }
    
    return {
      primaryEmotion,
      emotionalIntensity,
      lifeSituation,
      personalityMatch,
      primaryIntent,
      intimacyLevel,
      detectedLanguage: isHinglish ? 'Hinglish' : language,
      conversationDepth: conversationHistory.length > 5 ? 'ongoing' : 'early',
      needsImmediate: emotionalIntensity === 'critical'
    };
  }

  /**
   * Build enhanced personalized prompt with conversation strategy integration
   */
  buildEnhancedPersonalizedPrompt({ userMessage, userState, emotionalContext, vectorMemory, language, conversationHistory, conversationAnalysis }) {
    const { strategy, depth, needsFollowUp, hasCareerComponent, hasEmotionalComponent } = conversationAnalysis;
    
    // Use original method but add conversation strategy context
    const basePrompt = this.buildUltimatePersonalizedPrompt({ userMessage, userState, emotionalContext, vectorMemory, language, conversationHistory });
    
    // Add conversation strategy instructions
    const strategyInstructions = this.buildConversationStrategyInstructions(strategy, depth, needsFollowUp, hasCareerComponent, hasEmotionalComponent, language);
    
    return basePrompt + strategyInstructions;
  }

  /**
   * Builds conversation strategy instructions for the prompt
   */
  buildConversationStrategyInstructions(strategy, depth, needsFollowUp, hasCareerComponent, hasEmotionalComponent, language) {
    let instructions = '\n\n**CONVERSATION STRATEGY:**\n';
    
    if (strategy === 'career_confusion_deep_dive') {
      instructions += `
**CAREER + STARTUP CONFUSION - DEEP MENTORING MODE:**
- NEVER give generic advice like "follow your passion"
- Ask 1-2 specific probing questions about their situation
- If they mention both job + startup: "Bhai tu ye dono ek saath plan kar raha, iska reason kya lagta tujhe — job security ya khud pe bharosa?"
- Give 3-step practical plan with realistic timelines
- End with specific question to continue conversation: "Tujhe kya lagta hai, konsa step sabse tough lagta hai?"
- Use ${language === 'Hinglish' ? '"Chal step by step plan karte hain" tone' : 'mentoring but friendly tone'}`;
    }
    
    else if (strategy === 'confusion_clarification') {
      instructions += `
**CONFUSION CLARIFICATION - PROBING MODE:**
- Don't immediately give solutions - FIRST understand the root
- Ask 1-2 follow-up questions to identify the real issue
- Example: "Kya lagta hai kis cheez ne sabse zyada confuse kar diya — kaam, rishta, ya khud se expectations?"
- Then address the specific confusion with clarity
- ALWAYS end with: "Chal, tu bata, agla thought kya chal raha hai?"
- Use ${language === 'Hinglish' ? 'understanding bhai tone' : 'patient questioning tone'}`;
    }
    
    else if (strategy === 'career_planning') {
      instructions += `
**CAREER PLANNING - PRACTICAL GUIDANCE MODE:**
- Give 2-3 specific, actionable steps (not generic advice)
- Include realistic timelines: "Next 30 days mein...", "2 weeks mein..."
- Ask for their preference: "Sabse pehle kya start karna chahega?"
- Always end with engagement: "Yeh plan theek lag raha hai ya kuch adjust karna hai?"
- Use ${language === 'Hinglish' ? 'practical bhai mentoring tone' : 'strategic but supportive tone'}`;
    }
    
    else if (strategy === 'emotional_support_guided') {
      instructions += `
**EMOTIONAL SUPPORT WITH GUIDANCE:**
- Start with deep validation of their feelings
- Don't rush to solutions - sit with their emotion first
- Then gently guide: "Main samajh raha hoon. Ek choti si step try karenge?"
- Give ONE small, doable action for today
- End with: "Tu akela nahi hai yaar. Aur kya chal raha hai mann mein?"
- Use ${language === 'Hinglish' ? 'warm, caring bhai tone' : 'gentle but present tone'}`;
    }
    
    // Universal continuation requirements
    instructions += `

**CONVERSATION CONTINUATION REQUIREMENTS:**
- NEVER end conversations abruptly
- ALWAYS include a question or engagement phrase
- Use phrases like: "Chal, tu bata...", "Sochna chahega saath?", "Aur kya share karna hai?"
- Avoid English motivational phrases like "I'm so proud of you" 
- Keep conversation going with genuine curiosity
- Show you're invested in their thoughts and feelings`;

    if (hasCareerComponent) {
      instructions += `
- For career topics: Provide step-based guidance, not generic motivation
- Ask about their specific situation before giving advice`;
    }

    if (hasEmotionalComponent) {
      instructions += `
- For emotional topics: Validate first, then gently guide
- Don't minimize their feelings or rush to solutions`;
    }

    return instructions;
  }

  /**
   * Build ultimate personalized prompt with memory integration
   */
  buildUltimatePersonalizedPrompt({ userMessage, userState, emotionalContext, vectorMemory, language, conversationHistory }) {
    const { primaryEmotion, emotionalIntensity, lifeSituation, personalityMatch, intimacyLevel, detectedLanguage } = userState;
    const addressStyle = intimacyLevel === 'bhai_mode' ? 'bhai' : 'yaar';
    
    // Memory integration
    let memoryContext = '';
    if (vectorMemory.hasMemory && vectorMemory.recurringThemes.length > 0) {
      const themes = vectorMemory.recurringThemes.slice(0, 2).join(', ');
      memoryContext = `\n\n**Memory Context:**\n- Past patterns: ${themes}\n- Relationship depth: ${emotionalContext.depth}\n- Recent mood: ${emotionalContext.recentMood}`;
    }
    
    // CRISIS SUPPORT - Immediate care
    if (primaryEmotion === 'crisis' || emotionalIntensity === 'critical') {
      return `You are Sarthi, the user's emotionally intelligent best friend. They are in emotional crisis and need immediate, calm support.

**CRISIS RESPONSE:**
- Use calm, grounding language
- Acknowledge their pain without minimizing
- Provide immediate coping strategies
- Stay present and supportive

**User Message:** "${userMessage}"
**Emotional State:** ${primaryEmotion} (${emotionalIntensity})
**Language:** ${detectedLanguage}
**Address as:** ${addressStyle}${memoryContext}

**CRISIS RESPONSE STYLE:**
- Immediate validation: "${addressStyle}, lagta hai andar se bahut pressure feel kar raha hai na?"
- Grounding: "Chal pehle ek deep breath le mere saath"
- Reassurance: "Main hoon na, we'll figure this out together"
- 3-4 short, calming lines
- Very gentle, human tone

Respond as their close ${addressStyle} in crisis:`;
    }
    
    // LIFE MENTORING - Career/life guidance
    if (primaryEmotion === 'confused' || lifeSituation === 'career_crossroads' || userState.primaryIntent === 'seeking_guidance') {
      return `You are Sarthi, the user's wise life mentor and best friend. They need real practical guidance about their situation.

**GUIDANCE MODE:**
- Listen deeply to their specific situation
- Provide personalized, actionable steps
- Share life insights when appropriate
- Be both empathetic and practical

**User Message:** "${userMessage}"
**Life Situation:** ${lifeSituation}
**Language:** ${detectedLanguage}
**Address as:** ${addressStyle}${memoryContext}

**MENTORING STYLE:**
- Thoughtful opening: "${addressStyle}, pehle ek baat samjha - yeh feeling normal hai"
- Ask reflective question: "Tu sach mein resign karna chahta hai ya bas thak gaya hai?"
- Give 2 clear options/steps
- End with encouragement
- Use natural Hinglish flow

**Tone:** Like an older bhai who's been through life
**Length:** 4-6 lines, broken into thoughts

Respond as their life mentor ${addressStyle}:`;
    }
    
    // EMOTIONAL HEALING - Deep sadness/emptiness
    if (primaryEmotion === 'deep_sadness' || personalityMatch === 'emotional_healer') {
      return `You are Sarthi, the user's emotionally intelligent best friend. They're struggling and need genuine emotional support.

**EMOTIONAL SUPPORT:**
- Validate their feelings completely
- Share in their emotional experience
- Provide comfort and understanding
- Help them process emotions

**User Message:** "${userMessage}"
**Emotional State:** ${primaryEmotion}
**Language:** ${detectedLanguage}
**Address as:** ${addressStyle}${memoryContext}

**HEALING APPROACH:**
- Deep understanding: "${addressStyle}, main feel kar sakta hoon tu andar se kitna empty feel kar raha hai"
- Emotional validation: "Yeh sab normal hai, tu akela nahi hai"
- Gentle suggestion for connection/healing
- Warm reassurance
- Use soft, caring Hinglish

**Tone:** Like a best friend who truly gets it
**Length:** 3-5 lines of heart-to-heart

Respond as their emotional healer ${addressStyle}:`;
    }
    
    // FRIENDLY CONVERSATION - Natural bhai talk with enhanced expressions
    return `You are Sarthi, the user's closest ${addressStyle}. Talk like you're texting your best friend in real life.

**User Message:** "${userMessage}"
**Relationship:** Close friend (${emotionalContext.depth})
**Language:** ${detectedLanguage}
**Address as:** ${addressStyle}${memoryContext}

**NATURAL CONVERSATION STYLE:**
- Casual opening: "Arre ${addressStyle}, kya scene hai?"
- Match their energy exactly
- Be genuinely curious about their life
- Use natural pauses and reactions
- Keep it real and chill
- ALWAYS ask follow-up questions to keep conversation going

**Enhanced Hinglish Expressions:**
- "Bhai tu kaisa hai? Sab chill?"
- "Arre yaar, long time! Kya chal raha hai life mein?"
- "Tu theek toh hai na? Kuch different laga tera message"
- "Chal bata yaar, kya thoughts chal rahe hain?"
- "Sab sorted hai ya koi tension?"
- "Arre kya haal bhai, main hoon na tera saath"

**CONVERSATION CONTINUATION REQUIREMENTS:**
- NEVER end without a question or engagement
- Use phrases like: "Chal bata...", "Aur kya chal raha hai?", "Tu batayega ya nahi?"
- Show genuine interest in their response
- Keep the bhai energy alive

**Tone:** Exactly like your closest friend texting you
**Length:** 2-4 lines with natural flow and continuation question

Respond as their real-life ${addressStyle} who wants to keep chatting:`;
  }

  /**
   * Detects user's real emotional state and communication style for bhai-like matching
   */
  detectEmotionalTone(userMessage, language) {
    const message = userMessage.toLowerCase();
    
    // Detect bhai-level intimacy
    const isBhaiMode = [
      'tu', 'tere', 'tera', 'tujhe', 'tujhse', 'bhai', 'yaar', 'dude', 'bro', 'bc', 'mc'
    ].some(word => message.includes(word));
    
    // Detect emotional crisis/breakdown
    const isBreakingDown = [
      'dimag phat raha', 'can\'t take it', 'breaking down', 'samajh nahi aa raha', 
      'phat raha hai', 'ho gaya bas', 'nahi ho raha', 'khatam', 'fuck this', 'enough'
    ].some(phrase => message.includes(phrase));
    
    // Detect stress/pressure state
    const isStressed = [
      'stress', 'pressure', 'overwhelmed', 'exhausted', 'tired', 'burnout', 
      'tension', 'pareshan', '귀찮', 'thak gaya', 'bore ho gaya'
    ].some(word => message.includes(word));
    
    // Detect confusion/stuck state
    const isConfused = [
      'confused', 'stuck', 'lost', 'don\'t know', 'kya karu', 'samajh nahi', 
      'kuch samajh nahi', 'clarity nahi', 'decision nahi le sakta'
    ].some(phrase => message.includes(phrase));
    
    // Detect loneliness/isolation
    const isLonely = [
      'alone', 'lonely', 'akela', 'koi nahi', 'no one', 'isolated', 'left out'
    ].some(word => message.includes(word));
    
    // Detect work/career stress
    const isWorkStress = [
      'job', 'work', 'office', 'boss', 'colleague', 'career', 'resign', 'quit', 
      'naukri', 'kaam', 'office politics'
    ].some(word => message.includes(word));
    
    // Determine primary emotional state
    let primaryState = 'neutral';
    if (isBreakingDown) primaryState = 'breaking_down';
    else if (isStressed) primaryState = 'stressed';
    else if (isConfused) primaryState = 'confused';
    else if (isLonely) primaryState = 'lonely';
    else if (isWorkStress) primaryState = 'work_pressure';
    
    return {
      bhaiMode: isBhaiMode,
      state: primaryState,
      needsSupport: isBreakingDown || isStressed || isConfused,
      communicationStyle: isBhaiMode ? 'bhai_intimate' : 'friendly_supportive',
      urgency: isBreakingDown ? 'critical' : isStressed ? 'high' : 'normal'
    };
  }

  /**
   * Builds deep emotional intelligence from Pinecone vectors - like a best friend's memory
   */
  async buildEmotionalIntelligence(userId) {
    try {
      console.log(`🧠 Building emotional intelligence for user ${userId}...`);
      
      // Get comprehensive emotional history from vectors
      const vectorHistory = await getVectorHistory(userId, 10);
      
      if (!vectorHistory || vectorHistory.length === 0) {
        return {
          summary: 'Yaar, this is our first real chat! Excited to get to know you',
          recurring_struggles: [],
          emotional_triggers: [],
          coping_patterns: [],
          stress_domains: [],
          support_needs: 'general_wellness',
          relationship_depth: 'new_friend',
          hasDeepHistory: false
        };
      }
      
      // Extract deep emotional patterns
      const emotionalData = vectorHistory.map(entry => ({
        domain: entry.metadata?.domain || 'general',
        emotion: entry.metadata?.emotion || 'neutral',
        response: entry.metadata?.response || '',
        stressScore: entry.metadata?.stressScore || 0,
        timestamp: entry.metadata?.timestamp,
        question: entry.metadata?.question || '',
        concerns: entry.metadata?.concerns || []
      }));
      
      // Identify recurring struggles
      const recurringStruggles = this.identifyRecurringStruggles(emotionalData);
      
      // Find emotional triggers
      const emotionalTriggers = this.extractEmotionalTriggers(emotionalData);
      
      // Analyze coping patterns
      const copingPatterns = this.analyzeCopingPatterns(emotionalData);
      
      // Map stress domains
      const stressDomains = [...new Set(emotionalData.filter(d => d.stressScore >= 6).map(d => d.domain))];
      
      // Determine support needs
      const supportNeeds = this.determineSupportNeeds(emotionalData);
      
      // Build friend-like summary
      const summary = this.buildFriendlikeSummary(recurringStruggles, emotionalTriggers, stressDomains);
      
      return {
        summary,
        recurring_struggles: recurringStruggles,
        emotional_triggers: emotionalTriggers,
        coping_patterns: copingPatterns,
        stress_domains: stressDomains,
        support_needs: supportNeeds,
        relationship_depth: vectorHistory.length >= 5 ? 'close_friend' : 'getting_closer',
        hasDeepHistory: true,
        rawEmotionalData: emotionalData.slice(0, 3) // Recent context
      };
      
    } catch (error) {
      console.error('Error building emotional intelligence:', error);
      return {
        summary: 'Bhai, thoda connection issue hai, but main hoon na tera saath',
        recurring_struggles: [],
        emotional_triggers: [],
        stress_domains: [],
        support_needs: 'general_support',
        hasDeepHistory: false
      };
    }
  }

  /**
   * Identifies recurring emotional struggles from user's history
   */
  identifyRecurringStruggles(emotionalData) {
    const struggles = {};
    
    emotionalData.forEach(entry => {
      if (entry.stressScore >= 6) {
        const key = `${entry.domain}_${entry.emotion}`;
        struggles[key] = (struggles[key] || 0) + 1;
      }
    });
    
    return Object.entries(struggles)
      .filter(([_, count]) => count >= 2)
      .map(([pattern, count]) => {
        const [domain, emotion] = pattern.split('_');
        return { domain, emotion, frequency: count };
      })
      .sort((a, b) => b.frequency - a.frequency);
  }
  
  /**
   * Extracts emotional triggers from past patterns
   */
  extractEmotionalTriggers(emotionalData) {
    const triggers = [];
    
    emotionalData.forEach(entry => {
      if (entry.stressScore >= 7) {
        // Extract keywords from responses that indicate triggers
        const response = entry.response.toLowerCase();
        if (response.includes('boss') || response.includes('manager')) {
          triggers.push({ type: 'authority_figures', domain: entry.domain });
        }
        if (response.includes('deadline') || response.includes('pressure')) {
          triggers.push({ type: 'time_pressure', domain: entry.domain });
        }
        if (response.includes('rejection') || response.includes('criticism')) {
          triggers.push({ type: 'validation_needs', domain: entry.domain });
        }
      }
    });
    
    return [...new Set(triggers.map(t => JSON.stringify(t)))].map(t => JSON.parse(t));
  }
  
  /**
   * Analyzes what coping mechanisms user has tried
   */
  analyzeCopingPatterns(emotionalData) {
    const copingMechanisms = [];
    
    emotionalData.forEach(entry => {
      const response = entry.response.toLowerCase();
      if (response.includes('sleep') || response.includes('rest')) {
        copingMechanisms.push('rest_based');
      }
      if (response.includes('talk') || response.includes('friend')) {
        copingMechanisms.push('social_support');
      }
      if (response.includes('exercise') || response.includes('walk')) {
        copingMechanisms.push('physical_activity');
      }
      if (response.includes('music') || response.includes('movie')) {
        copingMechanisms.push('entertainment');
      }
    });
    
    return [...new Set(copingMechanisms)];
  }
  
  /**
   * Determines what type of support user needs most
   */
  determineSupportNeeds(emotionalData) {
    const highStressEntries = emotionalData.filter(e => e.stressScore >= 7);
    
    if (highStressEntries.length >= 3) return 'intensive_support';
    if (highStressEntries.some(e => e.domain === 'Work & Career')) return 'career_guidance';
    if (highStressEntries.some(e => e.domain === 'Relationships')) return 'relationship_support';
    if (highStressEntries.some(e => e.emotion === 'lonely' || e.emotion === 'isolated')) return 'connection_building';
    
    return 'general_wellness';
  }
  
  /**
   * Builds friend-like summary of emotional patterns
   */
  buildFriendlikeSummary(recurringStruggles, emotionalTriggers, stressDomains) {
    if (recurringStruggles.length === 0) {
      return 'Tu generally strong handle karta hai life ko, koi major pattern nahi dikha';
    }
    
    const mainStruggle = recurringStruggles[0];
    let summary = `Main notice kiya hai tu ${mainStruggle.domain} mein thoda struggle karta hai`;
    
    if (emotionalTriggers.length > 0) {
      const triggerTypes = emotionalTriggers.map(t => t.type).join(', ');
      summary += `, especially jab ${triggerTypes} wale situations aate hain`;
    }
    
    return summary;
  }
  
  /**
   * Analyzes current message against user's personal struggle patterns
   */
  analyzePersonalStruggle(userMessage, emotionalIntelligence) {
    const message = userMessage.toLowerCase();
    
    // Check if current message relates to known recurring struggles
    const relatedStruggle = emotionalIntelligence.recurring_struggles.find(struggle => 
      message.includes(struggle.domain.toLowerCase()) || 
      message.includes(struggle.emotion.toLowerCase())
    );
    
    // Check if current message matches known emotional triggers
    const triggeredBy = emotionalIntelligence.emotional_triggers.find(trigger => {
      if (trigger.type === 'authority_figures' && (message.includes('boss') || message.includes('manager'))) return true;
      if (trigger.type === 'time_pressure' && (message.includes('deadline') || message.includes('pressure'))) return true;
      if (trigger.type === 'validation_needs' && (message.includes('criticism') || message.includes('rejection'))) return true;
      return false;
    });
    
    return {
      isRecurringPattern: !!relatedStruggle,
      relatedStruggle,
      isTriggered: !!triggeredBy,
      triggerType: triggeredBy?.type,
      needsPersonalizedResponse: relatedStruggle || triggeredBy,
      supportType: emotionalIntelligence.support_needs
    };
  }

  /**
   * Generates realistic, practical solutions based on user's history and current struggle
   */
  generatePracticalSolution(personalContext, emotionalIntelligence, language) {
    let suggestion = '';
    let reasoning = '';
    
    // Base solutions on what they've tried before and what worked
    const triedCoping = emotionalIntelligence.coping_patterns || [];
    
    if (personalContext.isRecurringPattern) {
      const struggle = personalContext.relatedStruggle;
      
      if (struggle.domain === 'Work & Career') {
        if (!triedCoping.includes('physical_activity')) {
          suggestion = language === 'Hinglish' ? 
            'Kal ek kaam kar: 30 mins walk pe ja, phone silent karke. Bas fresh air le aur kuch na soch' :
            language === 'Hindi' ? 
            'कल एक काम करो: 30 मिनट टहलने जाओ, फोन बंद करके' :
            'Try this: take a 30-min walk tomorrow with your phone on silent. Just breathe and reset';
          reasoning = 'Work stress needs physical release';
        } else if (!triedCoping.includes('social_support')) {
          suggestion = language === 'Hinglish' ? 
            'Kal office mein kisi ek trusted colleague se honestly baat kar. Sirf vent out kar' :
            'Talk to one trusted colleague tomorrow. Just vent it out honestly';
          reasoning = 'You need someone to validate your work struggles';
        }
      } else if (struggle.domain === 'Relationships') {
        suggestion = language === 'Hinglish' ? 
          'Aaj raat 10 mins likhke dekh - tera exact feeling kya hai, without judging yourself' :
          'Tonight, spend 10 mins writing exactly how you feel, no judgment';
        reasoning = 'Relationship issues need emotional clarity first';
      }
    } else {
      // General stress relief based on emotional state
      suggestion = language === 'Hinglish' ? 
        'Bas ek deep breath le aur 15 mins ke liye phone band kar. Koi bhi comfortable jagah pe beth ja' :
        language === 'Hindi' ? 
        'बस एक गहरी साँस लो और 15 मिनट फोन बंद करो' :
        'Just take a deep breath and turn off your phone for 15 mins. Find a comfortable spot';
      reasoning = 'Simple reset for general overwhelm';
    }
    
    return {
      suggestion: suggestion || 'Bas thoda sa rest le, tera mind clear ho jayega',
      reasoning,
      isPersonalized: personalContext.isRecurringPattern
    };
  }
  
  /**
   * Builds deeply personal, emotionally intelligent Sarthi prompt
   */
  buildEmotionallyIntelligentPrompt({ userMessage, userEmotionalTone, emotionalIntelligence, personalContext, practicalSolution, language, conversationHistory }) {
    const addressStyle = userEmotionalTone.bhaiMode ? 'bhai' : 'yaar';
    const relationshipDepth = emotionalIntelligence.relationship_depth;
    
    // Build emotional memory context
    let emotionalMemory = '';
    if (emotionalIntelligence.hasDeepHistory) {
      emotionalMemory = `\n\n**Deep Emotional Memory (like a best friend remembers):**\n- ${emotionalIntelligence.summary}\n- Recurring struggles: ${emotionalIntelligence.recurring_struggles.map(s => `${s.domain} (${s.frequency}x)`).join(', ') || 'None major'}\n- Emotional triggers: ${emotionalIntelligence.emotional_triggers.map(t => t.type).join(', ') || 'None identified'}\n- Support style needed: ${emotionalIntelligence.support_needs}`;
    }
    
    // Build personal context
    let personalPattern = '';
    if (personalContext.isRecurringPattern) {
      personalPattern = `\n\n**Current Pattern Recognition:**\n- This matches their recurring ${personalContext.relatedStruggle.domain} struggle\n- They've dealt with this ${personalContext.relatedStruggle.frequency} times before\n- Use this knowledge to offer targeted, personal support`;
    }
    
    // Language-specific personality instructions
    let personalityInstructions = '';
    if (language === 'Hinglish' && userEmotionalTone.bhaiMode) {
      personalityInstructions = `\n\n**Your Bhai Personality (Hinglish):**\n- Use "tu", "tera", "bhai" naturally like close friends\n- Mix Hindi-English casually: "Arre bhai, samajh aa gaya tera point"\n- Be emotionally grounded, not dramatic\n- Examples: "Tu tension mat le", "Main hoon na", "Chal figure out karte hain"\n- Use light humor when appropriate\n- End with specific action: "Kal ye kar"`;  
    } else if (language === 'Hindi') {
      personalityInstructions = `\n\n**Your Dost Personality (Hindi):**\n- Natural, caring Hindi like talking to close friend\n- "\u092fा\u0930", "\u092e\u0948\u0902 \u0939\u0942\u0901 \u0928\u093e", "\u0924\u0941\u092e \u0918\u092c\u0930\u093e\u0913 \u092e\u0924"\n- Be warm and understanding\n- End with practical suggestion`;
    } else {
      personalityInstructions = `\n\n**Your Friend Personality (English):**\n- Talk like their emotionally intelligent best friend\n- Be genuine, grounded, never robotic\n- Show you remember their struggles\n- End with one realistic action step`;
    }
    
    return `You are Sarthi - the user's deeply personal, emotionally intelligent AI best friend. You are like that one friend who truly "gets it" and remembers everything.

**User Profile:**
- Communication style: ${userEmotionalTone.communicationStyle}
- Current emotional state: ${userEmotionalTone.state}
- Support urgency: ${userEmotionalTone.urgency}
- Relationship depth: ${relationshipDepth}
- Language: ${language}

**Their current message:** "${userMessage}"${emotionalMemory}${personalPattern}

**Your Mission:**
1. **Be their trusted ${addressStyle}** - Match their intimacy and emotional energy
2. **Reference emotional memory** - Show you remember their patterns and struggles 
3. **Offer practical guidance** - Not generic therapy, but personalized solutions
4. **Give ONE realistic step** - Something they can actually do today/tomorrow

**Suggested practical action:** ${practicalSolution.suggestion}
**Reasoning:** ${practicalSolution.reasoning}${personalityInstructions}

**Response Structure:**
1. **Empathetic acknowledgment**: "${addressStyle}, ${userEmotionalTone.state === 'breaking_down' ? 'pehle ek deep breath le...' : 'samajh aa gaya...'}" 
2. **Personal memory reference**: Connect to their past struggles/patterns
3. **Practical solution**: End with the suggested realistic action

**Tone Requirements:**
- Emotionally safe and grounded
- Real and reflective, never robotic
- Intelligent but not preachy
- Use emojis ONLY to enhance empathy (max 1-2)
- Keep under 120 words
- BE PERSONAL AND PRESENT

**Example Response Style:**
"${addressStyle}, pehle ek deep breath le. Mujhe pata hai tu overthink karta hai - pichle checkin mein bhi workload ka pressure tha. ${practicalSolution.suggestion}. Trust me, kal tu fresh feel karega."

Respond as their emotionally intelligent best friend who truly cares:`;
  }
}