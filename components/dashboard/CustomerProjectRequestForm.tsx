import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import type { ProjectRequest } from '../../types';
import { Send, X, FileText, DollarSign, Calendar, Tag, AlertCircle, CheckCircle, Clock, Upload, Paperclip, Trash2 } from 'lucide-react';
import { serverTimestamp } from 'firebase/firestore';
import { uploadTaskFile, formatFileSize, getFileIcon } from '../../services/fileUploadService';
import { checkForDuplicateRequest } from '../../services/notificationService';

const CustomerProjectRequestForm: React.FC = () => {
  const { user, addProjectRequest, projectRequests } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ fileName: string; fileUrl: string; fileSize: number; fileType: string }>>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    budgetRange: '',
    desiredTimeline: '',
    category: 'Web Development'
  });

  // Get customer's requests
  const myRequests = projectRequests.filter(req => req.customerUniqueId === user?.uniqueId);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const uploaded = await uploadTaskFile('project-request-temp', file);
        return {
          fileName: uploaded.fileName,
          fileUrl: uploaded.fileUrl,
          fileSize: uploaded.fileSize,
          fileType: uploaded.fileType
        };
      });

      const results = await Promise.all(uploadPromises);
      setUploadedFiles(prev => [...prev, ...results]);
      alert(`✅ ${results.length} file(s) uploaded successfully!`);
    } catch (error: any) {
      console.error('Error uploading files:', error);
      alert(`❌ Upload failed: ${error.message}`);
    } finally {
      setUploadingFiles(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('❌ You must be logged in to submit a project request');
      return;
    }

    // Validation
    if (!formData.title.trim()) {
      alert('❌ Please enter a project title');
      return;
    }
    if (!formData.description.trim()) {
      alert('❌ Please enter a project description');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check for duplicate requests
      const duplicateCheck = await checkForDuplicateRequest(user.email || '', formData.title);
      if (duplicateCheck.isDuplicate) {
        const proceed = window.confirm(
          `⚠️ You already have a similar project request:\n\n"${duplicateCheck.similarRequest?.title}"\n\nStatus: ${duplicateCheck.similarRequest?.status}\n\nDo you still want to submit this new request?`
        );
        if (!proceed) {
          setIsSubmitting(false);
          return;
        }
      }

      const request: Omit<ProjectRequest, 'id'> = {
        customerEmail: String(user.email || ''),
        customerUniqueId: String(user.uniqueId || ''),
        customerName: String(user.name || user.email || 'Customer'),
        title: formData.title.trim(),
        description: formData.description.trim(),
        requirements: formData.requirements.trim(),
        budgetRange: formData.budgetRange || 'Not specified',
        desiredTimeline: formData.desiredTimeline || 'Flexible',
        category: formData.category,
        attachments: uploadedFiles.map(f => f.fileUrl), // Store file URLs
        status: 'pending',
        adminNotes: '',
        submittedAt: serverTimestamp()
      };

      await addProjectRequest(request);
      
      alert('✅ Project request submitted successfully! Our team will review it and get back to you soon.');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        requirements: '',
        budgetRange: '',
        desiredTimeline: '',
        category: 'Web Development'
      });
      setUploadedFiles([]); // Clear uploaded files
    } catch (error: any) {
      console.error('Error submitting request:', error);
      alert(`❌ Failed to submit request: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: ProjectRequest['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected': return <X className="h-5 w-5 text-red-500" />;
      case 'need-more-info': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default: return <Clock className="h-5 w-5 text-orange-500" />;
    }
  };

  const getStatusColor = (status: ProjectRequest['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      case 'need-more-info': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      default: return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleDateString('en-GB');
      }
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString('en-GB');
      }
      return new Date(timestamp).toLocaleDateString('en-GB');
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Send size={28} />
          Request New Project
        </h2>
        <p className="text-text-secondary mt-1">
          Submit your project details and our team will review and get back to you
        </p>
      </div>

      {/* Request Form */}
      <div className="bg-surface rounded-lg border border-neutral p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Title */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Project Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-neutral bg-background text-text-primary"
              placeholder="e.g., E-commerce Website Development"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              <Tag className="inline h-4 w-4 mr-1" />
              Project Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-neutral bg-background text-text-primary"
              required
            >
              <option value="Web Development">Web Development</option>
              <option value="Mobile App">Mobile App Development</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Digital Marketing">Digital Marketing</option>
              <option value="SEO">SEO Services</option>
              <option value="Branding">Branding & Identity</option>
              <option value="E-commerce">E-commerce Solutions</option>
              <option value="Custom Software">Custom Software</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Project Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-neutral bg-background text-text-primary"
              rows={4}
              placeholder="Describe your project in detail. What problem are you trying to solve? What are your goals?"
              required
            />
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Requirements & Features
            </label>
            <textarea
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-neutral bg-background text-text-primary"
              rows={4}
              placeholder="List specific features, functionality, or requirements you need (e.g., user login, payment gateway, admin panel, etc.)"
            />
          </div>

          {/* File Attachments */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              <Paperclip className="inline h-4 w-4 mr-1" />
              Attachments (Optional)
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-neutral hover:border-primary bg-background hover:bg-neutral/10 transition-colors">
                    <Upload className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-text-primary">
                      {uploadingFiles ? 'Uploading...' : 'Choose Files'}
                    </span>
                  </div>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    disabled={uploadingFiles}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.gif,.webp,.txt,.zip"
                  />
                </label>
              </div>
              
              <p className="text-xs text-text-secondary">
                Upload project briefs, wireframes, design files, or any relevant documents (Max 800KB per file)
              </p>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-neutral/10 border border-neutral"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-2xl">{getFileIcon(file.fileType)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {file.fileName}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {formatFileSize(file.fileSize)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remove file"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Budget & Timeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Budget Range */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Budget Range
              </label>
              <select
                value={formData.budgetRange}
                onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-neutral bg-background text-text-primary"
              >
                <option value="">Select budget range...</option>
                <option value="Under $5,000">Under $5,000</option>
                <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                <option value="$25,000 - $50,000">$25,000 - $50,000</option>
                <option value="$50,000+">$50,000+</option>
                <option value="Not sure yet">Not sure yet</option>
              </select>
            </div>

            {/* Timeline */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Desired Timeline
              </label>
              <select
                value={formData.desiredTimeline}
                onChange={(e) => setFormData({ ...formData, desiredTimeline: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-neutral bg-background text-text-primary"
              >
                <option value="">Select timeline...</option>
                <option value="ASAP (1-2 weeks)">ASAP (1-2 weeks)</option>
                <option value="1 month">1 month</option>
                <option value="2-3 months">2-3 months</option>
                <option value="3-6 months">3-6 months</option>
                <option value="6+ months">6+ months</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Clock className="animate-spin" size={20} />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Submit Project Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* My Requests */}
      <div className="bg-surface rounded-lg border border-neutral">
        <div className="p-4 border-b border-neutral">
          <h3 className="text-lg font-semibold text-text-primary">My Submitted Requests</h3>
          <p className="text-sm text-text-secondary mt-1">Track the status of your project requests</p>
        </div>

        <div className="divide-y divide-neutral">
          {myRequests.length === 0 ? (
            <div className="p-8 text-center text-text-secondary">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No requests submitted yet</p>
              <p className="text-sm mt-1">Submit your first project request above!</p>
            </div>
          ) : (
            myRequests.map((request) => (
              <div key={request.id} className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-text-primary">{request.title}</h4>
                    <p className="text-sm text-text-secondary mt-1">{request.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(request.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                      {request.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <p className="text-text-primary mb-3">{request.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm text-text-secondary mb-3">
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
                  <div className="mb-3">
                    <div className="text-xs font-medium text-text-secondary mb-2">
                      <Paperclip className="inline h-3 w-3 mr-1" />
                      Attachments ({request.attachments.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {request.attachments.map((fileUrl, idx) => (
                        <a
                          key={idx}
                          href={fileUrl}
                          download
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        >
                          <Paperclip className="h-3 w-3" />
                          File {idx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                {request.adminNotes && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                    <div className="text-xs font-medium text-blue-900 dark:text-blue-200 mb-1">
                      Admin Response:
                    </div>
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                      {request.adminNotes}
                    </div>
                  </div>
                )}

                {/* Rejection Reason */}
                {request.status === 'rejected' && request.rejectionReason && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                    <div className="text-xs font-medium text-red-900 dark:text-red-200 mb-1">
                      Reason:
                    </div>
                    <div className="text-sm text-red-800 dark:text-red-300">
                      {request.rejectionReason}
                    </div>
                  </div>
                )}

                {/* Approved - Show Project Link */}
                {request.status === 'approved' && request.convertedToProjectId && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                    <div className="text-sm text-green-800 dark:text-green-300">
                      ✅ This request has been approved and converted to a project! Check your "Project Progression" tab to see updates.
                      {request.assignedTeamLeadName && (
                        <div className="mt-1">
                          <strong>Assigned to:</strong> {request.assignedTeamLeadName}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerProjectRequestForm;

