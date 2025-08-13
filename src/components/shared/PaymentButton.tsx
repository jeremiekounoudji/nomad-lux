import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@heroui/react';
import { FedaCheckoutButton } from 'fedapay-reactjs';
import toast from 'react-hot-toast';
import { config } from '../../lib/config';
import { useFedaPayPayment } from '../../hooks/useFedaPayPayment';
import { useBookingManagement } from '../../hooks/useBookingManagement';
import { useTranslation } from '../../lib/stores/translationStore';

interface PaymentButtonProps {
  booking: {
    id: string;
    total_amount: number;
    properties?: {
      title?: string;
    };
  };
  onPaymentSuccess?: (booking: any) => void;
  onPaymentError?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  variant?: 'solid' | 'flat' | 'bordered' | 'light' | 'faded' | 'shadow' | 'ghost';
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  booking,
  onPaymentSuccess,
  onPaymentError,
  className = '',
  children,
  size = 'lg',
  disabled = false,
  variant = 'solid',
  color = 'primary'
}) => {
  const { t } = useTranslation(['booking', 'common']);
  const [isCreatingRecord, setIsCreatingRecord] = useState(false);
  const [paymentRecordCreated, setPaymentRecordCreated] = useState(false);
  const [shouldTriggerPayment, setShouldTriggerPayment] = useState(false);
  const fedaButtonRef = useRef<any>(null);
  
  const { createPaymentRecord, handlePaymentComplete, error, resetPayment } = useFedaPayPayment();
  const { loadGuestBookings } = useBookingManagement();

  console.log('🔧 [PaymentButton] Rendered', {
    bookingId: booking.id,
    amount: booking.total_amount,
    isCreatingRecord,
    paymentRecordCreated
  });

  // Handle the initial button click - create payment record first
  const handlePayNowClick = useCallback(async () => {
    if (isCreatingRecord || paymentRecordCreated || disabled) {
      return;
    }

    console.log('💰 [PaymentButton] Pay Now clicked', {
      bookingId: booking.id,
      amount: booking.total_amount
    });

    setIsCreatingRecord(true);
    resetPayment();

    try {
      const paymentData = await createPaymentRecord({
        booking_id: booking.id,
        amount: booking.total_amount,
        currency: 'XOF', // Default currency - could be made dynamic
        description: t('booking.payment.description', { title: booking.properties?.title ?? t('booking.labels.property') }),
      });

      if (paymentData) {
        console.log('✅ [PaymentButton] Payment record created, triggering FedaPay modal', {
          paymentIntentId: paymentData.payment_intent_id
        });
        
        setPaymentRecordCreated(true);
        setShouldTriggerPayment(true);
      } else {
        console.error('❌ [PaymentButton] Failed to create payment record');
        toast.error(t('booking.payment.createRecordFailed'));
        onPaymentError?.(t('booking.payment.createRecordFailed'));
      }
    } catch (err) {
      console.error('❌ [PaymentButton] Error creating payment record:', err);
      const errorMessage = err instanceof Error ? err.message : t('booking.payment.initFailed');
      toast.error(errorMessage);
      onPaymentError?.(errorMessage);
    } finally {
      setIsCreatingRecord(false);
    }
  }, [booking, createPaymentRecord, isCreatingRecord, paymentRecordCreated, disabled, onPaymentError, resetPayment]);

  // Handle FedaPay completion
  const handleFedaPayComplete = useCallback(async (response: any) => {
    console.log('🎯 [PaymentButton] FedaPay completed', response);
    
    try {
      await handlePaymentComplete(response);
      
      // Check for successful payment
      if (response.transaction?.status === 'approved' || response.transaction?.approved_at) {
        console.log('✅ [PaymentButton] Payment successful');
        toast.success(t('booking.messages.paymentSuccess'));
        // Refresh bookings to get updated booking status
        console.log('🔄 [PaymentButton] Refetching bookings after successful payment');
        try {
          await loadGuestBookings();
          console.log('✅ [PaymentButton] Bookings refetched successfully');
        } catch (refetchError) {
          console.error('❌ [PaymentButton] Failed to refetch bookings:', refetchError);
        }
        // Close FedaPay modal if it is still open
        try {
          if (fedaButtonRef.current && typeof (fedaButtonRef.current as any).close === 'function') {
            (fedaButtonRef.current as any).close();
            console.log('✅ [PaymentButton] FedaPay modal closed via ref');
          } else {
            const closeSelectorCandidates = ['.fedapay-modal .close', '.fp-close', '.fedapay-modal__close'];
            for (const selector of closeSelectorCandidates) {
              const closeBtn = document.querySelector(selector) as HTMLElement | null;
              if (closeBtn) {
                closeBtn.click();
                console.log(`✅ [PaymentButton] FedaPay modal closed via selector: ${selector}`);
                break;
              }
            }
          }
        } catch (closeErr) {
          console.warn('⚠️ [PaymentButton] Unable to programmatically close FedaPay modal:', closeErr);
        }
        onPaymentSuccess?.(booking);
      } else {
        // Handle failed/cancelled payments
        console.log('❌ [PaymentButton] Payment failed or cancelled', {
          status: response.transaction?.status,
          reason: response.reason,
          errorCode: response.transaction?.last_error_code
        });
        
        let errorMessage = t('booking.payment.notCompleted');
        
        if (response.reason === 'DIALOG DISMISSED') {
          errorMessage = t('booking.payment.cancelledByUser');
        } else if (response.transaction?.status === 'canceled') {
          errorMessage = t('booking.payment.cancelledWithReason', { reason: response.transaction?.last_error_code || 'Unknown reason' });
        } else if (response.transaction?.status === 'declined') {
          errorMessage = t('booking.payment.declinedWithReason', { reason: response.transaction?.last_error_code || 'Transaction declined' });
        } else if (response.transaction?.last_error_code) {
          errorMessage = t('booking.payment.failedWithCode', { code: response.transaction.last_error_code });
        }
        
        // Show toast notification for payment failure
        toast.error(errorMessage);
        
        // Refetch user bookings to update the UI with the new payment-failed status
        console.log('🔄 [PaymentButton] Refetching bookings after payment failure');
        try {
          await loadGuestBookings();
          console.log('✅ [PaymentButton] Bookings refetched successfully');
        } catch (refetchError) {
          console.error('❌ [PaymentButton] Failed to refetch bookings:', refetchError);
        }
        
        onPaymentError?.(errorMessage);
      }
    } catch (err) {
      console.error('❌ [PaymentButton] Error handling payment completion:', err);
      const errorMessage = err instanceof Error ? err.message : 'Payment completion failed';
      toast.error(errorMessage);
      onPaymentError?.(errorMessage);
    } finally {
      // Reset state for potential retry
      setPaymentRecordCreated(false);
      setShouldTriggerPayment(false);
    }
  }, [booking, handlePaymentComplete, onPaymentSuccess, onPaymentError, loadGuestBookings]);

  // Effect to trigger FedaPay button click after payment record is created
  useEffect(() => {
    if (shouldTriggerPayment) {
      console.log('🎯 [PaymentButton] Triggering FedaPay button click');
      
      // Option 3: DOM Query + Force Click
      const attemptClick = () => {
        // Try multiple selectors to find the actual FedaPay button
        const selectors = [
          '.fedapay-button-hidden button',
          '.fedapay-button-hidden',
          '[data-fedapay-button]',
          'button[class*="fedapay"]',
          'button[onclick*="fedapay"]'
        ];
        
        for (const selector of selectors) {
          const fedaButton = document.querySelector(selector) as HTMLButtonElement;
          if (fedaButton) {
            console.log(`✅ [PaymentButton] Found FedaPay button with selector: ${selector}`);
            try {
              fedaButton.click();
              console.log('✅ [PaymentButton] Successfully triggered FedaPay button');
              return true;
            } catch (e) {
              console.log(`❌ [PaymentButton] Click failed for selector ${selector}:`, e);
            }
          }
        }
        
        console.log('⚠️ [PaymentButton] No FedaPay button found, retrying...');
        return false;
      };
      
      // Try immediately
      if (!attemptClick()) {
        // If not found immediately, try again after a short delay
        setTimeout(() => {
          if (!attemptClick()) {
            console.error('❌ [PaymentButton] Failed to find and trigger FedaPay button after retry');
            toast.error(t('booking.payment.openModalFailed'));
            onPaymentError?.(t('booking.payment.openModalFailed'));
          }
        }, 200);
      }
    }
  }, [shouldTriggerPayment, onPaymentError]);

  // Reset state when there's an error
  useEffect(() => {
    if (error) {
      console.error('❌ [PaymentButton] Payment hook error:', error);
      toast.error(error);
      setIsCreatingRecord(false);
      setPaymentRecordCreated(false);
      setShouldTriggerPayment(false);
      onPaymentError?.(error);
    }
  }, [error, onPaymentError]);

  return (
    <div className="relative">
      {/* Main Pay Now Button */}
      <Button
        color={color}
        variant={variant}
        size={size}
        fullWidth
        className={`font-medium shadow-sm bg-primary-600 hover:bg-primary-700 text-white ${className}`}
        onPress={handlePayNowClick}
        isLoading={isCreatingRecord}
        disabled={disabled || isCreatingRecord}
      >
        {isCreatingRecord ? t('booking.payment.processing') : (children ?? t('booking.actions.payNow'))}
      </Button>

      {/* Hidden FedaCheckoutButton that gets triggered programmatically */}
      {paymentRecordCreated && (
        <div 
          style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}
          data-fedapay-container="true"
        >
              <FedaCheckoutButton
            ref={fedaButtonRef}
            options={{
              public_key: config.fedapay.current.publicKey,
              transaction: {
                amount: booking.total_amount,
                    description: t('booking.payment.description', { title: booking.properties?.title ?? t('booking.labels.property') })
              },
              currency: {
                iso: 'XOF'
              },
              button: {
                class: 'fedapay-button-hidden',
                    text: t('booking.payment.payWithFedaPay')
              },
              onComplete: handleFedaPayComplete
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PaymentButton; 