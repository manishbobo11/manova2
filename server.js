import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { Pinecone } from '@pinecone-database/pinecone';
import vectorRouter from './routes/vectorRoutes.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/vector/upsert', async (req, res) => {
  try {
    const { userId, embedding, metadata } = req.body;
    
    console.log('📝 Vector upsert request received:', {
      userId,
      embeddingLength: embedding ? embedding.length : 0,
      metadata
    });

    // Validate required fields
    if (!userId || !embedding || !metadata) {
      console.error('❌ Missing required fields:', { userId: !!userId, embedding: !!embedding, metadata: !!metadata });
      return res.status(400).json({ error: 'Missing required fields: userId, embedding, metadata' });
    }

    // Check if Pinecone credentials are available
    const apiKey = process.env.PINECONE_API_KEY;
    const environment = process.env.PINECONE_ENVIRONMENT;
    const indexName = process.env.PINECONE_INDEX_NAME || "manova-emotions";

    if (!apiKey || !environment) {
      console.error('❌ Missing Pinecone credentials');
      return res.status(500).json({ error: 'Pinecone configuration missing' });
    }

    console.log('🔧 Pinecone config:', { environment, indexName });

    const pinecone = new Pinecone();

    console.log('🔧 Pinecone initialization:', { 
      hasApiKey: !!apiKey, 
      environment, 
      indexName,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : 'none'
    });

    // Try to get the index and validate existence
    let index;
    try {
      index = pinecone.index(indexName);
      console.log('✅ Pinecone index accessed successfully');
      
      // Validate index existence and health
      const stats = await index.describeIndexStats();
      console.log("🧪 Pinecone Index Stats:", stats);
      
      if (!stats) {
        throw new Error('Index stats returned null - index may not exist');
      }
      
      console.log(`📊 Index health: ${stats.totalVectorCount || 0} vectors, ${stats.dimension || 0} dimensions`);
      
    } catch (indexError) {
      console.error('❌ Failed to access or validate Pinecone index:', indexError.message);
      return res.status(500).json({
        error: 'Pinecone index not accessible',
        message: indexError.message
      });
    }

    // Generate unique vector ID
    const vectorId = `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Ensure metadata includes userId for filtering
    const finalMetadata = {
      ...metadata,
      userId: userId,
      timestamp: new Date().toISOString()
    };

    const vectorData = {
      id: vectorId,
      values: embedding,
      metadata: finalMetadata
    };

    // Try to upsert the vector
    try {
      const namespace = ""; // Use empty string as default namespace
      
      console.log(`📤 Upserting vector to Pinecone:`, {
        id: vectorId,
        dimensions: embedding.length,
        metadataKeys: Object.keys(finalMetadata)
      });
      
      const upsertResponse = await index.namespace(namespace).upsert([vectorData]);
      
      console.log('✅ Vector upserted successfully to Pinecone:', upsertResponse);
      // Pinecone's latest client does not return upsertedCount
      return res.status(200).json({
        success: true,
        id: vectorId
      });

    } catch (upsertError) {
      console.error('❌ Vector upsert failed:', upsertError.message);
      return res.status(500).json({
        error: 'Vector upsert failed',
        message: upsertError.message
      });
    }

  } catch (err) {
    console.error('🔥 Vector upsert failed:', err.message);
    console.error('🔥 Error details:', err);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: err.message
    });
  }
});

app.post('/api/enhanced-stress-analysis', (req, res) => {
  try {
    const { questionId, responseText, domain, userId } = req.body;

    console.log("🧠 Enhanced Stress API called with:", { questionId, responseText, domain, userId });

    // Validate required fields
    if (!responseText || typeof responseText !== 'string' || responseText.trim().length === 0) {
      return res.status(400).json({ 
        error: 'responseText is required and must be a non-empty string' 
      });
    }

    if (!questionId) {
      return res.status(400).json({ 
        error: 'questionId is required' 
      });
    }

    // Option-based mapping for Likert scale answers
    const optionMap = {
      'not at all':    { enhancedScore: 2, emotion: 'Low Stress',      causeTag: 'stable' },
      'a little':      { enhancedScore: 4, emotion: 'Mild Stress',     causeTag: 'mild' },
      'somewhat':      { enhancedScore: 5, emotion: 'Moderate Stress', causeTag: 'pressure' },
      'mostly':        { enhancedScore: 7, emotion: 'High Stress',     causeTag: 'workload' },
      'completely':    { enhancedScore: 9, emotion: 'Burnout Risk',   causeTag: 'overwork' }
    };

    const lower = responseText.trim().toLowerCase();
    let result;
    if (optionMap[lower]) {
      result = {
        questionId,
        ...optionMap[lower]
      };
      console.log('✅ Option-based stress analysis result:', result);
      return res.status(200).json(result);
    }

    // Fallback to previous keyword-based analysis if not a Likert option
    const analyzeResponse = (text) => {
      const lowerText = text.toLowerCase().trim();
      
      console.log('🔍 Analyzing response text:', text);
      
      // High frequency indicators (score: 8-9) - These indicate severe stress
      const highFrequencyPatterns = [
        'very often', 'always', 'constantly', 'all the time', 'every day',
        'extremely often', 'most of the time', 'nearly always', 'almost always'
      ];
      
      // High stress emotional phrases (score: 8-9)
      const highStressEmotionalKeywords = [
        'burnout', 'drained', 'anxious', 'tired', 'exhausted', 
        'overwhelmed', 'panic', 'stressed', 'breaking down', 'can\'t cope',
        'falling apart', 'burnt out', 'at breaking point', 'desperate',
        'feel terrible', 'feel awful', 'feel horrible', 'can\'t handle',
        'too much pressure', 'extremely stressed', 'completely overwhelmed'
      ];
      
      // Moderate frequency indicators (score: 5-6)
      const moderateFrequencyPatterns = [
        'often', 'frequently', 'sometimes', 'occasionally', 'regularly',
        'a few times', 'here and there', 'now and then', 'fairly often'
      ];
      
      // Moderate stress emotional keywords (score: 5-6)  
      const moderateStressKeywords = [
        'ignored', 'confused', 'isolated', 'frustrated', 'worried',
        'pressure', 'tension', 'difficult', 'challenging', 'struggling',
        'upset', 'concerned', 'bothered', 'annoyed', 'unsettled',
        'bit stressed', 'somewhat worried', 'little overwhelmed'
      ];
      
      // Low frequency indicators (score: 2-3)
      const lowFrequencyPatterns = [
        'rarely', 'never', 'almost never', 'hardly ever', 'not often',
        'not at all', 'very rarely', 'once in a while', 'seldom'
      ];

      // Check for high stress indicators (frequency OR emotional)
      const hasHighFrequency = highFrequencyPatterns.some(pattern => 
        lowerText.includes(pattern)
      );
      const hasHighStressEmotional = highStressEmotionalKeywords.some(keyword => 
        lowerText.includes(keyword)
      );

      // Check for moderate stress indicators
      const hasModerateFrequency = moderateFrequencyPatterns.some(pattern => 
        lowerText.includes(pattern)
      );
      const hasModerateStress = moderateStressKeywords.some(keyword => 
        lowerText.includes(keyword)
      );
      
      // Check for low stress indicators
      const hasLowFrequency = lowFrequencyPatterns.some(pattern => 
        lowerText.includes(pattern)
      );

      console.log('📊 Pattern analysis:', {
        hasHighFrequency,
        hasHighStressEmotional, 
        hasModerateFrequency,
        hasModerateStress,
        hasLowFrequency,
        text: lowerText
      });

      // Priority order: High stress (frequency OR emotional) > Low frequency > Moderate
      if (hasHighFrequency || hasHighStressEmotional) {
        const score = Math.floor(Math.random() * 2) + 8; // 8-9
        console.log('🔴 HIGH STRESS detected:', { score, reason: hasHighFrequency ? 'high frequency' : 'emotional distress' });
        return {
          score,
          emotion: "Burnout Risk",
          causeTag: "overwork"
        };
      } else if (hasLowFrequency) {
        const score = Math.floor(Math.random() * 2) + 2; // 2-3
        console.log('🟢 LOW STRESS detected:', { score, reason: 'low frequency' });
        return {
          score,
          emotion: "Low Stress",
          causeTag: "stable"
        };
      } else if (hasModerateFrequency || hasModerateStress) {
        const score = Math.floor(Math.random() * 2) + 5; // 5-6
        console.log('🟡 MODERATE STRESS detected:', { score, reason: hasModerateFrequency ? 'moderate frequency' : 'moderate emotional' });
        return {
          score,
          emotion: "Moderate Stress",
          causeTag: "pressure"
        };
      } else {
        // Default to moderate stress if no clear pattern
        const score = Math.floor(Math.random() * 2) + 4; // 4-5
        console.log('⚪ NEUTRAL/UNCLEAR response:', { score, reason: 'default moderate' });
        return {
          score,
          emotion: "Moderate Stress",
          causeTag: "general_stress"
        };
      }
    };
    const analysis = analyzeResponse(responseText);
    result = {
      questionId,
      enhancedScore: analysis.score,
      emotion: analysis.emotion,
      causeTag: analysis.causeTag
    };
    console.log("✅ Fallback stress analysis result:", result);
    return res.status(200).json(result);
  } catch (err) {
    console.error("🔥 Enhanced Stress API failed:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GPT-powered analyze-stress route using Azure OpenAI
app.post('/api/analyze-stress', async (req, res) => {
  try {
    const { question, answer, domain, questionId } = req.body;

    console.log('🔍 GPT analyze-stress API called with:', { question, answer, domain, questionId });

    const prompt = `
You are a licensed mental health expert AI. A user has just responded to a wellness survey.

Your job is to evaluate the **emotional stress level** in their answer based on the question's meaning, the selected option, and the domain context.

Respond STRICTLY in this JSON format:
{
  "score": [1-10], // 1=low stress, 10=extremely high stress
  "emotion": "<e.g., Anxiety, Exhaustion, Rejection, Stable>",
  "causeTag": "<e.g., lack_of_recognition, overwork, micromanagement>"
}

Now evaluate:

Domain: ${domain}
Question: ${question}
Answer: ${answer}

Use psychological insight. Think like a therapist. ONLY return the JSON.
    `;

    // Azure OpenAI configuration - Updated environment variable names
    const azureResource = process.env.AZURE_OPENAI_RESOURCE || "manova";
    const azureDeployment = process.env.AZURE_DEPLOYMENT_NAME || process.env.AZURE_GPT_DEPLOYMENT_NAME || "gpt-4o";
    const azureKey = process.env.AZURE_OPENAI_KEY || process.env.AZURE_OPENAI_API_KEY || "6Teijvr6VDdNQ9WT6f1JdHVdqhfuTkyrLeRDbsa5K7DcwiwKkdeWJQQJ99BEACYeBjFXJ3w3AAABACOGYB7D";

    console.log('🤖 Sending prompt to GPT-4o via axios');

    const azureRes = await axios.post(
      `https://${azureResource}.openai.azure.com/openai/deployments/${azureDeployment}/chat/completions?api-version=2024-05-01`,
      {
        messages: [
          { role: "system", content: "You are a mental wellness expert AI." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 200,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": azureKey
        },
      }
    );

    const response = azureRes.data.choices[0].message.content.trim();
    
    console.log('🤖 Raw GPT response:', response);
    
    // Parse and clean JSON response
    let cleanedResponse = response;
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
    }
    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
    }
    
    const parsed = JSON.parse(cleanedResponse);
    
    console.log('✅ GPT analysis successful:', parsed);

    res.status(200).json({
      questionId: questionId,
      enhancedScore: parsed.score,
      emotion: parsed.emotion,
      causeTag: parsed.causeTag
    });

  } catch (error) {
    console.error("❌ Stress API Error:", error.message);
    
    // Enhanced fallback based on answer patterns
    let fallbackScore = 2;
    const lowerAnswer = req.body.answer?.toLowerCase() || '';
    
    if (['very often', 'always', 'completely', 'extremely'].some(phrase => lowerAnswer.includes(phrase))) {
      fallbackScore = 8;
    } else if (['often', 'mostly', 'frequently'].some(phrase => lowerAnswer.includes(phrase))) {
      fallbackScore = 6;
    } else if (['sometimes', 'somewhat', 'occasionally'].some(phrase => lowerAnswer.includes(phrase))) {
      fallbackScore = 4;
    } else if (['rarely', 'a little', 'seldom'].some(phrase => lowerAnswer.includes(phrase))) {
      fallbackScore = 3;
    } else if (['never', 'not at all', 'none'].some(phrase => lowerAnswer.includes(phrase))) {
      fallbackScore = 2;
    }
    
    console.log('🔄 Using enhanced fallback analysis:', { answer: req.body.answer, score: fallbackScore });
    
    res.status(200).json({
      questionId: req.body.questionId,
      enhancedScore: fallbackScore,
      emotion: "Stable",
      causeTag: "none"
    });
  }
});

