
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import { useTheme } from '../../hooks/useTheme';
import { LogIn, ShieldCheck, LogOut, Sun, Moon, Menu, X, BarChart3 } from 'lucide-react';

const Header: React.FC = () => {
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
    isEmployee, 
    logout, 
    siteContent 
  } = useAppContext();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const header = target.closest('header');
      if (isMobileMenuOpen && !header) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      // Add a small delay to prevent immediate closing
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  // Determine the correct dashboard route based on user role
  const getDashboardRoute = () => {
    // Direct role checking from user.role (more reliable than role flags)
    const userRole = user?.role?.toLowerCase().trim();
    
    if (userRole === 'admin') {
      return '/admin';
    } else if (userRole === 'hr') {
      return '/hr';
    } else if (
      userRole === 'finance_executive' ||
      userRole === 'marketing_head' ||
      userRole === 'manager' ||
      userRole === 'team_lead' ||
      userRole === 'normal_employee' ||
      userRole === 'employee'
    ) {
      return '/employee-dashboard';
    } else if (userRole === 'freelancer') {
      return '/freelancer-dashboard';
    } else if (userRole === 'customer') {
      return '/customer-dashboard';
    } else {
      return '/dashboard'; // fallback
    }
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 safe-area-top ${isScrolled ? 'bg-surface/80 backdrop-blur-lg border-b border-neutral shadow-lg' : 'bg-transparent'}`}>
      <div className="container-mobile mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center max-w-7xl">
        <Link to="/" className="text-mobile-lg sm:text-2xl font-bold text-text-primary flex items-center touch-target">
          {siteContent.logoUrl ? (
            <img src={siteContent.logoUrl} alt="Aurexis Solution Logo" className="h-8 sm:h-10 w-auto" />
          ) : (
            'Aurexis Solution'
          )}
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-6">
          <Link to="/about" className="text-text-secondary hover:text-primary transition-colors">About</Link>
          <Link to="/services" className="text-text-secondary hover:text-primary transition-colors">Services</Link>
          <Link to="/portfolio" className="text-text-secondary hover:text-primary transition-colors">Portfolio</Link>
          <Link to="/founders" className="text-text-secondary hover:text-primary transition-colors">Founders</Link>
          <Link to="/blog" className="text-text-secondary hover:text-primary transition-colors">Blog</Link>
          <Link to="/contact" className="text-text-secondary hover:text-primary transition-colors">Contact</Link>
        </nav>
        
        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-text-secondary hover:text-primary hover:bg-surface transition-colors touch-target"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  const route = getDashboardRoute();
                  const targetUrl = window.location.origin + '/#' + route;
                  
                  // Force navigation - if already on the route, reload it
                  if (location.pathname === route) {
                    window.location.reload();
                  } else {
                    // Use window.location for guaranteed navigation
                    window.location.href = targetUrl;
                  }
                }}
                className="flex items-center text-sm font-medium text-primary hover:underline cursor-pointer"
              >
                <BarChart3 size={18} className="mr-1" />
                Dashboard
              </button>
              <button onClick={logout} className="flex items-center text-sm font-medium text-text-secondary hover:text-primary">
                <LogOut size={18} className="mr-1" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="flex items-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                <LogIn size={18} className="mr-1" />
                Login
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-text-secondary hover:text-primary hover:bg-surface transition-colors touch-target"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Mobile menu button clicked, current state:', isMobileMenuOpen);
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }}
            className="p-2 rounded-full text-text-secondary hover:text-primary hover:bg-surface transition-colors touch-target"
            aria-label="Toggle mobile menu"
            data-mobile-menu-button
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden nav-mobile">
          <div className="container-mobile mx-auto px-4 py-6 space-y-4">
            {/* Debug info - remove this later */}
            <div className="text-xs text-gray-500 mb-2">Menu is open: {isMobileMenuOpen.toString()}</div>
            <Link 
              to="/about" 
              className="nav-mobile-item"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/services" 
              className="nav-mobile-item"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link 
              to="/portfolio" 
              className="nav-mobile-item"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Portfolio
            </Link>
            <Link 
              to="/founders" 
              className="nav-mobile-item"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Founders
            </Link>
            <Link 
              to="/blog" 
              className="nav-mobile-item"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link 
              to="/contact" 
              className="nav-mobile-item"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            
            <div className="border-t border-neutral pt-4 mt-4">
              {user ? (
                <div className="space-y-3">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const route = getDashboardRoute();
                      console.log('Mobile Dashboard button clicked, navigating to:', route);
                      console.log('Current location:', location.pathname);
                      setIsMobileMenuOpen(false);
                      
                      // Force navigation - if already on the route, reload it
                      if (location.pathname === route) {
                        console.log('Already on route, forcing reload...');
                        window.location.reload();
                      } else {
                        console.log('Mobile - Forcing hard navigation to:', route);
                        // Use window.location for guaranteed navigation
                        window.location.href = window.location.origin + '/#' + route;
                      }
                    }}
                    className="nav-mobile-item w-full text-left"
                  >
                    <BarChart3 size={18} className="mr-2" />
                    Dashboard
                  </button>
                  <button 
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }} 
                    className="nav-mobile-item w-full text-left"
                  >
                    <LogOut size={18} className="mr-2" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link 
                    to="/login" 
                    className="nav-mobile-item bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-center font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LogIn size={18} className="mr-2" />
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;