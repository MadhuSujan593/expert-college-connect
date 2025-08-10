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
    <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 backdrop-blur-sm border border-indigo-200/50 rounded-lg p-3 mt-2 shadow-lg shadow-indigo-500/10">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-gray-900">Phone Verification</h4>
          <p className="text-xs text-gray-600">
            We've sent a verification code to <span className="font-medium text-gray-800">{phone}</span>
          </p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit code"
            className="w-full pl-10 pr-4 py-2 bg-white/80 backdrop-blur-sm border border-indigo-300/50 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 focus:bg-white focus:shadow-lg focus:shadow-indigo-500/20 text-center tracking-widest font-mono"
            maxLength="6"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={onVerify}
            disabled={isVerifying || !otp || otp.length < 6}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-105 transform disabled:from-gray-400 disabled:to-gray-500 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-indigo-500 rounded-full animate-spin"></div>
                Verifying...
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Verify Phone
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={onSkip}
            className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-300/50 text-gray-600 text-xs font-medium rounded-lg hover:bg-white hover:border-gray-400 hover:text-gray-700 transition-all duration-300 hover:scale-105 transform"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhoneVerificationModal; 