import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'
import { PayoutRequest } from '../interfaces'
import toast from 'react-hot-toast'

export const useAdminPayoutRequests = () => {
  const [requests, setRequests] = useState<PayoutRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 10

  // Fetch all payout requests with pagination
  const fetchPayoutRequests = useCallback(async (status?: string, page: number = 1) => {
    setIsLoading(true)
    setError(null)
    
    // Calculate range for pagination
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1
    
    // Build query with pagination
    let query = supabase
      .from('payout_requests')
      .select('*', { count: 'exact' })
      .order('requested_at', { ascending: false })
      .range(from, to)
    
    if (status) query = query.eq('status', status)
    
    const { data, error, count } = await query
    
    if (error) {
      setError(error.message)
      toast.error(error.message)
    } else {
      setRequests(data || [])
      setTotalCount(count || 0)
      setTotalPages(Math.ceil((count || 0) / itemsPerPage))
      setCurrentPage(page)
    }
    setIsLoading(false)
  }, [itemsPerPage])

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
    currentPage,
    totalPages,
    totalCount,
    itemsPerPage,
    fetchPayoutRequests,
    setCurrentPage,
    approve: (req: PayoutRequest, note: string) => handleAction(req, 'approve', note),
    reject: (req: PayoutRequest, note: string) => handleAction(req, 'reject', note)
  }
} 