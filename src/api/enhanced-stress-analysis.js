import dotenv from 'dotenv';
dotenv.config();

import { AzureChatOpenAI } from "@langchain/azure-openai";

/**
 * Enhanced stress analysis API for per-question analysis
 * Returns detailed stress analysis including emotional tone, cause area, and keywords
 */
export async function enhancedStressAnalysisAPI(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const { questionId, responseText, domain, userId } = req.body;

    if (!questionId || !responseText || !domain || !userId) {
      console.error('Missing required fields:', { questionId, responseText, domain, userId });
      return res.status(400).json({ success: false, error: 'Missing required fields: questionId, responseText, domain, userId' });
    }

    // Setup Azure OpenAI
    const azureKey = process.env.AZURE_OPENAI_KEY || "6Teijvr6VDdNQ9WT6f1JdHVdqhfuTkyrLeRDbsa5K7DcwiwKkdeWJQQJ99BEACYeBjFXJ3w3AAABACOGYB7D";
    const azureEndpoint = process.env.AZURE_OPENAI_API_ENDPOINT || "https://manova.openai.azure.com/";
    const azureDeployment = process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME || "gpt-4o";
    const azureVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview";

    const model = new AzureChatOpenAI({
      azureOpenAIApiKey: azureKey,
      azureOpenAIApiDeploymentName: azureDeployment,
      azureOpenAIApiInstanceName: "Manova",
      azureOpenAIApiVersion: azureVersion,
      azureOpenAIEndpoint: azureEndpoint,
      temperature: 0.3
    });

    const prompt = `You are an expert mental wellness psychologist with deep understanding of stress indicators and question context.

CRITICAL ANALYSIS RULES:
1. POSITIVE QUESTIONS: When a question asks about POSITIVE things (support, recognition, energy, meaningful relationships), answers like "Never" or "Not at all" indicate HIGH STRESS
2. NEGATIVE QUESTIONS: When a question asks about NEGATIVE things (feeling drained, overwhelmed, conflict), answers like "Never" indicate LOW STRESS
3. CONTEXT MATTERS: Same answer means different things based on what's being asked

Question: "${responseText}"
Answer: "${responseText}"
Domain: "${domain || 'General'}"

QUESTION INTENT ANALYSIS:
- If question asks about: support, recognition, energy, meaningful connections, positive experiences, satisfaction → POSITIVE intent
- If question asks about: exhaustion, overwhelm, conflict, stress, burnout, negative experiences → NEGATIVE intent

SCORING LOGIC:
For POSITIVE intent questions: Never/Not at all = 9-10 stress, Often/Completely = 1-2 stress
For NEGATIVE intent questions: Never/Not at all = 1-2 stress, Often/Very Often = 9-10 stress

Return ONLY a JSON object with this exact structure:
{
  "score": 1-10,
  "tag": "Support Deficiency" | "Emotional Disconnection" | "Energy Depletion" | "Recognition Deficit" | "Workload Overwhelm" | "Social Isolation" | "Financial Strain" | "Health Neglect" | "Identity Crisis" | "Burnout Risk" | "Low Stress",
  "causeTag": "burnout" | "insecurity" | "relationship_stress" | "financial_fear" | "overwork" | "loneliness" | "perfectionism" | "impostor_syndrome" | "boundary_issues" | "abandonment_fear" | "career_stagnation" | "health_anxiety" | "self_worth" | "communication_issues" | "time_pressure" | "rejection_fear" | "inadequacy" | "overwhelm" | "isolation" | "low_stress",
  "intensity": "Low" | "Moderate" | "High",
  "labelColor": "green" | "yellow" | "red",
  "reason": "Brief sentence explaining why this indicates stress based on question intent and answer"
}

STRESS TAG GUIDELINES:
- Support Deficiency: Lack of emotional/professional support
- Emotional Disconnection: Poor relationships, isolation from others
- Energy Depletion: Physical/emotional exhaustion, burnout
- Recognition Deficit: Lack of acknowledgment, feeling undervalued
- Workload Overwhelm: Too much work, overextension
- Social Isolation: Loneliness, lack of meaningful connections
- Financial Strain: Money-related stress and anxiety
- Health Neglect: Poor self-care, health issues
- Identity Crisis: Self-worth, purpose, identity issues
- Burnout Risk: High exhaustion with multiple stress factors
- Low Stress: Minimal or no stress indicators

EMOTIONAL CAUSE TAG GUIDELINES:
Select the most specific underlying emotional cause:
- burnout: Physical/emotional exhaustion from prolonged stress
- insecurity: Lack of confidence or feeling uncertain
- relationship_stress: Interpersonal conflicts or relationship issues
- financial_fear: Worry about money, debt, or financial security
- overwork: Taking on too much work or responsibilities
- loneliness: Feeling isolated or lacking meaningful connections
- perfectionism: Setting unrealistic standards for oneself
- impostor_syndrome: Feeling like a fraud despite accomplishments
- boundary_issues: Difficulty setting or maintaining healthy boundaries
- abandonment_fear: Fear of being left alone or rejected
- career_stagnation: Feeling stuck or unfulfilled in career growth
- health_anxiety: Worry about physical health or wellness
- self_worth: Questioning one's value or worthiness
- communication_issues: Problems expressing needs or understanding others
- time_pressure: Feeling rushed or unable to manage time effectively
- rejection_fear: Fear of not being accepted or approved
- inadequacy: Feeling not good enough or insufficient
- overwhelm: Feeling unable to cope with current demands
- isolation: Being cut off from support systems or community
- low_stress: No significant emotional stressors identified

INTENSITY AND COLOR MAPPING:
- Score 1-3: Low intensity, green color
- Score 4-6: Moderate intensity, yellow color
- Score 7-10: High intensity, red color

Be precise and context-aware. The same answer can indicate different stress levels based on question intent.`;

    const aiResponse = await model.invoke([
      { role: 'system', content: 'You are an expert mental health AI. Respond only with valid JSON.' },
      { role: 'user', content: prompt }
    ]);

    let analysisResult;
    try {
      // Clean the response to ensure it's valid JSON
      let cleanedResponse = aiResponse.content.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
      }
      
      analysisResult = JSON.parse(cleanedResponse);
      
      // Validate the response structure
      if (!analysisResult.score || !analysisResult.tag || !analysisResult.causeTag || !analysisResult.intensity || !analysisResult.labelColor || !analysisResult.reason) {
        throw new Error('Invalid response structure');
      }
      
    } catch (e) {
      console.warn('⚠️ Enhanced analysis fallback used');
      console.warn('Raw AI Response:', aiResponse.content);
      
      // Create intelligent fallback based on answer patterns
      const fallbackAnalysis = createFallbackAnalysis(responseText, responseText, domain);
      analysisResult = fallbackAnalysis;
    }

    return res.status(200).json({
      success: true,
      data: analysisResult
    });

  } catch (error) {
    console.error('Enhanced Stress Analysis Error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal server error during enhanced stress analysis' });
  }
}

