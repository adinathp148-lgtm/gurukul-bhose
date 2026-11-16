import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updatePassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Safe helper to read environment variables in Vite and Node.js runtimes
const getEnv = (key, fallback = '') => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta?.env?.[key]) {
      return import.meta.env[key];
    }
    if (typeof process !== 'undefined' && process?.env?.[key]) {
      return process.env[key];
    }
  } catch {
    // fallback
  }
  return fallback;
};

// Read Firebase config from environment variables
const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY', "AIzaSyDummyDevKeyForGurukulBhose2026"),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', "gurukul-bhose.firebaseapp.com"),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID', "gurukul-bhose"),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', "gurukul-bhose.appspot.com"),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', "102938475612"),
  appId: getEnv('VITE_FIREBASE_APP_ID', "1:102938475612:web:abcdef987654321"),
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID', "G-GURUKULBHOSE")
};

// Check if production credentials are provided
const apiKey = getEnv('VITE_FIREBASE_API_KEY');
export const isConfigured = Boolean(
  apiKey && 
  apiKey !== "AIzaSyDummyKeyReplaceWithYourOwnKey" &&
  !apiKey.includes("Dummy")
);

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Safe helper for Firebase Cloud Messaging (supported on modern browsers with HTTPS/ServiceWorker)
export const getCloudMessaging = async () => {
  try {
    if (typeof window !== 'undefined') {
      const { getMessaging, isSupported } = await import('firebase/messaging');
      const supported = await isSupported();
      if (supported) {
        return getMessaging(app);
      }
    }
  } catch (err) {
    console.warn('[FCM] Firebase Cloud Messaging initialization skipped:', err?.message || err);
  }
  return null;
};

export {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updatePassword,
  sendPasswordResetEmail,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  ref,
  uploadBytes,
  getDownloadURL
};

export default app;
