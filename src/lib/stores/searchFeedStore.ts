import { create } from 'zustand'
import { Property } from '../../interfaces'

interface SearchFilters {
  // Location filters
  search_city?: string
  search_country?: string
  search_lat?: number
  search_lng?: number
  search_radius_km?: number
  
  // Date filters
  check_in?: string // YYYY-MM-DD format
  check_out?: string // YYYY-MM-DD format
  
  // Capacity filters
  guest_count?: number
  min_bedrooms?: number
  min_bathrooms?: number
  
  // Price filters
  price_min?: number
  price_max?: number
  
  // Property filters
  property_types?: string[]
  required_amenities?: string[]
  min_rating?: number
}

interface SortOption {
  value: string
  label: string
}

interface SearchFeedState {
  // Search query state
  searchQuery: string
  filters: SearchFilters
  sortBy: string
  
  // Results state
  properties: Property[]
  isLoading: boolean
  error: string | null
  
  // Pagination state
  currentPage: number
  hasNextPage: boolean
  totalCount: number
  totalPages: number
  
  // Infinite scroll state
  isLoadingMore: boolean
  
  // UI state
  isFiltersModalOpen: boolean
  activeFiltersCount: number
  
  // Search history
  recentSearches: SearchFilters[]

  // Actions for search query
  setSearchQuery: (query: string) => void
  
  // Actions for filters
  setFilters: (filters: SearchFilters) => void
  updateFilter: (key: keyof SearchFilters, value: any) => void
  clearFilters: () => void
  resetFilters: () => void
  
  // Actions for sorting
  setSortBy: (sortBy: string) => void
  
  // Actions for results
  setProperties: (properties: Property[]) => void
  appendProperties: (properties: Property[]) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Actions for pagination
  setCurrentPage: (page: number) => void
  setHasNextPage: (hasNext: boolean) => void
  setTotalCount: (count: number) => void
  setTotalPages: (pages: number) => void
  
  // Actions for infinite scroll
  setIsLoadingMore: (loading: boolean) => void
  
  // Actions for UI state
  setIsFiltersModalOpen: (open: boolean) => void
  updateActiveFiltersCount: () => void
  
  // Actions for search history
  addToSearchHistory: (search: SearchFilters) => void
  clearSearchHistory: () => void
  
  // Utility actions
  resetSearch: () => void
  clearAll: () => void
  
  // Property interactions
  updatePropertyLike: (propertyId: string, isLiked: boolean) => void
  incrementPropertyViews: (propertyId: string) => void
}

// Default filters
const defaultFilters: SearchFilters = {
  guest_count: 1,
  min_bedrooms: 0,
  min_bathrooms: 0,
  search_radius_km: 50
}

