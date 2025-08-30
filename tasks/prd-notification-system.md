# Product Requirements Document (PRD): Notification System

## 1. Introduction/Overview

The Notification System enables the Nomad Lux platform to inform users (guests, hosts, and admins) of important events and actions in real time. It ensures users are promptly notified via in-app notifications and, for critical events, via email. The system supports batch notifications, stores the actual email content sent, and is designed to be extensible for future push notification support.

---

## 2. Goals

- Ensure all main user and admin actions trigger appropriate notifications.
- Deliver notifications in-app and via email for critical events.
- Support batch notifications for admin bulk actions.
- Store the actual email content sent for auditing and troubleshooting.
- Prepare the system for future push notification integration.
- Provide a clear, actionable notification record for each event.

---

## 3. User Stories

**Guest**
- As a guest, I want to be notified when my booking is approved, rejected, or cancelled so I can plan accordingly.
- As a guest, I want to receive an email when my payment succeeds or fails so I have a record.
- As a guest, I want to see a notification if my account is suspended.

**Host**
- As a host, I want to be notified when I receive a new booking request so I can respond quickly.
- As a host, I want to receive an email when my property is approved, rejected, or suspended.
- As a host, I want to be notified when a payout is processed.

**Admin**
- As an admin, I want to receive notifications (and emails) when a new property is submitted for approval.
- As an admin, I want to be notified (and emailed) when a new payout request is submitted.
- As an admin, I want to send batch notifications for bulk actions (e.g., suspending multiple users).

---

## 4. Functional Requirements

1. The system must create a notification record in the database for every main action (see triggers below).
2. The notification record must include: recipient, role, type, title, message, action, related entity, read status, email content (if sent), push content (future), timestamps, metadata, and batch ID (if applicable).
3. The system must send an email for critical events (see triggers below) and store the actual email content in the notification record.
4. The system must support batch notifications, associating related notifications with a batch ID.
5. The system must provide a way for users to mark notifications as read.
6. The system must support deep links in notifications to relevant app pages (e.g., booking, property).
7. The system must be extensible to support push notifications in the future.
8. The system must allow admins to view all notifications for auditing.
9. The system must handle notification delivery failures gracefully and log errors for review.
10. The system must allow users to filter notifications by read/unread status in the notification center/page.
11. The system must support localization/multiple languages for notification titles and messages.

---

## Notification Triggers

### Guest
| Action/Event                        | Notification Type         | Email? |
|------------------------------------- |--------------------------|--------|
| Booking request submitted           | booking_request_created  | No     |
| Booking request approved            | booking_approved         | Yes    |
| Booking request rejected            | booking_rejected         | Yes    |
| Booking cancelled (by guest/host)   | booking_cancelled        | Yes    |
| Booking payment successful          | payment_success          | Yes    |
| Booking payment failed              | payment_failed           | Yes    |
| Booking refunded                    | booking_refunded         | Yes    |
| Booking checked-in                  | booking_checked_in       | No     |
| Booking checked-out                 | booking_checked_out      | No     |
| Property liked/unliked              | property_liked           | No     |
| Account suspended/deleted           | account_suspended        | Yes    |
| Profile updated (security)          | profile_updated          | No     |

### Host
| Action/Event                        | Notification Type         | Email? |
|------------------------------------- |--------------------------|--------|
| New booking request received        | new_booking_request      | Yes    |
| Booking cancelled by guest          | booking_cancelled        | Yes    |
| Booking payment received            | payment_received         | Yes    |
| Booking checked-in                  | booking_checked_in       | No     |
| Booking checked-out                 | booking_checked_out      | No     |
| Booking refunded                    | booking_refunded         | Yes    |
| Property approved                   | property_approved        | Yes    |
| Property rejected                   | property_rejected        | Yes    |
| Property suspended                  | property_suspended       | Yes    |
| Payout request approved             | payout_approved          | Yes    |
| Payout request rejected             | payout_rejected          | Yes    |
| Payout paid                         | payout_paid              | Yes    |
| Account suspended/deleted           | account_suspended        | Yes    |
| Profile updated (security)          | profile_updated          | No     |

### Admin
| Action/Event                        | Notification Type         | Email? |
|------------------------------------- |--------------------------|--------|
| New property submitted              | property_submitted       | Yes    |
| New payout request submitted        | payout_requested         | Yes    |
| Dispute raised                      | dispute_raised           | Yes    |
| System errors (optional)            | system_error             | Yes    |
| User/host account flagged/suspended | account_flagged          | No     |
| Bulk actions (e.g., bulk suspend)   | bulk_action              | Yes    |

---

## 5. Non-Goals (Out of Scope)

- Chat/message notifications (not supported yet).
- Deleting notifications (only mark-as-read is required).
- Push notification delivery (future work, but schema should support it).
- Custom notification preferences per user (e.g., opt-out).
- Automatic expiration or archiving of notifications.
- Limiting the number of notifications stored per user.

---

## 6. Design Considerations

- Follow existing Nomad Lux UI/UX guidelines for notification display (e.g., use Tailwind CSS, Hero UI components).
- Notifications should be accessible from a dedicated notification center/page and as toasts for immediate feedback.
- Use clear, concise language in notification titles and messages.
- Support deep links in notification UI for quick navigation.

---

## 7. Technical Considerations

- Use a single `notifications` table in Supabase with the following fields:
  - id (uuid, PK)
  - user_id (uuid)
  - role (text/enum)
  - type (text/enum)
  - title (text)
  - message (text)
  - action (text/enum)
  - related_id (uuid)
  - related_type (text/enum)
  - is_read (boolean)
  - sent_via_email (boolean)
  - email_content (text)
  - sent_via_push (boolean)
  - push_content (text)
  - created_at (timestamp)
  - updated_at (timestamp)
  - metadata (jsonb)
  - batch_id (uuid, nullable)
- Use Supabase edge functions or triggers to insert notifications and send emails.
- Store the actual email content sent in the `email_content` field.
- For batch actions, use `batch_id` to group notifications.
- Log delivery failures in a separate error log or in the notification metadata.
- Support localization/multiple languages for notification content.

---

## 8. Success Metrics

- 100% of main actions trigger a notification within 1 second.
- 100% of critical events send an email and store the content.
- Users can access and mark notifications as read.
- Users can filter notifications by read/unread status.
- Admins can audit notification records and email content.
- System is ready for push notification integration.
- Notification content can be localized for multiple languages.

---

## 9. Open Questions

All open questions have been answered and incorporated into the requirements above. 