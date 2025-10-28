import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useTheme } from '../../hooks/useTheme';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download,
  AlertCircle,
  DollarSign,
  Calendar,
  CreditCard,
  Hash,
  Paperclip
} from 'lucide-react';
import { serverTimestamp } from 'firebase/firestore';
import { uploadTaskFile } from '../../services/fileUploadService';

const CustomerPaymentUpload: React.FC = () => {
  const { theme } = useTheme();
  const { 
    user, 
    paymentReceipts, 
    addPaymentReceipt,
    paymentInvoices,
    quotations
  } = useAppContext();

  // Tab state
  const [activeTab, setActiveTab] = useState<'invoices' | 'quotations'>('invoices');

  // Form state
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // SHOW ALL DATA FOR TESTING (so mock data is visible)
  const myInvoices = useMemo(() => {
    console.log('💰 Showing all payment invoices:', paymentInvoices.length);
    return paymentInvoices; // Show ALL invoices
  }, [paymentInvoices]);

  const myQuotations = useMemo(() => {
    console.log('📄 Showing all quotations:', quotations?.length || 0);
    return quotations || []; // Show ALL quotations
  }, [quotations]);

  const myReceipts = useMemo(() => {
    console.log('💳 Showing all payment receipts:', paymentReceipts.length);
    return paymentReceipts; // Show ALL receipts
  }, [paymentReceipts]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size must be less than 10MB');
        return;
      }
      // Check file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setUploadError('Only JPG, PNG, and PDF files are allowed');
        return;
      }
      setReceiptFile(file);
      setUploadError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!receiptFile || !user) {
      setUploadError('Please select a file and ensure you are logged in');
      return;
    }

    if (!amount || !paymentMethod || !paymentDate) {
      setUploadError('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      // Upload file and get base64 URL
      const uploadedFile = await uploadTaskFile(receiptFile);
      
      // Create payment receipt object
      const newReceipt = {
        customerEmail: user.email,
        customerUniqueId: user.uniqueId,
        customerName: user.email.split('@')[0],
        amount: parseFloat(amount),
        paymentMethod,
        transactionId: transactionId || undefined,
        paymentDate,
        invoiceId: invoiceId || undefined,
        projectId: projectId || undefined,
        receiptFileUrl: uploadedFile.fileUrl,
        receiptFileName: uploadedFile.fileName,
        receiptFileType: uploadedFile.fileType,
        status: 'pending' as const,
        uploadedAt: serverTimestamp()
      };

      await addPaymentReceipt(newReceipt);

      // Reset form
      setAmount('');
      setPaymentMethod('');
      setTransactionId('');
      setPaymentDate('');
      setInvoiceId('');
      setProjectId('');
      setReceiptFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('receipt-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      alert('✅ Payment receipt uploaded successfully! Finance team will review it shortly.');
    } catch (error) {
      console.error('Error uploading receipt:', error);
      setUploadError('Failed to upload receipt. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-4 w-4" />
            Pending Review
          </span>
        );
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4" />
            Verified
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="h-4 w-4" />
            Rejected
          </span>
        );
      default:
        return null;
    }
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

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className={`p-4 rounded-xl shadow-lg ${
        theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'invoices'
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                : theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <DollarSign className="h-5 w-5" />
            <span>Invoices & Payments</span>
            {myInvoices.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'invoices'
                  ? 'bg-white/20'
                  : theme === 'dark'
                  ? 'bg-gray-600'
                  : 'bg-white'
              }`}>
                {myInvoices.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('quotations')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'quotations'
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                : theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span>Quotations</span>
            {myQuotations.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'quotations'
                  ? 'bg-white/20'
                  : theme === 'dark'
                  ? 'bg-gray-600'
                  : 'bg-white'
              }`}>
                {myQuotations.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Invoices & Payments Tab Content */}
      {activeTab === 'invoices' && (
        <>
          {/* Upload Form */}
          <div className={`p-6 rounded-xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Upload className="h-6 w-6" />
              Upload Payment Receipt
            </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Receipt File * (JPG, PNG, or PDF)
            </label>
            <input
              id="receipt-file"
              type="file"
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={handleFileChange}
              className={`w-full px-3 py-2 rounded border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              required
            />
            {receiptFile && (
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <Paperclip className="h-4 w-4" />
                {receiptFile.name}
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <DollarSign className="inline h-4 w-4 mr-1" />
              Amount Paid *
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={`w-full px-3 py-2 rounded border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              required
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <CreditCard className="inline h-4 w-4 mr-1" />
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className={`w-full px-3 py-2 rounded border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              required
            >
              <option value="">Select method</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="PayPal">PayPal</option>
              <option value="Cash">Cash</option>
              <option value="Check">Check</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Payment Date */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <Calendar className="inline h-4 w-4 mr-1" />
              Payment Date *
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className={`w-full px-3 py-2 rounded border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              required
            />
          </div>

          {/* Transaction ID */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <Hash className="inline h-4 w-4 mr-1" />
              Transaction ID (Optional)
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g., TXN123456789"
              className={`w-full px-3 py-2 rounded border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Link to Invoice */}
          {myInvoices.length > 0 && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Related Invoice (Optional)
              </label>
              <select
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                className={`w-full px-3 py-2 rounded border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Select an invoice</option>
                {myInvoices.map(inv => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} - ${inv.amount ? inv.amount.toFixed(2) : '0.00'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="flex items-center gap-2 p-3 rounded bg-red-100 text-red-800 text-sm">
              <AlertCircle className="h-4 w-4" />
              {uploadError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading || !receiptFile}
            className={`w-full px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              isUploading || !receiptFile
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90'
            }`}
          >
            {isUploading ? (
              <>
                <Clock className="h-5 w-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Submit Payment Receipt
              </>
            )}
          </button>
        </form>
      </div>

      {/* Receipts History */}
      <div className={`p-6 rounded-xl shadow-lg ${
        theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          <FileText className="h-6 w-6" />
          Payment History ({myReceipts.length})
        </h3>

        {myReceipts.length === 0 ? (
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            No payment receipts uploaded yet.
          </p>
        ) : (
          <div className="space-y-4">
            {myReceipts.map(receipt => (
              <div
                key={receipt.id}
                className={`p-4 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ${receipt.amount ? receipt.amount.toFixed(2) : '0.00'}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {receipt.paymentMethod} • {receipt.paymentDate}
                    </p>
                  </div>
                  {getStatusBadge(receipt.status)}
                </div>

                {receipt.transactionId && (
                  <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Transaction ID: <span className="font-mono">{receipt.transactionId}</span>
                  </p>
                )}

                {receipt.status === 'rejected' && receipt.rejectionReason && (
                  <div className="mt-2 p-3 rounded bg-red-100 text-red-800 text-sm">
                    <strong>Reason for rejection:</strong> {receipt.rejectionReason}
                  </div>
                )}

                {receipt.reviewNotes && receipt.status !== 'rejected' && (
                  <div className={`mt-2 p-3 rounded text-sm ${
                    theme === 'dark' ? 'bg-gray-600 text-gray-200' : 'bg-blue-50 text-blue-800'
                  }`}>
                    <strong>Admin notes:</strong> {receipt.reviewNotes}
                  </div>
                )}

                {/* Download Receipt */}
                <a
                  href={receipt.receiptFileUrl}
                  download={receipt.receiptFileName}
                  className={`inline-flex items-center gap-2 mt-3 px-4 py-2 rounded transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-600 hover:bg-gray-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  <Download className="h-4 w-4" />
                  Download Receipt
                </a>

                <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  Uploaded: {formatDate(receipt.uploadedAt)}
                  {receipt.reviewedAt && ` • Reviewed: ${formatDate(receipt.reviewedAt)}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
        </>
      )}

      {/* Quotations Tab Content */}
      {activeTab === 'quotations' && (
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <FileText className="h-6 w-6" />
            Quotations ({myQuotations.length})
          </h3>

          {myQuotations.length === 0 ? (
            <div className="text-center py-12">
              <FileText className={`h-16 w-16 mx-auto mb-4 ${
                theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <h4 className={`text-lg font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                No Quotations Yet
              </h4>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                When the admin sends you a quotation, it will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myQuotations.map(quote => {
              const isExpired = quote.expiryDate && new Date(quote.expiryDate) < new Date();
              
              return (
                <div
                  key={quote.id}
                  className={`p-4 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {quote.quoteNumber}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Quote Date: {quote.quoteDate}
                      </p>
                    </div>
                    <div className="text-right">
                      {quote.status === 'Draft' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          <Clock className="h-4 w-4" />
                          Draft
                        </span>
                      )}
                      {quote.status === 'Sent' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          <FileText className="h-4 w-4" />
                          Sent
                        </span>
                      )}
                      {quote.status === 'Accepted' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-4 w-4" />
                          Accepted
                        </span>
                      )}
                      {quote.status === 'Rejected' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          <XCircle className="h-4 w-4" />
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Expiry Date:</span>
                      <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} ${isExpired ? 'text-red-600' : ''}`}>
                        {quote.expiryDate} {isExpired && '(Expired)'}
                      </p>
                    </div>
                    {quote.creditTerm && (
                      <div>
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Credit Term:</span>
                        <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                          {quote.creditTerm}
                        </p>
                      </div>
                    )}
                  </div>

                  {quote.items && quote.items.length > 0 && (
                    <div className={`mb-3 p-3 rounded ${
                      theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'
                    }`}>
                      <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Items ({quote.items.length})
                      </p>
                      {quote.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm mb-1">
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                            {item.description}
                          </span>
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                            ${item.total ? item.total.toFixed(2) : '0.00'}
                          </span>
                        </div>
                      ))}
                      {quote.items.length > 3 && (
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          +{quote.items.length - 3} more items
                        </p>
                      )}
                      <div className="border-t border-gray-300 dark:border-gray-500 mt-2 pt-2">
                        <div className="flex justify-between font-bold">
                          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                            Total:
                          </span>
                          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                            ${quote.items?.reduce((sum, item) => sum + (item.total || 0), 0).toFixed(2) || '0.00'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {quote.notes && (
                    <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <strong>Notes:</strong> {quote.notes}
                    </p>
                  )}

                  {/* Download Button */}
                  {quote.quotationFileUrl && (
                    <a
                      href={quote.quotationFileUrl}
                      download={quote.quotationFileName || `quotation-${quote.quoteNumber}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 mt-3 px-4 py-2 rounded transition-colors ${
                        theme === 'dark'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      <Download className="h-4 w-4" />
                      Download Quotation
                    </a>
                  )}

                  <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    Created: {formatDate(quote.createdAt)}
                  </p>
                </div>
              );
            })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerPaymentUpload;

