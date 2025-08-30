-- Migration: Disable RLS for payout & wallet tables
-- Date: 2025-07-08

DO $$
BEGIN
  -- payout_requests
  IF to_regclass('public.payout_requests') IS NOT NULL THEN
    ALTER TABLE payout_requests DISABLE ROW LEVEL SECURITY;
  END IF;

  -- payment_records
  IF to_regclass('public.payment_records') IS NOT NULL THEN
    ALTER TABLE payment_records DISABLE ROW LEVEL SECURITY;
  END IF;

  -- user_wallets
  IF to_regclass('public.user_wallets') IS NOT NULL THEN
    ALTER TABLE user_wallets DISABLE ROW LEVEL SECURITY;
  END IF;
END $$; 