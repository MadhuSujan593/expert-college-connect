import React, { useState, useEffect } from 'react';
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
  DollarSign, 
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
  Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../utils/api';
import Toast from '../../components/common/Toast';
import FileUpload from '../../components/common/FileUpload';
import EmailVerificationModal from '../../components/verification/EmailVerificationModal';
import PhoneVerificationModal from '../../components/verification/PhoneVerificationModal';

const CollegeDashboard = () => {
  const { user, logout, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
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
                onClick={setActiveTab}
              />
              <SidebarItem
                id="profile"
                label="Profile"
                icon={Building2}
                isActive={activeTab === 'profile'}
                onClick={setActiveTab}
              />
              <SidebarItem
                id="requirements"
                label="Requirements"
                icon={FileText}
                isActive={activeTab === 'requirements'}
                onClick={setActiveTab}
              />
              <SidebarItem
                id="experts"
                label="Expert Directory"
                icon={Users}
                isActive={activeTab === 'experts'}
                onClick={setActiveTab}
              />
              <SidebarItem
                id="ratings"
                label="Ratings & Trust"
                icon={Award}
                isActive={activeTab === 'ratings'}
                onClick={setActiveTab}
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
                        onClick={() => setActiveTab('requirements')}
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
                        onClick={() => setActiveTab('experts')}
                        className="group flex items-center space-x-4 p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl hover:from-emerald-100 hover:to-emerald-200/50 transition-all duration-300"
                      >
                        <div className="p-3 bg-emerald-600 rounded-xl group-hover:bg-emerald-700 transition-colors">
                          <Search className="h-5 w-5 text-white" />
          </div>
                        <div className="text-left">
                          <p className="font-semibold text-slate-900">Find Experts</p>
                          <p className="text-sm text-slate-600">Search expert directory</p>
        </div>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab('profile')}
                        className="group flex items-center space-x-4 p-5 bg-gradient-to-br from-violet-50 to-violet-100/50 rounded-xl hover:from-violet-100 hover:to-violet-200/50 transition-all duration-300"
                      >
                        <div className="p-3 bg-violet-600 rounded-xl group-hover:bg-violet-700 transition-colors">
                          <Building2 className="h-5 w-5 text-white" />
            </div>
                        <div className="text-left">
                          <p className="font-semibold text-slate-900">Update Profile</p>
                          <p className="text-sm text-slate-600">Manage institution info</p>
          </div>
                      </motion.button>
      </div>
    </div>

    {/* Recent Requirements */}
                  <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6">Recent Requirements</h3>
      <div className="space-y-4">
        {recentRequirements.length > 0 ? (
          recentRequirements.map((requirement) => (
                          <motion.div
                            key={requirement.id}
                            whileHover={{ x: 4 }}
                            className="flex items-center space-x-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                          >
                            <div className="p-2.5 bg-blue-100 rounded-xl">
                              <FileText className="h-4 w-4 text-blue-600" />
                            </div>
                <div className="flex-1">
                              <p className="text-sm font-semibold text-slate-900">{requirement.title}</p>
                              <p className="text-xs text-slate-500">{requirement.category}</p>
                </div>
                {requirement.isUrgent && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                    Urgent
                  </span>
                )}
                          </motion.div>
          ))
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No requirements posted yet</p>
                          <button 
                            onClick={() => setActiveTab('requirements')}
                            className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
              Post your first requirement
            </button>
          </div>
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
                <RequirementsTab recentRequirements={recentRequirements} />
              )}

              {/* Experts Tab */}
              {activeTab === 'experts' && (
                <ExpertsTab />
              )}

              {/* Ratings Tab */}
              {activeTab === 'ratings' && (
                <RatingsTab />
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

      {/* Verification Modals - Now handled inline in ProfileTab */}
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
                      email={profileForm.email}
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
                    phone={profileForm.phone}
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
const RequirementsTab = ({ recentRequirements }) => {
  const [showForm, setShowForm] = useState(false);
  const [requirementForm, setRequirementForm] = useState({
    title: '',
    category: '',
    description: '',
    budget: '',
    deadline: '',
    isUrgent: false,
    requirements: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRequirementForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement API call
    console.log('New requirement:', requirementForm);
    setShowForm(false);
    setRequirementForm({
      title: '',
      category: '',
      description: '',
      budget: '',
      deadline: '',
      isUrgent: false,
      requirements: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
    <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Academic Requirements Management</h3>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showForm ? 'Cancel' : 'Post New Requirement'}
      </button>
    </div>

        {/* Add Requirement Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Requirement Title *</label>
                <input
                  type="text"
                  name="title"
                  value={requirementForm.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Data Science Workshop"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                                 <select
                   name="category"
                   value={requirementForm.category}
                   onChange={handleInputChange}
                   required
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
                name="description"
                value={requirementForm.description}
                onChange={handleInputChange}
                required
              rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your requirement in detail..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Budget (₹)</label>
                 <input
                   type="number"
                   name="budget"
                   value={requirementForm.budget}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                   placeholder="0"
                 />
               </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  value={requirementForm.deadline}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isUrgent"
                  checked={requirementForm.isUrgent}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Mark as Urgent</label>
              </div>
        </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Specific Requirements</label>
            <textarea
                name="requirements"
                value={requirementForm.requirements}
              onChange={handleInputChange}
                rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any specific skills, experience, or qualifications needed..."
            />
        </div>

            <div className="flex space-x-4">
            <button
                type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                Post Requirement
            </button>
            <button
                type="button"
                onClick={() => setShowForm(false)}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
          </form>
        )}

        {/* Recent Requirements List */}
        <div className="space-y-4">
          {recentRequirements.length > 0 ? (
            recentRequirements.map((requirement) => (
              <div key={requirement.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{requirement.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{requirement.category}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                             {requirement.budget && (
                         <span className="flex items-center">
                           <DollarSign className="w-3 h-3 mr-1" />
                           ₹{requirement.budget}
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
              <button 
                onClick={() => setShowForm(true)}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Post your first requirement
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Experts Tab Component
const ExpertsTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [experts, setExperts] = useState([
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      expertise: 'Data Science & AI',
      company: 'Google',
      rating: 4.8,
      reviews: 24,
      hourlyRate: 150,
      availableFor: ['Workshops', 'Mentoring', 'Guest Lectures'],
      verified: true
    },
    {
      id: 2,
      name: 'Prof. Michael Chen',
      expertise: 'Cybersecurity',
      company: 'Stanford University',
      rating: 4.9,
      reviews: 31,
      hourlyRate: 200,
      availableFor: ['Curriculum Review', 'Research Collaboration'],
      verified: true
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      expertise: 'Digital Marketing',
      company: 'Meta',
      rating: 4.7,
      reviews: 18,
      hourlyRate: 120,
      availableFor: ['Workshops', 'Consulting', 'Training'],
      verified: true
    },
    {
      id: 4,
      name: 'Prof. David Kim',
      expertise: 'Business Strategy',
      company: 'McKinsey & Company',
      rating: 4.9,
      reviews: 42,
      hourlyRate: 250,
      availableFor: ['Consulting', 'Mentoring', 'Guest Lectures'],
      verified: true
    },
    {
      id: 5,
      name: 'Dr. Lisa Wang',
      expertise: 'Healthcare',
      company: 'Johns Hopkins Hospital',
      rating: 4.8,
      reviews: 29,
      hourlyRate: 180,
      availableFor: ['Research Collaboration', 'Workshops', 'Consulting'],
      verified: true
    },
    {
      id: 6,
      name: 'Prof. James Wilson',
      expertise: 'Sustainability',
      company: 'MIT',
      rating: 4.6,
      reviews: 15,
      hourlyRate: 160,
      availableFor: ['Research Collaboration', 'Workshops', 'Industry Projects'],
      verified: true
    }
  ]);

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
      'Technology & Innovation': ['Data Science & AI', 'Cybersecurity', 'Software Development', 'Innovation & Design'],
      'Business & Marketing': ['Digital Marketing', 'Business Strategy', 'Finance', 'Consulting'],
      'Academic & Professional': ['Education', 'Research Collaboration', 'Workshops', 'Guest Lectures', 'Mentoring', 'Curriculum Review', 'Industry Projects', 'Question Paper Setting', 'Question Paper Evaluation'],
      'Training & Development': ['Training & Development', 'Public Speaking', 'Leadership Development'],
      'Specialized Fields': ['Healthcare', 'Engineering', 'Sustainability']
    };
    return categoryMap[category] || [];
  };

  const filteredExperts = experts.filter(expert => {
    const matchesSearch = expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expert.expertise.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = true;
    if (selectedCategory && selectedCategory !== 'All Categories') {
      const categoryServices = getServicesForCategory(selectedCategory);
      matchesCategory = categoryServices.some(service => 
        expert.expertise.includes(service) || 
        expert.availableFor.some(available => available.includes(service))
      );
    }
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Expert Directory</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Experts</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, expertise, or company..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Users className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
    </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Experts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperts.map(expert => (
            <div key={expert.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{expert.name}</h4>
                  <p className="text-sm text-gray-600">{expert.expertise}</p>
                  <p className="text-xs text-gray-500">{expert.company}</p>
                </div>
                {expert.verified && (
                  <div className="bg-blue-100 p-1 rounded-full">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                )}
              </div>

              <div className="flex items-center mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.floor(expert.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">{expert.rating} ({expert.reviews})</span>
              </div>

              <div className="mb-3">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">${expert.hourlyRate}</span>/hour
                </p>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-600 mb-2">Available for:</p>
                <div className="flex flex-wrap gap-1">
                  {expert.availableFor.map(service => (
                    <span key={service} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                  Contact
                </button>
                <button className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                  Request Rating
                </button>
              </div>
            </div>
          ))}
        </div>
    </div>
  </div>
);
};

// Ratings Tab Component
const RatingsTab = () => {
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
