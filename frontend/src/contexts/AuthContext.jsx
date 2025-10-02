import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import apiService from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);

  const handleAuthFailure = useCallback(() => {
    apiService.clearTokens();
    setUser(null);
    setIsAuthenticated(false);
    
    // Redirect to login if not already there
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    if (checkingAuth) {
      return;
    }
    
    try {
      setCheckingAuth(true);
      setLoading(true);
      
      // Check if we have a valid token (this will trigger refresh if needed)
      const token = await apiService.getValidToken();
      const isAuth = !!token;
      
      if (!isAuth) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      // Verify token by fetching user profile
      const userProfile = await apiService.getProfile();
      
      // Also check localStorage for updated user data (e.g., after email verification)
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const localUser = JSON.parse(storedUser);
        // Merge localStorage user data with API response, prioritizing API data
        const mergedUser = { ...localUser, ...userProfile };
        setUser(mergedUser);
        // Update localStorage with merged data
        localStorage.setItem('user', JSON.stringify(mergedUser));
      } else {
        setUser(userProfile);
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(userProfile));
      }
      
      setIsAuthenticated(true);
    } catch (error) {
      // Token might be expired or invalid
      handleAuthFailure();
    } finally {
      setLoading(false);
      setCheckingAuth(false);
    }
  }, [checkingAuth, handleAuthFailure]);

  const validateToken = useCallback(async () => {
    if (checkingAuth) {
      return;
    }
    
    try {
      setCheckingAuth(true);
      
      // This will automatically refresh the token if needed
      await apiService.getProfile();
    } catch (error) {
      handleAuthFailure();
    } finally {
      setCheckingAuth(false);
    }
  }, [checkingAuth, handleAuthFailure]);

  const login = useCallback(async (credentials) => {
    try {
      console.log('🔐 Login attempt with credentials:', { identifier: credentials.identifier });
      
      const response = await apiService.login(credentials);
      console.log('✅ Login API response:', response);
      
      // Store tokens
      if (response.tokens) {
        console.log('🔑 Storing tokens...');
        apiService.setTokens(response.tokens.accessToken, response.tokens.refreshToken);
      }

      // Set user state
      console.log('👤 Setting user state:', response.user);
      setUser(response.user);
      setIsAuthenticated(true);

      // Check if email is verified
      if (!response.user.isEmailVerified) {
        console.log('📧 Email not verified, redirecting to verification page');
        // Store user data in localStorage for the verification page
        localStorage.setItem('user', JSON.stringify(response.user));
        window.location.href = '/email-verification-required';
        return response;
      }

      // Navigate to appropriate dashboard using response user data
      const dashboardRoute = getDashboardRouteForUser(response.user);
      console.log('✅ Login successful, redirecting to:', dashboardRoute);
      
      // Use window.location for navigation to avoid context issues
      window.location.href = dashboardRoute;

      return response;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call logout API if user is authenticated
      if (isAuthenticated) {
        await apiService.logout();
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API fails
    } finally {
      // Clear local state and tokens
      apiService.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      
      // Redirect to home page
      window.location.href = '/';
    }
  }, [isAuthenticated]);

  const getDashboardRoute = useCallback(() => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'EXPERT':
        return '/dashboard/expert';
      case 'COLLEGE_ADMIN':
        return '/dashboard/college';
      case 'SUPER_ADMIN':
        return '/dashboard/super-admin';
      default:
        return '/dashboard';
    }
  }, [user]);

  const getDashboardRouteForUser = useCallback((userData) => {
    if (!userData || !userData.role) return '/';
    
    switch (userData.role) {
      case 'EXPERT':
        return '/dashboard/expert';
      case 'COLLEGE_ADMIN':
        return '/dashboard/college';
      case 'SUPER_ADMIN':
        return '/dashboard/super-admin';
      default:
        return '/dashboard';
    }
  }, []);

  // Check if user is authenticated on app load (only once)
  useEffect(() => {
    if (!initialized && !checkingAuth) {
      checkAuthStatus();
      setInitialized(true);
    }
    
    // Set up periodic token validation (every 5 minutes)
    const interval = setInterval(() => {
      if (isAuthenticated && user && !checkingAuth) {
        validateToken();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [initialized, checkingAuth, isAuthenticated, user, checkAuthStatus, validateToken]); // Include memoized functions

  // Auto-logout on inactivity (disabled for better UX)
  // Removed inactivity logout - refresh token expiration (7 days) provides sufficient security
  // Users can stay logged in as long as they're active within 7 days
  useEffect(() => {
    // Inactivity logout disabled for better user experience
    // The 7-day refresh token expiration provides adequate security
  }, [isAuthenticated, logout]);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuthStatus,
    getDashboardRoute,
    setUser,
  }), [user, loading, isAuthenticated, login, logout, checkAuthStatus, getDashboardRoute, setUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
