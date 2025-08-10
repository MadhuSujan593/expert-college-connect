import React from 'react';

const PhoneVerificationModal = ({
  isOpen,
  phone,
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
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-3">
      <h4 className="text-sm font-semibold text-purple-800 mb-2">Phone Verification</h4>
      <p className="text-xs text-purple-600 mb-3">
        We've sent a verification code to {phone}. Enter the code below:
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP (use 654321 for demo)"
          className="w-full sm:flex-1 px-3 py-2 bg-white border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          maxLength="6"
        />
        <button
          type="button"
          onClick={onVerify}
          disabled={isVerifying || !otp}
          className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
        >
          {isVerifying ? 'Verifying...' : 'Verify'}
        </button>
      </div>
      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={onSkip}
          className="text-xs text-purple-600 hover:text-purple-800 underline"
        >
          Skip verification (you can verify later)
        </button>
      </div>
    </div>
  );
};

export default PhoneVerificationModal; 