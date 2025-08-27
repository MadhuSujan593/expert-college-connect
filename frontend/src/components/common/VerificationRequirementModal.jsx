import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';

const VerificationRequirementModal = ({
  isOpen,
  onClose,
  onVerifyEmail,
  onVerifyPhone,
  user,
  featureName = "this feature"
}) => {
  if (!isOpen) return null;

  // Check if user needs verification
  const needsVerification = !user?.isEmailVerified && !user?.isPhoneVerified;
  
  // If user is already verified, don't show the modal
  if (!needsVerification) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-md bg-white rounded-lg shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-medium text-gray-900">Verification Required</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-gray-600 mb-4">
              You need to verify your email or phone number to access {featureName}.
            </p>
            
            <div className="space-y-2">
              {!user?.isEmailVerified && (
                <button
                  onClick={onVerifyEmail}
                  className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700"
                >
                  Verify Email
                </button>
              )}
              {!user?.isPhoneVerified && (
                <button
                  onClick={onVerifyPhone}
                  className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700"
                >
                  Verify Phone
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VerificationRequirementModal;
