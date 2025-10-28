# Firebase Security Rules Setup Guide

## 🚨 **URGENT: Fix Firebase Permissions**

Your invitation system is not working because Firebase security rules are missing. Follow these steps to fix it:

## 📋 **Step 1: Install Firebase CLI**

```bash
npm install -g firebase-tools
```

## 🔐 **Step 2: Login to Firebase**

```bash
firebase login
```

## 🏗️ **Step 3: Initialize Firebase Project**

```bash
firebase init firestore
```

When prompted:
- Select your existing Firebase project: `aurexissolutionwebsite`
- Choose "Use an existing project"
- Select "Yes" to use existing firestore.rules file
- Select "Yes" to use existing firestore.indexes.json file

## 🚀 **Step 4: Deploy Security Rules**

```bash
firebase deploy --only firestore:rules
```

## ✅ **Step 5: Verify Rules Are Active**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `aurexissolutionwebsite`
3. Go to "Firestore Database" → "Rules" tab
4. Verify the rules are deployed and active

## 🔧 **What These Rules Do:**

### **Admin-Only Collections:**
- `invitations` - Only admins can create/read/delete invitations
- `invoices` - Only admins can manage invoices
- `quotations` - Only admins can manage quotations
- `messages` - Only admins can read contact messages

### **Public Collections:**
- `services` - Public read, admin write
- `testimonials` - Public read, admin write
- `projects` - Public read, admin write
- `siteContent` - Public read, admin write
- `founders` - Public read, admin write
- `posts` - Public read, admin write

### **User Collections:**
- `users` - Users can only access their own data
- `chatRooms` - Users can access their own chat rooms
- `chatRooms/{roomId}/messages` - Users can access messages in their chat rooms

## 🎯 **Expected Result:**

After deploying these rules:
- ✅ Admin can create invitations
- ✅ Admin can view all invitations
- ✅ Customers can sign up with valid invitation codes
- ✅ All existing functionality continues to work
- ✅ Security is properly enforced

## 🆘 **If You Need Help:**

1. **Check Firebase Console** - Make sure rules are deployed
2. **Test in Browser** - Try creating an invitation in admin panel
3. **Check Console** - Look for permission errors
4. **Verify Admin Role** - Make sure you're logged in as admin

## 📞 **Quick Test:**

1. Go to your admin panel
2. Click "Customer Invitations" tab
3. Try creating a new invitation
4. Should work without permission errors!

---

**Note:** These rules ensure only you (admin) can create customer accounts through the invitation system, making your customer dashboard completely secure.
