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
  buttonColor = 'bg-green-600',
  buttonHoverColor = 'hover:bg-green-700',
  verifiedTagColor = 'text-green-600'
}) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <label htmlFor={id} className="block text-xs font-semibold text-gray-800">
          {label} *
        </label>
        {isVerified && (
          <span className={`${verifiedTagColor} text-sm font-medium`}>✓ Verified</span>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          id={id}
          name={name}
          type={type}
          required
          value={value}
          onChange={onChange}
          className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-gray-300 transition-all duration-300 text-sm"
          placeholder={placeholder}
          maxLength={type === 'tel' ? '15' : undefined}
        />
        {!isVerified && (
          <button
            type="button"
            onClick={() => onSendOtp(value)}
            disabled={isSending || !value || !isValid(value)}
            className={`w-full sm:w-auto px-4 py-2.5 ${buttonColor} text-white text-xs font-semibold rounded-lg ${buttonHoverColor} disabled:bg-gray-400 transition-colors`}
          >
            {isSending ? 'Sending...' : otpSent ? 'Resend OTP' : `Verify ${type === 'email' ? 'Email' : 'Phone'}`}
          </button>
        )}
      </div>
    </div>
  );
};

export default VerificationField; 