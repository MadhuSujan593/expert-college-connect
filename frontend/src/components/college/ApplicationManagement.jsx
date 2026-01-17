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
  Award,
  TrendingUp
} from 'lucide-react';
import apiService from '../../utils/api';
import RequirementSelector from './RequirementSelector';
import ApplicationTable from './ApplicationTable';
import ExpertProfileModal from '../../components/common/ExpertProfileModal';
import { useAuth } from '../../contexts/AuthContext';


const ApplicationManagement = ({
  requirementId,
  onRefreshSubscription,
  mySubscription,
  showPlanLimitationModal,
  setLimitationType,
  getLimitationDetails,
  subsLoading,
  revealedExpertIds,
  setRevealedExpertIds
}) => {
  const { user } = useAuth();
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [showAllApplications, setShowAllApplications] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shortlisted: 0,
    rejected: 0
  });

  // Status management
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Profile Modal state
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  // revealedExpertIds is now passed from props

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
    // Transform the expert data to match what ExpertProfileModal expects
    // The modal expects: expert.user.fullName, expert.bio, etc.
    // The application data provides: expert.fullName, expert.expertprofile.bio, etc.

    if (!expert) return;

    const transformedExpert = {
      ...expert, // Keep original IDs etc
      user: {
        id: expert.userId || expert.id, // Fallback
        fullName: expert.fullName,
        email: expert.email,
        phone: expert.phone,
        profilePicture: expert.profilePicture // In case it's here
      },
      // Flatten expertprofile properties to the root if they exist
      ...expert.expertprofile,
      // Ensure specific fields are mapped correctly if names differ
      bio: expert.expertprofile?.bio,
      jobTitle: expert.expertprofile?.jobTitle,
      company: expert.expertprofile?.workexperience?.find(w => w.isCurrent)?.company || expert.expertprofile?.company,
      location: expert.expertprofile?.location,
      hourlyRate: expert.expertprofile?.hourlyRate,
      workexperience: expert.expertprofile?.workexperience,
      expertskill: expert.expertprofile?.expertskill,
      primaryExpertise: expert.expertprofile?.primaryExpertise,
      // Priority for profile picture: top level -> expertprofile -> user (mapped above)
      profilePicture: expert.profilePicture || expert.expertprofile?.profilePicture
    };

    setSelectedExpert(transformedExpert);
    setShowProfileModal(true);
  };

  // Close profile modal
  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedExpert(null);
  };

  const handleRevealContact = (expertId) => {
    setRevealedExpertIds(prev => new Set(prev).add(expertId));
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
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Total
                </span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.total}</h3>
              <p className="text-sm font-medium text-slate-500">Total Applications</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-600 group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.pending}</h3>
              <p className="text-sm font-medium text-slate-500">Pending Review</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.shortlisted}</h3>
              <p className="text-sm font-medium text-slate-500">Shortlisted</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                  <XCircle className="w-5 h-5" />
                </div>
                <div className="h-2 w-2 rounded-full bg-rose-400"></div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.rejected}</h3>
              <p className="text-sm font-medium text-slate-500">Rejected</p>
            </div>
          </div>

          {/* Filter Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Filter className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-700 text-sm hidden sm:inline">Filter By Requirement:</span>
            </div>
            <div className="w-full sm:w-72">
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



      {/* Expert Profile Modal */}
      <ExpertProfileModal
        isOpen={showProfileModal}
        expert={selectedExpert}
        onClose={closeProfileModal}
        apiService={apiService}
        revealedExpertIds={revealedExpertIds || new Set()}
        onRevealContact={handleRevealContact}
        mySubscription={mySubscription}
        getLimitationDetails={getLimitationDetails}
        showPlanLimitationModal={showPlanLimitationModal}
        setLimitationType={setLimitationType}
        subsLoading={subsLoading}
      />
    </div>
  );
};

export default ApplicationManagement;