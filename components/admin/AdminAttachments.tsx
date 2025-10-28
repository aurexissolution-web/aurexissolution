import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import type { Attachment } from '../../types';
import { File, FileText, Image, CheckCircle, XCircle, Clock, Eye, X, Filter } from 'lucide-react';

const getStatusColor = (status: Attachment['status']) => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getFileIcon = (fileType: string) => {
  if (fileType.includes('image')) return <Image size={24} className="text-blue-500" />;
  if (fileType.includes('pdf')) return <FileText size={24} className="text-red-500" />;
  return <File size={24} className="text-gray-500" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const formatTimestamp = (timestamp: any): string => {
  if (!timestamp) return 'N/A';
  try {
    // Handle Firestore timestamp
    if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleDateString('en-GB');
    }
    // Handle Date object
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString('en-GB');
    }
    // Handle string
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleDateString('en-GB');
    }
    return 'N/A';
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'N/A';
  }
};

const AdminAttachments: React.FC = () => {
  const { attachments, updateAttachment, deleteAttachment, users } = useAppContext();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: 'approved' as Attachment['status'],
    adminNotes: ''
  });

  // Filter attachments
  const filteredAttachments = useMemo(() => {
    return (Array.isArray(attachments) ? attachments : []).filter(att => {
      const matchesStatus = statusFilter === 'all' || att.status === statusFilter;
      
      // Safely convert all fields to strings before calling .toLowerCase()
      const fileName = String(att.fileName || '');
      const uploadedByName = String(att.uploadedByName || '');
      const customerCode = String(att.customerCode || '');
      const projectTitle = String(att.projectTitle || '');
      
      const matchesSearch = 
        fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uploadedByName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        projectTitle.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [attachments, statusFilter, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const safeAttachments = Array.isArray(attachments) ? attachments : [];
    const total = safeAttachments.length;
    const pending = safeAttachments.filter(a => a.status === 'pending').length;
    const approved = safeAttachments.filter(a => a.status === 'approved').length;
    const rejected = safeAttachments.filter(a => a.status === 'rejected').length;
    return { total, pending, approved, rejected };
  }, [attachments]);

  const handleReview = (attachment: Attachment) => {
    setSelectedAttachment(attachment);
    setReviewData({
      status: attachment.status,
      adminNotes: attachment.adminNotes || ''
    });
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedAttachment) return;

    try {
      const updatedAttachment: Attachment = {
        ...selectedAttachment,
        status: reviewData.status,
        adminNotes: reviewData.adminNotes
      };

      await updateAttachment(updatedAttachment);
      alert(`✅ Attachment ${reviewData.status === 'approved' ? 'approved' : 'rejected'} successfully!`);
      setShowReviewModal(false);
      setSelectedAttachment(null);
    } catch (error: any) {
      console.error('Error reviewing attachment:', error);
      alert(`❌ Failed to review attachment: ${error.message}`);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!window.confirm('Are you sure you want to delete this attachment?')) {
      return;
    }

    try {
      await deleteAttachment(attachmentId);
      alert('✅ Attachment deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting attachment:', error);
      alert(`❌ Failed to delete attachment: ${error.message}`);
    }
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-2">
            <File size={32} />
            Customer Attachments
          </h1>
          <p className="text-text-secondary mt-1">Review and manage customer uploaded files</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-surface p-4 rounded-lg border border-neutral">
            <div className="text-sm text-text-secondary">Total Attachments</div>
            <div className="text-2xl font-bold text-text-primary">{stats.total}</div>
          </div>
          <div className="bg-surface p-4 rounded-lg border border-neutral">
            <div className="text-sm text-text-secondary">Pending Review</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
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
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by filename, customer, or project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 rounded border border-neutral bg-surface"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded border border-neutral bg-surface"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Attachments Table */}
        <div className="bg-surface rounded-lg border border-neutral overflow-hidden">
          {filteredAttachments.length === 0 ? (
            <div className="p-12 text-center">
              <File size={64} className="mx-auto mb-4 opacity-20 text-text-secondary" />
              <p className="text-text-secondary">No attachments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">File</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Project</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Size</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Uploaded</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral">
                  {filteredAttachments.map((attachment) => {
                    // Safety checks for all properties
                    const safe = {
                      id: String(attachment.id || ''),
                      fileName: String(attachment.fileName || 'Unknown'),
                      fileType: String(attachment.fileType || ''),
                      fileSize: Number(attachment.fileSize) || 0,
                      uploadedByName: String(attachment.uploadedByName || 'Unknown'),
                      customerCode: String(attachment.customerCode || 'N/A'),
                      projectTitle: attachment.projectTitle ? String(attachment.projectTitle) : null,
                      description: attachment.description ? String(attachment.description) : null,
                      category: String(attachment.category || 'other'),
                      uploadedAt: attachment.uploadedAt,
                      status: attachment.status || 'pending'
                    };
                    
                    return (
                      <tr key={safe.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {getFileIcon(safe.fileType)}
                            <div className="max-w-xs">
                              <div className="font-medium text-text-primary truncate">{safe.fileName}</div>
                              {safe.description && (
                                <div className="text-xs text-text-secondary truncate">{safe.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-text-primary">
                          <div>{safe.uploadedByName}</div>
                          <div className="text-xs text-text-secondary">{safe.customerCode}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-text-primary">
                          {safe.projectTitle || <span className="text-text-secondary">No project</span>}
                        </td>
                        <td className="px-4 py-4 text-sm text-text-primary capitalize">
                          {safe.category}
                        </td>
                        <td className="px-4 py-4 text-sm text-text-primary">
                          {formatFileSize(safe.fileSize)}
                        </td>
                        <td className="px-4 py-4 text-sm text-text-primary">
                          {formatTimestamp(safe.uploadedAt)}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(safe.status)}`}>
                            {safe.status}
                          </span>
                        </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReview(attachment)}
                            className="text-primary hover:underline text-sm flex items-center gap-1"
                          >
                            <Eye size={14} />
                            Review
                          </button>
                          <button
                            onClick={() => handleDeleteAttachment(attachment.id)}
                            className="text-red-600 hover:underline text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedAttachment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-text-primary">Review Attachment</h2>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Attachment Details */}
              <div className="bg-background p-4 rounded mb-6">
                <div className="flex items-start gap-3 mb-4">
                  {getFileIcon(selectedAttachment.fileType)}
                  <div className="flex-1">
                    <h3 className="font-bold text-text-primary mb-1">{selectedAttachment.fileName}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-text-secondary">Uploaded by:</span>
                        <span className="ml-2 text-text-primary">{selectedAttachment.uploadedByName}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary">Customer Code:</span>
                        <span className="ml-2 text-text-primary">{selectedAttachment.customerCode}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary">File Size:</span>
                        <span className="ml-2 text-text-primary">{formatFileSize(selectedAttachment.fileSize)}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary">Category:</span>
                        <span className="ml-2 text-text-primary capitalize">{selectedAttachment.category}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary">Uploaded:</span>
                        <span className="ml-2 text-text-primary">{formatTimestamp(selectedAttachment.uploadedAt)}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary">Current Status:</span>
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getStatusColor(selectedAttachment.status)}`}>
                          {selectedAttachment.status}
                        </span>
                      </div>
                    </div>
                    {selectedAttachment.projectTitle && (
                      <div className="mt-2 text-sm">
                        <span className="text-text-secondary">Project:</span>
                        <span className="ml-2 font-medium text-text-primary">{selectedAttachment.projectTitle}</span>
                      </div>
                    )}
                    {selectedAttachment.description && (
                      <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="text-xs font-medium text-text-secondary mb-1">Description:</div>
                        <div className="text-sm text-text-primary">{selectedAttachment.description}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Review Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Review Status *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="approved"
                        checked={reviewData.status === 'approved'}
                        onChange={(e) => setReviewData({ ...reviewData, status: e.target.value as Attachment['status'] })}
                        className="w-4 h-4"
                      />
                      <CheckCircle size={20} className="text-green-600" />
                      <span className="text-text-primary">Approve</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="rejected"
                        checked={reviewData.status === 'rejected'}
                        onChange={(e) => setReviewData({ ...reviewData, status: e.target.value as Attachment['status'] })}
                        className="w-4 h-4"
                      />
                      <XCircle size={20} className="text-red-600" />
                      <span className="text-text-primary">Reject</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="pending"
                        checked={reviewData.status === 'pending'}
                        onChange={(e) => setReviewData({ ...reviewData, status: e.target.value as Attachment['status'] })}
                        className="w-4 h-4"
                      />
                      <Clock size={20} className="text-yellow-600" />
                      <span className="text-text-primary">Keep Pending</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={reviewData.adminNotes}
                    onChange={(e) => setReviewData({ ...reviewData, adminNotes: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-neutral bg-background"
                    rows={4}
                    placeholder="Add notes for the customer about this attachment..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 border border-neutral rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                  Save Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttachments;

