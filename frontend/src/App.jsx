import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import ExpertDashboard from './pages/expert/ExpertDashboard';
import CollegeDashboard from './pages/college/CollegeDashboard';
// import SearchExperts from './pages/search/SearchExperts';
// import SearchRequirements from './pages/search/SearchRequirements';
// import ExpertProfile from './pages/expert/ExpertProfile';
// import CollegeProfile from './pages/college/CollegeProfile';

// Context
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/forgot-password'].some(path => 
    location.pathname === path || location.pathname.startsWith(path + '/')
  );
  
  // Debug logging
  console.log('Current pathname:', location.pathname);
  console.log('Is auth page:', isAuthPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {!isAuthPage && <Navbar />}
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/register/expert" element={<ExpertRegistration />} />
          <Route path="/register/college" element={<CollegeRegistration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Protected Routes */}
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
          
          {/* <Route path="/search/experts" element={<SearchExperts />} />
          <Route path="/search/requirements" element={<SearchRequirements />} />
          <Route path="/expert/:id" element={<ExpertProfile />} />
          <Route path="/college/:id" element={<CollegeProfile />} /> */}
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
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
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
