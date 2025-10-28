#!/bin/bash

# Firebase Rules Deployment Script
# Run this script to deploy Firebase security rules

echo "🚀 Firebase Rules Deployment Script"
echo "=================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
    echo "✅ Firebase CLI installed"
    echo ""
fi

echo "🔐 Step 1: Login to Firebase"
echo "Run this command and follow the browser authentication:"
echo "firebase login"
echo ""

echo "📁 Step 2: Initialize Firebase Project"
echo "Run this command and select your project:"
echo "firebase init firestore"
echo ""
echo "When prompted:"
echo "- Select 'Use an existing project'"
echo "- Choose 'aurexissolutionwebsite'"
echo "- Select 'Yes' to use existing firestore.rules"
echo "- Select 'Yes' to use existing firestore.indexes.json"
echo ""

echo "🚀 Step 3: Deploy Security Rules"
echo "Run this command to deploy the rules:"
echo "firebase deploy --only firestore:rules"
echo ""

echo "✅ Step 4: Verify Deployment"
echo "1. Go to https://console.firebase.google.com/"
echo "2. Select project: aurexissolutionwebsite"
echo "3. Go to Firestore Database → Rules tab"
echo "4. Verify rules are deployed and active"
echo ""

echo "🎯 Expected Result:"
echo "- No more 'Missing or insufficient permissions' errors"
echo "- Admin can create invitations"
echo "- Invitation system works perfectly"
echo ""

echo "📋 Quick Test:"
echo "1. Go to your admin panel"
echo "2. Click 'Customer Invitations' tab"
echo "3. Try creating a new invitation"
echo "4. Should work without errors!"
echo ""

echo "🆘 If you need help:"
echo "- Check Firebase Console for rule status"
echo "- Verify you're logged in as admin"
echo "- Check browser console for errors"
echo ""

echo "Script completed! Follow the steps above to deploy Firebase rules."
