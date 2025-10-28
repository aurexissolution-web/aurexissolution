import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { useTheme } from '../hooks/useTheme';
import {
  Users,
  FolderKanban, 
  Target,
  LogOut,
  Home,
  Sun,
  Moon,
  ListTodo,
  Clock,
  UserPlus,
  Send,
  CheckCircle,
  AlertCircle,
  Calendar,
  TrendingUp
} from 'lucide-react';

const TeamLeadDashboard: React.FC = () => {
  const { user, projects, users: allUsers, tasks, attendanceRecords, logout, isLoggingOut } = useAppContext();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'tasks' | 'team' | 'attendance' | 'deadlines'>('overview');
  const [showAddTeammate, setShowAddTeammate] = useState(false);
  const [showAssignTask, setShowAssignTask] = useState(false);
  const [teammateCode, setTeammateCode] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');

  // Filter projects assigned to this team lead
  const myProjects = useMemo(() => 
    projects.filter(p => p.assignedTo === user?.uniqueId || p.teamLead === user?.email),
    [projects, user]
  );

  // Active projects
  const activeProjects = useMemo(() => 
    myProjects.filter(p => p.status === 'in-progress'),
    [myProjects]
  );

  // Filter team members
  const teamMembers = useMemo(() => 
    allUsers.filter(u => u.team === user?.team || u.reportsTo === user?.email),
    [allUsers, user]
  );

  // Team tasks
  const teamTasks = useMemo(() => {
    const teamEmails = teamMembers.map(m => m.email);
    return tasks.filter(t => teamEmails.includes(t.assignedTo) || t.assignedBy === user?.email);
  }, [tasks, teamMembers, user]);

  // Task statistics
  const taskStats = useMemo(() => ({
    inProgress: teamTasks.filter(t => t.status === 'in-progress').length,
    completed: teamTasks.filter(t => t.status === 'completed').length,
    pending: teamTasks.filter(t => t.status === 'pending').length,
    total: teamTasks.length
  }), [teamTasks]);

  // Team Performance Score (% of deadlines met)
  const teamPerformanceScore = useMemo(() => {
    const completedOnTime = teamTasks.filter(t => {
      if (t.status !== 'completed' || !t.deadline) return false;
      const dueDate = new Date(t.deadline);
      const completedDate = t.updatedAt ? new Date(t.updatedAt) : new Date();
      return completedDate <= dueDate;
    }).length;
    
    const totalCompleted = teamTasks.filter(t => t.status === 'completed').length;
    return totalCompleted > 0 ? ((completedOnTime / totalCompleted) * 100).toFixed(1) : '0.0';
  }, [teamTasks]);

  // Current Sprint Status (simulate agile sprint)
  const currentSprint = useMemo(() => {
    const sprintTasks = teamTasks.filter(t => t.status !== 'completed');
    const totalProgress = sprintTasks.reduce((sum, t) => sum + (t.progress || 0), 0);
    const avgProgress = sprintTasks.length > 0 ? totalProgress / sprintTasks.length : 0;
    
    return {
      name: 'Sprint 5 - Q1 2024',
      tasksTotal: sprintTasks.length,
      tasksCompleted: teamTasks.filter(t => t.status === 'completed').length,
      progress: avgProgress.toFixed(0)
    };
  }, [teamTasks]);

  // Upcoming Deadlines & Milestones
  const upcomingDeadlines = useMemo(() => {
    const allDeadlines: Array<{ type: 'task' | 'project', title: string, date: string, status: string }> = [];
    
    // Add task deadlines
    teamTasks.filter(t => t.deadline && t.status !== 'completed').forEach(t => {
      allDeadlines.push({
        type: 'task',
        title: t.title,
        date: t.deadline || t.dueDate || '',
        status: t.status
          });
        });
    
    // Add project deadlines
    myProjects.filter(p => p.dueDate && p.status !== 'completed').forEach(p => {
      allDeadlines.push({
        type: 'project',
        title: p.title,
        date: p.dueDate,
        status: p.status
      });
    });
    
    // Sort by date
    return allDeadlines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 10);
  }, [teamTasks, myProjects]);

  // Team attendance
  const teamAttendance = useMemo(() => {
    const teamEmails = teamMembers.map(m => m.email);
    return attendanceRecords.filter(a => teamEmails.includes(a.employeeEmail));
  }, [attendanceRecords, teamMembers]);

  const attendanceStats = useMemo(() => ({
    present: teamAttendance.filter(a => a.status === 'present').length,
    late: teamAttendance.filter(a => a.status === 'late').length,
    onLeave: teamAttendance.filter(a => a.status === 'on-leave').length,
    totalHours: teamAttendance.reduce((sum, a) => sum + (a.hoursWorked || 0), 0)
  }), [teamAttendance]);

  const handleLogout = () => {
    console.log('🟡 LOGOUT BUTTON CLICKED in Team Lead Dashboard');
    logout();
    console.log('🟡 logout() function called in Team Lead Dashboard');
    // Note: logout() already handles navigation to homepage
  };




  const handleAddTeammate = () => {
    alert(`Add Teammate with Code: ${teammateCode}\n(This would update Firebase to assign this teammate to your team)`);
    setTeammateCode('');
    setShowAddTeammate(false);
  };

  const handleAssignTask = () => {
    alert(`Task Assigned!\nTitle: ${taskTitle}\nTo: ${taskAssignee}\n(This would create a new task in Firebase)`);
    setTaskTitle('');
    setTaskDescription('');
    setTaskAssignee('');
    setTaskPriority('medium');
    setTaskDueDate('');
    setShowAssignTask(false);
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
              Team Lead Dashboard
            </h1>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {user?.email}
            </p>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              Team Lead • {user?.team || 'Team'}
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
              <Target className="h-5 w-5" />
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
              <span>Projects</span>
              <span className="ml-auto bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs px-2 py-0.5 rounded-full">
                {activeProjects.length}
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
              <ListTodo className="h-5 w-5" />
              <span>Tasks</span>
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
              <span>Team</span>
              <span className="ml-auto bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs px-2 py-0.5 rounded-full">
                {teamMembers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('deadlines')}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors w-full ${
                activeTab === 'deadlines'
                  ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Calendar className="h-5 w-5" />
              <span>Deadlines</span>
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
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Team Overview
                </h2>
                <div className="flex space-x-3">
        <button
                    onClick={() => setShowAddTeammate(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
                    <UserPlus className="h-5 w-5" />
                    <span>Add Teammate</span>
        </button>
        <button
                    onClick={() => setShowAssignTask(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
                    <Send className="h-5 w-5" />
                    <span>Assign Task</span>
        </button>
                </div>
      </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                    <div className="p-3 bg-blue-100 rounded-full">
                      <FolderKanban className="h-6 w-6 text-blue-600" />
            </div>
          </div>
                </div>

                <div className={`p-6 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Tasks In Progress
                      </p>
                      <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {taskStats.inProgress}
          </p>
        </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <Clock className="h-6 w-6 text-yellow-600" />
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
                        {teamPerformanceScore}%
                      </p>
                      <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            Deadlines met
          </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
        </div>

                <div className={`p-6 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Team Size
                      </p>
                      <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {teamMembers.length}
                      </p>
            </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Users className="h-6 w-6 text-purple-600" />
          </div>
                  </div>
                </div>
              </div>

              {/* Task Summary */}
              <div className={`p-6 rounded-lg border mb-8 ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Task Summary
          </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className={`text-3xl font-bold text-blue-600`}>{taskStats.inProgress}</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>In Progress</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className={`text-3xl font-bold text-green-600`}>{taskStats.completed}</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className={`text-3xl font-bold text-yellow-600`}>{taskStats.pending}</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{taskStats.total}</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Tasks</p>
                  </div>
                </div>
              </div>

              {/* Current Sprint Status */}
              <div className={`p-6 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Current Sprint Status
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {currentSprint.name}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {currentSprint.tasksCompleted} / {currentSprint.tasksTotal} tasks completed
          </p>
        </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Sprint Progress
                      </span>
                      <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {currentSprint.progress}%
                      </span>
      </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full"
                        style={{ width: `${currentSprint.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
              <div>
              <h2 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                My Projects ({myProjects.length})
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {myProjects.map((project) => (
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
                        {project.completionPercentage !== undefined && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Progress
                              </span>
                              <span className={`text-xs font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {project.completionPercentage}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${project.completionPercentage}%` }}
                              />
                            </div>
                          </div>
                        )}
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
                          RM {project.budget.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {myProjects.length === 0 && (
                  <div className="text-center py-12">
                    <FolderKanban className={`h-12 w-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      No projects assigned to you yet
                </p>
              </div>
                )}
            </div>
          </div>
          )}

          {activeTab === 'tasks' && (
              <div>
              <h2 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Team Tasks ({teamTasks.length})
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {teamTasks.map((task) => (
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
                        {task.progress !== undefined && (
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
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

          {activeTab === 'team' && (
              <div>
              <h2 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Team Members ({teamMembers.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className={`p-6 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                        <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {member.name || member.email}
                        </h4>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {member.position || member.role}
                        </p>
                        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          ID: {member.uniqueId}
                </p>
              </div>
            </div>
          </div>
                ))}
                {teamMembers.length === 0 && (
                  <div className="col-span-2 text-center py-12">
                    <Users className={`h-12 w-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      No team members assigned yet
                    </p>
        </div>
                )}
      </div>
    </div>
          )}

          {activeTab === 'deadlines' && (
                    <div>
              <h2 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Upcoming Deadlines & Milestones
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {upcomingDeadlines.map((deadline, index) => (
                  <div key={index} className={`p-6 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-full ${
                          deadline.type === 'project' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          {deadline.type === 'project' ? (
                            <FolderKanban className={`h-5 w-5 ${deadline.type === 'project' ? 'text-blue-600' : 'text-green-600'}`} />
                          ) : (
                            <ListTodo className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {deadline.title}
                          </h4>
                          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {deadline.type === 'project' ? 'Project' : 'Task'} • Due: {deadline.date}
                          </p>
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        deadline.status === 'completed' ? 'bg-green-100 text-green-800' :
                        deadline.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {deadline.status}
                    </span>
                  </div>
                </div>
              ))}
                {upcomingDeadlines.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className={`h-12 w-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      No upcoming deadlines
                    </p>
            </div>
                )}
          </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div>
              <h2 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Team Attendance Summary
              </h2>

              {/* Attendance Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className={`p-6 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Days Present</p>
                  <p className={`text-3xl font-bold mt-2 text-green-600`}>
                    {attendanceStats.present}
                  </p>
                </div>

                <div className={`p-6 rounded-lg border ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Days Late</p>
                  <p className={`text-3xl font-bold mt-2 text-yellow-600`}>
                    {attendanceStats.late}
          </p>
        </div>

                <div className={`p-6 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>On Leave</p>
                  <p className={`text-3xl font-bold mt-2 text-blue-600`}>
                    {attendanceStats.onLeave}
                  </p>
                </div>

                <div className={`p-6 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Hours</p>
                  <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {attendanceStats.totalHours.toFixed(1)}h
                  </p>
        </div>
      </div>

              {/* Attendance Records */}
              <div className={`p-6 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Clock In/Out Records
                </h3>
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
                      {teamAttendance.map((record) => (
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
                  {teamAttendance.length === 0 && (
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
      </main>
      </div>

      {/* Add Teammate Modal */}
      {showAddTeammate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg max-w-md w-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Add Teammate
              </h3>
                  <input
                    type="text"
              value={teammateCode}
              onChange={(e) => setTeammateCode(e.target.value)}
              placeholder="Enter unique code (e.g., EMP001)"
              className={`w-full px-4 py-2 border rounded-lg mb-4 ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                <div className="flex space-x-3">
                  <button
                onClick={handleAddTeammate}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                Add
                  </button>
                  <button
                onClick={() => setShowAddTeammate(false)}
                className={`flex-1 px-4 py-2 rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                Cancel
                  </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Task Modal */}
      {showAssignTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg max-w-md w-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Assign Task to Teammate
              </h3>
            <div className="space-y-3">
                  <input
                    type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Task title"
                className={`w-full px-4 py-2 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
              />
                  <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Task description"
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
              />
                  <select
                value={taskAssignee}
                onChange={(e) => setTaskAssignee(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">Select teammate</option>
                    {teamMembers.map(member => (
                  <option key={member.id} value={member.email}>
                    {member.name || member.email}
                      </option>
                    ))}
                  </select>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as any)}
                className={`w-full px-4 py-2 border rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
                  <input
                    type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
            <div className="flex space-x-3 mt-4">
                  <button
                onClick={handleAssignTask}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                Assign
                  </button>
                  <button
                onClick={() => setShowAssignTask(false)}
                className={`flex-1 px-4 py-2 rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                Cancel
                  </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamLeadDashboard;
