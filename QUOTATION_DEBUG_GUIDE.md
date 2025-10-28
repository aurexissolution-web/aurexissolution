# 🔍 Quotation System - Complete Debug Guide

## ✅ STEP-BY-STEP DEBUGGING

### 🎯 STEP 1: Verify Firestore Data

1. **Go to Firebase Console:**
   - https://console.firebase.google.com
   - Select your project: `aurexissolutionwebsite`

2. **Check Firestore Database:**
   - Click "Firestore Database" in sidebar
   - Look for "quotations" collection
   - **Do you see any documents?**
     - ✅ YES → Go to Step 2
     - ❌ NO → Create a quotation first (Step 5)

3. **Inspect a Quotation Document:**
   Click on any quotation document and verify these fields:
   ```
   ✅ id: "abc123..."
   ✅ quoteNumber: "QUOT-2024-001"
   ✅ customerUniqueId: "12345..."  ← IMPORTANT!
   ✅ customerEmail: "customer@email.com"
   ✅ customerCode: "12345..."
   ✅ quotationFileUrl: "data:application/pdf..."
   ✅ status: "Sent"
   ✅ createdAt: timestamp
   ```

---

### 🎯 STEP 2: Verify Customer Account

1. **Open browser console (F12)**

2. **Login as customer**

3. **Check console for this message:**
   ```javascript
   👤 User logged in: {
     email: "customer@email.com",
     uniqueId: "12345...",
     role: "customer"
   }
   ```

4. **Copy the uniqueId** - you'll need it!

---

### 🎯 STEP 3: Check Data Loading

**Stay logged in as customer**

**Look for these console messages:**

```javascript
// Should see this when page loads:
📄 Quotations loaded from Firestore: X

// Then when you go to Payments page:
🔍 Customer Quotations Debug:
  Total quotations: X
  User uniqueId: YOUR_ID
  User email: YOUR_EMAIL
  All quotations: [Array of quotations]
  Filtered quotations: X
```

**Analyze the output:**

#### Case A: "Total quotations: 0"
**Problem:** No quotations in Firestore
**Solution:** Create a quotation as admin (Step 5)

#### Case B: "Total quotations: 5" but "Filtered quotations: 0"
**Problem:** Quotations exist but none match your customer
**Solution:** 
1. Go back to Firebase Console
2. Check `customerUniqueId` in each quotation
3. Compare with your `uniqueId` from console
4. They should MATCH!

#### Case C: "Filtered quotations: 2"
**Problem:** Quotations matched but not displaying
**Solution:** Check Step 4 (UI rendering)

---

### 🎯 STEP 4: Check UI Rendering

**Stay on customer dashboard → Quotations tab**

**Open React DevTools:**
1. Press F12
2. Click "Components" tab (if available)
3. Find `CustomerPaymentUpload` component
4. Check props/state:
   - `quotations`: [array]
   - `myQuotations`: [array]
   - `activeTab`: "quotations"

**If myQuotations has items but nothing shows:**
- Check for JavaScript errors in console
- Try hard refresh (Cmd+Shift+R)
- Clear browser cache

---

### 🎯 STEP 5: Create Test Quotation (As Admin)

1. **Logout, login as admin**

2. **Go to:** Admin Dashboard → Payment Management

3. **Click:** "Quotations" tab

4. **Click:** "+ Create Quotation"

5. **Fill form EXACTLY:**
   ```
   Customer: [Select the customer you're testing with]
   Quotation Number: TEST-001
   Amount: 1000
   Issue Date: [Today's date]
   Expiry Date: [30 days from today]
   Upload File: [Any PDF file < 10MB]
   ```

6. **Click:** "Create Quotation"

7. **Check console for:**
   ```javascript
   Creating quotation with data: {...}
   ```

8. **Look for success/error:**
   - ✅ Success: "✅ Quotation created successfully!"
   - ❌ Error: "Failed to create quotation: [error message]"

9. **If error, copy the EXACT error message**

---

### 🎯 STEP 6: Verify in Firestore

**After creating quotation:**

1. **Go back to Firebase Console → Firestore**
2. **Refresh the quotations collection**
3. **Find TEST-001**
4. **Verify customerUniqueId matches your customer's uniqueId**

