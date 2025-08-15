import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { useVerification } from '../../hooks/useVerification';
import Toast from '../../components/common/Toast';
import { EmailVerificationModal, PhoneVerificationModal, VerificationField } from '../../components/verification';
import CountrySelector from '../../components/common/CountrySelector';
import apiService from '../../utils/api';

const CollegeRegistration = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    confirmPassword: '',
    
    // Agreements
    agreeToTerms: false,
    useOfficialEmail: false
  });

  // Country selection state
  const [selectedCountry, setSelectedCountry] = useState(null);

  // Error states for verification
  const [emailVerificationError, setEmailVerificationError] = useState('');
  const [phoneVerificationError, setPhoneVerificationError] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
         // Validate required fields
     if (!formData.institutionName || !formData.contactPersonName || !formData.contactEmail || !formData.password || !formData.confirmPassword) {
       showToast('Please fill in all required fields', 'error');
       return;
     }

     // Note: Email and phone verification are optional, so we don't block form submission
     // Users can still create accounts without verifying their email/phone

     // Validate password confirmation
     if (formData.password !== formData.confirmPassword) {
       showToast('Passwords do not match', 'error');
       return;
     }

    if (!formData.agreeToTerms) {
      showToast('Please agree to the terms and conditions', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for API
      const registrationData = {
        fullName: formData.contactPersonName,
        email: formData.contactEmail,
        phone: selectedCountry && formData.contactPhone ? `${selectedCountry.dialCode}${formData.contactPhone}` : undefined,
        password: formData.password,
        role: 'COLLEGE_ADMIN',
        institutionName: formData.institutionName,
        contactPersonName: formData.contactPersonName,
        institutionType: 'UNIVERSITY', // Default value
        website: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        agreeToTerms: formData.agreeToTerms,
        agreeToMarketing: false
        // Note: Verification status is handled internally by the backend
        // Users can verify email/phone after account creation if they choose to
      };

      console.log('Registration data being sent:', registrationData);
      console.log('Note: Verification status is handled internally by the backend');

      const response = await apiService.register(registrationData);
      
      showToast('Registration successful! Email and phone verification are optional but recommended for security.', 'success');
      
      // Store tokens if provided
      if (response.tokens) {
        apiService.setTokens(response.tokens.accessToken, response.tokens.refreshToken);
      }
      
      // Redirect to login or dashboard
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Registration error:', error);
      showToast(error.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
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
        
        {/* Enhanced floating elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-indigo-200/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-indigo-200/15 to-purple-200/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen py-2 px-3 sm:px-6 lg:px-8">
        {/* Back to Home Button */}
        <Link
          to="/"
          className="fixed top-4 left-4 sm:top-6 sm:left-6 flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-all duration-300 bg-white/95 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg hover:shadow-xl z-50 hover:scale-105 transform"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span className="text-xs sm:text-sm font-medium">Back to Home</span>
        </Link>
        
        <div className="max-w-4xl w-full space-y-2 sm:space-y-3 lg:space-y-3 mt-12 sm:mt-10 lg:mt-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2 lg:mb-1 leading-tight bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Join the
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Elite Network</span>
            </h1>
           
          </motion.div>

          {/* Premium Registration Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl shadow-blue-500/5 border border-gray-200/50 p-2 sm:p-3 lg:p-4 pb-4 sm:pb-6 lg:pb-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500"
          >
            <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3 lg:space-y-3">
              {/* Institution Information Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 lg:gap-3">
                {/* Institution Name */}
                <div>
                  <label htmlFor="institutionName" className="block text-sm font-semibold text-gray-800 mb-1">
                    Institution Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                    </div>
                    <input
                      id="institutionName"
                      name="institutionName"
                      type="text"
                      required
                      value={formData.institutionName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 sm:py-2.5 lg:py-2.5 bg-gray-50/80 border border-gray-300/50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 hover:border-gray-300 transition-all duration-300 focus:bg-white focus:shadow-lg focus:shadow-blue-500/20 text-sm placeholder:text-sm"
                      placeholder="Enter your institution name"
                    />
                  </div>
                </div>

                {/* Contact Person Name */}
                <div>
                  <label htmlFor="contactPersonName" className="block text-sm font-semibold text-gray-800 mb-1">
                    Contact Person <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                    </div>
                    <input
                      id="contactPersonName"
                      name="contactPersonName"
                      type="text"
                      required
                      value={formData.contactPersonName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 sm:py-2.5 lg:py-2.5 bg-gray-50/80 border border-gray-300/50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 hover:border-gray-300 transition-all duration-300 focus:bg-white focus:shadow-lg focus:shadow-blue-500/20 text-sm placeholder:text-sm"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-2 sm:space-y-2">
                {/* Email Address with Verification */}
                <VerificationField
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  label="Official Email Address"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  placeholder="Enter official email address"
                  isVerified={isEmailVerified}
                  isSending={isEmailSending}
                  isValid={isValidEmail}
                  onSendOtp={handleSendEmailOtp}
                  otpSent={emailOtpSent}
                  buttonColor="bg-blue-600"
                  buttonHoverColor="hover:bg-blue-700"
                  verifiedTagColor="text-green-600"
                />
                  
                {/* Email OTP Verification Modal */}
                <EmailVerificationModal
                  isOpen={showEmailVerification}
                  email={formData.contactEmail}
                  onVerify={(otp) => handleVerifyEmailOtp(otp, formData.contactEmail)}
                  onClose={() => setShowEmailVerification(false)}
                  onSendOtp={() => handleSendEmailOtp(formData.contactEmail)}
                  isVerified={isEmailVerified}
                  isSending={isEmailSending}
                  isVerifying={isEmailVerifying}
                  otpSent={emailOtpSent}
                />

                {/* Phone Number with Verification - Custom Design */}
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <label htmlFor="contactPhone" className="block text-sm font-semibold text-gray-800">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    {/* Phone Verification Status - Same as Email */}
                    {isPhoneVerified && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 border border-green-200 rounded-lg">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-green-700 text-xs font-medium">Verified</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                    {/* Country Selector */}
                    <div className="w-full sm:w-32">
                      <CountrySelector
                        selectedCountry={selectedCountry}
                        onCountryChange={setSelectedCountry}
                        className="w-full"
                      />
                    </div>
                    {/* Phone Input - Custom Connected Design */}
                    <div className="flex-1">
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <input
                          id="contactPhone"
                          name="contactPhone"
                          type="tel"
                          required
                          value={formData.contactPhone}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 sm:py-3 lg:py-3 bg-gray-50/80 border border-gray-300/50 sm:border-l-0 rounded-xl sm:rounded-r-xl sm:rounded-l-none text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 hover:border-gray-300 transition-all duration-300 focus:bg-white focus:shadow-lg focus:shadow-blue-500/20 text-sm placeholder:text-sm"
                                                     placeholder="Enter your phone number"
                          maxLength="15"
                        />
                      </div>
                    </div>
                    {/* Verify Button */}
                    {!isPhoneVerified && (
                      <button
                        type="button"
                        onClick={() => handleSendPhoneOtp(selectedCountry && formData.contactPhone ? `${selectedCountry.dialCode}${formData.contactPhone}` : formData.contactPhone)}
                        disabled={isPhoneSending || !formData.contactPhone || !isValidPhone(formData.contactPhone)}
                        className="w-full sm:w-auto sm:ml-2 px-4 py-2.5 sm:py-3 text-white text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform disabled:transform-none disabled:cursor-not-allowed disabled:bg-gray-400 disabled:hover:bg-gray-400"
                      >
                        {isPhoneSending ? (
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Sending...
                          </div>
                        ) : phoneOtpSent ? (
                          'Resend OTP'
                        ) : (
                          'Verify Phone'
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Phone OTP Verification Modal */}
                <PhoneVerificationModal
                  isOpen={showPhoneVerification}
                  onClose={() => setShowPhoneVerification(false)}
                  phone={selectedCountry && formData.contactPhone ? `${selectedCountry.dialCode}${formData.contactPhone}` : formData.contactPhone}
                  onVerify={(otp) => handleVerifyPhoneOtp(otp, selectedCountry && formData.contactPhone ? `${selectedCountry.dialCode}${formData.contactPhone}` : formData.contactPhone)}
                  onSendOtp={() => handleSendPhoneOtp(selectedCountry && formData.contactPhone ? `${selectedCountry.dialCode}${formData.contactPhone}` : formData.contactPhone)}
                  isVerified={isPhoneVerified}
                  isSending={isPhoneSending}
                  isVerifying={isPhoneVerifying}
                  otpSent={phoneOtpSent}
                />

                {/* Use Official Email Checkbox */}
                <div className="flex items-start pt-1">
                  <input
                    id="useOfficialEmail"
                    name="useOfficialEmail"
                    type="checkbox"
                    checked={formData.useOfficialEmail}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5 transition-all duration-200 hover:scale-110 flex-shrink-0"
                  />
                  <label htmlFor="useOfficialEmail" className="ml-3 text-sm text-gray-700 font-medium">
                    <span className="font-medium">Use official email address</span>
                    <span className="text-gray-600 block mt-1 text-xs">This will be used for all your institutional operations and communications</span>
                  </label>
                </div>
              </div>

              {/* Security Section */}
              <div>
                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-1">
                    Password <span className="text-red-500">*</span>
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
                      className="w-full pl-10 pr-12 py-2 sm:py-2.5 lg:py-2.5 bg-gray-50/80 border border-gray-300/50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 hover:border-gray-300 transition-all duration-300 focus:bg-white focus:shadow-lg focus:shadow-blue-500/20 text-sm placeholder:text-sm"
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-all duration-300 hover:scale-110"
                    >
                                          {showPassword ? (
                      <Eye className="h-5 w-5" />
                    ) : (
                      <EyeOff className="h-5 w-5" />
                    )}
                    </button>
                  </div>
                                     <p className="text-xs text-gray-500 mt-1">Use at least 8 characters with a mix of letters, numbers, and symbols</p>
                 </div>

                 {/* Confirm Password */}
                 <div>
                   <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800 mb-1">
                     Confirm Password <span className="text-red-500">*</span>
                   </label>
                   <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                     </div>
                     <input
                       id="confirmPassword"
                       name="confirmPassword"
                       type={showPassword ? 'text' : 'password'}
                       required
                       value={formData.confirmPassword}
                       onChange={handleInputChange}
                       className="w-full pl-10 pr-4 py-2 sm:py-2.5 lg:py-2.5 bg-gray-50/80 border border-gray-300/50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 hover:border-gray-300 transition-all duration-300 focus:bg-white focus:shadow-lg focus:shadow-blue-500/20 text-sm placeholder:text-sm"
                       placeholder="Confirm your password"
                     />
                   </div>
                 </div>
               </div>

              {/* Agreements Section */}
              <div className="flex items-start pt-1">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  required
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5 transition-all duration-200 hover:scale-110 flex-shrink-0"
                />
                <label htmlFor="agreeToTerms" className="ml-3 text-sm text-gray-700 font-medium">
                  I agree to the <Link to="/terms" className="text-blue-600 hover:text-blue-500 font-semibold hover:underline transition-colors">Terms</Link> and <Link to="/privacy" className="text-blue-600 hover:text-blue-500 font-semibold hover:underline transition-colors">Privacy Policy</Link> *
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-2.5 sm:py-3 lg:py-3 px-6 rounded-xl text-base font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center transform hover:scale-[1.02] mt-2 sm:mt-2 lg:mt-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <GraduationCap className="mr-2 w-5 h-5" />
                      Create Institution Account
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-3 sm:mt-3 lg:mt-4 text-center">
              <p className="text-sm text-gray-600 font-medium">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-500 font-semibold hover:underline transition-colors">
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