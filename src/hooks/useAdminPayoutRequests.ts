import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'
import { PayoutRequest } from '../interfaces'
import toast from 'react-hot-toast'

export const useAdminPayoutRequests = () => {
  const [requests, setRequests] = useState<PayoutRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all payout requests (optionally filter by status)
  const fetchPayoutRequests = useCallback(async (status?: string) => {
    setIsLoading(true)
    setError(null)
    let query = supabase.from<PayoutRequest>('payout_requests').select('*').order('requested_at', { ascending: false })
    if (status) query = query.eq('status', status)
    const { data, error } = await query
    if (error) {
      setError(error.message)
      toast.error(error.message)
    } else {
      setRequests(data)
    }
    setIsLoading(false)
  }, [])

  // Approve or reject payout request via edge function
  const handleAction = useCallback(async (request: PayoutRequest, action: 'approve' | 'reject', note: string) => {
    setIsLoading(true)
    setError(null)
    const { data, error } = await supabase.functions.invoke('approvePayout', {
      body: {
        payoutRequestId: request.id,
        action,
        note
      }
    })
    if (error) {
      setError(error.message)
      toast.error(error.message)
    } else {
      toast.success(`Payout ${action === 'approve' ? 'approved' : 'rejected'} successfully!`)
      // Refresh list
      await fetchPayoutRequests()
    }
    setIsLoading(false)
  }, [fetchPayoutRequests])

  return {
    requests,
    isLoading,
    error,
    fetchPayoutRequests,
    approve: (req: PayoutRequest, note: string) => handleAction(req, 'approve', note),
    reject: (req: PayoutRequest, note: string) => handleAction(req, 'reject', note)
  }
} 