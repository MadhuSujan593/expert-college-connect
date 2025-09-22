import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import apiService from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  console.log('useAuth hook called');
  const context = useContext(AuthContext);
  console.log('AuthContext value:', context);
  
  if (!context) {
    console.error('useAuth called outside of AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  console.log('🔄 AuthProvider rendering, children:', children);
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);

  console.log('🔄 Current state:', { user: !!user, loading, isAuthenticated, initialized, checkingAuth });

  const checkAuthStatus = useCallback(async () => {
    if (checkingAuth) {
      console.log('🔒 Auth check already in progress, skipping...');
      return;
    }
    
    try {
      console.log('🔍 Checking authentication status...');
      setCheckingAuth(true);
      setLoading(true);
      
      // Check if we have a valid token
      const isAuth = apiService.isAuthenticated();
      console.log('🔑 Is authenticated check:', isAuth);
      
      if (!isAuth) {
        console.log('❌ No valid token found, setting unauthenticated');
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      // Verify token by fetching user profile
      console.log('👤 Fetching user profile...');
      const userProfile = await apiService.getProfile();
      console.log('✅ User profile loaded:', userProfile);
      
      setUser(userProfile);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      // Token might be expired or invalid
      handleAuthFailure();
    } finally {
      setLoading(false);
      setCheckingAuth(false);
    }
  }, [checkingAuth]);

  const validateToken = useCallback(async () => {
    if (checkingAuth) {
      console.log('🔒 Token validation already in progress, skipping...');
      return;
    }
    
    try {
      console.log('🔄 Validating token...');
      setCheckingAuth(true);
      
      // This will automatically refresh the token if needed
      await apiService.getProfile();
      console.log('✅ Token validation successful');
    } catch (error) {
      console.error('❌ Token validation failed:', error);
      handleAuthFailure();
    } finally {
      setCheckingAuth(false);
    }
  }, [checkingAuth]);

  const handleAuthFailure = useCallback(() => {
    apiService.clearTokens();
    setUser(null);
    setIsAuthenticated(false);
    
    // Redirect to login if not already there
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }, []);

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

  // Auto-logout on inactivity (2 hours)
  useEffect(() => {
    if (isAuthenticated) {
      let inactivityTimer;
      
      const resetTimer = () => {
        clearTimeout(inactivityTimer);
        // Logout after 2 hours of inactivity
        inactivityTimer = setTimeout(() => {
          console.log('🕐 Auto-logout due to inactivity (2 hours)');
          logout();
        }, 2 * 60 * 60 * 1000); // 2 hours
      };

      // Reset timer on user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => {
        document.addEventListener(event, resetTimer, true);
      });

      resetTimer(); // Start the timer

      return () => {
        clearTimeout(inactivityTimer);
        events.forEach(event => {
          document.removeEventListener(event, resetTimer, true);
        });
      };
    }
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
