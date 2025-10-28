# 🚀 Aurexis Solution IT Website

A modern, responsive website for Aurexis Solution IT with live chat functionality and Telegram notifications.

## 🎯 One-Click Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/jrh4ck3r/aurexis-solution)

Click the button above to deploy instantly! After deployment, add your Firebase environment variables in Netlify settings.

## ✨ Features

- 🎨 **Modern Design** - Responsive and mobile-friendly
- 💬 **Live Chat** - Real-time customer support
- 🤖 **Telegram Notifications** - Instant admin alerts
- 📱 **Mobile Optimized** - Perfect on all devices
- 🔥 **Firebase Integration** - Real-time database
- 🎯 **Admin Dashboard** - Complete management system

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Notifications**: Telegram Bot API
- **Deployment**: Netlify

## 🚀 Quick Deploy (Recommended)

### Option 1: One-Click Deploy (Easiest - 2 Minutes)
1. Click the **"Deploy to Netlify"** button above
2. Connect your GitHub account
3. Deploy automatically
4. Add environment variables (see [NETLIFY_ENV_VARIABLES.txt](NETLIFY_ENV_VARIABLES.txt))

### Option 2: Manual Netlify Deploy
1. Go to [https://app.netlify.com/](https://app.netlify.com/)
2. Click "Import from Git" → Select this repository
3. Deploy with default settings
4. Add environment variables from [NETLIFY_ENV_VARIABLES.txt](NETLIFY_ENV_VARIABLES.txt)

### Option 3: Local Development
1. **Clone the repository**:
   ```bash
   git clone https://github.com/jrh4ck3r/aurexis-solution.git
   cd aurexis-solution
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   # Create .env file with your Firebase configuration
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

## 📱 Live Demo

🌐 **Website**: Coming soon after deployment!

**GitHub Repository**: [https://github.com/jrh4ck3r/aurexis-solution](https://github.com/jrh4ck3r/aurexis-solution)

## 🔧 Setup Guides

- 📖 **[Telegram Bot Setup](TELEGRAM_BOT_SETUP_GUIDE.md)** - Configure Telegram notifications
- 🚀 **[Complete Deployment Guide](COMPLETE_DEPLOYMENT_GUIDE.md)** - Deploy to Netlify
- 🔥 **[Firebase Setup](FIREBASE_CHAT_RULES.md)** - Configure Firebase

## 📞 Contact

- **Email**: info@aurexis-solution-it.com
- **Website**: https://aurexis-solution-it.com

## 📄 License

This project is licensed under the MIT License.
