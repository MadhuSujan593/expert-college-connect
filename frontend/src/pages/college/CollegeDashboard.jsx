import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  User, 
  FileText, 
  Users, 
  Star, 
  LogOut, 
  Edit3, 
  Save,
  X, 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  MapPin,
  Calendar, 
  Clock,
  Shield,
  CheckCircle, 
  Award, 
  TrendingUp, 
  BarChart3, 
  Zap,
  Upload,
  Menu,
  ChevronRight,
  AlertCircle,
  CreditCard,
  Mail,
  Phone,
  MessageCircle,
  Briefcase,
  UserCheck,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../utils/api';
import Toast from '../../components/common/Toast';
import FileUpload from '../../components/common/FileUpload';
import EmailVerificationModal from '../../components/verification/EmailVerificationModal';
import PhoneVerificationModal from '../../components/verification/PhoneVerificationModal';
import ExpertRatingModal from '../../components/college/ExpertRatingModal';
import ExpertRatingDisplay from '../../components/college/ExpertRatingDisplay';
import RatingRequestsList from '../../components/college/RatingRequestsList';
import VerificationRequirementModal from '../../components/common/VerificationRequirementModal';
import RequirementCard from '../../components/common/RequirementCard';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import ApplicationManagement from '../../components/college/ApplicationManagement';
import PlanLimitationModal from '../../components/common/PlanLimitationModal';

