import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null, redirectTo = '/login' }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  // Debug logging
  console.log('🛡️ ProtectedRoute render:', { 
    loading, 
    isAuthenticated, 
    user: user ? { id: user.id, email: user.email, role: user.role, emailVerified: user.isEmailVerified } : null,
    requiredRole 
  });

  // Timer to prevent infinite loading
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        console.warn('⚠️ ProtectedRoute: Loading timeout after 15 seconds');
        setLoadingTimedOut(true);
      }, 15000);

      return () => clearTimeout(timer);
    } else {
      setLoadingTimedOut(false);
    }
  }, [loading]);

  // Handle authentication failures
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Clear any stale tokens and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, redirectTo]);

  // Show loading spinner while checking authentication
  if (loading && !loadingTimedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
          <p className="text-xs text-gray-400 mt-2">If this takes too long, please refresh the page</p>
        </div>
      </div>
    );
  }

  // Show timeout message if loading takes too long
  if (loadingTimedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-xl">⚠️</span>
          </div>
          <p className="text-red-600 mb-4">Authentication check timed out</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check if email is verified
  if (user && !user.isEmailVerified) {
    console.log('❌ ProtectedRoute - Email not verified, redirecting to verification page');
    console.log('❌ ProtectedRoute - User data:', user);
    return <Navigate to="/email-verification-required" replace />;
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
    case 'SUPER_ADMIN':
      return '/dashboard/super-admin';
    default:
      return '/dashboard';
  }
};

export default ProtectedRoute;
