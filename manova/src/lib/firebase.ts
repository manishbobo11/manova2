import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    VITE_FIREBASE_API_KEY=AIzaSyAB69J1WxYLd_vwxggx8YJb37YtTr7kePU
    VITE_FIREBASE_AUTH_DOMAIN=manova-9b8ea.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=manova-9b8ea
    VITE_FIREBASE_STORAGE_BUCKET=manova-9b8ea.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=107629287941
    VITE_FIREBASE_APP_ID=1:107629287941:web:9c3ab2f6e6bf571474da6c,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);
