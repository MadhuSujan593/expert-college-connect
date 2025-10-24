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
import { sendPostRegistrationEmailOtp } from '../../utils/verificationUtils';
import { useAuth } from '../../contexts/AuthContext';

const CollegeRegistration = () => {
  const navigate = useNavigate();
  const { checkAuthStatus } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
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

  // Custom email verification handler for post-registration
  const handlePostRegistrationEmailVerification = async (otp) => {
    try {
      setIsPostRegistrationVerifying(true);
      
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
        navigate('/dashboard/college');
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
      const fullPhoneNumber = formData.contactPhone && selectedCountry 
        ? `${selectedCountry.dialCode}${formData.contactPhone}` 
        : undefined;
      
      const registrationData = {
        fullName: formData.contactPersonName,
        email: formData.contactEmail,
        phone: fullPhoneNumber,
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
      setRegisteredEmail(formData.contactEmail);
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
              <h1 className="text-2xl font-bold text-gray-900">Join as Institution</h1>
              <p className="text-gray-600 mt-2">Create your institution account to connect with experts</p>
            </div>

            {/* Registration Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Two Column Layout for Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Institution Name */}
                  <div>
                    <label htmlFor="institutionName" className="block text-sm font-medium text-gray-700 mb-1">
                      Institution Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-4 w-4 text-gray-500" />
                      </div>
                      <input
                        id="institutionName"
                        name="institutionName"
                        type="text"
                        required
                        value={formData.institutionName}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-colors text-sm"
                        placeholder="Harvard University"
                      />
                    </div>
                  </div>

                  {/* Contact Person Name */}
                  <div>
                    <label htmlFor="contactPersonName" className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                      <input
                        id="contactPersonName"
                        name="contactPersonName"
                        type="text"
                        required
                        value={formData.contactPersonName}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-colors text-sm"
                        placeholder="John Smith"
                      />
                    </div>
                  </div>
                </div>

                {/* Two Column Layout for Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email Address */}
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-500" />
                      </div>
                      <input
                        id="contactEmail"
                        name="contactEmail"
                        type="email"
                        required
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-colors text-sm"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="flex">
                      <CountrySelector
                        selectedCountry={selectedCountry}
                        onCountryChange={setSelectedCountry}
                        className="flex-shrink-0"
                      />
                      <div className="relative flex-1">
                        <input
                          id="contactPhone"
                          name="contactPhone"
                          type="tel"
                          required
                          value={formData.contactPhone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-r-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-colors text-sm border-l-0"
                          placeholder="1234567890"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Use Official Email Checkbox */}
                <div className="flex items-start pt-1">
                  <input
                    id="useOfficialEmail"
                    name="useOfficialEmail"
                    type="checkbox"
                    checked={formData.useOfficialEmail}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded mt-0.5 transition-all duration-200 hover:scale-110 flex-shrink-0"
                  />
                  <label htmlFor="useOfficialEmail" className="ml-3 text-sm text-gray-700 font-medium">
                    <span className="font-medium">Use official email address</span>
                    <span className="text-gray-600 block mt-1 text-xs">This will be used for all your institutional operations and communications</span>
                  </label>
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
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-colors text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

              {/* Terms & Conditions */}
              <div className="flex items-center">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  required
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                />
                <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-700">
                  I agree to the <Link to="/terms" className="text-blue-600 hover:text-blue-500 font-medium hover:underline transition-colors">Terms</Link> and <Link to="/privacy" className="text-blue-600 hover:text-blue-500 font-medium hover:underline transition-colors">Privacy Policy</Link>
                </label>
              </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 px-6 rounded-md font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Institution Account'}
                </button>
              </form>
            </div>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-6">Already have an account?</p>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/register/expert"
                  className="group bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 hover:border-green-400 hover:from-green-100 hover:to-emerald-100 rounded-lg p-3 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-gray-900">Join as Expert</span>
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

export default CollegeRegistration;