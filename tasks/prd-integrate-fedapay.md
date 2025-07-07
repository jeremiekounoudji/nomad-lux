# Integrate FedaPay Payments – Product Requirements Document (PRD)

## 1. Introduction / Overview
Nomad Lux currently lacks an integrated payment solution. This PRD defines how we will integrate **FedaPay** as our payment aggregator so that:
* Guests can seamlessly pay for their property bookings.
* Hosts can receive timely payouts.
* Admins can refund or investigate payment issues.
The solution will use FedaPay's **inline (embedded) checkout widget** to maintain a streamlined, mobile-first experience.

## 2. Goals
1. Accept secure, one-time booking payments inside Nomad Lux using FedaPay.
2. Support payment methods: bank cards (Visa/Mastercard), mobile money, and bank transfers.
3. Handle four currencies per listing (default **XOF**): **XOF, XAF, USD, EUR**.
4. Allow full and partial refunds initiated by admins.
5. Record every transaction in the existing `payment_records` table, keeping data in sync via webhooks.
6. Achieve ≥ 90 % successful payment completion rate while keeping payment-related support tickets ≤ 2 %.
7. Plan for future support of partial/deposit payments (outside current scope).

## 3. User Stories
* **Guest – Pay Booking**
  * *As a guest*, I want to pay for my booking with my preferred local method so that my reservation is confirmed instantly.
* **Guest – See Failure & Retry**
  * *As a guest*, I need clear feedback if a payment fails so that I can retry or choose another method.
* **Host – Track Payout**
  * *As a host*, I want to see payout dates and references for my bookings so that I know when I will receive funds.
* **Admin – Issue Refund**
  * *As an admin*, I want to refund a guest's payment (full or partial) so that disputes are resolved quickly.
* **Admin – Detect Duplicate Payment**
  * *As an admin*, I need to identify and void duplicate charges so that guests are not over-billed.

## 4. Functional Requirements
1. The booking checkout screen **must embed** FedaPay's inline widget (`<iframe>`/JS) rather than redirecting (F2).
2. When a guest confirms a booking, the system **must create a FedaPay payment intent** with amount, currency, and metadata (`booking_id`).
3. The widget **must list** payment methods: bank card, mobile money, bank transfer (D1-D3).
4. Upon payment success, the system **must store** the following in `payment_records`:
   * `booking_id`, `payment_method`, `payment_provider` = "fedapay", `payment_intent_id`, `amount`, `currency`, `processing_fee`, `net_amount`, `payment_status`, `initiated_at`, `completed_at`.
5. On failure, the system **must** capture `failure_reason`, keep `payment_status = 'failed'`, and display a toast with retry option.
6. The system **must subscribe to FedaPay webhooks** (edge function) to update statuses: `pending`, `completed`, `refunded`.
7. Admins **must** be able to trigger full/partial refunds which call FedaPay's refund API and update `refund_amount`, `refund_reason`, `refunded_at`.
8. The system **must prevent duplicate charges** by checking `payment_intent_id` + `booking_id` uniqueness before confirming a new payment.
9. For network time-outs or user exits, the system **must poll** the FedaPay intent status and update the UI accordingly.
10. Host payout fields (`payout_status`, `payout_date`, `payout_reference`) **must** be filled once FedaPay signals payout.
11. Implementation **must use** existing Supabase hooks/stores (`useBookingFlow`, `bookingStore`) for state and keep stores pure (no direct DB calls).
12. Separate **staging vs production** API keys must be supported via environment variables (`L3`).
13. Automated tests **must cover** payment success, failure, timeout, duplicate detection, and refund flows.

## 5. Non-Goals (Out of Scope)
* Recurring subscription payments.
* Cryptocurrency or alternative gateways.
* Automatic FX conversion; prices are provided in a single currency per booking.
* Splitting a single booking payment across multiple payers.

## 6. Design Considerations
* **New mockups required** (K2). Design a clean checkout section with:
  * Booking summary & amount.
  * Embedded FedaPay widget styled with Tailwind.
  * Loading indicators, error toasts.
* Maintain a mobile-first vertical layout; on desktop center the widget with max-width ~400 px.

## 7. Technical Considerations
* **Schema:** Re-use **and extend** `payment_records` table as needed to store all required fee breakdowns (e.g., `processing_fee`, `platform_fee`, `net_amount`) and FedaPay metadata. Add enums/columns only if essential (L1 + L2).
* **API keys:** Store `FEDAPAY_PUBLIC_KEY`, `FEDAPAY_SECRET_KEY`, `FEDAPAY_WEBHOOK_SECRET` in Supabase environment.
* **Edge Function:** `handle-fedapay-webhook.ts` verifies signature and updates `payment_records`.
* **Client:** Create `useFedaPayPayment()` hook to generate intent & attach widget.
* **Error Handling:** Log failures; surface via toast; retry logic capped at 3 attempts.
* **Security:** Use HTTPS only; validate amounts server-side to prevent tampering.

## 8. Success Metrics
| Metric | Target |
| --- | --- |
| Payment completion rate | ≥ 90 % within 30 days |
| Payment-related support tickets | ≤ 2 % of total tickets |
| Duplicate payment incidents | < 1 % of transactions |

## 9. Open Questions
No remaining open questions at this time; key decisions have been captured in the updated sections above.

---
*Document generated – awaiting stakeholder review before implementation.* 