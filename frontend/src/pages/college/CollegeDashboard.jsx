import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Settings, 
  BarChart3, 
  Users, 
  FileText, 
  AlertCircle, 
  Calendar, 
  TrendingUp,
  Edit3, 
  Save,
  CheckCircle,
  MapPin,
  Globe,
  Mail,
  Phone,
  Award,
  Clock,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../utils/api';
import Toast from '../../components/common/Toast';

const CollegeDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentRequirements, setRecentRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: '' });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileData, statsData, requirementsData] = await Promise.all([
        apiService.getCollegeProfile(),
        apiService.getCollegeDashboardStats(),
        apiService.getCollegeRecentRequirements(5),
      ]);
      setProfile(profileData);
      setStats(statsData);
      setRecentRequirements(requirementsData);
      setProfileForm(profileData);
    } catch (error) {
      showToast('Failed to load dashboard data', 'error');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const updatedProfile = await apiService.updateCollegeProfile(profileForm);
      setProfile(updatedProfile);
      setEditingProfile(false);
      showToast('Profile updated successfully!', 'success');
      // Refresh stats as profile completeness might have changed
      const statsData = await apiService.getCollegeDashboardStats();
      setStats(statsData);
    } catch (error) {
      showToast('Failed to update profile', 'error');
      console.error('Profile update error:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: Building2 },
    { id: 'requirements', label: 'Requirements', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {profile?.contactPersonName?.split(' ')[0] || user?.fullName?.split(' ')[0]}!
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your institution profile and connect with experts
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-full p-3 shadow-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profile Completeness</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.profileCompleteness}%</p>
                </div>
                <div className="bg-blue-100 rounded-lg p-3">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.profileCompleteness}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requirements</p>
                  <p className="text-3xl font-bold text-green-600">{stats.totalRequirements}</p>
                </div>
                <div className="bg-green-100 rounded-lg p-3">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {stats.activeRequirements} active
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Urgent Requirements</p>
                  <p className="text-3xl font-bold text-red-600">{stats.urgentRequirements}</p>
                </div>
                <div className="bg-red-100 rounded-lg p-3">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Need attention</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming Deadlines</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.upcomingDeadlines}</p>
                </div>
                <div className="bg-yellow-100 rounded-lg p-3">
                  <Calendar className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Next 7 days</p>
            </div>
          </motion.div>
        )}

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8"
        >
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <OverviewTab profile={profile} stats={stats} recentRequirements={recentRequirements} />
          )}
          {activeTab === 'profile' && (
            <ProfileTab 
              profile={profile}
              editingProfile={editingProfile}
              setEditingProfile={setEditingProfile}
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              onUpdate={handleProfileUpdate}
            />
          )}
          {activeTab === 'requirements' && (
            <RequirementsTab recentRequirements={recentRequirements} />
          )}
          {activeTab === 'settings' && (
            <SettingsTab profile={profile} />
          )}
        </motion.div>
      </div>

      {/* Toast Notification */}
      <Toast toast={toast} hideToast={hideToast} />
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ profile, stats, recentRequirements }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {/* Institution Summary */}
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Building2 className="w-5 h-5 mr-2 text-blue-600" />
        Institution Summary
      </h3>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Award className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{profile?.institutionName}</p>
            <p className="text-gray-600 text-sm capitalize">{profile?.institutionType?.toLowerCase()}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{profile?.contactPersonName}</p>
            <p className="text-gray-600 text-sm">Contact Person</p>
          </div>
        </div>

        {profile?.city && (
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {profile?.city}{profile?.state && `, ${profile.state}`}
              </p>
              <p className="text-gray-600 text-sm">{profile?.country}</p>
            </div>
          </div>
        )}

        {profile?.website && (
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <Globe className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <a 
                href={profile.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline"
              >
                {profile.website}
              </a>
              <p className="text-gray-600 text-sm">Institution Website</p>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Recent Requirements */}
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-green-600" />
        Recent Requirements
      </h3>
      <div className="space-y-4">
        {recentRequirements.length > 0 ? (
          recentRequirements.map((requirement) => (
            <div key={requirement.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{requirement.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{requirement.category}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {requirement.budget && (
                      <span className="flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" />
                        ${requirement.budget}
                      </span>
                    )}
                    {requirement.deadline && (
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(requirement.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                {requirement.isUrgent && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                    Urgent
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No requirements posted yet</p>
            <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
              Post your first requirement
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Quick Actions */}
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 lg:col-span-2">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
          <div className="text-center">
            <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Post New Requirement</p>
          </div>
        </button>
        
        <button className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
          <div className="text-center">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Browse Experts</p>
          </div>
        </button>
        
        <button className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
          <div className="text-center">
            <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">View Analytics</p>
          </div>
        </button>
      </div>
    </div>
  </div>
);

// Profile Tab Component
const ProfileTab = ({ 
  profile, 
  editingProfile, 
  setEditingProfile, 
  profileForm, 
  setProfileForm, 
  onUpdate 
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Institution Information</h3>
          <button
            onClick={() => editingProfile ? onUpdate() : setEditingProfile(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editingProfile ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            <span>{editingProfile ? 'Save Changes' : 'Edit Profile'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Institution Name</label>
            {editingProfile ? (
              <input
                type="text"
                name="institutionName"
                value={profileForm.institutionName || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile?.institutionName || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
            {editingProfile ? (
              <input
                type="text"
                name="contactPersonName"
                value={profileForm.contactPersonName || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile?.contactPersonName || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Institution Type</label>
            {editingProfile ? (
              <select
                name="institutionType"
                value={profileForm.institutionType || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Type</option>
                <option value="UNIVERSITY">University</option>
                <option value="COLLEGE">College</option>
                <option value="INSTITUTE">Institute</option>
                <option value="SCHOOL">School</option>
                <option value="OTHER">Other</option>
              </select>
            ) : (
              <p className="text-gray-900 capitalize">
                {profile?.institutionType?.toLowerCase() || 'Not specified'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            {editingProfile ? (
              <input
                type="url"
                name="website"
                value={profileForm.website || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">
                {profile?.website ? (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {profile.website}
                  </a>
                ) : (
                  'Not specified'
                )}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            {editingProfile ? (
              <input
                type="tel"
                name="phone"
                value={profileForm.phone || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile?.phone || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            {editingProfile ? (
              <input
                type="text"
                name="city"
                value={profileForm.city || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile?.city || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
            {editingProfile ? (
              <input
                type="text"
                name="state"
                value={profileForm.state || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile?.state || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            {editingProfile ? (
              <input
                type="text"
                name="country"
                value={profileForm.country || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile?.country || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
            {editingProfile ? (
              <input
                type="text"
                name="postalCode"
                value={profileForm.postalCode || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile?.postalCode || 'Not specified'}</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          {editingProfile ? (
            <textarea
              name="address"
              rows={3}
              value={profileForm.address || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Full institutional address..."
            />
          ) : (
            <p className="text-gray-900">{profile?.address || 'No address provided'}</p>
          )}
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Accreditation</label>
          {editingProfile ? (
            <textarea
              name="accreditation"
              rows={3}
              value={profileForm.accreditation || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="List your institution's accreditations and certifications..."
            />
          ) : (
            <p className="text-gray-900">{profile?.accreditation || 'No accreditation information provided'}</p>
          )}
        </div>

        {editingProfile && (
          <div className="mt-6 flex space-x-4">
            <button
              onClick={onUpdate}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={() => setEditingProfile(false)}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Requirements Tab Component (placeholder)
const RequirementsTab = ({ recentRequirements }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-gray-900">Requirements Management</h3>
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Post New Requirement
      </button>
    </div>
    <div className="text-center py-12">
      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500">Requirements management coming soon...</p>
      <p className="text-sm text-gray-400 mt-2">
        You'll be able to post, manage, and track your requirements here
      </p>
    </div>
  </div>
);

// Settings Tab Component (placeholder)
const SettingsTab = ({ profile }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
    <div className="text-center py-12">
      <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500">Settings panel coming soon...</p>
    </div>
  </div>
);

export default CollegeDashboard;