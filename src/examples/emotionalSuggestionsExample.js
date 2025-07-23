/**
 * Example usage of the new emotional suggestions pattern
 * 
 * This file demonstrates how to use the improved OpenAI integration
 * for generating emotional support and wellness insights.
 */

import { generateEmotionalSuggestions, generateCopingStrategies, generateWellnessInsights, analyzeStressLevel } from '../services/aiSuggestions';
import mcpService from '../services/mcp';

// Example 1: Basic emotional suggestions
export async function exampleBasicSuggestions() {
  const selectedOptions = [
    { label: 'workload' },
    { label: 'lack of recognition' },
    { label: 'manager support' }
  ];

  const suggestions = await generateEmotionalSuggestions(
    selectedOptions,
    mcpService._callOpenAIChat.bind(mcpService)
  );

  console.log('Emotional Suggestions:', suggestions);
  // Expected output:
  // {
  //   summary: "You're feeling overwhelmed by your workload and lack of recognition...",
  //   insight: "Many people struggle with feeling undervalued at work...",
  //   tips: ["Take a 5-min self-check break mid-day", "Note 1 thing that's in your control right now", "Talk to someone you trust this week"]
  // }
}

// Example 2: Coping strategies for specific domain
export async function exampleCopingStrategies() {
  const stressFactors = ['workload', 'deadlines', 'team conflicts'];
  const domain = 'Work & Career';
  const userId = 'user-123';

  const copingData = await generateCopingStrategies(
    userId,
    stressFactors,
    domain
  );

  console.log('Coping Strategies:', copingData);
  // Expected output:
  // {
  //   validation: "It's completely normal to feel overwhelmed when dealing with multiple stressors...",
  //   strategies: ["Break down overwhelming tasks into smaller, manageable steps", "Practice deep breathing for 2-3 minutes when feeling stressed", "Reach out to a trusted friend or colleague for support"],
  //   selfCompassion: "Remember to be kind to yourself - you're doing the best you can."
  // }
}

// Example 3: Wellness insights for dashboard
export async function exampleWellnessInsights() {
  const userId = 'user-123';
  const userContext = {
    stressIntensity: 'medium',
    highStressDomains: ['Work & Career', 'Financial Stress'],
    contextualMemory: { input: 'feeling overwhelmed with work and money' }
  };

  const insights = await generateWellnessInsights(userId, userContext);

  console.log('Wellness Insights:', insights);
  // Expected output:
  // {
  //   insight: "You're showing awareness of your wellness needs, which is a great first step...",
  //   recommendations: ["Consider setting aside 10 minutes daily for self-reflection", "Explore stress management techniques that work for you", "Build a support network of trusted friends or colleagues"],
  //   affirmation: "You have the strength and wisdom to navigate challenges and grow through them."
  // }
}

// Example 4: Integration with survey responses
export async function exampleSurveyIntegration(surveyResponses) {
  // Extract stress factors from survey responses
  const stressFactors = surveyResponses
    .filter(response => response.stressScore >= 3)
    .map(response => response.stressFactor);

  // Generate emotional support
  const emotionalSupport = await generateEmotionalSuggestions(
    stressFactors.map(factor => ({ label: factor })),
    mcpService._callOpenAIChat.bind(mcpService)
  );

  // Generate domain-specific coping strategies
  const copingStrategies = await generateCopingStrategies(
    'user-123',
    stressFactors,
    'Work & Career'
  );

  return {
    emotionalSupport,
    copingStrategies,
    combinedMessage: `${emotionalSupport.summary}\n\n${copingStrategies.strategies.join('\n')}\n\n${copingStrategies.selfCompassion}`
  };
}

