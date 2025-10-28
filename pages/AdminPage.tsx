import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import AdminDashboard from '../components/admin/AdminDashboard';

const AdminPage: React.FC = () => {
  const { user, isAdmin, loading } = useAppContext();

  if (loading) {
    // Show a loading spinner or some placeholder while we check auth status
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If loading is finished and user is not an admin, redirect.
  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <AdminDashboard />;
};

export default AdminPage;
