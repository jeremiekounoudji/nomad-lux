import { create } from 'zustand'
import { PaymentRecord } from '../../interfaces/PaymentRecord'
import { PayoutRequest } from '../../interfaces/PayoutRequest'

interface WalletPagination {
  currentPage: number
  totalPages: number
  pageSize: number
}

interface WalletMetrics {
  totalBalance: number
  pendingAmount: number
  pendingCount: number
  failedAmount: number
  failedCount: number
  successfulAmount: number
  successfulCount: number
  payoutBalance: number
  lastPayoutDate?: string | null
  nextPayoutAllowedAt?: string | null
}

interface WalletState {
  // Data
  payments: PaymentRecord[]
  metrics: WalletMetrics | null
  payoutRequests: PayoutRequest[]

  // Pagination
  pagination: WalletPagination

  // Loading & Errors
  isLoading: boolean
  isRefreshing: boolean
  isMetricsLoading: boolean
  payoutIsLoading: boolean
  error: string | null
  metricsError: string | null
  payoutError: string | null

  // Actions – pure state updates only
  setPayments: (payments: PaymentRecord[]) => void
  appendPayments: (payments: PaymentRecord[]) => void
  setPagination: (pagination: Partial<WalletPagination>) => void
  setIsLoading: (loading: boolean) => void
  setIsRefreshing: (refreshing: boolean) => void
  setIsMetricsLoading: (loading: boolean) => void
  setPayoutLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setMetrics: (metrics: WalletMetrics | null) => void
  setMetricsError: (error: string | null) => void
  setPayoutRequests: (reqs: PayoutRequest[]) => void
  appendPayoutRequests: (reqs: PayoutRequest[]) => void
  setPayoutError: (error: string | null) => void
  reset: () => void
}

export const useWalletStore = create<WalletState>((set, get) => ({
  // Initial state
  payments: [],
  metrics: null,
  payoutRequests: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10
  },
  isLoading: false,
  isRefreshing: false,
  isMetricsLoading: false,
  payoutIsLoading: false,
  error: null,
  metricsError: null,
  payoutError: null,

  // Actions
  setPayments: (payments) => {
    console.log('💰 Setting wallet payments:', payments.length)
    set({ payments, error: null })
  },

  appendPayments: (newPayments) => {
    const { payments } = get()
    console.log('➕ Appending wallet payments:', newPayments.length)

    // Avoid duplicates by id
    const existingIds = new Set(payments.map(p => p.id))
    const unique = newPayments.filter(p => !existingIds.has(p.id))

    set({ payments: [...payments, ...unique] })
  },

  setPayoutRequests: (reqs) => {
    console.log('🔄 Setting payout requests:', reqs.length)
    set({ payoutRequests: reqs })
  },

  appendPayoutRequests: (newReqs) => {
    const { payoutRequests } = get()
    const existingIds = new Set(payoutRequests.map(r => r.id))
    const unique = newReqs.filter(r => !existingIds.has(r.id))
    set({ payoutRequests: [...payoutRequests, ...unique] })
  },

  setPagination: (pagination) => {
    set((state) => ({
      pagination: { ...state.pagination, ...pagination }
    }))
  },

  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsRefreshing: (refreshing) => set({ isRefreshing: refreshing }),
  setIsMetricsLoading: (loading) => set({ isMetricsLoading: loading }),
  setPayoutLoading: (loading) => set({ payoutIsLoading: loading }),
  setError: (error) => set({ error }),
  setMetrics: (metrics) => set({ metrics }),
  setMetricsError: (metricsError) => set({ metricsError }),
  setPayoutError: (payoutError) => set({ payoutError }),

  reset: () => {
    console.log('🔄 Resetting wallet store')
    set({
      payments: [],
      metrics: null,
      payoutRequests: [],
      pagination: { currentPage: 1, totalPages: 1, pageSize: 10 },
      isLoading: false,
      isRefreshing: false,
      isMetricsLoading: false,
      payoutIsLoading: false,
      error: null,
      metricsError: null,
      payoutError: null
    })
  }
})) 