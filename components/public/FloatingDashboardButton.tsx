import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import { BarChart3, X } from 'lucide-react';

const FloatingDashboardButton: React.FC = () => {
  const { 
    user, 
    isAdmin, 
    isHR, 
    isCustomer, 
    isFreelancer, 
    isFinanceExecutive, 
    isMarketingHead, 
    isManager, 
    isTeamLead, 
    isNormalEmployee, 
    isEmployee 
  } = useAppContext();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Only show the floating button for logged-in users after 3 seconds
    if (user && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      // Hide immediately if user logs out
      setIsVisible(false);
    }
  }, [user, isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    // Store dismissal temporarily (clear it after 5 minutes)
    const dismissTime = Date.now();
    localStorage.setItem('dashboard-floating-dismissed', dismissTime.toString());
  };

  useEffect(() => {
    // Check if user previously dismissed the button (expires after 5 minutes)
    const dismissed = localStorage.getItem('dashboard-floating-dismissed');
    if (dismissed) {
      const dismissTime = parseInt(dismissed);
      const fiveMinutes = 5 * 60 * 1000;
      if (Date.now() - dismissTime < fiveMinutes) {
        setIsDismissed(true);
      } else {
        // Expired, remove it
        localStorage.removeItem('dashboard-floating-dismissed');
      }
    }
  }, []);

  // SECURITY: Only show for logged-in users - completely hidden for anonymous users
  if (!user) {
    return null;
  }

  // Additional checks for logged-in users
  if (!isVisible || isDismissed) {
    return null;
  }

  // Determine the correct dashboard route based on user role
  const getDashboardRoute = () => {
    console.log('FloatingButton - getDashboardRoute called with:', {
      user: user?.email,
      role: user?.role,
      isAdmin,
      isHR,
      isFinanceExecutive,
      isMarketingHead,
      isManager,
      isTeamLead,
      isNormalEmployee,
      isEmployee,
      isFreelancer,
      isCustomer
    });

    if (isAdmin) {
      return '/admin';
    } else if (isHR) {
      return '/hr';
    } else if (isFinanceExecutive || isMarketingHead || isManager || isTeamLead || isNormalEmployee || isEmployee) {
      // All employee types go to unified employee dashboard
      console.log('Routing to /employee-dashboard');
      return '/employee-dashboard';
    } else if (isFreelancer) {
      return '/freelancer-dashboard';
    } else if (isCustomer) {
      return '/customer-dashboard';
    } else {
      console.warn('No role matched, using fallback /dashboard');
      return '/dashboard'; // fallback
    }
  };

  const handleNavigateToDashboard = () => {
    const route = getDashboardRoute();
    console.log('FloatingButton clicked, navigating to:', route);
    navigate(route, { replace: false });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div className="relative">
        {/* Main Dashboard Button */}
        <button
          onClick={handleNavigateToDashboard}
          className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-primary to-secondary text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 group cursor-pointer"
          title="Access Your Dashboard"
        >
          <BarChart3 size={24} className="group-hover:scale-110 transition-transform" />
        </button>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 w-6 h-6 bg-gray-500 text-white rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
          title="Dismiss"
        >
          <X size={12} />
        </button>

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Access Your Dashboard
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      </div>
    </div>
  );
};

export default FloatingDashboardButton;
