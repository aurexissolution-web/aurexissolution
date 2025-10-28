
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';

const SignUpPage: React.FC = () => {
  const { signup } = useAppContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }

    setLoading(true);
    const result = await signup(email, password);
    setLoading(false);

    if (result.success) {
      setSuccessMessage(result.message + " Redirecting to login...");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      // Firebase provides user-friendly error messages
      if (result.message.includes('auth/email-already-in-use')) {
          setError('An account with this email already exists.');
      } else {
          setError(result.message);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="p-8 bg-surface/50 backdrop-blur-lg border border-neutral rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-text-primary mb-2">Create an Account</h1>
        <p className="text-center text-text-secondary mb-6">Join us today!</p>
        <form onSubmit={handleSignUp}>
          <div className="mb-4">
            <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="signup-email">
              Email Address
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-background/50 border border-neutral rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              required
              disabled={loading}
            />
          </div>
          <div className="mb-4">
            <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="signup-password">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-background/50 border border-neutral rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              required
              disabled={loading}
            />
          </div>
           <div className="mb-4">
            <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="signup-confirm-password">
              Confirm Password
            </label>
            <input
              id="signup-confirm-password"
              name="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-background/50 border border-neutral rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              required
              disabled={loading}
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          {successMessage && <p className="text-green-600 text-xs italic mb-4">{successMessage}</p>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center text-sm text-text-secondary mt-6">
          Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
        </p>
         <p className="text-center text-sm text-text-secondary mt-2">
          <Link to="/" className="text-primary hover:underline font-medium">Back to Home</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
