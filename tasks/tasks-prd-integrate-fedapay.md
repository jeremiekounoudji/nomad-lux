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

## Payment Workflow

The correct payment workflow should be:

1. **User clicks "Pay Now"** → Show loading state on button
2. **Create payment record in database** with:
   - `status: 'pending'` 
   - `payment_method: null` (empty, will be filled after payment)
   - `amount` (fees already included, no need to calculate processing_fee/platform_fee)
3. **Open FedaPay modal** via `FedaCheckoutButton` programmatically
4. **On payment completion** → Update the payment record with:
   - `status: 'completed'` or `'failed'`
   - `payment_method: <actual_method_used>`
   - Other relevant fields from FedaPay response
5. **Implement retry pattern** to ensure database updates succeed

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
  - [x] 3.4 Integrate FedaPay into booking flow (switch to default modal)
    - [x] 3.4.1 Remove custom `PaymentCheckout` modal implementation
    - [x] 3.4.2 Replace with `FedaCheckoutButton` (default FedaPay modal) in booking card flow
    - [x] 3.4.3 Implement new payment workflow: create payment record → show loading → trigger FedaPay modal → update record on completion with retry pattern

- [x] 4.0 Implement webhook handler & backend integration _(removed – direct front-end FedaPay integration makes this unnecessary)_
  - [x] 4.1–4.4 _(removed)_

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
  - [x] 7.1 Build `walletStore` (pure Zustand) to hold payments array, pagination state, loading/error flags.
  - [x] 7.2 Implement `useWalletHistory` hook to query `payment_records` (supabase) with limit/offset and push results into `walletStore`.
  - [x] 7.3 Create `WalletPage.tsx` that displays list of payments with amount, currency, status, created date, booking link.
  - [x] 7.4 Add Tailwind-based pagination controls (Prev/Next) and loading skeletons.
  - [x] 7.5 Add route `/wallet` and navigation link (e.g., in user profile menu or bottom navbar).
  - [ ] 7.6 Write unit tests for `useWalletHistory` and `WalletPage`.
  - [ ] 7.7 Implement function to automatically update host wallet after successful payment, refund, or payout (updates balances in `walletStore`).
  - [ ] 7.8 Add summary card on Wallet page (visible for hosts) showing:
      - Total wallet balance
      - Pending payments amount and count
      - Failed payments amount and count
      - Successful payments amount and count
      - Payout balance
    Also include a "Payout" button that allows hosts to initiate payout of available balance.