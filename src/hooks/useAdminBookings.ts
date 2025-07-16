import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { AdminBooking, DatabaseBooking } from '../interfaces/Booking'
import { useAdminBookingStore } from '../lib/stores/adminBookingStore';
import { PaymentRecord } from '../interfaces/PaymentRecord';

interface PaginationData {
  currentPage: number
  totalPages: number
  totalItems: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  pageSize: number
}

interface BookingFilters {
  status?: string
  search?: string
  dateFrom?: string
  dateTo?: string
}

export const useAdminBookings = () => {
  // Zustand store selectors
  const bookings = useAdminBookingStore((s) => s.bookings);
  const bookingsLoading = useAdminBookingStore((s) => s.bookingsLoading);
  const bookingsError = useAdminBookingStore((s) => s.bookingsError);
  const bookingsPage = useAdminBookingStore((s) => s.bookingsPage);
  const bookingsTotal = useAdminBookingStore((s) => s.bookingsTotal);
  const setBookingsPage = useAdminBookingStore((s) => s.setBookingsPage);
  const setBookings = useAdminBookingStore((s) => s.setBookings);

  // Pagination data (derived)
  const pageSize = 10;
  const totalPages = Math.ceil(bookingsTotal / pageSize) || 1;
  const pagination = {
    currentPage: bookingsPage,
    totalPages,
    totalItems: bookingsTotal,
    hasNextPage: bookingsPage < totalPages,
    hasPreviousPage: bookingsPage > 1,
    pageSize
  };

  // Clear error
  const clearError = useCallback(() => {
    useAdminBookingStore.getState().setBookingsError(null);
  }, []);

  // Transform database booking to admin booking format
  const transformToAdminBooking = (dbBooking: any): AdminBooking => {
    const property = dbBooking.properties
    const guest = dbBooking.guest_user
    const host = dbBooking.host_user

    // Calculate nights
    const checkInDate = new Date(dbBooking.check_in_date)
    const checkOutDate = new Date(dbBooking.check_out_date)
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

    // Map database status to admin format
    const mapStatus = (status: string): AdminBooking['status'] => {
      switch (status) {
        case 'confirmed':
        case 'accepted-and-waiting-for-payment':
          return 'confirmed'
        case 'pending':
          return 'pending'
        case 'cancelled':
        case 'rejected':
          return 'cancelled'
        case 'completed':
          return 'completed'
        default:
          return 'pending'
      }
    }

    // Determine payment status (simplified for now)
    const mapPaymentStatus = (bookingStatus: string): AdminBooking['paymentStatus'] => {
      switch (bookingStatus) {
        case 'completed':
        case 'confirmed':
          return 'paid'
        case 'cancelled':
        case 'rejected':
          return 'refunded'
        case 'accepted-and-waiting-for-payment':
        case 'pending':
          return 'pending'
        default:
          return 'pending'
      }
    }

    // Calculate last activity (simplified)
    const lastActivity = () => {
      const updatedAt = new Date(dbBooking.updated_at || dbBooking.created_at)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - updatedAt.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) return '1 day ago'
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
      return `${Math.ceil(diffDays / 30)} months ago`
    }

    return {
      id: dbBooking.id,
      propertyId: dbBooking.property_id,
      propertyTitle: property?.title || 'Unknown Property',
      propertyImage: property?.images?.[0] || '/default-property.jpg',
      guestName: guest?.display_name || 'Unknown Guest',
      guestEmail: guest?.email || '',
      guestPhone: guest?.phone || '',
      hostName: host?.display_name || 'Unknown Host',
      hostEmail: host?.email || '',
      hostPhone: host?.phone || '',
      checkIn: dbBooking.check_in_date,
      checkOut: dbBooking.check_out_date,
      totalAmount: parseFloat(dbBooking.total_amount),
      status: mapStatus(dbBooking.status),
      paymentStatus: mapPaymentStatus(dbBooking.status),
      bookingDate: dbBooking.created_at.split('T')[0],
      guests: dbBooking.guest_count,
      nights: Math.max(1, nights),
      lastActivity: lastActivity()
    }
  }

  // Load admin bookings with pagination and filters
  const loadAdminBookings = useCallback(async (
    page: number = 1,
    filters: BookingFilters = {}
  ) => {
    useAdminBookingStore.getState().setBookingsLoading(true);
    clearError()

    try {
      console.log('🔄 Loading admin bookings...', { page, filters })

      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;
      let query;
      let isSearchView = false;

      if (filters.search) {
        const isUuid = /^[0-9a-fA-F-]{36}$/.test(filters.search);
        if (isUuid) {
          // Use bookings table for UUID search
          query = supabase
            .from('bookings')
            .select(`
              *,
              properties:properties(
                id,
                title,
                images,
                location
              ),
              guest_user:users!bookings_guest_id_fkey(
                id,
                display_name,
                email,
                phone,
                avatar_url
              ),
              host_user:users!bookings_host_id_fkey(
                id,
                display_name,
                email,
                phone,
                avatar_url
              )
            `, { count: 'exact' })
            .eq('id', filters.search);
        } else {
          // Use the search view for text search
          isSearchView = true;
          query = supabase
            .from('admin_booking_search_view')
            .select('*', { count: 'exact' })
            .or(`guest_name.ilike.%${filters.search}%,host_name.ilike.%${filters.search}%,property_title.ilike.%${filters.search}%`);
        }
      } else {
        // Default: use bookings table
        query = supabase
          .from('bookings')
          .select(`
            *,
            properties:properties(
              id,
              title,
              images,
              location
            ),
            guest_user:users!bookings_guest_id_fkey(
              id,
              display_name,
              email,
              phone,
              avatar_url
            ),
            host_user:users!bookings_host_id_fkey(
              id,
              display_name,
              email,
              phone,
              avatar_url
            )
          `, { count: 'exact' });
      }

      // Apply filters (status, date, etc.) only for bookings table
      if (!isSearchView) {
        if (filters.status && filters.status !== 'all') {
          if (filters.status === 'dispute') {
            query = query.eq('status', 'cancelled');
          } else {
            query = query.eq('status', filters.status);
          }
        }
        if (filters.dateFrom) {
          query = query.gte('created_at', filters.dateFrom);
        }
        if (filters.dateTo) {
          query = query.lte('created_at', filters.dateTo);
        }
      }

      // Apply pagination and ordering
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) {
        throw new Error(`Failed to load bookings: ${error.message}`);
      }

      // Transform data to AdminBooking[]
      const transformedBookings = (data || []).map(transformToAdminBooking);
      setBookings(transformedBookings, count || 0);
      setBookingsPage(page);
      return transformedBookings;

    } catch (error) {
      console.error('❌ Error loading admin bookings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load bookings';
      useAdminBookingStore.getState().setBookingsError(errorMessage);
      throw error;
    } finally {
      useAdminBookingStore.getState().setBookingsLoading(false);
    }
  }, [clearError, setBookings, setBookingsPage]);

  // Get booking statistics
  const getBookingStats = useCallback(async () => {
    try {
      console.log('🔄 Loading booking statistics...')

      const { data, error } = await supabase
        .from('bookings')
        .select('status, total_amount')

      if (error) {
        throw new Error(`Failed to load booking stats: ${error.message}`)
      }

      const stats = {
        total: data?.length || 0,
        confirmed: data?.filter(b => b.status === 'confirmed' || b.status === 'accepted-and-waiting-for-payment').length || 0,
        disputes: 0, // Placeholder - you might want to add a disputes table later
        revenue: data?.filter(b => b.status === 'completed').reduce((sum, b) => sum + parseFloat(b.total_amount), 0) || 0
      }

      console.log('✅ Booking stats loaded:', stats)
      return stats

    } catch (error) {
      console.error('❌ Error loading booking stats:', error)
      return {
        total: 0,
        confirmed: 0,
        disputes: 0,
        revenue: 0
      }
    }
  }, [])

  // Process refund (placeholder implementation)
  const processRefund = useCallback(async (
    bookingId: string,
    amount: number,
    reason?: string
  ) => {
    try {
      console.log('🔄 Processing refund...', { bookingId, amount, reason })

      // In a real implementation, you would:
      // 1. Update the payment_records table
      // 2. Call the payment provider API
      // 3. Update booking status if fully refunded
      
      // For now, just update the booking status
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancellation_reason: reason || 'Refund processed by admin',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .select()

      if (error) {
        throw new Error(`Failed to process refund: ${error.message}`)
      }

      console.log('✅ Refund processed:', data)
      return data

    } catch (error) {
      console.error('❌ Error processing refund:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to process refund'
      useAdminBookingStore.getState().setBookingsError(errorMessage);
      throw error
    }
  }, [])

  // Update booking status
  const updateBookingStatus = useCallback(async (
    bookingId: string,
    newStatus: string,
    notes?: string
  ) => {
    try {
      console.log('🔄 Updating booking status...', { bookingId, newStatus, notes })

      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: newStatus,
          ...(notes && { host_notes: notes }),
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .select()

      if (error) {
        throw new Error(`Failed to update booking status: ${error.message}`)
      }

      console.log('✅ Booking status updated:', data)
      return data

    } catch (error) {
      console.error('❌ Error updating booking status:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update booking status'
      useAdminBookingStore.getState().setBookingsError(errorMessage);
      throw error
    }
  }, [])

  return {
    bookings,
    isLoading: bookingsLoading,
    error: bookingsError,
    pagination,
    loadAdminBookings,
    getBookingStats,
    processRefund,
    updateBookingStatus,
    clearError
  }
} 

export const useAdminPaymentRecords = () => {
  const paymentRecords = useAdminBookingStore((s) => s.paymentRecords);
  const paymentRecordsLoading = useAdminBookingStore((s) => s.paymentRecordsLoading);
  const paymentRecordsError = useAdminBookingStore((s) => s.paymentRecordsError);
  const paymentRecordsPage = useAdminBookingStore((s) => s.paymentRecordsPage);
  const paymentRecordsTotal = useAdminBookingStore((s) => s.paymentRecordsTotal);
  const setPaymentRecords = useAdminBookingStore((s) => s.setPaymentRecords);
  const setPaymentRecordsLoading = useAdminBookingStore((s) => s.setPaymentRecordsLoading);
  const setPaymentRecordsError = useAdminBookingStore((s) => s.setPaymentRecordsError);
  const setPaymentRecordsPage = useAdminBookingStore((s) => s.setPaymentRecordsPage);

  const pageSize = 10;
  const totalPages = Math.ceil(paymentRecordsTotal / pageSize) || 1;
  const pagination = {
    currentPage: paymentRecordsPage,
    totalPages,
    totalItems: paymentRecordsTotal,
    hasNextPage: paymentRecordsPage < totalPages,
    hasPreviousPage: paymentRecordsPage > 1,
    pageSize
  };

  const clearError = useCallback(() => {
    setPaymentRecordsError(null);
  }, [setPaymentRecordsError]);

  const loadAdminPaymentRecords = useCallback(async (page: number = 1) => {
    setPaymentRecordsLoading(true);
    clearError();
    try {
      console.log('🔄 Loading admin payment records...', { page });
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;
      const { data, error, count } = await supabase
        .from('payment_records')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(start, end);
      if (error) {
        throw new Error(`Failed to load payment records: ${error.message}`);
      }
      setPaymentRecords(data || [], count || 0);
      setPaymentRecordsPage(page);
      console.log('✅ Admin payment records loaded:', { count, dataLength: data?.length });
      return data;
    } catch (error) {
      console.error('❌ Error loading admin payment records:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load payment records';
      setPaymentRecordsError(errorMessage);
      throw error;
    } finally {
      setPaymentRecordsLoading(false);
    }
  }, [setPaymentRecords, setPaymentRecordsLoading, setPaymentRecordsError, setPaymentRecordsPage]);

  return {
    paymentRecords,
    isLoading: paymentRecordsLoading,
    error: paymentRecordsError,
    pagination,
    loadAdminPaymentRecords,
    clearError
  };
}; 