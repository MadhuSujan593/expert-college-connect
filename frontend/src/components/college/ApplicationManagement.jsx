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


const ApplicationManagement = ({ requirementId, onRefreshSubscription }) => {
  const { user } = useAuth();
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [showAllApplications, setShowAllApplications] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shortlisted: 0,
    rejected: 0
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
    if (requirement === null) {
      // Show all applications
      setSelectedRequirement(null);
      setShowAllApplications(true);
    } else {
      // Show specific requirement applications
      setSelectedRequirement(requirement);
      setShowAllApplications(false);
    }
    // Reset any existing application selection
    setSelectedApplication(null);
  };

  // Fetch statistics for applications
  const fetchStats = async () => {
    try {
      let response;
      if (showAllApplications) {
        // Fetch all applications for the college
        response = await apiService.get('/applications/college');
      } else if (selectedRequirement?.id) {
        // Fetch applications for specific requirement
        response = await apiService.get(`/applications/requirement/${selectedRequirement.id}`);
      } else {
        return;
      }

      if (response.success && response.data) {
        const applications = response.data.applications || [];
        const stats = {
          total: applications.length,
          pending: applications.filter(app => app.status === 'PENDING').length,
          shortlisted: applications.filter(app => app.status === 'SHORTLISTED').length,
          rejected: applications.filter(app => app.status === 'REJECTED').length
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedRequirement, showAllApplications]);

  // Fetch stats on component mount
  useEffect(() => {
    fetchStats();
  }, []);

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
    
    const baseUrl = import.meta.env.VITE_BASE_URL;
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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Filter Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-900">{stats.total}</span>
                <span className="text-sm text-gray-600">Total Applications</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-900">{stats.pending}</span>
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-900">{stats.shortlisted}</span>
                <span className="text-sm text-gray-600">Shortlisted</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-900">{stats.rejected}</span>
                <span className="text-sm text-gray-600">Rejected</span>
              </div>
            </div>
            <div className="max-w-md">
              <RequirementSelector 
                onRequirementSelect={handleRequirementSelect}
                selectedRequirementId={selectedRequirement?.id}
              />
            </div>
          </div>

          {/* Applications Table - Always show */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4">
              {showAllApplications ? (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">All Applications</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Showing all applications across all requirements
                  </p>
                </div>
              ) : (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Applications for "{selectedRequirement.title}"</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {stats.total} total applications • {stats.pending} pending review
                  </p>
                </div>
              )}
            </div>
            <ApplicationTable
              requirementId={showAllApplications ? null : selectedRequirement?.id}
              onViewProfile={handleTableViewProfile}
              onUpdateStatus={handleTableUpdateStatus}
              refreshKey={refreshKey}
              adminName={user?.fullName || 'Admin'}
            />
          </motion.div>
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

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                >
                  <option value="PENDING">Pending</option>
                  <option value="SHORTLISTED">Shortlist</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review Notes (Optional)</label>
                <textarea
                  rows={4}
                  value={statusForm.reviewNotes}
                  onChange={(e) => setStatusForm(prev => ({ ...prev, reviewNotes: e.target.value }))}
                  placeholder="Add feedback or notes for the expert..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleStatusUpdate}
                  disabled={submitting}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 px-6 rounded-md font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Updating...' : 'Update Status'}
                </button>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-6 py-3 bg-white text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-300 shadow-sm hover:shadow-md"
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
                      <div className="flex items-center p-2">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{selectedExpert.email || 'Not provided'}</span>
                        </div>
                      </div>
                      {selectedExpert.phone && (
                        <div className="flex items-center p-2">
                          <div className="flex items-center space-x-3">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{selectedExpert.phone}</span>
                          </div>
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
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
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