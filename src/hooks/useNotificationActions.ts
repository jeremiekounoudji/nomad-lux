import { useState } from 'react'
import { Notification } from '../interfaces'
import { useNotifications } from './useNotifications'
import { useNavigation } from './useNavigation'
import { useBookingManagement } from './useBookingManagement'
import { useTranslation } from '../lib/stores/translationStore'
import { getNavigationRoute } from '../utils/notificationUtils'

export const useNotificationActions = () => {
  const { t } = useTranslation(['notifications'])
  const { 
    notifications,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setFilter
  } = useNotifications()
  
  const { navigateWithAuth } = useNavigation()
  const { approveBooking, declineBooking } = useBookingManagement()
  
  const [loadingMore, setLoadingMore] = useState(false)
  const [processingBooking, setProcessingBooking] = useState<string | null>(null)
  const [navigatingNotification, setNavigatingNotification] = useState<string | null>(null)

  const handleNotificationClick = async (notification: Notification) => {
    setNavigatingNotification(notification.id)
    
    // Mark as read if not already read
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id)
    }
    
    // Get the appropriate navigation route
    const route = getNavigationRoute(notification)
    
    if (route) {
      console.log(`🔗 Navigating to ${route} for notification:`, notification.type)
      navigateWithAuth(route)
    } else {
      console.log('ℹ️ No navigation route defined for notification:', notification.type)
    }
    
    // Reset navigation state after a short delay
    setTimeout(() => setNavigatingNotification(null), 500)
  }

  const handleLoadMore = async () => {
    setLoadingMore(true)
    await fetchNotifications(50, notifications.length)
    setLoadingMore(false)
  }

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead()
  }

  const handleAcceptBooking = async (bookingId: string, notificationId: string) => {
    try {
      setProcessingBooking(bookingId)
      await approveBooking(bookingId, t('notifications.messages.bookingApprovedViaNotification'))
      await markNotificationAsRead(notificationId)
      console.log('✅ Booking approved successfully')
    } catch (error) {
      console.error('❌ Failed to approve booking:', error)
    } finally {
      setProcessingBooking(null)
    }
  }

  const handleDeclineBooking = async (bookingId: string, notificationId: string) => {
    try {
      setProcessingBooking(bookingId)
      await declineBooking(bookingId, t('notifications.messages.bookingDeclinedViaNotification'))
      await markNotificationAsRead(notificationId)
      console.log('✅ Booking declined successfully')
    } catch (error) {
      console.error('❌ Failed to decline booking:', error)
    } finally {
      setProcessingBooking(null)
    }
  }

  const handleFilterChange = (newFilter: 'all' | 'unread' | 'read') => {
    setFilter(newFilter)
  }

  const handleRetry = () => {
    fetchNotifications()
  }

  return {
    // State
    loadingMore,
    processingBooking,
    navigatingNotification,
    
    // Actions
    handleNotificationClick,
    handleLoadMore,
    handleMarkAllAsRead,
    handleAcceptBooking,
    handleDeclineBooking,
    handleFilterChange,
    handleRetry
  }
}