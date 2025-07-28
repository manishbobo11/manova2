/**
 * Deep Conversation Engine for Sarthi
 * Handles follow-up questions, conversation continuation, and practical guidance
 * Makes Sarthi behave like a true brother-mentor-therapist hybrid
 */

export class DeepConversationEngine {
  
  /**
   * Analyzes if user needs follow-up questions vs direct guidance
   */
  static analyzeConversationNeeds(userMessage, conversationHistory) {
    const message = userMessage.toLowerCase();
    
    // Check for confusion signals - needs probing questions
    const confusionSignals = [
      'confuse', 'confused', 'samajh nahi', 'kya karu', 'pata nahi',
      'don\'t know', 'unclear', 'mixed feelings', 'overwhelmed'
    ];
    
    // Check for career/startup signals - needs step-based planning
    const careerSignals = [
      'resign', 'job', 'career', 'startup', 'business', 'naukri',
      'office', 'work', 'switch', 'quit', 'promotion'
    ];
    
    // Check for emotional venting - needs validation + gentle guidance
    const emotionalSignals = [
      'mann nahi', 'mann nai', 'feeling', 'sad', 'depressed', 'lonely', 
      'khushi nahi', 'empty', 'stress', 'pressure', 'down', 'low',
      'mood off', 'feel nahi', 'lag raha', 'lag rha'
    ];
    
    const hasConfusion = confusionSignals.some(signal => message.includes(signal));
    const hasCareerIssue = careerSignals.some(signal => message.includes(signal));
    const hasEmotionalNeed = emotionalSignals.some(signal => message.includes(signal));
    
    // Determine conversation strategy
    let strategy = 'general_chat';
    let depth = 'surface';
    
    if (hasConfusion && hasCareerIssue) {
      strategy = 'career_confusion_deep_dive';
      depth = 'deep_exploration';
    } else if (hasCareerIssue) {
      strategy = 'career_planning';
      depth = 'practical_steps';
    } else if (hasConfusion) {
      strategy = 'confusion_clarification';
      depth = 'probing_questions';
    } else if (hasEmotionalNeed) {
      strategy = 'emotional_support_guided';
      depth = 'validation_and_guidance';
    }
    
    return {
      strategy,
      depth,
      needsFollowUp: hasConfusion || hasCareerIssue || hasEmotionalNeed,
      hasCareerComponent: hasCareerIssue,
      hasEmotionalComponent: hasEmotionalNeed,
      conversationLength: conversationHistory.length
    };
  }
  
  /**
   * Generates follow-up questions for confused users
   */
  static generateFollowUpQuestions(userMessage, strategy, language) {
    const message = userMessage.toLowerCase();
    
    if (strategy === 'career_confusion_deep_dive') {
      const questions = {
        'Hinglish': [
          "Bhai tu ye dono ek saath plan kar raha, iska reason kya lagta tujhe — job security ya khud pe bharosa?",
          "Yeh decision clarity se aa raha ya bas stress ke chakkar me?",
          "Startup ka idea concrete hai ya abhi bas mann mein feeling hai?"
        ],
        'Hindi': [
          "यार, यह decision clarity से आ रहा है या stress में?",
          "Startup के लिए कोई concrete plan है या बस feeling है?",
          "Job security चाहिए या independence?"
        ],
        'English': [
          "Is this decision coming from clarity or just stress?",
          "Do you have a concrete startup plan or just a feeling?",
          "What's driving this - job security concerns or independence?"
        ]
      };
      
      return questions[language] || questions['Hinglish'];
    }
    
    if (strategy === 'confusion_clarification') {
      if (message.includes('life') || message.includes('general')) {
        const questions = {
          'Hinglish': [
            "Kya lagta hai kis cheez ne sabse zyada confuse kar diya — kaam, rishta, ya khud se expectations?",
            "Sabse zyada pressure kya de raha hai tujhe right now?",
            "Agar ek cheez fix ho jaye toh kya lagta hai sab clear ho jayega?"
          ],
          'Hindi': [
            "सबसे ज्यादा कौन सी चीज़ confuse कर रही है?",
            "कहाँ सबसे ज्यादा pressure feel हो रहा है?",
            "क्या main problem है?"
          ],
          'English': [
            "What's confusing you most - work, relationships, or personal expectations?",
            "Where do you feel the most pressure right now?",
            "If one thing got clearer, what would help most?"
          ]
        };
        
        return questions[language] || questions['Hinglish'];
      }
    }
    
    // Default supportive questions
    const defaultQuestions = {
      'Hinglish': [
        "Chal, tu bata, agla thought kya chal raha hai?",
        "Isme sabse zyada kya bother kar raha hai tujhe?",
        "Kya feel kar raha hai exactly?"
      ],
      'Hindi': [
        "सबसे ज्यादा क्या परेशान कर रहा है?",
        "अभी कैसा feel हो रहा है?",
        "क्या चल रहा है मन में?"
      ],
      'English': [
        "What's bothering you most about this?",
        "How are you feeling about it?",
        "What's going through your mind?"
      ]
    };
    
    return defaultQuestions[language] || defaultQuestions['Hinglish'];
  }
  
