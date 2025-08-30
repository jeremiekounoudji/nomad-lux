import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useWalletStore } from '../lib/stores/walletStore'
import { useAuthStore } from '../lib/stores/authStore'

/**
 * Hook: useWalletHistory
 * Fetches paginated payment records (both guest and host perspectives)
 * and stores them in walletStore following the Supabase + Zustand rule set.
 */
export const useWalletHistory = () => {
  const {
    payments,
    pagination,
    setPayments,
    appendPayments,
    setPagination,
    setIsLoading,
    setIsRefreshing,
    setError,
    reset
  } = useWalletStore()

  const { user } = useAuthStore()

  /**
   * Internal fetch helper – interacts with Supabase
   */
  const fetchPayments = useCallback(async (page: number, pageSize: number) => {
    if (!user) return { data: [], error: 'User not authenticated' }

    const offset = (page - 1) * pageSize
    const rangeTo = offset + pageSize - 1

    // Select payment records that belong to bookings for which the current user is
    // either the guest or the host. We join the bookings table to capture the link.
    // NOTE: This keeps the query simple and avoids RPCs per project guidelines.
    const query = supabase
      .from('payment_records')
      .select(
        `*,
        bookings!inner(
          id,
          host_id,
          guest_id,
          property_id,
          properties!inner(title)
        )`
      )
      // Filter payments where current user is host or guest
      .or(`host_id.eq.${user.id},guest_id.eq.${user.id}`, { foreignTable: 'bookings' })
      .order('created_at', { ascending: false })
      .range(offset, rangeTo)

    const { data, error } = await query
    return { data, error }
  }, [user])

  /**
   * Load first page (or refresh) – replaces store payments
   */
  const loadWalletPayments = useCallback(async (pageSize: number = 10) => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await fetchPayments(1, pageSize)

      if (error) {
        const msg = typeof error === 'string' ? error : error.message
        throw new Error(msg || 'Failed to load payments')
      }

      setPayments(data || [])
      // Set pagination baseline; we infer totalPages lazily
      setPagination({ currentPage: 1, pageSize })
    } catch (err) {
      console.error('❌ Error loading wallet payments:', err)
      setError(err instanceof Error ? err.message : 'Failed to load wallet payments')
    } finally {
      setIsLoading(false)
    }
  }, [fetchPayments, setPayments, setPagination, setError, setIsLoading, user])

  /**
   * Load next page and append
   */
  const loadMoreWalletPayments = useCallback(async () => {
    if (!user) return

    const currentPage = pagination.currentPage
    const nextPage = currentPage + 1
    const pageSize = pagination.pageSize

    // Guard: if we already know we are at the end
    if (pagination.totalPages !== 1 && nextPage > pagination.totalPages) return

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await fetchPayments(nextPage, pageSize)
      if (error) {
        const msg = typeof error === 'string' ? error : error.message
        throw new Error(msg || 'Failed to load more payments')
      }

      // If fewer than pageSize returned, we reached last page
      if ((data?.length || 0) < pageSize) {
        setPagination({ totalPages: nextPage })
      }

      if (data && data.length) {
        appendPayments(data)
        setPagination({ currentPage: nextPage })
      }
    } catch (err) {
      console.error('❌ Error loading more wallet payments:', err)
      setError(err instanceof Error ? err.message : 'Failed to load more wallet payments')
    } finally {
      setIsLoading(false)
    }
  }, [user, pagination, fetchPayments, appendPayments, setPagination, setError, setIsLoading])

  /** Refresh current payments */
  const refreshWalletPayments = useCallback(async () => {
    if (!user) return

    setIsRefreshing(true)
    try {
      await loadWalletPayments(pagination.pageSize)
    } finally {
      setIsRefreshing(false)
    }
  }, [user, loadWalletPayments, pagination.pageSize, setIsRefreshing])

  return {
    payments,
    pagination,
    isLoading: useWalletStore.getState().isLoading,
    isRefreshing: useWalletStore.getState().isRefreshing,
    error: useWalletStore.getState().error,
    loadWalletPayments,
    loadMoreWalletPayments,
    refreshWalletPayments,
    resetWalletStore: reset
  }
} 