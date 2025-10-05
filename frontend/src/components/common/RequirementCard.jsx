import React, { useState } from 'react';
import { 
  MapPin, 
  IndianRupee,
  Briefcase,
  FileText,
  Edit3,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Eye,
  Users,
  X,
  Target,
  User
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

const RequirementCard = ({ 
  requirement, 
  variant = 'default', // 'default', 'college', 'expert', 'application'
  showActions = false,
  onEdit,
  onDelete,
  onToggle,
  onView,
  onClick,
  className = '',
  applicationStatus = null,
  applicationData = null
}) => {
  // Simple state for expert modal
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Simple function to show experts
  const handleViewExperts = async (e) => {
    e.stopPropagation();
    
    if (experts.length > 0) {
      setShowExpertModal(true);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/recommendations/college?page=1&limit=100&minScore=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const matchingRequirement = data.requirements?.find(req => req.requirement.id === requirement.id);
        if (matchingRequirement) {
          setExperts(matchingRequirement.matchedExperts || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch experts:', error);
    } finally {
      setLoading(false);
      setShowExpertModal(true);
    }
  };
  // Debug: Log the budget value to see what's causing double currency
  if (requirement.budget && requirement.budget.toString().includes('₹')) {
    console.log('🚨 Double currency detected:', {
      title: requirement.title,
      budget: requirement.budget,
      budgetType: typeof requirement.budget
    });
  }
  // Format skills
  const formatSkills = (skills) => {
    if (!skills || skills.length === 0) return 'Not specified';
    if (typeof skills === 'string') {
      return skills.split(',').slice(0, 8).join(' · ');
    }
    return skills.slice(0, 8).map(skill => 
      typeof skill === 'string' ? skill : skill.skill
    ).join(' · ');
  };

  // Get college data based on variant
  const getCollegeData = () => {
    switch (variant) {
      case 'college':
        return {
          name: requirement.collegeprofile?.institutionName || 'Not specified',
          logoUrl: requirement.collegeprofile?.logoUrl,
          city: requirement.collegeprofile?.city || 'Not specified'
        };
      case 'expert':
        return {
          name: requirement.college?.name || 'Not specified',
          logoUrl: requirement.college?.logoUrl,
          city: requirement.college?.city || 'Not specified'
        };
      default:
        return {
          name: requirement.collegeprofile?.institutionName || requirement.college?.name || 'Not specified',
          logoUrl: requirement.collegeprofile?.logoUrl || requirement.college?.logoUrl,
          city: requirement.collegeprofile?.city || requirement.college?.city || 'Not specified'
        };
    }
  };

  const collegeData = getCollegeData();

  // Get skills based on variant
  const getSkills = () => {
    if (variant === 'expert' && requirement.recommendation?.matchedSkills) {
      return requirement.recommendation.matchedSkills;
    }
    return requirement.requiredSkills;
  };

  const skills = getSkills();

  // Get match score for expert variant
  const getMatchScore = () => {
    if (variant === 'expert' && requirement.recommendation?.score) {
      return requirement.recommendation.score;
    }
    return null;
  };

  const matchScore = getMatchScore();

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <>
      <div
        className={`bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-xl cursor-pointer group shadow-sm ${className}`}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          {/* Left Side - Main Content */}
          <div className="flex-1 min-w-0">
            {/* Top Section - Job Title & Company */}
            <div className="mb-3">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-gray-900 transition-colors mb-1 line-clamp-1">
              {requirement.title}
            </h3>
              <p className="text-gray-900 text-sm mb-1">
                {collegeData.name}
              </p>
            </div>

            {/* Middle Section - Job Details in ONE ROW */}
            <div className="mb-3">
              <div className="flex items-center gap-6 text-sm text-gray-900">
                <span className="flex items-center gap-1 min-w-0">
                  <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{requirement.experience || 'Not specified'}</span>
                </span>
                <span className="flex items-center gap-1 min-w-0">
                  <IndianRupee className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{formatCurrency(requirement.budget)}</span>
                </span>
                <span className="flex items-center gap-1 min-w-0">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{collegeData.city}</span>
                </span>
              </div>
            </div>

            {/* Description - Separate Line */}
            <div className="mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-900">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="line-clamp-1">
                  {requirement.description ? 
                    (requirement.description.length > 60 ? 
                      requirement.description.substring(0, 60) + '...' : 
                      requirement.description
                    ) : 
                    'Not specified'
                  }
              </span>
              </div>
          </div>

            {/* Skills - Separate Line */}
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {skills && skills.length > 0 ? (
                  <span className="text-sm text-gray-900">
                    {formatSkills(skills)}
              </span>
                ) : (
                  <span className="text-sm text-gray-500">Not specified</span>
            )}
          </div>
        </div>
        
            {/* Time Posted */}
            <div className="text-sm text-gray-500">
              {(() => {
                const daysAgo = Math.floor((new Date() - new Date(requirement.createdAt)) / (1000 * 60 * 60 * 24));
                return daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`;
              })()}
            </div>
        </div>
        
          {/* Right Side - Logo & Status */}
          <div className="flex flex-col items-end gap-3 ml-4">
            {/* Company Logo */}
            {/* College Logo - Hide for college variant */}
            {variant !== 'college' && (
              <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-blue-50">
                {collegeData.logoUrl ? (
                  <img 
                    src={collegeData.logoUrl} 
                    alt={collegeData.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center ${collegeData.logoUrl ? 'hidden' : 'flex'}`}
                  style={{ display: collegeData.logoUrl ? 'none' : 'flex' }}
                >
                  <span className="text-white font-bold text-lg">
                    {(collegeData.name || 'C')[0].toUpperCase()}
          </span>
                </div>
              </div>
            )}

            {/* Status Badges */}
            <div className="flex flex-col gap-1">
              {requirement.isUrgent && (
                <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-md border border-red-100">
                  Urgent
            </span>
          )}
          
              {/* Match Score for Expert variant */}
              {matchScore && (
                <span className={`px-3 py-1 text-xs font-medium rounded-md ${getScoreColor(matchScore)}`}>
                  {matchScore}% Match
            </span>
          )}

              {/* Application Status for Application variant */}
              {variant === 'application' && applicationStatus && (
                (() => {
                  const getStatusStyle = (status) => {
                    switch (status?.toUpperCase()) {
                      case 'PENDING':
                        return 'px-3 py-1 bg-yellow-50 text-yellow-600 text-xs font-medium rounded-md border border-yellow-100';
                      case 'SHORTLISTED':
                        return 'px-3 py-1 bg-green-50 text-green-600 text-xs font-medium rounded-md border border-green-100';
                      case 'REJECTED':
                        return 'px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-md border border-red-100';
                      case 'ACCEPTED':
                        return 'px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-md border border-blue-100';
                      default:
                        return 'px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-md border border-gray-100';
                    }
                  };
                  const getStatusText = (status) => {
                    switch (status?.toUpperCase()) {
                      case 'PENDING': return 'Under Review';
                      case 'SHORTLISTED': return 'Shortlisted';
                      case 'REJECTED': return 'Not Selected';
                      case 'ACCEPTED': return 'Selected';
                      default: return 'Applied';
                    }
                  };
                  return (
                    <span className={getStatusStyle(applicationStatus)}>
                      {getStatusText(applicationStatus)}
                      </span>
                  );
                })()
              )}

              {/* Action Buttons for College variant */}
              {showActions && variant === 'college' && (
                <div className="flex gap-1">
                  {onView && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(requirement);
                      }}
                      className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  {onEdit && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(requirement);
                      }}
                      className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                  {onToggle && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                        onToggle(requirement);
                      }}
                      className="p-1 text-gray-500 hover:text-orange-600 transition-colors"
                      title={requirement.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {requirement.isActive ? (
                        <ToggleRight className="w-4 h-4" />
                      ) : (
                        <ToggleLeft className="w-4 h-4" />
                      )}
                      </button>
                    )}
                  {onDelete && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(requirement);
                      }}
                      className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommended Experts Section for College variant */}
        {variant === 'college' && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-3 h-3 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Recommended Experts</span>
              </div>
              <button
                onClick={handleViewExperts}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" />
                    <span>View Experts</span>
                  </>
                )}
                    </button>
                  </div>
                </div>
              )}
            </div>
    </div>

    {/* Expert Modal */}
    {showExpertModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{requirement.title}</h2>
                <p className="text-gray-600 text-sm mt-1">
                  {experts.length} experts found
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowExpertModal(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Expert List */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading experts...</span>
              </div>
            ) : experts.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No experts found matching this requirement</p>
              </div>
            ) : (
              <div className="space-y-4">
                {experts.map((expertMatch, index) => (
                  <div 
                    key={index} 
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      // Navigate to expert profile page
                      window.open(`/expert/${expertMatch.expert.id}`, '_blank');
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                          {expertMatch.expert.profileImage ? (
                            <img
                              src={expertMatch.expert.profileImage}
                              alt={expertMatch.expert.name}
                              className="w-12 h-12 rounded-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {(expertMatch.expert.name || 'E')[0].toUpperCase()}
                              </span>
                            </div>
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
                              {expertMatch.expert.skills?.map((skill, skillIndex) => (
                                <span
                                  key={skillIndex}
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    expertMatch.recommendation?.matchedSkills?.some(ms => {
                                      const matchedSkill = ms.skill.toLowerCase().trim();
                                      const expertSkill = skill.name.toLowerCase().trim();
                                      
                                      if (matchedSkill === expertSkill) return true;
                                      if (matchedSkill.includes(expertSkill) || expertSkill.includes(matchedSkill)) return true;
                                      
                                      const matchedSingular = matchedSkill.replace(/s$/, '');
                                      const expertSingular = expertSkill.replace(/s$/, '');
                                      if (matchedSingular === expertSingular && matchedSingular.length > 2) return true;
                                      
                                      return false;
                                    })
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {skill.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          expertMatch.recommendation?.score >= 80 ? 'text-green-600 bg-green-100' :
                          expertMatch.recommendation?.score >= 60 ? 'text-blue-600 bg-blue-100' :
                          expertMatch.recommendation?.score >= 40 ? 'text-orange-600 bg-orange-100' :
                          'text-red-600 bg-red-100'
                        }`}>
                          {expertMatch.recommendation?.score || 0}% Match
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {expertMatch.recommendation?.matchedSkills?.length || 0} skills matched
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
    </>
  );
};

export default RequirementCard;