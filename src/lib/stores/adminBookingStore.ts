import { create } from 'zustand';
import type { AdminBooking } from '../../interfaces/Booking';
import type { PaymentRecord } from '../../interfaces/PaymentRecord';

interface AdminBookingStoreState {
  bookings: AdminBooking[];
  paymentRecords: PaymentRecord[];
  bookingsLoading: boolean;
  bookingsError: string | null;
  paymentRecordsLoading: boolean;
  paymentRecordsError: string | null;
  bookingsPage: number;
  bookingsTotal: number;
  paymentRecordsPage: number;
  paymentRecordsTotal: number;
  setBookings: (bookings: AdminBooking[], total: number) => void;
  setBookingsLoading: (loading: boolean) => void;
  setBookingsError: (error: string | null) => void;
  setBookingsPage: (page: number) => void;
  setPaymentRecords: (records: PaymentRecord[], total: number) => void;
  setPaymentRecordsLoading: (loading: boolean) => void;
  setPaymentRecordsError: (error: string | null) => void;
  setPaymentRecordsPage: (page: number) => void;
}

export const useAdminBookingStore = create<AdminBookingStoreState>((set) => ({
  bookings: [],
  paymentRecords: [],
  bookingsLoading: false,
  bookingsError: null,
  paymentRecordsLoading: false,
  paymentRecordsError: null,
  bookingsPage: 1,
  bookingsTotal: 0,
  paymentRecordsPage: 1,
  paymentRecordsTotal: 0,
  setBookings: (bookings, total) => set({ bookings, bookingsTotal: total }),
  setBookingsLoading: (loading) => set({ bookingsLoading: loading }),
  setBookingsError: (error) => set({ bookingsError: error }),
  setBookingsPage: (page) => set({ bookingsPage: page }),
  setPaymentRecords: (paymentRecords, total) => set({ paymentRecords, paymentRecordsTotal: total }),
  setPaymentRecordsLoading: (loading) => set({ paymentRecordsLoading: loading }),
  setPaymentRecordsError: (error) => set({ paymentRecordsError: error }),
  setPaymentRecordsPage: (page) => set({ paymentRecordsPage: page }),
})); 