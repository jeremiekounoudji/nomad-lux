import { useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useHomeFeedStore } from '../lib/stores/homeFeedStore'
import { useAuthStore } from '../lib/stores/authStore'
import { Property } from '../interfaces'
import toast from 'react-hot-toast'

interface PopularPlace {
  id: string
  name: string
  country: string
  property_count: number
  average_price: number
  featured_image: string
  coordinates: {
    lat: number
    lng: number
  }
}

interface HomeFeedResponse {
  data: Property[]
  pagination: {
    current_page: number
    page_size: number
    total_count: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

export const useHomeFeed = () => {
  // Store selectors with stable references
  const {
    // State
    popularPlaces,
    popularPlacesLoading,
    popularPlacesError,
    properties,
    feedLoading,
    feedError,
    isLoadingMore,
    currentPage,
    hasNextPage,
    totalCount,
    userLocation,
    
    // Actions
    setPopularPlaces,
    setPopularPlacesLoading,
    setPopularPlacesError,
    setProperties,
    appendProperties,
    setFeedLoading,
    setFeedError,
    clearFeedError,
    setCurrentPage,
    setHasNextPage,
    setTotalCount,
    setIsLoadingMore,
    setUserLocation,
    resetFeed,
    updatePropertyLike,
    incrementPropertyViews
  } = useHomeFeedStore()
  
  // Auth store
  const { isAuthenticated, user } = useAuthStore()

  console.log('🏠 useHomeFeed hook initialized', { 
    isAuthenticated, 
    userEmail: user?.email,
    popularPlacesCount: popularPlaces.length,
    propertiesCount: properties.length,
    currentPage,
    hasNextPage
  })

  // Fetch popular places
  const fetchPopularPlaces = useCallback(async () => {
    console.log('🌟 Fetching popular places...')
    setPopularPlacesLoading(true)
    setPopularPlacesError(null)

    try {
      const { data, error } = await supabase.rpc('get_popular_places', {
        limit_count: 6
      })

      if (error) {
        console.error('❌ Error fetching popular places:', error)
        throw new Error(`Failed to fetch popular places: ${error.message}`)
      }

      console.log('✅ Popular places fetched successfully:', data?.length || 0)
      setPopularPlaces(data || [])
      
    } catch (error: any) {
      console.error('❌ Popular places fetch failed:', error)
      setPopularPlacesError(error.message)
      toast.error('Failed to load popular destinations')
    } finally {
      setPopularPlacesLoading(false)
    }
  }, [setPopularPlaces, setPopularPlacesLoading, setPopularPlacesError])

  // Fetch properties feed
  const fetchPropertiesFeed = useCallback(async (
    page: number = 1, 
    append: boolean = false
  ) => {
    console.log(`🏡 Fetching properties feed - page: ${page}, append: ${append}`)
    
    if (append) {
      setIsLoadingMore(true)
    } else {
      setFeedLoading(true)
      clearFeedError()
    }

    try {
      const { data, error } = await supabase.rpc('get_feed_and_filter_properties', {
        search_city: null,
        search_country: null,
        search_lat: userLocation?.lat || null,
        search_lng: userLocation?.lng || null,
        search_radius_km: 50,
        check_in: null,
        check_out: null,
        guest_count: 1,
        min_bedrooms: 0,
        min_bathrooms: 0,
        price_min: null,
        price_max: null,
        property_types: null,
        required_amenities: null,
        min_rating: null,
        sort_by: 'relevance',
        page_num: page,
        page_size: 20,
        user_id: user?.id || null
      })

      if (error) {
        console.error('❌ Error fetching properties feed:', error)
        throw new Error(`Failed to fetch properties: ${error.message}`)
      }

      const response: HomeFeedResponse = data
      console.log('✅ Properties feed fetched:', {
        count: response.data?.length || 0,
        totalCount: response.pagination?.total_count || 0,
        currentPage: response.pagination?.current_page || 1,
        hasNext: response.pagination?.has_next || false
      })

      // Transform properties to match interface
      const transformedProperties: Property[] = (response.data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
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
        created_at: item.created_at || '',
        total_before_taxes: item.total_before_taxes || item.price || 0
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
      }

    } catch (error: any) {
      console.error('❌ Properties feed fetch failed:', error)
      setFeedError(error.message)
      if (!append) {
        toast.error('Failed to load properties')
      }
    } finally {
      if (append) {
        setIsLoadingMore(false)
      } else {
        setFeedLoading(false)
      }
    }
  }, [
    userLocation, user?.id, setFeedLoading, setIsLoadingMore, clearFeedError,
    setFeedError, setProperties, appendProperties, setCurrentPage, 
    setHasNextPage, setTotalCount
  ])

  // New function to fetch properties based on specific filters without setting state
  const fetchPropertiesByFilter = useCallback(async (filters: Record<string, any>) => {
    console.log('🔍 Fetching properties with filters:', filters);
    
    const params = {
      search_city: null,
      search_country: null,
      search_lat: null,
      search_lng: null,
      search_radius_km: 50,
      check_in: null,
      check_out: null,
      guest_count: 1,
      min_bedrooms: 0,
      min_bathrooms: 0,
      price_min: null,
      price_max: null,
      property_types: null,
      required_amenities: null,
      min_rating: null,
      sort_by: 'relevance',
      page_num: 1,
      page_size: 50,
      user_id: user?.id || null,
      ...filters,
    };

    try {
      const { data, error } = await supabase.rpc('get_feed_and_filter_properties', params);

      if (error) {
        console.error('❌ Error fetching filtered properties:', error);
        throw new Error(`Failed to fetch properties: ${error.message}`);
      }
      
      // Extract the properties from the nested data structure
      const properties = data?.data || [];
      
      console.log('✅ Filtered properties fetched:', properties.length || 0);
      return properties;

    } catch (error: any) {
      console.error('❌ Filtered properties fetch failed:', error);
      toast.error(error.message || 'Failed to load properties for the selected filter.');
      throw error; // Re-throw the error to be caught by the caller
    }
  }, [user?.id]);

  // Load more properties (infinite scroll)
  const loadMoreProperties = useCallback(async () => {
    if (!hasNextPage || isLoadingMore || feedLoading) {
      console.log('🚫 Cannot load more:', { hasNextPage, isLoadingMore, feedLoading })
      return
    }

    console.log('♾️ Loading more properties...')
    await fetchPropertiesFeed(currentPage + 1, true)
  }, [hasNextPage, isLoadingMore, feedLoading, currentPage, fetchPropertiesFeed])

  // Refresh feed
  const refreshFeed = useCallback(async () => {
    console.log('🔄 Refreshing feed...')
    resetFeed()
    await Promise.all([
      fetchPopularPlaces(),
      fetchPropertiesFeed(1, false)
    ])
  }, [resetFeed, fetchPopularPlaces, fetchPropertiesFeed])

  // Get user's location
  const getUserLocation = useCallback(async () => {
    console.log('📍 Getting user location...')
    
    if (!navigator.geolocation) {
      console.log('🚫 Geolocation not supported')
      return
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        })
      })

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }

