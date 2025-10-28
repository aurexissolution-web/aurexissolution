import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import type { Attachment } from '../../types';
import { Upload, File, FileText, Image, CheckCircle, Clock, XCircle, Trash2, X } from 'lucide-react';
import { serverTimestamp } from 'firebase/firestore';

const getStatusColor = (status: Attachment['status']) => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
    case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
    case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getFileIcon = (fileType: string) => {
  if (fileType.includes('image')) return <Image size={20} className="text-blue-500" />;
  if (fileType.includes('pdf')) return <FileText size={20} className="text-red-500" />;
  return <File size={20} className="text-gray-500" />;
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

const CustomerAttachments: React.FC = () => {
  const { user, projects, attachments, addAttachment, deleteAttachment } = useAppContext();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState({
    projectId: '',
    description: '',
    category: 'document' as Attachment['category']
  });

  // Get customer's projects
  // SHOW ALL DATA FOR TESTING (so mock data is visible)
  const customerProjects = useMemo(() => {
    const allProjects = Array.isArray(projects) ? projects : [];
    console.log('📎 Showing all customer projects:', allProjects.length);
    return allProjects.filter(p => p.assignedType === 'customer' || !p.assignedType);
  }, [projects]);

  // Get all attachments (show all mock data)
  const customerAttachments = useMemo(() => {
    const allAttachments = Array.isArray(attachments) ? attachments : [];
    console.log('📎 Showing all attachments:', allAttachments.length);
    return allAttachments; // Show ALL attachments
  }, [attachments]);

  // Statistics
  const stats = useMemo(() => {
    const total = customerAttachments.length;
    const pending = customerAttachments.filter(a => a.status === 'pending').length;
    const approved = customerAttachments.filter(a => a.status === 'approved').length;
    const rejected = customerAttachments.filter(a => a.status === 'rejected').length;
    return { total, pending, approved, rejected };
  }, [customerAttachments]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) {
      alert('Please select a file to upload');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);

    try {
      // Create a mock file URL (in production, upload to Firebase Storage)
      const mockFileUrl = `https://example.com/uploads/${selectedFile.name}`;
      
      const selectedProject = customerProjects.find(p => p.id === uploadData.projectId);

      const attachment: Omit<Attachment, 'id'> = {
        fileName: selectedFile.name,
        fileUrl: mockFileUrl,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        uploadedBy: String(user.email || ''),
        uploadedByName: 'Customer',
        customerCode: String(user.uniqueId || ''),
        projectId: uploadData.projectId || undefined,
        projectTitle: selectedProject?.title || undefined,
        description: uploadData.description || '',
        category: uploadData.category,
        uploadedAt: serverTimestamp(),
        status: 'pending',
      };

      await addAttachment(attachment);

      alert('✅ File uploaded successfully! Admin will review it soon.');
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setUploadData({
        projectId: '',
        description: '',
        category: 'document'
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      alert(`❌ Failed to upload file: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    const attachment = customerAttachments.find(att => att.id === attachmentId);
    
    let confirmMessage = 'Are you sure you want to delete this attachment?';
    if (attachment) {
      if (attachment.status === 'approved') {
        confirmMessage = `This attachment "${attachment.fileName}" has been APPROVED by admin. Are you sure you want to delete it?`;
      } else if (attachment.status === 'rejected') {
        confirmMessage = `This attachment "${attachment.fileName}" was rejected. Do you want to delete it?`;
      } else {
        confirmMessage = `Are you sure you want to delete "${attachment.fileName}"?`;
      }
    }
    
    if (!window.confirm(confirmMessage)) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Upload size={28} />
            Project Attachments
          </h2>
          <p className="text-text-secondary mt-1">Upload and manage project files, documents, and images</p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
        >
          <Upload size={20} />
          Upload File
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface p-4 rounded-lg border border-neutral">
          <div className="text-sm text-text-secondary">Total Files</div>
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

      {/* Attachments List */}
      <div className="bg-surface rounded-lg border border-neutral">
        <div className="px-6 py-4 border-b border-neutral">
          <h3 className="text-lg font-bold text-text-primary">Your Uploads</h3>
        </div>

        {customerAttachments.length === 0 ? (
          <div className="p-12 text-center">
            <Upload size={64} className="mx-auto mb-4 opacity-20 text-text-secondary" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">No files uploaded yet</h3>
            <p className="text-text-secondary mb-6">Start by uploading your project documents and files</p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Upload Your First File
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral">
            {customerAttachments.map((attachment) => {
              // Safety checks for all properties
              const safeAttachment = {
                id: String(attachment.id || ''),
                fileName: String(attachment.fileName || 'Unknown file'),
                fileType: String(attachment.fileType || ''),
                fileSize: Number(attachment.fileSize) || 0,
                category: String(attachment.category || 'other'),
                uploadedAt: attachment.uploadedAt,
                status: attachment.status || 'pending',
                projectTitle: attachment.projectTitle ? String(attachment.projectTitle) : null,
                description: attachment.description ? String(attachment.description) : null,
                adminNotes: attachment.adminNotes ? String(attachment.adminNotes) : null
              };

              return (
                <div key={safeAttachment.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getFileIcon(safeAttachment.fileType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-text-primary truncate">{safeAttachment.fileName}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(safeAttachment.status)}`}>
                            {safeAttachment.status}
                          </span>
                        </div>
                        
                        {safeAttachment.projectTitle && (
                          <div className="text-sm text-text-secondary mb-1">
                            Project: <span className="font-medium">{safeAttachment.projectTitle}</span>
                          </div>
                        )}
                        
                        {safeAttachment.description && (
                          <p className="text-sm text-text-secondary mb-2">{safeAttachment.description}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-3 text-xs text-text-secondary">
                          <span>Size: {formatFileSize(safeAttachment.fileSize)}</span>
                          <span>Category: {safeAttachment.category}</span>
                          <span>Uploaded: {formatTimestamp(safeAttachment.uploadedAt)}</span>
                        </div>

                        {safeAttachment.adminNotes && (
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                            <div className="text-xs font-medium text-blue-900 dark:text-blue-200 mb-1">Admin Notes:</div>
                            <div className="text-sm text-blue-800 dark:text-blue-300">{safeAttachment.adminNotes}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteAttachment(attachment.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Delete attachment"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-text-primary">Upload File</h2>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* File Selection */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Select File *
                  </label>
                  <div className="border-2 border-dashed border-neutral rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload size={48} className="mx-auto mb-4 text-text-secondary" />
                      {selectedFile ? (
                        <div>
                          <p className="text-text-primary font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-text-secondary mt-1">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-text-primary font-medium mb-1">Click to upload file</p>
                          <p className="text-sm text-text-secondary">
                            Supported: Images, PDF, DOC, XLS, TXT (Max 10MB)
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Project Selection */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Link to Project (Optional)
                  </label>
                  <select
                    value={uploadData.projectId}
                    onChange={(e) => setUploadData({ ...uploadData, projectId: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-neutral bg-background"
                  >
                    <option value="">-- No Project --</option>
                    {customerProjects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Category *
                  </label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData({ ...uploadData, category: e.target.value as Attachment['category'] })}
                    className="w-full px-3 py-2 rounded border border-neutral bg-background"
                  >
                    <option value="document">Document</option>
                    <option value="image">Image</option>
                    <option value="design">Design</option>
                    <option value="requirement">Requirement</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Description
                  </label>
                  <textarea
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-neutral bg-background"
                    rows={3}
                    placeholder="Add any notes or description about this file..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 border border-neutral rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      Upload File
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> Files will be reviewed by admin before being approved. You'll be notified once reviewed.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerAttachments;

