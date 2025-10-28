# Admin Login Setup Guide

## Quick Admin Account Setup

### Option 1: Manual Firebase Console Setup

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/project/aurexissolutionwebsite/firestore/data
   - Navigate to Firestore Database

2. **Create Admin User Document**
   - Click "Start collection" or add to existing "users" collection
   - Create a new document with these fields:

```json
{
  "email": "admin@aurexissolution.com",
  "role": "admin",
  "uniqueId": "ADMIN001",
  "defaultPassword": "Aurexis3129",
  "hasChangedPassword": false,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "createdBy": "manual"
}
```

3. **Create Additional Admin (Optional)**
```json
{
  "email": "superadmin@aurexissolution.com",
  "role": "admin",
  "uniqueId": "ADMIN002",
  "defaultPassword": "SuperAdmin123",
  "hasChangedPassword": false,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "createdBy": "manual"
}
```

### Option 2: Use the Setup Script

1. **Update Firebase Config**
   - Edit `setup-admin-accounts.js`
   - Replace the firebaseConfig with your actual Firebase configuration

2. **Run the Script**
   ```bash
   node setup-admin-accounts.js
   ```

## Admin Login Credentials

### Primary Admin Account
- **Email:** admin@aurexissolution.com
- **Password:** Aurexis3129
- **Role:** Admin
- **Unique ID:** ADMIN001

### Secondary Admin Account
- **Email:** superadmin@aurexissolution.com
- **Password:** SuperAdmin123
- **Role:** Admin
- **Unique ID:** ADMIN002

## How to Login

1. **Go to Login Page**
   - Navigate to `/login` on your website

2. **Select Admin Role**
   - Click the purple "Admin" button

3. **Enter Email**
   - Type: `admin@aurexissolution.com`

4. **Enter Password**
   - Type: `Aurexis3129`

5. **Click Login**
   - You'll be redirected to the admin dashboard

## Admin Dashboard Features

Once logged in as admin, you can:
- **Manage Users** - Create/edit/delete customers and employees
- **Manage Projects** - Create and assign projects
- **View Analytics** - See system statistics
- **Manage Content** - Update website content
- **Handle Support** - Manage tickets and messages

## Security Notes

- **Change Default Passwords** - Consider changing the default passwords
- **Use Strong Passwords** - Use complex passwords in production
- **Limit Admin Access** - Only give admin access to trusted users
- **Monitor Activity** - Keep track of admin actions

## Troubleshooting

If login doesn't work:
1. **Check Firebase Rules** - Ensure admin users can read/write
2. **Verify Document Structure** - Make sure all required fields are present
3. **Check Network** - Ensure Firebase connection is working
4. **Clear Browser Cache** - Try refreshing the page

## Next Steps

After setting up admin accounts:
1. **Create Test Customers** - Add some customer accounts
2. **Create Test Employees** - Add some employee accounts
3. **Create Test Projects** - Add sample projects
4. **Test All Features** - Verify everything works correctly
