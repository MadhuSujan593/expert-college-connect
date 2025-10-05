import React, { useState, useEffect } from 'react';
import { 
  Plus,
  Sparkles
} from 'lucide-react';
import apiService from '../../utils/api';
import { toast } from 'react-hot-toast';
import RequirementCard from '../common/RequirementCard';

const RecommendationsSection = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadRecommendations();
  }, [currentPage]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const data = await apiService.getRecommendedOpportunities(currentPage, 10, 20);
      setRecommendations(data.opportunities || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyNow = (opportunityId) => {
    // Navigate to requirement details page
    window.location.href = `/requirement/${opportunityId}`;
  };


  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Recommended Jobs</h1>
                <p className="text-gray-600 text-sm">Jobs matched to your skills and experience</p>
              </div>
            </div>
          </div>


      {/* Recommendations Grid */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Finding your perfect matches...</span>
          </div>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations found</h3>
          <p className="text-gray-600 mb-4">
            {minScore > 20 
              ? `Try lowering the minimum score or add more skills to your profile.`
              : `Add more skills to your profile to get personalized recommendations.`
            }
          </p>
          <button 
            onClick={() => window.location.href = '/dashboard/expert/profile'}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Update Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {recommendations.map((opportunity) => (
            <RequirementCard
              key={opportunity.id}
              requirement={opportunity}
              variant="expert"
              onClick={() => window.location.href = `/requirement/${opportunity.id}`}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={!pagination.hasPrevPage}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-3 py-2 text-sm text-gray-700">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
            disabled={!pagination.hasNextPage}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationsSection;