---

### 🎯 STEP 7: Test as Customer

1. **Logout, login as customer**
2. **Open console (F12)**
3. **Go to:** Payments & Invoices → Quotations tab
4. **Check console:**
   ```javascript
   📄 Quotations loaded from Firestore: X (should be > 0)
   🔍 Customer Quotations Debug:
     Total quotations: X
     ✅ Match found: TEST-001  ← Should see this!
     Filtered quotations: 1
   ```
5. **You should see TEST-001 quotation card!**

---

## 🐛 COMMON ISSUES & FIXES

### Issue 1: "quotations is undefined"
**Problem:** AppContext not providing quotations
**Fix:** Check if `useAppContext()` is imported correctly
**Check:** Console should show "📄 Quotations loaded"

### Issue 2: "customerUniqueId doesn't match"
**Problem:** Quotation created with wrong customer ID
**Fix:**
1. Go to Firebase Console
2. Edit the quotation document
3. Set `customerUniqueId` to match customer's `uniqueId`
4. Set `customerEmail` to match customer's email

### Issue 3: "Firestore permission denied"
**Problem:** Rules not deployed
**Fix:**
```bash
cd /path/to/project
firebase deploy --only firestore:rules
```

### Issue 4: "File upload fails"
**Problem:** File too large or wrong format
**Fix:**
- Use file < 10MB
- Use PDF, JPG, or PNG format
- Try a smaller test file

### Issue 5: "Quotation created but not showing"
**Problem:** Cache or real-time sync issue
**Fix:**
1. Hard refresh (Cmd+Shift+R)
2. Logout and login again
3. Check if `onSnapshot` is working (console logs)

---

## 📊 EXPECTED CONSOLE OUTPUT

### Successful Flow:

```javascript
// 1. On page load (customer logged in):
📄 Quotations loaded from Firestore: 5

// 2. When viewing Payments page:
🔍 Customer Quotations Debug:
  Total quotations: 5
  User uniqueId: abc123
  User email: test@email.com
  All quotations: [Array(5)]
  ✅ Match found: QUOT-2024-001 Object{...}
  ✅ Match found: QUOT-2024-002 Object{...}
  Filtered quotations: 2

// 3. Result:
// You see 2 quotation cards on the page ✅
```

### Failed Flow (No match):

```javascript
// 1. On page load:
📄 Quotations loaded from Firestore: 5

// 2. When viewing Payments page:
🔍 Customer Quotations Debug:
  Total quotations: 5
  User uniqueId: xyz789  ← Customer ID
  User email: other@email.com
  All quotations: [Array(5)]
  // NO "✅ Match found" messages!
  Filtered quotations: 0

// 3. Result:
// Empty state message shown ❌
// Problem: customerUniqueId in quotations doesn't match xyz789
```

---

## 🎬 QUICK TEST SCRIPT

**Copy this into browser console (as customer):**

```javascript
// Get AppContext data
console.log('=== QUOTATION DEBUG ===');
console.log('User:', localStorage.getItem('user'));
console.log('Quotations in AppContext:', window.quotations);

// Manual check
const user = JSON.parse(localStorage.getItem('user') || '{}');
console.log('Customer uniqueId:', user.uniqueId);
console.log('Customer email:', user.email);
```

---

## 📞 REPORT TO DEVELOPER

If still not working, provide these details:

1. **Firestore screenshot:**
   - Show quotations collection
   - Show one quotation document with all fields

2. **Console logs:**
   - "📄 Quotations loaded" message
   - Complete "🔍 Customer Quotations Debug" output
   - Any error messages

3. **User details:**
   - Customer email
   - Customer uniqueId
   - Customer role

4. **Expected vs Actual:**
   - What you expected to see
   - What you actually see

---

## ✅ SUCCESS CHECKLIST

- [ ] Quotations exist in Firestore
- [ ] customerUniqueId matches customer's uniqueId
- [ ] Console shows "Quotations loaded from Firestore"
- [ ] Console shows "Match found" for your quotations
- [ ] Filtered quotations > 0
- [ ] Quotation cards display on page
- [ ] Download button works

**If all checked ✅ = System working perfectly!**

