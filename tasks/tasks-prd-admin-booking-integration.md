## Relevant Files

- `src/components/features/admin/BookingManagement.tsx` - Main admin booking management UI component (handles tab switching and table display).
- `src/hooks/useAdminBookings.ts` - Hook for fetching bookings and payment records for admin.
- `src/lib/stores/adminBookingStore.ts` - Zustand store for admin booking and payment record state management.
- `src/interfaces/Booking.ts` - Booking TypeScript interfaces (should match DB fields).
- `src/interfaces/PaymentRecord.ts` - Payment record TypeScript interfaces (should match DB fields).

### Notes

- Bookings and payment records are displayed in separate tabs.
- Each table is shown as a simple list/grid of its fields.
- No refund processing for now.
- Unit tests are not included per user preference.
- Bookings tab: Now uses Zustand store for displaying booking data, ensuring the most relevant fields are shown as per the current UI.
- Payment records: Component will be updated to show all required fields.
- Payment Records tab now displays real data in a table/grid and includes a modal popup for transaction details, following the BookingManagement UI style.

---

## Tasks

- [ ] 1.0 Set Up Admin Booking Store and Interfaces
  - [x] 1.1 Create `adminBookingStore.ts` Zustand store for admin booking and payment record state.
  - [ ] 1.2 Ensure `Booking.ts` and `PaymentRecord.ts` interfaces match the actual DB columns. (skipped - project_id not provided)

- [ ] 2.0 Implement Bookings Tab (Display Only)
  - [x] 2.1 Fetch all bookings from the `bookings` table. (MCP tool usage not required during implementation phase)
  - [x] 2.2 Display bookings using the existing UI, focusing on the most relevant fields already present (property, guest, host, status, payment status, dates, amount, etc.). No need to display all DB columns.
  - [x] 2.3 Add pagination (10 per page), loading, and error states (already present in UI).

- [ ] 3.0 Implement Payment Records Tab (Display Only)
  - [x] 3.1 Update the payment records component to fetch and display all required payment record fields in a table/grid.
  - [ ] 3.2 Add pagination (10 per page), loading, and error states for payment records.

- [ ] 4.0 Add Filtering and Search
  - [ ] 4.1 Implement text search (by id, guest_id, property_id, etc.) for both tables.
  - [ ] 4.2 Add status filter for bookings and payment_status filter for payment records.

- [ ] 5.0 Polish UI and Tab Navigation
  - [ ] 5.1 Ensure tab navigation between Bookings and Payment Records.
  - [ ] 5.2 Use HeroUI and Tailwind for consistent, mobile-friendly design.
  - [ ] 5.3 Add admin-specific debug logs for troubleshooting. 