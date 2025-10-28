# 🐛 Debugging Guide: Clock In/Out & Tasks Not Showing

## 🔍 Issue 1: Clock In/Out Not Showing in Monitoring Page

### **How to Debug:**

1. **Open Browser Console** (F12 or Right-click → Inspect → Console)

2. **Go to Employee Dashboard** and click "Clock In"

3. **Check Console Output:**
   ```
   Expected output:
   ✅ Clocking in user: { id: "abc123", email: "employee@example.com", uniqueId: "EMP001" }
   ✅ Clock in successful
   ```

4. **Check for Errors:**
   - ❌ "User not authenticated" → Login expired
   - ❌ "Insufficient permissions" → Firebase rules issue
   - ❌ "Failed to clock in" → See error message

5. **Go to Admin → Employee Monitoring**

6. **Click "Add Employee"** button

7. **Select the employee** who just clocked in

8. **Click "Add Selected"**

9. **Refresh the monitoring page** → Employee should now appear!

### **Why This Happens:**

The monitoring page only shows employees who have been **explicitly added** to monitoring. This is by design to avoid showing all employees by default.

### **Solution Options:**

#### **Option A: Manual Add (Current System)**
- Admin must click "Add Employee" first
- Then employees appear when they clock in/out
- Good for controlling who is monitored

#### **Option B: Auto-Add (I can implement this)**
- Automatically add employee to monitoring when they clock in
- No manual step needed
- All clocking employees appear automatically

**Want me to implement Option B?** Just say "auto-add employees" and I'll code it!

---

## 🔍 Issue 2: Tasks Not Showing in Employee Dashboard

### **How to Debug:**

1. **Open Browser Console** (F12)

2. **Go to Employee Dashboard → Tasks Tab**

3. **Check Console Output:**
   ```
   Expected output:
   ✅ Subscribing to tasks for user: abc123
   ✅ Tasks loaded: [array of tasks]
   ```

4. **Check What You See:**
   
   **If you see:**
   ```
   Subscribing to tasks for user: abc123
   Tasks loaded: []
   ```
   → **No tasks assigned to this employee**

   **If you see:**
   ```
   Subscribing to tasks for user: abc123
   Tasks loaded: [{ id: "task1", title: "Fix bug", ... }]
   ```
   → **Tasks are loading!** Check the Tasks tab

   **If you see:**
   ```
   ERROR: ...
   ```
   → **Permission issue** or **Query error**

### **Common Causes:**

#### **1. No Tasks Assigned**
- Go to Admin → Employee Monitoring
- Click employee → "Assign Task"
- Create a task
- Check employee dashboard again

#### **2. Wrong Employee ID**
- The task's `employeeId` must match the employee's `user.id`
- Check console: `Subscribing to tasks for user: {THIS_ID}`
- Check Firestore: task document → `employeeId` field must match

#### **3. Firebase Index Missing**
- If you see "index required" error
- Firebase Console will show a link
- Click the link to create index
- Wait 2-3 minutes
- Refresh page

#### **4. Firebase Rules Blocking**
- Check Firestore rules for `tasks` collection
- Should allow: `employeeId == request.auth.uid` OR `true` (open)
- Our rules are currently open: `allow read, write: if true`

---

## 🧪 Step-by-Step Test

### **Test Clock In/Out:**

1. **Create Employee Account:**
   - Admin → User Management
   - Add user with role "employee"
   - Email: test@example.com

2. **Add to Monitoring:**
   - Admin → Employee Monitoring
   - Click "Add Employee"
   - Select test@example.com
   - Click "Add Selected"

3. **Login as Employee:**
   - Logout from admin
   - Login as test@example.com
   - Go to Dashboard

4. **Clock In:**
   - Go to "Attendance" tab
   - Click "Clock In" button
   - Should see: ✅ "Clocked in successfully!"
   - Check console for logs

5. **Check Monitoring:**
   - Login as admin
   - Go to Employee Monitoring
   - Refresh page if needed
   - Should see: test@example.com with "Clocked In" status

### **Test Tasks:**

