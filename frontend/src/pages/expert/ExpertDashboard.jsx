import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { 

  User, UserCheck, Settings, BarChart3, Star, Eye, DollarSign, BookOpen, Award, Edit3, Edit,

  Plus, Trash2, Save, X, CheckCircle, AlertCircle, TrendingUp, Calendar, MapPin,

  Briefcase, Globe, Mail, Phone, Search, MessageCircle, Shield, Video,

  Users, Building2, Badge, Target, Clock, Activity, Filter, Upload, Download,

  Home, ChevronRight, Menu, Zap, TrendingDown, LogOut, RefreshCw, Code

} from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';

import api from '../../utils/api';

import FileUpload from '../../components/common/FileUpload';

import Toast from '../../components/common/Toast';

import EmailVerificationModal from '../../components/verification/EmailVerificationModal';
import PhoneVerificationModal from '../../components/verification/PhoneVerificationModal';
import ExpertOpportunities from '../../components/expert/ExpertOpportunities';
import ApplicationTracking from '../../components/expert/ApplicationTracking';
import RatingRequestModal from '../../components/expert/RatingRequestModal';
import ExpertRatingRequestsList from '../../components/expert/ExpertRatingRequestsList';
import { 
  checkAvailability 
} from '../../utils/verificationUtils';
import VerificationRequirementModal from '../../components/common/VerificationRequirementModal';
import PlanLimitationModal from '../../components/common/PlanLimitationModal';

