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
  const [successMessage, setSuccessMessage] = useState(null);

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
        // Show success toast, then redirect to Opportunities tab
        if (typeof window !== 'undefined' && window.showToast) {
          window.showToast('Application submitted successfully!', 'success');
        } else {
          // Local lightweight toast as fallback
          setSuccessMessage('Application submitted successfully!');
          setTimeout(() => setSuccessMessage(null), 1500);
        }
        setTimeout(() => {
          navigate('/dashboard/expert?tab=colleges');
        }, 1200);
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
    <div className="min-h-screen bg-gray-50">
      {/* Local toast fallback */}
      {successMessage && (
        <div className="fixed top-6 right-6 z-50">
          <div className="px-4 py-3 rounded-lg shadow-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
            {successMessage}
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Application Status Banner - Enhanced */}
            {hasApplied && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <CheckCircle className="w-32 h-32 text-indigo-600" />
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-4 relative z-10">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-indigo-600 flex-shrink-0">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-indigo-900 mb-1">Application Submitted</h3>
                    <p className="text-indigo-700 text-sm font-medium">
                      Current Status: <span className="uppercase tracking-wider font-bold bg-white px-2 py-0.5 rounded text-indigo-600 border border-indigo-100 ml-1">{applicationData?.applicationStatus || applicationStatus || 'PENDING'}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Job Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
              {/* Header */}
              <div className="flex flex-col gap-4 mb-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2 leading-tight">
                      {requirement.title}
                    </h1>
                    <div className="flex items-center gap-3 text-slate-600 mb-2">
                      <Building2 className="w-5 h-5 text-slate-400" />
                      <span className="font-semibold text-lg">{requirement.collegeprofile?.institutionName || 'College Name'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{requirement.collegeprofile?.city || 'Location not specified'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {requirement.isUrgent && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 text-xs font-bold rounded-full border border-rose-100 uppercase tracking-wide">
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        Urgent Hiring
                      </span>
                    )}
                    <span className="text-xs font-semibold text-slate-400">
                      Posted {new Date(requirement.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm text-emerald-600 border border-slate-100">
                    <IndianRupee className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Budget</p>
                    <p className="text-xl font-bold text-slate-900">
                      {requirement.budget ? `₹${new Intl.NumberFormat('en-IN').format(requirement.budget)}` : 'Not disclosed'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm text-orange-600 border border-slate-100">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Deadline</p>
                    <p className="text-xl font-bold text-slate-900">
                      {requirement.deadline ? new Date(requirement.deadline).toLocaleDateString() : 'No deadline'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded border border-slate-200 uppercase tracking-wider">
                  {(requirement.category || '').replace(/_/g, ' ')}
                </span>
                {requirement.subcategory && (
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded border border-slate-200 uppercase tracking-wider">
                    {requirement.subcategory.replace(/_/g, ' ')}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="border-t border-slate-100 pt-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                  Job Description
                </h3>
                <div className="prose prose-slate max-w-none text-slate-600">
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {requirement.description}
                  </p>
                </div>
              </div>

              {/* Skills & Requirements */}
              {(requirement.requiredSkills || requirement.experience) && (
                <div className="border-t border-slate-100 pt-8 mt-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    Requirements
                  </h3>
                  <div className="space-y-6">
                    {requirement.requiredSkills && (
                      <div>
                        <span className="text-slate-700 text-sm font-bold block mb-3">Required Skills</span>
                        <div className="flex flex-wrap gap-2">
                          {String(requirement.requiredSkills)
                            .split(',')
                            .map(s => s.trim())
                            .filter(Boolean)
                            .map((s, i) => (
                              <span
                                key={i}
                                className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100"
                              >
                                {s}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                    {requirement.experience && (
                      <div>
                        <span className="text-slate-700 text-sm font-bold block mb-1">Experience Level</span>
                        <p className="text-slate-600">{requirement.experience}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Feedback Section */}
              {hasApplied && applicationStatus && applicationStatus !== 'PENDING' && (
                <div className="border-t border-slate-100 pt-8 mt-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-indigo-600" />
                    Feedback & Review
                  </h3>
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 relative">
                    {applicationData?.reviewNotes || reviewNotes ? (
                      <>
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 block">Notes from College</span>
                        <p className="text-slate-800 font-medium italic">
                          "{applicationData?.reviewNotes || reviewNotes}"
                        </p>
                      </>
                    ) : (
                      <div className="flex items-center gap-3 text-slate-500">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Reviewed (No specific notes provided)</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            {/* Action Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-28 shadow-lg shadow-slate-100/50">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                  <Briefcase className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Interested?</h3>
                <p className="text-slate-500 text-sm mt-1">Apply now to start conversation</p>
              </div>

              {hasApplied ? (
                <div className="text-center mb-0">
                  <div className="w-full py-2.5 bg-emerald-50 text-emerald-700 font-bold rounded-[3px] border border-emerald-200 cursor-not-allowed mb-3 flex items-center justify-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Applied
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    You applied on {new Date().toLocaleDateString()}
                  </p>
                </div>
              ) : subsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-100 border-t-indigo-600 mx-auto mb-2"></div>
                  <p className="text-xs text-slate-400">Loading plan...</p>
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

                    // Check limits
                    const canApply = canApplyToJobs();
                    if (!canApply) {
                      setShowLimitModal(true);
                    } else {
                      setShowApplicationModal(true);
                    }
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-[3px] transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
                >
                  Apply for this Job <span aria-hidden="true">&rarr;</span>
                </button>
              )}

              {/* Tips */}
              {!hasApplied && (
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <h4 className="font-bold text-slate-900 text-sm mb-4">Before you apply:</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>Update your profile with latest skills</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>Write a specific cover letter</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>Check the budget and deadline</span>
                    </li>
                  </ul>
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
