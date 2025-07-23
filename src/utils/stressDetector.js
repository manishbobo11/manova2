/**
 * Stress Detector Utility
 * 
 * Provides consistent stress detection logic across domains using:
 * - AI semantic scoring
 * - MCP protocol keywords  
 * - Response emotion/tone analysis
 */

// MCP-based red flags (common across domains)
const MCP_RED_FLAGS = [
  // High urgency indicators
  'burnout', 'anxious', 'overwhelmed', 'alone', 'isolated',
  'worthless', 'hopeless', 'can\'t take it', 'emotionally drained',
  'exhausted', 'nothing helps', 'giving up', 'crying', 'panic', 'pressure',
  
  // Work-specific stress indicators
  'overworked', 'underappreciated', 'micromanaged', 'toxic workplace',
  'job insecurity', 'imposter syndrome', 'work-life imbalance',
  
  // Personal life stress indicators
  'relationship problems', 'family conflict', 'social isolation',
  'loneliness', 'trust issues', 'boundary violations',
  
  // Financial stress indicators
  'financial crisis', 'debt stress', 'money worries', 'financial insecurity',
  'living paycheck to paycheck', 'can\'t afford', 'financial burden',
  
  // Health stress indicators
  'sleep problems', 'chronic pain', 'health anxiety', 'medical stress',
  'physical symptoms', 'stress-related illness',
  
  // Identity/self-worth indicators
  'identity crisis', 'self-doubt', 'imposter syndrome', 'comparison trap',
  'perfectionism', 'self-criticism', 'feeling inadequate'
];

// Domain-specific stress keywords
const DOMAIN_STRESS_KEYWORDS = {
  'work': [
    'overwhelmed', 'burnout', 'exhausted', 'drained', 'stressed',
    'pressure', 'deadline', 'micromanaged', 'underappreciated',
    'toxic', 'hostile', 'unsupportive', 'overworked', 'unclear expectations'
  ],
  'personal': [
    'lonely', 'isolated', 'conflict', 'drama', 'toxic relationship',
    'boundary issues', 'unsupported', 'misunderstood', 'authenticity',
    'connection', 'intimacy', 'trust', 'vulnerability'
  ],
  'financial': [
    'money stress', 'financial worry', 'debt', 'bills', 'expenses',
    'budget', 'savings', 'emergency fund', 'financial security',
    'cost of living', 'inflation', 'economic stress'
  ],
  'health': [
    'sleep problems', 'fatigue', 'energy', 'physical symptoms',
    'chronic pain', 'health anxiety', 'medical stress', 'wellness',
    'exercise', 'diet', 'stress management', 'self-care'
  ],
  'identity': [
    'self-worth', 'confidence', 'purpose', 'direction', 'meaning',
    'authenticity', 'values', 'identity crisis', 'self-doubt',
    'comparison', 'perfectionism', 'imposter syndrome'
  ]
};

// Emotion intensity mapping
const EMOTION_INTENSITY = {
  'high': ['overwhelmed', 'panicked', 'desperate', 'hopeless', 'exhausted', 'burnout'],
  'moderate': ['stressed', 'worried', 'frustrated', 'anxious', 'concerned', 'tired'],
  'low': ['slightly', 'a bit', 'somewhat', 'occasionally', 'rarely']
};

/**
 * Lightweight AI sentiment classifier
 * @param {string} text - Combined question and response text
 * @returns {number} - Sentiment score from 0 (low stress) to 1 (high stress)
 */
