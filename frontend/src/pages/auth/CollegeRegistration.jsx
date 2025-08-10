import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  GraduationCap,
  Shield,
  Sparkles,
  Building2,
  MapPin,
  Phone,
  Globe,
  Award,
  BookOpen,
  Users,
  Star,
  FileText,
  Calendar
} from 'lucide-react';
import { useVerification } from '../../hooks/useVerification';
import Toast from '../../components/common/Toast';

const CollegeRegistration = () => {
  const [showPassword, setShowPassword] = useState(false);
  
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
  const [formData, setFormData] = useState({
    // Basic Institution Information (only essential fields)
    institutionName: '',
    contactPersonName: '',
    contactEmail: '',
    contactPhone: '',
    password: '',
    
    // Agreements
    agreeToTerms: false
  });

          // Watch for email and phone changes to reset verification
        useEffect(() => {
          if (formData.contactEmail === '' && isEmailVerified) {
            setIsEmailVerified(false);
            setEmailOtpSent(false);
            setShowEmailVerification(false);
            setEmailOtp('');
          }
        }, [formData.contactEmail, isEmailVerified, setIsEmailVerified, setEmailOtpSent, setShowEmailVerification, setEmailOtp]);
      
        useEffect(() => {
          if (formData.contactPhone === '' && isPhoneVerified) {
            setIsPhoneVerified(false);
            setPhoneOtpSent(false);
            setShowPhoneVerification(false);
            setPhoneOtp('');
          }
        }, [formData.contactPhone, isPhoneVerified, setIsPhoneVerified, setPhoneOtpSent, setShowPhoneVerification, setPhoneOtp]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Reset verification status when verified input is changed (but not cleared)
    if (name === 'contactEmail' && isEmailVerified && value !== '' && value !== formData.contactEmail) {
      setIsEmailVerified(false);
      setEmailOtpSent(false);
      setShowEmailVerification(false);
      setEmailOtp('');
    } else if (name === 'contactPhone' && isPhoneVerified && value !== '' && value !== formData.contactPhone) {
      setIsPhoneVerified(false);
      setPhoneOtpSent(false);
      setShowPhoneVerification(false);
      setPhoneOtp('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle college registration logic here
    console.log('College registration:', formData);
    console.log('Email verified:', isEmailVerified);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 relative overflow-hidden">
      {/* Clean modern background */}
      <div className="absolute inset-0">
        {/* Elegant wave patterns */}
        <div className="absolute inset-0 opacity-30">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
            <path fill="rgba(147, 51, 234, 0.1)" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,128C960,117,1056,75,1152,64C1248,53,1344,75,1392,85.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        
        <div className="absolute inset-0 opacity-20">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
            <path fill="rgba(168, 85, 247, 0.1)" fillOpacity="1" d="M0,224L48,208C96,192,192,160,288,165.3C384,171,480,213,576,213.3C672,213,768,171,864,149.3C960,128,1056,128,1152,144C1248,160,1344,192,1392,208L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
          </svg>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-purple-200/20 to-pink-200/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-pink-200/15 to-purple-200/10 rounded-full blur-3xl"></div>
        
        {/* Modern grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `
            linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen py-4 px-4 sm:px-6 lg:px-8">
        {/* Back to Home Button */}
        <Link
          to="/"
          className="fixed top-4 left-4 sm:top-6 sm:left-6 flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors duration-200 bg-white/95 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg hover:shadow-xl z-50"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span className="text-xs sm:text-sm font-medium">Back to Home</span>
        </Link>
        
        <div className="max-w-2xl w-full space-y-3 sm:space-y-4 mt-16 sm:mt-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 leading-tight">
              Connect With
              <span className="text-purple-600"> Industry Experts</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 max-w-xl mx-auto">
              Bridge the gap between academia and industry with verified professionals
            </p>
          </motion.div>

          {/* Clean Registration Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/90 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100 p-5 sm:p-6 hover:shadow-xl transition-all duration-300"
          >
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Institution Name */}
              <div>
                <label htmlFor="institutionName" className="block text-xs font-semibold text-gray-800 mb-1">
                  Institution Name *
                </label>
                <input
                  id="institutionName"
                  name="institutionName"
                  type="text"
                  required
                  value={formData.institutionName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 sm:py-3 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 hover:border-gray-300 transition-all duration-300 text-sm"
                  placeholder="Enter institution name"
                />
              </div>

              {/* Contact Person Name */}
              <div>
                <label htmlFor="contactPersonName" className="block text-xs font-semibold text-gray-800 mb-1">
                  Contact Person Name *
                </label>
                <input
                  id="contactPersonName"
                  name="contactPersonName"
                  type="text"
                  required
                  value={formData.contactPersonName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 sm:py-3 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 hover:border-gray-300 transition-all duration-300 text-sm"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email Address with Verification - Full Row */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label htmlFor="contactEmail" className="block text-xs font-semibold text-gray-800">
                    Official Email Address *
                  </label>
                  {isEmailVerified && (
                    <span className="text-green-600 text-sm font-medium">✓ Verified</span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 hover:border-gray-300 transition-all duration-300 text-sm"
                    placeholder="Enter official email address"
                  />
                  {!isEmailVerified && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSendEmailOtp(formData.contactEmail);
                      }}
                      disabled={isEmailSending || !formData.contactEmail || !isValidEmail(formData.contactEmail)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors whitespace-nowrap"
                    >
                      {isEmailSending ? 'Sending...' : emailOtpSent ? 'Resend OTP' : 'Verify Email'}
                    </button>
                  )}
                </div>
                
                {/* Email OTP Verification Modal - Positioned right after email field */}
                {showEmailVerification && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">Email Verification</h4>
                    <p className="text-xs text-blue-600 mb-3">
                      We've sent a verification code to {formData.contactEmail}. Enter the code below:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value)}
                        placeholder="Enter OTP (use 123456 for demo)"
                        className="w-full sm:flex-1 px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength="6"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleVerifyEmailOtp();
                        }}
                        disabled={isEmailVerifying || !emailOtp}
                        className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                      >
                        {isEmailVerifying ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                                         <button
                       type="button"
                       onClick={(e) => {
                         e.preventDefault();
                         e.stopPropagation();
                         setShowEmailVerification(false);
                         setEmailOtpSent(false);
                         setEmailOtp('');
                       }}
                       className="text-xs text-gray-500 hover:text-gray-700 mt-2"
                     >
                       Skip verification (you can verify later)
                     </button>
                  </div>
                )}
              </div>
              
              {/* Contact Phone with Verification - Full Row */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label htmlFor="contactPhone" className="block text-xs font-semibold text-gray-800">
                    Contact Phone *
                  </label>
                  {isPhoneVerified && (
                    <span className="text-green-600 text-sm font-medium">✓ Verified</span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="contactPhone"
                    name="contactPhone"
                    type="tel"
                    required
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 hover:border-gray-300 transition-all duration-300 text-sm"
                    placeholder="Enter contact number"
                  />
                  {!isPhoneVerified && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSendPhoneOtp(formData.contactPhone);
                      }}
                      disabled={isPhoneSending || !formData.contactPhone || !isValidPhone(formData.contactPhone)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors whitespace-nowrap"
                    >
                      {isPhoneSending ? 'Sending...' : phoneOtpSent ? 'Resend OTP' : 'Verify Phone'}
                  </button>
                  )}
                </div>
                
                {/* Phone OTP Verification Modal - Positioned right after phone field */}
                {showPhoneVerification && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-3">
                    <h4 className="text-sm font-semibold text-purple-800 mb-2">Phone Verification</h4>
                    <p className="text-xs text-purple-600 mb-3">
                      We've sent a verification code to {formData.contactPhone}. Enter the code below:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value)}
                        placeholder="Enter OTP (use 654321 for demo)"
                        className="w-full sm:flex-1 px-3 py-2 bg-white border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        maxLength="6"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleVerifyPhoneOtp();
                        }}
                        disabled={isPhoneVerifying || !phoneOtp}
                        className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
                      >
                        {isPhoneVerifying ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                                         <button
                       type="button"
                       onClick={(e) => {
                         e.preventDefault();
                         e.stopPropagation();
                         setShowPhoneVerification(false);
                         setPhoneOtpSent(false);
                         setPhoneOtp('');
                       }}
                       className="text-xs text-gray-500 hover:text-gray-700 mt-2"
                     >
                       Skip verification (you can verify later)
                     </button>
                  </div>
                )}
              </div>

              {/* Password */}
        <div>
                <label htmlFor="password" className="block text-xs font-semibold text-gray-800 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 sm:py-3 pr-10 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 hover:border-gray-300 transition-all duration-300 text-sm"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start pt-2">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  required
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="h-3 w-3 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-0.5"
                />
                <label htmlFor="agreeToTerms" className="ml-2 text-xs text-gray-700">
                  I agree to the <Link to="/terms" className="text-purple-600 hover:text-purple-500 font-semibold">Terms</Link> and <Link to="/privacy" className="text-purple-600 hover:text-purple-500 font-semibold">Privacy Policy</Link> *
                </label>
        </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="group relative w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 sm:py-3.5 px-6 rounded-lg text-base font-bold shadow-md shadow-purple-500/25 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 flex items-center justify-center transform hover:-translate-y-0.5 mt-3 sm:mt-4 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center">
                  Create Institution Account
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </button>
      </form>

            {/* Login Link */}
            <div className="mt-3 sm:mt-4 text-center">
              <p className="text-xs sm:text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-purple-600 hover:text-purple-500 font-semibold hover:underline transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast toast={toast} hideToast={hideToast} />
    </div>
  );
};

export default CollegeRegistration;