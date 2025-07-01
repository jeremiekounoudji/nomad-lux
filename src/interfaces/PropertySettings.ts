// Property Settings interfaces for the booking system

export type PaymentTiming = 'before_checkin' | 'after_checkin'

export interface PropertySettings {
  id: string
  host_id: string
  settings_name: string
  
  // Booking Rules
  min_advance_booking: number
  max_advance_booking: number
  min_stay_nights: number
  max_stay_nights: number
  
  // Timing Settings
  checkin_time: string // TIME format: "15:00:00"
  checkout_time: string // TIME format: "11:00:00"
  cleaning_time_hours: number
  
  // Payment & Approval Preferences
  payment_timing: PaymentTiming
  auto_approve_bookings: boolean
  preferred_payment_methods: string[]
  
  // Availability Management
  blocked_dates: BlockedDate[]
  
  // Metadata
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface BlockedDate {
  start: string // Date string
  end: string // Date string
  reason: string
}

// For property settings creation/update
export interface PropertySettingsFormData {
  settings_name: string
  min_advance_booking: number
  max_advance_booking: number
  min_stay_nights: number
  max_stay_nights: number
  checkin_time: string
  checkout_time: string
  cleaning_time_hours: number
  payment_timing: PaymentTiming
  auto_approve_bookings: boolean
  preferred_payment_methods: string[]
  blocked_dates: BlockedDate[]
  is_default: boolean
}

// For dropdown selection in property creation
export interface PropertySettingsOption {
  id: string
  settings_name: string
  is_default: boolean
  min_stay_nights: number
  max_stay_nights: number
  payment_timing: PaymentTiming
  auto_approve_bookings: boolean
  checkin_time: string
  checkout_time: string
  created_at: string
}

// Property settings with usage count for host management
export interface PropertySettingsWithUsage extends PropertySettings {
  properties_using_count: number
  last_used: string | null
} 