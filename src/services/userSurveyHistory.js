import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection, addDoc, getDocs, increment, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from './firebase';

// Helper function to deep sanitize data and remove undefined/null values
const deepSanitize = (obj) => {
  if (obj === null || obj === undefined) return undefined;
  
  if (Array.isArray(obj)) {
    const sanitizedArray = obj.map(deepSanitize).filter(item => item !== undefined);
    return sanitizedArray.length > 0 ? sanitizedArray : undefined;
  }
  
  if (typeof obj === 'object') {
    const sanitizedObj = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedValue = deepSanitize(value);
      if (sanitizedValue !== undefined) {
        sanitizedObj[key] = sanitizedValue;
      }
    }
    return Object.keys(sanitizedObj).length > 0 ? sanitizedObj : undefined;
  }
  
  return obj;
};

// Fetch user's survey history
export const fetchUserSurveyHistory = async (userId) => {
  const ref = doc(db, 'surveyHistory', userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return {
      checkinCount: 0,
      previousCheckins: []
    };
  }
  return snap.data();
};

// Save a new check-in response to user's history
export const saveUserSurveyHistory = async (userId, checkinData) => {
  const ref = doc(db, 'surveyHistory', userId);
  const existing = await fetchUserSurveyHistory(userId);
  const payload = {
    checkinCount: existing.checkinCount + 1,
    previousCheckins: arrayUnion({
      date: new Date().toISOString(),
      responses: checkinData.responses,
      stressScore: checkinData.stressScore || null,
    })
  };
  await setDoc(ref, payload, { merge: true });
};

// Save a new check-in to users/{userId}/checkins and increment checkinCount (optimized with batch)
export const saveCheckinData = async (userId, surveyData) => {
  if (!userId) throw new Error('userId is required');
  
  // Optimize: Use batch writes for better performance and atomicity
  const { writeBatch } = await import('firebase/firestore');
  const batch = writeBatch(db);
  
  const userDocRef = doc(db, 'users', userId);
  const checkinsColRef = collection(db, 'users', userId, 'checkins');
  const newCheckinRef = doc(checkinsColRef);

  // Sanitize data to prevent undefined values and null fields
  const rawData = {
    timestamp: new Date().toISOString(),
    responses: surveyData.responses || {},
    stressScore: surveyData.stressScore || 0,
    wellnessScore: surveyData.wellnessScore || 0,
    mood: surveyData.mood || 'neutral',
    domainResponses: surveyData.domainResponses,
    emotionSummary: surveyData.emotionSummary,
    stressAnalysis: surveyData.stressAnalysis,
    deepDiveSummaries: surveyData.deepDiveSummaries,
    patternAnalysis: surveyData.patternAnalysis,
    deepDiveTrigger: surveyData.deepDiveTrigger,
    domainScores: surveyData.domainScores
  };

  // Apply deep sanitization and remove undefined values
  const sanitizedData = {};
  for (const [key, value] of Object.entries(rawData)) {
    const sanitizedValue = deepSanitize(value);
    if (sanitizedValue !== undefined) {
      sanitizedData[key] = sanitizedValue;
    } else {
      console.log(`🧹 Removed undefined field: ${key}`);
    }
  }
  
  console.log('✅ Sanitized check-in data:', Object.keys(sanitizedData));

  // Final validation to ensure no undefined values remain
  const hasUndefined = JSON.stringify(sanitizedData).includes('undefined');
  if (hasUndefined) {
    console.error('⚠️ Warning: sanitizedData still contains undefined values');
    console.log('Raw data:', JSON.stringify(sanitizedData, null, 2));
    throw new Error('Data sanitization failed - undefined values detected');
  }

  // Batch: Add new check-in document
  batch.set(newCheckinRef, sanitizedData);
  
  // Batch: Increment checkinCount atomically
  batch.set(userDocRef, { checkinCount: increment(1) }, { merge: true });
  
  // Execute batch for better performance
  await batch.commit();
};

// Fetch check-in history for a user (optimized with parallel fetch and limits)
export const getCheckinHistory = async (userId, limitCount = 50) => {
  if (!userId) throw new Error('userId is required');
  
  // Optimize: Parallel fetch for better performance
  const checkinsColRef = collection(db, 'users', userId, 'checkins');
  const userDocRef = doc(db, 'users', userId);
  
  // Add ordering and limit for better performance
  const checkinsQuery = query(
    checkinsColRef, 
    orderBy('timestamp', 'desc'), 
    limit(limitCount)
  );
  
  const [checkinsSnapshot, userSnap] = await Promise.all([
    getDocs(checkinsQuery),
    getDoc(userDocRef)
  ]);
  
  // Optimize: Only extract essential fields
  const checkins = checkinsSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      timestamp: data.timestamp,
      wellnessScore: data.wellnessScore,
      stressScore: data.stressScore,
      mood: data.mood,
      responses: data.responses,
      domainResponses: data.domainResponses,
      emotionSummary: data.emotionSummary
    };
  });
  
  const checkinCount = userSnap.exists() ? userSnap.data().checkinCount || 0 : 0;

  return { checkins, checkinCount };
};

