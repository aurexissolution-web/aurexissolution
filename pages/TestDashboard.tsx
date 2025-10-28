import React, { useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';

const TestDashboard: React.FC = () => {
  const { user } = useAppContext();

  useEffect(() => {
    console.log('=== TEST DASHBOARD LOADED ===');
    console.log('User from localStorage:', localStorage.getItem('user'));
    console.log('User from context:', user);
    console.log('User role:', user?.role);
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          ✅ TEST DASHBOARD - Route Works!
        </h1>
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">User Info:</h2>
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">LocalStorage:</h2>
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto text-sm">
              {localStorage.getItem('user')}
            </pre>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">User Role:</h2>
            <p className="text-2xl font-bold text-blue-600">{user?.role || 'No role'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDashboard;

