import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { 
  subscribeToInvoices, 
  subscribeToSubscriptions,
  Invoice,
  Subscription
} from '../../services/database';
import { 
  CreditCard, 
  Download, 
  Eye, 
  Calendar, 
  DollarSign, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Plus,
  Filter,
  Search,
  Receipt,
  TrendingUp,
  TrendingDown,
  Banknote,
  Wallet,
  X
} from 'lucide-react';

// Interfaces are now imported from database service

const BillingInvoices: React.FC = () => {
  const { user } = useAppContext();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    dateRange: 'all'
  });

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (!user?.email) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // For now, use email as userId since that's what we have
    const userId = user.email;

    // Set up real-time listeners for billing data
    const unsubscribeInvoices = subscribeToInvoices(userId, (invoicesData) => {
      setInvoices(invoicesData);
    });

    const unsubscribeSubscriptions = subscribeToSubscriptions(userId, (subscriptionsData) => {
      setSubscriptions(subscriptionsData);
      setIsLoading(false);
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeInvoices();
      unsubscribeSubscriptions();
    };
  }, [user?.email]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'text-green-600 bg-green-100';
      case 'Pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'Overdue':
        return 'text-red-600 bg-red-100';
      case 'Draft':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Overdue':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'Draft':
        return <FileText className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'text-green-600 bg-green-100';
      case 'Cancelled':
        return 'text-red-600 bg-red-100';
      case 'Suspended':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = filters.status === 'all' || invoice.status === filters.status;
    const matchesSearch = invoice.number.toLowerCase().includes(filters.search.toLowerCase()) ||
                         invoice.description.toLowerCase().includes(filters.search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidAmount = invoices.filter(inv => inv.status === 'Paid').reduce((sum, invoice) => sum + invoice.amount, 0);
  const pendingAmount = invoices.filter(inv => inv.status === 'Pending').reduce((sum, invoice) => sum + invoice.amount, 0);
  const overdueAmount = invoices.filter(inv => inv.status === 'Overdue').reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Billing & Invoices</h2>
          <p className="text-text-secondary">Manage your invoices, payments, and subscriptions</p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center mt-4 sm:mt-0">
          <Plus size={16} className="mr-2" />
          New Invoice
        </button>
      </div>

      {/* Billing Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-6 rounded-lg border border-neutral">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Invoices</p>
              <p className="text-2xl font-bold text-text-primary">{invoices.length}</p>
            </div>
            <Receipt className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="bg-surface p-6 rounded-lg border border-neutral">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Amount</p>
              <p className="text-2xl font-bold text-text-primary">{formatCurrency(totalAmount)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-surface p-6 rounded-lg border border-neutral">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Paid Amount</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-surface p-6 rounded-lg border border-neutral">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Outstanding</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(pendingAmount + overdueAmount)}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Active Subscriptions */}
      <div className="bg-surface p-6 rounded-lg border border-neutral">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Active Subscriptions</h3>
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading subscriptions...</p>
          </div>
        ) : subscriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscriptions.map((subscription) => (
            <div key={subscription.id} className="bg-background p-4 rounded-lg border border-neutral">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-text-primary">{subscription.name}</h4>
                  <p className="text-sm text-text-secondary">{subscription.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${getSubscriptionStatusColor(subscription.status)}`}>
                  {subscription.status}
                </span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-2xl font-bold text-text-primary">{formatCurrency(subscription.price)}</p>
                  <p className="text-sm text-text-secondary">/{subscription.billingCycle}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text-secondary">Next billing</p>
                  <p className="text-sm text-text-primary">{formatDate(subscription.nextBilling)}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {subscription.features.map((feature, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-neutral-light text-text-secondary">
                    {feature}
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <button className="flex-1 bg-primary text-white px-3 py-2 rounded text-sm hover:opacity-90 transition-opacity">
                  Manage
                </button>
                <button className="px-3 py-2 border border-neutral rounded text-sm text-text-secondary hover:text-text-primary transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-neutral-light rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-text-secondary" />
            </div>
            <p className="text-text-secondary">No active subscriptions</p>
            <p className="text-sm text-text-secondary mt-1">Your subscription information will appear here</p>
          </div>
        )}
      </div>

      {/* Invoice Filters */}
      <div className="bg-surface p-4 rounded-lg border border-neutral">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
              />
            </div>
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
          >
            <option value="all">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-surface rounded-lg border border-neutral overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading invoices...</p>
          </div>
        ) : filteredInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-light">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Invoice</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral">
                {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-background">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-text-primary">{invoice.number}</div>
                      <div className="text-sm text-text-secondary max-w-xs truncate">{invoice.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                    {formatDate(invoice.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(invoice.status)}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="text-primary hover:text-secondary transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="text-primary hover:text-secondary transition-colors"
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                      {invoice.status === 'Pending' && (
                        <button
                          onClick={() => setShowPaymentModal(true)}
                          className="text-green-600 hover:text-green-700 transition-colors"
                          title="Pay Now"
                        >
                          <CreditCard size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-neutral-light rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-text-secondary" />
            </div>
            <p className="text-text-secondary">No invoices found</p>
            <p className="text-sm text-text-secondary mt-1">Your invoice history will appear here</p>
          </div>
        )}
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-text-primary">{selectedInvoice.number}</h3>
                  <p className="text-text-secondary">{selectedInvoice.description}</p>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Invoice Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="font-medium text-text-primary mb-2">Invoice Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-text-secondary">Date:</span> {formatDate(selectedInvoice.date)}</p>
                    <p><span className="text-text-secondary">Due Date:</span> {formatDate(selectedInvoice.dueDate)}</p>
                    <p><span className="text-text-secondary">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedInvoice.status)}`}>
                        {selectedInvoice.status}
                      </span>
                    </p>
                    {selectedInvoice.paymentMethod && (
                      <p><span className="text-text-secondary">Payment Method:</span> {selectedInvoice.paymentMethod}</p>
                    )}
                    {selectedInvoice.paidDate && (
                      <p><span className="text-text-secondary">Paid Date:</span> {formatDate(selectedInvoice.paidDate)}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary mb-2">Amount Due</h4>
                  <div className="text-3xl font-bold text-text-primary">{formatCurrency(selectedInvoice.amount)}</div>
                </div>
              </div>

              {/* Invoice Items */}
              <div className="mb-8">
                <h4 className="font-medium text-text-primary mb-4">Invoice Items</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-light">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-text-secondary">Description</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-text-secondary">Quantity</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-text-secondary">Unit Price</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-text-secondary">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral">
                      {selectedInvoice.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 text-sm text-text-primary">{item.description}</td>
                          <td className="px-4 py-2 text-sm text-text-primary">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm text-text-primary">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-4 py-2 text-sm font-medium text-text-primary">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-neutral-light">
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-right text-sm font-medium text-text-secondary">Total</td>
                        <td className="px-4 py-2 text-sm font-bold text-text-primary">{formatCurrency(selectedInvoice.amount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity flex items-center">
                  <Download size={16} className="mr-2" />
                  Download PDF
                </button>
                {selectedInvoice.status === 'Pending' && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center"
                  >
                    <CreditCard size={16} className="mr-2" />
                    Pay Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingInvoices;
