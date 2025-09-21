import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, CheckCircle } from 'lucide-react';
import api from '../../utils/api';

const SimpleRatingModal = ({ 
  isOpen, 
  onClose, 
  expert, 
  requirement, 
  application, 
  onRatingSubmitted,
  ratingRequestId 
}) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Basic required questions
  const [questions, setQuestions] = useState({
    communication: 0,
    expertise: 0,
    timeliness: 0,
    professionalism: 0
  });

  const handleQuestionRating = (questionType, value) => {
    setQuestions(prev => ({
      ...prev,
      [questionType]: value
    }));
  };

  const isFormValid = () => {
    return rating > 0 && 
           questions.communication > 0 && 
           questions.expertise > 0 && 
           questions.timeliness > 0 && 
           questions.professionalism > 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      // Show toast instead of alert
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Please complete all required ratings', 'error');
      } else {
        console.error('Please complete all required ratings');
      }
      return;
    }

    setSubmitting(true);
    
    try {
      const ratingData = {
        expertProfileId: expert.id,
        collegeProfileId: requirement.collegeProfileId,
        requirementId: requirement.id,
        applicationId: application?.id,
        ratingRequestId: ratingRequestId,
        overallRating: rating,
        review: review.trim(),
        questions: [
          { question: 'Communication', answer: questions.communication, category: 'communication' },
          { question: 'Technical Expertise', answer: questions.expertise, category: 'expertise' },
          { question: 'Timeliness', answer: questions.timeliness, category: 'timeliness' },
          { question: 'Professionalism', answer: questions.professionalism, category: 'professionalism' }
        ]
      };

      console.log('Submitting rating data:', ratingData);
      const response = await api.post('/ratings', ratingData);
      console.log('Rating submission response:', response);
      
      // Show success toast
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Rating submitted successfully!', 'success');
      } else {
        console.log('Rating submitted successfully!');
      }
      
      onRatingSubmitted();
      onClose();
    } catch (error) {
      console.error('Error submitting rating:', error);
      console.error('Error details:', error.response?.data);
      
      // Show specific error message
      let errorMessage = 'Failed to submit rating. Please try again.';
      
      if (error.response?.data?.message) {
        if (error.response.data.message.includes('already rated')) {
          errorMessage = 'You have already rated this expert for this project.';
        } else {
          errorMessage = error.response.data.message;
        }
      }
      
      // Show error toast instead of alert
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast(errorMessage, 'error');
      } else {
        console.error(errorMessage);
        console.error('Error details:', error.response?.data || error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Rate Expert</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Rate {expert?.fullName || 'this expert'} for "{requirement?.title}"
              </p>
            </div>

            {/* Required Questions */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Required Ratings *</h3>
              
              {/* Communication */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Communication
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleQuestionRating('communication', star)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Star
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          star <= questions.communication
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Expertise */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Technical Expertise
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleQuestionRating('expertise', star)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Star
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          star <= questions.expertise
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeliness */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Timeliness
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleQuestionRating('timeliness', star)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Star
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          star <= questions.timeliness
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Professionalism */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Professionalism
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleQuestionRating('professionalism', star)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Star
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          star <= questions.professionalism
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating *
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Star
                      className={`w-5 h-5 sm:w-6 sm:h-6 ${
                        star <= rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {rating === 0 ? 'Not rated' : 
                 rating === 1 ? 'Poor' :
                 rating === 2 ? 'Fair' :
                 rating === 3 ? 'Good' :
                 rating === 4 ? 'Very Good' : 'Excellent'}
              </p>
            </div>

            {/* Review */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review (Optional)
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience working with this expert..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
                rows={3}
              />
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !isFormValid()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Submit Rating
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SimpleRatingModal;
