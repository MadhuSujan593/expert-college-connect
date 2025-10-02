import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import { 
  ExpertRegistration, 
  CollegeRegistration, 
  Login, 
  ForgotPassword 
} from './pages/auth';
import EmailVerificationRequired from './pages/auth/EmailVerificationRequired';
import ExpertDashboard from './pages/expert/ExpertDashboard';
import CollegeDashboard from './pages/college/CollegeDashboard';
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard';
import SubscriptionPlans from './pages/college/SubscriptionPlans';
import RequirementDetails from './components/expert/RequirementDetails';
// import SearchExperts from './pages/search/SearchExperts';
// import SearchRequirements from './pages/search/SearchRequirements';
// import ExpertProfile from './pages/expert/ExpertProfile';
// import CollegeProfile from './pages/college/CollegeProfile';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Dashboard Redirect Component
const DashboardRedirect = () => {
  const { user } = useAuth();
  
  console.log('🔄 DashboardRedirect - User data:', user);
  console.log('🔄 DashboardRedirect - User role:', user?.role);
  console.log('🔄 DashboardRedirect - Email verified:', user?.isEmailVerified);
  
  if (!user) {
    console.log('❌ DashboardRedirect - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to appropriate dashboard based on user role
  switch (user.role) {
    case 'EXPERT':
      console.log('✅ DashboardRedirect - Redirecting to expert dashboard');
      return <Navigate to="/dashboard/expert" replace />;
    case 'COLLEGE_ADMIN':
      console.log('✅ DashboardRedirect - Redirecting to college dashboard');
      return <Navigate to="/dashboard/college" replace />;
    case 'SUPER_ADMIN':
      console.log('✅ DashboardRedirect - Redirecting to super admin dashboard');
      return <Navigate to="/dashboard/super-admin" replace />;
    default:
      console.log('❌ DashboardRedirect - Unknown role, redirecting to login');
      return <Navigate to="/login" replace />;
  }
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  console.log('AppContent rendering');
  
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/forgot-password', '/email-verification-required'].some(path => 
    location.pathname === path || location.pathname.startsWith(path + '/')
  );
  
  const isDashboardPage = location.pathname.startsWith('/dashboard');
  const isRequirementPage = location.pathname.startsWith('/requirement');
  const isSubscriptionPage = location.pathname === '/subscription-plans';
  
  // Debug logging
  console.log('Current pathname:', location.pathname);
  console.log('Is auth page:', isAuthPage);
  console.log('Is dashboard page:', isDashboardPage);
  console.log('Is requirement page:', isRequirementPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {!isAuthPage && !isDashboardPage && !isRequirementPage && !isSubscriptionPage && <Navbar />}
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/register/expert" element={<ExpertRegistration />} />
          <Route path="/register/college" element={<CollegeRegistration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/email-verification-required" element={<EmailVerificationRequired />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/expert" 
            element={
              <ProtectedRoute requiredRole="EXPERT">
                <ExpertDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/college" 
            element={
              <ProtectedRoute requiredRole="COLLEGE_ADMIN">
                <CollegeDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/super-admin" 
            element={
              <ProtectedRoute requiredRole="SUPER_ADMIN">
                <SuperAdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Subscription Plans Route */}
          <Route 
            path="/subscription-plans" 
            element={
              <ProtectedRoute requiredRole="COLLEGE_ADMIN">
                <SubscriptionPlans />
              </ProtectedRoute>
            } 
          />
          
          {/* Requirement Details Route */}
          <Route 
            path="/requirement/:id" 
            element={
              <ProtectedRoute requiredRole="EXPERT">
                <RequirementDetails />
              </ProtectedRoute>
            } 
          />
          
          {/* <Route path="/search/experts" element={<SearchExperts />} />
          <Route path="/search/requirements" element={<SearchRequirements />} />
          <Route path="/expert/:id" element={<ExpertProfile />} />
          <Route path="/college/:id" element={<CollegeProfile />} /> */}
        </Routes>
      </main>
      {!isAuthPage && !isDashboardPage && !isRequirementPage && !isSubscriptionPage && <Footer />}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
};

function App() {
  console.log('App component rendering, setting up providers...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
