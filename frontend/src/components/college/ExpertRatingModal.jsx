import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

const ExpertRatingModal = ({ 
  isOpen, 
  onClose, 
  expert, 
  requirement, 
  application, 
  onRatingSubmitted 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [ratingData, setRatingData] = useState({
    overallRating: 0,
    review: '',
    isAnonymous: false,
    questions: []
  });
  const [ratingQuestions, setRatingQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Predefined rating questions
  const predefinedQuestions = [
    {
      category: 'communication',
      questions: [
        'How well did the expert communicate throughout the project?',
        'Was the expert responsive to your messages and requests?',
        'Did the expert provide clear and detailed explanations?',
      ],
    },
    {
      category: 'expertise',
      questions: [
        'How would you rate the expert\'s technical knowledge?',
        'Did the expert demonstrate deep understanding of the subject matter?',
        'Was the expert able to solve complex problems effectively?',
      ],
    },
    {
      category: 'timeliness',
      questions: [
        'Did the expert meet all deadlines?',
        'Was the expert punctual for meetings and calls?',
        'How well did the expert manage project timelines?',
      ],
    },
    {
      category: 'quality',
      questions: [
        'How would you rate the quality of work delivered?',
        'Did the expert meet your expectations?',
        'Was the final deliverable professional and well-executed?',
      ],
    },
    {
      category: 'collaboration',
      questions: [
        'How well did the expert work with your team?',
        'Was the expert open to feedback and suggestions?',
        'Did the expert contribute positively to the project environment?',
      ],
    },
  ];

  useEffect(() => {
    if (isOpen) {
      // Initialize rating questions
      const questions = predefinedQuestions.flatMap(category => 
        category.questions.map(question => ({
          question,
          category: category.category,
          answer: 0
        }))
      );
      
      setRatingQuestions(questions);
      setRatingData(prev => ({
        ...prev,
        questions: questions.map(q => ({ ...q }))
      }));
    }
  }, [isOpen]);

  const handleQuestionRating = (questionIndex, rating) => {
    const updatedQuestions = [...ratingData.questions];
    
    // Ensure the question exists at this index
    if (!updatedQuestions[questionIndex]) {
      updatedQuestions[questionIndex] = { answer: 0 };
    }
    
    updatedQuestions[questionIndex].answer = rating;
    
    setRatingData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const handleOverallRating = (rating) => {
    setRatingData(prev => ({
      ...prev,
      overallRating: rating
    }));
  };

  const handleInputChange = (field, value) => {
    setRatingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < predefinedQuestions.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (ratingData.overallRating === 0) {
      alert('Please provide an overall rating');
      return;
    }

    const hasUnansweredQuestions = ratingData.questions.some(q => q.answer === 0);
    if (hasUnansweredQuestions) {
      alert('Please answer all questions');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        expertProfileId: expert.id,
        requirementId: requirement?.id,
        applicationId: application?.id,
        overallRating: ratingData.overallRating,
        review: ratingData.review,
        isAnonymous: ratingData.isAnonymous,
        questions: ratingData.questions
      };

      await api.post('/ratings', payload);
      onRatingSubmitted();
      onClose();
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getCurrentCategoryQuestions = () => {
    if (currentStep < predefinedQuestions.length) {
      const category = predefinedQuestions[currentStep];
      const startIndex = predefinedQuestions.slice(0, currentStep).reduce((acc, cat) => acc + cat.questions.length, 0);
      return {
        category: category.category,
        questions: category.questions.map((question, index) => ({
          question: question,
          category: category.category,
          globalIndex: startIndex + index
        }))
      };
    }
    return null;
  };

  const getProgressPercentage = () => {
    const totalSteps = predefinedQuestions.length + 1; // +1 for overall rating
    return ((currentStep + 1) / totalSteps) * 100;
  };

  const getRatingLabel = (rating) => {
    switch (rating) {
      case 1: return 'Worst';
      case 2: return 'Bad';
      case 3: return 'Average';
      case 4: return 'Good';
      case 5: return 'Excellent';
      default: return 'Not rated';
    }
  };

  const getGlobalIndex = (category, questionIndex) => {
    const categoryIndex = predefinedQuestions.findIndex(cat => cat.category === category);
    const startIndex = predefinedQuestions.slice(0, categoryIndex).reduce((acc, cat) => acc + cat.questions.length, 0);
    return startIndex + questionIndex;
  };

  const isCurrentStepComplete = () => {
    if (currentStep >= predefinedQuestions.length) {
      return ratingData.overallRating > 0;
    }
    
    // Simple check: count how many questions are answered in current step
    const currentCategory = predefinedQuestions[currentStep];
    const totalQuestionsInStep = currentCategory.questions.length;
    const answeredQuestions = currentCategory.questions.filter((_, index) => {
      const globalIndex = getGlobalIndex(currentCategory.category, index);
      return ratingData.questions[globalIndex]?.answer > 0;
    }).length;
    
    return answeredQuestions === totalQuestionsInStep;
  };

  if (!isOpen) return null;

  const currentCategory = getCurrentCategoryQuestions();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Rate Expert</h2>
              <p className="text-slate-600 mt-1">
                {expert?.user?.fullName} - {requirement?.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">
                Step {currentStep + 1} of {predefinedQuestions.length + 1}
              </span>
              <span className="text-sm text-slate-500">
                {Math.round(getProgressPercentage())}% Complete
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage()}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 flex-1 overflow-y-auto">
            {currentStep < predefinedQuestions.length ? (
              // Category Questions
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {currentCategory?.category.charAt(0).toUpperCase() + currentCategory?.category.slice(1)} Assessment
                  </h3>
                  <p className="text-slate-600">
                    Please rate the expert on the following aspects:
                  </p>
                </div>

                <div className="space-y-6">
                  {currentCategory?.questions.map((questionObj, index) => (
                    <div key={index} className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-900 mb-3">
                        {questionObj.question}
                      </p>
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => handleQuestionRating(questionObj.globalIndex, rating)}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              ratingData.questions[questionObj.globalIndex]?.answer === rating
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-slate-600 hover:bg-blue-50'
                            }`}
                          >
                            <Star className={`w-5 h-5 ${
                              ratingData.questions[questionObj.globalIndex]?.answer >= rating
                                ? 'fill-current'
                                : ''
                            }`} />
                          </button>
                        ))}
                        <span className="ml-3 text-sm text-slate-500 self-center">
                          {ratingData.questions[questionObj.globalIndex]?.answer === 0 
                            ? 'Not rated' 
                            : getRatingLabel(ratingData.questions[questionObj.globalIndex]?.answer)
                          }
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Overall Rating and Review
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Overall Rating
                  </h3>
                  <p className="text-slate-600">
                    Please provide your overall rating and any additional comments:
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Overall Rating */}
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm font-medium text-slate-900 mb-3">
                      Overall Rating (1-5 stars)
                    </p>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleOverallRating(rating)}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            ratingData.overallRating === rating
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-slate-600 hover:bg-blue-50'
                          }`}
                        >
                          <Star className={`w-6 h-6 ${
                            ratingData.overallRating >= rating
                              ? 'fill-current'
                              : ''
                          }`} />
                        </button>
                      ))}
                      <span className="ml-3 text-sm text-slate-500 self-center">
                        {ratingData.overallRating === 0 
                          ? 'Not rated' 
                          : getRatingLabel(ratingData.overallRating)
                        }
                      </span>
                    </div>
                  </div>

                  {/* Review */}
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Additional Comments (Optional)
                    </label>
                    <textarea
                      value={ratingData.review}
                      onChange={(e) => handleInputChange('review', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Share your experience working with this expert..."
                    />
                  </div>

                  {/* Anonymous Option */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={ratingData.isAnonymous}
                      onChange={(e) => handleInputChange('isAnonymous', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="anonymous" className="ml-2 text-sm text-slate-700">
                      Submit rating anonymously
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              
              {currentStep < predefinedQuestions.length ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || ratingData.overallRating === 0}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Submit Rating</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExpertRatingModal;
