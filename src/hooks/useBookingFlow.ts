import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { AvailabilityResult, BookingFormData } from '../interfaces/Booking'
import { useBookingStore } from '../lib/stores/bookingStore'
import { useAuthStore } from '../lib/stores/authStore'
import { createPropertyDateTime } from '../utils/propertyUtils'

export const useBookingFlow = () => {
  const {
    isCheckingAvailability,
    isCreatingBooking,
    error,
    availabilityResult,
    setIsCheckingAvailability,
    setIsCreatingBooking,
    setAvailabilityResult,
    setError,
    clearError
  } = useBookingStore()

  // Get user from auth store
  const { user } = useAuthStore()

  /**
   * Check property availability using new unavailable_dates system
   */
  const checkAvailability = useCallback(async (
    propertyId: string,
    checkInDate: Date,
    checkOutDate: Date,
    checkInTime: string = '00:00:00',
    checkOutTime: string = '00:00:00'
  ): Promise<AvailabilityResult> => {
    setIsCheckingAvailability(true)
    clearError()

    try {
      console.log('🔄 Checking property availability with new system...')

      // Format dates for RPC function
      const checkInDateString = checkInDate.toISOString().split('T')[0]
      const checkOutDateString = checkOutDate.toISOString().split('T')[0]

      // First get property timezone
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('timezone, unavailable_dates')
        .eq('id', propertyId)
        .single()

      if (propertyError) {
        throw new Error(`Failed to fetch property: ${propertyError.message}`)
      }

      const propertyTimezone = propertyData.timezone || 'UTC'

      // Create datetime strings in property timezone
      const checkInDateTime = createPropertyDateTime(checkInDateString, checkInTime)
      const checkOutDateTime = createPropertyDateTime(checkOutDateString, checkOutTime)

      // Use RPC function for complex availability check
      const { data, error } = await supabase
        .rpc('check_property_availability_new', {
          p_property_id: propertyId,
          p_check_in_datetime: checkInDateTime,
          p_check_out_datetime: checkOutDateTime
        })

      if (error) {
        throw new Error(`Availability check failed: ${error.message}`)
      }

      console.log('✅ Availability check result:', data)
      
      const result: AvailabilityResult = {
        is_available: data.is_available,
        conflict_reason: data.conflict_reason,
        conflicts: data.conflicts || [],
        property_timezone: data.property_timezone || propertyTimezone,
        total_conflicting_dates: data.total_conflicting_dates || 0
      }
      
      setAvailabilityResult(result)
      return result

    } catch (error) {
      console.error('❌ Error checking availability:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to check availability'
      setError(errorMessage)
      throw error
    } finally {
      setIsCheckingAvailability(false)
    }
  }, [setIsCheckingAvailability, setAvailabilityResult, setError, clearError])

  /**
   * Create a new booking request
   */
  const createBooking = useCallback(async (
    bookingData: BookingFormData
  ): Promise<string> => {
    setIsCreatingBooking(true)
    clearError()

    try {
      console.log('🔄 Creating booking request...')

      // First check availability one more time
      const availabilityCheck = await checkAvailability(
        bookingData.property_id,
        bookingData.check_in_date,
        bookingData.check_out_date,
        bookingData.check_in_time,
        bookingData.check_out_time
      )

      if (!availabilityCheck.is_available) {
        throw new Error(availabilityCheck.conflict_reason || 'Property is not available for selected dates')
      }

      // Verify user is logged in and we have their data
      if (!user || !user.id) {
        throw new Error('Authentication required')
      }
      console.log('🔄 User ID from auth store:', user.id)

      // Get property details for booking creation
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('host_id, timezone, price_per_night, cleaning_fee, service_fee, currency')
        .eq('id', bookingData.property_id)
        .single()

      if (propertyError) {
        throw new Error(`Failed to fetch property: ${propertyError.message}`)
      }

      // Calculate total amount and nights
      const nights = Math.ceil(
        (bookingData.check_out_date.getTime() - bookingData.check_in_date.getTime()) / (1000 * 60 * 60 * 24)
      )
      const basePrice = (property.price_per_night || 0) * nights
      const cleaningFee = property.cleaning_fee || 0
      const serviceFee = property.service_fee || 0
      const totalAmount = basePrice + cleaningFee + serviceFee

      // Insert booking using user.id from auth store
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          property_id: bookingData.property_id,
          guest_id: user.id, // Using user.id from auth store instead of Supabase auth user ID
          host_id: property.host_id,
          check_in_date: bookingData.check_in_date.toISOString().split('T')[0],
          check_out_date: bookingData.check_out_date.toISOString().split('T')[0],
          check_in_time: bookingData.check_in_time,
          check_out_time: bookingData.check_out_time,
          guest_count: bookingData.guest_count,
          special_requests: bookingData.special_requests,
          total_amount: totalAmount,
          cleaning_fee: cleaningFee,
          service_fee: serviceFee,
          currency: property.currency || 'USD',
          status: 'pending'
        })
        .select()
        .single()

      if (bookingError) {
        throw new Error(`Failed to create booking: ${bookingError.message}`)
      }

      console.log('✅ Booking created successfully:', booking.id)
      
      // The trigger will automatically update the property's unavailable_dates
      return booking.id

    } catch (error) {
      console.error('❌ Error creating booking:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking'
      setError(errorMessage)
      throw error
    } finally {
      setIsCreatingBooking(false)
    }
  }, [setIsCreatingBooking, setError, clearError, checkAvailability, user]) // Added user to dependencies

  /**
   * Cancel a booking
   */
  const cancelBooking = useCallback(async (
    bookingId: string,
    cancellationReason?: string
  ): Promise<void> => {
    try {
      console.log('🔄 Cancelling booking...')

      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancellation_reason: cancellationReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)

      if (error) {
        throw new Error(`Failed to cancel booking: ${error.message}`)
      }

      console.log('✅ Booking cancelled successfully')
      
      // The trigger will automatically remove dates from property's unavailable_dates

    } catch (error) {
      console.error('❌ Error cancelling booking:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel booking'
      setError(errorMessage)
      throw error
    }
  }, [setError])

  return {
    // State
    isCheckingAvailability,
    isCreatingBooking,
    error,
    availabilityResult,
    
    // Actions
    checkAvailability,
    createBooking,
    cancelBooking,
    clearError
  }
} 