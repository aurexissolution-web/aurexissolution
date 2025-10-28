import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useTheme } from '../../hooks/useTheme';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download,
  Eye,
  AlertCircle,
  DollarSign,
  Calendar,
  CreditCard,
  Hash,
  User,
  FileText,
  MessageSquare
} from 'lucide-react';
import { serverTimestamp } from 'firebase/firestore';
import type { PaymentReceipt } from '../../types';

const FinancePaymentVerification: React.FC = () => {
  const { theme } = useTheme();
  const { 
    user, 
    paymentReceipts, 
    updatePaymentReceipt,
    paymentInvoices
  } = useAppContext();

  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter receipts
  const filteredReceipts = useMemo(() => {
    if (filter === 'all') return paymentReceipts;
    return paymentReceipts.filter(rec => rec.status === filter);
  }, [paymentReceipts, filter]);

  // Get counts for badges
  const pendingCount = paymentReceipts.filter(r => r.status === 'pending').length;
  const verifiedCount = paymentReceipts.filter(r => r.status === 'verified').length;
  const rejectedCount = paymentReceipts.filter(r => r.status === 'rejected').length;

  const handleVerify = async () => {
    if (!selectedReceipt || !user) return;

    setIsProcessing(true);
    try {
      const updatedReceipt: PaymentReceipt = {
        ...selectedReceipt,
        status: 'verified',
        reviewedBy: user.email,
        reviewedAt: serverTimestamp(),
        reviewNotes: reviewNotes || undefined,
        updatedAt: serverTimestamp()
      };

      await updatePaymentReceipt(updatedReceipt);

      // TODO: Send notification to customer
      console.log('✅ Payment verified - Customer should be notified');

      alert('✅ Payment receipt verified successfully!');
      setSelectedReceipt(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Failed to verify payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReceipt || !user || !rejectionReason) {
      alert('Please provide a reason for rejection');
      return;
    }

    setIsProcessing(true);
    try {
      const updatedReceipt: PaymentReceipt = {
        ...selectedReceipt,
        status: 'rejected',
        reviewedBy: user.email,
        reviewedAt: serverTimestamp(),
        rejectionReason,
        reviewNotes: reviewNotes || undefined,
        updatedAt: serverTimestamp()
      };

      await updatePaymentReceipt(updatedReceipt);

      // TODO: Send notification to customer
      console.log('❌ Payment rejected - Customer should be notified');

      alert('Payment receipt rejected. Customer has been notified.');
      setSelectedReceipt(null);
      setReviewNotes('');
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert('Failed to reject payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getLinkedInvoice = (invoiceId?: string) => {
    if (!invoiceId) return null;
    return paymentInvoices.find(inv => inv.id === invoiceId);
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'N/A';
    
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString();
      }
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
      }
      return new Date(timestamp).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  const FilterButton: React.FC<{ 
    status: typeof filter; 
    label: string; 
    count: number; 
    icon: React.ReactNode 
  }> = ({ status, label, count, icon }) => (
    <button
      onClick={() => setFilter(status)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        filter === status
          ? 'bg-gradient-to-r from-primary to-secondary text-white'
          : theme === 'dark'
          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
        filter === status
          ? 'bg-white/20'
          : theme === 'dark'
          ? 'bg-gray-600'
          : 'bg-white'
      }`}>
        {count}
      </span>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className={`p-6 rounded-xl shadow-lg ${
        theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          <FileText className="h-6 w-6" />
          Payment Receipt Verification
        </h3>

        <div className="flex flex-wrap gap-3">
          <FilterButton 
            status="pending" 
            label="Pending" 
            count={pendingCount}
            icon={<Clock className="h-5 w-5" />}
          />
          <FilterButton 
            status="verified" 
            label="Verified" 
            count={verifiedCount}
            icon={<CheckCircle className="h-5 w-5" />}
          />
          <FilterButton 
            status="rejected" 
            label="Rejected" 
            count={rejectedCount}
            icon={<XCircle className="h-5 w-5" />}
          />
          <FilterButton 
            status="all" 
            label="All" 
            count={paymentReceipts.length}
            icon={<FileText className="h-5 w-5" />}
          />
        </div>
      </div>

      {/* Receipts List */}
      <div className={`p-6 rounded-xl shadow-lg ${
        theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <h4 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {filter === 'all' ? 'All Receipts' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Receipts`} ({filteredReceipts.length})
        </h4>

        {filteredReceipts.length === 0 ? (
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            No receipts to display.
          </p>
        ) : (
          <div className="space-y-4">
            {filteredReceipts.map(receipt => {
              const linkedInvoice = getLinkedInvoice(receipt.invoiceId);
              
              return (
                <div
                  key={receipt.id}
                  className={`p-4 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4" />
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {receipt.customerName}
                        </p>
                      </div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {receipt.customerEmail}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ${receipt.amount.toFixed(2)}
                      </p>
                      {receipt.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                          <Clock className="h-3 w-3" />
                          Pending
                        </span>
                      )}
                      {receipt.status === 'verified' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </span>
                      )}
                      {receipt.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                          <XCircle className="h-3 w-3" />
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        {receipt.paymentMethod}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        {receipt.paymentDate}
                      </span>
                    </div>
                    {receipt.transactionId && (
                      <div className="flex items-center gap-1 col-span-2">
                        <Hash className="h-4 w-4" />
                        <span className={`font-mono text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {receipt.transactionId}
                        </span>
                      </div>
                    )}
                  </div>

                  {linkedInvoice && (
                    <div className={`p-2 rounded text-sm mb-3 ${
                      theme === 'dark' ? 'bg-gray-600 text-gray-200' : 'bg-blue-50 text-blue-800'
                    }`}>
                      <strong>Linked Invoice:</strong> {linkedInvoice.invoiceNumber} (${linkedInvoice.amount.toFixed(2)})
                    </div>
                  )}

                  {receipt.reviewNotes && (
                    <div className={`p-2 rounded text-sm mb-3 ${
                      theme === 'dark' ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-700'
                    }`}>
                      <strong>Review Notes:</strong> {receipt.reviewNotes}
                    </div>
                  )}

                  {receipt.rejectionReason && (
                    <div className="p-2 rounded text-sm mb-3 bg-red-100 text-red-800">
                      <strong>Rejection Reason:</strong> {receipt.rejectionReason}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedReceipt(receipt)}
                      className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                        theme === 'dark'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      <Eye className="h-4 w-4" />
                      Review
                    </button>
                    <a
                      href={receipt.receiptFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                        theme === 'dark'
                          ? 'bg-gray-600 hover:bg-gray-500 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                      }`}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  </div>

                  <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    Uploaded: {formatDate(receipt.uploadedAt)}
                    {receipt.reviewedBy && ` • Reviewed by: ${receipt.reviewedBy}`}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`sticky top-0 p-6 border-b ${
              theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            }`}>
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Review Payment Receipt
              </h3>
            </div>

            <div className="p-6 space-y-4">
              {/* Customer Info */}
              <div>
                <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Customer Information
                </h4>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  {selectedReceipt.customerName} ({selectedReceipt.customerEmail})
                </p>
              </div>

              {/* Payment Details */}
              <div>
                <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Payment Details
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Amount:</span>
                    <p className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ${selectedReceipt.amount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Method:</span>
                    <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      {selectedReceipt.paymentMethod}
                    </p>
                  </div>
                  <div>
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Date:</span>
                    <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      {selectedReceipt.paymentDate}
                    </p>
                  </div>
                  {selectedReceipt.transactionId && (
                    <div>
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Transaction ID:</span>
                      <p className={`font-mono ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {selectedReceipt.transactionId}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Receipt File */}
              <div>
                <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Receipt File
                </h4>
                <a
                  href={selectedReceipt.receiptFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View Receipt
                </a>
              </div>

              {/* Review Notes */}
              {selectedReceipt.status === 'pending' && (
                <>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <MessageSquare className="inline h-4 w-4 mr-1" />
                      Review Notes (Optional)
                    </label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={3}
                      placeholder="Add any notes about this payment..."
                      className={`w-full px-3 py-2 rounded border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <AlertCircle className="inline h-4 w-4 mr-1" />
                      Rejection Reason (Required if rejecting)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={2}
                      placeholder="Explain why this payment is being rejected..."
                      className={`w-full px-3 py-2 rounded border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                </>
              )}

              {/* Existing Review Info */}
              {selectedReceipt.status !== 'pending' && (
                <div className={`p-4 rounded ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <strong>Status:</strong> {selectedReceipt.status}
                  </p>
                  {selectedReceipt.reviewedBy && (
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <strong>Reviewed by:</strong> {selectedReceipt.reviewedBy}
                    </p>
                  )}
                  {selectedReceipt.reviewNotes && (
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <strong>Notes:</strong> {selectedReceipt.reviewNotes}
                    </p>
                  )}
                  {selectedReceipt.rejectionReason && (
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <strong>Rejection Reason:</strong> {selectedReceipt.rejectionReason}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className={`sticky bottom-0 p-6 border-t flex gap-3 ${
              theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            }`}>
              {selectedReceipt.status === 'pending' ? (
                <>
                  <button
                    onClick={handleVerify}
                    disabled={isProcessing}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="h-5 w-5" />
                    {isProcessing ? 'Processing...' : 'Verify Payment'}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isProcessing || !rejectionReason}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors disabled:opacity-50"
                  >
                    <XCircle className="h-5 w-5" />
                    {isProcessing ? 'Processing...' : 'Reject Payment'}
                  </button>
                </>
              ) : null}
              <button
                onClick={() => {
                  setSelectedReceipt(null);
                  setReviewNotes('');
                  setRejectionReason('');
                }}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancePaymentVerification;

