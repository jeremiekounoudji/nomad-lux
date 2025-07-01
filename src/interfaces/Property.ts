// Property-related interfaces

// Property status type
export type PropertyStatus = 'approved' | 'pending' | 'paused' | 'rejected'

// City interface for property listings
export interface City {
  id: string
  name: string
  country: string
  property_count: number
  average_price: number
  featured_image: string
  coordinates: {
    lat: number
    lng: number
  }
}

// Simplified host interface for property listings
export interface PropertyHost {
  id: string
  name: string
  username: string
  avatar_url: string
  display_name: string
  is_identity_verified: boolean
  is_email_verified: boolean
  email: string
  phone: string
  rating: number
  response_rate: number
  response_time: string
  bio?: string
  experience?: number
}

// Property statistics interface
export interface PropertyStats {
  view_count: number
  booking_count: number
  total_revenue: number
  rating: number
  rating_count: number
}

// Property submission data interface is now in PropertySubmissionData.ts

export interface Property {
  id: string
  title: string
  description: string
  price: number
  price_per_night: number
  currency: string
  location: {
    city: string
    country: string
    address?: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  images: string[]
  videos: string[]
  host: PropertyHost
  rating: number
  review_count: number
  view_count: number
  booking_count: number
  total_revenue: number
  property_type: string
  amenities: string[]
  max_guests: number
  bedrooms: number
  bathrooms: number
  cleaning_fee: number
  service_fee: number
  is_liked: boolean
  instant_book: boolean
  additional_fees: any[]
  distance: string
  created_at: string
  total_before_taxes?: number
  status?: PropertyStatus
  
  // New availability management fields
  unavailable_dates?: string[]
  timezone?: string
  like_count: number
}

// Admin property interface
export interface AdminProperty {
  id: string
  title: string
  description: string
  location: string
  coordinates: {
    lat: number
    lng: number
  }
  price: number
  images: string[]
  video?: string
  host: {
    name: string
    email: string
    rating: number
    joinDate: string
  }
  submittedDate: string
  status: 'pending' | 'approved' | 'rejected' | 'paused'
  amenities: string[]
  propertyType: string
  bedrooms: number
  bathrooms: number
  maxGuests: number
}

export interface PopularPlace {
  id: string
  name: string
  image: string
  propertyCount: number
  country: string
}

export interface ListingStats {
  views: number
  bookings: number
  revenue: number
  rating: number
  status: 'approved' | 'pending' | 'paused' | 'rejected'
}

export interface TopProperty {
  id: string
  title: string
  image: string
  location: string
  revenue: number     
  bookings: number
  rating: number
  host: string
}

// Database property interface - matches Supabase schema
export interface DatabaseProperty {
  id: string
  host_id: string
  property_settings_id?: string // Reference to host_property_settings
  title: string
  description: string
  price_per_night: number
  currency: string
  location: {
    address: string
    city: string
    country: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  amenities: string[]
  images: string[]
  video?: string
  property_type: string
  max_guests: number
  bedrooms: number
  bathrooms: number
  cleaning_fee?: number
  service_fee?: number
  status: PropertyStatus
  
  // New availability management fields
  unavailable_dates?: string[] // Array of ISO datetime strings
  timezone?: string // Property timezone (e.g., 'America/New_York', 'Europe/London')
  
  created_at: string
  updated_at: string
  approved_at?: string
  approved_by?: string
  rejection_reason?: string
  rejected_at?: string
  rejected_by?: string
  rating: number
  review_count: number
  view_count: number
  booking_count: number
  total_revenue: number
  status_counts?: {
    pending: number
    approved: number
    rejected: number
    paused: number
  }
  total_count?: number
}

// Property edit confirmation interface
export interface PropertyEditConfirmation {
  property: DatabaseProperty
  willResetToPending: boolean
  currentStatus: string
} 