  /**
   * Generates practical step-based guidance for career/startup issues
   */
  static generatePracticalSteps(userMessage, language) {
    const message = userMessage.toLowerCase();
    
    // Career + Startup combo
    if (message.includes('resign') && (message.includes('startup') || message.includes('business'))) {
      const steps = {
        'Hinglish': {
          intro: "Bhai resign se pehle ek baar dil se soch le — clarity se aa raha hai ya bas thakan se? Chal saath sochte hain:",
          steps: [
            "**Step 1:** Pehle 2 weeks startup idea pe proper research kar — market, competition, basic business plan",
            "**Step 2:** Current job mein notice period check kar aur 3-6 months ka emergency fund ready kar",
            "**Step 3:** Weekend mein startup ka MVP ya prototype bana ke dekh — realistic hai ya nahi"
          ],
          followUp: "Yeh teen steps karne ke baad clarity aa jayegi. Tujhe kya lagta hai, konsa step sabse tough lagta hai?"
        },
        'English': {
          intro: "Before resigning, let's think clearly — is this from clarity or just burnout? Let's plan together:",
          steps: [
            "**Step 1:** Spend 2 weeks researching your startup idea properly — market, competition, basic plan",
            "**Step 2:** Check your notice period and build 3-6 months emergency fund",
            "**Step 3:** Build a weekend MVP/prototype to test if it's realistic"
          ],
          followUp: "After these three steps, you'll have clarity. Which step feels most challenging to you?"
        }
      };
      
      return steps[language] || steps['Hinglish'];
    }
    
    // General career confusion
    if (message.includes('career') || message.includes('job')) {
      const steps = {
        'Hinglish': {
          intro: "Career confusion normal hai bhai, chal ek ek karke solve karte hain:",
          steps: [
            "**Step 1:** 3 din tak note kar — kya exactly unhappy kar raha hai current job mein",
            "**Step 2:** 5 log se baat kar jo tere field mein different roles mein hain",
            "**Step 3:** Next 30 days mein ek skill seekh jo tujhe interesting lagti hai"
          ],
          followUp: "Yeh karne ke baad direction clear ho jayegi. Sabse pehle kya start karna chahega?"
        },
        'English': {
          intro: "Career confusion is normal. Let's solve it step by step:",
          steps: [
            "**Step 1:** For 3 days, note exactly what makes you unhappy in your current job",
            "**Step 2:** Talk to 5 people in different roles in your field",
            "**Step 3:** Learn one skill in the next 30 days that interests you"
          ],
          followUp: "After this, direction will become clear. What would you like to start with first?"
        }
      };
      
      return steps[language] || steps['Hinglish'];
    }
    
    return null;
  }
  
