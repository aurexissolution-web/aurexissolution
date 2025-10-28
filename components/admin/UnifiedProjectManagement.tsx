import React, { useState } from 'react';
import { Briefcase, FileText, Users, TrendingUp, Paperclip } from 'lucide-react';
import AdminProjectRequests from './AdminProjectRequests';
import AdminProjects from './AdminProjects';
import CustomerProjectManager from './CustomerProjectManager';
import AdminAttachments from './AdminAttachments';

type ProjectTab = 'requests' | 'all-projects' | 'customer-progression' | 'customer-files';

const UnifiedProjectManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ProjectTab>('requests');

  const TabButton: React.FC<{
    tab: ProjectTab;
    icon: React.ReactNode;
    label: string;
    description: string;
  }> = ({ tab, icon, label, description }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex flex-col items-start p-4 rounded-lg border-2 transition-all ${
        activeTab === tab
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-neutral hover:border-primary/50 hover:bg-neutral/20'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className={`${activeTab === tab ? 'text-primary' : 'text-text-secondary'}`}>
          {icon}
        </div>
        <span className={`font-semibold ${activeTab === tab ? 'text-primary' : 'text-text-primary'}`}>
          {label}
        </span>
      </div>
      <p className="text-xs text-text-secondary text-left">{description}</p>
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'requests':
        return <AdminProjectRequests />;
      case 'all-projects':
        return <AdminProjects />;
      case 'customer-progression':
        return <CustomerProjectManager />;
      case 'customer-files':
        return <AdminAttachments />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary flex items-center gap-2">
          <Briefcase size={32} />
          Project Management Hub
        </h1>
        <p className="text-text-secondary mt-1">
          Unified interface for all project management tasks
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TabButton
          tab="requests"
          icon={<FileText size={20} />}
          label="Customer Requests"
          description="Review & approve new project requests from customers"
        />
        <TabButton
          tab="all-projects"
          icon={<Briefcase size={20} />}
          label="All Projects"
          description="Manage ongoing projects across the organization"
        />
        <TabButton
          tab="customer-progression"
          icon={<Users size={20} />}
          label="Customer Progression"
          description="Update project status & progress for customers"
        />
        <TabButton
          tab="customer-files"
          icon={<Paperclip size={20} />}
          label="Customer Files"
          description="View & manage attachments uploaded by customers"
        />
      </div>

      {/* Content Area */}
      <div className="mt-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default UnifiedProjectManagement;

