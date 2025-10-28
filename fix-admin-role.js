// Fix admin role script
// This script will ensure the admin user has the correct role in Firestore

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Your Firebase config
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: "AIzaSyBvQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ",
  authDomain: "aurexissolutionwebsite.firebaseapp.com",
  projectId: "aurexissolutionwebsite",
  storageBucket: "aurexissolutionwebsite.appspot.com",
  messagingSenderId: "1059150234102",
  appId: "1:1059150234102:web:your-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function fixAdminRole() {
  try {
    // Sign in as admin
    await signInWithEmailAndPassword(auth, 'admin@aurexissolution.com', 'your-password');
    
    // Get current user
    const user = auth.currentUser;
    if (!user) {
      console.error('No user signed in');
      return;
    }
    
    // Check if user document exists
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('Current user data:', userData);
      
      if (userData.role !== 'admin') {
        // Update role to admin
        await setDoc(userDocRef, {
          ...userData,
          role: 'admin'
        }, { merge: true });
        console.log('✅ Updated user role to admin');
      } else {
        console.log('✅ User already has admin role');
      }
    } else {
      // Create user document with admin role
      await setDoc(userDocRef, {
        email: user.email,
        role: 'admin'
      });
      console.log('✅ Created user document with admin role');
    }
    
  } catch (error) {
    console.error('Error fixing admin role:', error);
  }
}

fixAdminRole();
