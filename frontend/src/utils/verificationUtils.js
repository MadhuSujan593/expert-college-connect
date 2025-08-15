import { useState, useEffect } from 'react';

// Shared verification utilities for registration forms

// API Base URL - update this to match your backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

// Validation Functions
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone) => {
  if (!phone) return false;
  
  // Remove all non-digit characters except +
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // Check if it starts with + (international) or just digits (local)
  if (cleanPhone.startsWith('+')) {
    // International format: +[country code][number] (total 7-15 digits)
    const phoneWithoutPlus = cleanPhone.substring(1);
    const isValid = phoneWithoutPlus.length >= 7 && phoneWithoutPlus.length <= 15;
    return isValid;
  } else {
    // Local format: just digits (10-15 digits)
    const isValid = cleanPhone.length >= 10 && cleanPhone.length <= 15;
    return isValid;
  }
};

// Check if email/phone is available (not already taken)
export const checkAvailability = async (type, value) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/check-availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, value }),
    });

    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      const error = await response.json();
      return { available: false, message: error.message || 'Failed to check availability' };
    }
  } catch (error) {
    return { available: false, message: 'Failed to check availability. Please try again.' };
  }
};

// Generic OTP sending function
export const sendOtp = async (endpoint, data, setOtpSent, setShowVerification, setIsSending, showToast, type = 'email') => {
  if (!data) {
    showToast(`Please enter your ${type} first`, 'error');
    return false;
  }
  
  const isValid = type === 'email' ? isValidEmail(data) : isValidPhone(data);
  
  if (!isValid) {
    showToast(`Please enter a valid ${type === 'email' ? 'email address' : 'phone number'}`, 'error');
    return false;
  }
  
  try {
    setIsSending(true);
    
    // First check if email/phone is available
    const availabilityResult = await checkAvailability(type, data);
    
    if (!availabilityResult.available) {
      showToast(availabilityResult.message, 'error');
      setIsSending(false);
      return false;
    }
    
    // Production mode - real API call
    const requestBody = { [type === 'email' ? 'email' : 'phone']: data };
    
    const response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
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

  if (!data) {
    showToast(`${type === 'email' ? 'Email' : 'Phone'} is required`, 'error');
    return false;
  }

  // Validate email/phone before sending
  const isValid = type === 'email' ? isValidEmail(data) : isValidPhone(data);
  
  if (!isValid) {
    showToast(`Please provide a valid ${type === 'email' ? 'email address' : 'phone number'}`, 'error');
    return false;
  }
  
  try {
    setIsVerifying(true);
    
    // Production mode - real API call
    const requestBody = { 
      [type === 'email' ? 'email' : 'phone']: data,
      otp: otp 
    };
    
    const response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const result = await response.json();
      
      // Update verification state
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
  return verifyOtp('verify-email', emailOtp, email, setIsEmailVerified, setShowEmailVerification, setIsEmailVerifying, setEmailOtp, showToast, 'email');
};

// Phone OTP Functions
export const sendPhoneOtp = async (phone, setPhoneOtpSent, setShowPhoneVerification, setIsPhoneSending, showToast) => {
  return sendOtp('send-phone-otp', phone, setPhoneOtpSent, setShowPhoneVerification, setIsPhoneSending, showToast, 'phone');
};

export const verifyPhoneOtp = async (phoneOtp, phone, setIsPhoneVerified, setShowPhoneVerification, setIsPhoneVerifying, setPhoneOtp, showToast) => {
  return verifyOtp('verify-phone', phoneOtp, phone, setIsPhoneVerified, setShowPhoneVerification, setIsPhoneVerifying, setPhoneOtp, showToast, 'phone');
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