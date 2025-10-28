// firebase/config.ts
import { initializeApp } from 'firebase/app';
import { initializeFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBYmTVBYqUDioNmXUA3RFO6WQjlAkSUxvo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "aurexissolutionwebsite.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "aurexissolutionwebsite",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "aurexissolutionwebsite.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1059150234102",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1059150234102:web:0feea8b23ef66aafb507d7",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-C8B63GHDQD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase Authentication and Firestore services
export const auth = getAuth(app);

// Using initializeFirestore with optimized settings for better performance
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: false, // Use WebSocket for faster real-time updates
  ignoreUndefinedProperties: true, // Ignore undefined properties to prevent errors
  cacheSizeBytes: 40 * 1024 * 1024, // 40MB cache size
});

// Initialize Firebase Storage
export const storage = getStorage(app);

// Connect to emulators in development (optional)
if (process.env.NODE_ENV === 'development' && process.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('Connected to Firebase emulators');
  } catch (error) {
    console.log('Firebase emulators already connected or not available');
  }
}

export default app;