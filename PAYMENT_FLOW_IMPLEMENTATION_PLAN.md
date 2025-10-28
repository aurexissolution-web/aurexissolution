# 💳 Payment Flow System - Implementation Plan

## ✅ Completed: Types & Interfaces

### PaymentReceipt Interface
- Customer info (email, uniqueId, name)
- Payment details (amount, method, transaction ID, date)
- Receipt file (URL, filename, type)
- Status tracking (pending, verified, rejected)
- Admin review fields (reviewedBy, notes, reason)
- Timestamps (uploadedAt, updatedAt)

### PaymentInvoice Interface
- Customer info
- Invoice details (number, amount, currency, dates)
- Invoice file
- Status (pending, paid, overdue, cancelled)
- Line items and notes
- Tracking (createdBy, timestamps)

---

## 🔄 Next Steps

### 1. AppContext Updates
```typescript
// Add to imports
import { PaymentReceipt, PaymentInvoice } from '../types';

// Add states
const [paymentReceipts, setPaymentReceipts] = useState<PaymentReceipt[]>([]);
const [paymentInvoices, setPaymentInvoices] = useState<PaymentInvoice[]>([]);

// Add CRUD functions
const paymentReceiptCrud = createCrudFunctions('paymentReceipts');
const paymentInvoiceCrud = createCrudFunctions('paymentInvoices');

// Add Firestore listeners
useEffect(() => {
  const q = query(collection(db, 'paymentReceipts'), orderBy('uploadedAt', 'desc'));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    setPaymentReceipts(snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PaymentReceipt)));
  });
  return unsubscribe;
}, []);
```

### 2. Customer Payment Upload Component
**File:** `components/dashboard/CustomerPaymentUpload.tsx`

Features:
- Upload receipt file (image/PDF)
- Enter payment details (amount, method, transaction ID, date)
- Link to invoice/project (optional)
- Submit for verification
- View upload history with status

UI Elements:
- File drop zone
- Form fields
- Submit button
- Status badges (Pending, Verified, Rejected)
- Receipt list with download links

### 3. Finance Payment Verification Component
**File:** `components/dashboard/FinancePaymentVerification.tsx`

Features:
- View all payment receipts
- Filter by status (pending, verified, rejected)
- View receipt details and file
- Verify or reject with notes
- Request additional proof
- Link to invoices

UI Elements:
- Receipt table/cards
- Filter buttons
- Receipt preview modal
- Verify/Reject buttons
- Notes textarea
- Audit log

### 4. Customer Status Tracker
**File:** `components/dashboard/CustomerPaymentStatus.tsx`

Features:
- Timeline view of payment status
- Color-coded status indicators
- Admin notes display
- Reupload button if rejected

UI Elements:
- Status stepper (Uploaded → Under Review → Verified/Rejected)
- Status badges
- Timeline with timestamps
- Admin feedback section

### 5. Invoice & Quotation Management
**File:** `components/admin/AdminInvoiceUpload.tsx`
**File:** `components/dashboard/CustomerInvoiceList.tsx`

Admin Features:
- Upload/generate invoices
- Upload quotations
- Link to projects/payments
- Set due dates
- Update status

Customer Features:
- View all invoices
- Download PDF/images
- See payment status
- Upload proof of payment

### 6. Notification System
**Features:**
- Email notifications (simulated)
- In-app notifications
- Finance team alerts on new receipt upload
- Customer alerts on status change

**Events to Notify:**
- Receipt uploaded → Notify finance
- Receipt verified → Notify customer
- Receipt rejected → Notify customer
- Invoice generated → Notify customer
- Payment overdue → Notify customer

### 7. Audit Log
**File:** `components/admin/PaymentAuditLog.tsx`

Track:
- Receipt uploads
- Status changes
- File downloads
- Admin actions
- Notes added

Display:
- Timestamp
- User (customer/admin)
- Action type
- Details
- Filter by date/user

---

## 🗂️ Firestore Collections

### paymentReceipts
```
{
  id: string,
  customerEmail: string,
  customerUniqueId: string,
  amount: number,
  status: 'pending' | 'verified' | 'rejected',
  receiptFileUrl: string,
  uploadedAt: timestamp,
  ...
}
```

### paymentInvoices
```
{
  id: string,
  invoiceNumber: string,
  customerUniqueId: string,
  amount: number,
  status: 'pending' | 'paid' | 'overdue',
  invoiceFileUrl: string,
  createdAt: timestamp,
  ...
}
```

---

## 🎨 UI/UX Flow

### Customer Workflow:
1. Customer views "Payments & Invoices" tab
2. Sees list of outstanding invoices
3. Clicks "Upload Payment Receipt"
4. Fills form (amount, method, date)
5. Uploads receipt file
6. Submits for verification
7. Sees status: "Pending Verification"
8. Gets notification when verified/rejected
9. Can reupload if rejected

### Finance Team Workflow:
1. Finance sees "Payment Verifications" tab
2. Views list of pending receipts
3. Clicks on receipt to view details
4. Opens file to verify
5. Verifies or Rejects with notes
6. Customer gets notification

### Admin Workflow:
1. Admin creates invoice
2. Uploads PDF
3. Links to customer/project
4. Invoice appears in customer dashboard
5. Customer uploads receipt
6. Finance verifies
7. Admin sees complete audit log

---

## 📱 Integration Points

### With Existing Systems:
- Links to Projects (projectId)
- Links to existing Invoices (invoiceId)
- Links to Customers (customerUniqueId)
- Notification system integration
- Role-based access (customer, finance, admin)

### New Dashboard Tabs:
- Customer: "Payments & Invoices" (update existing)
- Finance: "Payment Verification" (new)
- Admin: "Invoice Management" (enhance existing)

---

## 🚀 Implementation Priority

1. ✅ Types (PaymentReceipt, PaymentInvoice) - DONE
2. AppContext CRUD operations
3. Customer payment upload component
4. Finance verification component
5. Status tracker
6. Invoice management
7. Notifications
8. Audit log

---

**Estimated Time:** 
- Core features: 3-4 hours
- Polish & testing: 1-2 hours
- Total: 4-6 hours

**Status:** Phase 1 Complete (Types defined)
