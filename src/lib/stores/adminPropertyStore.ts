import { create } from 'zustand'
import { DatabaseProperty, ListingStats, PropertyStatus } from '../../interfaces'
import { CACHE_TTL_MS } from '../cacheConfig'

interface StatusData {
  properties: DatabaseProperty[]
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

interface AdminPropertyState {
  // State - data organized by status
  statusData: {
    [key: string]: StatusData
  }
  
  // Global state
  propertyStats: Record<string, ListingStats>
  isLoading: boolean
  error: string | null
  
  // Current filter
  statusFilter: PropertyStatus | 'all'
  
  // Real-time status counts from database
  statusCounts: {
    all: number
    pending: number
    approved: number
    rejected: number
    suspended: number
  }
  
  // Actions
  setStatusData: (status: string, data: StatusData) => void
  updateStatusProperties: (status: string, properties: DatabaseProperty[]) => void
  setStatusPagination: (status: string, pagination: StatusData['pagination']) => void
  setStatusLoading: (status: string, loading: boolean) => void
  
  // Individual property actions
  addProperty: (property: DatabaseProperty) => void
  updateProperty: (property: DatabaseProperty) => void
  removeProperty: (propertyId: string) => void
  
  // Statistics
  setPropertyStats: (stats: Record<string, ListingStats>) => void
  updatePropertyStats: (propertyId: string, stats: ListingStats) => void
  
  // Global loading and error state
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Status counts from database
  setStatusCounts: (counts: { all: number; pending: number; approved: number; rejected: number; suspended: number }) => void
  
  // Filters
  setStatusFilter: (filter: PropertyStatus | 'all') => void
  
  // Utilities
  getPropertyById: (id: string) => DatabaseProperty | undefined
  getCurrentProperties: () => DatabaseProperty[]
  getCurrentPagination: () => StatusData['pagination'] | undefined
  getPropertyStats: (id: string) => ListingStats | undefined
  getTotalStats: () => {
    totalProperties: number
    pendingProperties: number
    approvedProperties: number
    rejectedProperties: number
  }
  shouldFetchStatus: (status: string, page: number) => boolean
  clearStatus: (status: string) => void
  clearAll: () => void
}

const createEmptyStatusData = (): StatusData => ({
  properties: [],
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  },
  lastFetched: 0,
  isLoading: false
})

