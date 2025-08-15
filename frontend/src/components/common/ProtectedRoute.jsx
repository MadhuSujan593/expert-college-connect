import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null, redirectTo = '/login' }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role-based access if required
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user's actual role
    const dashboardRoute = getDashboardRouteForRole(user?.role);
    return <Navigate to={dashboardRoute} replace />;
  }

  return children;
};

// Helper function to get dashboard route for a role
const getDashboardRouteForRole = (role) => {
  switch (role) {
    case 'EXPERT':
      return '/dashboard/expert';
    case 'COLLEGE_ADMIN':
      return '/dashboard/college';
    default:
      return '/dashboard';
  }
};

export default ProtectedRoute;
