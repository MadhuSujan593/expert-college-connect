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
  BarChart3,
  MapPin,
  Award
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

  // Helper function to get full profile picture URL
  const getFullProfilePictureUrl = (profilePictureUrl) => {
    if (!profilePictureUrl) return null;
    
    if (profilePictureUrl.startsWith('http://') || profilePictureUrl.startsWith('https://')) {
      return profilePictureUrl;
    }
    
    const baseUrl = 'http://localhost:3000';
    return `${baseUrl}/${profilePictureUrl}`;
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
    <div className="space-y-6">
      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Right Column - Requirement Selector (Shows first on mobile) */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <RequirementSelector 
            onRequirementSelect={handleRequirementSelect}
            selectedRequirementId={selectedRequirement?.id}
          />
        </div>

        {/* Left Column - Stats and Table (Shows second on mobile) */}
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1 w-full">
          {/* Welcome Message - Show when no requirement is selected */}
          {!selectedRequirement && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="card-glass p-12 text-center"
            >
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft">
                  <BarChart3 className="w-10 h-10 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">Welcome to Application Management</h3>
                <p className="text-neutral-600 text-lg leading-relaxed">
                  Select a requirement from the dropdown to view and manage applications for that specific position.
                </p>
              </div>
            </motion.div>
          )}


          {/* Applications Table - Only show when requirement is selected */}
          {selectedRequirement && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ApplicationTable
                requirementId={selectedRequirement.id}
                onViewProfile={handleTableViewProfile}
                onUpdateStatus={handleTableUpdateStatus}
                refreshKey={refreshKey}
                adminName={user?.fullName || 'Admin'}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedApplication && (
        <div className="modal-overlay">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="modal-content max-w-lg"
          >
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">Update Application Status</h2>
                  <p className="text-neutral-600 text-sm">
                    {selectedApplication?.expert?.fullName} - {selectedApplication?.requirement?.title}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-3">Status</label>
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                  className="input w-full"
                >
                  <option value="PENDING">Pending</option>
                  <option value="SHORTLISTED">Shortlist</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-3">Review Notes (Optional)</label>
                <textarea
                  rows={4}
                  value={statusForm.reviewNotes}
                  onChange={(e) => setStatusForm(prev => ({ ...prev, reviewNotes: e.target.value }))}
                  placeholder="Add feedback or notes for the expert..."
                  className="input w-full resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleStatusUpdate}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Updating...' : 'Update Status'}
                </button>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-xl transition-all duration-200 border border-neutral-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}



      {/* Expert Profile Modal - Same as Expert Directory */}
      {showProfileModal && selectedExpert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Simple Header */}
            <div className="bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {selectedExpert.expertprofile?.profilePicture ? (
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                      <img
                        src={getFullProfilePictureUrl(selectedExpert.expertprofile.profilePicture)}
                        alt={`${selectedExpert.fullName}'s profile`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log('❌ Profile picture failed to load:', selectedExpert.expertprofile.profilePicture);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold text-xl" style={{display: 'none'}}>
                        {selectedExpert.fullName?.charAt(0) || 'E'}
                      </div>
                    </div>
                  ) : selectedExpert.profilePicture ? (
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                      <img
                        src={getFullProfilePictureUrl(selectedExpert.profilePicture)}
                        alt={`${selectedExpert.fullName}'s profile`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log('❌ Profile picture failed to load:', selectedExpert.profilePicture);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold text-xl" style={{display: 'none'}}>
                        {selectedExpert.fullName?.charAt(0) || 'E'}
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold text-xl">
                      {selectedExpert.fullName?.charAt(0) || 'E'}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedExpert.fullName}
                    </h2>
                    <p className="text-gray-600">{selectedExpert.expertprofile?.primaryExpertise?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Expert'}</p>
                    {selectedExpert.expertprofile?.jobTitle && (
                      <p className="text-gray-500 text-sm">{selectedExpert.expertprofile.jobTitle}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={closeProfileModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Quick Info Row */}
              <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-gray-100">
                {selectedExpert.expertprofile?.experience && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{selectedExpert.expertprofile.experience} years experience</span>
                  </div>
                )}
                {selectedExpert.expertprofile?.location && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedExpert.expertprofile.location}</span>
                  </div>
                )}
                {selectedExpert.expertprofile?.hourlyRate && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-semibold text-green-600">${parseFloat(selectedExpert.expertprofile.hourlyRate).toFixed(0)}/hr</span>
                  </div>
                )}
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
                        {selectedExpert.expertprofile.primaryExpertise?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
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

                {/* Work Experience Details */}
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

                {/* Contact & Documents */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contact */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{selectedExpert.email ? '••••••••••@•••' : 'Not provided'}</span>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              await apiService.revealExpertContact(selectedExpert.id);
                              window.location.href = `mailto:${selectedExpert.email}`;
                            } catch (e) {
                              alert(e.message || 'Unable to reveal contact. Please upgrade your plan.');
                            }
                          }}
                          className="text-sm text-indigo-600 hover:text-indigo-800"
                        >
                          Reveal
                        </button>
                      </div>
                      {selectedExpert.phone && (
                        <div className="flex items-center justify-between p-2">
                          <div className="flex items-center space-x-3">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">••••••••••</span>
                          </div>
                          <button
                            onClick={async () => {
                              try {
                                await apiService.revealExpertContact(selectedExpert.id);
                                alert(`Phone: ${selectedExpert.phone}`);
                              } catch (e) {
                                alert(e.message || 'Unable to reveal contact. Please upgrade your plan.');
                              }
                            }}
                            className="text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            Reveal
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Documents */}
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
            </div>

            {/* Simple Footer */}
            <div className="bg-gray-50 border-t border-gray-200 p-4">
              <div className="flex space-x-3">
                <button
                  onClick={closeProfileModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const subject = `Application Inquiry - ${selectedApplication?.requirement?.title || 'Position'}`;
                    const body = `Dear ${selectedExpert.fullName},\n\nI hope this email finds you well. I am reaching out regarding your application.\n\nBest regards,`;
                    const mailtoLink = `mailto:${selectedExpert.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    window.open(mailtoLink);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Contact Expert
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ApplicationManagement;