# 🔐 Firebase Permissions Fix Guide

## 🚨 **Current Issue**
You're getting "Missing or insufficient permissions" because your Firestore security rules don't match how your app is using authentication.

## 🔍 **Root Cause**
- **Security Rules**: Expect `request.auth.uid` (Firebase Auth UID)
- **Your App**: Uses `user.email` as userId
- **Mismatch**: Rules block access because UID ≠ email

## 🛠️ **Solution Options**

### **Option 1: Quick Fix - Allow All Access (Development Only)**

**⚠️ WARNING: Only use this for development/testing!**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `aurexissolutionwebsite`
3. Go to **Firestore Database** → **Rules**
4. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all read/write for development
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

5. Click **Publish**

### **Option 2: Proper Fix - Update App to Use Firebase UID**

This is the recommended approach for production.

#### **Step 1: Update App Context to Include Firebase UID**

Update your `hooks/useAppContext.ts`:

```typescript
// hooks/useAppContext.ts
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface User {
  uid: string;        // Add Firebase UID
  email: string;
  role: 'user' | 'admin';
}

interface AppContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,           // Use Firebase UID
          email: firebaseUser.email || '',
          role: 'user' // You can determine role from custom claims or database
        });
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    // Your existing login logic
  };

  const logout = async () => {
    // Your existing logout logic
  };

  const signup = async (email: string, password: string) => {
    // Your existing signup logic
  };

  return (
    <AppContext.Provider value={{ user, login, logout, signup }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
```

#### **Step 2: Update Database Service to Use UID**

Update your `services/database.ts` to use `user.uid` instead of `user.email`:

```typescript
// In all functions, change:
// userId: user?.email || ''
// To:
// userId: user?.uid || ''
```

#### **Step 3: Update Dashboard Components**

Update all dashboard components to use `user.uid`:

```typescript
// In CustomerDashboard.tsx, TicketTracking.tsx, etc.
const userId = user.uid; // Instead of user.email
```

#### **Step 4: Update Security Rules**

Use the proper security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data using Firebase UID
    match /projects/{projectId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /tickets/{ticketId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /invoices/{invoiceId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /subscriptions/{subscriptionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /analytics/{metricId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### **Option 3: Updated Rules for Your Existing Structure**

Based on your current rules, here's the updated version that includes dashboard collections:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // This function checks if the logged-in user has an 'admin' role
    // in the 'users' collection.
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Public content is readable by anyone, but only writable by admins.
    match /services/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /testimonials/{docId} {
       allow read: if true;
       allow write: if isAdmin();
    }
    match /siteContent/main {
       allow read: if true;
       allow write: if isAdmin();
    }
    
    // Messages can be created by anyone, but only read/deleted by admins.
    match /messages/{docId} {
      allow create: if true;
      allow read, delete: if isAdmin();
    }

    // A user can read/update their own user document. Admins can do anything.
    match /users/{userId} {
      allow read, update: if request.auth.uid == userId || isAdmin();
      allow create: if request.auth.uid == userId; // Allow user creation during signup
      allow delete: if isAdmin();
    }

    // Invoices and Quotations are for admins only.
    match /invoices/{docId} {
      allow read, write, create, delete: if isAdmin();
    }
    match /quotations/{docId} {
      allow read, write, create, delete: if isAdmin();
    }

    // DASHBOARD COLLECTIONS - Users can access their own data, admins can access all
    match /projects/{projectId} {
      allow read, write: if request.auth != null && (
        resource.data.userId == request.auth.token.email || 
        isAdmin()
      );
    }
    
    match /tickets/{ticketId} {
      allow read, write: if request.auth != null && (
        resource.data.userId == request.auth.token.email || 
        isAdmin()
      );
    }
    
    match /subscriptions/{subscriptionId} {
      allow read, write: if request.auth != null && (
        resource.data.userId == request.auth.token.email || 
        isAdmin()
      );
    }
    
    match /analytics/{metricId} {
      allow read, write: if request.auth != null && (
        resource.data.userId == request.auth.token.email || 
        isAdmin()
      );
    }
  }
}
```

## 🚀 **Recommended Quick Fix for Now**

**For immediate testing, use Option 1:**

1. Go to Firebase Console
2. Firestore Database → Rules
3. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

4. Click **Publish**
5. Test ticket creation - it should work now!

## ⚠️ **Important Notes**

- **Option 1** is only for development/testing
- **Option 2** is the proper production solution
- **Option 3** works but is less secure than using UID
- Always test your security rules before deploying to production

## 🔧 **Testing Steps**

1. Apply the quick fix (Option 1)
2. Try creating a ticket
3. Check console for success logs
4. Verify ticket appears in the dashboard
5. Once working, implement proper security (Option 2)

## 📞 **Need Help?**

If you're still having issues:
1. Check Firebase Console for error logs
2. Verify Authentication is enabled
3. Make sure Firestore Database is created
4. Check that your Firebase project is active
