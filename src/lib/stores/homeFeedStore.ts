import { create } from 'zustand'
import { Property } from '../../interfaces'

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

interface HomeFeedState {
  // Popular places state
  popularPlaces: PopularPlace[]
  popularPlacesLoading: boolean
  popularPlacesError: string | null
  
  // Properties feed state
  properties: Property[]
  feedLoading: boolean
  feedError: string | null
  
  // Pagination state
  currentPage: number
  hasNextPage: boolean
  totalCount: number
  
  // Infinite scroll state
  isLoadingMore: boolean
  
  // User location for personalization
  userLocation: {
    lat: number
    lng: number
  } | null

  // Actions for popular places
  setPopularPlaces: (places: PopularPlace[]) => void
  setPopularPlacesLoading: (loading: boolean) => void
  setPopularPlacesError: (error: string | null) => void
  
  // Actions for properties feed
  setProperties: (properties: Property[]) => void
  appendProperties: (properties: Property[]) => void
  setFeedLoading: (loading: boolean) => void
  setFeedError: (error: string | null) => void
  clearFeedError: () => void
  
  // Actions for pagination
  setCurrentPage: (page: number) => void
  setHasNextPage: (hasNext: boolean) => void
  setTotalCount: (count: number) => void
  
  // Actions for infinite scroll
  setIsLoadingMore: (loading: boolean) => void
  
  // Actions for user location
  setUserLocation: (location: { lat: number; lng: number } | null) => void
  
  // Utility actions
  resetFeed: () => void
  clearAll: () => void
  
  // Property interactions
  updatePropertyLike: (propertyId: string, isLiked: boolean) => void
  incrementPropertyViews: (propertyId: string) => void
}

export const useHomeFeedStore = create<HomeFeedState>((set, get) => ({
  // Initial state - Popular places
  popularPlaces: [],
  popularPlacesLoading: false,
  popularPlacesError: null,
  
  // Initial state - Properties feed
  properties: [],
  feedLoading: false,
  feedError: null,
  
  // Initial state - Pagination
  currentPage: 1,
  hasNextPage: true,
  totalCount: 0,
  
  // Initial state - Infinite scroll
  isLoadingMore: false,
  
  // Initial state - User location
  userLocation: null,

  // Popular places actions
  setPopularPlaces: (places) => {
    console.log('🏙️ Setting popular places:', places.length)
    set({ popularPlaces: places })
  },
  
  setPopularPlacesLoading: (loading) => {
    console.log('🔄 Popular places loading:', loading)
    set({ popularPlacesLoading: loading })
  },
  
  setPopularPlacesError: (error) => {
    console.log('❌ Popular places error:', error)
    set({ popularPlacesError: error })
  },

  // Properties feed actions
  setProperties: (properties) => {
    console.log('🏠 Setting properties feed:', properties.length)
    set({ 
      properties,
      currentPage: 1,
      feedError: null
    })
  },
  
  appendProperties: (newProperties) => {
    const { properties } = get()
    console.log('➕ Appending properties:', newProperties.length, 'to existing', properties.length)
    
    // Filter out duplicates by ID
    const existingIds = new Set(properties.map(p => p.id))
    const uniqueNewProperties = newProperties.filter(p => !existingIds.has(p.id))
    
    set({ 
      properties: [...properties, ...uniqueNewProperties],
      feedError: null
    })
  },
  
  setFeedLoading: (loading) => {
    console.log('🔄 Feed loading:', loading)
    set({ feedLoading: loading })
  },
  
  setFeedError: (error) => {
    console.log('❌ Feed error:', error)
    set({ feedError: error })
  },
  
  clearFeedError: () => set({ feedError: null }),

  // Pagination actions
  setCurrentPage: (page) => {
    console.log('📄 Setting current page:', page)
    set({ currentPage: page })
  },
  
  setHasNextPage: (hasNext) => {
    console.log('➡️ Has next page:', hasNext)
    set({ hasNextPage: hasNext })
  },
  
  setTotalCount: (count) => {
    console.log('🔢 Total count:', count)
    set({ totalCount: count })
  },

  // Infinite scroll actions
  setIsLoadingMore: (loading) => {
    console.log('♾️ Loading more:', loading)
    set({ isLoadingMore: loading })
  },

  // User location actions
  setUserLocation: (location) => {
    console.log('📍 Setting user location:', location)
    set({ userLocation: location })
  },

  // Utility actions
  resetFeed: () => {
    console.log('🔄 Resetting feed')
    set({
      properties: [],
      currentPage: 1,
      hasNextPage: true,
      totalCount: 0,
      feedError: null,
      isLoadingMore: false
    })
  },
  
  clearAll: () => {
    console.log('🧹 Clearing all home feed data')
    set({
      popularPlaces: [],
      popularPlacesLoading: false,
      popularPlacesError: null,
      properties: [],
      feedLoading: false,
      feedError: null,
      currentPage: 1,
      hasNextPage: true,
      totalCount: 0,
      isLoadingMore: false,
      userLocation: null
    })
  },

  // Property interaction actions
  updatePropertyLike: (propertyId, isLiked) => {
    const { properties } = get()
    console.log('❤️ Updating property like:', propertyId, isLiked)
    
    const updatedProperties = properties.map(property =>
      property.id === propertyId 
        ? { ...property, is_liked: isLiked }
        : property
    )
    
    set({ properties: updatedProperties })
  },
  
  incrementPropertyViews: (propertyId) => {
    const { properties } = get()
    console.log('👁️ Incrementing property views:', propertyId)
    
    const updatedProperties = properties.map(property =>
      property.id === propertyId 
        ? { ...property, view_count: property.view_count + 1 }
        : property
    )
    
    set({ properties: updatedProperties })
  }
}))

// Note: Selector hooks removed to prevent infinite loop issues
// Access state directly through useHomeFeedStore() instead 