// OpenAI Chat route for GPT-based deep-dive follow-up suggestions
app.post('/api/openai-chat', async (req, res) => {
  try {
    const { userId, prompt, conversationHistory } = req.body;

    // Validate required fields
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ 
        error: 'prompt is required and must be a non-empty string' 
      });
    }

    console.log('🤖 OpenAI Chat API called with:', { userId, promptLength: prompt.length });

    // Azure OpenAI configuration
    const azureKey = process.env.AZURE_OPENAI_API_KEY || "6Teijvr6VDdNQ9WT6f1JdHVdqhfuTkyrLeRDbsa5K7DcwiwKkdeWJQQJ99BEACYeBjFXJ3w3AAABACOGYB7D";
    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || "https://manova.openai.azure.com/";
    const azureDeployment = process.env.AZURE_GPT_DEPLOYMENT_NAME || process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o";
    const azureVersion = process.env.AZURE_API_VERSION || process.env.AZURE_OPENAI_API_VERSION || "2024-12-01-preview";

    console.log('🔧 Using Azure config:', { 
      endpoint: azureEndpoint, 
      deployment: azureDeployment, 
      version: azureVersion 
    });

    // Prepare messages array
    let messages = [
      { role: "system", content: "You are a mental wellness AI assistant providing empathetic and helpful support." }
    ];

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      messages.push(...conversationHistory);
    }

    // Add user prompt
    messages.push({ role: "user", content: prompt });

    // Call Azure OpenAI
    const endpoint = `${azureEndpoint}/openai/deployments/${azureDeployment}/chat/completions?api-version=${azureVersion}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": azureKey
      },
      body: JSON.stringify({
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
        stream: false
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Azure OpenAI error:', data);
      return res.status(500).json({ 
        error: data.error?.message || 'Failed to get response from Azure OpenAI' 
      });
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid response structure from Azure OpenAI:', data);
      return res.status(500).json({ 
        error: 'Invalid response structure from Azure OpenAI' 
      });
    }

    const reply = data.choices[0].message.content;
    
    console.log('✅ Generated OpenAI response:', { replyLength: reply.length });

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('❌ OpenAI Chat API error:', error.message);
    return res.status(500).json({ 
      error: 'Internal server error during OpenAI chat' 
    });
  }
});

// GPT Therapist endpoint for deep dive follow-up insights
app.post('/api/gptTherapist', async (req, res) => {
  try {
    const { domain, stressSignals, userNote } = req.body;

    console.log('🧠 GPT Therapist API called with:', { domain, stressSignals, userNote });

    // Validate required fields
    if (!domain || typeof domain !== 'string' || domain.trim().length === 0) {
      return res.status(400).json({ 
        error: 'domain is required and must be a non-empty string' 
      });
    }

    if (!stressSignals || typeof stressSignals !== 'string') {
      return res.status(400).json({ 
        error: 'stressSignals is required and must be a string' 
      });
    }

    // Azure OpenAI configuration
    const azureKey = process.env.AZURE_OPENAI_API_KEY || "6Teijvr6VDdNQ9WT6f1JdHVdqhfuTkyrLeRDbsa5K7DcwiwKkdeWJQQJ99BEACYeBjFXJ3w3AAABACOGYB7D";
    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || "https://manova.openai.azure.com/";
    const azureDeployment = process.env.AZURE_GPT_DEPLOYMENT_NAME || process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o";
    const azureVersion = process.env.AZURE_API_VERSION || process.env.AZURE_OPENAI_API_VERSION || "2024-12-01-preview";

    // Create therapist prompt
    const prompt = `You are a compassionate mental wellness expert helping someone experiencing stress in the '${domain}' domain.
