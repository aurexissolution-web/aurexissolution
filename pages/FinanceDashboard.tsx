import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { useTheme } from '../hooks/useTheme';
import {
  DollarSign,
  TrendingUp,
  FileText,
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Download,
  Filter,
  LogOut,
  Home,
  Sun,
  Moon,
  CreditCard,
  PieChart,
  BarChart3,
  TrendingDown,
  Wallet,
  Receipt
} from 'lucide-react';
import FinanceCommissions from '../components/admin/FinanceCommissions';
import NotificationBell from '../components/admin/NotificationBell';

const FinanceDashboard: React.FC = () => {
  const { user, paymentReceipts, paymentInvoices, invoices, projects, financialMetrics, attendanceRecords, logout , isLoggingOut } = useAppContext();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'receipts' | 'invoices' | 'commissions' | 'analytics' | 'attendance'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  // Get current period metrics
  const currentMetrics = useMemo(() => 
    financialMetrics.find(m => m.period === selectedPeriod) || financialMetrics[0],
    [financialMetrics, selectedPeriod]
  );

  // Filter payment receipts by status
  const pendingReceipts = useMemo(() => 
    paymentReceipts.filter(r => r.status === 'pending'), 
    [paymentReceipts]
  );

  const verifiedReceipts = useMemo(() => 
    paymentReceipts.filter(r => r.status === 'verified'), 
    [paymentReceipts]
  );

  // Calculate totals
  const totalPending = useMemo(() => 
    pendingReceipts.reduce((sum, r) => sum + (r.amount || 0), 0),
    [pendingReceipts]
  );

  const totalVerified = useMemo(() => 
    verifiedReceipts.reduce((sum, r) => sum + (r.amount || 0), 0),
    [verifiedReceipts]
  );

  const totalInvoices = useMemo(() =>
    invoices.reduce((sum, inv) => sum + (inv.items?.reduce((s, i) => s + ((i.quantity || 0) * (i.price || 0)), 0) || 0), 0),
    [invoices]
  );

  // Filter user's attendance
  const myAttendance = useMemo(() => 
    attendanceRecords.filter(a => a.employeeId === user?.id || a.employeeEmail === user?.email),
    [attendanceRecords, user]
  );

  // Attendance statistics
  const attendanceStats = useMemo(() => ({
    present: myAttendance.filter(a => a.status === 'present').length,
    late: myAttendance.filter(a => a.status === 'late').length,
    onLeave: myAttendance.filter(a => a.status === 'on-leave').length,
    totalDays: myAttendance.length,
    totalHours: myAttendance.reduce((sum, a) => sum + (a.hoursWorked || 0), 0)
  }), [myAttendance]);

  const handleLogout = () => {
    console.log('🟡 LOGOUT BUTTON CLICKED in Finance Dashboard');
    logout();
    console.log('🟡 logout() function called in Finance Dashboard');
    // Note: logout() already handles navigation to homepage
  };




  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      verified: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return `RM ${amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <aside className={`w-64 border-r flex flex-col ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="p-6">
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Finance Dashboard
            </h1>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {user?.email}
            </p>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              Finance Executive
          </p>
        </div>

          {/* Navigation */}
          <nav className="px-4 space-y-2 flex-1 overflow-y-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors w-full ${
                activeTab === 'overview'
                  ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('receipts')}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors w-full ${
                activeTab === 'receipts'
                  ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <CreditCard className="h-5 w-5" />
              <span>Payment Receipts</span>
              {pendingReceipts.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingReceipts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('invoices')}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors w-full ${
                activeTab === 'invoices'
                  ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FileText className="h-5 w-5" />
              <span>Invoices</span>
            </button>

            <button
              onClick={() => setActiveTab('commissions')}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors w-full ${
                activeTab === 'commissions'
                  ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Wallet className="h-5 w-5" />
              <span>Commissions</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors w-full ${
                activeTab === 'analytics'
                  ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <PieChart className="h-5 w-5" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors w-full ${
                activeTab === 'attendance'
                  ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Clock className="h-5 w-5" />
              <span>Attendance</span>
            </button>
          </nav>

          {/* Bottom Actions */}
          <div className={`p-4 space-y-2 border-t mt-auto ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              onClick={toggleTheme}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors w-full ${
                theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span>Toggle Theme</span>
            </button>

            <Link
              to="/"
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors w-full ${
                theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>

            <button
              onClick={handleLogout}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors w-full ${
                theme === 'dark' ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-red-50'
              }`}
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 p-8 overflow-y-auto ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {/* Notification Bell - Top Right */}
          <div className="flex justify-end mb-4">
            <NotificationBell />
          </div>

          {activeTab === 'overview' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Financial Overview
                </h2>
                {currentMetrics && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedPeriod('month')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        selectedPeriod === 'month'
                          ? 'bg-blue-600 text-white'
                          : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Month
                    </button>
                    <button
                      onClick={() => setSelectedPeriod('quarter')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        selectedPeriod === 'quarter'
                          ? 'bg-blue-600 text-white'
                          : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Quarter
                    </button>
          <button
                      onClick={() => setSelectedPeriod('year')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        selectedPeriod === 'year'
                          ? 'bg-blue-600 text-white'
                          : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Year
          </button>
        </div>
                )}
      </div>

              {currentMetrics && (
                <>
                  {/* Primary Financial Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className={`p-6 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Total Revenue
                          </p>
                          <p className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(currentMetrics.totalRevenue)}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            {currentMetrics.periodLabel}
                          </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                          <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
            </div>
          </div>

                    <div className={`p-6 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Total Expenses
                          </p>
                          <p className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(currentMetrics.totalExpenses)}
                          </p>
                          <p className="text-xs text-red-600 mt-1">
                            {currentMetrics.periodLabel}
          </p>
        </div>
                        <div className="p-3 bg-red-100 rounded-full">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
                      </div>
          </div>

                    <div className={`p-6 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Net Profit
                          </p>
                          <p className={`text-2xl font-bold mt-2 text-green-600`}>
                            {formatCurrency(currentMetrics.netProfit)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {((currentMetrics.netProfit / currentMetrics.totalRevenue) * 100).toFixed(1)}% margin
                          </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                          <DollarSign className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
        </div>

                    <div className={`p-6 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Cash Flow Balance
                          </p>
                          <p className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(currentMetrics.cashFlowBalance)}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Available funds
                          </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                          <Wallet className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
            </div>
          </div>

                  {/* Receivables & Payables */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className={`p-6 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Outstanding Receivables
          </h3>
                      <p className={`text-3xl font-bold text-yellow-600`}>
                        {formatCurrency(currentMetrics.outstandingReceivables)}
                      </p>
                      <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Amount to be collected from customers
                      </p>
                    </div>

                    <div className={`p-6 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Outstanding Payables
                      </h3>
                      <p className={`text-3xl font-bold text-orange-600`}>
                        {formatCurrency(currentMetrics.outstandingPayables)}
                      </p>
                      <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Bills due to vendors/suppliers
          </p>
        </div>
      </div>

                  {/* Expense Breakdown */}
                  <div className={`p-6 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Expense Breakdown
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Operating Expenses
                        </p>
                        <p className={`text-xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(currentMetrics.operatingExpenses)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {((currentMetrics.operatingExpenses / currentMetrics.totalExpenses) * 100).toFixed(1)}% of total
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Salaries
                        </p>
                        <p className={`text-xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(currentMetrics.salariesExpenses)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {((currentMetrics.salariesExpenses / currentMetrics.totalExpenses) * 100).toFixed(1)}% of total
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Marketing
                        </p>
                        <p className={`text-xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(currentMetrics.marketingExpenses)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {((currentMetrics.marketingExpenses / currentMetrics.totalExpenses) * 100).toFixed(1)}% of total
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'receipts' && (
            <div>
              <h2 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Payment Receipts ({paymentReceipts.length})
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {paymentReceipts.map((receipt) => (
                  <div key={receipt.id} className={`p-6 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {receipt.customerEmail}
                          </h4>
                          {getStatusBadge(receipt.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Amount</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(receipt.amount || 0)}
                            </p>
                          </div>
                          <div>
                            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Payment Method</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {receipt.paymentMethod}
                            </p>
                          </div>
                          <div>
                            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Transaction ID</p>
                            <p className={`font-medium font-mono text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {receipt.transactionId || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Date</p>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {receipt.paymentDate}
              </p>
            </div>
          </div>
        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div>
              <h2 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Invoices ({invoices.length})
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className={`p-6 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {invoice.invoiceNumber}
                        </h4>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {invoice.customerName}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        invoice.status === 'Paid'
                          ? 'bg-green-100 text-green-800'
                          : invoice.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                      <div>
                        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Invoice Date</p>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {invoice.invoiceDate}
                        </p>
                      </div>
                      <div>
                        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Due Date</p>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {invoice.dueDate}
                        </p>
                      </div>
                      <div>
                        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Total Amount</p>
                        <p className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(invoice.items?.reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0) || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        {invoice.items?.length || 0} item(s) • Credit Term: {invoice.creditTerm}
              </p>
            </div>
          </div>
                ))}
        </div>
            </div>
          )}

          {activeTab === 'commissions' && (
            <FinanceCommissions />
          )}

          {activeTab === 'analytics' && (
            <div>
              <h2 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Financial Analytics
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {financialMetrics.map((metric) => (
                  <div key={metric.id} className={`p-6 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {metric.periodLabel}
              </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Revenue</span>
                        <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(metric.totalRevenue)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Expenses</span>
                        <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(metric.totalExpenses)}
                        </span>
            </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Net Profit</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(metric.netProfit)}
                        </span>
          </div>
        </div>
      </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
              <div>
              <h2 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                My Attendance Summary
              </h2>

              {/* Attendance Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className={`p-6 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Days Present</p>
                  <p className={`text-3xl font-bold mt-2 text-green-600`}>
                    {attendanceStats.present}
                  </p>
                </div>

                <div className={`p-6 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Days Late</p>
                  <p className={`text-3xl font-bold mt-2 text-yellow-600`}>
                    {attendanceStats.late}
                  </p>
          </div>

                <div className={`p-6 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>On Leave</p>
                  <p className={`text-3xl font-bold mt-2 text-blue-600`}>
                    {attendanceStats.onLeave}
                  </p>
                </div>

                <div className={`p-6 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Hours</p>
                  <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {attendanceStats.totalHours.toFixed(1)}h
                  </p>
                </div>
              </div>

              {/* Attendance Records */}
              <div className={`p-6 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Clock In/Out Records
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Date</th>
                        <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Clock In</th>
                        <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Clock Out</th>
                        <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Hours</th>
                        <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myAttendance.map((record) => (
                        <tr key={record.id} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                          <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {record.date}
                          </td>
                          <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {record.clockIn || '-'}
                          </td>
                          <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {record.clockOut || '-'}
                          </td>
                          <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {record.hoursWorked ? `${record.hoursWorked.toFixed(2)}h` : '-'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              record.status === 'present' ? 'bg-green-100 text-green-800' :
                              record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                              record.status === 'on-leave' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {myAttendance.length === 0 && (
                    <div className="text-center py-12">
                      <Clock className={`h-12 w-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        No attendance records yet
                      </p>
                    </div>
                  )}
            </div>
          </div>
        </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FinanceDashboard;
