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
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
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

          {/* Statistics Dashboard - Only show when requirement is selected */}
          {selectedRequirement && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="card p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">
                    Application Statistics
                  </h2>
                  <p className="text-sm text-neutral-500">
                    {selectedRequirement.title}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="stat-card-gradient group hover:scale-105 transition-transform duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600 font-medium mb-1">Total Applications</p>
                      <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <User className="w-6 h-6 text-primary-600" />
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="stat-card-gradient group hover:scale-105 transition-transform duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600 font-medium mb-1">Pending Review</p>
                      <p className="text-2xl font-bold text-neutral-900">{stats.pending}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-warning-100 to-warning-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Clock className="w-6 h-6 text-warning-600" />
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="stat-card-gradient group hover:scale-105 transition-transform duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600 font-medium mb-1">Shortlisted</p>
                      <p className="text-2xl font-bold text-neutral-900">{stats.shortlisted}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-accent-100 to-accent-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Star className="w-6 h-6 text-accent-600" />
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="stat-card-gradient group hover:scale-105 transition-transform duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600 font-medium mb-1">Rejected</p>
                      <p className="text-2xl font-bold text-neutral-900">{stats.rejected}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-error-100 to-error-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <XCircle className="w-6 h-6 text-error-600" />
                    </div>
                  </div>
                </motion.div>
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
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="ACCEPTED">Accepted</option>
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
                  className="btn-primary flex-1"
                >
                  {submitting ? 'Updating...' : 'Update Status'}
                </button>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}



      {/* Expert Profile Modal */}
      {showProfileModal && selectedExpert && (
        <div className="modal-overlay">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="modal-content max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-50 to-accent-50 border-b border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center text-primary-700 font-bold text-xl shadow-soft">
                    {selectedExpert.fullName?.charAt(0) || 'E'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900">
                      {selectedExpert.fullName}
                    </h2>
                    <p className="text-neutral-600 font-medium">
                      {selectedExpert.expertprofile?.primaryExpertise || 'Expert'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeProfileModal}
                  className="w-10 h-10 bg-neutral-100 hover:bg-neutral-200 rounded-xl flex items-center justify-center text-neutral-600 hover:text-neutral-800 transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-8">
                {/* About */}
                {selectedExpert.expertprofile?.bio && (
                  <div className="card p-6">
                    <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      About
                    </h3>
                    <p className="text-neutral-700 leading-relaxed text-base">{selectedExpert.expertprofile.bio}</p>
                  </div>
                )}

                {/* Primary Expertise */}
                {selectedExpert.expertprofile?.primaryExpertise && (
                  <div className="card p-6">
                    <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                      Primary Expertise
                    </h3>
                    <div className="p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl border border-primary-200">
                      <p className="text-primary-800 font-semibold text-lg">
                        {selectedExpert.expertprofile.primaryExpertise.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                    </div>
                  </div>
                )}

                {/* Skills */}
                {selectedExpert.expertprofile?.expertskill && selectedExpert.expertprofile.expertskill.length > 0 && (
                  <div className="card p-6">
                    <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                      Skills & Expertise
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedExpert.expertprofile.expertskill.map(skill => (
                        <span
                          key={skill.id}
                          className="px-4 py-2 bg-gradient-to-r from-success-50 to-success-100 text-success-800 rounded-xl text-sm font-medium border border-success-200 hover:shadow-soft transition-all duration-200"
                        >
                          {skill.skillName}
                          {skill.skillLevel && (
                            <span className="ml-2 text-success-600 font-semibold">({skill.skillLevel})</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Experience */}
                {selectedExpert.expertprofile?.workexperience && selectedExpert.expertprofile.workexperience.length > 0 && (
                  <div className="card p-6">
                    <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                      <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
                      Work Experience
                    </h3>
                    <div className="space-y-6">
                      {selectedExpert.expertprofile.workexperience.map((exp, index) => (
                        <div key={exp.id} className="p-6 bg-gradient-to-r from-neutral-50 to-neutral-100 border border-neutral-200 rounded-2xl hover:shadow-soft transition-all duration-200">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="font-bold text-neutral-900 text-xl mb-1">{exp.jobTitle}</h4>
                              <p className="text-primary-600 font-semibold text-lg mb-1">{exp.company}</p>
                              {exp.location && (
                                <p className="text-neutral-600 text-sm flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {exp.location}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-neutral-600 font-medium">
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
                                <span className="inline-block px-3 py-1 bg-success-100 text-success-800 text-xs font-semibold rounded-full mt-2">
                                  Current
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {exp.description && (
                            <p className="text-neutral-700 mb-4 leading-relaxed text-base">{exp.description}</p>
                          )}
                          
                          {exp.achievements && (
                            <div className="mb-3">
                              <p className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                                <Award className="w-4 h-4 text-warning-600" />
                                Key Achievements:
                              </p>
                              <p className="text-neutral-700 text-sm leading-relaxed bg-white p-3 rounded-xl border border-neutral-200">{exp.achievements}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="card p-6">
                  <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-accent-50 to-primary-50 rounded-xl border border-accent-200">
                      <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-4 h-4 text-accent-600" />
                      </div>
                      <span className="text-sm text-neutral-700 font-medium">{selectedExpert.email}</span>
                    </div>
                    {selectedExpert.phone && (
                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-accent-50 to-primary-50 rounded-xl border border-accent-200">
                        <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
                          <Phone className="w-4 h-4 text-accent-600" />
                        </div>
                        <span className="text-sm text-neutral-700 font-medium">{selectedExpert.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resume */}
                {selectedExpert.expertprofile?.resumeUrl && (
                  <div className="card p-6">
                    <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      Documents
                    </h3>
                    <div className="space-y-3">
                      <a
                        href={selectedExpert.expertprofile.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 p-4 bg-gradient-to-r from-primary-50 to-accent-50 hover:from-primary-100 hover:to-accent-100 rounded-xl border border-primary-200 transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 bg-primary-100 group-hover:bg-primary-200 rounded-xl flex items-center justify-center transition-colors duration-200">
                          <FileText className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <span className="text-sm text-neutral-700 font-semibold">View Resume</span>
                          <p className="text-xs text-neutral-500">Click to download or view</p>
                        </div>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 border-t border-neutral-200 p-6">
              <div className="flex justify-end">
                <button
                  onClick={closeProfileModal}
                  className="btn-secondary"
                >
                  Close
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