1. **Create Task (as Admin):**
   - Admin → Employee Monitoring
   - Find test@example.com
   - Click "Assign Task" button (list icon)
   - Fill in:
     - Title: "Test Task"
     - Description: "This is a test"
     - Priority: "medium"
     - Deadline: tomorrow's date
   - Upload a small file (< 800KB) - optional
   - Click "Create Task"
   - Should see: ✅ "Task assigned successfully!"

2. **Check Task (as Employee):**
   - Login as test@example.com
   - Go to Dashboard
   - Click "Tasks" tab
   - Open console (F12)
   - Check for: "Tasks loaded: [{...}]"
   - Should see: "Test Task" in the list

3. **Open Task Details:**
   - Click on the task
   - Should see: Full details, progress bar, attachments
   - Try changing status to "in-progress"
   - Move progress slider
   - Should update successfully

---

## 🔧 Quick Fixes

### **Fix 1: Employee Not Showing After Clock In**

**Option A (Manual):**
```
1. Admin → Employee Monitoring
2. Click "Add Employee"
3. Select the employee
4. Click "Add Selected"
5. Refresh page
```

**Option B (Auto - I can implement):**
I can modify the clock-in function to automatically add the employee to monitoring. Want this?

### **Fix 2: Tasks Not Loading**

**Check #1: User ID Match**
```javascript
// In console, check:
console.log('My User ID:', localStorage.getItem('user'));
// Then in Firestore, check task document:
// employeeId field must match the user's id
```

**Check #2: Firestore Rules**
```javascript
// tasks collection must allow read for employee
match /tasks/{docId} {
  allow read: if true; // Currently open
}
```

**Check #3: Index Exists**
- Go to: https://console.firebase.google.com/project/aurexissolutionwebsite/firestore/indexes
- Should see index for `tasks` collection
- Fields: `employeeId` (ASC) + `deadline` (ASC)
- Status should be "Enabled"

### **Fix 3: Refresh Monitoring Page**

The monitoring page uses real-time updates, but sometimes needs a manual refresh:
```
1. Click "Refresh" button in monitoring page
2. Or press F5 to reload page
3. Data should update
```

---

## 📊 Expected Behavior

### **Clock In/Out Flow:**
1. Employee clicks "Clock In" → Creates record in `timeTracking` collection
2. Record includes: `employeeId`, `date`, `clockInTime`, `status: "clocked-in"`
3. If employee is in monitoring → Shows as "Clocked In" immediately
4. If not in monitoring → Won't show until added

### **Tasks Flow:**
1. Admin creates task → Saves to `tasks` collection with `employeeId`
2. Employee dashboard subscribes to tasks where `employeeId == user.id`
3. Tasks load in real-time via Firestore listener
4. Employee can update status, progress → Saves back to Firestore
5. Admin sees updates in real-time

---

## 🆘 Still Not Working?

### **Collect Debug Info:**

1. **Open Console** (F12)
2. **Copy all console messages**
3. **Check for errors** (red text)
4. **Go to Firestore Console:**
   - Check `timeTracking` collection → Any records?
   - Check `tasks` collection → Any tasks?
5. **Check user data:**
   ```javascript
   console.log(JSON.parse(localStorage.getItem('user')));
   ```
6. **Share this info** and I'll help debug!

### **Common Error Messages:**

| Error | Cause | Fix |
|-------|-------|-----|
| "User not authenticated" | localStorage cleared | Re-login |
| "Insufficient permissions" | Firebase rules | Update rules |
| "Index required" | Missing Firestore index | Create index |
| "Failed to clock in" | Network/Firebase issue | Check connection |
| "Tasks loaded: []" | No tasks or wrong ID | Create task or check IDs |

---

## 💡 Want Automatic Fixes?

I can implement:

1. **Auto-add employees to monitoring when they clock in**
   - No manual "Add Employee" step needed
   - Just say: "auto-add employees"

2. **Better error messages with specific fixes**
   - Say: "improve error messages"

3. **Auto-refresh monitoring page**
   - Say: "add auto-refresh"

4. **Show all employees regardless of monitoring status**
   - Say: "show all employees"

Just let me know what you want! 🚀

