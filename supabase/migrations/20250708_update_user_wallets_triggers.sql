-- Migration: Update user_wallets triggers to recalculate wallet metrics
-- Date: 2025-07-08

-- 1) Ensure user_wallets table exists (basic structure if not present)
CREATE TABLE IF NOT EXISTS user_wallets (
  user_id UUID PRIMARY KEY,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  total_balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  pending_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  pending_count INT NOT NULL DEFAULT 0,
  failed_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  failed_count INT NOT NULL DEFAULT 0,
  successful_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  successful_count INT NOT NULL DEFAULT 0,
  payout_balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  last_payout_date TIMESTAMPTZ,
  next_payout_allowed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2) Function to refresh metrics for a single user
CREATE OR REPLACE FUNCTION refresh_user_wallet_metrics(p_uid UUID)
RETURNS VOID AS $$
DECLARE
  v_total_balance NUMERIC(14,2);
  v_pending_amount NUMERIC(14,2);
  v_pending_count INT;
  v_failed_amount NUMERIC(14,2);
  v_failed_count INT;
  v_successful_amount NUMERIC(14,2);
  v_successful_count INT;
  v_payout_balance NUMERIC(14,2);
  v_last_payout TIMESTAMPTZ;
  v_next_payout TIMESTAMPTZ;
BEGIN
  -- Aggregate from payment_records (join through bookings to host if necessary)
  SELECT
    COALESCE(SUM(amount) FILTER (WHERE payment_status = 'completed'), 0),
    COALESCE(SUM(amount) FILTER (WHERE payout_status = 'pending'), 0),
    COALESCE(COUNT(*) FILTER (WHERE payout_status = 'pending'), 0),
    COALESCE(SUM(amount) FILTER (WHERE payment_status = 'failed'), 0),
    COALESCE(COUNT(*) FILTER (WHERE payment_status = 'failed'), 0),
    COALESCE(SUM(amount) FILTER (WHERE payout_status = 'completed'), 0),
    COALESCE(COUNT(*) FILTER (WHERE payout_status = 'completed'), 0),
    COALESCE(SUM(amount) FILTER (WHERE payout_status = 'pending' AND free_at_date <= NOW()), 0)
  INTO v_total_balance, v_pending_amount, v_pending_count, v_failed_amount, v_failed_count, v_successful_amount, v_successful_count, v_payout_balance
  FROM payment_records
  WHERE host_id = p_uid;

  -- last_payout_date
  SELECT MAX(payout_date) INTO v_last_payout FROM payment_records WHERE host_id = p_uid AND payout_status = 'completed';

  -- next_payout_allowed_at
  SELECT MIN(free_at_date) INTO v_next_payout FROM payment_records WHERE host_id = p_uid AND payout_status = 'pending' AND free_at_date > NOW();

  -- Upsert into user_wallets
  INSERT INTO user_wallets (user_id, total_balance, pending_amount, pending_count, failed_amount, failed_count, successful_amount, successful_count, payout_balance, last_payout_date, next_payout_allowed_at, updated_at)
  VALUES (p_uid, v_total_balance, v_pending_amount, v_pending_count, v_failed_amount, v_failed_count, v_successful_amount, v_successful_count, v_payout_balance, v_last_payout, v_next_payout, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    total_balance = EXCLUDED.total_balance,
    pending_amount = EXCLUDED.pending_amount,
    pending_count = EXCLUDED.pending_count,
    failed_amount = EXCLUDED.failed_amount,
    failed_count = EXCLUDED.failed_count,
    successful_amount = EXCLUDED.successful_amount,
    successful_count = EXCLUDED.successful_count,
    payout_balance = EXCLUDED.payout_balance,
    last_payout_date = EXCLUDED.last_payout_date,
    next_payout_allowed_at = EXCLUDED.next_payout_allowed_at,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 3) Trigger function wrapper for payment_records changes
CREATE OR REPLACE FUNCTION trg_payment_records_refresh_wallets()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle DELETE (OLD) or INSERT/UPDATE (NEW) rows
  IF TG_OP = 'DELETE' THEN
    PERFORM refresh_user_wallet_metrics(OLD.host_id);
  ELSE
    PERFORM refresh_user_wallet_metrics(NEW.host_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4) Attach trigger to payment_records after insert/update/delete
DROP TRIGGER IF EXISTS trg_payment_records_refresh_wallets ON payment_records;
CREATE TRIGGER trg_payment_records_refresh_wallets
AFTER INSERT OR UPDATE OR DELETE ON payment_records
FOR EACH ROW EXECUTE PROCEDURE trg_payment_records_refresh_wallets(); 