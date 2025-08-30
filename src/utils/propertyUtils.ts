import { DatabaseProperty, Property, PropertySubmissionData } from '../interfaces'
import type { MapCoordinates } from '../interfaces/Map'

// Convert DatabaseProperty to Property for UI components
export const convertDatabasePropertyToProperty = (dbProperty: DatabaseProperty): Property => {
  return {
    id: dbProperty.id,
    title: dbProperty.title,
    description: dbProperty.description,
    price: dbProperty.price_per_night,
    price_per_night: dbProperty.price_per_night,
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
    host: {
      id: '',
      name: '',
      username: '',
      avatar_url: '',
      display_name: '',
      is_identity_verified: false,
      is_email_verified: false,
      email: '',
      phone: '',
      rating: 0,
      response_rate: 0,
      response_time: '',
      bio: ''
    },
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
    status: dbProperty.status,
    like_count: 0,
    // Add missing availability fields
    unavailable_dates: dbProperty.unavailable_dates || [],
    timezone: dbProperty.timezone || 'UTC'
  }
}

// Convert DatabaseProperty to PropertySubmissionData for form prefilling
export const convertDatabasePropertyToSubmissionData = (dbProperty: DatabaseProperty): Partial<PropertySubmissionData> => {
  return {
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
    property_type: dbProperty.property_type || 'house',
    amenities: dbProperty.amenities || [],
    max_guests: dbProperty.max_guests || 1,
    bedrooms: dbProperty.bedrooms || 1,
    bathrooms: dbProperty.bathrooms || 1,
    cleaning_fee: dbProperty.cleaning_fee || 0,
    service_fee: dbProperty.service_fee || 0,
    instant_book: true,
    additional_fees: [],
    // Default host data will be filled by the form component
    host: {
      id: '',
      name: '',
      username: '',
      avatar_url: '',
      display_name: '',
      is_identity_verified: false,
      is_email_verified: false,
      email: '',
      phone: '',
      rating: 0,
      response_rate: 0,
      response_time: '',
      bio: '',
      experience: 0
    }
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

// Example default host - commented out to avoid unused variable warning
// const defaultHost: PropertyHost = {
//   id: 'default-host',
//   name: 'Default Host',
//   username: 'defaulthost',
//   avatar_url: '/default-avatar.jpg',
//   display_name: 'Default Host',
//   is_identity_verified: false,
//   is_email_verified: false,
//   email: 'host@example.com',
//   phone: '+1234567890',
//   rating: 0,
//   response_rate: 0,
//   response_time: 'N/A',
//   bio: '',
//   experience: 0
// }

// Example default property - commented out to avoid unused variable warning
// const defaultProperty: Property = {
//   id: 'default-property',
//   title: 'Default Property',
//   description: 'A default property description',
//   price: 0,
//   price_per_night: 0,
//   currency: 'USD',
//   location: {
//     city: 'Default City',
//     country: 'Default Country',
//     address: 'Default Address',
//     coordinates: { lat: 0, lng: 0 }
//   },
//   images: [],
//   videos: [],
//   host: defaultHost,
//   rating: 0,
//   review_count: 0,
//   view_count: 0,
//   booking_count: 0,
//   total_revenue: 0,
//   property_type: 'Default',
//   amenities: [],
//   max_guests: 1,
//   bedrooms: 1,
//   bathrooms: 1,
//   cleaning_fee: 0,
//   service_fee: 0,
//   is_liked: false,
//   instant_book: true,
//   additional_fees: [],
//   distance: '0 km away',
//   created_at: new Date().toISOString(),
//   status: 'pending',
//   like_count: 0,
//   unavailable_dates: [],
//   timezone: 'UTC'
// }

// ================================================
// NEW AVAILABILITY & TIMEZONE UTILITIES
// ================================================

/**
 * Create datetime string in property timezone
 */
export const createPropertyDateTime = (
  date: string, // YYYY-MM-DD
  time: string // HH:MM:SS
  // timezoneParam: string = 'UTC' - commented out as not used in current implementation
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
  timezoneParam: string = 'UTC',
  locale: string = 'en-US'
): string => {
  try {
    const date = new Date(datetime)
    return new Intl.DateTimeFormat(locale, {
      timeZone: timezoneParam,
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
export const getTimezoneInfo = (timezoneParam: string = 'UTC'): {
  timezone: string
  displayName: string
  currentTime: string
  offsetFromUTC: string
} => {
  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezoneParam,
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })
    
    const parts = formatter.formatToParts(now)
    const timePart = parts.find(part => part.type === 'hour')?.value + ':' + 
                    parts.find(part => part.type === 'minute')?.value
    // Note: timezonePart and targetTime commented out to avoid unused variable warnings
    // const timezonePart = parts.find(part => part.type === 'timeZoneName')?.value || timezoneParam
    
    // Calculate offset - commented out unused variables
    // const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000)
    // const targetTime = new Date(utcTime + (getTimezoneOffset(timezoneParam) * 60000))
    const offset = getTimezoneOffset(timezoneParam) / 60
    const offsetString = `UTC${offset >= 0 ? '+' : ''}${offset}`
    
    return {
      timezone: timezoneParam,
      displayName: getTimezoneDisplayName(timezoneParam),
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
  
  const currentDate = new Date(start)
  
  while (currentDate < end) {
    const dateString = currentDate.toISOString().split('T')[0]
    const dateTime = createPropertyDateTime(dateString, startTime)
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

/**
 * Validate if property coordinates are valid for map display
 */
export const validatePropertyCoordinates = (property: Property): boolean => {
  const coords = getPropertyCoordinates(property)
  
  if (!coords) {
    return false
  }
  
  // Check if coordinates are within valid ranges
  const { lat, lng } = coords
  
  // Latitude must be between -90 and 90
  if (lat < -90 || lat > 90) {
    return false
  }
  
  // Longitude must be between -180 and 180
  if (lng < -180 || lng > 180) {
    return false
  }
  
  // Check if coordinates are not null/zero (0,0 is in the ocean, likely invalid)
  if (lat === 0 && lng === 0) {
    return false
  }
  
  return true
}

/**
 * Extract coordinates from property object with fallbacks
 */
export const getPropertyCoordinates = (property: Property): MapCoordinates | null => {
  try {
    // Primary: property.location.coordinates
    if (property.location?.coordinates?.lat && property.location?.coordinates?.lng) {
      return {
        lat: property.location.coordinates.lat,
        lng: property.location.coordinates.lng
      }
    }
    
    // Fallback: property.location.latitude/longitude (legacy format)
    if ((property.location as any)?.latitude && (property.location as any)?.longitude) {
      return {
        lat: (property.location as any).latitude,
        lng: (property.location as any).longitude
      }
    }
    
    console.warn('🗺️ Property coordinates not found or invalid:', property.id)
    return null
  } catch (error) {
    console.error('❌ Error extracting property coordinates:', error)
    return null
  }
}

/**
 * Get property location string for display
 */
export const getPropertyLocationString = (property: Property): string => {
  try {
    if (property.location?.city && property.location?.country) {
      return `${property.location.city}, ${property.location.country}`
    }
    
    if (property.location?.city) {
      return property.location.city
    }
    
    if (property.location?.country) {
      return property.location.country
    }
    
    return 'Location not specified'
  } catch (error) {
    console.error('❌ Error getting property location string:', error)
    return 'Location unavailable'
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export const calculateDistance = (
  coord1: MapCoordinates,
  coord2: MapCoordinates
): number => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(coord2.lat - coord1.lat)
  const dLng = toRadians(coord2.lng - coord1.lng)
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) * Math.cos(toRadians(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return Math.round(distance * 100) / 100 // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180)
}

/**
 * Format distance for display
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`
  } else {
    return `${Math.round(distance)}km`
  }
}

/**
 * Check if property has a valid address for geocoding
 */
export const hasValidAddress = (property: Property): boolean => {
  const location = property.location
  
  if (!location) {
    return false
  }
  
  // At minimum, we need city and country
  return Boolean(location.city && location.country)
}

/**
 * Generate Google Maps URL for property
 */
export const getGoogleMapsUrl = (property: Property): string => {
  const coords = getPropertyCoordinates(property)
  
  if (coords) {
    return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`
  }
  
  // Fallback to search by address
  const locationString = getPropertyLocationString(property)
  const encodedLocation = encodeURIComponent(locationString)
  return `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`
}

/**
 * Generate directions URL to property
 */
export const getDirectionsUrl = (property: Property): string => {
  const coords = getPropertyCoordinates(property)
  
  if (coords) {
    return `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`
  }
  
  // Fallback to search by address
  const locationString = getPropertyLocationString(property)
  const encodedLocation = encodeURIComponent(locationString)
  return `https://www.google.com/maps/dir/?api=1&destination=${encodedLocation}`
}

/**
 * Property map error types for better error handling
 */
export enum PropertyMapError {
  INVALID_COORDINATES = 'INVALID_COORDINATES',
  MISSING_COORDINATES = 'MISSING_COORDINATES',
  GEOCODING_FAILED = 'GEOCODING_FAILED',
  MAP_LOAD_FAILED = 'MAP_LOAD_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

/**
 * Get user-friendly error message for property map errors
 */
export const getPropertyMapErrorMessage = (error: PropertyMapError | string): string => {
  switch (error) {
    case PropertyMapError.INVALID_COORDINATES:
      return 'The property location coordinates are invalid.'
    case PropertyMapError.MISSING_COORDINATES:
      return 'Property location coordinates are not available.'
    case PropertyMapError.GEOCODING_FAILED:
      return 'Unable to find the exact location on the map.'
    case PropertyMapError.MAP_LOAD_FAILED:
      return 'Failed to load the map. Please try again.'
    case PropertyMapError.NETWORK_ERROR:
      return 'Network error while loading the map.'
    default:
      return 'An unexpected error occurred while loading the map.'
  }
} 