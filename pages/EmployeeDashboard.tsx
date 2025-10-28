import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';

// Import individual role-specific dashboards
import FinanceDashboard from './FinanceDashboard';
import MarketingDashboard from './MarketingDashboard';
import ManagerDashboard from './ManagerDashboard';
import TeamLeadDashboard from './TeamLeadDashboard';
import NormalEmployeeDashboard from './NormalEmployeeDashboard';

/**
 * Employee Dashboard Router
 * 
 * Routes each employee role to their specific dashboard based on user.role
 */
const EmployeeDashboard: React.FC = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      console.log('No user found, redirecting to login...');
      navigate('/login');
    }
  }, [user, navigate]);

  // Loading state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Route to role-specific dashboard
  console.log('🔀 Routing employee dashboard for role:', user.role);

  switch (user.role) {
    case 'finance_executive':
      return <FinanceDashboard />;
    
    case 'marketing_head':
      return <MarketingDashboard />;
    
    case 'manager':
      return <ManagerDashboard />;
    
    case 'team_lead':
      return <TeamLeadDashboard />;
    
    case 'normal_employee':
      return <NormalEmployeeDashboard />;
    
    default:
      // Fallback to normal employee dashboard for any unknown employee role
      console.warn('⚠️ Unknown employee role:', user.role, '- Using NormalEmployeeDashboard');
      return <NormalEmployeeDashboard />;
  }
};

export default EmployeeDashboard;
