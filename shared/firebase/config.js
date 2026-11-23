import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
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
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';

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
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', "gurukulbhose.firebaseapp.com"),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID', "gurukulbhose"),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', "gurukulbhose.appspot.com"),
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
// Use initializeAuth without popupRedirectResolver in browsers to avoid loading
// the unused 93 KiB __/auth/iframe.js script (this app uses email/password auth only).
let authInstance;
if (typeof window !== 'undefined') {
  try {
    authInstance = initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence]
    });
  } catch {
    authInstance = getAuth(app);
  }
} else {
  authInstance = getAuth(app);
}
export const auth = authInstance;
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

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
  runTransaction,
  ref,
  uploadBytes,
  getDownloadURL,
  httpsCallable
};

export default app;
