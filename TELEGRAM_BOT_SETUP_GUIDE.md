# 🤖 Telegram Bot Notifications Setup Guide

This guide will help you set up Telegram bot notifications for your chat system. Telegram notifications are much easier to set up than FCM and work reliably across all devices.

## 🎯 **Why Telegram Notifications?**

- ✅ **Easy Setup** - No complex configuration required
- ✅ **Reliable Delivery** - Works on all devices and platforms
- ✅ **Rich Formatting** - HTML formatting and inline buttons
- ✅ **Instant Notifications** - Real-time delivery
- ✅ **No Server Required** - Direct API integration
- ✅ **Mobile Friendly** - Works perfectly on mobile devices

## 📋 **Step-by-Step Setup:**

### **Step 1: Create Telegram Bot**

1. **Open Telegram** on your phone or computer
2. **Search for** `@BotFather`
3. **Start a chat** with BotFather
4. **Send command**: `/newbot`
5. **Follow the instructions**:
   - Enter bot name: `Aurexis Chat Bot`
   - Enter bot username: `aurexis_chat_bot` (must end with `_bot`)
6. **Copy the Bot Token** (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### **Step 2: Get Your Chat ID**

1. **Send a message** to your new bot
2. **Open this URL** in your browser:
   ```
   https://api.telegram.org/bot[YOUR_BOT_TOKEN]/getUpdates
   ```
   Replace `[YOUR_BOT_TOKEN]` with your actual bot token
3. **Find your chat ID** in the response:
   ```json
   {
     "message": {
       "chat": {
         "id": 123456789,
         "first_name": "Your Name"
       }
     }
   }
   ```
4. **Copy the chat ID** (the number, e.g., `123456789`)

### **Step 3: Configure in Admin Panel**

1. **Go to** `/admin` → **Telegram Bot** tab
2. **Enter Bot Token**: Paste your bot token
3. **Enter Admin Chat ID**: Paste your chat ID
4. **Click "Test Connection"**
5. **Verify** you receive a test message
6. **Click "Save Settings"**

### **Step 4: Configure Base URL (Important!)**

For Telegram notifications to work properly, you need to set up the base URL:

#### **For Development:**
- **Leave empty** - Buttons will be disabled in development
- **Or use your domain** - If you have a public domain

#### **For Production:**
- **Set your actual domain** - e.g., `https://yourdomain.com`
- **This enables clickable buttons** in Telegram notifications

#### **How to Set Base URL:**
1. **Create `.env` file** in your project root
2. **Add this line**:
   ```
   VITE_BASE_URL=https://yourdomain.com
   ```
3. **Replace `yourdomain.com`** with your actual domain
4. **Restart your development server**

### **Step 5: Test Notifications**

1. **Send a test message** from customer chat
2. **Check Telegram** for notification
3. **Verify** notification contains:
   - Customer name and email
   - Message content
   - Direct link to admin panel (if URL is configured)
   - Chat room ID

## 🔧 **Features Included:**

### **Rich Notifications:**
- 📱 **Customer Details** - Name, email, message
- 🔗 **Direct Links** - Click to open chat in admin panel
- ⏰ **Timestamp** - When message was sent
- 🆔 **Chat Room ID** - For easy reference

### **Interactive Buttons:**
- 💬 **Open Chat** - Direct link to specific chat room
- 📱 **Open Admin Panel** - Link to admin dashboard
- 🔄 **Auto-refresh** - Real-time updates

### **Smart Formatting:**
- **HTML formatting** for better readability
- **Bold text** for important information
- **Code blocks** for IDs and technical data
- **Emojis** for visual appeal

## 🚨 **Troubleshooting:**

### **Issue: "Bot Token Invalid"**
**Solutions:**
- Check if bot token is copied correctly
- Ensure no extra spaces or characters
- Verify bot was created successfully

### **Issue: "Chat ID Not Found"**
**Solutions:**
- Send a message to your bot first
- Check the getUpdates URL is correct
- Verify chat ID is a number (not username)

### **Issue: "Test Message Not Received"**
**Solutions:**
- Check if bot is blocked or deleted
- Verify chat ID is correct
- Try sending a message to bot manually

### **Issue: "Notifications Not Working"**
**Solutions:**
- Check browser console for errors
- Verify settings are saved in localStorage
- Test bot connection again

## 📊 **Testing Checklist:**

- [ ] Bot created successfully with BotFather
- [ ] Bot token copied correctly
- [ ] Chat ID obtained from getUpdates
- [ ] Settings saved in admin panel
- [ ] Test connection successful
- [ ] Test message received in Telegram
- [ ] Customer message triggers notification
- [ ] Notification contains all required info
- [ ] Links work correctly

## 🎉 **Expected Results:**

After setup, you should receive notifications like this:

```
🔔 New Chat Message

👤 Customer: John Doe
📧 Email: john@example.com
💬 Message: Hi, I need help with my website...

🆔 Chat Room ID: abc123def456
⏰ Time: 12/25/2024, 2:30:45 PM

[💬 Open Chat] [📱 Open Admin Panel]
```

## 🔄 **Next Steps:**

1. **Create your bot** with BotFather
2. **Get your chat ID** using getUpdates
3. **Configure in admin panel**
4. **Test the connection**
5. **Start receiving notifications!**

Your Telegram notification system is now ready! 🤖✨

## 💡 **Pro Tips:**

- **Pin notifications** in Telegram for easy access
- **Use bot commands** for quick actions (optional)
- **Set up multiple admins** by adding their chat IDs
- **Customize notification format** in the code if needed
- **Monitor bot usage** through BotFather commands
