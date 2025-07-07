import { create } from 'zustand'
import { PaymentRecord } from '../../interfaces/PaymentRecord'

interface WalletPagination {
  currentPage: number
  totalPages: number
  pageSize: number
}

interface WalletState {
  // Data
  payments: PaymentRecord[]

  // Pagination
  pagination: WalletPagination

  // Loading & Errors
  isLoading: boolean
  isRefreshing: boolean
  error: string | null

  // Actions – pure state updates only
  setPayments: (payments: PaymentRecord[]) => void
  appendPayments: (payments: PaymentRecord[]) => void
  setPagination: (pagination: Partial<WalletPagination>) => void
  setIsLoading: (loading: boolean) => void
  setIsRefreshing: (refreshing: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useWalletStore = create<WalletState>((set, get) => ({
  // Initial state
  payments: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10
  },
  isLoading: false,
  isRefreshing: false,
  error: null,

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

  setPagination: (pagination) => {
    set((state) => ({
      pagination: { ...state.pagination, ...pagination }
    }))
  },

  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsRefreshing: (refreshing) => set({ isRefreshing: refreshing }),
  setError: (error) => set({ error }),

  reset: () => {
    console.log('🔄 Resetting wallet store')
    set({
      payments: [],
      pagination: { currentPage: 1, totalPages: 1, pageSize: 10 },
      isLoading: false,
      isRefreshing: false,
      error: null
    })
  }
})) 