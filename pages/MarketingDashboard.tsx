import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { useTheme } from '../hooks/useTheme';
import {
  TrendingUp,
  Users,
  Target,
  BarChart3,
  LogOut,
  Home,
  Sun,
  Moon,
  Megaphone,
  DollarSign,
  TrendingDown,
  Clock,
  CheckCircle,
  Activity
} from 'lucide-react';

const MarketingDashboard: React.FC = () => {
  const { user, projects, marketingMetrics, attendanceRecords, logout , isLoggingOut } = useAppContext();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'analytics' | 'attendance'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter'>('month');

  // Get current period metrics
  const currentMetrics = useMemo(() => {
    const filtered = marketingMetrics.filter(m => 
      selectedPeriod === 'month' ? m.month === '2024-02' : m.quarter === 'Q1-2024'
    );
    return filtered[0] || marketingMetrics[0];
  }, [marketingMetrics, selectedPeriod]);

  // Filter marketing-related projects
  const marketingProjects = useMemo(() => 
    projects.filter(p => 
      p.title?.toLowerCase().includes('marketing') || 
      p.title?.toLowerCase().includes('seo') ||
      p.title?.toLowerCase().includes('campaign') ||
      p.title?.toLowerCase().includes('social media')
    ),
    [projects]
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
    totalDays: myAttendance.length,
    totalHours: myAttendance.reduce((sum, a) => sum + (a.hoursWorked || 0), 0)
  }), [myAttendance]);

  const handleLogout = () => {
    console.log('🟡 LOGOUT BUTTON CLICKED in Marketing Dashboard');
    logout();
    console.log('🟡 logout() function called in Marketing Dashboard');
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
          Marketing Dashboard
            </h1>
        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {user?.email}
            </p>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              Marketing Head
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
              onClick={() => setActiveTab('campaigns')}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors w-full ${
                activeTab === 'campaigns'
                  ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Megaphone className="h-5 w-5" />
              <span>Campaigns</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors w-full ${
                activeTab === 'analytics'
                  ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <TrendingUp className="h-5 w-5" />
              <span>Analytics</span>
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
                  Marketing Overview
                </h2>
                {currentMetrics && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedPeriod('month')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        selectedPeriod === 'month'
                          ? 'bg-blue-600 text-white'
                          : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Month
                    </button>
          <button
                      onClick={() => setSelectedPeriod('quarter')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        selectedPeriod === 'quarter'
                          ? 'bg-blue-600 text-white'
                          : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Quarter
          </button>
        </div>
                )}
      </div>

              {currentMetrics && (
                <>
                  {/* Key Marketing Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className={`p-6 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Total Leads Generated
                          </p>
                          <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {currentMetrics.leadsGenerated}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            {selectedPeriod === 'month' ? currentMetrics.month : currentMetrics.quarter}
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
                        <div className="flex-1">
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Lead-to-Client Conversion
                          </p>
                          <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {currentMetrics.conversionRate.toFixed(1)}%
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            {currentMetrics.leadsConverted} converted
          </p>
        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                          <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

                    <div className={`p-6 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Overall ROI
                          </p>
                          <p className={`text-3xl font-bold mt-2 text-green-600`}>
                            {currentMetrics.roi.toFixed(0)}%
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
            Return on investment
          </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                          <TrendingUp className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
        </div>
      </div>

                  {/* Campaign & Budget Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className={`p-6 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Campaigns Status
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Activity className="h-5 w-5 text-blue-600" />
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                              Running
                            </span>
                          </div>
                          <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {currentMetrics.campaignsRunning}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                              Completed
                            </span>
                          </div>
                          <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {currentMetrics.campaignsCompleted}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={`p-6 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Marketing Spend vs Budget
        </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Budget</span>
                          <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(currentMetrics.marketingBudget)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Spent</span>
                          <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(currentMetrics.marketingSpend)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              (currentMetrics.marketingSpend / currentMetrics.marketingBudget) > 0.9
                                ? 'bg-red-600'
                                : (currentMetrics.marketingSpend / currentMetrics.marketingBudget) > 0.7
                                ? 'bg-yellow-600'
                                : 'bg-green-600'
                            }`}
                            style={{ width: `${Math.min((currentMetrics.marketingSpend / currentMetrics.marketingBudget) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
                            {((currentMetrics.marketingSpend / currentMetrics.marketingBudget) * 100).toFixed(1)}% used
                          </span>
                          <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
                            {formatCurrency(currentMetrics.marketingBudget - currentMetrics.marketingSpend)} remaining
                          </span>
                        </div>
              </div>
            </div>
          </div>

                  {/* Revenue Generated */}
                  <div className={`p-6 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Revenue Generated from Marketing
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Total Revenue
                        </p>
                        <p className={`text-2xl font-bold mt-2 text-green-600`}>
                          {formatCurrency(currentMetrics.revenue)}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Marketing Spend
                        </p>
                        <p className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(currentMetrics.marketingSpend)}
                        </p>
                      </div>
              <div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Net Return
                        </p>
                        <p className={`text-2xl font-bold mt-2 text-blue-600`}>
                          {formatCurrency(currentMetrics.revenue - currentMetrics.marketingSpend)}
                </p>
              </div>
            </div>
          </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'campaigns' && (
              <div>
              <h2 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Marketing Campaigns
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {marketingProjects.map((project) => (
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
                {marketingProjects.length === 0 && (
                  <div className="text-center py-12">
                    <Megaphone className={`h-12 w-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      No marketing campaigns found
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h2 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Marketing Analytics
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {marketingMetrics.map((metric) => (
                  <div key={metric.id} className={`p-6 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {metric.month}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Leads Generated</span>
                        <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {metric.leadsGenerated}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Conversion Rate</span>
                        <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {metric.conversionRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>ROI</span>
                        <span className="font-bold text-green-600">
                          {metric.roi.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Revenue</span>
                        <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(metric.revenue)}
                        </span>
          </div>
        </div>
      </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
              <div>
              <h2 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                My Attendance Summary
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
        </main>
      </div>
    </div>
  );
};

export default MarketingDashboard;
