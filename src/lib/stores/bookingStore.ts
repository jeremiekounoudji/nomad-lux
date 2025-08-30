import { create } from 'zustand'
import { 
  DatabaseBooking, 
  BookingFormData, 
  PriceBreakdown, 
  AvailabilityResult,
  BookingRequest,
  PaymentRecord,
  BookingStatus,
  PaginationData
} from '../../interfaces'

interface BookingState {
  // Current booking flow state
  currentBookingForm: BookingFormData | null
  priceBreakdown: PriceBreakdown | null
  availabilityResult: AvailabilityResult | null
  
  // Guest bookings
  guestBookings: DatabaseBooking[]
  
  // Host bookings
  hostBookings: DatabaseBooking[]
  hostBookingRequests: BookingRequest[]
  
  // Payment records
  paymentRecords: PaymentRecord[]
  
  // Loading states
  isCheckingAvailability: boolean
  isCalculatingPrice: boolean
  isCreatingBooking: boolean
  isLoadingGuestBookings: boolean
  isLoadingHostBookings: boolean
  isLoadingHostRequests: boolean
  isProcessingPayment: boolean
  isUpdatingBooking: boolean
  
  error: string | null

  // New state for paginated requests
  bookingRequestsByStatus: Record<BookingStatus, BookingRequest[]>
  paginationData: Record<BookingStatus, PaginationData>

  // Actions - Pure state management only (no database calls)
  
  // Booking flow actions
  setCurrentBookingForm: (form: BookingFormData | null) => void
  setPriceBreakdown: (breakdown: PriceBreakdown | null) => void
  setAvailabilityResult: (result: AvailabilityResult | null) => void
  
  // Booking data setters
  setGuestBookings: (bookings: DatabaseBooking[]) => void
  setHostBookings: (bookings: DatabaseBooking[]) => void
  setHostBookingRequests: (requests: BookingRequest[]) => void
  setPaymentRecords: (records: PaymentRecord[]) => void
  
  // Loading state setters
  setIsCheckingAvailability: (loading: boolean) => void
  setIsCalculatingPrice: (loading: boolean) => void
  setIsCreatingBooking: (loading: boolean) => void
  setIsLoadingGuestBookings: (loading: boolean) => void
  setIsLoadingHostBookings: (loading: boolean) => void
  setIsLoadingHostRequests: (loading: boolean) => void
  setIsProcessingPayment: (loading: boolean) => void
  setIsUpdatingBooking: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Utility actions
  addGuestBooking: (booking: DatabaseBooking) => void
  addHostBooking: (booking: DatabaseBooking) => void
  updateBookingStatus: (bookingId: string, status: DatabaseBooking['status']) => void
  updateBookingRequestStatus: (requestId: string, status: BookingRequest['status']) => void
  addPaymentRecord: (record: PaymentRecord) => void
  updatePaymentRecord: (recordId: string, updates: Partial<PaymentRecord>) => void
  removeBookingRequest: (requestId: string) => void
  
  clearError: () => void
  reset: () => void
  resetBookingFlow: () => void

  // New actions for paginated requests
  setHostBookingRequestsByStatus: (status: BookingStatus, requests: BookingRequest[]) => void
  setPaginationData: (status: BookingStatus, data: PaginationData) => void
}

const initialState = {
  currentBookingForm: null,
  priceBreakdown: null,
  availabilityResult: null,
  guestBookings: [],
  hostBookings: [],
  hostBookingRequests: [],
  paymentRecords: [],
  isCheckingAvailability: false,
  isCalculatingPrice: false,
  isCreatingBooking: false,
  isLoadingGuestBookings: false,
  isLoadingHostBookings: false,
  isLoadingHostRequests: false,
  isProcessingPayment: false,
  isUpdatingBooking: false,
  error: null,

  // Initial state for paginated requests
  bookingRequestsByStatus: {
    pending: [],
    'accepted-and-waiting-for-payment': [],
    confirmed: [],
    cancelled: [],
    completed: [],
    refunded: [],
    rejected: [],
    'payment-failed': []
  },
  paginationData: {
    pending: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      pageSize: 10
    },
    'accepted-and-waiting-for-payment': {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      pageSize: 10
    },
    confirmed: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      pageSize: 10
    },
    cancelled: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      pageSize: 10
    },
    completed: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      pageSize: 10
    },
    refunded: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      pageSize: 10
    },
    rejected: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      pageSize: 10
    },
    'payment-failed': {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      pageSize: 10
    }
  },
}

