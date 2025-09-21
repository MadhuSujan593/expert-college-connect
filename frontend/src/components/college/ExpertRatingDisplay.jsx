import React from 'react';
import { motion } from 'framer-motion';
import { Star, User, Calendar, MessageSquare, Eye, EyeOff } from 'lucide-react';

const ExpertRatingDisplay = ({ ratings, expertName }) => {
  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRatingText = (rating) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 3.5) return 'Good';
    if (rating >= 2.5) return 'Average';
    if (rating >= 1.5) return 'Below Average';
    return 'Poor';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category) => {
    const icons = {
      communication: MessageSquare,
      expertise: Star,
      timeliness: Calendar,
      quality: Star,
      collaboration: User,
    };
    return icons[category] || Star;
  };

  if (!ratings || ratings.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Star className="h-12 w-12 mx-auto mb-4 text-slate-300" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No ratings yet</h3>
        <p className="text-slate-500">This expert hasn't received any ratings yet.</p>
      </div>
    );
  }

  // Calculate average ratings
  const overallAverage = ratings.reduce((sum, rating) => sum + rating.overallRating, 0) / ratings.length;
  
  // Calculate category averages
  const categoryAverages = {};
  ratings.forEach(rating => {
    rating.ratingQuestions?.forEach(question => {
      if (!categoryAverages[question.category]) {
        categoryAverages[question.category] = { sum: 0, count: 0 };
      }
      categoryAverages[question.category].sum += question.answer;
      categoryAverages[question.category].count += 1;
    });
  });

  Object.keys(categoryAverages).forEach(category => {
    categoryAverages[category].average = categoryAverages[category].sum / categoryAverages[category].count;
  });

  return (
    <div className="space-y-6">
      {/* Overall Rating Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-900">Overall Rating</h3>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(overallAverage)
                      ? 'text-yellow-400 fill-current'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className={`text-2xl font-bold ${getRatingColor(overallAverage)}`}>
              {overallAverage.toFixed(1)}
            </span>
          </div>
        </div>
        <p className="text-slate-600">
          {getRatingText(overallAverage)} • Based on {ratings.length} rating{ratings.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryAverages).length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h4 className="text-lg font-semibold text-slate-900 mb-4">Rating Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(categoryAverages).map(([category, data]) => {
              const Icon = getCategoryIcon(category);
              return (
                <div key={category} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-slate-600" />
                    <span className="font-medium text-slate-900 capitalize">
                      {category.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(data.average)
                              ? 'text-yellow-400 fill-current'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`font-semibold ${getRatingColor(data.average)}`}>
                      {data.average.toFixed(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Individual Ratings */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-slate-900">Recent Ratings</h4>
        {ratings.slice(0, 5).map((rating, index) => (
          <motion.div
            key={rating.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl border border-slate-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  {rating.isAnonymous ? (
                    <EyeOff className="w-5 h-5 text-blue-600" />
                  ) : (
                    <User className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    {rating.isAnonymous ? 'Anonymous' : 'College Rating'}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatDate(rating.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= rating.overallRating
                        ? 'text-yellow-400 fill-current'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
                <span className="ml-2 font-semibold text-slate-900">
                  {rating.overallRating}/5
                </span>
              </div>
            </div>

            {rating.review && (
              <p className="text-slate-700 mb-4">{rating.review}</p>
            )}

            {/* Question Ratings */}
            {rating.ratingQuestions && rating.ratingQuestions.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-slate-700 mb-2">Detailed Feedback:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {rating.ratingQuestions.map((question, qIndex) => (
                    <div key={qIndex} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 truncate pr-2">
                        {question.question}
                      </span>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= question.answer
                                ? 'text-yellow-400 fill-current'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-slate-500">
                          {question.answer}/5
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ExpertRatingDisplay;