// Fetch the most recent check-in for a user (optimized with selective fields)
export const getLastCheckin = async (userId) => {
  if (!userId) throw new Error('userId is required');
  const checkinsColRef = collection(db, 'users', userId, 'checkins');
  const q = query(checkinsColRef, orderBy('timestamp', 'desc'), limit(1));
  const snapshot = await getDocs(q);
  
  if (snapshot.docs.length === 0) return null;
  
  // Optimize: Only return essential fields to reduce payload
  const data = snapshot.docs[0].data();
  return {
    timestamp: data.timestamp,
    wellnessScore: data.wellnessScore,
    stressScore: data.stressScore,
    mood: data.mood,
    responses: data.responses,
    domainResponses: data.domainResponses,
    emotionSummary: data.emotionSummary
  };
};

// Get user check-ins using UID-based nested fetch (optimized with limit and ordering)
export const getUserCheckins = async (uid, limitCount = 20) => {
  try {
    const checkinsRef = collection(doc(db, 'users', uid), 'checkins');
    // Optimize: Add limit and ordering to reduce data transfer and improve query performance
    const q = query(
      checkinsRef, 
      orderBy('timestamp', 'desc'), 
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    const checkins = snapshot.docs.map(doc => ({
      id: doc.id,
      timestamp: doc.data().timestamp,
      wellnessScore: doc.data().wellnessScore,
      stressScore: doc.data().stressScore,
      mood: doc.data().mood,
      responses: doc.data().responses,
      domainResponses: doc.data().domainResponses,
      emotionSummary: doc.data().emotionSummary
    }));
    return checkins;
  } catch (error) {
    console.error("❌ Error fetching check-ins for UID:", uid, error);
    return [];
  }
};

// Save survey insights data to Firestore
export const saveSurveyInsight = async (userId, insightData) => {
  if (!userId) throw new Error('userId is required');
  
  try {
    console.log('💾 Saving survey insight for user:', userId);
    console.log('🔍 Using save path: users/' + userId + '/surveyInsights');
    console.log('📊 Insight data being saved:', {
      wellnessScore: insightData.wellnessScore,
      mood: insightData.mood,
      hasStressByDomain: !!insightData.stressByDomain,
      hasDomainBreakdown: !!insightData.domainBreakdown
    });
    
    const surveyInsightsRef = collection(db, 'users', userId, 'surveyInsights');
    const rawInsightDoc = {
      wellnessScore: insightData.wellnessScore || 0,
      mood: insightData.mood || 'neutral',
      domainBreakdown: insightData.domainBreakdown || {},
      stressedDomains: insightData.stressedDomains || [],
      aiSummary: insightData.aiSummary || '',
      recommendations: insightData.recommendations || [],
      emotionalSummary: insightData.emotionalSummary || '',
      timestamp: Date.now(),
      createdAt: new Date(),
      responses: insightData.responses || {},
      stressAnalysis: insightData.stressAnalysis || {},
      deepDiveSummaries: insightData.deepDiveSummaries || {},
      stressByDomain: insightData.stressByDomain || insightData.domainBreakdown || {}
    };

    // Apply deep sanitization to remove undefined values
    const sanitizedInsightDoc = {};
    for (const [key, value] of Object.entries(rawInsightDoc)) {
      const sanitizedValue = deepSanitize(value);
      if (sanitizedValue !== undefined) {
        sanitizedInsightDoc[key] = sanitizedValue;
      } else {
        console.log(`🧹 Removed undefined field from insight: ${key}`);
      }
    }
    
    console.log('✅ Sanitized insight data:', Object.keys(sanitizedInsightDoc));

    // Final validation to ensure no undefined values remain
    const hasUndefined = JSON.stringify(sanitizedInsightDoc).includes('undefined');
    if (hasUndefined) {
      console.error('⚠️ Warning: sanitizedInsightDoc still contains undefined values');
      console.log('Raw insight data:', JSON.stringify(sanitizedInsightDoc, null, 2));
      throw new Error('Insight data sanitization failed - undefined values detected');
    }
    
    const docRef = await addDoc(surveyInsightsRef, sanitizedInsightDoc);
    console.log('✅ Survey insight saved with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving survey insight:', error);
    throw error;
  }
};

// Fetch survey insights for a user (optimized with limit and selective fields)
export const getUserSurveyInsights = async (userId, limitCount = 10) => {
  if (!userId) throw new Error('userId is required');
  
  try {
    console.log('📊 Fetching survey insights for user:', userId);
    console.log('🔍 Using collection path: users/' + userId + '/surveyInsights');
    
    const surveyInsightsRef = collection(db, 'users', userId, 'surveyInsights');
    // Optimize: Add limit to reduce data transfer and improve performance
    const q = query(
      surveyInsightsRef,
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    console.log('📈 Firestore snapshot size:', snapshot.size);
    // Optimize: Only extract essential fields to reduce payload size
    const insights = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        wellnessScore: data.wellnessScore,
        mood: data.mood,
        domainBreakdown: data.domainBreakdown,
        stressedDomains: data.stressedDomains,
        aiSummary: data.aiSummary,
        recommendations: data.recommendations,
        emotionalSummary: data.emotionalSummary,
        timestamp: data.timestamp,
        createdAt: data.createdAt,
        deepDiveSummaries: data.deepDiveSummaries,
        stressByDomain: data.stressByDomain || data.domainBreakdown || {}
      };
    });
    
    console.log(`✅ Found ${insights.length} survey insights`);
    return insights;
  } catch (error) {
    console.error('❌ Error fetching survey insights:', error);
    return [];
  }
};