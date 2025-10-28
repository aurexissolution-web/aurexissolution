import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';

const ChangePasswordPage: React.FC = () => {
  const { changePassword, user } = useAppContext();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    const result = await changePassword(newPassword);
    setLoading(false);

    if (result.success) {
      setSuccessMessage(result.message + " Redirecting to your dashboard...");
      setTimeout(() => {
        navigate('/customer-dashboard');
      }, 2000);
    } else {
      setError(result.message);
    }
  };

  // Redirect if not a customer or already changed password
  if (!user || user.role !== 'customer' || user.hasChangedPassword) {
    navigate('/login');
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="p-8 bg-surface/50 backdrop-blur-lg border border-neutral rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-text-primary mb-2">Change Your Password</h1>
        <p className="text-center text-text-secondary mb-6">
          For security reasons, you must change your password before accessing your dashboard.
        </p>
        <form onSubmit={handleChangePassword}>
          <div className="mb-4">
            <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="newPassword">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-background/50 border border-neutral rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter new password"
              required
              disabled={loading}
            />
          </div>
          <div className="mb-4">
            <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="change-password-confirm">
              Confirm New Password
            </label>
            <input
              id="change-password-confirm"
              name="change-password-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-background/50 border border-neutral rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Confirm new password"
              required
              disabled={loading}
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          {successMessage && <p className="text-green-500 text-xs italic mb-4">{successMessage}</p>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
