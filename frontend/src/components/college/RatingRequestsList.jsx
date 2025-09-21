import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, CheckCircle, XCircle, MessageSquare, User, Calendar } from 'lucide-react';
import SimpleRatingModal from './SimpleRatingModal';
import api from '../../utils/api';

const RatingRequestsList = ({ ratingRequests, onUpdate }) => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [updating, setUpdating] = useState(null);

  // Debug logging
  console.log('RatingRequestsList - ratingRequests:', ratingRequests);

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

  const handleApprove = async (requestId) => {
    setUpdating(requestId);
    try {
      await api.patch(`/rating-requests/${requestId}`, { status: 'APPROVED' });
      onUpdate();
    } catch (error) {
      console.error('Failed to approve rating request:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleReject = async (requestId) => {
    setUpdating(requestId);
    try {
      await api.patch(`/rating-requests/${requestId}`, { status: 'REJECTED' });
      onUpdate();
    } catch (error) {
      console.error('Failed to reject rating request:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleRateExpert = (request) => {
    setSelectedRequest(request);
    setShowRatingModal(true);
  };

  const handleRatingSubmitted = () => {
    setShowRatingModal(false);
    setSelectedRequest(null);
    onUpdate();
  };

  if (ratingRequests.length === 0) {
    return (
      <div className="text-center py-8">
        <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Rating Requests</h3>
        <p className="text-gray-600">No experts have requested ratings yet.</p>
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
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {request.expertprofile?.user?.fullName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {request.requirement?.title}
                  </p>
                </div>
              </div>

              {request.message && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{request.message}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(request.requestedAt).toLocaleDateString()}
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full border ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  {request.status.toLowerCase()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              {request.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleReject(request.id)}
                    disabled={updating === request.id}
                    className="px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {updating === request.id ? 'Rejecting...' : 'Reject'}
                  </button>
                  <button
                    onClick={() => handleApprove(request.id)}
                    disabled={updating === request.id}
                    className="px-3 py-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {updating === request.id ? 'Approving...' : 'Approve & Rate'}
                  </button>
                </>
              )}
              
              {request.status === 'APPROVED' && (!request.ratings || request.ratings.length === 0) && (
                <button
                  onClick={() => handleRateExpert(request)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Star className="w-4 h-4" />
                  Rate Expert
                </button>
              )}

              {request.ratings && request.ratings.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">
                      {request.ratings[0].overallRating}/5
                    </span>
                  </div>
                  <span className="text-xs text-green-600 font-medium">
                    Rated
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}

      {/* Rating Modal */}
      {showRatingModal && selectedRequest && (
        <SimpleRatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          expert={selectedRequest.expertprofile}
          requirement={selectedRequest.requirement}
          application={selectedRequest.application}
          onRatingSubmitted={handleRatingSubmitted}
          ratingRequestId={selectedRequest.id}
        />
      )}
    </div>
  );
};

export default RatingRequestsList;
