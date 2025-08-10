import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Check, CheckCircle } from 'lucide-react';

const Toast = ({ toast, hideToast }) => {
  if (!toast.show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 max-w-sm"
      >
        <div className={`
          flex items-center p-4 rounded-lg shadow-lg border backdrop-blur-sm
          ${toast.type === 'success'
            ? 'bg-green-50/95 border-green-200 text-green-800'
            : toast.type === 'error'
            ? 'bg-red-50/95 border-red-200 text-red-800'
            : 'bg-blue-50/95 border-blue-200 text-blue-800'
          }
        `}>
          <div className="flex-shrink-0 mr-3">
            {toast.type === 'success' && (
              <Check className="w-5 h-5 text-green-600" />
            )}
            {toast.type === 'error' && (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            {toast.type === 'info' && (
              <CheckCircle className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
          <button
            onClick={hideToast}
            className={`
              flex-shrink-0 ml-3 p-1 rounded-full transition-colors
              ${toast.type === 'success'
                ? 'hover:bg-green-200 text-green-600'
                : toast.type === 'error'
                ? 'hover:bg-red-200 text-red-600'
                : 'hover:bg-blue-200 text-blue-600'
              }
            `}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Toast; 