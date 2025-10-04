import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, ArrowRight } from 'lucide-react';

const PlanLimitationModal = ({ isOpen, onClose, onUpgrade, limitationType, currentUsage, planLimit, planName }) => {
  if (!isOpen) return null;

  const getLimitationDetails = () => {
    switch (limitationType) {
      case 'requirements':
        return {
          title: 'Requirements Limit Reached',
          description: `You've reached the limit of ${planLimit} requirements on your ${planName} plan.`
        };
      case 'applications':
        return {
          title: 'Application Limit Reached',
          description: `You've reached the limit of ${planLimit} applications on your ${planName} plan.`
        };
      case 'expert_contacts':
        return {
          title: 'Expert Contacts Limit Reached',
          description: `You've reached the limit of ${planLimit} expert contacts on your ${planName} plan.`
        };
      case 'expired':
        return {
          title: 'Subscription Expired',
          description: `Your ${planName} subscription has expired. Renew to continue.`
        };
      case 'no_subscription':
        return {
          title: 'No Active Subscription',
          description: 'You need an active subscription to create requirements and access premium features.'
        };
      default:
        return {
          title: 'Plan Limit Reached',
          description: 'You\'ve reached your current plan limit.'
        };
    }
  };

  const details = getLimitationDetails();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white rounded-lg shadow-lg max-w-sm w-full border border-gray-200/50"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Lock className="w-4 h-4 text-gray-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">{details.title}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              <p className="text-gray-600 mb-6 leading-relaxed">
                {details.description}
              </p>

              {/* Usage Info */}
              {limitationType !== 'expired' && limitationType !== 'no_subscription' && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Usage</span>
                    <span className="text-sm font-medium text-gray-900">{currentUsage || 0} / {planLimit || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, ((currentUsage || 0) / (planLimit || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={onUpgrade}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <span>{limitationType === 'no_subscription' ? 'Choose a Plan' : 'Upgrade Plan'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PlanLimitationModal;
