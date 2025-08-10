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
  Briefcase,
  MapPin,
  Phone,
  Globe,
  Award,
  BookOpen,
  Users,
  Star
} from 'lucide-react';
import { useVerification } from '../../hooks/useVerification';
import Toast from '../../components/common/Toast';
import { EmailVerificationModal, PhoneVerificationModal, VerificationField } from '../../components/verification';

const ExpertRegistration = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle expert registration logic here
    console.log('Expert registration:', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Clean modern background */}
      <div className="absolute inset-0">
        {/* Elegant wave patterns */}
        <div className="absolute inset-0 opacity-30">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
            <path fill="rgba(34, 197, 94, 0.1)" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,128C960,117,1056,75,1152,64C1248,53,1344,75,1392,85.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        
        <div className="absolute inset-0 opacity-20">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
            <path fill="rgba(16, 185, 129, 0.1)" fillOpacity="1" d="M0,224L48,208C96,192,192,160,288,165.3C384,171,480,213,576,213.3C672,213,768,171,864,149.3C960,128,1056,128,1152,144C1248,160,1344,192,1392,208L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
          </svg>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-green-200/20 to-emerald-200/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-emerald-200/15 to-teal-200/10 rounded-full blur-3xl"></div>
        

        
        {/* Modern grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen py-2 px-3 sm:px-6 lg:px-8">
        {/* Back to Home Button */}
        <Link
          to="/"
          className="fixed top-4 left-4 sm:top-6 sm:left-6 flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors duration-200 bg-white/95 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg hover:shadow-xl z-50"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span className="text-xs sm:text-sm font-medium">Back to Home</span>
        </Link>
        
        <div className="max-w-3xl w-full space-y-3 sm:space-y-4 mt-16 sm:mt-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 leading-tight">
              Share Your Expertise
              <span className="text-green-600"> With Future Leaders</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 max-w-xl mx-auto">
              Connect with educational institutions and inspire professionals
            </p>
          </motion.div>

          {/* Clean Registration Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/90 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100 p-4 sm:p-5 hover:shadow-xl transition-all duration-300"
          >
            <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-xs font-semibold text-gray-800 mb-0.5">
                  Full Name *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 sm:py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 transition-all duration-300 text-sm"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email and Phone Number Row */}
              <div className="space-y-3">
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
                    buttonColor="bg-green-600"
                    buttonHoverColor="hover:bg-green-700"
                    verifiedTagColor="text-green-600"
                  />

                  {/* Email OTP Verification Modal */}
                  <EmailVerificationModal
                    isOpen={showEmailVerification}
                    email={formData.email}
                    otp={emailOtp}
                    setOtp={setEmailOtp}
                    isVerifying={isEmailVerifying}
                    onVerify={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleVerifyEmailOtp();
                    }}
                    onClose={() => setShowEmailVerification(false)}
                    onSkip={() => {
                      setShowEmailVerification(false);
                      setEmailOtpSent(false);
                      setEmailOtp('');
                    }}
                    otpSent={emailOtpSent}
                  />

                  {/* Phone Number with Verification */}
                  <VerificationField
                    type="tel"
                    id="phone"
                    name="phone"
                    label="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    isVerified={isPhoneVerified}
                    isSending={isPhoneSending}
                    isValid={isValidPhone}
                    onSendOtp={handleSendPhoneOtp}
                    otpSent={phoneOtpSent}
                    buttonColor="bg-purple-600"
                    buttonHoverColor="hover:bg-purple-700"
                    verifiedTagColor="text-green-600"
                  />

                  {/* Phone OTP Verification Modal */}
                  <PhoneVerificationModal
                    isOpen={showPhoneVerification}
                    phone={formData.phone}
                    otp={phoneOtp}
                    setOtp={setPhoneOtp}
                    isVerifying={isPhoneVerifying}
                    onVerify={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleVerifyPhoneOtp();
                    }}
                    onClose={() => setShowPhoneVerification(false)}
                    onSkip={() => {
                      setShowPhoneVerification(false);
                      setPhoneOtpSent(false);
                      setPhoneOtp('');
                    }}
                    otpSent={phoneOtpSent}
                  />

                </div>

              {/* Job Title and Company Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="jobTitle" className="block text-xs font-semibold text-gray-800 mb-1">
                    Current Job Title *
                  </label>
                  <input
                    id="jobTitle"
                    name="jobTitle"
                    type="text"
                    required
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 sm:py-3 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 transition-all duration-300 text-sm"
                    placeholder="e.g., Senior Data Scientist"
                  />
        </div>
        <div>
                  <label htmlFor="company" className="block text-xs font-semibold text-gray-800 mb-1">
                    Company/Organization *
                  </label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    required
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 sm:py-3 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 transition-all duration-300 text-sm"
                    placeholder="e.g., Google, Microsoft, etc."
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-gray-800 mb-0.5">
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
                    className="w-full px-4 py-2 sm:py-2.5 pr-10 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 transition-all duration-300 text-sm"
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
              <div className="flex items-start pt-1">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  required
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="h-3 w-3 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-0.5"
                />
                <label htmlFor="agreeToTerms" className="ml-2 text-xs text-gray-700">
                  I agree to the <Link to="/terms" className="text-green-600 hover:text-green-500 font-semibold">Terms</Link> and <Link to="/privacy" className="text-green-600 hover:text-green-500 font-semibold">Privacy Policy</Link> *
                </label>
        </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="group relative w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 sm:py-3.5 px-6 rounded-lg text-base font-bold shadow-md shadow-green-500/25 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 flex items-center justify-center transform hover:-translate-y-0.5 mt-3 sm:mt-4 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center">
                  Create Expert Account
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-1 sm:mt-2 text-center">
              <p className="text-xs text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-green-600 hover:text-green-500 font-semibold hover:underline transition-colors">
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