export const useBookingStore = create<BookingState>((set, get) => ({
  ...initialState,

  // Booking flow setters
  setCurrentBookingForm: (form) => set({ currentBookingForm: form }),
  setPriceBreakdown: (breakdown) => set({ priceBreakdown: breakdown }),
  setAvailabilityResult: (result) => set({ availabilityResult: result }),

  // Data setters
  setGuestBookings: (bookings) => set({ guestBookings: bookings }),
  setHostBookings: (bookings) => set({ hostBookings: bookings }),
  setHostBookingRequests: (requests) => set({ hostBookingRequests: requests }),
  setPaymentRecords: (records) => set({ paymentRecords: records }),

  // Loading state setters
  setIsCheckingAvailability: (loading) => set({ isCheckingAvailability: loading }),
  setIsCalculatingPrice: (loading) => set({ isCalculatingPrice: loading }),
  setIsCreatingBooking: (loading) => set({ isCreatingBooking: loading }),
  setIsLoadingGuestBookings: (loading) => set({ isLoadingGuestBookings: loading }),
  setIsLoadingHostBookings: (loading) => set({ isLoadingHostBookings: loading }),
  setIsLoadingHostRequests: (loading) => set({ isLoadingHostRequests: loading }),
  setIsProcessingPayment: (loading) => set({ isProcessingPayment: loading }),
  setIsUpdatingBooking: (loading) => set({ isUpdatingBooking: loading }),
  setError: (error) => set({ error }),

  // Utility actions
  addGuestBooking: (booking) => {
    const currentBookings = get().guestBookings
    set({ guestBookings: [booking, ...currentBookings] })
  },

  addHostBooking: (booking) => {
    const currentBookings = get().hostBookings
    set({ hostBookings: [booking, ...currentBookings] })
  },

  updateBookingStatus: (bookingId, status) => {
    const guestBookings = get().guestBookings.map(booking =>
      booking.id === bookingId ? { ...booking, status } : booking
    )
    const hostBookings = get().hostBookings.map(booking =>
      booking.id === bookingId ? { ...booking, status } : booking
    )
    set({ guestBookings, hostBookings })
  },

  updateBookingRequestStatus: (requestId, status) => {
    const requests = get().hostBookingRequests.map(request =>
      request.id === requestId ? { ...request, status } : request
    )
    set({ hostBookingRequests: requests })
  },

  addPaymentRecord: (record) => {
    const currentRecords = get().paymentRecords
    set({ paymentRecords: [record, ...currentRecords] })
  },

  updatePaymentRecord: (recordId, updates) => {
    const records = get().paymentRecords.map(record =>
      record.id === recordId ? { ...record, ...updates } : record
    )
    set({ paymentRecords: records })
  },

  removeBookingRequest: (requestId) => {
    const requests = get().hostBookingRequests.filter(request => request.id !== requestId)
    set({ hostBookingRequests: requests })
  },

  clearError: () => set({ error: null }),
  reset: () => set(initialState),
  resetBookingFlow: () => set({
    currentBookingForm: null,
    priceBreakdown: null,
    availabilityResult: null,
    error: null
  }),

  // New actions for paginated requests
  setHostBookingRequestsByStatus: (status, requests) => set((state) => ({
    bookingRequestsByStatus: {
      ...state.bookingRequestsByStatus,
      [status]: requests
    }
  })),

  setPaginationData: (status, data) => set((state) => ({
    paginationData: {
      ...state.paginationData,
      [status]: data
    }
  }))
}))

// Selectors for better performance
export const selectCurrentBooking = (state: BookingState) => state.currentBookingForm
export const selectPriceBreakdown = (state: BookingState) => state.priceBreakdown
export const selectAvailability = (state: BookingState) => state.availabilityResult
export const selectGuestBookings = (state: BookingState) => state.guestBookings
export const selectHostBookings = (state: BookingState) => state.hostBookings
export const selectPendingRequests = (state: BookingState) => 
  state.hostBookingRequests.filter(request => request.status === 'pending')
export const selectIsBookingFlowLoading = (state: BookingState) => 
  state.isCheckingAvailability || state.isCalculatingPrice || state.isCreatingBooking 