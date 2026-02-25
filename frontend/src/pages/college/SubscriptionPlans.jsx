import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Star, FileText, Users, Headphones, BarChart3, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../utils/api';
import Toast from '../../components/common/Toast';

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [availablePlans, setAvailablePlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [subscribingPlanId, setSubscribingPlanId] = useState(null);
  const [mySubscription, setMySubscription] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [subsLoading, setSubsLoading] = useState(false);
  const [selectedBillingPeriod, setSelectedBillingPeriod] = useState('SEMIANNUAL');

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

  // Calculate dynamic pricing based on billing period
  const calculatePrice = (plan, billingPeriod) => {
    if (plan.priceCents === 0) return 0; // Free plans

    const basePrice = plan.priceCents; // Monthly price from database
    const multipliers = {
      'MONTHLY': 1,
      'QUARTERLY': 3,
      'SEMIANNUAL': 6,
      'YEARLY': 12
    };

    const fullPrice = basePrice * multipliers[billingPeriod];
    const discount = billingPeriods.find(p => p.value === billingPeriod)?.discount || 0;

    return Math.round(fullPrice * (1 - discount / 100));
  };

  // Get billing period options
  const billingPeriods = [
    { value: 'MONTHLY', label: 'Monthly', discount: 0 },
    { value: 'QUARTERLY', label: '3 Months', discount: 13 },
    { value: 'SEMIANNUAL', label: '6 Months', discount: 23 },
    { value: 'YEARLY', label: 'Yearly', discount: 33 }
  ];

  // Calculate duration days based on billing period
  const getDurationDays = (billingPeriod) => {
    const durationMap = {
      'MONTHLY': 30,
      'QUARTERLY': 90,
      'SEMIANNUAL': 180,
      'YEARLY': 365
    };
    return durationMap[billingPeriod];
  };

  useEffect(() => {
    if (user) {
      loadPlans();
      loadMySubscription();
    }
  }, [user]);

  // Set default selected plan when plans are loaded
  useEffect(() => {
    if (availablePlans.length > 0 && !selectedPlanId) {
      // Find the first PAID plan to select by default, or just pick the first plan available
      const firstPaidPlan = availablePlans.find(p => p.planType === 'PAID');
      setSelectedPlanId(firstPaidPlan ? firstPaidPlan.id : availablePlans[0].id);
    }
  }, [availablePlans, selectedPlanId]);

  const loadPlans = async () => {
    try {
      setLoadingPlans(true);
      // Determine audience based on user role
      const audience = user?.role === 'EXPERT' ? 'EXPERT' : 'COLLEGE';
      // Use filtered plans that exclude free trial for users who already have subscription history
      const plans = await apiService.listPlansForUser(audience);
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
      // Create order on backend with selected billing period
      const response = await apiService.createRazorpayOrder(planId, selectedBillingPeriod);

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

      // Check for error response from backend
      if (response.error) {
        console.error('Backend error creating order:', response);
        throw new Error(response.details || response.error || 'Failed to create payment order');
      }

      // For paid plans, proceed with Cashfree
      const { paymentSessionId, order, cashfreeMode, paymentLink } = response;

      console.log('📦 Backend response received:', {
        hasPaymentLink: !!paymentLink,
        hasPaymentSessionId: !!paymentSessionId,
        paymentLinkPreview: paymentLink ? paymentLink.substring(0, 100) + '...' : 'N/A',
        paymentSessionIdPreview: paymentSessionId ? paymentSessionId.substring(0, 50) + '...' : 'N/A',
        cashfreeMode,
        orderId: order?.id,
      });

      // Validate we have required data
      if (!paymentSessionId && !paymentLink) {
        console.error('Invalid response from backend:', response);
        throw new Error('Payment order created but no payment session ID received. Please try again.');
      }

      if (!order || !order.id) {
        console.error('Invalid order data:', response);
        throw new Error('Payment order created but order information is missing. Please try again.');
      }

      // ✅ Use Cashfree payment link if it's a hosted link (/pg/view/)
      // Note: /pg/payments/ URLs are SDK-only and cannot be used for direct redirect
      if (paymentLink && paymentLink.includes('/pg/view/')) {
        console.log('✅ Using Cashfree payment_link (hosted link):', paymentLink);
        window.location.replace(paymentLink);
        return;
      }

      // If paymentLink is /pg/payments/, we must use SDK (it's SDK-only)
      if (paymentLink && paymentLink.includes('/pg/payments/')) {
        console.log('⚠️ Payment link is SDK-only, will use SDK instead');
      }

      // Otherwise, use Cashfree JS SDK to open checkout
      if (!paymentSessionId) {
        throw new Error('Payment session ID is required to open checkout');
      }

      // Log the original session ID for debugging
      console.log('📋 Payment Session ID received:', {
        original: paymentSessionId,
        length: paymentSessionId?.length,
        startsWithSession: paymentSessionId?.startsWith('session_'),
        first50: paymentSessionId?.substring(0, 50),
        fullSessionId: paymentSessionId, // Log full for debugging
      });

      // If we have a paymentLink with /pg/payments/, extract session ID from it as fallback
      let sessionIdToUse = paymentSessionId;
      if (paymentLink && paymentLink.includes('/pg/payments/') && !sessionIdToUse) {
        // Extract session ID from paymentLink: https://sandbox.cashfree.com/pg/payments/session_xxx
        const match = paymentLink.match(/\/payments\/(session_[^/?]+)/);
        if (match && match[1]) {
          sessionIdToUse = match[1];
          console.log('📋 Extracted session ID from paymentLink:', sessionIdToUse.substring(0, 50) + '...');
        }
      }

      // Clean paymentSessionId ONLY if it has the "paymentpayment" suffix issue
      // Don't clean valid session IDs
      let cleanSessionId = sessionIdToUse;
      if (sessionIdToUse && (sessionIdToUse.endsWith('paymentpayment') || sessionIdToUse.endsWith('paymentpaymentpayment'))) {
        console.warn('⚠️ Detected duplicate "payment" suffix, cleaning...');
        cleanSessionId = sessionIdToUse.replace(/(payment)+$/i, '');
        console.log('Cleaned session ID:', {
          original: sessionIdToUse.substring(0, 50) + '...',
          cleaned: cleanSessionId.substring(0, 50) + '...',
        });
      }

      // Validate session ID format (should start with "session_" or "session_f-")
      if (!cleanSessionId.startsWith('session_')) {
        console.error('❌ Invalid payment session ID format:', {
          received: cleanSessionId,
          length: cleanSessionId.length,
          firstChars: cleanSessionId.substring(0, 20),
        });
        throw new Error('Invalid payment session ID received. Please try again.');
      }

      // Note: Session IDs can start with "session_" or "session_f-" (both are valid)
      console.log('✅ Session ID format validated:', {
        startsWithSession: cleanSessionId.startsWith('session_'),
        startsWithSessionF: cleanSessionId.startsWith('session_f-'),
        length: cleanSessionId.length,
      });

      console.log('✅ Opening Cashfree checkout using JS SDK:', {
        paymentSessionId: cleanSessionId.substring(0, 50) + '...',
        fullLength: cleanSessionId.length,
        orderId: order.id,
        cashfreeMode,
      });

      // Load Cashfree SDK v3 (matching working example pattern)
      const loadCashfreeSDK = () => {
        return new Promise((resolve, reject) => {
          // Check if SDK is already loaded
          if (window.Cashfree) {
            resolve(window.Cashfree);
            return;
          }

          // Load Cashfree SDK
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

      // Load SDK
      const CashfreeSDK = await loadCashfreeSDK();

      console.log('Initializing Cashfree v3 with mode:', cashfreeMode);

      // Initialize Cashfree v3 (matching working example - function call, not class)
      const cashfree = CashfreeSDK({
        mode: cashfreeMode === 'production' ? 'production' : 'sandbox',
      });

      console.log('Cashfree instance created:', {
        hasCheckout: typeof cashfree.checkout === 'function',
        instanceKeys: Object.keys(cashfree),
      });

      // Verify checkout method exists
      if (typeof cashfree.checkout !== 'function') {
        console.error('Cashfree instance:', cashfree);
        console.error('Available methods:', Object.keys(cashfree));
        throw new Error('Cashfree checkout method is not available. Please ensure you are using SDK v3.');
      }

      // Open checkout using SDK v3
      console.log('Using checkout() method from SDK v3 with session ID:', {
        sessionId: cleanSessionId.substring(0, 30) + '...',
        fullLength: cleanSessionId.length,
        isValidFormat: cleanSessionId.startsWith('session_'),
        fullSessionId: cleanSessionId, // Log full ID for debugging
      });

      // Validate session ID format before calling SDK
      if (!cleanSessionId || cleanSessionId.length < 20) {
        throw new Error(`Invalid payment session ID: too short (${cleanSessionId?.length || 0} chars)`);
      }

      if (!cleanSessionId.startsWith('session_')) {
        throw new Error(`Invalid payment session ID format: does not start with 'session_'`);
      }

      // Prepare checkout options (matching working example pattern)
      const finalSessionId = cleanSessionId.trim();

      // Validate session ID
      if (!finalSessionId || !finalSessionId.startsWith('session_') || finalSessionId.length < 30) {
        console.error('❌ Session ID validation failed:', {
          sessionId: finalSessionId,
          length: finalSessionId?.length,
        });
        throw new Error(`Invalid payment session ID. Please try subscribing again.`);
      }

      // Verify the order exists and session ID is valid before checkout
      let verifiedSessionId = finalSessionId;
      try {
        console.log('🔍 Verifying order and session ID before checkout...');
        const verifyResponse = await fetch(`${apiService.baseURL}/subscriptions/verify-order?orderId=${order.id}`, {
          headers: await apiService.getAuthHeaders(),
        });
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          console.log('✅ Order verified:', verifyData);

          // Check if the session ID from verification matches what we have
          if (verifyData.payment_session_id && verifyData.payment_session_id !== finalSessionId) {
            console.warn('⚠️ Session ID mismatch!', {
              fromResponse: finalSessionId.substring(0, 30) + '...',
              fromVerification: verifyData.payment_session_id.substring(0, 30) + '...',
            });
            // Use the verified session ID instead
            verifiedSessionId = verifyData.payment_session_id;
            console.log('🔄 Using session ID from order verification');
          }

          // Check order status
          if (verifyData.order_status && !['ACTIVE', 'CREATED', 'PAYMENT_PENDING'].includes(verifyData.order_status)) {
            console.warn('⚠️ Order status might not be ready for payment:', verifyData.order_status);
          }
        } else {
          const errorData = await verifyResponse.json().catch(() => ({}));
          console.warn('⚠️ Order verification failed:', errorData);
        }
      } catch (verifyErr) {
        console.warn('⚠️ Order verification error (continuing anyway):', verifyErr);
      }

      const checkoutOptions = {
        paymentSessionId: verifiedSessionId, // Use verified session ID if available
        redirectTarget: '_self', // Use '_self' for full page redirect (or '_modal' for modal)
      };

      console.log('Calling cashfree.checkout() with options:', {
        paymentSessionId: checkoutOptions.paymentSessionId.substring(0, 30) + '...',
        paymentSessionIdFull: checkoutOptions.paymentSessionId, // Log full for debugging
        redirectTarget: checkoutOptions.redirectTarget,
        orderId: order.id,
      });

      // Call checkout (matching working example pattern)
      // Note: If this fails with 400, the session ID might be invalid or expired
      cashfree.checkout(checkoutOptions)
        .then(async (result) => {
          console.log('Cashfree checkout result:', result);

          // Handle errors (matching working example pattern)
          if (result.error) {
            console.error('Payment error:', result.error);
            showToast('error', result.error.message || 'Payment failed. Please try again.');
            setSubscribingPlanId(null);
            return;
          }

          // Payment successful (matching working example pattern)
          if (result.paymentDetails) {
            try {
              console.log('Payment completed via SDK:', result.paymentDetails);
              const payload = {
                provider: 'CASHFREE',
                orderId: order.id,
                paymentSessionId: finalSessionId,
                paymentDetails: result.paymentDetails,
                result,
              };
              const confirmationResult = await apiService.confirmRazorpayPayment(planId, payload, selectedBillingPeriod);

              if (confirmationResult?.success) {
                await loadMySubscription();
                showToast('success', 'Payment successful! Your plan has been activated.');
                setTimeout(() => {
                  navigate('/dashboard/college?tab=overview');
                }, 1500);
              } else {
                showToast('error', confirmationResult?.error || 'Payment successful but activation failed');
              }
            } catch (err) {
              console.error('Error confirming payment:', err);
              showToast('error', 'Payment completed but there was an error. Please contact support.');
            }
          } else {
            // Payment might have been redirected - verify on backend
            console.log('Payment redirected, verifying...');
            // The redirect will handle verification via callback
          }
        })
        .catch((err) => {
          // User cancelled, payment failed, or session ID error
          console.error('❌ Cashfree checkout error:', err);
          console.error('Session ID used:', {
            sessionId: cleanSessionId,
            length: cleanSessionId.length,
            firstChars: cleanSessionId.substring(0, 30),
          });

          // If it's a session ID error, try with the original (uncleaned) ID
          if (err?.message?.includes('payment_session_id') && paymentSessionId !== cleanSessionId) {
            console.warn('⚠️ Retrying with original (uncleaned) session ID');
            cashfree.checkout({
              paymentSessionId: paymentSessionId, // Try original
              redirectTarget: '_self',
            })
              .then(async (result) => {
                // Payment completed with original ID
                try {
                  console.log('Payment completed via SDK (with original ID):', result);
                  const payload = {
                    provider: 'CASHFREE',
                    orderId: order.id,
                    paymentSessionId: paymentSessionId,
                    result,
                  };
                  const confirmationResult = await apiService.confirmRazorpayPayment(planId, payload, selectedBillingPeriod);

                  if (confirmationResult?.success) {
                    await loadMySubscription();
                    showToast('success', 'Payment successful! Your plan has been activated.');
                    setTimeout(() => {
                      navigate('/dashboard/college?tab=overview');
                    }, 1500);
                  } else {
                    showToast('error', confirmationResult?.error || 'Payment successful but activation failed');
                  }
                } catch (confirmErr) {
                  console.error('Error confirming payment:', confirmErr);
                  showToast('error', 'Payment completed but there was an error. Please contact support.');
                }
              })
              .catch((retryErr) => {
                console.error('❌ Retry also failed:', retryErr);
                showToast('error', `Payment error: ${retryErr?.message || 'Invalid session ID. Please try again.'}`);
                setSubscribingPlanId(null);
              });
            return;
          }

          // Other errors (user cancelled, etc.)
          if (err && err.message && !err.message.includes('User closed') && !err.message.includes('payment_session_id')) {
            showToast('error', `Payment error: ${err.message || 'Please try again.'}`);
          } else if (err?.message?.includes('payment_session_id')) {
            showToast('error', 'Invalid payment session. Please try subscribing again.');
          }
          setSubscribingPlanId(null);
        });
    } catch (error) {
      console.error('Subscription error:', error);
      const errorMessage = error.message || 'Failed to start subscription process';
      showToast('error', errorMessage.includes('endpoint or method is not valid')
        ? 'Payment gateway configuration error. Please contact support.'
        : errorMessage);
    } finally {
      setSubscribingPlanId(null);
    }
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
                onClick={() => {
                  const dashboardRoute = user?.role === 'EXPERT' ? '/dashboard/expert?tab=overview' : '/dashboard/college?tab=overview';
                  navigate(dashboardRoute);
                }}
                className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>

          {/* Hero Content */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-xl md:text-2xl font-bold text-white mb-2">
                Choose Your
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Perfect Plan</span>
              </h1>
              <p className="text-sm text-white/80 mb-2 max-w-2xl mx-auto">
                {user?.role === 'EXPERT'
                  ? 'Unlock the full potential of our platform with flexible plans designed for experts'
                  : 'Unlock the full potential of our platform with flexible plans designed for colleges of all sizes'
                }
              </p>

            </motion.div>
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <div className="relative -mt-8 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

          {/* Billing Period Selector */}
          <div className="text-center mb-6">
            <h3 className="text-base font-semibold text-white mb-3">Choose Your Billing Period</h3>
            <div className="flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1">
                {billingPeriods.map((period) => (
                  <button
                    key={period.value}
                    onClick={() => setSelectedBillingPeriod(period.value)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${selectedBillingPeriod === period.value
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-white hover:bg-white/10'
                      }`}
                  >
                    {period.label}
                    {period.discount > 0 && (
                      <span className="ml-1 text-xs text-green-400">-{period.discount}%</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Plans Grid */}
          {loadingPlans ? (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Loading plans...</p>
            </div>
          ) : availablePlans.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-600 text-sm">No plans available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {availablePlans.map((plan, index) => {
                const isSelected = selectedPlanId === plan.id;
                const isFree = plan.priceCents === 0;
                const isCurrentPlan = getCurrentPlanId() === plan.id;
                const isPopular = false; // Disable popular badge

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative group transition-all duration-300 ${isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                      }`}
                  >
                    {/* Plan Card */}
                    <div className={`relative bg-white border transition-all duration-300 cursor-pointer select-none h-full flex flex-col ${isSelected
                      ? 'border-blue-500 shadow-lg ring-1 ring-blue-500/20'
                      : 'border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md'
                      } rounded-xl overflow-hidden`}
                      onClick={() => setSelectedPlanId(plan.id)}>

                      {/* Popular Badge */}
                      {isPopular && (
                        <div className="absolute top-4 right-4 z-10">
                          <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                            <Star className="w-3 h-3 fill-current" />
                            <span>Popular</span>
                          </div>
                        </div>
                      )}

                      {/* Current Plan Badge */}
                      {isCurrentPlan && (
                        <div className="absolute top-4 right-4 z-10">
                          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                            <Check className="w-3 h-3" />
                            <span>Current</span>
                          </div>
                        </div>
                      )}

                      <div className="p-4 flex flex-col flex-1">
                        {/* Plan Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-600'
                                }`}>
                                {isFree ? (
                                  <Star className="w-4 h-4" />
                                ) : (
                                  <BarChart3 className="w-4 h-4" />
                                )}
                              </div>
                              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                            </div>

                            <div className="flex items-baseline space-x-2 mb-1">
                              <span className={`text-3xl font-bold ${isSelected ? 'text-blue-600' : 'text-gray-900'
                                }`}>
                                {isFree ? 'Free' : `₹${(calculatePrice(plan, selectedBillingPeriod) / 100).toFixed(0)}`}
                              </span>
                            </div>

                            {/* Discount indicator */}
                            {!isFree && selectedBillingPeriod !== 'MONTHLY' && (
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm text-gray-500 line-through">
                                  ₹{(plan.priceCents * (selectedBillingPeriod === 'QUARTERLY' ? 3 : selectedBillingPeriod === 'SEMIANNUAL' ? 6 : 12) / 100).toFixed(0)}
                                </span>
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                  Save {billingPeriods.find(p => p.value === selectedBillingPeriod)?.discount}%
                                </span>
                              </div>
                            )}

                            <p className="text-sm text-gray-500">
                              {isFree ? 'Free Trial • 30 days' : `${selectedBillingPeriod} • ${getDurationDays(selectedBillingPeriod)} days`}
                            </p>
                          </div>
                        </div>

                        {/* Plan Features */}
                        <div className="mb-4 flex-1">
                          <h4 className="text-gray-700 text-sm mb-3 font-medium">
                            The perfect way to start and get used to our tools
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <Check className="w-4 h-4 text-green-500" />
                              <span className="text-gray-900 font-semibold text-base">
                                {user?.role === 'EXPERT' ? 'Unlimited Applications' : 'Unlimited Requirements'}
                              </span>
                            </div>

                            {user?.role !== 'EXPERT' && (
                              <div className="flex items-center space-x-3">
                                <Check className="w-4 h-4 text-green-500" />
                                <span className="text-gray-900 font-semibold text-base">
                                  Unlimited Expert Contacts
                                </span>
                              </div>
                            )}

                            <div className="flex items-center space-x-3">
                              <Check className="w-4 h-4 text-green-500" />
                              <span className="text-gray-900 font-semibold text-base">
                                24/7 Support
                              </span>
                            </div>

                            <div className="flex items-center space-x-3">
                              <Check className="w-4 h-4 text-green-500" />
                              <span className="text-gray-900 font-semibold text-base">
                                Advanced Analytics
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Subscribe Button */}
                        <button
                          onClick={() => subscribeToPlan(plan.id)}
                          disabled={subscribingPlanId === plan.id || isCurrentPlan}
                          className={`w-full py-3 px-4 rounded-[3px] font-medium text-sm transition-all duration-200 group ${isCurrentPlan
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : isSelected
                              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                              : 'bg-gray-900 hover:bg-gray-800 text-white shadow-sm hover:shadow-md'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            {subscribingPlanId === plan.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                <span>Processing...</span>
                              </>
                            ) : isCurrentPlan ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Current Plan</span>
                              </>
                            ) : (
                              <>
                                <span>{isFree ? 'Get Started Free' : 'Subscribe Now'}</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                              </>
                            )}
                          </div>
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
