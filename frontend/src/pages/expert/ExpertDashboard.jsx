import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Settings, BarChart3, Star, Eye, DollarSign, BookOpen, Award, Edit3, Edit,
  Plus, Trash2, Save, X, CheckCircle, AlertCircle, TrendingUp, Calendar, MapPin,
  Briefcase, Globe, Mail, Phone, Search, MessageCircle, Shield, Bell, Video,
  Users, Building2, Badge, Target, Clock, Activity, Filter, Upload, Download,
  Home, ChevronRight, Menu, Zap, TrendingDown, LogOut, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import FileUpload from '../../components/common/FileUpload';
import Toast from '../../components/common/Toast';

const ExpertDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  // Logout confirmation
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
      setProfile(response);
      
      // Map the response data to the editedProfile structure
      setEditedProfile({
        ...response,
        fullName: response?.user?.fullName || '',
        phone: response?.user?.phone || '',
        jobTitle: response?.jobTitle || '',
        primaryExpertise: response?.primaryExpertise || '',
        experience: response?.experience || '',
        location: response?.location || '',
        bio: response?.bio || '',
        hourlyRate: response?.hourlyRate || '',
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
    }
  };

  const fetchServiceTypes = async () => {
    try {
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
      setCollegePosts([]);
    } catch (error) {
      console.error('Error fetching college posts:', error);
    }
  };

  const fetchRatings = async () => {
    try {
      setRatings([]);
      setTrustScore(85); // Demo trust score
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const handleLogout = () => {
    logout();
    showToast('success', 'Logged out successfully!');
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
      await fetchProfile();
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
      await fetchProfile();
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
          skills: (() => {
            if (!editingExperience.skills) return undefined;
            
            if (Array.isArray(editingExperience.skills)) {
              return editingExperience.skills.filter(skill => skill && skill.trim().length > 0);
            }
            
            if (typeof editingExperience.skills === 'string') {
              const trimmedSkills = editingExperience.skills.trim();
              return trimmedSkills 
                ? trimmedSkills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0)
                : undefined;
            }
            
            return undefined;
          })(),
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
        updatedServiceTypes = serviceTypes.filter(st => st.id !== serviceTypeId);
      } else {
        const serviceType = availableServiceTypes.find(ast => ast.id === serviceTypeId);
        updatedServiceTypes = [...serviceTypes, { id: serviceTypeId, name: serviceType.name }];
      }
      
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-200 border-t-blue-600"></div>
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, change, color = "blue", trend = "up" }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="group bg-white rounded-2xl border border-slate-200/60 p-6 hover:border-slate-300/60 hover:shadow-lg hover:shadow-slate-900/5 transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-3">
            <div className={`p-2.5 rounded-xl ${
              color === 'blue' ? 'bg-blue-50 group-hover:bg-blue-100' :
              color === 'green' ? 'bg-emerald-50 group-hover:bg-emerald-100' :
              color === 'purple' ? 'bg-violet-50 group-hover:bg-violet-100' :
              color === 'orange' ? 'bg-orange-50 group-hover:bg-orange-100' :
              'bg-slate-50 group-hover:bg-slate-100'
            } transition-colors duration-300`}>
              <Icon className={`h-5 w-5 ${
                color === 'blue' ? 'text-blue-600' :
                color === 'green' ? 'text-emerald-600' :
                color === 'purple' ? 'text-violet-600' :
                color === 'orange' ? 'text-orange-600' :
                'text-slate-600'
              }`} />
            </div>
            <p className="text-sm font-semibold text-slate-600">{title}</p>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-2">{value}</p>
          {change && (
            <div className="flex items-center space-x-1">
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <p className={`text-sm font-medium ${
                trend === 'up' ? 'text-emerald-600' : 'text-red-500'
              }`}>
                {change}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  const SidebarItem = ({ id, label, icon: Icon, isActive, onClick }) => (
    <motion.button
      onClick={() => onClick(id)}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      className={`group flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'}`} />
      <span className="font-semibold">{label}</span>
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="ml-auto w-2 h-2 bg-white rounded-full"
        />
      )}
    </motion.button>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Modern Layout with Sidebar */}
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/60 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-slate-200/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">Dashboard</h1>
                  <p className="text-xs text-slate-500">Expert Panel</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile Section */}
            <div className="px-6 py-4 border-b border-slate-200/60">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {profile?.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt="Profile"
                      className="h-12 w-12 rounded-xl object-cover ring-2 ring-slate-100"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {profile?.user?.fullName || user?.email}
                  </p>
                  <p className="text-xs text-slate-500">Expert Account</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              <SidebarItem
                id="overview"
                label="Overview"
                icon={Home}
                isActive={activeTab === 'overview'}
                onClick={setActiveTab}
              />
              <SidebarItem
                id="profile"
                label="Profile"
                icon={User}
                isActive={activeTab === 'profile'}
                onClick={setActiveTab}
              />
              <SidebarItem
                id="experience"
                label="Experience"
                icon={Briefcase}
                isActive={activeTab === 'experience'}
                onClick={setActiveTab}
              />
              <SidebarItem
                id="services"
                label="Services"
                icon={Settings}
                isActive={activeTab === 'services'}
                onClick={setActiveTab}
              />
              <SidebarItem
                id="colleges"
                label="Opportunities"
                icon={Building2}
                isActive={activeTab === 'colleges'}
                onClick={setActiveTab}
              />
              <SidebarItem
                id="ratings"
                label="Reviews"
                icon={Star}
                isActive={activeTab === 'ratings'}
                onClick={setActiveTab}
              />
            </nav>

            {/* Trust Score */}
            {trustScore > 0 && (
              <div className="px-6 py-4 border-t border-slate-200/60">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-slate-700">Trust Score</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">{trustScore}%</span>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <div className="px-6 py-4 border-t border-slate-200/60 mt-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowLogoutConfirm(true)}
                className="group flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 text-slate-600 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5 text-slate-500 group-hover:text-red-600" />
                <span className="font-semibold">Sign Out</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="bg-white border-b border-slate-200/60 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {activeTab === 'overview' && 'Dashboard Overview'}
                    {activeTab === 'profile' && 'Profile Management'}
                    {activeTab === 'experience' && 'Work Experience'}
                    {activeTab === 'services' && 'Service Types'}
                    {activeTab === 'colleges' && 'Opportunities'}
                    {activeTab === 'ratings' && 'Reviews & Ratings'}
                  </h1>
                  <div className="flex items-center space-x-2 text-sm text-slate-500 mt-1">
                    <Home className="h-4 w-4" />
                    <ChevronRight className="h-4 w-4" />
                    <span className="capitalize">{activeTab}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    3
                  </span>
                </button>
              </div>
            </div>
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto bg-slate-50">
            <div className="p-6 space-y-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                      icon={Eye}
                      title="Profile Views"
                      value={stats.profileViews || 247}
                      change="+12% this week"
                      color="blue"
                    />
                    <StatCard
                      icon={BookOpen}
                      title="Total Services"
                      value={stats.totalServices || 8}
                      change="+3 this month"
                      color="green"
                    />
                    <StatCard
                      icon={Star}
                      title="Average Rating"
                      value={(stats.averageRating || 4.8).toFixed(1)}
                      change={`${stats.totalRatings || 23} reviews`}
                      color="purple"
                    />
                    <StatCard
                      icon={DollarSign}
                      title="This Month"
                      value={`₹${(stats.totalEarnings || 45000).toLocaleString()}`}
                      change="+18% this month"
                      color="orange"
                    />
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab('profile')}
                        className="group flex items-center space-x-4 p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl hover:from-blue-100 hover:to-blue-200/50 transition-all duration-300"
                      >
                        <div className="p-3 bg-blue-600 rounded-xl group-hover:bg-blue-700 transition-colors">
                          <Edit3 className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-slate-900">Update Profile</p>
                          <p className="text-sm text-slate-600">Keep information current</p>
                        </div>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab('colleges')}
                        className="group flex items-center space-x-4 p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl hover:from-emerald-100 hover:to-emerald-200/50 transition-all duration-300"
                      >
                        <div className="p-3 bg-emerald-600 rounded-xl group-hover:bg-emerald-700 transition-colors">
                          <Search className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-slate-900">Find Opportunities</p>
                          <p className="text-sm text-slate-600">Search college posts</p>
                        </div>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab('services')}
                        className="group flex items-center space-x-4 p-5 bg-gradient-to-br from-violet-50 to-violet-100/50 rounded-xl hover:from-violet-100 hover:to-violet-200/50 transition-all duration-300"
                      >
                        <div className="p-3 bg-violet-600 rounded-xl group-hover:bg-violet-700 transition-colors">
                          <Settings className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-slate-900">Manage Services</p>
                          <p className="text-sm text-slate-600">Update service offerings</p>
                        </div>
                      </motion.button>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6">Recent Activity</h3>
                    <div className="space-y-4">
                      <motion.div
                        whileHover={{ x: 4 }}
                        className="flex items-center space-x-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                      >
                        <div className="p-2.5 bg-blue-100 rounded-xl">
                          <MessageCircle className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">New message from MIT College</p>
                          <p className="text-xs text-slate-500">2 hours ago</p>
                        </div>
                      </motion.div>
                      <motion.div
                        whileHover={{ x: 4 }}
                        className="flex items-center space-x-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                      >
                        <div className="p-2.5 bg-emerald-100 rounded-xl">
                          <Star className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">Received 5-star rating</p>
                          <p className="text-xs text-slate-500">1 day ago</p>
                        </div>
                      </motion.div>
                      <motion.div
                        whileHover={{ x: 4 }}
                        className="flex items-center space-x-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                      >
                        <div className="p-2.5 bg-violet-100 rounded-xl">
                          <Eye className="h-4 w-4 text-violet-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">Profile viewed 15 times</p>
                          <p className="text-xs text-slate-500">2 days ago</p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Profile Header */}
                  <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-slate-900">Profile Information</h2>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                          isEditingProfile
                            ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25'
                        }`}
                      >
                        <Edit3 className="h-4 w-4" />
                        <span>{isEditingProfile ? 'Cancel' : 'Edit Profile'}</span>
                      </motion.button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Profile Picture */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-slate-900">Profile Picture</h3>
                        <FileUpload
                          type="image"
                          currentFile={profile?.profilePicture}
                          onFileSelect={async (file) => {
                            try {
                              const response = await api.uploadProfilePicture(file);
                              setProfile(prevProfile => ({ 
                                ...prevProfile, 
                                profilePicture: response.profilePicture 
                              }));
                              await fetchProfile();
                              showToast('success', 'Profile picture updated successfully!');
                            } catch (error) {
                              console.error('Error uploading profile picture:', error);
                              showToast('error', `Failed to upload profile picture: ${error.message}`);
                            }
                          }}
                          onRemove={async () => {
                            try {
                              await api.removeProfilePicture();
                              setProfile(prevProfile => ({ 
                                ...prevProfile, 
                                profilePicture: null 
                              }));
                              await fetchProfile();
                              showToast('success', 'Profile picture removed successfully!');
                            } catch (error) {
                              console.error('Error removing profile picture:', error);
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
                        <h3 className="font-semibold text-slate-900">Resume</h3>
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
                              await api.removeResume();
                              setProfile({ ...profile, resumeUrl: null });
                              showToast('success', 'Resume removed successfully!');
                            } catch (error) {
                              console.error('Error removing resume:', error);
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
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                            <span className="text-sm font-medium">Download Current Resume</span>
                          </a>
                        )}
                      </div>

                      {/* Profile Completion */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-slate-900">Profile Completion</h3>
                        <div className="bg-slate-50 rounded-xl p-4">
                          {(() => {
                            const completionFields = [
                              { field: 'fullName', value: profile?.user?.fullName, label: 'Full Name' },
                              { field: 'phone', value: profile?.user?.phone, label: 'Phone Number' },
                              { field: 'jobTitle', value: profile?.jobTitle, label: 'Job Title' },
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
                                  <span className="text-sm font-semibold text-slate-700">Profile Strength</span>
                                  <span className={`text-sm font-bold ${
                                    completionPercentage === 100 ? 'text-emerald-600' : 
                                    completionPercentage >= 80 ? 'text-blue-600' : 
                                    'text-orange-600'
                                  }`}>
                                    {completionPercentage}%
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                      completionPercentage === 100 ? 'bg-emerald-600' : 
                                      completionPercentage >= 80 ? 'bg-blue-600' : 
                                      'bg-orange-600'
                                    }`}
                                    style={{ width: `${completionPercentage}%` }}
                                  ></div>
                                </div>
                                <div className="mt-3">
                                  {completionPercentage === 100 ? (
                                    <p className="text-xs text-emerald-600 font-medium">
                                      Profile Complete! Your profile is fully optimized for visibility.
                                    </p>
                                  ) : (
                                    <div className="space-y-1">
                                      <p className="text-xs text-slate-600">
                                        Missing fields to reach 100%:
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {missingFields.slice(0, 3).map((field, index) => (
                                          <span key={index} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                            {field.label}
                                          </span>
                                        ))}
                                        {missingFields.length > 3 && (
                                          <span className="text-xs text-slate-500">
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
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={isEditingProfile ? editedProfile.fullName || '' : profile?.user?.fullName || ''}
                          onChange={(e) => setEditedProfile({ ...editedProfile, fullName: e.target.value })}
                          disabled={!isEditingProfile}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={isEditingProfile ? editedProfile.phone || '' : profile?.user?.phone || ''}
                          onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                          disabled={!isEditingProfile}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                          placeholder="Enter your phone number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Job Title</label>
                        <input
                          type="text"
                          value={isEditingProfile ? editedProfile.jobTitle || '' : profile?.jobTitle || ''}
                          onChange={(e) => setEditedProfile({ ...editedProfile, jobTitle: e.target.value })}
                          disabled={!isEditingProfile}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                          placeholder="e.g., Software Engineer, Marketing Manager"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                        <input
                          type="text"
                          value={isEditingProfile ? editedProfile.location || '' : profile?.location || ''}
                          onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                          disabled={!isEditingProfile}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                          placeholder="e.g., San Francisco, CA"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Primary Expertise</label>
                        <input
                          type="text"
                          value={isEditingProfile ? editedProfile.primaryExpertise || '' : profile?.primaryExpertise || ''}
                          onChange={(e) => setEditedProfile({ ...editedProfile, primaryExpertise: e.target.value })}
                          disabled={!isEditingProfile}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                          placeholder="e.g., Full Stack Development, Machine Learning"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Years of Experience</label>
                        <input
                          type="text"
                          value={isEditingProfile ? editedProfile.experience || '' : profile?.experience || ''}
                          onChange={(e) => setEditedProfile({ ...editedProfile, experience: e.target.value })}
                          disabled={!isEditingProfile}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                          placeholder="e.g., 5 years"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Bio</label>
                        <textarea
                          value={isEditingProfile ? editedProfile.bio || '' : profile?.bio || ''}
                          onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                          disabled={!isEditingProfile}
                          rows={4}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 transition-colors resize-none"
                          placeholder="Tell us about yourself and your expertise..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Hourly Rate (₹)</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-slate-500 text-sm">₹</span>
                          </div>
                          <input
                            type="number"
                            value={isEditingProfile ? editedProfile.hourlyRate || '' : profile?.hourlyRate || ''}
                            onChange={(e) => setEditedProfile({ ...editedProfile, hourlyRate: parseFloat(e.target.value) })}
                            disabled={!isEditingProfile}
                            className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                            placeholder="1500"
                          />
                        </div>
                      </div>
                    </div>

                    {isEditingProfile && (
                      <div className="mt-6 flex justify-end space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setIsEditingProfile(false);
                            setEditedProfile(profile);
                          }}
                          className="px-6 py-2 text-slate-700 bg-slate-200 rounded-xl hover:bg-slate-300 transition-colors font-medium"
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleProfileUpdate}
                          className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/25"
                        >
                          Save Changes
                        </motion.button>
                      </div>
                    )}
                  </div>

                  {/* Skills Section */}
                  <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-slate-900">Skills</h3>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsAddingSkill(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/25"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Skill</span>
                      </motion.button>
                    </div>

                    {/* Add Skill Form */}
                    {isAddingSkill && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 p-4 bg-slate-50 rounded-xl"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2">
                            <input
                              type="text"
                              placeholder="Enter skill name"
                              value={newSkill.name}
                              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <select
                              value={newSkill.skillLevel}
                              onChange={(e) => setNewSkill({ ...newSkill, skillLevel: e.target.value })}
                              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="BEGINNER">Beginner</option>
                              <option value="INTERMEDIATE">Intermediate</option>
                              <option value="ADVANCED">Advanced</option>
                              <option value="EXPERT">Expert</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setIsAddingSkill(false);
                              setNewSkill({ name: '', skillLevel: 'BEGINNER' });
                            }}
                            className="px-4 py-2 text-slate-700 bg-slate-200 rounded-xl hover:bg-slate-300 transition-colors font-medium"
                          >
                            Cancel
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAddSkill}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/25"
                          >
                            Add Skill
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {/* Skills List */}
                    <div className="space-y-3">
                      {profile?.expertskill && profile.expertskill.length > 0 ? (
                        profile.expertskill.map((skill) => (
                          <motion.div
                            key={skill.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-xl">
                                <Award className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{skill.skillName}</p>
                                <p className="text-sm text-slate-500 capitalize">{skill.skillLevel.toLowerCase()}</p>
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteSkill(skill.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </motion.button>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-slate-500">
                          <Award className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                          <h3 className="text-lg font-medium text-slate-900 mb-2">No skills added yet</h3>
                          <p className="text-slate-500 mb-4">Add your first skill to showcase your expertise</p>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsAddingSkill(true)}
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/25"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Add Your First Skill</span>
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
                            )}

              {/* Experience Tab */}
              {activeTab === 'experience' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Experience Header */}
                  <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-slate-900">Work Experience</h2>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/25"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Experience</span>
                      </motion.button>
                    </div>

                    {/* Add Experience Form */}
                    {showAddForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 p-6 bg-slate-50 rounded-xl border border-slate-200/60"
                      >
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New Experience</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Job Title *</label>
                            <input
                              type="text"
                              value={newExperience.jobTitle}
                              onChange={(e) => setNewExperience({ ...newExperience, jobTitle: e.target.value })}
                              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="e.g., Senior Software Engineer"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Company *</label>
                            <input
                              type="text"
                              value={newExperience.company}
                              onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="e.g., Google Inc."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                            <input
                              type="text"
                              value={newExperience.location}
                              onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
                              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="e.g., San Francisco, CA"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date *</label>
                            <input
                              type="date"
                              value={newExperience.startDate}
                              onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
                              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>
                            <input
                              type="date"
                              value={newExperience.endDate}
                              onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
                              disabled={newExperience.isCurrent}
                              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500"
                            />
                          </div>
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id="isCurrent"
                              checked={newExperience.isCurrent}
                              onChange={(e) => setNewExperience({ ...newExperience, isCurrent: e.target.checked })}
                              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="isCurrent" className="text-sm font-medium text-slate-700">
                              I currently work here
                            </label>
                          </div>
                        </div>
                        <div className="mt-4 space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                            <textarea
                              value={newExperience.description}
                              onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                              rows={3}
                              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                              placeholder="Describe your role and responsibilities..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Skills Used</label>
                            <input
                              type="text"
                              value={newExperience.skills}
                              onChange={(e) => setNewExperience({ ...newExperience, skills: e.target.value })}
                              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="e.g., React, Node.js, Python (comma separated)"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Key Achievements</label>
                            <textarea
                              value={newExperience.achievements}
                              onChange={(e) => setNewExperience({ ...newExperience, achievements: e.target.value })}
                              rows={3}
                              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                              placeholder="List your key achievements and contributions..."
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setShowAddForm(false);
                              setNewExperience({
                                jobTitle: '', company: '', location: '', startDate: '', endDate: '',
                                isCurrent: false, description: '', skills: '', achievements: ''
                              });
                            }}
                            className="px-6 py-2 text-slate-700 bg-slate-200 rounded-xl hover:bg-slate-300 transition-colors font-medium"
                          >
                            Cancel
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAddExperience}
                            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/25"
                          >
                            Add Experience
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {/* Experience List */}
                    <div className="space-y-4">
                      {workExperiences && workExperiences.length > 0 ? (
                        workExperiences.map((experience) => (
                          <motion.div
                            key={experience.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 bg-slate-50 rounded-xl border border-slate-200/60 hover:border-slate-300/60 transition-colors"
                          >
                            {editingExperience && editingExperience.id === experience.id ? (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Job Title</label>
                                    <input
                                      type="text"
                                      value={editingExperience.jobTitle || ''}
                                      onChange={(e) => setEditingExperience({ ...editingExperience, jobTitle: e.target.value })}
                                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Company</label>
                                    <input
                                      type="text"
                                      value={editingExperience.company || ''}
                                      onChange={(e) => setEditingExperience({ ...editingExperience, company: e.target.value })}
                                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                                    <input
                                      type="text"
                                      value={editingExperience.location || ''}
                                      onChange={(e) => setEditingExperience({ ...editingExperience, location: e.target.value })}
                                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date</label>
                                    <input
                                      type="date"
                                      value={editingExperience.startDate || ''}
                                      onChange={(e) => setEditingExperience({ ...editingExperience, startDate: e.target.value })}
                                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>
                                    <input
                                      type="date"
                                      value={editingExperience.endDate || ''}
                                      onChange={(e) => setEditingExperience({ ...editingExperience, endDate: e.target.value })}
                                      disabled={editingExperience.isCurrent}
                                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500"
                                    />
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <input
                                      type="checkbox"
                                      id={`isCurrent-${experience.id}`}
                                      checked={editingExperience.isCurrent || false}
                                      onChange={(e) => setEditingExperience({ ...editingExperience, isCurrent: e.target.checked })}
                                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor={`isCurrent-${experience.id}`} className="text-sm font-medium text-slate-700">
                                      Currently working here
                                    </label>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                                    <textarea
                                      value={editingExperience.description || ''}
                                      onChange={(e) => setEditingExperience({ ...editingExperience, description: e.target.value })}
                                      rows={3}
                                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Skills Used</label>
                                    <input
                                      type="text"
                                      value={Array.isArray(editingExperience.skills) ? editingExperience.skills.join(', ') : editingExperience.skills || ''}
                                      onChange={(e) => setEditingExperience({ ...editingExperience, skills: e.target.value })}
                                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Key Achievements</label>
                                    <textarea
                                      value={editingExperience.achievements || ''}
                                      onChange={(e) => setEditingExperience({ ...editingExperience, achievements: e.target.value })}
                                      rows={3}
                                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end space-x-3">
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setEditingExperience(null)}
                                    className="px-4 py-2 text-slate-700 bg-slate-200 rounded-xl hover:bg-slate-300 transition-colors font-medium"
                                  >
                                    Cancel
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleUpdateExperience}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/25"
                                  >
                                    Save Changes
                                  </motion.button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                      <div className="p-2 bg-blue-100 rounded-xl">
                                        <Briefcase className="h-4 w-4 text-blue-600" />
                                      </div>
                                      <div>
                                        <h3 className="text-lg font-semibold text-slate-900">{experience.jobTitle}</h3>
                                        <p className="text-slate-600 font-medium">{experience.company}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm text-slate-500 mb-3">
                                      <div className="flex items-center space-x-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                          {formatDate(experience.startDate)} - {experience.isCurrent ? 'Present' : formatDate(experience.endDate)}
                                        </span>
                                      </div>
                                      {experience.location && (
                                        <div className="flex items-center space-x-1">
                                          <MapPin className="h-4 w-4" />
                                          <span>{experience.location}</span>
                                        </div>
                                      )}
                                    </div>
                                    {experience.description && (
                                      <p className="text-slate-600 mb-3">{experience.description}</p>
                                    )}
                                    {experience.skills && experience.skills.length > 0 && (
                                      <div className="mb-3">
                                        <p className="text-sm font-semibold text-slate-700 mb-2">Skills Used:</p>
                                        <div className="flex flex-wrap gap-2">
                                          {Array.isArray(experience.skills) ? experience.skills.map((skill, index) => (
                                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                              {skill}
                                            </span>
                                          )) : (
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                              {experience.skills}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    {experience.achievements && (
                                      <div>
                                        <p className="text-sm font-semibold text-slate-700 mb-2">Key Achievements:</p>
                                        <p className="text-slate-600 text-sm">{experience.achievements}</p>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2 ml-4">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => setEditingExperience(experience)}
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => handleDeleteExperience(experience.id)}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </motion.button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-slate-500">
                          <Briefcase className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                          <h3 className="text-lg font-medium text-slate-900 mb-2">No work experience added yet</h3>
                          <p className="text-slate-500 mb-4">Add your work experience to showcase your professional background</p>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowAddForm(true)}
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/25"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Add Your First Experience</span>
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Services Tab */}
              {activeTab === 'services' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-slate-900">Service Types</h2>
                      <p className="text-slate-600">Select the types of services you're available to provide</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableServiceTypes.map((serviceType) => {
                        const isSelected = serviceTypes.some(st => st.id === serviceType.id);
                        const Icon = serviceType.icon;
                        
                        return (
                          <motion.div
                            key={serviceType.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleServiceTypeToggle(serviceType.id)}
                            className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20'
                                : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <div className={`p-3 rounded-xl ${
                                isSelected ? 'bg-blue-600' : 'bg-slate-100'
                              }`}>
                                <Icon className={`h-6 w-6 ${
                                  isSelected ? 'text-white' : 'text-slate-600'
                                }`} />
                              </div>
                              <div className="flex-1">
                                <h3 className={`font-semibold text-lg ${
                                  isSelected ? 'text-blue-900' : 'text-slate-900'
                                }`}>
                                  {serviceType.name}
                                </h3>
                                <p className={`text-sm ${
                                  isSelected ? 'text-blue-700' : 'text-blue-600'
                                }`}>
                                  {serviceType.description}
                                </p>
                              </div>
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-600'
                                  : 'border-slate-300'
                              }`}>
                                {isSelected && (
                                  <CheckCircle className="h-4 w-4 text-white" />
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Colleges Tab */}
              {activeTab === 'colleges' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Search Section */}
                  <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                    <h2 className="text-xl font-semibold text-slate-900 mb-6">Find Opportunities</h2>
                    <div className="flex space-x-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Search for colleges, courses, or opportunities..."
                          value={collegeSearchQuery}
                          onChange={(e) => setCollegeSearchQuery(e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/25"
                      >
                        <Search className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Opportunities List */}
                  <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6">Available Opportunities</h3>
                    
                    {collegePosts && collegePosts.length > 0 ? (
                      <div className="space-y-4">
                        {collegePosts.map((post, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 bg-slate-50 rounded-xl border border-slate-200/60 hover:border-slate-300/60 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-3">
                                  <div className="p-2 bg-emerald-100 rounded-xl">
                                    <Building2 className="h-5 w-5 text-emerald-600" />
                                  </div>
                                  <div>
                                    <h4 className="text-lg font-semibold text-slate-900">MIT College</h4>
                                    <p className="text-slate-600">Computer Science Department</p>
                                  </div>
                                </div>
                                <p className="text-slate-700 mb-3">
                                  Looking for experienced software engineers to conduct workshops on modern web development technologies.
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-slate-500">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span>2 weeks ago</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>Boston, MA</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <DollarSign className="h-4 w-4" />
                                    <span>₹2000/hour</span>
                                  </div>
                                </div>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-lg shadow-emerald-600/25"
                              >
                                Apply Now
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-500">
                        <Building2 className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No opportunities available</h3>
                        <p className="text-slate-500 mb-4">Check back later for new opportunities from colleges</p>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/25"
                        >
                          <RefreshCw className="h-4 w-4" />
                          <span>Refresh</span>
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Ratings Tab */}
              {activeTab === 'ratings' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Trust Score */}
                  <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-slate-900">Trust Score & Reviews</h2>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-emerald-600" />
                        <span className="text-lg font-bold text-emerald-600">{trustScore}%</span>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">Your Trust Score</h3>
                          <p className="text-slate-600">Based on verified reviews and ratings from colleges</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-emerald-600 mb-1">{trustScore}%</div>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(trustScore / 20) ? 'text-yellow-400 fill-current' : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6">Recent Reviews</h3>
                    
                    {ratings && ratings.length > 0 ? (
                      <div className="space-y-4">
                        {ratings.map((rating, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 bg-slate-50 rounded-xl border border-slate-200/60"
                          >
                            <div className="flex items-start space-x-4">
                              <div className="p-2 bg-blue-100 rounded-xl">
                                <Star className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className="font-semibold text-slate-900">Excellent Workshop</h4>
                                  <div className="flex items-center space-x-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < 5 ? 'text-yellow-400 fill-current' : 'text-slate-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-slate-600 mb-2">
                                  "The workshop was very informative and well-structured. The expert explained complex concepts clearly."
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-slate-500">
                                  <span>MIT College</span>
                                  <span>2 days ago</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-500">
                        <Star className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No reviews yet</h3>
                        <p className="text-slate-500">Complete your first service to start receiving reviews</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-xl">
                  <LogOut className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Sign Out</h3>
              </div>
              <p className="text-slate-600 mb-6">
                Are you sure you want to sign out of your account?
              </p>
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    handleLogout();
                  }}
                  className="flex-1 px-4 py-2 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
