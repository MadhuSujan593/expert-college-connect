import React from 'react';
import { AlertCircle, Mail, Phone, CheckCircle } from 'lucide-react';

const VerificationBanner = ({ user, onVerifyEmail, onVerifyPhone }) => {
  // Check if user needs verification
  const needsVerification = !user?.isEmailVerified && !user?.isPhoneVerified;
  
  console.log('VerificationBanner Debug:', {
    user,
    userEmail: user?.email,
    isEmailVerified: user?.isEmailVerified,
    userPhone: user?.phone,
    isPhoneVerified: user?.isPhoneVerified,
    needsVerification,
    shouldShow: !needsVerification
  });
  
  if (!needsVerification) {
    return null;
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <AlertCircle className="h-6 w-6 text-amber-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-amber-800 mb-2">
            Verification Required
          </h3>
          <p className="text-amber-700 mb-4">
            To access all dashboard features, please verify at least one of your contact methods. 
            This helps ensure the security and authenticity of your account.
          </p>
          
          <div className="space-y-3">
            {/* Email Verification Status */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">
                    {user?.email || 'Email not provided'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user?.isEmailVerified ? 'Verified' : 'Not verified'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {user?.isEmailVerified ? (
                  <div className="flex items-center space-x-2 text-emerald-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Verified</span>
                  </div>
                ) : (
                  <button
                    onClick={onVerifyEmail}
                    className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Verify Email
                  </button>
                )}
              </div>
            </div>
            
            {/* Phone Verification Status */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">
                    {user?.phone || 'Phone not provided'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user?.isPhoneVerified ? 'Verified' : 'Not verified'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {user?.isPhoneVerified ? (
                  <div className="flex items-center space-x-2 text-emerald-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Verified</span>
                  </div>
                ) : (
                  <button
                    onClick={onVerifyPhone}
                    className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Verify Phone
                  </button>
                  )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-amber-100 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> You can still view your profile and basic information, 
              but some features may be limited until verification is complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationBanner;
