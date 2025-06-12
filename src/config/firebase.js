import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "AIzaSyAB69J1WxYLd_vwxggx8YJb37YtTr7kePU",
  authDomain: "manova-9b8ea.firebaseapp.com",
  projectId: "manova-9b8ea",
  storageBucket: "manova-9b8ea.firebasestorage.app",
  messagingSenderId: "107629287941",
  appId: "1:107629287941:web:9c3ab2f6e6bf571474da6c",
  measurementId: "G-H0Q8XEHJR8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app); 