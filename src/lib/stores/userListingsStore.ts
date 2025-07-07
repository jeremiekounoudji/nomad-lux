import { create } from 'zustand'
import { DatabaseProperty, ListingStats } from '../../interfaces'
import { CACHE_TTL_MS } from '../cacheConfig'

interface StatusData {
  listings: DatabaseProperty[]
  pagination: {
    currentPage: number
    pageSize: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  lastFetched: number
  isLoading: boolean
}

interface UserListingsState {
  // State - data organized by status
  statusData: {
    [key: string]: StatusData
  }
  
  // Global state
  listingStats: Record<string, ListingStats>
  isLoading: boolean
  error: string | null
  
  // Current filter
  statusFilter: 'all' | 'approved' | 'pending' | 'paused' | 'rejected'
  
  // Real-time status counts from database
  statusCounts: {
    all: number
    approved: number
    pending: number
    paused: number
    rejected: number
  }
  
  // Actions
  setStatusData: (status: string, data: StatusData) => void
  updateStatusListings: (status: string, listings: DatabaseProperty[]) => void
  setStatusPagination: (status: string, pagination: StatusData['pagination']) => void
  setStatusLoading: (status: string, loading: boolean) => void
  
  // Individual listing actions
  addUserListing: (listing: DatabaseProperty) => void
  updateUserListing: (listing: DatabaseProperty) => void
  removeUserListing: (listingId: string) => void
  
  // Statistics
  setListingStats: (stats: Record<string, ListingStats>) => void
  updateListingStats: (listingId: string, stats: ListingStats) => void
  
  // Global loading and error state
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Status counts from database
  setStatusCounts: (counts: UserListingsState['statusCounts']) => void
  
  // Filters
  setStatusFilter: (status: UserListingsState['statusFilter']) => void
  
