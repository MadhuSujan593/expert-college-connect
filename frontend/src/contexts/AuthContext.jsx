import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import apiService from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    console.error('🚨 useAuth called outside of AuthProvider - this is a critical error');
    console.error('🚨 This usually happens due to timing issues or AuthProvider not wrapping components properly');
    
    // Return a more robust fallback context
    const fallbackContext = {
      user: null,
      loading: false,
      isAuthenticated: false,
      login: async () => {
        console.error('AuthProvider not available - redirecting to login');
        window.location.href = '/login';
      },
      logout: () => {
        // Clear localStorage and redirect
        localStorage.clear();
        window.location.href = '/login';
      },
      checkAuthStatus: () => Promise.resolve(),
      getDashboardRoute: () => '/dashboard',
      setUser: () => {},
    };
    
    return fallbackContext;
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState(Date.now());

  const handleAuthFailure = useCallback(() => {
    // Clear loading state on auth failure to prevent infinite loading
    console.warn('🚨 Auth failure detected - clearing auth state');
    setLoading(false);
    setCheckingAuth(false);
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('user');
    apiService.clearTokens();
  }, []);

  // Clear any stale authentication state on component mount
  useEffect(() => {
    const clearStaleAuth = () => {
      try {
        // Check if session is valid
        if (!apiService.isValidSession()) {
          console.log('🧹 Invalid session detected, clearing auth state');
          localStorage.removeItem('user');
          setLoading(false);
          setCheckingAuth(false);
          setIsAuthenticated(false);
          setUser(null);
        } else {
          console.log('✅ Valid session detected, keeping auth state');
        }
      } catch (error) {
        console.error('Error clearing sticky auth:', error);
        // Only clear auth-related items, not everything
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authSessionId');
        setLoading(false);
        setCheckingAuth(false);
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    // Clear stale state immediately
    clearStaleAuth();
  }, []);

  const checkAuthStatus = useCallback(async () => {
    if (checkingAuth) {
      return;
    }
    
    try {
      setCheckingAuth(true);
      setLoading(true);
      setLoadingStartTime(Date.now());
      
      // Add timeout protection to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Authentication check timeout')), 10000); // 10 second timeout
      });
      
      const authPromise = (async () => {
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
      })();

      // Race between auth check and timeout
      await Promise.race([authPromise, timeoutPromise]);
      
    } catch (error) {
      // Token might be expired or invalid
      console.error('Auth check failed:', error);
      
      // Only clear auth state for authentication-related errors
      // Don't logout on network errors or other temporary issues
      if (error.message?.includes('Authentication expired') || 
          error.message?.includes('Invalid token') ||
          error.message?.includes('Unauthorized')) {
        console.warn('🚨 Auth failure - clearing auth state');
        handleAuthFailure();
      } else {
        // For other errors, just stop loading without logging out
        console.warn('⚠️ Non-auth error during check:', error.message);
        setLoading(false);
        setCheckingAuth(false);
      }
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
      // Only clear auth state for authentication-related errors
      // Don't logout on network errors or API issues
      if (error.message?.includes('Authentication expired') || 
          error.message?.includes('Invalid token') ||
          error.message?.includes('Unauthorized') ||
          error.message?.includes('No valid token')) {
        console.warn('🚨 Token validation failed - clearing auth state');
        handleAuthFailure();
      } else {
        // For other errors, just log without logging out
        console.warn('⚠️ Non-auth error during validation:', error.message);
      }
    } finally {
      setCheckingAuth(false);
    }
  }, [checkingAuth, handleAuthFailure]);

  const login = useCallback(async (credentials) => {
    try {
      console.log('🔐 Login attempt with credentials:', { identifier: credentials.identifier });
      
      const response = await apiService.login(credentials);
      console.log('✅ Login API response:', response);
      
      // Validate response structure
      if (!response || !response.user) {
        throw new Error('Invalid login response received from server');
      }
      
      // Store tokens
      if (response.tokens) {
        console.log('🔑 Storing tokens...');
        apiService.setTokens(response.tokens.accessToken, response.tokens.refreshToken);
      } else {
        console.warn('⚠️ No tokens received in login response');
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
      // Provide a more helpful error message if error is undefined
      const errorMessage = error?.message || error?.toString() || 'Login failed. Please try again.';
      throw new Error(errorMessage);
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

  // Reset initialization state when navigating between pages to force fresh auth check
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('🔄 Page unloading, preparing for fresh auth check on reload');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Safety check to prevent infinite loading
  useEffect(() => {
    if (loading && !checkingAuth) {
      const loadDuration = Date.now() - loadingStartTime;
      if (loadDuration > 15000) { // If loading for more than 15 seconds
        console.warn('⚠️ Loading timeout detected, clearing loading state');
        setLoading(false);
        setCheckingAuth(false);
        setIsAuthenticated(false);
        setUser(null);
      }
    }
  }, [loading, checkingAuth, loadingStartTime]);

  // Auto-logout on inactivity (disabled for better UX)
  // Removed inactivity logout - refresh token expiration (7 days) provides sufficient security
  // Users can stay logged in as long as they're active within 7 days
  useEffect(() => {
    // Inactivity logout disabled for better user experience
    // The 7-day refresh token expiration provides adequate security
  }, [isAuthenticated, logout]);

  const value = useMemo(() => ({
    user,
    loading: loading || !initialized,
    isAuthenticated,
    login,
    logout,
    checkAuthStatus,
    getDashboardRoute,
    setUser,
  }), [user, loading, initialized, isAuthenticated, login, logout, checkAuthStatus, getDashboardRoute, setUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
