// components/public/MainPageChat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Maximize2,
  Clock,
  CheckCircle,
  User
} from 'lucide-react';
import { 
  subscribeToCustomerChatRoom,
  subscribeToMessages,
  createChatRoom,
  sendMessage,
  ChatRoom,
  ChatMessage
} from '../../services/chatService';

const MainPageChat: React.FC = () => {
  const { user } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [showNameForm, setShowNameForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set up chat room subscription
  useEffect(() => {
    if (!chatRoom?.id) return;

    const unsubscribe = subscribeToMessages(chatRoom.id, (messagesData) => {
      setMessages(messagesData);
    });

    return () => {
      unsubscribe();
    };
  }, [chatRoom?.id]);

  const handleStartChat = async () => {
    try {
      setIsSending(true);
      
      // If user is logged in, use their info
      if (user?.email) {
        const roomId = await createChatRoom(
          user.email,
          user.email.split('@')[0],
          user.email,
          false
        );
        
        // Manually set the chat room state since we know it was created
        const newChatRoom: ChatRoom = {
          id: roomId,
          customerId: user.email,
          customerName: user.email.split('@')[0],
          customerEmail: user.email,
          isAnonymous: false,
          status: 'waiting',
          createdAt: new Date() as any,
          updatedAt: new Date() as any
        };
        setChatRoom(newChatRoom);
        
      } else {
        // For anonymous users, show name form first
        setShowNameForm(true);
        return;
      }
    } catch (error) {
      console.error('Error creating chat room:', error);
      
      let errorMessage = 'Error starting chat. Please try again.';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check Firebase security rules.';
      } else if (error.code === 'unauthenticated') {
        errorMessage = 'Please log in to start a chat.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Service temporarily unavailable. Please try again.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleAnonymousChat = async () => {
    if (!customerName.trim()) {
      alert('Please enter your name to start chatting.');
      return;
    }

    try {
      setIsSending(true);
      const roomId = await createChatRoom(
        `anonymous_${Date.now()}`,
        customerName.trim(),
        customerEmail.trim() || 'anonymous@example.com',
        true
      );
      
      // Manually set the chat room state since we know it was created
      const newChatRoom: ChatRoom = {
        id: roomId,
        customerId: `anonymous_${Date.now()}`,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || 'anonymous@example.com',
        isAnonymous: true,
        status: 'waiting',
        createdAt: new Date() as any,
        updatedAt: new Date() as any
      };
      setChatRoom(newChatRoom);
      setShowNameForm(false);
      
    } catch (error) {
      console.error('Error creating anonymous chat room:', error);
      alert('Error starting chat. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatRoom?.id) return;

    const messageText = newMessage.trim();
    const senderId = user?.email || chatRoom.customerId;
    const senderName = user?.email?.split('@')[0] || chatRoom.customerName;
    
    // Optimistic UI update - add message immediately
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      chatRoomId: chatRoom.id,
      senderId,
      senderName,
      senderEmail: user?.email || chatRoom.customerEmail,
      receiverId: 'admin',
      message: messageText,
      timestamp: new Date(),
      isRead: false,
      isOptimistic: true // Flag to identify optimistic messages
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    try {
      setIsSending(true);
      
      await sendMessage(
        chatRoom.id,
        senderId,
        senderName,
        user?.email || chatRoom.customerEmail,
        'admin', // Admin will be the receiver
        messageText
      );
      
      // Remove optimistic message and let real message come through subscription
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      
      // Provide more specific error messages
      let errorMessage = 'Error sending message. Please try again.';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check if you have access to send messages.';
      } else if (error.code === 'unauthenticated') {
        errorMessage = 'Please log in to send messages.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Service temporarily unavailable. Please try again.';
      } else if (error.code === 'failed-precondition') {
        errorMessage = 'Chat room not found or invalid. Please refresh and try again.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageTime = (timestamp: any) => {
    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return 'Unknown';
  };

  const getUnreadCount = () => {
    return messages.filter(msg => 
      msg.senderId !== (user?.email || chatRoom?.customerId) && !msg.isRead
    ).length;
  };

  const unreadCount = getUnreadCount();

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-white p-4 rounded-full shadow-lg hover:opacity-90 transition-opacity relative"
        >
          <MessageCircle size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${isMinimized ? 'w-80' : 'w-96'} ${isMinimized ? 'h-12' : 'h-[500px]'} transition-all duration-300`}>
      <div className="bg-surface border border-neutral rounded-lg shadow-xl flex flex-col h-full">
        {/* Header */}
        <div className="bg-primary text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center">
            <MessageCircle size={20} className="mr-2" />
            <div>
              <h3 className="font-semibold">Live Support</h3>
              <p className="text-xs opacity-90">
                {chatRoom?.status === 'waiting' ? 'Waiting for admin...' : 
                 chatRoom?.status === 'active' ? 'Connected' : 'Chat closed'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:opacity-70 transition-opacity"
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:opacity-70 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-text-secondary text-sm">Loading chat...</p>
                </div>
              ) : !chatRoom ? (
                <div className="text-center py-8">
                  <MessageCircle size={48} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Start a Conversation</h3>
                  <p className="text-text-secondary text-sm mb-4">
                    Need help? Start a live chat with our support team.
                  </p>
                  <button
                    onClick={() => {
                      console.log('Start Chat button clicked');
                      handleStartChat();
                    }}
                    disabled={isSending}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isSending ? 'Starting...' : 'Start Chat'}
                  </button>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="flex items-center justify-center mb-4">
                    {chatRoom.status === 'waiting' ? (
                      <Clock size={32} className="text-yellow-500" />
                    ) : (
                      <CheckCircle size={32} className="text-green-500" />
                    )}
                  </div>
                  <p className="text-text-secondary text-sm">
                    {chatRoom.status === 'waiting' 
                      ? 'Your message has been sent. An admin will respond soon.'
                      : 'Chat started! Send a message to get help.'}
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.senderId === (user?.email || chatRoom.customerId);
                  const isOptimistic = (message as any).isOptimistic;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          isOwnMessage
                            ? 'bg-primary text-white'
                            : 'bg-neutral-light text-text-primary'
                        } ${isOptimistic ? 'opacity-70' : ''}`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <div className={`text-xs mt-1 flex items-center gap-1 ${
                          isOwnMessage ? 'text-white/70' : 'text-text-secondary'
                        }`}>
                          <span>{getMessageTime(message.timestamp)}</span>
                          {isOptimistic && (
                            <span className="text-xs">⏳</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Name Form for Anonymous Users */}
            {showNameForm && (
              <div className="p-4 border-t border-neutral bg-gray-50">
                <h4 className="font-semibold text-text-primary mb-3">Enter Your Details</h4>
                <div className="space-y-3">
                  <input
                    id="chat-customer-name"
                    name="chat-customer-name"
                    type="text"
                    placeholder="Your Name *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                  />
                  <input
                    id="chat-customer-email"
                    name="chat-customer-email"
                    type="email"
                    placeholder="Your Email (optional)"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAnonymousChat}
                      disabled={!customerName.trim() || isSending}
                      className="flex-1 bg-primary text-white py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isSending ? 'Starting...' : 'Start Chat'}
                    </button>
                    <button
                      onClick={() => setShowNameForm(false)}
                      className="px-4 py-2 border border-neutral rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Input */}
            {chatRoom && chatRoom.status !== 'closed' && !showNameForm && (
              <div className="p-4 border-t border-neutral">
                <div className="flex gap-2">
                  <input
                    id="chat-message-input"
                    name="chat-message-input"
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                    disabled={isSending}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isSending}
                    className="bg-primary text-white p-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MainPageChat;
