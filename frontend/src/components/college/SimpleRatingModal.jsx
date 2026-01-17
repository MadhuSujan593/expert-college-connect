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
          className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Rate Expert</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <p className="text-sm text-gray-600">
                Rate {expert?.fullName || 'this expert'} for "{requirement?.title}"
              </p>
            </div>

            {/* Required Questions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Required Ratings *</h3>

              {/* Communication */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Communication
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleQuestionRating('communication', star)}
                      className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <Star
                        className={`w-6 h-6 ${star <= questions.communication
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technical Expertise
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleQuestionRating('expertise', star)}
                      className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <Star
                        className={`w-6 h-6 ${star <= questions.expertise
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeliness
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleQuestionRating('timeliness', star)}
                      className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <Star
                        className={`w-6 h-6 ${star <= questions.timeliness
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professionalism
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleQuestionRating('professionalism', star)}
                      className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <Star
                        className={`w-6 h-6 ${star <= questions.professionalism
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
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Overall Rating *
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <Star
                      className={`w-8 h-8 ${star <= rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                        }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {rating === 0 ? 'Not rated' :
                  rating === 1 ? 'Poor' :
                    rating === 2 ? 'Fair' :
                      rating === 3 ? 'Good' :
                        rating === 4 ? 'Very Good' : 'Excellent'}
              </p>
            </div>

            {/* Review */}
            <div>
              <label className="block text-lg font-semibold text-slate-900 mb-3">
                Review (Optional)
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience working with this expert..."
                className="w-full px-4 py-3 border border-slate-200 rounded-[3px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 hover:border-indigo-200 transition-colors text-sm resize-none"
                rows={4}
              />
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-white text-slate-700 font-bold text-sm rounded-[3px] hover:bg-slate-50 transition-colors border border-slate-200 shadow-sm hover:border-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !isFormValid()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-[3px] transition-all duration-200 shadow-sm hover:shadow hover:ring-1 hover:ring-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
