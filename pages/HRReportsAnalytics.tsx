import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Clock, 
  DollarSign, 
  Download, 
  Filter,
  TrendingUp,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Award,
  FileText
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// ==================== MOCK DATA ====================

const summaryData = {
  totalEmployees: 247,
  activeEmployees: 234,
  averageTenure: 3.2,
  monthlyPayroll: 1250000
};

const departmentDistribution = [
  { name: 'Engineering', value: 85, color: '#8b5cf6' },
  { name: 'Sales', value: 45, color: '#ec4899' },
  { name: 'Marketing', value: 32, color: '#0ea5e9' },
  { name: 'HR', value: 18, color: '#10b981' },
  { name: 'Finance', value: 25, color: '#f59e0b' },
  { name: 'Operations', value: 42, color: '#ef4444' },
];

const genderRatio = [
  { name: 'Male', value: 142, color: '#3b82f6' },
  { name: 'Female', value: 98, color: '#ec4899' },
  { name: 'Other', value: 7, color: '#8b5cf6' },
];

const employeeGrowthTrend = [
  { month: 'Jan', employees: 215 },
  { month: 'Feb', employees: 220 },
  { month: 'Mar', employees: 225 },
  { month: 'Apr', employees: 228 },
  { month: 'May', employees: 235 },
  { month: 'Jun', employees: 237 },
  { month: 'Jul', employees: 240 },
  { month: 'Aug', employees: 243 },
  { month: 'Sep', employees: 245 },
  { month: 'Oct', employees: 247 },
];

const attendanceOverview = [
  { day: 'Mon', present: 234, absent: 13 },
  { day: 'Tue', present: 237, absent: 10 },
  { day: 'Wed', present: 232, absent: 15 },
  { day: 'Thu', present: 239, absent: 8 },
  { day: 'Fri', present: 228, absent: 19 },
];

const absenceTrends = [
  { month: 'Jan', sick: 45, vacation: 32, personal: 12 },
  { month: 'Feb', sick: 38, vacation: 28, personal: 10 },
  { month: 'Mar', sick: 42, vacation: 35, personal: 15 },
  { month: 'Apr', sick: 35, vacation: 40, personal: 11 },
  { month: 'May', sick: 40, vacation: 45, personal: 13 },
  { month: 'Jun', sick: 38, vacation: 52, personal: 14 },
];

const topPerformers = [
  { rank: 1, name: 'Sarah Johnson', department: 'Engineering', score: 98 },
  { rank: 2, name: 'Michael Chen', department: 'Sales', score: 96 },
  { rank: 3, name: 'Emily Davis', department: 'Marketing', score: 94 },
  { rank: 4, name: 'David Wilson', department: 'Engineering', score: 93 },
  { rank: 5, name: 'Jessica Brown', department: 'Operations', score: 92 },
];

const performanceRatings = [
  { subject: 'Communication', A: 85, fullMark: 100 },
  { subject: 'Teamwork', A: 90, fullMark: 100 },
  { subject: 'Leadership', A: 78, fullMark: 100 },
  { subject: 'Technical Skills', A: 92, fullMark: 100 },
  { subject: 'Punctuality', A: 88, fullMark: 100 },
  { subject: 'Innovation', A: 82, fullMark: 100 },
];

const departments = ['All Departments', 'Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'];
const dateRanges = ['Last 7 Days', 'Last 30 Days', 'Last 3 Months', 'Last 6 Months', 'Last Year', 'Custom'];

// ==================== COMPONENT ====================

