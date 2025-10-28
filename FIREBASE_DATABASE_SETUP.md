# Firebase Database Setup Guide

This guide will help you connect your customer dashboard to Google Firestore for real-time data management.

## 🚀 **Quick Setup Steps**

### 1. **Create Firebase Project**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select existing project
3. Follow the setup wizard
4. Enable Google Analytics (optional)

### 2. **Enable Firestore Database**
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database

### 3. **Get Firebase Configuration**
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select Web (</>) icon
4. Register your app with a nickname
5. Copy the Firebase configuration object

### 4. **Set Up Environment Variables**
Create a `.env.local` file in your project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Optional: Use Firebase Emulators for Development
VITE_USE_FIREBASE_EMULATOR=false
```

### 5. **Set Up Firestore Security Rules**
Go to Firestore Database > Rules and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
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

## 📊 **Database Collections Structure**

### **Projects Collection**
```javascript
projects/{projectId} {
  name: string,
  description: string,
  status: 'Planning' | 'In Progress' | 'Review' | 'Completed',
  progress: number,
  priority: 'Low' | 'Medium' | 'High' | 'Critical',
  startDate: string,
  deadline: string,
  team: string[],
  budget: number,
  spent: number,
  deliverables: Deliverable[],
  milestones: Milestone[],
  userId: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### **Tickets Collection**
```javascript
tickets/{ticketId} {
  title: string,
  description: string,
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed',
  priority: 'Low' | 'Medium' | 'High' | 'Critical',
  category: string,
  assignee: string,
  created: timestamp,
  updated: timestamp,
  dueDate: string,
  tags: string[],
  userId: string
}
```

### **Invoices Collection**
```javascript
invoices/{invoiceId} {
  number: string,
  date: string,
  dueDate: string,
  amount: number,
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue',
  description: string,
  paymentMethod: string,
  paidDate: string,
  items: InvoiceItem[],
  userId: string
}
```

### **Subscriptions Collection**
```javascript
subscriptions/{subscriptionId} {
  name: string,
  description: string,
  price: number,
  billingCycle: 'Monthly' | 'Annually',
  status: 'Active' | 'Cancelled' | 'Expired',
  nextBilling: string,
  features: string[],
  userId: string
}
```

### **Analytics Collection**
```javascript
analytics/{metricId} {
  name: string,
  value: number,
  change: number,
  changeType: 'increase' | 'decrease',
  unit: string,
  icon: string,
  color: string,
  timestamp: timestamp,
  userId: string
}
```

## 🔧 **Testing the Connection**

### 1. **Start Your Development Server**
```bash
npm run dev
```

### 2. **Check Browser Console**
- Open browser developer tools
- Look for Firebase connection messages
- Check for any authentication errors

### 3. **Test Real-time Updates**
- Create a test project in Firestore Console
- Add a document with `userId: "test-user"`
- Check if it appears in your dashboard

## 🛠️ **Development Tools**

### **Firebase Emulator Suite (Optional)**
For local development without affecting production data:

1. **Install Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Initialize Firebase in your project**
```bash
firebase init emulators
```

3. **Start emulators**
```bash
firebase emulators:start
```

4. **Update environment variables**
```env
VITE_USE_FIREBASE_EMULATOR=true
```

## 🔐 **Authentication Setup (Optional)**

If you want to add user authentication:

1. **Enable Authentication**
   - Go to Firebase Console > Authentication
   - Click "Get started"
   - Enable Email/Password provider

2. **Update Security Rules**
   - Use `request.auth.uid` in your rules
   - Ensure users can only access their own data

## 📈 **Production Deployment**

### 1. **Update Security Rules**
- Change from test mode to production rules
- Add proper authentication checks
- Implement role-based access if needed

### 2. **Set Up Monitoring**
- Enable Firebase Performance Monitoring
- Set up error reporting
- Monitor database usage

### 3. **Backup Strategy**
- Set up automated backups
- Configure retention policies
- Test restore procedures

## 🚨 **Common Issues & Solutions**

### **Issue: "Firebase not initialized"**
**Solution**: Check your environment variables are correctly set

### **Issue: "Permission denied"**
**Solution**: Verify Firestore security rules allow your operations

### **Issue: "Collection doesn't exist"**
**Solution**: Firestore creates collections automatically when you add documents

### **Issue: "Real-time updates not working"**
**Solution**: Check if `onSnapshot` listeners are properly set up

## 📚 **Additional Resources**

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Performance](https://firebase.google.com/docs/perf-mon)

## ✅ **Verification Checklist**

- [ ] Firebase project created
- [ ] Firestore database enabled
- [ ] Environment variables configured
- [ ] Security rules set up
- [ ] Dashboard connects successfully
- [ ] Real-time updates working
- [ ] Data persists correctly
- [ ] Error handling implemented

Your dashboard is now connected to Google Firestore for real-time data management! 🎉
