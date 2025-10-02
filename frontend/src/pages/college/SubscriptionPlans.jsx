import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Star, FileText, Users, Headphones, BarChart3, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../utils/api';
import Toast from '../../components/common/Toast';

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const [availablePlans, setAvailablePlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [subscribingPlanId, setSubscribingPlanId] = useState(null);
  const [mySubscription, setMySubscription] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [subsLoading, setSubsLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (type, message) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  useEffect(() => {
    loadPlans();
    loadMySubscription();
  }, []);

  // Set default selected plan when plans are loaded
  useEffect(() => {
    if (availablePlans.length > 0 && !selectedPlanId) {
      // Set the second plan (index 1) as default selected, or first plan if only one exists
      const defaultPlanIndex = availablePlans.length > 1 ? 1 : 0;
      setSelectedPlanId(availablePlans[defaultPlanIndex].id);
    }
  }, [availablePlans, selectedPlanId]);

  const loadPlans = async () => {
    try {
      setLoadingPlans(true);
      const plans = await apiService.listActivePlans('COLLEGE');
      setAvailablePlans(plans || []);
    } catch (e) {
      console.error('Failed to load plans', e);
    } finally {
      setLoadingPlans(false);
    }
  };

  const loadMySubscription = async () => {
    try {
      setSubsLoading(true);
      const data = await apiService.getMySubscription();
      setMySubscription(data);
    } catch (e) {
      console.error('Failed to load subscription', e);
    } finally {
      setSubsLoading(false);
    }
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
        await loadMySubscription();
        setTimeout(() => {
          navigate('/dashboard/college?tab=overview');
        }, 1500);
        return;
      }
      
      // For paid plans, proceed with Razorpay
      const { order, keyId } = response;
      if (!order || !keyId) throw new Error('Failed to create payment order');

      // Load Razorpay script if not present
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          openRazorpayCheckout(order, keyId, planId);
        };
        document.body.appendChild(script);
      } else {
        openRazorpayCheckout(order, keyId, planId);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      showToast('error', 'Failed to start subscription process. Please try again.');
    } finally {
      setSubscribingPlanId(null);
    }
  };

  const openRazorpayCheckout = (order, keyId, planId) => {
    const options = {
      key: keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'Expert College Connect',
      description: 'Subscription Payment',
      order_id: order.id,
      handler: async (response) => {
        try {
          console.log('Payment successful!', response);
          showToast('success', 'Payment successful! Activating your plan...');
          
          // Confirm payment with backend
          const confirmationResult = await apiService.confirmRazorpayPayment(planId, response);
          
          if (confirmationResult.success) {
            console.log('Payment confirmed successfully:', confirmationResult);
            // Reload subscription data
            await loadMySubscription();
            showToast('success', 'Payment successful! Your plan has been activated. Redirecting to dashboard...');
            setTimeout(() => {
              navigate('/dashboard/college?tab=overview');
            }, 1500);
          } else {
            console.error('Payment confirmation failed:', confirmationResult.error);
            showToast('error', `Payment successful but activation failed: ${confirmationResult.error}`);
            setTimeout(() => {
              navigate('/dashboard/college?tab=overview');
            }, 2000);
          }
        } catch (error) {
          console.error('Error after payment:', error);
          showToast('error', 'Payment successful but there was an error activating your plan. Please contact support.');
          setTimeout(() => {
            navigate('/dashboard/college?tab=overview');
          }, 2000);
        }
      },
      prefill: {
        name: 'College User',
        email: 'college@example.com',
      },
      theme: {
        color: '#2563eb',
      },
      modal: {
        ondismiss: () => {
          console.log('Payment modal dismissed');
          setSubscribingPlanId(null);
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const getCurrentPlanId = () => {
    return mySubscription?.plan?.id;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        
        {/* Header */}
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/dashboard/college?tab=overview')}
                className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>

          {/* Hero Content */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Choose Your
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Perfect Plan</span>
              </h1>
              <p className="text-base text-white/80 mb-4 max-w-2xl mx-auto">
                Unlock the full potential of our platform with flexible plans designed for colleges of all sizes
              </p>
              
            </motion.div>
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <div className="relative -mt-12 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Plans Grid */}
          {loadingPlans ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600 text-sm">Loading plans...</p>
            </div>
          ) : availablePlans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 text-sm">No plans available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {availablePlans.map((plan, index) => {
                const isSelected = selectedPlanId === plan.id;
                const isFree = plan.priceCents === 0;
                const isCurrentPlan = getCurrentPlanId() === plan.id;
                
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative group transition-all duration-300 ${
                      isSelected ? 'lg:scale-110' : 'lg:scale-100'
                    }`}
                  >

                    {/* Current Plan Badge */}
                    {isCurrentPlan && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center space-x-2 shadow-lg">
                          <Check className="w-4 h-4" />
                          <span>Current Plan</span>
                        </div>
                      </div>
                    )}

                    {/* Plan Card */}
                    <div className={`relative bg-white rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer select-none ${
                      isSelected ? 'border-2 border-blue-500 shadow-2xl' : 'border border-gray-200 shadow-lg'
                    } overflow-hidden`}
                    onClick={() => setSelectedPlanId(plan.id)}>
                      {/* Plan Header */}
                      <div className={`p-4 ${isSelected ? 'bg-gradient-to-br from-blue-50 to-cyan-50' : isCurrentPlan ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-gradient-to-br from-gray-50 to-slate-50'}`}>
                        <div className="text-center">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                          <div className="mb-2">
                            <div className="flex items-baseline justify-center">
                              <span className="text-2xl font-bold text-gray-900">
                                {isFree ? 'Free' : `₹${(plan.priceCents/100).toFixed(0)}`}
                              </span>
                              {!isFree && (
                                <span className="text-gray-600 ml-1 text-xs">/{plan.billingPeriod.toLowerCase()}</span>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 uppercase tracking-wider font-medium">
                            {plan.billingPeriod}
                          </p>
                        </div>
                      </div>

                      {/* Plan Features */}
                      <div className="p-4">
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-4 h-4 text-gray-600" />
                              <span className="text-gray-700 font-medium text-sm">Requirements</span>
                            </div>
                            <span className="text-gray-900 font-semibold text-sm">
                              {plan.maxRequirements ?? 'Unlimited'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center space-x-3">
                              <Users className="w-4 h-4 text-gray-600" />
                              <span className="text-gray-700 font-medium text-sm">Expert Contacts</span>
                            </div>
                            <span className="text-gray-900 font-semibold text-sm">
                              {plan.maxExpertContacts ?? 'Unlimited'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center space-x-3">
                              <Headphones className="w-4 h-4 text-gray-600" />
                              <span className="text-gray-700 font-medium text-sm">Support</span>
                            </div>
                            <span className="text-gray-900 font-semibold text-sm">24/7</span>
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center space-x-3">
                              <BarChart3 className="w-4 h-4 text-gray-600" />
                              <span className="text-gray-700 font-medium text-sm">Analytics</span>
                            </div>
                            <span className="text-gray-900 font-semibold text-sm">Advanced</span>
                          </div>
                        </div>

                        {/* Subscribe Button */}
                        <button
                          onClick={() => subscribeToPlan(plan.id)}
                          disabled={subscribingPlanId === plan.id || isCurrentPlan}
                          className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 group ${
                            isCurrentPlan
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : isSelected
                              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-lg'
                              : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-sm hover:shadow-md'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {subscribingPlanId === plan.id ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              <span>Processing...</span>
                            </div>
                          ) : isCurrentPlan ? (
                            <div className="flex items-center justify-center gap-2">
                              <Check className="w-4 h-4" />
                              <span>Current Plan</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <span>{isFree ? 'Get Started Free' : 'Subscribe Now'}</span>
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        toast={toast}
        hideToast={hideToast}
      />
    </div>
  );
};

export default SubscriptionPlans;
