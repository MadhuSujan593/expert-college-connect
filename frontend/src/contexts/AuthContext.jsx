import React, { createContext, useContext, useState, useEffect } from 'react';
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
  console.log('AuthProvider rendering, children:', children);
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthStatus();
    
    // Set up periodic token validation (every 5 minutes)
    const interval = setInterval(() => {
      if (isAuthenticated) {
        validateToken();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      
      // Check if we have a valid token
      if (!apiService.isAuthenticated()) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      // Verify token by fetching user profile
      const userProfile = await apiService.getProfile();
      setUser(userProfile);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      // Token might be expired or invalid
      handleAuthFailure();
    } finally {
      setLoading(false);
    }
  };

  const validateToken = async () => {
    try {
      // This will automatically refresh the token if needed
      await apiService.getProfile();
    } catch (error) {
      console.error('Token validation failed:', error);
      handleAuthFailure();
    }
  };

  const handleAuthFailure = () => {
    apiService.clearTokens();
    setUser(null);
    setIsAuthenticated(false);
    
    // Redirect to login if not already there
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  };

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      
      // Store tokens
      if (response.tokens) {
        apiService.setTokens(response.tokens.accessToken, response.tokens.refreshToken);
      }

      // Set user state
      setUser(response.user);
      setIsAuthenticated(true);

      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
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
  };

  const getDashboardRoute = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'EXPERT':
        return '/dashboard/expert';
      case 'COLLEGE_ADMIN':
        return '/dashboard/college';
      default:
        return '/dashboard';
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuthStatus,
    getDashboardRoute,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
