import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { useTheme } from '../hooks/useTheme';
import { 
  ListTodo, 
  Clock, 
  Target,
  LogOut,
  Home,
  Sun,
  Moon,
  CheckCircle,
  Calendar,
  User,
  Users,
  Award,
  TrendingUp,
  AlertCircle,
  XCircle,
  Briefcase
} from 'lucide-react';

const NormalEmployeeDashboard: React.FC = () => {
  const { user, tasks, projects, timeRecords, users, attendanceRecords, performanceRatings, logout , isLoggingOut } = useAppContext();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'attendance' | 'performance'>('overview');

  // Find team lead
  const teamLead = useMemo(() => 
    users.find(u => u.email === user?.reportsTo),
    [users, user]
  );

  // Filter user's tasks
  const myTasks = useMemo(() => 
    tasks.filter(t => t.assignedTo === user?.email || t.assignedTo === user?.uniqueId),
    [tasks, user]
  );

  // Task statistics
  const taskStats = useMemo(() => ({
    completed: myTasks.filter(t => t.status === 'completed').length,
    pending: myTasks.filter(t => t.status === 'pending').length,
    inProgress: myTasks.filter(t => t.status === 'in-progress').length,
    overdue: myTasks.filter(t => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < new Date() && t.status !== 'completed';
    }).length
  }), [myTasks]);

  // Filter user's time records
  const myTimeRecords = useMemo(() => 
    timeRecords.filter(t => t.employeeId === user?.id || t.employeeId === user?.uniqueId),
    [timeRecords, user]
  );

  // Filter user's attendance
  const myAttendance = useMemo(() => 
    attendanceRecords.filter(a => a.employeeId === user?.id || a.employeeEmail === user?.email),
    [attendanceRecords, user]
  );

  // Attendance statistics
  const attendanceStats = useMemo(() => ({
    present: myAttendance.filter(a => a.status === 'present').length,
    late: myAttendance.filter(a => a.status === 'late').length,
    onLeave: myAttendance.filter(a => a.status === 'on-leave').length,
    totalDays: myAttendance.length
  }), [myAttendance]);

  // Get user's performance rating
  const myPerformance = useMemo(() => 
    performanceRatings.find(p => p.employeeId === user?.id || p.employeeEmail === user?.email),
    [performanceRatings, user]
  );

  // Get user's projects
  const myProjects = useMemo(() => 
    projects.filter(p => 
      p.assignedTo === user?.uniqueId || 
      p.createdBy === user?.email ||
      myTasks.some(t => t.title?.toLowerCase().includes(p.title?.toLowerCase()))
    ),
    [projects, user, myTasks]
  );

  // Calculate total hours worked
  const totalHours = useMemo(() => 
    myTimeRecords.reduce((sum, record) => sum + (record.hours || 0), 0),
    [myTimeRecords]
  );

  const handleLogout = () => {
    console.log('🟡 LOGOUT BUTTON CLICKED in Normal Employee Dashboard');
    logout();
    console.log('🟡 logout() function called in Normal Employee Dashboard');
    // Note: logout() already handles navigation to homepage
  };




  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'average': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-red-600 bg-red-100';
    }
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
              Employee Dashboard
            </h1>
            <div className="mt-4 space-y-2">
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="font-medium">{user?.name || user?.email}</span>
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                {user?.position || 'Employee'}
              </p>
              {user?.team && (
                <div className="flex items-center space-x-2 mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {user.team}
                  </span>
                </div>
              )}
              {teamLead && (
                <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    <span className="font-medium">Team Lead:</span>
                  </p>
                  <p className="text-xs text-purple-800 dark:text-purple-300 mt-1">
                    {teamLead.email}
                  </p>
                </div>
              )}
            </div>
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
              <Target className="h-5 w-5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors w-full ${
                activeTab === 'tasks'
                  ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ListTodo className="h-5 w-5" />
              <span>My Tasks</span>
              {myTasks.length > 0 && (
                <span className="ml-auto bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs px-2 py-0.5 rounded-full">
                  {myTasks.length}
                </span>
              )}
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
                Dashboard Overview
              </h2>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className={`p-6 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        My Tasks
                      </p>
                      <p className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {myTasks.length}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {taskStats.completed} completed
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <ListTodo className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Projects
                      </p>
                      <p className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {myProjects.length}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Ongoing projects
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <Briefcase className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Attendance
                      </p>
                      <p className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {attendanceStats.present + attendanceStats.late}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {attendanceStats.late} late
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Performance
                      </p>
                      <p className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {myPerformance?.score || 'N/A'}
                      </p>
                      <p className={`text-xs mt-1 capitalize ${
                        myPerformance ? getRatingColor(myPerformance.rating).split(' ')[0] : 'text-gray-500'
                      }`}>
                        {myPerformance?.rating || 'Not rated'}
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <Award className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ongoing Projects */}
              <div className={`p-6 rounded-lg border mb-6 ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Ongoing Projects
                </h3>
                {myProjects.length > 0 ? (
                  <div className="space-y-3">
                    {myProjects.map((project) => (
                      <div key={project.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    No projects assigned yet
                  </p>
                )}
              </div>

              {/* Recent Tasks */}
              <div className={`p-6 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Recent Tasks
                </h3>
                {myTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {task.title}
                        </h4>
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {task.description}
                        </p>
                        {task.dueDate && (
                          <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            Due: {task.dueDate}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div>
              <h2 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                My Tasks ({myTasks.length})
              </h2>

              {/* Task Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className={`p-4 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
                      <p className={`text-xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {taskStats.completed}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className={`p-4 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
                      <p className={`text-xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {taskStats.pending}
                      </p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>

                <div className={`p-4 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>In Progress</p>
                      <p className={`text-xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {taskStats.inProgress}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className={`p-4 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Overdue</p>
                      <p className={`text-xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {taskStats.overdue}
                      </p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-500" />
                  </div>
                </div>
              </div>

              {/* Task List */}
              <div className="grid grid-cols-1 gap-4">
                {myTasks.map((task) => (
                  <div key={task.id} className={`p-6 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {task.title}
                        </h4>
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {task.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                    {task.dueDate && (
                      <div className="flex items-center text-sm mt-2">
                        <Calendar className={`h-4 w-4 mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          Due: {task.dueDate}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                {myTasks.length === 0 && (
                  <div className="text-center py-12">
                    <ListTodo className={`h-12 w-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      No tasks assigned to you yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div>
              <h2 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Attendance Summary
              </h2>

              {/* Attendance Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className={`p-6 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Days Present</p>
                    <p className={`text-3xl font-bold mt-2 text-green-600`}>
                      {attendanceStats.present}
                    </p>
                  </div>
                </div>

                <div className={`p-6 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Days Late</p>
                    <p className={`text-3xl font-bold mt-2 text-yellow-600`}>
                      {attendanceStats.late}
                    </p>
                  </div>
                </div>

                <div className={`p-6 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>On Leave</p>
                    <p className={`text-3xl font-bold mt-2 text-blue-600`}>
                      {attendanceStats.onLeave}
                    </p>
                  </div>
                </div>

                <div className={`p-6 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Hours</p>
                    <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {totalHours.toFixed(1)}h
                    </p>
                  </div>
                </div>
              </div>

              {/* Attendance Records */}
              <div className={`p-6 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Recent Attendance
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Date</th>
                        <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Clock In</th>
                        <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Clock Out</th>
                        <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Hours</th>
                        <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myAttendance.map((record) => (
                        <tr key={record.id} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                          <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
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
                  {myAttendance.length === 0 && (
                    <div className="text-center py-12">
                      <Clock className={`h-12 w-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        No attendance records yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div>
              <h2 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Performance Rating
              </h2>

              {myPerformance ? (
                <>
                  {/* Overall Score */}
                  <div className={`p-8 rounded-lg border mb-6 ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${
                        getRatingColor(myPerformance.rating)
                      } mb-4`}>
                        <span className="text-4xl font-bold">
                          {myPerformance.score}
                        </span>
                      </div>
                      <h3 className={`text-2xl font-bold capitalize ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {myPerformance.rating} Performance
                      </h3>
                      <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {myPerformance.month} • {myPerformance.quarter}
                      </p>
                    </div>
                  </div>

                  {/* Detailed Scores */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className={`p-6 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Deadlines Met
                      </h4>
                      <div className="flex items-center justify-between mb-2">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          {myPerformance.deadlinesMet}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-green-600 h-3 rounded-full"
                          style={{ width: `${myPerformance.deadlinesMet}%` }}
                        />
                      </div>
                    </div>

                    <div className={`p-6 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Quality Score
                      </h4>
                      <div className="flex items-center justify-between mb-2">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          {myPerformance.qualityScore}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full"
                          style={{ width: `${myPerformance.qualityScore}%` }}
                        />
                      </div>
                    </div>

                    <div className={`p-6 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Teamwork Score
                      </h4>
                      <div className="flex items-center justify-between mb-2">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          {myPerformance.teamworkScore}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-purple-600 h-3 rounded-full"
                          style={{ width: `${myPerformance.teamworkScore}%` }}
                        />
                      </div>
                    </div>

                    <div className={`p-6 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Innovation Score
                      </h4>
                      <div className="flex items-center justify-between mb-2">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          {myPerformance.innovationScore}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-yellow-600 h-3 rounded-full"
                          style={{ width: `${myPerformance.innovationScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Review Comments */}
                  {myPerformance.comments && (
                    <div className={`p-6 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Reviewer Comments
                      </h4>
                      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        {myPerformance.comments}
                      </p>
                      <p className={`text-xs mt-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        Reviewed by: {myPerformance.reviewedBy} • {new Date(myPerformance.reviewDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className={`p-12 rounded-lg border text-center ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <Award className={`h-16 w-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    No Performance Rating Yet
                  </h3>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Your performance will be rated at the end of the month
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default NormalEmployeeDashboard;
