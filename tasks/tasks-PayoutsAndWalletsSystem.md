## Relevant Files

- `docs/PayoutsAndWalletsSystem.md` - PRD reference for the payouts & wallets system.
- `supabase/migrations/20240315_create_payout_requests.sql` - Migration to create `payout_requests` table.
- `supabase/migrations/20240315_update_payment_records_triggers.sql` - Migration to update `payment_records` triggers.
- `supabase/migrations/20240315_update_user_wallets_triggers.sql` - Migration to update `user_wallets` triggers.
- `supabase/functions/requestPayout.ts` - Edge function allowing hosts to request payouts.
- `supabase/functions/approvePayout.ts` - Edge function for admins to approve/reject payouts.
- `src/lib/stores/walletStore.ts` - Zustand store for wallet data (will be extended).
- `src/lib/stores/payoutRequestStore.ts` - New store managing payout request state.
- `src/hooks/useWalletMetrics.ts` - Hook fetching wallet metrics (already added).
- `src/hooks/usePayoutRequests.ts` - New hook for host payout requests.
- `src/hooks/useAdminPayoutRequests.ts` - New hook for admin payout management.
- `src/components/shared/modals/RequestPayoutModal.tsx` - Modal component for host payout requests.
- `src/components/features/admin/PayoutRequestsTable.tsx` - Admin table listing payout requests.
- `src/components/features/admin/modals/ApproveRejectPayoutModal.tsx` - Modal for admin approve/reject workflow.
- `src/pages/WalletPage.tsx` - Wallet page UI updates & integration.
- `src/pages/AdminPage.tsx` - Dashboard integration for payout management.
- `tests/functions/requestPayout.test.ts` - Unit tests for the `requestPayout` edge function.
- `tests/functions/approvePayout.test.ts` - Unit tests for the `approvePayout` edge function.
- `src/interfaces/PayoutRequest.ts` - New interface for payout requests.
- `docs/PayoutEdgeFunctionsREADME.md` - API documentation for requestPayout & approvePayout edge functions.

### Notes

- Unit tests should be placed alongside the files they test (e.g., `requestPayout.ts` and `requestPayout.test.ts` in the same directory).
- Use `npx jest` to run the full test suite or specify individual test files.
- All migrations, edge-function deployments, and other Supabase interactions must be executed via the **Supabase MCP tool** (`mcp_supabase_*` commands) as outlined in the `supabase-zustand-hooks` guideline.

## Tasks

- [x] 1.0 Database Schema & Triggers
  - [x] 1.1 Design `payout_requests` table schema (columns, indexes, constraints).
  - [x] 1.2 Create migration to add the `payout_requests` table.
  - [x] 1.3 Update `payment_records` triggers to set `free_at_date` and manage `payout_status`.
  - [x] 1.4 Update `user_wallets` triggers to recalculate wallet metrics (`payout_balance`, etc.).
  - [x] 1.5 Disable Row-Level Security (RLS) for `payout_requests`, `payment_records`, and `user_wallets` during initial development.
  - [x] ~~1.6 Test all new migrations and triggers locally via Supabase CLI (skipped)~~

- [x] 2.0 Backend API & Edge Functions
  - [x] 2.1 Implement `requestPayout` edge function (host-side validation & request creation).
  - [x] 2.2 Implement `approvePayout` edge function (admin approval/rejection logic; updates DB statuses only — no external payment processing).
  - [x] 2.4 Update TypeScript types and Supabase declarations for new tables/endpoints.
  - [x] 2.5 Document new endpoints in backend README/API docs.

- [x] 3.0 Host Wallet Frontend
  - [x] 3.1 Build `RequestPayoutModal` component with amount input & validations.
  - [x] 3.2 Implement `usePayoutRequests` hook to manage host payout requests & API calls.
  - [x] 3.3 Extend `walletStore` with payout request state (loading, error, list).
  - [x] 3.4 Update `WalletPage` to integrate modal, display payout history & eligibility logic.
  - [x] 3.5 Add toast notifications for payout actions (request success/failure).

- [x] 4.0 Admin Payout Management Frontend
  - [x] 4.1 Build `PayoutRequestsTable` component to list payout requests.
  - [x] 4.2 Build `ApproveRejectPayoutModal` component for admin approval/rejection workflow.
  - [x] 4.3 Implement `useAdminPayoutRequests` hook for admin payout management.
  - [x] 4.4 Implement `PayoutRequestsTable` component to list payout requests.
  - [x] 4.5 Implement `ApproveRejectPayoutModal` component for admin approval/rejection workflow.

- [ ] 5.0 Notification & Auditing
  - [ ] 5.1 Send in-app notifications to hosts on payout approval/rejection.
  - [ ] 5.2 Record admin payout actions in `ActivityLog` for auditing.
  - [ ] 5.3 Display payout-related notifications in `NotificationsPage` UI.
  - [ ] 5.5 Update technical documentation to reflect new auditing processes.