They are struggling with: ${stressSignals}.
${userNote ? `Their additional comment: "${userNote}"` : ''}

Respond as a human therapist would:
- Acknowledge their emotions with empathy
- Suggest 2-3 practical coping mechanisms specific to their situation
- Be comforting but practical
- Keep response concise (2-3 paragraphs max)
- Don't repeat the same structure each time
- Focus on actionable advice they can implement today

Provide warm, personalized therapeutic guidance.`;

    console.log('🤖 Sending therapist prompt to GPT-4o:', { prompt: prompt.substring(0, 200) + '...' });

    try {
      // Call Azure OpenAI GPT-4o
      const endpoint = `${azureEndpoint}/openai/deployments/${azureDeployment}/chat/completions?api-version=${azureVersion}`;
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": azureKey
        },
        body: JSON.stringify({
          messages: [
            { 
              role: "system", 
              content: "You are a compassionate, licensed mental health therapist. Provide empathetic, practical guidance in a warm, professional tone." 
            },
            { 
              role: "user", 
              content: prompt 
            }
          ],
          temperature: 0.7,
          max_tokens: 300,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Azure OpenAI error:', errorData);
        throw new Error(`Azure OpenAI API failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response structure from Azure OpenAI');
      }

      const therapistAdvice = data.choices[0].message.content.trim();
      console.log('✅ GPT therapist advice generated:', { adviceLength: therapistAdvice.length });

      return res.status(200).json({
        therapistAdvice: therapistAdvice
      });

    } catch (gptError) {
      console.error('❌ GPT therapist analysis failed:', gptError.message);
      console.log('🔄 Using fallback therapist response');
      
      // Fallback to personalized response based on input
      const fallbackAdvice = `I can see you're dealing with some challenges in your ${domain.toLowerCase()} life. Your feelings are completely valid, and it's important to acknowledge them. 

Based on what you've shared about ${stressSignals.toLowerCase()}, consider taking small steps to care for yourself. ${userNote ? 'Your additional thoughts show self-awareness, which is a strength. ' : ''}

Remember that it's okay to ask for support when you need it. You don't have to navigate this alone.`;

      console.log('✅ Fallback therapist advice provided');

      return res.status(200).json({
        therapistAdvice: fallbackAdvice
      });
    }

  } catch (err) {
    console.error('❌ GPT Therapist API failed:', err.message);
    
    // Return fallback even for general errors
    const errorFallback = `I understand you're going through a difficult time. Your feelings are valid and seeking support shows strength. Consider reaching out to trusted friends, family, or a mental health professional who can provide personalized guidance for your situation.`;

    return res.status(200).json({
      therapistAdvice: errorFallback
    });
  }
});

