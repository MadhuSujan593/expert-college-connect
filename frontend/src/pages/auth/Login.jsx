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
  ArrowLeft
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Clean modern background */}
      <div className="absolute inset-0">
        {/* Elegant wave patterns */}
        <div className="absolute inset-0 opacity-30">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
            <path fill="rgba(59, 130, 246, 0.1)" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,128C960,117,1056,75,1152,64C1248,53,1344,75,1392,85.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        
        <div className="absolute inset-0 opacity-20">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
            <path fill="rgba(99, 102, 241, 0.1)" fillOpacity="1" d="M0,224L48,208C96,192,192,160,288,165.3C384,171,480,213,576,213.3C672,213,768,171,864,149.3C960,128,1056,128,1152,144C1248,160,1344,192,1392,208L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
          </svg>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-indigo-200/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-indigo-200/15 to-purple-200/10 rounded-full blur-3xl"></div>
        
        {/* Modern grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen py-2 px-4 sm:px-6 lg:px-8">
        {/* Back to Home Button */}
        <Link
          to="/"
          className="fixed top-4 left-4 sm:top-6 sm:left-6 flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 bg-white/95 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg hover:shadow-xl z-50"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span className="text-xs sm:text-sm font-medium">Back to Home</span>
        </Link>
        
        <div className="max-w-lg w-full">
          {/* Sophisticated Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-5 hover:shadow-2xl transition-all duration-500"
          >
            {/* Elegant glass overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent rounded-3xl"></div>
            
            {/* Compact Header */}
            <div className="relative text-center mb-5">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mb-3 shadow-lg shadow-blue-500/30">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              
              <h1 className="text-xl font-bold text-gray-900 mb-1 tracking-tight">
                {showOtpInput ? 'Verify OTP' : 'Welcome back'}
              </h1>
              <p className="text-sm text-gray-600">
                {showOtpInput 
                  ? `Enter the verification code sent to ${loginMethod === 'email' ? formData.email : formData.phone}`
                  : 'Sign in to your ExpertConnect account'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="relative space-y-4">
              {!showOtpInput ? (
                <>
                  {/* Login Method Toggle */}
                  <div className="flex items-center justify-center space-x-2 bg-gray-100 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setLoginMethod('email')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        loginMethod === 'email'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginMethod('phone')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        loginMethod === 'phone'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone
                    </button>
                  </div>

                  {/* Email/Phone Field */}
                  <div className="space-y-1">
                    <label htmlFor={loginMethod} className="block text-sm font-semibold text-gray-800">
                      {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        {loginMethod === 'email' ? (
                          <Mail className="h-5 w-5 text-blue-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                        ) : (
                          <Phone className="h-5 w-5 text-blue-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                        )}
                      </div>
                      <input
                        id={loginMethod}
                        name={loginMethod}
                        type={loginMethod === 'email' ? 'email' : 'tel'}
                        required
                        value={formData[loginMethod]}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 transition-all duration-300 text-base font-medium"
                        placeholder={loginMethod === 'email' ? 'Enter your email address' : 'Enter your phone number'}
                        maxLength={loginMethod === 'phone' ? 15 : undefined}
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  {/* Password Field - Only show for email login */}
                  {loginMethod === 'email' && (
                    <div className="space-y-1">
                      <label htmlFor="password" className="block text-sm font-semibold text-gray-800">
                        Password
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-blue-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-12 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 transition-all duration-300 text-base font-medium"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform duration-200"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-blue-400 hover:text-blue-500 transition-colors duration-200" />
                          ) : (
                            <Eye className="h-5 w-5 text-blue-400 hover:text-blue-500 transition-colors duration-200" />
                          )}
                        </button>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>
                  )}

                  {/* Remember Me & Forgot Password - Only show for email login */}
                  {loginMethod === 'email' && (
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-3">
                        <input
                          id="rememberMe"
                          name="rememberMe"
                          type="checkbox"
                          checked={formData.rememberMe}
                          onChange={handleInputChange}
                          className="h-5 w-5 text-blue-600 bg-gray-50 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                        />
                        <label htmlFor="rememberMe" className="text-sm text-gray-700 font-medium">
                          Remember me
                        </label>
                      </div>
                      <Link
                        to="/forgot-password"
                        className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* OTP Input Field */}
                  <div className="space-y-1">
                    <label htmlFor="otp" className="block text-sm font-semibold text-gray-800">
                      Verification Code
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-blue-400 group-focus-within:text-blue-500 transition-colors duration-200" />
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
                        className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 transition-all duration-300 text-base font-medium text-center tracking-widest"
                        placeholder="Enter 6-digit code"
                        maxLength="6"
                      />
                                           <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                   </div>
                  </div>

                  {/* Back Button */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
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
                className="group relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-2.5 px-6 rounded-xl text-base font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 disabled:shadow-none transition-all duration-300 flex items-center justify-center transform hover:-translate-y-1 disabled:transform-none mt-4 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center">
                  {showOtpInput 
                    ? (loginMethod === 'email' ? isEmailVerifying : isPhoneVerifying) 
                      ? 'Verifying...' 
                      : 'Verify & Login'
                    : loginMethod === 'email'
                      ? 'Sign In'
                      : 'Send OTP & Continue'
                  }
                  <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </button>
            </form>
          </motion.div>

          {/* Sophisticated Registration Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-4 space-y-3"
          >
            {/* Elegant Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 py-1.5 bg-white text-gray-600 font-semibold text-sm rounded-full border border-gray-200 shadow-sm">
                  New to ExpertConnect?
                </span>
              </div>
            </div>

            {/* Elegant Register Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to="/register/expert"
                className="group relative bg-white border-2 border-gray-200 hover:border-green-400 rounded-xl p-3 transition-all duration-300 hover:shadow-lg hover:shadow-green-100/50 transform hover:-translate-y-1"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-sm group-hover:text-green-700 transition-colors">
                      Join as Expert
                    </div>
                    <div className="text-gray-500 text-xs font-medium">
                      Share your expertise
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </Link>
              
              <Link
                to="/register/college"
                className="group relative bg-white border-2 border-gray-200 hover:border-purple-400 rounded-xl p-3 transition-all duration-300 hover:shadow-lg hover:shadow-purple-100/50 transform hover:-translate-y-1"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">  
                    <div className="font-bold text-gray-900 text-sm group-hover:text-purple-700 transition-colors">
                      Join as Institution
                    </div>
                    <div className="text-gray-500 text-xs font-medium">
                      Find expert talent
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </Link>
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
