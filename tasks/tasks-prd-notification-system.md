## Relevant Files

- `supabase/migrations/` - Database migration files for creating the notifications table and any related schema changes.
- `src/supabase/` - Supabase config and helper methods for notification-related operations.
- `src/hooks/` - Custom hooks for notification logic, following zustand and supabase-zustand-hooks.mdc.
- `src/lib/stores/` - Zustand stores for notification state management.
- `src/components/shared/NotificationCenter.tsx` - Main notification center UI component (reuse and enhance existing NotificationsPage.tsx and subcomponents).
- `src/components/shared/NotificationToast.tsx` - Toast component for in-app notifications.
- `src/pages/NotificationsPage.tsx` - Existing notifications page to be refactored and enhanced for real data, filtering, and localization.
- `src/pages/` - Pages that may need to display or link to notifications.
- `src/utils/` - Utility functions for notification formatting, localization, etc.
- `supabase/functions/` - Edge functions for notification triggers and email delivery (must use Supabase MCP tool).
- `supabase/functions/create-notification/` - Main edge function for creating notifications.
- `supabase/functions/trigger-booking-notification/` - Edge function for booking-related notifications.
- `supabase/functions/trigger-property-notification/` - Edge function for property-related notifications.
- `supabase/functions/trigger-payout-notification/` - Edge function for payout-related notifications.
- `docs/notification-schema-definition.md` - Detailed schema definition for the notifications table.
- `supabase/migrations/20240708_create_notifications_table.sql` - Migration SQL file to create the notifications table and related objects.
- `docs/notification-payload-mapping.md` - Mapping of notification triggers to payloads and logic.
- `docs/notification-database-triggers.md` - Documentation for database triggers that automatically call edge functions.

### Notes

- All Supabase edge functions and database triggers must be created and deployed using the Supabase MCP tool.
- All backend work (hooks, stores) must follow the supabase-zustand-hooks.mdc rule: stores are pure, all database calls go through hooks.
- Add new files as needed for localization or additional notification logic.
- UI-related sub-tasks should focus on reusing and enhancing `NotificationsPage.tsx` and its subcomponents for the Notification Center UI, with emphasis on data integration, filtering, state management, and localization.

## Tasks

- [ ] 1.0 Design and Create the Supabase Notifications Table

  - [x] 1.1 Define the notification table schema based on PRD requirements (fields, types, indexes).
  - [x] 1.2 Write a migration SQL file in `supabase/migrations/` for the notifications table.
  - [x] 1.3 Apply the migration using the Supabase MCP tool.
  - [x] 1.4 Test table creation and verify schema in Supabase dashboard.

- [ ] 2.0 Implement Notification Triggering Logic for Main App Actions  
       (Use Supabase MCP tool for edge functions or database triggers as required)

  - [x] 2.1 Identify all main actions/events that should trigger notifications (see Notification Triggers section in PRD).
  - [x] 2.2 For each action, define the notification payload and logic (see docs/notification-payload-mapping.md).
  - [x] 2.3 Create edge functions in `supabase/functions/` to handle notification creation for each action (use Supabase MCP tool).
  - [x] 2.4 Set up database triggers to automatically call edge functions on relevant table events (use Supabase MCP tool for triggers).
    - Create triggers on bookings table (INSERT, UPDATE status) to call trigger-booking-notification
    - Create triggers on properties table (INSERT, UPDATE status) to call trigger-property-notification
    - Create triggers on payout_requests table (INSERT, UPDATE status) to call trigger-payout-notification
    - Create triggers on property_likes table (INSERT, DELETE) to call trigger-property-notification
    - Configure triggers to use pg_net extension for HTTP requests to edge functions
  - [x] 2.5 Test notification creation for each main action.

- [ ] 3.0 Implement Email Notification Delivery and Storage  
       (Use Supabase MCP tool for edge functions)

  - [x] 3.1 Define which notification types require email delivery.
  - [ ] 3.2 Extend edge functions to send emails for relevant notifications (use Supabase MCP tool).
  - [ ] 3.3 Store the actual email content in the notification record.
  - [ ] 3.4 Handle and log email delivery failures in notification metadata.
  - [ ] 3.5 Test email delivery and storage for all relevant notification types.

- [ ] 4.0 Build Notification Center UI and In-App Notification Display (Reuse & Enhance NotificationsPage.tsx)

  - [x] 4.1 Refactor `NotificationsPage.tsx` and its subcomponents to fetch and display real notification data from Supabase (using zustand store and hooks).
  - [x] 4.2 Implement filtering by read/unread status and mark-as-read functionality in the UI.
  - [ ] 4.3 Add localization/multilanguage support for notification content in the UI. (FUTURE)
  - [x] 4.4 Add deep linking to related entities (booking, property, etc.) from notifications.
  - [ ] 4.5 Ensure all notification actions (accept/decline/reply) are wired to real logic as needed. (FUTURE)
  - [x] 4.6 Build or enhance the Notification Toast component for real-time in-app alerts.
  - [ ] 4.7 Integrate notification display into relevant pages (e.g., dashboard, home).
  - [ ] 4.8 Add loading, error, and empty states to the UI.

- [ ] 5.0 Implement Notification State Management and Filtering (Zustand)

  - [ ] 5.1 Create a zustand store in `src/lib/stores/` for notification state (pure, no queries inside store).
  - [ ] 5.2 Implement hooks in `src/hooks/` to fetch, update, and mark notifications as read (all Supabase calls in hooks, per supabase-zustand-hooks.mdc).
  - [ ] 5.3 Add filtering logic for read/unread status in the store and UI.
  - [ ] 5.4 Ensure notification data is cached and not redundantly fetched.
  - [ ] 5.5 Test state management and filtering in the UI.

- [ ] 6.0 Add Localization/Multilanguage Support for Notifications
  - [ ] 6.1 Choose or set up a localization library/approach for the frontend (e.g., i18n, react-intl).
  - [ ] 6.2 Update notification creation logic to support multiple languages (store language code or content variants as needed).
  - [ ] 6.3 Localize notification titles and messages in the UI.
  - [ ] 6.4 Test notification display in at least two languages.
