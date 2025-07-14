export type PayoutRequestStatus = 'pending' | 'approved' | 'rejected' | 'completed'

export interface PayoutRequest {
  id: string
  user_id: string
  amount: number
  currency: string
  status: PayoutRequestStatus
  requested_at: string
  processed_at?: string | null
  admin_id?: string | null
  note?: string | null
  created_at: string
  updated_at: string
} 