// Example 5: Error handling demonstration
export async function exampleErrorHandling() {
  try {
    // This will use fallback data if OpenAI fails
    const suggestions = await generateEmotionalSuggestions(
      [{ label: 'stress' }],
      async () => { throw new Error('OpenAI API error'); } // Simulate API failure
    );

    console.log('Fallback suggestions:', suggestions);
    // Will still return valid fallback data
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Example 6: Stress level analysis for individual responses
export async function exampleStressAnalysis() {
  const question = "Over the past two weeks, how often have you felt emotionally drained by your work?";
  const answers = [
    "Never",
    "Sometimes", 
    "Often",
    "Very Often"
  ];

  console.log('Analyzing stress levels for different answers:');
  
  for (const answer of answers) {
    try {
      const analysis = await analyzeStressLevel(answer, question);
      console.log(`\nAnswer: "${answer}"`);
      console.log(`Analysis:`, analysis);
      // Expected output for "Very Often":
      // {
      //   score: 8,
      //   emotion: "Overwhelmed", 
      //   intensity: "High"
      // }
    } catch (error) {
      console.error(`Error analyzing "${answer}":`, error);
    }
  }
}

// Example 7: Batch analysis for survey responses
export async function exampleBatchStressAnalysis(surveyResponses) {
  const analyses = [];
  
  for (const response of surveyResponses) {
    const analysis = await analyzeStressLevel(response.answer, response.question);
    analyses.push({
      questionId: response.questionId,
      question: response.question,
      answer: response.answer,
      analysis: analysis
    });
  }
  
  // Calculate overall stress metrics
  const avgStressScore = analyses.reduce((sum, item) => sum + item.analysis.score, 0) / analyses.length;
  const highStressCount = analyses.filter(item => item.analysis.intensity === 'High').length;
  const dominantEmotion = getMostFrequent(analyses.map(item => item.analysis.emotion));
  
  return {
    individualAnalyses: analyses,
    summary: {
      averageStressScore: Math.round(avgStressScore * 10) / 10,
      highStressQuestions: highStressCount,
      dominantEmotion: dominantEmotion,
      totalQuestions: analyses.length
    }
  };
}

// Helper function to get most frequent emotion
function getMostFrequent(emotions) {
  const counts = emotions.reduce((acc, emotion) => {
    acc[emotion] = (acc[emotion] || 0) + 1;
    return acc;
  }, {});
  
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
}

// Example 8: Personalized Deep Dive Analysis
export async function examplePersonalizedDeepDive() {
  const stressedQuestions = [
    {
      id: 'work_1',
      text: 'Over the past two weeks, how often have you felt emotionally drained by your work?',
      answerLabel: 'Very Often',
      emotion: 'Overwhelmed',
      intensity: 'High',
      stressScore: 8
    },
    {
      id: 'financial_1', 
      text: 'How often do financial concerns keep you awake at night?',
      answerLabel: 'Often',
      emotion: 'Anxious',
      intensity: 'High',
      stressScore: 7
    }
  ];

  console.log('Generating personalized deep dive insights...');
  
  for (const question of stressedQuestions) {
    try {
      const personalizedPrompt = `You are an empathetic therapist AI.

A user is experiencing high stress on this question:
Q: "${question.text}"
A: "${question.answerLabel}"

Generate:
1. Insight: emotionally validating the user's experience.
2. Try this: 2 specific actionable steps that help the user gain confidence.
3. Stress contributors: 3-5 checkbox items relevant to this answer.
4. Final therapist-style advice (as if responding to them in a session).

Respond in this format:
{
  "insight": "...",
  "tryThis": ["...", "..."],
  "stressContributors": ["...", "..."],
  "finalAdvice": "..."
}`;

      // Simulate the response (in real app, this would call OpenAI)
      const mockResponse = {
        insight: `I can see that ${question.text.toLowerCase()} is really taking a toll on you. When work feels this draining, it's not just about the tasks - it's about feeling like you're constantly giving without getting enough back. That's exhausting, and your feelings are completely valid.`,
        tryThis: [
          "Set clear boundaries around your work hours - even 15 minutes of 'me time' can help",
          "Identify one small thing you can control today, no matter how small"
        ],
        stressContributors: [
          "Feeling constantly drained",
          "Lack of work-life balance", 
          "Unclear expectations",
          "Feeling undervalued",
          "Difficulty saying no"
        ],
        finalAdvice: "Remember, you're not alone in feeling this way. Many people struggle with similar concerns, and it's okay to ask for help when you need it. You deserve to feel supported and valued in your work."
      };

      console.log(`\n=== Personalized Analysis for: ${question.text} ===`);
      console.log(`Answer: ${question.answerLabel}`);
      console.log(`Emotion: ${question.emotion} (${question.intensity} intensity)`);
      console.log(`\nTherapist Insight:`);
      console.log(mockResponse.insight);
      console.log(`\nTry This:`);
      mockResponse.tryThis.forEach((action, index) => {
        console.log(`${index + 1}. ${action}`);
      });
      console.log(`\nStress Contributors:`);
      mockResponse.stressContributors.forEach((factor, index) => {
        console.log(`- ${factor}`);
      });
      console.log(`\nFinal Therapist Advice:`);
      console.log(`"${mockResponse.finalAdvice}"`);
      
    } catch (error) {
      console.error(`Error analyzing "${question.text}":`, error);
    }
  }
}

// Example 9: Dynamic Stress Factors Generation
export async function exampleDynamicStressFactors() {
  const questionAnswerPairs = [
    {
      question: "How satisfied are you with your sleep quality?",
      answer: "Poor",
      domain: "Health"
    },
    {
      question: "How often do you feel you can be your authentic self at work?",
      answer: "Rarely", 
      domain: "Work & Career"
    }
  ];

  console.log('Generating dynamic stress factors...');
  
  for (const pair of questionAnswerPairs) {
    try {
      const stressFactorsPrompt = `
Based on this specific situation, generate 3-5 specific stress factors this person might be experiencing:

Question: "${pair.question}"
Answer: "${pair.answer}"
Domain: ${pair.domain}

Generate stress factors that are:
- Specific to this exact situation
- Worded in a way that feels personal and relatable
- Not generic, but tailored to their answer

Example format:
["Specific factor 1", "Specific factor 2", "Specific factor 3", "Specific factor 4", "Specific factor 5"]
`;

      // Simulate the response
      const mockFactors = pair.domain === "Health" ? [
        "Difficulty falling asleep",
        "Waking up feeling unrested",
        "Worrying about sleep quality",
        "Feeling tired throughout the day",
        "Impact on daily energy levels"
      ] : [
        "Feeling like you have to wear a mask at work",
        "Suppressing your true personality",
        "Fear of being judged for being yourself",
        "Exhaustion from pretending",
        "Feeling disconnected from your authentic self"
      ];

      console.log(`\nQuestion: "${pair.question}"`);
      console.log(`Answer: "${pair.answer}"`);
      console.log(`Domain: ${pair.domain}`);
      console.log(`Generated Stress Factors:`);
      mockFactors.forEach((factor, index) => {
        console.log(`${index + 1}. ${factor}`);
      });
      
    } catch (error) {
      console.error(`Error generating stress factors for "${pair.question}":`, error);
    }
  }
} 