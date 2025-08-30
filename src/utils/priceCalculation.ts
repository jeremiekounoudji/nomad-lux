import { Property, PriceBreakdown } from '../interfaces'

/**
 * Calculate hours between two dates and times
 */
export const calculateHoursBetween = (
  checkIn: Date,
  checkOut: Date,
  checkInTime: string,
  checkOutTime: string
): number => {
  // Parse times (format: "15:00:00")
  const [checkInHour, checkInMinute] = checkInTime.split(':').map(Number)
  const [checkOutHour, checkOutMinute] = checkOutTime.split(':').map(Number)
  
  // Create datetime objects
  const checkInDateTime = new Date(checkIn)
  checkInDateTime.setHours(checkInHour, checkInMinute, 0, 0)
  
  const checkOutDateTime = new Date(checkOut)
  checkOutDateTime.setHours(checkOutHour, checkOutMinute, 0, 0)
  
  // Calculate difference in hours
  const diffMs = checkOutDateTime.getTime() - checkInDateTime.getTime()
  return diffMs / (1000 * 60 * 60) // Convert to hours
}

/**
 * Calculate booking price with 24-hour minimum rule
 * Replaces the RPC function calculate_booking_price_v2
 */
export const calculateBookingPrice = (
  property: Property,
  checkIn: Date,
  checkOut: Date,
  checkInTime: string = '15:00:00',
  checkOutTime: string = '11:00:00',
  guestCount: number = 1,
  taxRate: number = 0.1
): PriceBreakdown => {
  // Input validation
  if (!property) {
    throw new Error('Property data is required')
  }
  
  if (guestCount > property.max_guests) {
    throw new Error(`Guest count (${guestCount}) exceeds property capacity (${property.max_guests})`)
  }
  
  if (checkOut <= checkIn) {
    throw new Error('Check-out date must be after check-in date')
  }
  
  // Calculate duration
  const totalHours = calculateHoursBetween(checkIn, checkOut, checkInTime, checkOutTime)
  
  if (totalHours <= 0) {
    throw new Error('Invalid date/time range')
  }
  
  // Apply 24-hour minimum billing rule
  const minimumChargeApplied = totalHours < 24
  const billingNights = minimumChargeApplied ? 1 : Math.ceil(totalHours / 24)
  
  // Calculate costs
  const basePrice = property.price * billingNights
  const cleaningFee = property.cleaning_fee || 0
  const serviceFee = property.service_fee || 0
  
  // Calculate subtotal before taxes
  const subtotal = basePrice + cleaningFee + serviceFee
  
  // Calculate taxes
  const taxes = subtotal * taxRate
  
  // Calculate total
  const totalAmount = subtotal + taxes
  
  return {
    basePrice,
    cleaningFee,
    serviceFee,
    taxes,
    totalAmount,
    billingNights,
    totalHours,
    minimumChargeApplied,
    currency: property.currency || 'USD'
  }
}

/**
 * Real-time price calculation for booking form
 * Returns null if inputs are invalid
 */
export const calculatePriceRealtime = (
  property: Property | null,
  checkIn: Date | null,
  checkOut: Date | null,
  checkInTime: string,
  checkOutTime: string,
  guestCount: number,
  taxRate: number = 0.1
): PriceBreakdown | null => {
  try {
    if (!property || !checkIn || !checkOut) {
      return null
    }
    
    return calculateBookingPrice(
      property,
      checkIn,
      checkOut,
      checkInTime,
      checkOutTime,
      guestCount,
      taxRate
    )
  } catch (error) {
    // Return null for invalid inputs instead of throwing
    console.warn('Price calculation error:', error)
    return null
  }
}

/**
 * Format price for display
 */
export const formatPrice = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Format duration for display
 */
export const formatDuration = (
  totalHours: number,
  billingNights: number,
  minimumChargeApplied: boolean
): string => {
  if (minimumChargeApplied) {
    return `${totalHours.toFixed(1)} hours (billed as 1 night)`
  }
  
  if (billingNights === 1) {
    return '1 night'
  }
  
  return `${billingNights} nights`
}

/**
 * Get price breakdown summary for display
 */
export const getPriceBreakdownSummary = (breakdown: PriceBreakdown) => {
  const items = [
    {
      label: `Base price (${breakdown.billingNights} ${breakdown.billingNights === 1 ? 'night' : 'nights'})`,
      amount: breakdown.basePrice,
      currency: breakdown.currency
    }
  ]
  
  if (breakdown.cleaningFee > 0) {
    items.push({
      label: 'Cleaning fee',
      amount: breakdown.cleaningFee,
      currency: breakdown.currency
    })
  }
  
  if (breakdown.serviceFee > 0) {
    items.push({
      label: 'Service fee',
      amount: breakdown.serviceFee,
      currency: breakdown.currency
    })
  }
  
  if (breakdown.taxes > 0) {
    items.push({
      label: 'Taxes',
      amount: breakdown.taxes,
      currency: breakdown.currency
    })
  }
  
  return {
    items,
    total: {
      label: 'Total',
      amount: breakdown.totalAmount,
      currency: breakdown.currency
    },
    minimumChargeNote: breakdown.minimumChargeApplied ? 
      `Note: Stays under 24 hours are billed as 1 full night (${breakdown.totalHours.toFixed(1)} hours)` : 
      null
  }
} 