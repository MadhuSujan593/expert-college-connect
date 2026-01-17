import React, { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import ExpertProfileModal from './ExpertProfileModal';

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
  applicationData = null,
  // New props for expert profile modal functionality
  mySubscription = null,
  subsLoading = false,
  getLimitationDetails = null,
  showPlanLimitationModal = null,
  setLimitationType = null,
  apiService = null,
  revealedExpertIds = new Set(),
  setRevealedExpertIds = null,
  // Rating request controls for application variant
  onRequestRating = null,
  canRequestRating = false,
  hasRequested = false
}) => {
  // Simple state for expert modal
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expertCount, setExpertCount] = useState(null);

  // Expert profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);

  // Fetch expert count when component mounts for college variant
  useEffect(() => {
    if (variant === 'college') {
      fetchExpertCount();
    }
  }, [variant, requirement.id]);

  // Function to fetch expert count
  const fetchExpertCount = async () => {
    if (expertCount !== null) return; // Already fetched

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/recommendations/college?page=1&limit=100&minScore=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const matchingRequirement = data.requirements?.find(req => req.requirement.id === requirement.id);
        if (matchingRequirement) {
          setExpertCount(matchingRequirement.totalMatches || 0);
        } else {
          setExpertCount(0);
        }
      }
    } catch (error) {
      console.error('Failed to fetch expert count:', error);
      setExpertCount(0);
    }
  };

  // Simple function to show experts
  const handleViewExperts = async (e) => {
    e.stopPropagation();

    if (experts.length > 0) {
      setShowExpertModal(true);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/recommendations/college?page=1&limit=100&minScore=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const matchingRequirement = data.requirements?.find(req => req.requirement.id === requirement.id);
        if (matchingRequirement) {
          setExperts(matchingRequirement.matchedExperts || []);
          setExpertCount(matchingRequirement.totalMatches || 0);
        }
      }
    } catch (error) {
      console.error('Failed to fetch experts:', error);
    } finally {
      setLoading(false);
      setShowExpertModal(true);
    }
  };

  // Handle view expert profile
  const handleViewProfile = async (expertMatch) => {
    try {
      // Fetch complete expert profile data
      const response = await fetch(`${import.meta.env.VITE_API_URL}/expert-profiles/${expertMatch.expert.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const completeExpertData = await response.json();
        setSelectedExpert(completeExpertData);
        setShowProfileModal(true);
      } else {
        // Fallback to basic data if API call fails
        const transformedExpert = {
          id: expertMatch.expert.id,
          user: {
            fullName: expertMatch.expert.name,
            email: expertMatch.expert.email,
            phone: null,
          },
          profilePicture: expertMatch.expert.profileImage,
          jobTitle: 'Expert',
          company: null,
          experience: null,
          location: null,
          hourlyRate: null,
          bio: null,
          primaryExpertise: null,
          expertskill: expertMatch.expert.skills?.map(skill => ({
            id: skill.name,
            skillName: skill.name,
            skillLevel: skill.level,
          })) || [],
          availableFor: [],
          preferredMode: null,
          workexperience: [],
          resumeUrl: null,
          website: null,
        };
        setSelectedExpert(transformedExpert);
        setShowProfileModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch expert profile:', error);
      // Fallback to basic data
      const transformedExpert = {
        id: expertMatch.expert.id,
        user: {
          fullName: expertMatch.expert.name,
          email: expertMatch.expert.email,
          phone: null,
        },
        profilePicture: expertMatch.expert.profileImage,
        jobTitle: 'Expert',
        company: null,
        experience: null,
        location: null,
        hourlyRate: null,
        bio: null,
        primaryExpertise: null,
        expertskill: expertMatch.expert.skills?.map(skill => ({
          id: skill.name,
          skillName: skill.name,
          skillLevel: skill.level,
        })) || [],
        availableFor: [],
        preferredMode: null,
        workexperience: [],
        resumeUrl: null,
        website: null,
      };
      setSelectedExpert(transformedExpert);
      setShowProfileModal(true);
    }
  };

  // Close profile modal
  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedExpert(null);
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
    // For expert variant, we still want to show the actual required skills of the job, 
    // but maybe highlight matches if we were doing advanced UI. 
    // For now, to match "College Dashboard", we should simply show the required skills.
    return requirement.requiredSkills || requirement.recommendation?.matchedSkills;
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
  const isRecommended = variant === 'expert' && (matchScore || 0) >= 20;

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-100';
    if (score >= 60) return 'text-indigo-600 bg-indigo-100';
    if (score >= 40) return 'text-amber-600 bg-amber-100';
    return 'text-rose-600 bg-rose-100';
  };

  return (
    <>
      <div
        className={`group bg-white rounded-lg border border-slate-200/60 shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden ${className}`}
        onClick={onClick}
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            {/* Left Side - Main Content */}
            <div className="flex-1 min-w-0">
              {/* Header Section */}
              <div className="mb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1.5 line-clamp-1">
                      {requirement.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span className="font-medium text-slate-700">{collegeData.name}</span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {variant === 'expert' && isRecommended && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <Sparkles className="w-3 h-3" />
                        Recommended
                      </span>
                    )}
                    {requirement.isUrgent && (
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                        Urgent
                      </span>
                    )}
                    {matchScore && (
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${matchScore >= 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        matchScore >= 60 ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                          matchScore >= 40 ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-slate-50 text-slate-600 border-slate-100'
                        }`}>
                        {matchScore}% Match
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Key Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-6 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{requirement.experience || 'Exp. Not specified'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <IndianRupee className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{formatCurrency(requirement.budget)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{collegeData.city || 'Remote'}</span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <p className="text-sm text-slate-600 line-clamp-1 leading-relaxed">
                  {requirement.description || 'No description provided.'}
                </p>
              </div>

              {/* Skills & Actions Footer */}
              <div className="flex items-end justify-between gap-4 pt-4 border-t border-slate-100">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-1.5">
                    {skills && skills.length > 0 ? (
                      formatSkills(skills).split(' · ').map((skill, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded bg-slate-50 text-slate-600 text-xs font-medium border border-slate-200 hover:bg-slate-100 transition-colors">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400 italic">No skills specified</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {showActions && variant === 'college' && (
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {onView && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onView(requirement); }}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-[3px] transition-all"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(requirement); }}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-[3px] transition-all"
                        title="Edit Requirement"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    {onToggle && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggle(requirement); }}
                        className={`p-2 rounded-[3px] transition-all ${requirement.isActive
                          ? 'text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                          }`}
                        title={requirement.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {requirement.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(requirement); }}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-[3px] transition-all"
                        title="Delete Requirement"
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

        {/* View Experts Banner for College Variant */}
        {variant === 'college' && (
          <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between group-hover:bg-indigo-50/30 transition-colors">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-semibold text-slate-600">
                {expertCount !== null ? (
                  expertCount === 0 ? 'No experts matched yet' : `${expertCount} matches found`
                ) : 'Checking for matches...'}
              </span>
            </div>
            <button
              onClick={handleViewExperts}
              disabled={loading}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors bg-blue-50 hover:bg-blue-100 rounded-[3px] px-2 py-1"
            >
              {loading ? 'Loading...' : 'View Matches'}
              <Target className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Expert Modal */}
      {showExpertModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{requirement.title}</h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  {experts.length} qualified experts found
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setShowExpertModal(false); }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-[3px] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto min-h-[300px] bg-slate-50/50">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-white/0 mb-3"></div>
                  <span className="text-sm font-medium text-slate-500">Finding the best experts...</span>
                </div>
              ) : experts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-slate-900 font-semibold mb-1">No experts found yet</h3>
                  <p className="text-slate-500 text-sm">We're still looking for the perfect match.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {experts.map((expertMatch, index) => (
                    <div
                      key={index}
                      className="bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all group"
                      onClick={() => handleViewProfile(expertMatch)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            {expertMatch.expert.profileImage ? (
                              <img
                                src={expertMatch.expert.profileImage}
                                alt={expertMatch.expert.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white font-bold">
                                {(expertMatch.expert.name || 'E')[0]}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {expertMatch.expert.name}
                            </h3>
                            <p className="text-sm text-slate-500 mb-2">{expertMatch.expert.email}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {expertMatch.expert.skills?.slice(0, 5).map((skill, i) => (
                                <span key={i} className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded border border-slate-200">
                                  {skill.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${expertMatch.recommendation?.score >= 80 ? 'bg-emerald-100 text-emerald-700' :
                            'bg-indigo-100 text-indigo-700'
                            }`}>
                            {expertMatch.recommendation?.score || 0}% Match
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

      {/* Details of Expert Profile Modal kept as is */}
      <ExpertProfileModal
        isOpen={showProfileModal}
        expert={selectedExpert}
        onClose={closeProfileModal}
        onContactExpert={() => {
          if (revealedExpertIds.has(selectedExpert?.id) && selectedExpert?.user?.email) {
            const subject = `Expert Inquiry - ${selectedExpert.user.fullName}`;
            const body = `Dear ${selectedExpert.user.fullName},\n\nI hope this email finds you well. I am reaching out regarding your expertise.\n\nBest regards,`;
            const mailtoLink = `mailto:${selectedExpert.user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.open(mailtoLink);
            closeProfileModal();
          }
        }}
        revealedExpertIds={revealedExpertIds}
        onRevealContact={(expertId) => {
          if (setRevealedExpertIds) {
            setRevealedExpertIds(prev => {
              const newSet = new Set([...prev, expertId]);
              return newSet;
            });
          }
          if (window.refreshSubscriptionData) {
            window.refreshSubscriptionData();
          }
        }}
        mySubscription={mySubscription}
        getLimitationDetails={getLimitationDetails}
        showPlanLimitationModal={showPlanLimitationModal}
        setLimitationType={setLimitationType}
        apiService={apiService}
        subsLoading={subsLoading}
      />
    </>
  );
};

export default RequirementCard;