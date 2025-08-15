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
  Briefcase,
  MapPin,
  Phone,
  Globe,
  Award,
  BookOpen,
  Users,
  Star,
  Building2
} from 'lucide-react';
import { useVerification } from '../../hooks/useVerification';
import Toast from '../../components/common/Toast';
import { EmailVerificationModal, PhoneVerificationModal, VerificationField } from '../../components/verification';
import CountrySelector from '../../components/common/CountrySelector';
import apiService from '../../utils/api';

const ExpertRegistration = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
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
    // Personal Information
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Professional Information
    jobTitle: '',
    company: '',
    experience: '',
    location: '',
    website: '',
    
    // Expertise & Skills
    primaryExpertise: '',
    skills: [],
    bio: '',
    
    // Preferences
    availableFor: [],
    preferredMode: '',
    hourlyRate: '',
    
    // Terms
    agreeToTerms: false,
    agreeToMarketing: false
  });

  // Country selection state
  const [selectedCountry, setSelectedCountry] = useState(null);

  // Watch for email and phone changes to reset verification
  useEffect(() => {
    if (formData.email === '' && isEmailVerified) {
      setIsEmailVerified(false);
      setEmailOtpSent(false);
      setShowEmailVerification(false);
      setEmailOtp('');
    }
  }, [formData.email, isEmailVerified]);

  useEffect(() => {
    if (formData.phone === '' && isPhoneVerified) {
      setIsPhoneVerified(false);
      setPhoneOtpSent(false);
      setShowPhoneVerification(false);
      setPhoneOtp('');
    }
  }, [formData.phone, isPhoneVerified]);

  const expertiseAreas = [
    'Artificial Intelligence & Machine Learning',
    'Data Science & Analytics',
    'Software Development',
    'Cybersecurity',
    'Digital Marketing',
    'Business Strategy',
    'Finance & Economics',
    'Healthcare & Medicine',
    'Engineering',
    'Design & UX',
    'Education & Training',
    'Other'
  ];

  const availabilityOptions = [
    'Guest Lectures',
    'Workshops & Seminars',
    'Mentoring Sessions',
    'Curriculum Review',
    'Industry Projects',
    'Research Collaboration'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Update form data - handle checkbox inputs properly
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Reset verification status when verified input is changed (but not cleared)
    if (name === 'email' && isEmailVerified && value !== '' && value !== formData.email) {
      setIsEmailVerified(false);
      setEmailOtpSent(false);
      setShowEmailVerification(false);
      setEmailOtp('');
    } else if (name === 'phone' && isPhoneVerified && value !== '' && value !== formData.phone) {
      setIsPhoneVerified(false);
      setPhoneOtpSent(false);
      setShowPhoneVerification(false);
      setPhoneOtp('');
    }
  };

  const handleSkillsChange = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleAvailabilityChange = (option) => {
    setFormData(prev => ({
      ...prev,
      availableFor: prev.availableFor.includes(option)
        ? prev.availableFor.filter(a => a !== option)
        : [...prev.availableFor, option]
    }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword || !formData.jobTitle || !formData.company) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    // Note: Email and phone verification are optional, so we don't block form submission
    // Users can still create accounts without verifying their email/phone

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
        fullName: formData.fullName,
        email: formData.email,
        phone: selectedCountry && formData.phone ? `${selectedCountry.dialCode}${formData.phone}` : undefined,
        password: formData.password,
        role: 'EXPERT',
        jobTitle: formData.jobTitle,
        company: formData.company,
        experience: formData.experience,
        primaryExpertise: formData.primaryExpertise,
        skills: formData.skills.join(', '),
        bio: formData.bio,
        availableFor: formData.availableFor.join(', '),
        preferredMode: formData.preferredMode,
        hourlyRate: formData.hourlyRate ? parseInt(formData.hourlyRate) : undefined,
        agreeToTerms: formData.agreeToTerms,
        agreeToMarketing: formData.agreeToMarketing
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
              Share Your Expertise
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> With Future Leaders</span>
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
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 sm:py-2.5 lg:py-2.5 bg-gray-50/80 border border-gray-300/50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 hover:border-gray-300 transition-all duration-300 focus:bg-white focus:shadow-lg focus:shadow-blue-500/20 text-sm placeholder:text-sm"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email and Phone Number Row */}
              <div className="space-y-2 sm:space-y-2">
                {/* Email Address with Verification */}
                <VerificationField
                  type="email"
                  id="email"
                  name="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
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
                  email={formData.email}
                  onVerify={(otp) => handleVerifyEmailOtp(otp, formData.email)}
                  onClose={() => setShowEmailVerification(false)}
                  onSendOtp={() => handleSendEmailOtp(formData.email)}
                  isVerified={isEmailVerified}
                  isSending={isEmailSending}
                  isVerifying={isEmailVerifying}
                  otpSent={emailOtpSent}
                />

                {/* Phone Number with Verification - FIXED LAYOUT */}
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
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
                           id="phone"
                           name="phone"
                           type="tel"
                           required
                           value={formData.phone}
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
                         onClick={() => handleSendPhoneOtp(selectedCountry && formData.phone ? `${selectedCountry.dialCode}${formData.phone}` : formData.phone)}
                         disabled={isPhoneSending || !formData.phone || !isValidPhone(formData.phone)}
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
                  phone={selectedCountry && formData.phone ? `${selectedCountry.dialCode}${formData.phone}` : formData.phone}
                  onVerify={(otp) => handleVerifyPhoneOtp(otp, selectedCountry && formData.phone ? `${selectedCountry.dialCode}${formData.phone}` : formData.phone)}
                  onSendOtp={() => handleSendPhoneOtp(selectedCountry && formData.phone ? `${selectedCountry.dialCode}${formData.phone}` : formData.phone)}
                  isVerified={isPhoneVerified}
                  isSending={isPhoneSending}
                  isVerifying={isPhoneVerifying}
                  otpSent={phoneOtpSent}
                />
              </div>

              {/* Job Title and Company Row - FIXED RESPONSIVENESS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-3">
                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-semibold text-gray-700 mb-1">
                    Current Job Title <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                    </div>
                    <input
                      id="jobTitle"
                      name="jobTitle"
                      type="text"
                      required
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 sm:py-2.5 lg:py-2.5 bg-gray-50/80 border border-gray-300/50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 hover:border-gray-300 transition-all duration-300 focus:bg-white focus:shadow-lg focus:shadow-blue-500/20 text-sm placeholder:text-sm"
                      placeholder="e.g., Senior Data Scientist"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-semibold text-gray-700 mb-1">
                    Company/Organization <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                    </div>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      required
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 sm:py-2.5 lg:py-2.5 bg-gray-50/80 border border-gray-300/50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 hover:border-gray-300 transition-all duration-300 focus:bg-white focus:shadow-lg focus:shadow-blue-500/20 text-sm placeholder:text-sm"
                      placeholder="e.g., Google, Microsoft, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
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
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
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
                    className="w-full pl-10 pr-12 py-2 sm:py-2.5 lg:py-2.5 bg-gray-50/80 border border-gray-300/50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 hover:border-gray-300 transition-all duration-300 focus:bg-white focus:shadow-lg focus:shadow-blue-500/20 text-sm placeholder:text-sm"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-all duration-300 hover:scale-110"
                  >
                    {showConfirmPassword ? (
                      <Eye className="h-5 w-5" />
                    ) : (
                      <EyeOff className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start pt-1">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  required
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5 transition-all duration-200 hover:scale-110"
                />
                <label htmlFor="agreeToTerms" className="ml-3 text-sm text-gray-700 font-medium">
                  I agree to the <Link to="/terms" className="text-blue-600 hover:text-blue-500 font-semibold hover:underline transition-colors">Terms</Link> and <Link to="/privacy" className="text-blue-600 hover:text-blue-500 font-semibold hover:underline transition-colors">Privacy Policy</Link> <span className="text-red-500">*</span>
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
                      Create Expert Account
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

export default ExpertRegistration;