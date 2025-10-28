// Script to create admin accounts in Firebase
// This will help you set up admin login credentials

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "aurexissolutionwebsite",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Admin accounts to create
const adminAccounts = [
  {
    email: 'admin@aurexissolution.com',
    role: 'admin',
    uniqueId: 'ADMIN001',
    defaultPassword: 'Aurexis3129',
    hasChangedPassword: false,
    isActive: true,
    createdAt: serverTimestamp(),
    createdBy: 'system'
  },
  {
    email: 'superadmin@aurexissolution.com',
    role: 'admin',
    uniqueId: 'ADMIN002',
    defaultPassword: 'SuperAdmin123',
    hasChangedPassword: false,
    isActive: true,
    createdAt: serverTimestamp(),
    createdBy: 'system'
  }
];

async function createAdminAccounts() {
  try {
    console.log('Creating admin accounts...');
    
    for (const admin of adminAccounts) {
      await addDoc(collection(db, 'users'), admin);
      console.log(`✅ Created admin account: ${admin.email}`);
    }
    
    console.log('\n🎉 All admin accounts created successfully!');
    console.log('\nADMIN LOGIN CREDENTIALS:');
    console.log('========================');
    
    adminAccounts.forEach(admin => {
      console.log(`\nEmail: ${admin.email}`);
      console.log(`Password: ${admin.defaultPassword}`);
      console.log(`Unique ID: ${admin.uniqueId}`);
      console.log('---');
    });
    
    console.log('\n📝 LOGIN INSTRUCTIONS:');
    console.log('1. Go to your login page');
    console.log('2. Select "Admin" role');
    console.log('3. Enter the email address');
    console.log('4. Enter the password');
    console.log('5. Click Login');
    
  } catch (error) {
    console.error('❌ Error creating admin accounts:', error);
  }
}

// Run the script
createAdminAccounts();
