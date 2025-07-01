import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { 
  DatabaseBooking, 
  BookingRequest,
  BookingStatus,
  PaymentRecord,
  PaginationParams,
  PaginatedResponse
} from '../interfaces'
import { useBookingStore } from '../lib/stores/bookingStore'
import { useAuthStore } from '../lib/stores/authStore'

export const useBookingManagement = () => {
  const {
    setGuestBookings,
    setHostBookings,
    setHostBookingRequests,
    setPaymentRecords,
    setIsLoadingGuestBookings,
    setIsLoadingHostBookings,
    setIsLoadingHostRequests,
    setIsUpdatingBooking,
    setError,
    updateBookingStatus,
    updateBookingRequestStatus,
    removeBookingRequest,
    clearError,
    setHostBookingRequestsByStatus,
    setPaginationData
  } = useBookingStore()

  const { user } = useAuthStore()

  /**
   * Load guest's bookings using direct Supabase API
   */
  const loadGuestBookings = useCallback(async (guestId?: string) => {
    const userId = guestId || user?.id
    if (!userId) return

    setIsLoadingGuestBookings(true)
    clearError()

    try {
      console.log('🔄 Loading guest bookings...')

      // Use direct API for simple query (following Nomad Lux rules)
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          properties:properties(*),
          hosts:users!bookings_host_id_fkey(
            id,
            display_name,
            avatar_url,
            email,
            phone,
            host_rating,
            total_host_reviews
          )
        `)
        .eq('guest_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to load guest bookings: ${error.message}`)
      }

      console.log('✅ Guest bookings loaded:', data)
      setGuestBookings(data || [])
      return data

    } catch (error) {
      console.error('❌ Error loading guest bookings:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load bookings'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoadingGuestBookings(false)
    }
  }, [user?.id, setIsLoadingGuestBookings, setGuestBookings, setError, clearError])

  /**
   * Load host's bookings using direct Supabase API
   */
  const loadHostBookings = useCallback(async (hostId?: string) => {
    const userId = hostId || user?.id
    if (!userId) return

    setIsLoadingHostBookings(true)
    clearError()

    try {
      console.log('🔄 Loading host bookings...')

      // Use direct API for simple query (following Nomad Lux rules)
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('host_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to load host bookings: ${error.message}`)
      }

      console.log('✅ Host bookings loaded:', data)
      setHostBookings(data || [])
      return data

    } catch (error) {
      console.error('❌ Error loading host bookings:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load bookings'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoadingHostBookings(false)
    }
  }, [user?.id, setIsLoadingHostBookings, setHostBookings, setError, clearError])

  /**
   * Load host's booking requests (pending bookings)
   */
  const loadHostBookingRequests = useCallback(async (hostId?: string) => {
    const userId = hostId || user?.id
    if (!userId) return

    setIsLoadingHostRequests(true)
    clearError()

    try {
      console.log('🔄 Loading host booking requests...')

      // Use direct API with JOIN for booking requests
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          properties!inner(title, images, location),
          users!bookings_guest_id_fkey(display_name, avatar_url, email, phone, guest_rating, total_guest_reviews)
        `)
        .eq('host_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to load booking requests: ${error.message}`)
      }

      console.log('✅ Host booking requests loaded:', data)
      
      // Transform data to BookingRequest format (keeping snake_case from DB)
      const transformedRequests: BookingRequest[] = data?.map(booking => ({
        // From bookings table
        id: booking.id,
        property_id: booking.property_id,
        guest_id: booking.guest_id,
        host_id: booking.host_id,
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        check_in_time: booking.check_in_time,
        check_out_time: booking.check_out_time,
        guest_count: booking.guest_count,
        total_amount: booking.total_amount,
        cleaning_fee: booking.cleaning_fee,
        service_fee: booking.service_fee,
        taxes: booking.taxes,
        currency: booking.currency,
        status: booking.status,
        special_requests: booking.special_requests,
        created_at: booking.created_at,
        
        // From properties table (joined)
        property_title: booking.properties.title,
        property_images: booking.properties.images,
        
        // From users table (guest data - joined)
        guest_display_name: booking.users.display_name,
        guest_avatar_url: booking.users.avatar_url,
        guest_email: booking.users.email,
        guest_phone: booking.users.phone,
        guest_rating: booking.users.guest_rating || 0,
        total_guest_reviews: booking.users.total_guest_reviews || 0,
        
        // Computed/additional fields
        payment_method: 'pending', // Will be determined after approval
        is_no_show: booking.is_no_show || false
      })) || []

      setHostBookingRequests(transformedRequests)
      return transformedRequests

    } catch (error) {
      console.error('❌ Error loading booking requests:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load booking requests'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoadingHostRequests(false)
    }
  }, [user?.id, setIsLoadingHostRequests, setHostBookingRequests, setError, clearError])

  /**
   * Approve booking request
   */
  const approveBooking = useCallback(async (
    bookingId: string,
    hostMessage?: string
  ) => {
    setIsUpdatingBooking(true)
    clearError()

    try {
      console.log('🔄 Approving booking...', bookingId)

      // Step 1: Fetch booking with property_id
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('id, property_id')
        .eq('id', bookingId)
        .single()

      if (fetchError || !booking) {
        throw new Error(`Failed to fetch booking: ${fetchError?.message || 'Not found'}`)
      }

      // Step 2: Fetch property to get property_settings_id
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('property_settings_id')
        .eq('id', booking.property_id)
        .single()

      if (propertyError || !property) {
        throw new Error(`Failed to fetch property: ${propertyError?.message || 'Not found'}`)
      }

      // Step 3: Fetch host_property_settings using property_settings_id
      let paymentTiming = 'before_checkin'
      if (property.property_settings_id) {
        const { data: settings, error: settingsError } = await supabase
          .from('host_property_settings')
          .select('payment_timing')
          .eq('id', property.property_settings_id)
          .single()
        if (settingsError) {
          console.warn('Could not fetch host_property_settings, defaulting payment_timing to before_checkin:', settingsError.message)
        } else if (settings && settings.payment_timing) {
          paymentTiming = settings.payment_timing
        }
      }

      // Determine next status based on payment timing
      const newStatus: BookingStatus = paymentTiming === 'before_checkin' 
        ? 'accepted-and-waiting-for-payment' 
        : 'confirmed'

      // Update booking status using direct API
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: newStatus,
          host_approved_at: new Date().toISOString(),
          host_notes: hostMessage
        })
        .eq('id', bookingId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to approve booking: ${error.message}`)
      }

      console.log('✅ Booking approved:', data)

      // Update stores
      updateBookingStatus(bookingId, newStatus)
      updateBookingRequestStatus(bookingId, newStatus)

      return data

    } catch (error) {
      console.error('❌ Error approving booking:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve booking'
      setError(errorMessage)
      throw error
    } finally {
      setIsUpdatingBooking(false)
    }
  }, [setIsUpdatingBooking, updateBookingStatus, updateBookingRequestStatus, setError, clearError])

  /**
   * Decline booking request (set status to 'rejected')
   */
  const declineBooking = useCallback(async (
    bookingId: string,
    reason: string
  ) => {
    setIsUpdatingBooking(true)
    clearError()

    try {
      console.log('🔄 Declining booking...', bookingId)

      // Update booking status to 'rejected' using direct API
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'rejected',
          cancelled_at: new Date().toISOString(),
          reject_reason: reason,
          host_notes: reason
        })
        .eq('id', bookingId)
        .select()

      if (error) {
        throw new Error(`Failed to decline booking: ${error.message}`)
      }

      const updatedBooking = data && data.length > 0 ? data[0] : null
      console.log('✅ Booking declined:', updatedBooking)

      // Update stores
      updateBookingStatus(bookingId, 'rejected')
      removeBookingRequest(bookingId)

      return updatedBooking

    } catch (error) {
      console.error('❌ Error declining booking:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to decline booking'
      setError(errorMessage)
      throw error
    } finally {
      setIsUpdatingBooking(false)
    }
  }, [setIsUpdatingBooking, updateBookingStatus, removeBookingRequest, setError, clearError])

  /**
   * Cancel booking (for both guests and hosts)
   */
  const cancelBooking = useCallback(async (
    bookingId: string,
    reason: string,
    isHost: boolean = false
  ) => {
    setIsUpdatingBooking(true)
    clearError()

    try {
      console.log('🔄 Cancelling booking...', bookingId)

      // Update booking status using direct API
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason,
          ...(isHost ? { host_notes: reason } : { guest_notes: reason })
        })
        .eq('id', bookingId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to cancel booking: ${error.message}`)
      }

      console.log('✅ Booking cancelled:', data)

      // Update store
      updateBookingStatus(bookingId, 'cancelled')

      return data

    } catch (error) {
      console.error('❌ Error cancelling booking:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel booking'
      setError(errorMessage)
      throw error
    } finally {
      setIsUpdatingBooking(false)
    }
  }, [setIsUpdatingBooking, updateBookingStatus, setError, clearError])

  /**
   * Load payment records for bookings
   */
  const loadPaymentRecords = useCallback(async (bookingIds: string[]) => {
    if (bookingIds.length === 0) return

    clearError()

    try {
      console.log('🔄 Loading payment records...')

      // Use direct API for payment records
      const { data, error } = await supabase
        .from('payment_records')
        .select('*')
        .in('booking_id', bookingIds)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to load payment records: ${error.message}`)
      }

      console.log('✅ Payment records loaded:', data)
      setPaymentRecords(data || [])
      return data

    } catch (error) {
      console.error('❌ Error loading payment records:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load payment records'
      setError(errorMessage)
      throw error
    }
  }, [setPaymentRecords, setError, clearError])

  /**
   * Transform database booking to BookingRequest format
   */
  const transformToBookingRequest = (booking: any): BookingRequest => ({
    // From bookings table
    id: booking.id,
    property_id: booking.property_id,
    guest_id: booking.guest_id,
    host_id: booking.host_id,
    check_in_date: booking.check_in_date,
    check_out_date: booking.check_out_date,
    check_in_time: booking.check_in_time,
    check_out_time: booking.check_out_time,
    guest_count: booking.guest_count,
    total_amount: booking.total_amount,
    cleaning_fee: booking.cleaning_fee,
    service_fee: booking.service_fee,
    taxes: booking.taxes,
    currency: booking.currency,
    status: booking.status,
    special_requests: booking.special_requests,
    created_at: booking.created_at,
    
    // From properties table (joined)
    property_title: booking.properties.title,
    property_images: booking.properties.images,
    
    // From users table (guest data - joined)
    guest_display_name: booking.users.display_name,
    guest_avatar_url: booking.users.avatar_url,
    guest_email: booking.users.email,
    guest_phone: booking.users.phone,
    guest_rating: booking.users.guest_rating || 0,
    total_guest_reviews: booking.users.total_guest_reviews || 0,
    
    // Computed/additional fields
    payment_method: 'pending', // Will be determined after approval
    is_no_show: booking.is_no_show || false
  })

  /**
   * Load host's booking requests by status with pagination
   */
  const loadHostBookingRequestsByStatus = useCallback(async (
    status: BookingStatus,
    { page = 1, pageSize = 10, sortBy = 'created_at', sortOrder = 'desc' }: PaginationParams,
    hostId?: string
  ): Promise<PaginatedResponse<BookingRequest>> => {
    const userId = hostId || user?.id
    if (!userId) throw new Error('No user ID provided')

    setIsLoadingHostRequests(true)
    clearError()

    try {
      console.log(`🔄 Loading ${status} booking requests...`)

      // Calculate range for pagination
      const start = (page - 1) * pageSize
      const end = start + pageSize - 1

      // Get total count first
      const { count, error: countError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('host_id', userId)
        .eq('status', status)

      if (countError) {
        throw new Error(`Failed to get total count: ${countError.message}`)
      }

      // Get paginated data with joins
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          properties!inner(title, images, location),
          users!bookings_guest_id_fkey(display_name, avatar_url, email, phone, guest_rating, total_guest_reviews)
        `)
        .eq('host_id', userId)
        .eq('status', status)
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(start, end)

      if (error) {
        throw new Error(`Failed to load ${status} booking requests: ${error.message}`)
      }

      console.log(`✅ ${status} booking requests loaded:`, data)
      
      // Transform data to BookingRequest format
      const transformedRequests = (data || []).map(transformToBookingRequest)

      // Calculate pagination metadata
      const totalPages = Math.ceil((count || 0) / pageSize)
      const hasNextPage = page < totalPages
      const hasPreviousPage = page > 1

      const paginationData = {
        currentPage: page,
        totalPages,
        totalItems: count || 0,
        hasNextPage,
        hasPreviousPage,
        pageSize
      }

      // Update store with the new data
      setHostBookingRequestsByStatus(status, transformedRequests)
      setPaginationData(status, paginationData)

      return {
        data: transformedRequests,
        pagination: paginationData
      }

    } catch (error) {
      console.error(`❌ Error loading ${status} booking requests:`, error)
      const errorMessage = error instanceof Error ? error.message : `Failed to load ${status} booking requests`
      setError(errorMessage)
      throw error
    } finally {
      setIsLoadingHostRequests(false)
    }
  }, [user?.id, setIsLoadingHostRequests, setHostBookingRequestsByStatus, setPaginationData, setError, clearError])

  /**
   * Load counts of booking requests by status using RPC function
   */
  const loadBookingRequestsCounts = useCallback(async (hostId?: string): Promise<Record<BookingStatus | 'no_shows', number>> => {
    const userId = hostId || user?.id
    if (!userId) {
      return {
        pending: 0,
        confirmed: 0,
        cancelled: 0,
        'accepted-and-waiting-for-payment': 0,
        completed: 0,
        rejected: 0,
        'payment-failed': 0,
        'no_shows': 0
      }
    }

    try {
      console.log('🔄 Loading booking request counts...')

      // Use RPC function for efficient counting
      const { data, error } = await supabase
        .rpc('get_host_booking_counts', {
          p_host_id: userId
        })

      if (error) {
        throw new Error(`Failed to load booking counts: ${error.message}`)
      }

      // Add no_shows to the response since it's not in the DB
      const counts = {
        ...(data as Record<BookingStatus, number>),
        'no_shows': 0
      }

      console.log('✅ Booking counts loaded:', counts)
      return counts

    } catch (error) {
      console.error('❌ Error loading booking counts:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load booking counts'
      setError(errorMessage)
      throw error
    }
  }, [user?.id, setError])

  return {
    // Data loading
    loadGuestBookings,
    loadHostBookings,
    loadHostBookingRequests,
    loadPaymentRecords,
    // New pagination functions
    loadHostBookingRequestsByStatus,
    loadBookingRequestsCounts,

    // Host actions
    approveBooking,
    declineBooking,

    // Shared actions
    cancelBooking,

    // Utility
    clearError
  }
} 