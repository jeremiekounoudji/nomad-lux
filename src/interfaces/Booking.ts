// Booking-related interfaces

export type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'rejected'
  | 'accepted-and-waiting-for-payment'
  | 'payment-failed'

// Main booking interface matching database schema
export interface DatabaseBooking {
  id: string
  property_id: string
  guest_id: string
  host_id: string
  
  // Booking Details
  check_in_date: string
  check_out_date: string
  check_in_time?: string
  check_out_time?: string
  guest_count: number
  
  // Pricing
  total_amount: number
  cleaning_fee?: number
  service_fee?: number
  taxes?: number
  currency: string
  
  // Status & Management
  status: BookingStatus
  is_no_show: boolean
  special_requests?: string
  cancellation_reason?: string
  reject_reason?: string
  host_notes?: string
  guest_notes?: string
  
  // Approval & Timestamps
  host_approved_at?: string
  cancelled_at?: string
  payment_deadline?: string
  created_at: string
  updated_at?: string
}

// Frontend booking interface for display (with joined data)
export interface Booking {
  id: string
  propertyName: string
  propertyImage: string
  location: string
  rating: number
  checkIn: string
  checkOut: string
  guests: number
  totalPrice: number
  status: BookingStatus
  hostName: string
  hostAvatar: string
  hostPhone: string
  hostEmail: string
  bookingDate: string
  paymentMethod: string
  specialRequests?: string
  amenities: string[]
  cleaningFee: number
  serviceFee: number
  taxes: number
  bookingTimeline: {
    date: string
    event: string
    description: string
  }[]
}

// Admin booking interface
export interface AdminBooking {
  id: string
  propertyId: string
  propertyTitle: string
  propertyImage: string
  guestName: string
  guestEmail: string
  guestPhone: string
  hostName: string
  hostEmail: string
  hostPhone: string
  checkIn: string
  checkOut: string
  totalAmount: number
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'dispute'
  paymentStatus: 'paid' | 'pending' | 'refunded' | 'partial_refund'
  bookingDate: string
  guests: number
  nights: number
  disputeReason?: string
  disputeDate?: string
  lastActivity: string
}

// Booking creation data
export interface BookingCreateData {
  property_id: string
  guest_id: string
  host_id: string
  check_in_date: string
  check_out_date: string
  check_in_time: string
  check_out_time: string
  guest_count: number
  total_amount: number
  cleaning_fee: number
  service_fee: number
  taxes: number
  currency: string
  special_requests?: string
}

// Booking form data for frontend
export interface BookingFormData {
  property_id: string
  check_in_date: Date
  check_out_date: Date
  check_in_time: string
  check_out_time: string
  guest_count: number
  special_requests?: string
}

// Price calculation result
export interface PriceBreakdown {
  basePrice: number
  cleaningFee: number
  serviceFee: number
  taxes: number
  totalAmount: number
  billingNights: number
  totalHours: number
  minimumChargeApplied: boolean
  currency: string
}

// Availability check result (from RPC) - Updated for new system
export interface AvailabilityResult {
  is_available: boolean
  conflict_reason?: string
  conflicts: string[] // Array of conflicting datetime strings
  property_timezone: string
  total_conflicting_dates: number
}

// Enhanced availability data for calendar display
export interface EnhancedAvailabilityData {
  date: string // Date string (YYYY-MM-DD)
  datetime: string // Full datetime string (ISO format)
  isAvailable: boolean
  conflictReason?: string
  propertyTimezone: string
}

// Availability check request
export interface AvailabilityCheckRequest {
  propertyId: string
  checkInDateTime: string // ISO datetime string
  checkOutDateTime: string // ISO datetime string
}

// Timezone display info for UI
export interface PropertyTimezoneInfo {
  timezone: string
  displayName: string
  currentTime: string
  offsetFromUTC: string
}

// BookingRequest interface - for displaying booking requests in host dashboard
// This combines data from bookings + properties + users tables (snake_case from DB)
export interface BookingRequest extends DatabaseBooking {
  // Property details (from join)
  property_title: string
  property_images: string[]
  property_location?: string

  // Guest details (from join)
  guest_display_name: string
  guest_avatar_url?: string
  guest_email: string
  guest_phone?: string
  guest_rating: number
  total_guest_reviews: number

  // Payment info
  payment_method?: string
  payment_status?: string
}

export interface Dispute {
  id: string
  bookingId: string
  type: 'cancellation' | 'refund' | 'property_issue' | 'guest_behavior' | 'payment_issue'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  reporter: 'guest' | 'host'
  description: string
  status: 'open' | 'investigating' | 'resolved' | 'escalated'
  createdDate: string
  assignedTo?: string
  messages: Array<{
    id: string
    sender: string
    message: string
    timestamp: string
    isAdmin: boolean
  }>
} 