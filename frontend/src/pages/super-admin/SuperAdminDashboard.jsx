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
  LogOut,
  Menu,
  ChevronRight,
  Shield,
  X,
  BadgeDollarSign,
  Plus,
  UserCog,
  GraduationCap,
  Briefcase,
  Database,
  Clock,
  Calendar,
  Target,
  Zap
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

  // Invoice details state
  const [invoices, setInvoices] = useState([]);
  const [invoicePagination, setInvoicePagination] = useState({});
  const [invoiceFilters, setInvoiceFilters] = useState({
    status: '',
    planId: '',
    search: '',
    paymentStatus: '',
    page: 1,
    limit: 20
  });
  const [invoiceStats, setInvoiceStats] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  // Navigation tabs
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'plans', label: 'Plans', icon: BadgeDollarSign },
    { id: 'invoices', label: 'Invoice Details', icon: FileText },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
    if (activeTab === 'plans') {
      loadPlans(); // Load all plans (active + inactive) for management
    }
    if (activeTab === 'invoices') {
      loadActivePlans(); // Load only active plans for dropdown
      loadInvoiceData();
    }
  }, [filters, activeTab]);

  // Effect for invoice filters (except search)
  useEffect(() => {
    if (activeTab === 'invoices') {
      loadInvoiceData();
    }
  }, [invoiceFilters.status, invoiceFilters.planId, invoiceFilters.paymentStatus, invoiceFilters.page]);

  // Debounced search effect for invoices
  useEffect(() => {
    if (activeTab === 'invoices') {
      const timeoutId = setTimeout(() => {
        loadInvoiceData();
      }, 500); // 500ms delay for search

      return () => clearTimeout(timeoutId);
    }
  }, [invoiceFilters.search]);

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

  const loadActivePlans = async () => {
    try {
      const data = await apiService.adminListActivePlans();
      setPlans(data);
    } catch (e) {
      console.error('Failed to load active plans', e);
    }
  };

  const loadInvoiceData = async () => {
    try {
      setInvoiceLoading(true);
      const response = await apiService.getInvoiceDetails(
        invoiceFilters.page,
        invoiceFilters.limit,
        invoiceFilters.status || undefined,
        invoiceFilters.planId || undefined,
        invoiceFilters.search || undefined,
        invoiceFilters.paymentStatus || undefined
      );
      setInvoices(response.subscriptions);
      setInvoicePagination(response.pagination);
      setInvoiceStats(response.stats);
    } catch (error) {
      console.error('Failed to load invoice data:', error);
    } finally {
      setInvoiceLoading(false);
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
      if (payload.priceCents < 0) {
        alert('Please enter a valid price (0 or greater).');
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-200 border-t-blue-600"></div>
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const SidebarItem = ({ id, label, icon: Icon, isActive, onClick }) => (
    <motion.button
      onClick={() => onClick(id)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`group flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
        isActive
          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm'
          : 'text-gray-300 hover:text-white hover:bg-gray-800'
      }`}
    >
      <motion.div
        animate={{ 
          rotate: isActive ? 0 : 0,
          scale: isActive ? 1.1 : 1
        }}
        transition={{ duration: 0.2 }}
      >
        <Icon className={`h-5 w-5 transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
      </motion.div>
      <motion.span
        animate={{ 
          x: isActive ? 2 : 0,
          fontWeight: isActive ? 600 : 500
        }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.span>
    </motion.button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Modern Light Theme Layout */}
      <div className="flex h-screen overflow-hidden">
        {/* Black Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-56 bg-black border-r border-gray-800 transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex flex-col h-full">
            {/* Black Sidebar Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-between px-4 py-4 border-b border-gray-800"
            >
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Shield className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <motion.h1 
                    className="text-base font-semibold text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Super Admin
                  </motion.h1>
                  <motion.p 
                    className="text-xs text-gray-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Dashboard
                  </motion.p>
          </div>
              </div>
              <motion.button
            onClick={() => setSidebarOpen(false)}
                className="lg:hidden w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="h-4 w-4" />
              </motion.button>
            </motion.div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-3 space-y-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <SidebarItem
                  id="overview"
                  label="Overview"
                  icon={Home}
                  isActive={activeTab === 'overview'}
                  onClick={handleTabChange}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                <SidebarItem
                  id="users"
                  label="Users"
                  icon={Users}
                  isActive={activeTab === 'users'}
                  onClick={handleTabChange}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <SidebarItem
                  id="plans"
                  label="Plans"
                  icon={BadgeDollarSign}
                  isActive={activeTab === 'plans'}
                  onClick={handleTabChange}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.25 }}
              >
                <SidebarItem
                  id="invoices"
                  label="Invoice Details"
                  icon={FileText}
                  isActive={activeTab === 'invoices'}
                  onClick={handleTabChange}
                />
              </motion.div>
        </nav>

            {/* Logout Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="px-4 py-4 border-t border-gray-800 mt-auto"
            >
              <motion.button
                onClick={() => setShowLogoutConfirm(true)}
                className="group flex items-center space-x-3 w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 text-gray-300 hover:text-blue-400 hover:bg-blue-900/20"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  animate={{ rotate: 0 }}
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <LogOut className="h-5 w-5 text-gray-400 group-hover:text-blue-400" />
                </motion.div>
                <span>Sign Out</span>
              </motion.button>
            </motion.div>
        </div>
      </div>

        {/* Main Content - Modern Light Theme */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white/80 backdrop-blur-sm rounded-l-3xl shadow-lg">
          {/* Modern Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-8 py-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                  className="lg:hidden w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                  <Menu className="h-5 w-5" />
              </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                {tabs.find(tab => tab.id === activeTab)?.label || 'Dashboard'}
              </h1>
                </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadDashboardData}
                  className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
            <div className="p-6 space-y-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-4 text-white shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-teal-100 text-sm font-medium">Total Users</p>
                        <p className="text-2xl font-bold mt-1">{stats?.totalUsers || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <UserCog className="w-6 h-6" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">College Admins</p>
                        <p className="text-2xl font-bold mt-1">{stats?.collegeAdmins || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4 text-white shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-pink-100 text-sm font-medium">Experts</p>
                        <p className="text-2xl font-bold mt-1">{stats?.experts || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-6 h-6" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">Applications</p>
                        <p className="text-2xl font-bold mt-1">{stats?.totalApplications || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <Database className="w-6 h-6" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-100 text-sm font-medium">Total Ratings</p>
                        <p className="text-2xl font-bold mt-1">{stats?.totalRatings || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-4 text-white shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-cyan-100 text-sm font-medium">Recent Users</p>
                        <p className="text-2xl font-bold mt-1">{stats?.recentUsers || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-4 text-white shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-violet-100 text-sm font-medium">Active Users</p>
                        <p className="text-2xl font-bold mt-1">{stats?.activeUsers || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <Zap className="w-6 h-6" />
                      </div>
                    </div>
                  </motion.div>
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
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-900/5 mb-6">
                  <div className="px-6 py-4 border-b border-slate-200/60">
                    <h3 className="text-lg font-semibold text-slate-900">User Management</h3>
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
                            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                          value={filters.role}
                          onChange={(e) => handleFilterChange('role', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
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
                          <tr key={user.id} className="hover:bg-blue-50">
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
                                  {actionLoading[user.id] ? (
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <UserX className="h-4 w-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleUserAction('delete', user.id, user)}
                                  className="text-red-600 hover:text-red-900 transition-colors duration-200"
                                  disabled={actionLoading[user.id]}
                                  title="Delete user"
                                >
                                  {actionLoading[user.id] ? (
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
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
                            className="px-3 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.pages}
                            className="px-3 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-900/5 mb-6">
                  <div className="px-6 py-4 border-b border-slate-200/60 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">Subscription Plans</h3>
                    <button onClick={() => setShowCreatePlan(true)} className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-md transition-all duration-200">
                      <Plus className="h-4 w-4 mr-2" /> New Plan
                    </button>
                  </div>
                  <div className="px-6 py-4">
                    {plansLoading ? (
                      <div className="text-center py-12">
                        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500 text-sm">Loading plans...</p>
                      </div>
                    ) : plans.length === 0 ? (
                      <div className="text-gray-600">No plans yet.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {plans.map((plan) => (
                          <motion.div 
                            key={plan.id} 
                            className="group bg-white rounded-xl border border-gray-200/60 shadow-sm hover:shadow-lg hover:border-gray-300/60 transition-all duration-300 overflow-hidden"
                            whileHover={{ y: -4, scale: 1.02 }}
                          >
                            {/* Header with gradient background */}
                            <div className={`px-6 py-4 ${plan.isActive ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-gray-400 to-gray-500'}`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                                  <p className="text-emerald-100 text-sm font-medium">{plan.audience} • {plan.billingPeriod}</p>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-white">
                                    {plan.priceCents === 0 ? 'Free' : `₹${(plan.priceCents/100).toFixed(0)}`}
                                  </div>
                                  <div className="text-emerald-100 text-sm">per {plan.billingPeriod.toLowerCase()}</div>
                                </div>
                              </div>
                            </div>

                            {/* Description */}
                            {plan.description && (
                              <div className="px-6 py-4 border-b border-gray-100">
                                <p className="text-gray-600 text-sm leading-relaxed">{plan.description}</p>
                              </div>
                            )}

                            {/* Features */}
                            <div className="px-6 py-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600 font-medium">Requirements</span>
                                  <span className="text-gray-900 font-semibold">{plan.maxRequirements ?? 'Unlimited'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600 font-medium">Expert Contacts</span>
                                  <span className="text-gray-900 font-semibold">{plan.maxExpertContacts ?? 'Unlimited'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                              <div className="flex items-center justify-between">
                                <div className="flex space-x-2">
                                  <button 
                                    onClick={() => handleTogglePlan(plan.id)} 
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                      plan.isActive 
                                        ? 'text-red-600 hover:bg-red-50' 
                                        : 'text-emerald-600 hover:bg-emerald-50'
                                    }`}
                                  >
                                    {plan.isActive ? 'Deactivate' : 'Activate'}
                                  </button>
                                </div>
                                <div className="flex space-x-2">
                                  <button 
                                    onClick={() => {
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
                                    }} 
                                    className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={async () => {
                                      if (confirm('Delete this plan? This cannot be undone.')) {
                                        try { await apiService.adminDeletePlan(plan.id); await loadPlans(); } catch (e) { alert(e.message || 'Delete failed'); }
                                      }
                                    }} 
                                    className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
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
                        <button onClick={() => setShowCreatePlan(false)} className="text-blue-400 hover:text-blue-600">✕</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <input value={createPlanForm.name} onChange={e => setCreatePlanForm({ ...createPlanForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                          <select value={createPlanForm.audience} onChange={e => setCreatePlanForm({ ...createPlanForm, audience: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors">
                            <option value="COLLEGE">College</option>
                            <option value="EXPERT">Expert</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Billing Period</label>
                          <select value={createPlanForm.billingPeriod} onChange={e => setCreatePlanForm({ ...createPlanForm, billingPeriod: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors">
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea rows={3} value={createPlanForm.description} onChange={e => setCreatePlanForm({ ...createPlanForm, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Max Requirements / mo (empty for unlimited)</label>
                          <input type="number" value={createPlanForm.maxRequirements} onChange={e => setCreatePlanForm({ ...createPlanForm, maxRequirements: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Max Expert Contacts / mo (empty for unlimited)</label>
                          <input type="number" value={createPlanForm.maxExpertContacts} onChange={e => setCreatePlanForm({ ...createPlanForm, maxExpertContacts: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors" />
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end space-x-2">
                        <button onClick={() => setShowCreatePlan(false)} className="px-4 py-2 border border-blue-300 text-blue-600 hover:bg-blue-50 rounded-md">Cancel</button>
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
                              if (payload.priceCents < 0) { alert('Please enter a valid price (0 or greater).'); return; }
                              await apiService.adminUpdatePlan(id, payload);
                              setShowCreatePlan(false);
                              await loadPlans();
                            } catch (e) { alert(e.message || 'Update failed'); }
                          } else {
                            await handleCreatePlan();
                          }
                        }} disabled={creatingPlan} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-md disabled:opacity-50 transition-all duration-200">{creatingPlan ? 'Saving...' : (String(showCreatePlan).startsWith('edit-') ? 'Save Changes' : 'Create Plan')}</button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'invoices' && (
              <motion.div
                key="invoices"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Invoice Stats */}
                {invoiceStats && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm font-medium">Total Subscriptions</p>
                          <p className="text-2xl font-bold mt-1">{invoiceStats.totalSubscriptions}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                          <p className="text-2xl font-bold mt-1">₹{invoiceStats.totalRevenue.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-6 h-6" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm font-medium">Active Subscriptions</p>
                          <p className="text-2xl font-bold mt-1">
                            {invoices.filter(inv => inv.status === 'ACTIVE').length}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <UserCheck className="w-6 h-6" />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Status</label>
                      <select
                        value={invoiceFilters.status}
                        onChange={(e) => setInvoiceFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
                      >
                        <option value="">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="CANCELED">Canceled</option>
                        <option value="EXPIRED">Expired</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                      <select
                        value={invoiceFilters.paymentStatus || ''}
                        onChange={(e) => setInvoiceFilters(prev => ({ ...prev, paymentStatus: e.target.value, page: 1 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
                      >
                        <option value="">All Payments</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="PENDING">Pending</option>
                        <option value="FAILED">Failed</option>
                        <option value="NO_PAYMENT">No Payment</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                      <select
                        value={invoiceFilters.planId}
                        onChange={(e) => setInvoiceFilters(prev => ({ ...prev, planId: e.target.value, page: 1 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
                      >
                        <option value="">All Plans</option>
                        {plans.map(plan => (
                          <option key={plan.id} value={plan.id}>{plan.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="text"
                          placeholder="Search users or plans..."
                          value={invoiceFilters.search}
                          onChange={(e) => setInvoiceFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoice Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Subscription Invoices</h3>
                  </div>
                  
                  {invoiceLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600"></div>
                      <span className="ml-3 text-gray-600">Loading invoices...</span>
                    </div>
                  ) : invoices.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
                      <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Paid</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {invoices.map((invoice) => (
                            <tr key={invoice.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                                      <span className="text-sm font-medium text-white">
                                        {invoice.user.fullName.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{invoice.user.fullName}</div>
                                    <div className="text-sm text-gray-500">{invoice.user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{invoice.plan.name}</div>
                                <div className="text-sm text-gray-500">{invoice.plan.audience}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  invoice.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                  invoice.status === 'CANCELED' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {invoice.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">₹{(invoice.plan.priceCents / 100).toLocaleString()}</div>
                                <div className="text-sm text-gray-500">{invoice.plan.billingPeriod}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">₹{invoice.totalPaid.toLocaleString()}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  invoice.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                  invoice.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                  invoice.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {invoice.paymentStatus === 'NO_PAYMENT' ? 'No Payment' : invoice.paymentStatus}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {new Date(invoice.startsAt).toLocaleDateString()}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {invoice.endsAt ? new Date(invoice.endsAt).toLocaleDateString() : 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(invoice.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => {
                                    // You can add a modal to show detailed invoice information
                                    console.log('View invoice details:', invoice);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 mr-3"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination */}
                  {invoicePagination && invoicePagination.pages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          Showing {((invoicePagination.page - 1) * invoicePagination.limit) + 1} to{' '}
                          {Math.min(invoicePagination.page * invoicePagination.limit, invoicePagination.total)} of{' '}
                          {invoicePagination.total} results
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setInvoiceFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                            disabled={invoicePagination.page === 1}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <span className="px-3 py-1 text-sm text-gray-700">
                            Page {invoicePagination.page} of {invoicePagination.pages}
                          </span>
                          <button
                            onClick={() => setInvoiceFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                            disabled={invoicePagination.page === invoicePagination.pages}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

          </AnimatePresence>
            </div>
        </main>
        </div>
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