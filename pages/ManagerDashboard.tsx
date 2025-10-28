import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { useTheme } from '../hooks/useTheme';
import {
  Users,
  TrendingUp,
  Target,
  BarChart3,
  LogOut,
  Home,
  Sun,
  Moon,
  FolderKanban,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Award,
  Calendar
} from 'lucide-react';

const ManagerDashboard: React.FC = () => {
  const { user, projects, users: allUsers, tasks, performanceRatings, attendanceRecords, logout, isLoggingOut } = useAppContext();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'team' | 'tasks' | 'performance' | 'attendance'>('overview');

  // All employees (excluding customers, freelancers, admins)
  const allEmployees = useMemo(() => 
    allUsers.filter(u => 
      u.role !== 'customer' && 
      u.role !== 'freelancer' && 
      u.role !== 'admin' && 
      u.role !== 'hr'
    ),
    [allUsers]
  );
    
    // Active projects
  const activeProjects = useMemo(() => 
    projects.filter(p => p.status === 'in-progress'),
    [projects]
  );

  // All employee-related tasks
  const allEmployeeTasks = useMemo(() => 
    tasks.filter(t => {
      const assignedUser = allUsers.find(u => u.email === t.assignedTo || u.uniqueId === t.assignedTo);
      return assignedUser && assignedUser.role !== 'customer' && assignedUser.role !== 'freelancer';
    }),
    [tasks, allUsers]
  );

  // Task statistics
  const taskStats = useMemo(() => ({
    completed: allEmployeeTasks.filter(t => t.status === 'completed').length,
    pending: allEmployeeTasks.filter(t => t.status === 'pending').length,
    delayed: allEmployeeTasks.filter(t => t.status === 'overdue').length,
    total: allEmployeeTasks.length
  }), [allEmployeeTasks]);

  // Team Performance Score (average of all employee performance ratings)
  const teamPerformanceScore = useMemo(() => {
    if (performanceRatings.length === 0) return 0;
    const totalScore = performanceRatings.reduce((sum, rating) => sum + rating.overallScore, 0);
    return (totalScore / performanceRatings.length).toFixed(1);
  }, [performanceRatings]);

  // Overall Profitability by Project
  const projectProfitability = useMemo(() => 
    projects.map(p => ({
      ...p,
      profit: (p.budget || 0) - ((p.budget || 0) * 0.3) // Simple calculation: 70% profit margin
    })).sort((a, b) => (b.profit || 0) - (a.profit || 0)),
    [projects]
  );

  const totalProfit = useMemo(() => 
    projectProfitability.reduce((sum, p) => sum + (p.profit || 0), 0),
    [projectProfitability]
  );

  // Attendance Summary (all employees)
  const attendanceStats = useMemo(() => {
    const stats = {
      present: 0,
      late: 0,
      onLeave: 0,
      totalRecords: attendanceRecords.length,
      totalHours: 0
    };
    
    attendanceRecords.forEach(record => {
      if (record.status === 'present') stats.present++;
      else if (record.status === 'late') stats.late++;
      else if (record.status === 'on-leave') stats.onLeave++;
      stats.totalHours += record.hoursWorked || 0;
    });

    return stats;
  }, [attendanceRecords]);

  const handleLogout = () => {
    console.log('🟡 LOGOUT BUTTON CLICKED in Manager Dashboard');
    logout();
    console.log('🟡 logout() function called');
    // Note: logout() already handles navigation to homepage
  };

  const formatCurrency = (amount: number) => {
    return `RM ${amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };


  

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex">
        {/* Sidebar */}
        <aside className={`w-64 min-h-screen border-r ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="p-6">
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Manager Dashboard
            </h1>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {user?.email}
            </p>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              Manager
            </p>
          </div>

          {/* Navigation */}
          <nav className="px-4 space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors w-full ${
                activeTab === 'overview'
                  ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors w-full ${
                activeTab === 'projects'
                  ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FolderKanban className="h-5 w-5" />
              <span>All Projects</span>
            </button>

            <button
              onClick={() => setActiveTab('team')}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors w-full ${
                activeTab === 'team'
                  ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users className="h-5 w-5" />
              <span>All Employees</span>
              <span className="ml-auto bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs px-2 py-0.5 rounded-full">
                {allEmployees.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors w-full ${
                activeTab === 'tasks'
                  ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Target className="h-5 w-5" />
              <span>Tasks</span>
            </button>

            <button
              onClick={() => setActiveTab('performance')}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors w-full ${
                activeTab === 'performance'
                  ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Award className="h-5 w-5" />
              <span>Performance</span>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors w-full ${
                activeTab === 'attendance'
                  ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Clock className="h-5 w-5" />
              <span>Attendance</span>
            </button>
          </nav>

          {/* Bottom Actions */}
          <div className="absolute bottom-0 w-64 p-4 space-y-2 border-t">
            <button
              onClick={toggleTheme}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors w-full ${
                theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span>Toggle Theme</span>
            </button>

            <Link
              to="/"
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors w-full ${
                theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>

    <button
              onClick={handleLogout}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors w-full ${
                theme === 'dark' ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-red-50'
              }`}
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
    </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === 'overview' && (
      <div>
              <h2 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Department Overview
        </h2>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className={`p-6 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Employees
                      </p>
                      <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {allEmployees.length}
                      </p>
          </div>
                    <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
                </div>

                <div className={`p-6 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Active Projects
                      </p>
                      <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {activeProjects.length}
          </p>
        </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <FolderKanban className="h-6 w-6 text-green-600" />
                    </div>
            </div>
          </div>

                <div className={`p-6 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Team Performance
                      </p>
                      <p className={`text-3xl font-bold mt-2 text-green-600`}>
                        {teamPerformanceScore}/100
          </p>
        </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Award className="h-6 w-6 text-purple-600" />
                    </div>
            </div>
          </div>

                <div className={`p-6 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Profit
                      </p>
                      <p className={`text-2xl font-bold mt-2 text-green-600`}>
                        {formatCurrency(totalProfit)}
          </p>
        </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <DollarSign className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
            </div>
          </div>

              {/* Task Summary */}
              <div className={`p-6 rounded-lg border mb-8 ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Total Tasks Overview
          </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className={`text-3xl font-bold text-green-600`}>{taskStats.completed}</p>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-3xl font-bold text-yellow-600`}>{taskStats.pending}</p>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-3xl font-bold text-red-600`}>{taskStats.delayed}</p>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Delayed</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{taskStats.total}</p>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Tasks</p>
                  </div>
        </div>
      </div>

      {/* Attendance Summary */}
              <div className={`p-6 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Company Attendance Summary
        </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{attendanceStats.present}</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Days Present</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{attendanceStats.late}</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Days Late</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{attendanceStats.onLeave}</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>On Leave</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{attendanceStats.totalHours.toFixed(0)}h</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Hours</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              <h2 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                All Projects ({projects.length})
              </h2>

              {/* Project Profitability Table */}
              <div className={`p-6 rounded-lg border mb-6 ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Overall Profitability by Project
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Project</th>
                        <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Budget</th>
                        <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Est. Profit</th>
                        <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectProfitability.slice(0, 10).map((project) => (
                        <tr key={project.id} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                          <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {project.title}
                          </td>
                          <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {project.budget ? formatCurrency(project.budget) : 'N/A'}
                          </td>
                          <td className={`py-3 px-4 font-bold text-green-600`}>
                            {project.profit ? formatCurrency(project.profit) : 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              project.status === 'completed' ? 'bg-green-100 text-green-800' :
                              project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {project.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
            </div>
          </div>

              {/* All Projects List */}
              <div className="grid grid-cols-1 gap-4">
                {projects.map((project) => (
                  <div key={project.id} className={`p-6 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {project.title}
                        </h4>
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {project.description}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        project.status === 'completed' ? 'bg-green-100 text-green-800' :
                        project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        Due: {project.dueDate}
                      </span>
                      {project.budget && (
                        <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(project.budget)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'team' && (
              <div>
              <h2 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                All Employees ({allEmployees.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allEmployees.map((employee) => (
                  <div key={employee.id} className={`p-6 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                        <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {employee.name || employee.email}
                        </h4>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {employee.position || employee.role}
                        </p>
                        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          ID: {employee.uniqueId}
                        </p>
                        {employee.team && (
                          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            Team: {employee.team}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div>
              <h2 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                All Tasks ({allEmployeeTasks.length})
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {allEmployeeTasks.map((task) => (
                  <div key={task.id} className={`p-6 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {task.title}
                        </h4>
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {task.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-3 text-xs">
                          <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
                            Assigned to: {task.assignedTo}
                          </span>
                          {task.dueDate && (
                            <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
                              Due: {task.dueDate}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          task.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.priority}
                        </span>
          </div>
        </div>
                  </div>
                ))}
      </div>
    </div>
          )}

          {activeTab === 'performance' && (
            <div>
              <h2 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Team Performance ({performanceRatings.length} ratings)
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {performanceRatings.map((rating) => {
                  const employee = allUsers.find(u => u.id === rating.employeeId || u.email === rating.employeeEmail);
        return (
                    <div key={rating.id} className={`p-6 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <div className="flex items-start justify-between mb-4">
                    <div>
                          <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {employee?.name || rating.employeeEmail}
                      </h4>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Review Date: {new Date(rating.reviewDate).toLocaleDateString()}
                      </p>
                    </div>
                        <div className="text-right">
                          <p className={`text-3xl font-bold ${
                            rating.overallScore >= 80 ? 'text-green-600' :
                            rating.overallScore >= 60 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {rating.overallScore}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            Overall Score
                          </p>
                  </div>
                </div>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {rating.deadlinesMet}%
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            Deadlines Met
                          </p>
                        </div>
                        <div className="text-center">
                          <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {rating.qualityScore}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            Quality
                          </p>
                        </div>
                        <div className="text-center">
                          <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {rating.teamworkScore}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            Teamwork
                          </p>
                        </div>
                        <div className="text-center">
                          <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {rating.innovationScore}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            Innovation
                          </p>
                        </div>
            </div>
          </div>
        );
                })}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div>
              <h2 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Company-Wide Attendance ({attendanceRecords.length} records)
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Employee</th>
                      <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Date</th>
                      <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Clock In</th>
                      <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Clock Out</th>
                      <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Hours</th>
                      <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.slice(0, 50).map((record) => (
                      <tr key={record.id} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {record.employeeName}
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {record.date}
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {record.clockIn || '-'}
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {record.clockOut || '-'}
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {record.hoursWorked ? `${record.hoursWorked.toFixed(2)}h` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            record.status === 'present' ? 'bg-green-100 text-green-800' :
                            record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                            record.status === 'on-leave' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
        </div>
        </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboard;
