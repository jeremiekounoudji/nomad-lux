import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useSearchFeedStore } from '../lib/stores/searchFeedStore'
import { useAuthStore } from '../lib/stores/authStore'
import { Property } from '../interfaces'
import toast from 'react-hot-toast'

export const sortOptions = [
  { value: 'relevance', label: 'Relevance (Default)' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating_desc', label: 'Rating: High to Low' },
  { value: 'newest', label: 'Newest First' }
]

interface SearchFilters {
  search_city?: string
  search_country?: string
  search_lat?: number
  search_lng?: number
  search_radius_km?: number
  check_in?: string
  check_out?: string
  guest_count?: number
  min_bedrooms?: number
  min_bathrooms?: number
  price_min?: number
  price_max?: number
  property_types?: string[]
  required_amenities?: string[]
  min_rating?: number
}

interface SearchFeedResponse {
  data: Property[]
  pagination: {
    current_page: number
    page_size: number
    total_count: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
  filters_applied: SearchFilters
  sort_by: string
}

export const useSearchFeed = () => {
  // Store selectors with stable references
  const {
    // State
    searchQuery,
    filters,
    sortBy,
    properties,
    isLoading,
    error,
    currentPage,
    hasNextPage,
    totalCount,
    // totalPages, // Unused value
    isLoadingMore,
    isFiltersModalOpen,
    activeFiltersCount,
    recentSearches,
    
    // Actions
    // setSearchQuery, // Unused function
    setFilters,
    // updateFilter, // Unused function
    clearFilters,
    resetFilters,
    setSortBy,
    setProperties,
    appendProperties,
    setIsLoading,
    setError,
    clearError,
    setCurrentPage,
    setHasNextPage,
    setTotalCount,
    setTotalPages,
    setIsLoadingMore,
    setIsFiltersModalOpen,
    updateActiveFiltersCount,
    // addToSearchHistory, // Unused function
    // clearSearchHistory, // Unused function
    resetSearch,
    clearAll,
    updatePropertyLike,
    incrementPropertyViews
  } = useSearchFeedStore()
  
  // Auth store
  const { isAuthenticated, user } = useAuthStore()

  console.log('🔍 useSearchFeed hook initialized', { 
    isAuthenticated, 
    userEmail: user?.email,
    searchQuery,
    activeFiltersCount,
    propertiesCount: properties.length,
    currentPage,
    hasNextPage,
    sortBy
  })

  // Perform search with current filters (no text search)
  const performSearch = useCallback(async (
    page: number = 1, 
    append: boolean = false,
    customFilters?: SearchFilters
  ) => {
    const searchFilters = customFilters || filters
    console.log(`🔍 Loading properties - page: ${page}, append: ${append}`, {
      filters: searchFilters,
      sortBy
    })
    
    if (append) {
      setIsLoadingMore(true)
    } else {
      setIsLoading(true)
      clearError()
    }

    try {
      const { data, error } = await supabase.rpc('get_feed_and_filter_properties', {
        search_city: searchFilters.search_city || null,
        search_country: searchFilters.search_country || null,
        search_lat: searchFilters.search_lat || null,
        search_lng: searchFilters.search_lng || null,
        search_radius_km: searchFilters.search_radius_km || 50,
        check_in: searchFilters.check_in ? new Date(searchFilters.check_in).toISOString().split('T')[0] : null,
        check_out: searchFilters.check_out ? new Date(searchFilters.check_out).toISOString().split('T')[0] : null,
        guest_count: searchFilters.guest_count || 1,
        min_bedrooms: searchFilters.min_bedrooms || 0,
        min_bathrooms: searchFilters.min_bathrooms || 0,
        price_min: searchFilters.price_min || null,
        price_max: searchFilters.price_max || null,
        property_types: searchFilters.property_types || null,
        required_amenities: searchFilters.required_amenities || null,
        min_rating: searchFilters.min_rating || null,
        sort_by: sortBy,
        page_num: page,
        page_size: 20,
        user_id: user?.id || null
      })

      if (error) {
        console.error('❌ Error loading properties:', error)
        throw new Error(`Failed to load properties: ${error.message}`)
      }

      const response: SearchFeedResponse = data
      console.log('✅ Properties loaded:', {
        count: response.data?.length || 0,
        totalCount: response.pagination?.total_count || 0,
        currentPage: response.pagination?.current_page || 1,
        hasNext: response.pagination?.has_next || false,
        filtersApplied: response.filters_applied
      })

      // Transform properties to match interface
      const transformedProperties: Property[] = (response.data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        price_per_night: item.price || 0,
        currency: item.currency,
        location: item.location,
        images: item.images || [],
        videos: item.videos || [],
        host: {
          id: item.host?.id || '',
          name: item.host?.name || '',
          username: item.host?.username || '',
          avatar_url: item.host?.avatar_url || '',
          display_name: item.host?.display_name || '',
          is_identity_verified: item.host?.is_identity_verified || false,
          is_email_verified: item.host?.is_email_verified || false,
          email: item.host?.email || '',
          phone: item.host?.phone || '',
          rating: item.host?.rating || 0,
          response_rate: item.host?.response_rate || 0,
          response_time: item.host?.response_time || 'Unknown',
          bio: item.host?.bio || ''
        },
        rating: item.rating || 0,
        review_count: item.review_count || 0,
        view_count: item.view_count || 0,
        booking_count: item.booking_count || 0,
        total_revenue: item.total_revenue || 0,
        property_type: item.property_type || '',
        amenities: item.amenities || [],
        max_guests: item.max_guests || 1,
        bedrooms: item.bedrooms || 0,
        bathrooms: item.bathrooms || 0,
        cleaning_fee: item.cleaning_fee || 0,
        service_fee: item.service_fee || 0,
        is_liked: item.is_liked || false,
        instant_book: item.instant_book || false,
        additional_fees: [],
        distance: item.distance || '',
        created_at: item.created_at || new Date().toISOString(),
        status: item.status || 'pending',
        like_count: item.like_count || 0,
        unavailable_dates: item.unavailable_dates || [],
        timezone: item.timezone || 'UTC'
      }))

      // Update store
      if (append) {
        appendProperties(transformedProperties)
      } else {
        setProperties(transformedProperties)
      }

      // Update pagination
      if (response.pagination) {
        setCurrentPage(response.pagination.current_page)
        setHasNextPage(response.pagination.has_next)
        setTotalCount(response.pagination.total_count)
        setTotalPages(response.pagination.total_pages)
      }

      // Note: No search history since we're using filters only

    } catch (error: any) {
      console.error('❌ Failed to load properties:', error)
      setError(error.message)
      if (!append) {
        toast.error('Failed to load properties. Please try again.')
      }
    } finally {
      if (append) {
        setIsLoadingMore(false)
      } else {
        setIsLoading(false)
      }
    }
  }, [
    filters, sortBy, user?.id, setIsLoading, setIsLoadingMore, 
    clearError, setError, setProperties, appendProperties, setCurrentPage, 
    setHasNextPage, setTotalCount, setTotalPages
  ])

  // Apply filters and search
  const applyFilters = useCallback(async (newFilters: Partial<SearchFilters>) => {
    console.log('🎛️ Applying filters:', newFilters)
    setFilters(newFilters)
    updateActiveFiltersCount()
    await performSearch(1, false, { ...filters, ...newFilters })
  }, [filters, setFilters, updateActiveFiltersCount, performSearch])

  // Property interaction handlers
  const handleLikeProperty = useCallback(async (propertyId: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save properties')
      return
    }

    console.log('❤️ Toggling search property like:', propertyId)
    
    // Find current property
    const property = properties.find(p => p.id === propertyId)
    if (!property) return

    const newLikedState = !property.is_liked
    
    // Optimistic update
    updatePropertyLike(propertyId, newLikedState)
    
    try {
      // TODO: Implement save/unsave property API call
      console.log('💾 Would save/unsave property:', propertyId, newLikedState)
      
      // Show feedback
      if (newLikedState) {
        toast.success('Property saved to your favorites')
      } else {
        toast.success('Property removed from favorites')
      }
      
    } catch (error: any) {
      console.error('❌ Failed to update property like:', error)
      // Revert optimistic update
      updatePropertyLike(propertyId, !newLikedState)
      toast.error('Failed to update favorites')
    }
  }, [isAuthenticated, properties, updatePropertyLike])

  return {
    // Search results (using properties as searchResults for compatibility)
    searchResults: properties,
    searchLoading: isLoading,
    searchError: error,
    
    // Filters
    filters,
    activeFilters: filters,
    activeFiltersCount,
    applyFilters,
    clearFilters,
    resetFilters,
    clearAllFilters: clearFilters,
    
    // Sorting
    sortBy,
    setSortBy,
    
    // Results state
    properties,
    isLoading,
    error,
    isLoadingMore,
    hasNextPage,
    totalCount,
    totalResults: totalCount,
    
    // Search history and suggestions
    searchHistory: recentSearches,
    searchSuggestions: [], // TODO: Implement search suggestions
    
    // UI
    isFiltersModalOpen,
    setIsFiltersModalOpen,
    setFilterModalOpen: setIsFiltersModalOpen,
    
    // Actions
    performSearch,
    loadMoreResults: () => performSearch(currentPage + 1, true),
    clearSearch: resetSearch,
    resetSearch,
    clearAll,
    
    // Property interactions
    handleLikeProperty,
    handlePropertyView: (propertyId: string) => incrementPropertyViews(propertyId),
    
    // Search suggestions (placeholder)
    getSearchSuggestions: (query: string) => {
      console.log('🔍 Getting search suggestions for:', query)
      // TODO: Implement search suggestions
    }
  }
} 