import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../utils/api';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { 
  Users, 
  Building2, 
  UserCheck, 
  FileText, 
  Star, 
  TrendingUp,
  Search,
  Eye,
  UserX,
  Trash2,
  RefreshCw,
  Home,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  Shield,
  Activity,
  X,
  BadgeDollarSign,
  Plus
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  
  // Get active tab from URL or default to 'overview'
  const [activeTab, setActiveTab] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tab') || 'overview';
  });

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    role: '',
    search: '',
    isActive: null,
    page: 1,
    limit: 10
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    onConfirm: null,
    isLoading: false
  });

  // Navigation tabs
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'plans', label: 'Plans', icon: BadgeDollarSign },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
    if (activeTab === 'plans') {
      loadPlans();
    }
  }, [filters, activeTab]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, overviewData] = await Promise.all([
        apiService.getSuperAdminDashboardStats(),
        apiService.getSuperAdminOverview()
      ]);
      setStats(statsData);
      setOverview(overviewData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      console.log('Loading users with filters:', filters); // Debug log
      const response = await apiService.getAllUsers(
        filters.page,
        filters.limit,
        filters.role || null,
        filters.search || null,
        filters.isActive
      );
      console.log('Users loaded:', response.users.length, 'users'); // Debug log
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    console.log('Filter changed:', key, value); // Debug log
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // ===== Plans state =====
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [createPlanForm, setCreatePlanForm] = useState({
    name: '',
    description: '',
    audience: 'COLLEGE',
    billingPeriod: 'MONTHLY',
    priceDisplay: '',
    currency: 'INR',
    maxRequirements: '',
    maxExpertContacts: '',
  });
  const [creatingPlan, setCreatingPlan] = useState(false);

  const loadPlans = async () => {
    try {
      setPlansLoading(true);
      const data = await apiService.adminListPlans();
      setPlans(data);
    } catch (e) {
      console.error('Failed to load plans', e);
    } finally {
      setPlansLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    try {
      setCreatingPlan(true);
      const payload = {
        name: createPlanForm.name,
        description: createPlanForm.description,
        audience: createPlanForm.audience,
        billingPeriod: createPlanForm.billingPeriod,
        priceCents: Math.round((Number(createPlanForm.priceDisplay || '0')) * 100),
        currency: createPlanForm.currency,
        maxRequirements: createPlanForm.maxRequirements === '' ? null : Number(createPlanForm.maxRequirements),
        maxExpertContacts: createPlanForm.maxExpertContacts === '' ? null : Number(createPlanForm.maxExpertContacts),
      };
      if (!payload.priceCents || payload.priceCents <= 0) {
        alert('Please enter a price greater than 0.');
        return;
      }
      await apiService.adminCreatePlan(payload);
      setShowCreatePlan(false);
      setCreatePlanForm({ name: '', description: '', audience: 'COLLEGE', billingPeriod: 'MONTHLY', priceDisplay: '', currency: 'INR', maxRequirements: '', maxExpertContacts: '' });
      await loadPlans();
    } catch (e) {
      console.error('Create plan failed', e);
    } finally {
      setCreatingPlan(false);
    }
  };

  const handleTogglePlan = async (id) => {
    try {
      await apiService.adminTogglePlan(id);
      await loadPlans();
    } catch (e) {
      console.error('Toggle plan failed', e);
    }
  };

  const handleUserAction = async (action, userId, userData = null) => {
    if (action === 'delete') {
      // Show confirmation modal for delete
      setConfirmationModal({
        isOpen: true,
        title: 'Delete User',
        message: `Are you sure you want to delete ${userData?.fullName || 'this user'}? This action cannot be undone and the user will be permanently removed from the platform.`,
        type: 'danger',
        onConfirm: () => confirmDeleteUser(userId),
        isLoading: false
      });
    } else if (action === 'toggle') {
      // Show confirmation modal for toggle status
      const statusText = userData?.isActive ? 'deactivate' : 'activate';
      setConfirmationModal({
        isOpen: true,
        title: `${userData?.isActive ? 'Deactivate' : 'Activate'} User`,
        message: `Are you sure you want to ${statusText} ${userData?.fullName || 'this user'}? This will ${userData?.isActive ? 'prevent' : 'allow'} them from accessing the platform.`,
        type: 'warning',
        onConfirm: () => confirmToggleUserStatus(userId),
        isLoading: false
      });
    } else if (action === 'view') {
      try {
        const userDetails = await apiService.getUserById(userId);
        setSelectedUser(userDetails);
        setShowUserModal(true);
      } catch (error) {
        console.error('Failed to load user details:', error);
        alert('Failed to load user details. Please try again.');
      }
    }
  };

  const confirmDeleteUser = async (userId) => {
    try {
      setConfirmationModal(prev => ({ ...prev, isLoading: true }));
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      
      const result = await apiService.deleteUser(userId);
      console.log('User deleted successfully:', result);
      
      // Show success message
      setConfirmationModal({
        isOpen: true,
        title: 'User Deleted',
        message: result.message || 'User has been deleted successfully.',
        type: 'success',
        onConfirm: () => setConfirmationModal(prev => ({ ...prev, isOpen: false })),
        isLoading: false
      });
      
      await loadUsers(); // Refresh the list
    } catch (error) {
      console.error('Delete user error:', error);
      setConfirmationModal({
        isOpen: true,
        title: 'Delete Failed',
        message: error.message || 'Failed to delete user. Please try again.',
        type: 'danger',
        onConfirm: () => setConfirmationModal(prev => ({ ...prev, isOpen: false })),
        isLoading: false
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const confirmToggleUserStatus = async (userId) => {
    try {
      setConfirmationModal(prev => ({ ...prev, isLoading: true }));
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      
      const result = await apiService.toggleUserStatus(userId);
      console.log('User status toggled successfully:', result);
      
      // Show success message
      setConfirmationModal({
        isOpen: true,
        title: 'Status Updated',
        message: result.message || 'User status has been updated successfully.',
        type: 'success',
        onConfirm: () => setConfirmationModal(prev => ({ ...prev, isOpen: false })),
        isLoading: false
      });
      
      await loadUsers(); // Refresh the list
    } catch (error) {
      console.error('Toggle user status error:', error);
      setConfirmationModal({
        isOpen: true,
        title: 'Update Failed',
        message: error.message || 'Failed to update user status. Please try again.',
        type: 'danger',
        onConfirm: () => setConfirmationModal(prev => ({ ...prev, isOpen: false })),
        isLoading: false
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-red-100 text-red-800';
      case 'COLLEGE_ADMIN': return 'bg-blue-100 text-blue-800';
      case 'EXPERT': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // Update URL without page reload
    const url = new URL(window.location);
    url.searchParams.set('tab', tabId);
    window.history.pushState({}, '', url);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex-shrink-0">
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-red-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">Super Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'bg-red-100 text-red-700 border-r-2 border-red-500'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User info and logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-semibold text-sm">SA</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
              <p className="text-xs text-gray-500">Super Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="ml-2 text-2xl font-bold text-gray-900">
                {tabs.find(tab => tab.id === activeTab)?.label || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadDashboardData}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Content area */}
        <main className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Building2 className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">College Admins</p>
                        <p className="text-2xl font-bold text-gray-900">{stats?.collegeAdmins || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <UserCheck className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Experts</p>
                        <p className="text-2xl font-bold text-gray-900">{stats?.experts || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <FileText className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Applications</p>
                        <p className="text-2xl font-bold text-gray-900">{stats?.totalApplications || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Star className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Ratings</p>
                        <p className="text-2xl font-bold text-gray-900">{stats?.totalRatings || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Recent Users</p>
                        <p className="text-2xl font-bold text-gray-900">{stats?.recentUsers || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Activity className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Active Users</p>
                        <p className="text-2xl font-bold text-gray-900">{stats?.activeUsers || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Filters */}
                <div className="bg-white rounded-lg shadow mb-6">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                  </div>
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search users..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                          value={filters.role}
                          onChange={(e) => handleFilterChange('role', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All Roles</option>
                          <option value="EXPERT">Expert</option>
                          <option value="COLLEGE_ADMIN">College Admin</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={filters.isActive === null ? '' : filters.isActive.toString()}
                          onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? null : e.target.value === 'true')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All Status</option>
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Per Page</label>
                        <select
                          value={filters.limit}
                          onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Users Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Verification
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Login
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-700">
                                      {user.fullName.charAt(0)}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                                {user.role.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-2">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  user.isEmailVerified 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  Email
                                </span>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  user.isPhoneVerified 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  Phone
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleUserAction('view', user.id, user)}
                                  className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                                  disabled={actionLoading[user.id]}
                                  title="View user details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleUserAction('toggle', user.id, user)}
                                  className={`${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} transition-colors duration-200`}
                                  disabled={actionLoading[user.id]}
                                  title={user.isActive ? 'Deactivate user' : 'Activate user'}
                                >
                                  <UserX className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleUserAction('delete', user.id, user)}
                                  className="text-red-600 hover:text-red-900 transition-colors duration-200"
                                  disabled={actionLoading[user.id]}
                                  title="Delete user"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.pages}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'plans' && (
              <motion.div
                key="plans"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-lg shadow mb-6">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Subscription Plans</h3>
                    <button onClick={() => setShowCreatePlan(true)} className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md">
                      <Plus className="h-4 w-4 mr-2" /> New Plan
                    </button>
                  </div>
                  <div className="px-6 py-4">
                    {plansLoading ? (
                      <div className="text-gray-600">Loading plans...</div>
                    ) : plans.length === 0 ? (
                      <div className="text-gray-600">No plans yet.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {plans.map((plan) => (
                          <div key={plan.id} className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-5 border-b border-gray-100 flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${plan.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{plan.isActive ? 'Active' : 'Inactive'}</span>
                                </div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">{plan.audience} • {plan.billingPeriod}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-700">₹{(plan.priceCents/100).toFixed(2)} <span className="text-gray-500">/ {plan.billingPeriod.toLowerCase()}</span></div>
                              </div>
                            </div>
                            {plan.description && (
                              <div className="px-5 py-3 text-sm text-gray-700">{plan.description}</div>
                            )}
                            <div className="px-5 py-3 grid grid-cols-2 gap-3 text-sm">
                              <div className="rounded-lg bg-gray-50 p-3">
                                <div className="text-xs text-gray-500">Requirements / mo</div>
                                <div className="font-semibold text-gray-900">{plan.maxRequirements ?? 'Unlimited'}</div>
                              </div>
                              <div className="rounded-lg bg-gray-50 p-3">
                                <div className="text-xs text-gray-500">Expert contacts / mo</div>
                                <div className="font-semibold text-gray-900">{plan.maxExpertContacts ?? 'Unlimited'}</div>
                              </div>
                            </div>
                            <div className="px-5 py-4 flex items-center justify-between border-t border-gray-100">
                              <div className="flex gap-3">
                                <button onClick={() => handleTogglePlan(plan.id)} className="text-sm text-indigo-600 hover:text-indigo-800">{plan.isActive ? 'Deactivate' : 'Activate'}</button>
                                <button onClick={async () => {
                                  const subs = await apiService.adminListPlanSubscribers(plan.id, { page: 1, limit: 10 });
                                  alert(`Subscribers: ${subs.pagination.total}`);
                                }} className="text-sm text-gray-600 hover:text-gray-800">View Subscribers</button>
                              </div>
                              <div className="flex gap-3">
                                <button onClick={() => {
                                  setCreatePlanForm({
                                    name: plan.name,
                                    description: plan.description || '',
                                    audience: plan.audience,
                                    billingPeriod: plan.billingPeriod,
                                    priceDisplay: String((plan.priceCents/100).toFixed(2)),
                                    currency: plan.currency,
                                    maxRequirements: plan.maxRequirements ?? '',
                                    maxExpertContacts: plan.maxExpertContacts ?? '',
                                  });
                                  setShowCreatePlan('edit-' + plan.id);
                                }} className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
                                <button onClick={async () => {
                                  if (confirm('Delete this plan? This cannot be undone.')) {
                                    try { await apiService.adminDeletePlan(plan.id); await loadPlans(); } catch (e) { alert(e.message || 'Delete failed'); }
                                  }
                                }} className="text-sm text-red-600 hover:text-red-800">Delete</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Create Plan Modal */}
                {showCreatePlan && (
                  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{String(showCreatePlan).startsWith('edit-') ? 'Edit Plan' : 'Create Plan'}</h3>
                        <button onClick={() => setShowCreatePlan(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <input value={createPlanForm.name} onChange={e => setCreatePlanForm({ ...createPlanForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                          <select value={createPlanForm.audience} onChange={e => setCreatePlanForm({ ...createPlanForm, audience: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                            <option value="COLLEGE">College</option>
                            <option value="EXPERT">Expert</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Billing Period</label>
                          <select value={createPlanForm.billingPeriod} onChange={e => setCreatePlanForm({ ...createPlanForm, billingPeriod: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                            <option value="MONTHLY">Monthly</option>
                            <option value="QUARTERLY">Quarterly</option>
                            <option value="YEARLY">Yearly</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                          <input
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            min="0.01"
                            placeholder="0"
                            value={createPlanForm.priceDisplay}
                            onFocus={(e) => { if (e.target.value === '0') { e.target.value = ''; } }}
                            onChange={e => setCreatePlanForm({ ...createPlanForm, priceDisplay: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea rows={3} value={createPlanForm.description} onChange={e => setCreatePlanForm({ ...createPlanForm, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Max Requirements / mo (empty for unlimited)</label>
                          <input type="number" value={createPlanForm.maxRequirements} onChange={e => setCreatePlanForm({ ...createPlanForm, maxRequirements: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Max Expert Contacts / mo (empty for unlimited)</label>
                          <input type="number" value={createPlanForm.maxExpertContacts} onChange={e => setCreatePlanForm({ ...createPlanForm, maxExpertContacts: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end space-x-2">
                        <button onClick={() => setShowCreatePlan(false)} className="px-4 py-2 border border-gray-300 rounded-md">Cancel</button>
                        <button onClick={async () => {
                          if (String(showCreatePlan).startsWith('edit-')) {
                            const id = String(showCreatePlan).replace('edit-','');
                            try {
                              const payload = {
                                ...createPlanForm,
                                priceCents: Math.round((Number(createPlanForm.priceDisplay || '0')) * 100),
                                maxRequirements: createPlanForm.maxRequirements === '' ? null : Number(createPlanForm.maxRequirements),
                                maxExpertContacts: createPlanForm.maxExpertContacts === '' ? null : Number(createPlanForm.maxExpertContacts),
                              };
                              if (!payload.priceCents || payload.priceCents <= 0) { alert('Please enter a price greater than 0.'); return; }
                              await apiService.adminUpdatePlan(id, payload);
                              setShowCreatePlan(false);
                              await loadPlans();
                            } catch (e) { alert(e.message || 'Update failed'); }
                          } else {
                            await handleCreatePlan();
                          }
                        }} disabled={creatingPlan} className="px-4 py-2 bg-red-600 text-white rounded-md disabled:opacity-50">{creatingPlan ? 'Saving...' : (String(showCreatePlan).startsWith('edit-') ? 'Save Changes' : 'Create Plan')}</button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
                  <p className="text-gray-600">Analytics features coming soon...</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
                  <p className="text-gray-600">Settings features coming soon...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        isLoading={confirmationModal.isLoading}
        confirmText={confirmationModal.type === 'success' ? 'OK' : 'Confirm'}
        cancelText="Cancel"
      />

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">User Details</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(selectedUser.role)}`}>
                      {selectedUser.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                {selectedUser.expertprofile && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expert Profile</label>
                    <div className="mt-1 text-sm text-gray-900">
                      <p><strong>Job Title:</strong> {selectedUser.expertprofile.jobTitle}</p>
                      <p><strong>Company:</strong> {selectedUser.expertprofile.company}</p>
                      <p><strong>Verified:</strong> {selectedUser.expertprofile.isVerified ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                )}
                
                {selectedUser.collegeprofile && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">College Profile</label>
                    <div className="mt-1 text-sm text-gray-900">
                      <p><strong>Institution:</strong> {selectedUser.collegeprofile.institutionName}</p>
                      <p><strong>Verified:</strong> {selectedUser.collegeprofile.isVerified ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;