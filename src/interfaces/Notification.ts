// Notification-related interfaces

export interface Notification {
  id: string
  user_id: string
  role: 'guest' | 'host' | 'admin'
  type: 'booking_request_created' | 'booking_approved' | 'booking_rejected' | 'booking_cancelled' | 
        'payment_success' | 'payment_failed' | 'booking_refunded' | 'booking_checked_in' | 
        'booking_checked_out' | 'property_liked' | 'new_booking_request' | 'property_approved' | 
        'property_rejected' | 'property_suspended' | 'payout_approved' | 'payout_rejected' | 
        'payout_paid' | 'account_suspended' | 'profile_updated' | 'property_submitted' | 
        'payout_requested' | 'dispute_raised' | 'system_error' | 'account_flagged' | 'bulk_action'
  title: string
  message: string
  action: string
  related_id?: string
  related_type?: 'booking' | 'property' | 'payout' | 'user' | 'payment' | 'dispute' | 'system'
  is_read: boolean
  sent_via_email: boolean
  email_content?: string
  sent_via_push: boolean
  push_content?: string
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
  batch_id?: string
  avatar?: string
  propertyImage?: string
}

export interface NotificationTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: 'email' | 'push' | 'sms'
  status: 'active' | 'draft'
  lastModified: string
} 