import React from 'react';

const EmailVerificationModal = ({
  isOpen,
  email,
  otp,
  setOtp,
  isVerifying,
  onVerify,
  onClose,
  onSkip,
  otpSent
}) => {
  if (!isOpen) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
      <h4 className="text-sm font-semibold text-blue-800 mb-2">Email Verification</h4>
      <p className="text-xs text-blue-600 mb-3">
        We've sent a verification code to {email}. Enter the code below:
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP (use 123456 for demo)"
          className="w-full sm:flex-1 px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength="6"
        />
        <button
          type="button"
          onClick={onVerify}
          disabled={isVerifying || !otp}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {isVerifying ? 'Verifying...' : 'Verify'}
        </button>
      </div>
      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={onSkip}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Skip verification (you can verify later)
        </button>
      </div>
    </div>
  );
};

export default EmailVerificationModal; 