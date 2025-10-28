// utils/uniqueCodeGenerator.ts
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface UniqueCodeConfig {
  prefix?: string;
  collectionName: string;
  fieldName: string;
  length?: number;
}

export class UniqueCodeGenerator {
  private static usedCodes = new Set<string>();
  
  /**
   * Generate a unique code with format: [A-Z][0-9]{4}
   * @param config Configuration for the unique code
   * @returns Promise<string> Unique code
   */
  static async generateUniqueCode(config: UniqueCodeConfig): Promise<string> {
    const { prefix = '', collectionName, fieldName, length = 4 } = config;
    
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loops
    
    while (attempts < maxAttempts) {
      const code = this.generateCode(length);
      const fullCode = prefix ? `${prefix}-${code}` : code;
      
      // Check if code is already used in memory
      if (this.usedCodes.has(fullCode)) {
        attempts++;
        continue;
      }
      
      // Check if code exists in database
      const exists = await this.checkCodeExists(collectionName, fieldName, fullCode);
      if (!exists) {
        this.usedCodes.add(fullCode);
        return fullCode;
      }
      
      attempts++;
    }
    
    throw new Error(`Unable to generate unique code after ${maxAttempts} attempts`);
  }
  
  /**
   * Generate a code with format: [A-Z][0-9]{length}
   * @param length Number of digits (default: 4)
   * @returns Generated code
   */
  private static generateCode(length: number = 4): string {
    // Generate random alphabet (A-Z)
    const alphabet = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    
    // Generate random digits
    let digits = '';
    for (let i = 0; i < length; i++) {
      digits += Math.floor(Math.random() * 10).toString();
    }
    
    return `${alphabet}${digits}`;
  }
  
  /**
   * Check if a code already exists in the database
   * @param collectionName Name of the Firestore collection
   * @param fieldName Name of the field to check
   * @param code Code to check
   * @returns Promise<boolean> True if code exists
   */
  private static async checkCodeExists(
    collectionName: string, 
    fieldName: string, 
    code: string
  ): Promise<boolean> {
    try {
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, where(fieldName, '==', code));
      const querySnapshot = await getDocs(q);
      
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking code existence:', error);
      // If there's an error checking, assume it doesn't exist to avoid blocking
      return false;
    }
  }
  
  /**
   * Generate multiple unique codes at once
   * @param config Configuration for the unique codes
   * @param count Number of codes to generate
   * @returns Promise<string[]> Array of unique codes
   */
  static async generateMultipleUniqueCodes(
    config: UniqueCodeConfig, 
    count: number
  ): Promise<string[]> {
    const codes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const code = await this.generateUniqueCode(config);
      codes.push(code);
    }
    
    return codes;
  }
  
  /**
   * Validate if a code follows the correct format
   * @param code Code to validate
   * @param length Expected length of digits
   * @returns boolean True if valid
   */
  static validateCodeFormat(code: string, length: number = 4): boolean {
    const regex = new RegExp(`^[A-Z][0-9]{${length}}$`);
    return regex.test(code);
  }
  
  /**
   * Clear the in-memory cache of used codes
   */
  static clearCache(): void {
    this.usedCodes.clear();
  }
  
  /**
   * Get all currently cached codes
   * @returns Set<string> Set of cached codes
   */
  static getCachedCodes(): Set<string> {
    return new Set(this.usedCodes);
  }
}

// Convenience functions for common use cases
export const generateQuotationCode = async (): Promise<string> => {
  return UniqueCodeGenerator.generateUniqueCode({
    prefix: 'QT',
    collectionName: 'quotations',
    fieldName: 'quoteNumber'
  });
};

export const generateInvoiceCode = async (): Promise<string> => {
  return UniqueCodeGenerator.generateUniqueCode({
    prefix: 'INV',
    collectionName: 'invoices',
    fieldName: 'invoiceNumber'
  });
};

export const generateTicketCode = async (): Promise<string> => {
  return UniqueCodeGenerator.generateUniqueCode({
    prefix: 'TKT',
    collectionName: 'tickets',
    fieldName: 'ticketNumber'
  });
};

export const generateCustomerCode = async (): Promise<string> => {
  return UniqueCodeGenerator.generateUniqueCode({
    prefix: 'CUST',
    collectionName: 'users',
    fieldName: 'customerCode'
  });
};

export const generateProjectCode = async (): Promise<string> => {
  return UniqueCodeGenerator.generateUniqueCode({
    prefix: 'PRJ',
    collectionName: 'projects',
    fieldName: 'projectCode'
  });
};

// Export the class as default
export default UniqueCodeGenerator;
