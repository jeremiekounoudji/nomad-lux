import { DatabaseProperty, Property, PropertyHost } from '../interfaces'

// Convert DatabaseProperty to Property for UI components
export const convertDatabasePropertyToProperty = (dbProperty: DatabaseProperty): Property => {
  // Create a mock host for now - in real app this would come from a join or separate query
  const mockHost: PropertyHost = {
    id: dbProperty.host_id,
    name: 'Property Host', // TODO: Get real host data
    username: 'host_user',
    avatar_url: '/default-avatar.jpg',
    display_name: 'Property Host',
    is_identity_verified: true,
    is_email_verified: true,
    email: 'host@example.com',
    phone: '+1234567890',
    rating: 4.8,
    response_rate: 95,
    response_time: '< 1 hour',
    bio: '',
    experience: 1
  }

  return {
    id: dbProperty.id,
    title: dbProperty.title,
    description: dbProperty.description,
    price: dbProperty.price_per_night,
    currency: dbProperty.currency || 'USD',
    location: typeof dbProperty.location === 'object' ? {
      city: dbProperty.location.city || '',
      country: dbProperty.location.country || '',
      address: dbProperty.location.address || '',
      coordinates: dbProperty.location.coordinates || { lat: 0, lng: 0 }
    } : {
      city: '',
      country: '',
      address: '',
      coordinates: { lat: 0, lng: 0 }
    },
    images: dbProperty.images || [],
    videos: dbProperty.video ? [dbProperty.video] : [],
    host: mockHost,
    rating: dbProperty.rating || 0,
    review_count: dbProperty.review_count || 0,
    view_count: dbProperty.view_count || 0,
    booking_count: dbProperty.booking_count || 0,
    total_revenue: dbProperty.total_revenue || 0,
    property_type: dbProperty.property_type || 'house',
    amenities: dbProperty.amenities || [],
    max_guests: dbProperty.max_guests || 1,
    bedrooms: dbProperty.bedrooms || 1,
    bathrooms: dbProperty.bathrooms || 1,
    is_liked: false,
    instant_book: true,
    created_at: dbProperty.created_at,
    cleaning_fee: dbProperty.cleaning_fee || 0,
    service_fee: dbProperty.service_fee || 0,
    total_before_taxes: dbProperty.price_per_night + (dbProperty.cleaning_fee || 0) + (dbProperty.service_fee || 0),
    additional_fees: [],
    distance: '0 km away',
    status: dbProperty.status
  }
}

// Convert Property back to DatabaseProperty for database operations
export const convertPropertyToDatabaseProperty = (property: Property): Partial<DatabaseProperty> => {
  return {
    title: property.title,
    description: property.description,
    price_per_night: property.price,
    location: {
      address: property.location.address || '',
      city: property.location.city,
      country: property.location.country,
      coordinates: property.location.coordinates
    },
    amenities: property.amenities,
    images: property.images,
    video: property.videos?.[0] || '',
    // Note: status, timestamps, and host_id should be handled separately
  }
}

// Helper to get status display name
export const getStatusDisplayName = (status: string): string => {
  switch (status) {
    case 'approved': return 'Approved'
    case 'pending': return 'Pending Review'
    case 'paused': return 'Paused'
    case 'rejected': return 'Rejected'
    default: return status
  }
}

// Helper to get status color
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'success'
    case 'pending': return 'warning'
    case 'paused': return 'secondary'
    case 'rejected': return 'danger'
    default: return 'default'
  }
}

const defaultHost: PropertyHost = {
  id: 'default-host',
  name: 'Default Host',
  username: 'defaulthost',
  avatar_url: '/default-avatar.jpg',
  display_name: 'Default Host',
  is_identity_verified: false,
  is_email_verified: false,
  email: 'host@example.com',
  phone: '+1234567890',
  rating: 0,
  response_rate: 0,
  response_time: 'N/A',
  bio: '',
  experience: 0
}

const defaultProperty: Property = {
  id: 'default-property',
  title: 'Default Property',
  description: 'A default property description',
  price: 0,
  currency: 'USD',
  location: {
    city: 'Default City',
    country: 'Default Country',
    address: 'Default Address',
    coordinates: { lat: 0, lng: 0 }
  },
  images: [],
  videos: [],
  host: defaultHost,
  rating: 0,
  review_count: 0,
  view_count: 0,
  booking_count: 0,
  total_revenue: 0,
  property_type: 'Default',
  amenities: [],
  max_guests: 1,
  bedrooms: 1,
  bathrooms: 1,
  cleaning_fee: 0,
  service_fee: 0,
  is_liked: false,
  instant_book: true,
  additional_fees: [],
  distance: '0 km away',
  created_at: new Date().toISOString(),
  status: 'pending'
}

// ================================================
// NEW AVAILABILITY & TIMEZONE UTILITIES
// ================================================

/**
 * Create datetime string in property timezone
 */
