import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ExpertProfileModal from '../../components/common/ExpertProfileModal';
import { useNavigate, useLocation } from 'react-router-dom';
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
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../utils/api';
import Toast from '../../components/common/Toast';
import { usePaymentCallback } from '../../hooks/usePaymentCallback';
import FileUpload from '../../components/common/FileUpload';
import EmailVerificationModal from '../../components/verification/EmailVerificationModal';
import PhoneVerificationModal from '../../components/verification/PhoneVerificationModal';
import ExpertRatingModal from '../../components/college/ExpertRatingModal';
import ExpertRatingDisplay from '../../components/college/ExpertRatingDisplay';
import RatingRequestsList from '../../components/college/RatingRequestsList';
import VerificationRequirementModal from '../../components/common/VerificationRequirementModal';
import RequirementCard from '../../components/common/RequirementCard';
import CountrySelector from '../../components/common/CountrySelector';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import ApplicationManagement from '../../components/college/ApplicationManagement';
import PlanLimitationModal from '../../components/common/PlanLimitationModal';
import { formatCurrency } from '../../utils/currency';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardOverview from './components/DashboardOverview';
import ProfileTab from './components/ProfileTab';
import RequirementsTab from './components/RequirementsTab';
import ExpertsTab from './components/ExpertsTab';
import RatingsTab from './components/RatingsTab';

// Utility functions for phone number handling
const extractPhoneDigits = (phone) => {
  if (!phone) return '';
  // Remove all non-digit characters
  return phone.replace(/\D/g, '');
};

const extractPhoneWithoutCountryCode = (phone) => {
  if (!phone) return '';
  // Remove + and spaces, get only digits
  const digits = phone.replace(/\D/g, '');

  // Try to match known country codes and remove them
  const countryCodes = ['91', '1', '44', '61', '49', '33', '81', '86', '55', '52', '65', '971', '966', '27'];

  for (const code of countryCodes) {
    if (digits.startsWith(code)) {
      const remaining = digits.substring(code.length);
      // If remaining is 10 digits (typical phone length), return it
      if (remaining.length === 10) {
        return remaining;
      }
    }
  }

  // If no country code matched, return last 10 digits (assuming it's a phone number)
  return digits.length > 10 ? digits.substring(digits.length - 10) : digits;
};