export const useAdminPropertyStore = create<AdminPropertyState>((set, get) => ({
  // Initial state
  statusData: {},
  propertyStats: {},
  isLoading: false,
  error: null,
  statusFilter: 'pending',
  statusCounts: {
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0
  },
  
  // Status data actions
  setStatusData: (status, data) => {
    console.log(`📊 [Admin] Setting status data for ${status}:`, data.properties.length, 'properties')
    set((state) => ({
      statusData: {
        ...state.statusData,
        [status]: data
      },
      error: null
    }))
  },
  
  updateStatusProperties: (status, properties) => {
    console.log(`🔄 [Admin] Updating properties for ${status}:`, properties.length, 'properties')
    set((state) => ({
      statusData: {
        ...state.statusData,
        [status]: {
          ...state.statusData[status] || createEmptyStatusData(),
          properties,
          lastFetched: Date.now()
        }
      },
      error: null
    }))
  },
  
  setStatusPagination: (status, pagination) => {
    console.log(`📄 [Admin] Setting pagination for ${status}:`, pagination)
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
  
  // Individual property actions - update across all relevant status caches
  addProperty: (property) => {
    console.log('➕ [Admin] Adding property to store:', property.id)
    set((state) => {
      const newStatusData = { ...state.statusData }
      
      // Add to 'all' status
      if (newStatusData.all) {
        newStatusData.all = {
          ...newStatusData.all,
          properties: [property, ...newStatusData.all.properties]
        }
      }
      
      // Add to specific status
      if (newStatusData[property.status]) {
        newStatusData[property.status] = {
          ...newStatusData[property.status],
          properties: [property, ...newStatusData[property.status].properties]
        }
      }
      
      return {
        statusData: newStatusData,
        error: null
      }
    })
  },
  
  updateProperty: (updatedProperty) => {
    console.log('📝 [Admin] Updating property in store:', updatedProperty.id)
    set((state) => {
      const newStatusData = { ...state.statusData }
      
      // Update in all status caches where this property exists
      Object.keys(newStatusData).forEach((status) => {
        const statusDataEntry = newStatusData[status]
        if (statusDataEntry) {
          const propertyIndex = statusDataEntry.properties.findIndex(p => p.id === updatedProperty.id)
          if (propertyIndex !== -1) {
            const updatedProperties = [...statusDataEntry.properties]
            
            // If status changed, remove from this cache
            if (status !== 'all' && status !== updatedProperty.status) {
              updatedProperties.splice(propertyIndex, 1)
            } else {
              // Update the property
              updatedProperties[propertyIndex] = updatedProperty
            }
            
            newStatusData[status] = {
              ...statusDataEntry,
              properties: updatedProperties
            }
          }
        }
      })
      
      // Add to new status cache if property status changed
      const newStatus = updatedProperty.status
      if (newStatusData[newStatus]) {
        const existingProperty = newStatusData[newStatus].properties.find(p => p.id === updatedProperty.id)
        if (!existingProperty) {
          newStatusData[newStatus] = {
            ...newStatusData[newStatus],
            properties: [updatedProperty, ...newStatusData[newStatus].properties]
          }
        }
      }
      
      return {
        statusData: newStatusData,
        error: null
      }
    })
  },
  
  removeProperty: (propertyId) => {
    console.log('🗑️ [Admin] Removing property from store:', propertyId)
    set((state) => {
      const newStatusData = { ...state.statusData }
      
      // Remove from all status caches
      Object.keys(newStatusData).forEach((status) => {
        const statusDataEntry = newStatusData[status]
        if (statusDataEntry) {
          newStatusData[status] = {
            ...statusDataEntry,
            properties: statusDataEntry.properties.filter(p => p.id !== propertyId)
          }
        }
      })
      
      return {
        statusData: newStatusData,
        error: null
      }
    })
  },
  
  // Statistics
  setPropertyStats: (stats) => {
    console.log('📊 [Admin] Setting property stats:', Object.keys(stats).length, 'properties')
    set({ propertyStats: stats })
  },
  
  updatePropertyStats: (propertyId, stats) => {
    console.log('📊 [Admin] Updating stats for property:', propertyId)
    set((state) => ({
      propertyStats: {
        ...state.propertyStats,
        [propertyId]: stats
      }
    }))
  },
  
  // Global state
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  
  // Status counts
  setStatusCounts: (counts) => {
    console.log('📊 [Admin] Setting status counts:', counts)
    set({ statusCounts: counts })
  },
  
  // Filters
  setStatusFilter: (filter) => {
    console.log('🔍 [Admin] Setting status filter to:', filter)
    set({ statusFilter: filter })
  },
  
  // Utilities
  getPropertyById: (id) => {
    const state = get()
    for (const statusData of Object.values(state.statusData)) {
      const property = statusData.properties.find(p => p.id === id)
      if (property) return property
    }
    return undefined
  },
  
  getCurrentProperties: () => {
    const state = get()
    const currentStatus = state.statusFilter === 'all' ? 'all' : state.statusFilter
    return state.statusData[currentStatus]?.properties || []
  },
  
  getCurrentPagination: () => {
    const state = get()
    const currentStatus = state.statusFilter === 'all' ? 'all' : state.statusFilter
    return state.statusData[currentStatus]?.pagination
  },
  
  getPropertyStats: (id) => {
    const state = get()
    return state.propertyStats[id]
  },
  
  getTotalStats: () => {
    const state = get()
    return {
      totalProperties: state.statusCounts.all,
      pendingProperties: state.statusCounts.pending,
      approvedProperties: state.statusCounts.approved,
      rejectedProperties: state.statusCounts.rejected
    }
  },
  
  shouldFetchStatus: (status, page) => {
    const state = get()
    const statusData = state.statusData[status]
    
    if (!statusData) return true
    if (statusData.isLoading) return false
    if (statusData.pagination.currentPage !== page) return true
    
    // Fetch if data is older than the configured TTL
    const ttlAgo = Date.now() - CACHE_TTL_MS
    return statusData.lastFetched < ttlAgo
  },
  
  clearStatus: (status) => {
    console.log('🧹 [Admin] Clearing status data for:', status)
    set((state) => {
      const newStatusData = { ...state.statusData }
      delete newStatusData[status]
      return { statusData: newStatusData }
    })
  },
  
  clearAll: () => {
    console.log('🧹 [Admin] Clearing all data')
    set({
      statusData: {},
      propertyStats: {},
      isLoading: false,
      error: null,
      statusFilter: 'pending',
      statusCounts: {
        all: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        suspended: 0
      }
    })
  }
}))

// Selector hooks for easy access
export const useAdminPropertyById = (id: string) => 
  useAdminPropertyStore((state) => state.getPropertyById(id))

export const useCurrentAdminProperties = () => 
  useAdminPropertyStore((state) => state.getCurrentProperties())

export const useCurrentAdminPagination = () => 
  useAdminPropertyStore((state) => state.getCurrentPagination())

export const useAdminPropertyStats = (id: string) => 
  useAdminPropertyStore((state) => state.getPropertyStats(id))

export const useAdminTotalStats = () => 
  useAdminPropertyStore((state) => state.getTotalStats())

export const useAdminStatusCounts = () => 
  useAdminPropertyStore((state) => state.statusCounts) 