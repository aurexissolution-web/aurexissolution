# 🔐 Default HR User Setup

## Quick Setup (2 minutes)

### Step 1: Go to Firebase Console
1. Visit: https://console.firebase.google.com/
2. Select project: **aurexis-solution**
3. Click: **Firestore Database** (in left sidebar)
4. Click on: **users** collection

### Step 2: Add New Document
Click the **"Add document"** button

### Step 3: Copy-Paste These Values

**Document ID:** Leave as "auto-generate" ✅

**Fields to add:**

| Field Name | Type | Value |
|------------|------|-------|
| `email` | string | `hr@aurexis.com` |
| `role` | string | `hr` |
| `uniqueId` | string | `HR-001` |
| `password` | string | `HR2024` |
| `defaultPassword` | string | `HR2024` |
| `hasChangedPassword` | boolean | `false` |
| `isActive` | boolean | `true` |
| `createdBy` | string | `system` |
| `commissionRate` | number | `0` |
| `createdAt` | timestamp | Click "INSERT FIELD" → Select "timestamp" → Use current time |
| `assignedProjects` | array | Leave empty `[]` |

### Step 4: Save
Click **"Save"** button

---

## 🎉 Your Default HR Login Credentials:

```
Email:    hr@aurexis.com
Password: HR2024
```

---

## 🔐 How to Login:

1. Go to: http://localhost:3001/#/login
2. Click the **"HR"** button (orange)
3. Enter email: `hr@aurexis.com`
4. Enter password: `HR2024`
5. Click **"Login"**

✅ You'll be redirected to the HR Dashboard!

---

## ✏️ How to Change Password Later:

1. Login to HR Dashboard
2. Go to **"User Management"** tab
3. Find your HR user (`hr@aurexis.com`)
4. Click **"Edit"** button
5. Update the email/password as needed
6. Save changes

---

## 📝 Alternative: Create Through Admin Panel

If you already have admin access:
1. Login as Admin
2. Go to HR Dashboard link
3. Go to User Management tab
4. Click "Add New User"
5. Select Role: "HR (Human Resources)"
6. Enter your preferred email
7. System will generate credentials

---

**Need help?** Just follow the steps above in Firebase Console!