/**
 * Enhanced fallback analysis with intelligent question intent detection
 */
function createFallbackAnalysis(question, answer, domain) {
  const lowerQuestion = question.toLowerCase();
  const lowerAnswer = answer.toLowerCase();
  
  // Detect question intent - positive vs negative
  const positiveIntentKeywords = ['support', 'recognition', 'energy', 'meaningful', 'positive', 'satisfaction', 'acknowledgment', 'valued', 'understood', 'complete'];
  const negativeIntentKeywords = ['drained', 'exhausted', 'overwhelmed', 'conflict', 'stress', 'burnout', 'difficult', 'pressure', 'beyond capacity'];
  
  const isPositiveIntent = positiveIntentKeywords.some(keyword => lowerQuestion.includes(keyword));
  const isNegativeIntent = negativeIntentKeywords.some(keyword => lowerQuestion.includes(keyword));
  
  // Answer severity mapping
  const highStressAnswers = ['never', 'not at all', 'rarely'];
  const mediumStressAnswers = ['sometimes', 'somewhat', 'a little'];
  const lowStressAnswers = ['often', 'very often', 'mostly', 'completely'];
  
  let score = 5; // default moderate
  let tag = 'Low Stress';
  let reason = 'Response indicates manageable stress levels';
  
  // Smart scoring based on question intent
  if (isPositiveIntent) {
    // For positive questions, lack of positive experiences = high stress
    if (highStressAnswers.some(ans => lowerAnswer.includes(ans))) {
      score = 9;
      tag = 'Support Deficiency';
      reason = 'Lack of positive experiences or support indicates significant stress';
    } else if (mediumStressAnswers.some(ans => lowerAnswer.includes(ans))) {
      score = 5;
      tag = 'Recognition Deficit';
      reason = 'Limited positive experiences suggest moderate stress';
    } else if (lowStressAnswers.some(ans => lowerAnswer.includes(ans))) {
      score = 2;
      tag = 'Low Stress';
      reason = 'Regular positive experiences indicate low stress';
    }
  } else if (isNegativeIntent) {
    // For negative questions, high frequency = high stress
    if (lowStressAnswers.some(ans => lowerAnswer.includes(ans))) {
      score = 9;
      tag = 'Energy Depletion';
      reason = 'Frequent negative experiences indicate high stress';
    } else if (mediumStressAnswers.some(ans => lowerAnswer.includes(ans))) {
      score = 5;
      tag = 'Workload Overwhelm';
      reason = 'Occasional negative experiences suggest moderate stress';
    } else if (highStressAnswers.some(ans => lowerAnswer.includes(ans))) {
      score = 2;
      tag = 'Low Stress';
      reason = 'Rare negative experiences indicate low stress';
    }
  } else {
    // General stress detection for unclear questions
    const stressKeywords = ['overwhelmed', 'stressed', 'anxious', 'worried', 'exhausted', 'burned out'];
    if (stressKeywords.some(keyword => lowerAnswer.includes(keyword))) {
      score = 7;
      tag = 'Emotional Disconnection';
      reason = 'Response contains stress indicators';
    }
  }
  
  // Domain-specific tag refinement and cause mapping
  let causeTag = 'low_stress';
  
  if (domain === 'Work & Career') {
    if (tag === 'Support Deficiency') {
      tag = 'Recognition Deficit';
      causeTag = score >= 7 ? 'burnout' : 'insecurity';
    }
    if (tag === 'Energy Depletion') {
      tag = 'Burnout Risk';
      causeTag = 'burnout';
    }
    if (score >= 7) causeTag = 'overwork';
    else if (score >= 4) causeTag = 'career_stagnation';
  } else if (domain === 'Personal Life') {
    if (tag === 'Support Deficiency') {
      tag = 'Social Isolation';
      causeTag = 'loneliness';
    }
    if (tag === 'Energy Depletion') {
      tag = 'Emotional Disconnection';
      causeTag = 'relationship_stress';
    }
    if (score >= 7) causeTag = 'relationship_stress';
    else if (score >= 4) causeTag = 'boundary_issues';
  } else if (domain === 'Financial Stress') {
    tag = 'Financial Strain';
    causeTag = score >= 7 ? 'financial_fear' : 'financial_fear';
  } else if (domain === 'Health') {
    tag = 'Health Neglect';
    causeTag = score >= 7 ? 'health_anxiety' : 'health_anxiety';
  } else if (domain === 'Self-Worth & Identity') {
    tag = 'Identity Crisis';
    causeTag = score >= 7 ? 'inadequacy' : score >= 4 ? 'self_worth' : 'insecurity';
  }
  
  // Determine intensity and label color based on score
  let intensity = 'Low';
  let labelColor = 'green';
  
  if (score >= 7) {
    intensity = 'High';
    labelColor = 'red';
  } else if (score >= 4) {
    intensity = 'Moderate';
    labelColor = 'yellow';
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

/**
 * Extract keywords from answer text
 */
function extractKeywords(text) {
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can'];
  
  const words = text.split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !commonWords.includes(word))
    .slice(0, 4);
  
  return words.length > 0 ? words : ['response', 'general'];
}

export default enhancedStressAnalysisAPI;