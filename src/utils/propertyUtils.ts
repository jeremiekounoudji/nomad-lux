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