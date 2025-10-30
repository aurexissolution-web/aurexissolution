import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { addMobileEventListeners } from './utils/mobileUtils';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import AdminLoginPage from './pages/AdminLoginPage';
import HRDashboard from './pages/HRDashboard';
import HRLoginPage from './pages/HRLoginPage';
import LoginPage from './pages/LoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import CustomerDashboard from './pages/CustomerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import MarketingDashboard from './pages/MarketingDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import TeamLeadDashboard from './pages/TeamLeadDashboard';
import NormalEmployeeDashboard from './pages/NormalEmployeeDashboard';
import TestDashboard from './pages/TestDashboard';
import FreelancerDashboard from './pages/FreelancerDashboard';
import FoundersPage from './pages/FoundersPage';
import PortfolioPage from './pages/PortfolioPage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import ContactPage from './pages/ContactPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import MainPageChat from './components/public/MainPageChat';

// Loading component
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-text-secondary">Loading Aurexis Solution...</p>
    </div>
  </div>
);

// App content component that uses the context
const AppContent: React.FC = () => {
  const { loading } = useAppContext();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/founders" element={<FoundersPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:serviceId" element={<ServiceDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        {/* Admin & HR Routes */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/hr" element={<HRDashboard />} />
        <Route path="/hr-login" element={<HRLoginPage />} />
        
        {/* User Dashboards */}
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        
        {/* Individual Employee Dashboard Routes (for direct access) */}
        <Route path="/finance-dashboard" element={<FinanceDashboard />} />
        <Route path="/marketing-dashboard" element={<MarketingDashboard />} />
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        <Route path="/team-lead-dashboard" element={<TeamLeadDashboard />} />
        <Route path="/normal-employee-dashboard" element={<NormalEmployeeDashboard />} />
        
        <Route path="/test-dashboard" element={<TestDashboard />} />
        <Route path="/freelancer-dashboard" element={<FreelancerDashboard />} />
      </Routes>
      <MainPageChat />
    </HashRouter>
  );
};

function App() {
  useEffect(() => {
    // Initialize mobile event listeners
    const cleanup = addMobileEventListeners();
    
    return cleanup;
  }, []);

  return (
    <AppProvider>
      <ThemeProvider>
        <div className="min-h-screen w-full bg-[#f9fafb] dark:bg-[#131022]">
          <AppContent />
        </div>
      </ThemeProvider>
    </AppProvider>
  );
}

export default App;