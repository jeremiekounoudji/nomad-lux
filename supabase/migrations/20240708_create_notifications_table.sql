-- Create enums
CREATE TYPE notification_role_enum AS ENUM ('guest', 'host', 'admin');

CREATE TYPE notification_type_enum AS ENUM (
  'booking_request_created',
  'booking_approved',
  'booking_rejected',
  'booking_cancelled',
  'payment_success',
  'payment_failed',
  'booking_refunded',
  'booking_checked_in',
  'booking_checked_out',
  'property_liked',
  'new_booking_request',
  'property_approved',
  'property_rejected',
  'property_suspended',
  'payout_approved',
  'payout_rejected',
  'payout_paid',
  'account_suspended',
  'profile_updated',
  'property_submitted',
  'payout_requested',
  'dispute_raised',
  'system_error',
  'account_flagged',
  'bulk_action'
);

CREATE TYPE notification_action_enum AS ENUM (
  'booking_request_create',
  'booking_approve',
  'booking_reject',
  'booking_cancel',
  'payment_process',
  'payment_fail',
  'booking_refund',
  'booking_checkin',
  'booking_checkout',
  'property_like',
  'property_approve',
  'property_reject',
  'property_suspend',
  'payout_approve',
  'payout_reject',
  'payout_pay',
  'account_suspend',
  'profile_update',
  'property_submit',
  'payout_request',
  'dispute_raise',
  'system_error_log',
  'account_flag',
  'bulk_user_action'
);

CREATE TYPE related_entity_enum AS ENUM (
  'booking',
  'property',
  'payout',
  'user',
  'payment',
  'dispute',
  'system'
);

-- Create notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role notification_role_enum NOT NULL,
  type notification_type_enum NOT NULL,
  title text NOT NULL CHECK (length(title) <= 255),
  message text NOT NULL CHECK (length(message) <= 1000),
  action notification_action_enum NOT NULL,
  related_id uuid NULL,
  related_type related_entity_enum NULL,
  is_read boolean NOT NULL DEFAULT false,
  sent_via_email boolean NOT NULL DEFAULT false,
  email_content text NULL,
  sent_via_push boolean NOT NULL DEFAULT false,
  push_content text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NULL DEFAULT '{}',
  batch_id uuid NULL
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_related ON notifications(related_type, related_id);
CREATE INDEX idx_notifications_batch ON notifications(batch_id) WHERE batch_id IS NOT NULL;
CREATE INDEX idx_notifications_user_unread_created ON notifications(user_id, is_read, created_at DESC) WHERE is_read = false;
CREATE INDEX idx_notifications_role_type ON notifications(role, type);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notifications_updated_at 
  BEFORE UPDATE ON notifications 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can insert notifications" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications" ON notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND user_role IN ('admin', 'super_admin')
    )
  ); 