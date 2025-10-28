// netlify/functions/telegram-test.js
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
    // Get environment variables
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

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

    // Create test message
    const testMessage = `
🤖 <b>Bot Connection Test</b>

✅ Bot is working correctly!
⏰ <b>Test Time:</b> ${new Date().toLocaleString()}
    `;

    // Send test message to Telegram
    const telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: testMessage,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    if (telegramResponse.ok) {
      const result = await telegramResponse.json();
      console.log('Telegram test message sent successfully:', result);
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          success: true, 
          message: 'Test message sent successfully',
          telegramResult: result
        }),
      };
    } else {
      const errorText = await telegramResponse.text();
      console.error('Failed to send Telegram test message:', errorText);
      
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          success: false, 
          error: 'Failed to send test message',
          details: errorText
        }),
      };
    }
  } catch (error) {
    console.error('Error in telegram-test function:', error);
    
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
