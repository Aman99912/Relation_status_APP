import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGva1_m0D6mNVZ7d5AquE7YPReSLsySPs",
  authDomain: "bondmate-ede19.firebaseapp.com",
  projectId: "bondmate-ede19",
  storageBucket: "bondmate-ede19.firebasestorage.app",
  messagingSenderId: "773116592614",
  appId: "1:773116592614:android:712f8a7cf16ad766b59627"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
