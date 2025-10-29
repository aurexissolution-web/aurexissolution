// components/admin/NotificationBell.tsx
import React, { useState, useEffect } from 'react';
import { Bell, X, Clock, AlertCircle, DollarSign, CheckCircle } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAppContext } from '../../hooks/useAppContext';
import { 
  getUserNotifications,
  getNotificationCount,
  formatNotificationTime,
  requestNotificationPermission,
  Notification 
} from '../../services/notificationService';

const NotificationBell: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAppContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  // Load notifications
  useEffect(() => {
    if (user?.email) {
      loadNotifications();
      
      // Refresh notifications every 30 seconds for real-time updates
      const interval = setInterval(loadNotifications, 30 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [user?.email]);

  // Request notification permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      const permitted = await requestNotificationPermission();
      setHasPermission(permitted);
    };
    checkPermission();
  }, []);

  const loadNotifications = async () => {
    if (!user?.email) return;
    const newNotifications = await getUserNotifications(user.email, 20);
    setNotifications(newNotifications);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = getNotificationCount(notifications);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_overdue':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'task_deadline_soon':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'task_completed':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'payment_receipt_uploaded':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'project_request_approved':
      case 'project_assigned':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'project_request_rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'project_request_need_info':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500';
      case 'medium':
        return 'border-l-4 border-yellow-500';
      default:
        return 'border-l-4 border-blue-500';
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`relative p-2 rounded-full transition-all transform hover:scale-110 ${
          theme === 'dark'
            ? 'text-gray-300 hover:text-white hover:bg-gray-700'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
        }`}
        title="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Content */}
          <div className={`absolute right-0 mt-2 w-96 rounded-xl shadow-2xl border z-20 max-h-[600px] flex flex-col ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center space-x-2">
                <Bell className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} />
                <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  🔔 Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full shadow">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowDropdown(false)}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Actions */}
            {notifications.length > 0 && (
              <div className={`flex items-center justify-between px-4 py-2 border-b ${
                theme === 'dark'
                  ? 'bg-gray-700/50 border-gray-700'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <button
                  onClick={markAllAsRead}
                  className={`text-sm font-medium transition-colors ${
                    theme === 'dark'
                      ? 'text-blue-400 hover:text-blue-300'
                      : 'text-blue-600 hover:text-blue-800'
                  }`}
                >
                  ✅ Mark all as read
                </button>
                <button
                  onClick={clearAll}
                  className={`text-sm font-medium transition-colors ${
                    theme === 'dark'
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  🗑️ Clear all
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <Bell className={`h-12 w-12 mb-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={`font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    No notifications
                  </p>
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
                    You're all caught up! 🎉
                  </p>
                </div>
              ) : (
                <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 transition-colors cursor-pointer ${
                        theme === 'dark'
                          ? `hover:bg-gray-700 ${!notification.read ? 'bg-blue-900/30' : ''}`
                          : `hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`
                      } ${getPriorityColor(notification.priority)}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {notification.title}
                          </p>
                          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {notification.message}
                          </p>
                          <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
                            🕐 {formatNotificationTime(notification.timestamp)}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="flex-shrink-0">
                            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {!hasPermission && notifications.length > 0 && (
              <div className="p-4 border-t bg-yellow-50">
                <button
                  onClick={async () => {
                    const permitted = await requestNotificationPermission();
                    setHasPermission(permitted);
                  }}
                  className="text-sm text-yellow-800 hover:text-yellow-900 font-medium underline"
                >
                  Enable browser notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;

