import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useTheme } from '../../hooks/useTheme';
import { 
  Search, 
  Filter, 
  Calendar,
  FileText,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Eye,
  Trash2,
  Plus,
  X,
  Users,
  Briefcase,
  Target,
  Activity,
  BarChart3,
  Upload,
  Paperclip,
  RefreshCw
} from 'lucide-react';
import { 
  subscribeToTasks, 
  Task,
  createTask,
  updateTask,
  deleteTask
} from '../../services/employeeManagementService';
import { Timestamp } from 'firebase/firestore';

const AdminFreelancerMonitoring: React.FC = () => {
  const { users, projects } = useAppContext();
  const { theme } = useTheme();
  
  // Filter freelancers only
  const freelancers = useMemo(() => 
    users.filter(u => u.role === 'freelancer' && u.isActive),
    [users]
  );

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedFreelancer, setSelectedFreelancer] = useState<any>(null);
  const [freelancerTasks, setFreelancerTasks] = useState<Task[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTaskViewModal, setShowTaskViewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sortBy, setSortBy] = useState<string>('name');
  
  // Commission modal state
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [selectedFreelancerForCommission, setSelectedFreelancerForCommission] = useState<any>(null);
  
  // Profile view modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedFreelancerForProfile, setSelectedFreelancerForProfile] = useState<any>(null);
  
  // Task creation form
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    budget: 0,
    commissionRate: 10, // Default 10%
    commissionAmount: 0
  });
  
  // Task files state
  const [taskFiles, setTaskFiles] = useState<Array<{fileName: string, fileUrl: string, fileSize: number}>>([]);

  // Subscribe to tasks when freelancer is selected
  useEffect(() => {
    if (!selectedFreelancer) return;

    const unsubscribe = subscribeToTasks(selectedFreelancer.id, (tasks) => {
      setFreelancerTasks(tasks);
    });

    return () => unsubscribe();
  }, [selectedFreelancer]);

  // Filter freelancers
  const filteredFreelancers = useMemo(() => {
    let filtered = freelancers.filter(freelancer => {
      const matchesSearch = 
        freelancer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        freelancer.uniqueId.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.email.localeCompare(b.email);
      } else if (sortBy === 'commission') {
        return (b.commissionRate || 0) - (a.commissionRate || 0);
      }
      return 0;
    });

    return filtered;
  }, [freelancers, searchTerm, sortBy]);

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const totalFreelancers = freelancers.length;
    const totalProjects = projects.filter(p => 
      freelancers.some(f => f.uniqueId === p.assignedTo && p.assignedType === 'employee')
    ).length;
    const activeProjects = projects.filter(p => 
      freelancers.some(f => f.uniqueId === p.assignedTo && p.assignedType === 'employee') && 
      p.status === 'in-progress'
    ).length;
    const completedProjects = projects.filter(p => 
      freelancers.some(f => f.uniqueId === p.assignedTo && p.assignedType === 'employee') && 
      p.status === 'completed'
    ).length;
    
    const totalEarned = freelancers.reduce((sum, f) => sum + (f.totalEarned || 0), 0);
    const totalPaid = freelancers.reduce((sum, f) => sum + (f.totalPaid || 0), 0);
    const totalPending = totalEarned - totalPaid;
    
    return {
      totalFreelancers,
      totalProjects,
      activeProjects,
      completedProjects,
      totalEarned,
      totalPaid,
      totalPending
    };
  }, [freelancers, projects]);

  // Calculate freelancer stats
  const getFreelancerStats = (freelancer: any) => {
    const freelancerProjects = projects.filter(
      p => p.assignedTo === freelancer.uniqueId && p.assignedType === 'employee'
    );
    
    const totalEarned = freelancer.totalEarned || 0;
    const totalPaid = freelancer.totalPaid || 0;
    const pending = totalEarned - totalPaid;
    
    return {
      totalProjects: freelancerProjects.length,
      activeProjects: freelancerProjects.filter(p => p.status === 'in-progress').length,
      completedProjects: freelancerProjects.filter(p => p.status === 'completed').length,
      totalEarned,
      totalPaid,
      pending,
      commissionRate: freelancer.commissionRate || 0
    };
  };

  // Task statistics
  const taskStats = useMemo(() => {
    if (!selectedFreelancer) return { total: 0, pending: 0, inProgress: 0, completed: 0 };
    
    return {
      total: freelancerTasks.length,
      pending: freelancerTasks.filter(t => t.status === 'pending').length,
      inProgress: freelancerTasks.filter(t => t.status === 'in-progress').length,
      completed: freelancerTasks.filter(t => t.status === 'completed').length
    };
  }, [freelancerTasks, selectedFreelancer]);

  const handleCreateTask = async () => {
    if (!selectedFreelancer || !taskForm.title || !taskForm.deadline) {
      alert('Please fill in all required fields');
      return;
    }

    // Calculate commission amount
    const calculatedCommission = taskForm.budget > 0 && taskForm.commissionRate > 0
      ? (taskForm.budget * taskForm.commissionRate) / 100
      : taskForm.commissionAmount || 0;

    try {
      await createTask({
        title: taskForm.title,
        description: taskForm.description,
        employeeId: selectedFreelancer.id,
        employeeName: selectedFreelancer.email,
        employeeEmail: selectedFreelancer.email,
        assignedTo: selectedFreelancer.email, // CRITICAL: So freelancer can see it!
        deadline: new Date(taskForm.deadline),
        status: 'pending',
        progress: 0,
        priority: taskForm.priority,
        assignedBy: 'Admin',
        assignedByName: 'Admin',
        adminFiles: taskFiles, // Admin uploaded files
        freelancerSubmissions: [], // Freelancer submissions
        attachments: taskFiles, // Keep for backward compatibility
        dueDate: new Date(taskForm.deadline).toISOString(), // Additional field for compatibility
        // Commission fields
        budget: taskForm.budget,
        commissionRate: taskForm.commissionRate,
        commissionAmount: calculatedCommission
      });

      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', deadline: '', priority: 'medium', budget: 0, commissionRate: 10, commissionAmount: 0 });
      setTaskFiles([]);
      alert('✅ Task assigned successfully with commission details!');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles: Array<{fileName: string, fileUrl: string, fileSize: number}> = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        newFiles.push({
          fileName: file.name,
          fileUrl: e.target?.result as string,
          fileSize: file.size
        });

        if (newFiles.length === files.length) {
          setTaskFiles([...taskFiles, ...newFiles]);
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  };

  const getDeadlineDate = (deadline: any): Date => {
    if (!deadline) return new Date();
    if (deadline instanceof Timestamp) return deadline.toDate();
    if (deadline instanceof Date) return deadline;
    if (typeof deadline === 'string') return new Date(deadline);
    return new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              🎯 Freelancer Task Progression & Monitoring
            </h2>
            <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded">
              ✅ FILE EXCHANGE ENABLED
            </span>
          </div>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Track freelancer tasks, progress updates, submissions, and commissions • Upload/Download Files
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-6 rounded-xl border-2 transition-all ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-teal-500'
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-teal-400'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Freelancers
              </p>
              <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {overallStats.totalFreelancers}
              </p>
            </div>
            <div className="p-3 bg-teal-100 rounded-lg">
              <Users className="h-8 w-8 text-teal-600" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border-2 transition-all ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-blue-500'
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-blue-400'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Projects
              </p>
              <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {overallStats.activeProjects}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border-2 transition-all ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-green-500'
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-green-400'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Earned
              </p>
              <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                RM {overallStats.totalEarned.toFixed(0)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border-2 transition-all ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-orange-500'
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-orange-400'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Pending Payment
              </p>
              <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                RM {overallStats.totalPending.toFixed(0)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={`p-6 rounded-xl border-2 ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                id="freelancer-search"
                name="freelancer-search"
                type="text"
                placeholder="Search freelancers by email or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-teal-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500'
                } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
              />
            </div>
          </div>

          {/* Sort */}
          <div className="relative">
            <BarChart3 className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <select
              id="sort-by"
              name="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`pl-10 pr-8 py-3 rounded-lg border-2 transition-all appearance-none cursor-pointer ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-teal-500'
                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-teal-500'
              } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
            >
              <option value="name">Sort by Name</option>
              <option value="commission">Sort by Commission</option>
            </select>
          </div>
        </div>
      </div>

      {/* Freelancers Table */}
      <div className={`rounded-xl border-2 overflow-hidden ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Freelancer
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Projects
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Commission
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Earnings
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Pending
                </th>
                <th className={`px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredFreelancers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Users className={`h-12 w-12 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        No freelancers found
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        Create freelancer accounts in User Management
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFreelancers.map(freelancer => {
                  const stats = getFreelancerStats(freelancer);
                  const isSelected = selectedFreelancer?.id === freelancer.id;
                  
                  return (
                    <tr
                      key={freelancer.id}
                      onClick={() => setSelectedFreelancer(freelancer)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? theme === 'dark'
                            ? 'bg-teal-900/30'
                            : 'bg-teal-50'
                          : theme === 'dark'
                          ? 'hover:bg-gray-700'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                            theme === 'dark' ? 'bg-teal-900 text-teal-300' : 'bg-teal-100 text-teal-700'
                          }`}>
                            {freelancer.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {freelancer.email}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {freelancer.uniqueId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {stats.activeProjects}
                          </span>
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                            / {stats.totalProjects}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          theme === 'dark' ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {stats.commissionRate}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                          RM {stats.totalEarned.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
                          RM {stats.pending.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFreelancerForCommission(freelancer);
                              setShowCommissionModal(true);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              theme === 'dark'
                                ? 'bg-green-900/30 hover:bg-green-900/50 text-green-400'
                                : 'bg-green-100 hover:bg-green-200 text-green-600'
                            }`}
                            title="View Commission"
                          >
                            <DollarSign className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFreelancerForProfile(freelancer);
                              setShowProfileModal(true);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              theme === 'dark'
                                ? 'bg-blue-900/30 hover:bg-blue-900/50 text-blue-400'
                                : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                            }`}
                            title="View Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Are you sure you want to remove ${freelancer.email} from monitoring? This will not delete the user account.`)) {
                                // Just deselect if it's the selected freelancer
                                if (selectedFreelancer?.id === freelancer.id) {
                                  setSelectedFreelancer(null);
                                }
                                alert('Freelancer removed from monitoring view.');
                              }
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              theme === 'dark'
                                ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400'
                                : 'bg-red-100 hover:bg-red-200 text-red-600'
                            }`}
                            title="Remove from Monitoring"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Freelancer Details */}
      {selectedFreelancer && (
        <div className={`p-6 rounded-xl border-2 ${
          theme === 'dark'
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {selectedFreelancer.email}
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Tasks & Submissions Management
              </p>
            </div>
            <button
              onClick={() => setShowTaskModal(true)}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Assign Task
            </button>
          </div>

          {/* Task Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Tasks
                </p>
              </div>
              <p className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {taskStats.total}
              </p>
            </div>

            <div className={`p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Pending
                </p>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {taskStats.pending}
              </p>
            </div>

            <div className={`p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  In Progress
                </p>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {taskStats.inProgress}
              </p>
            </div>

            <div className={`p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Completed
                </p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {taskStats.completed}
              </p>
            </div>
          </div>

          {/* Task Progression Overview */}
          <div className="mb-6 p-6 rounded-xl border-2 bg-gradient-to-br from-teal-900/20 to-blue-900/20 border-teal-700">
            <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <TrendingUp className="h-6 w-6 text-teal-400" />
              Overall Task Progression
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'}`}>
                <p className={`text-xs font-medium mb-2 ${theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}`}>
                  Average Progress
                </p>
                <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {freelancerTasks.length > 0 
                    ? Math.round(freelancerTasks.reduce((sum, t) => sum + (t.progress || 0), 0) / freelancerTasks.length)
                    : 0}%
                </p>
              </div>

              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'}`}>
                <p className={`text-xs font-medium mb-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                  On Track
                </p>
                <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {freelancerTasks.filter(t => {
                    const deadline = getDeadlineDate(t.deadline);
                    return t.status === 'in-progress' && deadline > new Date();
                  }).length}
                </p>
              </div>

              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'}`}>
                <p className={`text-xs font-medium mb-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                  Completed This Week
                </p>
                <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {freelancerTasks.filter(t => t.status === 'completed').length}
                </p>
              </div>

              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'}`}>
                <p className={`text-xs font-medium mb-2 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
                  Needs Attention
                </p>
                <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {freelancerTasks.filter(t => {
                    const deadline = getDeadlineDate(t.deadline);
                    return deadline < new Date() && t.status !== 'completed';
                  }).length}
                </p>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-3">
            <h4 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Assigned Tasks & Progress Updates
            </h4>
            
            {freelancerTasks.length === 0 ? (
              <div className={`p-8 text-center rounded-lg border-2 border-dashed ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
              }`}>
                <FileText className={`h-12 w-12 mx-auto mb-3 ${
                  theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                }`} />
                <p className={`font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  No tasks assigned yet
                </p>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  Click "Assign Task" to create one
                </p>
              </div>
            ) : (
              freelancerTasks.map(task => {
                const deadline = getDeadlineDate(task.deadline);
                const isOverdue = deadline < new Date() && task.status !== 'completed';
                
                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 hover:border-teal-500'
                        : 'bg-gray-50 border-gray-200 hover:border-teal-400'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h5 className={`font-semibold text-lg ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {task.title}
                        </h5>
                        <p className={`text-sm mt-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {task.description}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-3 ${
                        task.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : task.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>

                    {/* Progress Bar - NEW! */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-xs font-medium ${theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}`}>
                          Task Progress
                        </span>
                        <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {task.progress || 0}%
                        </span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${
                        theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
                      }`}>
                        <div 
                          className={`h-full transition-all duration-500 ${
                            (task.progress || 0) >= 100 ? 'bg-green-500' :
                            (task.progress || 0) >= 75 ? 'bg-blue-500' :
                            (task.progress || 0) >= 50 ? 'bg-yellow-500' :
                            (task.progress || 0) > 0 ? 'bg-orange-500' : 'bg-gray-500'
                          }`}
                          style={{ width: `${task.progress || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Progress Notes - NEW! */}
                    {task.progressNotes && (
                      <div className={`mb-3 p-3 rounded-lg border-l-4 ${
                        theme === 'dark'
                          ? 'bg-blue-900/20 border-blue-500'
                          : 'bg-blue-50 border-blue-400'
                      }`}>
                        <p className={`text-xs font-semibold mb-1 ${
                          theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                        }`}>
                          Latest Update from Freelancer:
                        </p>
                        <p className={`text-xs ${
                          theme === 'dark' ? 'text-blue-200' : 'text-blue-700'
                        }`}>
                          {task.progressNotes}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t ${
                      theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                    }">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-teal-500" />
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                            {deadline.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-teal-500" />
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                            {task.progress}%
                          </span>
                        </div>
                        {task.attachments && task.attachments.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Paperclip className="h-4 w-4 text-teal-500" />
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                              {task.attachments.length} files
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setShowTaskViewModal(true);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark'
                              ? 'bg-blue-900/30 hover:bg-blue-900/50 text-blue-400'
                              : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                          }`}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id!)}
                          className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark'
                              ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400'
                              : 'bg-red-100 hover:bg-red-200 text-red-600'
                          }`}
                          title="Delete Task"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {isOverdue && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <p className="text-xs text-red-600 font-medium">
                          This task is overdue!
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Assign New Task
                </h3>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-teal-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-teal-500'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                    placeholder="Enter task title"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Description
                  </label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-teal-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-teal-500'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                    placeholder="Enter task description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Deadline *
                    </label>
                    <input
                      type="date"
                      value={taskForm.deadline}
                      onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-teal-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-teal-500'
                      } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Priority
                    </label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-teal-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-teal-500'
                      } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                {/* Commission Details */}
                <div className={`p-4 rounded-lg border-2 ${
                  theme === 'dark' ? 'bg-green-900/10 border-green-700/50' : 'bg-green-50 border-green-200'
                }`}>
                  <h4 className={`text-sm font-semibold mb-3 ${
                    theme === 'dark' ? 'text-green-300' : 'text-green-700'
                  }`}>
                    💰 Commission Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Task Budget (RM)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={taskForm.budget}
                        onChange={(e) => setTaskForm({ ...taskForm, budget: parseFloat(e.target.value) || 0 })}
                        className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-green-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                        } focus:outline-none focus:ring-2 focus:ring-green-500/20`}
                        placeholder="1000.00"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Commission Rate (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={taskForm.commissionRate}
                        onChange={(e) => setTaskForm({ ...taskForm, commissionRate: parseFloat(e.target.value) || 0 })}
                        className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-green-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                        } focus:outline-none focus:ring-2 focus:ring-green-500/20`}
                        placeholder="10"
                      />
                    </div>
                  </div>
                  {taskForm.budget > 0 && taskForm.commissionRate > 0 && (
                    <div className={`mt-3 p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                    }`}>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Commission Amount: <span className="font-bold text-green-500">
                          RM {((taskForm.budget * taskForm.commissionRate) / 100).toFixed(2)}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* File Upload Section */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Attach Files for Freelancer
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    theme === 'dark'
                      ? 'border-gray-600 hover:border-teal-500 bg-gray-700/30'
                      : 'border-gray-300 hover:border-teal-400 bg-gray-50'
                  }`}>
                    <Upload className={`h-10 w-10 mx-auto mb-3 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Upload task files for freelancer to download
                    </p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="admin-file-upload"
                    />
                    <label
                      htmlFor="admin-file-upload"
                      className="inline-block px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg cursor-pointer transition-colors text-sm font-medium"
                    >
                      Choose Files
                    </label>
                  </div>

                  {taskFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {taskFiles.map((file, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <div className="flex items-center gap-3">
                            <Paperclip className="h-5 w-5 text-teal-500" />
                            <div>
                              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {file.fileName}
                              </p>
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {(file.fileSize / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setTaskFiles(taskFiles.filter((_, i) => i !== idx))}
                            className={`p-1 rounded transition-colors ${
                              theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                            }`}
                          >
                            <X className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }">
                  <button
                    onClick={() => setShowTaskModal(false)}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateTask}
                    className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Assign Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Task Modal */}
      {showTaskViewModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Task Details
                </h3>
                <button
                  onClick={() => setShowTaskViewModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className={`text-xl font-semibold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {selectedTask.title}
                  </h4>
                  <p className={`text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedTask.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Status
                    </p>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      selectedTask.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : selectedTask.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {selectedTask.status}
                    </span>
                  </div>

                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Progress
                    </p>
                    <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedTask.progress}%
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Deadline
                    </p>
                    <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {getDeadlineDate(selectedTask.deadline).toLocaleDateString()}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Priority
                    </p>
                    <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedTask.priority}
                    </p>
                  </div>
                </div>

                {/* Admin Files Section */}
                {selectedTask.adminFiles && selectedTask.adminFiles.length > 0 && (
                  <div>
                    <h5 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      <Upload className="h-5 w-5 text-teal-500" />
                      Task Files from Admin ({selectedTask.adminFiles.length})
                    </h5>
                    <div className="space-y-2">
                      {selectedTask.adminFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                            theme === 'dark'
                              ? 'bg-teal-900/20 border-teal-700'
                              : 'bg-teal-50 border-teal-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-teal-100 rounded-lg">
                              <FileText className="h-6 w-6 text-teal-600" />
                            </div>
                            <div>
                              <p className={`font-medium ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}>
                                {file.fileName}
                              </p>
                              <p className={`text-sm ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {(file.fileSize / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = file.fileUrl;
                              link.download = file.fileName;
                              link.click();
                            }}
                            className="p-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Freelancer Submissions Section */}
                {selectedTask.freelancerSubmissions && selectedTask.freelancerSubmissions.length > 0 && (
                  <div>
                    <h5 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Freelancer Submissions ({selectedTask.freelancerSubmissions.length})
                    </h5>
                    <div className="space-y-2">
                      {selectedTask.freelancerSubmissions.map((file, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                            theme === 'dark'
                              ? 'bg-green-900/20 border-green-700'
                              : 'bg-green-50 border-green-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <FileText className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <p className={`font-medium ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}>
                                {file.fileName}
                              </p>
                              <p className={`text-sm ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {(file.fileSize / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = file.fileUrl;
                              link.download = file.fileName;
                              link.click();
                            }}
                            className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                            title="Download Submission"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTask.submissionNotes && (
                  <div>
                    <h5 className={`text-lg font-semibold mb-3 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Submission Notes
                    </h5>
                    <div className={`p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'
                    }`}>
                      {selectedTask.submissionNotes}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6 pt-6 border-t ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }">
                <button
                  onClick={() => setShowTaskViewModal(false)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Commission Modal */}
      {showCommissionModal && selectedFreelancerForCommission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Commission Details - {selectedFreelancerForCommission.email}
                </h3>
                <button
                  onClick={() => setShowCommissionModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {(() => {
                const stats = getFreelancerStats(selectedFreelancerForCommission);
                const freelancerProjects = projects.filter(
                  p => p.assignedTo === selectedFreelancerForCommission.uniqueId && p.assignedType === 'employee'
                );

                return (
                  <div className="space-y-6">
                    {/* Commission Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={`p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-teal-900/20 border border-teal-800' : 'bg-teal-50 border border-teal-200'
                      }`}>
                        <p className={`text-xs font-medium ${
                          theme === 'dark' ? 'text-teal-400' : 'text-teal-600'
                        }`}>
                          Commission Rate
                        </p>
                        <p className={`text-2xl font-bold mt-1 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {stats.commissionRate}%
                        </p>
                      </div>

                      <div className={`p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'
                      }`}>
                        <p className={`text-xs font-medium ${
                          theme === 'dark' ? 'text-green-400' : 'text-green-600'
                        }`}>
                          Total Earned
                        </p>
                        <p className={`text-2xl font-bold mt-1 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          RM {stats.totalEarned.toFixed(2)}
                        </p>
                      </div>

                      <div className={`p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
                      }`}>
                        <p className={`text-xs font-medium ${
                          theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        }`}>
                          Total Paid
                        </p>
                        <p className={`text-2xl font-bold mt-1 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          RM {stats.totalPaid.toFixed(2)}
                        </p>
                      </div>

                      <div className={`p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-orange-900/20 border border-orange-800' : 'bg-orange-50 border border-orange-200'
                      }`}>
                        <p className={`text-xs font-medium ${
                          theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                        }`}>
                          Pending
                        </p>
                        <p className={`text-2xl font-bold mt-1 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          RM {stats.pending.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Project Commission History */}
                    <div>
                      <h4 className={`text-lg font-semibold mb-4 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Project Commission History
                      </h4>

                      {freelancerProjects.length === 0 ? (
                        <p className={`text-center py-8 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          No projects assigned yet.
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className={theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}>
                              <tr>
                                <th className={`px-4 py-3 text-left text-xs font-semibold ${
                                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                  Project
                                </th>
                                <th className={`px-4 py-3 text-left text-xs font-semibold ${
                                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                  Status
                                </th>
                                <th className={`px-4 py-3 text-right text-xs font-semibold ${
                                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                  Budget
                                </th>
                                <th className={`px-4 py-3 text-right text-xs font-semibold ${
                                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                  Commission
                                </th>
                                <th className={`px-4 py-3 text-center text-xs font-semibold ${
                                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                  Payment
                                </th>
                              </tr>
                            </thead>
                            <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                              {freelancerProjects.map(project => (
                                <tr key={project.id}>
                                  <td className={`px-4 py-3 text-sm ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                  }`}>
                                    {project.title}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                      project.status === 'completed'
                                        ? 'bg-green-100 text-green-700'
                                        : project.status === 'in-progress'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}>
                                      {project.status}
                                    </span>
                                  </td>
                                  <td className={`px-4 py-3 text-right text-sm font-medium ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                  }`}>
                                    RM {project.budget?.toFixed(2) || '0.00'}
                                  </td>
                                  <td className={`px-4 py-3 text-right text-sm font-bold ${
                                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                                  }`}>
                                    RM {project.commissionAmount?.toFixed(2) || '0.00'}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                      project.paymentStatus === 'paid'
                                        ? 'bg-green-100 text-green-700'
                                        : project.paymentStatus === 'overdue'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                      {project.paymentStatus || 'pending'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end mt-6 pt-6 border-t ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }">
                <button
                  onClick={() => setShowCommissionModal(false)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && selectedFreelancerForProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Freelancer Profile
                </h3>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {(() => {
                const stats = getFreelancerStats(selectedFreelancerForProfile);

                return (
                  <div className="space-y-6">
                    {/* Profile Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <p className={`text-sm font-medium mb-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Email
                        </p>
                        <p className={`text-lg font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {selectedFreelancerForProfile.email}
                        </p>
                      </div>

                      <div className={`p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <p className={`text-sm font-medium mb-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Unique ID
                        </p>
                        <p className={`text-lg font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {selectedFreelancerForProfile.uniqueId}
                        </p>
                      </div>

                      <div className={`p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <p className={`text-sm font-medium mb-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Role
                        </p>
                        <p className={`text-lg font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          Freelancer
                        </p>
                      </div>

                      <div className={`p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-teal-900/20 border border-teal-800' : 'bg-teal-50 border border-teal-200'
                      }`}>
                        <p className={`text-sm font-medium mb-1 ${
                          theme === 'dark' ? 'text-teal-400' : 'text-teal-600'
                        }`}>
                          Commission Rate
                        </p>
                        <p className={`text-lg font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {stats.commissionRate}%
                        </p>
                      </div>
                    </div>

                    {/* Project Stats */}
                    <div>
                      <h4 className={`text-lg font-semibold mb-4 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Project Statistics
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className={`p-4 rounded-lg text-center ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                        }`}>
                          <p className={`text-2xl font-bold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {stats.totalProjects}
                          </p>
                          <p className={`text-sm mt-1 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Total Projects
                          </p>
                        </div>

                        <div className={`p-4 rounded-lg text-center ${
                          theme === 'dark' ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
                        }`}>
                          <p className="text-2xl font-bold text-blue-600">
                            {stats.activeProjects}
                          </p>
                          <p className={`text-sm mt-1 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Active
                          </p>
                        </div>

                        <div className={`p-4 rounded-lg text-center ${
                          theme === 'dark' ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'
                        }`}>
                          <p className="text-2xl font-bold text-green-600">
                            {stats.completedProjects}
                          </p>
                          <p className={`text-sm mt-1 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Completed
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Earnings Summary */}
                    <div>
                      <h4 className={`text-lg font-semibold mb-4 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Earnings Summary
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className={`p-4 rounded-lg text-center ${
                          theme === 'dark' ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'
                        }`}>
                          <p className="text-xl font-bold text-green-600">
                            RM {stats.totalEarned.toFixed(2)}
                          </p>
                          <p className={`text-sm mt-1 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Total Earned
                          </p>
                        </div>

                        <div className={`p-4 rounded-lg text-center ${
                          theme === 'dark' ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
                        }`}>
                          <p className="text-xl font-bold text-blue-600">
                            RM {stats.totalPaid.toFixed(2)}
                          </p>
                          <p className={`text-sm mt-1 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Paid
                          </p>
                        </div>

                        <div className={`p-4 rounded-lg text-center ${
                          theme === 'dark' ? 'bg-orange-900/20 border border-orange-800' : 'bg-orange-50 border border-orange-200'
                        }`}>
                          <p className="text-xl font-bold text-orange-600">
                            RM {stats.pending.toFixed(2)}
                          </p>
                          <p className={`text-sm mt-1 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Pending
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end mt-6 pt-6 border-t ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFreelancerMonitoring;
