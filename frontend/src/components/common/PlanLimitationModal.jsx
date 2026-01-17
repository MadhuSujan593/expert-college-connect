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
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 text-center">
              {/* Premium Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-100/50">
                <Lock className="w-8 h-8 text-indigo-600" />
              </div>

              <h2 className="text-xl font-bold text-slate-900 mb-2">{details.title}</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                {details.description}
              </p>

              {/* Usage Info */}
              {limitationType !== 'expired' && limitationType !== 'no_subscription' && (
                <div className="bg-slate-50 rounded-xl p-5 mb-8 border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Usage</span>
                    <span className="text-sm font-bold text-indigo-900">{currentUsage} <span className="text-slate-400 font-normal">/</span> {planLimit}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, ((currentUsage || 0) / (planLimit || 1)) * 100)}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="bg-gradient-to-r from-indigo-500 to-violet-600 h-2 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={onUpgrade}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-[4px] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                >
                  <span>{limitationType === 'no_subscription' ? 'Choose a Plan' : 'Upgrade Plan'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 text-slate-500 hover:text-slate-700 font-medium transition-colors text-sm"
                >
                  cancel and go back
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
