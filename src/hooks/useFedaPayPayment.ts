import { useState, useCallback } from 'react'
import { config } from '../lib/config'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../lib/stores/authStore'
import { useBookingStore } from '../lib/stores/bookingStore'
import { PaymentRecord } from '../interfaces/PaymentRecord'

// FedaPay payment response interfaces
interface FedaPayTransaction {
  id: number
  reference: string
  amount: number
  amount_debited: number
  amount_transferred: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'canceled' | 'approved' | 'declined'
  fees: number
  mode: string // 'moov', 'mtn', 'bank', etc.
  commission: string
  last_error_code?: string
  description: string
  approved_at?: string | null
  canceled_at?: string | null
  declined_at?: string | null
  created_at: string
  updated_at: string
  // Additional fields from the actual response
  account_id: number
  balance_id: number
  callback_url: string
  currency_id: number
  custom_metadata?: any
  customer_id: number
  deleted_at?: string | null
  fixed_commission: number
  klass: string
  merchant_reference?: string | null
  metadata: Record<string, any>
  operation: string
  payment_method_id: number
  payment_token?: string | null
  payment_url?: string | null
  receipt_url?: string | null
  refunded_at?: string | null
  sub_accounts_commissions?: any
  transaction_key?: string | null
  transferred_at?: string | null
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
}

interface PaymentIntentResponse {
  payment_intent_id: string
  public_key: string
  amount: number
  currency: string
}

// Utility function for retry pattern with exponential backoff
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        break
      }
      
      const delay = baseDelay * Math.pow(2, attempt)
      console.log(`⏳ [retryWithBackoff] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`, error)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}

interface UseFedaPayPaymentReturn {
  isLoading: boolean
  error: string | null
  paymentData: PaymentIntentResponse | null
  createPaymentRecord: (data: PaymentIntentData) => Promise<PaymentIntentResponse | null>
  handlePaymentComplete: (response: FedaPayPaymentResponse) => Promise<void>
  resetPayment: () => void
}

