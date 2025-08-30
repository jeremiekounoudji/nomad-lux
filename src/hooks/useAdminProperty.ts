import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../lib/stores/authStore'
import { useAdminPropertyStore } from '../lib/stores/adminPropertyStore'
import { DatabaseProperty, PropertyStatus, ListingStats } from '../interfaces'
import toast from 'react-hot-toast'

interface FetchPropertiesOptions {
  status?: PropertyStatus | 'all'
  page?: number
  pageSize?: number
  force?: boolean // Force fetch even if data exists
}

export const useAdminProperty = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { user } = useAuthStore()
  const {
    statusData,
    propertyStats,
    statusFilter,
    statusCounts,
    setStatusData,
    updateProperty: updatePropertyInStore,
    setStatusLoading,
    setPropertyStats,
    setError: setStoreError,
    clearError: clearStoreError,
    setStatusCounts,
    setStatusFilter,
    getCurrentProperties,
    getCurrentPagination,
    shouldFetchStatus,
    // clearStatus // Unused function
  } = useAdminPropertyStore()

  console.log('👨‍💼 useAdminProperty hook initialized')

  // Check if user is admin
  const isAdmin = user?.user_role === 'admin' || user?.user_role === 'super_admin'

  // Fetch admin properties with pagination and smart caching (following useUserListings pattern)
  const fetchAdminProperties = useCallback(async (options: FetchPropertiesOptions = {}) => {
    const { status = null, page = 1, pageSize = 10, force = false } = options
    const statusKey = status || 'all'
    
    console.log('🔄 fetchAdminProperties called with options:', options)
    console.log('👤 Current user:', user)
    console.log('🆔 User ID:', user?.id, 'Role:', user?.user_role)
    
    if (!user?.id || !isAdmin) {
      console.log('❌ No admin access')
      setStoreError('Admin access required')
      setIsLoading(false)
      return { success: false, error: 'Admin access required' }
    }

    // Check if we should fetch data (unless forced)
    if (!force && !shouldFetchStatus(statusKey, page)) {
      console.log(`⚡ Using cached data for ${statusKey}, page ${page}`)
      return { success: true, cached: true }
    }

    console.log(`🔄 Fetching admin properties, status: ${statusKey}, page: ${page}`)
    setStatusLoading(statusKey, true)
    clearStoreError()

    try {
      console.log('📡 Calling list_properties_by_status RPC function')
      
      // Use RPC function for complex queries with filters
      const { data, error: supabaseError } = await supabase
        .rpc('list_properties_by_status', {
          p_status: status === 'all' ? null : status,
          p_filters: null, // Can be extended for advanced filtering
          p_page: page,
          p_per_page: pageSize,
          p_sort_by: 'created_at',
          p_sort_order: 'desc'
        })

      console.log('📊 RPC Response:', { data, error: supabaseError })

      if (supabaseError) {
        console.error('❌ Error fetching admin properties:', supabaseError)
        setStoreError(supabaseError.message)
        setStatusLoading(statusKey, false)
        return { success: false, error: supabaseError.message }
      }

      console.log('✅ Fetched admin properties:', data?.data?.length || 0, 'properties')
      
      const properties = data?.data || []
      const totalItems = data?.total_count || 0
      const totalPages = data?.total_pages || 0
      
      // Use getPropertyStatistics to update statusCounts
      const stats = await getPropertyStatistics()
      if (stats) {
        setStatusCounts({
          all: stats.totalProperties,
          pending: stats.pendingProperties,
          approved: stats.approvedProperties,
          rejected: stats.rejectedProperties,
          suspended: stats.suspendedProperties || 0,
        })
      }
      
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
        properties,
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
      setPropertyStats(realStats)

      return { success: true, data: properties, totalItems, totalPages }

    } catch (error) {
      console.error('❌ Unexpected error fetching admin properties:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch properties'
      setStoreError(errorMessage)
      setStatusLoading(statusKey, false)
      return { success: false, error: errorMessage }
    }
  }, [user?.id, user?.user_role, isAdmin, shouldFetchStatus, setStatusData, setPropertyStats, setStatusLoading, setStoreError, clearStoreError, setStatusCounts])

  // Approve a property (updated to work with store)
  const approveProperty = async (propertyId: string): Promise<DatabaseProperty | null> => {
    if (!user || !isAdmin) {
      console.error('❌ User not authorized for property approval')
      toast.error('Admin access required')
      return null
    }

    console.log('✅ Approving property:', propertyId)
    setIsLoading(true)
    setError(null)

    try {
      // Direct table update (not RPC) for simple status changes
      const { data, error } = await supabase
        .from('properties')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user.id
        })
        .eq('id', propertyId)
        .eq('status', 'pending') // Only approve pending properties
          .select()
        .single()

      if (error) {
        console.error('❌ Supabase error approving property:', error)
        throw new Error(`Failed to approve property: ${error.message}`)
      }

      if (!data) {
        throw new Error('No data returned from property approval')
      }

      console.log('✅ Property approved successfully:', data.id)

      // Update store with the updated property
      updatePropertyInStore(data)
      
      // Refresh the current data to get updated counts
      await fetchAdminProperties({ force: true })

      toast.success('Property approved successfully!')
      setIsLoading(false)
      return data

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('❌ Error approving property:', error)
      setError(errorMessage)
      toast.error(`Failed to approve property: ${errorMessage}`)
      setIsLoading(false)
      return null
    }
  }

  // Reject a property (updated to work with store)
  const rejectProperty = async (propertyId: string, rejectionReason: string): Promise<DatabaseProperty | null> => {
    if (!user || !isAdmin) {
      console.error('❌ User not authorized for property rejection')
      toast.error('Admin access required')
      return null
    }

    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return null
    }

    console.log('❌ Rejecting property:', propertyId, 'Reason:', rejectionReason)
    setIsLoading(true)
    setError(null)

    try {
      // Direct table update (not RPC) for simple status changes
      const { data, error } = await supabase
        .from('properties')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejected_by: user.id,
          rejection_reason: rejectionReason
        })
        .eq('id', propertyId)
        .eq('status', 'pending') // Only reject pending properties
        .select()
        .single()

      if (error) {
        console.error('❌ Supabase error rejecting property:', error)
        throw new Error(`Failed to reject property: ${error.message}`)
      }

      if (!data) {
        throw new Error('No data returned from property rejection')
      }

      console.log('❌ Property rejected successfully:', data.id)

      // Update store with the updated property
      updatePropertyInStore(data)
      
      // Refresh the current data to get updated counts
      await fetchAdminProperties({ force: true })

      toast.success('Property rejected successfully!')
      setIsLoading(false)
      return data

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('❌ Error rejecting property:', error)
      setError(errorMessage)
      toast.error(`Failed to reject property: ${errorMessage}`)
      setIsLoading(false)
      return null
    }
  }

  // Suspend a property (updated to work with store)
  const suspendProperty = async (propertyId: string, suspensionReason: string, skipReasonCheck = false): Promise<DatabaseProperty | null> => {
    if (!user || !isAdmin) {
      console.error('❌ User not authorized for property suspension')
      toast.error('Admin access required')
      return null
    }
    if (!skipReasonCheck && !suspensionReason.trim()) {
      toast.error('Please provide a suspension reason')
      return null
    }

    console.log('⏸️ Suspending property:', propertyId, 'Reason:', suspensionReason)
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('properties')
        .update({
          status: 'suspended',
          suspended_at: new Date().toISOString(),
          suspended_by: user.id,
          suspension_reason: suspensionReason
        })
        .eq('id', propertyId)
        .eq('status', 'approved') // Only suspend approved properties
        .select()
        .single()

      if (error) {
        console.error('❌ Supabase error suspending property:', error)
        throw new Error(`Failed to suspend property: ${error.message}`)
      }

      if (!data) {
        throw new Error('No data returned from property suspension')
      }

      console.log('⏸️ Property suspended successfully:', data.id)
      updatePropertyInStore(data)
      await fetchAdminProperties({ force: true })
      toast.success('Property suspended successfully!')
      setIsLoading(false)
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('❌ Error suspending property:', error)
      setError(errorMessage)
      toast.error(`Failed to suspend property: ${errorMessage}`)
      setIsLoading(false)
      return null
    }
  }

  // Handle tab selection change
  const handleTabSelectionChange = useCallback(async (key: React.Key) => {
    console.log('🔄 Admin tab selection changed to:', key)
    const newStatus = key as PropertyStatus | 'all'
    setStatusFilter(newStatus)
    await fetchAdminProperties({ status: newStatus })
  }, [setStatusFilter, fetchAdminProperties])

  // Handle pagination change
  const goToPage = useCallback(async (page: number) => {
    console.log('📄 Admin page change to:', page)
    await fetchAdminProperties({ status: statusFilter, page })
  }, [fetchAdminProperties, statusFilter])

  // Get property statistics (for admin dashboard)
  const getPropertyStatistics = useCallback(async (): Promise<{
    totalProperties: number
    pendingProperties: number
    approvedProperties: number
    rejectedProperties: number
    suspendedProperties: number
    recentSubmissions: number
    recentApprovals: number
    recentRejections: number
  } | null> => {
    if (!user || !isAdmin) {
      console.error('❌ User not authorized to view property statistics')
      toast.error('Admin access required')
      return null
    }

    console.log('📊 Fetching property statistics')
    setIsLoading(true)
    setError(null)

    try {
      // Use the new RPC function (returns a single record)
      const { data, error } = await supabase.rpc('get_admin_property_statistics')
      if (error) throw new Error(error.message)
      if (!data) throw new Error('No statistics returned')
      const statistics = {
        totalProperties: data.total_properties || 0,
        pendingProperties: data.pending_properties || 0,
        approvedProperties: data.approved_properties || 0,
        rejectedProperties: data.rejected_properties || 0,
        suspendedProperties: data.suspended_properties || 0,
        recentSubmissions: data.recent_submissions || 0,
        recentApprovals: data.recent_approvals || 0,
        recentRejections: data.recent_rejections || 0
      }
      console.log('✅ Property statistics fetched:', statistics)
      setIsLoading(false)
      return statistics
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('❌ Error fetching property statistics:', error)
      setError(errorMessage)
      setIsLoading(false)
      return null
    }
  }, [user, isAdmin])

  // Bulk approve properties
  const bulkApproveProperties = async (propertyIds: string[]): Promise<{ success: string[]; failed: { id: string; error: string }[] }> => {
    const success: string[] = [];
    const failed: { id: string; error: string }[] = [];
    for (const id of propertyIds) {
      try {
        const result = await approveProperty(id);
        if (result) {
          success.push(id);
        } else {
          failed.push({ id, error: 'Unknown error' });
        }
      } catch (e: any) {
        failed.push({ id, error: e?.message || 'Unknown error' });
      }
    }
    return { success, failed };
  };

  // Bulk reject properties (single reason for all)
  const bulkRejectProperties = async (propertyIds: string[], reason: string): Promise<{ success: string[]; failed: { id: string; error: string }[] }> => {
    const success: string[] = [];
    const failed: { id: string; error: string }[] = [];
    for (const id of propertyIds) {
      try {
        const result = await rejectProperty(id, reason);
        if (result) {
          success.push(id);
        } else {
          failed.push({ id, error: 'Unknown error' });
        }
      } catch (e: any) {
        failed.push({ id, error: e?.message || 'Unknown error' });
      }
    }
    return { success, failed };
  };

  // Bulk suspend properties (single reason for all)
  const bulkSuspendProperties = async (propertyIds: string[], reason: string): Promise<{ success: string[]; failed: { id: string; error: string }[] }> => {
    const success: string[] = [];
    const failed: { id: string; error: string }[] = [];
    for (const id of propertyIds) {
      try {
        const result = await suspendProperty(id, reason, true);
        if (result) {
          success.push(id);
        } else {
          failed.push({ id, error: 'Unknown error' });
        }
      } catch (e: any) {
        failed.push({ id, error: e?.message || 'Unknown error' });
      }
    }
    return { success, failed };
  };

  // Get filtered properties from store (like in useUserListings)
  const filteredProperties = getCurrentProperties()
  const pagination = getCurrentPagination()

  return {
    // State from store
    filteredProperties,
    propertyStats,
    isLoading: statusData[statusFilter]?.isLoading || isLoading,
    error: error,
    statusFilter,
    statusCounts,
    pagination,
    
    // Actions
    fetchAdminProperties,
    approveProperty,
    rejectProperty,
    suspendProperty,
    bulkApproveProperties,
    bulkRejectProperties,
    bulkSuspendProperties,
    getPropertyStatistics,
    handleTabSelectionChange,
    goToPage,
    
    // Admin check
    isAdmin,
    
    // Utilities
    clearError: () => setError(null)
  }
} 