// Firebase Connection Test Utility
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    console.log('🔍 Testing Firebase connection...');
    
    // Test basic Firestore connection
    const testDoc = doc(db, 'test', 'connection');
    await getDoc(testDoc);
    
    console.log('✅ Firebase connection successful');
    return { success: true, message: 'Firebase connection working' };
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    
    // Provide specific error messages
    let errorMessage = 'Unknown Firebase error';
    
    if (error.code === 'permission-denied') {
      errorMessage = 'Firebase permission denied - check authentication';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Firebase service unavailable - check network connection';
    } else if (error.code === 'unauthenticated') {
      errorMessage = 'Firebase authentication required';
    } else if (error.message.includes('network')) {
      errorMessage = 'Network connectivity issue with Firebase';
    }
    
    return { 
      success: false, 
      error: error.code || 'unknown',
      message: errorMessage,
      details: error.message 
    };
  }
};

export const checkNetworkStatus = () => {
  const isOnline = navigator.onLine;
  console.log(`🌐 Network status: ${isOnline ? 'Online' : 'Offline'}`);
  return isOnline;
};

export const logFirebaseConfig = () => {
  // Log Firebase config (without sensitive data)
  console.log('🔧 Firebase Config Check:');
  console.log('- Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
  console.log('- Auth Domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
  console.log('- API Key:', import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('- Storage Bucket:', import.meta.env.VITE_FIREBASE_STORAGE_BUCKET);
};
