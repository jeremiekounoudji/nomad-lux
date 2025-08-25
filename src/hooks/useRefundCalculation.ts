import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'
import { RefundCalculation } from '../interfaces/PaymentRecord'
import toast from 'react-hot-toast'

interface UseRefundCalculationReturn {
  calculateRefund: (bookingId: string, cancellationDate?: Date) => Promise<RefundCalculation | null>
  isLoading: boolean
  error: string | null
  clearError: () => void
}

export const useRefundCalculation = (): UseRefundCalculationReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const calculateRefund = useCallback(async (
    bookingId: string, 
    cancellationDate?: Date
  ): Promise<RefundCalculation | null> => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('🔄 Calculating refund for booking:', bookingId)
      
      // Use the backend RPC function with correct parameter names
      const { data, error: rpcError } = await supabase.rpc('calculate_refund_amount', {
        p_booking_id: bookingId,
        p_cancellation_date: cancellationDate?.toISOString() || new Date().toISOString()
      })

      if (rpcError) {
        console.error('❌ RPC error:', rpcError)
        throw new Error(`Failed to calculate refund: ${rpcError.message}`)
      }

      if (!data || data.length === 0) {
        throw new Error('No refund calculation data returned')
      }

      const refundData = data[0] as RefundCalculation
      console.log('✅ Refund calculation result:', refundData)

      return refundData

    } catch (error) {
      console.error('❌ Error calculating refund:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to calculate refund'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    calculateRefund,
    isLoading,
    error,
    clearError
  }
}
