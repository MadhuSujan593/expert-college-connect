import React from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, CheckCircle, XCircle, MessageSquare, User, Calendar, Building2 } from 'lucide-react';

const ExpertRatingRequestsList = ({ ratingRequests }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'APPROVED':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'REJECTED':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'COMPLETED':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />;
      case 'COMPLETED':
        return <Star className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!ratingRequests || ratingRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No rating requests yet</h3>
        <p className="text-gray-500">Request ratings from colleges after completing projects.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ratingRequests.map((request) => (
        <motion.div
          key={request.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {request.requirement.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="w-4 h-4" />
                  <span>{request.collegeprofile.institutionName}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-3">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  <span className="font-semibold">{request.status}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Requested {formatDate(request.requestedAt)}</span>
                </div>
              </div>
            </div>
          </div>


          {request.respondedAt && (
            <div className="text-sm text-gray-500">
              <span>Responded on {formatDate(request.respondedAt)}</span>
            </div>
          )}

          {request.ratings && request.ratings.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Rating Received</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < request.ratings[0].overallRating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {request.ratings[0].overallRating}/5
                </span>
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default ExpertRatingRequestsList;
