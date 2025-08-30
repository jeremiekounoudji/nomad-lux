# Notification Database Triggers Implementation

## Overview

This document explains the database trigger system that automatically sends notifications when relevant database events occur in the NomadLux platform. The triggers use PostgreSQL's `pg_net` extension to make HTTP requests to edge functions asynchronously.

## Architecture

```
Database Event → Trigger Function → pg_net HTTP Request → Edge Function → Notification Creation
```

### Components

1. **Trigger Functions**: PostgreSQL functions that detect relevant data changes
2. **Helper Functions**: Utility functions for making HTTP requests and URL construction
3. **Database Triggers**: Event handlers that call trigger functions on data changes
4. **Edge Functions**: Supabase edge functions that handle notification creation logic

## Enabled Extensions

- **pg_net**: PostgreSQL extension for making HTTP requests from the database

## Trigger Functions

### 1. Booking Notifications (`trigger_booking_notifications()`)

**Triggered on**: `bookings` table INSERT or UPDATE of `status` column

**Events handled**:
- `booking_created` (INSERT)
- `booking_approved` (status: pending → approved)
- `booking_rejected` (status: pending → rejected)
- `booking_cancelled` (status: * → cancelled)
- `booking_checked_in` (status: * → checked_in)
- `booking_checked_out` (status: * → checked_out)

**Payload includes**:
- event_type, booking_id, property_id, guest_id, host_id
- old_status, new_status, check_in_date, check_out_date, total_price

### 2. Property Notifications (`trigger_property_notifications()`)

**Triggered on**: `properties` table INSERT or UPDATE of `status` column

**Events handled**:
- `property_submitted` (INSERT)
- `property_approved` (status: pending → approved)
- `property_rejected` (status: pending → rejected)
- `property_suspended` (status: * → suspended)

**Payload includes**:
- event_type, property_id, host_id, property_name
- old_status, new_status

### 3. Property Like Notifications (`trigger_property_like_notifications()`)

**Triggered on**: `property_likes` table INSERT or DELETE

**Events handled**:
- `property_liked` (INSERT)
- Note: Currently no notification for unlikes (DELETE)

**Payload includes**:
- event_type, property_id, user_id, host_id (fetched from properties table)

### 4. Payout Notifications (`trigger_payout_notifications()`)

**Triggered on**: `payout_requests` table INSERT or UPDATE of `status` column

**Events handled**:
- `payout_requested` (INSERT)
- `payout_approved` (status: pending → approved)
- `payout_rejected` (status: pending → rejected)
- `payout_paid` (status: approved → paid)

**Payload includes**:
- event_type, payout_request_id, host_id, amount
- old_status, new_status

## Helper Functions

### `notify_edge_function(function_name TEXT, payload JSONB)`

Makes asynchronous HTTP POST requests to edge functions using pg_net.

**Features**:
- Constructs full URL using `get_edge_function_url()`
- Sets proper Content-Type headers
- Uses service_role permissions for internal routing
- Returns immediately (async operation)

### `get_edge_function_url(function_name TEXT)`

Constructs the full URL for a given edge function name.

**Returns**: `https://hdeklulcgzuhbdusasky.supabase.co/functions/v1/{function_name}`

## Security & Permissions

- All trigger functions use `SECURITY DEFINER` to run with elevated privileges
- Functions are granted to `service_role` for proper execution
- pg_net schema usage granted to `service_role`
- Internal HTTP requests use Supabase's internal routing (no external auth needed)

## Error Handling

- Trigger functions return `COALESCE(NEW, OLD)` to ensure data operations continue even if notification fails
- HTTP requests are asynchronous, so database operations are not blocked by notification failures
- Optional logging available (currently commented out for performance)

## Performance Considerations

- **Asynchronous**: HTTP requests don't block database operations
- **Selective**: Triggers only fire on relevant status changes, not all updates
- **Efficient**: Payload construction includes only necessary data
- **Non-blocking**: Failed notifications don't affect core business operations

## Testing

To test the triggers:

1. **Booking Events**: Insert or update booking status in `bookings` table
2. **Property Events**: Insert or update property status in `properties` table  
3. **Like Events**: Insert into `property_likes` table
4. **Payout Events**: Insert or update payout status in `payout_requests` table

## Monitoring

Monitor trigger execution through:
- Supabase logs for edge function calls
- `pg_net.http_request_queue` table for pending requests
- Database logs for trigger function execution
- Edge function logs for notification processing

## Migration File

The complete implementation is in: `supabase/migrations/20240708_create_notification_triggers.sql`

## Related Edge Functions

- `create-notification`: Main notification creation function
- `trigger-booking-notification`: Handles booking event notifications
- `trigger-property-notification`: Handles property and like event notifications  
- `trigger-payout-notification`: Handles payout event notifications 