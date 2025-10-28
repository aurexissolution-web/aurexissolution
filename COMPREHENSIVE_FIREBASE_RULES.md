# COMPREHENSIVE_FIREBASE_RULES.md

## Complete Firebase Security Rules for Chat System

Copy and paste these rules into your Firebase Console → Firestore Database → Rules:

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
    match /projects/{docId} {
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

    // Dashboard collections - user-specific access
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

    match /analytics/{analyticsId} {
      allow read, write: if request.auth != null && (
        resource.data.userId == request.auth.token.email ||
        isAdmin()
      );
    }

    // Chat Rooms - Allow anyone to create, but restrict read/update
    match /chatRooms/{roomId} {
      allow read: if request.auth != null && (
        resource.data.customerId == request.auth.token.email ||
        isAdmin()
      );
      allow create: if true; // Allow anonymous users to create chat rooms
      allow update: if request.auth != null && (
        resource.data.customerId == request.auth.token.email ||
        isAdmin()
      );
    }

    // Chat Messages - Allow anyone to create, but restrict read/update
    match /chatMessages/{messageId} {
      allow read: if request.auth != null && (
        resource.data.senderId == request.auth.token.email ||
        resource.data.receiverId == request.auth.token.email ||
        isAdmin()
      );
      allow create: if true; // Allow anonymous users to send messages
      allow update: if request.auth != null && (
        resource.data.senderId == request.auth.token.email ||
        isAdmin()
      );
    }

    // Test collection for debugging
    match /test/{docId} {
      allow read, write: if true;
    }

    // Blog posts
    match /posts/{postId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Founders
    match /founders/{founderId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

## Key Changes Made:

1. **Chat Rooms**: `allow create: if true` - Allows anonymous users to create chat rooms
2. **Chat Messages**: `allow create: if true` - Allows anonymous users to send messages
3. **Test Collection**: Added for debugging purposes
4. **Better Error Handling**: More specific error messages in chat components
5. **Enhanced Logging**: Detailed console logs for debugging

## How to Apply:

1. Go to Firebase Console
2. Navigate to Firestore Database
3. Click on the "Rules" tab
4. Replace your existing rules with the rules above
5. Click "Publish"

## Testing Steps:

1. Use the FirebaseTest component (temporarily added to App.tsx) to test:
   - Basic Firebase connection
   - Chat room creation
   - Chat message creation

2. Check browser console for detailed error messages

3. Test both authenticated and anonymous users

## Common Issues & Solutions:

### Issue: "Permission denied"
- **Solution**: Make sure the Firebase rules are published and match exactly

### Issue: "Collection doesn't exist"
- **Solution**: Firestore creates collections automatically when you add documents

### Issue: "Firebase not initialized"
- **Solution**: Check your Firebase configuration in `firebase/config.ts`

### Issue: "Network error"
- **Solution**: Check your internet connection and Firebase project status
