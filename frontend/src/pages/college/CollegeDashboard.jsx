import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  CheckCircle, 
  Award, 
  TrendingUp, 
  BarChart3, 
  Zap,
  Upload,
  Menu,
  ChevronRight,
  AlertCircle,
  Shield,
  Mail,
  Phone
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../utils/api';
import Toast from '../../components/common/Toast';
import FileUpload from '../../components/common/FileUpload';
import EmailVerificationModal from '../../components/verification/EmailVerificationModal';
import PhoneVerificationModal from '../../components/verification/PhoneVerificationModal';
import VerificationRequirementModal from '../../components/common/VerificationRequirementModal';
import RequirementCard from '../../components/common/RequirementCard';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import ApplicationManagement from '../../components/college/ApplicationManagement';

const CollegeDashboard = () => {
  const { user, logout, setUser } = useAuth();
  // Get active tab from URL or default to 'overview'
  const [activeTab, setActiveTab] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tab') || 'overview';
  });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  // Tab management with URL persistence
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // Update URL without page reload
    const url = new URL(window.location);
    url.searchParams.set('tab', tabId);
    window.history.pushState({}, '', url);
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

  // Delete functions
  const handleDelete = async (requirementId) => {
    // Find the requirement to get its title for the modal
    const requirement = requirements?.find(req => req.id === requirementId);
    if (requirement) {
      setRequirementToDelete(requirement);
      setShowDeleteModal(true);
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
    return user?.isEmailVerified || user?.isPhoneVerified;
  };

  // Check if user can access expert directory (only requires authentication)
  const canAccessExperts = () => {
    return !!user; // Only requires user to be logged in
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
      
      // Check if email is unique before sending OTP
      const isAvailable = await checkEmailAvailability(profileForm.email);
      if (!isAvailable) {
        showToast('error', 'This email is already in use by another account.');
        return;
      }
      
      console.log('✅ Email is available, sending OTP...');
      
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
            email: profileForm.email
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
            phone: profileForm.phone
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

      if (recentResponse.ok) {
        const recentRequirements = await recentResponse.json();
        
        console.log('📊 Recent requirements fetched:', recentRequirements.length);
        
        setRecentRequirements(recentRequirements);
        setStats(prev => ({
          ...prev,
          totalRequirements: recentRequirements.length
        }));
      } else {
        console.error('Failed to fetch recent requirements');
      }
    } catch (error) {
      console.error('Error fetching requirements:', error);
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

  // Auto-load more when scrolling to bottom
  useEffect(() => {
    const handleScroll = () => {
      if (activeTab === 'requirements') {
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Load more when user is near bottom (within 100px)
        if (scrollTop + windowHeight >= documentHeight - 100) {
          loadMoreRequirements();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab, loadMoreRequirements]);

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
                {profile?.logoUrl ? (
                  <img 
                    src={getFullLogoUrl(profile.logoUrl)} 
                    alt="Institution Logo" 
                    className="w-10 h-10 rounded-xl object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-lg font-bold text-slate-900">{profile?.institutionName || 'College'}</h1>
                  <p className="text-xs text-slate-500">Institution Panel</p>
                </div>
                </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              <SidebarItem
                id="overview"
                label="Overview"
                icon={Home}
                isActive={activeTab === 'overview'}
                onClick={handleTabChange}
              />
              <SidebarItem
                id="profile"
                label="Profile"
                icon={Building2}
                isActive={activeTab === 'profile'}
                onClick={handleTabChange}
              />
              <SidebarItem
                id="requirements"
                label="Requirements"
                icon={FileText}
                isActive={activeTab === 'requirements'}
                onClick={handleRequirementsAccess}
              />
              <SidebarItem
                id="applications"
                label="Applications"
                icon={CheckCircle}
                isActive={activeTab === 'applications'}
                onClick={handleTabChange}
              />
              <SidebarItem
                id="experts"
                label="Expert Directory"
                icon={Users}
                isActive={activeTab === 'experts'}
                onClick={(tabId) => {
                  if (tabId === 'experts' && !canAccessExperts()) {
                    setVerificationFeatureName("Expert Directory");
                    setShowVerificationRequirement(true);
                  } else {
                    handleTabChange(tabId);
                  }
                }}
              />
              <SidebarItem
                id="ratings"
                label="Ratings & Trust"
                icon={Award}
                isActive={activeTab === 'ratings'}
                onClick={(tabId) => {
                  if (tabId === 'ratings' && !canAccessRequirements()) {
                    setVerificationFeatureName("Ratings & Trust");
                    setShowVerificationRequirement(true);
                  } else {
                    handleTabChange(tabId);
                  }
                }}
              />
            </nav>



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
                    {activeTab === 'profile' && 'Institution Profile'}
                    {activeTab === 'requirements' && 'Requirements Management'}
                    {activeTab === 'applications' && 'Application Management'}
                    {activeTab === 'experts' && 'Expert Directory'}
                    {activeTab === 'ratings' && 'Ratings & Trust'}
                  </h1>
                  <div className="flex items-center space-x-2 text-sm text-slate-500 mt-1">
                    <Home className="h-4 w-4" />
                    <ChevronRight className="h-4 w-4" />
                    <span className="capitalize">{activeTab}</span>
                </div>
                </div>
              </div>
            </div>
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto bg-slate-50">
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <StatCard
                      icon={CheckCircle}
                      title="Profile Completeness"
                      value={`${stats.profileCompleteness}%`}
                      color="blue"
                    />
                    <StatCard
                      icon={FileText}
                      title="Total Requirements"
                      value={stats.totalRequirements}
                      color="green"
                    />
                    <StatCard
                      icon={AlertCircle}
                      title="Urgent Requirements"
                      value={stats.urgentRequirements}
                      color="red"
                    />
                    <StatCard
                      icon={Calendar}
                      title="Upcoming Deadlines"
                      value={stats.upcomingDeadlines}
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
                        onClick={handleRequirementsAccess}
                        className="group flex items-center space-x-4 p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl hover:from-blue-100 hover:to-blue-200/50 transition-all duration-300"
                      >
                        <div className="p-3 bg-blue-600 rounded-xl group-hover:bg-blue-700 transition-colors">
                          <Plus className="h-5 w-5 text-white" />
    </div>
                        <div className="text-left">
                          <p className="font-semibold text-slate-900">Post Requirement</p>
                          <p className="text-sm text-slate-600">Add new academic requirement</p>
          </div>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleTabChange('experts')}
                        className="group flex items-center space-x-4 p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl hover:from-emerald-100 hover:to-emerald-200/50 transition-all duration-300"
                      >
                        <div className="p-3 bg-emerald-600 rounded-xl group-hover:bg-emerald-700 transition-colors">
                          <Search className="h-5 w-5 text-white" />
          </div>
                        <div className="text-left">
                          <p className="font-semibold text-slate-900">Find Experts</p>
                          <p className="text-sm text-slate-600">Search for qualified experts</p>
        </div>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleTabChange('profile')}
                        className="group flex items-center space-x-4 p-5 bg-gradient-to-br from-violet-50 to-violet-100/50 rounded-xl hover:from-violet-100 hover:to-violet-200/50 transition-all duration-300"
                      >
                        <div className="p-3 bg-violet-600 rounded-xl group-hover:bg-violet-700 transition-colors">
                          <Edit3 className="h-5 w-5 text-white" />
            </div>
                        <div className="text-left">
                          <p className="font-semibold text-slate-900">Update Profile</p>
                          <p className="text-sm text-slate-600">Keep information current</p>
          </div>
                      </motion.button>
      </div>
    </div>

                

    {/* Recent Requirements */}
                                      <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-900">Recent Requirements</h3>
                        {recentRequirements.length > 0 && (
                          <button
                            onClick={() => handleTabChange('requirements')}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                          >
                            View All
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        {recentRequirements.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500 mb-3">No requirements posted yet</p>
                            {canAccessRequirements() ? (
                              <button 
                                onClick={handleRequirementsAccess}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Post your first requirement
                              </button>
                            ) : (
                              <div className="space-y-3">
                          <button 
                            onClick={() => handleTabChange('requirements')}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
              Post your first requirement
            </button>
          </div>
                            )}
                          </div>
                        ) : (
                          <>
                            {/* Show only latest 2 requirements */}
                            {recentRequirements.slice(0, 2).map((requirement, index) => (
                              <RequirementCard
                                key={requirement.id}
                                requirement={requirement}
                                index={index}
                                showActions={false}
                                compact={true}
                                onClick={() => handleTabChange('requirements')}
                              />
                            ))}
                          </>
        )}
      </div>
    </div>
                </motion.div>
              )}

                             {/* Profile Tab */}
               {activeTab === 'profile' && (
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
                 />
               )}

              {/* Requirements Tab */}
              {activeTab === 'requirements' && (
                <>
                  <RequirementsTab 
                    recentRequirements={recentRequirements} 
                    user={user} 
                    onVerifyEmail={handleVerifyEmailFromRequirements} 
                    onVerifyPhone={handleVerifyPhoneFromRequirements}
                    onPostRequirement={refreshRequirements}
                    showToast={showToast}
                    setActiveTab={handleTabChange}
                    onDelete={handleDelete}
                    requirements={requirements}
                    setRequirements={setRequirements}
                    refreshRequirements={refreshRequirements}
                    totalRequirements={totalRequirements}
                    loading={loading}
                    loadingMore={loadingMore}
                    hasMore={hasMore}
                    loadMoreRequirements={loadMoreRequirements}
                  />


                </>
              )}

              {/* Applications Tab */}
              {activeTab === 'applications' && (
                <>
                  <ApplicationManagement 
                    requirementId={null}
                    user={user}
                  />
                </>
              )}

              {/* Experts Tab */}
              {activeTab === 'experts' && (
                canAccessExperts() ? (
                  <>
                    {console.log('Rendering ExpertsTab, user:', user)}
                    {console.log('User object structure:', JSON.stringify(user, null, 2))}
                    <ExpertsTab user={user} key={`experts-${user?.id || 'no-user'}`} />
                  </>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 mb-3">Verification required to access Expert Directory</p>
                      <div className="space-y-2">
                        {!user?.isEmailVerified && (
                          <button
                            onClick={handleVerifyEmailFromRequirements}
                            className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700"
                          >
                            Verify Email
                          </button>
                        )}
                        {!user?.isPhoneVerified && (
                          <button
                            onClick={handleVerifyPhoneFromRequirements}
                            className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700"
                          >
                            Verify Phone
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}

              {/* Ratings Tab */}
              {activeTab === 'ratings' && (
                canAccessExperts() ? (
                <RatingsTab user={user} key={`ratings-${user?.id || 'no-user'}`} />
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <div className="text-center py-8">
                      <Star className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 mb-3">Verification required to access Ratings & Trust</p>
                      <div className="space-y-2">
                        {!user?.isEmailVerified && (
                          <button
                            onClick={handleVerifyEmailFromRequirements}
                            className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700"
                          >
                            Verify Email
                          </button>
                        )}
                        {!user?.isPhoneVerified && (
                          <button
                            onClick={handleVerifyPhoneFromRequirements}
                            className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700"
                          >
                            Verify Phone
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
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
  currentPhoneVerified
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
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Institution Information</h3>
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
            className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 w-auto min-w-fit ${
              editingProfile
                ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25'
            }`}
          >
            {editingProfile ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
            <span className="whitespace-nowrap">{editingProfile ? 'Cancel' : 'Edit Profile'}</span>
          </motion.button>
        </div>
        
        {/* Verification Warning */}
        {editingProfile && (
          (emailChanged || phoneChanged) || 
          (!user?.isEmailVerified && !emailChanged) || 
          (!user?.isPhoneVerified && !phoneChanged)
        ) && (
          <div className="mb-6 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-amber-800">Verification Required</h4>
                <p className="text-sm text-amber-700 mt-1">
                  {emailChanged && phoneChanged 
                    ? 'You have changed both email and phone number. Please verify both before saving changes.'
                    : emailChanged 
                    ? 'You have changed your email address. Please verify it before saving changes.'
                    : phoneChanged
                    ? 'You have changed your phone number. Please verify it before saving changes.'
                    : !user?.isEmailVerified && !user?.isPhoneVerified
                    ? 'Please verify your email address and phone number before saving changes.'
                    : !user?.isEmailVerified
                    ? 'Please verify your email address before saving changes.'
                    : 'Please verify your phone number before saving changes.'
                  }
                </p>
                <div className="mt-2 space-y-1">
                  {phoneChanged && !isValidPhone(profileForm.phone) && (
                    <p className="text-xs text-red-600">⚠️ Please enter a valid phone number to proceed with verification</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
              <input
                type="text"
                value={profile?.institutionName || 'Not specified'}
                disabled={true}
                className="w-full px-3 py-2 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
              />
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
              <input
                type="text"
                value={profile?.contactPersonName || 'Not specified'}
                disabled={true}
                className="w-full px-3 py-2 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                          <div className="relative">
                {editingProfile ? (
                  <div className="space-y-2">
                    <div className="flex flex-col md:flex-row gap-2">
                      <input
                        type="email"
                        name="email"
                        value={profileForm.email || ''}
                        onChange={handleProfileInputChange}
                        className="flex-1 px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter email address"
                      />
                      {(emailChanged || !user?.isEmailVerified) && (
                        <button
                          type="button"
                          onClick={onSendEmailOtp}
                          disabled={isEmailSending || !isValidEmail(profileForm.email)}
                          className="w-full md:w-auto px-3 md:px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
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
              <input
                type="text"
                value={profile?.institutionType ? profile.institutionType.toLowerCase() : 'Not specified'}
                disabled={true}
                className="w-full px-3 py-2 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
              />
            )}
          </div>

          {/* Description field - Full width, after Institution Name */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            {editingProfile ? (
              <textarea
                name="description"
                value={profileForm.description || ''}
                onChange={handleInputChange}
                rows={3}
                placeholder="Brief description of your institution..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            ) : (
              <textarea
                value={profile?.description || 'Not specified'}
                disabled={true}
                rows={3}
                className="w-full px-3 py-2 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 transition-colors resize-none"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Accreditation</label>
            {editingProfile ? (
              <input
                type="text"
                name="accreditation"
                value={profileForm.accreditation || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <input
                type="text"
                value={profile?.accreditation || 'Not specified'}
                disabled={true}
                className="w-full px-3 py-2 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
              />
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
              <input
                type="text"
                value={profile?.website || 'Not specified'}
                disabled={true}
                className="w-full px-3 py-2 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <div className="relative">
              {editingProfile ? (
                <div className="space-y-2">
                  <div className="flex flex-col md:flex-row gap-2">
                    <input
                      type="tel"
                      name="phone"
                      value={profileForm.phone || ''}
                      onChange={handleProfileInputChange}
                      className="flex-1 px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter phone number"
                    />
                    {(phoneChanged || !user?.isPhoneVerified) && (
                      <button
                        type="button"
                        onClick={onSendPhoneOtp}
                        disabled={isPhoneSending || !isValidPhone(profileForm.phone)}
                        className="w-full md:w-auto px-3 md:px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            {editingProfile ? (
              <textarea
                name="address"
                value={profileForm.address || ''}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            ) : (
              <textarea
                value={profile?.address || 'Not specified'}
                disabled={true}
                rows={2}
                className="w-full px-3 py-2 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 transition-colors resize-none"
              />
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-2">City</label>
            {editingProfile ? (
              <input
                type="text"
                name="city"
                value={profileForm.city || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <input
                type="text"
                value={profile?.city || 'Not specified'}
                disabled={true}
                className="w-full px-3 py-2 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
              />
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
              <input
                type="text"
                value={profile?.state || 'Not specified'}
                disabled={true}
                className="w-full px-3 py-2 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
              />
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
              <input
                type="text"
                value={profile?.country || 'Not specified'}
                disabled={true}
                className="w-full px-3 py-2 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
              />
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
              <input
                type="text"
                value={profile?.postalCode || 'Not specified'}
                disabled={true}
                className="w-full px-3 py-2 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
              />
            )}
          </div>
        </div>

        {editingProfile && (
          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setEditingProfile(false);
                setLogoFile(null);
                setLogoPreview(profile?.logoUrl || null);
              }}
              className="px-6 py-2 text-slate-700 bg-slate-200 rounded-xl hover:bg-slate-300 transition-colors font-medium w-full sm:w-auto"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/25 w-full sm:w-auto"
            >
              Save Changes
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

// Requirements Tab Component - Enhanced with form
const RequirementsTab = ({ recentRequirements, user, onVerifyEmail, onVerifyPhone, onPostRequirement, showToast, setActiveTab, onDelete, requirements, setRequirements, refreshRequirements, totalRequirements, loading, loadingMore, hasMore, loadMoreRequirements }) => {
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
    const { name, value, type, checked } = e.target;
    setRequirementForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Prepare the data, handling empty deadline properly
      const formData = { ...requirementForm };
      
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
    setEditingRequirement(requirement);
    setRequirementForm({
      title: requirement.title,
      category: requirement.category,
      description: requirement.description,
      budget: requirement.budget?.toString() || '',
      deadline: requirement.deadline ? new Date(requirement.deadline).toISOString().split('T')[0] : '',
      isUrgent: requirement.isUrgent,
      requiredSkills: requirement.requiredSkills || '',
      experience: requirement.experience || ''
    });
    setShowEditForm(true);
    setShowForm(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
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



  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditingRequirement(null);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Premium Header Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 20% 80%, #3B82F6 1px, transparent 1px),
              radial-gradient(circle at 80% 20%, #6366F1 1px, transparent 1px),
              radial-gradient(circle at 40% 40%, #8B5CF6 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        {/* Glassmorphism Header */}
        <div className="relative backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">Streamline your academic requirements with enterprise-grade tools</p>
              </div>
            </div>
            
          <button 
            onClick={() => setShowForm(!showForm)}
              disabled={!canAccessRequirements()}
              className={`relative group w-full sm:w-auto px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform ${
                canAccessRequirements()
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {showForm ? (
                <span className="flex items-center justify-center sm:justify-start gap-2 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </span>
              ) : (
                <span className="flex items-center justify-center sm:justify-start gap-2 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Requirement
                </span>
              )}
      </button>
          </div>
    </div>

        {/* Premium Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative backdrop-blur-xl bg-white/80 border border-white/30 rounded-xl shadow-lg p-4 mb-4"
          >
            {/* Form Background Pattern */}
            <div className="absolute inset-0 opacity-[0.02] rounded-xl">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(45deg, #3B82F6 1px, transparent 1px),
                  linear-gradient(-45deg, #6366F1 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
              }}></div>
            </div>

            <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Requirement Title *
                  </label>
                <input
                  type="text"
                  name="title"
                  value={requirementForm.title}
                  onChange={handleInputChange}
                  required
                    className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 placeholder:text-slate-400"
                    placeholder="e.g., Advanced Data Science Workshop"
                />
              </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Category *
                  </label>
                                 <select
                   name="category"
                   value={requirementForm.category}
                   onChange={handleInputChange}
                   required
                    className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
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
                 </select>
              </div>
            </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Description *
                </label>
            <textarea
                name="description"
                value={requirementForm.description}
                onChange={handleInputChange}
                required
                  rows={2}
                  className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 placeholder:text-slate-400 resize-none"
                  placeholder="Provide a comprehensive description of your requirement..."
              />
            </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Budget (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium text-sm">₹</span>
                 <input
                   type="number"
                   name="budget"
                   value={requirementForm.budget}
              onChange={handleInputChange}
                      className="w-full pl-8 pr-3 py-2 bg-white/50 backdrop-blur-sm border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 placeholder:text-slate-400"
                   placeholder="0"
                 />
               </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Deadline
                  </label>
                <input
                  type="date"
                  name="deadline"
                  value={requirementForm.deadline}
                  onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                />
              </div>
                
                <div className="flex items-center space-x-3 pt-6">
                  <div className="relative">
                <input
                  type="checkbox"
                  name="isUrgent"
                  checked={requirementForm.isUrgent}
                  onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500/50 border-slate-300 rounded transition-all duration-200"
                />
                  </div>
                  <label className="text-sm font-semibold text-slate-700">Mark as Urgent</label>
              </div>
        </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Required Skills
                </label>
            <textarea
                name="requiredSkills"
                value={requirementForm.requiredSkills}
              onChange={handleInputChange}
                rows={2}
                  className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 placeholder:text-slate-400 resize-none"
                  placeholder="Specify any particular skills needed for the project..."
            />
        </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Experience
                </label>
            <textarea
                name="experience"
                value={requirementForm.experience}
              onChange={handleInputChange}
                rows={2}
                  className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 placeholder:text-slate-400 resize-none"
                  placeholder="Specify required experience level or qualifications..."
            />
        </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
                type="submit"
                  className="relative group px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <span className="flex items-center justify-center gap-2 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Requirement
                  </span>
            </button>
                
            <button
                type="button"
                onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-all duration-300 border border-slate-200"
            >
              Cancel
            </button>
          </div>
          </form>
          </motion.div>
        )}

        {/* Requirements Edit Modal */}
        {showEditForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-900">Edit Requirement</h3>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={requirementForm.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                    <select
                      name="category"
                      value={requirementForm.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
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
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={requirementForm.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Budget (₹)</label>
                    <input
                      type="number"
                      name="budget"
                      value={requirementForm.budget}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter budget amount"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Deadline</label>
                    <input
                      type="date"
                      name="deadline"
                      value={requirementForm.deadline}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isUrgent"
                    checked={requirementForm.isUrgent}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-slate-700">Mark as Urgent</label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Required Skills</label>
                  <textarea
                    name="requiredSkills"
                    value={requirementForm.requiredSkills}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Specify any particular skills needed for the project..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Experience</label>
                  <textarea
                    name="experience"
                    value={requirementForm.experience}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Specify required experience level or qualifications..."
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Update Requirement
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Compact Requirements List - Only this section is made smaller */}
        <div className="space-y-4">
          {/* List Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">All Requirements</h2>
              <div className="px-2 sm:px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                <span className="text-xs sm:text-sm font-semibold text-blue-800">{totalRequirements} requirements</span>
              </div>
                  </div>
            
            {requirements.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Sorted by latest first</span>
              </div>
            )}
                </div>

          {loading && requirements.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
                <div className="absolute inset-0 w-10 h-10 sm:w-12 sm:h-12 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.1s' }}></div>
              </div>
              <p className="text-slate-600 font-medium text-sm">Loading your requirements...</p>
            </div>
          ) : requirements.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl blur-lg"></div>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">No requirements yet</h3>
              <p className="text-slate-600 mb-4 sm:mb-6 max-w-sm mx-auto text-xs sm:text-sm">Start building your academic requirements portfolio to connect with top experts</p>
              <button 
                onClick={() => setShowForm(true)}
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
              >
                Create Your First Requirement
              </button>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading requirements...</p>
                </div>
              ) : requirements.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No requirements found.</p>
                </div>
              ) : (
                requirements.map((requirement, index) => (
                  <RequirementCard
                    key={requirement.id}
                    requirement={requirement}
                    index={index}
                    showActions={true}
                    compact={false}
                    onEdit={() => handleEdit(requirement)}
                    onDelete={() => onDelete(requirement.id)}
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

        
      </div>
    </div>
  );
};

// Experts Tab Component
const ExpertsTab = ({ user }) => {
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
  }, [fetchExperts, user]);

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
  
  // Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Handle contact expert
  const handleContactExpert = (expert) => {
    setSelectedExpert(expert);
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search experts by name, expertise, skills, or company..."
                className={`w-full pl-9 pr-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-200 ${
                  searchQuery ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                }`}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>



          {/* Category Filter */}
          <div className="sm:w-40">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all duration-200 ${
                selectedCategory !== 'All Categories' ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
              }`}
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
      </div>



      {/* Results Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {loading ? 'Loading experts...' : (
                (searchQuery || selectedCategory !== 'All Categories') 
                  ? `${experts.length} Expert${experts.length !== 1 ? 's' : ''} Found`
                  : `${totalExperts} Expert${totalExperts !== 1 ? 's' : ''} Available`
              )}
            </h3>
            {searchQuery && (
              <p className="text-xs text-gray-600 mt-0.5">
                Results for "{searchQuery}"
              </p>
            )}
          </div>
          {experts.length > 0 && (
            <div className="text-xs text-gray-500">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {experts.map(expert => (
              <motion.div
                key={expert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200"
              >
                {/* Expert Header - Compact */}
                <div className="p-3 pb-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                      {expert.user?.fullName?.charAt(0) || 'E'}
                    </div>
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
                      {expert.averageRating ? `${expert.averageRating.toFixed(1)}` : 'No ratings'}
                    </span>
                  </div>

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
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleContactExpert(expert)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Contact
                    </button>
                    <button
                      onClick={() => handleViewProfile(expert)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
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
                className="px-8 py-3 bg-white text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {selectedExpert.profilePicture ? (
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                        <img
                          src={selectedExpert.profilePicture}
                          alt={`${selectedExpert.user?.fullName}'s profile`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                        {selectedExpert.user?.fullName?.charAt(0) || 'E'}
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {selectedExpert.user?.fullName}
                      </h2>
                      <p className="text-gray-600">{selectedExpert.jobTitle}</p>
                    </div>
                  </div>
                  <button
                    onClick={closeContactModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-gray-600 text-sm">
                  Get in touch with {selectedExpert.user?.fullName} for collaboration opportunities.
                </p>
              </div>

              {/* Contact Details */}
              <div className="p-6 space-y-4">
                {/* Email */}
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">{selectedExpert.user?.email}</p>
                  </div>
                </div>

                {/* Phone */}
                {selectedExpert.user?.phone && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <p className="text-sm text-gray-600">{selectedExpert.user?.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Email Composition Form */}
              <div className="px-6 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Send Message</h3>
                <div className="space-y-4">
                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      placeholder="Collaboration Opportunity"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      defaultValue="Collaboration Opportunity"
                    />
                  </div>
                  
                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      rows={4}
                      placeholder="Hi, I'm interested in collaborating with you..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      defaultValue={`Hi ${selectedExpert.user?.fullName},

I'm interested in collaborating with you for a project. Could you please let me know your availability and discuss the details?

Best regards,`}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 border-t border-gray-100 flex space-x-3">
                <button
                  onClick={closeContactModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const subject = document.querySelector('input[placeholder="Collaboration Opportunity"]').value;
                    const message = document.querySelector('textarea').value;
                    const mailtoLink = `mailto:${selectedExpert.user?.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
                    window.open(mailtoLink, '_blank');
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send Email
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
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Simple Header */}
              <div className="bg-white border-b border-gray-200 p-6">
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
                      <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold text-xl" style={{display: 'none'}}>
                        {selectedExpert.user?.fullName?.charAt(0) || 'E'}
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold text-xl">
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
                      <span className="font-semibold text-green-600">${parseFloat(selectedExpert.hourlyRate).toFixed(0)}/hr</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 p-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{selectedExpert.user?.email}</span>
                        </div>
                        {selectedExpert.user?.phone && (
                          <div className="flex items-center space-x-3 p-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{selectedExpert.user?.phone}</span>
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
              <div className="bg-gray-50 border-t border-gray-200 p-4">
                <div className="flex space-x-3">
                  <button
                    onClick={closeProfileModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      closeProfileModal();
                      handleContactExpert(selectedExpert);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
    <div className="space-y-6">
      {/* Trust Badges */}
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trust Badges & Recognition</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trustBadges.map((badge, index) => {
            const Icon = badge.icon;
            const colorClasses = {
              blue: 'bg-blue-100 text-blue-800 border-blue-200',
              green: 'bg-green-100 text-green-800 border-green-200',
              purple: 'bg-purple-100 text-purple-800 border-purple-200'
            };
            
            return (
              <div key={index} className={`p-4 rounded-lg border ${colorClasses[badge.color]} text-center`}>
                <Icon className={`w-8 h-8 mx-auto mb-2 text-${badge.color}-600`} />
                <h4 className="font-medium">{badge.name}</h4>
              </div>
            );
          })}
        </div>
      </div>

      {/* Received Ratings */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ratings Received from Experts</h3>
        <div className="space-y-4">
          {receivedRatings.map(rating => (
            <div key={rating.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{rating.expertName}</h4>
                  <p className="text-sm text-gray-600">{rating.category}</p>
                </div>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.floor(rating.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium text-gray-900">{rating.rating}</span>
                </div>
              </div>
              <p className="text-gray-700 mb-2">{rating.comment}</p>
              <p className="text-xs text-gray-500">{new Date(rating.date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
    </div>
  </div>
);
};

export default CollegeDashboard;
