/**
 * Progress Trend Analysis Service
 * Analyzes user's stress and emotional patterns from Firestore and Pinecone
 * to provide personalized insights and trend summaries
 */

import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { querySimilarVectors } from '../utils/vectorStore';

/**
 * Generate a comprehensive progress summary for a user
 * @param {string} userId - The user's unique identifier
 * @returns {Promise<Object>} Progress summary with insights and trends
 */
export const generateProgressSummary = async (userId) => {
  try {
    console.log(`🔍 Generating progress summary for user: ${userId}`);
    
    // Step 1: Fetch last 3 check-ins from Firestore
    const checkIns = await fetchRecentCheckIns(userId, 3);
    console.log(`📊 Found ${checkIns.length} recent check-ins`);
    
    if (checkIns.length === 0) {
      return generateFirstTimeUserSummary();
    }
    
    // Step 2: Analyze Firestore data patterns
    const firestoreAnalysis = analyzeFirestorePatterns(checkIns);
    
    // Step 3: Query Pinecone for emotional vector patterns
    const vectorAnalysis = await analyzeVectorPatterns(userId, checkIns);
    
    // Step 4: Generate GPT-style insight summary
    const summary = await generateInsightSummary(firestoreAnalysis, vectorAnalysis, userId);
    
    console.log('✅ Progress summary generated successfully');
    return summary;
    
  } catch (error) {
    console.error('❌ Error generating progress summary:', error);
    return generateFallbackSummary();
  }
};

/**
 * Fetch recent check-ins from Firestore
 * @param {string} userId - User ID
 * @param {number} count - Number of recent check-ins to fetch
 * @returns {Promise<Array>} Recent check-ins data
 */
