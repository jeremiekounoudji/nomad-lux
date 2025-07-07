import { useState, useCallback } from 'react'
import { config } from '../lib/config'
import { useAuthStore } from '../lib/stores/authStore'
import { useBookingStore } from '../lib/stores/bookingStore'
import { PaymentRecord } from '../interfaces/PaymentRecord'
import { supabase } from '../lib/supabase'

// FedaPay payment response interfaces
interface FedaPayTransaction {
  id: string
  reference: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed'
  fees: number
  net_amount: number
  created_at: string
  updated_at: string
}

interface FedaPayPaymentResponse {
  reason: string
  transaction: FedaPayTransaction
}

interface PaymentIntentData {
  booking_id: string
  amount: number
  currency: string
  description: string
  customer_email?: string
  customer_phone?: string
  success_url?: string
  cancel_url?: string
}

interface PaymentIntentResponse {
  payment_intent_id: string
  public_key: string
  checkout_url?: string
  amount: number
  currency: string
  fees: {
    processing_fee: number
    platform_fee: number
  }
}

interface UseFedaPayPaymentReturn {
  isLoading: boolean
  error: string | null
  paymentData: PaymentIntentResponse | null
  createPaymentIntent: (data: PaymentIntentData) => Promise<PaymentIntentResponse | null>
  handlePaymentComplete: (response: FedaPayPaymentResponse) => Promise<void>
  resetPayment: () => void
}

export const useFedaPayPayment = (): UseFedaPayPaymentReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentData, setPaymentData] = useState<PaymentIntentResponse | null>(null)
  
  const { user } = useAuthStore()
  const { addPaymentRecord, updatePaymentRecord } = useBookingStore()

  console.log('🔧 [useFedaPayPayment] Hook initialized', {
    user: user?.id,
    fedaPayConfig: {
      isDevelopment: config.isDevelopment,
      publicKey: config.fedapay.current.publicKey ? 'configured' : 'missing'
    }
  })

  const createPaymentIntent = useCallback(async (data: PaymentIntentData): Promise<PaymentIntentResponse | null> => {
    if (!user) {
      setError('User must be authenticated to create payment intent')
      console.error('❌ [useFedaPayPayment] No authenticated user')
      return null
    }

    setIsLoading(true)
    setError(null)
    
    console.log('🚀 [useFedaPayPayment] Creating payment intent', {
      bookingId: data.booking_id,
      amount: data.amount,
      currency: data.currency,
      userId: user.id
    })

    try {
      // Get the current session for the access token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('No valid session found')
      }

      // Call Supabase edge function to create FedaPay payment intent
      const response = await fetch('/api/v1/create-fedapay-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          ...data,
          user_id: user.id,
          customer_email: data.customer_email || user.email
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create payment intent')
      }

      const paymentIntent: PaymentIntentResponse = await response.json()
      
      console.log('✅ [useFedaPayPayment] Payment intent created', {
        paymentIntentId: paymentIntent.payment_intent_id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        fees: paymentIntent.fees
      })

      // Create initial payment record in store
      const paymentRecord: Partial<PaymentRecord> = {
        booking_id: data.booking_id,
        payment_method: 'fedapay_card', // Will be updated based on actual method used
        payment_provider: 'fedapay',
        payment_intent_id: paymentIntent.payment_intent_id,
        amount: paymentIntent.amount,
        currency: data.currency,
        payment_status: 'pending',
        processing_fee: paymentIntent.fees.processing_fee,
        platform_fee: paymentIntent.fees.platform_fee,
        net_amount: paymentIntent.amount - paymentIntent.fees.processing_fee - paymentIntent.fees.platform_fee,
        payout_status: 'pending',
        payment_metadata: {
          fedapay_intent_id: paymentIntent.payment_intent_id,
          customer_email: data.customer_email || user.email
        },
        initiated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      addPaymentRecord(paymentRecord as PaymentRecord)
      setPaymentData(paymentIntent)

      return paymentIntent
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create payment intent'
      setError(errorMessage)
      console.error('❌ [useFedaPayPayment] Payment intent creation failed', {
        error: errorMessage,
        bookingId: data.booking_id
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [user, addPaymentRecord])

  const handlePaymentComplete = useCallback(async (response: FedaPayPaymentResponse): Promise<void> => {
    if (!paymentData) {
      console.error('❌ [useFedaPayPayment] No payment data available for completion')
      return
    }

    console.log('🎯 [useFedaPayPayment] Handling payment completion', {
      reason: response.reason,
      transactionId: response.transaction.id,
      status: response.transaction.status,
      amount: response.transaction.amount
    })

    try {
      setIsLoading(true)
      
      // Determine payment method based on transaction data
      let paymentMethod: PaymentRecord['payment_method'] = 'fedapay_card'
      // Note: FedaPay doesn't always provide method info in the response
      // This would need to be enhanced based on actual FedaPay response structure
      
      // Update payment record with completion data
      const updatedRecord: Partial<PaymentRecord> = {
        payment_intent_id: paymentData.payment_intent_id,
        payment_method: paymentMethod,
        payment_status: response.transaction.status === 'completed' ? 'completed' : 'failed',
        processing_fee: response.transaction.fees,
        net_amount: response.transaction.net_amount,
        completed_at: response.transaction.status === 'completed' ? new Date().toISOString() : undefined,
        payment_metadata: {
          ...((paymentData as any).payment_metadata || {}),
          fedapay_transaction_id: response.transaction.id,
          fedapay_reference: response.transaction.reference,
          completion_reason: response.reason
        },
        updated_at: new Date().toISOString()
      }

      updatePaymentRecord(paymentData.payment_intent_id, updatedRecord)

      console.log('✅ [useFedaPayPayment] Payment completion handled', {
        paymentIntentId: paymentData.payment_intent_id,
        status: updatedRecord.payment_status,
        transactionId: response.transaction.id
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to handle payment completion'
      setError(errorMessage)
      console.error('❌ [useFedaPayPayment] Payment completion handling failed', {
        error: errorMessage,
        transactionId: response.transaction.id
      })
    } finally {
      setIsLoading(false)
    }
  }, [paymentData, updatePaymentRecord])

  const resetPayment = useCallback(() => {
    console.log('🔄 [useFedaPayPayment] Resetting payment state')
    setPaymentData(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    isLoading,
    error,
    paymentData,
    createPaymentIntent,
    handlePaymentComplete,
    resetPayment
  }
} 