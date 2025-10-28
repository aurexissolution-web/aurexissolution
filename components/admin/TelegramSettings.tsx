// components/admin/TelegramSettings.tsx
import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Settings,
  MessageCircle,
  Users,
  Key,
  TestTube,
  Wifi,
  WifiOff,
  RefreshCw,
  Power
} from 'lucide-react';
import { 
  testBotConnection, 
  getBotInfo, 
  TelegramConfig 
} from '../../services/telegramService';
import { 
  telegramConnectionManager, 
  ConnectionStatus, 
  BotInfo 
} from '../../services/telegramConnectionManager';
import { 
  saveTelegramConfig, 
  getTelegramConfig, 
  subscribeToTelegramConfig,
  clearTelegramConfig,
  TelegramConfig as TelegramConfigType
} from '../../services/telegramConfigService';

const TelegramSettings: React.FC = () => {
  const [botToken, setBotToken] = useState('');
  const [adminChatId, setAdminChatId] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isConnecting: false,
    connectionAttempts: 0
  });
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
  const [error, setError] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  // Subscribe to connection status changes
  useEffect(() => {
    const unsubscribe = telegramConnectionManager.subscribe((status) => {
      setConnectionStatus(status);
      
      // Update bot info when connected
      if (status.isConnected && !botInfo) {
        telegramConnectionManager.getBotInfo().then(setBotInfo);
      }
    });

    // Get initial status
    setConnectionStatus(telegramConnectionManager.getStatus());

    return unsubscribe;
  }, [botInfo]);

  // Load saved settings from Firebase
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await getTelegramConfig();
        if (config) {
          setBotToken(config.botToken);
          setAdminChatId(config.adminChatId);
        }
      } catch (error) {
        console.error('Error loading Telegram config:', error);
      }
    };
    
    loadConfig();
    
    // Subscribe to config changes
    const unsubscribe = subscribeToTelegramConfig((config) => {
      if (config) {
        setBotToken(config.botToken);
        setAdminChatId(config.adminChatId);
      }
    });
    
    return unsubscribe;
  }, []);

  const testConnection = async () => {
    if (!botToken || !adminChatId) {
      setError('Please enter both Bot Token and Admin Chat ID');
      return;
    }

    setIsTesting(true);
    setError('');

    try {
      const config: TelegramConfig = {
        botToken: botToken.trim(),
        adminChatId: adminChatId.trim()
      };

      const success = await telegramConnectionManager.configureAndConnect(config);
      
      if (success) {
        setError('');
        // Bot info will be loaded automatically via subscription
      } else {
        setError('Connection failed. Please check your Bot Token and Admin Chat ID.');
      }
    } catch (error) {
      setError(`Connection failed: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const saveSettings = async () => {
    if (!botToken || !adminChatId) {
      setError('Please enter both Bot Token and Admin Chat ID');
      return;
    }

    const config: TelegramConfig = {
      botToken: botToken.trim(),
      adminChatId: adminChatId.trim()
    };

    try {
      // Save to Firebase
      await saveTelegramConfig({
        botToken: config.botToken,
        adminChatId: config.adminChatId,
        isEnabled: true
      }, 'admin'); // Updated by admin
      
      // Also configure connection manager
      telegramConnectionManager.configureAndConnect(config);
      setError('');
    } catch (error) {
      setError(`Failed to save settings: ${error.message}`);
    }
  };

  const clearSettings = async () => {
    try {
      // Clear from Firebase
      await clearTelegramConfig('admin');
      
      // Also clear connection manager
      await telegramConnectionManager.clearAndDisconnect();
      setBotToken('');
      setAdminChatId('');
      setBotInfo(null);
      setError('');
    } catch (error) {
      setError(`Failed to clear settings: ${error.message}`);
    }
  };

  const disconnectBot = async () => {
    await telegramConnectionManager.disconnect();
  };

  const reconnectBot = async () => {
    if (botToken && adminChatId) {
      const config: TelegramConfig = {
        botToken: botToken.trim(),
        adminChatId: adminChatId.trim()
      };
      await telegramConnectionManager.configureAndConnect(config);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral p-6">
      <div className="flex items-center mb-6">
        <Bot className="text-blue-500 mr-3" size={20} />
        <h3 className="text-lg font-semibold text-text-primary">Telegram Notifications</h3>
      </div>

      <div className="space-y-6">
        {/* Bot Status */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageCircle className="text-gray-500 mr-3" size={20} />
              <div>
                <p className="font-medium text-text-primary">Bot Status</p>
                <p className="text-sm text-text-secondary">
                  {connectionStatus.isConnected 
                    ? 'Connected and ready' 
                    : connectionStatus.isConnecting 
                      ? 'Connecting...' 
                      : 'Not connected'
                  }
                </p>
                {connectionStatus.error && (
                  <p className="text-xs text-red-600 mt-1">{connectionStatus.error}</p>
                )}
                {connectionStatus.lastConnected && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last connected: {connectionStatus.lastConnected.toLocaleString()}
                  </p>
                )}
                {connectionStatus.connectionAttempts > 0 && (
                  <p className="text-xs text-yellow-600 mt-1">
                    Connection attempts: {connectionStatus.connectionAttempts}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {connectionStatus.isConnecting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              ) : connectionStatus.isConnected ? (
                <Wifi className="text-green-500" size={16} />
              ) : (
                <WifiOff className="text-red-500" size={16} />
              )}
              <span className={`text-sm font-medium ${
                connectionStatus.isConnected ? 'text-green-600' : 'text-red-600'
              }`}>
                {connectionStatus.isConnecting ? 'Connecting...' : connectionStatus.isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          
          {/* Connection Controls */}
          <div className="flex items-center justify-end mt-3 space-x-2">
            {connectionStatus.isConnected ? (
              <button
                onClick={disconnectBot}
                className="flex items-center px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                <Power className="w-4 h-4 mr-1" />
                Disconnect
              </button>
            ) : (
              <button
                onClick={reconnectBot}
                disabled={!botToken || !adminChatId}
                className="flex items-center px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Reconnect
              </button>
            )}
          </div>
        </div>

        {/* Bot Information */}
        {botInfo && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Bot Information</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <div><strong>Name:</strong> {botInfo.first_name}</div>
              <div><strong>Username:</strong> @{botInfo.username}</div>
              <div><strong>ID:</strong> {botInfo.id}</div>
            </div>
          </div>
        )}

        {/* Configuration Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              <Key className="inline mr-2" size={16} />
              Bot Token
            </label>
            <input
              id="bot-token"
              name="bot-token"
              type="password"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="Enter your Telegram bot token"
              className="w-full px-3 py-2 border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-text-secondary mt-1">
              Get your bot token from @BotFather on Telegram
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              <Users className="inline mr-2" size={16} />
              Admin Chat ID
            </label>
            <input
              id="admin-chat-id"
              name="admin-chat-id"
              type="text"
              value={adminChatId}
              onChange={(e) => setAdminChatId(e.target.value)}
              placeholder="Enter your Telegram chat ID"
              className="w-full px-3 py-2 border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-text-secondary mt-1">
              Your personal chat ID where notifications will be sent
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="text-red-500 mr-3 mt-0.5" size={16} />
              <div>
                <h4 className="font-medium text-red-800">Error</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={testConnection}
            disabled={isTesting || !botToken || !adminChatId}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TestTube size={16} className="mr-2" />
            {isTesting ? 'Testing...' : 'Test Connection'}
          </button>
          
          <button
            onClick={saveSettings}
            disabled={!botToken || !adminChatId}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle size={16} className="mr-2" />
            Save Settings
          </button>
          
          <button
            onClick={clearSettings}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <XCircle size={16} className="mr-2" />
            Clear
          </button>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">📋 Setup Instructions</h4>
          <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
            <li>Open Telegram and search for <strong>@BotFather</strong></li>
            <li>Send <code>/newbot</code> and follow the instructions</li>
            <li>Copy the <strong>Bot Token</strong> and paste it above</li>
            <li>To get your <strong>Chat ID</strong>:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Send a message to your bot</li>
                <li>Visit: <code>https://api.telegram.org/bot[YOUR_BOT_TOKEN]/getUpdates</code></li>
                <li>Find your chat ID in the response</li>
              </ul>
            </li>
            <li>Click <strong>"Test Connection"</strong> to verify setup</li>
          </ol>
        </div>

        {/* Features */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">✨ Features</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Instant notifications for new chat messages</li>
            <li>• Rich message formatting with customer details</li>
            <li>• Direct links to open chat in admin panel</li>
            <li>• Works on all devices (mobile, desktop, tablet)</li>
            <li>• No complex setup required</li>
            <li>• Reliable delivery guaranteed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TelegramSettings;
