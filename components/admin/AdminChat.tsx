// components/admin/AdminChat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { 
  MessageCircle, 
  Send, 
  X, 
  User, 
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Trash2
} from 'lucide-react';
import { 
  subscribeToChatRooms,
  subscribeToMessages,
  sendMessage,
  updateChatRoomStatus,
  deleteChatRoom,
  ChatRoom,
  ChatMessage
} from '../../services/chatService';

const AdminChat: React.FC = () => {
  const { user } = useAppContext();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<ChatRoom | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set up chat rooms subscription
  useEffect(() => {
    setIsLoading(true);
    
    const unsubscribe = subscribeToChatRooms((rooms) => {
      console.log('Admin chat rooms received:', rooms.length);
      setChatRooms(rooms);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Set up messages subscription for selected room
  useEffect(() => {
    if (!selectedRoom?.id) return;

    const unsubscribe = subscribeToMessages(selectedRoom.id, (messagesData) => {
      console.log('Admin messages received:', messagesData.length);
      setMessages(messagesData);
    });

    return () => {
      unsubscribe();
    };
  }, [selectedRoom?.id]);

  const handleSelectRoom = async (room: ChatRoom) => {
    setSelectedRoom(room);
    
    // Update room status to active and assign admin
    if (room.status === 'waiting') {
      try {
        await updateChatRoomStatus(room.id, 'active', user?.email, user?.email?.split('@')[0]);
      } catch (error) {
        console.error('Error updating chat room status:', error);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom?.id || !user?.email) return;

    try {
      setIsSending(true);
      await sendMessage(
        selectedRoom.id,
        user.email,
        user.email.split('@')[0],
        user.email,
        selectedRoom.customerId,
        newMessage.trim()
      );
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Error sending message. Please try again.';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check if you have admin access.';
      } else if (error.code === 'unauthenticated') {
        errorMessage = 'Please log in as admin to send messages.';
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

  const handleCloseChat = async () => {
    if (!selectedRoom?.id) return;

    try {
      await updateChatRoomStatus(selectedRoom.id, 'closed');
      setSelectedRoom(null);
    } catch (error) {
      console.error('Error closing chat:', error);
    }
  };

  const handleDeleteChat = (room: ChatRoom) => {
    setRoomToDelete(room);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteChat = async () => {
    if (!roomToDelete?.id) return;

    try {
      await deleteChatRoom(roomToDelete.id);
      
      // If the deleted room was selected, clear selection
      if (selectedRoom?.id === roomToDelete.id) {
        setSelectedRoom(null);
      }
      
      setShowDeleteConfirm(false);
      setRoomToDelete(null);
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Error deleting chat. Please try again.');
    }
  };

  const cancelDeleteChat = () => {
    setShowDeleteConfirm(false);
    setRoomToDelete(null);
  };

  const getMessageTime = (timestamp: any) => {
    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return 'Unknown';
  };

  const getRoomStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting': return <Clock size={16} className="text-yellow-500" />;
      case 'active': return <CheckCircle size={16} className="text-green-500" />;
      case 'closed': return <X size={16} className="text-gray-500" />;
      default: return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  const getUnreadCount = () => {
    return chatRooms.filter(room => 
      room.status === 'waiting' || 
      (room.lastMessageTime && room.lastMessageTime.toDate() > new Date(Date.now() - 5 * 60 * 1000))
    ).length;
  };

  const unreadCount = getUnreadCount();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Loading Chat</h2>
          <p className="text-text-secondary">Fetching customer conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Live Chat Support</h2>
          <p className="text-text-secondary">Manage customer conversations in real-time</p>
        </div>
        {unreadCount > 0 && (
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium mt-2 sm:mt-0">
            {unreadCount} active conversation{unreadCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Chat Rooms List */}
        <div className="bg-surface rounded-lg border border-neutral overflow-hidden">
          <div className="p-4 border-b border-neutral">
            <h3 className="font-semibold text-text-primary">Active Conversations</h3>
          </div>
          <div className="overflow-y-auto h-[520px]">
            {chatRooms.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">No Active Chats</h3>
                <p className="text-text-secondary text-sm">No customers are currently chatting.</p>
              </div>
            ) : (
              chatRooms.map((room) => (
                <div
                  key={room.id}
                  className={`p-4 border-b border-neutral hover:bg-neutral-light transition-colors ${
                    selectedRoom?.id === room.id ? 'bg-primary/10 border-primary' : ''
                  }`}
                >
                  <div 
                    onClick={() => handleSelectRoom(room)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <User size={16} className="text-primary mr-2" />
                        <span className="font-medium text-text-primary">{room.customerName}</span>
                      </div>
                      <div className="flex items-center">
                        {getRoomStatusIcon(room.status)}
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-text-secondary mb-1">
                      <Mail size={12} className="mr-1" />
                      <span>{room.customerEmail}</span>
                    </div>
                    {room.lastMessage && (
                      <p className="text-sm text-text-secondary truncate">
                        {room.lastMessage}
                      </p>
                    )}
                    {room.lastMessageTime && (
                      <p className="text-xs text-text-secondary mt-1">
                        {getMessageTime(room.lastMessageTime)}
                      </p>
                    )}
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(room);
                      }}
                      className="text-red-500 hover:text-red-700 transition-colors text-sm"
                      title="Delete Chat"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="lg:col-span-2 bg-surface rounded-lg border border-neutral flex flex-col">
          {!selectedRoom ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">Select a Conversation</h3>
                <p className="text-text-secondary">Choose a customer conversation to start chatting.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-neutral bg-primary/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User size={20} className="text-primary mr-3" />
                    <div>
                      <h3 className="font-semibold text-text-primary">{selectedRoom.customerName}</h3>
                      <p className="text-sm text-text-secondary">{selectedRoom.customerEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {getRoomStatusIcon(selectedRoom.status)}
                      <span className="ml-1 text-sm text-text-secondary capitalize">
                        {selectedRoom.status}
                      </span>
                    </div>
                    <button
                      onClick={handleCloseChat}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Close Chat"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle size={32} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-text-secondary text-sm">No messages yet. Start the conversation!</p>
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
              {selectedRoom.status !== 'closed' && (
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

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && roomToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertCircle className="text-red-500 mr-3" size={24} />
              <h3 className="text-lg font-semibold text-text-primary">Delete Chat</h3>
            </div>
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete the chat with <strong>{roomToDelete.customerName}</strong>? 
              This action cannot be undone and will permanently remove all messages.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDeleteChat}
                className="px-4 py-2 border border-neutral rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteChat}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChat;
