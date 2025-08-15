import React from 'react';

const VerificationField = ({
  type,
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  isVerified,
  isSending,
  isValid,
  onSendOtp,
  otpSent,
  buttonColor = 'bg-gradient-to-r from-blue-600 to-indigo-600',
  buttonHoverColor = 'hover:from-blue-700 hover:to-indigo-700',
  verifiedTagColor = 'text-emerald-600'
}) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3 mb-1 sm:mb-2">
        <label htmlFor={id} className="block text-sm font-semibold text-gray-800">
          {label} <span className="text-red-500">*</span>
        </label>
        {isVerified && (
          <span className={`${verifiedTagColor} text-xs font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1`}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Verified
          </span>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative group flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {type === 'email' ? (
              <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            )}
          </div>
          <input
            id={id}
            name={name}
            type={type}
            required
            value={value}
            onChange={onChange}
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 lg:py-3 bg-gray-50/80 border border-gray-300/50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 hover:border-gray-300 transition-all duration-300 focus:bg-white focus:shadow-lg focus:shadow-blue-500/20 text-sm placeholder:text-sm"
            placeholder={placeholder}
            maxLength={type === 'tel' ? '15' : undefined}
          />
        </div>
        {!isVerified && (
          <button
            type="button"
            onClick={() => onSendOtp(value)}
            disabled={isSending || !value || !isValid(value)}
            className={`w-full sm:w-auto px-4 py-2.5 sm:py-3 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform disabled:transform-none disabled:cursor-not-allowed ${
              isSending || !value || !isValid(value)
                ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed shadow-gray-400/25 hover:shadow-gray-400/25'
                : `${buttonColor} ${buttonHoverColor} shadow-blue-500/25 hover:shadow-blue-500/30`
            }`}
          >
            {isSending ? (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Sending...
              </div>
            ) : otpSent ? (
              'Resend OTP'
            ) : (
              `Verify ${type === 'email' ? 'Email' : 'Phone'}`
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default VerificationField; 