import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Edit3, Trash2 } from 'lucide-react';

const RequirementCard = ({ 
  requirement, 
  index, 
  showActions = true, 
  compact = false,
  onClick = null,
  onView = null,
  onEdit = null,
  onDelete = null,
  onRate = null,
  showRateButton = false
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatBudget = (budget) => {
    if (!budget || budget === 0) return 'Not specified';
    return `₹${parseInt(budget).toLocaleString()}`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'DATA_SCIENCE_AI': 'from-violet-500 to-purple-600',
      'CYBERSECURITY': 'from-red-500 to-pink-600',
      'SOFTWARE_DEVELOPMENT': 'from-blue-500 to-indigo-600',
      'INNOVATION': 'from-emerald-500 to-teal-600',
      'DIGITAL_MARKETING': 'from-amber-500 to-orange-600',
      'BUSINESS_STRATEGY': 'from-indigo-500 to-blue-600',
      'FINANCE': 'from-emerald-500 to-green-600',
      'CONSULTING': 'from-orange-500 to-red-600',
      'EDUCATION': 'from-teal-500 to-cyan-600',
      'RESEARCH': 'from-pink-500 to-rose-600',
      'WORKSHOP': 'from-cyan-500 to-blue-600',
      'GUEST_LECTURE': 'from-violet-500 to-purple-600',
      'MENTORING': 'from-rose-500 to-pink-600',
      'CURRICULUM_REVIEW': 'from-sky-500 to-blue-600',
      'INDUSTRY_PROJECT': 'from-lime-500 to-green-600',
      'QUESTION_PAPER_SETTING': 'from-amber-500 to-yellow-600',
      'QUESTION_PAPER_EVALUATION': 'from-fuchsia-500 to-purple-600',
      'TRAINING': 'from-stone-500 to-gray-600',
      'PUBLIC_SPEAKING': 'from-slate-500 to-gray-600',
      'LEADERSHIP': 'from-neutral-500 to-gray-600',
      'HEALTHCARE': 'from-red-500 to-pink-600',
      'ENGINEERING': 'from-blue-500 to-indigo-600',
      'SUSTAINABILITY': 'from-green-500 to-emerald-600'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'DATA_SCIENCE_AI': 'Data Science & AI',
      'CYBERSECURITY': 'Cybersecurity',
      'SOFTWARE_DEVELOPMENT': 'Software Development',
      'INNOVATION': 'Innovation & Design',
      'DIGITAL_MARKETING': 'Digital Marketing',
      'BUSINESS_STRATEGY': 'Business Strategy',
      'FINANCE': 'Finance',
      'CONSULTING': 'Consulting',
      'EDUCATION': 'Education',
      'RESEARCH': 'Research Collaboration',
      'WORKSHOP': 'Workshop',
      'GUEST_LECTURE': 'Guest Lecture',
      'MENTORING': 'Mentoring',
      'CURRICULUM_REVIEW': 'Curriculum Review',
      'INDUSTRY_PROJECT': 'Industry Project',
      'QUESTION_PAPER_SETTING': 'Question Paper Setting',
      'QUESTION_PAPER_EVALUATION': 'Question Paper Evaluation',
      'TRAINING': 'Training & Development',
      'PUBLIC_SPEAKING': 'Public Speaking',
      'LEADERSHIP': 'Leadership Development',
      'HEALTHCARE': 'Healthcare',
      'ENGINEERING': 'Engineering',
      'SUSTAINABILITY': 'Sustainability'
    };
    return labels[category] || category;
  };

  const cardClasses = compact 
    ? "group relative bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer"
    : "group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cardClasses}
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        {/* Title Row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className={`font-semibold text-gray-900 line-clamp-1 flex-1 min-w-0 ${
            compact ? 'text-base' : 'text-lg'
          }`}>
            {requirement.title}
          </h3>
          {requirement.isUrgent && (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-md flex-shrink-0">
              Urgent
            </span>
          )}
        </div>
        
        
        {/* Tags Section */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
            {getCategoryLabel(requirement.category)}
          </span>
          
          {requirement.budget && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-md">
              {formatBudget(requirement.budget)}
            </span>
          )}
          
          {requirement.deadline && (
            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-md">
              {formatDate(requirement.deadline)}
            </span>
          )}
        </div>
        
        {/* Footer - Only show if not compact or if actions are enabled */}
        {(!compact || showActions) && (
          <div className="mt-auto pt-2 border-t border-gray-200/60">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="text-xs text-gray-500">
                Posted {formatDate(requirement.createdAt)}
              </div>
              
              {showActions && (
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onView && onView();
                    }}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit && onEdit();
                    }}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {showRateButton && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onRate && onRate();
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Rate
                    </button>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete && onDelete();
                    }}
                    className="text-red-600 hover:text-red-800 hover:underline"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RequirementCard;
