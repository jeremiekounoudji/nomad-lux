import { create } from 'zustand'
import { Property } from '../../interfaces'

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
  
  // Actions
  setProperties: (properties) => {
    console.log('🏠 Setting properties in store:', properties.length, 'properties')
    set({ properties, error: null })
  },
  
  addProperty: (property) => {
    console.log('➕ Adding property to store:', property.id)
    set((state) => ({
      properties: [property, ...state.properties],
      error: null
    }))
  },
  
  updateProperty: (updatedProperty) => {
    console.log('📝 Updating property in store:', updatedProperty.id)
    set((state) => ({
      properties: state.properties.map((property) =>
        property.id === updatedProperty.id ? updatedProperty : property
      ),
      selectedProperty: state.selectedProperty?.id === updatedProperty.id 
        ? updatedProperty 
        : state.selectedProperty,
      error: null
    }))
  },
  
  removeProperty: (propertyId) => {
    console.log('🗑️ Removing property from store:', propertyId)
    set((state) => ({
      properties: state.properties.filter((property) => property.id !== propertyId),
      selectedProperty: state.selectedProperty?.id === propertyId 
        ? null 
        : state.selectedProperty,
      error: null
    }))
  },
  
  setSelectedProperty: (property) => {
    console.log('🎯 Setting selected property:', property?.id || 'null')
    set({ selectedProperty: property })
  },
  
  // Loading and error state
  setLoading: (loading) => {
    set({ isLoading: loading })
  },
  
  setError: (error) => {
    console.log('❌ Setting property store error:', error)
    set({ error, isLoading: false })
  },
  
  clearError: () => {
    set({ error: null })
  },
  
  // Search and filters
  setSearchTerm: (term) => {
    console.log('🔍 Setting search term:', term)
    set({ searchTerm: term })
  },
  
  setFilters: (filters) => {
    console.log('🔧 Setting property filters:', filters)
    set({ filters })
  },
  
  clearFilters: () => {
    console.log('🧹 Clearing property filters')
    set({ 
      filters: {},
      searchTerm: '',
      currentPage: 1
    })
  },
  
  // Pagination
  setCurrentPage: (page) => {
    console.log('📄 Setting current page:', page)
    set({ currentPage: page })
  },
  
  setPagination: (currentPage, totalPages, totalCount) => {
    console.log('📊 Setting pagination:', { currentPage, totalPages, totalCount })
    set({ currentPage, totalPages, totalCount })
  },
  
  // Utilities
  getPropertyById: (id) => {
    const { properties } = get()
    return properties.find((property) => property.id === id)
  },
  
  getPropertiesByHost: (hostId) => {
    const { properties } = get()
    return properties.filter((property) => property.host.id === hostId)
  },
  
  clearAll: () => {
    console.log('🧹 Clearing all property store data')
    set({
      properties: [],
      selectedProperty: null,
      isLoading: false,
      error: null,
      searchTerm: '',
      filters: {},
      currentPage: 1,
      totalPages: 1,
      totalCount: 0
    })
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