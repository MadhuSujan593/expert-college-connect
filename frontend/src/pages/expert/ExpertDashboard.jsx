import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Settings, 
  BarChart3, 
  Star, 
  Eye, 
  DollarSign, 
  BookOpen, 
  Award, 
  Edit3, 
  Edit,
  Plus, 
  Trash2, 
  Save,
  X,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  MapPin,
  Briefcase,
  Globe,
  Mail,
  Phone
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../utils/api';
import Toast from '../../components/common/Toast';
import FileUpload from '../../components/common/FileUpload';

const ExpertDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [workExperiences, setWorkExperiences] = useState([]);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
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
      const [profileData, statsData, workExpData] = await Promise.all([
        apiService.getExpertProfile(),
        apiService.getExpertDashboardStats(),
        apiService.getWorkExperiences(),
      ]);
      setProfile(profileData);
      setStats(statsData);
      setWorkExperiences(workExpData);
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
      const updatedProfile = await apiService.updateExpertProfile(profileForm);
      setProfile(updatedProfile);
      setEditingProfile(false);
      showToast('Profile updated successfully!', 'success');
      // Refresh stats as profile completeness might have changed
      const statsData = await apiService.getExpertDashboardStats();
      setStats(statsData);
    } catch (error) {
      showToast('Failed to update profile', 'error');
      console.error('Profile update error:', error);
    }
  };

  const handleSkillAdd = async (skillData) => {
    try {
      await apiService.addExpertSkill(skillData);
      await fetchDashboardData(); // Refresh data
      showToast('Skill added successfully!', 'success');
    } catch (error) {
      showToast('Failed to add skill', 'error');
      console.error('Skill add error:', error);
    }
  };

  const handleSkillRemove = async (skillId) => {
    try {
      await apiService.removeExpertSkill(skillId);
      await fetchDashboardData(); // Refresh data
      showToast('Skill removed successfully!', 'success');
    } catch (error) {
      showToast('Failed to remove skill', 'error');
      console.error('Skill remove error:', error);
    }
  };

  const handleProfilePictureUpload = async (file) => {
    try {
      setUploadingProfilePic(true);
      const response = await apiService.uploadProfilePicture(file);
      showToast('Profile picture uploaded successfully!', 'success');
      await fetchDashboardData(); // Refresh data
    } catch (error) {
      showToast('Failed to upload profile picture', 'error');
      console.error('Profile picture upload error:', error);
    } finally {
      setUploadingProfilePic(false);
    }
  };

  const handleResumeUpload = async (file) => {
    try {
      setUploadingResume(true);
      const response = await apiService.uploadResume(file);
      showToast('Resume uploaded successfully!', 'success');
      await fetchDashboardData(); // Refresh data
    } catch (error) {
      showToast('Failed to upload resume', 'error');
      console.error('Resume upload error:', error);
    } finally {
      setUploadingResume(false);
    }
  };

  const handleWorkExperienceAdd = async (experienceData) => {
    try {
      await apiService.addWorkExperience(experienceData);
      await fetchDashboardData(); // Refresh data
      showToast('Work experience added successfully!', 'success');
    } catch (error) {
      showToast('Failed to add work experience', 'error');
      console.error('Work experience add error:', error);
    }
  };

  const handleWorkExperienceUpdate = async (experienceId, experienceData) => {
    try {
      await apiService.updateWorkExperience(experienceId, experienceData);
      await fetchDashboardData(); // Refresh data
      showToast('Work experience updated successfully!', 'success');
    } catch (error) {
      showToast('Failed to update work experience', 'error');
      console.error('Work experience update error:', error);
    }
  };

  const handleWorkExperienceRemove = async (experienceId) => {
    try {
      await apiService.removeWorkExperience(experienceId);
      await fetchDashboardData(); // Refresh data
      showToast('Work experience removed successfully!', 'success');
    } catch (error) {
      showToast('Failed to remove work experience', 'error');
      console.error('Work experience remove error:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
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
                Welcome back, {user?.fullName?.split(' ')[0]}!
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your expert profile and track your impact
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-full p-3 shadow-lg">
                <User className="w-6 h-6 text-blue-600" />
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
                  <p className="text-sm font-medium text-gray-600">Total Services</p>
                  <p className="text-3xl font-bold text-green-600">{stats.totalServices}</p>
                </div>
                <div className="bg-green-100 rounded-lg p-3">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {stats.activeServices} active
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {stats.averageRating.toFixed(1)}
                  </p>
                </div>
                <div className="bg-yellow-100 rounded-lg p-3">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {stats.totalRatings} reviews
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profile Views</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.profileViews}</p>
                </div>
                <div className="bg-purple-100 rounded-lg p-3">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">This month</p>
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
            <OverviewTab profile={profile} stats={stats} />
          )}
          {activeTab === 'profile' && (
            <ProfileTab 
              profile={profile}
              editingProfile={editingProfile}
              setEditingProfile={setEditingProfile}
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              onUpdate={handleProfileUpdate}
              onSkillAdd={handleSkillAdd}
              onSkillRemove={handleSkillRemove}
            />
          )}
          {activeTab === 'experience' && (
            <ExperienceTab 
              profile={profile} 
              workExperiences={workExperiences}
              onWorkExperienceAdd={handleWorkExperienceAdd}
              onWorkExperienceUpdate={handleWorkExperienceUpdate}
              onWorkExperienceRemove={handleWorkExperienceRemove}
            />
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
const OverviewTab = ({ profile, stats }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {/* Profile Summary */}
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <User className="w-5 h-5 mr-2 text-blue-600" />
        Profile Summary
      </h3>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{profile?.jobTitle}</p>
            <p className="text-gray-600 text-sm">{profile?.company}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Award className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{profile?.primaryExpertise}</p>
            <p className="text-gray-600 text-sm">{profile?.experience} experience</p>
          </div>
        </div>

        {profile?.location && (
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{profile?.location}</p>
              <p className="text-gray-600 text-sm">Location</p>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Recent Activity */}
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
        Recent Activity
      </h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Profile updated</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">New 5-star review</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Eye className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Profile viewed 15 times</p>
              <p className="text-xs text-gray-500">This week</p>
            </div>
          </div>
        </div>
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
  onUpdate,
  onSkillAdd,
  onSkillRemove 
}) => {
  const [newSkill, setNewSkill] = useState({ skillName: '', skillLevel: 'INTERMEDIATE' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = async () => {
    if (newSkill.skillName.trim()) {
      await onSkillAdd(newSkill);
      setNewSkill({ skillName: '', skillLevel: 'INTERMEDIATE' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
            {editingProfile ? (
              <input
                type="text"
                name="jobTitle"
                value={profileForm.jobTitle || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile?.jobTitle || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
            {editingProfile ? (
              <input
                type="text"
                name="company"
                value={profileForm.company || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile?.company || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
            {editingProfile ? (
              <input
                type="text"
                name="experience"
                value={profileForm.experience || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile?.experience || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            {editingProfile ? (
              <input
                type="text"
                name="location"
                value={profileForm.location || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile?.location || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate ($)</label>
            {editingProfile ? (
              <input
                type="number"
                name="hourlyRate"
                value={profileForm.hourlyRate || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">
                {profile?.hourlyRate ? `$${profile.hourlyRate}/hour` : 'Not specified'}
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
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          {editingProfile ? (
            <textarea
              name="bio"
              rows={4}
              value={profileForm.bio || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell us about your expertise and experience..."
            />
          ) : (
            <p className="text-gray-900">{profile?.bio || 'No bio provided'}</p>
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

      {/* Skills Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Skills & Expertise</h3>
        
        {/* Add New Skill */}
        <div className="flex items-end space-x-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Skill Name</label>
            <input
              type="text"
              value={newSkill.skillName}
              onChange={(e) => setNewSkill(prev => ({ ...prev, skillName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., React, Data Science, Machine Learning"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
            <select
              value={newSkill.skillLevel}
              onChange={(e) => setNewSkill(prev => ({ ...prev, skillLevel: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>
          <button
            onClick={handleAddSkill}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>

        {/* Skills List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile?.expertskill?.map((skill) => (
            <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{skill.skillName}</p>
                <p className="text-sm text-gray-600 capitalize">{skill.skillLevel.toLowerCase()}</p>
              </div>
              <button
                onClick={() => onSkillRemove(skill.id)}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {(!profile?.expertskill || profile.expertskill.length === 0) && (
          <p className="text-gray-500 text-center py-8">No skills added yet. Add your first skill above!</p>
        )}
      </div>
    </div>
  );
};

// Experience Tab Component
const ExperienceTab = ({ 
  profile, 
  workExperiences, 
  onWorkExperienceAdd, 
  onWorkExperienceUpdate, 
  onWorkExperienceRemove 
}) => {
  const [newExperience, setNewExperience] = useState({
    jobTitle: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
    skills: '',
    achievements: ''
  });
  const [editingExperience, setEditingExperience] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const formValue = type === 'checkbox' ? checked : value;
    
    if (editingExperience) {
      setEditingExperience(prev => ({ ...prev, [name]: formValue }));
    } else {
      setNewExperience(prev => ({ ...prev, [name]: formValue }));
    }
  };

  const handleAddExperience = async () => {
    // Validation
    if (!newExperience.jobTitle.trim()) {
      alert('Please enter a job title');
      return;
    }
    if (!newExperience.company.trim()) {
      alert('Please enter a company name');
      return;
    }
    if (!newExperience.startDate) {
      alert('Please select a start date');
      return;
    }
    
    if (newExperience.jobTitle.trim() && newExperience.company.trim() && newExperience.startDate) {
      // Format the data for the API
      const formattedData = {
        jobTitle: newExperience.jobTitle.trim(),
        company: newExperience.company.trim(),
        location: newExperience.location.trim() || undefined,
        startDate: newExperience.startDate,
        endDate: newExperience.isCurrent ? undefined : newExperience.endDate || undefined,
        isCurrent: newExperience.isCurrent,
        description: newExperience.description.trim() || undefined,
        skills: newExperience.skills.trim() 
          ? newExperience.skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0)
          : undefined,
        achievements: newExperience.achievements.trim() || undefined
      };

      await onWorkExperienceAdd(formattedData);
      
      setNewExperience({
        jobTitle: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: '',
        skills: '',
        achievements: ''
      });
      setShowAddForm(false);
    }
  };

  const handleUpdateExperience = async () => {
    if (editingExperience && editingExperience.jobTitle?.trim() && editingExperience.company?.trim()) {
      // Format the data for the API
      const formattedData = {
        jobTitle: editingExperience.jobTitle.trim(),
        company: editingExperience.company.trim(),
        location: editingExperience.location?.trim() || undefined,
        startDate: editingExperience.startDate,
        endDate: editingExperience.isCurrent ? undefined : editingExperience.endDate || undefined,
        isCurrent: editingExperience.isCurrent || false,
        description: editingExperience.description?.trim() || undefined,
        skills: editingExperience.skills?.trim() 
          ? (typeof editingExperience.skills === 'string' 
              ? editingExperience.skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0)
              : editingExperience.skills)
          : undefined,
        achievements: editingExperience.achievements?.trim() || undefined
      };

      await onWorkExperienceUpdate(editingExperience.id, formattedData);
      setEditingExperience(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
          Work Experience
        </h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Experience</span>
        </button>
      </div>

      {/* Add New Experience Form */}
      {showAddForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-4">Add New Experience</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
              <input
                type="text"
                name="jobTitle"
                value={newExperience.jobTitle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Senior Data Scientist"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
              <input
                type="text"
                name="company"
                value={newExperience.company}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Google Inc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={newExperience.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., San Francisco, CA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={newExperience.startDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={newExperience.endDate}
                onChange={handleInputChange}
                disabled={newExperience.isCurrent}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isCurrent"
                checked={newExperience.isCurrent}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Currently working here</label>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={newExperience.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your role and responsibilities..."
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills Used</label>
            <input
              type="text"
              name="skills"
              value={newExperience.skills}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Python, Machine Learning, Data Analysis"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Key Achievements</label>
            <textarea
              name="achievements"
              value={newExperience.achievements}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notable accomplishments in this role..."
            />
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddExperience}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Experience
            </button>
          </div>
        </div>
      )}

      {/* Experience List */}
      <div className="space-y-4">
        {workExperiences && workExperiences.length > 0 ? (
          workExperiences.map((experience) => (
            <div key={experience.id} className="border border-gray-200 rounded-lg p-4">
              {editingExperience && editingExperience.id === experience.id ? (
                // Edit form with all fields
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 mb-4">Edit Experience</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                      <input
                        type="text"
                        name="jobTitle"
                        value={editingExperience.jobTitle || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                      <input
                        type="text"
                        name="company"
                        value={editingExperience.company || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={editingExperience.location || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., San Francisco, CA"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                      <input
                        type="date"
                        name="startDate"
                        value={editingExperience.startDate ? editingExperience.startDate.split('T')[0] : ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        value={editingExperience.endDate ? editingExperience.endDate.split('T')[0] : ''}
                        onChange={handleInputChange}
                        disabled={editingExperience.isCurrent}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isCurrent"
                        checked={editingExperience.isCurrent || false}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">Currently working here</label>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={editingExperience.description || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe your role and responsibilities..."
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Skills Used</label>
                    <input
                      type="text"
                      name="skills"
                      value={
                        Array.isArray(editingExperience.skills) 
                          ? editingExperience.skills.join(', ')
                          : typeof editingExperience.skills === 'string'
                          ? editingExperience.skills
                          : ''
                      }
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Python, Machine Learning, Data Analysis"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Key Achievements</label>
                    <textarea
                      name="achievements"
                      value={editingExperience.achievements || ''}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Notable accomplishments in this role..."
                    />
                  </div>
                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      onClick={() => setEditingExperience(null)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateExperience}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                // Display view
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">{experience.jobTitle}</h4>
                      <p className="text-blue-600 font-medium">{experience.company}</p>
                      {experience.location && (
                        <p className="text-gray-600 text-sm">{experience.location}</p>
                      )}
                      <p className="text-gray-500 text-sm mt-1">
                        {formatDate(experience.startDate)} - {experience.isCurrent ? 'Present' : formatDate(experience.endDate)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingExperience(experience)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onWorkExperienceRemove(experience.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {experience.description && (
                    <p className="text-gray-700 mt-3">{experience.description}</p>
                  )}
                  {experience.skills && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Skills:</p>
                      <p className="text-sm text-gray-600">{typeof experience.skills === 'string' ? experience.skills : experience.skills.join(', ')}</p>
                    </div>
                  )}
                  {experience.achievements && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Key Achievements:</p>
                      <p className="text-sm text-gray-600">{experience.achievements}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No work experience added yet.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Experience
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

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

export default ExpertDashboard;