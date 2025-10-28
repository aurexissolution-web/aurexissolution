import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useTheme } from '../../hooks/useTheme';
import { 
  Upload, 
  FileText, 
  Download,
  Trash2,
  Plus,
  DollarSign,
  Calendar,
  User,
  Hash,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { serverTimestamp } from 'firebase/firestore';
import { uploadTaskFile } from '../../services/fileUploadService';
import type { PaymentInvoice, Quotation } from '../../types';

const AdminInvoiceManagement: React.FC = () => {
  const { theme } = useTheme();
  const { 
    user,
    users,
    projects,
    paymentInvoices, 
    addPaymentInvoice,
    updatePaymentInvoice,
    deletePaymentInvoice,
    paymentReceipts,
    quotations,
    addQuotation,
    updateQuotation,
    deleteQuotation
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<'invoices' | 'quotations'>('invoices');
  const [isCreating, setIsCreating] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue' | 'cancelled'>('all');
  
  // Invoice Form state
  const [customerUniqueId, setCustomerUniqueId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Quotation Form state
  const [quotCustomerUniqueId, setQuotCustomerUniqueId] = useState('');
  const [quotationNumber, setQuotationNumber] = useState('');
  const [quotAmount, setQuotAmount] = useState('');
  const [quotIssueDate, setQuotIssueDate] = useState('');
  const [quotExpiryDate, setQuotExpiryDate] = useState('');
  const [quotProjectId, setQuotProjectId] = useState('');
  const [quotDescription, setQuotDescription] = useState('');
  const [quotNotes, setQuotNotes] = useState('');
  const [quotationFile, setQuotationFile] = useState<File | null>(null);
  const [isQuotUploading, setIsQuotUploading] = useState(false);
  const [quotUploadError, setQuotUploadError] = useState('');

  // Get customer users
  const customers = useMemo(() => {
    return users.filter(u => u.role === 'customer');
  }, [users]);

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    if (filter === 'all') return paymentInvoices;
    return paymentInvoices.filter(inv => inv.status === filter);
  }, [paymentInvoices, filter]);

  // Check if invoice is overdue
  const isOverdue = (invoice: PaymentInvoice): boolean => {
    if (invoice.status === 'paid' || invoice.status === 'cancelled') return false;
    const due = new Date(invoice.dueDate);
    return due < new Date();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size must be less than 10MB');
        return;
      }
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setUploadError('Only PDF, JPG, and PNG files are allowed');
        return;
      }
      setInvoiceFile(file);
      setUploadError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invoiceFile || !user) {
      setUploadError('Please select a file');
      return;
    }

    if (!customerUniqueId || !invoiceNumber || !amount || !issueDate || !dueDate) {
      setUploadError('Please fill in all required fields');
      return;
    }

    const selectedCustomer = customers.find(c => c.uniqueId === customerUniqueId);
    if (!selectedCustomer) {
      setUploadError('Invalid customer selected');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const uploadedFile = await uploadTaskFile(`invoice-${invoiceNumber}`, invoiceFile);
      
      const newInvoice = {
        customerEmail: selectedCustomer.email,
        customerUniqueId: selectedCustomer.uniqueId,
        customerName: selectedCustomer.email.split('@')[0],
        invoiceNumber,
        amount: parseFloat(amount),
        currency,
        issueDate,
        dueDate,
        projectId: projectId || undefined,
        invoiceFileUrl: uploadedFile.fileUrl,
        invoiceFileName: uploadedFile.fileName,
        invoiceFileType: uploadedFile.fileType,
        status: 'pending' as const,
        description: description || undefined,
        notes: notes || undefined,
        createdBy: user.email,
        createdAt: serverTimestamp()
      };

      await addPaymentInvoice(newInvoice);

      // TODO: Send notification to customer
      console.log('✅ Invoice created successfully! Customer should be notified');

      resetForm();
    } catch (error) {
      console.error('Error creating invoice:', error);
      setUploadError('Failed to create invoice. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setCustomerUniqueId('');
    setInvoiceNumber('');
    setAmount('');
    setCurrency('USD');
    setIssueDate('');
    setDueDate('');
    setProjectId('');
    setDescription('');
    setNotes('');
    setInvoiceFile(null);
    setIsCreating(false);
    
    const fileInput = document.getElementById('invoice-file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Quotation Handlers
  const handleQuotationFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setQuotUploadError('File size must be less than 10MB');
        return;
      }
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setQuotUploadError('Only PDF, JPG, and PNG files are allowed');
        return;
      }
      setQuotationFile(file);
      setQuotUploadError('');
    }
  };

  const handleQuotationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔵 QUOTATION SUBMIT - Starting validation...');
    console.log('  File selected:', !!quotationFile);
    console.log('  User logged in:', !!user);
    
    if (!quotationFile || !user) {
      setQuotUploadError('Please select a file');
      console.log('❌ Validation failed: No file or no user');
      return;
    }

    if (!quotCustomerUniqueId || !quotationNumber || !quotAmount || !quotIssueDate || !quotExpiryDate) {
      setQuotUploadError('Please fill in all required fields');
      console.log('❌ Validation failed: Missing required fields');
      return;
    }

    const selectedCustomer = customers.find(c => c.uniqueId === quotCustomerUniqueId);
    console.log('  Selected customer:', selectedCustomer?.email);
    
    if (!selectedCustomer) {
      setQuotUploadError('Invalid customer selected');
      console.log('❌ Validation failed: Invalid customer');
      return;
    }

    setIsQuotUploading(true);
    setQuotUploadError('');
    console.log('✅ Validation passed - Starting file upload...');

    try {
      const uploadedFile = await uploadTaskFile(`quotation-${quotationNumber}`, quotationFile);
      console.log('✅ File uploaded successfully');
      
      const newQuotation: Omit<Quotation, 'id'> = {
        quoteNumber: quotationNumber,
        customerName: selectedCustomer.email.split('@')[0],
        customerAddress: '',
        customerCode: selectedCustomer.uniqueId,
        customerContactPerson: selectedCustomer.email,
        quoteDate: quotIssueDate,
        expiryDate: quotExpiryDate,
        creditTerm: '',
        items: [],
        status: 'Sent',
        sstRate: 0,
        deliveryDate: '',
        deliveryAddress: '',
        notes: quotNotes || '',
        bankDetails: '',
        customerEmail: selectedCustomer.email,
        customerUniqueId: selectedCustomer.uniqueId,
        projectId: quotProjectId || undefined,
        quotationFileUrl: uploadedFile.fileUrl,
        quotationFileName: uploadedFile.fileName,
        quotationFileType: uploadedFile.fileType,
        createdBy: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('🔵 QUOTATION SUBMIT - Creating quotation with data:', {
        quoteNumber: newQuotation.quoteNumber,
        customerEmail: newQuotation.customerEmail,
        customerUniqueId: newQuotation.customerUniqueId,
        quotationFileName: newQuotation.quotationFileName,
        fileSize: uploadedFile.fileSize,
        status: newQuotation.status
      });
      
      await addQuotation(newQuotation);

      console.log('✅ QUOTATION SUBMIT - Success! Quotation created and should sync to Firestore');
      console.log('   Customer will see it under uniqueId:', newQuotation.customerUniqueId);
      console.log('   Customer will see it under email:', newQuotation.customerEmail);
      resetQuotationForm();
    } catch (error: any) {
      console.error('Error creating quotation:', error);
      console.error('Error message:', error.message);
      console.error('Error details:', error);
      setQuotUploadError(`Failed to create quotation: ${error.message || 'Please try again.'}`);
    } finally {
      setIsQuotUploading(false);
    }
  };

  const resetQuotationForm = () => {
    setQuotCustomerUniqueId('');
    setQuotationNumber('');
    setQuotAmount('');
    setQuotIssueDate('');
    setQuotExpiryDate('');
    setQuotProjectId('');
    setQuotDescription('');
    setQuotNotes('');
    setQuotationFile(null);
    setIsCreating(false);
    
    const fileInput = document.getElementById('quotation-file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleDeleteQuotation = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      try {
        await deleteQuotation(id);
        console.log('✅ Quotation deleted successfully');
      } catch (error) {
        console.error('Error deleting quotation:', error);
        setQuotUploadError('Failed to delete quotation');
      }
    }
  };

  const handleUpdateStatus = async (invoice: PaymentInvoice, newStatus: PaymentInvoice['status']) => {
    try {
      const updated: PaymentInvoice = {
        ...invoice,
        status: newStatus,
        updatedAt: serverTimestamp()
      };
      
      await updatePaymentInvoice(updated);
      console.log(`✅ Invoice status updated to: ${newStatus}`);
    } catch (error) {
      console.error('Error updating invoice:', error);
      setUploadError('Failed to update invoice status');
    }
  };

  const handleDelete = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
      await deletePaymentInvoice(invoiceId);
      console.log('✅ Invoice deleted successfully');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      setUploadError('Failed to delete invoice');
    }
  };

  const getStatusBadge = (invoice: PaymentInvoice) => {
    if (isOverdue(invoice)) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <AlertCircle className="h-4 w-4" />
          Overdue
        </span>
      );
    }

    switch (invoice.status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-4 w-4" />
            Pending
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4" />
            Paid
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            <XCircle className="h-4 w-4" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const getLinkedReceipt = (invoiceId: string) => {
    return paymentReceipts.find(r => r.invoiceId === invoiceId);
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className={`p-4 rounded-xl shadow-lg ${
        theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setActiveTab('invoices');
              setIsCreating(false);
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'invoices'
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                : theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <DollarSign className="h-5 w-5" />
            <span>Invoices</span>
            {paymentInvoices.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'invoices'
                  ? 'bg-white/20'
                  : theme === 'dark'
                  ? 'bg-gray-600'
                  : 'bg-white'
              }`}>
                {paymentInvoices.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => {
              setActiveTab('quotations');
              setIsCreating(false);
            }}
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
            {quotations.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'quotations'
                  ? 'bg-white/20'
                  : theme === 'dark'
                  ? 'bg-gray-600'
                  : 'bg-white'
              }`}>
                {quotations.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Invoices Tab Content */}
      {activeTab === 'invoices' && (
        <>
          {/* Header with Create Button */}
          <div className={`p-6 rounded-xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <FileText className="h-6 w-6" />
                Invoice Management
              </h3>
              <button
                onClick={() => setIsCreating(!isCreating)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 transition-opacity"
              >
                {isCreating ? (
                  <>
                    <XCircle className="h-5 w-5" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Create Invoice
                  </>
                )}
              </button>
            </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3">
          {(['all', 'pending', 'paid', 'overdue', 'cancelled'] as const).map(status => {
            const count = status === 'all' 
              ? paymentInvoices.length 
              : status === 'overdue'
              ? paymentInvoices.filter(inv => isOverdue(inv)).length
              : paymentInvoices.filter(inv => inv.status === status).length;

            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  filter === status
                    ? 'bg-gradient-to-r from-primary to-secondary text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <span className="font-medium capitalize">{status}</span>
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
          })}
        </div>
      </div>

      {/* Create Invoice Form */}
      {isCreating && (
        <div className={`p-6 rounded-xl shadow-lg ${
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <h4 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Create New Invoice
          </h4>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Selection */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <User className="inline h-4 w-4 mr-1" />
                Customer *
              </label>
              <select
                value={customerUniqueId}
                onChange={(e) => setCustomerUniqueId(e.target.value)}
                className={`w-full px-3 py-2 rounded border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                required
              >
                <option value="">Select a customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.uniqueId}>
                    {customer.email} (ID: {customer.uniqueId})
                  </option>
                ))}
              </select>
            </div>

            {/* Invoice Number */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Hash className="inline h-4 w-4 mr-1" />
                Invoice Number *
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="INV-2024-001"
                className={`w-full px-3 py-2 rounded border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                required
              />
            </div>

            {/* Amount and Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Amount *
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
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={`w-full px-3 py-2 rounded border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>
            </div>

            {/* Issue and Due Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Issue Date *
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className={`w-full px-3 py-2 rounded border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Due Date *
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={`w-full px-3 py-2 rounded border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  required
                />
              </div>
            </div>

            {/* Project Link (Optional) */}
            {projects.length > 0 && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Related Project (Optional)
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className={`w-full px-3 py-2 rounded border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">None</option>
                  {projects.filter(p => !p.isPortfolioItem).map(project => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Description */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Brief description of services/products"
                className={`w-full px-3 py-2 rounded border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Notes */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Internal Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Internal notes (not visible to customer)"
                className={`w-full px-3 py-2 rounded border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* File Upload */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Invoice File * (PDF, JPG, PNG)
              </label>
              <input
                id="invoice-file"
                type="file"
                accept="application/pdf,image/jpeg,image/jpg,image/png"
                onChange={handleFileChange}
                className={`w-full px-3 py-2 rounded border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                required
              />
              {invoiceFile && (
                <p className="text-sm text-green-600 mt-1">
                  {invoiceFile.name}
                </p>
              )}
            </div>

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
              disabled={isUploading || !invoiceFile}
              className={`w-full px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                isUploading || !invoiceFile
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90'
              }`}
            >
              {isUploading ? (
                <>
                  <Clock className="h-5 w-5 animate-spin" />
                  Creating Invoice...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Create Invoice
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Invoices List */}
      <div className={`p-6 rounded-xl shadow-lg ${
        theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <h4 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Invoices ({filteredInvoices.length})
        </h4>

        {filteredInvoices.length === 0 ? (
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            No invoices to display.
          </p>
        ) : (
          <div className="space-y-4">
            {filteredInvoices.map(invoice => {
              const linkedReceipt = getLinkedReceipt(invoice.id);
              
              return (
                <div
                  key={invoice.id}
                  className={`p-4 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {invoice.invoiceNumber}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {invoice.customerName} ({invoice.customerEmail})
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {invoice.currency} ${invoice.amount.toFixed(2)}
                      </p>
                      {getStatusBadge(invoice)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Issue Date:</span>
                      <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{invoice.issueDate}</p>
                    </div>
                    <div>
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Due Date:</span>
                      <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{invoice.dueDate}</p>
                    </div>
                  </div>

                  {invoice.description && (
                    <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {invoice.description}
                    </p>
                  )}

                  {linkedReceipt && (
                    <div className={`p-2 rounded text-sm mb-3 ${
                      linkedReceipt.status === 'verified'
                        ? 'bg-green-100 text-green-800'
                        : linkedReceipt.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <strong>Payment Receipt:</strong> {linkedReceipt.status} (${linkedReceipt.amount.toFixed(2)})
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={invoice.invoiceFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 rounded bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </a>
                    <a
                      href={invoice.invoiceFileUrl}
                      download={invoice.invoiceFileName}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                        theme === 'dark'
                          ? 'bg-gray-600 hover:bg-gray-500 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                      }`}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                    
                    {invoice.status !== 'paid' && (
                      <button
                        onClick={() => handleUpdateStatus(invoice, 'paid')}
                        className="flex items-center gap-2 px-3 py-1.5 rounded bg-green-500 hover:bg-green-600 text-white text-sm transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Mark Paid
                      </button>
                    )}
                    
                    {invoice.status !== 'cancelled' && (
                      <button
                        onClick={() => handleUpdateStatus(invoice, 'cancelled')}
                        className="flex items-center gap-2 px-3 py-1.5 rounded bg-gray-500 hover:bg-gray-600 text-white text-sm transition-colors"
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDelete(invoice.id)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded bg-red-500 hover:bg-red-600 text-white text-sm transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>

                  <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    Created by {invoice.createdBy}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
        </>
      )}

      {/* Quotations Tab Content */}
      {activeTab === 'quotations' && (
        <>
          {/* Header with Create Button */}
          <div className={`p-6 rounded-xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <FileText className="h-6 w-6" />
                Quotation Management
              </h3>
              <button
                onClick={() => setIsCreating(!isCreating)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 transition-opacity"
              >
                {isCreating ? (
                  <>
                    <XCircle className="h-5 w-5" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Create Quotation
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Create Quotation Form */}
          {isCreating && (
            <div className={`p-6 rounded-xl shadow-lg ${
              theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <h4 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Create New Quotation
              </h4>

              <form onSubmit={handleQuotationSubmit} className="space-y-4">
                {/* Customer Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <User className="inline h-4 w-4 mr-1" />
                    Customer *
                  </label>
                  <select
                    value={quotCustomerUniqueId}
                    onChange={(e) => setQuotCustomerUniqueId(e.target.value)}
                    className={`w-full px-3 py-2 rounded border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  >
                    <option value="">Select a customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.uniqueId}>
                        {customer.email} (ID: {customer.uniqueId})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quotation Number */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <Hash className="inline h-4 w-4 mr-1" />
                    Quotation Number *
                  </label>
                  <input
                    type="text"
                    value={quotationNumber}
                    onChange={(e) => setQuotationNumber(e.target.value)}
                    className={`w-full px-3 py-2 rounded border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="QUOT-2024-001"
                    required
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={quotAmount}
                    onChange={(e) => setQuotAmount(e.target.value)}
                    className={`w-full px-3 py-2 rounded border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="1000.00"
                    required
                  />
                </div>

                {/* Issue Date */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    value={quotIssueDate}
                    onChange={(e) => setQuotIssueDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    value={quotExpiryDate}
                    onChange={(e) => setQuotExpiryDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  />
                </div>

                {/* Project (Optional) */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <FileText className="inline h-4 w-4 mr-1" />
                    Linked Project (Optional)
                  </label>
                  <select
                    value={quotProjectId}
                    onChange={(e) => setQuotProjectId(e.target.value)}
                    className={`w-full px-3 py-2 rounded border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">No linked project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <FileText className="inline h-4 w-4 mr-1" />
                    Notes
                  </label>
                  <textarea
                    value={quotNotes}
                    onChange={(e) => setQuotNotes(e.target.value)}
                    className={`w-full px-3 py-2 rounded border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <Upload className="inline h-4 w-4 mr-1" />
                    Upload Quotation File * (PDF, JPG, PNG - Max 10MB)
                  </label>
                  <input
                    id="quotation-file"
                    type="file"
                    onChange={handleQuotationFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className={`w-full px-3 py-2 rounded border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  />
                  {quotationFile && (
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                      Selected: {quotationFile.name}
                    </p>
                  )}
                </div>

                {/* Error Message */}
                {quotUploadError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {quotUploadError}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isQuotUploading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isQuotUploading ? (
                    <>
                      <Clock className="h-5 w-5 animate-spin" />
                      Creating Quotation...
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      Create Quotation
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Quotations List */}
          <div className={`p-6 rounded-xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <h4 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              All Quotations ({quotations.length})
            </h4>

            {quotations.length === 0 ? (
              <div className="text-center py-12">
                <FileText className={`h-16 w-16 mx-auto mb-4 ${
                  theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                }`} />
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  No quotations created yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {quotations.map(quotation => {
                  const customer = customers.find(c => c.uniqueId === quotation.customerUniqueId);
                  
                  return (
                    <div
                      key={quotation.id}
                      className={`p-4 rounded-lg border-2 ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 hover:border-blue-500'
                          : 'bg-gray-50 border-gray-200 hover:border-blue-400'
                      } transition-colors`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h5 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {quotation.quoteNumber}
                            </h5>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              quotation.status === 'Accepted'
                                ? 'bg-green-100 text-green-800'
                                : quotation.status === 'Rejected'
                                ? 'bg-red-100 text-red-800'
                                : quotation.status === 'Sent'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {quotation.status}
                            </span>
                          </div>

                          <div className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            <p className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <strong>Customer:</strong> {customer?.email || quotation.customerEmail}
                            </p>
                            <p className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <strong>Issue Date:</strong> {quotation.quoteDate}
                            </p>
                            <p className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <strong>Expiry Date:</strong> {quotation.expiryDate}
                            </p>
                            {quotation.notes && (
                              <p className="mt-2">
                                <strong>Notes:</strong> {quotation.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          {quotation.quotationFileUrl && (
                            <a
                              href={quotation.quotationFileUrl}
                              download={quotation.quotationFileName}
                              className="flex items-center gap-2 px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteQuotation(quotation.id)}
                            className="flex items-center gap-2 px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors text-sm"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>

                      <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        Created by {quotation.createdBy}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminInvoiceManagement;

