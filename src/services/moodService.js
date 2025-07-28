import { db } from './firebase';
import { doc, setDoc, collection, addDoc, updateDoc } from 'firebase/firestore';

export const saveMoodToFirestore = async (userId, moodData) => {
  if (!userId) throw new Error('userId is required for saveMoodToFirestore');
  
  try {
    const timestamp = new Date().toISOString();
    const moodEntry = {
      userId,
      mood: moodData.label,
      emoji: moodData.emoji,
      color: moodData.color,
      timestamp,
      date: new Date().toDateString()
    };

    // Save to daily mood collection
    const moodRef = await addDoc(collection(db, 'dailyMoods'), moodEntry);
    
    // Update user's latest mood in profile
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      latestMood: moodData.label,
      latestMoodTimestamp: timestamp,
      lastActivity: timestamp
    });

    console.log('Mood saved successfully:', moodRef.id);
    return moodRef.id;
  } catch (error) {
    console.error('Error saving mood:', error);
    throw error;
  }
};

export const getMoodStats = async (userId) => {
  // This could be expanded to get mood statistics
  // For now, just returning a placeholder
  return {
    weeklyAverage: 'Good',
    streakDays: 7,
    totalEntries: 23
  };
};