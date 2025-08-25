import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useUserListingsStore } from '../lib/stores/userListingsStore'
import { useAuthStore } from '../lib/stores/authStore'
import { DatabaseProperty, ListingStats, PropertyEditConfirmation, PropertyStatus } from '../interfaces'

interface FetchListingsOptions {
  status?: PropertyStatus
  page?: number
  pageSize?: number
  force?: boolean // Force fetch even if data exists
}

export const useUserListings = () => {
  const { user } = useAuthStore()
  const {
    statusData,
    listingStats,
    isLoading,
    error,
    statusFilter,
    statusCounts,
    setStatusData,
    updateStatusListings,
    setStatusPagination,
    setStatusLoading,
    addUserListing,
    updateUserListing,
    removeUserListing,
    setListingStats,
    updateListingStats,
    setLoading,
    setError,
    clearError,
    setStatusCounts,
    setStatusFilter,
    getCurrentListings,
    getCurrentPagination,
    getListingStats,
    getTotalStats,
    shouldFetchStatus,
    clearStatus
  } = useUserListingsStore()

  // Fetch user's property listings with pagination and smart caching
  const fetchUserListings = useCallback(async (options: FetchListingsOptions = {}) => {
    const { status = null, page = 1, pageSize = 6, force = false } = options
    const statusKey = status || 'all'
    
    console.log('🔄 fetchUserListings called with options:', options)
    console.log('👤 Current user:', user)
    console.log('🆔 User ID:', user?.id)
    
    if (!user?.id) {
      console.log('❌ No user ID available')
      setError('Please log in to view your listings')
      setLoading(false)
      return { success: false, error: 'User not authenticated' }
    }

    // Check if we should fetch data (unless forced)
    if (!force && !shouldFetchStatus(statusKey, page)) {
      console.log(`⚡ Using cached data for ${statusKey}, page ${page}`)
      return { success: true, cached: true }
    }

    console.log(`🔄 Fetching user listings for user: ${user.id}, status: ${statusKey}, page: ${page}`)
    setStatusLoading(statusKey, true)
    clearError()

    try {
      console.log('📡 Calling get_host_properties RPC function')
      
      const { data, error: supabaseError } = await supabase
        .rpc('get_host_properties', { 
          host_user_id: user.id,
          status_filter: status,
          page_size: pageSize,
          page_offset: (page - 1) * pageSize
        })

      console.log('📊 RPC Response:', { data, error: supabaseError })

      if (supabaseError) {
        console.error('❌ Error fetching user listings:', supabaseError)
        setError(supabaseError.message)
        setStatusLoading(statusKey, false)
        return { success: false, error: supabaseError.message }
      }

      console.log('✅ Fetched user listings:', data?.length || 0, 'properties')
      
      const properties = data || []
      
      // Extract status counts from the first row (if any)
      if (properties.length > 0 && properties[0].status_counts) {
        const counts = properties[0].status_counts
        console.log('📊 Updating status counts:', counts)
        setStatusCounts(counts)
      }
      
      // Extract total count and calculate pagination
      const totalItems = properties.length > 0 ? properties[0].total_count || 0 : 0
      const totalPages = Math.ceil(totalItems / pageSize)
      
      const paginationInfo = {
        currentPage: page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
      
      // Update status data in store
      const statusDataEntry = {
        listings: properties,
        pagination: paginationInfo,
        lastFetched: Date.now(),
        isLoading: false
      }
      
      setStatusData(statusKey, statusDataEntry)

      // Create real statistics for each property
      const realStats: Record<string, ListingStats> = {}
      properties.forEach((property: DatabaseProperty) => {
        realStats[property.id] = {
          views: property.view_count || 0,
          bookings: property.booking_count || 0,
          revenue: property.total_revenue || 0,
          rating: property.rating || 0,
          status: property.status as PropertyStatus
        }
      })
      setListingStats(realStats)

      return { success: true, data: properties, totalItems, totalPages }

    } catch (error) {
      console.error('❌ Unexpected error fetching user listings:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch listings'
      setError(errorMessage)
      setStatusLoading(statusKey, false)
      return { success: false, error: errorMessage }
    }
  }, [user?.id, shouldFetchStatus, setStatusData, setListingStats, setStatusLoading, setError, clearError, setStatusCounts])

  // Update a property listing
  const updateListing = useCallback(async (
    propertyId: string, 
    updates: any, // Changed to any to handle mixed File/string arrays
    skipStatusReset = false
  ) => {
    if (!user?.id) {
      setError('User not authenticated')
      return { success: false, error: 'User not authenticated' }
    }

    console.log('📝 Updating listing:', propertyId, updates)
    setLoading(true)
    clearError()

    try {
      // Handle file uploads for images and videos
      let processedUpdates = { ...updates }
      
      // Process images: separate existing URLs from new File objects
      if (updates.images && Array.isArray(updates.images)) {
        const existingImages = updates.images.filter((img: any) => typeof img === 'string')
        const newImageFiles = updates.images.filter((img: any) => img instanceof File)
        
        console.log(`📸 Processing images: ${existingImages.length} existing, ${newImageFiles.length} new`)
        
        // Keep existing URLs, upload new files would be handled by useProperty hook
        // For now, just keep the mix and let the database handle it
        processedUpdates.images = updates.images
      }
      
      // Process video: handle File vs string
      if (updates.videos && Array.isArray(updates.videos) && updates.videos.length > 0) {
        const video = updates.videos[0]
        if (typeof video === 'string') {
          // Existing video URL
          processedUpdates.video = video
        } else if (video instanceof File) {
          // New video file - for now, keep as is (would need upload logic)
          console.log('🎥 New video file detected, keeping for now:', video.name)
          processedUpdates.video = video // This will need proper upload handling
        }
        delete processedUpdates.videos // Remove videos array, use video field for DB
      }
      
      // Convert to database format
      const dbUpdates: any = {}
      if (processedUpdates.title) dbUpdates.title = processedUpdates.title
      if (processedUpdates.description) dbUpdates.description = processedUpdates.description
      if (processedUpdates.price) dbUpdates.price_per_night = processedUpdates.price
      if (processedUpdates.currency) dbUpdates.currency = processedUpdates.currency
      if (processedUpdates.location) dbUpdates.location = processedUpdates.location
      if (processedUpdates.amenities) dbUpdates.amenities = processedUpdates.amenities
      if (processedUpdates.images) dbUpdates.images = processedUpdates.images
      if (processedUpdates.video) dbUpdates.video = processedUpdates.video
      if (processedUpdates.propertyType) dbUpdates.property_type = processedUpdates.propertyType
      if (processedUpdates.maxGuests) dbUpdates.max_guests = processedUpdates.maxGuests
      if (processedUpdates.bedrooms) dbUpdates.bedrooms = processedUpdates.bedrooms
      if (processedUpdates.bathrooms) dbUpdates.bathrooms = processedUpdates.bathrooms
      if (processedUpdates.cleaningFee !== undefined) dbUpdates.cleaning_fee = processedUpdates.cleaningFee
      if (processedUpdates.serviceFee !== undefined) dbUpdates.service_fee = processedUpdates.serviceFee
      
      // If not skipping status reset and property is not pending, reset to pending
      const finalUpdates = { 
        ...dbUpdates, 
        updated_at: new Date().toISOString()
      }
      
      if (!skipStatusReset && updates.status !== 'pending') {
        finalUpdates.status = 'pending'
        // Clear approval/rejection fields when resetting to pending
        finalUpdates.approved_at = undefined
        finalUpdates.approved_by = undefined
        finalUpdates.rejected_at = undefined
        finalUpdates.rejected_by = undefined
        finalUpdates.rejection_reason = undefined
      }

      const { data, error: supabaseError } = await supabase
        .from('properties')
        .update(finalUpdates)
        .eq('id', propertyId)
        .eq('host_id', user.id) // Ensure user owns the property
        .select()
        .single()

      if (supabaseError) {
        console.error('❌ Error updating listing:', supabaseError)
        setError(supabaseError.message)
        return { success: false, error: supabaseError.message }
      }

      console.log('✅ Updated listing successfully:', data)
      updateUserListing(data)
      
      // Update mock stats if status changed
      if (data.status !== updates.status) {
        const currentStats = listingStats[propertyId]
        if (currentStats) {
          updateListingStats(propertyId, { ...currentStats, status: data.status })
        }
      }

      // Refresh status counts after update
      await fetchUserListings({ force: true })

      return { success: true, data }

    } catch (error) {
      console.error('❌ Unexpected error updating listing:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update listing'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [user?.id, updateUserListing, updateListingStats, listingStats, setLoading, setError, clearError, fetchUserListings])

  // Delete a property listing
  const deleteListing = useCallback(async (propertyId: string) => {
    if (!user?.id) {
      setError('User not authenticated')
      return { success: false, error: 'User not authenticated' }
    }

    console.log('🗑️ Deleting listing:', propertyId)
    setLoading(true)
    clearError()

    try {
      const { error: supabaseError } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)
        .eq('host_id', user.id) // Ensure user owns the property

      if (supabaseError) {
        console.error('❌ Error deleting listing:', supabaseError)
        setError(supabaseError.message)
        return { success: false, error: supabaseError.message }
      }

      console.log('✅ Deleted listing successfully')
      removeUserListing(propertyId)
      
      // Refresh status counts after deletion
      await fetchUserListings({ force: true })
      
      return { success: true }

    } catch (error) {
      console.error('❌ Unexpected error deleting listing:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete listing'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [user?.id, removeUserListing, setLoading, setError, clearError, fetchUserListings])

  // Pause/Resume a property listing
  const toggleListingStatus = useCallback(async (propertyId: string, newStatus: 'paused' | 'approved') => {
    return updateListing(propertyId, { status: newStatus }, true)
  }, [updateListing])

  // Get a single user property by ID
  const getUserProperty = useCallback(async (propertyId: string): Promise<DatabaseProperty | null> => {
    if (!user?.id) {
      setError('User not authenticated')
      return null
    }

    console.log('🔄 Fetching user property:', propertyId)
    setLoading(true)
    clearError()

    try {
      const { data, error: supabaseError, status } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .eq('host_id', user.id)
        .single()

      if (supabaseError) {
        console.warn('ℹ️ getUserProperty first attempt failed', { supabaseError, status })
        if (supabaseError.code === 'PGRST116') {
          // Maybe ownership filter caused no rows — try without host_id constraint as fallback
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('properties')
            .select('*')
            .eq('id', propertyId)
            .single()

          if (fallbackError) {
            console.error('❌ getUserProperty fallback failed', fallbackError)
            setError(fallbackError.message)
            return null
          }
          console.log('✅ getUserProperty fallback succeeded')
          return fallbackData
        }
        // Only set error for non-PGRST116 errors (genuine errors, not just no rows)
        console.error('❌ Error fetching property:', supabaseError)
        setError(supabaseError.message)
        return null
      }

      console.log('✅ Fetched user property:', data)
      return data

    } catch (error) {
      console.error('❌ Unexpected error fetching property:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch property'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [user?.id, setLoading, setError, clearError])

  // Check if property edit will require admin review
  const checkEditConfirmation = useCallback((property: DatabaseProperty): PropertyEditConfirmation => {
    const willResetToPending = property.status !== 'pending' && property.status !== 'paused'
    
    return {
      property,
      willResetToPending,
      currentStatus: property.status
    }
  }, [])

  // Handle status filter change with smart fetching
  const handleStatusFilterChange = useCallback(async (newStatus: typeof statusFilter) => {
    console.log(`🔄 Changing status filter to: ${newStatus}`)
    setStatusFilter(newStatus)
    
    // Reset to page 1 and fetch data for the new status
    await fetchUserListings({ 
      status: newStatus === 'all' ? undefined : newStatus, 
      page: 1,
      pageSize: 6
    })
  }, [setStatusFilter, fetchUserListings])

  // Pagination helpers
  const goToPage = useCallback(async (page: number) => {
    const status = statusFilter === 'all' ? undefined : statusFilter
    await fetchUserListings({ status, page, pageSize: 6 })
  }, [statusFilter, fetchUserListings])

  const nextPage = useCallback(async () => {
    const pagination = getCurrentPagination()
    if (pagination?.hasNextPage) {
      await goToPage(pagination.currentPage + 1)
    }
  }, [getCurrentPagination, goToPage])

  const prevPage = useCallback(async () => {
    const pagination = getCurrentPagination()
    if (pagination?.hasPrevPage) {
      await goToPage(pagination.currentPage - 1)
    }
  }, [getCurrentPagination, goToPage])

  return {
    // State
    filteredListings: getCurrentListings(),
    listingStats,
    isLoading: statusData[statusFilter]?.isLoading || isLoading,
    error,
    statusFilter,
    pagination: getCurrentPagination(),
    
    // Computed state
    totalStats: getTotalStats(),
    statusCounts,
    
    // Actions
    fetchUserListings,
    getUserProperty,
    updateListing,
    deleteListing,
    toggleListingStatus,
    setStatusFilter: handleStatusFilterChange,
    clearError,
    
    // Pagination actions
    goToPage,
    nextPage,
    prevPage,
    
    // Utilities
    checkEditConfirmation
  }
} 