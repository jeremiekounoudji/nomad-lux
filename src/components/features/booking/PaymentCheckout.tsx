import React, { useState, useEffect } from 'react'
import { useFedaPayPayment } from '../../../hooks/useFedaPayPayment'
import { config } from '../../../lib/config'

interface PaymentCheckoutProps {
  bookingId: string
  amount: number
  currency: string
  description: string
  customerEmail?: string
  customerPhone?: string
  onPaymentSuccess?: (transactionId: string) => void
  onPaymentError?: (error: string) => void
  onPaymentCancel?: () => void
}

export const PaymentCheckout: React.FC<PaymentCheckoutProps> = ({
  bookingId,
  amount,
  currency,
  description,
  customerEmail,
  customerPhone,
  onPaymentSuccess,
  onPaymentError,
  onPaymentCancel
}) => {
  const [isRetrying, setIsRetrying] = useState(false)
  const [paymentAttempts, setPaymentAttempts] = useState(0)
  
  const {
    isLoading,
    error,
    paymentData,
    createPaymentIntent,
    handlePaymentComplete,
    resetPayment
  } = useFedaPayPayment()

  // Initialize payment intent when component mounts
  useEffect(() => {
    const initializePayment = async () => {
      console.log('🚀 [PaymentCheckout] Initializing payment', {
        bookingId,
        amount,
        currency,
        description
      })

      await createPaymentIntent({
        booking_id: bookingId,
        amount,
        currency,
        description,
        customer_email: customerEmail,
        customer_phone: customerPhone
      })
    }

    if (!paymentData && paymentAttempts === 0) {
      initializePayment()
      setPaymentAttempts(1)
    }
  }, [bookingId, amount, currency, description, customerEmail, customerPhone, paymentData, createPaymentIntent, paymentAttempts])

  // Handle FedaPay payment completion
  const handleFedaPayComplete = async (response: any) => {
    console.log('🎯 [PaymentCheckout] FedaPay payment completed', response)
    
    try {
      await handlePaymentComplete(response)
      
      if (response.transaction.status === 'completed') {
        onPaymentSuccess?.(response.transaction.id)
      } else {
        onPaymentError?.(`Payment failed: ${response.reason}`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment completion failed'
      console.error('❌ [PaymentCheckout] Payment completion error:', errorMessage)
      onPaymentError?.(errorMessage)
    }
  }

  // Handle FedaPay payment error
  const handleFedaPayError = (error: any) => {
    console.error('❌ [PaymentCheckout] FedaPay payment error:', error)
    onPaymentError?.(error.message || 'Payment failed')
  }

  // Handle FedaPay payment cancel
  const handleFedaPayCancel = () => {
    console.log('⚠️ [PaymentCheckout] FedaPay payment cancelled')
    onPaymentCancel?.()
  }

  // Retry payment initialization
  const retryPayment = async () => {
    setIsRetrying(true)
    resetPayment()
    setPaymentAttempts(0)
    
    setTimeout(() => {
      setIsRetrying(false)
    }, 1000)
  }

  // Show loading state
  if (isLoading || isRetrying) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isRetrying ? 'Retrying...' : 'Initializing Payment'}
        </h3>
        <p className="text-sm text-gray-600 text-center">
          {isRetrying 
            ? 'Setting up payment again...' 
            : 'Please wait while we prepare your payment...'
          }
        </p>
      </div>
    )
  }

  // Show error state with retry option
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md border border-red-200">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Error</h3>
        <p className="text-sm text-red-600 text-center mb-4">{error}</p>
        <button
          onClick={retryPayment}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  // Show FedaPay checkout widget
  if (paymentData) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Payment Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Complete Payment</h3>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {amount.toLocaleString()} {currency}
              </p>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Processing Fee: {paymentData.fees.processing_fee}</p>
              <p className="text-xs text-gray-500">Platform Fee: {paymentData.fees.platform_fee}</p>
            </div>
          </div>
        </div>

        {/* Payment Methods Info */}
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center space-x-4 text-sm text-blue-800">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm8-2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <span>Cards</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <span>Mobile Money</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm8-2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <span>Bank Transfer</span>
            </div>
          </div>
        </div>

        {/* FedaPay Checkout Integration */}
        <div className="p-6">
          <div id="fedapay-checkout-container" className="min-h-[400px]">
            {/* This will be populated by FedaPay checkout.js script */}
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payment form...</p>
            </div>
          </div>
          
          {/* Initialize FedaPay checkout when component mounts */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if (window.FedaPay) {
                  FedaPay.init({
                    public_key: '${config.fedapay.current.publicKey}',
                    environment: '${config.isDevelopment ? 'sandbox' : 'live'}'
                  });
                  
                  FedaPay.checkout({
                    transaction: {
                      id: '${paymentData.payment_intent_id}',
                      amount: ${paymentData.amount},
                      currency: '${paymentData.currency}',
                      description: '${description}'
                    },
                    customer: {
                      email: '${customerEmail || ''}',
                      phone: '${customerPhone || ''}'
                    },
                    container: 'fedapay-checkout-container',
                    onComplete: function(response) {
                      window.handleFedaPayComplete && window.handleFedaPayComplete(response);
                    },
                    onError: function(error) {
                      window.handleFedaPayError && window.handleFedaPayError(error);
                    },
                    onCancel: function() {
                      window.handleFedaPayCancel && window.handleFedaPayCancel();
                    }
                  });
                }
              `
            }}
          />
        </div>

        {/* Security Notice */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Your payment is secured with SSL encryption</span>
          </div>
        </div>
      </div>
    )
  }

  // Fallback state
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md">
      <p className="text-gray-600">Preparing payment...</p>
    </div>
  )
}

// Expose handlers to global scope for FedaPay callbacks
if (typeof window !== 'undefined') {
  (window as any).handleFedaPayComplete = (response: any) => {
    console.log('🎯 [PaymentCheckout] Global FedaPay complete handler', response)
    // This will be handled by the component's handleFedaPayComplete function
  }
  
  (window as any).handleFedaPayError = (error: any) => {
    console.error('❌ [PaymentCheckout] Global FedaPay error handler', error)
    // This will be handled by the component's handleFedaPayError function
  }
  
  (window as any).handleFedaPayCancel = () => {
    console.log('⚠️ [PaymentCheckout] Global FedaPay cancel handler')
    // This will be handled by the component's handleFedaPayCancel function
  }
} 