      console.log('✅ User location obtained:', location)
      setUserLocation(location)
      
      return location
    } catch (error) {
      console.log('❌ Failed to get location:', error)
      return null
    }
  }, [setUserLocation])

  // Property interaction handlers
  const handleLikeProperty = useCallback(async (propertyId: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save properties')
      return
    }

    console.log('❤️ Toggling property like:', propertyId)
    
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

  const handlePropertyView = useCallback((propertyId: string) => {
    console.log('👁️ Property viewed:', propertyId)
    incrementPropertyViews(propertyId)
    
    // TODO: Track view analytics
  }, [incrementPropertyViews])

  // Note: Initialization is handled by the component to avoid infinite loops

  return {
    // Popular places
    popularPlaces,
    popularPlacesLoading,
    popularPlacesError,
    
    // Properties feed
    properties,
    feedLoading,
    feedError,
    isLoadingMore,
    hasNextPage,
    totalCount,
    currentPage,
    
    // User location
    userLocation,
    
    // Actions
    fetchPopularPlaces,
    fetchPropertiesFeed,
    loadMoreProperties,
    refreshFeed,
    getUserLocation,
    
    // Property interactions
    handleLikeProperty,
    handlePropertyView,
    
    // Utilities
    resetFeed,
    fetchPropertiesByFilter,
  }
} 