// services/notificationService.ts
// Enhanced notification service for project request status changes

import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface Notification {
  id?: string;
  recipientEmail: string;
  recipientUniqueId: string;
  type: 'project_request_approved' | 'project_request_rejected' | 'project_request_need_info' | 'project_assigned' | 'project_updated' | 'task_completed' | 'payment_receipt_uploaded';
  title: string;
  message: string;
  data?: any; // Additional data (e.g., project ID, request ID, task ID)
  read: boolean;
  createdAt: any;
}

/**
 * Send notification when project request status changes
 */
export const notifyProjectRequestStatusChange = async (
  customerEmail: string,
  customerUniqueId: string,
  status: 'approved' | 'rejected' | 'need-more-info',
  projectTitle: string,
  adminNotes?: string,
  rejectionReason?: string,
  assignedTeamLead?: string
): Promise<void> => {
  try {
    let notification: Omit<Notification, 'id'>;

    if (status === 'approved') {
      notification = {
        recipientEmail: customerEmail,
        recipientUniqueId: customerUniqueId,
        type: 'project_request_approved',
        title: '✅ Project Request Approved!',
        message: `Your project "${projectTitle}" has been approved and assigned to ${assignedTeamLead || 'our team'}. ${adminNotes || 'We will start working on it soon.'}`,
        data: { projectTitle, status, adminNotes, assignedTeamLead },
        read: false,
        createdAt: serverTimestamp()
      };
    } else if (status === 'rejected') {
      notification = {
        recipientEmail: customerEmail,
        recipientUniqueId: customerUniqueId,
        type: 'project_request_rejected',
        title: '❌ Project Request Update',
        message: `Unfortunately, we cannot proceed with your project "${projectTitle}". ${rejectionReason || 'Please contact us for more information.'}`,
        data: { projectTitle, status, rejectionReason },
        read: false,
        createdAt: serverTimestamp()
      };
    } else {
      notification = {
        recipientEmail: customerEmail,
        recipientUniqueId: customerUniqueId,
        type: 'project_request_need_info',
        title: '💬 More Information Needed',
        message: `We need additional information about your project "${projectTitle}". ${adminNotes || 'Please check your request and respond.'}`,
        data: { projectTitle, status, adminNotes },
        read: false,
        createdAt: serverTimestamp()
      };
    }

    await addDoc(collection(db, 'notifications'), notification);
    console.log('✅ Notification sent successfully');
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    throw error;
  }
};

/**
 * Send notification when project is assigned to team lead
 */
export const notifyTeamLeadProjectAssigned = async (
  teamLeadEmail: string,
  teamLeadUniqueId: string,
  projectTitle: string,
  customerName: string,
  projectId: string
): Promise<void> => {
  try {
    const notification: Omit<Notification, 'id'> = {
      recipientEmail: teamLeadEmail,
      recipientUniqueId: teamLeadUniqueId,
      type: 'project_assigned',
      title: '🎯 New Project Assigned',
      message: `You have been assigned a new project: "${projectTitle}" from customer ${customerName}. Check your dashboard for details.`,
      data: { projectTitle, customerName, projectId },
      read: false,
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'notifications'), notification);
    console.log('✅ Team lead notified successfully');
  } catch (error) {
    console.error('❌ Error notifying team lead:', error);
    throw error;
  }
};

/**
 * Get recent notifications for a user
 */
export const getUserNotifications = async (
  userEmail: string,
  maxResults: number = 10
): Promise<Notification[]> => {
  try {
    // Fetch notifications without orderBy to avoid index requirement
    const q = query(
      collection(db, 'notifications'),
      where('recipientEmail', '==', userEmail)
    );

    const snapshot = await getDocs(q);
    const notifications = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Notification));
    
    // Sort in memory by createdAt (newest first)
    const sorted = notifications.sort((a, b) => {
      const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return timeB - timeA;
    });
    
    // Return limited results
    return sorted.slice(0, maxResults);
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    return [];
  }
};

