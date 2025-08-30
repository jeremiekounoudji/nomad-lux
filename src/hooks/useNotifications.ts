import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Notification } from "../interfaces/Notification";
import { useNotificationStore } from "../lib/stores/notificationStore";
import { useAuthStore } from "../lib/stores/authStore";
import {
  showRealtimeNotificationToast,
  showNotificationActionToast,
  showBulkNotificationToast,
} from "../utils/notificationUtils";
import { useNavigation } from "./useNavigation";
import { useBookingManagement } from "./useBookingManagement";

export const useNotifications = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    notifications,
    unreadCount,
    filter,
    hasMore,
    setNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    setLoading,
    setError: setStoreError,
    setFilter,
    setHasMore,
  } = useNotificationStore();

  const { user, isAuthenticated } = useAuthStore();
  const { navigateWithAuth } = useNavigation();
  const { approveBooking, declineBooking } = useBookingManagement();

  // Fetch notifications from Supabase
  const fetchNotifications = async (limit = 50, offset = 0) => {
    if (!isAuthenticated || !user) {
      console.log("🔔 useNotifications: User not authenticated");
      return { data: [], error: null };
    }

    try {
      console.log(
        "🔔 useNotifications: Fetching notifications for user:",
        user.id
      );
      setIsLoading(true);
      setLoading(true);
      setError(null);
      setStoreError(null);

      let query = supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filter
      if (filter === "unread") {
        query = query.eq("is_read", false);
      } else if (filter === "read") {
        query = query.eq("is_read", true);
      }

      const { data, error } = await query;

      if (error) {
        console.error("❌ useNotifications: Fetch failed:", error);
        throw new Error(error.message);
      }

      console.log(
        "✅ useNotifications: Fetched notifications:",
        data?.length || 0
      );

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
      console.error(
        "❌ useNotifications: Exception in fetchNotifications:",
        err
      );
      const errorMessage = err.message || "Failed to fetch notifications";
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
      return { error: "User not authenticated" };
    }

    try {
      console.log("🔔 useNotifications: Marking as read:", notificationId);
      setError(null);

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("user_id", user.id);

      if (error) {
        console.error("❌ useNotifications: Mark as read failed:", error);
        throw new Error(error.message);
      }

      // Update store
      markAsRead(notificationId);
      console.log("✅ useNotifications: Marked as read successfully");

      return { error: null };
    } catch (err: any) {
      console.error(
        "❌ useNotifications: Exception in markNotificationAsRead:",
        err
      );
      const errorMessage = err.message || "Failed to mark notification as read";
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    if (!isAuthenticated || !user) {
      return { error: "User not authenticated" };
    }

    try {
      console.log("🔔 useNotifications: Marking all as read");
      setError(null);

      const unreadNotifications = notifications.filter((n) => !n.is_read);
      const unreadCount = unreadNotifications.length;

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) {
        console.error("❌ useNotifications: Mark all as read failed:", error);
        throw new Error(error.message);
      }

      // Update store
      markAllAsRead();
      console.log("✅ useNotifications: Marked all as read successfully");

      // Show success toast
      showBulkNotificationToast("mark_all_read", unreadCount, true);

      return { error: null };
    } catch (err: any) {
      console.error(
        "❌ useNotifications: Exception in markAllNotificationsAsRead:",
        err
      );
      const errorMessage =
        err.message || "Failed to mark all notifications as read";
      setError(errorMessage);
      showBulkNotificationToast("mark_all_read", 0, false);
      return { error: errorMessage };
    }
  };

  // Get filtered notifications
  const getFilteredNotifications = () => {
    switch (filter) {
      case "unread":
        return notifications.filter((n) => !n.is_read);
      case "read":
        return notifications.filter((n) => n.is_read);
      default:
        return notifications;
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    console.log(
      "🔔 useNotifications: Setting up real-time subscription for user:",
      user.id
    );

    // Create a unique channel name to avoid conflicts
    const channelName = `notifications-${user.id}-${Date.now()}`;

    const subscription = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log(
            "🔔 useNotifications: New notification received:",
            payload.new
          );
          const newNotification = payload.new as Notification;
          addNotification(newNotification);

          // Show toast notification for real-time alerts
          showRealtimeNotificationToast(newNotification, (action) =>
            handleToastAction(newNotification, action)
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log(
            "🔔 useNotifications: Notification updated:",
            payload.new
          );
          // Refresh notifications to get updated data
          fetchNotifications();
        }
      )
      .subscribe((status) => {
        console.log("🔔 useNotifications: Subscription status:", status);
      });

    return () => {
      console.log(
        "🔔 useNotifications: Cleaning up real-time subscription:",
        channelName
      );
      supabase.removeChannel(subscription);
    };
  }, [isAuthenticated, user?.id]);

  // Auto-fetch notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
    }
  }, [isAuthenticated, user?.id, filter]);

  // Helper function to handle toast actions
  const handleToastAction = async (
    notification: Notification,
    action: "accept" | "decline" | "view"
  ) => {
    switch (action) {
      case "accept":
        if (
          notification.related_id &&
          notification.related_type === "booking"
        ) {
          try {
            await approveBooking(
              notification.related_id,
              "Booking approved via notification"
            );
            await markNotificationAsRead(notification.id);
            showNotificationActionToast("accept", true);
          } catch (error) {
            console.error("Failed to approve booking:", error);
            showNotificationActionToast("accept", false);
          }
        }
        break;

      case "decline":
        if (
          notification.related_id &&
          notification.related_type === "booking"
        ) {
          try {
            await declineBooking(
              notification.related_id,
              "Booking declined via notification"
            );
            await markNotificationAsRead(notification.id);
            showNotificationActionToast("decline", true);
          } catch (error) {
            console.error("Failed to decline booking:", error);
            showNotificationActionToast("decline", false);
          }
        }
        break;

      case "view":
        // Navigate to appropriate page based on notification
        const route = getNavigationRoute(notification);
        if (route) {
          navigateWithAuth(route);
          await markNotificationAsRead(notification.id);
        }
        break;
    }
  };

  // Helper function to determine navigation route (same as in NotificationsPage)
  const getNavigationRoute = (notification: Notification): string | null => {
    if (!notification.related_type || !notification.related_id) {
      switch (notification.type) {
        case "account_suspended":
        case "profile_updated":
          return null;
        case "system_error":
          return notification.role === "admin" ? "/admin" : "/help";
        default:
          return null;
      }
    }

    switch (notification.related_type) {
      case "booking":
        if (
          notification.type === "booking_request_created" ||
          notification.type === "new_booking_request"
        ) {
          return "/booking-requests";
        }
        return "/bookings";
      case "property":
        return `/properties/${notification.related_id}`;
      case "payout":
      case "payment":
        return "/wallet";
      case "user":
        return notification.role === "admin" ? "/admin" : null;
      case "dispute":
        return notification.role === "admin" ? "/admin" : "/help";
      case "system":
        return notification.role === "admin" ? "/admin" : "/help";
      default:
        return null;
    }
  };

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
