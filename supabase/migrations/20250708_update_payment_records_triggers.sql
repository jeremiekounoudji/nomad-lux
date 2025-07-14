-- Migration: Update payment_records triggers to set free_at_date and payout_status
-- Date: 2025-07-08

-- 1) Trigger function to set free_at_date and payout_status
CREATE OR REPLACE FUNCTION trg_payment_records_set_free_at_date()
RETURNS TRIGGER AS $$
DECLARE
  payout_delay INT := 1; -- default fallback in days
BEGIN
  -- Fetch hostPayoutDelay from admin_settings (number stored as JSONB)
  SELECT (setting_value::text)::INT INTO payout_delay
  FROM admin_settings
  WHERE category = 'booking' AND setting_key = 'hostPayoutDelay'
  LIMIT 1;

  -- If NEW.payment_status = completed and NEW.payment_type = payment, set free_at_date
  IF (NEW.payment_status = 'completed' AND NEW.payment_type = 'payment') THEN
    NEW.free_at_date := COALESCE(NEW.created_at, NOW()) + (payout_delay || ' days')::interval;

    -- Ensure payout_status is pending if not provided
    IF NEW.payout_status IS NULL THEN
      NEW.payout_status := 'pending';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2) Drop existing trigger if present and create a new one
DROP TRIGGER IF EXISTS trg_payment_records_set_free_at_date ON payment_records;
CREATE TRIGGER trg_payment_records_set_free_at_date
BEFORE INSERT OR UPDATE ON payment_records
FOR EACH ROW
EXECUTE PROCEDURE trg_payment_records_set_free_at_date(); 