const CollegeDashboard = () => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  // Get active tab from URL or default to 'overview'
  const [activeTab, setActiveTab] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tab') || 'overview';
  });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Rating state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [expertRatings, setExpertRatings] = useState([]);
  const [ratingRequests, setRatingRequests] = useState([]);
  // Pagination state for rating requests
  const [ratingRequestsPage, setRatingRequestsPage] = useState(1);
  const [ratingRequestsHasMore, setRatingRequestsHasMore] = useState(true);
  const [ratingRequestsLoadingMore, setRatingRequestsLoadingMore] = useState(false);
  const [stats, setStats] = useState({
    profileCompleteness: 0,
    totalRequirements: 0,
    urgentRequirements: 0,
    upcomingDeadlines: 0
  });
  const [recentRequirements, setRecentRequirements] = useState([]);
  // Infinite scroll state for requirements
  const [requirements, setRequirements] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalRequirements, setTotalRequirements] = useState(0);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  
  // View requirement modal state
  const [viewingRequirement, setViewingRequirement] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Verification states
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isPhoneSending, setIsPhoneSending] = useState(false);
  const [isEmailVerifying, setIsEmailVerifying] = useState(false);
  const [isPhoneVerifying, setIsPhoneVerifying] = useState(false);

  // Track if email/phone has changed during editing
  const [emailChanged, setEmailChanged] = useState(false);
  const [phoneChanged, setPhoneChanged] = useState(false);
  const [originalEmail, setOriginalEmail] = useState('');
  const [originalPhone, setOriginalPhone] = useState('');
  
  // Track current verification status for form fields
  const [currentEmailVerified, setCurrentEmailVerified] = useState(false);
  const [currentPhoneVerified, setCurrentPhoneVerified] = useState(false);

  // Verification requirement modal state
  const [showVerificationRequirement, setShowVerificationRequirement] = useState(false);
  const [verificationFeatureName, setVerificationFeatureName] = useState("Requirements Creation");

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [requirementToDelete, setRequirementToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Subscription state
  const [mySubscription, setMySubscription] = useState(null);
  const [subsLoading, setSubsLoading] = useState(false);
  const [subscribingPlanId, setSubscribingPlanId] = useState(null);

  // Plan limitation modal state
  const [showPlanLimitationModal, setShowPlanLimitationModal] = useState(false);
  const [limitationType, setLimitationType] = useState(null);

  // Tab management with URL persistence
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // Update URL without page reload
    const url = new URL(window.location);
    url.searchParams.set('tab', tabId);
    window.history.pushState({}, '', url);
  };

  // Load my subscription
  const loadMySubscription = async () => {
    try {
      setSubsLoading(true);
      // Add timestamp to prevent caching
      const data = await apiService.getMySubscription();
      console.log('Subscription data loaded:', data);
      console.log('Current time:', new Date().toISOString());
      setMySubscription(data);
    } catch (e) {
      console.error('Failed to load subscription', e);
    } finally {
      setSubsLoading(false);
    }
  };

  const openPlansPage = () => {
    navigate('/subscription-plans');
  };

  // Handle plan limitation modal
  const handlePlanLimitationUpgrade = () => {
    setShowPlanLimitationModal(false);
    navigate('/subscription-plans');
  };

  const handlePlanLimitationClose = () => {
    setShowPlanLimitationModal(false);
    setLimitationType(null);
  };

  // Handle expert contact limitation
  const handleExpertContactLimit = async () => {
    // Refresh subscription data first to get updated usage
    await loadMySubscription();
    setLimitationType('expert_contacts');
    setShowPlanLimitationModal(true);
  };

  // Global function to handle expert contact limit (accessible from anywhere)
  window.handleExpertContactLimit = async () => {
    // Refresh subscription data first to get updated usage
    await loadMySubscription();
    setLimitationType('expert_contacts');
    setShowPlanLimitationModal(true);
  };

  // Global function to refresh subscription data (accessible from anywhere)
  window.refreshSubscriptionData = async () => {
    try {
      await loadMySubscription();
    } catch (error) {
      console.warn('Failed to refresh subscription data:', error);
    }
  };

  // Get current limitation details for modal
  const getCurrentLimitationDetails = () => {
    if (!mySubscription?.plan) return null;
    
    // Check if subscription is expired
    if (mySubscription.endsAt && new Date(mySubscription.endsAt) < new Date()) {
      return {
        type: 'expired',
        currentUsage: 0,
        planLimit: 0,
        planName: mySubscription.plan.name
      };
    }
    
    // Check requirements limit
    const usedRequirements = mySubscription.usages?.[0]?.usedRequirements || 0;
    const maxRequirements = mySubscription.plan.maxRequirements;
    
    if (maxRequirements && usedRequirements >= maxRequirements) {
      return {
        type: 'requirements',
        currentUsage: usedRequirements,
        planLimit: maxRequirements,
        planName: mySubscription.plan.name
      };
    }
    
    // Check expert contacts limit
    const usedExpertContacts = mySubscription.usages?.[0]?.usedExpertContacts || 0;
    const maxExpertContacts = mySubscription.plan.maxExpertContacts;
    
    if (maxExpertContacts && usedExpertContacts >= maxExpertContacts) {
      return {
        type: 'expert_contacts',
        currentUsage: usedExpertContacts,
        planLimit: maxExpertContacts,
        planName: mySubscription.plan.name
      };
    }
    
    return null;
  };

  const subscribeToPlan = async (planId) => {
    try {
      setSubscribingPlanId(planId);
      // Create order on backend
      const response = await apiService.createRazorpayOrder(planId);
      
      // Check if it's a free plan
      if (response.isFreePlan) {
        console.log('Free plan activated:', response);
        showToast('success', response.message || 'Free plan activated successfully!');
        setShowPlansModal(false);
        await loadMySubscription();
        return;
      }
      
      // For paid plans, proceed with Razorpay
      const { order, keyId } = response;
      if (!order || !keyId) throw new Error('Failed to create payment order');

      // Load Razorpay script if not present
      if (typeof window.Razorpay === 'undefined') {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://checkout.razorpay.com/v1/checkout.js';
          s.onload = resolve; s.onerror = reject; document.body.appendChild(s);
        });
      }

      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: keyId,
          order_id: order.id,
          name: 'Expert College Connect',
          description: 'Subscription Purchase',
          handler: async () => {
            try {
              await apiService.subscribeToPlan(planId);
              showToast('success', 'Subscription activated');
              setShowPlansModal(false);
              await loadMySubscription();
              resolve(null);
            } catch (err) { reject(err); }
          },
          theme: { color: '#4f46e5' },
        });
        rzp.on('payment.failed', (resp) => {
          reject(new Error(resp?.error?.description || 'Payment failed'));
        });
        rzp.open();
      });
    } catch (e) {
      console.error('Subscribe failed', e);
      showToast('error', e.message || 'Failed to subscribe');
    } finally {
      setSubscribingPlanId(null);
    }
  };

  const handleView = (requirement) => {
    setViewingRequirement(requirement);
    setShowViewModal(true);
  };

  // Listen for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tabFromUrl = urlParams.get('tab');
      if (tabFromUrl && tabFromUrl !== activeTab) {
        setActiveTab(tabFromUrl);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'requirements') {
      loadMySubscription();
    }
  }, [activeTab]);

  // Delete functions
  const handleDelete = async (requirementId) => {
    // Find the requirement to get its title for the modal
    const requirement = requirements?.find(req => req.id === requirementId);
    if (requirement) {
      setRequirementToDelete(requirement);
      setShowDeleteModal(true);
    }
  };

  const handleToggleActive = async (requirement) => {
    try {
      const newActiveStatus = !requirement.isActive;
      console.log('🔄 Toggling requirement:', {
        id: requirement.id,
        title: requirement.title,
        currentStatus: requirement.isActive,
        newStatus: newActiveStatus
      });
      
      const response = await apiService.patch(`/requirements/${requirement.id}`, {
        isActive: newActiveStatus
      });
      
      console.log('📡 API Response:', response);
      
      // If we get a response (no error thrown), consider it successful
      if (response) {
        console.log('✅ API call successful, refreshing requirements...');
        
        // Force a complete refresh of requirements to ensure state is updated
        await refreshRequirements();
        
        // Also refresh recent requirements for dashboard
        await fetchRequirements();
        
        showToast('success', `Requirement ${newActiveStatus ? 'enabled' : 'disabled'} successfully`);
      }
    } catch (error) {
      console.error('❌ Error toggling requirement status:', error);
      showToast('error', 'Failed to update requirement status');
    }
  };

  const confirmDelete = async () => {
    if (!requirementToDelete) return;
    
    setIsDeleting(true);
    
    try {
      console.log('🗑️ Deleting requirement:', requirementToDelete.id);
      console.log('🔑 Using token:', localStorage.getItem('accessToken') ? 'Token exists' : 'No token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/requirements/${requirementToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
      });
      console.log('📡 Delete response status:', response.status);
      console.log('📡 Delete response ok:', response.ok);

      if (response.ok) {
        console.log('✅ Requirement deleted successfully');
        
        // Refresh requirements list
        showToast('success', 'Requirement deleted successfully!');
        console.log('🔄 Calling refreshRequirements...');
        refreshRequirements();
        
        // Close modal and reset state
        setShowDeleteModal(false);
        setRequirementToDelete(null);
      } else {
        const errorData = await response.json();
        console.error('❌ Backend error:', errorData);
        showToast('error', `Error: ${errorData.message || 'Failed to delete requirement'}`);
      }
    } catch (error) {
      console.error('❌ Error deleting requirement:', error);
      showToast('error', 'Failed to delete requirement');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setRequirementToDelete(null);
    setIsDeleting(false);
  };

  // Rating functions
  const handleRateExpert = (requirement, application = null) => {
    // For now, we'll use a mock expert. In a real scenario, you'd get this from the application
    const mockExpert = {
      id: 'expert-123',
      user: {
        fullName: 'Dr. John Smith',
        profileImage: null
      }
    };
    
    setSelectedExpert(mockExpert);
    setSelectedRequirement(requirement);
    setSelectedApplication(application);
    setShowRatingModal(true);
  };

  const handleRatingSubmitted = () => {
    setShowRatingModal(false);
    setSelectedExpert(null);
    setSelectedRequirement(null);
    setSelectedApplication(null);
    showToast('success', 'Rating submitted successfully!');
    // Refresh rating requests to update the UI
    fetchRatingRequests();
  };

  const fetchExpertRatings = async (expertId) => {
    try {
      const response = await apiService.get(`/ratings?expertProfileId=${expertId}`);
      setExpertRatings(response.data || []);
    } catch (error) {
      console.error('Error fetching expert ratings:', error);
    }
  };

  const fetchRatingRequests = async (pageNum = 1, append = false) => {
    try {
      if (append) {
        setRatingRequestsLoadingMore(true);
      }
      
      const response = await apiService.get(`/rating-requests?page=${pageNum}&limit=10`);
      if (response.success) {
        if (append) {
          setRatingRequests(prev => [...prev, ...response.data]);
        } else {
        setRatingRequests(response.data);
        }
        // Use the pagination metadata from backend
        setRatingRequestsHasMore(response.pagination?.hasNextPage || false);
        setRatingRequestsPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to fetch rating requests:', error);
    } finally {
      if (append) {
        setRatingRequestsLoadingMore(false);
      }
    }
  };

  // Helper function to convert relative URLs to full URLs
  const getFullLogoUrl = (logoUrl) => {
    if (!logoUrl) return null;
    if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
      return logoUrl;
    }
    // Convert relative path to full URL
    const baseUrl = 'http://localhost:3000';
    return `${baseUrl}/${logoUrl}`;
  };

  // Check if user can access requirements creation
  const canAccessRequirements = () => {
    // Require verification and subscription for posting
    const isVerified = user?.isEmailVerified || user?.isPhoneVerified;
    const hasPlan = !!mySubscription?.plan;
    return isVerified && hasPlan;
  };

  // Check if user can create requirements (plan limits)
  const canCreateRequirement = () => {
    if (!mySubscription?.plan) return false;
    
    // Check if subscription is expired
    if (mySubscription.endsAt && new Date(mySubscription.endsAt) < new Date()) {
      return false;
    }
    
    // Check requirements limit
    const usedRequirements = mySubscription.usages?.[0]?.usedRequirements || 0;
    const maxRequirements = mySubscription.plan.maxRequirements;
    
    if (maxRequirements && usedRequirements >= maxRequirements) {
      return false;
    }
    
    return true;
  };

  // Get limitation details for modal
  const getLimitationDetails = () => {
    if (!mySubscription?.plan) {
      return {
        type: 'no_subscription',
        currentUsage: 0,
        planLimit: 0,
        planName: 'No Plan'
      };
    }
    
    // Check if subscription is expired
    if (mySubscription.endsAt && new Date(mySubscription.endsAt) < new Date()) {
      return {
        type: 'expired',
        currentUsage: 0,
        planLimit: 0,
        planName: mySubscription.plan.name
      };
    }
    
    // Check requirements limit
    const usedRequirements = mySubscription.usages?.[0]?.usedRequirements || 0;
    const maxRequirements = mySubscription.plan.maxRequirements;
    
    if (maxRequirements && usedRequirements >= maxRequirements) {
      return {
        type: 'requirements',
        currentUsage: usedRequirements,
        planLimit: maxRequirements,
        planName: mySubscription.plan.name
      };
    }
    
    // Check expert contacts limit
    const usedExpertContacts = mySubscription.usages?.[0]?.usedExpertContacts || 0;
    const maxExpertContacts = mySubscription.plan.maxExpertContacts;
    
    if (maxExpertContacts && usedExpertContacts >= maxExpertContacts) {
      return {
        type: 'expert_contacts',
        currentUsage: usedExpertContacts,
        planLimit: maxExpertContacts,
        planName: mySubscription.plan.name
      };
    }
    
    return null;
  };

  // Handle requirement creation with plan validation
  const handleCreateRequirementClick = (onShowForm) => {
    // First check verification
    if (!(user?.isEmailVerified || user?.isPhoneVerified)) {
      setVerificationFeatureName("Requirements Creation");
      setShowVerificationRequirement(true);
      return;
    }
    
    // Then check subscription/plan limitations
    if (!canCreateRequirement()) {
      const limitation = getLimitationDetails();
      if (limitation) {
        setLimitationType(limitation.type);
        setShowPlanLimitationModal(true);
        return;
      }
    }
    
    // If all checks pass, show the form
    if (onShowForm) {
      onShowForm(true);
    }
  };

  // Check if user can access application management (only requires email verification)
  const canAccessApplicationManagement = () => {
    return user?.isEmailVerified;
  };

  // Check if user can access expert directory (requires verification)
  const canAccessExperts = () => {
    return user?.isEmailVerified || user?.isPhoneVerified;
  };

  // Handle requirements access attempt
  const handleRequirementsAccess = () => {
    if (canAccessRequirements()) {
              handleTabChange('requirements');
    } else {
      setVerificationFeatureName("Requirements Creation");
      setShowVerificationRequirement(true);
    }
  };

  // Refresh requirements after posting
  const refreshRequirements = () => {
    fetchRequirements();
    // Also refresh the main requirements list if on requirements tab
    if (activeTab === 'requirements') {
      fetchRequirementsPage(1, false);
    }
  };

  // Wrapper functions for verification from RequirementsTab
  const handleVerifyEmailFromRequirements = () => {
    handleTabChange('profile');
    setEditingProfile(true);
    setShowEmailVerification(true);
  };

  const handleVerifyPhoneFromRequirements = () => {
    handleTabChange('profile');
    setEditingProfile(true);
    setShowPhoneVerification(true);
  };

  // Email verification handlers
  const handleEmailVerification = async (otp) => {
    try {
      console.log('🔄 Verifying email OTP...');
      setIsEmailVerifying(true);
      
      // Verify the OTP and update email in one call
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ 
          email: profileForm.email,
          otp: otp,
          isProfileUpdate: true,
          userId: user?.id
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Email verified and updated successfully:', result);
        
        // Update local state
        setCurrentEmailVerified(true);
        setShowEmailVerification(false);
        setEmailChanged(false);
        
        // Update the user object with the new verified email
        if (user) {
          const updatedUser = { ...user, email: profileForm.email, isEmailVerified: true };
          console.log('🔄 Updating user state with new email:', updatedUser);
          setUser(updatedUser);
          
          // Update the profile form to reflect the change
          setProfileForm(prev => ({ ...prev, email: profileForm.email }));
          
          // Update the original email for change tracking
          setOriginalEmail(profileForm.email);
          
          console.log('🔄 Email updated locally. Now refreshing profile data...');
          
          // Refresh the profile data to get the updated information
          await fetchDashboardData();
          
          console.log('🔄 Profile data refreshed. Checking if email is updated...');
          console.log('Current profileForm.email:', profileForm.email);
          console.log('Current user?.email:', user?.email);
          
          showToast('success', 'Email verified and updated successfully!');
          console.log('✅ Email verification and update successful');
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Backend verification error:', errorData);
        showToast('error', errorData.message || 'Email verification failed');
      }
    } catch (error) {
      console.error('❌ Email verification error:', error);
      showToast('error', 'Email verification failed. Please try again.');
    } finally {
      setIsEmailVerifying(false);
    }
  };

  const handleSendEmailOtpForUpdate = async () => {
    try {
      console.log('🔄 Starting email OTP process...');
      
      // For profile updates, we need to check if the email is different from current user's email
      // If it's the same email, allow verification. If it's different, check availability.
      const isOwnEmail = profileForm.email === user?.email;
      
      if (!isOwnEmail) {
        // Only check availability if it's a different email
        const isAvailable = await checkEmailAvailability(profileForm.email);
        if (!isAvailable) {
          showToast('error', 'This email is already in use by another account.');
          return;
        }
        console.log('✅ New email is available, sending OTP...');
      } else {
        console.log('✅ Verifying own email, sending OTP...');
      }
      
      // For dashboard updates, we need to use a different approach
      // since the user is already authenticated and we're updating their profile
      setIsEmailSending(true);
      
      try {
        // Call the backend API directly for dashboard email verification
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/auth/send-email-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({ 
            email: profileForm.email,
            isProfileUpdate: true,
            userId: user?.id
          }),
        });

        if (response.ok) {
          setEmailOtpSent(true);
          setShowEmailVerification(true);
          showToast('success', 'Verification code sent to your email!');
          console.log('✅ OTP sent successfully');
        } else {
          const errorData = await response.json();
          console.error('❌ Backend error:', errorData);
          showToast('error', errorData.message || 'Failed to send verification code');
        }
      } catch (apiError) {
        console.error('❌ API call error:', apiError);
        showToast('error', 'Failed to send verification code. Please try again.');
      } finally {
        setIsEmailSending(false);
      }
    } catch (error) {
      console.error('❌ Error sending email OTP:', error);
      showToast('error', 'Failed to send verification code. Please try again.');
    }
  };

  // Phone verification handlers
  const handlePhoneVerification = async (otp) => {
    try {
      console.log('🔄 Verifying phone OTP...');
      setIsPhoneVerifying(true);
      
      // Verify the OTP and update phone in one call
      const requestBody = { 
        phone: profileForm.phone,
        otp: otp,
        isProfileUpdate: true,
        userId: user?.id
      };
      
      console.log('🔄 Sending phone verification request:', requestBody);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/auth/verify-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Phone verified and updated successfully:', result);
        console.log('🔄 Backend response details:', {
          message: result.message,
          isPreRegistration: result.isPreRegistration
        });
        
        // Update local state
        setCurrentPhoneVerified(true);
        setShowPhoneVerification(false);
        setPhoneChanged(false);
        
        // Update the user object with the new verified phone
        if (user) {
          const updatedUser = { ...user, phone: profileForm.phone, isPhoneVerified: true };
          console.log('🔄 Updating user state with new phone:', updatedUser);
          setUser(updatedUser);
          
          // Update the profile form to reflect the change
          setProfileForm(prev => ({ ...prev, phone: profileForm.phone }));
          
          // Update the original phone for change tracking
          setOriginalPhone(profileForm.phone);
          
          console.log('🔄 Phone number updated locally. Now refreshing profile data...');
          
          // Refresh the profile data to get the updated information
          await fetchDashboardData();
          
          console.log('🔄 Profile data refreshed. Checking if phone number is updated...');
          console.log('Current profileForm.phone:', profileForm.phone);
          console.log('Current user?.phone:', updatedUser.phone);
          
          showToast('success', 'Phone number verified and updated successfully!');
          console.log('✅ Phone verification and update successful');
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Backend verification error:', errorData);
        showToast('error', errorData.message || 'Phone verification failed');
      }
    } catch (error) {
      console.error('❌ Phone verification error:', error);
      showToast('error', 'Phone verification failed. Please try again.');
    } finally {
      setIsPhoneVerifying(false);
    }
  };

  const handleSendPhoneOtpForUpdate = async () => {
    try {
      console.log('🔄 Starting phone OTP process...');
      
      // For profile updates, we need to check if the phone is different from current user's phone
      // If it's the same phone, allow verification. If it's different, check availability.
      const isOwnPhone = profileForm.phone === user?.phone;
      
      if (!isOwnPhone) {
        // Only check availability if it's a different phone
        const isAvailable = await checkPhoneAvailability(profileForm.phone);
        if (!isAvailable) {
          showToast('error', 'This phone number is already in use by another account.');
          return;
        }
        console.log('✅ New phone is available, sending OTP...');
      } else {
        console.log('✅ Verifying own phone, sending OTP...');
      }
      
      // For dashboard updates, we need to use a different approach
      // since the user is already authenticated and we're updating their profile
      setIsPhoneSending(true);
      
      try {
        // Call the backend API directly for dashboard phone verification
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/auth/send-phone-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({ 
            phone: profileForm.phone,
            isProfileUpdate: true,
            userId: user?.id
          }),
        });

        if (response.ok) {
          setPhoneOtpSent(true);
          setShowPhoneVerification(true);
          showToast('success', 'Verification code sent to your phone!');
          console.log('✅ OTP sent successfully');
        } else {
          const errorData = await response.json();
          console.error('❌ Backend error:', errorData);
          showToast('error', errorData.message || 'Failed to send verification code');
        }
      } catch (apiError) {
        console.error('❌ API call error:', apiError);
        showToast('error', 'Failed to send verification code. Please try again.');
      } finally {
        setIsPhoneSending(false);
      }
    } catch (error) {
      console.error('❌ Error sending phone OTP:', error);
      showToast('error', 'Failed to send verification code. Please try again.');
    }
  };

  // Check email availability
  const checkEmailAvailability = async (email) => {
    try {
      // Import the checkAvailability function from verificationUtils
      const { checkAvailability } = await import('../../utils/verificationUtils');
      const result = await checkAvailability('email', email);
      return result.available;
    } catch (error) {
      console.error('Error checking email availability:', error);
      return false;
    }
  };

  // Check phone availability
  const checkPhoneAvailability = async (phone) => {
    try {
      // Import the checkAvailability function from verificationUtils
      const { checkAvailability } = await import('../../utils/verificationUtils');
      const result = await checkAvailability('phone', phone);
      return result.available;
    } catch (error) {
      console.error('Error checking phone availability:', error);
      return false;
    }
  };

  // Email validation function
  const isValidEmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation function
  const isValidPhone = (phone) => {
    if (!phone) return false;
    // Remove all non-digit characters except +
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    // Check if it starts with + (international) or just digits (local)
    if (cleanPhone.startsWith('+')) {
      // International format: +[country code][number] (total 7-15 digits)
      const phoneWithoutPlus = cleanPhone.substring(1);
      return phoneWithoutPlus.length >= 7 && phoneWithoutPlus.length <= 15;
    } else {
      // Local format: just digits (10-15 digits)
      return cleanPhone.length >= 10 && cleanPhone.length <= 15;
    }
  };

  // Handle input changes and track modifications
  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    
    // Track if email or phone has changed
    if (name === 'email') {
      if (value !== originalEmail) {
        setEmailChanged(true);
        // Hide OTP modal when email changes
        setShowEmailVerification(false);
        setEmailOtpSent(false);
      } else if (value === originalEmail) {
        setEmailChanged(false);
        // Hide OTP modal when email is set back to original
        setShowEmailVerification(false);
        setEmailOtpSent(false);
        // Reset verification states when email is set back to original verified email
        if (user?.isEmailVerified) {
          setCurrentEmailVerified(true);
        }
      }
    }
    
    if (name === 'phone') {
      if (value !== originalPhone) {
        setPhoneChanged(true);
        // Hide OTP modal when phone changes
        setShowPhoneVerification(false);
        setPhoneOtpSent(false);
      } else if (value === originalPhone) {
        setPhoneChanged(false);
        // Hide OTP modal when phone is set back to original
        setShowPhoneVerification(false);
        setPhoneOtpSent(false);
        // Reset verification states when phone is set back to original verified phone
        if (user?.isPhoneVerified) {
          setCurrentPhoneVerified(true);
        }
      }
    }
    
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle cancelling profile editing
  const handleCancelEditing = () => {
    setEditingProfile(false);
    setEmailChanged(false);
    setPhoneChanged(false);
    
    // Reset verification states
    setShowEmailVerification(false);
    setShowPhoneVerification(false);
    setEmailOtpSent(false);
    setPhoneOtpSent(false);
    setIsEmailSending(false);
    setIsPhoneSending(false);
    setIsEmailVerifying(false);
    setIsPhoneVerifying(false);
    
    // Reset profileForm to original values
    setProfileForm(prev => ({
      ...prev,
      email: originalEmail,
      phone: originalPhone
    }));
  };

  // Debug: Log profile changes
  useEffect(() => {
    console.log('🔍 Profile state changed:', profile);
    console.log('🔍 ProfileForm state changed:', profileForm);
    console.log('🔍 LogoPreview state changed:', logoPreview);
    console.log('🔍 User object from AuthContext:', user);
    console.log('🔍 User verification status:', {
      isEmailVerified: user?.isEmailVerified,
      isPhoneVerified: user?.isPhoneVerified,
      hasEmail: !!user?.email,
      hasPhone: !!user?.phone
    });
  }, [profile, profileForm, logoPreview, user]);

  // Sync profileForm with user data when user changes
  useEffect(() => {
    if (user) {
      console.log('🔄 User object changed, syncing profileForm...');
      console.log('🔄 New user phone:', user.phone);
      console.log('🔄 New user email:', user.email);
      
      setProfileForm(prev => ({
        ...prev,
        phone: user.phone || prev.phone,
        email: user.email || prev.email
      }));
      
      // Also update current verification status
      setCurrentEmailVerified(user.isEmailVerified || false);
      setCurrentPhoneVerified(user.isPhoneVerified || false);
    }
  }, [user]);

  // Initialize logoPreview when profile is loaded
  useEffect(() => {
    if (profile?.logoUrl) {
      console.log('🔍 Setting logoPreview from profile:', profile.logoUrl);
      setLogoPreview(profile.logoUrl);
    } else {
      console.log('🔍 No logoUrl in profile, setting logoPreview to null');
      setLogoPreview(null);
    }
  }, [profile?.logoUrl]);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const hideToast = () => {
    setToast(null);
  };

  useEffect(() => {
    fetchDashboardData();
    fetchRatingRequests();
  }, []);

  // Load requirements when requirements tab is active
  useEffect(() => {
    if (activeTab === 'requirements') {
      fetchRequirementsPage(1, false);
    }
  }, [activeTab]);

  // Fetch requirements from backend
  const fetchRequirements = async () => {
    try {
      console.log('🔄 fetchRequirements called - fetching recent requirements...');
      // Fetch only recent requirements for dashboard stats
      const recentResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/requirements/recent`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      console.log('📡 Recent requirements response status:', recentResponse.status);

      if (recentResponse.ok) {
        const recentRequirements = await recentResponse.json();
        
        console.log('📊 Recent requirements fetched:', recentRequirements);
        console.log('📊 Recent requirements count:', recentRequirements.length);
        
        setRecentRequirements(recentRequirements);
        setStats(prev => ({
          ...prev,
          totalRequirements: recentRequirements.length
        }));
      } else {
        console.error('❌ Failed to fetch recent requirements:', recentResponse.status);
      }
    } catch (error) {
      console.error('❌ Error fetching requirements:', error);
    }
  };

  // Infinite scroll function for requirements
  const fetchRequirementsPage = async (pageNum = 1, append = false) => {
    try {
      setLoadingMore(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/requirements/college?page=${pageNum}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (append) {
                  setRequirements(prev => [...prev, ...data.requirements]);
      } else {
        setRequirements(data.requirements);
      }
      
      setHasMore(data.hasNextPage);
      setPage(pageNum);
      setTotalRequirements(data.total);
        
        console.log(`📊 Requirements page ${pageNum} fetched:`, data.requirements.length);
      } else {
        console.error('Failed to fetch requirements page');
      }
    } catch (error) {
      console.error('Error fetching requirements page:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Load more requirements for infinite scroll
  const loadMoreRequirements = useCallback(() => {
    if (hasMore && !loadingMore) {
      fetchRequirementsPage(page + 1, true);
    }
  }, [hasMore, loadingMore, page]);

  // Load more rating requests for infinite scroll
  const loadMoreRatingRequests = useCallback(() => {
    if (ratingRequestsHasMore && !ratingRequestsLoadingMore) {
      fetchRatingRequests(ratingRequestsPage + 1, true);
    }
  }, [ratingRequestsHasMore, ratingRequestsLoadingMore, ratingRequestsPage]);

  // Auto-load more when scrolling to bottom
  useEffect(() => {
    const handleScroll = () => {
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Load more when user is near bottom (within 100px)
        if (scrollTop + windowHeight >= documentHeight - 100) {
        if (activeTab === 'requirements') {
          loadMoreRequirements();
        } else if (activeTab === 'rating-requests') {
          loadMoreRatingRequests();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab, loadMoreRequirements, loadMoreRatingRequests]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileData, statsData, requirementsData] = await Promise.all([
        apiService.getCollegeProfile(),
        apiService.getCollegeDashboardStats(),
        apiService.getCollegeRecentRequirements(5),
      ]);
      // Debug: Log the profile data received from backend
      console.log('=== PROFILE DATA RECEIVED FROM BACKEND ===');
      console.log('Full profile data:', profileData);
      console.log('Email field value:', profileData.email);
      console.log('Email field type:', typeof profileData.email);
      console.log('Email field truthy check:', !!profileData.email);
      console.log('Phone field value:', profileData.phone);
      console.log('Phone field type:', typeof profileData.phone);
      console.log('Phone field truthy check:', !!profileData.phone);
      console.log('=== USER DATA FROM AUTH CONTEXT ===');
      console.log('User object:', user);
      console.log('User email:', user?.email);
      console.log('User email verification:', user?.isEmailVerified);
      
      setProfile(profileData);
      setStats(statsData);
      setRecentRequirements(requirementsData);
      
      // Initialize profile form with proper default values
      const formData = {
        institutionName: profileData.institutionName || '',
        contactPersonName: profileData.contactPersonName || '',
        email: user?.email || profileData.email || '',
        institutionType: profileData.institutionType || 'UNIVERSITY',
        accreditation: profileData.accreditation || '',
        website: profileData.website || '',
        address: profileData.address || '',
        city: profileData.city || '',
        state: profileData.state || '',
        country: profileData.country || '',
        postalCode: profileData.postalCode || '',
        phone: user?.phone || profileData.phone || '', // Phone comes from user object, not profile
        logoUrl: profileData.logoUrl || '',
        description: profileData.description || '',
      };
      
      // Set original values for tracking changes
      setOriginalEmail(formData.email);
      setOriginalPhone(formData.phone);
      
      // Set current verification status
      setCurrentEmailVerified(user?.isEmailVerified || false);
      setCurrentPhoneVerified(user?.isPhoneVerified || false);
      
      // Debug: Log the form data being set
      console.log('=== FORM DATA BEING SET ===');
      console.log('Form data object:', formData);
      console.log('Phone in form data:', formData.phone);
      
      setProfileForm(formData);
    } catch (error) {
      showToast('error', 'Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      // Debug: Log the profile form data
      console.log('Profile form data being sent:', profileForm);
      
      // Check if email or phone has changed and require verification
      if (emailChanged) {
        if (!profileForm.email || !isValidEmail(profileForm.email)) {
          showToast('error', 'Please enter a valid email address before saving changes');
          return;
        }
        if (!currentEmailVerified) {
          showToast('error', 'Please verify your new email address before saving changes');
          return;
        }
      }
      
      if (phoneChanged) {
        if (!profileForm.phone || !isValidPhone(profileForm.phone)) {
          showToast('error', 'Please enter a valid phone number before saving changes');
          return;
        }
        if (!currentPhoneVerified) {
          showToast('error', 'Please verify your new phone number before saving changes');
          return;
        }
      }

      // Check if existing email or phone needs verification (only if not changed and not set back to original verified values)
      if (!user?.isEmailVerified && !emailChanged && profileForm.email !== originalEmail) {
        showToast('error', 'Please verify your email address before saving changes');
        return;
      }
      
      if (!user?.isPhoneVerified && !phoneChanged && profileForm.phone !== originalPhone) {
        showToast('error', 'Please verify your phone number before saving changes');
        return;
      }
      
      // Create a clean profile data object (similar to expert profile updates)
      const profileData = { ...profileForm };
      
      // Convert empty strings to undefined for optional fields
      Object.keys(profileData).forEach(key => {
        if (profileData[key] === '') {
          profileData[key] = undefined;
        }
      });
      
      // Debug: Log the final profile data
      console.log('Final profile data to send:', profileData);
      
      const updatedProfile = await apiService.updateCollegeProfile(profileData);
      setProfile(updatedProfile);
      setEditingProfile(false);
      
      // Reset change tracking
      setEmailChanged(false);
      setPhoneChanged(false);
      setOriginalEmail(profileData.email);
      setOriginalPhone(profileData.phone);
      
      showToast('success', 'Profile updated successfully!');
      const statsData = await apiService.getCollegeDashboardStats();
      setStats(statsData);
    } catch (error) {
      showToast('error', 'Failed to update profile');
      console.error('Profile update error:', error);
    }
  };

  const handleLogout = () => {
    logout();
    showToast('success', 'Logged out successfully!');
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchRequirements();
    }
  }, [user]);

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
              <span className={`text-sm font-medium text-slate-600`}>
                {change}
              </span>
            </div>
          )}
            </div>
          </div>
        </motion.div>
  );

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100/50 to-slate-100/60">
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
                {profile?.logoUrl ? (
                  <motion.img 
                    src={getFullLogoUrl(profile.logoUrl)} 
                    alt="Institution Logo" 
                    className="w-10 h-10 rounded-xl object-cover shadow-sm"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  />
                ) : (
                  <motion.div 
                    className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-sm"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Building2 className="w-5 h-5 text-white" />
                  </motion.div>
                )}
                <div>
                  <motion.h1 
                    className="text-base font-semibold text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {profile?.institutionName || 'College'}
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
                id="profile"
                label="Profile"
                icon={User}
                isActive={activeTab === 'profile'}
                onClick={handleTabChange}
              />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
              <SidebarItem
                id="requirements"
                label="Requirements"
                icon={BarChart3}
                isActive={activeTab === 'requirements'}
                onClick={(tabId) => {
                  handleTabChange(tabId);
                }}
              />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.25 }}
              >
              <SidebarItem
                id="applications"
                label="Applications"
                icon={CheckCircle}
                isActive={activeTab === 'applications'}
                onClick={(tabId) => {
                  handleTabChange(tabId);
                }}
              />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
              <SidebarItem
                id="experts"
                label="Expert Directory"
                icon={Users}
                isActive={activeTab === 'experts'}
                onClick={(tabId) => {
                  handleTabChange(tabId);
                }}
              />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.35 }}
              >
              <SidebarItem
                id="rating-requests"
                label="Rating Requests"
                icon={MessageCircle}
                isActive={activeTab === 'rating-requests'}
                onClick={() => setActiveTab('rating-requests')}
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
                className="group flex items-center space-x-3 w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 text-gray-300 hover:text-red-400 hover:bg-red-900/20"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  animate={{ rotate: 0 }}
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.2 }}
              >
                <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-400" />
                </motion.div>
                <span>Sign Out</span>
              </motion.button>
                </motion.div>
                </div>
            </div>

        {/* Main Content - Modern Light Theme */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white/80 backdrop-blur-sm rounded-l-3xl shadow-lg">
          {/* Modern Header */}
          <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200/60 px-8 py-6 shadow-sm">
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
                    {activeTab === 'overview' && 'Monitor your institution'}
                    {activeTab === 'profile' && 'Institution Profile'}
                    {activeTab === 'requirements' && 'Manage Requirements'}
                    {activeTab === 'applications' && 'Application Management'}
                    {activeTab === 'experts' && 'Expert Directory'}
                    {activeTab === 'ratings' && 'Ratings & Trust'}
                    {activeTab === 'rating-requests' && 'Rating Requests'}
                  </h1>
                </div>
                </div>

            </div>
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50/70">
            <div className="p-6 space-y-6">
              {/* All Tabs with Smooth Transitions */}
              <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                  {/* University Student Dashboard Style - Feature Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-4 text-white shadow-lg"
                >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-teal-100 text-sm font-medium">Profile Complete</p>
                          <p className="text-2xl font-bold mt-1">{stats.profileCompleteness}%</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <UserCheck className="w-6 h-6" />
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
                          <p className="text-blue-100 text-sm font-medium">Total Requirements</p>
                          <p className="text-2xl font-bold mt-1">{stats.totalRequirements}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-6 h-6" />
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
                          <p className="text-pink-100 text-sm font-medium">Urgent Requirements</p>
                          <p className="text-2xl font-bold mt-1">{stats.urgentRequirements}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <Clock className="w-6 h-6" />
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
                          <p className="text-purple-100 text-sm font-medium">Upcoming Deadlines</p>
                          <p className="text-2xl font-bold mt-1">{stats.upcomingDeadlines}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6" />
                        </div>
                      </div>
                    </motion.div>
                  </div>


                  {/* Subscription and Quick Actions Side by Side */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Subscription - Left Side */}
                    <motion.div 
                      className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 }}
                      whileHover={{ scale: 1.01 }}
                    >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Subscription</h3>
                </div>
                    {subsLoading ? (
                      <p className="text-gray-600">Loading subscription...</p>
                    ) : mySubscription ? (
                        <div className="relative">
                          {/* Background Pattern */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg opacity-50"></div>
                          
                          {/* Content */}
                          <div className="relative p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                  <CreditCard className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900">{mySubscription.plan.name}</h4>
                                  <p className="text-sm text-gray-600">
                                    {mySubscription.endsAt 
                                      ? `Expires ${new Date(mySubscription.endsAt).toLocaleDateString()}`
                                      : 'Lifetime Access'
                                    }
                                  </p>
                                </div>
                              </div>
                              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                Active
                              </div>
                            </div>
                            
                          </div>
                        </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CreditCard className="w-8 h-8 text-gray-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h4>
                        <p className="text-gray-600 mb-4">Choose a plan to unlock requirements and expert contacts</p>
                        <button 
                          onClick={openPlansPage} 
                          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                        >
                          Choose a Plan
                        </button>
                      </div>
                    )}
                    </motion.div>

                    {/* Quick Actions - Right Side */}
                    <motion.div 
                      className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.7 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Quick Actions</h3>
                      <div className="space-y-2">
                        <motion.button
                        onClick={() => handleCreateRequirementClick(() => handleTabChange('requirements'))}
                          className="group w-full flex items-center space-x-3 p-3 bg-white hover:bg-blue-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-all duration-200 hover:shadow-sm"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.8 }}
                        >
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center group-hover:from-blue-700 group-hover:to-cyan-700 transition-all duration-200">
                          <Plus className="h-5 w-5 text-white" />
    </div>
                        <div className="text-left">
                            <p className="font-medium text-gray-900">Post Requirement</p>
                            <p className="text-xs text-gray-500">Add new academic requirement</p>
          </div>
                        </motion.button>
                      
                        <motion.button
                        onClick={() => handleTabChange('experts')}
                          className="group w-full flex items-center space-x-3 p-3 bg-white hover:bg-green-50 rounded-lg border border-gray-100 hover:border-green-200 transition-all duration-200 hover:shadow-sm"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.9 }}
                        >
                          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-700 transition-colors">
                            <Users className="h-5 w-5 text-white" />
          </div>
                        <div className="text-left">
                            <p className="font-medium text-gray-900">Find Experts</p>
                            <p className="text-xs text-gray-500">Search for qualified experts</p>
        </div>
                        </motion.button>
                      
                        <motion.button
                        onClick={() => handleTabChange('profile')}
                          className="group w-full flex items-center space-x-3 p-3 bg-white hover:bg-purple-50 rounded-lg border border-gray-100 hover:border-purple-200 transition-all duration-200 hover:shadow-sm"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 1.0 }}
                        >
                          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center group-hover:bg-purple-700 transition-colors">
                          <Edit3 className="h-5 w-5 text-white" />
            </div>
                        <div className="text-left">
                            <p className="font-medium text-gray-900">Update Profile</p>
                            <p className="text-xs text-gray-500">Keep information current</p>
          </div>
                        </motion.button>
      </div>
                    </motion.div>
    </div>

                  {/* Recent Requirements - Full Width Below */}
                  <motion.div 
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Recent Requirements</h3>
                            <p className="text-sm text-gray-600">Your latest academic postings</p>
                          </div>
                        </div>
                        {recentRequirements.length > 0 && (
                          <button
                            onClick={() => handleTabChange('requirements')}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          >
                            <span>View all</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                      
                    <div className="p-6">
                      {recentRequirements.length === 0 ? (
                          <div className="text-center py-8">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                              <BarChart3 className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-gray-500 mb-2">No requirements posted yet</p>
                            <p className="text-sm text-gray-500">Start by posting your first academic requirement</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {recentRequirements.slice(0, 3).map((req) => (
                            <div key={req.id} className="group p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm hover:border-gray-300 transition-all duration-200">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{req.title}</p>
                                  <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      <Calendar className="w-3 h-3" />
                                      <span>Posted: {req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      }) : 'N/A'}</span>
                              </div>
                                    {req.department && (
                                      <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Briefcase className="w-3 h-3" />
                                        <span>{req.department}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 ml-4">
                                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${
                                req.status === 'ACTIVE' 
                                      ? 'bg-green-50 text-green-700 border-green-200' 
                                      : 'bg-gray-50 text-gray-700 border-gray-200'
                              }`}>
                                {req.status}
                              </span>
                                  <div className="w-6 h-6 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                                    <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-blue-600" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                            </div>
                          )}
                  </div>
                  </motion.div>

                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                 <ProfileTab 
                   profile={profile}
                   editingProfile={editingProfile}
                   setEditingProfile={setEditingProfile}
                   profileForm={profileForm}
                   setProfileForm={setProfileForm}
                   onUpdate={handleProfileUpdate}
                   onCancel={handleCancelEditing}
                   logoFile={logoFile}
                   setLogoFile={setLogoFile}
                   showToast={showToast}
                   setProfile={setProfile}
                   getFullLogoUrl={getFullLogoUrl}
                   user={user}
                   emailChanged={emailChanged}
                   phoneChanged={phoneChanged}
                   originalEmail={originalEmail}
                   originalPhone={originalPhone}
                   onEmailVerification={handleEmailVerification}
                   onPhoneVerification={handlePhoneVerification}
                   onSendEmailOtp={handleSendEmailOtpForUpdate}
                   onSendPhoneOtp={handleSendPhoneOtpForUpdate}
                   isEmailSending={isEmailSending}
                   isPhoneSending={isPhoneSending}
                   isEmailVerifying={isEmailVerifying}
                   isPhoneVerifying={isPhoneVerifying}
                   emailOtpSent={emailOtpSent}
                   phoneOtpSent={phoneOtpSent}
                   showEmailVerification={showEmailVerification}
                   showPhoneVerification={showPhoneVerification}
                   setShowEmailVerification={setShowEmailVerification}
                   setShowPhoneVerification={setShowPhoneVerification}
                   handleProfileInputChange={handleProfileInputChange}
                   currentEmailVerified={currentEmailVerified}
                   currentPhoneVerified={currentPhoneVerified}
                   stats={stats}
                 />
                </motion.div>
              )}

              {activeTab === 'requirements' && (
                <motion.div
                  key="requirements"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                <>
                  <RequirementsTab 
                    recentRequirements={recentRequirements} 
                    user={user} 
                    onVerifyEmail={handleVerifyEmailFromRequirements} 
                    onVerifyPhone={handleVerifyPhoneFromRequirements}
                    onPostRequirement={refreshRequirements}
                    showToast={showToast}
                    setActiveTab={handleTabChange}
                    onView={handleView}
                    onDelete={handleDelete}
                    onRate={handleRateExpert}
                    onToggleActive={handleToggleActive}
                    requirements={requirements}
                    setRequirements={setRequirements}
                    refreshRequirements={refreshRequirements}
                    totalRequirements={totalRequirements}
                    loading={loading}
                    loadingMore={loadingMore}
                    hasMore={hasMore}
                    loadMoreRequirements={loadMoreRequirements}
                    onCreateRequirementClick={handleCreateRequirementClick}
                    loadMySubscription={loadMySubscription}
                  />


                </>
                </motion.div>
              )}

              {activeTab === 'applications' && (
                <motion.div
                  key="applications"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                {activeTab === 'applications' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ApplicationManagement 
                      requirementId={null}
                      user={user}
                      onRefreshSubscription={loadMySubscription}
                    />
                  </motion.div>
                )}
                </motion.div>
              )}

              {activeTab === 'experts' && (
                <motion.div
                  key="experts"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                {activeTab === 'experts' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ExpertsTab 
                      user={user} 
                      mySubscription={mySubscription}
                      showPlanLimitationModal={setShowPlanLimitationModal}
                      setLimitationType={setLimitationType}
                      getLimitationDetails={getLimitationDetails}
                      key={`experts-${user?.id || 'no-user'}`} 
                    />
                  </motion.div>
                )}
                </motion.div>
              )}

              {activeTab === 'ratings' && (
                <motion.div
                  key="ratings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                {activeTab === 'ratings' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <RatingsTab user={user} key={`ratings-${user?.id || 'no-user'}`} />
                  </motion.div>
                )}
                </motion.div>
              )}

              {activeTab === 'rating-requests' && (
                <motion.div
                  key="rating-requests"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <RatingRequestsList 
                    ratingRequests={ratingRequests} 
                    onUpdate={() => fetchRatingRequests(1, false)}
                    hasMore={ratingRequestsHasMore}
                    loadingMore={ratingRequestsLoadingMore}
                    onLoadMore={loadMoreRatingRequests}
                  />
                </motion.div>
              )}
              </AnimatePresence>
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

      {/* Toast Notification */}
      {toast && (
        <Toast
          toast={{ ...toast, show: true }}
          hideToast={hideToast}
        />
      )}

      {/* Verification Modals */}
      <EmailVerificationModal
        isOpen={showEmailVerification}
        email={profileForm.email || user?.email}
        isVerifying={isEmailVerifying}
        onVerify={handleEmailVerification}
        onClose={() => setShowEmailVerification(false)}
        onSendOtp={handleSendEmailOtpForUpdate}
        isVerified={currentEmailVerified}
        isSending={isEmailSending}
        otpSent={emailOtpSent}
      />

      <PhoneVerificationModal
        isOpen={showPhoneVerification}
        phone={profileForm.phone || user?.phone}
        isVerifying={isPhoneVerifying}
        onVerify={handlePhoneVerification}
        onClose={() => setShowPhoneVerification(false)}
        onSendOtp={handleSendPhoneOtpForUpdate}
        isVerified={currentPhoneVerified}
        isSending={isPhoneSending}
        otpSent={phoneOtpSent}
      />

      {/* Verification Requirement Modal */}
      <VerificationRequirementModal
        isOpen={showVerificationRequirement}
        onClose={() => setShowVerificationRequirement(false)}
        onVerifyEmail={() => {
          setShowVerificationRequirement(false);
          handleTabChange('profile');
          setEditingProfile(true);
          setShowEmailVerification(true);
        }}
        onVerifyPhone={() => {
          setShowVerificationRequirement(false);
          handleTabChange('profile');
          setEditingProfile(true);
          setShowPhoneVerification(true);
        }}
        user={user}
        featureName={verificationFeatureName}
      />


      {/* View Requirement Page */}
      {showViewModal && viewingRequirement && (
        <div className="mb-8">
          <div className="mb-4">
            <h1 className="text-xl font-bold text-gray-900">View Requirement</h1>
          </div>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <p className="text-gray-900 font-medium">{viewingRequirement.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <p className="text-gray-900">{viewingRequirement.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
              </div>
            </div>

              {/* Subscription Summary */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Subscription</h3>
                  {mySubscription ? (
                    <span className="text-sm text-gray-600">Renews {mySubscription.endsAt ? new Date(mySubscription.endsAt).toLocaleDateString() : ''}</span>
                  ) : null}
                </div>
                {subsLoading ? (
                  <p className="text-gray-600">Loading subscription...</p>
                ) : mySubscription ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-700 mb-2">Plan: <span className="font-semibold">{mySubscription.plan.name}</span> • {mySubscription.plan.billingPeriod.toLowerCase()}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Requirements this period</p>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${Math.min(100, Math.round(((mySubscription.usages?.[0]?.usedRequirements || 0) / (mySubscription.plan.maxRequirements || Infinity)) * 100))}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{(mySubscription.usages?.[0]?.usedRequirements || 0)} / {mySubscription.plan.maxRequirements ?? '∞'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Expert contacts this period</p>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${Math.min(100, Math.round(((mySubscription.usages?.[0]?.usedExpertContacts || 0) / (mySubscription.plan.maxExpertContacts || Infinity)) * 100))}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{(mySubscription.usages?.[0]?.usedExpertContacts || 0)} / {mySubscription.plan.maxExpertContacts ?? '∞'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-gray-700">You don’t have an active subscription. Upgrade to post requirements and reveal expert contact info.</p>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleTabChange('requirements'); }} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">View Plans</a>
                  </div>
                )}
              </div>
              
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <p className="text-gray-900 leading-relaxed">{viewingRequirement.description}</p>
            </div>
              
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget (₹)</label>
                <p className="text-gray-900">{viewingRequirement.budget ? `₹${parseInt(viewingRequirement.budget).toLocaleString()}` : 'Not specified'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <p className="text-gray-900">
                  {viewingRequirement.deadline 
                    ? new Date(viewingRequirement.deadline).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : 'No deadline'
                  }
                </p>
              </div>
            </div>
              
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Urgent:</label>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                viewingRequirement.isUrgent 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {viewingRequirement.isUrgent ? 'Yes' : 'No'}
              </span>
            </div>

            {viewingRequirement.requiredSkills && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
                <p className="text-gray-900 leading-relaxed">{viewingRequirement.requiredSkills}</p>
              </div>
            )}

            {viewingRequirement.experience && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <p className="text-gray-900 leading-relaxed">{viewingRequirement.experience}</p>
              </div>
            )}
              
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowViewModal(false);
                  setViewingRequirement(null);
                }}
                className="px-6 py-3 bg-white text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-300 shadow-sm hover:shadow-md"
              >
                Back to Requirements
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Requirement"
        message="Are you sure you want to delete this requirement? This action will remove it from your dashboard and cannot be undone."
        itemName={requirementToDelete?.title}
        isLoading={isDeleting}
      />

      {/* Expert Rating Modal */}
      <ExpertRatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        expert={selectedExpert}
        requirement={selectedRequirement}
        application={selectedApplication}
        onRatingSubmitted={handleRatingSubmitted}
      />

      {/* Plan Limitation Modal */}
      {(() => {
        const limitationDetails = getCurrentLimitationDetails();
        return (
          <PlanLimitationModal
            isOpen={showPlanLimitationModal}
            onClose={handlePlanLimitationClose}
            onUpgrade={handlePlanLimitationUpgrade}
            limitationType={limitationType}
            currentUsage={limitationDetails?.currentUsage || 0}
            planLimit={limitationDetails?.planLimit || 0}
            planName={limitationDetails?.planName || ''}
          />
        );
      })()}
  </div>
);
};

