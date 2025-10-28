# 🚀 Telegram Server Deployment Guide

This guide will help you deploy the Telegram notification server to Heroku so that notifications work from your deployed website.

## 🎯 **Why We Need This**

The issue you're experiencing is that Telegram bot settings are stored in your browser's localStorage, which is only available on your laptop. When users visit your deployed website, they don't have access to your bot configuration.

**Solution**: Deploy a server that handles Telegram notifications centrally.

## 📋 **Prerequisites**

- ✅ **Heroku account** - Free tier available
- ✅ **Heroku CLI** - Download from [heroku.com](https://devcenter.heroku.com/articles/heroku-cli)
- ✅ **Git** - Already installed
- ✅ **Telegram bot** - Already set up

## 🚀 **Step 1: Prepare Server for Deployment**

### **1.1: Create Procfile**
Create a `Procfile` in the `server` directory:

```bash
# In server/Procfile
web: node telegram-server.js
```

### **1.2: Update Server Configuration**
The server is already configured to use environment variables:
- `TELEGRAM_BOT_TOKEN` - Your bot token
- `ADMIN_CHAT_ID` - Your chat ID
- `BASE_URL` - Your Netlify domain

## 🚀 **Step 2: Deploy to Heroku**

### **2.1: Login to Heroku**
```bash
heroku login
```

### **2.2: Create Heroku App**
```bash
cd server
heroku create aurexis-telegram-server
```

### **2.3: Set Environment Variables**
```bash
heroku config:set TELEGRAM_BOT_TOKEN=8274877889:AAHm9fHx4CdHqFf3bzotpzraWefuuSazIrg
heroku config:set ADMIN_CHAT_ID=your_admin_chat_id_here
heroku config:set BASE_URL=https://your-netlify-domain.netlify.app
```

### **2.4: Deploy**
```bash
git add .
git commit -m "Add Telegram server"
git push heroku main
```

## 🚀 **Step 3: Update Netlify Configuration**

### **3.1: Add Server URL to Environment Variables**
In your Netlify dashboard, add:
```bash
VITE_TELEGRAM_SERVER_URL=https://aurexis-telegram-server.herokuapp.com
```

### **3.2: Redeploy Netlify**
Your Netlify site will automatically redeploy with the new environment variable.

## 🚀 **Step 4: Test the Setup**

### **4.1: Test Server Health**
Visit: `https://aurexis-telegram-server.herokuapp.com/api/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-12-25T...",
  "botConfigured": true
}
```

### **4.2: Test Telegram Connection**
1. Go to your deployed website
2. Navigate to `/admin` → **Telegram Bot** tab
3. Enter your bot token and chat ID
4. Click "Test Connection"
5. You should receive a test message in Telegram

### **4.3: Test Live Notifications**
1. Open your deployed website in an incognito window
2. Send a message from the customer chat
3. Check Telegram for the notification
4. Verify the notification contains correct info and links

## 🔧 **Alternative: Use Netlify Functions**

If you prefer not to use Heroku, you can use Netlify Functions instead:

### **Create Netlify Function**
Create `netlify/functions/telegram-notify.js`:

```javascript
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { customerName, customerEmail, message, chatRoomId } = JSON.parse(event.body);
  
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
  const BASE_URL = process.env.BASE_URL;

  const messageText = `
🔔 <b>New Chat Message</b>

👤 <b>Customer:</b> ${customerName}
📧 <b>Email:</b> ${customerEmail}
💬 <b>Message:</b> ${message.length > 200 ? message.substring(0, 200) + '...' : message}

🆔 <b>Chat Room ID:</b> <code>${chatRoomId}</code>
⏰ <b>Time:</b> ${new Date().toLocaleString()}
  `;

  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: '💬 Open Chat',
          url: `${BASE_URL}/admin#chat=${chatRoomId}`
        }
      ],
      [
        {
          text: '📱 Open Admin Panel',
          url: `${BASE_URL}/admin`
        }
      ]
    ]
  };

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: messageText,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
        disable_web_page_preview: true
      })
    });

    if (response.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: 'Notification sent' })
      };
    } else {
      throw new Error('Failed to send notification');
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
```

### **Update Chat Service for Netlify Functions**
```javascript
const notifyAdminViaServer = async (customerName, customerEmail, message, chatRoomId) => {
  try {
    const response = await fetch('/.netlify/functions/telegram-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName, customerEmail, message, chatRoomId })
    });

    if (response.ok) {
      console.log('Telegram notification sent via Netlify function');
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};
```

## 🎯 **Environment Variables Summary**

### **Heroku Server:**
```bash
TELEGRAM_BOT_TOKEN=your_bot_token
ADMIN_CHAT_ID=your_chat_id
BASE_URL=https://your-netlify-domain.netlify.app
```

### **Netlify Site:**
```bash
VITE_TELEGRAM_SERVER_URL=https://aurexis-telegram-server.herokuapp.com
# OR for Netlify Functions:
VITE_USE_NETLIFY_FUNCTIONS=true
```

## 🎉 **Expected Results**

After deployment:
- ✅ **Notifications work** from any device visiting your site
- ✅ **Server handles** all Telegram API calls
- ✅ **Centralized configuration** - no localStorage dependency
- ✅ **Reliable delivery** - server-side processing
- ✅ **Scalable solution** - handles multiple users

## 🔧 **Troubleshooting**

### **Server Not Responding:**
- Check Heroku logs: `heroku logs --tail`
- Verify environment variables are set
- Check server health endpoint

### **Notifications Still Not Working:**
- Verify bot token and chat ID are correct
- Check server logs for errors
- Test server endpoints manually

### **CORS Errors:**
- Server includes CORS headers
- Check if server URL is correct in environment variables

---

**🎯 Next Steps:**
1. Deploy the server to Heroku
2. Update Netlify with server URL
3. Test notifications from deployed site
4. Verify everything works end-to-end

Your Telegram notifications will now work from any device visiting your deployed website! 🚀✨
