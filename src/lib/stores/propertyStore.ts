import { create } from 'zustand'
import { Property } from '../../interfaces'
// Removed direct Supabase and toast usage; database calls moved to hooks

interface PropertyState {
  // State
  properties: Property[]
  selectedProperty: Property | null
  isLoading: boolean
  error: string | null
  
  // Search/Filter state
  searchTerm: string
  filters: {
    priceRange?: { min: number; max: number }
    location?: { lat: number; lng: number; radius: number }
    amenities?: string[]
    propertyType?: string
    maxGuests?: number
    bedrooms?: number
    bathrooms?: number
  }
  
  // Pagination
  currentPage: number
  totalPages: number
  totalCount: number
  
  // Actions
  setProperties: (properties: Property[]) => void
  addProperty: (property: Property) => void
  updateProperty: (property: Property) => void
  removeProperty: (propertyId: string) => void
  setSelectedProperty: (property: Property | null) => void
  
  // Loading and error state
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Search and filters
  setSearchTerm: (term: string) => void
  setFilters: (filters: PropertyState['filters']) => void
  clearFilters: () => void
  
  // Pagination
  setCurrentPage: (page: number) => void
  setPagination: (currentPage: number, totalPages: number, totalCount: number) => void
  
  // Utilities
  getPropertyById: (id: string) => Property | undefined
  getPropertiesByHost: (hostId: string) => Property[]
  clearAll: () => void
  
  likedPropertyIds: string[]
  likedProperties: Property[]
  isLikeLoading: boolean
  
  // Pure setters for liked state
  setLikedPropertyIds: (ids: string[]) => void
  setLikedProperties: (props: Property[]) => void
  setIsLikeLoading: (loading: boolean) => void
  
  // Removed async logic: these placeholders will be handled in hooks
  toggleLike: () => Promise<void>
  fetchLikedProperties: () => Promise<void>
  clearLikedProperties: () => void
  isPropertyLiked: (propertyId: string) => boolean
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  // Initial state
  properties: [],
  selectedProperty: null,
  isLoading: false,
  error: null,
  
  // Search/Filter initial state
  searchTerm: '',
  filters: {},
  
  // Pagination initial state
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  
  likedPropertyIds: [],
  likedProperties: [],
  isLikeLoading: false,

  // Core synchronous actions (pure)
  setProperties: (properties) => set({ properties }),
  addProperty: (property) => set((state) => ({ properties: [property, ...state.properties] })),
  updateProperty: (updatedProperty) => set((state) => ({
    properties: state.properties.map((p) => (p.id === updatedProperty.id ? updatedProperty : p)),
    selectedProperty: state.selectedProperty?.id === updatedProperty.id ? updatedProperty : state.selectedProperty,
  })),
  removeProperty: (propertyId) => set((state) => ({
    properties: state.properties.filter((p) => p.id !== propertyId),
    selectedProperty: state.selectedProperty?.id === propertyId ? null : state.selectedProperty,
  })),
  setSelectedProperty: (property) => set({ selectedProperty: property }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {}, searchTerm: '' }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setPagination: (currentPage, totalPages, totalCount) => set({ currentPage, totalPages, totalCount }),
  getPropertyById: (id) => get().properties.find((p) => p.id === id),
  getPropertiesByHost: (hostId) => get().properties.filter((p) => p.host.id === hostId),
  clearAll: () => set({
    properties: [],
    selectedProperty: null,
    isLoading: false,
    error: null,
    searchTerm: '',
    filters: {},
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    likedPropertyIds: [],
    likedProperties: [],
  }),

  // Pure setters for liked state
  setLikedPropertyIds: (ids: string[]) => set({ likedPropertyIds: ids }),
  setLikedProperties: (props: Property[]) => set({ likedProperties: props }),
  setIsLikeLoading: (loading: boolean) => set({ isLikeLoading: loading }),

  // Removed async logic: these placeholders will be handled in hooks
  toggleLike: async () => {
    console.error('toggleLike should be handled in usePropertyLike hook');
  },
  fetchLikedProperties: async () => {
    console.error('fetchLikedProperties should be handled in usePropertyLike hook');
  },

  clearLikedProperties: () => {
    set({ likedPropertyIds: [], likedProperties: [] })
  },

  isPropertyLiked: (propertyId: string) => {
    const { likedPropertyIds } = get()
    return likedPropertyIds.includes(propertyId)
  }
}))

// Selector hooks for better performance
export const usePropertyById = (id: string) => 
  usePropertyStore((state) => state.getPropertyById(id))

export const usePropertiesByHost = (hostId: string) => 
  usePropertyStore((state) => state.getPropertiesByHost(hostId))

export const usePropertySearch = () => 
  usePropertyStore((state) => ({
    searchTerm: state.searchTerm,
    filters: state.filters,
    setSearchTerm: state.setSearchTerm,
    setFilters: state.setFilters,
    clearFilters: state.clearFilters
  }))

export const usePropertyPagination = () => 
  usePropertyStore((state) => ({
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    totalCount: state.totalCount,
    setCurrentPage: state.setCurrentPage,
    setPagination: state.setPagination
  })) 