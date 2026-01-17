import React from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, CheckCircle, XCircle, MessageSquare, User, Calendar, Building2 } from 'lucide-react';

const ExpertRatingRequestsList = ({ ratingRequests }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'text-amber-700 bg-amber-50 border-amber-100';
      case 'APPROVED':
        return 'text-emerald-700 bg-emerald-50 border-emerald-100';
      case 'REJECTED':
        return 'text-rose-700 bg-rose-50 border-rose-100';
      case 'COMPLETED':
        return 'text-indigo-700 bg-indigo-50 border-indigo-100';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-3.5 h-3.5" />;
      case 'APPROVED':
        return <CheckCircle className="w-3.5 h-3.5" />;
      case 'REJECTED':
        return <XCircle className="w-3.5 h-3.5" />;
      case 'COMPLETED':
        return <Star className="w-3.5 h-3.5" />;
      default:
        return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!ratingRequests || ratingRequests.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-900 mb-1">No rating requests yet</h3>
        <p className="text-xs text-slate-500">Request ratings from colleges after completing projects.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ratingRequests.map((request) => (
        <motion.div
          key={request.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3px] shadow-sm border border-slate-200 p-5 hover:border-indigo-200 transition-colors"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-base font-bold text-slate-900">
                  {request.requirement?.title || 'Project Request'}
                </h3>
                {request.collegeprofile && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                    <Building2 className="w-3 h-3" />
                    <span>{request.collegeprofile.institutionName || 'College'}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-3">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-xs font-bold border ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  <span>{request.status}</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Requested {formatDate(request.requestedAt)}</span>
                </div>
              </div>
            </div>
          </div>


          {request.respondedAt && (
            <div className="text-xs text-slate-400 mb-3 pl-1 border-l-2 border-slate-100">
              Responded: {formatDate(request.respondedAt)}
            </div>
          )}

          {request.ratings && request.ratings.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-yellow-50 rounded-full">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                </div>
                <span className="text-xs font-bold text-slate-700">Rating Received</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-[3px] border border-slate-100">
                <span className="text-sm font-bold text-slate-900">{request.ratings[0].overallRating}</span>
                <span className="text-xs text-slate-400">/ 5</span>
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default ExpertRatingRequestsList;
