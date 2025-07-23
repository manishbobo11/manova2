import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, connectFirestoreEmulator } from 'firebase/firestore';
import { toFirestoreSafe } from '../utils/firestoreSafe';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate Firebase config
const validateFirebaseConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
  
  if (missingFields.length > 0) {
    console.error('Missing Firebase configuration fields:', missingFields);
    console.error('Current Firebase config:', {
      apiKey: firebaseConfig.apiKey ? '***' + firebaseConfig.apiKey.slice(-4) : 'MISSING',
      authDomain: firebaseConfig.authDomain || 'MISSING',
      projectId: firebaseConfig.projectId || 'MISSING',
      storageBucket: firebaseConfig.storageBucket || 'MISSING',
      messagingSenderId: firebaseConfig.messagingSenderId || 'MISSING',
      appId: firebaseConfig.appId ? '***' + firebaseConfig.appId.slice(-4) : 'MISSING'
    });
    throw new Error(`Firebase configuration is incomplete. Missing: ${missingFields.join(', ')}`);
  }
  
  console.log('Firebase configuration validated successfully');
  return true;
};

// Initialize Firebase with error handling
let app;
let db;
let auth;
let analytics;

try {
  validateFirebaseConfig();
  
  // Only initialize if not already initialized
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully');
  } else {
    app = getApp();
    console.log('Using existing Firebase app');
  }
  
  // Initialize Firestore with settings for better connection handling
  db = getFirestore(app);
  
  // Initialize Auth
  auth = getAuth(app);
  
  // Initialize Analytics only if supported
  isSupported().then(yes => yes ? analytics = getAnalytics(app) : null);
  
  console.log('Firebase services initialized successfully');
  
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

export { db, auth, analytics };

export const ContextStore = {
  async getUserContext(userId) {
    if (!userId) throw new Error('userId is required for getUserContext');
    
    try {
      const userDoc = await getDoc(doc(db, 'userContexts', userId));
      const userData = userDoc.exists() ? userDoc.data() : null;
      
      // If no user context, try to get from users collection
      if (!userData) {
        const usersDoc = await getDoc(doc(db, 'users', userId));
        if (usersDoc.exists()) {
          const userInfo = usersDoc.data();
          return {
            userName: userInfo.displayName || userInfo.name || userInfo.email?.split('@')[0] || 'friend',
            ...userInfo
          };
        }
      }
      
      return userData;
    } catch (error) {
      console.error('Error getting user context:', error);
      throw error;
    }
  },

  async updateUserContext(userId, context) {
    if (!userId) throw new Error('userId is required for updateUserContext');
    
    try {
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
    } catch (error) {
      console.error('Error updating user context:', error);
      throw error;
    }
  },

  async clearUserContext(userId) {
    if (!userId) throw new Error('userId is required for clearUserContext');
    
    try {
      const userRef = doc(db, 'userContexts', userId);
      await setDoc(userRef, {
        userId,
        mood: null,
        surveyHistory: [],
        stressTriggers: [],
        copingStrategies: [],
        lastCleared: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error clearing user context:', error);
      throw error;
    }
  }
};

export const saveDeepDiveInsight = async (userId, domain, data) => {
  if (!userId || !domain) {
    throw new Error('userId and domain are required for saveDeepDiveInsight');
  }
  
  try {
    const cleaned = JSON.parse(JSON.stringify(data)); // 🔥 Full deep-clean
    const docRef = doc(db, 'deepDiveInsights', `${userId}_${domain}`);
    return await setDoc(docRef, cleaned, { merge: true });
  } catch (error) {
    console.error('Error saving deep dive insight:', error);
    throw error;
  }
};

export const saveContributorsToDB = async (userId, domain, contributors) => {
  if (!userId || !domain) {
    throw new Error('userId and domain are required for saveContributorsToDB');
  }
  
  try {
    const cleaned = JSON.parse(JSON.stringify(contributors)); // 🔥 Full deep-clean
    const docRef = doc(db, 'stressContributors', `${userId}_${domain}`);
    return await setDoc(docRef, {
      userId,
      domain,
      contributors: cleaned,
      timestamp: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving stress contributors:', error);
    throw error;
  }
};

export default db; 