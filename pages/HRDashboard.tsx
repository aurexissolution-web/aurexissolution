import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { useTheme } from '../hooks/useTheme';
import { 
  Users, 
  Clock, 
  FileText, 
  Calendar, 
  TrendingUp,
  LogOut,
  Home,
  Moon,
  Sun,
  DollarSign,
  BarChart3
} from 'lucide-react';
import AdminUserManagement from '../components/admin/AdminUserManagement';
import AdminEmployeeMonitoring from '../components/admin/AdminEmployeeMonitoring';
import AdminFreelancerMonitoring from '../components/admin/AdminFreelancerMonitoring';
import HRReportsAnalytics from './HRReportsAnalytics';

const HRDashboard: React.FC = () => {
  const { user, logout, isHR, isLoggingOut } = useAppContext();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'freelancers' | 'users' | 'reports'>('overview');

  // Redirect if not HR
  React.useEffect(() => {
    if (user && !isHR) {
      navigate('/', { replace: true });
    }
  }, [user, isHR, navigate]);

  const handleLogout = () => {
    console.log('🟡 LOGOUT BUTTON CLICKED in HR Dashboard');
    logout();
    console.log('🟡 logout() function called in HR Dashboard');
    // Note: logout() already handles navigation to homepage
  };




  if (!user || !isHR) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Access Denied</h1>
          <p className="text-text-secondary mb-6">You need HR privileges to access this page.</p>
          <Link to="/" className="text-primary hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const TabButton: React.FC<{ 
    tab: typeof activeTab; 
    icon: React.ReactNode; 
    label: string;
  }> = ({ tab, icon, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors w-full ${
        activeTab === tab
          ? theme === 'dark'
            ? 'bg-blue-600 text-white'
            : 'bg-blue-500 text-white'
          : theme === 'dark'
          ? 'text-gray-300 hover:bg-gray-700'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stats Cards */}
              <div className={`p-6 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Total Employees
                    </p>
                    <p className={`text-3xl font-bold mt-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      24
                    </p>
                  </div>
                  <Users className={`h-12 w-12 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                  }`} />
                </div>
              </div>

              <div className={`p-6 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Clocked In
                    </p>
                    <p className={`text-3xl font-bold mt-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      18
                    </p>
                  </div>
                  <Clock className={`h-12 w-12 ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-500'
                  }`} />
                </div>
              </div>

              <div className={`p-6 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      On Leave
                    </p>
                    <p className={`text-3xl font-bold mt-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      3
                    </p>
                  </div>
                  <Calendar className={`h-12 w-12 ${
                    theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'
                  }`} />
                </div>
              </div>

              <div className={`p-6 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Active Tasks
                    </p>
                    <p className={`text-3xl font-bold mt-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      47
                    </p>
                  </div>
                  <FileText className={`h-12 w-12 ${
                    theme === 'dark' ? 'text-purple-400' : 'text-purple-500'
                  }`} />
                </div>
              </div>
            </div>

            {/* Welcome Section */}
            <div className={`p-8 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-gray-700'
                : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
            }`}>
              <h2 className={`text-2xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Welcome to HR Dashboard, {user.email}
              </h2>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                Manage your workforce, track employee performance, and streamline HR operations.
              </p>
            </div>

            {/* Quick Actions */}
            <div className={`p-6 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('employees')}
                  className={`p-4 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-white'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  <Clock className="h-8 w-8 mb-2 text-blue-500" />
                  <p className="font-medium">Monitor Employees</p>
                  <p className={`text-sm mt-1 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Track time & tasks
                  </p>
                </button>

                <button
                  onClick={() => setActiveTab('users')}
                  className={`p-4 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-white'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  <Users className="h-8 w-8 mb-2 text-green-500" />
                  <p className="font-medium">Manage Users</p>
                  <p className={`text-sm mt-1 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Add/edit users
                  </p>
                </button>

                <button
                  onClick={() => setActiveTab('reports')}
                  className={`p-4 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-white'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  <BarChart3 className="h-8 w-8 mb-2 text-purple-500" />
                  <p className="font-medium">View Reports</p>
                  <p className={`text-sm mt-1 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Analytics & insights
                  </p>
                </button>
              </div>
            </div>
          </div>
        );
      case 'employees':
        return <AdminEmployeeMonitoring />;
      case 'freelancers':
        return <AdminFreelancerMonitoring />;
      case 'users':
        return <AdminUserManagement />;
      case 'reports':
        return <HRReportsAnalytics />;
    }
  };

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="flex">
        {/* Sidebar */}
        <aside className={`w-64 min-h-screen border-r ${
          theme === 'dark'
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className="p-6">
            <h1 className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              HR Dashboard
            </h1>
            <p className={`text-sm mt-1 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Human Resources
            </p>
          </div>

          <nav className="px-4 space-y-2">
            <TabButton tab="overview" icon={<Home className="h-5 w-5" />} label="Overview" />
            <TabButton tab="employees" icon={<Clock className="h-5 w-5" />} label="Employees" />
            <TabButton tab="freelancers" icon={<FileText className="h-5 w-5" />} label="Freelancers" />
            <TabButton tab="users" icon={<Users className="h-5 w-5" />} label="Users" />
            <TabButton tab="reports" icon={<BarChart3 className="h-5 w-5" />} label="Reports" />
          </nav>

          {/* Bottom Actions */}
          <div className="absolute bottom-0 w-64 p-4 space-y-2 border-t">
            <button
              onClick={toggleTheme}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors w-full ${
                theme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span>Toggle Theme</span>
            </button>

            <Link
              to="/"
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors w-full ${
                theme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>

            <button
              onClick={handleLogout}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors w-full ${
                theme === 'dark'
                  ? 'text-red-400 hover:bg-red-900/20'
                  : 'text-red-600 hover:bg-red-50'
              }`}
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default HRDashboard;

