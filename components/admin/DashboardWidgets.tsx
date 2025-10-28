// components/admin/DashboardWidgets.tsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import {
  Users,
  Clock,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Activity,
  Target,
  Calendar,
  DollarSign,
  Settings,
  X,
  Plus,
  GripVertical
} from 'lucide-react';
import { EmployeeTimeData } from '../../services/timeTrackingService';

export interface Widget {
  id: string;
  type: 'summary' | 'chart' | 'activity' | 'goals';
  title: string;
  position: number;
  enabled: boolean;
  size: 'small' | 'medium' | 'large';
}

interface DashboardWidgetsProps {
  employeeData: EmployeeTimeData[];
}

const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({ employeeData }) => {
  const { theme } = useTheme();
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: 'total-employees', type: 'summary', title: 'Total Employees', position: 0, enabled: true, size: 'small' },
    { id: 'clocked-in', type: 'summary', title: 'Clocked In', position: 1, enabled: true, size: 'small' },
    { id: 'total-hours', type: 'summary', title: 'Total Hours Today', position: 2, enabled: true, size: 'small' },
    { id: 'avg-hours', type: 'summary', title: 'Average Hours', position: 3, enabled: true, size: 'small' },
    { id: 'productivity', type: 'chart', title: 'Productivity Trend', position: 4, enabled: true, size: 'large' },
    { id: 'recent-activity', type: 'activity', title: 'Recent Activity', position: 5, enabled: true, size: 'medium' }
  ]);

  const [showCustomizer, setShowCustomizer] = useState(false);

  // Load widget preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dashboard-widgets');
    if (saved) {
      try {
        setWidgets(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading widget preferences:', error);
      }
    }
  }, []);

  // Save widget preferences to localStorage
  const saveWidgets = (newWidgets: Widget[]) => {
    setWidgets(newWidgets);
    localStorage.setItem('dashboard-widgets', JSON.stringify(newWidgets));
  };

  const toggleWidget = (widgetId: string) => {
    saveWidgets(
      widgets.map(w =>
        w.id === widgetId ? { ...w, enabled: !w.enabled } : w
      )
    );
  };

  const moveWidget = (widgetId: string, direction: 'up' | 'down') => {
    const index = widgets.findIndex(w => w.id === widgetId);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === widgets.length - 1)
    ) {
      return;
    }

    const newWidgets = [...widgets];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newWidgets[index], newWidgets[targetIndex]] = [newWidgets[targetIndex], newWidgets[index]];
    
    // Update positions
    newWidgets.forEach((w, i) => (w.position = i));
    saveWidgets(newWidgets);
  };

  const changeWidgetSize = (widgetId: string, size: 'small' | 'medium' | 'large') => {
    saveWidgets(
      widgets.map(w =>
        w.id === widgetId ? { ...w, size } : w
      )
    );
  };

  const resetToDefaults = () => {
    const defaultWidgets: Widget[] = [
      { id: 'total-employees', type: 'summary', title: 'Total Employees', position: 0, enabled: true, size: 'small' },
      { id: 'clocked-in', type: 'summary', title: 'Clocked In', position: 1, enabled: true, size: 'small' },
      { id: 'total-hours', type: 'summary', title: 'Total Hours Today', position: 2, enabled: true, size: 'small' },
      { id: 'avg-hours', type: 'summary', title: 'Average Hours', position: 3, enabled: true, size: 'small' },
      { id: 'productivity', type: 'chart', title: 'Productivity Trend', position: 4, enabled: true, size: 'large' },
      { id: 'recent-activity', type: 'activity', title: 'Recent Activity', position: 5, enabled: true, size: 'medium' }
    ];
    saveWidgets(defaultWidgets);
  };

  // Calculate statistics
  const stats = {
    totalEmployees: employeeData.length,
    clockedIn: employeeData.filter(e => e.isClockedIn).length,
    totalHoursToday: employeeData.reduce((sum, e) => sum + e.totalHoursToday, 0),
    avgHoursToday: employeeData.length > 0 
      ? employeeData.reduce((sum, e) => sum + e.totalHoursToday, 0) / employeeData.length 
      : 0
  };

  const renderWidget = (widget: Widget) => {
    if (!widget.enabled) return null;

    const sizeClasses = {
      small: 'col-span-1',
      medium: 'col-span-1 md:col-span-2',
      large: 'col-span-1 md:col-span-2 lg:col-span-4'
    };

    switch (widget.id) {
      case 'total-employees':
        return (
          <div key={widget.id} className={`${sizeClasses[widget.size]} rounded-xl shadow-xl p-6 border transition-all hover:scale-105 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
              : 'bg-gradient-to-br from-white to-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>👥 Total Employees</p>
                <p className={`text-4xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalEmployees}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                <Users className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
        );

      case 'clocked-in':
        return (
          <div key={widget.id} className={`${sizeClasses[widget.size]} rounded-xl shadow-xl p-6 border transition-all hover:scale-105 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
              : 'bg-gradient-to-br from-white to-green-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>🟢 Clocked In</p>
                <p className="text-4xl font-bold mt-2 text-green-600">{stats.clockedIn}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
        );

      case 'total-hours':
        return (
          <div key={widget.id} className={`${sizeClasses[widget.size]} rounded-xl shadow-xl p-6 border transition-all hover:scale-105 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
              : 'bg-gradient-to-br from-white to-purple-50 border-purple-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>⏰ Total Hours Today</p>
                <p className="text-4xl font-bold mt-2 text-purple-600">{stats.totalHoursToday.toFixed(1)}h</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                <Clock className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
        );

      case 'avg-hours':
        return (
          <div key={widget.id} className={`${sizeClasses[widget.size]} rounded-xl shadow-xl p-6 border transition-all hover:scale-105 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
              : 'bg-gradient-to-br from-white to-orange-50 border-orange-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>📊 Average Hours</p>
                <p className="text-4xl font-bold mt-2 text-orange-600">{stats.avgHoursToday.toFixed(1)}h</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600">
                <TrendingUp className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
        );

      case 'productivity':
        return (
          <div key={widget.id} className={`${sizeClasses[widget.size]} rounded-xl shadow-xl p-6 border ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
              : 'bg-gradient-to-br from-white to-indigo-50 border-indigo-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>📈 Productivity Trend</h3>
              <BarChart3 className={`h-6 w-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <div className="space-y-3">
              {employeeData.slice(0, 5).map((emp) => (
                <div key={emp.id} className="flex items-center">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                      {emp.email.split('@')[0]}
                    </p>
                    <div className={`mt-1 w-full rounded-full h-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((emp.totalHoursToday / 8) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className={`ml-3 text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {emp.totalHoursToday.toFixed(1)}h
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'recent-activity':
        return (
          <div key={widget.id} className={`${sizeClasses[widget.size]} rounded-xl shadow-xl p-6 border ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
              : 'bg-gradient-to-br from-white to-green-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>🔔 Recent Activity</h3>
              <Activity className={`h-6 w-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <div className="space-y-3">
              {employeeData.filter(e => e.lastActivity).slice(0, 5).map((emp) => (
                <div key={emp.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${emp.isClockedIn ? 'bg-green-500 animate-pulse' : (theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300')}`}></div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                      {emp.email.split('@')[0]}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                      {emp.isClockedIn ? '🟢 Currently working' : '🔴 Clocked out'} • 
                      {emp.lastActivity ? new Date(emp.lastActivity).toLocaleTimeString() : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Customizer Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowCustomizer(!showCustomizer)}
          className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg shadow-lg transition-all transform hover:scale-105 ${
            theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
          }`}
        >
          <Settings className="h-5 w-5 mr-2" />
          Customize Dashboard
        </button>
      </div>

      {/* Widget Customizer Panel */}
      {showCustomizer && (
        <div className={`rounded-xl shadow-2xl border p-6 ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              ⚙️ Dashboard Widgets
            </h3>
            <button
              onClick={() => setShowCustomizer(false)}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-2">
            {widgets.map((widget, index) => (
              <div key={widget.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700/50 border-gray-600'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <GripVertical className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={widget.enabled}
                      onChange={() => toggleWidget(widget.id)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {widget.title}
                    </span>
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={widget.size}
                    onChange={(e) => changeWidgetSize(widget.id, e.target.value as any)}
                    className={`text-xs rounded px-2 py-1 border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>

                  <button
                    onClick={() => moveWidget(widget.id, 'up')}
                    disabled={index === 0}
                    className={`px-2 py-1 rounded transition-colors disabled:opacity-30 ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-gray-300'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveWidget(widget.id, 'down')}
                    disabled={index === widgets.length - 1}
                    className={`px-2 py-1 rounded transition-colors disabled:opacity-30 ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-gray-300'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={resetToDefaults}
              className={`text-sm font-medium transition-colors ${
                theme === 'dark'
                  ? 'text-blue-400 hover:text-blue-300'
                  : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              🔄 Reset to Defaults
            </button>
          </div>
        </div>
      )}

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets
          .filter(w => w.enabled)
          .sort((a, b) => a.position - b.position)
          .map(widget => renderWidget(widget))}
      </div>
    </div>
  );
};

export default DashboardWidgets;

