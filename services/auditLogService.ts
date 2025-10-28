import { db } from '../firebase/config';
import { collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore';
import { AuditLog, UserRole } from '../types';

/**
 * Log an action to the audit trail
 */
export const logAction = async (
  userId: string,
  userEmail: string,
  userRole: UserRole,
  action: string,
  details?: string,
  status: 'success' | 'failed' = 'success'
): Promise<void> => {
  try {
    const auditLog: Omit<AuditLog, 'id'> = {
      userId,
      userEmail,
      userRole,
      action,
      details,
      timestamp: serverTimestamp(),
      status,
      ipAddress: await getClientIP()
    };

    await addDoc(collection(db, 'auditLogs'), auditLog);
  } catch (error) {
    console.error('Error logging action:', error);
    // Don't throw error to prevent breaking the main flow
  }
};

/**
 * Get client IP address (best effort)
 */
const getClientIP = async (): Promise<string> => {
  try {
    // In a real application, you would get this from your backend
    // For now, we'll use a placeholder
    return 'client-ip';
  } catch {
    return 'unknown';
  }
};

/**
 * Log user login
 */
export const logLogin = async (
  userId: string,
  userEmail: string,
  userRole: UserRole,
  status: 'success' | 'failed' = 'success'
): Promise<void> => {
  await logAction(userId, userEmail, userRole, 'login', `User logged in`, status);
};

/**
 * Log user logout
 */
export const logLogout = async (
  userId: string,
  userEmail: string,
  userRole: UserRole
): Promise<void> => {
  await logAction(userId, userEmail, userRole, 'logout', `User logged out`);
};

/**
 * Log user creation
 */
export const logUserCreation = async (
  creatorId: string,
  creatorEmail: string,
  creatorRole: UserRole,
  newUserEmail: string,
  newUserRole: UserRole
): Promise<void> => {
  await logAction(
    creatorId,
    creatorEmail,
    creatorRole,
    'create_user',
    `Created user: ${newUserEmail} with role: ${newUserRole}`
  );
};

/**
 * Log user update
 */
export const logUserUpdate = async (
  updaterId: string,
  updaterEmail: string,
  updaterRole: UserRole,
  targetUserEmail: string,
  changes: string
): Promise<void> => {
  await logAction(
    updaterId,
    updaterEmail,
    updaterRole,
    'update_user',
    `Updated user: ${targetUserEmail}. Changes: ${changes}`
  );
};

/**
 * Log user deletion
 */
export const logUserDeletion = async (
  deleterId: string,
  deleterEmail: string,
  deleterRole: UserRole,
  deletedUserEmail: string
): Promise<void> => {
  await logAction(
    deleterId,
    deleterEmail,
    deleterRole,
    'delete_user',
    `Deleted user: ${deletedUserEmail}`
  );
};

/**
 * Log invoice creation
 */
export const logInvoiceCreation = async (
  userId: string,
  userEmail: string,
  userRole: UserRole,
  invoiceNumber: string
): Promise<void> => {
  await logAction(
    userId,
    userEmail,
    userRole,
    'create_invoice',
    `Created invoice: ${invoiceNumber}`
  );
};

/**
 * Log invoice update
 */
export const logInvoiceUpdate = async (
  userId: string,
  userEmail: string,
  userRole: UserRole,
  invoiceNumber: string
): Promise<void> => {
  await logAction(
    userId,
    userEmail,
    userRole,
    'update_invoice',
    `Updated invoice: ${invoiceNumber}`
  );
};

/**
 * Log payment processing
 */
export const logPayment = async (
  userId: string,
  userEmail: string,
  userRole: UserRole,
  amount: number,
  reference: string
): Promise<void> => {
  await logAction(
    userId,
    userEmail,
    userRole,
    'process_payment',
    `Processed payment: RM ${amount.toFixed(2)} - ${reference}`
  );
};

/**
 * Log project creation
 */
export const logProjectCreation = async (
  userId: string,
  userEmail: string,
  userRole: UserRole,
  projectTitle: string
): Promise<void> => {
  await logAction(
    userId,
    userEmail,
    userRole,
    'create_project',
    `Created project: ${projectTitle}`
  );
};

/**
 * Log task assignment
 */
export const logTaskAssignment = async (
  userId: string,
  userEmail: string,
  userRole: UserRole,
  taskTitle: string,
  assignedTo: string
): Promise<void> => {
  await logAction(
    userId,
    userEmail,
    userRole,
    'assign_task',
    `Assigned task "${taskTitle}" to ${assignedTo}`
  );
};

/**
 * Log password change
 */
export const logPasswordChange = async (
  userId: string,
  userEmail: string,
  userRole: UserRole
): Promise<void> => {
  await logAction(
    userId,
    userEmail,
    userRole,
    'change_password',
    `Changed password`
  );
};

/**
 * Log permission denied attempt
 */
export const logPermissionDenied = async (
  userId: string,
  userEmail: string,
  userRole: UserRole,
  attemptedAction: string
): Promise<void> => {
  await logAction(
    userId,
    userEmail,
    userRole,
    'permission_denied',
    `Attempted unauthorized action: ${attemptedAction}`,
    'failed'
  );
};

/**
 * Get audit logs for a specific user
 */
export const getUserAuditLogs = async (
  userId: string,
  limitCount: number = 50
): Promise<AuditLog[]> => {
  try {
    const q = query(
      collection(db, 'auditLogs'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AuditLog[];
  } catch (error) {
    console.error('Error fetching user audit logs:', error);
    return [];
  }
};

/**
 * Get recent audit logs (admin only)
 */
export const getRecentAuditLogs = async (limitCount: number = 100): Promise<AuditLog[]> => {
  try {
    const q = query(
      collection(db, 'auditLogs'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AuditLog[];
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
};

/**
 * Get audit logs by action type
 */
export const getAuditLogsByAction = async (
  action: string,
  limitCount: number = 50
): Promise<AuditLog[]> => {
  try {
    const q = query(
      collection(db, 'auditLogs'),
      where('action', '==', action),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AuditLog[];
  } catch (error) {
    console.error('Error fetching audit logs by action:', error);
    return [];
  }
};

/**
 * Get failed login attempts
 */
export const getFailedLoginAttempts = async (limitCount: number = 50): Promise<AuditLog[]> => {
  try {
    const q = query(
      collection(db, 'auditLogs'),
      where('action', '==', 'login'),
      where('status', '==', 'failed'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AuditLog[];
  } catch (error) {
    console.error('Error fetching failed login attempts:', error);
    return [];
  }
};

