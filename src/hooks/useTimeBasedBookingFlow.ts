import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../lib/stores/authStore'

interface TimeSlot {
  id: string
  date: string
  startTime: string
  endTime: string
  isAvailable: boolean
  bookingId?: string
  blockedReason?: 'booking' | 'maintenance' | 'host_blocked'
  price?: number
}

interface DayAvailability {
  date: string
  isFullyAvailable: boolean
  isPartiallyAvailable: boolean
  isFullyBooked: boolean
  timeSlots: TimeSlot[]
  totalAvailableHours: number
}

interface TimeBasedAvailabilityResult {
  propertyId: string
  bookingType: 'full_day' | 'time_slot' | 'both'
  timezone: string
  availabilityData: DayAvailability[]
  slotDuration: number // minutes
  availableTimeRange: {
    start: string // HH:MM
    end: string // HH:MM
  }
}

interface TimeBasedBookingData {
  propertyId: string
  bookingType: 'full_day' | 'time_slot'
  date: string
  timeSlotIds: string[]
  guestCount: number
  specialRequests?: string
}

export const useTimeBasedBookingFlow = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availabilityResult, setAvailabilityResult] = useState<TimeBasedAvailabilityResult | null>(null)
  
  const { user } = useAuthStore()

  /**
   * Fetch time-based availability for a property
   */
  const fetchAvailability = useCallback(async (
    propertyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TimeBasedAvailabilityResult> => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('🔄 Fetching time-based availability...')

      // Get property configuration
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select(`
          id,
          timezone,
          booking_type,
          time_slot_duration,
          available_time_range
        `)
        .eq('id', propertyId)
        .single()

      if (propertyError) {
        throw new Error(`Failed to fetch property: ${propertyError.message}`)
      }

      // Get time slots for the date range
      const { data: timeSlots, error: slotsError } = await supabase
        .from('property_time_slots')
        .select('*')
        .eq('property_id', propertyId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })

      if (slotsError) {
        throw new Error(`Failed to fetch time slots: ${slotsError.message}`)
      }

      // Process availability data by date
      const availabilityMap = new Map<string, DayAvailability>()
      
      // Initialize dates in range
      const currentDate = new Date(startDate)
      while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split('T')[0]
        availabilityMap.set(dateString, {
          date: dateString,
          isFullyAvailable: false,
          isPartiallyAvailable: false,
          isFullyBooked: false,
          timeSlots: [],
          totalAvailableHours: 0
        })
        currentDate.setDate(currentDate.getDate() + 1)
      }

      // Group time slots by date
      timeSlots?.forEach(slot => {
        const dayData = availabilityMap.get(slot.date)
        if (dayData) {
          dayData.timeSlots.push({
            id: slot.id,
            date: slot.date,
            startTime: slot.start_time,
            endTime: slot.end_time,
            isAvailable: slot.is_available,
            bookingId: slot.booking_id,
            blockedReason: slot.blocked_reason as any,
            price: slot.price
          })
        }
      })

      // Calculate availability status for each day
      availabilityMap.forEach((dayData, date) => {
        const availableSlots = dayData.timeSlots.filter(slot => slot.isAvailable)
        const totalSlots = dayData.timeSlots.length
        
        dayData.totalAvailableHours = availableSlots.reduce((total, slot) => {
          const start = new Date(`2000-01-01T${slot.startTime}`)
          const end = new Date(`2000-01-01T${slot.endTime}`)
          return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        }, 0)

        if (totalSlots === 0) {
          // No slots defined - generate default slots or mark as unavailable
          dayData.isFullyBooked = true
        } else if (availableSlots.length === totalSlots) {
          dayData.isFullyAvailable = true
        } else if (availableSlots.length > 0) {
          dayData.isPartiallyAvailable = true
        } else {
          dayData.isFullyBooked = true
        }
      })

      const result: TimeBasedAvailabilityResult = {
        propertyId,
        bookingType: property.booking_type || 'full_day',
        timezone: property.timezone || 'UTC',
        availabilityData: Array.from(availabilityMap.values()),
        slotDuration: property.time_slot_duration || 120, // default 2 hours
        availableTimeRange: property.available_time_range || {
          start: '06:00',
          end: '22:00'
        }
      }

      setAvailabilityResult(result)
      return result

    } catch (error) {
      console.error('❌ Error fetching availability:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch availability'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Check if specific time slots are available
   */
  const checkTimeSlotAvailability = useCallback(async (
    propertyId: string,
    date: string,
    timeSlotIds: string[]
  ): Promise<boolean> => {
    try {
      console.log('🔄 Checking time slot availability...')

      const { data: slots, error } = await supabase
        .from('property_time_slots')
        .select('id, is_available')
        .eq('property_id', propertyId)
        .eq('date', date)
        .in('id', timeSlotIds)

      if (error) {
        throw new Error(`Failed to check availability: ${error.message}`)
      }

      // All requested slots must be available
      const allAvailable = slots?.every(slot => slot.is_available) ?? false
      const foundAllSlots = slots?.length === timeSlotIds.length

      return allAvailable && foundAllSlots

    } catch (error) {
      console.error('❌ Error checking time slot availability:', error)
      return false
    }
  }, [])

  /**
   * Create a time-based booking
   */
  const createTimeBasedBooking = useCallback(async (
    bookingData: TimeBasedBookingData
  ): Promise<string> => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('🔄 Creating time-based booking...')

      if (!user?.id) {
        throw new Error('Authentication required')
      }

      // Double-check availability
      const isAvailable = await checkTimeSlotAvailability(
        bookingData.propertyId,
        bookingData.date,
        bookingData.timeSlotIds
      )

      if (!isAvailable) {
        throw new Error('Selected time slots are no longer available')
      }

      // Get property details
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('host_id, timezone, price_per_night, cleaning_fee, service_fee, currency')
        .eq('id', bookingData.propertyId)
        .single()

      if (propertyError) {
        throw new Error(`Failed to fetch property: ${propertyError.message}`)
      }

      // Get time slot details for pricing
      const { data: timeSlots, error: slotsError } = await supabase
        .from('property_time_slots')
        .select('*')
        .in('id', bookingData.timeSlotIds)

      if (slotsError) {
        throw new Error(`Failed to fetch time slots: ${slotsError.message}`)
      }

      // Calculate pricing based on time slots
      const totalHours = timeSlots?.reduce((total, slot) => {
        const start = new Date(`2000-01-01T${slot.start_time}`)
        const end = new Date(`2000-01-01T${slot.end_time}`)
        return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      }, 0) || 0

      const hourlyRate = (property.price_per_night || 0) / 24 // Convert daily rate to hourly
      const basePrice = hourlyRate * totalHours
      const cleaningFee = bookingData.bookingType === 'full_day' ? (property.cleaning_fee || 0) : 0
      const serviceFee = property.service_fee || 0
      const totalAmount = basePrice + cleaningFee + serviceFee

      // Create booking record
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          property_id: bookingData.propertyId,
          guest_id: user.id,
          host_id: property.host_id,
          check_in_date: bookingData.date,
          check_out_date: bookingData.date, // Same day for time slots
          guest_count: bookingData.guestCount,
          special_requests: bookingData.specialRequests,
          total_amount: totalAmount,
          cleaning_fee: cleaningFee,
          service_fee: serviceFee,
          currency: property.currency || 'USD',
          booking_type: bookingData.bookingType,
          time_slot_ids: bookingData.timeSlotIds,
          status: 'pending'
        })
        .select()
        .single()

      if (bookingError) {
        throw new Error(`Failed to create booking: ${bookingError.message}`)
      }

      // Update time slots to mark as booked
      const { error: updateError } = await supabase
        .from('property_time_slots')
        .update({
          is_available: false,
          booking_id: booking.id,
          blocked_reason: 'booking'
        })
        .in('id', bookingData.timeSlotIds)

      if (updateError) {
        // Rollback booking if slot update fails
        await supabase.from('bookings').delete().eq('id', booking.id)
        throw new Error(`Failed to reserve time slots: ${updateError.message}`)
      }

      console.log('✅ Time-based booking created successfully:', booking.id)
      return booking.id

    } catch (error) {
      console.error('❌ Error creating time-based booking:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [user, checkTimeSlotAvailability])

  /**
   * Cancel a time-based booking
   */
  const cancelTimeBasedBooking = useCallback(async (
    bookingId: string,
    cancellationReason?: string
  ): Promise<void> => {
    try {
      console.log('🔄 Cancelling time-based booking...')

      // Get booking details
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('time_slot_ids')
        .eq('id', bookingId)
        .single()

      if (bookingError) {
        throw new Error(`Failed to fetch booking: ${bookingError.message}`)
      }

      // Update booking status
      const { error: updateBookingError } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancellation_reason: cancellationReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)

      if (updateBookingError) {
        throw new Error(`Failed to cancel booking: ${updateBookingError.message}`)
      }

      // Release time slots
      if (booking.time_slot_ids && booking.time_slot_ids.length > 0) {
        const { error: releaseError } = await supabase
          .from('property_time_slots')
          .update({
            is_available: true,
            booking_id: null,
            blocked_reason: null
          })
          .in('id', booking.time_slot_ids)

        if (releaseError) {
          console.error('⚠️ Failed to release time slots:', releaseError.message)
          // Don't throw here as booking is already cancelled
        }
      }

      console.log('✅ Time-based booking cancelled successfully')

    } catch (error) {
      console.error('❌ Error cancelling time-based booking:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel booking'
      setError(errorMessage)
      throw error
    }
  }, [])

  return {
    // State
    isLoading,
    error,
    availabilityResult,
    
    // Actions
    fetchAvailability,
    checkTimeSlotAvailability,
    createTimeBasedBooking,
    cancelTimeBasedBooking,
    
    // Utilities
    clearError: () => setError(null)
  }
}