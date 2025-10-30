import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { useTheme } from '../hooks/useTheme';
import CustomerAttachments from '../components/dashboard/CustomerAttachments';
import CustomerProjectRequestForm from '../components/dashboard/CustomerProjectRequestForm';
import CustomerPaymentUpload from '../components/dashboard/CustomerPaymentUpload';
import { 
  TrendingUp, 
  DollarSign, 
  Paperclip, 
  LogOut, 
  Home,
  Sun,
  Moon,
  Upload,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  X,
  Briefcase,
  Activity
} from 'lucide-react';

type TabType = 'progression' | 'payments' | 'attachments' | 'request-project';

const CustomerDashboard: React.FC = () => {
  const { user, logout, projects, deleteProject, isLoggingOut } = useAppContext();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('progression');

  // Redirect if not customer
  React.useEffect(() => {
    if (user && user.role !== 'customer') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = () => {
    console.log('🟡 LOGOUT BUTTON CLICKED in Customer Dashboard');
    logout();
    console.log('🟡 logout() function called in Customer Dashboard');
    // Note: logout() already handles navigation to homepage
  };




  const handleDeleteProject = async (projectId: string, projectTitle: string) => {
    const confirmMessage = `⚠️ Are you sure you want to delete the project "${projectTitle}"?\n\nThis action cannot be undone.`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await deleteProject(projectId);
      console.log('✅ Project deleted successfully!');
    } catch (error: any) {
      console.error('❌ Failed to delete project:', error.message);
      console.error('Error details:', error);
    }
  };

  if (!user || user.role !== 'customer') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Access Denied</h1>
          <p className="text-text-secondary mb-6">You need customer privileges to access this page.</p>
        </div>
      </div>
    );
  }

  // Filter customer projects - ONLY THIS CUSTOMER'S PROJECTS
  const customerProjects = React.useMemo(() => {
    const allProjects = Array.isArray(projects) ? projects : [];
    
    if (!user) return [];
    
    console.log('🔍 CUSTOMER PROJECT FILTER DEBUG:');
    console.log('User uniqueId:', user.uniqueId);
    console.log('User email:', user.email);
    console.log('Total projects in database:', allProjects.length);
    
    // Show ONLY projects belonging to THIS SPECIFIC customer
    const filtered = allProjects.filter(p => {
      const isAssignedToThisCustomer = p.customerEmail === user.email || 
                                       p.assignedTo === user.uniqueId ||
                                       p.customerUniqueId === user.uniqueId;
      
      if (isAssignedToThisCustomer) {
        console.log(`✅ Project "${p.title}" belongs to this customer`);
      }
      
      return isAssignedToThisCustomer;
    });
    
    console.log('✅ Projects for this customer:', filtered.length);
    console.log('Projects:', filtered.map(p => ({ title: p.title, status: p.status, customer: p.customerEmail })));
    
    return filtered;
  }, [projects, user]);

  const TabButton: React.FC<{ 
    tab: TabType; 
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

  const renderProjectProgression = () => {
    // Calculate overall progress
    const projectsWithProgress = customerProjects.filter(p => p.completionPercentage !== undefined);
    const averageProgress = projectsWithProgress.length > 0
      ? Math.round(projectsWithProgress.reduce((sum, p) => sum + (p.completionPercentage || 0), 0) / projectsWithProgress.length)
      : 0;
    
    return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        Project Progression
      </h2>

        {/* Overall Progress Card - NEW! */}
        <div className={`p-6 rounded-xl shadow-xl border-2 ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-blue-700'
            : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-lg ${
              theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
            }`}>
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Overall Progress
              </h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
              }`}>
                Average completion across all your projects
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className={`h-8 rounded-full overflow-hidden ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-white'
              }`}>
                <div 
                  className={`h-full transition-all duration-1000 flex items-center justify-end pr-3 ${
                    averageProgress >= 100
                      ? 'bg-gradient-to-r from-green-500 to-green-600'
                      : averageProgress >= 75
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                      : averageProgress >= 50
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                      : 'bg-gradient-to-r from-orange-500 to-orange-600'
                  }`}
                  style={{ width: `${Math.max(averageProgress, 5)}%` }}
                >
                  <span className="text-white text-xs font-bold">
                    {averageProgress > 10 ? `${averageProgress}%` : ''}
                  </span>
                </div>
              </div>
            </div>
            <div className={`text-4xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {averageProgress}%
            </div>
          </div>
          
          {averageProgress === 0 && (
            <p className={`text-sm mt-3 ${
              theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
            }`}>
              💡 Progress tracking will appear here as your projects advance
            </p>
          )}
        </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                Total Projects
              </p>
              <p className={`text-3xl font-bold mt-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {customerProjects.length}
              </p>
            </div>
            <FileText className={`h-10 w-10 ${
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
                In Progress
              </p>
              <p className={`text-3xl font-bold mt-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {customerProjects.filter(p => p.status === 'in-progress').length}
              </p>
            </div>
            <Clock className={`h-10 w-10 ${
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
                Completed
              </p>
              <p className={`text-3xl font-bold mt-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {customerProjects.filter(p => p.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className={`h-10 w-10 ${
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
                Pending
              </p>
              <p className={`text-3xl font-bold mt-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {customerProjects.filter(p => p.status === 'pending').length}
              </p>
            </div>
            <AlertCircle className={`h-10 w-10 ${
              theme === 'dark' ? 'text-orange-400' : 'text-orange-500'
            }`} />
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className={`rounded-lg border ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <div className="p-6">
          <h3 className={`text-xl font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Your Projects
          </h3>

          {customerProjects.length === 0 ? (
            <div className="py-12">
              {/* Beautiful Empty State */}
              <div className={`max-w-3xl mx-auto text-center p-8 rounded-2xl border-2 border-dashed ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-700/50'
                  : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300/50'
              }`}>
                {/* Large Icon */}
                <div className={`inline-flex p-6 rounded-full mb-6 ${
                  theme === 'dark' ? 'bg-blue-900/40' : 'bg-blue-100'
                }`}>
                  <Briefcase className={`h-20 w-20 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>

                {/* Main Heading */}
                <h3 className={`text-3xl font-bold mb-3 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  No Projects Yet
                </h3>

                {/* Subheading */}
                <p className={`text-lg mb-8 ${
                  theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                }`}>
                  Your project tracking dashboard will appear here once you have active projects
                </p>

                {/* Divider */}
                <div className={`h-px w-32 mx-auto mb-8 ${
                  theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                }`} />

                {/* How to Get Started Section */}
                <div className={`text-left mb-8 p-6 rounded-xl ${
                  theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/70'
                }`}>
                  <h4 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <span className="text-2xl">🚀</span>
                    How to Get Started
                  </h4>
                  
                  <div className="space-y-4">
                    {/* Step 1 */}
                    <div className="flex gap-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
                      }`}>
                        1
                      </div>
                      <div>
                        <p className={`font-semibold mb-1 ${
                          theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                        }`}>
                          Submit a Project Request
                        </p>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Go to the "Request Project" tab and submit your project details
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        theme === 'dark' ? 'bg-purple-600' : 'bg-purple-500'
                      }`}>
                        2
                      </div>
                      <div>
                        <p className={`font-semibold mb-1 ${
                          theme === 'dark' ? 'text-purple-300' : 'text-purple-800'
                        }`}>
                          Admin Reviews Your Request
                        </p>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Our team will review and approve your project request
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        theme === 'dark' ? 'bg-green-600' : 'bg-green-500'
                      }`}>
                        3
                      </div>
                      <div>
                        <p className={`font-semibold mb-1 ${
                          theme === 'dark' ? 'text-green-300' : 'text-green-800'
                        }`}>
                          Track Your Project Progress Here!
                        </p>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Once approved, you'll see real-time progress, updates, and milestones
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What You'll See Preview */}
                <div className={`text-left p-6 rounded-xl border-2 ${
                  theme === 'dark'
                    ? 'bg-gray-800/30 border-gray-700'
                    : 'bg-white/50 border-gray-200'
                }`}>
                  <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <span className="text-xl">✨</span>
                    What You'll See Once Projects Are Active
                  </h4>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <TrendingUp className={`h-5 w-5 flex-shrink-0 ${
                        theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                      <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        <strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Overall Progress Card</strong> - See average completion across all projects
                      </p>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Activity className={`h-5 w-5 flex-shrink-0 ${
                        theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                      <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        <strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Progress Bars</strong> - Visual completion percentage with color-coded status
                      </p>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <AlertCircle className={`h-5 w-5 flex-shrink-0 ${
                        theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                      <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        <strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Latest Updates</strong> - Real-time messages from your project team
                      </p>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className={`h-5 w-5 flex-shrink-0 ${
                        theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                      <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        <strong className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Milestones</strong> - Track project phases and completion targets
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => setActiveTab('request-project')}
                  className={`mt-8 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                  }`}
                >
                  🚀 Submit Your First Project Request
                </button>

                {/* Help Text */}
                <p className={`mt-6 text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Need help? Contact our support team or check the "Request Project" tab for more information
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {customerProjects.map(project => (
                <div
                  key={project.id}
                  className={`p-4 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {project.title}
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : project.status === 'in-progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : project.status === 'pending'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <p className={`text-sm mb-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {project.description}
                  </p>

                  {/* Progress Bar - ALWAYS SHOW */}
                  <div className={`mb-4 p-4 rounded-lg border-2 ${
                    theme === 'dark'
                      ? 'bg-gray-700/50 border-blue-700'
                      : 'bg-blue-50/50 border-blue-200'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className={`h-5 w-5 ${
                          theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                        <span className={`text-sm font-bold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          Project Progress
                        </span>
                      </div>
                      <span className={`text-2xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {project.completionPercentage || 0}%
                      </span>
                    </div>
                    <div className={`w-full h-6 rounded-full overflow-hidden shadow-inner ${
                      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                    }`}>
                      <div 
                        className={`h-full transition-all duration-1000 flex items-center justify-end pr-2 ${
                          (project.completionPercentage || 0) >= 100
                            ? 'bg-gradient-to-r from-green-500 to-green-600'
                            : (project.completionPercentage || 0) >= 75
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                            : (project.completionPercentage || 0) >= 50
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                            : (project.completionPercentage || 0) > 0
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                            : 'bg-gradient-to-r from-gray-400 to-gray-500'
                        }`}
                        style={{ width: `${Math.max((project.completionPercentage || 0), 3)}%` }}
                      >
                        {(project.completionPercentage || 0) > 15 && (
                          <span className="text-white text-xs font-bold">
                            {project.completionPercentage}%
                          </span>
                        )}
                      </div>
                    </div>
                    {(project.completionPercentage || 0) === 0 && (
                      <p className={`text-xs mt-2 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        🚀 Project just started - progress updates coming soon!
                      </p>
                    )}
                  </div>

                  {/* Progress Notes - ALWAYS SHOW */}
                  <div className={`mb-4 p-4 rounded-lg border-l-4 ${
                    project.progressNotes
                      ? theme === 'dark'
                        ? 'bg-blue-900/20 border-blue-500'
                        : 'bg-blue-50 border-blue-400'
                      : theme === 'dark'
                      ? 'bg-gray-700/30 border-gray-600'
                      : 'bg-gray-50 border-gray-300'
                  }`}>
                    <div className="flex items-start gap-2">
                      <AlertCircle className={`h-5 w-5 mt-0.5 ${
                        project.progressNotes
                          ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                          : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                      <div className="flex-1">
                        <p className={`text-sm font-bold mb-1 ${
                          project.progressNotes
                            ? theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                            : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          📢 Latest Update from Team
                        </p>
                        {project.progressNotes ? (
                          <>
                            <p className={`text-sm whitespace-pre-wrap ${
                              theme === 'dark' ? 'text-blue-200' : 'text-blue-700'
                            }`}>
                              {project.progressNotes}
                            </p>
                            {project.lastProgressUpdate && (
                              <p className={`text-xs mt-2 flex items-center gap-1 ${
                                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                              }`}>
                                <Clock className="h-3 w-3" />
                                Updated: {new Date(project.lastProgressUpdate.seconds * 1000).toLocaleString()}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className={`text-sm italic ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                          }`}>
                            No updates yet. Your team will post progress updates here as they work on your project.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Milestones */}
                  {project.milestones && project.milestones.length > 0 && (
                    <div className="mb-4">
                      <p className={`text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Milestones ({project.milestones.filter(m => m.status === 'completed').length}/{project.milestones.length} completed)
                      </p>
                      <div className="space-y-2">
                        {project.milestones.sort((a, b) => a.order - b.order).map(milestone => (
                          <div
                            key={milestone.id}
                            className={`p-2 rounded text-sm flex items-start gap-2 ${
                              theme === 'dark'
                                ? 'bg-gray-700'
                                : 'bg-gray-100'
                            }`}
                          >
                            {milestone.status === 'completed' ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            ) : milestone.status === 'in-progress' ? (
                              <Clock className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            ) : (
                              <div className={`h-4 w-4 rounded-full border-2 mt-0.5 flex-shrink-0 ${
                                theme === 'dark' ? 'border-gray-500' : 'border-gray-400'
                              }`} />
                            )}
                            <div className="flex-1">
                              <p className={`font-medium ${
                                milestone.status === 'completed'
                                  ? 'line-through opacity-75'
                                  : ''
                              } ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {milestone.title}
                              </p>
                              {milestone.description && (
                                <p className={`text-xs mt-0.5 ${
                                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  {milestone.description}
                                </p>
                              )}
                              {milestone.targetDate && (
                                <p className={`text-xs mt-0.5 ${
                                  theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                                }`}>
                                  Target: {milestone.targetDate}
                                  {milestone.completedDate && ` • Completed: ${milestone.completedDate}`}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        Due: {new Date(project.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {project.priority && (
                        <span className={`px-2 py-1 rounded text-xs ${
                          project.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : project.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {project.priority.toUpperCase()} Priority
                        </span>
                      )}
                    </div>
                  </div>

                  {project.budget && (
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                        <span className={`font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          Budget: ${project.budget.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {project.notes && (
                    <div className="mt-3">
                      <p className={`text-sm italic ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        📝 {project.notes}
                      </p>
                    </div>
                  )}

                  {/* Delete Button */}
                  <div className="mt-4 pt-3 border-t border-gray-300 dark:border-gray-600">
                    <button
                      onClick={() => handleDeleteProject(project.id, project.title)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      <X className="h-4 w-4" />
                      Delete Project
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
  };

  const renderPayments = () => (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        Payments, Invoices & Quotations
      </h2>
      <CustomerPaymentUpload />
    </div>
  );

  const renderAttachments = () => <CustomerAttachments />;

  const renderRequestProject = () => <CustomerProjectRequestForm />;

  const renderContent = () => {
    switch (activeTab) {
      case 'progression':
        return renderProjectProgression();
      case 'payments':
        return renderPayments();
      case 'attachments':
        return renderAttachments();
      case 'request-project':
        return renderRequestProject();
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex min-h-screen w-full">
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
              Customer Portal
            </h1>
            <p className={`text-sm mt-1 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {user.email}
            </p>
          </div>

          <nav className="px-4 space-y-2">
            <TabButton 
              tab="request-project" 
              icon={<Send className="h-5 w-5" />} 
              label="Request Project" 
            />
            <TabButton 
              tab="progression" 
              icon={<TrendingUp className="h-5 w-5" />} 
              label="Project Progression" 
            />
            <TabButton 
              tab="payments" 
              icon={<DollarSign className="h-5 w-5" />} 
              label="Payments & Invoices" 
            />
            <TabButton 
              tab="attachments" 
              icon={<Paperclip className="h-5 w-5" />} 
              label="Attachments" 
            />
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

            <button
              onClick={() => navigate('/')}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors w-full ${
                theme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home className="h-5 w-5" />
              <span>Back to Home</span>
            </button>

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

export default CustomerDashboard;


