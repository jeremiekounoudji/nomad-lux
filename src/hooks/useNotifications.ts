import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNotificationStore } from '../lib/stores/notificationStore';
import { useAuthStore } from '../lib/stores/authStore';
import { showBulkNotificationToast } from '../utils/notificationUtils';

export const useNotifications = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    notifications,
    unreadCount,
    filter,
    hasMore,
    setNotifications,
    markAsRead,
    markAllAsRead,
    setLoading,
    setError: setStoreError,
    setFilter,
    setHasMore,
  } = useNotificationStore();

  const { user, isAuthenticated } = useAuthStore();

  // Fetch notifications from Supabase
  const fetchNotifications = async (limit = 50, offset = 0) => {
    if (!isAuthenticated || !user) {
      console.log('🔔 useNotifications: User not authenticated');
      return { data: [], error: null };
    }

    try {
      console.log('🔔 useNotifications: Fetching notifications for user:', user.id);
      setIsLoading(true);
      setLoading(true);
      setError(null);
      setStoreError(null);

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filter
      if (filter === 'unread') {
        query = query.eq('is_read', false);
      } else if (filter === 'read') {
        query = query.eq('is_read', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ useNotifications: Fetch failed:', error);
        throw new Error(error.message);
      }

      console.log('✅ useNotifications: Fetched notifications:', data?.length || 0);

      // Check if we have more data (if we got less than the limit, we're at the end)
      const hasMoreData = (data?.length || 0) === limit;
      setHasMore(hasMoreData);

      if (offset === 0) {
        // First load - replace all notifications
        setNotifications(data || []);
      } else {
        // Load more - append to existing notifications
        const existingNotifications = notifications;
        const newNotifications = [...existingNotifications, ...(data || [])];
        setNotifications(newNotifications);
      }

      return { data: data || [], error: null };
    } catch (err: any) {
      console.error('❌ useNotifications: Exception in fetchNotifications:', err);
      const errorMessage = err.message || 'Failed to fetch notifications';
      setError(errorMessage);
      setStoreError(errorMessage);
      return { data: [], error: errorMessage };
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    if (!isAuthenticated || !user) {
      return { error: 'User not authenticated' };
    }

    try {
      console.log('🔔 useNotifications: Marking as read:', notificationId);
      setError(null);

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ useNotifications: Mark as read failed:', error);
        throw new Error(error.message);
      }

      // Update store
      markAsRead(notificationId);
      console.log('✅ useNotifications: Marked as read successfully');

      return { error: null };
    } catch (err: any) {
      console.error('❌ useNotifications: Exception in markNotificationAsRead:', err);
      const errorMessage = err.message || 'Failed to mark notification as read';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    if (!isAuthenticated || !user) {
      return { error: 'User not authenticated' };
    }

    try {
      console.log('🔔 useNotifications: Marking all as read');
      setError(null);

      const unreadNotifications = notifications.filter((n) => !n.is_read);
      const unreadCount = unreadNotifications.length;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('❌ useNotifications: Mark all as read failed:', error);
        throw new Error(error.message);
      }

      // Update store
      markAllAsRead();
      console.log('✅ useNotifications: Marked all as read successfully');

      // Show success toast
      showBulkNotificationToast('mark_all_read', unreadCount, true);

      return { error: null };
    } catch (err: any) {
      console.error('❌ useNotifications: Exception in markAllNotificationsAsRead:', err);
      const errorMessage = err.message || 'Failed to mark all notifications as read';
      setError(errorMessage);
      showBulkNotificationToast('mark_all_read', 0, false);
      return { error: errorMessage };
    }
  };

  // Get filtered notifications
  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter((n) => !n.is_read);
      case 'read':
        return notifications.filter((n) => n.is_read);
      default:
        return notifications;
    }
  };

  // Auto-fetch notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
    }
  }, [isAuthenticated, user?.id, filter]);

  const clearError = () => setError(null);

  return {
    // State
    notifications: getFilteredNotifications(),
    unreadCount,
    isLoading,
    error,
    filter,
    hasMore,

    // Actions
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setFilter,
    clearError,
  };
};