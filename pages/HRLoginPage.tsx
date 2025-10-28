import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { useTheme } from '../hooks/useTheme';
import { Users, ArrowLeft } from 'lucide-react';

const HRLoginPage: React.FC = () => {
  const { login, user, isHR } = useAppContext();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in as HR
  useEffect(() => {
    if (user && isHR) {
      navigate('/hr', { replace: true });
    }
  }, [user, isHR, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // HR login uses email
    const result = await login(email, password, 'hr');
    
    if (!result.success) {
      setLoading(false);
      setError(result.message);
    } else if (result.requiresPasswordChange) {
      // Redirect to password change page
      navigate('/change-password', { replace: true });
    }
    // If successful and no password change required, useEffect will handle redirection
  };
  
  return (
    <div className={`flex items-center justify-center min-h-screen ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    } p-4`}>
      <div className={`p-8 rounded-2xl shadow-2xl w-full max-w-md ${
        theme === 'dark' 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            theme === 'dark' 
              ? 'bg-blue-900/50 border border-blue-800' 
              : 'bg-blue-100 border border-blue-200'
          }`}>
            <Users className={`h-8 w-8 ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`} />
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            HR Dashboard Login
          </h1>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Human Resources Portal Access
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              HR Email Address
            </label>
            <input
              id="hr-login-email"
              name="hr-login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              placeholder="hr@company.com"
              required
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Password
            </label>
            <input
              id="hr-login-password"
              name="hr-login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className={`p-3 rounded-lg ${
              theme === 'dark' 
                ? 'bg-red-900/50 border border-red-800 text-red-400' 
                : 'bg-red-50 border border-red-200 text-red-600'
            }`}>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
              loading
                ? theme === 'dark'
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Logging in...
              </div>
            ) : (
              'Access HR Dashboard'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className={`mt-6 pt-6 border-t ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <Link
            to="/"
            className={`flex items-center justify-center text-sm transition-colors ${
              theme === 'dark'
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HRLoginPage;