// Contributors API endpoint for dynamic stress contributors
app.get('/api/contributors', async (req, res) => {
  try {
    const { qid } = req.query;

    if (!qid) {
      return res.status(400).json({ error: 'Question ID (qid) is required' });
    }

    console.log(`🔍 Fetching contributors for question: ${qid}`);

    // Enhanced dynamic contributor generation based on question context
    const contributorsByQuestion = {
      // Work & Career domain - Enhanced with more specific and contextual options
      'work_1': [
        'Unrealistic deadlines and constant pressure',
        'Feeling emotionally drained by work demands',
        'Lack of recognition for hard work',
        'Overwhelming workload beyond capacity',
        'Poor communication from management',
        'Absence of career growth opportunities',
        'Toxic workplace culture',
        'Job insecurity and fear of layoffs'
      ],
      'work_2': [
        'Unsupportive or absent manager',
        'Feeling micromanaged and controlled',
        'Lack of autonomy in decision-making',
        'Manager doesn\'t understand my challenges',
        'Inconsistent feedback and expectations',
        'Favoritism and unfair treatment',
        'No mentorship or professional development',
        'Fear of speaking up about concerns'
      ],
      'work_3': [
        'Saying "yes" to everything out of fear',
        'Unable to set healthy boundaries',
        'Taking on others\' responsibilities',
        'Working during personal time regularly',
        'Fear of disappointing others',
        'Perfectionism leading to over-commitment',
        'Guilt when not working overtime',
        'Pressure to be constantly available'
      ],
      'work_4': [
        'Hard work goes unnoticed',
        'Achievements are minimized or ignored',
        'Others take credit for my contributions',
        'No celebration of milestones',
        'Feeling invisible despite efforts',
        'Lack of positive feedback',
        'Efforts are taken for granted',
        'No advancement despite performance'
      ],
      'work_5': [
        'Work feels meaningless and empty',
        'Daily tasks lack personal significance',
        'Disconnect between values and work',
        'No sense of impact or contribution',
        'Feeling like just a cog in the machine',
        'Lost motivation and passion',
        'Questioning career choices',
        'Yearning for more purposeful work'
      ],

      // Personal Life domain - More nuanced and relatable
      'personal_1': [
        'Constant arguments and tension',
        'Feeling misunderstood by loved ones',
        'Lack of emotional support',
        'Difficulty maintaining close friendships',
        'Romantic relationship challenges',
        'Family expectations and pressure',
        'Feeling isolated despite being around people',
        'Trust issues and past relationship wounds'
      ],
      'personal_2': [
        'No time for hobbies or interests',
        'Constant busyness without fulfillment',
        'Guilt when taking time for myself',
        'Difficulty saying no to others\' requests',
        'Always putting others\' needs first',
        'Lost sense of personal identity',
        'Exhaustion from caregiving duties',
        'No energy left for self-care'
      ],
      'personal_3': [
        'Friends seem unavailable when needed',
        'Feeling like a burden to others',
        'Hesitant to ask for help',
        'Support network feels superficial',
        'Geographic distance from loved ones',
        'Difficulty opening up emotionally',
        'Past betrayals affecting trust',
        'Social anxiety preventing connection'
      ],
      'personal_4': [
        'Fear of judgment for being myself',
        'Hiding parts of my personality',
        'Feeling pressure to conform',
        'Others don\'t accept my choices',
        'Criticism for expressing opinions',
        'Having to wear different masks',
        'Fear of rejection if truly known',
        'Cultural or family disapproval'
      ],
      'personal_5': [
        'Others ignore my stated limits',
        'Feeling guilty for having boundaries',
        'People take advantage of my kindness',
        'My needs are dismissed as unimportant',
        'Pressure to be available 24/7',
        'Difficulty enforcing personal rules',
        'Others guilt-trip me into compliance',
        'Fear of conflict when setting limits'
      ],

      // Financial Security domain - Practical and immediate concerns
      'financial_1': [
        'Living paycheck to paycheck',
        'Unexpected expenses causing panic',
        'Unable to save for emergencies',
        'Debt growing faster than income',
        'Fear of financial ruin',
        'Comparing finances to others',
        'Shame about money struggles',
        'Avoiding looking at bank statements'
      ],
      'financial_2': [
        'Fear of making wrong financial choices',
        'Paralyzed by too many options',
        'Putting off important decisions',
        'Analysis paralysis with investments',
        'Fear of financial commitment',
        'Uncertainty about future stability',
        'Avoiding financial planning altogether',
        'Procrastinating on money matters'
      ],
      'financial_3': [
        'No emergency fund buffer',
        'Living in constant financial anxiety',
        'One emergency away from crisis',
        'Unable to handle unexpected costs',
        'Borrowing money regularly',
        'Credit maxed out already',
        'No financial safety net',
        'Fear of asking family for help'
      ],
      'financial_4': [
        'Guilt over every purchase decision',
        'Anxiety even buying necessities',
        'Obsessing over spending choices',
        'Fear of being judged for purchases',
        'Regret after buying anything',
        'Constant money-related worry',
        'Unable to enjoy earned money',
        'Perfectionism with budgeting'
      ],
      'financial_5': [
        'Fear of never having enough',
        'Anxiety about retirement planning',
        'Worry overshadowing present moments',
        'Unable to enjoy current financial state',
        'Catastrophic thinking about money',
        'Future financial doom scenarios',
        'Money anxiety affecting relationships',
        'Stress preventing financial enjoyment'
      ],

      // Health & Wellness domain - Holistic health concerns
      'health_1': [
        'Racing thoughts keeping me awake',
        'Stress preventing restful sleep',
        'Inconsistent sleep schedule',
        'Waking up tired despite hours slept',
        'Sleep anxiety and bedtime worry',
        'Technology interfering with sleep',
        'Physical discomfort disrupting rest',
        'Nightmares or disturbing dreams'
      ],
      'health_2': [
        'Chronic exhaustion and fatigue',
        'No motivation for daily activities',
        'Energy crashes throughout the day',
        'Feeling depleted by simple tasks',
        'Mental fog and lack of clarity',
        'Physical heaviness and lethargy',
        'Unable to maintain consistent energy',
        'Burnout affecting all life areas'
      ],
      'health_3': [
        'Tension headaches and neck pain',
        'Stomach issues and digestive problems',
        'Muscle tightness and body aches',
        'Heart palpitations and chest tightness',
        'Frequent illness and low immunity',
        'Skin problems and stress reactions',
        'Appetite changes and eating issues',
        'Physical symptoms with no clear cause'
      ],
      'health_4': [
        'All-or-nothing approach to health',
        'Guilt over missing workouts',
        'Inconsistent healthy habits',
        'Too busy for self-care routines',
        'Perfectionism sabotaging progress',
        'Lack of motivation for wellness',
        'Overwhelming health information',
        'Social pressure affecting choices'
      ],
      'health_5': [
        'Fear of developing serious illness',
        'Catastrophic thinking about symptoms',
        'Avoiding medical checkups',
        'Health anxiety affecting daily life',
        'Worry about family health history',
        'Fear of aging and decline',
        'Obsessing over health information',
        'Anxiety about medical procedures'
      ],

      // Self-Worth & Identity domain - Deep personal struggles
      'identity_1': [
        'Feeling lost and without direction',
        'Unclear about life goals and purpose',
        'Comparing my journey to others\' success',
        'Feeling behind in life milestones',
        'Uncertainty about career path',
        'Questioning major life decisions',
        'Lacking clear personal values',
        'Feeling adrift without anchor'
      ],
      'identity_2': [
        'Everyone else seems more successful',
        'Social media fueling inadequacy',
        'Feeling inferior to peers',
        'Constant self-comparison',
        'Others\' achievements highlighting my lack',
        'Jealousy over others\' opportunities',
        'Feeling like I\'m falling behind',
        'Imposter syndrome in social settings'
      ],
      'identity_3': [
        'Feeling like a fraud at work',
        'Fear of being "found out"',
        'Attributing success to luck',
        'Downplaying my achievements',
        'Feeling undeserving of recognition',
        'Anxiety about maintaining performance',
        'Comparing myself to "real" experts',
        'Fear that others overestimate my abilities'
      ],
      'identity_4': [
        'Harsh self-criticism and judgment',
        'Perfectionism preventing self-forgiveness',
        'Treating myself worse than enemies',
        'No compassion for my mistakes',
        'Impossible standards for myself',
        'Self-blame for things beyond control',
        'Inner critic constantly attacking',
        'Unable to accept my humanity'
      ],
      'identity_5': [
        'Living according to others\' expectations',
        'Fear of disappointing important people',
        'Compromising values for acceptance',
        'Feeling disconnected from true self',
        'Making choices based on external pressure',
        'Lost touch with personal desires',
        'Living someone else\'s life',
        'Identity crisis and confusion'
      ]
    };

    // Get contributors for the specific question, or return default options
    const contributors = contributorsByQuestion[qid] || [
      'Feeling overwhelmed',
      'Lack of control',
      'Uncertainty about the future',
      'Not feeling supported',
      'High expectations',
      'Difficulty balancing priorities',
      'Time management challenges',
      'Emotional exhaustion'
    ];

    console.log(`✅ Returning ${contributors.length} contributors for ${qid}`);

    // Return the contributors as an array of strings
    res.status(200).json(contributors);

  } catch (error) {
    console.error('❌ Error fetching contributors:', error);
    res.status(500).json({ 
      error: 'Failed to fetch contributors',
      message: error.message 
    });
  }
});

// Vector routes
app.use('/api/vector', vectorRouter);

const PORT = 8001;
app.listen(PORT, () => {
  console.log(`✅ Vector backend running at http://localhost:${PORT}`);
}); 