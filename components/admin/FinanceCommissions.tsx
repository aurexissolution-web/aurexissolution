import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useTheme } from '../../hooks/useTheme';
import { 
  DollarSign, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  Download,
  Eye,
  X
} from 'lucide-react';
import { db } from '../../firebase/config';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { notifyFreelancerPaymentReceived } from '../../services/notificationService';

const FinanceCommissions: React.FC = () => {
  const { commissions, tasks } = useAppContext();
  const { theme } = useTheme();
  const [selectedCommission, setSelectedCommission] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState<{fileName: string, fileUrl: string, fileSize: number} | null>(null);
  const [financeNotes, setFinanceNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Helper function to get task progress
  const getTaskProgress = (taskId: string): number => {
    const task = tasks.find(t => t.id === taskId);
    return task?.progress || 100;
  };

  // Filter commissions
  const pendingCommissions = commissions.filter(c => c.status === 'pending' || c.status === 'processing');
  const paidCommissions = commissions.filter(c => c.status === 'paid');
  const rejectedCommissions = commissions.filter(c => c.status === 'rejected');

  // Calculate totals
  const totalPending = pendingCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);
  const totalPaid = paidCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPaymentReceipt({
        fileName: file.name,
        fileUrl: reader.result as string,
        fileSize: file.size
      });
    };
    reader.readAsDataURL(file);
  };

  const handleProcessPayment = async (action: 'approve' | 'reject') => {
    if (!selectedCommission) return;

    if (action === 'approve' && !paymentReceipt) {
      alert('Please upload a payment receipt before approving.');
      return;
    }

    setIsProcessing(true);
    try {
      const commissionRef = doc(db, 'commissions', selectedCommission.id);
      
      if (action === 'approve') {
        // Store receipt URL for notification
        const receiptUrl = paymentReceipt?.fileUrl || '';
        
        await updateDoc(commissionRef, {
          status: 'paid',
          paymentDate: serverTimestamp(),
          paymentReceipt: paymentReceipt ? {
            ...paymentReceipt,
            uploadedAt: serverTimestamp()
          } : null,
          financeNotes: financeNotes,
          processedBy: 'Finance Team',
          updatedAt: serverTimestamp()
        });
        
        // Get freelancer's unique ID from users collection
        const usersRef = doc(db, 'users', selectedCommission.freelancerId || selectedCommission.freelancerEmail);
        const userDoc = await getDoc(usersRef);
        const freelancerUniqueId = userDoc.exists() ? userDoc.data().uniqueId || selectedCommission.freelancerEmail : selectedCommission.freelancerEmail;
        
        // Notify freelancer
        await notifyFreelancerPaymentReceived(
          selectedCommission.freelancerEmail,
          freelancerUniqueId,
          selectedCommission.taskTitle,
          selectedCommission.commissionAmount,
          receiptUrl
        );
        
        alert('✅ Payment approved and freelancer notified!');
      } else {
        await updateDoc(commissionRef, {
          status: 'rejected',
          financeNotes: financeNotes,
          processedBy: 'Finance Team',
          updatedAt: serverTimestamp()
        });
        alert('❌ Commission rejected');
      }

      setShowModal(false);
      setSelectedCommission(null);
      setPaymentReceipt(null);
      setFinanceNotes('');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const viewCommission = (commission: any) => {
    setSelectedCommission(commission);
    setShowModal(true);
    setFinanceNotes(commission.financeNotes || '');
  };

  return (
    <div className={`min-h-screen p-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            💰 Freelancer Commission Management
          </h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Process freelancer commission payments and track payment history
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`p-6 rounded-xl border-2 ${
            theme === 'dark' 
              ? 'bg-orange-900/20 border-orange-700' 
              : 'bg-orange-50 border-orange-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-orange-300' : 'text-orange-700'
                }`}>
                  Pending Payments
                </p>
                <p className={`text-3xl font-bold mt-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  RM {totalPending.toFixed(2)}
                </p>
                <p className={`text-sm mt-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {pendingCommissions.length} commissions
                </p>
              </div>
              <Clock className={`h-12 w-12 ${
                theme === 'dark' ? 'text-orange-400' : 'text-orange-500'
              }`} />
            </div>
          </div>

          <div className={`p-6 rounded-xl border-2 ${
            theme === 'dark' 
              ? 'bg-green-900/20 border-green-700' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-green-300' : 'text-green-700'
                }`}>
                  Total Paid
                </p>
                <p className={`text-3xl font-bold mt-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  RM {totalPaid.toFixed(2)}
                </p>
                <p className={`text-sm mt-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {paidCommissions.length} payments
                </p>
              </div>
              <CheckCircle className={`h-12 w-12 ${
                theme === 'dark' ? 'text-green-400' : 'text-green-500'
              }`} />
            </div>
          </div>

          <div className={`p-6 rounded-xl border-2 ${
            theme === 'dark' 
              ? 'bg-red-900/20 border-red-700' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-red-300' : 'text-red-700'
                }`}>
                  Rejected
                </p>
                <p className={`text-3xl font-bold mt-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {rejectedCommissions.length}
                </p>
                <p className={`text-sm mt-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  commissions
                </p>
              </div>
              <XCircle className={`h-12 w-12 ${
                theme === 'dark' ? 'text-red-400' : 'text-red-500'
              }`} />
            </div>
          </div>
        </div>

        {/* Pending Commissions */}
        <div className={`rounded-xl border-2 p-6 mb-6 ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            ⏳ Pending Commissions
          </h2>

          {pendingCommissions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className={`h-16 w-16 mx-auto mb-4 ${
                theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                No pending commissions to process
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Freelancer
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Task
                    </th>
                    <th className={`px-4 py-3 text-center text-xs font-semibold uppercase ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Progress
                    </th>
                    <th className={`px-4 py-3 text-right text-xs font-semibold uppercase ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Amount
                    </th>
                    <th className={`px-4 py-3 text-center text-xs font-semibold uppercase ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Completed
                    </th>
                    <th className={`px-4 py-3 text-center text-xs font-semibold uppercase ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
                }`}>
                  {pendingCommissions.map((commission) => (
                    <tr key={commission.id} className={
                      theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                    }>
                      <td className={`px-4 py-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <div>
                          <p className="font-medium">{commission.freelancerName || commission.freelancerEmail}</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {commission.freelancerEmail}
                          </p>
                        </div>
                      </td>
                      <td className={`px-4 py-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {commission.taskTitle}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{ width: `${getTaskProgress(commission.taskId)}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {getTaskProgress(commission.taskId)}%
                          </span>
                        </div>
                      </td>
                      <td className={`px-4 py-4 text-right font-bold text-green-500`}>
                        RM {commission.commissionAmount.toFixed(2)}
                      </td>
                      <td className={`px-4 py-4 text-center text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {commission.completedDate ? new Date(commission.completedDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => viewCommission(commission)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            theme === 'dark'
                              ? 'bg-purple-600 hover:bg-purple-700 text-white'
                              : 'bg-purple-500 hover:bg-purple-600 text-white'
                          }`}
                        >
                          Process Payment
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment History */}
        <div className={`rounded-xl border-2 p-6 ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            ✅ Payment History
          </h2>

          {paidCommissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className={`h-16 w-16 mx-auto mb-4 ${
                theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                No payment history yet
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Freelancer
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Task
                    </th>
                    <th className={`px-4 py-3 text-right text-xs font-semibold uppercase ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Amount
                    </th>
                    <th className={`px-4 py-3 text-center text-xs font-semibold uppercase ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Paid Date
                    </th>
                    <th className={`px-4 py-3 text-center text-xs font-semibold uppercase ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
                }`}>
                  {paidCommissions.map((commission) => (
                    <tr key={commission.id} className={
                      theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                    }>
                      <td className={`px-4 py-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <div>
                          <p className="font-medium">{commission.freelancerName || commission.freelancerEmail}</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {commission.freelancerEmail}
                          </p>
                        </div>
                      </td>
                      <td className={`px-4 py-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {commission.taskTitle}
                      </td>
                      <td className={`px-4 py-4 text-right font-bold text-green-500`}>
                        RM {commission.commissionAmount.toFixed(2)}
                      </td>
                      <td className={`px-4 py-4 text-center text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {commission.paymentDate ? new Date(commission.paymentDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => viewCommission(commission)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            theme === 'dark'
                              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          }`}
                        >
                          <Eye className="h-4 w-4 inline mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Process Payment Modal */}
      {showModal && selectedCommission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-6 border-b ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {selectedCommission.status === 'paid' ? 'Payment Details' : 'Process Commission Payment'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedCommission(null);
                  setPaymentReceipt(null);
                  setFinanceNotes('');
                }}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Commission Details */}
              <div className={`p-4 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <h4 className={`font-semibold mb-3 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Commission Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Freelancer
                    </p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedCommission.freelancerName || selectedCommission.freelancerEmail}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Task
                    </p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedCommission.taskTitle}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Task Budget
                    </p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      RM {(selectedCommission.taskBudget || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Commission Rate
                    </p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedCommission.commissionRate || '-'}%
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Commission Amount
                    </p>
                    <p className="font-bold text-green-500 text-lg">
                      RM {selectedCommission.commissionAmount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Completed Date
                    </p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedCommission.completedDate 
                        ? new Date(selectedCommission.completedDate).toLocaleDateString() 
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {selectedCommission.status !== 'paid' && (
                <>
                  {/* Upload Payment Receipt */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Upload Payment Receipt *
                    </label>
                    <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      theme === 'dark'
                        ? 'border-gray-600 hover:border-purple-500 bg-gray-700/30'
                        : 'border-gray-300 hover:border-purple-400 bg-gray-50'
                    }`}>
                      <Upload className={`h-10 w-10 mx-auto mb-3 ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                      <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Upload payment receipt (bank transfer, screenshot, etc.)
                      </p>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="receipt-upload"
                      />
                      <label
                        htmlFor="receipt-upload"
                        className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer transition-colors text-sm font-medium"
                      >
                        Choose File
                      </label>
                      {paymentReceipt && (
                        <div className={`mt-3 p-3 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                        }`}>
                          <p className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-green-400' : 'text-green-600'
                          }`}>
                            ✅ {paymentReceipt.fileName}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Finance Notes */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Notes (Optional)
                    </label>
                    <textarea
                      value={financeNotes}
                      onChange={(e) => setFinanceNotes(e.target.value)}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                      placeholder="Add any notes about this payment..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleProcessPayment('approve')}
                      disabled={isProcessing}
                      className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="h-5 w-5" />
                      {isProcessing ? 'Processing...' : 'Approve & Mark as Paid'}
                    </button>
                    <button
                      onClick={() => handleProcessPayment('reject')}
                      disabled={isProcessing}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <XCircle className="h-5 w-5" />
                      Reject
                    </button>
                  </div>
                </>
              )}

              {selectedCommission.status === 'paid' && selectedCommission.paymentReceipt && (
                <div className={`p-4 rounded-lg border ${
                  theme === 'dark' ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
                }`}>
                  <h4 className={`font-semibold mb-2 ${
                    theme === 'dark' ? 'text-green-300' : 'text-green-700'
                  }`}>
                    ✅ Payment Completed
                  </h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Payment Date: {selectedCommission.paymentDate 
                      ? new Date(selectedCommission.paymentDate).toLocaleDateString() 
                      : '-'}
                  </p>
                  {selectedCommission.financeNotes && (
                    <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Notes: {selectedCommission.financeNotes}
                    </p>
                  )}
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = selectedCommission.paymentReceipt.fileUrl;
                      link.download = selectedCommission.paymentReceipt.fileName;
                      link.click();
                    }}
                    className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium inline-flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Receipt
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceCommissions;

