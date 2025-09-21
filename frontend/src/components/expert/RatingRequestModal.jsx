import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

const RatingRequestModal = ({ isOpen, onClose, requirement, application, onRequestSubmitted }) => {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a message explaining why you deserve a rating');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        requirementId: requirement.id,
        applicationId: application?.id,
        message: message.trim()
      };

      const response = await api.post('/rating-requests', payload);
      
      console.log('🔍 Rating request response:', response);
      
      if (response.success) {
        console.log('✅ Success - calling onRequestSubmitted');
        onRequestSubmitted(response.data);
        setMessage('');
        
        // Show success toast
        if (typeof window !== 'undefined' && window.showToast) {
          window.showToast('Rating request submitted successfully!', 'success');
        }
        
        // Close the modal
        onClose();
      } else {
        console.log('❌ Response not successful:', response);
        setError('Failed to submit rating request');
      }
    } catch (err) {
      let errorMessage = 'Failed to submit rating request';
      
      if (err.response?.data?.message) {
        if (err.response.data.message.includes('already requested')) {
          errorMessage = `You have already requested a rating for "${requirement?.title}".`;
        } else if (err.response.data.message.includes('already have a pending')) {
          errorMessage = `You already have a pending rating request for "${requirement?.title}".`;
        } else {
          errorMessage = err.response.data.message;
        }
      }
      
      setError(errorMessage);
      
      // Also show toast notification for better visibility
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast(errorMessage, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Request Rating</h2>
              <p className="text-sm text-slate-600 mt-1">
                {requirement?.title}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Why do you deserve a rating for this project?
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain your contribution, the quality of work delivered, and why you believe you deserve a positive rating..."
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={4}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-slate-500">
                  {message.length}/500 characters
                </span>
                {error && (
                  <div className="flex items-center text-red-600 text-xs">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !message.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RatingRequestModal;