/**
 * Check for duplicate project requests (simple title similarity)
 */
export const checkForDuplicateRequest = async (
  customerEmail: string,
  projectTitle: string
): Promise<{ isDuplicate: boolean; similarRequest?: any }> => {
  try {
    const q = query(
      collection(db, 'projectRequests'),
      where('customerEmail', '==', customerEmail),
      where('status', 'in', ['pending', 'approved'])
    );

    const snapshot = await getDocs(q);
    const existingRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Check for similar titles (case-insensitive, basic matching)
    const normalizedTitle = projectTitle.toLowerCase().trim();
    const similarRequest = existingRequests.find(req => {
      const existingTitle = (req.title || '').toLowerCase().trim();
      return existingTitle === normalizedTitle || 
             existingTitle.includes(normalizedTitle) ||
             normalizedTitle.includes(existingTitle);
    });

    return {
      isDuplicate: !!similarRequest,
      similarRequest
    };
  } catch (error) {
    console.error('❌ Error checking for duplicates:', error);
    return { isDuplicate: false };
  }
};

/**
 * Notify finance team when freelancer completes a task
 */
export const notifyFinanceTaskCompleted = async (
  taskId: string,
  taskTitle: string,
  freelancerEmail: string,
  freelancerName: string,
  commissionAmount: number
): Promise<void> => {
  try {
    // Get all finance users
    const financeQuery = query(
      collection(db, 'users'),
      where('role', '==', 'finance')
    );
    
    const financeSnapshot = await getDocs(financeQuery);
    
    // Send notification to each finance user
    for (const financeDoc of financeSnapshot.docs) {
      const financeUser = financeDoc.data();
      
      const notification: Omit<Notification, 'id'> = {
        recipientEmail: financeUser.email,
        recipientUniqueId: financeUser.uniqueId || financeUser.email,
        type: 'task_completed',
        title: '💰 Task Completed - Payment Required',
        message: `${freelancerName} (${freelancerEmail}) has completed task "${taskTitle}". Commission amount: RM ${commissionAmount.toFixed(2)}. Please process payment and upload receipt.`,
        data: { taskId, taskTitle, freelancerEmail, freelancerName, commissionAmount },
        read: false,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'notifications'), notification);
    }
    
    console.log('✅ Finance team notified of task completion');
  } catch (error) {
    console.error('❌ Error notifying finance team:', error);
  }
};

/**
 * Notify freelancer when payment receipt is uploaded
 */
export const notifyFreelancerPaymentReceived = async (
  freelancerEmail: string,
  freelancerUniqueId: string,
  taskTitle: string,
  amount: number,
  receiptUrl: string
): Promise<void> => {
  try {
    const notification: Omit<Notification, 'id'> = {
      recipientEmail: freelancerEmail,
      recipientUniqueId: freelancerUniqueId,
      type: 'payment_receipt_uploaded',
      title: '💵 Payment Received!',
      message: `Your payment of RM ${amount.toFixed(2)} for task "${taskTitle}" has been processed. Receipt is now available for download in your dashboard.`,
      data: { taskTitle, amount, receiptUrl },
      read: false,
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'notifications'), notification);
    console.log('✅ Freelancer notified of payment receipt');
  } catch (error) {
    console.error('❌ Error notifying freelancer:', error);
  }
};

/**
 * Legacy functions for NotificationBell component compatibility
 */
export const generateTaskNotifications = async (): Promise<Notification[]> => {
  // Placeholder for backwards compatibility with NotificationBell
  return [];
};

export const getNotificationCount = (notifications: Notification[]): number => {
  return notifications.filter(n => !n.read).length;
};

export const formatNotificationTime = (timestamp: any): string => {
  if (!timestamp) return '';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  } catch {
    return '';
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  // Browser notification permission (for future enhancement)
  if ('Notification' in window && Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return Notification.permission === 'granted';
};
