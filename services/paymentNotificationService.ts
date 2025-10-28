import type { PaymentReceipt, PaymentInvoice } from '../types';

/**
 * Payment Notification Service
 * 
 * Handles notifications for payment-related events:
 * - Receipt uploaded → Notify finance team
 * - Receipt verified → Notify customer
 * - Receipt rejected → Notify customer
 * - Invoice generated → Notify customer
 * - Payment overdue → Notify customer
 */

// Email notification function (to be implemented with actual email service)
export const sendEmailNotification = async (
  to: string,
  subject: string,
  body: string
): Promise<boolean> => {
  // TODO: Implement actual email service integration
  // For now, just log to console
  console.log('📧 EMAIL NOTIFICATION:');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  console.log('---');
  
  return true;
};

// Notify finance team when customer uploads a payment receipt
export const notifyFinanceReceiptUploaded = async (
  receipt: PaymentReceipt
): Promise<void> => {
  const subject = `New Payment Receipt Uploaded - ${receipt.customerName}`;
  const body = `
A new payment receipt has been uploaded and requires verification:

Customer: ${receipt.customerName} (${receipt.customerEmail})
Amount: $${receipt.amount.toFixed(2)}
Payment Method: ${receipt.paymentMethod}
Payment Date: ${receipt.paymentDate}
Transaction ID: ${receipt.transactionId || 'N/A'}

Please review and verify this payment receipt in the Finance Dashboard.
`;

  // TODO: Get finance team emails from database
  const financeTeamEmails = ['finance@example.com']; // Placeholder
  
  for (const email of financeTeamEmails) {
    await sendEmailNotification(email, subject, body);
  }
};

// Notify customer when their payment receipt is verified
export const notifyCustomerReceiptVerified = async (
  receipt: PaymentReceipt
): Promise<void> => {
  const subject = 'Payment Receipt Verified ✅';
  const body = `
Hi ${receipt.customerName},

Good news! Your payment receipt has been verified.

Payment Details:
- Amount: $${receipt.amount.toFixed(2)}
- Payment Method: ${receipt.paymentMethod}
- Payment Date: ${receipt.paymentDate}
- Transaction ID: ${receipt.transactionId || 'N/A'}

${receipt.reviewNotes ? `Note from finance team: ${receipt.reviewNotes}` : ''}

Thank you for your payment!

Best regards,
Finance Team
`;

  await sendEmailNotification(receipt.customerEmail, subject, body);
};

// Notify customer when their payment receipt is rejected
export const notifyCustomerReceiptRejected = async (
  receipt: PaymentReceipt
): Promise<void> => {
  const subject = 'Payment Receipt Requires Attention ⚠️';
  const body = `
Hi ${receipt.customerName},

Your payment receipt submission requires attention.

Payment Details:
- Amount: $${receipt.amount.toFixed(2)}
- Payment Method: ${receipt.paymentMethod}
- Payment Date: ${receipt.paymentDate}

Reason for rejection:
${receipt.rejectionReason}

${receipt.reviewNotes ? `Additional notes: ${receipt.reviewNotes}` : ''}

Please upload a new receipt or contact our finance team for assistance.

Best regards,
Finance Team
`;

  await sendEmailNotification(receipt.customerEmail, subject, body);
};

// Notify customer when a new invoice is generated
export const notifyCustomerInvoiceGenerated = async (
  invoice: PaymentInvoice
): Promise<void> => {
  const subject = `New Invoice: ${invoice.invoiceNumber}`;
  const body = `
Hi ${invoice.customerName},

A new invoice has been generated for your account.

Invoice Details:
- Invoice Number: ${invoice.invoiceNumber}
- Amount: ${invoice.currency} $${invoice.amount.toFixed(2)}
- Issue Date: ${invoice.issueDate}
- Due Date: ${invoice.dueDate}

${invoice.description ? `Description: ${invoice.description}` : ''}

You can view and download your invoice from the customer dashboard.

Please submit your payment receipt after making the payment.

Best regards,
Finance Team
`;

  await sendEmailNotification(invoice.customerEmail, subject, body);
};

// Notify customer when payment is overdue
export const notifyCustomerPaymentOverdue = async (
  invoice: PaymentInvoice
): Promise<void> => {
  const subject = `Payment Overdue: ${invoice.invoiceNumber} ⚠️`;
  const body = `
Hi ${invoice.customerName},

This is a friendly reminder that your payment is overdue.

Invoice Details:
- Invoice Number: ${invoice.invoiceNumber}
- Amount: ${invoice.currency} $${invoice.amount.toFixed(2)}
- Due Date: ${invoice.dueDate}

Please make your payment as soon as possible and upload your payment receipt.

If you have already made the payment, please upload your receipt in the customer dashboard.

If you need assistance, please contact our finance team.

Best regards,
Finance Team
`;

  await sendEmailNotification(invoice.customerEmail, subject, body);
};

// Check for overdue invoices and send notifications
export const checkOverdueInvoices = async (
  invoices: PaymentInvoice[]
): Promise<void> => {
  const today = new Date();
  
  for (const invoice of invoices) {
    if (invoice.status === 'pending' || invoice.status === 'overdue') {
      const dueDate = new Date(invoice.dueDate);
      
      if (dueDate < today && invoice.status !== 'overdue') {
        // Send overdue notification
        await notifyCustomerPaymentOverdue(invoice);
        console.log(`Sent overdue notification for invoice: ${invoice.invoiceNumber}`);
      }
    }
  }
};

/**
 * Audit Log Entry Interface
 * All payment actions are logged with timestamps in Firestore
 */
export interface PaymentAuditLog {
  action: 'receipt_uploaded' | 'receipt_verified' | 'receipt_rejected' | 'invoice_created' | 'invoice_updated' | 'invoice_paid' | 'invoice_cancelled';
  performedBy: string; // User email
  performedAt: any; // Firestore timestamp
  targetId: string; // Receipt or Invoice ID
  targetType: 'receipt' | 'invoice';
  details: string;
  customerEmail: string;
  amount: number;
}

/**
 * Create audit log entry
 * Note: Audit logs are automatically created through Firestore timestamps
 * in PaymentReceipt and PaymentInvoice objects:
 * 
 * - uploadedAt, reviewedAt, updatedAt timestamps
 * - reviewedBy, createdBy fields
 * - status changes are tracked through updatedAt
 * - reviewNotes and rejectionReason provide context
 */
export const createPaymentAuditLog = (
  action: PaymentAuditLog['action'],
  performedBy: string,
  targetId: string,
  targetType: 'receipt' | 'invoice',
  details: string,
  customerEmail: string,
  amount: number
): void => {
  console.log('📝 AUDIT LOG:');
  console.log(`Action: ${action}`);
  console.log(`Performed by: ${performedBy}`);
  console.log(`Target: ${targetType} ${targetId}`);
  console.log(`Customer: ${customerEmail}`);
  console.log(`Amount: $${amount.toFixed(2)}`);
  console.log(`Details: ${details}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('---');
  
  // Audit logs are already tracked in Firestore through timestamps and review fields
  // This function is for additional logging/analytics if needed
};

