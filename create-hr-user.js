import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Firebase configuration (from your firebase/config.ts)
const firebaseConfig = {
  apiKey: "AIzaSyDNck780m39е9_MһOLSm0aM_RvmgfBXpY",
  authDomain: "aurexis-solution.firebaseapp.com",
  projectId: "aurexis-solution",
  storageBucket: "aurexis-solution.firebasestorage.app",
  messagingSenderId: "530024005620",
  appId: "1:530024005620:web:0e817dc8af47f7d370fa5f",
  measurementId: "G-8DDW6LYNH1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createHRUser() {
  try {
    console.log('🔄 Creating HR user...');
    
    const hrUser = {
      email: 'hr@aurexis.com',
      role: 'hr',
      uniqueId: 'HR-001',
      defaultPassword: 'HR@2024!',
      password: 'HR@2024!', // In production, this should be hashed
      hasChangedPassword: false,
      isActive: true,
      createdAt: serverTimestamp(),
      createdBy: 'system',
      commissionRate: 0,
      assignedProjects: []
    };

    const docRef = await addDoc(collection(db, 'users'), hrUser);
    
    console.log('✅ HR User created successfully!');
    console.log('\n📋 HR Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    hr@aurexis.com');
    console.log('Password: HR@2024!');
    console.log('Role:     HR (Human Resources)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔐 How to Login:');
    console.log('1. Go to: http://localhost:3001/#/login');
    console.log('2. Click the "HR" (orange) button');
    console.log('3. Enter email: hr@aurexis.com');
    console.log('4. Enter password: HR@2024!');
    console.log('5. Click "Login"');
    console.log('\n✨ You will be redirected to the HR Dashboard!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating HR user:', error);
    console.error('\nPlease check:');
    console.error('1. Firebase configuration is correct');
    console.error('2. Firestore security rules allow write access');
    console.error('3. Internet connection is active');
    process.exit(1);
  }
}

createHRUser();