export const createPropertyDateTime = (
  date: string, // YYYY-MM-DD
  time: string, // HH:MM:SS
  timezone: string = 'UTC'
): string => {
  try {
    const dateTimeString = `${date}T${time}`
    const dateTime = new Date(dateTimeString)
    
    // Create a proper ISO string considering the timezone
    // Note: This is a simplified approach. In production, you'd use a library like date-fns-tz
    return dateTime.toISOString()
  } catch (error) {
    console.error('Error creating property datetime:', error)
    return new Date().toISOString()
  }
}

/**
 * Format datetime for display in property timezone
 */
export const formatDateTimeInTimezone = (
  datetime: string,
  timezone: string = 'UTC',
  locale: string = 'en-US'
): string => {
  try {
    const date = new Date(datetime)
    return new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch (error) {
    console.error('Error formatting datetime:', error)
    return datetime
  }
}

/**
 * Get timezone display information
 */
export const getTimezoneInfo = (timezone: string = 'UTC'): {
  timezone: string
  displayName: string
  currentTime: string
  offsetFromUTC: string
} => {
  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })
    
    const parts = formatter.formatToParts(now)
    const timePart = parts.find(part => part.type === 'hour')?.value + ':' + 
                    parts.find(part => part.type === 'minute')?.value
    const timezonePart = parts.find(part => part.type === 'timeZoneName')?.value || timezone
    
    // Calculate offset
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000)
    const targetTime = new Date(utcTime + (getTimezoneOffset(timezone) * 60000))
    const offset = getTimezoneOffset(timezone) / 60
    const offsetString = `UTC${offset >= 0 ? '+' : ''}${offset}`
    
    return {
      timezone,
      displayName: getTimezoneDisplayName(timezone),
      currentTime: timePart || now.toLocaleTimeString(),
      offsetFromUTC: offsetString
    }
  } catch (error) {
    console.error('Error getting timezone info:', error)
    return {
      timezone: 'UTC',
      displayName: 'Coordinated Universal Time',
      currentTime: new Date().toLocaleTimeString(),
      offsetFromUTC: 'UTC+0'
    }
  }
}

/**
 * Get timezone offset in minutes
 */
const getTimezoneOffset = (timezone: string): number => {
  try {
    const now = new Date()
    const utc1 = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
    const utc2 = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
    return (utc2.getTime() - utc1.getTime()) / (1000 * 60)
  } catch {
    return 0
  }
}

/**
 * Get human-readable timezone display name
 */
const getTimezoneDisplayName = (timezone: string): string => {
  const timezoneNames: Record<string, string> = {
    'UTC': 'Coordinated Universal Time',
    'America/New_York': 'Eastern Time',
    'America/Chicago': 'Central Time',
    'America/Denver': 'Mountain Time',
    'America/Los_Angeles': 'Pacific Time',
    'Europe/London': 'Greenwich Mean Time',
    'Europe/Paris': 'Central European Time',
    'Europe/Berlin': 'Central European Time',
    'Asia/Tokyo': 'Japan Standard Time',
    'Asia/Shanghai': 'China Standard Time',
    'Australia/Sydney': 'Australian Eastern Time'
  }
  
  return timezoneNames[timezone] || timezone
}

/**
 * Generate date range for availability checking
 */
export const generateDateRange = (
  startDate: string,
  endDate: string,
  startTime: string = '15:00:00',
  timezone: string = 'UTC'
): string[] => {
  const dates: string[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  let currentDate = new Date(start)
  
  while (currentDate < end) {
    const dateString = currentDate.toISOString().split('T')[0]
    const dateTime = createPropertyDateTime(dateString, startTime, timezone)
    dates.push(dateTime)
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return dates
}

/**
 * Check if two date ranges overlap
 */
export const doDateRangesOverlap = (
  range1Start: string,
  range1End: string,
  range2Start: string,
  range2End: string
): boolean => {
  const start1 = new Date(range1Start)
  const end1 = new Date(range1End)
  const start2 = new Date(range2Start)
  const end2 = new Date(range2End)
  
  return start1 < end2 && start2 < end1
}

/**
 * Validate booking date range
 */
export const validateBookingDates = (
  checkIn: string,
  checkOut: string,
  unavailableDates: string[] = []
): {
  isValid: boolean
  errors: string[]
  conflicts: string[]
} => {
  const errors: string[] = []
  const conflicts: string[] = []
  
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  const now = new Date()
  
  // Basic validations
  if (checkInDate <= now) {
    errors.push('Check-in date must be in the future')
  }
  
  if (checkOutDate <= checkInDate) {
    errors.push('Check-out date must be after check-in date')
  }
  
  // Check for conflicts with unavailable dates
  const requestedDates = generateDateRange(
    checkInDate.toISOString().split('T')[0],
    checkOutDate.toISOString().split('T')[0]
  )
  
  requestedDates.forEach(date => {
    const dateOnly = date.split('T')[0]
    const hasConflict = unavailableDates.some(unavailableDate => {
      const unavailableDateOnly = unavailableDate.split('T')[0]
      return unavailableDateOnly === dateOnly
    })
    
    if (hasConflict) {
      conflicts.push(date)
    }
  })
  
  if (conflicts.length > 0) {
    errors.push(`${conflicts.length} date(s) in your selected range are unavailable`)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    conflicts
  }
} 