const fetchRecentCheckIns = async (userId, count = 3) => {
  try {
    // Query wellness survey results
    const surveyQuery = query(
      collection(db, 'wellnessSurveyResults'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(count)
    );
    
    const surveySnapshot = await getDocs(surveyQuery);
    const surveyResults = [];
    
    surveySnapshot.forEach((doc) => {
      const data = doc.data();
      surveyResults.push({
        id: doc.id,
        timestamp: data.timestamp,
        wellnessScore: data.wellnessScore || data.totalScore || 0,
        domainScores: data.domainScores || {},
        emotions: data.emotions || {},
        stressAnalysis: data.stressAnalysis || {},
        type: 'survey'
      });
    });
    
    // Also query deep dive insights
    const deepDiveQuery = query(
      collection(db, 'deepDiveInsights'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(count)
    );
    
    const deepDiveSnapshot = await getDocs(deepDiveQuery);
    const deepDiveResults = [];
    
    deepDiveSnapshot.forEach((doc) => {
      const data = doc.data();
      deepDiveResults.push({
        id: doc.id,
        timestamp: data.timestamp,
        domain: data.domain,
        stressContributors: data.reasons || [],
        customReason: data.customReason,
        aiSummary: data.aiSummary,
        type: 'deepdive'
      });
    });
    
    // Combine and sort by timestamp
    const allCheckIns = [...surveyResults, ...deepDiveResults];
    allCheckIns.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return allCheckIns.slice(0, count);
    
  } catch (error) {
    console.error('Error fetching recent check-ins:', error);
    return [];
  }
};

/**
 * Analyze patterns in Firestore check-in data
 * @param {Array} checkIns - Recent check-ins data
 * @returns {Object} Analysis of patterns and trends
 */
const analyzeFirestorePatterns = (checkIns) => {
  console.log('🔬 Analyzing Firestore patterns...');
  
  const analysis = {
    wellnessScores: [],
    dominantDomains: {},
    dominantEmotions: {},
    stressContributors: [],
    timespan: null,
    trend: 'stable'
  };
  
  // Extract wellness scores and calculate trend
  checkIns.forEach((checkIn, index) => {
    if (checkIn.wellnessScore) {
      analysis.wellnessScores.push({
        score: checkIn.wellnessScore,
        timestamp: checkIn.timestamp,
        recency: index // 0 = most recent
      });
    }
    
    // Aggregate domain stress levels
    if (checkIn.domainScores) {
      Object.entries(checkIn.domainScores).forEach(([domain, score]) => {
        if (!analysis.dominantDomains[domain]) {
          analysis.dominantDomains[domain] = [];
        }
        analysis.dominantDomains[domain].push(score);
      });
    }
    
    // Aggregate emotions
    if (checkIn.emotions) {
      Object.entries(checkIn.emotions).forEach(([emotion, intensity]) => {
        if (!analysis.dominantEmotions[emotion]) {
          analysis.dominantEmotions[emotion] = [];
        }
        analysis.dominantEmotions[emotion].push(intensity);
      });
    }
    
    // Collect stress contributors
    if (checkIn.stressContributors) {
      analysis.stressContributors.push(...checkIn.stressContributors);
    }
  });
  
  // Calculate wellness trend
  if (analysis.wellnessScores.length >= 2) {
    const recent = analysis.wellnessScores[0].score;
    const older = analysis.wellnessScores[analysis.wellnessScores.length - 1].score;
    const change = recent - older;
    
    if (change > 5) analysis.trend = 'improving';
    else if (change < -5) analysis.trend = 'declining';
    else analysis.trend = 'stable';
  }
  
  // Calculate timespan
  if (checkIns.length >= 2) {
    const newest = new Date(checkIns[0].timestamp);
    const oldest = new Date(checkIns[checkIns.length - 1].timestamp);
    const daysDiff = Math.ceil((newest - oldest) / (1000 * 60 * 60 * 24));
    analysis.timespan = daysDiff;
  }
  
  console.log('📈 Firestore analysis complete:', {
    scoresCount: analysis.wellnessScores.length,
    trend: analysis.trend,
    timespan: analysis.timespan
  });
  
  return analysis;
};

/**
 * Analyze emotional patterns from Pinecone vector data
 * @param {string} userId - User ID
 * @param {Array} checkIns - Recent check-ins for context
 * @returns {Promise<Object>} Vector pattern analysis
 */
const analyzeVectorPatterns = async (userId, checkIns) => {
  console.log('🧠 Analyzing vector patterns from Pinecone...');
  
  try {
    // Query Pinecone for similar emotional patterns
    // Use the most recent check-in as a query vector if available
    const recentCheckIn = checkIns[0];
    
    // For now, we'll simulate vector analysis since we need an actual embedding
    // In a real implementation, you'd generate an embedding from recent emotional state
    const mockEmbedding = new Array(1536).fill(0.1); // Placeholder embedding
    
    const similarVectors = await querySimilarVectors(userId, mockEmbedding, 10);
    
    const vectorAnalysis = {
      recurringPatterns: [],
      emotionalProgression: [],
      triggerFrequency: {},
      averageStressLevel: 0
    };
    
    // Analyze recurring patterns from vector metadata
    similarVectors.forEach((vector) => {
      if (vector.metadata) {
        const { emotion, stressScore, domain, response } = vector.metadata;
        
        // Track recurring emotional patterns
        if (emotion) {
          vectorAnalysis.recurringPatterns.push(emotion);
        }
        
        // Track trigger frequency
        if (domain) {
          vectorAnalysis.triggerFrequency[domain] = 
            (vectorAnalysis.triggerFrequency[domain] || 0) + 1;
        }
        
        // Calculate average stress
        if (stressScore) {
          vectorAnalysis.averageStressLevel += stressScore;
        }
      }
    });
    
    // Calculate averages
    if (similarVectors.length > 0) {
      vectorAnalysis.averageStressLevel /= similarVectors.length;
    }
    
    console.log('🔍 Vector analysis complete:', {
      patternsFound: vectorAnalysis.recurringPatterns.length,
      avgStress: vectorAnalysis.averageStressLevel,
      topTriggers: Object.keys(vectorAnalysis.triggerFrequency).slice(0, 3)
    });
    
    return vectorAnalysis;
    
  } catch (error) {
    console.error('Error analyzing vector patterns:', error);
    return {
      recurringPatterns: [],
      emotionalProgression: [],
      triggerFrequency: {},
      averageStressLevel: 0
    };
  }
};

/**
 * Generate GPT-style insight summary
 * @param {Object} firestoreAnalysis - Analysis from Firestore data
 * @param {Object} vectorAnalysis - Analysis from Pinecone data
 * @param {string} userId - User ID for personalization
 * @returns {Promise<Object>} Generated insight summary
 */
const generateInsightSummary = async (firestoreAnalysis, vectorAnalysis, userId) => {
  console.log('✨ Generating personalized insight summary...');
  
  try {
    // Determine dominant emotion
    const dominantEmotion = getDominantEmotion(firestoreAnalysis, vectorAnalysis);
    
    // Determine top stress domain
    const topStressDomain = getTopStressDomain(firestoreAnalysis, vectorAnalysis);
    
    // Determine repeat trigger
    const repeatTrigger = getRepeatTrigger(firestoreAnalysis, vectorAnalysis);
    
    // Generate trend indicator
    const trendIndicator = generateTrendIndicator(firestoreAnalysis);
    
    // Generate personalized summary text
    const summaryText = generateSummaryText(
      firestoreAnalysis,
      vectorAnalysis,
      dominantEmotion,
      topStressDomain,
      repeatTrigger
    );
    
    return {
      summary: summaryText,
      trend: trendIndicator,
      dominantEmotion: dominantEmotion,
      repeatTrigger: repeatTrigger,
      timespan: firestoreAnalysis.timespan,
      checkInsAnalyzed: firestoreAnalysis.wellnessScores.length,
      lastScore: firestoreAnalysis.wellnessScores[0]?.score || null,
      averageScore: firestoreAnalysis.wellnessScores.reduce((sum, s) => sum + s.score, 0) / firestoreAnalysis.wellnessScores.length || 0
    };
    
  } catch (error) {
    console.error('Error generating insight summary:', error);
    return generateFallbackSummary();
  }
};

/**
 * Helper functions for analysis
 */

const getDominantEmotion = (firestoreAnalysis, vectorAnalysis) => {
  // Combine emotions from both sources
  const allEmotions = [
    ...Object.keys(firestoreAnalysis.dominantEmotions),
    ...vectorAnalysis.recurringPatterns
  ];
  
  if (allEmotions.length === 0) return 'Neutral';
  
  // Count frequency
  const emotionCounts = {};
  allEmotions.forEach(emotion => {
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
  });
  
  // Return most frequent emotion
  return Object.entries(emotionCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Mixed';
};

const getTopStressDomain = (firestoreAnalysis, vectorAnalysis) => {
  // Combine domain data from both sources
  const domainStress = { ...firestoreAnalysis.dominantDomains };
  
  Object.entries(vectorAnalysis.triggerFrequency).forEach(([domain, frequency]) => {
    if (!domainStress[domain]) domainStress[domain] = [];
    domainStress[domain].push(frequency * 2); // Weight vector data
  });
  
  if (Object.keys(domainStress).length === 0) return 'General';
  
  // Calculate average stress per domain
  const domainAverages = {};
  Object.entries(domainStress).forEach(([domain, scores]) => {
    domainAverages[domain] = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  });
  
  return Object.entries(domainAverages)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'General';
};

const getRepeatTrigger = (firestoreAnalysis, vectorAnalysis) => {
  const stressContributors = firestoreAnalysis.stressContributors;
  
  if (stressContributors.length === 0) return 'Unknown patterns';
  
  // Find most common contributor
  const contributorCounts = {};
  stressContributors.forEach(contributor => {
    contributorCounts[contributor] = (contributorCounts[contributor] || 0) + 1;
  });
  
  const topContributors = Object.entries(contributorCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([contributor]) => contributor);
  
  return topContributors.join(' + ') || 'Mixed stressors';
};

const generateTrendIndicator = (firestoreAnalysis) => {
  const { trend, wellnessScores } = firestoreAnalysis;
  const latestScore = wellnessScores[0]?.score || 50;
  
  if (trend === 'improving') {
    return latestScore >= 70 ? '🟢 Strong improvement' : '🟡 Gradual improvement';
  } else if (trend === 'declining') {
    return latestScore <= 30 ? '🔴 Needs attention' : '🟡 Slight decline';
  } else {
    return latestScore >= 60 ? '🟢 Stable and good' : '🟡 Stable but watchful';
  }
};

const generateSummaryText = (firestoreAnalysis, vectorAnalysis, dominantEmotion, topStressDomain, repeatTrigger) => {
  const { trend, wellnessScores, timespan } = firestoreAnalysis;
  const checkInsCount = wellnessScores.length;
  const latestScore = wellnessScores[0]?.score || 50;
  
  let summaryText = `Over your last ${checkInsCount} check-in${checkInsCount > 1 ? 's' : ''}`;
  
  if (timespan) {
    summaryText += ` (${timespan} day${timespan > 1 ? 's' : ''})`;
  }
  
  summaryText += `, you've shown `;
  
  // Add emotional pattern
  if (dominantEmotion !== 'Neutral' && dominantEmotion !== 'Mixed') {
    summaryText += `recurring signs of ${dominantEmotion.toLowerCase()} `;
  }
  
  // Add domain context
  if (topStressDomain !== 'General') {
    summaryText += `primarily in the ${topStressDomain} domain. `;
  } else {
    summaryText += `across multiple life areas. `;
  }
  
  // Add trend context
  if (trend === 'improving') {
    summaryText += `Your wellness levels have been gradually improving, `;
  } else if (trend === 'declining') {
    summaryText += `Your stress levels have been increasing, `;
  } else {
    summaryText += `Your wellness levels have remained relatively stable, `;
  }
  
  // Add current state
  if (latestScore >= 70) {
    summaryText += `and you're currently in a good space. `;
  } else if (latestScore >= 50) {
    summaryText += `though there's room for improvement. `;
  } else {
    summaryText += `which suggests you could benefit from additional support. `;
  }
  
  // Add personalized recommendation
  if (repeatTrigger && repeatTrigger !== 'Unknown patterns') {
    summaryText += `Keep an eye on your ${repeatTrigger.toLowerCase()} patterns — `;
  }
  
  // Add encouraging closing
  const encouragements = [
    "maybe take a short break or journal moment today?",
    "consider practicing some mindfulness techniques?",
    "perhaps reach out to someone you trust for support?",
    "try focusing on one small positive change today?",
    "remember that progress isn't always linear, and that's okay."
  ];
  
  summaryText += encouragements[Math.floor(Math.random() * encouragements.length)];
  
  return summaryText;
};

/**
 * Fallback functions for error cases
 */

const generateFirstTimeUserSummary = () => {
  return {
    summary: "Welcome to your wellness journey! This is your first check-in, so we don't have historical data yet. Keep checking in regularly, and we'll start identifying patterns and trends to help you understand your emotional wellness better.",
    trend: "🆕 New user - building baseline",
    dominantEmotion: "Curious",
    repeatTrigger: "New journey beginning",
    timespan: 0,
    checkInsAnalyzed: 0,
    lastScore: null,
    averageScore: null
  };
};

const generateFallbackSummary = () => {
  return {
    summary: "We're having trouble accessing your historical data right now, but we're here to support you. Based on your current session, remember that wellness is a journey with ups and downs. Focus on the small wins and be patient with yourself.",
    trend: "📊 Data temporarily unavailable",
    dominantEmotion: "Resilient",
    repeatTrigger: "Taking things one day at a time",
    timespan: null,
    checkInsAnalyzed: 0,
    lastScore: null,
    averageScore: null
  };
};

/**
 * Export the main function and helper utilities
 */
export default {
  generateProgressSummary,
  fetchRecentCheckIns,
  analyzeFirestorePatterns,
  analyzeVectorPatterns
};