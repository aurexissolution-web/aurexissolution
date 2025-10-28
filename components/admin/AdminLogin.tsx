
import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';

const AdminLogin: React.FC = () => {
  const { login } = useAppContext();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // FIX: The login function requires two arguments, email and password.
    // The admin email from AppContext is used here.
    const success = await login('admin@aurexissolution.com', password);
    if (!success) {
      setError('Invalid password.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-neutral mb-2">Aurexis Admin Panel</h1>
        <p className="text-center text-neutral-light mb-6">Please log in to continue</p>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-neutral-light text-sm font-bold mb-2" htmlFor="admin-password">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
