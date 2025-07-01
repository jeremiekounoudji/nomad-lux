import { create } from 'zustand'
import { Property } from '../../interfaces'
import { supabase } from '../supabase'
import toast from 'react-hot-toast'
import { useAuthStore } from './authStore'

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
  
  // Actions
  toggleLike: (propertyId: string) => Promise<void>
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
      totalCount: 0,
      likedPropertyIds: [],
      likedProperties: [],
      isLikeLoading: false
    })
  },
  
  toggleLike: async (propertyId: string) => {
    try {
      set({ isLikeLoading: true })
      const { likedPropertyIds, properties } = get()
      const isLiked = likedPropertyIds.includes(propertyId)
      const userId = useAuthStore.getState().supabaseUser?.id
      if (!userId) {
        toast.error('Please sign in to like properties')
        set({ isLikeLoading: false })
        return
      }
      let error = null
      if (!isLiked) {
        // Like: insert into property_likes and increment like_count
        const { error: insertError } = await supabase
          .from('property_likes')
          .insert([{ property_id: propertyId, user_id: userId }])
        if (insertError) throw insertError
        // Increment like_count (fetch then update)
        const { data: current, error: fetchError } = await supabase
          .from('properties')
          .select('like_count')
          .eq('id', propertyId)
          .single()
        if (fetchError) throw fetchError
        const newLikeCount = (current?.like_count ?? 0) + 1
        const { data: updated, error: updateError } = await supabase
          .from('properties')
          .update({ like_count: newLikeCount })
          .eq('id', propertyId)
          .select('like_count')
          .single()
        if (updateError) throw updateError
        set({ likedPropertyIds: [...likedPropertyIds, propertyId] })
        // Update property like_count in store
        set({ properties: properties.map(p => p.id === propertyId ? { ...p, like_count: updated.like_count, is_liked: true } : p) })
        toast.success('Property added to favorites')
      } else {
        // Unlike: delete from property_likes and decrement like_count
        const { error: deleteError } = await supabase
          .from('property_likes')
          .delete()
          .eq('property_id', propertyId)
          .eq('user_id', userId)
        if (deleteError) throw deleteError
        // Decrement like_count (fetch then update)
        const { data: current, error: fetchError } = await supabase
          .from('properties')
          .select('like_count')
          .eq('id', propertyId)
          .single()
        if (fetchError) throw fetchError
        const newLikeCount = Math.max((current?.like_count ?? 1) - 1, 0)
        const { data: updated, error: updateError } = await supabase
          .from('properties')
          .update({ like_count: newLikeCount })
          .eq('id', propertyId)
          .select('like_count')
          .single()
        if (updateError) throw updateError
        set({ likedPropertyIds: likedPropertyIds.filter(id => id !== propertyId) })
        // Update property like_count in store
        set({ properties: properties.map(p => p.id === propertyId ? { ...p, like_count: updated.like_count, is_liked: false } : p) })
        toast.success('Property removed from favorites')
      }
    } catch (error) {
      console.error('Error toggling property like:', error)
      set({ error: 'Failed to update property like status' })
      toast.error('Failed to update favorites')
    } finally {
      set({ isLikeLoading: false })
    }
  },

  fetchLikedProperties: async () => {
    try {
      set({ isLikeLoading: true })
      // Use the new paginated RPC
      const userId = useAuthStore.getState().supabaseUser?.id
      const { data, error } = await supabase.rpc('get_user_liked_properties_paginated', { p_user_id: userId, p_page: 1, p_page_size: 100 })
      if (error) throw error
      console.log('👍🏻 Liked properties:', data)
      set({ likedPropertyIds: data.map((item: { property_id: string }) => item.property_id), likedProperties: data })
      // Optionally update is_liked and like_count in properties
      set((state) => ({
        properties: state.properties.map((p) => ({
          ...p,
          is_liked: data.some((item: { property_id: string }) => item.property_id === p.id),
          like_count: data.find((item: { property_id: string }) => item.property_id === p.id)?.like_count ?? p.like_count
        }))
      }))
    } catch (error) {
      console.error('Error fetching liked properties:', error)
      set({ error: 'Failed to fetch liked properties' })
    } finally {
      set({ isLikeLoading: false })
    }
  },

  clearLikedProperties: () => {
    set({ likedPropertyIds: [], error: null })
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