# 💸 Payouts & Wallets System — Technical Implementation Plan (v2)

## 1. **Overview**

This document details the architecture and process for managing host wallet balances, payout requests, and admin-controlled payout processing in Nomad Lux. **All calculations and eligibility checks use only the following admin settings:**
- `minimumPayoutAmount`
- `hostPayoutDelay`

All other payout-related settings are ignored for now.

---

## 2. **Key Entities & Tables**

### **A. `user_wallets` Table**
- **Purpose:** Stores aggregated wallet metrics for each host.
- **Columns:**  
  `user_id`, `currency`, `total_balance`, `pending_amount`, `pending_count`, `failed_amount`, `failed_count`, `successful_amount`, `successful_count`, `payout_balance`, `last_payout_date`, `next_payout_allowed_at`, `created_at`, `updated_at`

### **B. `payment_records` Table**
- **Purpose:** Tracks all payment events (guest payments, refunds, payouts, etc.).
- **Relevant Columns:**  
  `id`, `booking_id`, `amount`, `currency`, `payment_status`, `payment_type`, `payout_status`, `free_at_date`, `payout_date`, `created_at`, `updated_at`

### **C. `payout_requests` Table** (to be created)
- **Purpose:** Stores host-initiated payout requests for admin review.
- **Columns:**  
  `id`, `user_id`, `amount`, `currency`, `status`, `requested_at`, `processed_at`, `admin_id`, `note`

---

## 3. **Admin Settings Used**

- **`minimumPayoutAmount`**: Minimum amount required for a host to request a payout.
- **`hostPayoutDelay`**: Number of days after payment before funds become available for payout.

> **All other payout-related settings (e.g., payout schedule, auto-payout, etc.) are ignored in this version.**

---

## 4. **Process Flow**

### **A. Payment Completion & Wallet Update**

1. **Guest payment is completed** (`payment_records` row with `payment_status = 'completed'` and `payment_type = 'payment'`).
2. **Trigger logic:**
   - Sets `free_at_date` on the payment record:  
     `created_at + hostPayoutDelay` (from admin settings).
   - Updates `user_wallets` metrics for the host (via trigger).
   - **Funds are not immediately available for payout**; they are grouped by host and `free_at_date`.

### **B. Payout Eligibility Calculation**

- **Funds eligible for payout** are:
  - All `payment_records` for a host with:
    - `payment_status = 'completed'`
    - `payment_type = 'payment'`
    - `payout_status = 'pending'`
    - `free_at_date <= NOW()`
- **Wallet metrics** (`payout_balance`) are updated to reflect the sum of these eligible funds.

### **C. Host-Initiated Payout Request**

1. **Host clicks "Payout"** on the Wallet page.
2. **Frontend logic:**
   - Checks if `payout_balance >= minimumPayoutAmount`.
   - If eligible, creates a new row in `payout_requests` with the requested amount (can be full or partial, but must not exceed `payout_balance`).
   - Sets status to `pending`.
3. **All eligible `payment_records`** for the host are updated to `payout_status = 'pending'` and linked to the payout request (if needed).

### **D. Admin Review & Processing**

1. **Admin views payout requests** in the admin dashboard.
2. **Admin actions:**
   - **Approve:**  
     - Sets `status = 'approved'` on the payout request.
     - Updates all linked `payment_records` to `payout_status = 'approved'`.
     - Initiates actual payout (manual or via payment API).
     - On success, sets `payout_status = 'completed'`, updates `payout_date`, and updates `user_wallets`:
       - Deducts the paid-out amount from `total_balance` and `payout_balance`.
       - Sets `last_payout_date`.
   - **Reject:**  
     - Sets `status = 'rejected'` on the payout request.
     - Optionally adds a note.
     - Linked `payment_records` revert to `payout_status = 'pending'`.

### **E. Triggers & Automation**

- **After every payment record insert/update:**
  - Triggers update `user_wallets` metrics.
  - If `payment_status` changes to `completed`, sets `free_at_date` using `hostPayoutDelay`.
- **After payout request approval:**
  - Triggers update `user_wallets` and all relevant `payment_records`.
- **All logic is grouped and aggregated by host.**

---

## 5. **Technical Implementation Steps**

### **A. Database**

1. **Create `payout_requests` table** (see schema above).
2. **Update triggers on `payment_records`:**
   - On insert/update, if `payment_status = 'completed'`, set `free_at_date` using `hostPayoutDelay`.
   - On payout approval, update `payout_status` and `payout_date`.
3. **Update `user_wallets` trigger logic:**
   - Aggregate all eligible funds for payout.
   - Update `payout_balance`, `total_balance`, and payout dates.
   - Only affect new/changed records (not historical).

### **B. Backend/Edge Functions**

1. **Payout request API:**
   - Endpoint for hosts to create payout requests.
   - Validates eligibility and amount using `minimumPayoutAmount`.
2. **Admin payout approval API:**
   - Endpoint for admins to approve/reject requests.
   - Handles updating all related records and triggers payout logic.
3. **Notification system:**
   - Notifies host on payout approval/rejection.

### **C. Frontend**

1. **Wallet Page:**
   - Fetches wallet metrics and eligible payout amount.
   - Shows grouped/aggregated metrics.
   - "Payout" button opens a modal to request payout (amount, currency).
   - Shows payout request status/history.
2. **Admin Dashboard:**
   - Lists all payout requests with filters (pending, approved, rejected, completed).
   - Approve/reject actions with notes.
   - Shows audit trail for each payout.

---

## 6. **Grouping & Aggregation Logic**

- **All wallet and payout calculations are grouped by host (`user_id`).**
- **Sums are used for all monetary fields** (e.g., `SUM(amount)` for eligible payments).
- **Only new/changed payment records** are affected by triggers (no retroactive changes).

---

## 7. **Security & Auditing**

- **All payout actions are auditable** (admin ID, timestamps, notes).
- **Only admins can approve/reject payouts.**
- **All logic is enforced at the database level via triggers and RLS.**

---

## 8. **Future Enhancements**

- **Other payout settings** (e.g., payout schedule, auto-payout) can be added later.
- **Partial payouts** and multi-currency support can be added as needed.
- **Detailed payout history** and downloadable reports for hosts and admins.

---

## 9. **Summary Diagram**

```mermaid
flowchart TD
    A[Guest Payment Completed] --> B[Trigger: Set free_at_date (hostPayoutDelay)]
    B --> C[Update user_wallets metrics]
    C --> D[Host sees payout balance]
    D --> E[Host requests payout (if >= minimumPayoutAmount)]
    E --> F[Payout request created (pending)]
    F --> G[Admin reviews request]
    G -->|Approve| H[Funds paid out, records updated, wallet updated]
    G -->|Reject| I[Request rejected, records revert]
```

---

**This system ensures all wallet and payout logic is robust, auditable, and grouped/aggregated by host, with clear admin control and frontend feedback. Only `minimumPayoutAmount` and `hostPayoutDelay` are used for all calculations and eligibility checks.** 