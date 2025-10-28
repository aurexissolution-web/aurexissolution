// components/dashboard/CustomerChat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Maximize2,
  Clock,
  CheckCircle
} from 'lucide-react';
import { 
  subscribeToCustomerChatRoom,
  subscribeToMessages,
  createChatRoom,
  sendMessage,
  ChatRoom,
  ChatMessage
} from '../../services/chatService';

const CustomerChat: React.FC = () => {
  const { user } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
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
    if (!user?.email) return;

    setIsLoading(true);
    
    const unsubscribe = subscribeToCustomerChatRoom(user.email, (room) => {
      console.log('Customer chat room received:', room);
      setChatRoom(room);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [user?.email]);

  // Set up messages subscription
  useEffect(() => {
    if (!chatRoom?.id) return;

    const unsubscribe = subscribeToMessages(chatRoom.id, (messagesData) => {
      console.log('Customer messages received:', messagesData.length);
      setMessages(messagesData);
    });

    return () => {
      unsubscribe();
    };
  }, [chatRoom?.id]);

  const handleStartChat = async () => {
    if (!user?.email) return;

    try {
      setIsSending(true);
      console.log('Starting chat for user:', user.email);
      const roomId = await createChatRoom(
        user.email,
        user.email.split('@')[0],
        user.email
      );
      console.log('Chat room created successfully:', roomId);
    } catch (error) {
      console.error('Error creating chat room:', error);
      
      // Show more specific error messages
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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatRoom?.id || !user?.email) return;

    try {
      setIsSending(true);
      await sendMessage(
        chatRoom.id,
        user.email,
        user.email.split('@')[0],
        user.email,
        'admin', // Admin will be the receiver
        newMessage.trim()
      );
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      
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
      msg.senderId !== user?.email && !msg.isRead
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
                    onClick={handleStartChat}
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
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === user?.email ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.senderId === user?.email
                          ? 'bg-primary text-white'
                          : 'bg-neutral-light text-text-primary'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === user?.email ? 'text-white/70' : 'text-text-secondary'
                      }`}>
                        {getMessageTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {chatRoom && chatRoom.status !== 'closed' && (
              <div className="p-4 border-t border-neutral">
                <div className="flex gap-2">
                  <input
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

export default CustomerChat;
