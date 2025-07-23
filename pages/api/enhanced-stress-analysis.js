/**
 * Enhanced stress analysis API - Simplified version with hardcoded rules
 * Accepts POST with: { questionId, responseText, domain, userId }
 * Returns: { enhancedScore, emotion, causeTag }
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { questionId, responseText, domain, userId } = req.body;

    // Validate required fields
    if (!questionId || !responseText || !domain || !userId) {
      console.error('Missing required fields:', { questionId, responseText, domain, userId });
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: questionId, responseText, domain, userId' 
      });
    }

    console.log(`🧠 Analyzing stress for question ${questionId}, domain: ${domain}`);

    // Use hardcoded rules for reliable stress analysis
    const analysis = analyzeStressWithRules(responseText, domain);

    return res.status(200).json({
      success: true,
      data: {
        enhancedScore: analysis.score,
        emotion: analysis.tag,
        causeTag: analysis.causeTag,
        intensity: analysis.intensity,
        labelColor: analysis.labelColor,
        reason: analysis.reason
      }
    });

  } catch (error) {
    console.error('Enhanced Stress Analysis Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error during enhanced stress analysis' 
    });
  }
}

/**
 * Analyze stress using hardcoded rules instead of AI
 */
function analyzeStressWithRules(responseText, domain) {
  const lowerResponse = responseText.toLowerCase();
  const lowerDomain = domain.toLowerCase();

  // Answer severity mapping
  const highStressAnswers = ['never', 'not at all', 'rarely', 'hardly ever'];
  const mediumStressAnswers = ['sometimes', 'somewhat', 'a little', 'occasionally'];
  const lowStressAnswers = ['often', 'very often', 'mostly', 'completely', 'always', 'frequently'];

  // Domain-specific keywords
  const workKeywords = ['work', 'job', 'career', 'professional', 'office', 'boss', 'colleague'];
  const personalKeywords = ['personal', 'life', 'family', 'relationship', 'friend', 'social'];
  const healthKeywords = ['health', 'sleep', 'exercise', 'diet', 'physical', 'mental'];

  // Determine if this is a work, personal, or health domain
  const isWorkDomain = workKeywords.some(keyword => lowerDomain.includes(keyword));
  const isPersonalDomain = personalKeywords.some(keyword => lowerDomain.includes(keyword));
  const isHealthDomain = healthKeywords.some(keyword => lowerDomain.includes(keyword));

  // Stress indicators in the response
  const stressKeywords = [
    'overwhelmed', 'stressed', 'anxious', 'worried', 'exhausted', 'burned out',
    'tired', 'drained', 'frustrated', 'angry', 'sad', 'depressed', 'lonely',
    'isolated', 'unsupported', 'unappreciated', 'undervalued', 'stuck'
  ];

  let score = 5; // default moderate
  let tag = 'Low Stress';
  let causeTag = 'low_stress';
  let intensity = 'Moderate';
  let labelColor = 'yellow';
  let reason = 'Response indicates moderate stress levels';

  // Check for stress keywords in response
  const hasStressKeywords = stressKeywords.some(keyword => lowerResponse.includes(keyword));

  // Analyze answer patterns
  if (highStressAnswers.some(ans => lowerResponse.includes(ans))) {
    if (hasStressKeywords) {
      score = 8;
      tag = 'Burnout Risk';
      causeTag = 'burnout';
      intensity = 'High';
      labelColor = 'red';
      reason = 'Frequent negative experiences with stress indicators';
    } else {
      score = 6;
      tag = 'Workload Overwhelm';
      causeTag = 'overwork';
      intensity = 'Moderate';
      labelColor = 'yellow';
      reason = 'Regular negative experiences suggest moderate stress';
    }
  } else if (mediumStressAnswers.some(ans => lowerResponse.includes(ans))) {
    score = 5;
    tag = 'Emotional Disconnection';
    causeTag = 'insecurity';
    intensity = 'Moderate';
    labelColor = 'yellow';
    reason = 'Occasional challenges indicate moderate stress';
  } else if (lowStressAnswers.some(ans => lowerResponse.includes(ans))) {
    if (hasStressKeywords) {
      score = 7;
      tag = 'Energy Depletion';
      causeTag = 'overwhelm';
      intensity = 'High';
      labelColor = 'red';
      reason = 'Frequent experiences with stress indicators';
    } else {
      score = 3;
      tag = 'Low Stress';
      causeTag = 'low_stress';
      intensity = 'Low';
      labelColor = 'green';
      reason = 'Positive experiences indicate low stress';
    }
  }

  // Domain-specific adjustments
  if (isWorkDomain) {
    if (score >= 7) {
      tag = 'Burnout Risk';
      causeTag = 'burnout';
    } else if (score >= 5) {
      tag = 'Workload Overwhelm';
      causeTag = 'overwork';
    }
  } else if (isPersonalDomain) {
    if (score >= 7) {
      tag = 'Social Isolation';
      causeTag = 'loneliness';
    } else if (score >= 5) {
      tag = 'Emotional Disconnection';
      causeTag = 'relationship_stress';
    }
  } else if (isHealthDomain) {
    if (score >= 7) {
      tag = 'Health Neglect';
      causeTag = 'health_anxiety';
    } else if (score >= 5) {
      tag = 'Self-Care Deficiency';
      causeTag = 'self_worth';
    }
  }

  return {
    score,
    tag,
    causeTag,
    intensity,
    labelColor,
    reason
  };
} 