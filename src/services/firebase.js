import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  connectFirestoreEmulator,
  enableNetwork,
  disableNetwork,
  waitForPendingWrites,
  addDoc
} from 'firebase/firestore';
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

// Enhanced retry logic for network operations
const retryOperation = async (operation, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`Firebase operation failed (attempt ${attempt + 1}/${maxRetries + 1}):`, error.message);
      
      // Don't retry for certain error types
      if (error.code === 'permission-denied' || 
          error.code === 'unauthenticated' || 
          error.code === 'not-found') {
        console.warn('Not retrying due to permission/authentication error');
        throw error;
      }
      
      // Retry with exponential backoff for network issues
      if (attempt < maxRetries && (
        error.code === 'unavailable' || 
        error.code === 'deadline-exceeded' ||
        error.message.includes('network') ||
        error.message.includes('connection')
      )) {
        const delay = Math.pow(2, attempt) * baseDelay;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        break;
      }
    }
  }
  
  throw lastError;
};

// Network connectivity monitoring
class NetworkMonitor {
  constructor() {
    this.isOnline = navigator.onLine;
    this.listeners = [];
    
    window.addEventListener('online', () => {
      console.log('🌐 Network connection restored');
      this.isOnline = true;
      this.notifyListeners(true);
    });
    
    window.addEventListener('offline', () => {
      console.log('📡 Network connection lost');
      this.isOnline = false;
      this.notifyListeners(false);
    });
  }
  
  addListener(callback) {
    this.listeners.push(callback);
  }
  
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }
  
  notifyListeners(isOnline) {
    this.listeners.forEach(callback => callback(isOnline));
  }
  
  getStatus() {
    return this.isOnline;
  }
}

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

// Initialize Firebase with enhanced error handling
let app;
let db;
let auth;
let analytics;
let networkMonitor;

try {
  validateFirebaseConfig();
  
  // Initialize network monitor
  networkMonitor = new NetworkMonitor();
  
  // Only initialize if not already initialized
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully');
  } else {
    app = getApp();
    console.log('Using existing Firebase app');
  }
  
  // Initialize Firestore with enhanced settings
  db = getFirestore(app);
  
  // Network connectivity management
  networkMonitor.addListener(async (isOnline) => {
    if (isOnline) {
      try {
        await enableNetwork(db);
        console.log('✅ Firestore network enabled');
      } catch (error) {
        console.error('Failed to enable Firestore network:', error);
      }
    } else {
      try {
        await disableNetwork(db);
        console.log('📡 Firestore network disabled');
      } catch (error) {
        console.error('Failed to disable Firestore network:', error);
      }
    }
  });
  
  // Initialize Auth
  auth = getAuth(app);
  
  // Initialize Analytics only if supported
  isSupported().then(yes => yes ? analytics = getAnalytics(app) : null);
  
  console.log('Firebase services initialized successfully');
  
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

// Enhanced Firestore operations with retry logic
export const enhancedFirestoreOperations = {
  async getDoc(docRef, options = {}) {
    return retryOperation(async () => {
      const doc = await getDoc(docRef);
      return doc;
    }, options.maxRetries || 3);
  },
  
  async setDoc(docRef, data, options = {}) {
    return retryOperation(async () => {
      const result = await setDoc(docRef, data, options);
      // Wait for pending writes to ensure data is committed
      await waitForPendingWrites(db);
      return result;
    }, options.maxRetries || 3);
  },
  
  async updateDoc(docRef, data) {
    return retryOperation(async () => {
      const result = await updateDoc(docRef, data);
      await waitForPendingWrites(db);
      return result;
    });
  },
  
  async addDoc(collectionRef, data) {
    return retryOperation(async () => {
      const result = await addDoc(collectionRef, data);
      await waitForPendingWrites(db);
      return result;
    });
  }
};

export { db, auth, analytics, networkMonitor };

export const ContextStore = {
  async getUserContext(userId) {
    if (!userId) throw new Error('userId is required for getUserContext');
    
    try {
      const userDoc = await enhancedFirestoreOperations.getDoc(doc(db, 'userContexts', userId));
      const userData = userDoc.exists() ? userDoc.data() : null;
      
      // If no user context, try to get from users collection
      if (!userData) {
        const usersDoc = await enhancedFirestoreOperations.getDoc(doc(db, 'users', userId));
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
      const userDoc = await enhancedFirestoreOperations.getDoc(userRef);
      
      if (!userDoc.exists()) {
        await enhancedFirestoreOperations.setDoc(userRef, {
          userId,
          createdAt: new Date().toISOString(),
          ...context
        });
      } else {
        await enhancedFirestoreOperations.updateDoc(userRef, {
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
      await enhancedFirestoreOperations.setDoc(userRef, {
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

export const saveContributorsToDB = async (userId, domain, contributors) => {
  if (!userId || !domain) {
    throw new Error('userId and domain are required for saveContributorsToDB');
  }
  
  try {
    const cleaned = JSON.parse(JSON.stringify(contributors)); // 🔥 Full deep-clean
    const docRef = doc(db, 'stressContributors', `${userId}_${domain}`);
    return await enhancedFirestoreOperations.setDoc(docRef, {
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

export const saveDeepDiveInsight = async (userId, domain, data) => {
  if (!userId || !domain) {
    throw new Error('userId and domain are required for saveDeepDiveInsight');
  }
  
  try {
    const cleaned = JSON.parse(JSON.stringify(data)); // 🔥 Full deep-clean
    const docRef = doc(db, 'deepDiveInsights', `${userId}_${domain}`);
    return await enhancedFirestoreOperations.setDoc(docRef, cleaned, { merge: true });
  } catch (error) {
    console.error('Error saving deep dive insight:', error);
    throw error;
  }
};

export default db; 