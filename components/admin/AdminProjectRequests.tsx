import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import type { ProjectRequest, Project } from '../../types';
import { CheckCircle, XCircle, AlertCircle, Clock, Eye, X, UserCheck, FileText, Paperclip, Download, TrendingUp, List } from 'lucide-react';
import { serverTimestamp } from 'firebase/firestore';
import { formatFileSize } from '../../services/fileUploadService';
import { notifyProjectRequestStatusChange, notifyTeamLeadProjectAssigned } from '../../services/notificationService';
import AdminProjectRequestAnalytics from './AdminProjectRequestAnalytics';

const AdminProjectRequests: React.FC = () => {
  const { projectRequests, users, updateProjectRequest, createProject, deleteProjectRequest } = useAppContext();
  const [viewMode, setViewMode] = useState<'list' | 'analytics'>('list');
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectRequest['status']>('all');
  const [selectedRequest, setSelectedRequest] = useState<ProjectRequest | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'need-more-info'>('approve');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Approval form data
  const [approvalData, setApprovalData] = useState({
    assignToTeamLead: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    actualBudget: 0,
    additionalNotes: ''
  });

  // Filter requests
  const filteredRequests = useMemo(() => {
    return (Array.isArray(projectRequests) ? projectRequests : []).filter(req => {
      if (statusFilter === 'all') return true;
      return req.status === statusFilter;
    });
  }, [projectRequests, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const all = Array.isArray(projectRequests) ? projectRequests : [];
    return {
      total: all.length,
      pending: all.filter(r => r.status === 'pending').length,
      approved: all.filter(r => r.status === 'approved').length,
      rejected: all.filter(r => r.status === 'rejected').length,
      needInfo: all.filter(r => r.status === 'need-more-info').length
    };
  }, [projectRequests]);

  // Get team leads
  const teamLeads = useMemo(() => {
    return (Array.isArray(users) ? users : []).filter(
      u => u.role === 'team_lead' && u.isActive
    );
  }, [users]);

  const handleReview = (request: ProjectRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.adminNotes || '');
    setRejectionReason(request.rejectionReason || '');
    setShowReviewModal(true);
  };

  const handleApprove = (request: ProjectRequest) => {
    setSelectedRequest(request);
    setAdminNotes('');
    setApprovalData({
      assignToTeamLead: '',
      priority: 'medium',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      actualBudget: 0,
      additionalNotes: ''
    });
    setShowApproveModal(true);
  };

  const handleDelete = async (request: ProjectRequest) => {
    const confirmMessage = `⚠️ Are you sure you want to delete this project request?\n\nProject: "${request.title}"\nCustomer: ${request.customerName}\nStatus: ${request.status}\n\nThis action cannot be undone.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await deleteProjectRequest(request.id);
      alert('✅ Project request deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting request:', error);
      alert(`❌ Failed to delete request: ${error.message}`);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedRequest) return;

    try {
      const updates: Partial<ProjectRequest> = {
        ...selectedRequest,
        status: reviewAction,
        adminNotes,
        reviewedAt: serverTimestamp(),
        reviewedBy: 'admin' // TODO: Add actual admin email
      };

      if (reviewAction === 'rejected') {
        updates.rejectionReason = rejectionReason;
      }

      await updateProjectRequest(updates as ProjectRequest);

      // Send notification to customer
      try {
        await notifyProjectRequestStatusChange(
          selectedRequest.customerEmail,
          selectedRequest.customerUniqueId,
          reviewAction as 'rejected' | 'need-more-info',
          selectedRequest.title,
          adminNotes,
          rejectionReason
        );
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
      }

      alert(`✅ Request ${reviewAction}d successfully! Customer has been notified.`);
      setShowReviewModal(false);
      setSelectedRequest(null);
    } catch (error: any) {
      console.error('Error updating request:', error);
      alert(`❌ Failed to update request: ${error.message}`);
    }
  };

  const handleSubmitApproval = async () => {
    if (!selectedRequest) return;

    if (!approvalData.assignToTeamLead) {
      alert('❌ Please select a team lead to assign the project');
      return;
    }

    try {
      // Get selected team lead info
      const teamLead = users.find(u => u.uniqueId === approvalData.assignToTeamLead);
      
      if (!teamLead) {
        alert('❌ Selected team lead not found');
        return;
      }

      // Create actual project from request
      const newProject: Omit<Project, 'id' | 'createdAt'> = {
        title: selectedRequest.title,
        description: selectedRequest.description + '\n\n' + selectedRequest.requirements,
        status: 'pending',
        priority: approvalData.priority,
        dueDate: approvalData.dueDate,
        assignedTo: approvalData.assignToTeamLead,
        assignedType: 'employee',
        budget: approvalData.actualBudget,
        notes: `Original Request from: ${selectedRequest.customerName}\nBudget Range: ${selectedRequest.budgetRange}\nDesired Timeline: ${selectedRequest.desiredTimeline}\n\n${approvalData.additionalNotes}`,
        createdBy: 'admin', // TODO: Add actual admin email
        
        // Link to customer who requested this project
        customerUniqueId: selectedRequest.customerUniqueId,
        customerName: selectedRequest.customerName,
        customerEmail: selectedRequest.customerEmail,
        
        // Copy attachments from request so team lead can see them
        attachments: selectedRequest.attachments || []
      };

      // Create the project
      await createProject(newProject);

      // Update request status to approved
      await updateProjectRequest({
        ...selectedRequest,
        status: 'approved',
        adminNotes: adminNotes || `Approved and assigned to ${teamLead.email}`,
        reviewedAt: serverTimestamp(),
        reviewedBy: 'admin',
        assignedToTeamLead: teamLead.email,
        assignedTeamLeadName: teamLead.name || teamLead.email
      });

      // Send notifications
      try {
        // Notify customer
        await notifyProjectRequestStatusChange(
          selectedRequest.customerEmail,
          selectedRequest.customerUniqueId,
          'approved',
          selectedRequest.title,
          adminNotes || `Your project has been approved and assigned to ${teamLead.name || teamLead.email}`,
          undefined,
          teamLead.name || teamLead.email
        );

        // Notify team lead
        await notifyTeamLeadProjectAssigned(
          teamLead.email,
          teamLead.uniqueId,
          selectedRequest.title,
          selectedRequest.customerName,
          'new-project-id' // Project ID will be generated by createProject
        );
      } catch (notifError) {
        console.error('Failed to send notifications:', notifError);
      }

      alert('✅ Project approved and created successfully! Customer and team lead have been notified.');
      setShowApproveModal(false);
      setSelectedRequest(null);
    } catch (error: any) {
      console.error('Error approving request:', error);
      alert(`❌ Failed to approve request: ${error.message}`);
    }
  };

  const getStatusColor = (status: ProjectRequest['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'need-more-info': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleDateString('en-GB');
      }
      return new Date(timestamp).toLocaleDateString('en-GB');
    } catch {
      return 'N/A';
    }
  };

  // If analytics view is selected, show analytics component
  if (viewMode === 'analytics') {
    return (
      <div className="p-6 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className="px-4 py-2 bg-neutral text-text-secondary rounded-lg hover:bg-neutral/60 transition-colors flex items-center gap-2"
            >
              <List size={16} />
              Requests List
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2"
            >
              <TrendingUp size={16} />
              Analytics
            </button>
          </div>
          <AdminProjectRequestAnalytics />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with View Toggle */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-text-primary flex items-center gap-2">
              <FileText size={32} />
              Customer Project Requests
            </h1>
            <p className="text-text-secondary mt-1">Review and approve customer project submissions</p>
          </div>
          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2"
            >
              <List size={16} />
              Requests List
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className="px-4 py-2 bg-neutral text-text-secondary rounded-lg hover:bg-neutral/60 transition-colors flex items-center gap-2"
            >
              <TrendingUp size={16} />
              Analytics
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-surface p-4 rounded-lg border border-neutral">
            <div className="text-sm text-text-secondary">Total Requests</div>
            <div className="text-2xl font-bold text-text-primary">{stats.total}</div>
          </div>
          <div className="bg-surface p-4 rounded-lg border border-neutral">
            <div className="text-sm text-text-secondary">Pending Review</div>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </div>
          <div className="bg-surface p-4 rounded-lg border border-neutral">
            <div className="text-sm text-text-secondary">Need More Info</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.needInfo}</div>
          </div>
          <div className="bg-surface p-4 rounded-lg border border-neutral">
            <div className="text-sm text-text-secondary">Approved</div>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </div>
          <div className="bg-surface p-4 rounded-lg border border-neutral">
            <div className="text-sm text-text-secondary">Rejected</div>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-surface p-4 rounded-lg border border-neutral">
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-neutral text-text-secondary hover:bg-neutral/60'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-orange-500 text-white'
                  : 'bg-neutral text-text-secondary hover:bg-neutral/60'
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setStatusFilter('need-more-info')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === 'need-more-info'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-neutral text-text-secondary hover:bg-neutral/60'
              }`}
            >
              Need Info ({stats.needInfo})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === 'approved'
                  ? 'bg-green-500 text-white'
                  : 'bg-neutral text-text-secondary hover:bg-neutral/60'
              }`}
            >
              Approved ({stats.approved})
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === 'rejected'
                  ? 'bg-red-500 text-white'
                  : 'bg-neutral text-text-secondary hover:bg-neutral/60'
              }`}
            >
              Rejected ({stats.rejected})
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-surface rounded-lg border border-neutral">
          <div className="divide-y divide-neutral">
            {filteredRequests.length === 0 ? (
              <div className="p-12 text-center text-text-secondary">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No {statusFilter !== 'all' ? statusFilter : ''} requests found</p>
              </div>
            ) : (
              filteredRequests.map((request) => (
                <div key={request.id} className="p-6 hover:bg-neutral/5 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-text-primary">{request.title}</h3>
                      <div className="flex items-center gap-3 mt-2 text-sm text-text-secondary">
                        <span>👤 {request.customerName}</span>
                        <span>•</span>
                        <span>📧 {request.customerEmail}</span>
                        <span>•</span>
                        <span>🏷️ {request.category}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                      {request.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>

                  <p className="text-text-primary mb-3">{request.description}</p>

                  {request.requirements && (
                    <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <div className="text-xs font-medium text-blue-900 dark:text-blue-200 mb-1">Requirements:</div>
                      <div className="text-sm text-blue-800 dark:text-blue-300">{request.requirements}</div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-text-secondary mb-4">
                    <div>
                      <span className="font-medium">Budget:</span> {request.budgetRange}
                    </div>
                    <div>
                      <span className="font-medium">Timeline:</span> {request.desiredTimeline}
                    </div>
                    <div>
                      <span className="font-medium">Submitted:</span> {formatDate(request.submittedAt)}
                    </div>
                    {request.reviewedAt && (
                      <div>
                        <span className="font-medium">Reviewed:</span> {formatDate(request.reviewedAt)}
                      </div>
                    )}
                  </div>

                  {/* Attachments */}
                  {request.attachments && request.attachments.length > 0 && (
                    <div className="mb-3 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded">
                      <div className="text-xs font-medium text-purple-900 dark:text-purple-200 mb-2 flex items-center gap-1">
                        <Paperclip className="h-3 w-3" />
                        Customer Attachments ({request.attachments.length})
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {request.attachments.map((fileUrl, idx) => (
                          <a
                            key={idx}
                            href={fileUrl}
                            download={`${request.customerName}_attachment_${idx + 1}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors"
                          >
                            <Download className="h-3 w-3" />
                            Download File {idx + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {request.adminNotes && (
                    <div className="mb-3 p-3 bg-gray-100 dark:bg-gray-800 rounded">
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Notes:</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{request.adminNotes}</div>
                    </div>
                  )}

                  {request.status === 'approved' && request.assignedTeamLeadName && (
                    <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 rounded">
                      <div className="text-sm text-green-800 dark:text-green-300">
                        ✅ Assigned to: <strong>{request.assignedTeamLeadName}</strong>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(request)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <CheckCircle size={16} />
                          Approve & Assign
                        </button>
                        <button
                          onClick={() => {
                            handleReview(request);
                            setReviewAction('reject');
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                        <button
                          onClick={() => {
                            handleReview(request);
                            setReviewAction('need-more-info');
                          }}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
                        >
                          <AlertCircle size={16} />
                          Need More Info
                        </button>
                      </>
                    )}
                    {request.status !== 'pending' && (
                      <button
                        onClick={() => handleReview(request)}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    )}
                    {/* Delete button - available for all statuses */}
                    <button
                      onClick={() => handleDelete(request)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                      title="Delete this request"
                    >
                      <X size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Review Modal */}
        {showReviewModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-text-primary">Review Request</h2>
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="text-text-secondary hover:text-text-primary"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Admin Notes
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral bg-background text-text-primary"
                      rows={4}
                      placeholder="Add notes about this request..."
                    />
                  </div>

                  {reviewAction === 'reject' && (
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Rejection Reason *
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-neutral bg-background text-text-primary"
                        rows={3}
                        placeholder="Explain why this request is being rejected..."
                        required
                      />
                    </div>
                  )}

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowReviewModal(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitReview}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                      Submit Review
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approve & Assign Modal */}
        {showApproveModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-text-primary">Approve & Assign Project</h2>
                  <button
                    onClick={() => setShowApproveModal(false)}
                    className="text-text-secondary hover:text-text-primary"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="font-semibold text-text-primary mb-2">{selectedRequest.title}</h3>
                    <p className="text-sm text-text-secondary">Customer: {selectedRequest.customerName}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      <UserCheck className="inline h-4 w-4 mr-1" />
                      Assign to Team Lead *
                    </label>
                    <select
                      value={approvalData.assignToTeamLead}
                      onChange={(e) => setApprovalData({ ...approvalData, assignToTeamLead: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-neutral bg-background text-text-primary"
                      required
                    >
                      <option value="">Select team lead...</option>
                      {teamLeads.map(lead => (
                        <option key={lead.id} value={lead.uniqueId}>
                          {lead.email} {lead.name && `(${lead.name})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Priority
                      </label>
                      <select
                        value={approvalData.priority}
                        onChange={(e) => setApprovalData({ ...approvalData, priority: e.target.value as any })}
                        className="w-full px-4 py-2 rounded-lg border border-neutral bg-background text-text-primary"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={approvalData.dueDate}
                        onChange={(e) => setApprovalData({ ...approvalData, dueDate: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-neutral bg-background text-text-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Actual Budget ($)
                    </label>
                    <input
                      type="number"
                      value={approvalData.actualBudget}
                      onChange={(e) => setApprovalData({ ...approvalData, actualBudget: Number(e.target.value) })}
                      className="w-full px-4 py-2 rounded-lg border border-neutral bg-background text-text-primary"
                      placeholder="10000"
                    />
                    <p className="text-xs text-text-secondary mt-1">Customer budget range: {selectedRequest.budgetRange}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={approvalData.additionalNotes}
                      onChange={(e) => setApprovalData({ ...approvalData, additionalNotes: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-neutral bg-background text-text-primary"
                      rows={3}
                      placeholder="Any additional notes for the team lead..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Message to Customer (Admin Notes)
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral bg-background text-text-primary"
                      rows={2}
                      placeholder="This message will be visible to the customer..."
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-neutral">
                    <button
                      onClick={() => setShowApproveModal(false)}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitApproval}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <CheckCircle size={16} />
                      Approve & Create Project
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProjectRequests;

