import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Star, 
  Calendar, 
  User, 
  IndianRupee,
  Eye,
  MessageSquare,
  Filter,
  Search,
  Send,
  X,
  Mail,
  Phone,
  FileText,
  BarChart3
} from 'lucide-react';
import apiService from '../../utils/api';
import RequirementSelector from './RequirementSelector';
import ApplicationTable from './ApplicationTable';
import { useAuth } from '../../contexts/AuthContext';


const ApplicationManagement = ({ requirementId }) => {
  const { user } = useAuth();
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shortlisted: 0,
    rejected: 0,
    accepted: 0
  });

  const [showStatusModal, setShowStatusModal] = useState(false);

  const [selectedExpert, setSelectedExpert] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statusForm, setStatusForm] = useState({
    status: '',
    reviewNotes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Handle requirement selection
  const handleRequirementSelect = (requirement) => {
    setSelectedRequirement(requirement);
    // Reset any existing application selection
    setSelectedApplication(null);
  };

  // Fetch statistics for the selected requirement
  const fetchStats = async () => {
    if (!selectedRequirement?.id) return;

    try {
      const response = await apiService.get(`/applications/requirement/${selectedRequirement.id}`);
      if (response.success && response.data) {
        const applications = response.data.applications || [];
        const stats = {
          total: applications.length,
          pending: applications.filter(app => app.status === 'PENDING').length,
          shortlisted: applications.filter(app => app.status === 'SHORTLISTED').length,
          rejected: applications.filter(app => app.status === 'REJECTED').length,
          accepted: applications.filter(app => app.status === 'ACCEPTED').length
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    if (selectedRequirement) {
      fetchStats();
    }
  }, [selectedRequirement]);

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedApplication || !statusForm.status) return;

    try {
      setSubmitting(true);
      const response = await apiService.put(`/applications/${selectedApplication.id}/status`, statusForm);
      
      if (response.success) {
        setShowStatusModal(false);
        setStatusForm({ status: '', reviewNotes: '' });
        setSelectedApplication(null);
        fetchStats(); // Refresh stats
        setRefreshKey(prev => prev + 1); // Increment refresh key
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setSubmitting(false);
    }
  };



  // Handle view profile
  const handleViewProfile = (expert) => {
    setSelectedExpert(expert);
    setShowProfileModal(true);
  };

  // Close profile modal
  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedExpert(null);
  };

  // Handle table actions
  const handleTableUpdateStatus = (application) => {
    setSelectedApplication(application);
    setStatusForm({ status: application.status, reviewNotes: application.reviewNotes || '' });
    setShowStatusModal(true);
  };



  const handleTableViewProfile = (expert) => {
    handleViewProfile(expert);
  };

  return (
    <div className="space-y-4">
      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Right Column - Requirement Selector (Shows first on mobile) */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <RequirementSelector 
            onRequirementSelect={handleRequirementSelect}
            selectedRequirementId={selectedRequirement?.id}
          />
        </div>

        {/* Left Column - Stats and Table (Shows second on mobile) */}
        <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
          {/* Welcome Message - Show when no requirement is selected */}
          {!selectedRequirement && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Application Management</h3>
                <p className="text-gray-600 mb-4">
                  Select a requirement from the dropdown on the right to view and manage applications for that specific job posting.
                </p>
              </div>
            </div>
          )}

          {/* Statistics Dashboard - Only show when requirement is selected */}
          {selectedRequirement && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">
                  Statistics for: {selectedRequirement.title}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-blue-600 font-medium">Total</p>
                      <p className="text-xl font-bold text-blue-900">{stats.total}</p>
                    </div>
                    <div className="p-2 bg-blue-200 rounded-lg">
                      <User className="w-4 h-4 text-blue-700" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-yellow-600 font-medium">Pending</p>
                      <p className="text-xl font-bold text-yellow-900">{stats.pending}</p>
                    </div>
                    <div className="p-2 bg-yellow-200 rounded-lg">
                      <Clock className="w-4 h-4 text-yellow-700" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-blue-600 font-medium">Shortlisted</p>
                      <p className="text-xl font-bold text-blue-900">{stats.shortlisted}</p>
                    </div>
                    <div className="p-2 bg-blue-200 rounded-lg">
                      <Star className="w-4 h-4 text-blue-700" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-red-600 font-medium">Rejected</p>
                      <p className="text-xl font-bold text-red-900">{stats.rejected}</p>
                    </div>
                    <div className="p-2 bg-red-200 rounded-lg">
                      <XCircle className="w-4 h-4 text-red-700" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Applications Table - Only show when requirement is selected */}
          {selectedRequirement && (
            <ApplicationTable
              requirementId={selectedRequirement.id}
              onViewProfile={handleTableViewProfile}
              onUpdateStatus={handleTableUpdateStatus}
              refreshKey={refreshKey}
              adminName={user?.fullName || 'Admin'}
            />
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Update Application Status</h2>
              <p className="text-gray-600 text-sm mt-1">
                {selectedApplication?.expert?.fullName} - {selectedApplication?.requirement?.title}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="ACCEPTED">Accepted</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Review Notes (Optional)</label>
                <textarea
                  rows={4}
                  value={statusForm.reviewNotes}
                  onChange={(e) => setStatusForm(prev => ({ ...prev, reviewNotes: e.target.value }))}
                  placeholder="Add feedback or notes for the expert..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleStatusUpdate}
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Update Status'}
                </button>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Expert Profile Modal */}
      {showProfileModal && selectedExpert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold text-xl">
                    {selectedExpert.fullName?.charAt(0) || 'E'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedExpert.fullName}
                    </h2>
                    <p className="text-gray-600">
                      {selectedExpert.expertprofile?.primaryExpertise || 'Expert'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeProfileModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-6">
                {/* About */}
                {selectedExpert.expertprofile?.bio && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedExpert.expertprofile.bio}</p>
                  </div>
                )}

                {/* Primary Expertise */}
                {selectedExpert.expertprofile?.primaryExpertise && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Primary Expertise</h3>
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                      <p className="text-gray-700 font-medium">
                        {selectedExpert.expertprofile.primaryExpertise.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                    </div>
                  </div>
                )}

                {/* Skills */}
                {selectedExpert.expertprofile?.expertskill && selectedExpert.expertprofile.expertskill.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills & Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedExpert.expertprofile.expertskill.map(skill => (
                        <span
                          key={skill.id}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm border border-blue-200"
                        >
                          {skill.skillName}
                          {skill.skillLevel && (
                            <span className="ml-2 text-blue-500">({skill.skillLevel})</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Experience */}
                {selectedExpert.expertprofile?.workexperience && selectedExpert.expertprofile.workexperience.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Work Experience</h3>
                    <div className="space-y-4">
                      {selectedExpert.expertprofile.workexperience.map((exp, index) => (
                        <div key={exp.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900 text-lg">{exp.jobTitle}</h4>
                              <p className="text-blue-600 font-medium">{exp.company}</p>
                              {exp.location && (
                                <p className="text-gray-600 text-sm">{exp.location}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">
                                {new Date(exp.startDate).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  year: 'numeric' 
                                })}
                                {' - '}
                                {exp.isCurrent 
                                  ? 'Present' 
                                  : exp.endDate 
                                    ? new Date(exp.endDate).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        year: 'numeric' 
                                      })
                                    : 'N/A'
                                }
                              </div>
                              {exp.isCurrent && (
                                <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-1">
                                  Current
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {exp.description && (
                            <p className="text-gray-700 mb-3 leading-relaxed">{exp.description}</p>
                          )}
                          
                          {exp.achievements && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-900 mb-2">Key Achievements:</p>
                              <p className="text-gray-700 text-sm leading-relaxed">{exp.achievements}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 p-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{selectedExpert.email}</span>
                    </div>
                    {selectedExpert.phone && (
                      <div className="flex items-center space-x-3 p-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{selectedExpert.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resume */}
                {selectedExpert.expertprofile?.resumeUrl && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Documents</h3>
                    <div className="space-y-2">
                      <a
                        href={selectedExpert.expertprofile.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">View Resume</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 p-4">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeProfileModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationManagement;
