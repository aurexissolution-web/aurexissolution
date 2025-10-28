// firebase/config.ts
import { initializeApp } from 'firebase/app';
import { initializeFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBYmTVBYqUDioNmXUA3RFO6WQjlAkSUxvo",
  authDomain: "aurexissolutionwebsite.firebaseapp.com",
  projectId: "aurexissolutionwebsite",
  storageBucket: "aurexissolutionwebsite.appspot.com",
  messagingSenderId: "1059150234102",
  appId: "1:1059150234102:web:0feea8b23ef66aafb507d7",
  measurementId: "G-C8B63GHDQD"
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