const ExpertDashboard = () => {
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

  const [stats, setStats] = useState({

    totalServices: 0,

    totalRatings: 0,

    averageRating: 0,

    totalEarnings: 0,

    activeRequests: 0,

    profileViews: 0

  });

  // Application stats for overview
  const [applicationStats, setApplicationStats] = useState({
    total: 0,
    pending: 0,
    shortlisted: 0,
    rejected: 0,
    accepted: 0
  });

  // Subscription state
  const [mySubscription, setMySubscription] = useState(null);
  const [subsLoading, setSubsLoading] = useState(false);

  // Plan limitation modal state
  const [showPlanLimitationModal, setShowPlanLimitationModal] = useState(false);
  const [limitationType, setLimitationType] = useState(null);




  // Profile editing states

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [editedProfile, setEditedProfile] = useState({});

  // Verification states
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isPhoneSending, setIsPhoneSending] = useState(false);
  const [isEmailVerifying, setIsEmailVerifying] = useState(false);
  const [isPhoneVerifying, setIsPhoneVerifying] = useState(false);
  const [emailChanged, setEmailChanged] = useState(false);
  const [phoneChanged, setPhoneChanged] = useState(false);
  const [originalEmail, setOriginalEmail] = useState('');
  const [originalPhone, setOriginalPhone] = useState('');
  const [currentEmailVerified, setCurrentEmailVerified] = useState(false);
  const [currentPhoneVerified, setCurrentPhoneVerified] = useState(false);

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

  const [customServiceInput, setCustomServiceInput] = useState('');

  const [showCustomInput, setShowCustomInput] = useState(false);

  const [availableServiceTypes] = useState([

    // Technology & Innovation Group

    { 

      id: 'tech_innovation', 

      name: 'Technology & Innovation', 

      icon: TrendingUp, 

      description: 'AI, Cybersecurity, Software Development, Innovation & Design',

      group: 'tech',

      services: ['Data Science & AI', 'Cybersecurity', 'Software Development', 'Innovation & Design']

    },

    // Business & Marketing Group

    { 

      id: 'business_marketing', 

      name: 'Business & Marketing', 

      icon: Briefcase, 

      description: 'Digital Marketing, Business Strategy, Finance, Consulting',

      group: 'business',

      services: ['Digital Marketing', 'Business Strategy', 'Finance', 'Consulting']

    },

                      // Academic & Professional Services Group

                  {

                    id: 'academic_professional',

                    name: 'Academic & Professional',

                    icon: BookOpen,

                    description: 'Education, Research, Workshops, Guest Lectures, Mentoring, Question Paper Setting & Evaluation',

                    group: 'academic',

                    services: ['Education', 'Research Collaboration', 'Workshops', 'Guest Lectures', 'Mentoring', 'Curriculum Review', 'Industry Projects', 'Question Paper Setting', 'Question Paper Evaluation']

                  },

    // Training & Development Group

    { 

      id: 'training_development', 

      name: 'Training & Development', 

      icon: Users, 

      description: 'Skill Development, Leadership, Public Speaking, Training Programs',

      group: 'training',

      services: ['Training & Development', 'Public Speaking', 'Leadership Development']

    },

    // Specialized Fields Group

    { 

      id: 'specialized_fields', 

      name: 'Specialized Fields', 

      icon: Activity, 

      description: 'Healthcare, Engineering, Sustainability',

      group: 'specialized',

      services: ['Healthcare', 'Engineering', 'Sustainability']

    },

    // Others Group

    { 

      id: 'others', 

      name: 'Others', 

      icon: Plus, 

      description: 'Specify your custom service area',

      group: 'others',

      services: [],

      isCustom: true

    }

  ]);



  // College search and contact

  const [collegeSearchQuery, setCollegeSearchQuery] = useState('');

  const [collegeSearchResults, setCollegeSearchResults] = useState([]);

  const [collegePosts, setCollegePosts] = useState([]);



  // Ratings and reviews

  const [ratings, setRatings] = useState([]);



  // Logout confirmation

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Verification requirement modal state
  const [showVerificationRequirement, setShowVerificationRequirement] = useState(false);
  const [verificationFeatureName, setVerificationFeatureName] = useState("this feature");

  // Rating request states
  const [showRatingRequestModal, setShowRatingRequestModal] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [ratingRequests, setRatingRequests] = useState([]);
  const [trustScore, setTrustScore] = useState(0);

  // Check if user can access features that require verification
  const canAccessFeatures = () => {
    return user?.isEmailVerified || user?.isPhoneVerified;
  };

  // Rating request functions
  const handleRequestRating = (requirement, application = null) => {
    setSelectedRequirement(requirement);
    setSelectedApplication(application);
    setShowRatingRequestModal(true);
  };

  const handleRatingRequestSubmitted = (ratingRequest) => {
    setRatingRequests(prev => [ratingRequest, ...prev]);
    setShowRatingRequestModal(false);
    setSelectedRequirement(null);
    setSelectedApplication(null);
    // Toast is now handled in the modal itself
  };

  const fetchRatingRequests = async () => {
    try {
      const response = await api.get('/rating-requests');
      if (response.success && Array.isArray(response.data)) {
        setRatingRequests(response.data);
      } else {
        setRatingRequests([]);
      }
    } catch (error) {
      console.error('Failed to fetch rating requests:', error);
      setRatingRequests([]);
    }
  };

  // Handle feature access attempts
  const handleFeatureAccess = (featureName, tabId) => {
    if (canAccessFeatures()) {
      handleTabChange(tabId);
      // Refresh data when switching to specific tabs
      if (tabId === 'rating-requests') {
        fetchRatingRequests();
      } else if (tabId === 'ratings') {
        fetchRatings();
      }
    } else {
      setVerificationFeatureName(featureName);
      setShowVerificationRequirement(true);
    }
  };

  // Wrapper functions for verification from feature access
  const handleVerifyEmailFromFeature = () => {
    setShowVerificationRequirement(false);
    handleTabChange('profile');
    setIsEditingProfile(true);
    setShowEmailVerification(true);
  };

  const handleVerifyPhoneFromFeature = () => {
    setShowVerificationRequirement(false);
    handleTabChange('profile');
    setIsEditingProfile(true);
    setShowPhoneVerification(true);
  };

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

  useEffect(() => {

    fetchProfile();

    fetchWorkExperiences();

    fetchStats();

    fetchApplicationStats();

    fetchCollegePosts();

    fetchRatings();

    fetchRatingRequests();

    loadMySubscription();

  }, []);




  // Update service types when profile changes

  useEffect(() => {

    fetchServiceTypes();

  }, [profile?.availableFor]);

  // Sync editedProfile with user data when profile or user changes

  useEffect(() => {

    console.log('useEffect Debug - Profile and User sync:', { profile, user });

    if (profile && user) {

      setEditedProfile(prev => ({

        ...prev,

        email: user.email || '',

        phone: user.phone || '',

        fullName: profile?.user?.fullName || '',

        jobTitle: profile?.jobTitle || '',

        primaryExpertise: profile?.primaryExpertise || '',

        experience: profile?.experience || '',

        location: profile?.location || '',

        bio: profile?.bio || '',

        hourlyRate: profile?.hourlyRate || '',

      }));

    }

  }, [profile, user]);



  const fetchProfile = async () => {
    try {
      const response = await api.getExpertProfile();
      console.log('🔍 FetchProfile Debug - Full response:', response);
      console.log('🔍 FetchProfile Debug - Profile picture URL:', response?.profilePicture);
      console.log('🔍 FetchProfile Debug - Profile picture type:', typeof response?.profilePicture);
      
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
      
      // Initialize verification states
      console.log('FetchProfile Debug - User object:', user);
      console.log('FetchProfile Debug - User verification status:', {
        email: user?.email,
        isEmailVerified: user?.isEmailVerified,
        phone: user?.phone,
        isPhoneVerified: user?.isPhoneVerified
      });
      
      setOriginalEmail(user?.email || '');
      setOriginalPhone(user?.phone || '');
      setCurrentEmailVerified(user?.isEmailVerified || false);
      setCurrentPhoneVerified(user?.isPhoneVerified || false);

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

  // Fetch application stats for overview
  const fetchApplicationStats = async () => {
    try {
      const response = await api.get('/applications/my-applications');
      if (response.success && response.data && response.data.applications) {
        const apps = response.data.applications;
        const stats = {
          total: apps.length,
          pending: apps.filter(app => app.status === 'PENDING').length,
          shortlisted: apps.filter(app => app.status === 'SHORTLISTED').length,
          rejected: apps.filter(app => app.status === 'REJECTED').length,
          accepted: apps.filter(app => app.status === 'ACCEPTED').length
        };
        setApplicationStats(stats);
      }
    } catch (error) {
      console.error('Error fetching application stats:', error);
    }
  };

  // Load my subscription
  const loadMySubscription = async () => {
    try {
      setSubsLoading(true);
      const data = await api.getMySubscription();
      console.log('Subscription data loaded:', data);
      setMySubscription(data);
    } catch (e) {
      console.error('Failed to load subscription', e);
    } finally {
      setSubsLoading(false);
    }
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


  // Check if user can apply to jobs (subscription limits)
  const canApplyToJobs = () => {
    if (!mySubscription?.plan) return false;
    
    // Check if subscription is expired
    if (mySubscription.endsAt && new Date(mySubscription.endsAt) < new Date()) {
      return false;
    }
    
    // Check application limit
    const usedApplications = mySubscription.usages?.[0]?.usedRequirements || 0;
    const maxApplications = mySubscription.plan.maxRequirements;
    
    if (maxApplications && usedApplications >= maxApplications) {
      return false;
    }
    
    return true;
  };

  // Get limitation details for modal
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
    
    // Check application limit
    const usedApplications = mySubscription.usages?.[0]?.usedRequirements || 0;
    const maxApplications = mySubscription.plan.maxRequirements;
    
    if (maxApplications && usedApplications >= maxApplications) {
      return {
        type: 'applications',
        currentUsage: usedApplications,
        planLimit: maxApplications,
        planName: mySubscription.plan.name
      };
    }
    
    return null;
  };

  // Handle application limit reached
  const handleApplicationLimitReached = () => {
    console.log('Modal function called');
    const limitationDetails = getCurrentLimitationDetails();
    console.log('Limitation details:', limitationDetails);
    if (limitationDetails) {
      setLimitationType(limitationDetails.type);
      setShowPlanLimitationModal(true);
    } else {
      // Fallback: navigate to subscription plans
      navigate('/subscription-plans');
    }
  };

  // Expose function globally for RequirementDetails component
  useEffect(() => {
    window.handleApplicationLimitReached = handleApplicationLimitReached;
    console.log('Modal function exposed globally');
    console.log('Function available:', typeof window.handleApplicationLimitReached);
    return () => {
      delete window.handleApplicationLimitReached;
    };
  }, [mySubscription]);




  const fetchServiceTypes = async () => {

    try {

      if (profile?.availableFor) {

        // Check which service groups match the available services

        const selectedTypes = availableServiceTypes.filter(ast => {

          // Check if any of the services in this group are in the profile's availableFor

          return ast.services.some(service => profile.availableFor.includes(service));

        }).map(ast => ({ 

          id: ast.id, 

          name: ast.name,

          services: ast.services 

        }));

        // Check for custom "Others" services that don't match any predefined group

        const predefinedServices = availableServiceTypes.flatMap(ast => ast.services);

        const customServices = profile.availableFor.filter(service => 

          !predefinedServices.includes(service)

        );

        if (customServices.length > 0) {

          selectedTypes.push({

            id: 'others',

            name: 'Others',

            services: customServices

          });

        }

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
      const response = await api.get('/ratings');
      console.log('Ratings API response:', response);
      if (response.success && Array.isArray(response.data)) {
        console.log('Ratings data:', response.data);
        setRatings(response.data);
        
        // Calculate average rating for trust score
        if (response.data.length > 0) {
          const avgRating = response.data.reduce((sum, rating) => sum + rating.overallRating, 0) / response.data.length;
          setTrustScore(Math.round(avgRating * 20)); // Convert 1-5 scale to 0-100
        } else {
          setTrustScore(0);
        }
      } else {
        setRatings([]);
        setTrustScore(0);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      setRatings([]);
      setTrustScore(0);
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
    // Check if email or phone has changed and needs verification
    if (emailChanged && !currentEmailVerified) {
      showToast('error', 'Please verify your new email address before saving');
      return;
    }
    
    if (phoneChanged && !currentPhoneVerified) {
      showToast('error', 'Please verify your new phone number before saving');
      return;
    }

    // Check if existing email or phone needs verification
    if (!user?.isEmailVerified && !emailChanged && editedProfile.email !== originalEmail) {
      showToast('error', 'Please verify your email address before saving');
      return;
    }
    
    if (!user?.isPhoneVerified && !phoneChanged && editedProfile.phone !== originalPhone) {
      showToast('error', 'Please verify your phone number before saving');
      return;
    }

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

  // Verification functions
  const isValidEmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone) => {
    if (!phone) return false;
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    if (cleanPhone.startsWith('+')) {
      const phoneWithoutPlus = cleanPhone.substring(1);
      return phoneWithoutPlus.length >= 7 && phoneWithoutPlus.length <= 15;
    } else {
      return cleanPhone.length >= 10 && cleanPhone.length <= 15;
    }
  };

  const handleSendEmailOtpForUpdate = async () => {
    try {
      setIsEmailSending(true);
      
      // Check if email is unique before sending OTP (only for changed emails)
      if (emailChanged) {
        const isAvailable = await checkAvailability('email', editedProfile.email);
        if (!isAvailable.available) {
          showToast('error', 'This email is already in use by another account.');
          return;
        }
      }
      
      // Call the send-email-otp endpoint for profile updates
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/auth/send-email-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ 
          email: editedProfile.email,
          isProfileUpdate: true,
          userId: user?.id
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setEmailOtpSent(true);
        setShowEmailVerification(true);
        showToast('success', 'Verification code sent to your email!');
      } else {
        const error = await response.json();
        showToast('error', error.message || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Error sending email OTP:', error);
      showToast('error', 'Failed to send verification code. Please try again.');
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleEmailVerification = async (otp) => {
    try {
      setIsEmailVerifying(true);
      
      // Call the verify-email endpoint for profile updates
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ 
          email: editedProfile.email,
          otp: otp,
          isProfileUpdate: true,
          userId: user?.id
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentEmailVerified(true);
        setShowEmailVerification(false);
        setEmailChanged(false);
        
        // Update the user object with the new verified email
        if (user) {
          const updatedUser = { ...user, email: editedProfile.email, isEmailVerified: true };
          console.log('Setting updated user for email verification:', updatedUser);
          setUser(updatedUser);
        }
        
        // Refresh profile data to get updated information
        await fetchProfile();
        
        showToast('success', 'Email verified and updated successfully!');
      } else {
        const error = await response.json();
        showToast('error', error.message || 'Email verification failed');
      }
    } catch (error) {
      console.error('Error verifying email:', error);
      showToast('error', 'Email verification failed. Please try again.');
    } finally {
      setIsEmailVerifying(false);
    }
  };

  const handleSendPhoneOtpForUpdate = async () => {
    try {
      setIsPhoneSending(true);
      
      // Call the send-phone-otp endpoint for profile updates
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/auth/send-phone-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ 
          phone: editedProfile.phone,
          isProfileUpdate: true,
          userId: user?.id
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setPhoneOtpSent(true);
        setShowPhoneVerification(true);
        showToast('success', 'Verification code sent to your phone!');
      } else {
        const error = await response.json();
        showToast('error', error.message || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Error sending phone OTP:', error);
      showToast('error', 'Failed to send verification code. Please try again.');
    } finally {
      setIsPhoneSending(false);
    }
  };

  const handlePhoneVerification = async (otp) => {
    try {
      setIsPhoneVerifying(true);
      
      // Call the verify-phone endpoint for profile updates
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/auth/verify-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ 
          phone: editedProfile.phone,
          otp: otp,
          isProfileUpdate: true,
          userId: user?.id
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentPhoneVerified(true);
        setShowPhoneVerification(false);
        setPhoneChanged(false);
        
        // Update the user object with the new verified phone
        if (user) {
          const updatedUser = { ...user, phone: editedProfile.phone, isPhoneVerified: true };
          console.log('Setting updated user for phone verification:', updatedUser);
          setUser(updatedUser);
        }
        
        // Refresh profile data to get updated information
        await fetchProfile();
        
        showToast('success', 'Phone number verified and updated successfully!');
      } else {
        const error = await response.json();
        showToast('error', error.message || 'Phone verification failed');
      }
    } catch (error) {
      console.error('Error verifying phone:', error);
      showToast('error', 'Phone verification failed. Please try again.');
    } finally {
      setIsPhoneVerifying(false);
    }
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle special cases for different field types
    let processedValue = value;
    if (name === 'hourlyRate') {
      processedValue = value === '' ? '' : parseFloat(value);
    }
    
    setEditedProfile(prev => ({ ...prev, [name]: processedValue }));
    
    // Track changes for verification
    if (name === 'email') {
      if (value !== originalEmail) {
        setEmailChanged(true);
        setCurrentEmailVerified(false);
        // Hide OTP modal when email changes
        setShowEmailVerification(false);
        setEmailOtpSent(false);
      } else if (value === originalEmail) {
        setEmailChanged(false);
        setCurrentEmailVerified(user?.isEmailVerified || false);
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
        setCurrentPhoneVerified(false);
        // Hide OTP modal when phone changes
        setShowPhoneVerification(false);
        setPhoneOtpSent(false);
      } else if (value === originalPhone) {
        setPhoneChanged(false);
        setCurrentPhoneVerified(user?.isPhoneVerified || false);
        // Hide OTP modal when phone is set back to original
        setShowPhoneVerification(false);
        setPhoneOtpSent(false);
        // Reset verification states when phone is set back to original verified phone
        if (user?.isPhoneVerified) {
          setCurrentPhoneVerified(true);
        }
      }
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

        // If removing "Others", hide the custom input

        if (serviceTypeId === 'others') {

          setShowCustomInput(false);

          setCustomServiceInput('');

        }

      } else {

        const serviceType = availableServiceTypes.find(ast => ast.id === serviceTypeId);

        
        // If selecting "Others", show the custom input

        if (serviceTypeId === 'others') {

          setShowCustomInput(true);

          // If there are already custom services, populate the input field

          const existingOthersService = serviceTypes.find(st => st.id === 'others');

          if (existingOthersService && existingOthersService.services && existingOthersService.services.length > 0) {

            setCustomServiceInput(existingOthersService.services.join(', '));

          }

          return; // Don't add to serviceTypes yet, wait for custom input

        }

        // When adding a service group, include all individual services in that group

        updatedServiceTypes = [...serviceTypes, { 

          id: serviceTypeId, 

          name: serviceType.name,

          services: serviceType.services 

        }];

      }

      
      
      // Flatten all services from selected groups for the API

      const allServices = updatedServiceTypes.flatMap(st => st.services || [st.name]);

      
      
      await api.updateExpertProfile({

        availableFor: allServices

      });

      
      
      setServiceTypes(updatedServiceTypes);

      showToast('success', `Service group ${isSelected ? 'removed' : 'added'} successfully!`);

    } catch (error) {

      console.error('Error updating service type:', error);

      showToast('error', 'Failed to update service type');

    }

  };

  // Handle custom service input submission

  const handleCustomServiceSubmit = async () => {

    if (!customServiceInput.trim()) {

      showToast('error', 'Please enter a custom service');

      return;

    }

    try {

      // Parse the input to handle multiple services separated by commas

      const customServices = customServiceInput.split(',').map(service => service.trim()).filter(service => service.length > 0);

      // Check if "Others" service already exists

      const existingOthersIndex = serviceTypes.findIndex(st => st.id === 'others');

      let updatedServiceTypes;

      if (existingOthersIndex !== -1) {

        // Update existing "Others" service

        updatedServiceTypes = [...serviceTypes];

        updatedServiceTypes[existingOthersIndex] = {

          id: 'others',

          name: 'Others',

          services: customServices

        };

      } else {

        // Add new "Others" service

        updatedServiceTypes = [...serviceTypes, { 

          id: 'others', 

          name: 'Others',

          services: customServices 

        }];

      }

      // Flatten all services from selected groups for the API

      const allServices = updatedServiceTypes.flatMap(st => st.services || [st.name]);

      await api.updateExpertProfile({

        availableFor: allServices

      });

      setServiceTypes(updatedServiceTypes);

      setShowCustomInput(false);

      setCustomServiceInput('');

      showToast('success', 'Custom service updated successfully!');

    } catch (error) {

      console.error('Error adding custom service:', error);

      showToast('error', 'Failed to add custom service');

    }

  };

  const formatDate = (dateString) => {

    if (!dateString) return '';

    return new Date(dateString).toLocaleDateString('en-US', { 

      year: 'numeric', 

      month: 'short' 

    });

  };



  // Helper function to get full profile picture URL

  const getFullProfilePictureUrl = (profilePictureUrl) => {

    if (!profilePictureUrl) return null;

    if (profilePictureUrl.startsWith('http://') || profilePictureUrl.startsWith('https://')) {

      return profilePictureUrl;

    }

    const baseUrl = 'http://localhost:3000';

    return `${baseUrl}/${profilePictureUrl}`;

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
      className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6 hover:border-gray-300/60 hover:shadow-lg hover:shadow-gray-900/5 transition-all duration-300"
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
            {change && (
              <div className="flex items-center space-x-1">
                {trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {change}
                </span>
              </div>
            )}
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1">{value}</h3>
          <p className="text-sm text-slate-600">{title}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100/50 to-slate-100/60" style={{ background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 50%, #e5e7eb 100%)' }}>
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
                {profile?.profilePicture ? (
                  <motion.img 
                    src={getFullProfilePictureUrl(profile.profilePicture)} 
                    alt="Profile Picture" 
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
                    <User className="w-5 h-5 text-white" />
                  </motion.div>
                )}
                <div>
                  <h1 className="text-lg font-semibold text-white">{profile?.user?.fullName || user?.fullName || 'Expert'}</h1>
                  <p className="text-sm text-gray-400">Expert Dashboard</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>



            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1">
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
                  id="experience"
                  label="Experience"
                  icon={Briefcase}
                  isActive={activeTab === 'experience'}
                  onClick={handleTabChange}
                />
              </motion.div>



              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.25 }}
              >
                <SidebarItem
                  id="colleges"
                  label="Opportunities"
                  icon={Building2}
                  isActive={activeTab === 'colleges'}
                  onClick={() => handleFeatureAccess("Opportunities", 'colleges')}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <SidebarItem
                  id="applications"
                  label="Applications"
                  icon={CheckCircle}
                  isActive={activeTab === 'applications'}
                  onClick={() => handleFeatureAccess("Applications", 'applications')}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.35 }}
              >
                <SidebarItem
                  id="ratings"
                  label="Reviews"
                  icon={Star}
                  isActive={activeTab === 'ratings'}
                  onClick={() => handleFeatureAccess("Reviews", 'ratings')}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <SidebarItem
                  id="rating-requests"
                  label="Rating Requests"
                  icon={MessageCircle}
                  isActive={activeTab === 'rating-requests'}
                  onClick={() => handleFeatureAccess("Rating Requests", 'rating-requests')}
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
                <motion.span
                  animate={{ x: 0 }}
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  Logout
                </motion.span>
              </motion.button>
            </motion.div>

          </div>

        </div>



        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200/60 px-8 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-800 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {activeTab === 'overview' && 'Expert Dashboard'}
                    {activeTab === 'profile' && 'Profile Management'}
                    {activeTab === 'experience' && 'Work Experience'}
                    {activeTab === 'colleges' && 'Opportunities'}
                    {activeTab === 'applications' && 'Applications'}
                    {activeTab === 'ratings' && 'Reviews & Ratings'}
                    {activeTab === 'rating-requests' && 'Rating Requests'}
                  </h1>
                  <p className="text-gray-600 mt-0.5 text-sm">
                    {activeTab === 'overview' && 'Manage your expert profile and track your opportunities'}
                    {activeTab === 'profile' && 'Manage your professional profile'}
                    {activeTab === 'experience' && 'Manage your work experience and skills'}
                    {activeTab === 'colleges' && 'Browse and apply to opportunities'}
                    {activeTab === 'applications' && 'Track your application status'}
                    {activeTab === 'ratings' && 'View reviews and ratings from colleges'}
                    {activeTab === 'rating-requests' && 'Manage rating requests from colleges'}
                  </p>
                </div>
              </div>

            </div>
          </header>



          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50/70">
            <div className="p-8 space-y-8">
              {/* All Tabs with Smooth Transitions */}
              <AnimatePresence mode="wait">

              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >





                  {/* Classic Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Profile Completeness */}
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
                          <p className="text-2xl font-bold mt-1">
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
                              return Math.round((completedFields.length / completionFields.length) * 100);
                            })()}%
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <UserCheck className="w-6 h-6" />
                        </div>
                      </div>
                    </motion.div>

                    {/* Total Applications */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm font-medium">Total Applications</p>
                          <p className="text-2xl font-bold mt-1">{applicationStats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                      </div>
                    </motion.div>

                    {/* Under Review */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4 text-white shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-pink-100 text-sm font-medium">Under Review</p>
                          <p className="text-2xl font-bold mt-1">{applicationStats.pending}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <Clock className="w-6 h-6" />
                        </div>
                      </div>
                    </motion.div>

                    {/* Selected */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm font-medium">Selected</p>
                          <p className="text-2xl font-bold mt-1">{applicationStats.accepted}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <Award className="w-6 h-6" />
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Subscription Status */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">Subscription Status</h3>
                      {mySubscription?.plan && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          mySubscription.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {mySubscription.status}
                        </span>
                      )}
                    </div>
                    
                    {subsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600"></div>
                      </div>
                    ) : mySubscription?.plan ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-semibold text-gray-900">{mySubscription.plan.name}</h4>
                            <p className="text-sm text-gray-600">
                              {mySubscription.plan.billingPeriod} • ₹{(mySubscription.plan.priceCents / 100).toFixed(0)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Valid until</p>
                            <p className="font-semibold text-gray-900">
                              {mySubscription.endsAt ? new Date(mySubscription.endsAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        {mySubscription.plan.maxRequirements && (
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Applications Used</span>
                              <span className="text-sm font-semibold text-gray-900">
                                {mySubscription.usages?.[0]?.usedRequirements || 0} / {mySubscription.plan.maxRequirements}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${Math.min(
                                    ((mySubscription.usages?.[0]?.usedRequirements || 0) / mySubscription.plan.maxRequirements) * 100, 
                                    100
                                  )}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex space-x-3">
                          <button
                            onClick={() => navigate('/subscription-plans')}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            Upgrade Plan
                          </button>
                          <button
                            onClick={() => navigate('/subscription-plans')}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                          >
                            View Plans
                          </button>
                        </div>
                        
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Shield className="w-8 h-8 text-gray-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h4>
                        <p className="text-gray-600 mb-4">Subscribe to a plan to start applying to jobs</p>
                        <button
                          onClick={() => navigate('/subscription-plans')}
                          className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Choose a Plan
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Classic Quick Actions */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button
                        onClick={() => handleTabChange('profile')}
                        className="group flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 hover:border-blue-300 transition-all duration-200"
                      >
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                          <Edit3 className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Update Profile</p>
                          <p className="text-xs text-gray-600">Keep information current</p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleTabChange('colleges')}
                        className="group flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 hover:border-green-300 transition-all duration-200"
                      >
                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-700 transition-colors">
                          <Search className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Find Opportunities</p>
                          <p className="text-xs text-gray-600">Search college posts</p>
                        </div>
                      </button>
                    </div>
                  </div>




                </motion.div>

              )}



              {/* Profile Tab */}

              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
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



                                         {/* Verification Warning */}
                     {isEditingProfile && (
                       (emailChanged && !currentEmailVerified) || 
                       (phoneChanged && !currentPhoneVerified) || 
                       (!user?.isEmailVerified && !emailChanged && editedProfile.email !== originalEmail) || 
                       (!user?.isPhoneVerified && !phoneChanged && editedProfile.phone !== originalPhone)
                     ) && (
                       <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                         <div className="flex items-start space-x-3">
                           <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                           <div className="flex-1">
                             <h4 className="text-sm font-semibold text-amber-800 mb-1">
                               Verification Required
                             </h4>
                             <p className="text-sm text-amber-700">
                               {emailChanged && !currentEmailVerified && "Please verify your new email address. "}
                               {phoneChanged && !currentPhoneVerified && "Please verify your new phone number. "}
                               {!user?.isEmailVerified && !emailChanged && editedProfile.email !== originalEmail && "Please verify your email address. "}
                               {!user?.isPhoneVerified && !phoneChanged && editedProfile.phone !== originalPhone && "Please verify your phone number. "}
                               You must complete verification before saving your profile.
                             </p>
                           </div>
                         </div>
                       </div>
                     )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                      {/* Profile Picture */}

                      <div className="space-y-4">

                        <h3 className="font-semibold text-slate-900">Profile Picture</h3>


                        <FileUpload
                          type="image"
                          currentFile={profile?.profilePicture}
                          isEditing={isEditingProfile}
                          onFileSelect={async (file) => {
                            try {
                              console.log('🖼️ Profile Picture Upload - Starting upload for file:', file);
                              console.log('🖼️ Profile Picture Upload - Current profile:', profile);
                              
                              const response = await api.uploadProfilePicture(file);
                              console.log('🖼️ Profile Picture Upload - API response:', response);
                              console.log('🖼️ Profile Picture Upload - New profile picture URL:', response.profilePicture);
                              
                              setProfile(prevProfile => ({ 
                                ...prevProfile, 
                                profilePicture: response.profilePicture 
                              }));
                              
                              console.log('🖼️ Profile Picture Upload - Profile state updated, fetching fresh profile...');
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

                          isEditing={isEditingProfile}

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





                    </div>



                    {/* Profile Form */}

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">

                      <div>

                        <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>

                        <input

                          type="text"

                          name="fullName"

                          value={isEditingProfile ? editedProfile.fullName || '' : profile?.user?.fullName || ''}

                          onChange={handleProfileInputChange}

                          disabled={!isEditingProfile}

                          className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-colors"

                          placeholder="Enter your full name"

                        />

                      </div>



                      <div>

                        <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>

                         <div className="relative">

                           {isEditingProfile ? (
                             <div className="space-y-2">
                               <div className="flex flex-col md:flex-row gap-2">
                        <input
                          type="tel"
                                   name="phone"
                                   value={editedProfile.phone || ''}
                                   onChange={handleProfileInputChange}
                                   className="flex-1 px-4 py-3 pr-12 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500"
                          placeholder="Enter your phone number"
                        />
                                 {(phoneChanged || !user?.isPhoneVerified) && (
                                   <button
                                     type="button"
                                     onClick={handleSendPhoneOtpForUpdate}
                                     disabled={isPhoneSending || !isValidPhone(editedProfile.phone)}
                                     className="w-full md:w-auto px-3 md:px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm font-medium rounded-md transition-all duration-200 shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                                   >
                                     {isPhoneSending ? 'Sending...' : 'Verify Phone'}
                                   </button>
                                 )}
                               </div>
                               {editedProfile.phone && !isValidPhone(editedProfile.phone) && (
                                 <span className="text-xs text-red-600">Please enter a valid phone number</span>
                               )}
                               
                               {/* Phone Verification Modal - Inline */}
                               <PhoneVerificationModal
                                 isOpen={showPhoneVerification}
                                 phone={editedProfile.phone}
                                 isVerifying={isPhoneVerifying}
                                 onVerify={handlePhoneVerification}
                                 onClose={() => setShowPhoneVerification(false)}
                                 onSendOtp={handleSendPhoneOtpForUpdate}
                                 isVerified={currentPhoneVerified}
                                 isSending={isPhoneSending}
                                 otpSent={phoneOtpSent}
                               />
                             </div>
                           ) : (
                             <input
                               type="tel"
                               value={profile?.user?.phone || ''}
                               disabled={true}
                               className="w-full px-4 py-3 pr-12 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                               placeholder="Enter your phone number"
                             />
                           )}
                           {currentPhoneVerified && editedProfile.phone && !phoneChanged && user?.isPhoneVerified && (
                             <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                               <CheckCircle className="h-5 w-5 text-emerald-600" />
                             </div>
                           )}
                         </div>
                         {editedProfile.phone && (!currentPhoneVerified || phoneChanged || !user?.isPhoneVerified) && !(editedProfile.phone === originalPhone && user?.isPhoneVerified) && (
                           <p className="text-xs text-amber-600 mt-1 flex items-center space-x-1">
                             <AlertCircle className="h-3 w-3" />
                             <span>
                               {phoneChanged ? 'New phone number needs verification' : 
                                !user?.isPhoneVerified ? 'Phone number not verified' : 'Phone number not verified'}
                             </span>
                           </p>
                         )}
                      </div>

                      <div>
                         <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                         <div className="relative">
                           {isEditingProfile ? (
                             <div className="space-y-2">
                               <div className="flex flex-col md:flex-row gap-2">
                                 <input
                                   type="email"
                                   name="email"
                                   value={editedProfile.email || ''}
                                   onChange={handleProfileInputChange}
                                   className="flex-1 px-4 py-3 pr-12 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500"
                                   placeholder="Enter your email address"
                                 />
                                 {(emailChanged || !user?.isEmailVerified) && (
                                   <button
                                     type="button"
                                     onClick={handleSendEmailOtpForUpdate}
                                     disabled={isEmailSending || !isValidEmail(editedProfile.email)}
                                     className="w-full md:w-auto px-3 md:px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm font-medium rounded-md transition-all duration-200 shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                                   >
                                     {isEmailSending ? 'Sending...' : 'Verify Email'}
                                   </button>
                                 )}
                               </div>
                               {editedProfile.email && !isValidEmail(editedProfile.email) && (
                                 <span className="text-xs text-red-600">Please enter a valid email address</span>
                               )}
                               
                               {/* Email Verification Modal - Inline */}
                               <EmailVerificationModal
                                 isOpen={showEmailVerification}
                                 email={editedProfile.email}
                                 isVerifying={isEmailVerifying}
                                 onVerify={handleEmailVerification}
                                 onClose={() => setShowEmailVerification(false)}
                                 onSendOtp={handleSendEmailOtpForUpdate}
                                 isVerified={currentEmailVerified}
                                 isSending={isEmailSending}
                                 otpSent={emailOtpSent}
                               />
                             </div>
                           ) : (
                             <input
                               type="email"
                               value={user?.email || ''}
                               disabled={true}
                               className="w-full px-4 py-3 pr-12 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                               placeholder="Email address"
                             />
                           )}
                           {currentEmailVerified && editedProfile.email && !emailChanged && user?.isEmailVerified && (
                             <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                               <CheckCircle className="h-5 w-5 text-emerald-600" />
                             </div>
                           )}
                         </div>
                         {editedProfile.email && (!currentEmailVerified || emailChanged || !user?.isEmailVerified) && !(editedProfile.email === originalEmail && user?.isEmailVerified) && (
                           <p className="text-xs text-amber-600 mt-1 flex items-center space-x-1">
                             <AlertCircle className="h-3 w-3" />
                             <span>
                               {emailChanged ? 'New email needs verification' : 
                                !user?.isEmailVerified ? 'Email not verified' : 'Email not verified'}
                             </span>
                           </p>
                         )}
                       </div>

                      <div>

                        <label className="block text-sm font-semibold text-slate-700 mb-2">Job Title</label>

                        <input

                          type="text"

                          name="jobTitle"

                          value={isEditingProfile ? editedProfile.jobTitle || '' : profile?.jobTitle || ''}

                          onChange={handleProfileInputChange}

                          disabled={!isEditingProfile}

                          className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-colors"

                          placeholder="e.g., Software Engineer, Marketing Manager"

                        />

                      </div>



                      <div>

                        <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>

                        <input

                          type="text"

                          name="location"

                          value={isEditingProfile ? editedProfile.location || '' : profile?.location || ''}

                          onChange={handleProfileInputChange}

                          disabled={!isEditingProfile}

                          className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-colors"

                          placeholder="e.g., San Francisco, CA"

                        />

                      </div>



                      <div>

                        <label className="block text-sm font-semibold text-slate-700 mb-2">Primary Expertise</label>

                        {isEditingProfile ? (

                          <select

                            name="primaryExpertise"

                            value={editedProfile.primaryExpertise || ''}

                          onChange={handleProfileInputChange}

                            className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500 transition-colors"

                          >

                            <option value="">Select Primary Expertise</option>

                            <option value="DATA_SCIENCE_AI">Data Science & AI</option>

                            <option value="CYBERSECURITY">Cybersecurity</option>

                            <option value="SOFTWARE_DEVELOPMENT">Software Development</option>

                            <option value="DIGITAL_MARKETING">Digital Marketing</option>

                            <option value="BUSINESS_STRATEGY">Business Strategy</option>

                            <option value="HEALTHCARE">Healthcare</option>

                            <option value="ENGINEERING">Engineering</option>

                            <option value="FINANCE">Finance</option>

                            <option value="EDUCATION">Education</option>

                            <option value="RESEARCH_COLLABORATION">Research Collaboration</option>

                            <option value="WORKSHOP">Workshop</option>

                            <option value="GUEST_LECTURE">Guest Lecture</option>

                            <option value="MENTORING">Mentoring</option>

                            <option value="CURRICULUM_REVIEW">Curriculum Review</option>

                            <option value="INDUSTRY_PROJECT">Industry Project</option>

                            <option value="CONSULTING">Consulting</option>

                            <option value="TRAINING_DEVELOPMENT">Training & Development</option>

                            <option value="PUBLIC_SPEAKING">Public Speaking</option>

                            <option value="LEADERSHIP_DEVELOPMENT">Leadership Development</option>

                            <option value="INNOVATION_DESIGN">Innovation & Design</option>

                            <option value="SUSTAINABILITY">Sustainability</option>

                          </select>

                        ) : (

                          <p className="w-full px-4 py-3 bg-slate-50 text-slate-900 rounded-xl">

                            {profile?.primaryExpertise ? 
                              profile.primaryExpertise
                                .split('_')
                                .map(word => word.charAt(0) + word.slice(1).toLowerCase())
                                .join(' ')
                              : 'Not specified'
                            }

                          </p>

                        )}

                      </div>



                      <div>

                        <label className="block text-sm font-semibold text-slate-700 mb-2">Years of Experience</label>

                        <input

                          type="text"

                          name="experience"

                          value={isEditingProfile ? editedProfile.experience || '' : profile?.experience || ''}

                          onChange={handleProfileInputChange}

                          disabled={!isEditingProfile}

                          className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-colors"

                          placeholder="e.g., 5 years"

                        />

                      </div>



                      <div className="md:col-span-2">

                        <label className="block text-sm font-semibold text-slate-700 mb-2">Bio</label>

                        <textarea

                          name="bio"

                          value={isEditingProfile ? editedProfile.bio || '' : profile?.bio || ''}

                          onChange={handleProfileInputChange}

                          disabled={!isEditingProfile}

                          rows={4}

                          className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-colors resize-none"

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

                            name="hourlyRate"

                            value={isEditingProfile ? editedProfile.hourlyRate || '' : profile?.hourlyRate || ''}

                            onChange={handleProfileInputChange}

                            disabled={!isEditingProfile}

                            className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-colors"

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

                            // Reset verification states

                            setEmailChanged(false);

                            setPhoneChanged(false);

                            setCurrentEmailVerified(user?.isEmailVerified || false);

                            setCurrentPhoneVerified(user?.isPhoneVerified || false);

                            setShowEmailVerification(false);

                            setShowPhoneVerification(false);

                            setEmailOtpSent(false);

                            setPhoneOtpSent(false);

                          }}

                          className="px-6 py-2 text-slate-700 bg-slate-200 rounded-xl hover:bg-slate-300 transition-colors font-medium"

                        >

                          Cancel

                        </motion.button>

                        <motion.button

                          whileHover={{ scale: 1.02 }}

                          whileTap={{ scale: 0.98 }}

                          onClick={handleProfileUpdate}

                          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-md transition-all duration-200 shadow-sm hover:shadow-md font-medium"

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

                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-md transition-all duration-200 shadow-sm hover:shadow-md font-medium"

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

                              className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500"

                            />

                          </div>

                          <div>

                            <select

                              value={newSkill.skillLevel}

                              onChange={(e) => setNewSkill({ ...newSkill, skillLevel: e.target.value })}

                              className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500"

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

                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-md transition-all duration-200 shadow-sm hover:shadow-md font-medium"

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

                            className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-md transition-all duration-200 shadow-sm hover:shadow-md font-medium"

                          >

                            <Plus className="h-4 w-4" />

                            <span>Add Your First Skill</span>

                          </motion.button>

                        </div>

                      )}

                    </div>

                  </div>



                  {/* Services Section */}

                  <div className="bg-white rounded-2xl border border-slate-200/60 p-6">

                    <div className="mb-6">

                      <h3 className="text-lg font-semibold text-slate-900 mb-2">What are your primary services? *</h3>

                      <p className="text-slate-600">Select the types of services you're available to provide</p>

                    </div>

                    

                     
                    
                     
                    
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                      {availableServiceTypes.map((serviceType) => {

                        const isSelected = serviceTypes.some(st => st.id === serviceType.id);

                        const Icon = serviceType.icon;

                        // For "Others" service type, show custom services if they exist

                        let displayDescription = serviceType.description;

                        if (serviceType.id === 'others' && isSelected) {

                          const othersService = serviceTypes.find(st => st.id === 'others');

                          if (othersService && othersService.services && othersService.services.length > 0) {

                            displayDescription = othersService.services.join(', ');

                          }

                        }

                        
                        
                        return (

                          <motion.div

                            key={serviceType.id}

                            whileHover={{ y: -2 }}

                            whileTap={{ scale: 0.98 }}

                            onClick={() => handleServiceTypeToggle(serviceType.id)}

                            className={`relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer ${

                              isSelected 

                                ? 'border-blue-500 bg-blue-50 shadow-md' 

                                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'

                            }`}

                          >

                            <div className="p-4">

                              <div className="flex items-center space-x-3">

                                <div className={`p-2 rounded-lg transition-all duration-300 ${

                                  isSelected 

                                    ? 'bg-blue-500 text-white' 

                                    : 'bg-slate-100 text-slate-600'

                                }`}>

                                  <Icon className="h-5 w-5" />

                                </div>

                                <div>

                                  <h4 className={`text-base font-semibold transition-colors duration-300 ${

                                    isSelected ? 'text-blue-900' : 'text-slate-900'

                                  }`}>

                                    {serviceType.name}

                                  </h4>

                                  <p className={`text-xs transition-colors duration-300 ${

                                    isSelected ? 'text-blue-700' : 'text-slate-600'

                                  }`}>

                                    {displayDescription}

                                  </p>

                                </div>

                              </div>

                            </div>

                          </motion.div>

                        );

                      })}

                    </div>

                    

                    {/* Custom Service Input for Others */}

                    {showCustomInput && (

                      <motion.div

                        initial={{ opacity: 0, y: -10 }}

                        animate={{ opacity: 1, y: 0 }}

                        exit={{ opacity: 0, y: -10 }}

                        className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"

                      >

                        <div className="mb-3">

                          <label className="block text-sm font-semibold text-blue-900 mb-2">

                            Specify your custom service area

                          </label>

                          <p className="text-xs text-blue-700 mb-3">

                            Enter the specific service or expertise area you'd like to offer

                          </p>

                        </div>

                        <div className="flex gap-3">

                          <input

                            type="text"

                            value={customServiceInput}

                            onChange={(e) => setCustomServiceInput(e.target.value)}

                            placeholder="e.g., Blockchain Consulting, Digital Art, Music Production (separate multiple services with commas)"

                            className="flex-1 px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500"

                            onKeyPress={(e) => e.key === 'Enter' && handleCustomServiceSubmit()}

                          />

                          <button

                            onClick={handleCustomServiceSubmit}

                            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-md transition-all duration-200 shadow-sm hover:shadow-md font-medium"

                          >

                            Add

                          </button>

                          <button

                            onClick={() => {

                              setShowCustomInput(false);

                              setCustomServiceInput('');

                            }}

                            className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"

                          >

                            Cancel

                          </button>

                        </div>

                      </motion.div>

                    )}

                  </div>

                </motion.div>

                            )}



              {/* Experience Tab */}

              {activeTab === 'experience' && (
                <motion.div
                  key="experience"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
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

                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-md transition-all duration-200 shadow-sm hover:shadow-md font-medium"

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

                        className="mb-6 p-6 bg-slate-50/50 rounded-xl border border-slate-200/60"

                      >

                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New Experience</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                          <div>

                            <label className="block text-sm font-semibold text-slate-700 mb-2">Job Title *</label>

                            <input

                              type="text"

                              value={newExperience.jobTitle}

                              onChange={(e) => setNewExperience({ ...newExperience, jobTitle: e.target.value })}

                              className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500"

                              placeholder="e.g., Senior Software Engineer"

                            />

                          </div>

                          <div>

                            <label className="block text-sm font-semibold text-slate-700 mb-2">Company *</label>

                            <input

                              type="text"

                              value={newExperience.company}

                              onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}

                              className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500"

                              placeholder="e.g., Google Inc."

                            />

                          </div>

                          <div>

                            <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>

                            <input

                              type="text"

                              value={newExperience.location}

                              onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}

                              className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500"

                              placeholder="e.g., San Francisco, CA"

                            />

                          </div>

                          <div>

                            <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date *</label>

                            <input

                              type="date"

                              value={newExperience.startDate}

                              onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}

                              className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500"

                            />

                          </div>

                          <div>

                            <label className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>

                            <input

                              type="date"

                              value={newExperience.endDate}

                              onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}

                              disabled={newExperience.isCurrent}

                              className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500"

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

                              className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500 resize-none"

                              placeholder="Describe your role and responsibilities..."

                            />

                          </div>

                          <div>

                            <label className="block text-sm font-semibold text-slate-700 mb-2">Skills Used</label>

                            <input

                              type="text"

                              value={newExperience.skills}

                              onChange={(e) => setNewExperience({ ...newExperience, skills: e.target.value })}

                              className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500"

                              placeholder="e.g., React, Node.js, Python (comma separated)"

                            />

                          </div>

                          <div>

                            <label className="block text-sm font-semibold text-slate-700 mb-2">Key Achievements</label>

                            <textarea

                              value={newExperience.achievements}

                              onChange={(e) => setNewExperience({ ...newExperience, achievements: e.target.value })}

                              rows={3}

                              className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500 resize-none"

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

                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-md transition-all duration-200 shadow-sm hover:shadow-md font-medium"

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

                                      className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500"

                                    />

                                  </div>

                                  <div>

                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Company</label>

                                    <input

                                      type="text"

                                      value={editingExperience.company || ''}

                                      onChange={(e) => setEditingExperience({ ...editingExperience, company: e.target.value })}

                                      className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500"

                                    />

                                  </div>

                                  <div>

                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>

                                    <input

                                      type="text"

                                      value={editingExperience.location || ''}

                                      onChange={(e) => setEditingExperience({ ...editingExperience, location: e.target.value })}

                                      className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500"

                                    />

                                  </div>

                                  <div>

                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date</label>

                                    <input

                                      type="date"

                                      value={editingExperience.startDate || ''}

                                      onChange={(e) => setEditingExperience({ ...editingExperience, startDate: e.target.value })}

                                      className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500"

                                    />

                                  </div>

                                  <div>

                                    <label className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>

                                    <input

                                      type="date"

                                      value={editingExperience.endDate || ''}

                                      onChange={(e) => setEditingExperience({ ...editingExperience, endDate: e.target.value })}

                                      disabled={editingExperience.isCurrent}

                                      className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500"

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

                                      className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500 resize-none"

                                    />

                                  </div>

                                  <div>

                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Skills Used</label>

                                    <input

                                      type="text"

                                      value={Array.isArray(editingExperience.skills) ? editingExperience.skills.join(', ') : editingExperience.skills || ''}

                                      onChange={(e) => setEditingExperience({ ...editingExperience, skills: e.target.value })}

                                      className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500"

                                    />

                                  </div>

                                  <div>

                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Key Achievements</label>

                                    <textarea

                                      value={editingExperience.achievements || ''}

                                      onChange={(e) => setEditingExperience({ ...editingExperience, achievements: e.target.value })}

                                      rows={3}

                                      className="w-full px-4 py-3 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500 resize-none"

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

                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-md transition-all duration-200 shadow-sm hover:shadow-md font-medium"

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

                            className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-md transition-all duration-200 shadow-sm hover:shadow-md font-medium"

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







              {/* Colleges Tab */}

              {activeTab === 'colleges' && (
                canAccessFeatures() ? (
                  <motion.div
                    key="colleges"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >

                    {/* Expert Opportunities Component */}
                    <ExpertOpportunities />

                  </motion.div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                    <div className="text-center py-8">
                      <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 mb-3">Verification required to access Opportunities</p>
                      <div className="space-y-2">
                        {!user?.isEmailVerified && (
                          <button
                            onClick={handleVerifyEmailFromFeature}
                            className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            Verify Email
                          </button>
                        )}
                        {!user?.isPhoneVerified && (
                          <button
                            onClick={handleVerifyPhoneFromFeature}
                            className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            Verify Phone
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}



              {/* Applications Tab */}

              {activeTab === 'applications' && (
                canAccessFeatures() ? (
                  <motion.div
                    key="applications"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >

                    {/* Application Tracking Component */}
                    <ApplicationTracking onRequestRating={handleRequestRating} ratingRequests={ratingRequests} />

                  </motion.div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 mb-3">Verification required to access Applications</p>
                      <div className="space-y-2">
                        {!user?.isEmailVerified && (
                          <button
                            onClick={handleVerifyEmailFromFeature}
                            className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            Verify Email
                          </button>
                        )}
                        {!user?.isPhoneVerified && (
                          <button
                            onClick={handleVerifyPhoneFromFeature}
                            className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
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
                canAccessFeatures() ? (
                  <motion.div

                    initial={{ opacity: 0, y: 20 }}

                    animate={{ opacity: 1, y: 0 }}

                    className="space-y-6"

                  >




                  {/* Reviews List */}

                  <div className="bg-white rounded-2xl border border-slate-200/60 p-6">

                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate-900">Recent Reviews</h3>
                      <div className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-slate-600">
                          {ratings.length} review{ratings.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    
                    
                    {ratings && ratings.length > 0 ? (

                      <div className="space-y-4">

                        {ratings.map((rating, index) => (

                          <motion.div

                            key={rating.id || index}

                            initial={{ opacity: 0, y: 10 }}

                            animate={{ opacity: 1, y: 0 }}

                            className="p-4 bg-white rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200"

                          >

                            <div className="flex items-start space-x-4">

                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                  <Star className="h-4 w-4 text-white fill-current" />
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">

                                <div className="flex items-center justify-between mb-2">

                                  <h4 className="font-semibold text-slate-900">
                                    {rating.requirement?.title || 'Project Rating'}
                                  </h4>

                                  <div className="flex items-center space-x-2">

                                    <div className="flex items-center space-x-1">

                                      {[...Array(5)].map((_, i) => (

                                        <Star

                                          key={i}

                                          className={`h-4 w-4 ${

                                            i < rating.overallRating ? 'text-yellow-400 fill-current' : 'text-gray-300'

                                          }`}

                                        />

                                      ))}

                                    </div>

                                    <span className="text-sm font-semibold text-slate-700">
                                      {rating.overallRating}/5
                                    </span>

                                  </div>

                                </div>

                                {rating.review && (
                                  <p className="text-slate-600 mb-2">
                                    "{rating.review}"
                                  </p>
                                )}

                                {/* Detailed Rating Questions */}
                                {rating.ratingQuestions && rating.ratingQuestions.length > 0 && (
                                  <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                                    <h5 className="text-xs font-semibold text-slate-700 mb-2 flex items-center">
                                      <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                      Breakdown
                                    </h5>
                                    <div className="grid grid-cols-2 gap-2">
                                      {rating.ratingQuestions.map((question, qIndex) => (
                                        <div key={qIndex} className="flex items-center justify-between text-xs">
                                          <span className="text-slate-600 truncate">{question.question}</span>
                                          <div className="flex items-center space-x-1 ml-2">
                                            {[...Array(5)].map((_, i) => (
                                              <Star
                                                key={i}
                                                className={`h-3 w-3 ${
                                                  i < question.answer ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                                }`}
                                              />
                                            ))}
                                            <span className="ml-1 text-slate-600">
                                              {question.answer}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-xs font-medium text-slate-600">
                                      {rating.collegeprofile?.institutionName || 
                                       rating.collegeprofile?.name || 
                                       'College'}
                                    </span>
                                  </div>
                                  <span className="text-xs text-slate-500">
                                    {new Date(rating.createdAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
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
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                    <div className="text-center py-8">
                      <Star className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 mb-3">Verification required to access Reviews</p>
                      <div className="space-y-2">
                        {!user?.isEmailVerified && (
                          <button
                            onClick={handleVerifyEmailFromFeature}
                            className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            Verify Email
                          </button>
                        )}
                        {!user?.isPhoneVerified && (
                          <button
                            onClick={handleVerifyPhoneFromFeature}
                            className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            Verify Phone
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}

              {/* Rating Requests Tab */}
              {activeTab === 'rating-requests' && (
                canAccessFeatures() ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Rating Requests List */}
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-900">Rating Requests</h3>
                        <div className="text-sm text-slate-500">
                          {ratingRequests.length} request{ratingRequests.length !== 1 ? 's' : ''}
                        </div>
                      </div>

                      <ExpertRatingRequestsList ratingRequests={ratingRequests} />
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 mb-3">Verification required to access Rating Requests</p>
                      <div className="space-y-2">
                        {!user?.isEmailVerified && (
                          <button
                            onClick={handleVerifyEmailFromFeature}
                            className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            Verify Email
                          </button>
                        )}
                        {!user?.isPhoneVerified && (
                          <button
                            onClick={handleVerifyPhoneFromFeature}
                            className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            Verify Phone
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
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



      {/* Toast */}

      {toast && (

        <Toast

          toast={{ ...toast, show: true }}

          hideToast={() => setToast(null)}

        />

      )}

      {/* Verification Requirement Modal */}
      <VerificationRequirementModal
        isOpen={showVerificationRequirement}
        onClose={() => setShowVerificationRequirement(false)}
        onVerifyEmail={handleVerifyEmailFromFeature}
        onVerifyPhone={handleVerifyPhoneFromFeature}
        user={user}
        featureName={verificationFeatureName}
      />

      {/* Rating Request Modal */}
      {showRatingRequestModal && selectedRequirement && (
        <RatingRequestModal
          isOpen={showRatingRequestModal}
          onClose={() => setShowRatingRequestModal(false)}
          requirement={selectedRequirement}
          application={selectedApplication}
          onRequestSubmitted={handleRatingRequestSubmitted}
        />
      )}

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



export default ExpertDashboard;


