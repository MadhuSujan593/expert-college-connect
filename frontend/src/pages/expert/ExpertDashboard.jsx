import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import Toast from '../../components/common/Toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { usePaymentCallback } from '../../hooks/usePaymentCallback';

// Sub-components
import ExpertOverview from './components/ExpertOverview';
import ExpertProfileTab from './components/ExpertProfileTab';
import ExpertOpportunitiesTab from './components/ExpertOpportunitiesTab';
import ExpertApplicationsTab from './components/ExpertApplicationsTab';
import ExpertRatingsTab from './components/ExpertRatingsTab';
import ExpertRatingRequestsList from '../../components/expert/ExpertRatingRequestsList'; // Review this import path if needed

// Modals
import EmailVerificationModal from '../../components/verification/EmailVerificationModal';
import PhoneVerificationModal from '../../components/verification/PhoneVerificationModal';
// import PlanLimitationModal from '../../components/common/PlanLimitationModal'; // If needed for experts

const ExpertDashboard = () => {
  const { user, logout, login } = useAuth(); // login used for refreshing user data
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Global State
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [applicationStats, setApplicationStats] = useState({});
  const [workExperiences, setWorkExperiences] = useState([]);
  const [ratings, setRatings] = useState([]); // Received reviews
  const [ratingRequests, setRatingRequests] = useState([]); // Requests to rate students/colleges?
  const [subscription, setSubscription] = useState(null); // [NEW] Subscription state
  const [toast, setToast] = useState(null);

  // Verification Modals State
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  // const [showPlanLimitation, setShowPlanLimitation] = useState(false); // If experts have plans

  // Active Tab Logic
  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab) => setSearchParams({ tab });

  const showToast = (type, message) => setToast({ type, message });

  // --- Data Fetching ---

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        profileData,
        statsData,
        experiencesData,
        ratingsData,
        requestsData,
        subscriptionData // [NEW] Fetch subscription
      ] = await Promise.all([
        api.getExpertProfile(),
        api.getExpertDashboardStats(),
        api.getWorkExperiences(),
        api.getExpertRatings(),
        api.getExpertRatingRequests(),
        api.getCurrentSubscription()
      ]);

      setProfile(profileData);
      setStats(statsData?.stats || {});
      setApplicationStats(statsData?.applicationStats || {});
      setWorkExperiences(experiencesData);
      setRatings(ratingsData?.data || []);
      setRatingRequests(requestsData?.data || []);
      setSubscription(subscriptionData); // [NEW] Set subscription

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Handle auth errors gracefully
      if (error.message.includes('No valid token') || error.message.includes('Authentication expired')) {
        // Token is invalid/missing but user context exists
        // Force logout to clear state and redirect to login
        logout();
        return;
      }

      // Show error toast for other errors
      const errorMessage = error.message || "Failed to load dashboard data";
      // Avoid spamming toast on mount if it's just a network blip, or show it?
      // showToast('error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle payment callback from Cashfree redirect (subscription activation)
  usePaymentCallback(fetchDashboardData, showToast);

  // --- Handlers ---

  const handleProfileUpdate = async (updatedData) => {
    try {
      if (updatedData) {
        // If we have data to patch
        await api.updateExpertProfile(updatedData);
      }
      // Always refresh profile to get latest state (e.g. after upload)
      const newProfile = await api.getExpertProfile();
      setProfile(newProfile);
      // Also refresh user context if name/email/phone changed
      // login(newProfile.user); // This might be too heavy? 'login' usually sets token. 
      // Better to have a 'refreshUser' in AuthContext, but let's assume page refresh or minor desync is ok for now.
    } catch (error) {
      console.error("Profile update error", error);
      throw error; // Re-throw for child component to handle UI
    }
  };

  const handleVerifyEmail = async () => {
    try {
      await api.sendEmailVerificationOtp();
      setShowEmailVerification(true);
    } catch (error) {
      showToast('error', 'Failed to send verification email');
    }
  };

  const handleVerifyPhone = async () => {
    try {
      await api.sendPhoneVerificationOtp();
      setShowPhoneVerification(true);
    } catch (error) {
      showToast('error', 'Failed to send verification SMS');
    }
  };

  const canAccessFeatures = () => {
    // Relaxed check: Allow access if email is verified.
    // Phone verification is optional for viewing, but maybe required for specific actions later.
    return user?.isEmailVerified;
  };

  // Feature Access Check (Relaxed)
  const isVerified = user?.isEmailVerified; // && user?.isPhoneVerified; // Phone verif optional now

  // --- Render Content ---

  const renderContent = () => {
    if (loading && !profile) { // Only show full loader if no profile (initial load)
      return (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-200 border-t-indigo-600"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <ExpertOverview
            stats={stats}
            applicationStats={applicationStats}
            user={user}
            profile={profile}
            subscription={subscription} // [NEW] Pass subscription
            workExperiences={workExperiences} // Pass workExperiences
            onTabChange={setActiveTab}
          />
        );
      case 'profile':
        return (
          <ExpertProfileTab
            profile={profile}
            user={user}
            onProfileUpdate={handleProfileUpdate}
            showToast={showToast}
          />
        );
      case 'opportunities':
        return (
          <ExpertOpportunitiesTab
            user={user}
            canAccessFeatures={isVerified}
            onVerifyEmail={handleVerifyEmail}
            onVerifyPhone={handleVerifyPhone}
          />
        );
      case 'applications':
        return (
          <ExpertApplicationsTab
            user={user}
            canAccessFeatures={isVerified}
            onVerifyEmail={handleVerifyEmail}
            onVerifyPhone={handleVerifyPhone}
            ratingRequests={ratingRequests} // Pass requests here if needed for tracking logic
          // onRequestRating={...} // If tracking needs to trigger request
          />
        );
      case 'requests':
        // Dedicated Rating Requests Tab
        if (!isVerified) return <ExpertApplicationsTab user={user} canAccessFeatures={false} onVerifyEmail={handleVerifyEmail} onVerifyPhone={handleVerifyPhone} />;

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Rating Requests</h2>
              <span className="text-slate-500">{ratingRequests.length} pending</span>
            </div>
            <ExpertRatingRequestsList ratingRequests={ratingRequests} />
          </div>
        );
      case 'ratings':
        return (
          <ExpertRatingsTab
            ratings={ratings}
            loading={loading}
          />
        );

      default:
        return <ExpertOverview stats={stats} user={user} profile={profile} workExperiences={workExperiences} onTabChange={setActiveTab} />;
    }
  };

  return (
    <DashboardLayout
      user={user}
      logout={logout}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      logoUrl={profile?.profilePicture ? (profile.profilePicture.startsWith('http') ? profile.profilePicture : `${import.meta.env.VITE_BASE_URL}/${profile.profilePicture}`) : null}
    >
      <div className="animate-in fade-in duration-500">
        {renderContent()}
      </div>

      {/* Global Modals */}
      <EmailVerificationModal
        isOpen={showEmailVerification}
        onClose={() => setShowEmailVerification(false)}
        user={user}
        onSuccess={() => {
          setShowEmailVerification(false);
          showToast('success', 'Email verified successfully!');
          // Refresh user?
          window.location.reload(); // Hard reload to ensure auth state sync
        }}
      />

      <PhoneVerificationModal
        isOpen={showPhoneVerification}
        onClose={() => setShowPhoneVerification(false)}
        user={user}
        onSuccess={() => {
          setShowPhoneVerification(false);
          showToast('success', 'Phone verified successfully!');
          window.location.reload();
        }}
      />

      {toast && <Toast toast={{ ...toast, show: true }} hideToast={() => setToast(null)} />}
    </DashboardLayout>
  );
};

export default ExpertDashboard;
