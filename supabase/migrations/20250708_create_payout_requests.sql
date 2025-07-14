-- Migration: Create payout_request_status enum and payout_requests table
-- Date: 2025-07-08

-- 1) Enum type for payout request status
DO $$ BEGIN
  CREATE TYPE payout_request_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null; -- ignore if already exists
END $$;

-- 2) Table definition
CREATE TABLE IF NOT EXISTS payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  status payout_request_status NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3) Indexes
CREATE INDEX IF NOT EXISTS idx_payout_requests_user_status ON payout_requests (user_id, status);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests (status);

-- 4) Trigger to maintain updated_at timestamp
CREATE OR REPLACE FUNCTION set_payout_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_payout_requests_updated_at_trigger ON payout_requests;
CREATE TRIGGER set_payout_requests_updated_at_trigger
BEFORE UPDATE ON payout_requests
FOR EACH ROW EXECUTE PROCEDURE set_payout_requests_updated_at(); 