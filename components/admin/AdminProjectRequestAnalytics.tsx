import React, { useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { TrendingUp, Users, Clock, CheckCircle, XCircle, AlertCircle, Calendar, DollarSign, Tag } from 'lucide-react';

const AdminProjectRequestAnalytics: React.FC = () => {
  const { projectRequests } = useAppContext();

  // Calculate analytics
  const analytics = useMemo(() => {
    const requests = Array.isArray(projectRequests) ? projectRequests : [];
    
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const approved = requests.filter(r => r.status === 'approved').length;
    const rejected = requests.filter(r => r.status === 'rejected').length;
    const needInfo = requests.filter(r => r.status === 'need-more-info').length;

    // Approval rate
    const approvalRate = total > 0 ? ((approved / total) * 100).toFixed(1) : '0.0';
    const rejectionRate = total > 0 ? ((rejected / total) * 100).toFixed(1) : '0.0';

    // Average response time (days) - only for reviewed requests
    const reviewedRequests = requests.filter(r => r.reviewedAt && r.submittedAt);
    const avgResponseTime = reviewedRequests.length > 0
      ? (reviewedRequests.reduce((sum, r) => {
          const submitted = r.submittedAt?.toDate ? r.submittedAt.toDate().getTime() : 0;
          const reviewed = r.reviewedAt?.toDate ? r.reviewedAt.toDate().getTime() : 0;
          const diff = (reviewed - submitted) / (1000 * 60 * 60 * 24); // Convert to days
          return sum + diff;
        }, 0) / reviewedRequests.length).toFixed(1)
      : '0.0';

    // Requests by category
    const categoryCounts: Record<string, number> = {};
    requests.forEach(r => {
      const cat = r.category || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // Top categories
    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Budget ranges
    const budgetCounts: Record<string, number> = {};
    requests.forEach(r => {
      const budget = r.budgetRange || 'Not specified';
      budgetCounts[budget] = (budgetCounts[budget] || 0) + 1;
    });

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRequests = requests.filter(r => {
      const submitted = r.submittedAt?.toDate ? r.submittedAt.toDate() : null;
      return submitted && submitted >= thirtyDaysAgo;
    });

    // Unique customers
    const uniqueCustomers = new Set(requests.map(r => r.customerEmail)).size;

    return {
      total,
      pending,
      approved,
      rejected,
      needInfo,
      approvalRate,
      rejectionRate,
      avgResponseTime,
      categoryCounts: topCategories,
      budgetCounts: Object.entries(budgetCounts).sort((a, b) => b[1] - a[1]),
      recentRequests: recentRequests.length,
      uniqueCustomers,
      reviewedRequests: reviewedRequests.length
    };
  }, [projectRequests]);

  const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = ({
    icon,
    label,
    value,
    color
  }) => (
    <div className="bg-surface p-6 rounded-lg border border-neutral">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      </div>
      <div className="text-3xl font-bold text-text-primary mb-1">{value}</div>
      <div className="text-sm text-text-secondary">{label}</div>
    </div>
  );

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-2">
            <TrendingUp size={32} />
            Project Request Analytics
          </h1>
          <p className="text-text-secondary mt-1">Insights and statistics about customer project requests</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Calendar className="h-6 w-6 text-blue-600" />}
            label="Total Requests"
            value={analytics.total}
            color="bg-blue-100 dark:bg-blue-900/20"
          />
          <StatCard
            icon={<Clock className="h-6 w-6 text-orange-600" />}
            label="Pending Review"
            value={analytics.pending}
            color="bg-orange-100 dark:bg-orange-900/20"
          />
          <StatCard
            icon={<CheckCircle className="h-6 w-6 text-green-600" />}
            label="Approved"
            value={analytics.approved}
            color="bg-green-100 dark:bg-green-900/20"
          />
          <StatCard
            icon={<Users className="h-6 w-6 text-purple-600" />}
            label="Unique Customers"
            value={analytics.uniqueCustomers}
            color="bg-purple-100 dark:bg-purple-900/20"
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface p-6 rounded-lg border border-neutral">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-text-primary">Approval Rate</h3>
            </div>
            <div className="text-4xl font-bold text-green-600 mb-2">{analytics.approvalRate}%</div>
            <div className="text-sm text-text-secondary">
              {analytics.approved} out of {analytics.reviewedRequests} reviewed requests approved
            </div>
          </div>

          <div className="bg-surface p-6 rounded-lg border border-neutral">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-text-primary">Avg Response Time</h3>
            </div>
            <div className="text-4xl font-bold text-blue-600 mb-2">{analytics.avgResponseTime}</div>
            <div className="text-sm text-text-secondary">days to review requests</div>
          </div>

          <div className="bg-surface p-6 rounded-lg border border-neutral">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-text-primary">Recent Activity</h3>
            </div>
            <div className="text-4xl font-bold text-purple-600 mb-2">{analytics.recentRequests}</div>
            <div className="text-sm text-text-secondary">requests in last 30 days</div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-surface rounded-lg border border-neutral">
          <div className="p-6 border-b border-neutral">
            <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Top Project Categories
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.categoryCounts.map(([category, count], index) => {
                const percentage = analytics.total > 0 ? ((count / analytics.total) * 100).toFixed(0) : 0;
                return (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-text-primary">{category}</span>
                      <span className="text-sm text-text-secondary">
                        {count} requests ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-neutral rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {analytics.categoryCounts.length === 0 && (
                <p className="text-center text-text-secondary py-4">No data available yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Budget Distribution */}
        <div className="bg-surface rounded-lg border border-neutral">
          <div className="p-6 border-b border-neutral">
            <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget Distribution
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.budgetCounts.map(([budget, count]) => (
                <div
                  key={budget}
                  className="p-4 rounded-lg bg-neutral/10 border border-neutral"
                >
                  <div className="font-semibold text-text-primary mb-1">{budget}</div>
                  <div className="text-2xl font-bold text-primary">{count}</div>
                  <div className="text-xs text-text-secondary">
                    {analytics.total > 0 ? ((count / analytics.total) * 100).toFixed(0) : 0}% of total
                  </div>
                </div>
              ))}
              {analytics.budgetCounts.length === 0 && (
                <p className="col-span-2 text-center text-text-secondary py-4">No data available yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-surface p-4 rounded-lg border border-neutral">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-text-primary">Need Info</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">{analytics.needInfo}</div>
          </div>
          <div className="bg-surface p-4 rounded-lg border border-neutral">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-text-primary">Rejected</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{analytics.rejected}</div>
          </div>
          <div className="bg-surface p-4 rounded-lg border border-neutral">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-text-primary">Rejection Rate</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{analytics.rejectionRate}%</div>
          </div>
          <div className="bg-surface p-4 rounded-lg border border-neutral">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-text-primary">Reviewed</span>
            </div>
            <div className="text-2xl font-bold text-text-primary">{analytics.reviewedRequests}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProjectRequestAnalytics;

