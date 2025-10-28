import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { getAnalyticsMetrics, AnalyticsMetric } from '../../services/database';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  Filter,
  Calendar,
  Users,
  Server,
  Zap,
  Shield,
  Globe
} from 'lucide-react';

interface Metric {
  id: string;
  name: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
  unit: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

const AnalyticsReports: React.FC = () => {
  const { user } = useAppContext();
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);

  useEffect(() => {
    if (!user?.email) {
      setIsLoading(false);
      return;
    }

    // Load analytics data from Firebase
    const loadAnalyticsData = async () => {
      try {
        setIsLoading(true);
        const analyticsData = await getAnalyticsMetrics(user.email);
        setMetrics(analyticsData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading analytics data:', error);
        setIsLoading(false);
      }
    };

    loadAnalyticsData();
  }, [user?.email]);

  const defaultMetrics: Metric[] = [
    {
      id: 'uptime',
      name: 'System Uptime',
      value: 99.9,
      change: 0.1,
      changeType: 'increase',
      unit: '%',
      icon: Server,
      color: 'text-green-500'
    },
    {
      id: 'response_time',
      name: 'Avg Response Time',
      value: 245,
      change: -12,
      changeType: 'decrease',
      unit: 'ms',
      icon: Zap,
      color: 'text-blue-500'
    },
    {
      id: 'active_users',
      name: 'Active Users',
      value: 1250,
      change: 8.5,
      changeType: 'increase',
      unit: '',
      icon: Users,
      color: 'text-purple-500'
    },
    {
      id: 'tickets_resolved',
      name: 'Tickets Resolved',
      value: 89,
      change: 15,
      changeType: 'increase',
      unit: '',
      icon: CheckCircle,
      color: 'text-orange-500'
    },
    {
      id: 'security_score',
      name: 'Security Score',
      value: 95,
      change: 2,
      changeType: 'increase',
      unit: '/100',
      icon: Shield,
      color: 'text-red-500'
    },
    {
      id: 'global_reach',
      name: 'Global Reach',
      value: 45,
      change: 5,
      changeType: 'increase',
      unit: 'countries',
      icon: Globe,
      color: 'text-indigo-500'
    }
  ];

  const performanceData: ChartData[] = [
    { name: 'CPU Usage', value: 65, color: '#3B82F6' },
    { name: 'Memory Usage', value: 78, color: '#10B981' },
    { name: 'Disk Usage', value: 45, color: '#F59E0B' },
    { name: 'Network I/O', value: 32, color: '#EF4444' }
  ];

  const ticketTrendData = [
    { month: 'Jan', open: 45, resolved: 38 },
    { month: 'Feb', open: 52, resolved: 41 },
    { month: 'Mar', open: 38, resolved: 35 },
    { month: 'Apr', open: 42, resolved: 39 },
    { month: 'May', open: 35, resolved: 33 },
    { month: 'Jun', open: 28, resolved: 31 }
  ];

  const slaComplianceData = [
    { category: 'Critical', target: 99.9, actual: 99.8, color: '#EF4444' },
    { category: 'High', target: 95, actual: 96.2, color: '#F59E0B' },
    { category: 'Medium', target: 90, actual: 92.1, color: '#10B981' },
    { category: 'Low', target: 85, actual: 88.5, color: '#3B82F6' }
  ];

  const getChangeIcon = (changeType: string) => {
    return changeType === 'increase' ? 
      <TrendingUp className="w-4 h-4 text-green-500" /> : 
      <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getChangeColor = (changeType: string) => {
    return changeType === 'increase' ? 'text-green-500' : 'text-red-500';
  };

  const periods = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  const reportTypes = [
    { id: 'performance', name: 'Performance Report', description: 'System performance metrics and KPIs' },
    { id: 'security', name: 'Security Report', description: 'Security assessments and compliance status' },
    { id: 'usage', name: 'Usage Analytics', description: 'User behavior and feature utilization' },
    { id: 'financial', name: 'Financial Report', description: 'Cost analysis and budget tracking' },
    { id: 'custom', name: 'Custom Report', description: 'Create a custom report with selected metrics' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Analytics & Reports</h2>
          <p className="text-text-secondary">Performance insights and detailed reporting</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
          >
            {periods.map((period) => (
              <option key={period.value} value={period.value}>{period.label}</option>
            ))}
          </select>
          <button className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center">
            <Download size={16} className="mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading analytics...</p>
          </div>
        ) : metrics.length > 0 ? (
          metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.id} className="bg-surface p-6 rounded-lg border border-neutral">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-full ${metric.color.replace('text-', 'bg-').replace('-500', '-100')}`}>
                    <Icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                  <div className="flex items-center space-x-1">
                    {getChangeIcon(metric.changeType)}
                    <span className={`text-sm font-medium ${getChangeColor(metric.changeType)}`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-1">{metric.name}</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {metric.value}{metric.unit}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full p-8 text-center">
            <div className="w-16 h-16 bg-neutral-light rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-text-secondary" />
            </div>
            <p className="text-text-secondary">No analytics data available</p>
            <p className="text-sm text-text-secondary mt-1">Analytics will appear here once data is available</p>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Overview */}
        <div className="bg-surface p-6 rounded-lg border border-neutral">
          <h3 className="text-lg font-semibold text-text-primary mb-4">System Performance</h3>
          <div className="space-y-4">
            {performanceData.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-text-secondary">{item.name}</span>
                  <span className="text-sm font-medium text-text-primary">{item.value}%</span>
                </div>
                <div className="w-full bg-neutral-light rounded-full h-3">
                  <div 
                    className="h-3 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${item.value}%`,
                      backgroundColor: item.color
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SLA Compliance */}
        <div className="bg-surface p-6 rounded-lg border border-neutral">
          <h3 className="text-lg font-semibold text-text-primary mb-4">SLA Compliance</h3>
          <div className="space-y-4">
            {slaComplianceData.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-text-secondary">{item.category} Priority</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-text-primary">{item.actual}%</span>
                    <span className="text-xs text-text-secondary">/ {item.target}%</span>
                  </div>
                </div>
                <div className="w-full bg-neutral-light rounded-full h-3">
                  <div 
                    className="h-3 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(item.actual / item.target) * 100}%`,
                      backgroundColor: item.color
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ticket Trends */}
      <div className="bg-surface p-6 rounded-lg border border-neutral">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Ticket Trends</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral">
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Month</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Tickets Opened</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Tickets Resolved</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Resolution Rate</th>
              </tr>
            </thead>
            <tbody>
              {ticketTrendData.map((data, index) => {
                const resolutionRate = ((data.resolved / data.open) * 100).toFixed(1);
                return (
                  <tr key={index} className="border-b border-neutral-light">
                    <td className="py-3 px-4 text-sm text-text-primary">{data.month}</td>
                    <td className="py-3 px-4 text-sm text-text-primary">{data.open}</td>
                    <td className="py-3 px-4 text-sm text-text-primary">{data.resolved}</td>
                    <td className="py-3 px-4 text-sm text-text-primary">{resolutionRate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Types */}
      <div className="bg-surface p-6 rounded-lg border border-neutral">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Available Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((report) => (
            <div key={report.id} className="bg-background p-4 rounded-lg border border-neutral hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-text-primary">{report.name}</h4>
                <button className="text-primary hover:text-secondary transition-colors">
                  <Download size={16} />
                </button>
              </div>
              <p className="text-sm text-text-secondary mb-3">{report.description}</p>
              <div className="flex space-x-2">
                <button className="flex-1 bg-primary text-white px-3 py-2 rounded text-sm hover:opacity-90 transition-opacity">
                  Generate
                </button>
                <button className="px-3 py-2 border border-neutral rounded text-sm text-text-secondary hover:text-text-primary transition-colors">
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Monitoring */}
      <div className="bg-surface p-6 rounded-lg border border-neutral">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Real-time Monitoring</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-text-secondary">Live</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500 mb-1">99.9%</div>
            <div className="text-sm text-text-secondary">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500 mb-1">245ms</div>
            <div className="text-sm text-text-secondary">Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500 mb-1">1,250</div>
            <div className="text-sm text-text-secondary">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500 mb-1">23</div>
            <div className="text-sm text-text-secondary">Open Tickets</div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-surface p-6 rounded-lg border border-neutral">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Export Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center p-4 border border-neutral rounded-lg hover:bg-background transition-colors">
            <Download className="w-5 h-5 mr-2 text-text-secondary" />
            <span className="text-text-primary">PDF Report</span>
          </button>
          <button className="flex items-center justify-center p-4 border border-neutral rounded-lg hover:bg-background transition-colors">
            <Download className="w-5 h-5 mr-2 text-text-secondary" />
            <span className="text-text-primary">Excel Export</span>
          </button>
          <button className="flex items-center justify-center p-4 border border-neutral rounded-lg hover:bg-background transition-colors">
            <Download className="w-5 h-5 mr-2 text-text-secondary" />
            <span className="text-text-primary">CSV Data</span>
          </button>
          <button className="flex items-center justify-center p-4 border border-neutral rounded-lg hover:bg-background transition-colors">
            <Download className="w-5 h-5 mr-2 text-text-secondary" />
            <span className="text-text-primary">JSON API</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsReports;
