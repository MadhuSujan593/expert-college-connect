import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, MapPin, Calendar, IndianRupee, Clock, Building2, Star, Zap, Briefcase, Heart, Shield, AlertCircle } from 'lucide-react';
import apiService from '../../utils/api';
import ApplicationLimitModal from '../common/ApplicationLimitModal';
import PlanLimitationModal from '../common/PlanLimitationModal';

const RequirementDetails = () => {
  const { id: requirementId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const applicationData = location.state;
  const [requirement, setRequirement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    coverLetter: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [reviewNotes, setReviewNotes] = useState(null);
  const [mySubscription, setMySubscription] = useState(null);
  const [subsLoading, setSubsLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showPlanLimitationModal, setShowPlanLimitationModal] = useState(false);
  const [limitationType, setLimitationType] = useState(null);

  // Check if user has already applied and get status
  const checkIfApplied = async () => {
    try {
      const response = await apiService.get('/applications/my-applications');
      if (response.data && response.data.applications) {
        const application = response.data.applications.find(
          app => app.requirementId === requirementId
        );
        if (application) {
          setHasApplied(true);
          setApplicationStatus(application.status);
          setReviewNotes(application.reviewNotes);
        } else {
          setHasApplied(false);
          setApplicationStatus(null);
          setReviewNotes(null);
        }
      }
    } catch (err) {
      console.error('Error checking application status:', err);
    }
  };

  // Load subscription data
  const loadMySubscription = async () => {
    try {
      setSubsLoading(true);
      const data = await apiService.getMySubscription();
      setMySubscription(data);
    } catch (e) {
      console.error('Failed to load subscription', e);
    } finally {
      setSubsLoading(false);
    }
  };

  // Handle plan limitation modal
  const handlePlanLimitationUpgrade = () => {
    setShowPlanLimitationModal(false);
    navigate('/subscription-plans');
  };

  const handlePlanLimitationClose = () => {
    setShowPlanLimitationModal(false);
    setLimitationType(null);
  };

  // Check if user can apply to jobs (subscription limits)
  const canApplyToJobs = () => {
    if (!mySubscription?.plan) return false;
    
    // Check if subscription is expired
    if (mySubscription.endsAt && new Date(mySubscription.endsAt) < new Date()) {
      return false;
    }
    
    // Check application limit
    const usedApplications = mySubscription.usages?.[0]?.usedRequirements || 0;
    const maxApplications = mySubscription.plan.maxRequirements;
    
    if (maxApplications && usedApplications >= maxApplications) {
      return false;
    }
    
    return true;
  };

  // Get limitation details for modal
  const getLimitationDetails = () => {
    if (!mySubscription?.plan) {
      return {
        type: 'no_subscription',
        currentUsage: 0,
        planLimit: 0,
        planName: 'No Plan'
      };
    }
    
    // Check if subscription is expired
    if (mySubscription.endsAt && new Date(mySubscription.endsAt) < new Date()) {
      return {
        type: 'expired',
        currentUsage: 0,
        planLimit: 0,
        planName: mySubscription.plan.name
      };
    }
    
    // Check application limit
    const usedApplications = mySubscription.usages?.[0]?.usedRequirements || 0;
    const maxApplications = mySubscription.plan.maxRequirements;
    
    if (maxApplications && usedApplications >= maxApplications) {
      return {
        type: 'applications',
        currentUsage: usedApplications,
        planLimit: maxApplications,
        planName: mySubscription.plan.name
      };
    }
    
    return null;
  };

  // Fetch requirement details
  useEffect(() => {
    const fetchRequirementDetails = async () => {
      try {
        setLoading(true);
        const response = await apiService.get(`/requirements/${requirementId}`);
        
        if (response && response.id) {
          setRequirement(response);
        } else {
          setError('Failed to load requirement details');
        }
      } catch (err) {
        console.error('Error fetching requirement details:', err);
        setError('Failed to load requirement details');
      } finally {
        setLoading(false);
      }
    };

    if (requirementId) {
      fetchRequirementDetails();
      checkIfApplied();
      loadMySubscription();
    }
  }, [requirementId]);

  // Handle application submission
  const handleApplicationSubmit = async () => {
    if (!requirement) return;

    try {
      setSubmitting(true);
      
      const response = await apiService.post('/applications', {
        requirementId: requirement.id,
        coverLetter: applicationForm.coverLetter
      });

      if (response.success) {
        setShowApplicationModal(false);
        setApplicationForm({ coverLetter: '' });
        // Refresh subscription data to update usage
        await loadMySubscription();
        // Navigate back to dashboard or refresh the page
        navigate('/dashboard/expert');
      }
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !requirement) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          {error || 'Requirement not found'}
        </div>
        <button
          onClick={() => navigate('/dashboard/expert')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Application Status Banner */}
        {hasApplied && (
          <div className="mb-8 bg-white border border-secondary-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-primary-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-secondary-900 mb-1">Application Status</h3>
                <p className="text-secondary-600">
                  You have applied for this requirement. Current status: 
                  <span className="ml-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-semibold bg-primary-50 text-primary-700 border border-primary-200">
                    <div className="w-2 h-2 rounded-full bg-primary-400"></div>
                    {applicationData?.applicationStatus || applicationStatus || 'Pending'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Modern Job Card */}
            <div className="bg-white rounded-xl border border-secondary-200 p-8 shadow-sm">
              {/* Modern Job Header */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-secondary-900 mb-3">
                    {requirement.title}
                  </h1>
                  <div className="flex items-center gap-2 text-secondary-600 mb-2">
                    <Building2 className="w-5 h-5" />
                    <span className="font-semibold text-lg">{requirement.collegeprofile?.institutionName || 'College Name'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-secondary-500 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{requirement.collegeprofile?.city || 'Location not specified'}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  {requirement.isUrgent && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm font-semibold rounded-lg shadow-md">
                      <Zap className="w-4 h-4" />
                      Urgent
                    </span>
                  )}
                  <span className="text-sm text-secondary-500 font-medium">
                    Posted {new Date(requirement.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Key Job Details - Modern Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center gap-3 p-4 bg-secondary-50 rounded-lg">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <IndianRupee className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-secondary-600 font-medium">Budget</p>
                    <p className="text-lg font-semibold text-secondary-900">
                      {requirement.budget ? `₹${new Intl.NumberFormat('en-IN').format(requirement.budget)}` : 'Not disclosed'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-secondary-50 rounded-lg">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-secondary-600 font-medium">Deadline</p>
                    <p className="text-lg font-semibold text-secondary-900">
                      {requirement.deadline ? new Date(requirement.deadline).toLocaleDateString() : 'No deadline'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modern Tags */}
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="px-4 py-2 bg-primary-100 text-primary-800 text-sm font-semibold rounded-lg border border-primary-200">
                  {requirement.category}
                </span>
                {requirement.subcategory && (
                  <span className="px-4 py-2 bg-secondary-100 text-secondary-800 text-sm font-semibold rounded-lg border border-secondary-200">
                    {requirement.subcategory}
                  </span>
                )}
              </div>

              {/* Modern Job Description */}
              <div className="border-t border-secondary-200 pt-6">
                <h3 className="text-xl font-semibold text-secondary-900 mb-4">Job Description</h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-secondary-700 leading-relaxed text-base">
                    {requirement.description}
                  </p>
                </div>
              </div>

                                             {/* Additional Details */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <div className="text-sm">
                    <span className="text-gray-600">Deadline:</span>
                    <span className="ml-2 text-gray-900">
                      {requirement.deadline ? (
                        (() => {
                          const daysLeft = Math.ceil((new Date(requirement.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                          if (daysLeft < 0) {
                            return <span className="text-red-600 font-medium">Expired</span>;
                          } else if (daysLeft === 0) {
                            return <span className="text-orange-600 font-medium">Today</span>;
                          } else {
                            return <span className="text-gray-900">{daysLeft} days left</span>;
                          }
                        })()
                      ) : (
                        'No deadline'
                      )}
                    </span>
                  </div>
                </div>

                             {/* Skills & Requirements */}
               {(requirement.requiredSkills || requirement.experience) && (
                 <div className="border-t border-gray-100 pt-4 mt-4">
                   <h3 className="font-semibold text-gray-900 mb-3">Requirements</h3>
                   <div className="space-y-3">
                     {requirement.requiredSkills && (
                       <div>
                         <span className="text-gray-600 text-sm">Required Skills:</span>
                         <p className="text-gray-900 mt-1">{requirement.requiredSkills}</p>
                       </div>
                     )}
                     {requirement.experience && (
                       <div>
                         <span className="text-gray-600 text-sm">Experience Level:</span>
                         <p className="text-gray-900 mt-1">{requirement.experience}</p>
                       </div>
                     )}
                   </div>
                 </div>
               )}

               {/* Feedback Section - Always show when application exists and has been reviewed */}
               {hasApplied && applicationStatus && applicationStatus !== 'PENDING' && (
                 <div className="border-t border-gray-100 pt-4 mt-4">
                   <h3 className="font-semibold text-gray-900 mb-3">Feedback & Review</h3>
                   <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                           {applicationData?.reviewNotes || reviewNotes ? (
                        // Show specific feedback from navigation state or API
                        <div>
                          <span className="text-gray-600 text-sm font-medium">Review Notes:</span>
                          <p className="text-gray-900 mt-2 leading-relaxed">
                            {applicationData?.reviewNotes || reviewNotes}
                          </p>
                        </div>
                      ) : (
                        // Show generic message when no feedback available
                        <div className="text-center py-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle className="w-6 h-6 text-blue-600" />
                          </div>
                          <p className="text-gray-700 font-medium">Application Reviewed</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Your application has been reviewed. Check your email for detailed feedback.
                          </p>
                        </div>
                      )}
                   </div>
                 </div>
               )}
            </div>
          </div>

          {/* Modern Right Sidebar */}
          <div className="lg:col-span-1">
            {/* Modern Apply Card */}
            <div className="bg-white rounded-xl border border-secondary-200 p-6 sticky top-24 shadow-sm">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">Apply for this job</h3>
                <p className="text-secondary-600">Get started with your application</p>
              </div>
              
              {hasApplied ? (
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg font-semibold bg-primary-50 text-primary-700 border border-primary-200">
                    <div className="w-2 h-2 rounded-full bg-primary-400"></div>
                    Application Submitted
                  </div>
                  <p className="text-sm text-secondary-600 mt-3 font-medium">
                    Status: {applicationData?.applicationStatus || applicationStatus || 'Pending'}
                  </p>
                </div>
              ) : subsLoading ? (
                <div className="text-center mb-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600 mx-auto mb-3"></div>
                  <p className="text-sm text-gray-600">Checking subscription...</p>
                </div>
              ) : (
                <button
                  onClick={() => {
                    // Check subscription first
                    if (!mySubscription?.plan) {
                      const limitation = getLimitationDetails();
                      if (limitation) {
                        setLimitationType(limitation.type);
                        setShowPlanLimitationModal(true);
                        return;
                      }
                    }
                    
                    // Check if can apply to jobs (limits)
                    const canApply = canApplyToJobs();
                    if (!canApply) {
                      setShowLimitModal(true);
                    } else {
                      setShowApplicationModal(true);
                    }
                  }}
                  className="w-full bg-primary-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary-600 transition-colors mb-6 shadow-sm"
                >
                  Apply Now
                </button>
              )}

              {/* Modern Application Tips */}
              {!hasApplied && (
                <div className="border-t border-secondary-200 pt-6">
                  <h4 className="font-semibold text-secondary-900 mb-4">Application Tips</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-success-600" />
                      </div>
                      <span className="text-secondary-700 font-medium">Write a compelling cover letter</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-success-600" />
                      </div>
                      <span className="text-secondary-700 font-medium">Highlight relevant experience</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-success-600" />
                      </div>
                      <span className="text-secondary-700 font-medium">Mention specific skills</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

             {/* Application Modal - Only show if not applied */}
       {showApplicationModal && !hasApplied && canApplyToJobs() && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
             {/* Header */}
             <div className="p-6 border-b border-gray-200">
               <h2 className="text-xl font-bold text-gray-900">Apply for this job</h2>
               <p className="text-gray-600 text-sm mt-1">{requirement.title}</p>
             </div>

             {/* Form */}
             <div className="p-6 space-y-4">
               {/* Info Message */}
               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                 <div className="flex items-start gap-3">
                   <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                   <div>
                     <h3 className="text-sm font-medium text-blue-800">Application Process</h3>
                     <p className="text-sm text-blue-700 mt-1">
                       The college will review your profile and contact you shortly.
                     </p>
                   </div>
                 </div>
               </div>

               {/* Cover Letter */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Cover Letter
                 </label>
                 <textarea
                   rows={4}
                   value={applicationForm.coverLetter}
                   onChange={(e) => setApplicationForm(prev => ({ ...prev, coverLetter: e.target.value }))}
                   placeholder="Explain why you're the best fit for this opportunity..."
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                 />
               </div>

               {/* Actions */}
               <div className="flex gap-3 pt-4">
                 <button
                   onClick={handleApplicationSubmit}
                   disabled={submitting}
                   className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                 >
                   {submitting ? 'Submitting...' : 'Submit Application'}
                 </button>
                 <button
                   type="button"
                   onClick={() => setShowApplicationModal(false)}
                   className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                 >
                   Cancel
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}

      {/* Application Limit Modal */}
      <ApplicationLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onUpgrade={() => {
          setShowLimitModal(false);
          navigate('/subscription-plans');
        }}
        subscription={mySubscription}
      />

      {/* Plan Limitation Modal */}
      <PlanLimitationModal
        isOpen={showPlanLimitationModal}
        onClose={handlePlanLimitationClose}
        onUpgrade={handlePlanLimitationUpgrade}
        limitationType={limitationType}
        currentUsage={mySubscription?.usages?.[0]?.usedRequirements || 0}
        planLimit={mySubscription?.plan?.maxRequirements || 0}
        planName={mySubscription?.plan?.name || 'No Plan'}
      />
    </div>
  );
};

export default RequirementDetails;
