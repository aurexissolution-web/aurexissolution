// services/chatService.ts
import { 
  collection, 
  doc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { getTelegramConfig } from './telegramConfigService';
import { notifyAdminOfNewMessage as notifyAdminTelegram, notifyCustomerOfResponse as notifyCustomerTelegram } from './telegramService';

// Chat message interface
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  receiverId: string;
  message: string;
  timestamp: Timestamp;
  isRead: boolean;
  chatRoomId: string;
}

// Chat room interface
export interface ChatRoom {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  isAnonymous?: boolean;
  adminId?: string;
  adminName?: string;
  status: 'active' | 'closed' | 'waiting';
  lastMessage?: string;
  lastMessageTime?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Create a new chat room (supports anonymous users)
export const createChatRoom = async (
  customerId: string, 
  customerName: string, 
  customerEmail: string,
  isAnonymous: boolean = false
): Promise<string> => {
  try {
    console.log('Creating chat room for:', { customerId, customerName, customerEmail, isAnonymous });
    const chatRoomsRef = collection(db, 'chatRooms');
    const chatRoomData = {
      customerId: isAnonymous ? `anonymous_${Date.now()}` : customerId,
      customerName,
      customerEmail: isAnonymous ? 'anonymous@example.com' : customerEmail,
      isAnonymous,
      status: 'waiting',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    console.log('Chat room data:', chatRoomData);
    const docRef = await addDoc(chatRoomsRef, chatRoomData);
    console.log('Chat room created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating chat room:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
};

// Send a message with optimized performance
export const sendMessage = async (
  chatRoomId: string,
  senderId: string,
  senderName: string,
  senderEmail: string,
  receiverId: string,
  message: string
): Promise<string> => {
  try {
    // Validate required fields
    if (!chatRoomId) throw new Error('Chat room ID is required');
    if (!senderId) throw new Error('Sender ID is required');
    if (!senderName) throw new Error('Sender name is required');
    if (!senderEmail) throw new Error('Sender email is required');
    if (!receiverId) throw new Error('Receiver ID is required');
    if (!message || message.trim() === '') throw new Error('Message content is required');

    const messagesRef = collection(db, 'chatMessages');
    const messageData = {
      chatRoomId,
      senderId,
      senderName,
      senderEmail,
      receiverId,
      message: message.trim(),
      timestamp: serverTimestamp(),
      isRead: false
    };
    
    // Use batch write for better performance and atomicity
    const batch = writeBatch(db);
    
    // Add message
    const messageRef = doc(messagesRef);
    batch.set(messageRef, messageData);
    
    // Update chat room with last message
    const chatRoomRef = doc(db, 'chatRooms', chatRoomId);
    batch.update(chatRoomRef, {
      lastMessage: message.trim(),
      lastMessageTime: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Commit batch write
    await batch.commit();

    // Send Telegram notification asynchronously (non-blocking)
    sendTelegramNotificationFallback(chatRoomId, senderId, senderName, senderEmail, receiverId, message.trim());

    return messageRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Fallback Telegram notification (direct API call)
const sendTelegramNotificationFallback = async (
  chatRoomId: string,
  senderId: string,
  senderName: string,
  senderEmail: string,
  receiverId: string,
  message: string
) => {
  try {
    // Get bot configuration from Firebase
    const telegramConfig = await getTelegramConfig();
    
    if (!telegramConfig || !telegramConfig.isEnabled || !telegramConfig.botToken || !telegramConfig.adminChatId) {
      console.warn('Telegram bot not configured or disabled, skipping notification');
      return;
    }
    
    // Create notification message
    const notificationText = `
🔔 <b>New Chat Message</b>

👤 <b>From:</b> ${senderName}
📧 <b>Email:</b> ${senderEmail}
💬 <b>Message:</b> ${message.length > 200 ? message.substring(0, 200) + '...' : message}

🆔 <b>Chat Room ID:</b> <code>${chatRoomId}</code>
⏰ <b>Time:</b> ${new Date().toLocaleString()}
    `;
    
    // Send notification directly to Telegram API
    const response = await fetch(`https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegramConfig.adminChatId,
        text: notificationText,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      }),
      signal: AbortSignal.timeout(10000)
    });
    
    if (response.ok) {
      console.log('Telegram notification sent successfully (fallback)');
    } else {
      const error = await response.text();
      console.error('Failed to send Telegram notification (fallback):', error);
    }
    
  } catch (error) {
    console.error('Error sending Telegram notification (fallback):', error);
  }
};

// Subscribe to messages in a chat room
export const subscribeToMessages = (
  chatRoomId: string, 
  callback: (messages: ChatMessage[]) => void
) => {
  if (!chatRoomId) {
    console.error('No chat room ID provided for subscription');
    callback([]);
    return () => {}; // Return empty unsubscribe function
  }
  
  const messagesRef = collection(db, 'chatMessages');
  const q = query(
    messagesRef, 
    where('chatRoomId', '==', chatRoomId)
    // Temporarily removed orderBy to avoid index requirement
    // orderBy('timestamp', 'asc')
  );
  
  return onSnapshot(q, 
    (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChatMessage));
      
      // Sort messages by timestamp on the client side
      messages.sort((a, b) => {
        const aTime = a.timestamp?.toDate?.() || (a.timestamp ? new Date(a.timestamp as any) : new Date());
        const bTime = b.timestamp?.toDate?.() || (b.timestamp ? new Date(b.timestamp as any) : new Date());
        return aTime.getTime() - bTime.getTime();
      });
      
      callback(messages);
    },
    (error) => {
      console.error('Error in messages subscription:', error);
      callback([]);
    }
  );
};

// Subscribe to chat rooms for admin (all rooms)
export const subscribeToChatRooms = (callback: (rooms: ChatRoom[]) => void) => {
  console.log('Setting up chat rooms subscription for admin');
  const chatRoomsRef = collection(db, 'chatRooms');
  const q = query(chatRoomsRef, orderBy('updatedAt', 'desc'));
  
  return onSnapshot(q, 
    (querySnapshot) => {
      console.log('Chat rooms snapshot received:', querySnapshot.docs.length, 'rooms');
      const rooms = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChatRoom));
      callback(rooms);
    },
    (error) => {
      console.error('Error in chat rooms subscription:', error);
      callback([]);
    }
  );
};

// Subscribe to chat rooms for customer (their room only)
export const subscribeToCustomerChatRoom = (
  customerId: string, 
  callback: (room: ChatRoom | null) => void
) => {
  console.log('Setting up customer chat room subscription for:', customerId);
  const chatRoomsRef = collection(db, 'chatRooms');
  const q = query(chatRoomsRef, where('customerId', '==', customerId), limit(1));
  
  return onSnapshot(q, 
    (querySnapshot) => {
      console.log('Customer chat room snapshot received:', querySnapshot.docs.length, 'rooms');
      if (querySnapshot.docs.length > 0) {
        const room = {
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data()
        } as ChatRoom;
        callback(room);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error in customer chat room subscription:', error);
      callback(null);
    }
  );
};

// Mark messages as read
export const markMessagesAsRead = async (chatRoomId: string, userId: string): Promise<void> => {
  try {
    const messagesRef = collection(db, 'chatMessages');
    const q = query(
      messagesRef, 
      where('chatRoomId', '==', chatRoomId),
      where('receiverId', '==', userId),
      where('isRead', '==', false)
    );
    
    // Note: This is a simplified version. In production, you'd want to batch update
    // For now, we'll just mark the chat room as having been read
    const chatRoomRef = doc(db, 'chatRooms', chatRoomId);
    await updateDoc(chatRoomRef, {
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// Update chat room status
export const updateChatRoomStatus = async (
  chatRoomId: string, 
  status: 'active' | 'closed' | 'waiting',
  adminId?: string,
  adminName?: string
): Promise<void> => {
  try {
    const chatRoomRef = doc(db, 'chatRooms', chatRoomId);
    const updateData: any = {
      status,
      updatedAt: serverTimestamp()
    };
    
    if (adminId) {
      updateData.adminId = adminId;
    }
    if (adminName) {
      updateData.adminName = adminName;
    }
    
    await updateDoc(chatRoomRef, updateData);
  } catch (error) {
    console.error('Error updating chat room status:', error);
    throw error;
  }
};

// Delete chat room and all its messages
export const deleteChatRoom = async (chatRoomId: string): Promise<void> => {
  try {
    // First, delete all messages in the chat room
    const messagesRef = collection(db, 'chatMessages');
    const messagesQuery = query(messagesRef, where('chatRoomId', '==', chatRoomId));
    const messagesSnapshot = await getDocs(messagesQuery);
    
    // Delete all messages
    const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // Then delete the chat room itself
    const chatRoomRef = doc(db, 'chatRooms', chatRoomId);
    await deleteDoc(chatRoomRef);
  } catch (error) {
    console.error('Error deleting chat room:', error);
    throw error;
  }
};

// Send Telegram notification for new messages
const sendTelegramNotification = async (
  chatRoomId: string,
  senderId: string,
  senderName: string,
  senderEmail: string,
  receiverId: string,
  message: string
): Promise<void> => {
  try {
    // Determine if sender is admin or customer
    const isAdminMessage = senderId === 'admin';
    
    if (isAdminMessage) {
      // For admin messages, we could notify customer if they have Telegram
      // For now, we'll just log it
      console.log('Admin message sent to customer');
    } else {
      // Notify admin of new customer message via server
      await notifyAdminViaServer(senderName, senderEmail, message, chatRoomId);
    }
  } catch (error) {
    console.error('Error in sendTelegramNotification:', error);
    // Don't throw error for notification failures
  }
};

// Send notification to admin via Netlify Functions
const notifyAdminViaServer = async (
  customerName: string,
  customerEmail: string,
  message: string,
  chatRoomId: string
): Promise<void> => {
  try {
    const response = await fetch('/.netlify/functions/telegram-notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerName,
        customerEmail,
        message,
        chatRoomId
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Telegram notification sent via Netlify function:', result);
    } else {
      const error = await response.text();
      console.error('Failed to send Telegram notification via Netlify function:', error);
    }
  } catch (error) {
    console.error('Error sending notification via Netlify function:', error);
  }
};
