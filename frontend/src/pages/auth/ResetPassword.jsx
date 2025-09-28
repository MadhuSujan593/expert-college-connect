import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import Toast from '../../components/common/Toast';
import apiService from '../../utils/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [toastTimeout, setToastTimeout] = useState(null);

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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResetPassword = async () => {
    if (!formData.newPassword || formData.newPassword.length < 8) {
      showToast('Password must be at least 8 characters long', 'error');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (!token) {
      showToast('Invalid reset link. Please request a new password reset.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.resetPassword(token, formData.newPassword);
      
      showToast(response.message || 'Password reset successfully!', 'success');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Password reset error:', error);
      showToast(error.message || 'Failed to reset password. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Validate token on component mount
  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      showToast('Invalid reset link. Please request a new password reset.', 'error');
    }
  }, [token]);

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-md text-center"
          >
            {/* Back to Login */}
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-8 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-base font-medium">Back to Login</span>
            </Link>

            {/* Error Message */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <Lock className="w-6 h-6 text-red-600" />
              </div>
              <h1 className="text-xl font-bold text-red-900 mb-2">Invalid Reset Link</h1>
              <p className="text-red-700 mb-4">This password reset link is invalid or has expired.</p>
              <Link
                to="/forgot-password"
                className="inline-flex items-center space-x-2 text-red-600 hover:text-red-800 font-medium transition-colors"
              >
                <span>Request a new reset link</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Back to Login */}
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-base font-medium">Back to Login</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Reset Your Password</h1>
            <p className="text-gray-600 mt-2">Create a new password for your account.</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-5">
              {/* New Password Field */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-colors text-sm"
                    placeholder="••••••••"
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
                <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-colors text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Reset Password Button */}
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-3 px-6 rounded-md font-semibold transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

        </motion.div>
      </div>

      {/* Toast Notification */}
      <Toast toast={toast} hideToast={hideToast} />
    </div>
  );
};

export default ResetPassword;
