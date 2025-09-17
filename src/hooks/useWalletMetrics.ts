import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useWalletStore } from '../lib/stores/walletStore'
import { useAuthStore } from '../lib/stores/authStore'

/**
 * Hook: useWalletMetrics
 * Fetches aggregated wallet metrics from `user_wallets` for the current host
 * and stores them in walletStore.
 */
export const useWalletMetrics = () => {
  const { user } = useAuthStore()
  const {
    metrics,
    setMetrics,
    setIsMetricsLoading,
    setMetricsError
  } = useWalletStore()

  const fetchWalletMetrics = useCallback(async () => {
    if (!user) return

    setIsMetricsLoading(true)
    setMetricsError(null)

    const { data, error } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('❌ Error fetching wallet metrics:', error)
      setMetricsError(error.message)
    } else {
      // Map DB fields to camelCase keys the store expects
      if (data) {
        const mapped = {
          totalBalance: Number(data.total_balance ?? 0),
          pendingAmount: Number(data.pending_amount ?? 0),
          pendingCount: Number(data.pending_count ?? 0),
          failedAmount: Number(data.failed_amount ?? 0),
          failedCount: Number(data.failed_count ?? 0),
          successfulAmount: Number(data.successful_amount ?? 0),
          successfulCount: Number(data.successful_count ?? 0),
          payoutBalance: Number(data.payout_balance ?? 0),
          lastPayoutDate: data.last_payout_date as string | null,
          nextPayoutAllowedAt: data.next_payout_allowed_at as string | null
        }
        setMetrics(mapped)
      } else {
        // No wallet record found, create one with default values
        console.log('🔄 No wallet record found, creating default wallet metrics')
        const defaultMetrics = {
          totalBalance: 0,
          pendingAmount: 0,
          pendingCount: 0,
          failedAmount: 0,
          failedCount: 0,
          successfulAmount: 0,
          successfulCount: 0,
          payoutBalance: 0,
          lastPayoutDate: null,
          nextPayoutAllowedAt: null
        }
        setMetrics(defaultMetrics)
        
        // Optionally, create the wallet record in the database
        try {
          await supabase
            .from('user_wallets')
            .insert({
              user_id: user.id,
              currency: 'XOF',
              total_balance: 0,
              pending_amount: 0,
              pending_count: 0,
              failed_amount: 0,
              failed_count: 0,
              successful_amount: 0,
              successful_count: 0,
              payout_balance: 0,
              last_payout_date: null,
              next_payout_allowed_at: null
            })
          console.log('✅ Created wallet record for user:', user.id)
        } catch (insertError) {
          console.warn('⚠️ Failed to create wallet record:', insertError)
        }
      }
    }

    setIsMetricsLoading(false)
  }, [user, setIsMetricsLoading, setMetricsError, setMetrics])

  return {
    metrics,
    isMetricsLoading: useWalletStore.getState().isMetricsLoading,
    metricsError: useWalletStore.getState().metricsError,
    fetchWalletMetrics
  }
} 