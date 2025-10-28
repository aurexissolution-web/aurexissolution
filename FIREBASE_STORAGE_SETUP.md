# Firebase Storage Setup Guide

## 🔴 CRITICAL: Firebase Storage Not Enabled

Your Firebase Storage is not set up yet, which is causing CORS errors when trying to upload/download files.

## ✅ Step-by-Step Setup

### 1. Enable Firebase Storage

1. Go to Firebase Console: https://console.firebase.google.com/project/aurexissolutionwebsite/storage
2. Click **"Get Started"** button
3. Read the security rules dialog
4. Click **"Next"**
5. Choose a Cloud Storage location (select closest to your users):
   - **asia-southeast1** (Singapore) - Recommended for Asia
   - **us-central1** (Iowa) - For US
   - **europe-west1** (Belgium) - For Europe
6. Click **"Done"**

### 2. Wait for Setup

Firebase will:
- ✅ Create your storage bucket
- ✅ Set up default security rules
- ✅ Configure CORS automatically

This takes about 30-60 seconds.

### 3. Deploy Storage Rules

After Firebase Storage is enabled, run:

```bash
firebase deploy --only storage
```

This will deploy your custom storage rules.

### 4. Verify Setup

Check that your storage bucket exists:
- Go to: https://console.firebase.google.com/project/aurexissolutionwebsite/storage
- You should see a "Files" tab with an empty bucket
- The bucket name will be something like: `aurexissolutionwebsite.appspot.com`

### 5. Test File Upload

1. Log in as admin
2. Go to Employee Monitoring
3. Click "Assign Task" on any employee
4. Try uploading a file
5. If successful, you'll see the file in Firebase Storage console

## 🔧 Current Storage Rules

Your `storage.rules` file is already configured to be fully open:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Temporarily open for all - TODO: Integrate Firebase Auth properly
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

This allows all read/write operations, which is fine for development.

## 🚨 CORS Configuration

Firebase Storage automatically configures CORS to allow:
- ✅ All origins (*)
- ✅ GET, POST, PUT, DELETE methods
- ✅ File uploads/downloads from your web app

You **do not need** to manually configure CORS. Firebase handles it automatically.

## 🎯 After Setup

Once Firebase Storage is enabled:

1. **File Uploads** will work ✅
   - Admin can upload task attachments
   - Files are stored in `task-attachments/{taskId}/`
   
2. **File Downloads** will work ✅
   - Employees can download attachments
   - Direct links from Firebase Storage

3. **No More CORS Errors** ✅
   - All cross-origin requests allowed
   - Proper OPTIONS preflight responses

## 📊 Storage Structure

Your files will be organized as:

```
storage/
├── task-attachments/
│   ├── {taskId1}/
│   │   ├── {timestamp}_filename.pdf
│   │   └── {timestamp}_filename.xlsx
│   └── {taskId2}/
│       └── {timestamp}_filename.png
└── employee-documents/
    └── {employeeId}/
        └── {timestamp}_filename.pdf
```

## 🔐 Security Note

⚠️ **Current rules are WIDE OPEN** - Anyone can read/write!

For production, you should:
1. Integrate Firebase Authentication properly
2. Update rules to check authentication
3. Limit access based on user roles

**Suggested Production Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Task attachments - authenticated users only
    match /task-attachments/{taskId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Employee documents - employee or admin only
    match /employee-documents/{employeeId}/{fileName} {
      allow read: if request.auth != null && 
                     (request.auth.uid == employeeId || 
                      get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null && 
                      get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## ✅ Quick Checklist

- [ ] Go to Firebase Console Storage page
- [ ] Click "Get Started"
- [ ] Select location (asia-southeast1 recommended)
- [ ] Wait for setup to complete
- [ ] Run `firebase deploy --only storage`
- [ ] Test file upload in admin panel
- [ ] Verify files appear in Storage console
- [ ] Test file download in employee dashboard

## 🆘 Troubleshooting

### Still Getting CORS Errors?

1. **Clear browser cache**: Hard reload (Ctrl+Shift+R / Cmd+Shift+R)
2. **Check Firebase Console**: Verify Storage is actually enabled
3. **Check bucket name**: Make sure it matches your project ID
4. **Wait a bit**: CORS configuration can take 1-2 minutes to propagate

### Files Not Uploading?

1. Check file size (max 10MB per file)
2. Check file type (PDF, DOC, XLS, images, ZIP allowed)
3. Check browser console for specific errors
4. Verify storage rules are deployed

### Can't Download Files?

1. Check that file URL is valid
2. Verify storage rules allow read access
3. Try opening URL directly in new tab
4. Check Firebase Storage console to see if file exists

## 📞 Need Help?

If you continue to have issues:
1. Check Firebase Console for any alerts/errors
2. Look at browser Network tab for failed requests
3. Check Firebase Storage usage/quota
4. Verify your Firebase project billing is set up (Storage requires Blaze plan for production)

---

**Once you enable Firebase Storage, all CORS errors will be resolved! 🎉**

