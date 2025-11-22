import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft,
  Key,
  RefreshCw
} from 'lucide-react';
import Toast from '../../components/common/Toast';
import apiService from '../../utils/api';

const ForgotPassword = () => {
  const [step, setStep] = useState('email'); // 'email', 'otp', 'reset'
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resetToken, setResetToken] = useState('');
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
    
    // Special handling for OTP field - only allow numeric input
    if (name === 'otp') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!isValidEmail(formData.email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.forgotPassword(formData.email);
      
      setOtpSent(true);
      startCountdown();
      setStep('otp');
      showToast(response.message || 'Verification code sent to your email', 'success');
    } catch (error) {
      console.error('Forgot password error:', error);
      showToast(error.message || 'Failed to send verification code. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      showToast('Please enter a valid 6-digit verification code', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.verifyPasswordResetOtp(formData.email, formData.otp);
      
      // Store the reset token for the final step
      setResetToken(response.resetToken);
      setStep('reset');
      showToast(response.message || 'Code verified successfully!', 'success');
    } catch (error) {
      console.error('OTP verification error:', error);
      showToast(error.message || 'Invalid verification code. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
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

    if (!resetToken) {
      showToast('Session expired. Please start over.', 'error');
      resetForm();
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.resetPassword(resetToken, formData.newPassword);
      
      showToast(response.message || 'Password reset successfully!', 'success');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      console.error('Password reset error:', error);
      showToast(error.message || 'Failed to reset password. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = () => {
    if (countdown > 0) return;
    
    handleSendOtp();
  };

  const resetForm = () => {
    setFormData({
      email: '',
      otp: '',
      newPassword: '',
      confirmPassword: ''
    });
    setStep('email');
    setOtpSent(false);
    setCountdown(0);
    setResetToken('');
  };

  const getStepTitle = () => {
    switch (step) {
      case 'email':
        return 'Forgot Your Password?';
      case 'otp':
        return 'Verify Your Email';
      case 'reset':
        return 'Reset Your Password';
      default:
        return 'Forgot Your Password?';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'email':
        return 'Enter your email address and we\'ll send you a verification code to reset your password.';
      case 'otp':
        return `Enter the 6-digit verification code sent to ${formData.email}`;
      case 'reset':
        return 'Create a new password for your account.';
      default:
        return 'Enter your email address and we\'ll send you a verification code to reset your password.';
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">{getStepTitle()}</h1>
            <p className="text-gray-600 mt-2">{getStepDescription()}</p>
            </div>

            {/* Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {step === 'email' && (
              <div className="space-y-5">
                  {/* Email Field */}
                  <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                  <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-500" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-colors text-sm"
                      placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  {/* Send OTP Button */}
                  <button
                    type="button"
                    onClick={handleSendOtp}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-3 px-6 rounded-md font-semibold transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Verification Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {step === 'otp' && (
              <div className="space-y-5">
                  {/* OTP Input Field */}
                  <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                      Verification Code
                    </label>
                  <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-4 w-4 text-gray-500" />
                      </div>
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        required
                        value={formData.otp}
                        onChange={handleInputChange}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-colors text-sm text-center tracking-widest text-lg font-mono"
                        placeholder="000000"
                        maxLength="6"
                        style={{ color: '#111827' }}
                      />
                    </div>
                  </div>

                  {/* Resend OTP */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={countdown > 0}
                      className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 hover:underline"
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                    </button>
                  </div>

                  {/* Verify OTP Button */}
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-3 px-6 rounded-md font-semibold transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Back Button */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={resetForm}
                    className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-all duration-300"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to email</span>
                    </button>
                  </div>
                </div>
              )}

              {step === 'reset' && (
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
                      <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Back Button */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setStep('otp')}
                    className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-all duration-300"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to verification</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

        </motion.div>
      </div>

      {/* Toast Notification */}
      <Toast toast={toast} hideToast={hideToast} />
    </div>
  );
};

export default ForgotPassword; 