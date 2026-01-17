import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Calendar,
  Building2,
  IndianRupee
} from 'lucide-react';
import apiService from '../../utils/api';
import RequirementCard from '../common/RequirementCard';

const ApplicationTracking = ({ onRequestRating, ratingRequests = [] }) => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 10
  });

  // Check if there's already a rating request for this application
  const hasRatingRequest = (application) => {
    const requirementId = application.requirementId || application.requirement?.id;
    return ratingRequests.some(request =>
      request.requirementId === requirementId &&
      request.applicationId === application.id
    );
  };

  // Fetch applications
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== 0) {
          queryParams.append(key, value);
        }
      });

      const response = await apiService.get(`/applications/my-applications?${queryParams.toString()}`);

      if (response.success && response.data) {
        setApplications(response.data.applications || []);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };


  // Format budget
  const formatBudget = (budget, budgetType) => {
    if (!budget) return 'Not specified';
    if (budgetType === 'RANGE') return `${budget} - Negotiable`;
    return `${budget}`;
  };

  // Get status icon and color - Premium professional design
  const getStatusInfo = (status) => {
    switch (status) {
      case 'PENDING':
        return {
          icon: Clock,
          color: 'text-amber-700',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-100',
          label: 'Under Review',
          dotColor: 'bg-amber-400'
        };
      case 'SHORTLISTED':
        return {
          icon: Star,
          color: 'text-emerald-700',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-100',
          label: 'Shortlisted',
          dotColor: 'bg-emerald-400'
        };
      case 'REJECTED':
        return {
          icon: XCircle,
          color: 'text-rose-700',
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-100',
          label: 'Not Selected',
          dotColor: 'bg-rose-400'
        };
      default:
        return {
          icon: Clock,
          color: 'text-slate-600',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
          label: status,
          dotColor: 'bg-slate-400'
        };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  useEffect(() => {
    fetchApplications();
  }, [filters]);

  if (loading && applications.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search applications..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-4 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-[3px] focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm placeholder-slate-400 font-medium"
              />
            </div>
          </div>
          <div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-[3px] focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.map((application) => {
          const req = application.requirement || {};
          const statusInfo = getStatusInfo(application.status);
          const StatusIcon = statusInfo.icon;
          const isShortlisted = application.status === 'SHORTLISTED';

          return (
            <motion.div
              key={application.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => {
                if (req.id) {
                  navigate(`/requirement/${req.id}`, {
                    state: {
                      applicationId: application.id,
                      applicationStatus: application.status,
                      fromApplications: true,
                      requirementId: req.id,
                      requirementTitle: req.title,
                      reviewNotes: application.reviewNotes
                    }
                  });
                }
              }}
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                {/* Left: Job Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between md:hidden mb-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.bgColor} ${statusInfo.color} ${statusInfo.borderColor}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusInfo.label}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1.5 line-clamp-1">{req.title || 'Untitled Requirement'}</h3>

                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-600">{req.collegeprofile?.institutionName || req.collegeprofile?.user?.fullName || 'Hidden College'}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-sm text-slate-500">{formatDate(application.createdAt)}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-500 mb-4">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-slate-400" />
                      <span>{formatBudget(req.budget, req.budgetType)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{req.duration || 'Duration not specified'}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex px-2.5 py-1 bg-slate-50 text-slate-600 text-xs font-medium rounded border border-slate-200">
                      {req.domain || 'General'}
                    </span>
                    {req.mode && (
                      <span className="inline-flex px-2.5 py-1 bg-slate-50 text-slate-600 text-xs font-medium rounded border border-slate-200">
                        {req.mode}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Status & Actions */}
                <div className="flex flex-col items-end gap-4 min-w-[200px]">
                  {/* Desktop Status Badge */}
                  <div className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${statusInfo.bgColor} ${statusInfo.color} ${statusInfo.borderColor}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {statusInfo.label}
                  </div>

                  {isShortlisted && !hasRatingRequest(application) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRequestRating?.(req, application);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-[3px] text-xs font-bold transition-colors w-full md:w-auto justify-center"
                    >
                      <Star className="w-3.5 h-3.5" />
                      Request Rating
                    </button>
                  )}

                  {hasRatingRequest(application) && (
                    <div className="text-xs font-bold text-indigo-600 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Rating Requested
                    </div>
                  )}
                </div>
              </div>

              {/* Footer / Notes */}
              {application.reviewNotes && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-700 mb-1">Reviewer Feedback:</p>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded italic border border-slate-100">"{application.reviewNotes}"</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* No Applications */}
      {!loading && applications.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200 border-dashed">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 mb-1">No applications found</h3>
          <p className="text-xs text-slate-500">Start applying for opportunities to track your applications here.</p>
        </div>
      )}
    </div>
  );
};

export default ApplicationTracking;