  // Utilities
  getListingById: (id: string) => DatabaseProperty | undefined
  getCurrentListings: () => DatabaseProperty[]
  getCurrentPagination: () => StatusData['pagination'] | undefined
  getListingStats: (id: string) => ListingStats | undefined
  getTotalStats: () => {
    totalRevenue: number
    totalBookings: number
    totalViews: number
    avgRating: number
  }
  shouldFetchStatus: (status: string, page: number) => boolean
  clearStatus: (status: string) => void
  clearAll: () => void
}

const createEmptyStatusData = (): StatusData => ({
  listings: [],
  pagination: {
    currentPage: 1,
    pageSize: 6,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  },
  lastFetched: 0,
  isLoading: false
})

export const useUserListingsStore = create<UserListingsState>((set, get) => ({
  // Initial state
  statusData: {},
  listingStats: {},
  isLoading: false,
  error: null,
  statusFilter: 'all',
  statusCounts: {
    all: 0,
    approved: 0,
    pending: 0,
    paused: 0,
    rejected: 0
  },
  
  // Status data actions
  setStatusData: (status, data) => {
    console.log(`📊 Setting status data for ${status}:`, data.listings.length, 'listings')
    set((state) => ({
      statusData: {
        ...state.statusData,
        [status]: data
      },
      error: null
    }))
  },
  
  updateStatusListings: (status, listings) => {
    console.log(`🔄 Updating listings for ${status}:`, listings.length, 'listings')
    set((state) => ({
      statusData: {
        ...state.statusData,
        [status]: {
          ...state.statusData[status] || createEmptyStatusData(),
          listings,
          lastFetched: Date.now()
        }
      },
      error: null
    }))
  },
  
  setStatusPagination: (status, pagination) => {
    console.log(`📄 Setting pagination for ${status}:`, pagination)
    set((state) => ({
      statusData: {
        ...state.statusData,
        [status]: {
          ...state.statusData[status] || createEmptyStatusData(),
          pagination
        }
      }
    }))
  },
  
  setStatusLoading: (status, loading) => {
    set((state) => ({
      statusData: {
        ...state.statusData,
        [status]: {
          ...state.statusData[status] || createEmptyStatusData(),
          isLoading: loading
        }
      }
    }))
  },
  
  // Individual listing actions - update across all relevant status caches
  addUserListing: (listing) => {
    console.log('➕ Adding user listing to store:', listing.id)
    set((state) => {
      const newStatusData = { ...state.statusData }
      
      // Add to 'all' status
      if (newStatusData.all) {
        newStatusData.all = {
          ...newStatusData.all,
          listings: [listing, ...newStatusData.all.listings]
        }
      }
      
      // Add to specific status
      if (newStatusData[listing.status]) {
        newStatusData[listing.status] = {
          ...newStatusData[listing.status],
          listings: [listing, ...newStatusData[listing.status].listings]
        }
      }
      
      return {
        statusData: newStatusData,
        error: null
      }
    })
  },
  
  updateUserListing: (updatedListing) => {
    console.log('📝 Updating user listing in store:', updatedListing.id)
    set((state) => {
      const newStatusData = { ...state.statusData }
      
      // Update in all status caches where this listing exists
      Object.keys(newStatusData).forEach((status) => {
        const statusDataEntry = newStatusData[status]
        const listingIndex = statusDataEntry.listings.findIndex(l => l.id === updatedListing.id)
        
        if (listingIndex !== -1) {
          // If status changed, remove from current status and clear cache for old status
          if (status !== 'all' && status !== updatedListing.status) {
            newStatusData[status] = {
              ...statusDataEntry,
              listings: statusDataEntry.listings.filter(l => l.id !== updatedListing.id)
            }
          } else {
            // Update the listing in place
            const newListings = [...statusDataEntry.listings]
            newListings[listingIndex] = updatedListing
            newStatusData[status] = {
              ...statusDataEntry,
              listings: newListings
            }
          }
        }
      })
      
      return {
        statusData: newStatusData,
        error: null
      }
    })
  },
  
  removeUserListing: (listingId) => {
    console.log('🗑️ Removing user listing from store:', listingId)
    set((state) => {
      const newStatusData = { ...state.statusData }
      
      // Remove from all status caches
      Object.keys(newStatusData).forEach((status) => {
        newStatusData[status] = {
          ...newStatusData[status],
          listings: newStatusData[status].listings.filter(l => l.id !== listingId)
        }
      })
      
      return {
        statusData: newStatusData,
        error: null
      }
    })
  },
  
  // Statistics
  setListingStats: (stats) => {
    console.log('📊 Setting listing stats in store:', Object.keys(stats).length, 'properties')
    set({ listingStats: stats })
  },
  
  updateListingStats: (listingId, stats) => {
    console.log('📈 Updating listing stats for:', listingId)
    set((state) => ({
      listingStats: {
        ...state.listingStats,
        [listingId]: stats
      }
    }))
  },
  
  // Loading and error state
  setLoading: (loading) => {
    set({ isLoading: loading })
  },
  
  setError: (error) => {
    console.log('❌ Setting user listings store error:', error)
    set({ error, isLoading: false })
  },
  
  clearError: () => {
    set({ error: null })
  },
  
  // Status counts
  setStatusCounts: (counts) => {
    console.log('🔢 Setting status counts:', counts)
    set({ statusCounts: counts })
  },
  
  // Filters
  setStatusFilter: (status) => {
    console.log('🔧 Setting status filter:', status)
    set({ statusFilter: status })
  },
  
  // Utilities
  getListingById: (id) => {
    const { statusData } = get()
    
    // Search in all status data
    for (const status in statusData) {
      const listing = statusData[status].listings.find(l => l.id === id)
      if (listing) return listing
    }
    
    return undefined
  },
  
  getCurrentListings: () => {
    const { statusData, statusFilter } = get()
    return statusData[statusFilter]?.listings || []
  },
  
  getCurrentPagination: () => {
    const { statusData, statusFilter } = get()
    return statusData[statusFilter]?.pagination
  },
  
  getListingStats: (id) => {
    const { listingStats } = get()
    return listingStats[id]
  },
  
  getTotalStats: () => {
    const { listingStats } = get()
    const stats = Object.values(listingStats)
    
    return {
      totalRevenue: stats.reduce((sum, stat) => sum + stat.revenue, 0),
      totalBookings: stats.reduce((sum, stat) => sum + stat.bookings, 0),
      totalViews: stats.reduce((sum, stat) => sum + stat.views, 0),
      avgRating: stats.length > 0 
        ? stats.reduce((sum, stat) => sum + stat.rating, 0) / stats.length 
        : 0
    }
  },
  
  // Check if we should fetch data for a status/page combination
  shouldFetchStatus: (status, page) => {
    const { statusData } = get()
    const data = statusData[status]
    
    if (!data) return true // No data at all
    if (data.isLoading) return false // Already loading
    if (data.pagination.currentPage !== page) return true // Different page
    
    // Check if data is stale (older than the configured TTL)
    const ttlAgo = Date.now() - CACHE_TTL_MS
    if (data.lastFetched < ttlAgo) return true
    
    return false
  },
  
  clearStatus: (status) => {
    console.log(`🧹 Clearing status data for: ${status}`)
    set((state) => {
      const newStatusData = { ...state.statusData }
      delete newStatusData[status]
      return { statusData: newStatusData }
    })
  },
  
  clearAll: () => {
    console.log('🧹 Clearing all user listings store data')
    set({
      statusData: {},
      listingStats: {},
      isLoading: false,
      error: null,
      statusFilter: 'all',
      statusCounts: {
        all: 0,
        approved: 0,
        pending: 0,
        paused: 0,
        rejected: 0
      }
    })
  }
}))

// Selector hooks for better performance
export const useUserListingById = (id: string) => 
  useUserListingsStore((state) => state.getListingById(id))

export const useCurrentUserListings = () => 
  useUserListingsStore((state) => state.getCurrentListings())

export const useCurrentPagination = () => 
  useUserListingsStore((state) => state.getCurrentPagination())

export const useUserListingStats = (id: string) => 
  useUserListingsStore((state) => state.getListingStats(id))

export const useTotalUserStats = () => 
  useUserListingsStore((state) => state.getTotalStats())

export const useStatusCounts = () => 
  useUserListingsStore((state) => state.statusCounts) 