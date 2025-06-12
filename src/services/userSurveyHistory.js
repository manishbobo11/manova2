import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection, addDoc, getDocs, increment, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

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

// Save a new check-in to users/{userId}/checkins and increment checkinCount
export const saveCheckinData = async (userId, surveyData) => {
  if (!userId) throw new Error('userId is required');
  const userDocRef = doc(db, 'users', userId);
  const checkinsColRef = collection(db, 'users', userId, 'checkins');

  // Add new check-in document
  await addDoc(checkinsColRef, {
    timestamp: new Date().toISOString(),
    responses: surveyData.responses,
    stressScore: surveyData.stressScore,
    emotionSummary: surveyData.emotionSummary || null
  });

  // Increment checkinCount atomically
  await setDoc(userDocRef, { checkinCount: increment(1) }, { merge: true });
};

// Fetch all check-ins for a user
export const getCheckinHistory = async (userId) => {
  if (!userId) throw new Error('userId is required');
  const checkinsColRef = collection(db, 'users', userId, 'checkins');
  const snapshot = await getDocs(checkinsColRef);
  const checkins = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Optionally fetch checkinCount
  const userDocRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userDocRef);
  const checkinCount = userSnap.exists() ? userSnap.data().checkinCount || 0 : 0;

  return { checkins, checkinCount };
};

// Fetch the most recent check-in for a user
export const getLastCheckin = async (userId) => {
  if (!userId) throw new Error('userId is required');
  const checkinsColRef = collection(db, 'users', userId, 'checkins');
  const q = query(checkinsColRef, orderBy('timestamp', 'desc'), limit(1));
  const snapshot = await getDocs(q);
  return snapshot.docs[0]?.data() || null;
}; 