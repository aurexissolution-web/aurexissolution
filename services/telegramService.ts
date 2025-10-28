// services/telegramService.ts
export interface TelegramConfig {
  botToken: string;
  adminChatId: string;
}

export interface TelegramMessage {
  chatId: string;
  text: string;
  parseMode?: 'HTML' | 'Markdown';
  replyMarkup?: {
    inline_keyboard: Array<Array<{
      text: string;
      url?: string;
      callback_data?: string;
    }>>;
  };
}

// Send message to Telegram with timeout
export const sendTelegramMessage = async (
  config: TelegramConfig,
  message: TelegramMessage
): Promise<boolean> => {
  try {
    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: message.chatId,
        text: message.text,
        parse_mode: message.parseMode || 'HTML',
        reply_markup: message.replyMarkup,
        disable_web_page_preview: true
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log('Telegram message sent successfully');
      return true;
    } else {
      const error = await response.text();
      console.error('Failed to send Telegram message:', error);
      return false;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Telegram message timeout');
    } else {
      console.error('Error sending Telegram message:', error);
    }
    return false;
  }
};

// Get the base URL for the application
const getBaseUrl = (): string => {
  // Check if we have a custom base URL in environment variables
  const customBaseUrl = (import.meta as any).env?.VITE_BASE_URL;
  if (customBaseUrl) {
    return customBaseUrl;
  }
  
  // Check if we're in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // For development, return null to disable buttons
    return '';
  }
  
  // For production, use the actual domain
  return window.location.origin;
};

// Send notification to admin when new chat message arrives
export const notifyAdminOfNewMessage = async (
  config: TelegramConfig,
  customerName: string,
  customerEmail: string,
  message: string,
  chatRoomId: string
): Promise<boolean> => {
  const messageText = `
🔔 <b>New Chat Message</b>

👤 <b>Customer:</b> ${customerName}
📧 <b>Email:</b> ${customerEmail}
💬 <b>Message:</b> ${message.length > 200 ? message.substring(0, 200) + '...' : message}

🆔 <b>Chat Room ID:</b> <code>${chatRoomId}</code>
⏰ <b>Time:</b> ${new Date().toLocaleString()}
  `;

  // Only add buttons if we have a valid URL
  const baseUrl = getBaseUrl();
  const replyMarkup = baseUrl ? {
    inline_keyboard: [
      [
        {
          text: '💬 Open Chat',
          url: `${baseUrl}/admin#chat=${chatRoomId}`
        }
      ],
      [
        {
          text: '📱 Open Admin Panel',
          url: `${baseUrl}/admin`
        }
      ]
    ]
  } : undefined;

  return await sendTelegramMessage(config, {
    chatId: config.adminChatId,
    text: messageText,
    replyMarkup
  });
};

// Send notification to customer when admin responds
export const notifyCustomerOfResponse = async (
  config: TelegramConfig,
  customerChatId: string,
  adminName: string,
  message: string,
  chatRoomId: string
): Promise<boolean> => {
  const messageText = `
✅ <b>Admin Response</b>

👨‍💼 <b>From:</b> ${adminName}
💬 <b>Message:</b> ${message.length > 200 ? message.substring(0, 200) + '...' : message}

🆔 <b>Chat Room ID:</b> <code>${chatRoomId}</code>
⏰ <b>Time:</b> ${new Date().toLocaleString()}
  `;

  // Only add buttons if we have a valid URL
  const baseUrl = getBaseUrl();
  const replyMarkup = baseUrl ? {
    inline_keyboard: [
      [
        {
          text: '💬 Continue Chat',
          url: `${baseUrl}/#chat=${chatRoomId}`
        }
      ]
    ]
  } : undefined;

  return await sendTelegramMessage(config, {
    chatId: customerChatId,
    text: messageText,
    replyMarkup
  });
};

// Get bot information
export const getBotInfo = async (botToken: string): Promise<any> => {
  try {
    const url = `https://api.telegram.org/bot${botToken}/getMe`;
    const response = await fetch(url);
    
    if (response.ok) {
      const data = await response.json();
      return data.result;
    } else {
      throw new Error('Failed to get bot info');
    }
  } catch (error) {
    console.error('Error getting bot info:', error);
    throw error;
  }
};

// Test bot connection
export const testBotConnection = async (config: TelegramConfig): Promise<boolean> => {
  try {
    const botInfo = await getBotInfo(config.botToken);
    
    // Send test message to admin
    const testMessage = `
🤖 <b>Bot Connection Test</b>

✅ Bot is working correctly!
👤 <b>Bot Name:</b> ${botInfo.first_name}
🆔 <b>Bot Username:</b> @${botInfo.username}
⏰ <b>Test Time:</b> ${new Date().toLocaleString()}
    `;

    return await sendTelegramMessage(config, {
      chatId: config.adminChatId,
      text: testMessage
    });
  } catch (error) {
    console.error('Bot connection test failed:', error);
    return false;
  }
};
