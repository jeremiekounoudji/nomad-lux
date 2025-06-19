// User-related interfaces matching the database schema

// User role enum matching the database
export type UserRole = 'guest' | 'host' | 'both' | 'admin' | 'super_admin'

// User status enum matching the database  
export type UserStatus = 'active' | 'suspended' | 'pending' | 'banned'

// Main User interface matching the database schema
export interface User {
  id: string
  auth_id: string
  email: string
  display_name: string
  username?: string
  avatar_url?: string
  phone?: string
  bio?: string
  location?: string
  date_of_birth?: string
  
  // Verification status
  is_phone_verified: boolean
  is_email_verified: boolean
  is_identity_verified: boolean
  
  // User role and status
  user_role: UserRole
  account_status: UserStatus
  
  // Host specific fields
  is_host: boolean
  host_since?: string
  response_rate: number
  response_time?: string
  
  // Ratings and statistics
  guest_rating: number
  host_rating: number
  total_guest_reviews: number
  total_host_reviews: number
  total_bookings: number
  total_properties: number
  total_revenue: number
  
  // Preferences
  preferred_currency: string
  language_preference: string
  timezone?: string
  
  // Activity tracking
  last_login?: string
  created_at: string
  updated_at: string
}

// Extended host interface for form submission
export interface HostSubmissionData extends User {
  // Additional fields can be added here if needed
}

// Admin user interface (simplified view for admin panels)
export interface AdminUser {
  id: string
  name: string // display_name
  email: string
  phone: string
  avatar?: string // avatar_url
  status: UserStatus
  role: UserRole
  joinDate: string // created_at
  lastLogin: string // last_login
  totalBookings: number // total_bookings
  totalProperties: number // total_properties
  revenue: number // total_revenue
  rating: number // average of guest_rating and host_rating
} 