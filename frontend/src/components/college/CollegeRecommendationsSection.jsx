import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Star, 
  Clock, 
  MapPin, 
  DollarSign,
  Calendar,
  Zap,
  Target,
  Award,
  CheckCircle,
  AlertCircle,
  Filter,
  Eye,
  User,
  Mail,
  Phone,
  X
} from 'lucide-react';
import apiService from '../../utils/api';
import { toast } from 'react-hot-toast';
import RequirementCard from '../common/RequirementCard';
import { formatCurrency } from '../../utils/currency';

const CollegeRecommendationsSection = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [minScore, setMinScore] = useState(10);
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [showExpertModal, setShowExpertModal] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, [currentPage, minScore]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCollegeRecommendations(currentPage, 6, minScore);
      setRecommendations(data.requirements || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Perfect Match';
    if (score >= 60) return 'Great Match';
    if (score >= 40) return 'Good Match';
    return 'Fair Match';
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleViewExperts = (requirement) => {
    setSelectedRequirement(requirement);
    setShowExpertModal(true);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading recommendations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              Expert Recommendations
            </h2>
            <p className="text-gray-600 mt-1">
              Find the best experts for your job requirements
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {pagination.totalCount || 0} requirements analyzed
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Minimum Match Score:</span>
            <select 
              value={minScore} 
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
            >
              <option value={10}>10%+ (All)</option>
              <option value={20}>20%+ (Fair)</option>
              <option value={40}>40%+ (Good)</option>
              <option value={60}>60%+ (Great)</option>
              <option value={80}>80%+ (Perfect)</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing {recommendations.length} of {pagination.totalCount || 0} requirements
          </div>
        </div>
      </div>

      {/* Requirements List */}
      {recommendations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Requirements Found</h3>
          <p className="text-gray-600 mb-4">
            Create job requirements to see expert recommendations
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((item) => (
            <RequirementCard
              key={item.requirement.id}
              requirement={item.requirement}
              variant="college"
              onClick={() => handleViewExperts(item)}
            />
          ))}
        </div>
      )}

      {/* Expert Modal */}
      {showExpertModal && selectedRequirement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedRequirement.requirement.title}</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {selectedRequirement.totalMatches} experts found
                  </p>
                </div>
                <button
                  onClick={() => setShowExpertModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Expert List */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {selectedRequirement.matchedExperts.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No experts found matching this requirement</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedRequirement.matchedExperts.map((expertMatch, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            {expertMatch.expert.profileImage ? (
                              <img
                                src={expertMatch.expert.profileImage}
                                alt={expertMatch.expert.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-6 w-6 text-gray-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{expertMatch.expert.name}</h3>
                            <p className="text-sm text-gray-600">{expertMatch.expert.email}</p>
                            
                            {/* Skills */}
                            <div className="mt-2">
                              <div className="flex items-center space-x-2 mb-2">
                                <Target className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-gray-700">Skills:</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {expertMatch.expert.skills.map((skill, skillIndex) => (
                                  <span
                                    key={skillIndex}
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      expertMatch.recommendation.matchedSkills.some(ms => {
                                        const matchedSkill = ms.skill.toLowerCase().trim();
                                        const expertSkill = skill.name.toLowerCase().trim();
                                        
                                        // Debug logging
                                        if (expertSkill === 'data structure') {
                                          console.log(`Comparing "${matchedSkill}" with "${expertSkill}"`);
                                          console.log('Matched skills:', expertMatch.recommendation.matchedSkills.map(ms => ms.skill));
                                        }
                                        
                                        // Direct match
                                        if (matchedSkill === expertSkill) return true;
                                        
                                        // Contains match (either direction)
                                        if (matchedSkill.includes(expertSkill) || expertSkill.includes(matchedSkill)) return true;
                                        
                                        // Handle plural/singular variations
                                        const matchedSingular = matchedSkill.replace(/s$/, '');
                                        const expertSingular = expertSkill.replace(/s$/, '');
                                        if (matchedSingular === expertSingular && matchedSingular.length > 2) return true;
                                        
                                        return false;
                                      })
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-600'
                                    }`}
                                  >
                                    {skill.name} ({skill.level})
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(expertMatch.recommendation.score)}`}>
                            {expertMatch.recommendation.score}% {getScoreLabel(expertMatch.recommendation.score)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {expertMatch.recommendation.matchedSkills.length} skills matched
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={!pagination.hasPrevPage}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-3 py-2 text-sm text-gray-700">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
            disabled={!pagination.hasNextPage}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CollegeRecommendationsSection;
