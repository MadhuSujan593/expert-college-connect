import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone,
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  GraduationCap,
  ArrowLeft,
  Building2,
  User
} from 'lucide-react';
import Toast from '../../components/common/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '', // Can be email or phone
    password: '',
    rememberMe: false
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [toastTimeout, setToastTimeout] = useState(null);
  
  const { isAuthenticated, login, getDashboardRoute, loading } = useAuth();

  // Redirect if already authenticated
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

  if (isAuthenticated) {
    return <Navigate to={getDashboardRoute()} replace />;
  }

  // Toast functions
  const showToast = (message, type = 'info') => {
    // Clear any existing timeout
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    
    setToast({ show: true, message, type });
    
    // Set new timeout for auto-hide after 5 seconds
    const timeout = setTimeout(() => {
      hideToast();
    }, 5000);
    
    setToastTimeout(timeout);
  };

  const hideToast = () => {
    // Clear timeout when manually hiding
    if (toastTimeout) {
      clearTimeout(toastTimeout);
      setToastTimeout(null);
    }
    setToast({ show: false, message: '', type: 'info' });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Helper function to detect if identifier is email or phone
  const detectIdentifierType = (identifier) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    
    if (emailRegex.test(identifier)) return 'email';
    if (phoneRegex.test(identifier.replace(/\s/g, ''))) return 'phone';
    return 'unknown';
  };

  // Helper function to validate identifier
  const isValidIdentifier = (identifier) => {
    const type = detectIdentifierType(identifier);
    return type === 'email' || type === 'phone';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate identifier and password
    if (!formData.identifier || !formData.password) {
      showToast('Please enter both email/phone and password', 'error');
      return;
    }

    if (!isValidIdentifier(formData.identifier)) {
      showToast('Please enter a valid email address or phone number', 'error');
      return;
    }

    try {
      // Use auth context login method
      const response = await login({
        identifier: formData.identifier,
        password: formData.password
      });

      // Show success message
      showToast(response.message || 'Login successful!', 'success');

      // Navigation will be handled by the AuthContext login method
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Provide more specific error messages based on the error
      let errorMessage = error.message;
      
      if (error.message.includes('Invalid credentials')) {
        errorMessage = 'Invalid email/phone or password. Please check your credentials and try again.';
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Server connection failed. Please try again later.';
      }
      
      showToast(errorMessage, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen lg:h-screen">
        {/* Left Side - Professional Image */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          {/* Main Image */}
          <div className="relative w-full h-full">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=1200&fit=crop&crop=faces"
              alt="Professional team collaboration"
              className="w-full h-full object-cover"
            />
            
            {/* Darker overlay for better text visibility */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/20"></div>
            
            {/* Brand content - Center positioned */}
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center space-y-8"
              >
                {/* Logo */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-2xl">
                    <GraduationCap className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white drop-shadow-2xl">ExpertConnect</h1>
                    <p className="text-white text-lg drop-shadow-xl">Professional Network Platform</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white drop-shadow-2xl">2.5K+</div>
                    <div className="text-white text-sm drop-shadow-xl">Experts</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white drop-shadow-2xl">850+</div>
                    <div className="text-white text-sm drop-shadow-xl">Institutions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white drop-shadow-2xl">15K+</div>
                    <div className="text-white text-sm drop-shadow-xl">Connections</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-8 lg:py-8">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-sm"
          >
            {/* Back to Home */}
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-8 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-base font-medium">Back to Home</span>
            </Link>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Welcome back! Sign in to your account</h1>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email/Phone Field */}
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {detectIdentifierType(formData.identifier) === 'email' ? (
                      <Mail className="h-4 w-4 text-gray-500" />
                    ) : detectIdentifierType(formData.identifier) === 'phone' ? (
                      <Phone className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Mail className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    required
                    value={formData.identifier}
                    onChange={handleInputChange}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-colors text-sm"
                    placeholder="john@example.com"
                    aria-describedby="email-help"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-colors text-sm"
                    placeholder="••••••••"
                    aria-describedby="password-help"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                  />
                  <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 px-6 rounded-md font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Sign in
              </button>
            </form>

            {/* Registration Section */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-6">Don't have an account?</p>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/register/expert"
                  className="group bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 hover:border-green-400 hover:from-green-100 hover:to-emerald-100 rounded-lg p-3 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-gray-900">Join as Expert</span>
                  </div>
                </Link>
                
                <Link
                  to="/register/college"
                  className="group bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-400 hover:from-purple-100 hover:to-pink-100 rounded-lg p-3 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-gray-900">Join as Institution</span>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast toast={toast} hideToast={hideToast} />
    </div>
  );
};

export default Login;