export const useFedaPayPayment = (): UseFedaPayPaymentReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentData, setPaymentData] = useState<PaymentIntentResponse | null>(null)
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null)
  
  const { user } = useAuthStore()
  const { addPaymentRecord, updatePaymentRecord, updateBookingStatus } = useBookingStore()

  console.log('🔧 [useFedaPayPayment] Hook initialized', {
    user: user?.id,
    fedaPayConfig: {
      isDevelopment: config.isDevelopment,
      publicKey: config.fedapay.current.publicKey ? 'configured' : 'missing'
    }
  })

  const createPaymentRecord = useCallback(async (data: PaymentIntentData): Promise<PaymentIntentResponse | null> => {
    if (!user) {
      setError('User must be authenticated to create payment record')
      console.error('❌ [useFedaPayPayment] No authenticated user')
      return null
    }

    if (!data.booking_id || data.booking_id === 'undefined') {
      setError('Valid booking ID is required')
      console.error('❌ [useFedaPayPayment] Invalid booking ID:', data.booking_id)
      return null
    }

    setIsLoading(true)
    setError(null)
    
    console.log('🚀 [useFedaPayPayment] Creating payment record', {
      bookingId: data.booking_id,
      amount: data.amount,
      currency: data.currency,
      userId: user.id
    })

    try {
      // 1️⃣ Check for existing non-completed payment record for this booking
      const { data: existingRecord, error: fetchError } = await supabase
        .from('payment_records')
        .select('payment_intent_id, amount, currency, payment_status')
        .eq('booking_id', data.booking_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        throw new Error(`Failed to fetch existing payment record: ${fetchError.message}`);
      }

      if (existingRecord && existingRecord.payment_status !== 'completed') {
        console.log('ℹ️ [useFedaPayPayment] Re-using existing payment record', {
          bookingId: data.booking_id,
          paymentIntentId: existingRecord.payment_intent_id,
          status: existingRecord.payment_status
        });

        const existingIntent: PaymentIntentResponse = {
          payment_intent_id: existingRecord.payment_intent_id,
          public_key: config.fedapay.current.publicKey,
          amount: existingRecord.amount,
          currency: existingRecord.currency
        };

        // Update state and return existing intent
        setPaymentData(existingIntent);
        setCurrentBookingId(data.booking_id);

        return existingIntent;
      }

      // Generate payment intent ID
      const paymentIntentId = (crypto as any).randomUUID ? (crypto as any).randomUUID() : `pi_${Date.now()}`
      
      const paymentIntent: PaymentIntentResponse = {
        payment_intent_id: paymentIntentId,
        public_key: config.fedapay.current.publicKey,
        amount: data.amount,
        currency: data.currency,
      }

      // Create initial payment record in database with pending status
      // Using temporary payment_method that will be updated after payment completion
      const paymentRecord: Partial<PaymentRecord> = {
        booking_id: data.booking_id,
        payment_method: 'fedapay_card' as const, // Default - will be updated after payment
        payment_provider: 'fedapay',
        payment_intent_id: paymentIntentId,
        amount: data.amount,
        currency: data.currency,
        payment_status: 'pending',
        processing_fee: 0, // Default values for required fields
        platform_fee: 0,
        refund_amount: 0,
        net_amount: data.amount, // For now, net amount equals total amount
        payout_status: 'pending',
        payment_metadata: {
          fedapay_intent_id: paymentIntentId,
          customer_email: data.customer_email || user.email,
          description: data.description
        },
        initiated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Persist to Supabase with retry pattern
      try {
        await retryWithBackoff(async () => {
          const { error: insertError } = await supabase
            .from('payment_records')
            .insert(paymentRecord)
          
          if (insertError) {
            throw new Error(`Database insert failed: ${insertError.message}`)
          }
        })
        
        console.log('✅ [useFedaPayPayment] Payment record created successfully', {
          paymentIntentId,
          bookingId: data.booking_id
        })
      } catch (dbErr) {
        console.error('❌ [useFedaPayPayment] Failed to persist payment record after retries:', dbErr)
        throw new Error('Failed to create payment record in database')
      }

      // Update local store (optimistic)
      addPaymentRecord(paymentRecord as PaymentRecord)
      setPaymentData(paymentIntent)
      setCurrentBookingId(data.booking_id) // Store booking ID for later use

      return paymentIntent
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create payment record'
      setError(errorMessage)
      console.error('❌ [useFedaPayPayment] Payment record creation failed', {
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
      amount: response.transaction.amount,
      fees: response.transaction.fees,
      mode: response.transaction.mode
    })

    try {
      setIsLoading(true)
      
      // Determine payment method based on transaction mode and data
      let paymentMethod: PaymentRecord['payment_method'] = 'fedapay_card'
      if (response.transaction.mode === 'moov' || response.transaction.mode === 'mtn') {
        paymentMethod = 'fedapay_mobile_money'
      } else if (response.transaction.mode === 'bank' || response.transaction.reference?.includes('bank')) {
        paymentMethod = 'fedapay_bank_transfer'
      }
      
      // Determine payment status based on FedaPay response
      let paymentStatus: PaymentRecord['payment_status'] = 'failed'
      let failureReason: string | undefined
      
      if (response.transaction.status === 'approved' || response.transaction.approved_at) {
        paymentStatus = 'completed'
      } else if (response.transaction.status === 'canceled' || response.transaction.canceled_at) {
        paymentStatus = 'failed'
        failureReason = response.reason === 'DIALOG DISMISSED' 
          ? 'Payment cancelled by user' 
          : `Payment cancelled: ${response.transaction.last_error_code || response.reason}`
      } else if (response.transaction.status === 'declined' || response.transaction.declined_at) {
        paymentStatus = 'failed'
        failureReason = `Payment declined: ${response.transaction.last_error_code || 'Transaction declined'}`
      } else if (response.transaction.last_error_code) {
        paymentStatus = 'failed'
        failureReason = `Payment failed: ${response.transaction.last_error_code}`
      }
      
      // Calculate net amount (amount - fees)
      const netAmount = response.transaction.amount_transferred || 
                       (response.transaction.amount - (response.transaction.fees || 0))
      
      // Update payment record with completion data
      const updatedRecord: Partial<PaymentRecord> = {
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        processing_fee: response.transaction.fees || 0,
        net_amount: netAmount,
        completed_at: paymentStatus === 'completed' ? new Date().toISOString() : undefined,
        failure_reason: failureReason,
        payment_metadata: {
          ...((paymentData as any).payment_metadata || {}),
          fedapay_transaction_id: response.transaction.id,
          fedapay_reference: response.transaction.reference,
          fedapay_status: response.transaction.status,
          fedapay_mode: response.transaction.mode,
          fedapay_error_code: response.transaction.last_error_code,
          completion_reason: response.reason,
          amount_debited: response.transaction.amount_debited,
          amount_transferred: response.transaction.amount_transferred,
          commission: response.transaction.commission,
          canceled_at: response.transaction.canceled_at,
          declined_at: response.transaction.declined_at,
          approved_at: response.transaction.approved_at,
          fedapay_response: response
        },
        updated_at: new Date().toISOString()
      }

      // Update Supabase with retry pattern
      try {
        await retryWithBackoff(async () => {
          const { error: updateError } = await supabase
            .from('payment_records')
            .update(updatedRecord)
            .eq('payment_intent_id', paymentData.payment_intent_id)
          
          if (updateError) {
            throw new Error(`Database update failed: ${updateError.message}`)
          }
        })

        console.log('✅ [useFedaPayPayment] Payment completion handled successfully', {
          paymentIntentId: paymentData.payment_intent_id,
          status: updatedRecord.payment_status,
          transactionId: response.transaction.id
        })
        
        // If payment failed, update booking status to 'payment-failed'
        if (paymentStatus === 'failed' && currentBookingId) {
          console.log('📝 [useFedaPayPayment] Updating booking status to payment-failed', {
            bookingId: currentBookingId
          })
          
          try {
            await retryWithBackoff(async () => {
              const { error: bookingError } = await supabase
                .from('bookings')
                .update({ 
                  status: 'payment-failed',
                  updated_at: new Date().toISOString()
                })
                .eq('id', currentBookingId)
              
              if (bookingError) {
                throw new Error(`Failed to update booking status: ${bookingError.message}`)
              }
            }, 3, 1000)
            
            console.log('✅ [useFedaPayPayment] Booking status updated to payment-failed')
          } catch (bookingErr) {
            console.warn('⚠️ [useFedaPayPayment] Failed to update booking status:', bookingErr)
            // Don't throw - payment record was updated successfully
          }
        }
        
        // If payment succeeded, update booking status to 'completed'
        if (paymentStatus === 'completed' && currentBookingId) {
          console.log('📝 [useFedaPayPayment] Updating booking status to completed', {
            bookingId: currentBookingId
          })

          try {
            await retryWithBackoff(async () => {
              const { error: bookingError } = await supabase
                .from('bookings')
                .update({ 
                  status: 'completed',
                  updated_at: new Date().toISOString()
                })
                .eq('id', currentBookingId)

              if (bookingError) {
                throw new Error(`Failed to update booking status: ${bookingError.message}`)
              }
            }, 3, 1000)

            console.log('✅ [useFedaPayPayment] Booking status updated to completed')

            // Update store optimistically
            updateBookingStatus(currentBookingId, 'completed')
          } catch (bookingErr) {
            console.warn('⚠️ [useFedaPayPayment] Failed to update booking status to completed:', bookingErr)
            // Booking will refresh later via polling/hooks
          }
        }
        
      } catch (dbErr) {
        console.error('❌ [useFedaPayPayment] Failed to update payment record after retries:', dbErr)
        // Don't throw here - the payment might have succeeded even if DB update failed
        // The webhook will handle eventual consistency
      }

      // Update local store
      updatePaymentRecord(paymentData.payment_intent_id, updatedRecord)

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
  }, [paymentData, currentBookingId, updatePaymentRecord, updateBookingStatus])

  const resetPayment = useCallback(() => {
    console.log('🔄 [useFedaPayPayment] Resetting payment state')
    setPaymentData(null)
    setCurrentBookingId(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    isLoading,
    error,
    paymentData,
    createPaymentRecord,
    handlePaymentComplete,
    resetPayment
  }
} 