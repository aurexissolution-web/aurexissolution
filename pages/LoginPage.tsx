import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';

const LoginPage: React.FC = () => {
  const { 
    login, user, isAdmin, isCustomer, isHR, isFreelancer,
    isFinanceExecutive, isMarketingHead, isManager, isTeamLead, isNormalEmployee
  } = useAppContext();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'customer' | 'admin' | 'hr' | 'freelancer' | 'employee'>('customer');
  const [uniqueId, setUniqueId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in (when page loads)
  useEffect(() => {
    // Only redirect if user exists AND we're still on the login page
    if (user && window.location.hash === '#/login') {
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else if (isHR) {
        navigate('/hr', { replace: true });
      } else if (isFinanceExecutive || isMarketingHead || isManager || isTeamLead || isNormalEmployee) {
        // All internal employee roles go to unified employee dashboard
        navigate('/employee-dashboard', { replace: true });
      } else if (isCustomer) {
        navigate('/customer-dashboard', { replace: true });
      } else if (isFreelancer) {
        navigate('/freelancer-dashboard', { replace: true });
      }
    }
  }, [user, isAdmin, isHR, isFinanceExecutive, isMarketingHead, isManager, isTeamLead, isNormalEmployee, isCustomer, isFreelancer, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Use email for internal roles (admin, HR), unique ID for external roles (customer, freelancer)
      const emailBasedRoles = ['admin', 'hr'];
      const credential = emailBasedRoles.includes(selectedRole) ? email : uniqueId;
      
      const result = await login(credential, password, selectedRole);
      
      if (!result.success) {
        setLoading(false);
        setError(result.message);
      } else if (result.requiresPasswordChange) {
        // Redirect to password change page
        navigate('/change-password', { replace: true });
      } else {
        // Login successful - determine dashboard route based on selected role
        // Small delay to ensure state is updated
        setTimeout(() => {
          if (selectedRole === 'admin') {
            navigate('/admin', { replace: true });
          } else if (selectedRole === 'hr') {
            navigate('/hr', { replace: true });
          } else if (selectedRole === 'customer') {
            navigate('/customer-dashboard', { replace: true });
          } else if (selectedRole === 'freelancer') {
            navigate('/freelancer-dashboard', { replace: true });
          } else if (selectedRole === 'employee') {
            // All employee roles (finance, marketing, manager, team_lead, normal_employee)
            navigate('/employee-dashboard', { replace: true });
          } else {
            // Fallback to homepage
            navigate('/', { replace: true });
          }
        }, 100);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="p-8 bg-surface/50 backdrop-blur-lg border border-neutral rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-text-primary mb-2">Access Your Dashboard</h1>
        <p className="text-center text-text-secondary mb-6">Select your role and enter your credentials</p>
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label className="block text-text-secondary text-sm font-bold mb-3">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('customer')}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  selectedRole === 'customer'
                    ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                    : 'bg-background/50 text-text-secondary hover:bg-background/70'
                }`}
                disabled={loading}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('freelancer')}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  selectedRole === 'freelancer'
                    ? 'bg-purple-500 text-white shadow-lg transform scale-105'
                    : 'bg-background/50 text-text-secondary hover:bg-background/70'
                }`}
                disabled={loading}
              >
                Freelancer
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('employee')}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  selectedRole === 'employee'
                    ? 'bg-green-500 text-white shadow-lg transform scale-105'
                    : 'bg-background/50 text-text-secondary hover:bg-background/70'
                }`}
                disabled={loading}
              >
                Employee
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('hr')}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  selectedRole === 'hr'
                    ? 'bg-orange-500 text-white shadow-lg transform scale-105'
                    : 'bg-background/50 text-text-secondary hover:bg-background/70'
                }`}
                disabled={loading}
              >
                HR Manager
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`px-4 py-3 rounded-lg font-medium transition-all col-span-2 ${
                  selectedRole === 'admin'
                    ? 'bg-red-500 text-white shadow-lg transform scale-105'
                    : 'bg-background/50 text-text-secondary hover:bg-background/70'
                }`}
                disabled={loading}
              >
                Admin
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="credential">
              {selectedRole === 'admin' || selectedRole === 'hr' ? 'Email Address' : 'Unique ID'}
            </label>
            {selectedRole === 'admin' || selectedRole === 'hr' ? (
              <input
                id="credential"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-background/50 border border-neutral rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="Enter your email address"
                required
                disabled={loading}
                autoComplete="email"
              />
            ) : (
              <input
                id="credential"
                name="uniqueId"
                type="text"
                value={uniqueId}
                onChange={(e) => setUniqueId(e.target.value)}
                className="w-full px-4 py-3 bg-background/50 border border-neutral rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="Enter your unique ID"
                required
                disabled={loading}
                autoComplete="username"
              />
            )}
          </div>

          <div className="mb-6">
            <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-background/50 border border-neutral rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="Enter your password"
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg hover:shadow-xl"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging In...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/change-password" className="text-sm text-primary hover:underline">
            Forgot Password?
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-text-secondary hover:text-primary transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