const HRReportsAnalytics: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedDateRange, setSelectedDateRange] = useState('Last 30 Days');

  const handleExportPDF = () => {
    console.log('📄 Exporting to PDF...');
    alert('PDF export functionality would be implemented here');
  };

  const handleExportCSV = () => {
    console.log('📊 Exporting to CSV...');
    alert('CSV export functionality would be implemented here');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Reports & Analytics
              </h1>
              <p className="text-gray-400">Comprehensive HR insights and data analysis</p>
            </div>
            
            {/* Export Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Export PDF</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                <FileText size={18} />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Filter size={16} className="inline mr-2" />
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Date Range
              </label>
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {dateRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl p-6 border border-gray-700 hover:border-purple-500 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Users className="text-purple-500" size={24} />
              </div>
              <span className="text-green-400 text-sm font-semibold">+5.2%</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">Total Employees</h3>
            <p className="text-3xl font-bold text-white">{summaryData.totalEmployees}</p>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl p-6 border border-gray-700 hover:border-green-500 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <UserCheck className="text-green-500" size={24} />
              </div>
              <span className="text-green-400 text-sm font-semibold">+2.8%</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">Active Employees</h3>
            <p className="text-3xl font-bold text-white">{summaryData.activeEmployees}</p>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl p-6 border border-gray-700 hover:border-blue-500 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Clock className="text-blue-500" size={24} />
              </div>
              <span className="text-blue-400 text-sm font-semibold">+0.3 yrs</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">Average Tenure</h3>
            <p className="text-3xl font-bold text-white">{summaryData.averageTenure} years</p>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl p-6 border border-gray-700 hover:border-yellow-500 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <DollarSign className="text-yellow-500" size={24} />
              </div>
              <span className="text-green-400 text-sm font-semibold">+3.5%</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">Monthly Payroll</h3>
            <p className="text-3xl font-bold text-white">
              ${(summaryData.monthlyPayroll / 1000000).toFixed(2)}M
            </p>
          </div>
        </div>

        {/* Employee Analytics Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <BarChart3 className="text-purple-500" />
            Employee Analytics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* Department Distribution */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Department Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={departmentDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Gender Ratio */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Gender Ratio</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={genderRatio}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {genderRatio.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Employee Growth Trend */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl p-6 border border-gray-700 md:col-span-2 xl:col-span-1">
              <h3 className="text-xl font-semibold text-white mb-4">Employee Growth Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={employeeGrowthTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="employees" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Attendance & Leave Reports */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <PieChartIcon className="text-green-500" />
            Attendance & Leave Reports
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Attendance Overview */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Attendance Overview (This Week)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceOverview}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="present" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="absent" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Absence Trends */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Absence Trends (6 Months)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={absenceTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="sick" 
                    stackId="1" 
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="vacation" 
                    stackId="1" 
                    stroke="#0ea5e9" 
                    fill="#0ea5e9" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="personal" 
                    stackId="1" 
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Award className="text-yellow-500" />
            Performance Insights
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top 5 Performers */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Top 5 Performers</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-2 text-gray-400 font-medium">Rank</th>
                      <th className="text-left py-3 px-2 text-gray-400 font-medium">Name</th>
                      <th className="text-left py-3 px-2 text-gray-400 font-medium">Department</th>
                      <th className="text-left py-3 px-2 text-gray-400 font-medium">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPerformers.map((performer) => (
                      <tr 
                        key={performer.rank} 
                        className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2">
                            {performer.rank === 1 && <span className="text-yellow-500">🥇</span>}
                            {performer.rank === 2 && <span className="text-gray-400">🥈</span>}
                            {performer.rank === 3 && <span className="text-orange-600">🥉</span>}
                            {performer.rank > 3 && <span className="text-gray-500">#{performer.rank}</span>}
                          </div>
                        </td>
                        <td className="py-4 px-2 text-white font-medium">{performer.name}</td>
                        <td className="py-4 px-2 text-gray-300">{performer.department}</td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-700 rounded-full h-2 max-w-[100px]">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                style={{ width: `${performer.score}%` }}
                              ></div>
                            </div>
                            <span className="text-purple-400 font-semibold">{performer.score}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Ratings Distribution */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Performance Ratings Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={performanceRatings}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="subject" stroke="#9ca3af" />
                  <PolarRadiusAxis stroke="#9ca3af" />
                  <Radar 
                    name="Average Rating" 
                    dataKey="A" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.6}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-start gap-4">
            <TrendingUp className="text-purple-400 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Report Generated</h3>
              <p className="text-gray-300">
                This report was generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}.
                All data is current as of the selected date range ({selectedDateRange}) and filtered by {selectedDepartment}.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HRReportsAnalytics;

