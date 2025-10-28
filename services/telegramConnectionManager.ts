// services/telegramConnectionManager.ts
import { TelegramConfig } from './telegramService';

export interface ConnectionStatus {
  isConnected: boolean;
  isConnecting: boolean;
  lastConnected?: Date;
  lastDisconnected?: Date;
  connectionAttempts: number;
  error?: string;
}

export interface BotInfo {
  id: number;
  first_name: string;
  username: string;
  can_join_groups: boolean;
  can_read_all_group_messages: boolean;
  supports_inline_queries: boolean;
}

class TelegramConnectionManager {
  private connectionStatus: ConnectionStatus = {
    isConnected: false,
    isConnecting: false,
    connectionAttempts: 0
  };
  
  private config: TelegramConfig | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private listeners: ((status: ConnectionStatus) => void)[] = [];
  
  // Heartbeat interval (check connection every 5 minutes)
  private readonly HEARTBEAT_INTERVAL = 300000; // 5 minutes instead of 30 seconds
  
  // Reconnect delay (exponential backoff)
  private readonly RECONNECT_DELAYS = [1000, 2000, 5000, 10000, 30000]; // 1s, 2s, 5s, 10s, 30s
  
  constructor() {
    this.loadConfig();
    this.startHeartbeat();
  }
  
  // Load configuration from localStorage
  private loadConfig(): void {
    const botToken = localStorage.getItem('telegram_bot_token');
    const adminChatId = localStorage.getItem('telegram_admin_chat_id');
    
    if (botToken && adminChatId) {
      this.config = {
        botToken: botToken.trim(),
        adminChatId: adminChatId.trim()
      };
      
      // Auto-connect if config is available
      this.connect();
    }
  }
  
  // Save configuration to localStorage
  private saveConfig(config: TelegramConfig): void {
    localStorage.setItem('telegram_bot_token', config.botToken);
    localStorage.setItem('telegram_admin_chat_id', config.adminChatId);
    this.config = config;
  }
  
  // Clear configuration
  private clearConfig(): void {
    localStorage.removeItem('telegram_bot_token');
    localStorage.removeItem('telegram_admin_chat_id');
    this.config = null;
  }
  
  // Update connection status and notify listeners
  private updateStatus(updates: Partial<ConnectionStatus>): void {
    this.connectionStatus = { ...this.connectionStatus, ...updates };
    this.listeners.forEach(listener => listener(this.connectionStatus));
  }
  
  // Test connection to Telegram API
  private async testConnection(): Promise<boolean> {
    if (!this.config) return false;
    
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.config.botToken}/getMe`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.ok === true;
      }
      return false;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
  
  // Send heartbeat message to verify connection (silent - no message sent)
  private async sendHeartbeat(): Promise<boolean> {
    if (!this.config) return false;
    
    try {
      // Use getMe instead of sendMessage to avoid spam
      const response = await fetch(`https://api.telegram.org/bot${this.config.botToken}/getMe`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      return response.ok;
    } catch (error) {
      console.error('Heartbeat failed:', error);
      return false;
    }
  }
  
  // Start heartbeat monitoring
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.heartbeatInterval = setInterval(async () => {
      if (this.connectionStatus.isConnected && this.config) {
        const isAlive = await this.sendHeartbeat();
        if (!isAlive) {
          console.warn('Heartbeat failed, marking as disconnected');
          this.updateStatus({
            isConnected: false,
            lastDisconnected: new Date(),
            error: 'Connection lost - heartbeat failed'
          });
          this.scheduleReconnect();
        }
      }
    }, this.HEARTBEAT_INTERVAL);
  }
  
  // Stop heartbeat monitoring
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
  
  // Schedule reconnection with exponential backoff
  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    const attempt = Math.min(this.connectionStatus.connectionAttempts, this.RECONNECT_DELAYS.length - 1);
    const delay = this.RECONNECT_DELAYS[attempt];
    
    console.log(`Scheduling reconnect in ${delay}ms (attempt ${this.connectionStatus.connectionAttempts + 1})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }
  
  // Connect to Telegram bot
  async connect(): Promise<boolean> {
    if (!this.config) {
      this.updateStatus({
        isConnected: false,
        isConnecting: false,
        error: 'No configuration found'
      });
      return false;
    }
    
    if (this.connectionStatus.isConnecting) {
      return false; // Already connecting
    }
    
    this.updateStatus({
      isConnecting: true,
      error: undefined
    });
    
    try {
      const isConnected = await this.testConnection();
      
      if (isConnected) {
        this.updateStatus({
          isConnected: true,
          isConnecting: false,
          lastConnected: new Date(),
          connectionAttempts: 0,
          error: undefined
        });
        
        console.log('Telegram bot connected successfully');
        return true;
      } else {
        throw new Error('Connection test failed');
      }
    } catch (error) {
      const attempts = this.connectionStatus.connectionAttempts + 1;
      this.updateStatus({
        isConnected: false,
        isConnecting: false,
        connectionAttempts: attempts,
        error: `Connection failed: ${error.message}`
      });
      
      console.error(`Connection attempt ${attempts} failed:`, error);
      
      // Schedule reconnection if we haven't exceeded max attempts
      if (attempts < this.RECONNECT_DELAYS.length) {
        this.scheduleReconnect();
      }
      
      return false;
    }
  }
  
  // Disconnect from Telegram bot
  async disconnect(): Promise<void> {
    this.stopHeartbeat();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.updateStatus({
      isConnected: false,
      isConnecting: false,
      lastDisconnected: new Date(),
      connectionAttempts: 0,
      error: 'Manually disconnected'
    });
    
    console.log('Telegram bot disconnected');
  }
  
  // Configure and connect
  async configureAndConnect(config: TelegramConfig): Promise<boolean> {
    this.saveConfig(config);
    return await this.connect();
  }
  
  // Clear configuration and disconnect
  async clearAndDisconnect(): Promise<void> {
    await this.disconnect();
    this.clearConfig();
  }
  
  // Get current connection status
  getStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }
  
  // Get bot information
  async getBotInfo(): Promise<BotInfo | null> {
    if (!this.config || !this.connectionStatus.isConnected) {
      return null;
    }
    
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.config.botToken}/getMe`);
      if (response.ok) {
        const data = await response.json();
        return data.result;
      }
      return null;
    } catch (error) {
      console.error('Failed to get bot info:', error);
      return null;
    }
  }
  
  // Subscribe to connection status changes
  subscribe(listener: (status: ConnectionStatus) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  // Send message through connected bot
  async sendMessage(text: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<boolean> {
    if (!this.config || !this.connectionStatus.isConnected) {
      console.error('Bot not connected. Config:', !!this.config, 'Status:', this.connectionStatus);
      throw new Error('Bot not connected');
    }
    
    try {
      console.log('Attempting to send Telegram message...');
      const response = await fetch(`https://api.telegram.org/bot${this.config.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.config.adminChatId,
          text,
          parse_mode: parseMode,
          disable_web_page_preview: true
        }),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (response.ok) {
        console.log('Telegram message sent successfully');
        return true;
      } else {
        const error = await response.text();
        console.error('Failed to send Telegram message:', error);
        throw new Error(`Failed to send message: ${error}`);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // If message sending fails, mark as disconnected
      this.updateStatus({
        isConnected: false,
        lastDisconnected: new Date(),
        error: `Message send failed: ${error.message}`
      });
      
      throw error;
    }
  }
}

// Create singleton instance
export const telegramConnectionManager = new TelegramConnectionManager();
