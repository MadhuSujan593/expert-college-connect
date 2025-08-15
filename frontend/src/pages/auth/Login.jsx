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
  Shield,
  ArrowLeft,
  Building2,
  Users
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

      // Navigation will be handled by the redirect in useEffect above
      
    } catch (error) {
      console.error('Login error:', error);
      showToast(error.message || 'Login failed. Please check your credentials.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Enterprise Background Pattern */}
      <div className="absolute inset-0">
        {/* Subtle geometric pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, #3B82F6 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, #6366F1 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}></div>
        
        {/* Subtle gradient overlays */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/40 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-t from-indigo-50/30 to-transparent"></div>
      </div>

      <div className="relative flex min-h-screen">
        {/* Left Panel - Brand & Info (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 via-indigo-800 to-purple-900 relative overflow-hidden">
          {/* Enhanced brand overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/20 to-black/10"></div>
          
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
          
          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center px-10 py-12 text-white">
            {/* Logo */}
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-3 shadow-2xl border border-white/10">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">ExpertConnect</h1>
              <p className="text-blue-100 text-lg font-medium">Connecting Expertise with Opportunity</p>
            </div>

            {/* Value propositions */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3 group">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-lg border border-white/10 group-hover:bg-white/30 transition-all duration-300">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-white">Expert Network</h3>
                  <p className="text-blue-100 leading-relaxed opacity-90">Access a curated network of industry professionals and subject matter experts</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 group">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-lg border border-white/10 group-hover:bg-white/30 transition-all duration-300">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-white">Institutional Excellence</h3>
                  <p className="text-blue-100 leading-relaxed opacity-90">Connect with leading educational institutions and corporate partners</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 group">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-lg border border-white/10 group-hover:bg-white/30 transition-all duration-300">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-white">Trusted Platform</h3>
                  <p className="text-blue-100 leading-relaxed opacity-90">Built on security, verification, and professional standards</p>
                </div>
              </div>
            </div>

            {/* Stats or social proof */}
            <div className="border-t border-white/20 pt-4">
              <p className="text-blue-100 text-sm opacity-80">Trusted by 500+ institutions and 10,000+ experts worldwide</p>
            </div>
          </div>

          {/* Enhanced floating elements */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-4 lg:py-8">
          <div className="w-full max-w-md">
            {/* Back to Home Button */}
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-all duration-300 mb-3 lg:mb-4 group hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>

            {/* Login Header */}
            <div className="mb-3 lg:mb-4">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1 bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-gray-600 text-sm lg:text-base">
                Sign in to your ExpertConnect account
              </p>
            </div>

            {/* Login Form */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4 lg:p-5 shadow-2xl shadow-blue-500/5">
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Email/Phone Field */}
                <div>
                  <label htmlFor="identifier" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address or Phone Number
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {detectIdentifierType(formData.identifier) === 'email' ? (
                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                      ) : detectIdentifierType(formData.identifier) === 'phone' ? (
                        <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                      ) : (
                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                      )}
                    </div>
                    <input
                      id="identifier"
                      name="identifier"
                      type="text"
                      required
                      value={formData.identifier}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50/80 border border-gray-300/50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 focus:bg-white focus:shadow-lg focus:shadow-blue-500/20"
                      placeholder="Enter your email or phone number"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 bg-gray-50/80 border border-gray-300/50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 focus:bg-white focus:shadow-lg focus:shadow-blue-500/20"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-300 hover:scale-110"
                    >
                      {showPassword ? (
                        <Eye className="h-5 w-5" />
                      ) : (
                        <EyeOff className="h-5 w-5" />
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
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200 hover:scale-110"
                    />
                    <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700 font-medium">
                      Remember me
                    </label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-all duration-200 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!formData.identifier || !formData.password}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] transform disabled:transform-none"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Registration Section */}
            <div className="mt-3 lg:mt-4 text-center">
              <p className="text-gray-600 mb-3 font-medium">Don't have an account?</p>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/register/expert"
                  className="group bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-green-500/60 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 hover:scale-105 transform"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-all duration-300 shadow-md">
                      <Shield className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">Join as Expert</span>
                  </div>
                </Link>
                
                <Link
                  to="/register/college"
                  className="group bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-purple-500/60 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105 transform"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-all duration-300 shadow-md">
                      <GraduationCap className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">Join as Institution</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast toast={toast} hideToast={hideToast} />
    </div>
  );
};

export default Login;
