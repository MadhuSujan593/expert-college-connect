import { useState, useEffect } from 'react';
import { 
  isValidEmail, 
  isValidPhone, 
  checkAvailability,
  sendEmailOtp, 
  verifyEmailOtp, 
  sendPhoneOtp, 
  verifyPhoneOtp 
} from '../utils/verificationUtils';

export const useVerification = () => {
  // Verification states
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isPhoneSending, setIsPhoneSending] = useState(false);
  const [isEmailVerifying, setIsEmailVerifying] = useState(false);
  const [isPhoneVerifying, setIsPhoneVerifying] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Toast functions
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: '' });
  };

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        hideToast();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Wrapper functions that use the shared utilities
  const handleSendEmailOtp = (email) => {
    return sendEmailOtp(
      email, 
      setEmailOtpSent, 
      setShowEmailVerification, 
      setIsEmailSending, 
      showToast
    );
  };

  const handleVerifyEmailOtp = (otp, email) => {
    return verifyEmailOtp(
      otp, 
      email,
      setIsEmailVerified, 
      setShowEmailVerification, 
      setIsEmailVerifying, 
      setEmailOtp, 
      showToast
    );
  };

  const handleSendPhoneOtp = (phone) => {
    return sendPhoneOtp(
      phone, 
      setPhoneOtpSent, 
      setShowPhoneVerification, 
      setIsPhoneSending, 
      showToast
    );
  };

  const handleVerifyPhoneOtp = (otp, phone) => {
    return verifyPhoneOtp(
      otp, 
      phone,
      setIsPhoneVerified, 
      setShowPhoneVerification, 
      setIsPhoneVerifying, 
      setPhoneOtp, 
      showToast
    );
  };

  // Reset verification states
  const resetVerification = () => {
    setShowEmailVerification(false);
    setShowPhoneVerification(false);
    setEmailOtp('');
    setPhoneOtp('');
    setIsEmailVerified(false);
    setIsPhoneVerified(false);
    setEmailOtpSent(false);
    setPhoneOtpSent(false);
    setIsEmailSending(false);
    setIsPhoneSending(false);
    setIsEmailVerifying(false);
    setIsPhoneVerifying(false);
  };

  // Check if all verifications are complete
  const isFullyVerified = () => {
    return isEmailVerified && isPhoneVerified;
  };

  return {
    // States
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
    
    // Toast
    toast,
    showToast,
    hideToast,
    
    // Functions
    isValidEmail,
    isValidPhone,
    checkAvailability,
    handleSendEmailOtp,
    handleVerifyEmailOtp,
    handleSendPhoneOtp,
    handleVerifyPhoneOtp,
    resetVerification,
    isFullyVerified,
  };
}; 