const detectCountryFromPhone = (phone) => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');

  // Country code mapping
  const countryMap = {
    '91': { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
    '1': { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
    '44': { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
    '61': { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
    '49': { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
    '33': { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
    '81': { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
    '86': { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
    '55': { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
    '52': { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽' },
    '65': { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
    '971': { code: 'AE', name: 'UAE', dialCode: '+971', flag: '🇦🇪' },
    '966': { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
    '27': { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  };

  // Check for country codes (longer codes first to avoid partial matches)
  const sortedCodes = Object.keys(countryMap).sort((a, b) => b.length - a.length);
  for (const code of sortedCodes) {
    if (digits.startsWith(code)) {
      return countryMap[code];
    }
  }

  // Default to India
  return countryMap['91'];
};

const CollegeDashboard = () => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get active tab from URL or default to 'overview'
  const [activeTab, setActiveTab] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tab') || 'overview';
  });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const hideToast = () => {
    setToast(null);
  };

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

      // Extract phone digits (without country code) for display
      const phoneDigits = formData.phone ? extractPhoneWithoutCountryCode(formData.phone) : '';
      formData.phone = phoneDigits;

      // Set original values for tracking changes
      setOriginalEmail(formData.email);
      setOriginalPhone(user?.phone || profileData.phone || '');

      // Set current verification status
      setCurrentEmailVerified(user?.isEmailVerified || false);
      setCurrentPhoneVerified(user?.isPhoneVerified || false);

      // Initialize country selector based on phone number
      if (user?.phone || profileData.phone) {
        const fullPhone = user?.phone || profileData.phone;
        const detectedCountry = detectCountryFromPhone(fullPhone);
        if (detectedCountry) {
          setSelectedCountry(detectedCountry);
        }
      } else {
        // Default to India if no phone
        setSelectedCountry({ code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' });
      }

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
  const [requirementsSearch, setRequirementsSearch] = useState('');
  const requirementsSearchDebounceRef = useRef(null);
  const requirementsFetchAbortRef = useRef(null);

  const handleRequirementsSearchChange = (value) => {
    setRequirementsSearch(value);
    // Debounce immediate fetch to avoid spamming the API
    if (requirementsSearchDebounceRef.current) {
      clearTimeout(requirementsSearchDebounceRef.current);
    }
    requirementsSearchDebounceRef.current = setTimeout(() => {
      fetchRequirementsPage(1, false);
    }, 300);
  };

  // Expose an explicit trigger for immediate reload (e.g., Enter press)
  const triggerRequirementsReload = () => {
    fetchRequirementsPage(1, false);
  };
  const [totalRequirements, setTotalRequirements] = useState(0);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(null);
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

  // Expert contact revelation state
  const [revealedExpertIds, setRevealedExpertIds] = useState(new Set());

  // Plan limitation modal state
  const [showPlanLimitationModal, setShowPlanLimitationModal] = useState(false);
  const [limitationType, setLimitationType] = useState(null);

  // Tab management with URL persistence
  // Tab management with URL persistence
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`?tab=${tabId}`, { replace: true });
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

      // Load revealed expert IDs from backend subscription data
      console.log('Raw subscription data:', JSON.stringify(data, null, 2));

      if (data?.usages?.[0]?.revealedExpertIds) {
        console.log('Found revealedExpertIds:', data.usages[0].revealedExpertIds);
        setRevealedExpertIds(new Set(data.usages[0].revealedExpertIds));
      } else {
        console.log('No revealedExpertIds found in subscription data');
        setRevealedExpertIds(new Set());
      }
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

      // For paid plans, proceed with Cashfree
      const { paymentSessionId, order, cashfreeMode, paymentLink } = response;

      // ✅ Use Cashfree JS SDK to open checkout (required - /pg/payments/ is SDK-only)
      // The /pg/payments/{session_id} endpoint is SDK-only and cannot be accessed via direct redirect

      // If Cashfree provided a payment_link (hosted link), use that directly
      if (paymentLink && paymentLink.includes('/pg/view/')) {
        console.log('✅ Using Cashfree payment_link (hosted link):', paymentLink);
        window.location.replace(paymentLink);
        return;
      }

      // Otherwise, use Cashfree JS SDK to open checkout
      if (!paymentSessionId) {
        throw new Error('Payment session ID is required to open checkout');
      }

      // Clean paymentSessionId (remove any trailing "payment" duplicates)
      const cleanSessionId = paymentSessionId.replace(/(payment)+$/i, '');

      // Validate session ID format
      if (!cleanSessionId.startsWith('session_')) {
        throw new Error('Invalid payment session ID received');
      }

      console.log('✅ Opening Cashfree checkout using JS SDK');

      // Load Cashfree SDK v3 (matching working example pattern)
      const loadCashfreeSDK = () => {
        return new Promise((resolve, reject) => {
          if (window.Cashfree) {
            resolve(window.Cashfree);
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
          script.onload = () => {
            if (window.Cashfree) {
              resolve(window.Cashfree);
            } else {
              reject(new Error('Cashfree SDK failed to load'));
            }
          };
          script.onerror = () => reject(new Error('Failed to load Cashfree SDK'));
          document.body.appendChild(script);
        });
      };

      const CashfreeSDK = await loadCashfreeSDK();
      const cashfree = CashfreeSDK({
        mode: cashfreeMode === 'production' ? 'production' : 'sandbox',
      });

      const checkoutOptions = {
        paymentSessionId: cleanSessionId.trim(),
        redirectTarget: '_self',
      };

      cashfree.checkout(checkoutOptions)
        .then(async (result) => {
          console.log('Cashfree checkout result:', result);

          if (result.error) {
            console.error('Payment error:', result.error);
            showToast('error', result.error.message || 'Payment failed');
            setSubscribingPlanId(null);
            return;
          }

          if (result.paymentDetails) {
            try {
              const payload = {
                provider: 'CASHFREE',
                orderId: order.id,
                paymentSessionId: cleanSessionId,
                paymentDetails: result.paymentDetails,
                result,
              };
              const confirmationResult = await apiService.confirmRazorpayPayment(planId, payload);

              if (confirmationResult?.success) {
                showToast('success', 'Subscription activated');
                setShowPlansModal(false);
                await loadMySubscription();
              } else {
                showToast('error', confirmationResult?.error || 'Activation failed');
              }
            } catch (err) {
              console.error('Error confirming payment:', err);
              showToast('error', 'Payment completed but there was an error');
            }
          }
        })
        .catch((err) => {
          // User cancelled or payment failed
          console.log('Payment cancelled or failed:', err);
          if (err && err.message && !err.message.includes('User closed')) {
            showToast('error', 'Payment was cancelled or failed. Please try again.');
          }
          setSubscribingPlanId(null);
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

  // Load subscription data when component mounts and when switching to relevant tabs
  useEffect(() => {
    loadMySubscription();
  }, []); // Load on mount

  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'requirements' || activeTab === 'experts') {
      loadMySubscription();
    }
  }, [activeTab]);

  // Sync activeTab state with URL changes (handles forward/back and deep linking)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [location.search]);

  // Handle payment callback from Cashfree redirect
  usePaymentCallback(loadMySubscription, showToast);

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/requirements/${requirementToDelete.id}`, {
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
    const baseUrl = import.meta.env.VITE_BASE_URL;
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-email`, {
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
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/send-email-otp`, {
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

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-phone`, {
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

      // Combine country code with phone number
      // Ensure phone doesn't already have country code prefix
      const phoneWithoutPrefix = profileForm.phone ? extractPhoneWithoutCountryCode(profileForm.phone) : '';
      const fullPhoneNumber = phoneWithoutPrefix && selectedCountry
        ? `${selectedCountry.dialCode}${phoneWithoutPrefix}`
        : (phoneWithoutPrefix || profileForm.phone);

      // For profile updates, we need to check if the phone is different from current user's phone
      // If it's the same phone, allow verification. If it's different, check availability.
      const isOwnPhone = fullPhoneNumber === user?.phone;

      if (!isOwnPhone) {
        // Only check availability if it's a different phone
        const isAvailable = await checkPhoneAvailability(fullPhoneNumber);
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
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/send-phone-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({
            phone: fullPhoneNumber,
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

  // Phone validation function for phone numbers without country code
  const isValidPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return false;
    // First extract phone without country code to handle cases where phone might have prefix
    const phoneWithoutCountryCode = extractPhoneWithoutCountryCode(phoneNumber);

    // For Indian numbers (default), validate exactly 10 digits
    if (selectedCountry?.code === 'IN' || !selectedCountry) {
      // Indian phone number: exactly 10 digits
      return /^\d{10}$/.test(phoneWithoutCountryCode);
    }

    // For other countries, validate 7-15 digits
    return phoneWithoutCountryCode.length >= 7 && phoneWithoutCountryCode.length <= 15;
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
      // Strip country code if user types it (keep only digits without country code)
      // First extract all digits, then remove country code
      const allDigits = extractPhoneDigits(value);
      const phoneWithoutCountryCode = extractPhoneWithoutCountryCode(allDigits);
      const processedValue = phoneWithoutCountryCode;

      // Compare with original phone (also extract digits for comparison)
      const originalPhoneDigits = extractPhoneWithoutCountryCode(originalPhone);
      if (phoneWithoutCountryCode !== originalPhoneDigits) {
        setPhoneChanged(true);
        // No verification required - just track the change
      } else if (phoneWithoutCountryCode === originalPhoneDigits) {
        setPhoneChanged(false);
      }

      setProfileForm(prev => ({ ...prev, [name]: processedValue }));
    } else {
      setProfileForm(prev => ({ ...prev, [name]: value }));
    }
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
      // Use the same API as requirements tab but limit to 3
      const response = await fetch(`${import.meta.env.VITE_API_URL}/requirements/college?page=1&limit=3`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      console.log('📡 Recent requirements response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        const recentRequirements = data.requirements || [];

        console.log('📊 Recent requirements fetched:', recentRequirements);
        console.log('📊 Recent requirements count:', recentRequirements.length);

        setRecentRequirements(recentRequirements);
        setStats(prev => ({
          ...prev,
          totalRequirements: data.pagination?.totalCount || recentRequirements.length
        }));
      } else {
        console.error('❌ Failed to fetch recent requirements:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching requirements:', error);
    }
  };

  // Infinite scroll function for requirements
  const fetchRequirementsPage = async (pageNum = 1, append = false) => {
    try {
      setLoadingMore(true);
      const searchParam = requirementsSearch && requirementsSearch.trim() ? `&search=${encodeURIComponent(requirementsSearch.trim())}` : '';
      // Abort any in-flight request before starting a new one
      if (requirementsFetchAbortRef.current) {
        requirementsFetchAbortRef.current.abort();
      }
      const controller = new AbortController();
      requirementsFetchAbortRef.current = controller;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/requirements/college?page=${pageNum}&limit=20${searchParam}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        signal: controller.signal
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
      if (error.name === 'AbortError') {
        // Ignore aborted requests
        return;
      }
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

  // When switching to requirements tab, ensure initial load
  useEffect(() => {
    if (activeTab === 'requirements') {
      fetchRequirementsPage(1, false);
    }
  }, [activeTab]);

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

  const handleProfileUpdate = async () => {
    try {
      // Debug: Log the profile form data
      console.log('Profile form data being sent:', profileForm);

      // Email verification requirement removed - email is now non-editable

      if (phoneChanged) {
        if (!profileForm.phone || !isValidPhoneNumber(profileForm.phone)) {
          showToast('error', 'Please enter a valid phone number before saving changes');
          return;
        }
      }

      setLoading(true);

      // Data to send to backend
      const profileData = {
        institutionName: profileForm.institutionName,
        contactPersonName: profileForm.contactPersonName,
        email: profileForm.email,
        institutionType: profileForm.institutionType,
        accreditation: profileForm.accreditation,
        website: profileForm.website,
        address: profileForm.address,
        city: profileForm.city,
        state: profileForm.state,
        country: profileForm.country,
        postalCode: profileForm.postalCode,
        phone: profileForm.phone,
        logoUrl: profileForm.logoUrl,
        description: profileForm.description,
      };
      // Handle phone number update - combine country code with phone number if phone is provided
      if (phoneChanged && profileData.phone && selectedCountry) {
        // Remove any existing country code prefix from the phone number
        const phoneWithoutPrefix = extractPhoneWithoutCountryCode(profileData.phone);
        // Add the selected country code
        const fullPhoneNumber = `${selectedCountry.dialCode}${phoneWithoutPrefix}`;
        // Set userPhone and updateUserPhone flag for backend
        profileData.userPhone = fullPhoneNumber;
        profileData.updateUserPhone = true;
      }

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

      // Update original phone and user object with new phone if it was changed
      if (phoneChanged && profileData.userPhone && user) {
        setOriginalPhone(profileData.userPhone);
        const updatedUser = { ...user, phone: profileData.userPhone, isPhoneVerified: true };
        setUser(updatedUser);
      } else {
        setOriginalPhone(user?.phone || profileData.phone || '');
      }

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
            <div className={`p-2.5 rounded-xl ${color === 'blue' ? 'bg-blue-50 group-hover:bg-blue-100' :
              color === 'green' ? 'bg-emerald-50 group-hover:bg-emerald-100' :
                color === 'purple' ? 'bg-violet-50 group-hover:bg-violet-100' :
                  color === 'orange' ? 'bg-orange-50 group-hover:bg-orange-100' :
                    'bg-slate-50 group-hover:bg-slate-100'
              } transition-colors duration-300`}>
              <Icon className={`h-5 w-5 ${color === 'blue' ? 'text-blue-600' :
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
      className={`group flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${isActive
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
    <DashboardLayout
      user={user}
      logout={handleLogout}
      activeTab={activeTab}
      setActiveTab={handleTabChange}
      logoUrl={profile?.logoUrl || profileForm?.logoUrl}
    >
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <DashboardOverview
            key="overview"
            user={user}
            stats={stats}
            recentRequirements={recentRequirements}
            setActiveTab={handleTabChange}
            loading={loading}
            subscription={mySubscription}
            onCreateRequirement={() => {
              setActiveTab('requirements');
              // We need a slight delay or a way to trigger the create modal in RequirementsTab
              // For now, switching tab is the first step. Ideally RequirementsTab should accept a prop to auto-open create.
              // We can pass a URL param or state. Let's try passing it via state if possible, or just switch tab.
              // Actually, simply switching to requirements tab usually shows the list. 
              // To open create modal, we'd need to pass a prop to RequirementsTab.
              // Let's check how RequirementsTab handles 'create' mode.
              // It seems to have onCreateRequirementClick prop.
              setTimeout(() => {
                const createBtn = document.querySelector('[data-action="create-requirement"]');
                if (createBtn) createBtn.click();
              }, 100);
            }}
          />
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
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              isValidEmail={isValidEmail}
              isValidPhone={isValidPhone}
              isValidPhoneNumber={isValidPhoneNumber}
              apiService={apiService}
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
              mySubscription={mySubscription}
              subsLoading={subsLoading}
              getLimitationDetails={getLimitationDetails}
              showPlanLimitationModal={setShowPlanLimitationModal}
              setLimitationType={setLimitationType}
              apiService={apiService}
              revealedExpertIds={revealedExpertIds}
              setRevealedExpertIds={setRevealedExpertIds}
              requirementsSearch={requirementsSearch}
              setRequirementsSearch={setRequirementsSearch}
              onRequirementsSearchChange={handleRequirementsSearchChange}
              onRequirementsSearchSubmit={triggerRequirementsReload}
            />
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
            <ApplicationManagement
              requirementId={null}
              user={user}
              onRefreshSubscription={loadMySubscription}
              mySubscription={mySubscription}
              showPlanLimitationModal={setShowPlanLimitationModal}
              setLimitationType={setLimitationType}
              getLimitationDetails={getLimitationDetails}
              subsLoading={subsLoading}
              revealedExpertIds={revealedExpertIds}
              setRevealedExpertIds={setRevealedExpertIds}
            />
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
            <ExpertsTab
              user={user}
              mySubscription={mySubscription}
              showPlanLimitationModal={setShowPlanLimitationModal}
              setLimitationType={setLimitationType}
              getLimitationDetails={getLimitationDetails}
              subsLoading={subsLoading}
              revealedExpertIds={revealedExpertIds}
              setRevealedExpertIds={setRevealedExpertIds}
              apiService={apiService}
            />
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
            <RatingsTab
              user={user}
              ratingRequests={ratingRequests}
              fetchRatingRequests={fetchRatingRequests}
              loadingRequests={ratingRequestsLoadingMore}
            />
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

      {toast && (
        <Toast
          toast={{ ...toast, show: true }}
          hideToast={hideToast}
        />
      )}

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

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Requirement"
        message="Are you sure you want to delete this requirement? This action will remove it from your dashboard and cannot be undone."
        itemName={requirementToDelete?.title}
        isLoading={isDeleting}
      />

      <ExpertRatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        expert={selectedExpert}
        requirement={selectedRequirement}
        application={selectedApplication}
        onRatingSubmitted={handleRatingSubmitted}
      />

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
    </DashboardLayout>
  );
};


export default CollegeDashboard;