function aiScoreEmotion(text) {
  const lowerText = text.toLowerCase();
  
  // High stress indicators (score 0.8-1.0)
  const highStressPatterns = [
    /\b(very often|always|constantly|never|not at all)\b/g,
    /\b(overwhelmed|panicked|desperate|hopeless|exhausted|burnout)\b/g,
    /\b(can't take it|giving up|nothing helps|emotionally drained)\b/g,
    /\b(toxic|hostile|unsupportive|isolated|alone)\b/g
  ];
  
  // Moderate stress indicators (score 0.5-0.7)
  const moderateStressPatterns = [
    /\b(often|sometimes|frequently|worried|anxious|stressed)\b/g,
    /\b(frustrated|concerned|tired|pressure|deadline)\b/g,
    /\b(overworked|underappreciated|micromanaged)\b/g,
    /\b(relationship problems|family conflict|financial worry)\b/g
  ];
  
  // Low stress indicators (score 0.2-0.4)
  const lowStressPatterns = [
    /\b(rarely|occasionally|slightly|a bit|somewhat)\b/g,
    /\b(managing|coping|handling|dealing with)\b/g,
    /\b(support|help|resources|strategies)\b/g
  ];
  
  // Calculate pattern matches
  let highStressCount = 0;
  let moderateStressCount = 0;
  let lowStressCount = 0;
  
  highStressPatterns.forEach(pattern => {
    const matches = lowerText.match(pattern);
    if (matches) highStressCount += matches.length;
  });
  
  moderateStressPatterns.forEach(pattern => {
    const matches = lowerText.match(pattern);
    if (matches) moderateStressCount += matches.length;
  });
  
  lowStressPatterns.forEach(pattern => {
    const matches = lowerText.match(pattern);
    if (matches) lowStressCount += matches.length;
  });
  
  // Weighted scoring
  const totalScore = (highStressCount * 0.9) + (moderateStressCount * 0.6) + (lowStressCount * 0.3);
  const totalPatterns = highStressCount + moderateStressCount + lowStressCount;
  
  // Normalize to 0-1 range
  const normalizedScore = totalPatterns > 0 ? totalScore / totalPatterns : 0;
  
  // Apply domain-specific adjustments
  const domainAdjustment = getDomainAdjustment(text);
  const finalScore = Math.min(1, Math.max(0, normalizedScore + domainAdjustment));
  
  return finalScore;
}

/**
 * Get domain-specific adjustment for stress scoring
 * @param {string} text - Combined question and response text
 * @returns {number} - Adjustment value (-0.2 to +0.2)
 */
function getDomainAdjustment(text) {
  const lowerText = text.toLowerCase();
  
  // Work domain adjustments
  if (lowerText.includes('work') || lowerText.includes('job') || lowerText.includes('career')) {
    // Work stress is often more chronic and systemic
    if (lowerText.includes('toxic') || lowerText.includes('hostile')) return 0.2;
    if (lowerText.includes('overworked') || lowerText.includes('burnout')) return 0.15;
    if (lowerText.includes('micromanaged') || lowerText.includes('underappreciated')) return 0.1;
  }
  
  // Personal life adjustments
  if (lowerText.includes('relationship') || lowerText.includes('family') || lowerText.includes('personal')) {
    // Personal relationship stress can be deeply emotional
    if (lowerText.includes('toxic relationship') || lowerText.includes('abuse')) return 0.2;
    if (lowerText.includes('lonely') || lowerText.includes('isolated')) return 0.15;
    if (lowerText.includes('conflict') || lowerText.includes('drama')) return 0.1;
  }
  
  // Financial stress adjustments
  if (lowerText.includes('money') || lowerText.includes('financial') || lowerText.includes('debt')) {
    // Financial stress can be existential
    if (lowerText.includes('crisis') || lowerText.includes('can\'t afford')) return 0.2;
    if (lowerText.includes('worry') || lowerText.includes('stress')) return 0.15;
    if (lowerText.includes('budget') || lowerText.includes('expenses')) return 0.05;
  }
  
  // Health stress adjustments
  if (lowerText.includes('health') || lowerText.includes('sleep') || lowerText.includes('physical')) {
    // Health stress can be both physical and mental
    if (lowerText.includes('chronic pain') || lowerText.includes('serious')) return 0.2;
    if (lowerText.includes('anxiety') || lowerText.includes('worry')) return 0.15;
    if (lowerText.includes('tired') || lowerText.includes('fatigue')) return 0.1;
  }
  
  // Identity/self-worth adjustments
  if (lowerText.includes('identity') || lowerText.includes('self-worth') || lowerText.includes('purpose')) {
    // Identity stress can be fundamental
    if (lowerText.includes('crisis') || lowerText.includes('hopeless')) return 0.2;
    if (lowerText.includes('doubt') || lowerText.includes('inadequate')) return 0.15;
    if (lowerText.includes('comparison') || lowerText.includes('perfectionism')) return 0.1;
  }
  
  return 0;
}

/**
 * Detect emotion from response text
 * @param {string} responseText - User's response text
 * @param {string} questionText - Original question text
 * @returns {string} - Detected emotion
 */
function detectEmotion(responseText, questionText) {
  const combinedText = `${responseText} ${questionText}`.toLowerCase();
  
  // Emotion detection patterns
  const emotions = {
    'overwhelmed': ['overwhelmed', 'drained', 'exhausted', 'burnout', 'can\'t take it'],
    'anxious': ['anxious', 'worried', 'nervous', 'panic', 'fear', 'scared'],
    'frustrated': ['frustrated', 'angry', 'irritated', 'annoyed', 'fed up'],
    'sad': ['sad', 'depressed', 'hopeless', 'worthless', 'lonely', 'isolated'],
    'stressed': ['stressed', 'pressure', 'tension', 'strained', 'under pressure'],
    'confused': ['confused', 'uncertain', 'unsure', 'unclear', 'lost'],
    'neutral': ['okay', 'fine', 'alright', 'manageable', 'coping'],
    'positive': ['good', 'great', 'excellent', 'happy', 'satisfied', 'content']
  };
  
  // Find the most prominent emotion
  let maxScore = 0;
  let detectedEmotion = 'neutral';
  
  Object.entries(emotions).forEach(([emotion, keywords]) => {
    const score = keywords.reduce((count, keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = combinedText.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
    
    if (score > maxScore) {
      maxScore = score;
      detectedEmotion = emotion;
    }
  });
  
  return detectedEmotion;
}

/**
 * Detect intensity level from response
 * @param {string} responseText - User's response text
 * @returns {string} - Intensity level ('low', 'moderate', 'high')
 */
function detectIntensity(responseText) {
  const lowerText = responseText.toLowerCase();
  
  // High intensity indicators
  const highIntensity = ['very often', 'always', 'constantly', 'never', 'not at all', 'completely'];
  const hasHighIntensity = highIntensity.some(indicator => lowerText.includes(indicator));
  
  // Moderate intensity indicators
  const moderateIntensity = ['often', 'sometimes', 'frequently', 'mostly', 'somewhat'];
  const hasModerateIntensity = moderateIntensity.some(indicator => lowerText.includes(indicator));
  
  // Low intensity indicators
  const lowIntensity = ['rarely', 'occasionally', 'slightly', 'a bit', 'a little'];
  const hasLowIntensity = lowIntensity.some(indicator => lowerText.includes(indicator));
  
  if (hasHighIntensity) return 'high';
  if (hasModerateIntensity) return 'moderate';
  if (hasLowIntensity) return 'low';
  
  // Default based on emotional content
  const emotionalIntensity = EMOTION_INTENSITY.high.some(emotion => lowerText.includes(emotion));
  if (emotionalIntensity) return 'high';
  
  return 'moderate';
}

/**
 * Main stress detection function
 * @param {string} responseText - User's response text
 * @param {string} questionText - Original question text
 * @param {string} domain - Domain name (optional)
 * @returns {Object} - Stress analysis result
 */
export function isStressfulResponse(responseText, questionText, domain = null) {
  const combinedInput = `${questionText} || ${responseText}`.toLowerCase();
  
  // MCP-based red flags check
  const isFlagged = MCP_RED_FLAGS.some(flag => combinedInput.includes(flag));
  
  // AI sentiment scoring
  const sentimentScore = aiScoreEmotion(combinedInput);
  
  // Emotion and intensity detection
  const emotion = detectEmotion(responseText, questionText);
  const intensity = detectIntensity(responseText);
  
  // Domain-specific keyword check
  let domainStressScore = 0;
  if (domain) {
    const domainKey = domain.toLowerCase().replace(/\s+/g, '');
    const domainKeywords = DOMAIN_STRESS_KEYWORDS[domainKey] || [];
    const domainMatches = domainKeywords.filter(keyword => combinedInput.includes(keyword));
    domainStressScore = domainMatches.length > 0 ? 0.3 : 0;
  }
  
  // Combined decision logic
  const isStressful = sentimentScore > 0.6 || isFlagged || domainStressScore > 0.2;
  
  // Calculate confidence score
  const confidenceScore = Math.min(1, (sentimentScore + (isFlagged ? 0.3 : 0) + domainStressScore) / 1.5);
  
  return {
    isStressful,
    sentimentScore,
    emotion,
    intensity,
    isFlagged,
    domainStressScore,
    confidenceScore,
    redFlags: MCP_RED_FLAGS.filter(flag => combinedInput.includes(flag)),
    domainKeywords: domain ? (DOMAIN_STRESS_KEYWORDS[domain.toLowerCase().replace(/\s+/g, '')] || []).filter(keyword => combinedInput.includes(keyword)) : []
  };
}

/**
 * Enhanced stress analysis with MCP protocol integration
 * @param {string} responseText - User's response text
 * @param {string} questionText - Original question text
 * @param {string} domain - Domain name
 * @returns {Object} - Enhanced stress analysis with MCP protocol
 */
export function analyzeStressWithMCP(responseText, questionText, domain) {
  const stressAnalysis = isStressfulResponse(responseText, questionText, domain);
  
  // Determine MCP protocol level
  let mcpProtocol = 'Support';
  
  if (stressAnalysis.sentimentScore > 0.8 || stressAnalysis.isFlagged) {
    mcpProtocol = 'Escalate';
  } else if (stressAnalysis.sentimentScore > 0.6 || stressAnalysis.intensity === 'high') {
    mcpProtocol = 'Monitor';
  }
  
  // Add MCP-specific insights
  const mcpInsights = {
    protocol: mcpProtocol,
    urgency: stressAnalysis.sentimentScore > 0.7 ? 'high' : stressAnalysis.sentimentScore > 0.5 ? 'medium' : 'low',
    recommendedActions: getMCPRecommendedActions(mcpProtocol, stressAnalysis),
    riskFactors: stressAnalysis.redFlags,
    followUpNeeded: stressAnalysis.sentimentScore > 0.6
  };
  
  return {
    ...stressAnalysis,
    mcp: mcpInsights
  };
}

/**
 * Get MCP protocol recommended actions
 * @param {string} protocol - MCP protocol level
 * @param {Object} stressAnalysis - Stress analysis result
 * @returns {Array} - Recommended actions
 */
function getMCPRecommendedActions(protocol, stressAnalysis) {
  const actions = {
    'Support': [
      'Provide general wellness resources',
      'Encourage self-care practices',
      'Offer stress management tips'
    ],
    'Monitor': [
      'Schedule follow-up check-ins',
      'Provide targeted coping strategies',
      'Recommend stress management techniques',
      'Consider professional support referral'
    ],
    'Escalate': [
      'Immediate professional support referral',
      'Crisis intervention if needed',
      'Safety assessment',
      'Emergency contact information',
      'Regular monitoring and follow-up'
    ]
  };
  
  return actions[protocol] || actions['Support'];
}

/**
 * Batch stress analysis for multiple responses
 * @param {Array} responses - Array of response objects
 * @returns {Object} - Batch analysis results
 */
export function batchStressAnalysis(responses) {
  const results = responses.map(response => ({
    ...response,
    stressAnalysis: isStressfulResponse(response.responseText, response.questionText, response.domain)
  }));
  
  const highStressResponses = results.filter(r => r.stressAnalysis.isStressful);
  const averageSentimentScore = results.reduce((sum, r) => sum + r.stressAnalysis.sentimentScore, 0) / results.length;
  
  return {
    individualResults: results,
    highStressCount: highStressResponses.length,
    averageSentimentScore,
    overallStressLevel: averageSentimentScore > 0.7 ? 'high' : averageSentimentScore > 0.5 ? 'moderate' : 'low',
    domainsNeedingAttention: [...new Set(highStressResponses.map(r => r.domain))],
    mcpProtocol: averageSentimentScore > 0.8 ? 'Escalate' : averageSentimentScore > 0.6 ? 'Monitor' : 'Support'
  };
}

// Simple MCP/AI-based stress detection utility
export function detectStress({ questionText, responseText, domain }) {
  const input = `${questionText} || ${responseText}`.toLowerCase();

  const mcpFlags = [
    "burnout", "worthless", "hopeless", "isolated", "exhausted",
    "panic", "emotionally drained", "no energy", "frustrated", "giving up", "cry"
  ];

  const keywordHit = mcpFlags.some(flag => input.includes(flag));

  // Basic AI sentiment tone logic
  const toneMarkers = [
    "i don't feel heard", "nobody listens", "i hate this", "i can't do this anymore", "i'm tired of it"
  ];
  const toneHit = toneMarkers.some(phrase => input.includes(phrase));

  return keywordHit || toneHit;
}

export default {
  isStressfulResponse,
  analyzeStressWithMCP,
  batchStressAnalysis,
  MCP_RED_FLAGS,
  DOMAIN_STRESS_KEYWORDS
}; 