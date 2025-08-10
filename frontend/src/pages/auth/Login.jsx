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
  CheckCircle,
  Sparkles,
  ArrowLeft,
  Building2,
  Users
} from 'lucide-react';
import { useVerification } from '../../hooks/useVerification';
import Toast from '../../components/common/Toast';

const Login = () => {
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    otp: '',
    rememberMe: false
  });

  // Use shared verification hook
  const {
    showEmailVerification,
    setShowEmailVerification,
    showPhoneVerification,
    setShowPhoneVerification,
    emailOtp,
    setEmailOtp,
    phoneOtp,
    setPhoneOtp,
    isEmailVerified,
    setIsEmailVerified,
    isPhoneVerified,
    setIsPhoneVerified,
    emailOtpSent,
    setEmailOtpSent,
    phoneOtpSent,
    setPhoneOtpSent,
    isEmailSending,
    isPhoneSending,
    isEmailVerifying,
    isPhoneVerifying,
    toast,
    showToast,
    hideToast,
    isValidEmail,
    isValidPhone,
    handleSendEmailOtp,
    handleVerifyEmailOtp,
    handleSendPhoneOtp,
    handleVerifyPhoneOtp,
  } = useVerification();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Special handling for OTP field - only allow numeric input
    if (name === 'otp') {
      const numericValue = value.replace(/\D/g, ''); // Remove non-numeric characters
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSendOtp = async () => {
    if (loginMethod === 'email') {
      if (!isValidEmail(formData.email)) {
        showToast('Please enter a valid email address', 'error');
        return;
      }
      if (!formData.password) {
        showToast('Please enter your password', 'error');
        return;
      }
      // For email login, we'll handle traditional authentication here
      // For now, just show a message that email login is traditional
      showToast('Email login uses traditional password authentication', 'info');
      return;
    } else {
      if (!isValidPhone(formData.phone)) {
        showToast('Please enter a valid phone number', 'error');
        return;
      }
      // Phone login only needs phone number + OTP
      await handleSendPhoneOtp(formData.phone);
      setShowOtpInput(true);
    }
  };

  const handleVerifyOtp = async () => {
    if (loginMethod === 'email') {
      // Email login doesn't use OTP
      return;
    } else {
      // Validate OTP length before proceeding
      if (!formData.otp || formData.otp.length !== 6) {
        showToast('Please enter a valid 6-digit verification code', 'error');
        return;
      }
      
      await handleVerifyPhoneOtp();
      if (isPhoneVerified) {
        handleLoginSuccess();
      }
    }
  };

  const handleLoginSuccess = () => {
    showToast('Login successful!', 'success');
    // Here you would typically redirect to dashboard or set authentication state
    console.log('Login successful for:', loginMethod === 'email' ? formData.email : formData.phone);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loginMethod === 'email') {
      // Traditional email + password login
      if (!formData.email || !formData.password) {
        showToast('Please enter both email and password', 'error');
        return;
      }
      // Here you would handle traditional email authentication
      console.log('Email login attempt:', { email: formData.email, password: formData.password });
      showToast('Email login functionality to be implemented', 'info');
    } else {
      // Phone + OTP login
      if (!showOtpInput) {
        handleSendOtp();
      } else {
        handleVerifyOtp();
      }
    }
  };

  const resetForm = () => {
    setShowOtpInput(false);
    setFormData(prev => ({ ...prev, otp: '' }));
    setEmailOtp('');
    setPhoneOtp('');
    setEmailOtpSent(false);
    setPhoneOtpSent(false);
    setIsEmailVerified(false);
    setIsPhoneVerified(false);
  };

  const switchLoginMethod = () => {
    setLoginMethod(prev => prev === 'email' ? 'phone' : 'email');
    resetForm();
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
                {showOtpInput ? 'Verify Your Code' : 'Welcome Back'}
              </h1>
              <p className="text-gray-600 text-sm lg:text-base">
                {showOtpInput 
                  ? `Enter the 6-digit code sent to ${loginMethod === 'email' ? formData.email : formData.phone}`
                  : 'Sign in to your ExpertConnect account'
                }
              </p>
            </div>

            {/* Login Form */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4 lg:p-5 shadow-2xl shadow-blue-500/5">
              <form onSubmit={handleSubmit} className="space-y-3">
                {!showOtpInput ? (
                  <>
                    {/* Login Method Toggle */}
                    <div className="flex bg-gray-100/80 rounded-xl p-1.5 shadow-inner">
                      <button
                        type="button"
                        onClick={() => setLoginMethod('email')}
                        className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                          loginMethod === 'email'
                            ? 'bg-white text-gray-900 shadow-lg shadow-gray-200/50 transform scale-105'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                        }`}
                      >
                        <Mail className="w-4 h-4" />
                        <span>Email</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoginMethod('phone')}
                        className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                          loginMethod === 'phone'
                            ? 'bg-white text-gray-900 shadow-lg shadow-gray-200/50 transform scale-105'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                        }`}
                      >
                        <Phone className="w-4 h-4" />
                        <span>Phone</span>
                      </button>
                    </div>

                    {/* Email/Phone Field */}
                    <div>
                      <label htmlFor={loginMethod} className="block text-sm font-semibold text-gray-700 mb-2">
                        {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          {loginMethod === 'email' ? (
                            <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                          ) : (
                            <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                          )}
                        </div>
                        <input
                          id={loginMethod}
                          name={loginMethod}
                          type={loginMethod === 'email' ? 'email' : 'tel'}
                          required
                          value={formData[loginMethod]}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50/80 border border-gray-300/50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 focus:bg-white focus:shadow-lg focus:shadow-blue-500/20"
                          placeholder={loginMethod === 'email' ? 'Enter your email' : 'Enter your phone number'}
                          maxLength={loginMethod === 'phone' ? 15 : undefined}
                        />
                      </div>
                    </div>

                    {/* Password Field - Only show for email login */}
                    {loginMethod === 'email' && (
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
                    )}

                    {/* Remember Me & Forgot Password - Only show for email login */}
                    {loginMethod === 'email' && (
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
                    )}
                  </>
                ) : (
                  <>
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

                    {/* Back Button */}
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-all duration-300 hover:scale-105"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to login</span>
                      </button>
                    </div>
                  </>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={
                    showOtpInput 
                      ? !formData.otp || formData.otp.length !== 6
                      : loginMethod === 'email' 
                        ? !formData.email || !formData.password 
                        : !formData.phone
                  }
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] transform disabled:transform-none"
                >
                  <span>
                    {showOtpInput 
                      ? (loginMethod === 'email' ? isEmailVerifying : isPhoneVerifying) 
                        ? 'Verifying...' 
                        : 'Verify & Sign In'
                      : loginMethod === 'email'
                        ? 'Sign In'
                        : 'Send Code'
                    }
                  </span>
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
