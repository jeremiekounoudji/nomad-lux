import React, { useState, useEffect } from 'react'
import { FedaCheckoutContainer } from 'fedapay-reactjs'
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
  const [isInitialized, setIsInitialized] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  
  const {
    isLoading,
    error,
    paymentData,
    createPaymentIntent,
    handlePaymentComplete,
    resetPayment
  } = useFedaPayPayment()

  console.log('🎨 [PaymentCheckout] Component rendered', {
    bookingId,
    amount,
    currency,
    isLoading,
    hasPaymentData: !!paymentData,
    error
  })

  // Initialize payment intent when component mounts
  useEffect(() => {
    if (!isInitialized && !isLoading && !paymentData) {
      console.log('🚀 [PaymentCheckout] Initializing payment intent')
      
      createPaymentIntent({
        booking_id: bookingId,
        amount,
        currency,
        description,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        success_url: `${window.location.origin}/booking-success`,
        cancel_url: `${window.location.origin}/booking-cancel`
      }).then((intent) => {
        if (intent) {
          setShowCheckout(true)
          console.log('✅ [PaymentCheckout] Payment intent ready, showing checkout')
        }
      })
      
      setIsInitialized(true)
    }
  }, [
    isInitialized,
    isLoading,
    paymentData,
    createPaymentIntent,
    bookingId,
    amount,
    currency,
    description,
    customerEmail,
    customerPhone
  ])

  // Handle FedaPay checkout completion
  const handleCheckoutComplete = async (response: any) => {
    console.log('🎯 [PaymentCheckout] Checkout completed', {
      reason: response.reason,
      transaction: response.transaction
    })

    try {
      // Check if payment was successful
      const FedaPay = (window as any).FedaPay
      
      if (response.reason === FedaPay?.DIALOG_DISMISSED) {
        console.log('⚠️ [PaymentCheckout] Payment dialog dismissed by user')
        onPaymentCancel?.()
        return
      }

      if (response.reason === FedaPay?.TRANSACTION_COMPLETED && response.transaction) {
        console.log('✅ [PaymentCheckout] Transaction completed successfully')
        
        await handlePaymentComplete(response)
        onPaymentSuccess?.(response.transaction.id)
      } else {
        console.error('❌ [PaymentCheckout] Payment failed', response)
        const errorMessage = response.transaction?.status === 'failed' 
          ? 'Payment was declined. Please try again with a different payment method.'
          : 'Payment failed. Please try again.'
        onPaymentError?.(errorMessage)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed'
      console.error('❌ [PaymentCheckout] Error handling payment completion', err)
      onPaymentError?.(errorMessage)
    }
  }

  // Handle retry payment
  const handleRetry = () => {
    console.log('🔄 [PaymentCheckout] Retrying payment')
    resetPayment()
    setIsInitialized(false)
    setShowCheckout(false)
  }

  // Loading state
  if (isLoading || !isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm border">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 text-center">
          Preparing secure payment...
        </p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Setup Failed</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Payment checkout widget
  if (showCheckout && paymentData) {
    const checkoutOptions = {
      public_key: paymentData.public_key || config.fedapay.publicKey,
      transaction: {
        amount: paymentData.amount,
        description: description
      },
      currency: {
        iso: paymentData.currency
      },
      onComplete: handleCheckoutComplete
    }

    console.log('🎨 [PaymentCheckout] Rendering FedaPay checkout widget', {
      publicKey: checkoutOptions.public_key ? 'configured' : 'missing',
      amount: checkoutOptions.transaction.amount,
      currency: checkoutOptions.currency.iso
    })

    return (
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* Payment Header */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Complete Payment</h3>
              <p className="text-sm text-gray-600">
                Secure payment powered by FedaPay
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {paymentData.amount.toLocaleString()} {paymentData.currency}
              </p>
              <p className="text-sm text-gray-600">
                + {(paymentData.fees.processing_fee + paymentData.fees.platform_fee).toFixed(2)} fees
              </p>
            </div>
          </div>
        </div>

        {/* FedaPay Checkout Widget */}
        <div className="p-6">
          <FedaCheckoutContainer
            options={checkoutOptions}
            style={{
              height: 500,
              width: '100%',
              backgroundColor: '#ffffff',
              border: 'none',
              borderRadius: '8px'
            }}
          />
        </div>

        {/* Payment Methods Info */}
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" />
              </svg>
              Cards
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
              </svg>
              Mobile Money
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" />
              </svg>
              Bank Transfer
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Fallback loading state
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
} 