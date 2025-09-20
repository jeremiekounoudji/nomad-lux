# Time-Based Availability System Implementation Plan

## Overview
Upgrade the current day-based availability system to support time-based bookings, allowing multiple reservations on the same day at different time slots.

## 1. Database Schema Changes

### New Table: `property_time_slots`
```sql
CREATE TABLE property_time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  blocked_reason TEXT, -- 'booking', 'maintenance', 'host_blocked'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure no overlapping time slots for same property/date
  CONSTRAINT no_overlapping_slots EXCLUDE USING gist (
    property_id WITH =,
    date WITH =,
    tsrange(start_time::text::time, end_time::text::time) WITH &&
  )
);

-- Indexes for performance
CREATE INDEX idx_property_time_slots_property_date ON property_time_slots(property_id, date);
CREATE INDEX idx_property_time_slots_availability ON property_time_slots(property_id, date, is_available);
```

### Enhanced Bookings Table
```sql
-- Add time-based booking support
ALTER TABLE bookings ADD COLUMN booking_type VARCHAR(20) DEFAULT 'full_day' CHECK (booking_type IN ('full_day', 'time_slot'));
ALTER TABLE bookings ADD COLUMN time_slot_ids UUID[]; -- Array of time slot IDs for time-based bookings
```

## 2. New Database Functions

### Time Slot Management
```sql
-- Generate available time slots for a property/date
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
BEGIN
  -- Implementation to generate time slots
END;
$$ LANGUAGE plpgsql;

-- Check time-based availability
CREATE OR REPLACE FUNCTION check_time_slot_availability(
  p_property_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME
) RETURNS BOOLEAN AS $$
BEGIN
  -- Check if time slot is available
END;
$$ LANGUAGE plpgsql;
```

## 3. Frontend Interface Updates

### Enhanced Property Interface
```typescript
interface PropertyTimeSlot {
  id: string
  date: string // YYYY-MM-DD
  startTime: string // HH:MM
  endTime: string // HH:MM
  isAvailable: boolean
  bookingId?: string
  blockedReason?: 'booking' | 'maintenance' | 'host_blocked'
}

interface Property {
  // ... existing fields
  booking_type: 'full_day' | 'time_slot' | 'both'
  time_slot_duration: number // minutes
  available_time_range: {
    start: string // HH:MM
    end: string // HH:MM
  }
  time_slots?: PropertyTimeSlot[]
}
```

### Enhanced Availability Result
```typescript
interface TimeBasedAvailabilityResult {
  date: string
  booking_type: 'full_day' | 'time_slot'
  is_fully_available: boolean
  available_time_slots: PropertyTimeSlot[]
  unavailable_time_slots: PropertyTimeSlot[]
  total_available_hours: number
}
```

## 4. Calendar Component Enhancements

### Visual Indicators
- **Green**: Fully available day
- **Yellow**: Partially available (some time slots taken)
- **Red**: Fully booked
- **Blue**: Host blocked/maintenance

### Time Slot Display
- Hover/click on date shows available time slots
- Visual timeline for each day
- Clear indication of booked vs available slots

## 5. Booking Flow Updates

### Enhanced Booking Process
1. Select date
2. View available time slots
3. Select time slot(s)
4. Complete booking

### Flexible Booking Types
- Full day booking (blocks all time slots)
- Time slot booking (specific hours)
- Multi-slot booking (multiple time ranges)

## 6. Implementation Phases

### Phase 1: Database Foundation
- Create time slots table
- Implement core functions
- Add migration scripts

### Phase 2: Backend API
- Update availability checking
- Implement time slot management
- Enhance booking creation

### Phase 3: Frontend Components
- Upgrade calendar component
- Add time slot picker
- Update booking forms

### Phase 4: User Experience
- Visual improvements
- Mobile optimization
- Testing and refinement

## 7. Migration Strategy

### Backward Compatibility
- Existing full-day bookings remain unchanged
- New properties can choose booking type
- Gradual rollout to existing properties

### Data Migration
- Convert existing unavailable_dates to time slots
- Preserve all existing bookings
- Maintain current functionality during transition