  /**
   * Generates conversation continuation phrases
   */
  static generateContinuationPhrase(strategy, language, emotionalIntensity) {
    const continuations = {
      'career_confusion_deep_dive': {
        'Hinglish': [
          "Chal, bata — in dono options mein se kya tujhe zyada excited karta hai?",
          "Sochna chahega saath mein ki pros and cons kya hain?",
          "Main hoon na tera saath. Agla step kya sochte hain?"
        ],
        'English': [
          "Tell me — which of these options excites you more?",
          "Want to think through the pros and cons together?",
          "I'm here with you. What should our next step be?"
        ]
      },
      'emotional_support_guided': {
        'Hinglish': [
          "Chal, thoda aur bata — kya main help kar sakta hoon?",
          "Tu akela nahi hai yaar. Aur kya chal raha hai mann mein?",
          "Main samajh raha hoon. Kuch aur share karna chahta hai?"
        ],
        'English': [
          "Tell me more — how can I help?",
          "You're not alone. What else is on your mind?",
          "I understand. Want to share anything else?"
        ]
      },
      'confusion_clarification': {
        'Hinglish': [
          "Chal ek ek karke clear karte hain yeh confusion. Aur kya batayega?",
          "Main hoon na. Confusion normal hai, saath mein sort kar lenge.",
          "Samajh aa gaya. Aur koi cheez hai jo unclear lag rahi hai?"
        ],
        'English': [
          "Let's clear this confusion step by step. What else?",
          "I'm here. Confusion is normal, we'll sort it together.",
          "Got it. Anything else that feels unclear?"
        ]
      }
    };
    
    const defaultContinuations = {
      'Hinglish': [
        "Chal, tu bata, agla thought kya chal raha hai?",
        "Main hoon na. Aur kya share karna hai?",
        "Sochna chahega saath mein?"
      ],
      'English': [
        "What's your next thought?",
        "I'm here. What else would you like to share?",
        "Want to think about it together?"
      ]
    };
    
    const strategyPhrases = continuations[strategy];
    if (strategyPhrases && strategyPhrases[language]) {
      return strategyPhrases[language][Math.floor(Math.random() * strategyPhrases[language].length)];
    }
    
    const fallbackPhrases = defaultContinuations[language] || defaultContinuations['Hinglish'];
    return fallbackPhrases[Math.floor(Math.random() * fallbackPhrases.length)];
  }
  
  /**
   * Builds enhanced response with follow-ups and continuations
   */
  static buildEnhancedResponse({
    userMessage,
    baseResponse,
    conversationAnalysis,
    language,
    emotionalIntensity
  }) {
    const { strategy, needsFollowUp, hasCareerComponent } = conversationAnalysis;
    
    let enhancedResponse = baseResponse;
    
    // Add follow-up questions for confusion
    if (needsFollowUp && (strategy === 'confusion_clarification' || strategy === 'career_confusion_deep_dive')) {
      const followUpQuestions = this.generateFollowUpQuestions(userMessage, strategy, language);
      const selectedQuestion = followUpQuestions[Math.floor(Math.random() * followUpQuestions.length)];
      enhancedResponse += `\n\n${selectedQuestion}`;
    }
    
    // Add practical steps for career issues
    if (hasCareerComponent) {
      const practicalSteps = this.generatePracticalSteps(userMessage, language);
      if (practicalSteps) {
        enhancedResponse += `\n\n${practicalSteps.intro}\n\n${practicalSteps.steps.join('\n\n')}\n\n${practicalSteps.followUp}`;
      }
    }
    
    // Always add conversation continuation
    if (!enhancedResponse.includes('?') && emotionalIntensity !== 'critical') {
      const continuation = this.generateContinuationPhrase(strategy, language, emotionalIntensity);
      enhancedResponse += `\n\n${continuation}`;
    }
    
    return enhancedResponse;
  }
  
  /**
   * Detects if response needs to be split into chunks
   */
  static shouldSplitResponse(response) {
    // Split if response is longer than 300 characters and has multiple distinct parts
    return response.length > 300 && (
      response.includes('**Step') || 
      response.includes('\n\n') || 
      response.split('.').length > 4
    );
  }
  
  /**
   * Splits long responses into conversational chunks
   */
  static splitIntoChunks(response) {
    // Split by steps first
    if (response.includes('**Step')) {
      const parts = response.split(/(\*\*Step \d+:\*\*[^*]+)/);
      const chunks = [];
      let currentChunk = parts[0].trim(); // Intro
      
      for (let i = 1; i < parts.length; i += 2) {
        if (parts[i] && parts[i].includes('**Step')) {
          chunks.push(currentChunk);
          currentChunk = parts[i].trim();
          if (parts[i + 1]) {
            currentChunk += parts[i + 1];
          }
        }
      }
      
      if (currentChunk) chunks.push(currentChunk);
      return chunks.filter(chunk => chunk.length > 0);
    }
    
    // Split by natural breaks
    const sentences = response.split(/(?<=[.!?])\s+/);
    const chunks = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > 200 && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }
    
    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks.filter(chunk => chunk.length > 0);
  }
}