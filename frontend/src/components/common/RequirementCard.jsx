import React from 'react';
import { motion } from 'framer-motion';

const RequirementCard = ({ 
  requirement, 
  index, 
  showActions = true, 
  compact = false,
  onClick = null,
  onEdit = null,
  onDelete = null
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
    ? "group relative backdrop-blur-xl bg-white/80 border border-white/30 rounded-xl p-3 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200/50 cursor-pointer"
    : "group relative backdrop-blur-xl bg-white/80 border border-white/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200/50";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cardClasses}
      onClick={onClick}
    >
      {/* Card Background Pattern */}
      <div className="absolute inset-0 opacity-[0.01] rounded-xl sm:rounded-2xl">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 30% 70%, #3B82F6 1px, transparent 1px),
            radial-gradient(circle at 70% 30%, #6366F1 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0 ${compact ? 'mb-2' : 'mb-3 sm:mb-4'}`}>
          <div className="flex-1 min-w-0">
            <div className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 ${compact ? 'mb-1' : 'mb-2'}`}>
              <h3 className={`font-bold text-slate-900 group-hover:text-blue-900 transition-colors duration-300 line-clamp-1 ${
                compact ? 'text-sm' : 'text-base sm:text-lg'
              }`}>
                {requirement.title}
              </h3>
              {requirement.isUrgent && (
                <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-semibold rounded-full shadow-md w-fit">
                  Urgent
                </span>
              )}
            </div>
            
            {!compact && (
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2">
                {requirement.description}
              </p>
            )}
            
            {/* Tags and Info */}
            <div className={`flex flex-wrap items-center gap-2 sm:gap-3 ${compact ? 'gap-1' : ''}`}>
              <span className={`px-2 sm:px-3 py-1 bg-gradient-to-r ${getCategoryColor(requirement.category)} text-white text-xs font-semibold rounded-full shadow-md`}>
                {getCategoryLabel(requirement.category)}
              </span>
              
              {requirement.budget && (
                <div className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full">
                  <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span className="text-xs font-semibold text-emerald-800">{formatBudget(requirement.budget)}</span>
                </div>
              )}
              
              {requirement.deadline && (
                <div className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 rounded-full">
                  <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-semibold text-orange-800">{formatDate(requirement.deadline)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer - Only show if not compact or if actions are enabled */}
        {(!compact || showActions) && (
          <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 ${compact ? 'pt-2' : 'pt-3 sm:pt-4'} border-t border-slate-200/50`}>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Posted {formatDate(requirement.createdAt)}</span>
            </div>
            
            {showActions && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit && onEdit();
                  }}
                  className="px-2 sm:px-3 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                >
                  <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete && onDelete();
                  }}
                  className="px-2 sm:px-3 py-1 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 00-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RequirementCard;
