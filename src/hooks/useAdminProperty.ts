import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../lib/stores/authStore'
import { usePropertyStore } from '../lib/stores/propertyStore'
import { Property } from '../interfaces'
import toast from 'react-hot-toast'

export const useAdminProperty = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { user } = useAuthStore()
  const { updateProperty: updatePropertyInStore, setProperties } = usePropertyStore()

  console.log('👨‍💼 useAdminProperty hook initialized')

  // Check if user is admin
  const isAdmin = user?.user_role === 'admin' || user?.user_role === 'super_admin'

  // Approve a property
  const approveProperty = async (propertyId: string): Promise<Property | null> => {
    if (!user || !isAdmin) {
      console.error('❌ User not authorized for property approval')
      toast.error('Admin access required')
      return null
    }

    console.log('✅ Approving property:', propertyId)
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('properties')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user.id
        })
        .eq('id', propertyId)
        .eq('status', 'pending') // Only approve pending properties
        .select(`
          *,
          host:users(
            id,
            display_name,
            username,
            avatar_url,
            host_rating,
            response_rate,
            response_time,
            is_identity_verified
          )
        `)
        .single()

      if (error) {
        console.error('❌ Supabase error approving property:', error)
        throw new Error(`Failed to approve property: ${error.message}`)
      }

      if (!data) {
        throw new Error('No data returned from property approval')
      }

      console.log('✅ Property approved successfully:', data.id)

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

  // Reject a property
  const rejectProperty = async (propertyId: string, rejectionReason: string): Promise<Property | null> => {
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

  // Get properties by status (for admin dashboard)
  const getPropertiesByStatus = async (
    status: 'pending' | 'approved' | 'rejected',
    filters?: {
      priceRange?: { min: number; max: number }
      location?: { lat: number; lng: number; radius: number }
      amenities?: string[]
      propertyType?: string
      maxGuests?: number
    },
    page: number = 1,
    perPage: number = 10,
    sortBy: string = 'created_at',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ properties: Property[]; totalCount: number; totalPages: number } | null> => {
    if (!user || !isAdmin) {
      console.error('❌ User not authorized to view properties by status')
      toast.error('Admin access required')
      return null
    }

    console.log('📋 Fetching properties by status:', status)
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .rpc('list_properties_by_status', {
          p_status: status,
          p_filters: filters ? JSON.stringify(filters) : null,
          p_page: page,
          p_per_page: perPage,
          p_sort_by: sortBy,
          p_sort_order: sortOrder
        })

      if (error) {
        console.error('❌ Supabase error fetching properties by status:', error)
        throw new Error(`Failed to fetch properties: ${error.message}`)
      }

      if (!data) {
        throw new Error('No data returned from properties fetch')
      }

      console.log('✅ Properties fetched successfully:', data.total_count, 'total')

      // Transform search results
      const transformedProperties: Property[] = data.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price_per_night,
        currency: item.currency,
        location: item.location,
        images: item.images,
        videos: item.video ? [item.video] : [],
        host: {
          id: item.host_id,
          name: item.host_name,
          username: '',
          avatar: item.host_avatar || '',
          isVerified: false,
          email: '',
          phone: '',
          rating: item.host_rating || 0,
          responseRate: item.host_response_rate || 0,
          responseTime: item.host_response_time || 'Unknown'
        },
        rating: 0,
        reviewCount: 0,
        propertyType: item.property_type,
        amenities: item.amenities,
        maxGuests: item.max_guests,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        isLiked: false,
        createdAt: item.created_at,
        cleaningFee: item.cleaning_fee,
        serviceFee: item.service_fee,
        totalBeforeTaxes: item.price_per_night + (item.cleaning_fee || 0) + (item.service_fee || 0)
      }))

      // Update store with fetched properties
      setProperties(transformedProperties)

      setIsLoading(false)
      return {
        properties: transformedProperties,
        totalCount: data.total_count,
        totalPages: data.total_pages
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('❌ Error fetching properties by status:', error)
      setError(errorMessage)
      setIsLoading(false)
      return null
    }
  }

  // Get property statistics (for admin dashboard)
  const getPropertyStatistics = async (): Promise<{
    totalProperties: number
    pendingProperties: number
    approvedProperties: number
    rejectedProperties: number
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
      // Get basic counts
      const { data: totalData, error: totalError } = await supabase
        .from('properties')
        .select('status', { count: 'exact', head: true })

      if (totalError) {
        throw new Error(`Failed to fetch total count: ${totalError.message}`)
      }

      const { data: pendingData, error: pendingError } = await supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')

      if (pendingError) {
        throw new Error(`Failed to fetch pending count: ${pendingError.message}`)
      }

      const { data: approvedData, error: approvedError } = await supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'approved')

      if (approvedError) {
        throw new Error(`Failed to fetch approved count: ${approvedError.message}`)
      }

      const { data: rejectedData, error: rejectedError } = await supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'rejected')

      if (rejectedError) {
        throw new Error(`Failed to fetch rejected count: ${rejectedError.message}`)
      }

      // Get recent submissions (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: recentSubmissionsData, error: recentSubmissionsError } = await supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString())

      if (recentSubmissionsError) {
        throw new Error(`Failed to fetch recent submissions: ${recentSubmissionsError.message}`)
      }

      const { data: recentApprovalsData, error: recentApprovalsError } = await supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .gte('approved_at', sevenDaysAgo.toISOString())

      if (recentApprovalsError) {
        throw new Error(`Failed to fetch recent approvals: ${recentApprovalsError.message}`)
      }

      const { data: recentRejectionsData, error: recentRejectionsError } = await supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .gte('rejected_at', sevenDaysAgo.toISOString())

      if (recentRejectionsError) {
        throw new Error(`Failed to fetch recent rejections: ${recentRejectionsError.message}`)
      }

      const statistics = {
        totalProperties: totalData?.length || 0,
        pendingProperties: pendingData?.length || 0,
        approvedProperties: approvedData?.length || 0,
        rejectedProperties: rejectedData?.length || 0,
        recentSubmissions: recentSubmissionsData?.length || 0,
        recentApprovals: recentApprovalsData?.length || 0,
        recentRejections: recentRejectionsData?.length || 0
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
  }

  return {
    // State
    isLoading,
    error,
    isAdmin,
    
    // Actions
    approveProperty,
    rejectProperty,
    getPropertiesByStatus,
    getPropertyStatistics,
    
    // Utilities
    clearError: () => setError(null)
  }
} 