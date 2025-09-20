-- Migration: Create Time-Based Availability System
-- Description: Add support for time-slot based bookings alongside existing full-day bookings

-- 1. Create property_time_slots table
CREATE TABLE IF NOT EXISTS property_time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  blocked_reason TEXT CHECK (blocked_reason IN ('booking', 'maintenance', 'host_blocked')),
  price DECIMAL(10,2), -- Optional slot-specific pricing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure no overlapping time slots for same property/date
  CONSTRAINT no_overlapping_slots EXCLUDE USING gist (
    property_id WITH =,
    date WITH =,
    tsrange(start_time::text::time, end_time::text::time) WITH &&
  ),
  
  -- Ensure start_time < end_time
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- 2. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_property_time_slots_property_date 
  ON property_time_slots(property_id, date);

CREATE INDEX IF NOT EXISTS idx_property_time_slots_availability 
  ON property_time_slots(property_id, date, is_available);

CREATE INDEX IF NOT EXISTS idx_property_time_slots_booking 
  ON property_time_slots(booking_id) WHERE booking_id IS NOT NULL;

-- 3. Add time-based booking support to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS booking_type VARCHAR(20) DEFAULT 'full_day' 
  CHECK (booking_type IN ('full_day', 'time_slot', 'both'));

ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS time_slot_duration INTEGER DEFAULT 120; -- minutes

ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS available_time_range JSONB DEFAULT '{"start": "06:00", "end": "22:00"}';

-- 4. Add time-based booking support to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS booking_type VARCHAR(20) DEFAULT 'full_day' 
  CHECK (booking_type IN ('full_day', 'time_slot'));

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS time_slot_ids UUID[];

-- 5. Create function to generate time slots for a property/date
CREATE OR REPLACE FUNCTION generate_property_time_slots(
  p_property_id UUID,
  p_date DATE,
  p_slot_duration INTERVAL DEFAULT '2 hours',
  p_start_time TIME DEFAULT '06:00',
  p_end_time TIME DEFAULT '22:00'
) RETURNS TABLE (
  slot_start TIME,
  slot_end TIME,
  is_available BOOLEAN
) AS $$
DECLARE
  current_time TIME := p_start_time;
  next_time TIME;
BEGIN
  -- Clear existing slots for this date (if regenerating)
  DELETE FROM property_time_slots 
  WHERE property_id = p_property_id AND date = p_date AND booking_id IS NULL;
  
  -- Generate time slots
  WHILE current_time < p_end_time LOOP
    next_time := current_time + p_slot_duration;
    
    -- Don't create slot if it would extend beyond end time
    IF next_time > p_end_time THEN
      EXIT;
    END IF;
    
    -- Insert the time slot
    INSERT INTO property_time_slots (
      property_id, date, start_time, end_time, is_available
    ) VALUES (
      p_property_id, p_date, current_time, next_time, true
    );
    
    -- Return the slot info
    slot_start := current_time;
    slot_end := next_time;
    is_available := true;
    RETURN NEXT;
    
    current_time := next_time;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to check time slot availability
CREATE OR REPLACE FUNCTION check_time_slot_availability(
  p_property_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME
) RETURNS BOOLEAN AS $$
DECLARE
  conflicting_slots INTEGER;
BEGIN
  -- Check for any overlapping unavailable slots
  SELECT COUNT(*) INTO conflicting_slots
  FROM property_time_slots
  WHERE property_id = p_property_id
    AND date = p_date
    AND is_available = false
    AND tsrange(start_time::text::time, end_time::text::time) && 
        tsrange(p_start_time::text::time, p_end_time::text::time);
  
  RETURN conflicting_slots = 0;
END;
$$ LANGUAGE plpgsql;

