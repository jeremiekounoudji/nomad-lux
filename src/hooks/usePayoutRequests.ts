import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'
import { PayoutRequest } from '../interfaces'
import toast from 'react-hot-toast'

/**
 * Hook: usePayoutRequests
 * Handles fetching payout requests for the current host and creating a new request via edge function.
 * NOTE: Will be refactored to use walletStore once payout request state is added (task 3.3).
 */
export const usePayoutRequests = () => {
  const [requests, setRequests] = useState<PayoutRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch payout requests list
  const fetchPayoutRequests = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from<'payout_requests', PayoutRequest>('payout_requests')
      .select('*')
      .order('requested_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching payout requests:', error)
      setError(error.message)
    } else {
      setRequests(data)
    }

    setIsLoading(false)
  }, [])

  // Create new payout request via edge function
  const createPayoutRequest = useCallback(async (amount: number) => {
    setIsLoading(true)
    setError(null)

    console.log('🚀 Calling requestPayout with amount:', amount)
    const { data, error } = await supabase.functions.invoke('requestPayout', {
      body: { amount }
    })
    console.log('📥 Response:', { data, error })

    if (error) {
      console.error('❌ requestPayout error:', error)
      const msg = error.message || 'Failed to request payout'
      setError(msg)
      toast.error(msg)
    } else if ((data as any)?.success) {
      // Optimistically add the new request to the list
      setRequests((prev) => [
        (data as any).payoutRequest as PayoutRequest,
        ...prev
      ])
      toast.success('Payout request submitted successfully!')
    }

    setIsLoading(false)
  }, [])

  return {
    requests,
    isLoading,
    error,
    fetchPayoutRequests,
    createPayoutRequest
  }
} 