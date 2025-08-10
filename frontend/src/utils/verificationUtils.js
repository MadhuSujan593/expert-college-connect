import { useState, useEffect } from 'react';

// Shared verification utilities for registration forms

// API Base URL - update this to match your backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

// Validation Functions
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone) => {
  const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Generic OTP sending function
export const sendOtp = async (endpoint, data, setOtpSent, setShowVerification, setIsSending, showToast, type = 'email') => {
  if (!data) {
    showToast(`Please enter your ${type} first`, 'error');
    return false;
  }
  
  const isValid = type === 'email' ? isValidEmail(data) : isValidPhone(data);
  if (!isValid) {
    showToast(`Please enter a valid ${type} address`, 'error');
    return false;
  }
  
  try {
    setIsSending(true);
    
    // In development mode, use mock API
    if (isDevelopment) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOtpSent(true);
      setShowVerification(true);
      showToast(`OTP sent to your ${type} address`, 'success');
      return true;
    }
    
    // Production mode - real API call
    const response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ [type === 'email' ? 'email' : 'phone']: data }),
    });

    if (response.ok) {
      const result = await response.json();
      setOtpSent(true);
      setShowVerification(true);
      showToast(`OTP sent to your ${type} address`, 'success');
      return true;
    } else {
      const error = await response.json();
      showToast(error.message || `Failed to send OTP to ${type}`, 'error');
      return false;
    }
  } catch (error) {
    console.error(`Error sending ${type} OTP:`, error);
    showToast(`Failed to send OTP. Please try again.`, 'error');
    return false;
  } finally {
    setIsSending(false);
  }
};

// Generic OTP verification function
export const verifyOtp = async (endpoint, otp, data, setIsVerified, setShowVerification, setIsVerifying, setOtp, showToast, type = 'email') => {
  if (!otp) {
    showToast('Please enter the OTP', 'error');
    return false;
  }
  
  try {
    setIsVerifying(true);
    
    // In development mode, use mock verification
    if (isDevelopment) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For development, accept any 6-digit OTP
      if (otp.length === 6 && /^\d{6}$/.test(otp)) {
        setIsVerified(true);
        setShowVerification(false);
        setOtp('');
        showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} verified successfully!`, 'success');
        return true;
      } else {
        showToast('Invalid OTP. Please enter a 6-digit code.', 'error');
        return false;
      }
    }
    
    // Production mode - real API call
    const response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        [type === 'email' ? 'email' : 'phone']: data,
        otp: otp 
      }),
    });

    if (response.ok) {
      const result = await response.json();
      setIsVerified(true);
      setShowVerification(false);
      setOtp('');
      showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} verified successfully!`, 'success');
      return true;
    } else {
      const error = await response.json();
      showToast(error.message || 'Invalid OTP. Please try again.', 'error');
      return false;
    }
  } catch (error) {
    console.error(`Error verifying ${type} OTP:`, error);
    showToast(`Failed to verify OTP. Please try again.`, 'error');
    return false;
  } finally {
    setIsVerifying(false);
  }
};

// Email OTP Functions
export const sendEmailOtp = async (email, setEmailOtpSent, setShowEmailVerification, setIsEmailSending, showToast) => {
  return sendOtp('send-email-otp', email, setEmailOtpSent, setShowEmailVerification, setIsEmailSending, showToast, 'email');
};

export const verifyEmailOtp = async (emailOtp, email, setIsEmailVerified, setShowEmailVerification, setIsEmailVerifying, setEmailOtp, showToast) => {
  return verifyOtp('verify-email-otp', emailOtp, email, setIsEmailVerified, setShowEmailVerification, setIsEmailVerifying, setEmailOtp, showToast, 'email');
};

// Phone OTP Functions
export const sendPhoneOtp = async (phone, setPhoneOtpSent, setShowPhoneVerification, setIsPhoneSending, showToast) => {
  return sendOtp('send-phone-otp', phone, setPhoneOtpSent, setShowPhoneVerification, setIsPhoneSending, showToast, 'phone');
};

export const verifyPhoneOtp = async (phoneOtp, phone, setIsPhoneVerified, setShowPhoneVerification, setIsPhoneVerifying, setPhoneOtp, showToast) => {
  return verifyOtp('verify-phone-otp', phoneOtp, phone, setIsPhoneVerified, setShowPhoneVerification, setIsPhoneVerifying, setPhoneOtp, showToast, 'phone');
};

// Toast Functions
export const createToastSystem = () => {
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: '' });
  };

  return { toast, showToast, hideToast };
};

// Auto-hide toast effect
export const useToastAutoHide = (toast, hideToast) => {
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        hideToast();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show, hideToast]);
}; 