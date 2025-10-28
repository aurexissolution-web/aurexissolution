// Script to add admin user to Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Your Firebase config
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
const db = getFirestore(app);

// Admin user data
const adminUser = {
  email: 'admin@aurexissolution.com',
  role: 'admin',
  uniqueId: 'ADMIN001',
  defaultPassword: 'Aurexis3129',
  hasChangedPassword: false,
  isActive: true,
  createdAt: serverTimestamp(),
  createdBy: 'system'
};

async function addAdminUser() {
  try {
    console.log('Adding admin user to Firebase...');
    
    const docRef = await addDoc(collection(db, 'users'), adminUser);
    console.log('✅ Admin user created successfully!');
    console.log('Document ID:', docRef.id);
    
    console.log('\n🎉 ADMIN LOGIN CREDENTIALS:');
    console.log('==========================');
    console.log('Email: admin@aurexissolution.com');
    console.log('Password: Aurexis3129');
    console.log('Role: Admin');
    console.log('Unique ID: ADMIN001');
    
    console.log('\n📝 LOGIN INSTRUCTIONS:');
    console.log('1. Go to your login page');
    console.log('2. Select "Admin" role');
    console.log('3. Enter email: admin@aurexissolution.com');
    console.log('4. Enter password: Aurexis3129');
    console.log('5. Click Login');
    
  } catch (error) {
    console.error('❌ Error adding admin user:', error);
    console.log('\n🔧 MANUAL SETUP INSTRUCTIONS:');
    console.log('1. Go to Firebase Console: https://console.firebase.google.com/project/aurexissolutionwebsite/firestore/data');
    console.log('2. Navigate to Firestore Database');
    console.log('3. Go to "users" collection');
    console.log('4. Add a new document with these fields:');
    console.log(JSON.stringify(adminUser, null, 2));
  }
}

// Run the script
addAdminUser();
