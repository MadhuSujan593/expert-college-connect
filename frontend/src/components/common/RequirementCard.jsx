import React from 'react';
import { 
  MapPin, 
  IndianRupee,
  Briefcase,
  FileText,
  Edit3,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Eye
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
      </div>
    </div>
  );
};

export default RequirementCard;