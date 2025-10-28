// netlify/functions/telegram-notify.js
exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { customerName, customerEmail, message, chatRoomId } = JSON.parse(event.body);

    // Validate required fields
    if (!customerName || !customerEmail || !message || !chatRoomId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: customerName, customerEmail, message, chatRoomId' 
        }),
      };
    }

    // Get environment variables
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
    const BASE_URL = process.env.BASE_URL || 'https://your-site.netlify.app';

    // Validate configuration
    if (!TELEGRAM_BOT_TOKEN || !ADMIN_CHAT_ID) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          success: false, 
          error: 'Telegram bot not configured. Please set TELEGRAM_BOT_TOKEN and ADMIN_CHAT_ID environment variables.' 
        }),
      };
    }

    // Create notification message
    const messageText = `
🔔 <b>New Chat Message</b>

👤 <b>Customer:</b> ${customerName}
📧 <b>Email:</b> ${customerEmail}
💬 <b>Message:</b> ${message.length > 200 ? message.substring(0, 200) + '...' : message}

🆔 <b>Chat Room ID:</b> <code>${chatRoomId}</code>
⏰ <b>Time:</b> ${new Date().toLocaleString()}
    `;

    // Create inline keyboard with buttons
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

    // Send message to Telegram
    const telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: messageText,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
        disable_web_page_preview: true
      })
    });

    if (telegramResponse.ok) {
      const result = await telegramResponse.json();
      console.log('Telegram notification sent successfully:', result);
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          success: true, 
          message: 'Notification sent successfully',
          telegramResult: result
        }),
      };
    } else {
      const errorText = await telegramResponse.text();
      console.error('Failed to send Telegram message:', errorText);
      
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          success: false, 
          error: 'Failed to send Telegram notification',
          details: errorText
        }),
      };
    }
  } catch (error) {
    console.error('Error in telegram-notify function:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message
      }),
    };
  }
};