-- 7. Create function to get availability summary for a date range
CREATE OR REPLACE FUNCTION get_property_availability_summary(
  p_property_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS TABLE (
  date DATE,
  total_slots INTEGER,
  available_slots INTEGER,
  booked_slots INTEGER,
  blocked_slots INTEGER,
  total_available_hours DECIMAL,
  is_fully_available BOOLEAN,
  is_partially_available BOOLEAN,
  is_fully_booked BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pts.date,
    COUNT(*)::INTEGER as total_slots,
    COUNT(*) FILTER (WHERE pts.is_available = true)::INTEGER as available_slots,
    COUNT(*) FILTER (WHERE pts.is_available = false AND pts.blocked_reason = 'booking')::INTEGER as booked_slots,
    COUNT(*) FILTER (WHERE pts.is_available = false AND pts.blocked_reason != 'booking')::INTEGER as blocked_slots,
    SUM(
      CASE WHEN pts.is_available = true 
      THEN EXTRACT(EPOCH FROM (pts.end_time - pts.start_time)) / 3600.0 
      ELSE 0 END
    )::DECIMAL as total_available_hours,
    (COUNT(*) FILTER (WHERE pts.is_available = true) = COUNT(*)) as is_fully_available,
    (COUNT(*) FILTER (WHERE pts.is_available = true) > 0 AND 
     COUNT(*) FILTER (WHERE pts.is_available = true) < COUNT(*)) as is_partially_available,
    (COUNT(*) FILTER (WHERE pts.is_available = true) = 0) as is_fully_booked
  FROM property_time_slots pts
  WHERE pts.property_id = p_property_id
    AND pts.date >= p_start_date
    AND pts.date <= p_end_date
  GROUP BY pts.date
  ORDER BY pts.date;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger to update time slots when bookings change
CREATE OR REPLACE FUNCTION handle_time_slot_booking_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT (new booking)
  IF TG_OP = 'INSERT' THEN
    IF NEW.booking_type = 'time_slot' AND NEW.time_slot_ids IS NOT NULL THEN
      -- Mark time slots as unavailable
      UPDATE property_time_slots
      SET is_available = false,
          booking_id = NEW.id,
          blocked_reason = 'booking'
      WHERE id = ANY(NEW.time_slot_ids);
    END IF;
    RETURN NEW;
  END IF;
  
  -- Handle UPDATE (booking status change)
  IF TG_OP = 'UPDATE' THEN
    -- If booking was cancelled, release time slots
    IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
      IF NEW.booking_type = 'time_slot' AND NEW.time_slot_ids IS NOT NULL THEN
        UPDATE property_time_slots
        SET is_available = true,
            booking_id = NULL,
            blocked_reason = NULL
        WHERE id = ANY(NEW.time_slot_ids);
      END IF;
    END IF;
    
    -- If booking was confirmed from pending, ensure slots are still reserved
    IF OLD.status = 'pending' AND NEW.status = 'confirmed' THEN
      IF NEW.booking_type = 'time_slot' AND NEW.time_slot_ids IS NOT NULL THEN
        UPDATE property_time_slots
        SET is_available = false,
            booking_id = NEW.id,
            blocked_reason = 'booking'
        WHERE id = ANY(NEW.time_slot_ids);
      END IF;
    END IF;
    
    RETURN NEW;
  END IF;
  
  -- Handle DELETE (booking removed)
  IF TG_OP = 'DELETE' THEN
    IF OLD.booking_type = 'time_slot' AND OLD.time_slot_ids IS NOT NULL THEN
      -- Release time slots
      UPDATE property_time_slots
      SET is_available = true,
          booking_id = NULL,
          blocked_reason = NULL
      WHERE id = ANY(OLD.time_slot_ids);
    END IF;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS time_slot_booking_trigger ON bookings;
CREATE TRIGGER time_slot_booking_trigger
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION handle_time_slot_booking_changes();

-- 9. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_time_slots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_time_slots_updated_at_trigger ON property_time_slots;
CREATE TRIGGER update_time_slots_updated_at_trigger
  BEFORE UPDATE ON property_time_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_time_slots_updated_at();

-- 10. Add RLS policies for property_time_slots
ALTER TABLE property_time_slots ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view time slots for any property
CREATE POLICY "Users can view time slots" ON property_time_slots
  FOR SELECT USING (true);

-- Policy: Property hosts can manage their property's time slots
CREATE POLICY "Hosts can manage their property time slots" ON property_time_slots
  FOR ALL USING (
    property_id IN (
      SELECT id FROM properties WHERE host_id = auth.uid()
    )
  );

-- Policy: Admins can manage all time slots
CREATE POLICY "Admins can manage all time slots" ON property_time_slots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 11. Create indexes for RLS performance
CREATE INDEX IF NOT EXISTS idx_properties_host_id ON properties(host_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role) WHERE role = 'admin';

-- 12. Add helpful comments
COMMENT ON TABLE property_time_slots IS 'Stores time-based availability slots for properties that support hourly/time-slot bookings';
COMMENT ON COLUMN property_time_slots.booking_type IS 'Type of booking: full_day, time_slot, or both';
COMMENT ON COLUMN property_time_slots.time_slot_duration IS 'Default duration for time slots in minutes';
COMMENT ON COLUMN property_time_slots.available_time_range IS 'JSON object with start and end times for available booking hours';

-- 13. Create sample data generation function (for testing)
CREATE OR REPLACE FUNCTION generate_sample_time_slots_for_property(
  p_property_id UUID,
  p_days_ahead INTEGER DEFAULT 30
) RETURNS INTEGER AS $$
DECLARE
  current_date DATE := CURRENT_DATE;
  end_date DATE := CURRENT_DATE + p_days_ahead;
  slots_created INTEGER := 0;
BEGIN
  WHILE current_date <= end_date LOOP
    -- Skip if slots already exist for this date
    IF NOT EXISTS (
      SELECT 1 FROM property_time_slots 
      WHERE property_id = p_property_id AND date = current_date
    ) THEN
      -- Generate slots for this date
      PERFORM generate_property_time_slots(
        p_property_id, 
        current_date, 
        '2 hours'::INTERVAL, 
        '08:00'::TIME, 
        '20:00'::TIME
      );
      slots_created := slots_created + 6; -- 6 slots per day (8am-8pm, 2hr slots)
    END IF;
    
    current_date := current_date + 1;
  END LOOP;
  
  RETURN slots_created;
END;
$$ LANGUAGE plpgsql;