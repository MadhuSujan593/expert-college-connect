import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, MapPin, Calendar, IndianRupee, Clock, Building2, Star, Zap, Briefcase, Heart } from 'lucide-react';
import apiService from '../../utils/api';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => {
                if (applicationData?.fromApplications) {
                  navigate('/dashboard/expert');
                } else {
                  navigate('/dashboard/expert');
                }
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                 {/* Application Status Banner - Always show when application exists */}
         {hasApplied && (
           <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
             <div className="flex items-center gap-3">
               <div className="flex-shrink-0">
                 <CheckCircle className="w-5 h-5 text-blue-600" />
               </div>
               <div className="flex-1">
                 <h3 className="text-sm font-medium text-blue-800">Application Status</h3>
                 <p className="text-sm text-blue-700 mt-1">
                   You have applied for this requirement. Current status: 
                   <span className="ml-1 font-medium capitalize">
                     {applicationData?.applicationStatus?.toLowerCase() || applicationStatus?.toLowerCase() || 'Pending'}
                   </span>
                 </p>
               </div>
             </div>
           </div>
         )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Job Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                             {/* Job Title and Company */}
               <div className="flex items-start justify-between mb-4">
                 <div className="flex-1">
                   <h1 className="text-2xl font-bold text-gray-900 mb-2">
                     {requirement.title}
                   </h1>
                   <div className="flex items-center gap-2 text-gray-600 mb-2">
                     <Building2 className="w-4 h-4" />
                     <span className="font-medium">{requirement.collegeprofile?.institutionName || 'College Name'}</span>
                   </div>
                   <div className="flex items-center gap-2 text-gray-600 mb-3">
                     <MapPin className="w-4 h-4" />
                     <span className="text-sm">{requirement.collegeprofile?.city || 'Location not specified'}</span>
                   </div>
                 </div>
                 
                 <div className="flex flex-col items-end gap-2">
                   {requirement.isUrgent && (
                     <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                       <Zap className="w-3 h-3" />
                       Urgent
                     </span>
                   )}
                   <span className="text-sm text-gray-500">
                     Posted {new Date(requirement.createdAt).toLocaleDateString()}
                   </span>
                 </div>
               </div>

               {/* Key Job Details */}
               <div className="mb-6">
                 <div className="flex items-center gap-2 text-gray-600">
                   <IndianRupee className="w-4 h-4" />
                   <span className="text-sm">Budget: ₹{requirement.budget ? new Intl.NumberFormat('en-IN').format(requirement.budget) : 'Not disclosed'}</span>
                 </div>
               </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
                  {requirement.category}
                </span>
                {requirement.subcategory && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded">
                    {requirement.subcategory}
                  </span>
                )}
              </div>

              {/* Job Description */}
              <div className="border-t border-gray-100 pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Job description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {requirement.description}
                </p>
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

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            {/* Apply Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Apply for this job</h3>
                <p className="text-sm text-gray-600">Get started with your application</p>
              </div>
              
                                                          {hasApplied ? (
                 <div className="text-center mb-6">
                   <div className="px-4 py-3 rounded-lg font-medium bg-blue-100 text-blue-800 border border-blue-200">
                     Application Submitted
                   </div>
                   <p className="text-sm text-gray-600 mt-2">
                     Status: {applicationData?.applicationStatus || applicationStatus || 'Pending'}
                   </p>
                 </div>
               ) : (
                 <button
                   onClick={() => setShowApplicationModal(true)}
                   className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors mb-6"
                 >
                   Apply Now
                 </button>
               )}

                             {/* Application Tips - Only show if not applied */}
               {!hasApplied && (
                 <div className="border-t border-gray-100 pt-4">
                   <h4 className="font-medium text-gray-900 mb-3">Application Tips</h4>
                   <div className="space-y-2 text-sm text-gray-600">
                     <div className="flex items-start gap-2">
                       <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                       <span>Write a compelling cover letter</span>
                     </div>
                     <div className="flex items-start gap-2">
                       <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                       <span>Highlight relevant experience</span>
                     </div>
                     <div className="flex items-start gap-2">
                       <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                       <span>Mention specific skills</span>
                     </div>
                   </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>

             {/* Application Modal - Only show if not applied */}
       {showApplicationModal && !hasApplied && (
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
    </div>
  );
};

export default RequirementDetails;
