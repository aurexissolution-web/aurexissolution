# Netlify Auto-Deploy Setup Guide

## ✅ Completed Steps

1. ✅ Git repository initialized
2. ✅ Code pushed to GitHub: https://github.com/jrh4ck3r/aurexis-solution
3. ✅ Firebase config updated to use environment variables

---

## 🚀 Next Steps: Connect Netlify

### Step 1: Create Netlify Account & Import Project

1. **Go to Netlify**: https://app.netlify.com/
2. **Sign up/Login** (recommended: use your GitHub account for easy integration)
3. Click **"Add new site"** → **"Import an existing project"**
4. Choose **"Deploy with GitHub"**
5. **Authorize Netlify** to access your GitHub repositories
6. Select repository: **`jrh4ck3r/aurexis-solution`**

### Step 2: Configure Build Settings

Netlify should auto-detect settings from `netlify.toml`, but verify:

- **Branch to deploy**: `main`
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18

Click **"Deploy site"**

### Step 3: Add Environment Variables (CRITICAL!)

After the first deployment, go to:
**Site settings → Environment variables → Add a variable**

Add these Firebase environment variables:

```
VITE_FIREBASE_API_KEY = AIzaSyBYmTVBYqUDioNmXUA3RFO6WQjlAkSUxvo
VITE_FIREBASE_AUTH_DOMAIN = aurexissolutionwebsite.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = aurexissolutionwebsite
VITE_FIREBASE_STORAGE_BUCKET = aurexissolutionwebsite.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID = 1059150234102
VITE_FIREBASE_APP_ID = 1:1059150234102:web:0feea8b23ef66aafb507d7
VITE_FIREBASE_MEASUREMENT_ID = G-C8B63GHDQD
```

**After adding variables**, click **"Trigger deploy"** to rebuild with the environment variables.

### Step 4: Set Up Custom Domain (Optional)

1. Go to **Site settings → Domain management**
2. Click **"Add custom domain"**
3. Follow the instructions to configure DNS

---

## 🎯 How Auto-Deploy Works

Once connected:

1. **Any push to `main` branch** → Netlify automatically deploys
2. **Pull requests** → Netlify creates preview deployments
3. **Build fails** → You get notified via email

---

## 📝 Making Changes Going Forward

### From now on, to deploy changes:

```bash
# 1. Make your code changes
# 2. Stage and commit
git add .
git commit -m "Your change description"

# 3. Push to GitHub (triggers auto-deploy)
git push origin main
```

**That's it!** Netlify will automatically:
- Detect the push
- Run `npm run build`
- Deploy to production
- Send you a notification

---

## 🔧 Netlify Functions (Telegram Integration)

Your project has Netlify Functions in `netlify/functions/`:
- `telegram-notify.js`
- `telegram-test.js`

These will be automatically deployed and available at:
- `https://your-site.netlify.app/.netlify/functions/telegram-notify`
- `https://your-site.netlify.app/.netlify/functions/telegram-test`

---

## 🛠 Troubleshooting

### Build fails?
1. Check build logs in Netlify dashboard
2. Verify all environment variables are set
3. Make sure `package.json` dependencies are correct

### Firebase not connecting?
1. Verify environment variables are exactly as shown above
2. Check Firebase console for any security rules blocking access
3. Ensure Firebase domain is added to authorized domains

---

## 📱 Netlify CLI (Optional)

For local testing and manual deploys:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Link to your site
netlify link

# Test locally with Netlify Dev
netlify dev

# Manual deploy
netlify deploy --prod
```

---

## ✨ You're All Set!

Your workflow is now:
1. Code → Commit → Push
2. Netlify automatically builds and deploys
3. Visit your live site!

**Next:** Complete the Netlify setup steps above and your site will be live! 🚀

