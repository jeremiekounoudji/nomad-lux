// Booking-related interfaces

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
  status: 'active' | 'completed' | 'cancelled'
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

export interface BookingRequest {
  id: string
  propertyName: string
  propertyImage: string
  propertyId: string
  guestName: string
  guestAvatar: string
  guestEmail: string
  guestPhone: string
  checkIn: string
  checkOut: string
  guests: number
  totalPrice: number
  status: 'pending' | 'approved' | 'declined'
  requestDate: string
  message?: string
  guestRating: number
  guestReviews: number
  paymentMethod: string
  cleaningFee: number
  serviceFee: number
  taxes: number
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