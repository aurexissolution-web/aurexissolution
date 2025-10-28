# 🚀 Quick Fix: Netlify Environment Variables

## ❌ **Current Error:**
```
Failed to load resource: the server responded with a status of 500 ()
Telegram bot not configured. Please set TELEGRAM_BOT_TOKEN and ADMIN_CHAT_ID environment variables.
```

## ✅ **Solution:**

### **Step 1: Go to Netlify Dashboard**
1. **Open** [netlify.com](https://netlify.com)
2. **Login** to your account
3. **Click** on your Aurexis website

### **Step 2: Add Environment Variables**
1. **Go to** "Site settings" (in the top menu)
2. **Click** "Environment variables" (in the left sidebar)
3. **Click** "Add variable" button

### **Step 3: Add These Variables**

**Variable 1:**
- **Key**: `TELEGRAM_BOT_TOKEN`
- **Value**: `8274877889:AAHm9fHx4CdHqFf3bzotpzraWefuuSazIrg`

**Variable 2:**
- **Key**: `ADMIN_CHAT_ID`
- **Value**: `1020226167`

**Variable 3:**
- **Key**: `BASE_URL`
- **Value**: `https://your-netlify-domain.netlify.app` (replace with your actual Netlify domain)

### **Step 4: Redeploy Site**
1. **Go to** "Deploys" tab
2. **Click** "Trigger deploy" → "Deploy site"
3. **Wait** for deployment to complete

### **Step 5: Test**
1. **Go to** your website
2. **Navigate to** `/admin` → **Telegram Bot** tab
3. **Enter bot token**: `8274877889:AAHm9fHx4CdHqFf3bzotpzraWefuuSazIrg`
4. **Enter chat ID**: `1020226167`
5. **Click "Test Connection"**
6. **Check Telegram** for test message

## 🎯 **Expected Results:**
- ✅ **No more 500 errors**
- ✅ **Telegram notifications work**
- ✅ **Test connection successful**
- ✅ **Live notifications from customer chat**

## 📋 **Environment Variables Summary:**
```bash
TELEGRAM_BOT_TOKEN=8274877889:AAHm9fHx4CdHqFf3bzotpzraWefuuSazIrg
ADMIN_CHAT_ID=1020226167
BASE_URL=https://your-netlify-domain.netlify.app
```

---

**🎉 After this fix, your Telegram notifications will work perfectly!**
