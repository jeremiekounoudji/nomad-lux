## Relevant Files

- `migrations/2024XXXXXX_add_fedapay_columns.sql` – Migration to extend `payment_records` (add fees columns, unique indexes, etc.).
- `src/interfaces/PaymentRecord.ts` – Update TypeScript interface to match new schema.
- `src/hooks/useFedaPayPayment.ts` – Custom hook to create payment intent and embed FedaPay widget.
- `src/components/features/booking/PaymentCheckout.tsx` – Checkout component integrating the hook.
- `src/lib/stores/bookingStore.ts` – Extend store to track payment status and errors.
- `supabase/functions/handle-fedapay-webhook.ts` – Edge function processing FedaPay webhooks and updating DB.
- `src/components/features/admin/RefundModal.tsx` – Modal that triggers FedaPay refund API and updates state.
- `src/pages/AdminDashboard.tsx` – Section displaying payouts and refund status.
- `tests/hooks/useFedaPayPayment.test.ts` – Unit tests for the payment hook.
- `tests/functions/handle-fedapay-webhook.test.ts` – Unit tests for the webhook handler.
- `tests/e2e/paymentFlow.e2e.ts` – End-to-end tests for full booking payment flow.
- `src/lib/stores/walletStore.ts` – Zustand store for paginated user payment history.
- `src/hooks/useWalletHistory.ts` – Hook to fetch paginated `payment_records` for the current user.
- `src/pages/WalletPage.tsx` – New page displaying a user's wallet/payment history with pagination.
- `tests/hooks/useWalletHistory.test.ts` – Unit tests for the wallet history hook.
- `tests/pages/WalletPage.test.tsx` – Unit tests for the wallet page component.

### Notes

- Co-locate unit test files alongside their code when possible (e.g., `MyHook.ts` & `MyHook.test.ts`).
- Use `npx jest` for unit tests and Playwright/Cypress for e2e tests.
- Migrations filenames should start with a UTC timestamp for Supabase.
- Follow **Nomad Lux Frontend Guide**: use Tailwind CSS for styling and Hero UI headless components when building `WalletPage` and any new UI elements.

## Tasks

- [x] 1.0 Update `payment_records` database schema for FedaPay data
  - [x] 1.1 Write SQL migration to add `platform_fee` (numeric) and create unique index on (`payment_intent_id`, `booking_id`).
  - [x] 1.2 Apply migration to staging via Supabase and verify new columns/indexes.
  - [x] 1.3 Regenerate Supabase TypeScript types and update `src/interfaces/PaymentRecord.ts`.
  - [x] 1.4 Refactor any existing queries/stores to use the new columns.

- [x] 2.0 Configure FedaPay environment variables & keys (staging/production)
  - [x] 2.1 Obtain FedaPay public, secret, and webhook keys for both environments.
  - [x] 2.2 Add keys to `.env`, Supabase secrets, and CI variables.
  - [x] 2.3 Update `src/lib/config.ts` to expose keys via Vite/Supabase runtime config.

- [ ] 3.0 Implement client-side payment flow (inline widget & hook)
  - [x] 3.1 Create `useFedaPayPayment` hook to request payment intent (via edge function/RPC) and mount widget.
  - [x] 3.2 Build `PaymentCheckout` component using FedaPay React SDK and the hook.
  - [x] 3.3 Add FedaPay checkout.js script to `index.html` and configure widget options.
  - [ ] 3.4 Integrate component into booking flow and test basic payment initiation.

- [ ] 4.0 Implement webhook handler & backend integration
  - [ ] 4.1 Create `handle-fedapay-webhook.ts` edge function with HMAC signature verification.
  - [ ] 4.2 Map FedaPay events (`payment_succeeded`, `payment_failed`, `payout_paid`, `refund_processed`) to DB updates.
  - [ ] 4.3 Secure endpoint route and register URL in FedaPay dashboard.
  - [ ] 4.4 Write unit tests for webhook handler covering success & failure cases.

- [ ] 5.0 Build admin refund & payout management tools
  - [ ] 5.1 Extend `RefundModal` to call FedaPay refund API and update `payment_records`.
  - [ ] 5.2 Add payouts list/table to `AdminDashboard` showing `payout_status`, `payout_date`, and references.
  - [ ] 5.3 Provide ability to retry or cancel pending payouts if supported.
  - [ ] 5.4 Ensure UI uses zustand stores & reflects real-time changes (listen to webhook updates).

- [ ] 6.0 Create automated tests and QA checklist
  - [ ] 6.1 Write unit tests for `useFedaPayPayment` hook.
  - [ ] 6.2 Write unit tests for `handle-fedapay-webhook` edge function.
  - [ ] 6.3 Implement e2e tests running against FedaPay sandbox covering success, failure, refund flows.
  - [ ] 6.4 Draft QA checklist for manual testing across mobile/desktop, various payment methods, and edge cases.
  - [ ] 6.5 Add CI workflow to run Jest and e2e tests on every PR.

- [ ] 7.0 Create user Wallet page with paginated payment history
  - [ ] 7.1 Build `walletStore` (pure Zustand) to hold payments array, pagination state, loading/error flags.
  - [ ] 7.2 Implement `useWalletHistory` hook to query `payment_records` (supabase) with limit/offset and push results into `walletStore`.
  - [ ] 7.3 Create `WalletPage.tsx` that displays list of payments with amount, currency, status, created date, booking link.
  - [ ] 7.4 Add Tailwind-based pagination controls (Prev/Next) and loading skeletons.
  - [ ] 7.5 Add route `/wallet` and navigation link (e.g., in user profile menu or bottom navbar).
  - [ ] 7.6 Write unit tests for `useWalletHistory` and `WalletPage`.