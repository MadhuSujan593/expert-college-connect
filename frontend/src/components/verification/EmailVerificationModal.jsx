import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  RefreshCw, 
  ArrowRight,
  CheckCircle,
  X,
  Clock
} from 'lucide-react';

const EmailVerificationModal = ({
  isOpen,
  email,
  isVerifying,
  onVerify,
  onClose,
  onSendOtp,
  isVerified,
  isSending,
  otpSent
}) => {
  const [otp, setOtp] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Start countdown when OTP is sent
  useEffect(() => {
    if (otpSent && resendCountdown === 0) {
      setResendCountdown(60); // 60 seconds countdown
    }
  }, [otpSent]);

  if (!isOpen) return null;

  const handleVerify = () => {
    if (otp && otp.length === 6) {
      onVerify(otp);
    }
  };

  const handleSendOtp = () => {
    onSendOtp(email);
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    
    setIsResending(true);
    try {
      await onSendOtp(email);
      setResendCountdown(60); // Reset countdown
    } catch (error) {
      console.error('Resend OTP error:', error);
    } finally {
      setIsResending(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow numeric input
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Email Verification</h2>
              <p className="text-sm text-gray-600">Verify your email address</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-700 mb-2">
              {otpSent 
                ? `We've sent a 6-digit verification code to` 
                : `Click "Send OTP" to receive a verification code on`
              }
            </p>
            <p className="font-medium text-gray-900">{email}</p>
          </div>
          
          {otpSent && (
            <div className="space-y-4">
              {/* OTP Input */}
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CheckCircle className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={handleInputChange}
                    placeholder="000000"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-colors text-sm text-center tracking-widest text-lg font-mono"
                    maxLength="6"
                    inputMode="numeric"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter the 6-digit code sent to your email</p>
              </div>

              {/* Verify Button */}
              <button
                type="button"
                onClick={handleVerify}
                disabled={isVerifying || !otp || otp.length !== 6}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-3 px-6 rounded-md font-semibold transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Resend OTP Button */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCountdown > 0 || isResending || isSending}
                  className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 hover:underline flex items-center justify-center space-x-1 mx-auto"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Resending...</span>
                    </>
                  ) : resendCountdown > 0 ? (
                    <>
                      <Clock className="w-3 h-3" />
                      <span>Resend in {resendCountdown}s</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3" />
                      <span>Resend Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {!otpSent && (
            <div className="space-y-4">
              {/* Send OTP Button */}
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSending}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-3 px-6 rounded-md font-semibold transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Didn't receive the code? Check your spam folder or try again
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerificationModal;