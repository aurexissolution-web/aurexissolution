import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';

export interface TelegramConfig {
  botToken: string;
  adminChatId: string;
  isEnabled: boolean;
  lastUpdated: any;
  updatedBy: string;
}

const TELEGRAM_CONFIG_DOC_ID = 'main';

// Save Telegram configuration to Firebase
export const saveTelegramConfig = async (
  config: Omit<TelegramConfig, 'lastUpdated' | 'updatedBy'>,
  updatedBy: string
): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      throw new Error('User must be authenticated to save Telegram configuration');
    }

    const configRef = doc(db, 'telegramConfig', TELEGRAM_CONFIG_DOC_ID);
    
    await setDoc(configRef, {
      ...config,
      lastUpdated: serverTimestamp(),
      updatedBy
    });
    
    console.log('Telegram configuration saved to Firebase');
  } catch (error) {
    console.error('Error saving Telegram configuration:', error);
    throw error;
  }
};

// Get Telegram configuration from Firebase
export const getTelegramConfig = async (): Promise<TelegramConfig | null> => {
  try {
    const configRef = doc(db, 'telegramConfig', TELEGRAM_CONFIG_DOC_ID);
    const configSnap = await getDoc(configRef);
    
    if (configSnap.exists()) {
      return configSnap.data() as TelegramConfig;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting Telegram configuration:', error);
    return null;
  }
};

// Subscribe to Telegram configuration changes
export const subscribeToTelegramConfig = (
  callback: (config: TelegramConfig | null) => void
): (() => void) => {
  const configRef = doc(db, 'telegramConfig', TELEGRAM_CONFIG_DOC_ID);
  
  return onSnapshot(configRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as TelegramConfig);
    } else {
      callback(null);
    }
  });
};

// Clear Telegram configuration
export const clearTelegramConfig = async (updatedBy: string): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      throw new Error('User must be authenticated to clear Telegram configuration');
    }

    const configRef = doc(db, 'telegramConfig', TELEGRAM_CONFIG_DOC_ID);
    
    await setDoc(configRef, {
      botToken: '',
      adminChatId: '',
      isEnabled: false,
      lastUpdated: serverTimestamp(),
      updatedBy
    });
    
    console.log('Telegram configuration cleared');
  } catch (error) {
    console.error('Error clearing Telegram configuration:', error);
    throw error;
  }
};