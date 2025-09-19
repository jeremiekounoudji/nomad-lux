import React, { createContext, useContext, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Notification } from '../interfaces/Notification';
import { useNotificationStore } from '../lib/stores/notificationStore';
import { useAuthStore } from '../lib/stores/authStore';
import {
  showRealtimeNotificationToast,
  showNotificationActionToast,
} from '../utils/notificationUtils';
import { useNavigation } from '../hooks/useNavigation';
import { useBookingManagement } from '../hooks/useBookingManagement';

interface NotificationContextType {
  // This context doesn't expose any methods directly
  // All state is managed through the notification store
}

const NotificationContext = createContext<NotificationContextType>({});

export const useNotificationContext = () => {
  return useContext(NotificationContext);
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

// Global subscription manager to prevent multiple subscriptions across all instances
class SubscriptionManager {
  private static instance: SubscriptionManager;
  private subscription: any = null;
  private isSubscribing = false;
  private currentUserId: string | null = null;
  private subscribers = new Set<string>();

  static getInstance(): SubscriptionManager {
    if (!SubscriptionManager.instance) {
      SubscriptionManager.instance = new SubscriptionManager();
    }
    return SubscriptionManager.instance;
  }

  subscribe(userId: string, onNotification: (notification: Notification) => void): () => void {
    const subscriberId = Math.random().toString(36);
    this.subscribers.add(subscriberId);

    console.log(`🔔 SubscriptionManager: Adding subscriber ${subscriberId} for user ${userId}`);

    // If we already have a subscription for this user, just add the callback
    if (this.subscription && this.currentUserId === userId) {
      console.log('🔔 SubscriptionManager: Reusing existing subscription');
      return () => {
        this.subscribers.delete(subscriberId);
        console.log(`🔔 SubscriptionManager: Removed subscriber ${subscriberId}`);
        
        // If no more subscribers, clean up
        if (this.subscribers.size === 0) {
          this.cleanup();
        }
      };
    }

    // Clean up any existing subscription for different user
    if (this.subscription && this.currentUserId !== userId) {
      console.log('🔔 SubscriptionManager: Cleaning up subscription for different user');
      this.cleanup();
    }

    // Create new subscription
    this.createSubscription(userId, onNotification);

    return () => {
      this.subscribers.delete(subscriberId);
      console.log(`🔔 SubscriptionManager: Removed subscriber ${subscriberId}`);
      
      // If no more subscribers, clean up
      if (this.subscribers.size === 0) {
        this.cleanup();
      }
    };
  }

  private createSubscription(userId: string, onNotification: (notification: Notification) => void) {
    if (this.isSubscribing) {
      console.log('🔔 SubscriptionManager: Already subscribing, skipping');
      return;
    }

    console.log(`🔔 SubscriptionManager: Creating subscription for user ${userId}`);
    this.isSubscribing = true;
    this.currentUserId = userId;

    const channelName = `notifications-${userId}`;

    // Clean up any existing channels
    const existingChannels = supabase.getChannels().filter((channel) => channel.topic === channelName);
    if (existingChannels.length > 0) {
      console.log(`🔔 SubscriptionManager: Removing ${existingChannels.length} existing channels`);
      existingChannels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    }

    this.subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🔔 SubscriptionManager: New notification received:', payload.new);
          const newNotification = payload.new as Notification;
          onNotification(newNotification);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🔔 SubscriptionManager: Notification updated:', payload.new);
        }
      )
      .subscribe((status) => {
        console.log('🔔 SubscriptionManager: Subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('🔔 SubscriptionManager: Successfully subscribed');
          this.isSubscribing = false;
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.error('🔔 SubscriptionManager: Subscription error:', status);
          this.isSubscribing = false;
          this.subscription = null;
          this.currentUserId = null;
        }
      });
  }

  private cleanup() {
    console.log('🔔 SubscriptionManager: Cleaning up subscription');
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.currentUserId = null;
    this.isSubscribing = false;
  }
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const cleanupRef = useRef<(() => void) | null>(null);

  const { addNotification } = useNotificationStore();
  const { user, isAuthenticated } = useAuthStore();
  const { navigateWithAuth } = useNavigation();
  const { approveBooking, declineBooking } = useBookingManagement();

  // Helper function to handle toast actions
  const handleToastAction = async (
    notification: Notification,
    action: 'accept' | 'decline' | 'view'
  ) => {
    switch (action) {
      case 'accept':
        if (notification.related_id && notification.related_type === 'booking') {
          try {
            await approveBooking(notification.related_id, 'Booking approved via notification');
            showNotificationActionToast('accept', true);
          } catch (error) {
            console.error('Failed to approve booking:', error);
            showNotificationActionToast('accept', false);
          }
        }
        break;

      case 'decline':
        if (notification.related_id && notification.related_type === 'booking') {
          try {
            await declineBooking(notification.related_id, 'Booking declined via notification');
            showNotificationActionToast('decline', true);
          } catch (error) {
            console.error('Failed to decline booking:', error);
            showNotificationActionToast('decline', false);
          }
        }
        break;

      case 'view':
        // Navigate to appropriate page based on notification
        const route = getNavigationRoute(notification);
        if (route) {
          navigateWithAuth(route);
        }
        break;
    }
  };

  // Helper function to determine navigation route
  const getNavigationRoute = (notification: Notification): string | null => {
    if (!notification.related_type || !notification.related_id) {
      switch (notification.type) {
        case 'account_suspended':
        case 'profile_updated':
          return null;
        case 'system_error':
          return notification.role === 'admin' ? '/admin' : '/help';
        default:
          return null;
      }
    }

    switch (notification.related_type) {
      case 'booking':
        if (
          notification.type === 'booking_request_created' ||
          notification.type === 'new_booking_request'
        ) {
          return '/booking-requests';
        }
        return '/bookings';
      case 'property':
        return `/property/${notification.related_id}`;
      case 'payout':
      case 'payment':
        return '/wallet';
      case 'user':
        return notification.role === 'admin' ? '/admin' : null;
      case 'dispute':
        return notification.role === 'admin' ? '/admin' : '/help';
      case 'system':
        return notification.role === 'admin' ? '/admin' : '/help';
      default:
        return null;
    }
  };

  // Set up real-time subscription using global subscription manager
  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Clean up subscription when user logs out
      if (cleanupRef.current) {
        console.log('🔔 NotificationProvider: User logged out, cleaning up subscription');
        cleanupRef.current();
        cleanupRef.current = null;
      }
      return;
    }

    console.log('🔔 NotificationProvider: Setting up subscription for user:', user.id);
    
    const subscriptionManager = SubscriptionManager.getInstance();
    
    const cleanup = subscriptionManager.subscribe(user.id, (newNotification) => {
      addNotification(newNotification);
      
      // Show toast notification for real-time alerts
      showRealtimeNotificationToast(newNotification, (action) =>
        handleToastAction(newNotification, action)
      );
    });

    cleanupRef.current = cleanup;

    return () => {
      console.log('🔔 NotificationProvider: Component cleanup');
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [isAuthenticated, user?.id, addNotification]);

  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  );
};