-- Migration: Enhance existing availability system for time-based bookings
-- Description: Modify existing functions to support time-granular availability checking

-- 1. Enhanced availability checking function that considers time overlaps
CREATE OR REPLACE FUNCTION check_property_availability_with_times(
  p_property_id UUID,
  p_check_in_datetime TIMESTAMPTZ,
  p_check_out_datetime TIMESTAMPTZ
) RETURNS TABLE (
  is_available BOOLEAN,
  conflict_reason TEXT,
  conflicts TIMESTAMPTZ[],
  property_timezone TEXT,
  total_conflicting_dates INTEGER
) AS $$
DECLARE
  property_tz TEXT;
  conflicting_datetimes TIMESTAMPTZ[] := '{}';
  conflict_count INTEGER := 0;
BEGIN
  -- Get property timezone
  SELECT timezone INTO property_tz 
  FROM properties 
  WHERE id = p_property_id;
  
  property_tz := COALESCE(property_tz, 'UTC');
  
  -- Check for time-based conflicts in unavailable_dates
  SELECT ARRAY(
    SELECT unnest(unavailable_dates)
    FROM properties 
    WHERE id = p_property_id
      AND unavailable_dates && ARRAY[p_check_in_datetime, p_check_out_datetime]
  ) INTO conflicting_datetimes;
  
  -- More sophisticated overlap checking
  -- Check if any unavailable datetime falls within the requested range
  WITH unavailable_times AS (
    SELECT unnest(unavailable_dates) as unavailable_dt
    FROM properties 
    WHERE id = p_property_id
  )
  SELECT ARRAY_AGG(unavailable_dt), COUNT(*)
  INTO conflicting_datetimes, conflict_count
  FROM unavailable_times
  WHERE unavailable_dt >= p_check_in_datetime 
    AND unavailable_dt < p_check_out_datetime;
  
  -- Return results
  is_available := (conflict_count = 0);
  conflict_reason := CASE 
    WHEN conflict_count > 0 THEN 'time_conflict'
    ELSE NULL
  END;
  conflicts := COALESCE(conflicting_datetimes, '{}');
  property_timezone := property_tz;
  total_conflicting_dates := COALESCE(conflict_count, 0);
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- 2. Function to add time-specific unavailable periods
CREATE OR REPLACE FUNCTION add_unavailable_time_period(
  p_property_id UUID,
  p_start_datetime TIMESTAMPTZ,
  p_end_datetime TIMESTAMPTZ,
  p_interval INTERVAL DEFAULT '1 hour'
) RETURNS INTEGER AS $$
DECLARE
  current_time TIMESTAMPTZ := p_start_datetime;
  periods_added INTEGER := 0;
  existing_unavailable TIMESTAMPTZ[];
BEGIN
  -- Get current unavailable dates
  SELECT unavailable_dates INTO existing_unavailable
  FROM properties 
  WHERE id = p_property_id;
  
  existing_unavailable := COALESCE(existing_unavailable, '{}');
  
  -- Add time periods at specified intervals
  WHILE current_time < p_end_datetime LOOP
    -- Add this time period if not already present
    IF NOT (current_time = ANY(existing_unavailable)) THEN
      existing_unavailable := array_append(existing_unavailable, current_time);
      periods_added := periods_added + 1;
    END IF;
    
    current_time := current_time + p_interval;
  END LOOP;
  
  -- Update property with new unavailable dates
  UPDATE properties 
  SET unavailable_dates = existing_unavailable
  WHERE id = p_property_id;
  
  RETURN periods_added;
END;
$$ LANGUAGE plpgsql;

-- 3. Function to remove time-specific unavailable periods
CREATE OR REPLACE FUNCTION remove_unavailable_time_period(
  p_property_id UUID,
  p_start_datetime TIMESTAMPTZ,
  p_end_datetime TIMESTAMPTZ
) RETURNS INTEGER AS $$
DECLARE
  existing_unavailable TIMESTAMPTZ[];
  periods_removed INTEGER := 0;
BEGIN
  -- Get current unavailable dates
  SELECT unavailable_dates INTO existing_unavailable
  FROM properties 
  WHERE id = p_property_id;
  
  existing_unavailable := COALESCE(existing_unavailable, '{}');
  
  -- Remove periods that fall within the specified range
  SELECT ARRAY(
    SELECT unnest(existing_unavailable)
    WHERE unnest(existing_unavailable) < p_start_datetime 
       OR unnest(existing_unavailable) >= p_end_datetime
  ), 
  array_length(existing_unavailable, 1) - array_length(ARRAY(
    SELECT unnest(existing_unavailable)
    WHERE unnest(existing_unavailable) < p_start_datetime 
       OR unnest(existing_unavailable) >= p_end_datetime
  ), 1)
  INTO existing_unavailable, periods_removed;
  
  -- Update property
  UPDATE properties 
  SET unavailable_dates = existing_unavailable
  WHERE id = p_property_id;
  
  RETURN COALESCE(periods_removed, 0);
END;
$$ LANGUAGE plpgsql;

-- 4. Enhanced booking trigger for time-based availability
CREATE OR REPLACE FUNCTION handle_time_based_booking_availability_changes()
RETURNS TRIGGER AS $$
DECLARE
  booking_start TIMESTAMPTZ;
  booking_end TIMESTAMPTZ;
  property_tz TEXT;
BEGIN
  -- Get property timezone
  SELECT timezone INTO property_tz 
  FROM properties 
  WHERE id = COALESCE(NEW.property_id, OLD.property_id);
  
  property_tz := COALESCE(property_tz, 'UTC');
  
  -- Handle INSERT (new booking)
  IF TG_OP = 'INSERT' THEN
    -- Create datetime from date + time
    booking_start := (NEW.check_in_date || ' ' || COALESCE(NEW.check_in_time, '00:00:00'))::TIMESTAMPTZ;
    booking_end := (NEW.check_out_date || ' ' || COALESCE(NEW.check_out_time, '23:59:59'))::TIMESTAMPTZ;
    
    -- Add unavailable time periods (hourly intervals)
    PERFORM add_unavailable_time_period(
      NEW.property_id, 
      booking_start, 
      booking_end,
      '1 hour'::INTERVAL
    );
    
    RETURN NEW;
  END IF;
  
  -- Handle UPDATE (status changes)
  IF TG_OP = 'UPDATE' THEN
    booking_start := (NEW.check_in_date || ' ' || COALESCE(NEW.check_in_time, '00:00:00'))::TIMESTAMPTZ;
    booking_end := (NEW.check_out_date || ' ' || COALESCE(NEW.check_out_time, '23:59:59'))::TIMESTAMPTZ;
    
    -- If booking was cancelled, remove unavailable periods
    IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
      PERFORM remove_unavailable_time_period(
        NEW.property_id, 
        booking_start, 
        booking_end
      );
    END IF;
    
    RETURN NEW;
  END IF;
  
  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    booking_start := (OLD.check_in_date || ' ' || COALESCE(OLD.check_in_time, '00:00:00'))::TIMESTAMPTZ;
    booking_end := (OLD.check_out_date || ' ' || COALESCE(OLD.check_out_time, '23:59:59'))::TIMESTAMPTZ;
    
    -- Remove unavailable periods
    PERFORM remove_unavailable_time_period(
      OLD.property_id, 
      booking_start, 
      booking_end
    );
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Replace the existing trigger
DROP TRIGGER IF EXISTS booking_availability_trigger ON bookings;
CREATE TRIGGER time_based_booking_availability_trigger
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION handle_time_based_booking_availability_changes();