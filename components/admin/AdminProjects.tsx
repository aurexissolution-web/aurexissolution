import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useTheme } from '../../hooks/useTheme';
import { Project } from '../../types';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  User,
  DollarSign,
  Filter,
  Search,
  TrendingUp,
  Play,
  Pause,
  BarChart3
} from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

const AdminProjects: React.FC = () => {
  const { users } = useAppContext();
  const { theme } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'ongoing' | 'upcoming' | 'past'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' as 'pending' | 'in-progress' | 'completed' | 'cancelled',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: new Date().toISOString().split('T')[0],
    assignedTo: '',
    assignedType: 'customer' as 'customer' | 'employee',
    budget: 0,
    paymentStatus: 'pending' as 'pending' | 'paid' | 'overdue',
    notes: ''
  });

  // Load projects from Firestore
  React.useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectsSnapshot = await collection(db, 'projects');
        const q = collection(db, 'projects');
        const snapshot = await getDocs(q);
        const projectsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Project[];
        setProjects(projectsData);
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  // Categorize projects
  const categorizedProjects = useMemo(() => {
    const now = new Date();
    
    const ongoing = projects.filter(p => p.status === 'in-progress');
    const upcoming = projects.filter(p => p.status === 'pending');
    const past = projects.filter(p => p.status === 'completed' || p.status === 'cancelled');

    return { ongoing, upcoming, past };
  }, [projects]);

  // Filtered projects based on tab and search
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Filter by status category
    if (filterStatus === 'ongoing') {
      filtered = categorizedProjects.ongoing;
    } else if (filterStatus === 'upcoming') {
      filtered = categorizedProjects.upcoming;
    } else if (filterStatus === 'past') {
      filtered = categorizedProjects.past;
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [projects, categorizedProjects, filterStatus, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const completedBudget = projects
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.budget || 0), 0);
    const ongoingBudget = projects
      .filter(p => p.status === 'in-progress')
      .reduce((sum, p) => sum + (p.budget || 0), 0);

    return {
      total: projects.length,
      ongoing: categorizedProjects.ongoing.length,
      upcoming: categorizedProjects.upcoming.length,
      completed: projects.filter(p => p.status === 'completed').length,
      cancelled: projects.filter(p => p.status === 'cancelled').length,
      totalBudget,
      completedBudget,
      ongoingBudget
    };
  }, [projects, categorizedProjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const user = users.find(u => u.uniqueId === formData.assignedTo);
      if (!user) {
        alert('Please select a valid user to assign');
        return;
      }

      if (editingProject) {
        // Update project
        const projectRef = doc(db, 'projects', editingProject.id);
        await updateDoc(projectRef, {
          ...formData,
          budget: parseFloat(formData.budget.toString())
        });

        setProjects(prev => prev.map(p => 
          p.id === editingProject.id 
            ? { ...p, ...formData, budget: parseFloat(formData.budget.toString()) }
            : p
        ));
      } else {
        // Create project
        const adminUser = JSON.parse(localStorage.getItem('user') || '{}');
        const newProject = {
          ...formData,
          budget: parseFloat(formData.budget.toString()),
          createdAt: serverTimestamp(),
          createdBy: adminUser.email || 'admin'
        };

        const docRef = await addDoc(collection(db, 'projects'), newProject);
        setProjects(prev => [...prev, { id: docRef.id, ...newProject, createdAt: new Date() }]);
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0],
        assignedTo: '',
        assignedType: 'customer',
        budget: 0,
        paymentStatus: 'pending',
        notes: ''
      });
      setShowModal(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project. Please try again.');
    }
  };

  const handleDelete = async (projectId: string) => {
    try {
      await deleteDoc(doc(db, 'projects', projectId));
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project. Please try again.');
    }
  };

  const openModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        description: project.description,
        status: project.status,
        priority: project.priority,
        dueDate: project.dueDate,
        assignedTo: project.assignedTo,
        assignedType: project.assignedType,
        budget: project.budget || 0,
        paymentStatus: project.paymentStatus || 'pending',
        notes: project.notes || ''
      });
    } else {
      setEditingProject(null);
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0],
        assignedTo: '',
        assignedType: 'customer',
        budget: 0,
        paymentStatus: 'pending',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5" />;
      case 'in-progress': return <Play className="h-5 w-5" />;
      case 'cancelled': return <XCircle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme === 'dark' ? 'bg-green-900/50 text-green-400 border-green-800' : 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress': return theme === 'dark' ? 'bg-blue-900/50 text-blue-400 border-blue-800' : 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled': return theme === 'dark' ? 'bg-red-900/50 text-red-400 border-red-800' : 'bg-red-100 text-red-700 border-red-200';
      default: return theme === 'dark' ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme === 'dark' ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-700';
      case 'medium': return theme === 'dark' ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-700';
      default: return theme === 'dark' ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Project Management
          </h2>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Track ongoing, upcoming, and past projects
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
            theme === 'dark'
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-xl border ${
          theme === 'dark'
            ? 'bg-blue-900/20 border-blue-800'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs font-medium ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>
                Ongoing Projects
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {stats.ongoing}
              </p>
            </div>
            <Play className={`h-8 w-8 ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
            }`} />
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${
          theme === 'dark'
            ? 'bg-yellow-900/20 border-yellow-800'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs font-medium ${
                theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
              }`}>
                Upcoming Projects
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {stats.upcoming}
              </p>
            </div>
            <Clock className={`h-8 w-8 ${
              theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'
            }`} />
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${
          theme === 'dark'
            ? 'bg-green-900/20 border-green-800'
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs font-medium ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`}>
                Completed
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {stats.completed}
              </p>
            </div>
            <CheckCircle className={`h-8 w-8 ${
              theme === 'dark' ? 'text-green-400' : 'text-green-500'
            }`} />
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${
          theme === 'dark'
            ? 'bg-purple-900/20 border-purple-800'
            : 'bg-purple-50 border-purple-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs font-medium ${
                theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
              }`}>
                Total Budget
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                RM {stats.totalBudget.toFixed(0)}
              </p>
            </div>
            <DollarSign className={`h-8 w-8 ${
              theme === 'dark' ? 'text-purple-400' : 'text-purple-500'
            }`} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>
        <div className="flex gap-2">
          {(['all', 'ongoing', 'upcoming', 'past'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterStatus(filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                filterStatus === filter
                  ? theme === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredProjects.length === 0 ? (
          <div className={`text-center py-12 rounded-lg border ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-gray-400'
              : 'bg-white border-gray-200 text-gray-500'
          }`}>
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No projects found</p>
            <p className="text-xs mt-1">Create a new project to get started</p>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const assignedUser = users.find(u => u.uniqueId === project.assignedTo);
            const daysUntilDue = Math.ceil((new Date(project.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

            return (
              <div
                key={project.id}
                className={`p-6 rounded-xl border transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className={`text-lg font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {project.title}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                        {getStatusIcon(project.status)}
                        <span className="ml-1">{project.status}</span>
                      </span>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                        {project.priority} priority
                      </span>
                    </div>
                    <p className={`text-sm mb-4 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {project.description}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          Assigned To
                        </p>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {assignedUser?.email || project.assignedTo}
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          {project.assignedType}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          Due Date
                        </p>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {new Date(project.dueDate).toLocaleDateString()}
                        </p>
                        <p className={`text-xs ${
                          daysUntilDue < 0 
                            ? 'text-red-500'
                            : daysUntilDue < 7
                            ? 'text-yellow-500'
                            : theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days left`}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          Budget
                        </p>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          RM {project.budget?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          Payment Status
                        </p>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          project.paymentStatus === 'paid'
                            ? theme === 'dark' ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700'
                            : project.paymentStatus === 'overdue'
                            ? theme === 'dark' ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-700'
                            : theme === 'dark' ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {project.paymentStatus || 'pending'}
                        </span>
                      </div>
                    </div>
                    {project.notes && (
                      <div className={`p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                      }`}>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          <strong>Notes:</strong> {project.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => openModal(project)}
                      className={`p-2 rounded-lg transition-all ${
                        theme === 'dark'
                          ? 'bg-blue-900/50 hover:bg-blue-800 text-blue-400'
                          : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                      }`}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className={`p-2 rounded-lg transition-all ${
                        theme === 'dark'
                          ? 'bg-red-900/50 hover:bg-red-800 text-red-400'
                          : 'bg-red-100 hover:bg-red-200 text-red-600'
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`p-6 border-b ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`text-xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {editingProject ? 'Edit Project' : 'New Project'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Project Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description *
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500`}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Priority *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Due Date *
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500`}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Assign To *
                  </label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => {
                      const selectedUser = users.find(u => u.uniqueId === e.target.value);
                      setFormData({ 
                        ...formData, 
                        assignedTo: e.target.value,
                        assignedType: selectedUser?.role === 'employee' ? 'employee' : 'customer'
                      });
                    }}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500`}
                    required
                  >
                    <option value="">Select user...</option>
                    {users.filter(u => u.role !== 'admin').map(user => (
                      <option key={user.id} value={user.uniqueId}>
                        {user.email} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Budget (RM) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Payment Status
                </label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500`}
                  placeholder="Add any additional notes..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProject(null);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Import getDocs at the top
import { getDocs } from 'firebase/firestore';

export default AdminProjects;

