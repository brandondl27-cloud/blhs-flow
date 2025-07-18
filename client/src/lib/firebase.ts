import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDh1KyblFkLJhRMtmnHxvkXMGSKiywu5fM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "blhs-flow-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "blhs-flow-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "blhs-flow-app.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "754903834469",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:754903834469:web:371a31d7ac00ada5964b8c"
};

// Check if Firebase config is loaded
console.log('Firebase config loaded:', {
  apiKey: firebaseConfig.apiKey ? 'Set' : 'Missing',
  authDomain: firebaseConfig.authDomain ? 'Set' : 'Missing',
  projectId: firebaseConfig.projectId ? 'Set' : 'Missing'
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

console.log('Firebase initialized successfully');

export default app;