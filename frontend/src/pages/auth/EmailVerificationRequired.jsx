import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, 
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Toast from '../../components/common/Toast';
import EmailVerificationModal from '../../components/verification/EmailVerificationModal';
import apiService from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const EmailVerificationRequired = () => {
  const navigate = useNavigate();
  const { checkAuthStatus } = useAuth();
  const [userEmail, setUserEmail] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isEmailVerifying, setIsEmailVerifying] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [toastTimeout, setToastTimeout] = useState(null);

  useEffect(() => {
    // Get user email from localStorage or API
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserEmail(user.email);
    } else {
      // If no user in localStorage, try to get from URL params or redirect to login
      navigate('/login');
    }
  }, [navigate]);

  const showToast = (message, type = 'info') => {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    
    setToast({ show: true, message, type });
    
    const timeout = setTimeout(() => {
      hideToast();
    }, 5000);
    
    setToastTimeout(timeout);
  };

  const hideToast = () => {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
      setToastTimeout(null);
    }
    setToast({ show: false, message: '', type: 'info' });
  };

  const handleSendEmailOtp = async () => {
    if (!userEmail) {
      showToast('Email address not found. Please contact support.', 'error');
      return;
    }

    setIsEmailSending(true);
    try {
      const response = await apiService.sendEmailOtp(userEmail);
      setEmailOtpSent(true);
      showToast('Verification code sent to your email', 'success');
    } catch (error) {
      console.error('Send email OTP error:', error);
      showToast(error.message || 'Failed to send verification code. Please try again.', 'error');
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleVerifyEmailOtp = async (otp) => {
    if (!userEmail) {
      showToast('Email address not found. Please contact support.', 'error');
      return;
    }

    setIsEmailVerifying(true);
    try {
      const response = await apiService.verifyEmail(userEmail, otp);
      
      // Update user data in localStorage with verified status
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        user.isEmailVerified = true;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      showToast('Email verified successfully!', 'success');
      setShowVerificationModal(false);
      
      // Refresh AuthContext to get updated user data
      await checkAuthStatus();
      
      // Redirect to dashboard after successful verification
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Email verification error:', error);
      showToast(error.message || 'Invalid verification code. Please try again.', 'error');
    } finally {
      setIsEmailVerifying(false);
    }
  };


  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Back to Login */}
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-base font-medium">Back to Login</span>
          </button>

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verification Required</h1>
            <p className="text-gray-600">
              You need to verify your email address before you can access your account.
            </p>
          </div>

          {/* Email Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email Address</p>
                <p className="text-sm text-gray-600">{userEmail}</p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="space-y-4">
            <button
              onClick={() => setShowVerificationModal(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 px-6 rounded-md font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <span>Verify Email Address</span>
              <CheckCircle className="w-4 h-4" />
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-4">Need help?</p>
            <div className="space-y-2">
              <p className="text-xs text-gray-500">
                • Check your spam/junk folder for the verification email
              </p>
              <p className="text-xs text-gray-500">
                • Make sure you entered the correct email address
              </p>
              <p className="text-xs text-gray-500">
                • Contact support if you continue to have issues
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showVerificationModal}
        email={userEmail}
        isVerifying={isEmailVerifying}
        onVerify={handleVerifyEmailOtp}
        onClose={() => setShowVerificationModal(false)}
        onSendOtp={handleSendEmailOtp}
        isVerified={false}
        isSending={isEmailSending}
        otpSent={emailOtpSent}
      />

      {/* Toast Notification */}
      <Toast toast={toast} hideToast={hideToast} />
    </div>
  );
};

export default EmailVerificationRequired;
