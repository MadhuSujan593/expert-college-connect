import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Check, CheckCircle } from 'lucide-react';

const Toast = ({ toast, hideToast }) => {
  const [progress, setProgress] = React.useState(100);
  const [isPaused, setIsPaused] = React.useState(false);
  const timeoutRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Reset progress when a new toast is shown
  useEffect(() => {
    if (toast.show) {
      setProgress(100);
      setIsPaused(false);
      
      // Clear any existing timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  }, [toast.show, toast.message]); // Reset when message changes (new toast)

  useEffect(() => {
    if (toast.show && !isPaused) {
      // Different timeout durations based on toast type
      const timeout = toast.type === 'error' ? 6000 : 4000; // Errors stay longer
      
      // Set the main timeout for auto-hiding
      timeoutRef.current = setTimeout(() => {
        hideToast();
      }, timeout);
      
      // Progress bar animation
      progressIntervalRef.current = setInterval(() => {
        setProgress(prev => {
          const decrement = 100 / (timeout / 100);
          const newProgress = Math.max(0, prev - decrement);
          return newProgress;
        });
      }, 100);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      };
    }
  }, [toast.show, toast.type, hideToast, isPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

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
        <div 
          className={`
            flex items-center p-4 rounded-lg shadow-lg border backdrop-blur-sm cursor-pointer
            ${toast.type === 'success'
              ? 'bg-green-50/95 border-green-200 text-green-800'
              : toast.type === 'error'
              ? 'bg-red-50/95 border-red-200 text-red-800'
              : 'bg-blue-50/95 border-blue-200 text-blue-800'
            }
          `}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
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
            {/* Progress bar */}
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all duration-100 ease-linear ${
                  toast.type === 'success' 
                    ? 'bg-green-500' 
                    : toast.type === 'error' 
                    ? 'bg-red-500' 
                    : 'bg-blue-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
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