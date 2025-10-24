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
    return ratingRequests.some(request => 
      request.requirementId === application.requirementId && 
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

  // Get status icon and color - Modern professional design
  const getStatusInfo = (status) => {
    switch (status) {
      case 'PENDING':
        return { 
          icon: Clock, 
          color: 'text-amber-700', 
          bgColor: 'bg-amber-50', 
          borderColor: 'border-amber-200',
          label: 'Under Review',
          dotColor: 'bg-amber-400'
        };
      case 'SHORTLISTED':
        return { 
          icon: Star, 
          color: 'text-emerald-700', 
          bgColor: 'bg-emerald-50', 
          borderColor: 'border-emerald-200',
          label: 'Shortlisted',
          dotColor: 'bg-emerald-400'
        };
      case 'REJECTED':
        return { 
          icon: XCircle, 
          color: 'text-red-700', 
          bgColor: 'bg-red-50', 
          borderColor: 'border-red-200',
          label: 'Not Selected',
          dotColor: 'bg-red-400'
        };
      default:
        return { 
          icon: Clock, 
          color: 'text-slate-700', 
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
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">


      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search applications by job title, company, or description..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          const statusInfo = getStatusInfo(application.status);
          const StatusIcon = statusInfo.icon;
          
          return (
            <motion.div
              key={application.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <RequirementCard
                requirement={application.requirement}
                variant="application"
                onClick={() => {
                  console.log('Navigating to requirement details for:', application.requirement?.title || 'Unknown Requirement');
                  
                  if (application.requirement?.id) {
                    navigate(`/requirement/${application.requirement.id}`, {
                      state: {
                        applicationId: application.id,
                        applicationStatus: application.status,
                        fromApplications: true,
                        requirementId: application.requirement.id,
                        requirementTitle: application.requirement.title,
                        reviewNotes: application.reviewNotes
                      }
                    });
                  } else {
                    console.error('Requirement ID not found for application:', application);
                  }
                }}
                applicationStatus={application.status}
                applicationData={application}
              />
            </motion.div>
          );
        })}
      </div>

      {/* No Applications */}
      {!loading && applications.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-500">Start applying for opportunities to track your applications here.</p>
        </div>
      )}
    </div>
  );
};

export default ApplicationTracking;
