import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Settings, BarChart3, Star, Eye, DollarSign, BookOpen, Award, Edit3, Edit,
  Plus, Trash2, Save, X, CheckCircle, AlertCircle, TrendingUp, Calendar, MapPin,
  Briefcase, Globe, Mail, Phone, Search, MessageCircle, Shield, Bell, Video,
  Users, Building2, Badge, Target, Clock, Activity, Filter, Upload, Download
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import FileUpload from '../../components/common/FileUpload';
import Toast from '../../components/common/Toast';

const ExpertDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({
    totalServices: 0,
    totalRatings: 0,
    averageRating: 0,
    totalEarnings: 0,
    activeRequests: 0,
    profileViews: 0
  });

  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});

  // Skills management
  const [newSkill, setNewSkill] = useState({ name: '', skillLevel: 'BEGINNER' });
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  // Experience management
  const [workExperiences, setWorkExperiences] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
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

  // Service types
  const [serviceTypes, setServiceTypes] = useState([]);
  const [availableServiceTypes] = useState([
    { id: 'webinar', name: 'Webinar', icon: Video, description: 'Online seminars and presentations' },
    { id: 'workshop', name: 'Workshop', icon: Users, description: 'Interactive hands-on sessions' },
    { id: 'teaching', name: 'Teaching', icon: BookOpen, description: 'Regular teaching sessions' },
    { id: 'consulting', name: 'Consulting', icon: MessageCircle, description: 'One-on-one consultation' }
  ]);

  // College search and contact
  const [collegeSearchQuery, setCollegeSearchQuery] = useState('');
  const [collegeSearchResults, setCollegeSearchResults] = useState([]);
  const [collegePosts, setCollegePosts] = useState([]);

  // Ratings and reviews
  const [ratings, setRatings] = useState([]);
  const [trustScore, setTrustScore] = useState(0);

  useEffect(() => {
    fetchProfile();
    fetchWorkExperiences();
    fetchStats();
    fetchCollegePosts();
    fetchRatings();
  }, []);

  // Update service types when profile changes
  useEffect(() => {
    fetchServiceTypes();
  }, [profile?.availableFor]);

  const fetchProfile = async () => {
    try {
      const response = await api.getExpertProfile();
      console.log('fetchProfile response:', response);
      console.log('Profile picture in response:', response?.profilePicture);
      console.log('User data in response:', response?.user);
      console.log('Phone number in response:', response?.user?.phone);
      console.log('Full name in response:', response?.user?.fullName);
      console.log('Job title in response:', response?.jobTitle);
      console.log('Primary expertise in response:', response?.primaryExpertise);
      console.log('Experience in response:', response?.experience);
      setProfile(response);
      
      // Map the response data to the editedProfile structure
      setEditedProfile({
        ...response,
        fullName: response?.user?.fullName || '',
        phone: response?.user?.phone || '',
        jobTitle: response?.jobTitle || '', // Job Title remains as jobTitle
        primaryExpertise: response?.primaryExpertise || '', // Domain/Expertise maps to primaryExpertise
        experience: response?.experience || '',
        location: response?.location || '',
        bio: response?.bio || '',
        hourlyRate: response?.hourlyRate || '',
        // Removed isAvailable since it's not in the database schema
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setToast({ type: 'error', message: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkExperiences = async () => {
    try {
      const response = await api.getWorkExperiences();
      setWorkExperiences(response);
    } catch (error) {
      console.error('Error fetching work experiences:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.getExpertDashboardStats();
      setStats(response || {
        totalServices: 0,
        totalRatings: 0,
        averageRating: 0,
        totalEarnings: 0,
        activeRequests: 0,
        profileViews: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Keep default values on error
    }
  };

  const fetchServiceTypes = async () => {
    try {
      // Service types are loaded from the profile's availableFor field
      // This will be set when the profile is fetched
      if (profile?.availableFor) {
        const selectedTypes = availableServiceTypes.filter(ast => 
          profile.availableFor.includes(ast.name)
        ).map(ast => ({ id: ast.id, name: ast.name }));
        setServiceTypes(selectedTypes);
      } else {
        setServiceTypes([]);
      }
    } catch (error) {
      console.error('Error processing service types:', error);
      setServiceTypes([]);
    }
  };

  const fetchCollegePosts = async () => {
    try {
      // For now, we'll use mock data since the backend endpoints might not exist yet
      setCollegePosts([]);
    } catch (error) {
      console.error('Error fetching college posts:', error);
    }
  };

  const fetchRatings = async () => {
    try {
      // For now, we'll use mock data since the backend endpoints might not exist yet
      setRatings([]);
      setTrustScore(0);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  // Profile management functions
  const handleProfileUpdate = async () => {
    try {
      const response = await api.updateExpertProfile(editedProfile);
      setProfile(response);
      setIsEditingProfile(false);
      showToast('success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('error', 'Failed to update profile');
    }
  };

  // Skills management functions
  const handleAddSkill = async () => {
    if (!newSkill.name.trim()) {
      showToast('error', 'Please enter a skill name');
      return;
    }

    try {
      const skillData = {
        skillName: newSkill.name,
        skillLevel: newSkill.skillLevel
      };
      await api.addExpertSkill(skillData);
      await fetchProfile(); // Refresh profile to get updated skills
      setNewSkill({ name: '', skillLevel: 'BEGINNER' });
      setIsAddingSkill(false);
      showToast('success', 'Skill added successfully!');
    } catch (error) {
      console.error('Error adding skill:', error);
      showToast('error', 'Failed to add skill');
    }
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      await api.removeExpertSkill(skillId);
      await fetchProfile(); // Refresh profile to get updated skills
      showToast('success', 'Skill deleted successfully!');
    } catch (error) {
      console.error('Error deleting skill:', error);
      showToast('error', 'Failed to delete skill');
    }
  };

  // Experience management functions
  const handleAddExperience = async () => {
    if (!newExperience.jobTitle.trim() || !newExperience.company.trim() || !newExperience.startDate) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    try {
      const formattedData = {
        ...newExperience,
        location: newExperience.location.trim() || undefined,
        endDate: newExperience.isCurrent ? undefined : newExperience.endDate || undefined,
        description: newExperience.description.trim() || undefined,
        skills: newExperience.skills.trim() 
          ? newExperience.skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0)
          : undefined,
        achievements: newExperience.achievements.trim() || undefined
      };

      await api.addWorkExperience(formattedData);
      await fetchWorkExperiences();
      setNewExperience({
        jobTitle: '', company: '', location: '', startDate: '', endDate: '',
        isCurrent: false, description: '', skills: '', achievements: ''
      });
      setShowAddForm(false);
      showToast('success', 'Experience added successfully!');
    } catch (error) {
      console.error('Error adding experience:', error);
      showToast('error', 'Failed to add experience');
    }
  };

  const handleUpdateExperience = async () => {
    if (editingExperience && editingExperience.jobTitle?.trim() && editingExperience.company?.trim()) {
      try {
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

        await api.updateWorkExperience(editingExperience.id, formattedData);
        await fetchWorkExperiences();
        setEditingExperience(null);
        showToast('success', 'Experience updated successfully!');
      } catch (error) {
        console.error('Error updating experience:', error);
        showToast('error', 'Failed to update experience');
      }
    }
  };

  const handleDeleteExperience = async (experienceId) => {
    try {
      await api.removeWorkExperience(experienceId);
      await fetchWorkExperiences();
      showToast('success', 'Experience deleted successfully!');
    } catch (error) {
      console.error('Error deleting experience:', error);
      showToast('error', 'Failed to delete experience');
    }
  };

  // Service type management
  const handleServiceTypeToggle = async (serviceTypeId) => {
    try {
      const isSelected = serviceTypes.some(st => st.id === serviceTypeId);
      let updatedServiceTypes;
      
      if (isSelected) {
        // Remove service type
        updatedServiceTypes = serviceTypes.filter(st => st.id !== serviceTypeId);
      } else {
        // Add service type
        const serviceType = availableServiceTypes.find(ast => ast.id === serviceTypeId);
        updatedServiceTypes = [...serviceTypes, { id: serviceTypeId, name: serviceType.name }];
      }
      
      // Update the profile with selected service types
      await api.updateExpertProfile({
        availableFor: updatedServiceTypes.map(st => st.name)
      });
      
      setServiceTypes(updatedServiceTypes);
      showToast('success', `Service type ${isSelected ? 'removed' : 'added'} successfully!`);
    } catch (error) {
      console.error('Error updating service type:', error);
      showToast('error', 'Failed to update service type');
    }
  };

  // College search and contact
  const handleCollegeSearch = async () => {
    if (!collegeSearchQuery.trim()) return;
    
    try {
      const response = await api.get(`/colleges/search?q=${encodeURIComponent(collegeSearchQuery)}`);
      setCollegeSearchResults(response.data);
    } catch (error) {
      console.error('Error searching colleges:', error);
      showToast('error', 'Failed to search colleges');
    }
  };

  const handleContactCollege = async (collegeId) => {
    try {
      await api.post(`/experts/contact-college/${collegeId}`);
      showToast('success', 'Contact request sent successfully!');
    } catch (error) {
      console.error('Error contacting college:', error);
      showToast('error', 'Failed to send contact request');
    }
  };

  const handleRequestRating = async (collegeId) => {
    try {
      await api.post(`/experts/request-rating/${collegeId}`);
      showToast('success', 'Rating request sent successfully!');
    } catch (error) {
      console.error('Error requesting rating:', error);
      showToast('error', 'Failed to send rating request');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, change, color = "blue" }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          {change && (
            <p className="text-sm text-green-600 flex items-center mt-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  );

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isActive
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {(() => {
                  console.log('Header render - profile?.profilePicture:', profile?.profilePicture);
                  return profile?.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover"
                      onError={(e) => {
                        console.error('Profile picture failed to load:', profile.profilePicture);
                        console.log('Current profile state:', profile);
                      }}
                      onLoad={() => {
                        console.log('Profile picture loaded successfully:', profile.profilePicture);
                      }}
                    />
                  ) : (
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                  );
                })()}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Welcome back, {profile?.fullName || user?.email}
                </h1>
                <p className="text-sm text-gray-500">Expert Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {trustScore > 0 && (
                <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Trust Score: {trustScore}%
                  </span>
                </div>
              )}
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-lg shadow-sm">
          <TabButton
            id="overview"
            label="Overview"
            icon={BarChart3}
            isActive={activeTab === 'overview'}
            onClick={setActiveTab}
          />
          <TabButton
            id="profile"
            label="Profile"
            icon={User}
            isActive={activeTab === 'profile'}
            onClick={setActiveTab}
          />
          <TabButton
            id="experience"
            label="Experience"
            icon={Briefcase}
            isActive={activeTab === 'experience'}
            onClick={setActiveTab}
          />
          <TabButton
            id="services"
            label="Service Types"
            icon={Settings}
            isActive={activeTab === 'services'}
            onClick={setActiveTab}
          />
          <TabButton
            id="colleges"
            label="College Posts"
            icon={Building2}
            isActive={activeTab === 'colleges'}
            onClick={setActiveTab}
          />
          <TabButton
            id="ratings"
            label="Ratings & Reviews"
            icon={Star}
            isActive={activeTab === 'ratings'}
            onClick={setActiveTab}
          />
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={Eye}
                title="Profile Views"
                value={stats.profileViews || 0}
                change="+12% this week"
                color="blue"
              />
              <StatCard
                icon={BookOpen}
                title="Total Services"
                value={stats.totalServices || 0}
                change="+3 this month"
                color="green"
              />
              <StatCard
                icon={Star}
                title="Average Rating"
                value={(stats.averageRating || 0).toFixed(1)}
                change={`${stats.totalRatings || 0} reviews`}
                color="yellow"
              />
              <StatCard
                icon={DollarSign}
                title="Total Earnings"
                value={`$${(stats.totalEarnings || 0).toLocaleString()}`}
                change="+15% this month"
                color="purple"
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit3 className="h-6 w-6 text-blue-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Update Profile</p>
                    <p className="text-sm text-gray-500">Keep your information current</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('colleges')}
                  className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Search className="h-6 w-6 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Find Opportunities</p>
                    <p className="text-sm text-gray-500">Search college posts</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Settings className="h-6 w-6 text-purple-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Manage Services</p>
                    <p className="text-sm text-gray-500">Update service offerings</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New message from MIT College</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Star className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Received 5-star rating</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Eye className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Profile viewed 15 times</p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>{isEditingProfile ? 'Cancel' : 'Edit Profile'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Picture */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Profile Picture</h3>
                  <FileUpload
                    type="image"
                    currentFile={profile?.profilePicture}
                    onFileSelect={async (file) => {
                      try {
                        console.log('Uploading file:', file);
                        const response = await api.uploadProfilePicture(file);
                        console.log('Upload response:', response);
                        
                        // Update profile state immediately
                        setProfile(prevProfile => ({ 
                          ...prevProfile, 
                          profilePicture: response.profilePicture 
                        }));
                        
                        // Also refresh the complete profile from server to ensure consistency
                        await fetchProfile();
                        
                        // Debug: Wait a bit and log the updated profile
                        setTimeout(() => {
                          console.log('Profile after upload and refresh (delayed):', profile);
                        }, 100);
                        
                        showToast('success', 'Profile picture updated successfully!');
                      } catch (error) {
                        console.error('Error uploading profile picture:', error);
                        console.error('Error details:', error.message);
                        showToast('error', `Failed to upload profile picture: ${error.message}`);
                      }
                    }}
                    onRemove={async () => {
                      try {
                        console.log('Removing profile picture...');
                        await api.removeProfilePicture();
                        console.log('Profile picture removed successfully');
                        
                        // Update profile state immediately
                        setProfile(prevProfile => ({ 
                          ...prevProfile, 
                          profilePicture: null 
                        }));
                        
                        // Also refresh the complete profile from server
                        await fetchProfile();
                        
                        showToast('success', 'Profile picture removed successfully!');
                      } catch (error) {
                        console.error('Error removing profile picture:', error);
                        console.error('Error details:', error.message);
                        showToast('error', `Failed to remove profile picture: ${error.message}`);
                      }
                    }}
                    accept="image/*"
                    maxSize={5}
                    className="w-full"
                  />
                </div>

                {/* Resume Upload */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Resume</h3>
                  <FileUpload
                    type="document"
                    currentFile={profile?.resumeUrl}
                    onFileSelect={async (file) => {
                      try {
                        const response = await api.uploadResume(file);
                        setProfile({ ...profile, resumeUrl: response.resumeUrl });
                        showToast('success', 'Resume updated successfully!');
                      } catch (error) {
                        console.error('Error uploading resume:', error);
                        showToast('error', 'Failed to upload resume');
                      }
                    }}
                    onRemove={async () => {
                      try {
                        console.log('Removing resume...');
                        await api.removeResume();
                        console.log('Resume removed successfully');
                        setProfile({ ...profile, resumeUrl: null });
                        showToast('success', 'Resume removed successfully!');
                      } catch (error) {
                        console.error('Error removing resume:', error);
                        console.error('Error details:', error.message);
                        showToast('error', `Failed to remove resume: ${error.message}`);
                      }
                    }}
                    accept=".pdf,.doc,.docx"
                    maxSize={10}
                    className="w-full"
                  />
                  {profile?.resumeUrl && (
                    <a
                      href={profile.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Current Resume</span>
                    </a>
                  )}
                </div>

                {/* Profile Completion */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Profile Completion</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {(() => {
                      // Calculate profile completion percentage
                      const completionFields = [
                        { field: 'fullName', value: profile?.user?.fullName, label: 'Full Name' },
                        { field: 'phone', value: profile?.user?.phone, label: 'Phone Number' },
                        { field: 'jobTitle', value: profile?.jobTitle, label: 'Job Title/Domain' },
                        { field: 'company', value: profile?.company, label: 'Company' },
                        { field: 'experience', value: profile?.experience, label: 'Years of Experience' },
                        { field: 'location', value: profile?.location, label: 'Location' },
                        { field: 'bio', value: profile?.bio, label: 'Bio' },
                        { field: 'primaryExpertise', value: profile?.primaryExpertise, label: 'Primary Expertise' },
                        { field: 'hourlyRate', value: profile?.hourlyRate, label: 'Hourly Rate' },
                        { field: 'profilePicture', value: profile?.profilePicture, label: 'Profile Picture' },
                        { field: 'resumeUrl', value: profile?.resumeUrl, label: 'Resume' },
                        { field: 'skills', value: profile?.expertskill?.length >= 3, label: 'At least 3 Skills' },
                        { field: 'workExperience', value: workExperiences?.length >= 1, label: 'At least 1 Work Experience' },
                      ];

                      const completedFields = completionFields.filter(field => {
                        if (typeof field.value === 'boolean') return field.value;
                        return field.value && field.value.toString().trim() !== '';
                      });

                      const completionPercentage = Math.round((completedFields.length / completionFields.length) * 100);
                      const missingFields = completionFields.filter(field => {
                        if (typeof field.value === 'boolean') return !field.value;
                        return !field.value || field.value.toString().trim() === '';
                      });

                      return (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Profile Strength</span>
                            <span className={`text-sm font-semibold ${
                              completionPercentage === 100 ? 'text-green-600' : 
                              completionPercentage >= 80 ? 'text-blue-600' : 
                              'text-orange-600'
                            }`}>
                              {completionPercentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                completionPercentage === 100 ? 'bg-green-600' : 
                                completionPercentage >= 80 ? 'bg-blue-600' : 
                                'bg-orange-600'
                              }`}
                              style={{ width: `${completionPercentage}%` }}
                            ></div>
                          </div>
                          <div className="mt-3">
                            {completionPercentage === 100 ? (
                              <p className="text-xs text-green-600 font-medium">
                                Profile Complete! Your profile is fully optimized for visibility.
                              </p>
                            ) : (
                              <div className="space-y-1">
                                <p className="text-xs text-gray-600">
                                  Missing fields to reach 100%:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {missingFields.slice(0, 3).map((field, index) => (
                                    <span key={index} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                      {field.label}
                                    </span>
                                  ))}
                                  {missingFields.length > 3 && (
                                    <span className="text-xs text-gray-500">
                                      +{missingFields.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={(() => {
                      const fullNameValue = isEditingProfile ? editedProfile.fullName || '' : profile?.user?.fullName || '';
                      console.log('Full Name input render - isEditingProfile:', isEditingProfile);
                      console.log('Full Name input render - editedProfile.fullName:', editedProfile.fullName);
                      console.log('Full Name input render - profile?.user?.fullName:', profile?.user?.fullName);
                      console.log('Full Name input render - final value:', fullNameValue);
                      return fullNameValue;
                    })()}
                    onChange={(e) => setEditedProfile({ ...editedProfile, fullName: e.target.value })}
                    disabled={!isEditingProfile}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={(() => {
                      const phoneValue = isEditingProfile ? editedProfile.phone || '' : profile?.user?.phone || '';
                      console.log('Phone input render - isEditingProfile:', isEditingProfile);
                      console.log('Phone input render - editedProfile.phone:', editedProfile.phone);
                      console.log('Phone input render - profile?.user?.phone:', profile?.user?.phone);
                      console.log('Phone input render - final value:', phoneValue);
                      return phoneValue;
                    })()}
                    onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                    disabled={!isEditingProfile}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={isEditingProfile ? editedProfile.jobTitle || '' : profile?.jobTitle || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, jobTitle: e.target.value })}
                    disabled={!isEditingProfile}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    placeholder="e.g., Software Engineer, Marketing Manager, Data Scientist"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={isEditingProfile ? editedProfile.location || '' : profile?.location || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                    disabled={!isEditingProfile}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Domain/Expertise</label>
                  <input
                    type="text"
                    value={(() => {
                      const expertiseValue = isEditingProfile ? editedProfile.primaryExpertise || '' : profile?.primaryExpertise || '';
                      console.log('Domain/Expertise input render - isEditingProfile:', isEditingProfile);
                      console.log('Domain/Expertise input render - editedProfile.primaryExpertise:', editedProfile.primaryExpertise);
                      console.log('Domain/Expertise input render - profile?.primaryExpertise:', profile?.primaryExpertise);
                      console.log('Domain/Expertise input render - final value:', expertiseValue);
                      return expertiseValue;
                    })()}
                    onChange={(e) => setEditedProfile({ ...editedProfile, primaryExpertise: e.target.value })}
                    disabled={!isEditingProfile}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    placeholder="e.g., Full Stack Development, Machine Learning, Digital Marketing"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={isEditingProfile ? editedProfile.bio || '' : profile?.bio || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                    disabled={!isEditingProfile}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    placeholder="Tell us about yourself and your expertise..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                  <input
                    type="text"
                    value={(() => {
                      const experienceValue = isEditingProfile ? editedProfile.experience || '' : profile?.experience || '';
                      console.log('Years of Experience input render - isEditingProfile:', isEditingProfile);
                      console.log('Years of Experience input render - editedProfile.experience:', editedProfile.experience);
                      console.log('Years of Experience input render - profile?.experience:', profile?.experience);
                      console.log('Years of Experience input render - final value:', experienceValue);
                      return experienceValue;
                    })()}
                    onChange={(e) => setEditedProfile({ ...editedProfile, experience: e.target.value })}
                    disabled={!isEditingProfile}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (₹)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">₹</span>
                    </div>
                    <input
                      type="number"
                      value={isEditingProfile ? editedProfile.hourlyRate || '' : profile?.hourlyRate || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, hourlyRate: parseFloat(e.target.value) })}
                      disabled={!isEditingProfile}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      placeholder="1500"
                    />
                  </div>
                </div>

                {/* Removed "Available for new opportunities" checkbox as isAvailable field doesn't exist in database schema */}
              </div>

              {isEditingProfile && (
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setIsEditingProfile(false);
                      setEditedProfile(profile);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProfileUpdate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
                <button
                  onClick={() => setIsAddingSkill(true)}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Skill</span>
                </button>
              </div>

              {/* Add Skill Form */}
              {isAddingSkill && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        placeholder="Enter skill name"
                        value={newSkill.name}
                        onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <select
                        value={newSkill.skillLevel}
                        onChange={(e) => setNewSkill({ ...newSkill, skillLevel: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                        <option value="EXPERT">Expert</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      onClick={() => {
                        setIsAddingSkill(false);
                        setNewSkill({ name: '', skillLevel: 'BEGINNER' });
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddSkill}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Skill
                    </button>
                  </div>
                </div>
              )}

              {/* Skills List */}
              <div className="space-y-3">
                {profile?.expertskill && profile.expertskill.length > 0 ? (
                  profile.expertskill.map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Award className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{skill.skillName}</p>
                          <p className="text-sm text-gray-500 capitalize">{skill.skillLevel.toLowerCase()}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No skills added yet. Add your first skill above!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Experience Tab */}
        {activeTab === 'experience' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Work Experience</h2>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Experience</span>
                </button>
              </div>

              {/* Add Experience Form */}
              {showAddForm && (
                <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-4">Add New Experience</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                      <input
                        type="text"
                        name="jobTitle"
                        value={newExperience.jobTitle}
                        onChange={(e) => setNewExperience({ ...newExperience, jobTitle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                      <input
                        type="text"
                        name="company"
                        value={newExperience.company}
                        onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={newExperience.location}
                        onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
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
                        onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        value={newExperience.endDate}
                        onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
                        disabled={newExperience.isCurrent}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isCurrent"
                        checked={newExperience.isCurrent}
                        onChange={(e) => setNewExperience({ ...newExperience, isCurrent: e.target.checked })}
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
                      onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
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
                      onChange={(e) => setNewExperience({ ...newExperience, skills: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Python, Machine Learning, Data Analysis"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Key Achievements</label>
                    <textarea
                      name="achievements"
                      value={newExperience.achievements}
                      onChange={(e) => setNewExperience({ ...newExperience, achievements: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Notable accomplishments in this role..."
                    />
                  </div>
                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setNewExperience({
                          jobTitle: '', company: '', location: '', startDate: '', endDate: '',
                          isCurrent: false, description: '', skills: '', achievements: ''
                        });
                      }}
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
                                onChange={(e) => setEditingExperience({ ...editingExperience, jobTitle: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                              <input
                                type="text"
                                name="company"
                                value={editingExperience.company || ''}
                                onChange={(e) => setEditingExperience({ ...editingExperience, company: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                              <input
                                type="text"
                                name="location"
                                value={editingExperience.location || ''}
                                onChange={(e) => setEditingExperience({ ...editingExperience, location: e.target.value })}
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
                                onChange={(e) => setEditingExperience({ ...editingExperience, startDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                              <input
                                type="date"
                                name="endDate"
                                value={editingExperience.endDate ? editingExperience.endDate.split('T')[0] : ''}
                                onChange={(e) => setEditingExperience({ ...editingExperience, endDate: e.target.value })}
                                disabled={editingExperience.isCurrent}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                              />
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                name="isCurrent"
                                checked={editingExperience.isCurrent || false}
                                onChange={(e) => setEditingExperience({ ...editingExperience, isCurrent: e.target.checked })}
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
                              onChange={(e) => setEditingExperience({ ...editingExperience, description: e.target.value })}
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
                              onChange={(e) => setEditingExperience({ ...editingExperience, skills: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g., Python, Machine Learning, Data Analysis"
                            />
                          </div>
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Key Achievements</label>
                            <textarea
                              name="achievements"
                              value={editingExperience.achievements || ''}
                              onChange={(e) => setEditingExperience({ ...editingExperience, achievements: e.target.value })}
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
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{experience.jobTitle}</h3>
                                {experience.isCurrent && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                    Current
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center space-x-1">
                                  <Building2 className="h-4 w-4" />
                                  <span>{experience.company}</span>
                                </div>
                                {experience.location && (
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{experience.location}</span>
                                  </div>
                                )}
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {formatDate(experience.startDate)} - {
                                      experience.isCurrent ? 'Present' : formatDate(experience.endDate)
                                    }
                                  </span>
                                </div>
                              </div>
                              {experience.description && (
                                <p className="text-gray-700 mb-3">{experience.description}</p>
                              )}
                              {experience.skills && Array.isArray(experience.skills) && experience.skills.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-sm font-medium text-gray-700 mb-2">Skills Used:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {experience.skills.map((skill, index) => (
                                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {experience.achievements && (
                                <div className="mb-3">
                                  <p className="text-sm font-medium text-gray-700 mb-1">Key Achievements:</p>
                                  <p className="text-sm text-gray-600">{experience.achievements}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => setEditingExperience(experience)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteExperience(experience.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Briefcase className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No work experience added yet</h3>
                    <p className="text-gray-500 mb-4">Add your work experience to showcase your professional background</p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Your First Experience</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Service Types Tab */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Service Types</h2>
              <p className="text-gray-600 mb-6">Select the types of services you offer to colleges and students.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableServiceTypes.map((serviceType) => {
                  const Icon = serviceType.icon;
                  const isSelected = serviceTypes.some(st => st.id === serviceType.id);
                  
                  return (
                    <div
                      key={serviceType.id}
                      className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleServiceTypeToggle(serviceType.id)}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-3 rounded-lg ${
                          isSelected ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Icon className={`h-6 w-6 ${
                            isSelected ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold ${
                            isSelected ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {serviceType.name}
                          </h3>
                          {isSelected && (
                            <div className="flex items-center space-x-1 mt-1">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-600">Selected</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{serviceType.description}</p>
                    </div>
                  );
                })}
              </div>

              {serviceTypes.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-medium text-gray-900 mb-4">Your Selected Services</h3>
                  <div className="flex flex-wrap gap-3">
                    {serviceTypes.map((serviceType) => {
                      const availableType = availableServiceTypes.find(ast => ast.id === serviceType.id);
                      const Icon = availableType?.icon || BookOpen;
                      
                      return (
                        <div key={serviceType.id} className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
                          <Icon className="h-4 w-4" />
                          <span className="font-medium">{availableType?.name || serviceType.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* College Posts Tab */}
        {activeTab === 'colleges' && (
          <div className="space-y-6">
            {/* Search Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Search College Posts</h2>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search for college posts, requirements, or opportunities..."
                    value={collegeSearchQuery}
                    onChange={(e) => setCollegeSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleCollegeSearch()}
                  />
                </div>
                <button
                  onClick={handleCollegeSearch}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Search className="h-5 w-5" />
                  <span>Search</span>
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Filter className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* College Posts */}
            <div className="space-y-4">
              {collegePosts && collegePosts.length > 0 ? (
                collegePosts.map((post) => (
                  <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Building2 className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{post.college?.name}</h3>
                            <p className="text-sm text-gray-500">{post.college?.location}</p>
                          </div>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-2">{post.title}</h4>
                        <p className="text-gray-600 mb-4">{post.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Posted {formatDate(post.createdAt)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>Budget: ${(post.budget || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Duration: {post.duration}</span>
                          </div>
                        </div>
                        {post.requiredSkills && post.requiredSkills.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Required Skills:</p>
                            <div className="flex flex-wrap gap-2">
                              {post.requiredSkills.map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col space-y-2 ml-6">
                        <button
                          onClick={() => handleContactCollege(post.college?.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>Contact</span>
                        </button>
                        <button
                          onClick={() => handleRequestRating(post.college?.id)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                        >
                          <Star className="h-4 w-4" />
                          <span>Request Rating</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                  <p className="text-gray-500">Try searching for specific skills, topics, or college names</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ratings Tab */}
        {activeTab === 'ratings' && (
          <div className="space-y-6">
            {/* Trust Badge */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Trust Badge & Ratings</h2>
                {trustScore >= 80 && (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 rounded-lg">
                    <Badge className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">Verified Expert</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                    <span className="text-2xl font-bold text-blue-600">{trustScore}%</span>
                  </div>
                  <h3 className="font-medium text-gray-900">Trust Score</h3>
                  <p className="text-sm text-gray-500">Based on ratings and reviews</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
                    <Star className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">{(stats.averageRating || 0).toFixed(1)}</h3>
                  <p className="text-sm text-gray-500">Average Rating</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                    <span className="text-2xl font-bold text-green-600">{stats.totalRatings || 0}</span>
                  </div>
                  <h3 className="font-medium text-gray-900">Total Reviews</h3>
                  <p className="text-sm text-gray-500">From colleges</p>
                </div>
              </div>
            </div>

            {/* Ratings List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Reviews</h3>
              <div className="space-y-4">
                {ratings && ratings.length > 0 ? (
                  ratings.map((rating) => (
                    <div key={rating.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-gray-100 rounded-full">
                              <Building2 className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{rating.college?.name}</h4>
                              <p className="text-sm text-gray-500">{formatDate(rating.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < rating.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-sm font-medium text-gray-700">({rating.rating}/5)</span>
                          </div>
                          {rating.review && (
                            <p className="text-gray-700">{rating.review}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Star className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                    <p className="text-gray-500">Complete some services to start receiving reviews from colleges</p>
                  </div>
                )}
              </div>
      </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          toast={{ ...toast, show: true }}
          hideToast={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ExpertDashboard;