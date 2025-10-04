import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Star, 
  Clock, 
  MapPin, 
  DollarSign,
  Users,
  Calendar,
  Zap,
  Target,
  Award,
  Plus,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Filter,
  Edit3
} from 'lucide-react';
import apiService from '../../utils/api';
import { toast } from 'react-hot-toast';

const RecommendationsSection = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [minScore, setMinScore] = useState(20);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  useEffect(() => {
    loadRecommendations();
    loadStats();
  }, [currentPage, minScore]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const data = await apiService.getRecommendedOpportunities(currentPage, 6, minScore);
      setRecommendations(data.opportunities || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const data = await apiService.getRecommendationStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load recommendation stats:', error);
    } finally {
      setLoadingStats(false);
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

  const formatCurrency = (amount) => {
    if (!amount) return 'Budget not specified';
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleApplyNow = (opportunityId) => {
    // Navigate to requirement details page
    window.location.href = `/requirement/${opportunityId}`;
  };

  if (loadingStats) {
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
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Smart Recommendations</h2>
              <p className="text-sm text-gray-600">Opportunities matched to your skills</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            {stats && (
              <>
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-700">{stats.skillsCount} Skills</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">{stats.appliedCount} Applied</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-gray-700">{stats.totalOpportunities} Opportunities</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Expert Skills Summary */}
        {stats && stats.skillsCount > 0 && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-white/60">
            <div className="flex items-center space-x-2 mb-3">
              <Edit3 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Your Skill Profile</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recommendations.length > 0 && recommendations[0]?.expertSkillsForDisplay?.length > 0 ? 
                // Show expert skills from API response
                recommendations[0].expertSkillsForDisplay.slice(0, 8).map((skillInfo, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-xs font-medium border border-blue-200"
                  >
                    {skillInfo.name} ({skillInfo.level.toLowerCase()})
                  </span>
                )) :
                // Show placeholder for empty recommendations
                <div className="flex items-center space-x-2 text-gray-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Add more skills to your profile for better matches</span>
                </div>
              }
            </div>
            <div className="mt-2 text-xs text-gray-600">
              Skills are matched against college requirements for intelligent recommendations
            </div>
          </div>
        )}

        {/* Recommendation Eligibility */}
        {stats && !stats.recommendationEligibility.hasSkills && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-amber-800">Get Started with Recommendations</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Add skills to your profile to get personalized job recommendations. 
                  <span className="text-amber-600 font-medium"> Update your profile </span>
                  to see opportunities matching your expertise.
                </p>
              </div>
            </div>
          </div>
        )}
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
            Showing {recommendations.length} of {stats?.totalOpportunities || 0} opportunities
          </div>
        </div>
      </div>

      {/* College Requirements vs Expert Skills Comparison Legend */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">How Skills Matching Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-xs text-gray-700">Perfect Match - You have the required skill</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-gray-700">Missing Skill - Required but not in your profile</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-gray-700">Score based on urgency, budget & deadline</span>
            </div>
          </div>
        </div>
      )}

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((opportunity) => (
            <div key={opportunity.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Header with Title and Score */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                    {opportunity.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{opportunity.college.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Award className="h-4 w-4" />
                      <span>{opportunity.category}</span>
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(opportunity.recommendation.score)}`}>
                  {opportunity.recommendation.score}% {getScoreLabel(opportunity.recommendation.score)}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                {opportunity.description}
              </p>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Budget:</span>
                  <span className="font-medium">{formatCurrency(opportunity.budget)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Experience:</span>
                  <span className="font-medium">{opportunity.experience || 'Not specified'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Deadline:</span>
                  <span className="font-medium">{formatDate(opportunity.deadline) || 'Flexible'}</span>
                </div>
                {opportunity.isUrgent && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <Zap className="h-4 w-4" />
                    <span className="text-sm font-medium">Urgent Project</span>
                  </div>
                )}
              </div>

              {/* Skills Analysis */}
              <div className="mb-4 border rounded-lg p-3 bg-gray-50">
                <div className="flex items-center space-x-2 mb-3">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Skills Analysis</span>
                </div>
                
                {/* Expert Skills vs Requirements */}
                <div className="space-y-3">
                  {/* Matched Skills */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-xs font-medium text-green-700">Matched Skills ({opportunity.recommendation.matchedSkills.length})</span>
                    </div>
                    <div className="space-y-1">
                      {opportunity.recommendation.matchedSkills.slice(0, 3).map((skill, index) => (
                        <div key={index} className="flex items-center justify-between bg-green-50 rounded px-2 py-1">
                          <span className="text-xs text-green-800 font-medium">{skill.skill}</span>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-green-600">Your level:</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              skill.level === 'EXPERT' ? 'bg-green-200 text-green-900' :
                              skill.level === 'INTERMEDIATE' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {skill.level.toLowerCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                      {opportunity.recommendation.matchedSkills.length > 3 && (
                        <span className="text-xs text-gray-500 ml-4">
                          +{opportunity.recommendation.matchedSkills.length - 3} more matches
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Unmatched Requirements */}
                  {opportunity.recommendation.unmatchedSkills.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <span className="text-xs font-medium text-orange-700">Required but Missing ({opportunity.recommendation.unmatchedSkills.length})</span>
                      </div>
                      <div className="space-y-1">
                        {opportunity.recommendation.unmatchedSkills.slice(0, 3).map((skill, index) => (
                          <div key={index} className="flex items-center justify-between bg-orange-50 rounded px-2 py-1">
                            <span className="text-xs text-orange-800 font-medium">{skill}</span>
                            <span className="text-xs text-orange-600 font-medium">Missing</span>
                          </div>
                        ))}
                        {opportunity.recommendation.unmatchedSkills.length > 3 && (
                          <span className="text-xs text-gray-500 ml-4">
                            +{opportunity.recommendation.unmatchedSkills.length - 3} more skills needed
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Overall Analysis */}
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Match Analysis:</span>
                    <div className="flex space-x-3">
                      {opportunity.recommendation.matchedSkills?.length > 0 && (
                        <span className="text-green-600">✓ {opportunity.recommendation.matchedSkills.length}/{opportunity.recommendation.matchedSkills.length + opportunity.recommendation.unmatchedSkills?.length} skills matched</span>
                      )}
                      {opportunity.recommendation.unmatchedSkills?.length > 0 && (
                        <span className="text-orange-600">⚠ {opportunity.recommendation.unmatchedSkills.length} skills missing</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{opportunity.applicationsCount} applied</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(opportunity.createdAt)}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleApplyNow(opportunity.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Apply Now
                </button>
              </div>
            </div>
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
  );
};

export default RecommendationsSection;
