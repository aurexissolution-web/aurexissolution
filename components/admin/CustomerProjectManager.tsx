import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import type { Project } from '../../types';
import { Calendar, Edit, Save, X, TrendingUp, Clock, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';

const CustomerProjectManager: React.FC = () => {
  const { projects, users, updateProject } = useAppContext();
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Project>>({});

  // Get customer projects (either assigned to customers OR originated from customer requests)
  const customerProjects = useMemo(() => {
    return (Array.isArray(projects) ? projects : []).filter(
      p => p.assignedType === 'customer' || p.customerUniqueId || p.customerEmail
    );
  }, [projects]);

  // Statistics
  const stats = useMemo(() => {
    const total = customerProjects.length;
    const inProgress = customerProjects.filter(p => p.status === 'in-progress').length;
    const completed = customerProjects.filter(p => p.status === 'completed').length;
    const pending = customerProjects.filter(p => p.status === 'pending').length;
    return { total, inProgress, completed, pending };
  }, [customerProjects]);

  const handleEdit = (project: Project) => {
    setEditingProject(project.id);
    setFormData(project);
  };

  const handleCancel = () => {
    setEditingProject(null);
    setFormData({});
  };

  const handleSave = async () => {
    if (!editingProject || !formData) return;

    console.log('🔵 PROJECT UPDATE - Starting save...');
    console.log('  Project ID:', editingProject);
    console.log('  Changes:', {
      title: formData.title,
      status: formData.status,
      completionPercentage: formData.completionPercentage,
      progressNotes: formData.progressNotes ? 'Updated' : 'None',
      customerEmail: formData.customerEmail,
      customerUniqueId: formData.customerUniqueId
    });

    try {
      await updateProject(formData as Project);
      console.log('✅ PROJECT UPDATE - Success! Changes saved to Firestore');
      console.log('   Real-time sync will push this to:', {
        customerEmail: formData.customerEmail,
        customerUniqueId: formData.customerUniqueId,
        assignedTo: formData.assignedTo
      });
      setEditingProject(null);
      setFormData({});
    } catch (error: any) {
      console.error('❌ PROJECT UPDATE - Failed:', error.message);
      console.error('Error details:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'pending': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200';
      case 'on-hold': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
      default: return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-600 text-white rounded-lg p-3">
            <TrendingUp size={32} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              Customer Project Progression
            </h2>
            <p className="text-text-secondary mt-1">
              Manage customer projects and update progress that customers see in their dashboard in real-time
            </p>
            {customerProjects.length > 0 && (
              <div className="mt-3 flex items-center gap-4 text-sm">
                <span className="text-text-secondary">
                  📊 <strong>{customerProjects.length}</strong> {customerProjects.length === 1 ? 'project' : 'projects'} being tracked
                </span>
                <span className="text-text-secondary">
                  ✅ Updates sync to customer dashboards instantly
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface p-4 rounded-lg border border-neutral">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Projects</p>
              <p className="text-2xl font-bold text-text-primary mt-1">{stats.total}</p>
            </div>
            <Calendar className="h-8 w-8 text-primary" />
          </div>
        </div>
        
        <div className="bg-surface p-4 rounded-lg border border-neutral">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.inProgress}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-surface p-4 rounded-lg border border-neutral">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-surface p-4 rounded-lg border border-neutral">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Pending</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.pending}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-surface rounded-lg border border-neutral">
        <div className="p-4 border-b border-neutral">
          <h3 className="text-lg font-semibold text-text-primary">Customer Projects</h3>
          <p className="text-sm text-text-secondary mt-1">
            Click Edit to update project details. Changes sync to customer dashboards in real-time.
          </p>
        </div>

        <div className="divide-y divide-neutral">
          {customerProjects.length === 0 ? (
            <div className="p-12">
              <div className="max-w-2xl mx-auto text-center">
                {/* Icon */}
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:from-purple-900/20">
                    <TrendingUp className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                
                {/* Title */}
                <h3 className="text-2xl font-bold text-text-primary mb-3">
                  No Customer Projects Yet
                </h3>
                
                {/* Description */}
                <p className="text-text-secondary mb-6 text-lg">
                  This is where you'll manage customer projects and update their progress.
                </p>
                
                {/* Info Cards */}
                <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-600 text-white rounded-full p-2 flex-shrink-0">
                        <span className="text-xl font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-1">
                          Customer Submits Request
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Customers submit project requests through their dashboard
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-600 text-white rounded-full p-2 flex-shrink-0">
                        <span className="text-xl font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-1">
                          Admin Approves Request
                        </h4>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          Go to "Customer Requests" tab to approve and assign projects
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-600 text-white rounded-full p-2 flex-shrink-0">
                        <span className="text-xl font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-green-900 dark:text-green-200 mb-1">
                          Project Appears Here
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Once approved, the project shows up here for progress tracking
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-orange-600 text-white rounded-full p-2 flex-shrink-0">
                        <span className="text-xl font-bold">4</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-1">
                          Update Progress
                        </h4>
                        <p className="text-sm text-orange-700 dark:text-orange-300">
                          Update completion % and notes - customers see it in real-time!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
                  <h4 className="font-bold text-text-primary mb-3 flex items-center justify-center gap-2">
                    <span>🚀</span>
                    <span>How to Get Started</span>
                  </h4>
                  <ol className="text-left space-y-2 text-sm text-text-secondary max-w-md mx-auto">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-blue-600 dark:text-blue-400">①</span>
                      <span>Ask a customer to submit a project request in their dashboard</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-blue-600 dark:text-blue-400">②</span>
                      <span>Go to <strong>"Customer Requests"</strong> tab (above) to review it</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-blue-600 dark:text-blue-400">③</span>
                      <span>Approve the request and assign to a team lead or yourself</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-blue-600 dark:text-blue-400">④</span>
                      <span>The project will appear here for progress tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-blue-600 dark:text-blue-400">⑤</span>
                      <span>Click <strong>"Edit"</strong> to update % and notes - customer sees instantly!</span>
                    </li>
                  </ol>
                </div>
                
                {/* Test Tip */}
                <div className="mt-6 text-sm text-text-secondary">
                  <p className="flex items-center justify-center gap-2">
                    <span>💡</span>
                    <span>
                      <strong>Testing Tip:</strong> Login as a customer and submit a test project request!
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            customerProjects.map((project) => {
              const isEditing = editingProject === project.id;
              const data = isEditing ? formData : project;
              const customer = users.find(u => u.uniqueId === project.assignedTo);

              return (
                <div key={project.id} className="p-6 hover:bg-neutral/5 transition-colors">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          type="text"
                          value={data.title || ''}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="text-xl font-semibold text-text-primary bg-background border border-neutral rounded px-3 py-2 w-full mb-2"
                          placeholder="Project title"
                        />
                      ) : (
                        <h3 className="text-xl font-semibold text-text-primary mb-2">{project.title}</h3>
                      )}
                      
                      <div className="flex items-center gap-3 text-sm text-text-secondary">
                        <span>👤 {customer?.email || project.assignedTo}</span>
                        {customer?.uniqueId && <span>• ID: {customer.uniqueId}</span>}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                          >
                            <Save size={16} />
                            Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                          >
                            <X size={16} />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEdit(project)}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Project Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Status
                      </label>
                      {isEditing ? (
                        <select
                          value={data.status || 'pending'}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-lg border border-neutral bg-background text-text-primary"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="on-hold">On Hold</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      ) : (
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      )}
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Priority
                      </label>
                      {isEditing ? (
                        <select
                          value={data.priority || 'medium'}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-lg border border-neutral bg-background text-text-primary"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      ) : (
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(project.priority)}`}>
                          {project.priority.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Due Date */}
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Due Date
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={data.dueDate || ''}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-neutral bg-background text-text-primary"
                        />
                      ) : (
                        <p className="text-text-primary">{new Date(project.dueDate).toLocaleDateString()}</p>
                      )}
                    </div>

                    {/* Budget */}
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Budget
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                          <input
                            type="number"
                            value={data.budget || 0}
                            onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                            className="w-full pl-10 pr-3 py-2 rounded-lg border border-neutral bg-background text-text-primary"
                            placeholder="0"
                          />
                        </div>
                      ) : (
                        <p className="text-text-primary font-semibold">${project.budget?.toLocaleString() || 0}</p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Description
                    </label>
                    {isEditing ? (
                      <textarea
                        value={data.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-neutral bg-background text-text-primary"
                        rows={3}
                        placeholder="Project description..."
                      />
                    ) : (
                      <p className="text-text-primary">{project.description || 'No description provided'}</p>
                    )}
                  </div>

                  {/* Completion Percentage */}
                  <div className="mb-4 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20">
                    <label className="block text-sm font-bold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
                      <span className="text-lg">📊</span>
                      Completion Percentage - Customer Will See This Progress Bar!
                    </label>
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={data.completionPercentage || 0}
                            onChange={(e) => setFormData({ ...formData, completionPercentage: Number(e.target.value) })}
                            className="w-32 px-4 py-3 text-2xl font-bold rounded-lg border-2 border-blue-400 dark:border-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center"
                          />
                          <div className="flex-1">
                            <div className="w-full h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                              <div 
                                className={`h-full transition-all duration-500 flex items-center justify-end pr-2 ${
                                  (data.completionPercentage || 0) >= 100
                                    ? 'bg-gradient-to-r from-green-500 to-green-600'
                                    : (data.completionPercentage || 0) >= 75
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                                    : (data.completionPercentage || 0) >= 50
                                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                                    : (data.completionPercentage || 0) > 0
                                    ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                                    : 'bg-gradient-to-r from-gray-400 to-gray-500'
                                }`}
                                style={{ width: `${Math.max(data.completionPercentage || 0, 3)}%` }}
                              >
                                <span className="text-white text-xs font-bold">
                                  {(data.completionPercentage || 0) > 15 ? `${data.completionPercentage}%` : ''}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {data.completionPercentage || 0}%
                          </span>
                        </div>
                        
                        {/* Quick Preset Buttons */}
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Quick Presets:</p>
                          <div className="flex gap-2 flex-wrap">
                            {[0, 10, 25, 50, 75, 90, 100].map(preset => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setFormData({ ...formData, completionPercentage: preset })}
                                className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                                  data.completionPercentage === preset
                                    ? 'bg-blue-600 text-white scale-110'
                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                                }`}
                              >
                                {preset}%
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all ${
                                (project.completionPercentage || 0) >= 100
                                  ? 'bg-green-500'
                                  : (project.completionPercentage || 0) >= 75
                                  ? 'bg-blue-500'
                                  : (project.completionPercentage || 0) >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-orange-500'
                              }`}
                              style={{ width: `${Math.min(project.completionPercentage || 0, 100)}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-bold text-text-primary">
                          {project.completionPercentage || 0}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Progress Notes - Highlighted for Customer Visibility */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="bg-blue-500 text-white rounded-full p-1">
                        <TrendingUp size={16} />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                          📢 Progress Notes (Customer Visible)
                        </label>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          These notes appear in the customer's dashboard. Keep them updated!
                        </p>
                      </div>
                    </div>
                    
                    {isEditing ? (
                      <textarea
                        value={data.progressNotes || ''}
                        onChange={(e) => setFormData({ ...formData, progressNotes: e.target.value, lastProgressUpdate: new Date() })}
                        className="w-full px-3 py-2 rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-800 text-text-primary mt-2"
                        rows={4}
                        placeholder="e.g., 'Week 2: Design phase completed. Starting development next Monday. Logo approved by client.'"
                      />
                    ) : (
                      <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-700">
                        <p className="text-text-primary whitespace-pre-wrap">
                          {project.progressNotes || '📝 No progress notes yet. Click Edit to add updates for the customer.'}
                        </p>
                        {project.lastProgressUpdate && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                            Last updated: {new Date(project.lastProgressUpdate.seconds * 1000).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerProjectManager;

