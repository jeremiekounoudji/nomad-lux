# Notification Payload Mapping and Logic

This document maps each notification trigger to its required payload, recipient, and logic for implementation.

| Trigger Event                        | Notification Type         | Action                      | Recipient Role | Required Payload Fields                                      | Email? | Special Logic/Notes                |
|--------------------------------------|--------------------------|-----------------------------|---------------|--------------------------------------------------------------|--------|------------------------------------|
| Booking request submitted            | booking_request_created  | booking_request_create      | host          | user_id, booking_id, property_id, title, message             | No     |                                    |
| Booking request approved             | booking_approved         | booking_approve             | guest         | user_id, booking_id, property_id, title, message             | Yes    |                                    |
| Booking request rejected             | booking_rejected         | booking_reject              | guest         | user_id, booking_id, property_id, title, message             | Yes    |                                    |
| Booking cancelled (by guest/host)    | booking_cancelled        | booking_cancel              | guest/host    | user_id, booking_id, property_id, title, message             | Yes    | Send to both guest and host        |
| Booking payment successful           | payment_success          | payment_process             | guest         | user_id, booking_id, payment_id, amount, title, message      | Yes    |                                    |
| Booking payment failed               | payment_failed           | payment_fail                | guest         | user_id, booking_id, payment_id, title, message              | Yes    |                                    |
| Booking refunded                     | booking_refunded         | booking_refund              | guest/host    | user_id, booking_id, payment_id, amount, title, message      | Yes    | Send to both guest and host        |
| Booking checked-in                   | booking_checked_in       | booking_checkin             | guest/host    | user_id, booking_id, property_id, title, message             | No     | Send to both guest and host        |
| Booking checked-out                  | booking_checked_out      | booking_checkout            | guest/host    | user_id, booking_id, property_id, title, message             | No     | Send to both guest and host        |
| Property liked/unliked               | property_liked           | property_like               | host          | user_id, property_id, title, message                         | No     |                                    |
| Account suspended/deleted            | account_suspended        | account_suspend             | guest/host    | user_id, title, message                                      | Yes    |                                    |
| Profile updated (security)           | profile_updated          | profile_update              | guest/host    | user_id, title, message                                      | No     |                                    |
| New booking request received         | new_booking_request      | booking_request_create      | host          | user_id, booking_id, property_id, title, message             | Yes    |                                    |
| Booking payment received             | payment_received         | payment_process             | host          | user_id, booking_id, payment_id, amount, title, message      | Yes    |                                    |
| Property approved                    | property_approved        | property_approve            | host          | user_id, property_id, title, message                         | Yes    |                                    |
| Property rejected                    | property_rejected        | property_reject             | host          | user_id, property_id, title, message                         | Yes    |                                    |
| Property suspended                   | property_suspended       | property_suspend            | host          | user_id, property_id, title, message                         | Yes    |                                    |
| Payout request approved              | payout_approved          | payout_approve              | host          | user_id, payout_id, amount, title, message                   | Yes    |                                    |
| Payout request rejected              | payout_rejected          | payout_reject               | host          | user_id, payout_id, title, message                           | Yes    |                                    |
| Payout paid                          | payout_paid              | payout_pay                  | host          | user_id, payout_id, amount, title, message                   | Yes    |                                    |
| New property submitted               | property_submitted       | property_submit             | admin         | user_id, property_id, title, message                         | Yes    |                                    |
| New payout request submitted         | payout_requested         | payout_request              | admin         | user_id, payout_id, amount, title, message                   | Yes    |                                    |
| Dispute raised                       | dispute_raised           | dispute_raise               | admin         | user_id, dispute_id, title, message                          | Yes    |                                    |
| System errors (optional)             | system_error             | system_error_log            | admin         | title, message, metadata                                     | Yes    |                                    |
| User/host account flagged/suspended  | account_flagged          | account_flag                | admin         | user_id, title, message                                      | No     |                                    |
| Bulk actions (e.g., bulk suspend)    | bulk_action              | bulk_user_action            | admin         | batch_id, user_ids, action, title, message                   | Yes    | Use batch_id for grouping          |

## Notes
- All notification payloads must include: user_id (recipient), type, action, title, message, and related_id/related_type as appropriate.
- For batch actions, use batch_id to group notifications.
- For email notifications, store the actual email content in the notification record.
- For actions affecting both guest and host, create separate notifications for each recipient.
- Use metadata for any extra context (e.g., error details, links, etc.). 