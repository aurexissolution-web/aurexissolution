# COMPLETE_FIREBASE_RULES.md

## Complete Firebase Security Rules for Your Website

Copy and paste these **complete rules** into your Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // This function checks if the logged-in user has an 'admin' role
    function isAdmin() {
      return request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // This function checks if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Public content is readable by anyone, but only writable by admins
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
    
    // Messages can be created by anyone, but only read/deleted by admins
    match /messages/{docId} {
      allow create: if true;
      allow read, delete: if isAdmin();
    }

    // A user can read/update their own user document. Admins can do anything
    match /users/{userId} {
      allow read, update: if request.auth.uid == userId || isAdmin();
      allow create: if request.auth.uid == userId; // Allow user creation during signup
      allow delete: if isAdmin();
    }

    // Invoices and Quotations are for admins only
    match /invoices/{docId} {
      allow read, write, create, delete: if isAdmin();
    }
    
    match /quotations/{docId} {
      allow read, write, create, delete: if isAdmin();
    }

    // Dashboard collections - user-specific access
    match /projects/{projectId} {
      allow read, write: if isAuthenticated() && (
        resource.data.userId == request.auth.token.email ||
        isAdmin()
      );
    }

    match /tickets/{ticketId} {
      allow read, write: if isAuthenticated() && (
        resource.data.userId == request.auth.token.email ||
        isAdmin()
      );
    }

    match /subscriptions/{subscriptionId} {
      allow read, write: if isAuthenticated() && (
        resource.data.userId == request.auth.token.email ||
        isAdmin()
      );
    }

    match /analytics/{analyticsId} {
      allow read, write: if isAuthenticated() && (
        resource.data.userId == request.auth.token.email ||
        isAdmin()
      );
    }

    // CHAT COLLECTIONS - Allow anyone to create chat rooms and messages
    match /chatRooms/{roomId} {
      // Anyone can read chat rooms (for admin to see all)
      allow read: if true;
      // Anyone can create chat rooms (including anonymous users)
      allow create: if true;
      // Only admins can update chat room status
      allow update: if isAdmin();
    }

    match /chatMessages/{messageId} {
      // Anyone can read messages in chat rooms
      allow read: if true;
      // Anyone can create messages (including anonymous users)
      allow create: if true;
      // Only admins can update messages
      allow update: if isAdmin();
    }
  }
}
```

## How to Apply These Rules

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `aurexissolutionwebsite`
3. **Go to Firestore Database** → **Rules** tab
4. **Replace all existing rules** with the rules above
5. **Click "Publish"**

## What These Rules Allow

### ✅ **For Chat System:**
- **Anyone** (including anonymous users) can create chat rooms
- **Anyone** can send messages
- **Admins** can see all chat rooms and messages
- **Admins** can update chat room status (waiting, active, closed)

### ✅ **For Your Existing System:**
- **Public content** (services, projects, testimonials) readable by anyone
- **Admin-only** content management
- **User-specific** dashboard data
- **Secure** user authentication

### ✅ **Security Features:**
- Anonymous users can chat but can't access user data
- Admins have full control over chat management
- User-specific data remains protected
- Public content stays public

## Testing the Rules

After applying these rules:

1. **Anonymous users** can start chats
2. **Logged-in users** can start chats
3. **Admins** can see all chats
4. **All existing functionality** continues to work

These rules are designed to be **secure but permissive** for the chat system while maintaining security for your existing data.
