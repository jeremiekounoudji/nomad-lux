// Payment Record interfaces for the booking system

export type PaymentMethod = 'stripe' | 'paypal' | 'bank_transfer'
export type PaymentRecordStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partial_refund'
export type PayoutStatus = 'pending' | 'available' | 'processing' | 'completed' | 'failed'

export interface PaymentRecord {
  id: string
  booking_id: string
  
  // Payment Details
  payment_method: PaymentMethod
  payment_provider: string // 'stripe', 'paypal', etc.
  payment_intent_id?: string // Provider's payment ID
  amount: number
  currency: string
  
  // Status & Fees
  payment_status: PaymentRecordStatus
  processing_fee: number
  net_amount: number
  
  // Host Payout Management
  free_at_date?: string // When payment can be cashed out by host
  payout_status: PayoutStatus
  payout_date?: string
  payout_reference?: string
  
  // Metadata
  payment_metadata: Record<string, any>
  failure_reason?: string
  refund_amount: number
  refund_reason?: string
  
  // Timestamps
  initiated_at: string
  completed_at?: string
  refunded_at?: string
  created_at: string
  updated_at: string
}

// For creating payment records
export interface PaymentRecordCreateData {
  booking_id: string
  payment_method: PaymentMethod
  payment_provider: string
  payment_intent_id?: string
  amount: number
  currency: string
  processing_fee: number
  net_amount: number
  payment_metadata?: Record<string, any>
}

// For payment processing
export interface PaymentProcessingData {
  payment_method: PaymentMethod
  payment_provider: string
  amount: number
  currency: string
  booking_id: string
  guest_id: string
  host_id: string
  property_id: string
}

// Payment result from processing
export interface PaymentResult {
  success: boolean
  payment_record_id?: string
  payment_intent_id?: string
  error_message?: string
  payment_status: PaymentRecordStatus
}

// Refund calculation result (from RPC function)
export interface RefundCalculation {
  refund_amount: number
  refund_percentage: number
  policy_applied: string
  hours_before_checkin: number
  total_paid: number
  processing_fee: number
  net_refund: number
  refund_breakdown: Record<string, any>
} 