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
  GraduationCap,
  Shield,
  CheckCircle,
  Sparkles,
  Building2,
  Users,
  Key,
  RefreshCw
} from 'lucide-react';
import Toast from '../../components/common/Toast';

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
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOtpSent(true);
      startCountdown();
      setStep('otp');
      showToast('Verification code sent to your email', 'success');
    } catch (error) {
      showToast('Failed to send verification code. Please try again.', 'error');
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStep('reset');
      showToast('Email verified successfully!', 'success');
    } catch (error) {
      showToast('Invalid verification code. Please try again.', 'error');
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

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showToast('Password reset successfully!', 'success');
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      showToast('Failed to reset password. Please try again.', 'error');
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
        <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-t from-indigo-50/30 to-transparent"></div>
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
                <Key className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Password Recovery</h1>
              <p className="text-blue-100 text-lg font-medium">Secure and Simple Password Reset</p>
            </div>

            {/* Value propositions */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3 group">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-lg border border-white/10 group-hover:bg-white/30 transition-all duration-300">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-white">Secure Process</h3>
                  <p className="text-blue-100 leading-relaxed opacity-90">Multi-step verification ensures your account security</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 group">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-lg border border-white/10 group-hover:bg-white/30 transition-all duration-300">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-white">Quick Recovery</h3>
                  <p className="text-blue-100 leading-relaxed opacity-90">Get back to your account in just a few minutes</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 group">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-lg border border-white/10 group-hover:bg-white/30 transition-all duration-300">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-white">User Friendly</h3>
                  <p className="text-blue-100 leading-relaxed opacity-90">Simple and intuitive password reset experience</p>
                </div>
              </div>
            </div>

            {/* Stats or social proof */}
            <div className="border-t border-white/20 pt-4">
              <p className="text-blue-100 text-sm opacity-80">Trusted by thousands of users worldwide</p>
            </div>
          </div>

          {/* Enhanced floating elements */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-4 lg:py-8">
          <div className="w-full max-w-md">
            {/* Back to Login Button */}
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-all duration-300 mb-3 lg:mb-4 group hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="text-sm font-medium">Back to Login</span>
            </Link>

            {/* Header */}
            <div className="mb-3 lg:mb-4">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1 bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                {getStepTitle()}
              </h1>
              <p className="text-gray-600 text-sm lg:text-base">
                {getStepDescription()}
              </p>
            </div>

            {/* Form */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4 lg:p-5 shadow-2xl shadow-blue-500/5">
              {step === 'email' && (
                <div className="space-y-4">
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50/80 border border-gray-300/50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 focus:bg-white focus:shadow-lg focus:shadow-blue-500/20"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>

                  {/* Send OTP Button */}
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={!isValidEmail(formData.email) || isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] transform disabled:transform-none"
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
                <div className="space-y-4">
                  {/* OTP Input Field */}
                  <div>
                    <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2">
                      Verification Code
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
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
                        className="w-full pl-10 pr-4 py-3 bg-gray-50/80 border border-gray-300/50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 focus:bg-white focus:shadow-lg focus:shadow-blue-500/20 text-center tracking-widest text-lg font-mono"
                        placeholder="000000"
                        maxLength="6"
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
                    disabled={!formData.otp || formData.otp.length !== 6 || isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] transform disabled:transform-none"
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
                      className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-all duration-300 hover:scale-105"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to email</span>
                    </button>
                  </div>
                </div>
              )}

              {step === 'reset' && (
                <div className="space-y-4">
                  {/* New Password Field */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                      </div>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-12 py-3 bg-gray-50/80 border border-gray-300/50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 focus:bg-white focus:shadow-lg focus:shadow-blue-500/20"
                        placeholder="Enter new password"
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
                    <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-12 py-3 bg-gray-50/80 border border-gray-300/50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 focus:bg-white focus:shadow-lg focus:shadow-blue-500/20"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-300 hover:scale-110"
                      >
                        {showConfirmPassword ? (
                          <Eye className="h-5 w-5" />
                        ) : (
                          <EyeOff className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                                     {/* Reset Password Button */}
                   <button
                     type="button"
                     onClick={handleResetPassword}
                     disabled={!formData.newPassword || !formData.confirmPassword || formData.newPassword !== formData.confirmPassword || isLoading}
                     className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] transform disabled:transform-none"
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

                  {/* Back Button */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setStep('otp')}
                      className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-all duration-300 hover:scale-105"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to verification</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Help Section */}
            <div className="mt-3 lg:mt-4 text-center">
              <p className="text-gray-600 mb-3 font-medium">Need help?</p>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  className="group bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-blue-500/60 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105 transform"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-all duration-300 shadow-md">
                      <ArrowLeft className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">Back to Login</span>
                  </div>
                </Link>
                
                <Link
                  to="/"
                  className="group bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-purple-500/60 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105 transform"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-all duration-300 shadow-md">
                      <GraduationCap className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">Go to Home</span>
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

export default ForgotPassword; 