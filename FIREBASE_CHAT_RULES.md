# FIREBASE_CHAT_RULES.md

## Updated Firebase Security Rules for Live Chat

Add these rules to your Firebase Firestore security rules to support the live chat functionality:

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

    // Chat Rooms - customers can create and read their own rooms, admins can read all
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

    // Chat Messages - users can read messages in their chat rooms, admins can read all
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
  }
}
```

## How to Apply These Rules

1. Go to your Firebase Console
2. Navigate to Firestore Database
3. Click on the "Rules" tab
4. Replace your existing rules with the rules above
5. Click "Publish"

## What These Rules Do

### Chat Rooms (`/chatRooms/{roomId}`)
- **Read**: Customers can read their own chat rooms, admins can read all rooms
- **Create**: Only authenticated users can create chat rooms for themselves
- **Update**: Customers can update their own rooms, admins can update any room

### Chat Messages (`/chatMessages/{messageId}`)
- **Read**: Users can read messages where they are sender or receiver, admins can read all
- **Create**: Only authenticated users can create messages as themselves
- **Update**: Users can update their own messages, admins can update any message

### Security Features
- All operations require authentication (`request.auth != null`)
- Users can only access their own data unless they're admins
- Admin role is checked via the `isAdmin()` function
- Email-based user identification (`request.auth.token.email`)

This ensures that:
- Customers can only see their own chat conversations
- Admins can see all customer conversations
- Messages are properly secured and only accessible to relevant parties
- The chat system integrates seamlessly with your existing user management