export const useSearchFeedStore = create<SearchFeedState>((set, get) => ({
  // Initial state - Search query
  searchQuery: '',
  filters: { ...defaultFilters },
  sortBy: 'relevance',
  
  // Initial state - Results
  properties: [],
  isLoading: false,
  error: null,
  
  // Initial state - Pagination
  currentPage: 1,
  hasNextPage: true,
  totalCount: 0,
  totalPages: 0,
  
  // Initial state - Infinite scroll
  isLoadingMore: false,
  
  // Initial state - UI
  isFiltersModalOpen: false,
  activeFiltersCount: 0,
  
  // Initial state - Search history
  recentSearches: [],

  // Search query actions
  setSearchQuery: (query) => {
    console.log('🔍 Setting search query:', query)
    set({ searchQuery: query })
  },

  // Filter actions
  setFilters: (filters) => {
    console.log('🎛️ Setting filters:', filters)
    const state = get()
    const newFilters = { ...state.filters, ...filters }
    set({ 
      filters: newFilters,
      currentPage: 1 // Reset pagination when filters change
    })
    // Update active filters count
    state.updateActiveFiltersCount()
  },
  
  updateFilter: (key, value) => {
    console.log('🔧 Updating filter:', key, value)
    const { filters } = get()
    const newFilters = { ...filters, [key]: value }
    set({ 
      filters: newFilters,
      currentPage: 1 // Reset pagination when filters change
    })
    // Update active filters count
    get().updateActiveFiltersCount()
  },
  
  clearFilters: () => {
    console.log('🧹 Clearing all filters')
    set({ 
      filters: { ...defaultFilters },
      currentPage: 1
    })
    get().updateActiveFiltersCount()
  },
  
  resetFilters: () => {
    console.log('🔄 Resetting filters to default')
    set({ 
      filters: { ...defaultFilters },
      currentPage: 1
    })
    get().updateActiveFiltersCount()
  },

  // Sorting actions
  setSortBy: (sortBy) => {
    console.log('📊 Setting sort by:', sortBy)
    set({ 
      sortBy,
      currentPage: 1 // Reset pagination when sorting changes
    })
  },

  // Results actions
  setProperties: (properties) => {
    console.log('🏠 Setting search properties:', properties.length)
    set({ 
      properties,
      currentPage: 1,
      error: null
    })
  },
  
  appendProperties: (newProperties) => {
    const { properties } = get()
    console.log('➕ Appending search properties:', newProperties.length, 'to existing', properties.length)
    
    // Filter out duplicates by ID
    const existingIds = new Set(properties.map(p => p.id))
    const uniqueNewProperties = newProperties.filter(p => !existingIds.has(p.id))
    
    set({ 
      properties: [...properties, ...uniqueNewProperties],
      error: null
    })
  },
  
  setIsLoading: (loading) => {
    console.log('🔄 Search loading:', loading)
    set({ isLoading: loading })
  },
  
  setError: (error) => {
    console.log('❌ Search error:', error)
    set({ error })
  },
  
  clearError: () => set({ error: null }),

  // Pagination actions
  setCurrentPage: (page) => {
    console.log('📄 Setting search page:', page)
    set({ currentPage: page })
  },
  
  setHasNextPage: (hasNext) => {
    console.log('➡️ Search has next page:', hasNext)
    set({ hasNextPage: hasNext })
  },
  
  setTotalCount: (count) => {
    console.log('🔢 Search total count:', count)
    set({ totalCount: count })
  },
  
  setTotalPages: (pages) => {
    console.log('📚 Search total pages:', pages)
    set({ totalPages: pages })
  },

  // Infinite scroll actions
  setIsLoadingMore: (loading) => {
    console.log('♾️ Search loading more:', loading)
    set({ isLoadingMore: loading })
  },

  // UI actions
  setIsFiltersModalOpen: (open) => {
    console.log('🎛️ Filters modal open:', open)
    set({ isFiltersModalOpen: open })
  },
  
  updateActiveFiltersCount: () => {
    const { filters } = get()
    let count = 0
    
    // Count applied filters (excluding defaults)
    if (filters.search_city || filters.search_country) count++
    if (filters.check_in && filters.check_out) count++
    if (filters.guest_count && filters.guest_count > 1) count++
    if (filters.min_bedrooms && filters.min_bedrooms > 0) count++
    if (filters.min_bathrooms && filters.min_bathrooms > 0) count++
    if (filters.price_min !== undefined || filters.price_max !== undefined) count++
    if (filters.property_types && filters.property_types.length > 0) count++
    if (filters.required_amenities && filters.required_amenities.length > 0) count++
    if (filters.min_rating && filters.min_rating > 0) count++
    
    console.log('🏷️ Active filters count:', count)
    set({ activeFiltersCount: count })
  },

  // Search history actions
  addToSearchHistory: (search) => {
    const { recentSearches } = get()
    console.log('📝 Adding to search history')
    
    // Remove duplicates and limit to 10 recent searches
    const filteredHistory = recentSearches.filter(
      (item) => JSON.stringify(item) !== JSON.stringify(search)
    )
    
    const newHistory = [search, ...filteredHistory].slice(0, 10)
    set({ recentSearches: newHistory })
  },
  
  clearSearchHistory: () => {
    console.log('🗑️ Clearing search history')
    set({ recentSearches: [] })
  },

  // Utility actions
  resetSearch: () => {
    console.log('🔄 Resetting search')
    set({
      searchQuery: '',
      filters: { ...defaultFilters },
      sortBy: 'relevance',
      properties: [],
      currentPage: 1,
      hasNextPage: true,
      totalCount: 0,
      totalPages: 0,
      error: null,
      isLoadingMore: false,
      activeFiltersCount: 0
    })
  },
  
  clearAll: () => {
    console.log('🧹 Clearing all search data')
    set({
      searchQuery: '',
      filters: { ...defaultFilters },
      sortBy: 'relevance',
      properties: [],
      isLoading: false,
      error: null,
      currentPage: 1,
      hasNextPage: true,
      totalCount: 0,
      totalPages: 0,
      isLoadingMore: false,
      isFiltersModalOpen: false,
      activeFiltersCount: 0,
      recentSearches: []
    })
  },

  // Property interaction actions
  updatePropertyLike: (propertyId, isLiked) => {
    const { properties } = get()
    console.log('❤️ Updating search property like:', propertyId, isLiked)
    
    const updatedProperties = properties.map(property =>
      property.id === propertyId 
        ? { ...property, is_liked: isLiked }
        : property
    )
    
    set({ properties: updatedProperties })
  },
  
  incrementPropertyViews: (propertyId) => {
    const { properties } = get()
    console.log('👁️ Incrementing search property views:', propertyId)
    
    const updatedProperties = properties.map(property =>
      property.id === propertyId 
        ? { ...property, view_count: property.view_count + 1 }
        : property
    )
    
    set({ properties: updatedProperties })
  }
}))

// Note: Selector hooks removed to prevent infinite loop issues
// Access state directly through useSearchFeedStore() instead

// Available sort options
export const sortOptions: SortOption[] = [
  { value: 'relevance', label: 'Best Match' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest First' }
] 