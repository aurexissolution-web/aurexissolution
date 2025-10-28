import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { 
  subscribeToProjects, 
  createProject, 
  updateProject, 
  deleteProject,
  Project,
  Deliverable,
  Milestone
} from '../../services/database';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Eye,
  Edit,
  Trash2,
  Users,
  FileText,
  Download,
  Upload,
  MessageSquare,
  BarChart3,
  Target,
  Flag,
  X
} from 'lucide-react';

// Interfaces are now imported from database service

const ProjectManagement: React.FC = () => {
  const { user } = useAppContext();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (!user?.email) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // For now, use email as userId since that's what we have
    const userId = user.email;

    // Set up real-time listener for projects
    const unsubscribe = subscribeToProjects(userId, (projectsData) => {
      setProjects(projectsData);
      setIsLoading(false);
    });

    // Cleanup listener on unmount
    return () => {
      unsubscribe();
    };
  }, [user?.email]);

  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createProject({
        ...projectData,
        userId: user?.email || ''
      });
      setShowNewProjectForm(false);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleUpdateProject = async (projectData: Project) => {
    try {
      await updateProject(projectData.id, projectData);
      setSelectedProject(null);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      setSelectedProject(null);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'text-green-600 bg-green-100';
      case 'In Progress':
        return 'text-blue-600 bg-blue-100';
      case 'Review':
        return 'text-purple-600 bg-purple-100';
      case 'Planning':
        return 'text-yellow-600 bg-yellow-100';
      case 'On Hold':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'text-red-600 bg-red-100';
      case 'High':
        return 'text-orange-600 bg-orange-100';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'Low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'High':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'Medium':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Low':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getDeliverableStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'text-green-600 bg-green-100';
      case 'In Progress':
        return 'text-blue-600 bg-blue-100';
      case 'Review':
        return 'text-purple-600 bg-purple-100';
      case 'Pending':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'text-green-600 bg-green-100';
      case 'In Progress':
        return 'text-blue-600 bg-blue-100';
      case 'Pending':
        return 'text-gray-600 bg-gray-100';
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

  const calculateDaysRemaining = (deadline: string) => {
    const today = new Date();
    const dueDate = new Date(deadline);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Project Management</h2>
          <p className="text-text-secondary">Track project progress, deliverables, and milestones</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <div className="flex bg-neutral-light rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'grid' ? 'bg-surface text-text-primary' : 'text-text-secondary'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'list' ? 'bg-surface text-text-primary' : 'text-text-secondary'
              }`}
            >
              List
            </button>
          </div>
          <button
            onClick={() => setShowNewProjectForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center"
          >
            <Plus size={16} className="mr-2" />
            New Project
          </button>
        </div>
      </div>

      {/* Project Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-4 rounded-lg border border-neutral">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Projects</p>
              <p className="text-2xl font-bold text-text-primary">{projects.length}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="bg-surface p-4 rounded-lg border border-neutral">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">In Progress</p>
              <p className="text-2xl font-bold text-text-primary">
                {projects.filter(p => p.status === 'In Progress').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-surface p-4 rounded-lg border border-neutral">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Completed</p>
              <p className="text-2xl font-bold text-text-primary">
                {projects.filter(p => p.status === 'Completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-surface p-4 rounded-lg border border-neutral">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Avg. Progress</p>
              <p className="text-2xl font-bold text-text-primary">
                {Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)}%
              </p>
            </div>
            <Target className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading projects...</p>
        </div>
      ) : projects.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((project) => (
            <div key={project.id} className="bg-surface p-6 rounded-lg border border-neutral hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">{project.name}</h3>
                  <p className="text-sm text-text-secondary mt-1">{project.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  {getPriorityIcon(project.priority)}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-text-secondary">Progress</span>
                  <span className="text-sm font-medium text-text-primary">{project.progress}%</span>
                </div>
                <div className="w-full bg-neutral-light rounded-full h-3">
                  <div 
                    className="bg-primary h-3 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Project Info */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Team Size</span>
                  <span className="text-text-primary">{project.team.length} members</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Budget</span>
                  <span className="text-text-primary">{formatCurrency(project.budget)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Spent</span>
                  <span className="text-text-primary">{formatCurrency(project.spent)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Deadline</span>
                  <span className={`text-text-primary ${calculateDaysRemaining(project.deadline) < 7 ? 'text-red-500' : ''}`}>
                    {project.deadline} ({calculateDaysRemaining(project.deadline)} days)
                  </span>
                </div>
              </div>

              {/* Team Members */}
              <div className="mb-4">
                <p className="text-sm text-text-secondary mb-2">Team</p>
                <div className="flex flex-wrap gap-1">
                  {project.team.map((member, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-neutral-light text-text-secondary">
                      <Users className="w-3 h-3 mr-1" />
                      {member}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedProject(project)}
                  className="flex-1 bg-background text-text-primary px-4 py-2 rounded-lg hover:bg-neutral-light transition-colors flex items-center justify-center"
                >
                  <Eye size={16} className="mr-2" />
                  View Details
                </button>
                <button className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center">
                  <MessageSquare size={16} className="mr-2" />
                  Message Team
                </button>
              </div>
            </div>
          ))}
          </div>
        ) : (
        <div className="bg-surface rounded-lg border border-neutral overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-light">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Team</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Deadline</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-background">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-text-primary">{project.name}</div>
                        <div className="text-sm text-text-secondary max-w-xs truncate">{project.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-neutral-light rounded-full h-2 mr-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-text-primary">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getPriorityIcon(project.priority)}
                        <span className="ml-2 text-sm text-text-primary">{project.priority}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-text-secondary mr-2" />
                        <span className="text-sm text-text-primary">{project.team.length}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-text-secondary">
                        <Calendar className="w-4 h-4 mr-2" />
                        {project.deadline}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedProject(project)}
                          className="text-primary hover:text-secondary transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="text-primary hover:text-secondary transition-colors"
                          title="Message Team"
                        >
                          <MessageSquare size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )
      ) : (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-neutral-light rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-text-secondary" />
          </div>
          <p className="text-text-secondary">No projects found</p>
          <p className="text-sm text-text-secondary mt-1">Create your first project to get started</p>
        </div>
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-text-primary">{selectedProject.name}</h3>
                  <p className="text-text-secondary">{selectedProject.description}</p>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Project Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-background p-4 rounded-lg">
                  <h4 className="font-medium text-text-primary mb-2">Status & Priority</h4>
                  <div className="space-y-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedProject.status)}`}>
                      {selectedProject.status}
                    </span>
                    <div className="flex items-center">
                      {getPriorityIcon(selectedProject.priority)}
                      <span className="ml-2 text-sm text-text-primary">{selectedProject.priority} Priority</span>
                    </div>
                  </div>
                </div>
                <div className="bg-background p-4 rounded-lg">
                  <h4 className="font-medium text-text-primary mb-2">Progress</h4>
                  <div className="w-full bg-neutral-light rounded-full h-3 mb-2">
                    <div 
                      className="bg-primary h-3 rounded-full"
                      style={{ width: `${selectedProject.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-text-secondary">{selectedProject.progress}% complete</p>
                </div>
                <div className="bg-background p-4 rounded-lg">
                  <h4 className="font-medium text-text-primary mb-2">Budget</h4>
                  <p className="text-sm text-text-secondary">
                    {formatCurrency(selectedProject.spent)} / {formatCurrency(selectedProject.budget)}
                  </p>
                  <div className="w-full bg-neutral-light rounded-full h-2 mt-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${(selectedProject.spent / selectedProject.budget) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Deliverables */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-text-primary mb-4">Deliverables</h4>
                <div className="space-y-3">
                  {selectedProject.deliverables.map((deliverable) => (
                    <div key={deliverable.id} className="bg-background p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-medium text-text-primary">{deliverable.name}</h5>
                          <p className="text-sm text-text-secondary">{deliverable.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${getDeliverableStatusColor(deliverable.status)}`}>
                          {deliverable.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-text-secondary">
                        <span>Due: {deliverable.dueDate}</span>
                        <span>Assigned to: {deliverable.assignedTo}</span>
                      </div>
                      {deliverable.files.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-text-secondary mb-1">Files:</p>
                          <div className="flex flex-wrap gap-1">
                            {deliverable.files.map((file, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-neutral-light text-text-secondary">
                                <FileText className="w-3 h-3 mr-1" />
                                {file}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-text-primary mb-4">Milestones</h4>
                <div className="space-y-3">
                  {selectedProject.milestones.map((milestone) => (
                    <div key={milestone.id} className="bg-background p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-medium text-text-primary">{milestone.name}</h5>
                          <p className="text-sm text-text-secondary">{milestone.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${getMilestoneStatusColor(milestone.status)}`}>
                          {milestone.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-text-secondary">
                        <span>Due: {milestone.dueDate}</span>
                        {milestone.completedDate && (
                          <span>Completed: {milestone.completedDate}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Members */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-text-primary mb-4">Team Members</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.team.map((member, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-2 rounded-full bg-neutral-light text-text-secondary">
                      <Users className="w-4 h-4 mr-2" />
                      {member}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity">
                  Message Team
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
