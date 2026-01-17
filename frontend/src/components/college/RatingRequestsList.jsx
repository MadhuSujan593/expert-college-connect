import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, CheckCircle, XCircle, MessageSquare, User, Calendar } from 'lucide-react';
import SimpleRatingModal from './SimpleRatingModal';
import api from '../../utils/api';

const RatingRequestsList = ({ ratingRequests, onUpdate, hasMore, loadingMore, onLoadMore }) => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [expandedMessages, setExpandedMessages] = useState(new Set());

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

  const toggleMessageExpansion = (requestId) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  const truncateMessage = (message, maxLength = 80) => {
    if (!message) return '';
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
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
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {(request.expertprofile?.profilePicture || request.expertprofile?.user?.profileImage) ? (
                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                  <img
                    src={request.expertprofile.profilePicture || request.expertprofile.user.profileImage}
                    alt={`${request.expertprofile.user.fullName}'s profile`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm" style={{ display: 'none' }}>
                    {request.expertprofile.user.fullName?.charAt(0) || 'E'}
                  </div>
                </div>
              ) : (
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-sm border border-slate-200">
                  {request.expertprofile?.user?.fullName?.charAt(0) || 'E'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {request.expertprofile?.user?.fullName}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {request.requirement?.title}
                </p>
                {request.message && (
                  <div className="mt-1">
                    <p className="text-xs text-gray-500">
                      {expandedMessages.has(request.id)
                        ? request.message
                        : truncateMessage(request.message)
                      }
                    </p>
                    {request.message.length > 80 && (
                      <button
                        onClick={() => toggleMessageExpansion(request.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1"
                      >
                        {expandedMessages.has(request.id) ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 ml-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(request.requestedAt).toLocaleDateString()}
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full border ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  <span className="text-xs font-medium">{request.status.toLowerCase()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {request.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={updating === request.id}
                      className="px-3 py-1.5 bg-white text-slate-600 border border-slate-200 rounded-[3px] hover:bg-slate-50 hover:text-rose-600 hover:border-rose-200 text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                    >
                      {updating === request.id ? 'Rejecting...' : 'Reject'}
                    </button>
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={updating === request.id}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[3px] text-xs font-bold transition-all shadow-sm hover:shadow hover:ring-1 hover:ring-indigo-200 disabled:opacity-50"
                    >
                      {updating === request.id ? 'Approving...' : 'Approve & Rate'}
                    </button>
                  </>
                )}

                {request.status === 'APPROVED' && (!request.ratings || request.ratings.length === 0) && (
                  <button
                    onClick={() => handleRateExpert(request)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[3px] text-xs font-bold transition-all shadow-sm hover:shadow hover:ring-1 hover:ring-indigo-200 flex items-center gap-1"
                  >
                    <Star className="w-3 h-3" />
                    Rate Expert
                  </button>
                )}

                {request.ratings && request.ratings.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-[3px] border border-amber-100">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                      <span className="text-xs font-bold text-amber-700">
                        {request.ratings[0].overallRating}/5
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-[3px] border border-emerald-100">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-xs text-emerald-700 font-bold">
                        Rated
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="px-6 py-2.5 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 font-bold text-sm rounded-[3px] transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingMore ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-indigo-600"></div>
                Loading more...
              </>
            ) : (
              <>
                <Star className="w-4 h-4" />
                Load More Requests
              </>
            )}
          </button>
        </div>
      )}

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
