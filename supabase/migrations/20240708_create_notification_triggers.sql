-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Grant usage on pg_net to service_role for edge function calls
GRANT USAGE ON SCHEMA net TO service_role;

-- Function to get the current project's edge function base URL
-- This function will be used by trigger functions to construct the full URL
CREATE OR REPLACE FUNCTION get_edge_function_url(function_name TEXT)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 'https://hdeklulcgzuhbdusasky.supabase.co/functions/v1/' || function_name;
$$;

-- Helper function to make async HTTP requests to edge functions
CREATE OR REPLACE FUNCTION notify_edge_function(
  function_name TEXT,
  payload JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  url TEXT;
  request_id BIGINT;
BEGIN
  -- Get the full URL for the edge function
  url := get_edge_function_url(function_name);
  
  -- Make async HTTP POST request
  -- Note: The authorization will be handled by Supabase internal routing
  -- since this is called from within the database as service_role
  SELECT net.http_post(
    url => url,
    headers => jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body => payload
  ) INTO request_id;
  
  -- Log the request (optional, for debugging)
  -- RAISE NOTICE 'Notification request sent to % with ID %', function_name, request_id;
END;
$$;

-- Trigger function for booking notifications
CREATE OR REPLACE FUNCTION trigger_booking_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  event_type TEXT;
  old_status TEXT;
  new_status TEXT;
  payload JSONB;
BEGIN
  -- Determine event type
  IF TG_OP = 'INSERT' THEN
    event_type := 'booking_created';
    new_status := NEW.status;
  ELSIF TG_OP = 'UPDATE' THEN
    old_status := OLD.status;
    new_status := NEW.status;
    
    -- Only trigger on status changes
    IF old_status != new_status THEN
      CASE new_status
        WHEN 'approved' THEN event_type := 'booking_approved';
        WHEN 'rejected' THEN event_type := 'booking_rejected';
        WHEN 'cancelled' THEN event_type := 'booking_cancelled';
        WHEN 'checked_in' THEN event_type := 'booking_checked_in';
        WHEN 'checked_out' THEN event_type := 'booking_checked_out';
        ELSE
          -- No notification needed for other status changes
          RETURN COALESCE(NEW, OLD);
      END CASE;
    ELSE
      -- No status change, no notification needed
      RETURN COALESCE(NEW, OLD);
    END IF;
  ELSE
    -- DELETE operations don't trigger notifications
    RETURN OLD;
  END IF;
  
  -- Build payload
  payload := jsonb_build_object(
    'event_type', event_type,
    'booking_id', COALESCE(NEW.id, OLD.id),
    'property_id', COALESCE(NEW.property_id, OLD.property_id),
    'guest_id', COALESCE(NEW.guest_id, OLD.guest_id),
    'host_id', COALESCE(NEW.host_id, OLD.host_id),
    'old_status', old_status,
    'new_status', new_status,
    'check_in_date', COALESCE(NEW.check_in_date, OLD.check_in_date),
    'check_out_date', COALESCE(NEW.check_out_date, OLD.check_out_date),
    'total_price', COALESCE(NEW.total_price, OLD.total_price)
  );
  
  -- Call edge function asynchronously
  PERFORM notify_edge_function('trigger-booking-notification', payload);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger function for property notifications
CREATE OR REPLACE FUNCTION trigger_property_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  event_type TEXT;
  old_status TEXT;
  new_status TEXT;
  payload JSONB;
BEGIN
  -- Determine event type
  IF TG_OP = 'INSERT' THEN
    event_type := 'property_submitted';
    new_status := NEW.status;
  ELSIF TG_OP = 'UPDATE' THEN
    old_status := OLD.status;
    new_status := NEW.status;
    
    -- Only trigger on status changes
    IF old_status != new_status THEN
      CASE new_status
        WHEN 'approved' THEN event_type := 'property_approved';
        WHEN 'rejected' THEN event_type := 'property_rejected';
        WHEN 'suspended' THEN event_type := 'property_suspended';
        ELSE
          -- No notification needed for other status changes (paused, etc.)
          RETURN COALESCE(NEW, OLD);
      END CASE;
    ELSE
      -- No status change, no notification needed
      RETURN COALESCE(NEW, OLD);
    END IF;
  ELSE
    -- DELETE operations don't trigger notifications
    RETURN OLD;
  END IF;
  
  -- Build payload
  payload := jsonb_build_object(
    'event_type', event_type,
    'property_id', COALESCE(NEW.id, OLD.id),
    'host_id', COALESCE(NEW.host_id, OLD.host_id),
    'property_name', COALESCE(NEW.title, OLD.title),
    'old_status', old_status,
    'new_status', new_status
  );
  
  -- Call edge function asynchronously
  PERFORM notify_edge_function('trigger-property-notification', payload);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger function for property like notifications
CREATE OR REPLACE FUNCTION trigger_property_like_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  event_type TEXT;
  payload JSONB;
  property_host_id UUID;
BEGIN
  -- Determine event type
  IF TG_OP = 'INSERT' THEN
    event_type := 'property_liked';
    
    -- Get the host_id from the property
    SELECT host_id INTO property_host_id
    FROM properties 
    WHERE id = NEW.property_id;
    
    -- Build payload
    payload := jsonb_build_object(
      'event_type', event_type,
      'property_id', NEW.property_id,
      'user_id', NEW.user_id,
      'host_id', property_host_id
    );
    
  ELSIF TG_OP = 'DELETE' THEN
    -- We don't send notifications for unlikes currently
    -- but the structure is here if needed in the future
    RETURN OLD;
  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;
  
  -- Call edge function asynchronously
  PERFORM notify_edge_function('trigger-property-notification', payload);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger function for payout notifications
CREATE OR REPLACE FUNCTION trigger_payout_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  event_type TEXT;
  old_status TEXT;
  new_status TEXT;
  payload JSONB;
BEGIN
  -- Determine event type
  IF TG_OP = 'INSERT' THEN
    event_type := 'payout_requested';
    new_status := NEW.status;
  ELSIF TG_OP = 'UPDATE' THEN
    old_status := OLD.status;
    new_status := NEW.status;
    
    -- Only trigger on status changes
    IF old_status != new_status THEN
      CASE new_status
        WHEN 'approved' THEN event_type := 'payout_approved';
        WHEN 'rejected' THEN event_type := 'payout_rejected';
        WHEN 'paid' THEN event_type := 'payout_paid';
        ELSE
          -- No notification needed for other status changes
          RETURN COALESCE(NEW, OLD);
      END CASE;
    ELSE
      -- No status change, no notification needed
      RETURN COALESCE(NEW, OLD);
    END IF;
  ELSE
    -- DELETE operations don't trigger notifications
    RETURN OLD;
  END IF;
  
  -- Build payload
  payload := jsonb_build_object(
    'event_type', event_type,
    'payout_request_id', COALESCE(NEW.id, OLD.id),
    'host_id', COALESCE(NEW.host_id, OLD.host_id),
    'amount', COALESCE(NEW.amount, OLD.amount),
    'old_status', old_status,
    'new_status', new_status
  );
  
  -- Call edge function asynchronously
  PERFORM notify_edge_function('trigger-payout-notification', payload);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers on bookings table
DROP TRIGGER IF EXISTS booking_notification_trigger ON bookings;
CREATE TRIGGER booking_notification_trigger
  AFTER INSERT OR UPDATE OF status ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_booking_notifications();

-- Create triggers on properties table
DROP TRIGGER IF EXISTS property_notification_trigger ON properties;
CREATE TRIGGER property_notification_trigger
  AFTER INSERT OR UPDATE OF status ON properties
  FOR EACH ROW
  EXECUTE FUNCTION trigger_property_notifications();

-- Create triggers on property_likes table
DROP TRIGGER IF EXISTS property_like_notification_trigger ON property_likes;
CREATE TRIGGER property_like_notification_trigger
  AFTER INSERT OR DELETE ON property_likes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_property_like_notifications();

-- Create triggers on payout_requests table
DROP TRIGGER IF EXISTS payout_notification_trigger ON payout_requests;
CREATE TRIGGER payout_notification_trigger
  AFTER INSERT OR UPDATE OF status ON payout_requests
  FOR EACH ROW
  EXECUTE FUNCTION trigger_payout_notifications();

-- Grant execute permissions on trigger functions to service_role
GRANT EXECUTE ON FUNCTION trigger_booking_notifications() TO service_role;
GRANT EXECUTE ON FUNCTION trigger_property_notifications() TO service_role;
GRANT EXECUTE ON FUNCTION trigger_property_like_notifications() TO service_role;
GRANT EXECUTE ON FUNCTION trigger_payout_notifications() TO service_role;
GRANT EXECUTE ON FUNCTION notify_edge_function(TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION get_edge_function_url(TEXT) TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION notify_edge_function(TEXT, JSONB) IS 'Helper function to make async HTTP requests to edge functions for notifications';
COMMENT ON FUNCTION trigger_booking_notifications() IS 'Trigger function for booking-related notifications';
COMMENT ON FUNCTION trigger_property_notifications() IS 'Trigger function for property-related notifications';
COMMENT ON FUNCTION trigger_property_like_notifications() IS 'Trigger function for property like notifications';
COMMENT ON FUNCTION trigger_payout_notifications() IS 'Trigger function for payout-related notifications'; 