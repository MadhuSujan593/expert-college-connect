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
import { sendPostRegistrationEmailOtp } from '../../utils/verificationUtils';
import { useAuth } from '../../contexts/AuthContext';

const ExpertRegistration = () => {
  const navigate = useNavigate();
  const { checkAuthStatus } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPostRegistrationModal, setShowPostRegistrationModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isPostRegistrationSending, setIsPostRegistrationSending] = useState(false);
  const [isPostRegistrationVerifying, setIsPostRegistrationVerifying] = useState(false);
  const [postRegistrationOtpSent, setPostRegistrationOtpSent] = useState(false);
  
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

  // Custom email verification handler for post-registration
  const handlePostRegistrationEmailVerification = async (otp) => {
    try {
      setIsPostRegistrationVerifying(true);
      
      console.log('Verifying email with:', { email: registeredEmail, otp, otpType: typeof otp });
      const response = await apiService.verifyEmail(registeredEmail, otp);
      
      // Update user data in localStorage with verified status
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        user.isEmailVerified = true;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      showToast('Email verified successfully! Redirecting to dashboard...', 'success');
      setShowPostRegistrationModal(false);
      
      // Refresh AuthContext to get updated user data
      await checkAuthStatus();
      
      // Redirect to dashboard after successful verification
      setTimeout(() => {
        navigate('/dashboard/expert');
      }, 2000);
    } catch (error) {
      console.error('Email verification error:', error);
      showToast(error.message || 'Invalid verification code. Please try again.', 'error');
    } finally {
      setIsPostRegistrationVerifying(false);
    }
  };

  // Custom OTP sending handler for post-registration
  const handlePostRegistrationSendOtp = async (email) => {
    await sendPostRegistrationEmailOtp(email, setPostRegistrationOtpSent, setIsPostRegistrationSending, showToast);
  };

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
        phone: formData.phone || undefined,
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
      
      showToast('Registration successful! Please verify your email to complete the setup.', 'success');
      
      // Store tokens if provided
      if (response.tokens) {
        apiService.setTokens(response.tokens.accessToken, response.tokens.refreshToken);
      }
      
      // Store user data in localStorage for verification page
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      // Store user data and show email verification modal
      setRegisteredEmail(formData.email);
      setShowPostRegistrationModal(true);
      
    } catch (error) {
      console.error('Registration error:', error);
      showToast(error.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-4xl"
        >
            {/* Back to Home */}
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-8 group"
            >
              <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
              <span className="text-base font-medium">Back to Home</span>
            </Link>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Join as Expert</h1>
              <p className="text-gray-600 mt-2">Share your expertise with future leaders</p>
            </div>

            {/* Registration Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Two Column Layout for Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-colors text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
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
                </div>

                {/* Two Column Layout for Contact & Professional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-gray-500" />
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-colors text-sm"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  {/* Job Title */}
                  <div>
                    <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Briefcase className="h-4 w-4 text-gray-500" />
                      </div>
                      <input
                        id="jobTitle"
                        name="jobTitle"
                        type="text"
                        required
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-colors text-sm"
                        placeholder="Senior Data Scientist"
                      />
                    </div>
                  </div>
                </div>

                {/* Company */}
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-4 w-4 text-gray-500" />
                    </div>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      required
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-colors text-sm"
                        placeholder="Google"
                    />
                  </div>
                </div>

                {/* Two Column Layout for Passwords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-500" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
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
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
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
                </div>

              {/* Terms & Conditions */}
              <div className="flex items-start">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  required
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded mt-0.5"
                />
                <label htmlFor="agreeToTerms" className="ml-3 text-sm text-gray-700">
                  I agree to the <Link to="/terms" className="text-blue-600 hover:text-blue-500 font-semibold hover:underline transition-colors">Terms</Link> and <Link to="/privacy" className="text-blue-600 hover:text-blue-500 font-semibold hover:underline transition-colors">Privacy Policy</Link> <span className="text-red-500">*</span>
                </label>
              </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 px-6 rounded-md font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Expert Account'
                  )}
                </button>
              </form>
            </div>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-6">Already have an account?</p>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/register/college"
                  className="group bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-400 hover:from-purple-100 hover:to-pink-100 rounded-lg p-3 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-gray-900">Join as Institution</span>
                  </div>
                </Link>
                
                <Link
                  to="/login"
                  className="group bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 hover:border-blue-300 hover:from-blue-100 hover:to-cyan-100 rounded-lg p-3 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-gray-900">Sign In</span>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        <Toast toast={toast} hideToast={hideToast} />
        
        {/* Email Verification Modal */}
        <EmailVerificationModal
          isOpen={showPostRegistrationModal}
          email={registeredEmail}
          isVerifying={isPostRegistrationVerifying}
          onVerify={handlePostRegistrationEmailVerification}
          onClose={() => {
            setShowPostRegistrationModal(false);
            // Redirect to login page if they skip verification
            navigate('/login');
          }}
          onSendOtp={handlePostRegistrationSendOtp}
          isVerified={false}
          isSending={isPostRegistrationSending}
          otpSent={postRegistrationOtpSent}
        />
      </div>
  );
};

export default ExpertRegistration;