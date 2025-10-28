// components/admin/AdminEmployeeMonitoring.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useTheme } from '../../hooks/useTheme';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Calendar,
  BarChart3,
  Activity,
  Timer,
  UserCheck,
  UserX,
  LogIn,
  LogOut,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Download,
  Plus,
  X,
  UserPlus,
  Edit,
  ListTodo,
  FileText,
  Briefcase,
  AlertCircle,
  CheckSquare,
  Upload,
  Paperclip,
  Trash2
} from 'lucide-react';
import { 
  getAllEmployeesTimeData, 
  subscribeToEmployeeTimeData,
  addEmployeesToMonitoring,
  EmployeeTimeData 
} from '../../services/timeTrackingService';
import {
  Task,
  createTask,
  updateTask,
  deleteTask,
  getAllTasks,
  getEmployeeTasks,
  exportToCSV
} from '../../services/employeeManagementService';
import { 
  uploadTaskFile, 
  deleteTaskFile, 
  formatFileSize, 
  getFileIcon 
} from '../../services/fileUploadService';
import { deleteDoc, doc, collection, query, where, getDocs, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import NotificationBell from './NotificationBell';
import DashboardWidgets from './DashboardWidgets';

interface AdminEmployeeMonitoringProps {
  onNavigateToUsers?: () => void;
}

const AdminEmployeeMonitoring: React.FC<AdminEmployeeMonitoringProps> = ({ onNavigateToUsers }) => {
  const { users } = useAppContext();
  const { theme } = useTheme();
  const [employeeData, setEmployeeData] = useState<EmployeeTimeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('clockInTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [deletingEmployeeId, setDeletingEmployeeId] = useState<string | null>(null);
  
  // Task Management State
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedEmployeeForTask, setSelectedEmployeeForTask] = useState<EmployeeTimeData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    deadline: new Date().toISOString().split('T')[0]
  });
  const [taskFiles, setTaskFiles] = useState<File[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  
  // Employee Profile Edit State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState<EmployeeTimeData | null>(null);
  const [profileFormData, setProfileFormData] = useState({
    status: 'active' as 'active' | 'inactive' | 'on-leave',
    department: '',
    position: ''
  });

  // Employee Tasks View State
  const [showTasksViewModal, setShowTasksViewModal] = useState(false);
  const [selectedEmployeeForTasksView, setSelectedEmployeeForTasksView] = useState<EmployeeTimeData | null>(null);
  const [employeeTasks, setEmployeeTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);


  // Filter employees (exclude admin users, include both 'employee' and 'user' roles)
  const employees = useMemo(() => {
    const filtered = users.filter(user => 
      user.role !== 'admin' && 
      user.role !== undefined && 
      user.email !== undefined
    );
    return filtered;
  }, [users]);

  // Get employees already in monitoring system (those with time tracking records)
  const monitoredEmployeeIds = useMemo(() => {
    // All employees in employeeData are considered monitored (they have time tracking records)
    return new Set(employeeData.map(emp => emp.id));
  }, [employeeData]);

  // Get available employees (not yet in monitoring)
  const availableEmployees = useMemo(() => {
    const available = employees.filter(emp => !monitoredEmployeeIds.has(emp.id));
    return available;
  }, [employees, monitoredEmployeeIds]);

  // Only show employees that have been explicitly added to monitoring (have time tracking records)
  const allEmployeesForDisplay = useMemo(() => {
    return employeeData;
  }, [employeeData]);

  // Filter available employees for modal search
  const filteredAvailableEmployees = useMemo(() => {
    if (!modalSearchTerm) return availableEmployees;
    return availableEmployees.filter(emp =>
      emp.email.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
      emp.displayName?.toLowerCase().includes(modalSearchTerm.toLowerCase())
    );
  }, [availableEmployees, modalSearchTerm]);

  // Load employee data from Firebase
  const loadEmployeeData = async () => {
    setIsLoading(true);
    try {
      const data = await getAllEmployeesTimeData();
      setEmployeeData(data);
    } catch (error) {
      console.error('Error loading employee data:', error);
      setEmployeeData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load employee data
  useEffect(() => {
    loadEmployeeData();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    console.log('🎯 Admin: Setting up real-time employee monitoring');
    
    const unsubscribe = subscribeToEmployeeTimeData((data) => {
      console.log('🎯 Admin: Received employee data update:', {
        count: data.length,
        employees: data.map(emp => ({
          id: emp.id,
          email: emp.email,
          isClockedIn: emp.isClockedIn,
          status: emp.status
        }))
      });
      
      setEmployeeData(data);
      setIsLoading(false);
    });

    return () => {
      console.log('🎯 Admin: Cleaning up employee monitoring subscription');
      unsubscribe();
    };
  }, []);

  // Filter and sort employee data
  const filteredEmployees = useMemo(() => {
    let filtered = allEmployeesForDisplay;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.uniqueId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(emp => {
        if (filterStatus === 'clocked-in') return emp.isClockedIn;
        if (filterStatus === 'clocked-out') return !emp.isClockedIn;
        if (filterStatus === 'active') return emp.status === 'active';
        if (filterStatus === 'inactive') return emp.status === 'inactive';
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'clockInTime':
          aValue = a.clockInTime?.getTime() || 0;
          bValue = b.clockInTime?.getTime() || 0;
          break;
        case 'totalHoursToday':
          aValue = a.totalHoursToday;
          bValue = b.totalHoursToday;
          break;
        case 'totalHoursThisWeek':
          aValue = a.totalHoursThisWeek;
          bValue = b.totalHoursThisWeek;
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        default:
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [allEmployeesForDisplay, searchTerm, filterStatus, sortBy, sortOrder]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalEmployees = allEmployeesForDisplay.length;
    const clockedInCount = allEmployeesForDisplay.filter(emp => emp.isClockedIn).length;
    const clockedOutCount = totalEmployees - clockedInCount;
    const totalHoursToday = allEmployeesForDisplay.reduce((sum, emp) => sum + emp.totalHoursToday, 0);
    const totalHoursThisWeek = allEmployeesForDisplay.reduce((sum, emp) => sum + emp.totalHoursThisWeek, 0);
    const averageHoursToday = totalEmployees > 0 ? totalHoursToday / totalEmployees : 0;

    return {
      totalEmployees,
      clockedInCount,
      clockedOutCount,
      totalHoursToday,
      totalHoursThisWeek,
      averageHoursToday
    };
  }, [allEmployeesForDisplay]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDuration = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const getElapsedTime = (clockInTime: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - clockInTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return formatDuration(diffHours);
  };

  const handleRefresh = async () => {
    await loadEmployeeData();
  };

  const handleExport = () => {
    const csvContent = [
      ['Employee ID', 'Email', 'Role', 'Status', 'Clock In Time', 'Hours Today', 'Hours This Week', 'Last Activity'].join(','),
      ...filteredEmployees.map(emp => [
        emp.uniqueId,
        emp.email,
        emp.role,
        emp.isClockedIn ? 'Clocked In' : 'Clocked Out',
        emp.clockInTime ? formatTime(emp.clockInTime) : 'N/A',
        emp.totalHoursToday.toString(),
        emp.totalHoursThisWeek.toString(),
        emp.lastActivity ? formatTime(emp.lastActivity) : 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employee-monitoring-${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Task Management Handlers
  const handleCreateTask = async () => {
    if (!selectedEmployeeForTask) return;
    
    try {
      setIsUploadingFiles(true);
      
      // Create the task first to get its ID
      const taskId = await createTask({
        employeeId: selectedEmployeeForTask.id,
        employeeEmail: selectedEmployeeForTask.email,
        employeeName: selectedEmployeeForTask.email.split('@')[0],
        title: taskFormData.title,
        description: taskFormData.description,
        status: 'pending',
        priority: taskFormData.priority,
        progress: 0,
        deadline: new Date(taskFormData.deadline),
        assignedBy: 'admin',
        assignedByName: 'Admin',
        attachments: []
      });
      
      // Upload files if any
      const uploadedFiles = [];
      if (taskFiles.length > 0) {
        for (const file of taskFiles) {
          try {
            const uploadedFile = await uploadTaskFile(taskId, file);
            uploadedFiles.push(uploadedFile);
          } catch (error) {
            console.error(`Error uploading file ${file.name}:`, error);
          }
        }
        
        // Update task with uploaded files
        if (uploadedFiles.length > 0) {
          await updateTask(taskId, { attachments: uploadedFiles });
        }
      }
      
      // Reset form and close modal
      setTaskFormData({
        title: '',
        description: '',
        priority: 'medium',
        deadline: new Date().toISOString().split('T')[0]
      });
      setTaskFiles([]);
      setShowTaskModal(false);
      setSelectedEmployeeForTask(null);
    } catch (error) {
      console.error('Error creating task:', error);
      alert(`Error assigning task: ${error.message}`);
    } finally {
      setIsUploadingFiles(false);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setTaskFiles(Array.from(e.target.files));
    }
  };
  
  const handleRemoveFile = (index: number) => {
    setTaskFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Load tasks for specific employee
  const handleViewEmployeeTasks = async (employee: EmployeeTimeData) => {
    setSelectedEmployeeForTasksView(employee);
    setShowTasksViewModal(true);
    setLoadingTasks(true);
    
    try {
      const tasks = await getEmployeeTasks(employee.id);
      setEmployeeTasks(tasks);
    } catch (error) {
      console.error('Error loading employee tasks:', error);
      setEmployeeTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  // Delete a task
  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    setDeletingTaskId(taskId);
    try {
      await deleteTask(taskId);
      // Remove task from local state
      setEmployeeTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      alert(`❌ Failed to delete task: ${error.message || 'Please try again.'}`);
    } finally {
      setDeletingTaskId(null);
    }
  };


  const handleOpenAddEmployeeModal = () => {
    setShowAddEmployeeModal(true);
    setSelectedEmployees([]);
    setModalSearchTerm('');
  };

  const handleCloseAddEmployeeModal = () => {
    setShowAddEmployeeModal(false);
    setSelectedEmployees([]);
    setModalSearchTerm('');
  };

  const handleToggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleAddSelectedEmployees = async () => {
    try {
      if (selectedEmployees.length === 0) {
        return;
      }
      
      await addEmployeesToMonitoring(selectedEmployees);
      await loadEmployeeData();
      handleCloseAddEmployeeModal();
    } catch (error) {
      console.error('Error adding employees to monitoring:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteEmployee = async (employeeId: string, employeeEmail: string) => {
    try {
      setDeletingEmployeeId(employeeId);
      
      // Find all time tracking records for this employee
      const timeRecordsQuery = query(
        collection(db, 'timeTracking'),
        where('employeeId', '==', employeeId)
      );
      const timeRecordsSnapshot = await getDocs(timeRecordsQuery);
      
      // Delete all time tracking records for this employee
      const deletePromises = timeRecordsSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      await Promise.all(deletePromises);
      
      // Refresh the data
      await loadEmployeeData();
    } catch (error) {
      console.error('Error deleting employee from monitoring:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setDeletingEmployeeId(null);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading employee data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 p-6 min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-blue-50'}`}>
      {/* Header with Gradient Background */}
      <div className={`rounded-2xl p-8 shadow-xl ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 border border-gray-700' 
          : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center mb-2">
              <Users className="h-8 w-8 mr-3" />
              Employee Monitoring Dashboard
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-blue-100'} text-sm`}>
              Real-time tracking • {employeeData.length} employees • Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <NotificationBell />
            <button
              onClick={handleOpenAddEmployeeModal}
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg shadow-lg transition-all transform hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-white hover:bg-blue-50 text-blue-600 border-2 border-blue-600'
              }`}
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Add Employee
            </button>
            <button
              onClick={handleRefresh}
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg shadow-lg transition-all transform hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-white hover:bg-indigo-50 text-indigo-600 border-2 border-indigo-600'
              }`}
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg shadow-lg transition-all transform hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-white hover:bg-green-50 text-green-600 border-2 border-green-600'
              }`}
            >
              <Download className="h-5 w-5 mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Widgets */}
      <DashboardWidgets employeeData={allEmployeesForDisplay} />

      {/* Filters and Search - Enhanced Design */}
      <div className={`rounded-xl shadow-lg p-6 ${
        theme === 'dark' 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      }`}>
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                id="employee-search"
                name="employee-search"
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            <select
              id="filter-status"
              name="filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`pl-10 pr-8 py-3 rounded-lg border-2 transition-all appearance-none cursor-pointer ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-500'
              } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
            >
              <option value="all">All Status</option>
              <option value="clocked-in">🟢 Clocked In</option>
              <option value="clocked-out">🔴 Clocked Out</option>
              <option value="active">✅ Active</option>
              <option value="inactive">⚪ Inactive</option>
            </select>
          </div>

          {/* Date Picker */}
          <div className="relative">
            <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              id="selected-date"
              name="selected-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`pl-10 pr-4 py-3 rounded-lg border-2 transition-all ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-green-500'
                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-green-500'
              } focus:outline-none focus:ring-2 focus:ring-green-500/20`}
            />
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <BarChart3 className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <select
                id="sort-by"
                name="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`pl-10 pr-8 py-3 rounded-lg border-2 transition-all appearance-none cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-orange-500'
                } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
              >
                <option value="clockInTime">🕐 Clock In Time</option>
                <option value="totalHoursToday">📊 Hours Today</option>
                <option value="totalHoursThisWeek">📈 Hours This Week</option>
                <option value="email">📧 Email</option>
              </select>
            </div>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className={`px-4 py-3 rounded-lg border-2 font-bold transition-all transform hover:scale-110 ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                  : 'bg-gray-50 border-gray-300 text-gray-900 hover:bg-gray-100'
              }`}
              title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Employee Table - Beautiful Card-Based Design */}
      <div className={`rounded-xl shadow-2xl overflow-hidden ${
        theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={theme === 'dark' ? 'bg-gradient-to-r from-gray-900 to-gray-800' : 'bg-gradient-to-r from-gray-100 to-gray-50'}>
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  👤 Employee
                </th>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  📊 Status
                </th>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  🕐 Clock In
                </th>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  ⏱️ Elapsed
                </th>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  📅 Today
                </th>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  📈 Week
                </th>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  🔔 Activity
                </th>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  ⚙️ Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredEmployees.map((employee, index) => (
                <tr 
                  key={employee.id} 
                  className={`transition-all duration-200 ${
                    theme === 'dark' 
                      ? 'hover:bg-gray-700/50' 
                      : 'hover:bg-blue-50'
                  } ${index % 2 === 0 
                    ? (theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50/50') 
                    : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className={`h-12 w-12 rounded-xl shadow-lg flex items-center justify-center ${
                          employee.isClockedIn 
                            ? 'bg-gradient-to-br from-green-400 to-green-600' 
                            : 'bg-gradient-to-br from-gray-400 to-gray-600'
                        }`}>
                          <Users className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {employee.email.split('@')[0]}
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {employee.uniqueId} • {employee.role}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {employee.isClockedIn ? (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
                        <LogIn className="h-4 w-4 mr-1.5" />
                        Clocked In
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg">
                        <LogOut className="h-4 w-4 mr-1.5" />
                        Clocked Out
                      </span>
                    )}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {employee.clockInTime ? (
                      <div className="flex items-center">
                        <Clock className={`h-4 w-4 mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                        {formatTime(employee.clockInTime)}
                      </div>
                    ) : (
                      <span className={theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}>N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {employee.isClockedIn && employee.clockInTime ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gradient-to-r from-green-100 to-green-200 text-green-800 font-bold">
                        <Timer className="h-4 w-4 mr-1.5 animate-pulse" />
                        {getElapsedTime(employee.clockInTime)}
                      </span>
                    ) : (
                      <span className={`${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg font-bold text-sm ${
                      theme === 'dark' 
                        ? 'bg-purple-900/50 text-purple-300' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      📊 {formatDuration(employee.totalHoursToday)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg font-bold text-sm ${
                      theme === 'dark' 
                        ? 'bg-indigo-900/50 text-indigo-300' 
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      📈 {formatDuration(employee.totalHoursThisWeek)}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {employee.lastActivity ? (
                      <div className="flex flex-col">
                        <span className="font-semibold">{formatTime(employee.lastActivity)}</span>
                        <span className={theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}>
                          {new Date(employee.lastActivity).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewEmployeeTasks(employee)}
                        className={`p-2 rounded-lg transition-all transform hover:scale-110 ${
                          theme === 'dark'
                            ? 'bg-green-900/50 hover:bg-green-800 text-green-400'
                            : 'bg-green-100 hover:bg-green-200 text-green-600'
                        }`}
                        title="View Tasks"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedEmployeeForTask(employee);
                          setShowTaskModal(true);
                        }}
                        className={`p-2 rounded-lg transition-all transform hover:scale-110 ${
                          theme === 'dark'
                            ? 'bg-blue-900/50 hover:bg-blue-800 text-blue-400'
                            : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                        }`}
                        title="Assign Task"
                      >
                        <ListTodo className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedEmployeeForEdit(employee);
                          setShowProfileModal(true);
                        }}
                        className={`p-2 rounded-lg transition-all transform hover:scale-110 ${
                          theme === 'dark'
                            ? 'bg-purple-900/50 hover:bg-purple-800 text-purple-400'
                            : 'bg-purple-100 hover:bg-purple-200 text-purple-600'
                        }`}
                        title="Edit Profile"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteEmployee(employee.id, employee.email)}
                        disabled={deletingEmployeeId === employee.id}
                        className={`p-2 rounded-lg transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
                          theme === 'dark'
                            ? 'bg-red-900/50 hover:bg-red-800 text-red-400'
                            : 'bg-red-100 hover:bg-red-200 text-red-600'
                        }`}
                        title="Remove from Monitoring"
                      >
                        {deletingEmployeeId === employee.id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-500"></div>
                        ) : (
                          <X className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
                ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <Users className="h-12 w-12 text-text-secondary/50" />
                      <div className="text-center">
                        <h3 className="text-lg font-medium text-text-primary mb-2">
                          {allEmployeesForDisplay.length === 0 ? 'No Employees in Monitoring' : 'No Employees Match Your Filters'}
                        </h3>
                        {allEmployeesForDisplay.length === 0 ? (
                          <div className="space-y-2">
                            <p className="text-text-secondary">
                              No employees have been added to monitoring yet. Click "Add Employee" to start monitoring employee time tracking.
                            </p>
                          </div>
                        ) : (
                          <p className="text-text-secondary">
                            Try adjusting your filters or search terms.
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-time Status Indicator */}
      <div className="flex items-center justify-center text-sm text-text-secondary">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          <span>Live monitoring • Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <UserPlus className="h-5 w-5 mr-2" />
                Add Employees to Monitoring
              </h3>
              <button
                onClick={handleCloseAddEmployeeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="modal-employee-search"
                    name="modal-employee-search"
                    type="text"
                    placeholder="Search employees..."
                    value={modalSearchTerm}
                    onChange={(e) => setModalSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Employee List */}
              <div className="max-h-96 overflow-y-auto">
                {filteredAvailableEmployees.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {availableEmployees.length === 0 
                        ? 'No employees available to add. All employees are already being monitored.'
                        : 'No employees match your search.'
                      }
                    </p>
                    {availableEmployees.length === 0 && onNavigateToUsers && (
                      <button
                        onClick={() => {
                          handleCloseAddEmployeeModal();
                          onNavigateToUsers();
                        }}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Create New Employee
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredAvailableEmployees.map((employee) => (
                      <div
                        key={employee.id}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedEmployees.includes(employee.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleToggleEmployeeSelection(employee.id)}
                      >
                        <div className="flex-shrink-0">
                          <div className={`w-4 h-4 border-2 rounded ${
                            selectedEmployees.includes(employee.id)
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedEmployees.includes(employee.id) && (
                              <CheckCircle className="h-3 w-3 text-white" />
                            )}
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <Users className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {employee.displayName || employee.email}
                              </p>
                              <p className="text-sm text-gray-500">{employee.email}</p>
                              <p className="text-xs text-gray-400 capitalize">{employee.role}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Count */}
              {selectedEmployees.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCloseAddEmployeeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSelectedEmployees}
                  disabled={selectedEmployees.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Add {selectedEmployees.length > 0 ? `${selectedEmployees.length} ` : ''}Employee{selectedEmployees.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Assignment Modal */}
      {showTaskModal && selectedEmployeeForTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ListTodo className="h-5 w-5 mr-2" />
                Assign Task to {selectedEmployeeForTask.email}
              </h3>
              <button
                onClick={() => {
                  setShowTaskModal(false);
                  setSelectedEmployeeForTask(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title *
                </label>
                <input
                  id="task-title"
                  name="task-title"
                  type="text"
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="task-description"
                  name="task-description"
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    id="task-priority"
                    name="task-priority"
                    value={taskFormData.priority}
                    onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="task-deadline" className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline
                  </label>
                  <input
                    id="task-deadline"
                    name="task-deadline"
                    type="date"
                    value={taskFormData.deadline}
                    onChange={(e) => setTaskFormData({ ...taskFormData, deadline: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* File Upload Section */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attach Files (Optional)
                </label>
                <div className="flex items-center space-x-2">
                  <label className="flex items-center px-4 py-2 bg-gray-50 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-100 transition-colors">
                    <Upload className="h-4 w-4 mr-2 text-gray-600" />
                    <span className="text-sm text-gray-700">Choose Files</span>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png,.gif,.webp,.zip,.rar"
                    />
                  </label>
                  <span className="text-xs text-gray-500">
                    Max 10MB per file. PDF, DOC, XLS, Images, ZIP
                  </span>
                </div>

                {/* Selected Files List */}
                {taskFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {taskFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                        <div className="flex items-center space-x-2 flex-1">
                          <span className="text-lg">{getFileIcon(file.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-500 hover:text-red-700 p-1 transition-colors"
                          title="Remove file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowTaskModal(false);
                    setSelectedEmployeeForTask(null);
                    setTaskFiles([]);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  disabled={isUploadingFiles}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  disabled={!taskFormData.title.trim() || isUploadingFiles}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {isUploadingFiles ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Paperclip className="h-4 w-4 mr-2" />
                      Assign Task
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee Profile Edit Modal */}
      {showProfileModal && selectedEmployeeForEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-6 border-b ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Edit Employee Profile
              </h3>
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  setSelectedEmployeeForEdit(null);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Employee Info */}
              <div className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <div className="flex items-center space-x-4">
                  <div className={`h-16 w-16 rounded-full flex items-center justify-center ${
                    selectedEmployeeForEdit.isClockedIn 
                      ? 'bg-gradient-to-br from-green-400 to-green-600' 
                      : 'bg-gradient-to-br from-gray-400 to-gray-600'
                  }`}>
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h4 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedEmployeeForEdit.email.split('@')[0]}
                    </h4>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedEmployeeForEdit.email}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      ID: {selectedEmployeeForEdit.uniqueId} • Role: {selectedEmployeeForEdit.role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg text-center ${
                  theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'
                }`}>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                    {selectedEmployeeForEdit.totalHoursToday.toFixed(1)}h
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Today</p>
                </div>
                <div className={`p-4 rounded-lg text-center ${
                  theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-50'
                }`}>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                    {selectedEmployeeForEdit.totalHoursThisWeek.toFixed(1)}h
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>This Week</p>
                </div>
                <div className={`p-4 rounded-lg text-center ${
                  theme === 'dark' ? 'bg-indigo-900/30' : 'bg-indigo-50'
                }`}>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    {selectedEmployeeForEdit.totalHoursThisMonth.toFixed(1)}h
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>This Month</p>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                  selectedEmployeeForEdit.isClockedIn
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                    : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                }`}>
                  {selectedEmployeeForEdit.isClockedIn ? (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Currently Clocked In
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4 mr-2" />
                      Currently Clocked Out
                    </>
                  )}
                </span>
              </div>

              {/* Info Message */}
              <div className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'
              }`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                  ℹ️ To modify employee details like email or role, please go to the{' '}
                  <button
                    onClick={() => {
                      setShowProfileModal(false);
                      if (onNavigateToUsers) onNavigateToUsers();
                    }}
                    className="font-bold underline hover:opacity-80 transition-opacity"
                  >
                    User Management
                  </button>
                  {' '}tab.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h4 className={`font-semibold text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Quick Actions
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setSelectedEmployeeForTask(selectedEmployeeForEdit);
                      setShowProfileModal(false);
                      setShowTaskModal(true);
                    }}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-all ${
                      theme === 'dark'
                        ? 'bg-blue-900/30 border-blue-700 hover:bg-blue-900/50 text-blue-400'
                        : 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-600'
                    }`}
                  >
                    <ListTodo className="h-5 w-5" />
                    <span className="font-medium">Assign Task</span>
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm(`Remove ${selectedEmployeeForEdit.email.split('@')[0]} from monitoring?`)) {
                        await handleDeleteEmployee(selectedEmployeeForEdit.id, selectedEmployeeForEdit.email);
                        setShowProfileModal(false);
                      }
                    }}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-all ${
                      theme === 'dark'
                        ? 'bg-red-900/30 border-red-700 hover:bg-red-900/50 text-red-400'
                        : 'bg-red-50 border-red-200 hover:bg-red-100 text-red-600'
                    }`}
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="font-medium">Remove from Monitoring</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`flex justify-end p-6 border-t ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  setSelectedEmployeeForEdit(null);
                }}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
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
      )}

      {/* Employee Tasks View Modal */}
      {showTasksViewModal && selectedEmployeeForTasksView && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-6 border-b ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div>
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Tasks for {selectedEmployeeForTasksView.email.split('@')[0]}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedEmployeeForTasksView.email} • ID: {selectedEmployeeForTasksView.uniqueId}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowTasksViewModal(false);
                  setSelectedEmployeeForTasksView(null);
                  setEmployeeTasks([]);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {loadingTasks ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : employeeTasks.length === 0 ? (
                <div className="text-center py-12">
                  <ListTodo className={`h-16 w-16 mx-auto mb-4 ${
                    theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                  <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    No tasks assigned yet
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                    Click "Assign Task" to create a new task for this employee
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Task Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className={`p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}>
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {employeeTasks.length}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total</p>
                    </div>
                    <div className={`p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-50'
                    }`}>
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        {employeeTasks.filter(t => t.status === 'pending').length}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
                    </div>
                    <div className={`p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'
                    }`}>
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                        {employeeTasks.filter(t => t.status === 'in-progress').length}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>In Progress</p>
                    </div>
                    <div className={`p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-green-900/30' : 'bg-green-50'
                    }`}>
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                        {employeeTasks.filter(t => t.status === 'completed').length}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-3">
                    {employeeTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-4 rounded-lg border transition-all ${
                          theme === 'dark'
                            ? 'bg-gray-700/30 border-gray-600 hover:border-gray-500'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {task.title}
                            </h4>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                              {task.description}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              task.priority === 'high' 
                                ? 'bg-red-100 text-red-800' 
                                : task.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {task.priority}
                            </span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              task.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : task.status === 'in-progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {task.status}
                            </span>
                            <button
                              onClick={() => handleDeleteTask(task.id, task.title)}
                              disabled={deletingTaskId === task.id}
                              className={`p-2 rounded-lg transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
                                theme === 'dark'
                                  ? 'bg-red-900/50 hover:bg-red-800 text-red-400'
                                  : 'bg-red-100 hover:bg-red-200 text-red-600'
                              }`}
                              title="Delete task"
                            >
                              {deletingTaskId === task.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-500"></div>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                              Deadline
                            </p>
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {new Date(task.deadline.toString()).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                              Progress
                            </p>
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all" 
                                  style={{ width: `${task.progress}%` }}
                                ></div>
                              </div>
                              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {task.progress}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {task.attachments && task.attachments.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                              Attachments ({task.attachments.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {task.attachments.map((file, idx) => (
                                <span 
                                  key={idx}
                                  className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                                    theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  <Paperclip className="h-3 w-3 mr-1" />
                                  {file.fileName}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`flex justify-between items-center p-6 border-t ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => {
                  setSelectedEmployeeForTask(selectedEmployeeForTasksView);
                  setShowTasksViewModal(false);
                  setShowTaskModal(true);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  theme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <ListTodo className="h-4 w-4" />
                <span>Assign New Task</span>
              </button>
              <button
                onClick={() => {
                  setShowTasksViewModal(false);
                  setSelectedEmployeeForTasksView(null);
                  setEmployeeTasks([]);
                }}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
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
      )}

    </div>
  );
};

export default AdminEmployeeMonitoring;
