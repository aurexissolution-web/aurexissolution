
import React, { useState } from 'react';
import { LogOut, Home, Sun, Moon, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import { useTheme } from '../../hooks/useTheme';
import AdminSiteContent from './AdminSiteContent';
import AdminContactInfo from './AdminContactInfo';
import AdminServices from './AdminServices';
import AdminPortfolio from './AdminPortfolio';
import AdminTestimonials from './AdminTestimonials';
import AdminInvoices from './AdminInvoices';
import AdminQuotations from './AdminQuotations';
import AdminMessages from './AdminMessages';
import AdminFounders from './AdminFounders';
import AdminBlog from './AdminBlog';
import AdminTickets from './AdminTickets';
import AdminChat from './AdminChat';
import TelegramSettings from './TelegramSettings';
import AdminAISettings from './AdminAISettings';
import UnifiedProjectManagement from './UnifiedProjectManagement';
import AdminInvoiceManagement from './AdminInvoiceManagement';
import AdminFreelancerMonitoring from './AdminFreelancerMonitoring';

type Tab = 'content' | 'contact-info' | 'services' | 'portfolio' | 'testimonials' | 'invoices' | 'quotations' | 'payment-management' | 'messages' | 'founders' | 'blog' | 'tickets' | 'chat' | 'project-management' | 'freelancer-monitoring' | 'telegram' | 'ai-settings';

const AdminDashboard: React.FC = () => {
  const { logout } = useAppContext();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('project-management');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'content':
        return <AdminSiteContent />;
      case 'contact-info':
        return <AdminContactInfo />;
      case 'services':
        return <AdminServices />;
      case 'portfolio':
        return <AdminPortfolio />;
      case 'testimonials':
        return <AdminTestimonials />;
      case 'invoices':
        return <AdminInvoices />;
      case 'quotations':
        return <AdminQuotations />;
      case 'payment-management':
        return <AdminInvoiceManagement />;
      case 'project-management':
        return <UnifiedProjectManagement />;
      case 'freelancer-monitoring':
        return <AdminFreelancerMonitoring />;
      case 'messages':
        return <AdminMessages />;
      case 'founders':
        return <AdminFounders />;
      case 'blog':
        return <AdminBlog />;
      case 'tickets':
        return <AdminTickets />;
      case 'chat':
        return <AdminChat />;
      case 'telegram':
        return <TelegramSettings />;
      case 'ai-settings':
        return <AdminAISettings />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{ tabName: Tab; label: string }> = ({ tabName, label }) => (
    <button
      onClick={() => {
        setActiveTab(tabName);
        setIsSidebarOpen(false); // Close sidebar on mobile after selection
      }}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 w-full text-left touch-target ${
        activeTab === tabName
          ? 'bg-primary text-white'
          : 'text-neutral-light hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="admin-panel flex min-h-screen bg-background relative">
      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface shadow-md border-b border-neutral">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-text-primary">Aurexis Admin</h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md hover:bg-neutral/50 transition-colors touch-target"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <X size={24} className="text-text-primary" /> : <Menu size={24} className="text-text-primary" />}
          </button>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Responsive */}
      <aside className={`
        ${theme === 'dark' ? 'bg-neutral text-white' : 'bg-gray-800 text-white'}
        w-64 p-4 flex flex-col
        fixed lg:relative
        top-0 bottom-0 left-0
        z-40
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:pt-4
        pt-20
        overflow-y-auto
        safe-area-top
      `}>
        <div className="flex items-center justify-between mb-8 hidden lg:flex">
          <h1 className="text-2xl font-bold">Aurexis Admin</h1>
          <div className={`px-2 py-1 rounded text-xs font-medium ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-600 text-gray-200'}`}>
            {theme === 'dark' ? 'Dark' : 'Light'}
          </div>
        </div>
        <nav className="flex flex-col space-y-2 flex-grow">
          <TabButton tabName="content" label="Site Content" />
          <TabButton tabName="contact-info" label="Contact Details" />
          <TabButton tabName="services" label="Services" />
          <TabButton tabName="portfolio" label="Portfolio" />
          <TabButton tabName="testimonials" label="Testimonials" />
          <TabButton tabName="founders" label="Founders" />
          <TabButton tabName="blog" label="Blog" />
          <TabButton tabName="tickets" label="Support Tickets" />
          <TabButton tabName="chat" label="Live Chat" />
          <TabButton tabName="project-management" label="Project Management" />
          <TabButton tabName="freelancer-monitoring" label="🎯 Freelancer Monitoring" />
          <TabButton tabName="telegram" label="Telegram Bot" />
          <TabButton tabName="ai-settings" label="AI Settings" />
          <TabButton tabName="invoices" label="Invoices" />
          <TabButton tabName="quotations" label="Quotations" />
          <TabButton tabName="payment-management" label="Payment Management" />
          <TabButton tabName="messages" label="Messages" />
        </nav>
        <div className="mt-auto space-y-2 border-t border-neutral-light/20 pt-4 pb-safe-bottom">
          <button
            onClick={toggleTheme}
            className="flex items-center w-full text-left p-2 rounded-md hover:bg-neutral-light/20 transition-colors duration-200 touch-target"
          >
            {theme === 'dark' ? <Sun className="mr-3 h-5 w-5" /> : <Moon className="mr-3 h-5 w-5" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <Link 
            to="/" 
            className="flex items-center w-full text-left p-2 rounded-md hover:bg-neutral-light/20 transition-colors duration-200 touch-target"
            onClick={() => setIsSidebarOpen(false)}
          >
            <Home className="mr-3 h-5 w-5" />
            View Site
          </Link>
          <button 
            onClick={() => {
              logout();
              setIsSidebarOpen(false);
            }} 
            className="flex items-center w-full text-left p-2 rounded-md hover:bg-neutral-light/20 transition-colors duration-200 touch-target"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content - Responsive padding */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background overflow-y-auto pt-20 lg:pt-0 overflow-x-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;