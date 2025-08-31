import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, Calendar, Briefcase, Users, FileText, Star, CheckCircle, IndianRupee } from 'lucide-react';
import apiService from '../../utils/api';

const RequirementDetails = ({ requirementId, onBack, onApplySuccess }) => {
  const [requirement, setRequirement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    coverLetter: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch requirement details
  useEffect(() => {
    const fetchRequirementDetails = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching requirement details for ID:', requirementId);
        const response = await apiService.get(`/requirements/${requirementId}`);
        console.log('📡 Requirement details response:', response);
        
        if (response && response.id) {
          setRequirement(response);
        } else {
          console.log('⚠️ Response not successful:', response);
          setError('Failed to load requirement details');
        }
      } catch (err) {
        console.error('❌ Error fetching requirement details:', err);
        setError('Failed to load requirement details');
      } finally {
        setLoading(false);
      }
    };

    if (requirementId) {
      fetchRequirementDetails();
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
        onApplySuccess(); // Notify parent component
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
          onClick={onBack}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Opportunities
        </button>
      </div>

      {/* Requirement Details Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Section */}
        <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {requirement.title}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {requirement.description}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {requirement.category}
                </span>
                {requirement.subcategory && (
                  <span className="px-4 py-2 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                    {requirement.subcategory}
                  </span>
                )}
                {requirement.isUrgent && (
                  <span className="px-4 py-2 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                    Urgent
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* College Information */}
        <div className="p-8 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-600" />
            College Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Institution</h3>
              <p className="text-gray-600">{requirement.collegeprofile?.institutionName || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Location</h3>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{requirement.collegeprofile?.city || 'Not specified'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="p-8 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Project Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Budget</h3>
              <div className="flex items-center gap-2 text-gray-600">
                <IndianRupee className="w-4 h-4" />
                <span>
                  {requirement.budget ? `₹${requirement.budget}` : 'Negotiable'}
                </span>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Timeline</h3>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  {requirement.deadline ? 
                    `${Math.ceil((new Date(requirement.deadline) - new Date()) / (1000 * 60 * 60 * 24))} days left` : 
                    'No deadline'
                  }
                </span>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Posted Date</h3>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{new Date(requirement.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Skills & Requirements */}
        <div className="p-8 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-blue-600" />
            Skills & Requirements
          </h2>
          <div className="space-y-4">
            {requirement.requiredSkills && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Required Skills</h3>
                <p className="text-gray-600">{requirement.requiredSkills}</p>
              </div>
            )}
            {requirement.experience && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Experience</h3>
                <p className="text-gray-600">{requirement.experience}</p>
              </div>
            )}
            {!requirement.requiredSkills && !requirement.experience && (
              <p className="text-gray-500 italic">No specific skills or experience requirements specified</p>
            )}
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <div className="text-center">
        <button
          onClick={() => setShowApplicationModal(true)}
          className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
        >
          Apply for this Opportunity
        </button>
      </div>

      {/* Application Modal */}
      {showApplicationModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowApplicationModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Apply for Opportunity</h2>
              <p className="text-gray-600">{requirement.title}</p>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* Info Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Application Process</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      You are applying for this opportunity. The college admin will review your profile and update you shortly.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter *
                </label>
                <textarea
                  rows={4}
                  required
                  value={applicationForm.coverLetter}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, coverLetter: e.target.value }))}
                  placeholder="Explain why you're the best fit for this opportunity..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleApplicationSubmit}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default RequirementDetails;