// Profile Tab Component
const ProfileTab = ({ 
  profile, 
  editingProfile, 
  setEditingProfile, 
  profileForm, 
  setProfileForm, 
  onUpdate,
  onCancel,
  logoFile,
  setLogoFile,
  showToast,
  setProfile,
  getFullLogoUrl,
  user,
  emailChanged,
  phoneChanged,
  originalEmail,
  originalPhone,
  onEmailVerification,
  onPhoneVerification,
  onSendEmailOtp,
  onSendPhoneOtp,
  isEmailSending,
  isPhoneSending,
  isEmailVerifying,
  isPhoneVerifying,
  emailOtpSent,
  phoneOtpSent,
  showEmailVerification,
  showPhoneVerification,
  setShowEmailVerification,
  setShowPhoneVerification,
  handleProfileInputChange,
  currentEmailVerified,
  currentPhoneVerified,
  stats
}) => {
  console.log('🔄 ProfileTab rendered with props:', {
    editingProfile,
    onUpdate: !!onUpdate,
    onCancel: !!onCancel,
    profile: !!profile,
    user: !!user
  });
  const [logoPreview, setLogoPreview] = useState(profile?.logoUrl || null);
  const [logoUploading, setLogoUploading] = useState(false);

  // Update logo preview when profile changes
  useEffect(() => {
    setLogoPreview(profile?.logoUrl || null);
  }, [profile?.logoUrl]);

  // Sync profileForm with profile data and user data when they change
  useEffect(() => {
    if (profile && user) {
      console.log('🔄 ProfileTab: Syncing profileForm with profile and user data');
      console.log('🔄 Current profileForm:', profileForm);
      console.log('🔄 Profile data:', profile);
      console.log('🔄 User data:', user);
      
      setProfileForm(prev => {
        const updatedForm = {
          ...prev,
          email: user.email || profile.email || prev.email || '',
          phone: user.phone || profile.phone || prev.phone || '',
          institutionName: profile.institutionName || prev.institutionName || '',
          contactPersonName: profile.contactPersonName || prev.contactPersonName || '',
          institutionType: profile.institutionType || prev.institutionType || 'UNIVERSITY',
          accreditation: profile.accreditation || prev.accreditation || '',
          website: profile.website || prev.website || '',
          address: profile.address || prev.address || '',
          city: profile.city || prev.city || '',
          state: profile.state || prev.state || '',
          country: profile.country || prev.country || '',
          postalCode: profile.postalCode || prev.postalCode || '',
          logoUrl: profile.logoUrl || prev.logoUrl || '',
          description: profile.description || prev.description || '',
        };
        
        console.log('🔄 Updated profileForm:', updatedForm);
        return updatedForm;
      });
    }
  }, [profile, user, setProfileForm]);

  // Email validation function
  const isValidEmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation function
  const isValidPhone = (phone) => {
    if (!phone) return false;
    // Remove all non-digit characters except +
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    // Check if it starts with + (international) or just digits (local)
    if (cleanPhone.startsWith('+')) {
      // International format: +[country code][number] (total 7-15 digits)
      const phoneWithoutPlus = cleanPhone.substring(1);
      return phoneWithoutPlus.length >= 7 && phoneWithoutPlus.length <= 15;
    } else {
      // Local format: just digits (10-15 digits)
      return cleanPhone.length >= 10 && cleanPhone.length <= 15;
    }
  };

  const handleInputChange = (e) => {
    // Use the parent's input change handler for verification tracking
    handleProfileInputChange(e);
  };

  const handleLogoRemove = async () => {
    console.log('=== LOGO REMOVAL STARTED ===');
    console.log('Current logo preview:', logoPreview);
    console.log('Current logo file:', logoFile);
    console.log('Current profile logo:', profile?.logoUrl);
    
    try {
      // Remove logo from backend
      console.log('Calling removeCollegeLogo API...');
      const response = await apiService.removeCollegeLogo();
      console.log('Logo removal API response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', response ? Object.keys(response) : 'null/undefined');
      
      // If we get here, the API call was successful (no exception thrown)
      console.log('✅ Logo removal API call successful');
      
      // Check if response is null (204 No Content) or has expected format
      if (response === null) {
        console.log('✅ Response is null (204 No Content) - this is expected for DELETE');
      } else if (response && typeof response === 'object') {
        console.log('✅ Response is object with data:', response);
      } else {
        console.log('⚠️ Unexpected response format:', response);
      }
      
      // Always update local state when API succeeds
      setLogoPreview(null);
      setLogoFile(null);
      setProfileForm(prev => ({ ...prev, logoUrl: null }));
      setProfile(prev => ({ ...prev, logoUrl: null }));
      
      console.log('Local state updated, logo removed');
      showToast('success', 'Logo removed successfully!');
      
    } catch (error) {
      console.error('❌ Logo removal error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      showToast('error', `Failed to remove logo: ${error.message}`);
    }
  };

  const handleSave = async () => {
    // Call the parent's update function
    if (onUpdate) {
      onUpdate();
    } else {
      console.error('onUpdate prop not provided to ProfileTab');
    }
  };

  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <div className="mb-8">
        {/* Profile Completion Note */}
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Complete Your Profile</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-16 bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${stats.profileCompleteness || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">
                    {stats.profileCompleteness || 0}%
                  </span>
                </div>
              </div>
            </div>
            {stats.profileCompleteness < 100 && (() => {
              // Count missing fields
              const missingFields = [];
              if (!profile?.logoUrl) missingFields.push("Upload institution logo");
              if (!profile?.institutionName || profile?.institutionName === 'Not specified') missingFields.push("Add institution name");
              if (!profile?.contactPersonName || profile?.contactPersonName === 'Not specified') missingFields.push("Add contact person name");
              if (!profile?.institutionType || profile?.institutionType === 'Not specified') missingFields.push("Select institution type");
              if (!profile?.description || profile?.description === 'Not specified') missingFields.push("Add institution description");
              if (!profile?.accreditation || profile?.accreditation === 'Not specified') missingFields.push("Add accreditation details");
              if (!profile?.website || profile?.website === 'Not specified') missingFields.push("Add website URL");
              if (!profile?.address || profile?.address === 'Not specified') missingFields.push("Add institution address");
              if (!profile?.city || profile?.city === 'Not specified') missingFields.push("Add city");
              if (!profile?.state || profile?.state === 'Not specified') missingFields.push("Add state");
              if (!profile?.country || profile?.country === 'Not specified') missingFields.push("Add country");
              if (!profile?.postalCode || profile?.postalCode === 'Not specified') missingFields.push("Add postal code");

              // Show specific fields when 2-3 are missing, otherwise show count
              if (missingFields.length >= 2 && missingFields.length <= 3) {
                return (
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">
                      Missing:
                    </p>
                    <div className="space-y-0.5">
                      {missingFields.slice(0, 3).map((field, index) => (
                        <p key={index} className="text-xs text-gray-600">
                          • {field}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              } else {
                return (
                  <p className="text-xs text-gray-500">
                    {missingFields.length} field{missingFields.length > 1 ? 's' : ''} remaining
                  </p>
                );
              }
            })()}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div></div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (editingProfile) {
                console.log('🔄 Cancel button clicked, setting editingProfile to false...');
                onCancel();
              } else {
                console.log('🔄 Edit button clicked, setting editingProfile to true...');
                setEditingProfile(true);
              }
            }}
            className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 w-auto min-w-fit shadow-lg ${
              editingProfile
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-blue-600/25'
            }`}
          >
            {editingProfile ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
            <span className="whitespace-nowrap">{editingProfile ? 'Cancel' : 'Edit Profile'}</span>
          </motion.button>
        </div>

        {/* Logo Upload Section */}
        <div className="mb-6 sm:mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 sm:mb-4">Institution Logo</label>
            <FileUpload
              isEditing={editingProfile}
              onFileSelect={async (file) => {
                console.log('=== LOGO UPLOAD STARTED ===');
                console.log('File selected:', file);
                console.log('Current profile state:', profile);
                console.log('Current profileForm state:', profileForm);
                
                // Automatically upload the logo immediately (like expert profile)
                try {
                  setLogoUploading(true);
                  console.log('Calling uploadCollegeLogo API...');
                  const response = await apiService.uploadCollegeLogo(file);
                  console.log('Logo upload API response:', response);
                  console.log('Response type:', typeof response);
                  console.log('Response keys:', response ? Object.keys(response) : 'null/undefined');
                  
                  if (response && response.logoUrl) {
                    console.log('✅ Logo URL received:', response.logoUrl);
                    
                    // Update the profile form with the new logo URL
                    setProfileForm(prev => {
                      const updated = { ...prev, logoUrl: response.logoUrl };
                      console.log('Updated profileForm:', updated);
                      return updated;
                    });
                    
                    setLogoPreview(response.logoUrl);
                    setLogoFile(null);
                    
                    // Update the main profile state
                    setProfile(prev => {
                      const updated = { ...prev, logoUrl: response.logoUrl };
                      console.log('Updated profile state:', updated);
                      return updated;
                    });
                    
                    console.log('✅ State updates completed');
                    showToast('success', 'Logo uploaded successfully!');
                  } else {
                    console.error('❌ No logoUrl in response:', response);
                    showToast('error', 'Logo upload failed - no URL received');
                  }
                } catch (error) {
                  console.error('❌ Logo upload error:', error);
                  showToast('error', 'Failed to upload logo');
                  
                  // Reset on error
                  setLogoFile(null);
                  setLogoPreview(profile?.logoUrl || null);
                } finally {
                  setLogoUploading(false);
                }
              }}
              onRemove={() => {
                console.log('FileUpload onRemove callback triggered');
                handleLogoRemove();
              }}
              accept="image/*"
              maxSize={5}
              type="image"
              currentFile={getFullLogoUrl(profile?.logoUrl)}
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name</label>
            {editingProfile ? (
              <input
                type="text"
                name="institutionName"
                value={profileForm.institutionName || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
              />
            ) : (
              <input
                type="text"
                value={profile?.institutionName || 'Not specified'}
                disabled={true}
                className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-md border border-gray-300 disabled:bg-gray-50 disabled:text-gray-500 transition-colors text-sm"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
            {editingProfile ? (
              <input
                type="text"
                name="contactPersonName"
                value={profileForm.contactPersonName || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
              />
            ) : (
              <input
                type="text"
                value={profile?.contactPersonName || 'Not specified'}
                disabled={true}
                className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-md border border-gray-300 disabled:bg-gray-50 disabled:text-gray-500 transition-colors text-sm"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                          <div className="relative">
                {editingProfile ? (
                  <div className="space-y-2">
                    <div className="flex flex-col md:flex-row gap-2">
                      <input
                        type="email"
                        name="email"
                        value={profileForm.email || ''}
                        onChange={handleProfileInputChange}
                        className="flex-1 px-4 py-2.5 pr-12 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                        placeholder="Enter email address"
                      />
                      {(emailChanged || !user?.isEmailVerified) && (
                        <button
                          type="button"
                          onClick={onSendEmailOtp}
                          disabled={isEmailSending || !isValidEmail(profileForm.email)}
                          className="w-full md:w-auto px-4 md:px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap shadow-lg hover:shadow-xl"
                        >
                          {isEmailSending ? 'Sending...' : 'Verify Email'}
                        </button>
                      )}
                    </div>
                    {profileForm.email && !isValidEmail(profileForm.email) && (
                      <span className="text-xs text-red-600">Please enter a valid email address</span>
                    )}
                    
                    {/* Email Verification Modal - Inline */}
                    <EmailVerificationModal
                      isOpen={showEmailVerification}
                      email={profileForm.email || user?.email}
                      isVerifying={isEmailVerifying}
                      onVerify={onEmailVerification}
                      onClose={() => setShowEmailVerification(false)}
                      onSendOtp={onSendEmailOtp}
                      isVerified={currentEmailVerified}
                      isSending={isEmailSending}
                      otpSent={emailOtpSent}
                    />
                  </div>
              ) : (
                <input
                  type="email"
                  value={user?.email || profile?.email || 'Not specified'}
                  disabled={true}
                  className="w-full px-2 py-2 pr-12 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                />
              )}
              {currentEmailVerified && profileForm.email && !emailChanged && user?.isEmailVerified && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
              )}
            </div>
            {(user?.email || profile?.email) && (!currentEmailVerified || emailChanged) && !(profileForm.email === originalEmail && user?.isEmailVerified) && (
              <p className="text-xs text-amber-600 mt-1 flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span>{emailChanged ? 'New email needs verification' : 'Email not verified'}</span>
              </p>
            )}
          </div>

          {/* Institution Type field - Next to Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Institution Type</label>
            {editingProfile ? (
              <select
                name="institutionType"
                value={profileForm.institutionType || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
              >
                <option value="">Select Type</option>
                <option value="UNIVERSITY">University</option>
                <option value="COLLEGE">College</option>
                <option value="INSTITUTE">Institute</option>
                <option value="SCHOOL">School</option>
                <option value="OTHER">Other</option>
              </select>
            ) : (
              <input
                type="text"
                value={profile?.institutionType ? profile.institutionType.toLowerCase() : 'Not specified'}
                disabled={true}
                className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-md border border-gray-300 disabled:bg-gray-50 disabled:text-gray-500 transition-colors text-sm"
              />
            )}
          </div>

          {/* Description field - Full width, after Institution Name */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            {editingProfile ? (
              <textarea
                name="description"
                value={profileForm.description || ''}
                onChange={handleInputChange}
                rows={3}
                placeholder="Brief description of your institution..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm resize-none"
              />
            ) : (
              <textarea
                value={profile?.description || 'Not specified'}
                disabled={true}
                rows={3}
                className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-md border border-gray-300 disabled:bg-gray-50 disabled:text-gray-500 transition-colors text-sm resize-none"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Accreditation</label>
            {editingProfile ? (
              <input
                type="text"
                name="accreditation"
                value={profileForm.accreditation || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
              />
            ) : (
              <input
                type="text"
                value={profile?.accreditation || 'Not specified'}
                disabled={true}
                className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-md border border-gray-300 disabled:bg-gray-50 disabled:text-gray-500 transition-colors text-sm"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            {editingProfile ? (
              <input
                type="url"
                name="website"
                value={profileForm.website || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
              />
            ) : (
              <input
                type="text"
                value={profile?.website || 'Not specified'}
                disabled={true}
                className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-md border border-gray-300 disabled:bg-gray-50 disabled:text-gray-500 transition-colors text-sm"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <div className="relative">
              {editingProfile ? (
                <div className="space-y-2">
                  <div className="flex flex-col md:flex-row gap-2">
                    <input
                      type="tel"
                      name="phone"
                      value={profileForm.phone || ''}
                      onChange={handleProfileInputChange}
                        className="flex-1 px-4 py-2.5 pr-12 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                      placeholder="Enter phone number"
                    />
                    {(phoneChanged || !user?.isPhoneVerified) && (
                      <button
                        type="button"
                        onClick={onSendPhoneOtp}
                        disabled={isPhoneSending || !isValidPhone(profileForm.phone)}
                        className="w-full md:w-auto px-4 md:px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap shadow-lg hover:shadow-xl"
                      >
                        {isPhoneSending ? 'Sending...' : 'Verify Phone'}
                      </button>
                    )}
                  </div>
                  {profileForm.phone && !isValidPhone(profileForm.phone) && (
                    <span className="text-xs text-red-600">Please enter a valid phone number</span>
                  )}
                  
                  {/* Phone Verification Modal - Inline */}
                  <PhoneVerificationModal
                    isOpen={showPhoneVerification}
                    phone={profileForm.phone || user?.phone}
                    isVerifying={isPhoneVerifying}
                    onVerify={onPhoneVerification}
                    onClose={() => setShowPhoneVerification(false)}
                    onSendOtp={onSendPhoneOtp}
                    isVerified={currentPhoneVerified}
                    isSending={isPhoneSending}
                    otpSent={phoneOtpSent}
                  />
                </div>
              ) : (
                <input
                  type="text"
                  value={profile?.phone || 'Not specified'}
                  disabled={true}
                  className="w-full px-3 py-2 pr-12 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                />
              )}
              {currentPhoneVerified && profileForm.phone && !phoneChanged && user?.isPhoneVerified && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
              )}
            </div>
            {profile?.phone && (user?.isPhoneVerified === false || phoneChanged) && !(profileForm.phone === originalPhone && user?.isPhoneVerified) && (
              <p className="text-xs text-amber-600 mt-1 flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span>{phoneChanged ? 'New phone number needs verification' : 'Phone number not verified'}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            {editingProfile ? (
              <textarea
                name="address"
                value={profileForm.address || ''}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm resize-none"
              />
            ) : (
              <textarea
                value={profile?.address || 'Not specified'}
                disabled={true}
                rows={2}
                className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-md border border-gray-300 disabled:bg-gray-50 disabled:text-gray-500 transition-colors text-sm resize-none"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            {editingProfile ? (
              <input
                type="text"
                name="city"
                value={profileForm.city || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
              />
            ) : (
              <input
                type="text"
                value={profile?.city || 'Not specified'}
                disabled={true}
                className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-md border border-gray-300 disabled:bg-gray-50 disabled:text-gray-500 transition-colors text-sm"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            {editingProfile ? (
              <input
                type="text"
                name="state"
                value={profileForm.state || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
              />
            ) : (
              <input
                type="text"
                value={profile?.state || 'Not specified'}
                disabled={true}
                className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-md border border-gray-300 disabled:bg-gray-50 disabled:text-gray-500 transition-colors text-sm"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            {editingProfile ? (
              <input
                type="text"
                name="country"
                value={profileForm.country || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
              />
            ) : (
              <input
                type="text"
                value={profile?.country || 'Not specified'}
                disabled={true}
                className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-md border border-gray-300 disabled:bg-gray-50 disabled:text-gray-500 transition-colors text-sm"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
            {editingProfile ? (
              <input
                type="text"
                name="postalCode"
                value={profileForm.postalCode || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
              />
            ) : (
              <input
                type="text"
                value={profile?.postalCode || 'Not specified'}
                disabled={true}
                className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-md border border-gray-300 disabled:bg-gray-50 disabled:text-gray-500 transition-colors text-sm"
              />
            )}
          </div>
        </div>

        {editingProfile && (
          <div className="mt-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingProfile(false);
                  setLogoFile(null);
                  setLogoPreview(profile?.logoUrl || null);
                }}
                className="px-6 py-3 bg-white text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-300 shadow-sm hover:shadow-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 px-6 rounded-md font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Requirements Tab Component - Enhanced with form
const RequirementsTab = ({ recentRequirements, user, onVerifyEmail, onVerifyPhone, onPostRequirement, showToast, setActiveTab, onView, onDelete, onRate, onToggleActive, requirements, setRequirements, refreshRequirements, totalRequirements, loading, loadingMore, hasMore, loadMoreRequirements, onCreateRequirementClick, loadMySubscription }) => {
  // Check if user can access requirements creation
  const canAccessRequirements = () => {
    return user?.isEmailVerified || user?.isPhoneVerified;
  };
  const [showForm, setShowForm] = useState(false);
  const [requirementForm, setRequirementForm] = useState({
    title: '',
    category: '',
    description: '',
    budget: '',
    deadline: '',
    isUrgent: false,
    requiredSkills: '',
    experience: ''
  });
  
  // View requirement state
  const [viewingRequirement, setViewingRequirement] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // Remove duplicate loading logic since parent component handles it
  // The requirements are now passed as props from the parent component

  const loadRecentRequirements = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/requirements/recent`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRecentRequirements(data);
      }
    } catch (error) {
      console.error('Error loading recent requirements:', error);
    }
  };

  const handleInputChange = (e) => {
    console.log('Input change triggered:', e.target.name, e.target.value);
    const { name, value, type, checked } = e.target;
    
    // Handle category selection
    if (name === 'category') {
      if (value === 'OTHERS') {
        setShowCustomCategoryInput(true);
        setRequirementForm(prev => ({
          ...prev,
          [name]: value
        }));
      } else {
        setShowCustomCategoryInput(false);
        setCustomCategory('');
        setRequirementForm(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setRequirementForm(prev => {
        const newForm = {
          ...prev,
          [name]: type === 'checkbox' ? checked : value
        };
        console.log('Updated form:', newForm);
        return newForm;
      });
    }
  };

  const handleCustomCategoryChange = (e) => {
    setCustomCategory(e.target.value);
    // Don't update requirementForm.category here, keep it as 'OTHERS'
    // The actual custom value will be used during form submission
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditingRequirement(null);
    setShowCustomCategoryInput(false);
    setCustomCategory('');
    setRequirementForm({
      title: '',
      category: '',
      description: '',
      budget: '',
      deadline: '',
      isUrgent: false,
      requiredSkills: '',
      experience: ''
    });
  };

  const handleView = (requirement) => {
    setViewingRequirement(requirement);
    setShowViewModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate custom category if "OTHERS" is selected
    if (requirementForm.category === 'OTHERS' && showCustomCategoryInput && !customCategory.trim()) {
      showToast('error', 'Please enter a custom category');
      return;
    }
    
    try {
      // Prepare the data, handling empty deadline properly
      const formData = { ...requirementForm };
      
      // If category is "OTHERS", use the custom category value instead
      if (formData.category === 'OTHERS' && showCustomCategoryInput && customCategory.trim()) {
        formData.category = customCategory.trim();
      }
      
      // If deadline is empty string, set it to undefined to avoid validation issues
      if (formData.deadline === '') {
        formData.deadline = undefined;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/requirements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Requirement created successfully:', result);
        
        // Reset form and close
        setShowForm(false);
        setShowCustomCategoryInput(false);
        setCustomCategory('');
        setRequirementForm({
          title: '',
          category: '',
          description: '',
          budget: '',
          deadline: '',
          isUrgent: false,
          requiredSkills: '',
          experience: ''
        });
        
        // Refresh requirements list
        if (onPostRequirement) {
          onPostRequirement();
        }
        
        // Refresh subscription data to update usage counts
        await loadMySubscription();
        
        // Show success message
        showToast('success', 'Requirement created successfully!');
        
        // Refresh requirements using parent component's refresh function
        if (refreshRequirements) {
          refreshRequirements();
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Backend error:', errorData);
        showToast('error', errorData.message || 'Failed to create requirement');
      }
    } catch (error) {
      console.error('❌ Error creating requirement:', error);
      showToast('error', 'Failed to create requirement. Please try again.');
    }
  };

  const handleEdit = (requirement) => {
    console.log('Edit requirement data:', requirement);
    setEditingRequirement(requirement);
    
    // Check if the category is a custom one (not in predefined list)
    const predefinedCategories = [
      'DATA_SCIENCE_AI', 'CYBERSECURITY', 'SOFTWARE_DEVELOPMENT', 'INNOVATION',
      'DIGITAL_MARKETING', 'BUSINESS_STRATEGY', 'FINANCE', 'CONSULTING',
      'EDUCATION', 'RESEARCH', 'WORKSHOP', 'GUEST_LECTURE', 'MENTORING',
      'CURRICULUM_REVIEW', 'INDUSTRY_PROJECT', 'QUESTION_PAPER_SETTING',
      'QUESTION_PAPER_EVALUATION', 'TRAINING', 'PUBLIC_SPEAKING', 'LEADERSHIP',
      'HEALTHCARE', 'ENGINEERING', 'SUSTAINABILITY'
    ];
    
    const isCustomCategory = !predefinedCategories.includes(requirement.category);
    
    const formData = {
      title: requirement.title,
      category: isCustomCategory ? 'OTHERS' : requirement.category,
      description: requirement.description,
      budget: requirement.budget?.toString() || '',
      deadline: requirement.deadline ? new Date(requirement.deadline).toISOString().split('T')[0] : '',
      isUrgent: requirement.isUrgent,
      requiredSkills: requirement.requiredSkills || '',
      experience: requirement.experience || ''
    };
    console.log('Form data being set:', formData);
    setRequirementForm(formData);
    
    // Set custom category state if it's a custom category
    if (isCustomCategory) {
      setCustomCategory(requirement.category);
      setShowCustomCategoryInput(true);
    } else {
      setCustomCategory('');
      setShowCustomCategoryInput(false);
    }
    
    setShowEditForm(true);
    setShowForm(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // Validate custom category if "OTHERS" is selected
    if (requirementForm.category === 'OTHERS' && showCustomCategoryInput && !customCategory.trim()) {
      showToast('error', 'Please enter a custom category');
      return;
    }
    
    console.log('🔍 [FRONTEND] UPDATE BUTTON CLICKED');
    console.log('🔍 [FRONTEND] editingRequirement:', editingRequirement);
    console.log('🔍 [FRONTEND] requirementForm:', requirementForm);
    
    if (!editingRequirement || !editingRequirement.id) {
      console.error('❌ [FRONTEND] No editing requirement found!');
      showToast('error', 'No requirement selected for editing');
      return;
    }
    
    try {
      const formData = { ...requirementForm };
      
      // If category is "OTHERS", use the custom category value instead
      if (formData.category === 'OTHERS' && showCustomCategoryInput && customCategory.trim()) {
        formData.category = customCategory.trim();
      }
      
      // If deadline is empty string, set it to undefined
      if (formData.deadline === '') {
        formData.deadline = undefined;
      }
      
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/requirements/${editingRequirement.id}`;
      console.log('🔍 [FRONTEND] About to send PATCH request');
      console.log('🔍 [FRONTEND] API URL:', apiUrl);
      console.log('🔍 [FRONTEND] Request data:', formData);
      console.log('🔍 [FRONTEND] Access token exists:', !!localStorage.getItem('accessToken'));
      
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData),
      });

      console.log('🔍 [FRONTEND] Response received');
      console.log('🔍 [FRONTEND] Response status:', response.status);
      console.log('🔍 [FRONTEND] Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ [FRONTEND] Requirement updated successfully:', result);
        
        // Reset form and close
        setShowEditForm(false);
        setEditingRequirement(null);
        setShowCustomCategoryInput(false);
        setCustomCategory('');
        setRequirementForm({
          title: '',
          category: '',
          description: '',
          budget: '',
          deadline: '',
          isUrgent: false,
          requiredSkills: '',
          experience: ''
        });
        
        // Refresh requirements list
        showToast('success', 'Requirement updated successfully!');
        
        // Refresh requirements using parent component's refresh function
        if (refreshRequirements) {
          refreshRequirements();
        }
      } else {
        const errorData = await response.json();
        console.error('❌ [FRONTEND] Backend error:', errorData);
        showToast('error', `Error: ${errorData.message || 'Failed to update requirement'}`);
      }
    } catch (error) {
      console.error('❌ [FRONTEND] Network/Request error:', error);
      console.error('❌ [FRONTEND] Error name:', error.name);
      console.error('❌ [FRONTEND] Error message:', error.message);
      showToast('error', 'Failed to update requirement');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Google-style Layout */}
      <div className="max-w-4xl mx-auto px-8 py-6">
        {!showForm && !showEditForm && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-1">All Requirements ({totalRequirements})</h2>
              </div>
              <button 
                onClick={() => onCreateRequirementClick(setShowForm)}
                className="px-4 py-2 text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 rounded-md"
              >
                Create requirement
              </button>
            </div>
          </div>
        )}

        {showEditForm && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-1">All Requirements ({totalRequirements})</h2>
              </div>
              <button 
                onClick={handleCancelEdit}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md"
                title="Cancel Edit"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {showForm && (
          <div className="mb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={requirementForm.title || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                  placeholder="Enter the title of your requirement"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={requirementForm.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                >
                   <option value="">Select Category</option>
                   <optgroup label="Technology & Innovation">
                     <option value="DATA_SCIENCE_AI">Data Science & AI</option>
                     <option value="CYBERSECURITY">Cybersecurity</option>
                     <option value="SOFTWARE_DEVELOPMENT">Software Development</option>
                     <option value="INNOVATION">Innovation & Design</option>
                   </optgroup>
                   <optgroup label="Business & Marketing">
                     <option value="DIGITAL_MARKETING">Digital Marketing</option>
                     <option value="BUSINESS_STRATEGY">Business Strategy</option>
                     <option value="FINANCE">Finance</option>
                     <option value="CONSULTING">Consulting</option>
                   </optgroup>
                                     <optgroup label="Academic & Professional">
                    <option value="EDUCATION">Education</option>
                    <option value="RESEARCH">Research Collaboration</option>
                    <option value="WORKSHOP">Workshop</option>
                    <option value="GUEST_LECTURE">Guest Lecture</option>
                    <option value="MENTORING">Mentoring</option>
                    <option value="CURRICULUM_REVIEW">Curriculum Review</option>
                    <option value="INDUSTRY_PROJECT">Industry Project</option>
                    <option value="QUESTION_PAPER_SETTING">Question Paper Setting</option>
                    <option value="QUESTION_PAPER_EVALUATION">Question Paper Evaluation</option>
                  </optgroup>
                   <optgroup label="Training & Development">
                     <option value="TRAINING">Training & Development</option>
                     <option value="PUBLIC_SPEAKING">Public Speaking</option>
                     <option value="LEADERSHIP">Leadership Development</option>
                   </optgroup>
                   <optgroup label="Specialized Fields">
                     <option value="HEALTHCARE">Healthcare</option>
                     <option value="ENGINEERING">Engineering</option>
                     <option value="SUSTAINABILITY">Sustainability</option>
                   </optgroup>
                   <optgroup label="Other">
                     <option value="OTHERS">Others (Custom)</option>
                   </optgroup>
                 </select>
              </div>

            {/* Custom Category Input */}
            {showCustomCategoryInput && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Category *
                </label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={handleCustomCategoryChange}
                  placeholder="Enter your custom category..."
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                />
              </div>
            )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={requirementForm.description || ''}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm resize-none"
                  placeholder="Describe the requirement in detail..."
                  autoComplete="off"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      name="budget"
                      value={requirementForm.budget}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={requirementForm.deadline}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                  />
                </div>
                
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isUrgent"
                  checked={requirementForm.isUrgent}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Mark as Urgent
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Skills
                </label>
                <textarea
                  name="requiredSkills"
                  value={requirementForm.requiredSkills || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm resize-none"
                  placeholder="Specify any particular skills needed for the project..."
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience
                </label>
                <textarea
                  name="experience"
                  value={requirementForm.experience || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm resize-none"
                  placeholder="Specify required experience level or qualifications..."
                  autoComplete="off"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 px-6 rounded-md font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Create Requirement
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-white text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-300 shadow-sm hover:shadow-md"
                >
                  Back to Requirements
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Requirements Edit Form */}
        {showEditForm && (
          <div className="mb-8">
            <div className="mb-4">
              <h1 className="text-xl font-bold text-gray-900">Edit Requirement</h1>
            </div>
              
            <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={requirementForm.title || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                  placeholder="Enter the title of your requirement"
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={requirementForm.category || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                >
                      <option value="">Select Category</option>
                      <option value="DATA_SCIENCE_AI">Data Science & AI</option>
                      <option value="CYBERSECURITY">Cybersecurity</option>
                      <option value="SOFTWARE_DEVELOPMENT">Software Development</option>
                      <option value="INNOVATION">Innovation & Design</option>
                      <option value="DIGITAL_MARKETING">Digital Marketing</option>
                      <option value="BUSINESS_STRATEGY">Business Strategy</option>
                      <option value="FINANCE">Finance</option>
                      <option value="CONSULTING">Consulting</option>
                      <option value="EDUCATION">Education</option>
                      <option value="RESEARCH">Research Collaboration</option>
                      <option value="WORKSHOP">Workshop</option>
                      <option value="GUEST_LECTURE">Guest Lecture</option>
                      <option value="MENTORING">Mentoring</option>
                      <option value="CURRICULUM_REVIEW">Curriculum Review</option>
                      <option value="INDUSTRY_PROJECT">Industry Project</option>
                      <option value="QUESTION_PAPER_SETTING">Question Paper Setting</option>
                      <option value="QUESTION_PAPER_EVALUATION">Question Paper Evaluation</option>
                      <option value="TRAINING">Training & Development</option>
                      <option value="PUBLIC_SPEAKING">Public Speaking</option>
                      <option value="LEADERSHIP">Leadership Development</option>
                      <option value="HEALTHCARE">Healthcare</option>
                      <option value="ENGINEERING">Engineering</option>
                      <option value="SUSTAINABILITY">Sustainability</option>
                      <option value="OTHERS">Others</option>
                    </select>
              </div>

              {/* Custom Category Input for Edit Form */}
              {showCustomCategoryInput && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Category *
                  </label>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={handleCustomCategoryChange}
                    placeholder="Enter your custom category..."
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                  />
                </div>
              )}
                
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={requirementForm.description || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm resize-none"
                  placeholder="Describe your requirement in detail..."
                  autoComplete="off"
                />
              </div>
                
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                    <input
                      type="number"
                      name="budget"
                      value={requirementForm.budget || ''}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                      placeholder="0"
                      min="0"
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={requirementForm.deadline || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
                    autoComplete="off"
                  />
                </div>
              </div>
                
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isUrgent"
                  checked={requirementForm.isUrgent || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-700">Mark as Urgent</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Skills
                </label>
                <textarea
                  name="requiredSkills"
                  value={requirementForm.requiredSkills || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm resize-none"
                  placeholder="List the skills and expertise required..."
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience
                </label>
                <textarea
                  name="experience"
                  value={requirementForm.experience || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm resize-none"
                  placeholder="Specify required experience level or qualifications..."
                  autoComplete="off"
                />
              </div>
                
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 px-6 rounded-md font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Update Requirement
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-3 bg-white text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-300 shadow-sm hover:shadow-md"
                >
                  Back to Requirements
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Requirements List */}
        <div className="space-y-6">

          {loading && requirements.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 text-sm">Loading requirements...</p>
            </div>
          ) : requirements.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requirements yet</h3>
              <p className="text-gray-500 mb-6 text-sm">Create your first requirement to connect with experts</p>
              <button 
                onClick={() => onCreateRequirementClick(setShowForm)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl rounded-md"
              >
                Create requirement
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500 text-sm">Loading...</p>
                </div>
              ) : requirements.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No requirements found.</p>
                </div>
              ) : (
                requirements.map((requirement, index) => (
                  <RequirementCard
                    key={requirement.id}
                    requirement={requirement}
                    index={index}
                    showActions={true}
                    compact={false}
                    onView={() => handleView(requirement)}
                    onEdit={() => handleEdit(requirement)}
                    onDelete={() => onDelete(requirement.id)}
                    onToggleActive={() => onToggleActive(requirement)}
                  />
                ))
              )}
              
              {/* Infinite Scroll Load More Button */}
              {hasMore && (
                <div className="text-center pt-4 sm:pt-6">
                  <button
                    onClick={loadMoreRequirements}
                    disabled={loadingMore}
                    className="group relative w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded-xl font-semibold hover:from-slate-200 hover:to-slate-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-300/50 hover:border-slate-400/50 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    {loadingMore ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">Loading more...</span>
                      </div>
                    ) : (
                      <span className="flex items-center justify-center gap-2 text-sm">
                        <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        Load More Requirements
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* View Requirement Page */}
        {showViewModal && viewingRequirement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="mb-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-900">View Requirement</h1>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingRequirement(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <p className="text-gray-900 font-medium">{viewingRequirement.title}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <p className="text-gray-900">{viewingRequirement.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-900 leading-relaxed">{viewingRequirement.description}</p>
              </div>
                
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget (₹)</label>
                  <p className="text-gray-900">{viewingRequirement.budget ? `₹${parseInt(viewingRequirement.budget).toLocaleString()}` : 'Not specified'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                  <p className="text-gray-900">
                    {viewingRequirement.deadline 
                      ? new Date(viewingRequirement.deadline).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : 'No deadline'
                    }
                  </p>
                </div>
              </div>
                
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Urgent:</label>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  viewingRequirement.isUrgent 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {viewingRequirement.isUrgent ? 'Yes' : 'No'}
                </span>
              </div>

              {viewingRequirement.requiredSkills && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
                  <p className="text-gray-900 leading-relaxed">{viewingRequirement.requiredSkills}</p>
                </div>
              )}

              {viewingRequirement.experience && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                  <p className="text-gray-900 leading-relaxed">{viewingRequirement.experience}</p>
                </div>
              )}
                
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingRequirement(null);
                  }}
                  className="px-6 py-3 bg-white text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-300 shadow-sm hover:shadow-md"
                >
                  Back to Requirements
                </button>
              </div>
            </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

// Experts Tab Component
const ExpertsTab = ({ user, mySubscription, showPlanLimitationModal, setLimitationType, getLimitationDetails }) => {
  // Validate user prop
  if (!user) {
    console.error('ExpertsTab: user prop is undefined');
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Loading...</h3>
        <p className="text-gray-600 mb-4">Please wait while we load your information.</p>
      </div>
    );
  }
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [experts, setExperts] = useState([]);
  const [totalExperts, setTotalExperts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12
  });
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const categories = [
    'All Categories',
    'Technology & Innovation',
    'Business & Marketing',
    'Academic & Professional',
    'Training & Development',
    'Specialized Fields'
  ];

  // Helper function to get services for a category group
  const getServicesForCategory = (category) => {
    const categoryMap = {
      'Technology & Innovation': ['Data Science', 'AI', 'Cybersecurity', 'Software Development', 'Machine Learning', 'Python', 'Java', 'JavaScript', 'React', 'Node.js', 'Cloud Computing', 'DevOps'],
      'Business & Marketing': ['Digital Marketing', 'Business Strategy', 'Finance', 'Consulting', 'Marketing', 'Sales', 'Business Development', 'Project Management', 'Strategy', 'Analytics'],
      'Academic & Professional': ['Education', 'Research', 'Workshops', 'Lectures', 'Mentoring', 'Curriculum', 'Teaching', 'Academic Writing', 'Research Methods', 'Assessment'],
      'Training & Development': ['Training', 'Development', 'Public Speaking', 'Leadership', 'Soft Skills', 'Communication', 'Team Building', 'Coaching', 'Mentoring', 'Workshop Facilitation'],
      'Specialized Fields': ['Healthcare', 'Engineering', 'Sustainability', 'Medicine', 'Nursing', 'Civil Engineering', 'Mechanical Engineering', 'Environmental Science', 'Biotechnology']
    };
    return categoryMap[category] || [];
  };

  // Fetch experts from API
  const fetchExperts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const searchFilters = { ...filters };
      
      // Smart search logic: detect if search query might be a city and apply location filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim();
        
        // Check if the search query might be a city (common city names with variations)
        const commonCities = [
          'mumbai', 'delhi', 'bangalore', 'banglore', 'bengaluru', 'hyderabad', 'chennai', 'kolkata', 'pune', 
          'ahmedabad', 'jaipur', 'surat', 'lucknow', 'kanpur', 'nagpur', 'indore', 
          'thane', 'bhopal', 'visakhapatnam', 'pimpri-chinchwad', 'patna', 'vadodara',
          'noida', 'gurgaon', 'gurugram', 'faridabad', 'ghaziabad', 'meerut', 'raipur', 'ranchi', 'jabalpur',
          'bombay', 'calcutta', 'madras', // Include old names
          'bang', 'beng', 'bengal' // Include partial matches for bangalore
        ];
        
        // More flexible city matching - check if query contains city name or vice versa
        const isCitySearch = commonCities.some(city => {
          const queryLower = query.toLowerCase();
          const cityLower = city.toLowerCase();
          const match = queryLower.includes(cityLower) || cityLower.includes(queryLower) || queryLower === cityLower;
          if (match) {
            console.log('🔍 City match found:', { query: queryLower, city: cityLower });
          }
          return match;
        });
        
        if (isCitySearch) {
          // If it's a city search, only use location filter for better results
          console.log('🔍 City search detected:', query);
          searchFilters.location = query;
          // Don't set query when it's a city search to avoid conflicts
          delete searchFilters.query;
        } else {
          // Regular search query
          console.log('🔍 Regular search query:', query);
          searchFilters.query = query;
        }
      }
      
      // Add category filter if selected
      if (selectedCategory && selectedCategory !== 'All Categories') {
        // For category filtering, we'll search by category name in multiple fields
        // This is more flexible than trying to match specific skills
        if (searchFilters.query) {
          // If user has typed something, combine it with category
          searchFilters.query = `${searchFilters.query} ${selectedCategory}`;
        } else {
          // If no search query, just search by category
          searchFilters.query = selectedCategory;
        }
        // Remove skills filter as it's too restrictive
        delete searchFilters.skills;
      }
      
      console.log('🔍 Search query:', searchQuery);
      console.log('🔍 Final search filters:', searchFilters);
      console.log('🔍 API service instance:', apiService);
      console.log('🔍 API base URL:', apiService.baseURL);
      
      const response = await apiService.searchExperts(searchFilters);
      console.log('Search response:', response);
      console.log('Response experts:', response?.experts);
      console.log('Setting experts to:', response?.experts || []);
      
      if (filters.page === 1) {
        // First page: replace all experts
        setExperts(response?.experts || []);
      } else {
        // Subsequent pages: append new experts
        setExperts(prev => [...prev, ...(response?.experts || [])]);
      }
      
      setTotalExperts(response?.total || 0);
      
      // Check if there are more experts to load using backend's totalPages
      setHasMore(filters.page < (response?.totalPages || 1));
    } catch (err) {
      console.error('Error fetching experts:', err);
      
      // Handle authentication errors specifically
      if (err.message.includes('Authentication expired') || err.message.includes('Unauthorized')) {
        setError('Your session has expired. Please refresh the page and try again.');
      } else {
        setError('Failed to load experts. Please try again.');
      }
      setExperts([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, filters]);

  // Fetch experts on component mount and when filters change
  useEffect(() => {
    console.log('ExpertsTab mounted, user prop:', user);
    console.log('User authentication status:', {
      isAuthenticated: !!user,
      hasAccessToken: !!localStorage.getItem('accessToken'),
      user: user
    });
    console.log('Initial experts state:', experts);
    console.log('About to call fetchExperts...');
    fetchExperts();
  }, [user]); // Remove fetchExperts from dependencies to prevent double loading

  // Fetch experts when search query or filters change
  useEffect(() => {
    if (user) { // Only fetch if user is available
      fetchExperts();
    }
  }, [searchQuery, selectedCategory, filters.page, filters.limit]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreExperts();
        }
      },
      { threshold: 0.1 }
    );

    const loadMoreTrigger = document.getElementById('load-more-trigger');
    if (loadMoreTrigger) {
      observer.observe(loadMoreTrigger);
    }

    return () => {
      if (loadMoreTrigger) {
        observer.unobserve(loadMoreTrigger);
      }
    };
  }, [hasMore, isLoadingMore]);

  // Scroll event listener for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, page: 1 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);



  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  // Load more experts
  const loadMoreExperts = async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    setFilters(prev => ({ ...prev, page: prev.page + 1 }));
    setIsLoadingMore(false);
  };



  // Contact modal state
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [revealedContactDetails, setRevealedContactDetails] = useState(null);
  const [revealedExpertIds, setRevealedExpertIds] = useState(() => {
    // Load revealed expert IDs from localStorage on component mount
    const saved = localStorage.getItem('revealedExpertIds');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  
  // Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Handle contact expert
  const handleContactExpert = (expert) => {
    setSelectedExpert(expert);
    
    // Check if subscription is needed for contact revelation
    if (!mySubscription?.plan && !revealedExpertIds.has(expert.id)) {
      // User needs subscription to reveal contact
      const limitation = getLimitationDetails();
      if (limitation) {
        setLimitationType(limitation.type);
        showPlanLimitationModal(true);
        return;
      }
    }
    
    // Check if this expert has been revealed in current session
    if (revealedExpertIds.has(expert.id)) {
      // Expert was already revealed, show contact details
      setRevealedContactDetails({
        email: expert.user?.email,
        phone: expert.user?.phone,
        fullName: expert.user?.fullName
      });
    } else {
      // Expert not revealed yet, show masked details
      setRevealedContactDetails(null);
    }
    
    setShowContactModal(true);
  };

  // Handle view profile
  const handleViewProfile = (expert) => {
    setSelectedExpert(expert);
    setShowProfileModal(true);
  };

  // Close modals
  const closeContactModal = () => {
    setShowContactModal(false);
    setSelectedExpert(null);
    setRevealedContactDetails(null);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedExpert(null);
  };

  // Loading skeleton
  const ExpertSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="flex items-start space-x-4 mb-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">


      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search experts by name, expertise, skills, or company..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Category Filter */}
        <div className="sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 hover:border-blue-300 transition-colors text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Active Filters Indicator */}
        {(searchQuery || selectedCategory !== 'All Categories') && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Search: {searchQuery}
                </span>
              )}
              {selectedCategory !== 'All Categories' && (
                <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  Category: {selectedCategory}
                </span>
              )}
            </div>
          </div>
        )}



      {/* Results Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {loading ? 'Loading experts...' : (
                (searchQuery || selectedCategory !== 'All Categories') 
                  ? `${experts.length} Expert${experts.length !== 1 ? 's' : ''} Found`
                  : `${totalExperts} Expert${totalExperts !== 1 ? 's' : ''} Available`
              )}
            </h3>
            {searchQuery && (
              <p className="text-sm text-gray-600 mt-1">
                Results for "{searchQuery}"
              </p>
            )}
          </div>
          {experts.length > 0 && (
            <div className="text-sm text-gray-500">
              Showing {experts.length} of {totalExperts} experts
              {(searchQuery || selectedCategory !== 'All Categories') && totalExperts > experts.length && (
                <span className="ml-2 text-blue-600">
                  (filtered results)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchExperts}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ExpertSkeleton key={i} />
            ))}
          </div>
        )}

        {/* No Results State */}
        {!loading && !error && experts.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No experts found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? `No experts match your search for "${searchQuery}". Try adjusting your search terms.`
                : 'No experts are currently available. Please check back later.'
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Categories');
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Experts Grid */}
        {!loading && !error && experts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {experts.map(expert => (
              <motion.div
                key={expert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200"
              >
                {/* Expert Header - Compact */}
                <div className="p-3 pb-2">
                  <div className="flex items-center space-x-2 mb-2">
                    {expert.profilePicture ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                        <img
                          src={expert.profilePicture}
                          alt={`${expert.user?.fullName}'s profile`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold text-xs" style={{display: 'none'}}>
                      {expert.user?.fullName?.charAt(0) || 'E'}
                    </div>
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                        {expert.user?.fullName?.charAt(0) || 'E'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                        {expert.user?.fullName || 'Expert Name'}
                      </h4>
                      <p className="text-xs text-gray-600 truncate">
                        {expert.jobTitle || 'Professional'}
                      </p>
                    </div>
                    {expert.isVerified && (
                      <div className="bg-blue-100 p-1 rounded-full group-hover:bg-blue-200 transition-colors flex-shrink-0">
                        <Shield className="w-3 h-3 text-blue-600" />
                      </div>
                    )}
                  </div>

                  {/* Company & Location - Compact */}
                  <div className="space-y-1 mb-2">
                    <p className="text-xs text-gray-600 flex items-center">
                      <Building2 className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{expert.company || 'Company not specified'}</span>
                    </p>
                    {expert.location && (
                      <p className="text-xs text-gray-600 flex items-center">
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{expert.location}</span>
                      </p>
                    )}
                  </div>

                  {/* Rating - Compact */}
                  {expert.averageRating > 0 && (
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < Math.floor(expert.averageRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {expert.averageRating.toFixed(1)}
                      </span>
                    </div>
                  )}

                  {/* Hourly Rate - Compact */}
                  {expert.hourlyRate && (
                    <div className="mb-2">
                      <p className="text-sm font-semibold text-gray-900">
                        ₹{parseFloat(expert.hourlyRate).toFixed(0)}<span className="text-xs font-normal text-gray-600">/hr</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Skills - Compact */}
                {expert.expertskill && expert.expertskill.length > 0 && (
                  <div className="px-4 pb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {expert.expertskill.slice(0, 2).map(skill => (
                        <span key={skill.id} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200">
                          {skill.skillName}
                        </span>
                      ))}
                      {expert.expertskill.length > 2 && (
                        <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md border border-gray-200">
                          +{expert.expertskill.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Available For - Compact */}
                {expert.availableFor && Array.isArray(expert.availableFor) && expert.availableFor.length > 0 && (
                  <div className="px-4 pb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {expert.availableFor.slice(0, 1).map(service => (
                        <span key={service} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md border border-green-200">
                          {service}
                        </span>
                      ))}
                      {expert.availableFor.length > 1 && (
                        <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md border border-gray-200">
                          +{expert.availableFor.length - 1} more
                        </span>
                      )}
                    </div>

                  </div>
                )}

                {/* Action Buttons - Compact */}
                <div className="px-4 pb-4">
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleViewProfile(expert)}
                      className="px-6 py-2 bg-white text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-300 shadow-sm hover:shadow-md"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More Section */}
        {!loading && !error && experts.length > 0 && (
          <div className="text-center mt-8">
            {/* Load More Button (Manual) */}
            {hasMore && (
              <button
                onClick={loadMoreExperts}
                disabled={isLoadingMore}
                className="px-8 py-3 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingMore ? 'Loading...' : 'Load More Experts'}
              </button>
            )}
            
            {/* Loading More Indicator */}
            {isLoadingMore && (
              <div className="mt-4">
                <div className="inline-flex items-center space-x-2 text-gray-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading more experts...</span>
                </div>
              </div>
            )}
            
            {/* End of Results - Only show when there are many experts */}
            {!hasMore && experts.length > 0 && experts.length >= 20 && (
              <div className="mt-4 text-gray-500">
                <p>You've reached the end of all available experts.</p>
                <p className="text-sm">Showing {experts.length} of {totalExperts} experts</p>
              </div>
            )}
            
            {/* Intersection Observer Trigger for Auto-loading */}
            <div id="load-more-trigger" className="h-4 w-full" />
          </div>
        )}

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 z-40 flex items-center justify-center"
            title="Scroll to top"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        )}

        {/* Contact Modal */}
        {showContactModal && selectedExpert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {selectedExpert.profilePicture ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200">
                        <img
                          src={selectedExpert.profilePicture}
                          alt={`${selectedExpert.user?.fullName}'s profile`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {selectedExpert.user?.fullName?.charAt(0) || 'E'}
                      </div>
                    )}
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {selectedExpert.user?.fullName}
                      </h2>
                      <p className="text-sm text-gray-600">{selectedExpert.jobTitle}</p>
                      {selectedExpert.company && (
                        <p className="text-xs text-gray-500">{selectedExpert.company}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={closeContactModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                
                {/* Show message if already revealed */}
                {revealedContactDetails && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-green-700 font-medium">Contact details already revealed</span>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                {/* Email */}
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {revealedContactDetails?.email || (selectedExpert.user?.email ? '••••••••••@•••' : 'Not provided')}
                    </span>
                </div>

                {/* Phone */}
                {(revealedContactDetails?.phone || selectedExpert.user?.phone) && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {revealedContactDetails?.phone || '••••••••••'}
                      </span>
                  </div>
                )}
                
                {/* Single Reveal Button - only show if not revealed */}
                {!revealedContactDetails && (
                <div className="pt-3">
                  <button
                    onClick={async () => {
                      // Check subscription before revealing contact
                      if (!mySubscription?.plan) {
                        const limitation = getLimitationDetails();
                        if (limitation) {
                          setLimitationType(limitation.type);
                          showPlanLimitationModal(true);
                          return;
                        }
                      }
                      
                      try {
                        const response = await apiService.revealExpertContact(selectedExpert.id);
                        if (response.success && response.contactDetails) {
                          const { email, phone, fullName } = response.contactDetails;
                          
                          // Store revealed contact details in state
                          setRevealedContactDetails({
                            email,
                            phone,
                            fullName
                          });
                          
                          // Add expert ID to revealed set
                          setRevealedExpertIds(prev => {
                            const newSet = new Set([...prev, selectedExpert.id]);
                            // Save to localStorage
                            localStorage.setItem('revealedExpertIds', JSON.stringify([...newSet]));
                            return newSet;
                          });
                          
                          // Contact details revealed successfully
                          // Refresh subscription data to show updated usage
                          if (window.refreshSubscriptionData) {
                            await window.refreshSubscriptionData();
                          }
                        }
                      } catch (e) {
                        console.error('Contact revelation error:', e);
                        if (e.message && e.message.includes('Expert contact view limit reached')) {
                          // Show plan limitation modal for expert contacts
                          if (window.handleExpertContactLimit) {
                            window.handleExpertContactLimit();
                          }
                        } else {
                          alert(e.message || 'Unable to reveal contact. Please check your plan limits.');
                        }
                      }
                    }}
                    className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-medium rounded-md transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    Reveal Contact Details
                  </button>
                </div>
                )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 border-t border-gray-200 flex space-x-3">
                <button
                  onClick={closeContactModal}
                  className="px-6 py-2 bg-white text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-300 shadow-sm hover:shadow-md"
                >
                  Close
                </button>
                <button
                  onClick={async () => {
                    // Check subscription before revealing contact
                    if (!mySubscription?.plan) {
                      const limitation = getLimitationDetails();
                      if (limitation) {
                        setLimitationType(limitation.type);
                        showPlanLimitationModal(true);
                        return;
                      }
                    }
                    
                    try {
                      const response = await apiService.revealExpertContact(selectedExpert.id);
                      if (response.success && response.contactDetails) {
                        const { email, fullName } = response.contactDetails;
                        if (email) {
                          const mailtoLink = `mailto:${email}?subject=Collaboration Opportunity&body=Hi ${fullName},%0A%0AI'm interested in collaborating with you for a project. Could you please let me know your availability and discuss the details?%0A%0ABest regards,`;
                    window.open(mailtoLink, '_blank');
                          alert('Contact details revealed! Email client opened.');
                        } else {
                          alert('Email not available');
                        }
                        
                        // Add expert ID to revealed set
                        setRevealedExpertIds(prev => {
                          const newSet = new Set([...prev, selectedExpert.id]);
                          // Save to localStorage
                          localStorage.setItem('revealedExpertIds', JSON.stringify([...newSet]));
                          return newSet;
                        });
                        
                        // Contact details revealed successfully
                        // Note: Subscription usage will update when user navigates or refreshes
                      }
                    } catch (e) {
                      console.error('Contact revelation error:', e);
                      if (e.message && e.message.includes('Expert contact view limit reached')) {
                        // Show plan limitation modal for expert contacts
                        if (window.handleExpertContactLimit) {
                          window.handleExpertContactLimit();
                        }
                      } else {
                        alert(e.message || 'Unable to reveal contact. Please check your plan limits.');
                      }
                    }
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-md transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Contact Expert
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Profile Modal */}
        {showProfileModal && selectedExpert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Simple Header */}
              <div className="bg-white border-b border-gray-200 p-6 flex-shrink-0">
                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                  {selectedExpert.profilePicture ? (
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                      <img
                        src={selectedExpert.profilePicture}
                        alt={`${selectedExpert.user?.fullName}'s profile`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log('❌ Profile picture failed to load:', selectedExpert.profilePicture);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold text-xl" style={{display: 'none'}}>
                        {selectedExpert.user?.fullName?.charAt(0) || 'E'}
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                      {selectedExpert.user?.fullName?.charAt(0) || 'E'}
                    </div>
                  )}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedExpert.user?.fullName}
                      </h2>
                      <p className="text-gray-600">{selectedExpert.jobTitle}</p>
                      {selectedExpert.company && (
                        <p className="text-gray-500 text-sm">{selectedExpert.company}</p>
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
                  {selectedExpert.experience && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{selectedExpert.experience}</span>
                    </div>
                  )}
                  {selectedExpert.location && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedExpert.location}</span>
                    </div>
                  )}
                  {selectedExpert.hourlyRate && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-semibold text-green-600">₹{parseFloat(selectedExpert.hourlyRate).toFixed(0)}/hr</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                <div className="space-y-6">
                                     {/* About */}
                   {selectedExpert.bio && (
                     <div>
                       <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                       <p className="text-gray-700 leading-relaxed">{selectedExpert.bio}</p>
                     </div>
                   )}

                   {/* Primary Expertise */}
                   {selectedExpert.primaryExpertise && (
                     <div>
                       <h3 className="text-lg font-semibold text-gray-900 mb-3">Primary Expertise</h3>
                       <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                         <p className="text-gray-700 font-medium">
                           {selectedExpert.primaryExpertise?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                         </p>
                       </div>
                     </div>
                   )}

                   {/* Skills */}
                   {selectedExpert.expertskill && selectedExpert.expertskill.length > 0 && (
                     <div>
                       <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills & Expertise</h3>
                       <div className="flex flex-wrap gap-2">
                         {selectedExpert.expertskill.map(skill => (
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

                   {/* Available For */}
                   {selectedExpert.availableFor && Array.isArray(selectedExpert.availableFor) && selectedExpert.availableFor.length > 0 && (
                     <div>
                       <h3 className="text-lg font-semibold text-gray-900 mb-3">Available For</h3>
                       <div className="flex flex-wrap gap-2">
                         {selectedExpert.availableFor.map((service, index) => (
                           <span
                             key={index}
                             className="px-3 py-2 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200 font-medium"
                           >
                             {service}
                           </span>
                         ))}
                       </div>

                     </div>
                   )}

                   {/* Preferred Mode */}
                   {selectedExpert.preferredMode && (
                     <div>
                       <h3 className="text-lg font-semibold text-gray-900 mb-3">Preferred Mode</h3>
                       <div className="p-3 bg-gray-50 rounded-md">
                         <p className="text-gray-700">{selectedExpert.preferredMode}</p>
                       </div>
                     </div>
                   )}

                   {/* Work Experience Details */}
                   {selectedExpert.workexperience && selectedExpert.workexperience.length > 0 && (
                     <div>
                       <h3 className="text-lg font-semibold text-gray-900 mb-3">Work Experience</h3>
                       <div className="space-y-4">
                         {selectedExpert.workexperience.map((exp, index) => (
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
                             
                             {exp.skills && Array.isArray(exp.skills) && exp.skills.length > 0 && (
                               <div>
                                 <p className="text-sm font-medium text-gray-900 mb-2">Skills Used:</p>
                                 <div className="flex flex-wrap gap-2">
                                   {exp.skills.map((skill, skillIndex) => (
                                     <span
                                       key={skillIndex}
                                       className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200"
                                     >
                                       {skill}
                                     </span>
                                   ))}
                                 </div>
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
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                        {!revealedExpertIds.has(selectedExpert.id) && (
                          <button
                            onClick={async () => {
                              // Check subscription before revealing contact
                              if (!mySubscription?.plan) {
                                const limitation = getLimitationDetails();
                                if (limitation) {
                                  setLimitationType(limitation.type);
                                  showPlanLimitationModal(true);
                                  return;
                                }
                              }
                              
                              try {
                                const response = await apiService.revealExpertContact(selectedExpert.id);
                                if (response.success && response.contactDetails) {
                                  // Add expert ID to revealed set
                                  setRevealedExpertIds(prev => {
                                    const newSet = new Set([...prev, selectedExpert.id]);
                                    // Save to localStorage
                                    localStorage.setItem('revealedExpertIds', JSON.stringify([...newSet]));
                                    return newSet;
                                  });
                                  
                                    // Refresh subscription data to show updated usage
                                    if (window.refreshSubscriptionData) {
                                      await window.refreshSubscriptionData();
                                    }
                                }
                              } catch (e) {
                                console.error('Contact revelation error:', e);
                                if (e.message && e.message.includes('Expert contact view limit reached')) {
                                  // Show plan limitation modal for expert contacts
                                  if (window.handleExpertContactLimit) {
                                    window.handleExpertContactLimit();
                                  }
                                } else {
                                  alert(e.message || 'Unable to reveal contact. Please check your plan limits.');
                                }
                              }
                            }}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1 border border-indigo-300 rounded-md hover:bg-indigo-50 transition-colors"
                          >
                            Reveal
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 p-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            {revealedExpertIds.has(selectedExpert.id) ? selectedExpert.user?.email : '••••••••••@•••'}
                          </span>
                        </div>
                        {selectedExpert.user?.phone && (
                          <div className="flex items-center space-x-3 p-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">
                              {revealedExpertIds.has(selectedExpert.id) ? selectedExpert.user?.phone : '••••••••••'}
                            </span>
                          </div>
                        )}
                        {selectedExpert.website && (
                          <div className="flex items-center space-x-3 p-2">
                            <Building2 className="w-4 h-4 text-gray-500" />
                            <a
                              href={selectedExpert.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Visit Website
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                                         {/* Documents */}
                     {selectedExpert.resumeUrl && (
                       <div>
                         <h3 className="text-lg font-semibold text-gray-900 mb-3">Documents</h3>
                         <div className="space-y-2">
                           <a
                             href={selectedExpert.resumeUrl}
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
              <div className="bg-gray-50 border-t border-gray-200 p-4 flex-shrink-0">
                <div className="flex space-x-3">
                  <button
                    onClick={closeProfileModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      if (revealedExpertIds.has(selectedExpert.id) && selectedExpert.user?.email) {
                        const subject = `Expert Inquiry - ${selectedExpert.user.fullName}`;
                        const body = `Dear ${selectedExpert.user.fullName},\n\nI hope this email finds you well. I am reaching out regarding your expertise.\n\nBest regards,`;
                        const mailtoLink = `mailto:${selectedExpert.user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(mailtoLink);
                        closeProfileModal();
                      }
                    }}
                    disabled={!revealedExpertIds.has(selectedExpert.id)}
                    className={`px-4 py-2 rounded-md transition-all duration-300 ${
                      revealedExpertIds.has(selectedExpert.id)
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Contact Expert
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

// Ratings Tab Component
const RatingsTab = ({ user }) => {
  const [receivedRatings] = useState([
    {
      id: 1,
      expertName: 'Dr. Sarah Johnson',
      rating: 4.8,
      comment: 'Excellent workshop on Data Science fundamentals. Students were highly engaged.',
      date: '2024-01-15',
      category: 'Workshop'
    },
    {
      id: 2,
      expertName: 'Prof. Michael Chen',
      rating: 4.9,
      comment: 'Outstanding contribution to our cybersecurity curriculum review.',
      date: '2024-01-10',
      category: 'Curriculum Review'
    }
  ]);

  const [trustBadges] = useState([
    { name: 'Verified Institution', icon: Shield, color: 'blue' },
    { name: 'Quality Partner', icon: Award, color: 'green' },
    { name: 'Active Collaborator', icon: Users, color: 'purple' }
  ]);

  return (
    <div className="space-y-8">
      {/* Trust Badges */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Trust Badges & Recognition</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trustBadges.map((badge, index) => {
            const Icon = badge.icon;
            const colorClasses = {
              blue: 'bg-blue-50 text-blue-700 border-blue-200',
              green: 'bg-green-50 text-green-700 border-green-200',
              purple: 'bg-purple-50 text-purple-700 border-purple-200'
            };
            
            return (
              <div key={index} className={`p-6 rounded-xl border ${colorClasses[badge.color]} text-center hover:shadow-md transition-all duration-200`}>
                <Icon className={`w-10 h-10 mx-auto mb-3 text-${badge.color}-600`} />
                <h4 className="font-semibold text-gray-900">{badge.name}</h4>
                <p className="text-sm text-gray-600 mt-1">Verified and trusted</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Received Ratings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Ratings Received from Experts</h3>
          <div className="text-sm text-gray-500">
            {receivedRatings.length} rating{receivedRatings.length !== 1 ? 's' : ''} received
          </div>
        </div>
        
        <div className="space-y-4">
          {receivedRatings.map(rating => (
            <div key={rating.id} className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-sm transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{rating.expertName}</h4>
                  <p className="text-sm text-gray-600">{rating.category}</p>
                </div>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${i < Math.floor(rating.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                  <span className="ml-2 text-sm font-semibold text-gray-900">{rating.rating}</span>
                </div>
              </div>
              <p className="text-gray-700 mb-3 leading-relaxed">{rating.comment}</p>
              <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">{new Date(rating.date).toLocaleDateString()}</p>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">Verified</span>
                </div>
              </div>
            </div>
          ))}
        </div>
    </div>
  </div>
  );
};

export default CollegeDashboard;
