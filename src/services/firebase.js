import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection } from 'firebase/firestore';
import { toFirestoreSafe } from '../utils/firestoreSafe';

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Only initialize if not already initialized
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };

export const ContextStore = {
  async getUserContext(userId) {
    if (!userId) throw new Error('userId is required for getUserContext');
    const userDoc = await getDoc(doc(db, 'userContexts', userId));
    return userDoc.exists() ? userDoc.data() : null;
  },

  async updateUserContext(userId, context) {
    const userRef = doc(db, 'userContexts', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        userId,
        createdAt: new Date().toISOString(),
        ...context
      });
    } else {
      await updateDoc(userRef, {
        ...context,
        updatedAt: new Date().toISOString()
      });
    }
  },

  async clearUserContext(userId) {
    const userRef = doc(db, 'userContexts', userId);
    await setDoc(userRef, {
      userId,
      mood: null,
      surveyHistory: [],
      stressTriggers: [],
      copingStrategies: [],
      lastCleared: new Date().toISOString()
    });
  }
};

export const saveDeepDiveInsight = async (userId, domain, data) => {
  const cleaned = JSON.parse(JSON.stringify(data)); // 🔥 Full deep-clean
  const docRef = doc(db, 'deepDiveInsights', `${userId}_${domain}`);
  return await setDoc(docRef, cleaned, { merge: true });
};

export default db; 