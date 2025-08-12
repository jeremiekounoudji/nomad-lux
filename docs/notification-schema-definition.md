# Notification System Database Schema Definition

## Table: notifications

### Fields and Data Types

| Field Name      | Data Type              | Constraints                    | Description                                           |
|-----------------|------------------------|--------------------------------|-------------------------------------------------------|
| id              | uuid                   | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique notification identifier                        |
| user_id         | uuid                   | NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE | Recipient user                                        |
| role            | notification_role_enum | NOT NULL                       | User role: 'guest', 'host', 'admin'                  |
| type            | notification_type_enum | NOT NULL                       | Notification type (see enum below)                   |
| title           | text                   | NOT NULL, CHECK (length(title) <= 255) | Short notification title                              |
| message         | text                   | NOT NULL, CHECK (length(message) <= 1000) | Detailed notification message                         |
| action          | notification_action_enum | NOT NULL                     | Action that triggered the notification                |
| related_id      | uuid                   | NULL                           | ID of related entity (booking, property, etc.)       |
| related_type    | related_entity_enum    | NULL                           | Type of related entity                                |
| is_read         | boolean                | NOT NULL, DEFAULT false        | Whether notification has been read                    |
| sent_via_email  | boolean                | NOT NULL, DEFAULT false        | Whether email was sent                                |
| email_content   | text                   | NULL                           | Actual email content sent                             |
| sent_via_push   | boolean                | NOT NULL, DEFAULT false        | Whether push notification was sent (future)          |
| push_content    | text                   | NULL                           | Push notification content (future)                    |
| created_at      | timestamptz            | NOT NULL, DEFAULT now()        | When notification was created                         |
| updated_at      | timestamptz            | NOT NULL, DEFAULT now()        | When notification was last updated                    |
| metadata        | jsonb                  | NULL, DEFAULT '{}'             | Additional data, error logs, etc.                    |
| batch_id        | uuid                   | NULL                           | For grouping batch notifications                      |

### Enums

#### notification_role_enum
```sql
CREATE TYPE notification_role_enum AS ENUM ('guest', 'host', 'admin');
```

#### notification_type_enum
```sql
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
```

#### notification_action_enum
```sql
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
```

#### related_entity_enum
```sql
CREATE TYPE related_entity_enum AS ENUM (
  'booking',
  'property',
  'payout',
  'user',
  'payment',
  'dispute',
  'system'
);
```

### Indexes

```sql
-- Primary performance indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_related ON notifications(related_type, related_id);
CREATE INDEX idx_notifications_batch ON notifications(batch_id) WHERE batch_id IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX idx_notifications_user_unread_created ON notifications(user_id, is_read, created_at DESC) WHERE is_read = false;
CREATE INDEX idx_notifications_role_type ON notifications(role, type);
```

### Triggers

```sql
-- Update updated_at timestamp on row changes
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
```

### Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Only authenticated users can insert notifications (through edge functions)
CREATE POLICY "Authenticated users can insert notifications" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications" ON notifications
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM user_profiles WHERE role = 'admin'
    )
  );
```

### Storage Considerations

- **Partitioning**: Consider partitioning by created_at for large datasets
- **Archival**: Implement archival strategy for old notifications
- **Email Content**: Large email content may require separate storage
- **Metadata**: Use JSONB for flexible metadata storage with GIN indexes if needed 