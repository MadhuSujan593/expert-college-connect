import { useEffect } from 'react';
import apiService from '../../utils/api';

/**
 * Custom hook to handle Cashfree payment callbacks after redirect
 * 
 * @param {Function} loadMySubscription - Function to reload the user's subscription
 * @param {Function} showToast - Function to display toast notifications
 */
export const usePaymentCallback = (loadMySubscription, showToast) => {
  useEffect(() => {
    const handlePaymentCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment_status');
      const orderId = urlParams.get('order_id');

      if (paymentStatus && orderId) {
        console.log('💳 Payment callback detected:', { paymentStatus, orderId });

        try {
          // Verify order status with backend
          const verifyResponse = await fetch(`${apiService.baseURL}/subscriptions/verify-order?orderId=${orderId}`, {
            headers: await apiService.getAuthHeaders(),
          });

          if (!verifyResponse.ok) {
            throw new Error('Failed to verify order');
          }

          const orderData = await verifyResponse.json();
          console.log('📋 Order verification result:', orderData);

          // Check if payment was successful
          if (orderData.order_status && ['PAID', 'SUCCESS'].includes(orderData.order_status.toUpperCase())) {
            // Get planId and billingPeriod from order data
            const planId = orderData.planId;
            const billingPeriod = orderData.billingPeriod || 'MONTHLY';

            if (!planId) {
              throw new Error('Plan ID not found in order');
            }

            // Confirm payment
            const payload = {
              provider: 'CASHFREE',
              orderId: orderId,
              order_id: orderId,
            };

            const confirmationResult = await apiService.confirmRazorpayPayment(planId, payload, billingPeriod);

            if (confirmationResult?.success) {
              // Reload subscription
              if (typeof loadMySubscription === 'function') {
                await loadMySubscription();
              }

              // Show success message
              if (typeof showToast === 'function') {
                showToast('success', 'Payment successful! Your plan has been activated.');
              }

              // Clean up URL parameters
              const url = new URL(window.location);
              url.searchParams.delete('payment_status');
              url.searchParams.delete('order_id');
              window.history.replaceState({}, '', url);
            } else {
              throw new Error(confirmationResult?.error || 'Payment confirmation failed');
            }
          } else {
            // Payment not successful or still pending
            console.warn('⚠️ Payment status:', orderData.order_status);
            if (typeof showToast === 'function') {
              showToast('warning', `Payment status: ${orderData.order_status}. Please contact support if payment was successful.`);
            }

            // Clean up URL parameters
            const url = new URL(window.location);
            url.searchParams.delete('payment_status');
            url.searchParams.delete('order_id');
            window.history.replaceState({}, '', url);
          }
        } catch (error) {
          console.error('❌ Payment callback error:', error);
          if (typeof showToast === 'function') {
            showToast('error', `Payment verification failed: ${error.message || 'Unknown error'}. Please contact support.`);
          }

          // Clean up URL parameters even on error
          const url = new URL(window.location);
          url.searchParams.delete('payment_status');
          url.searchParams.delete('order_id');
          window.history.replaceState({}, '', url);
        }
      }
    };

    handlePaymentCallback();
  }, [loadMySubscription, showToast]);
};
