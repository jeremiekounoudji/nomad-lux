
import { Bell, Heart, Calendar, MessageCircle, Star, Home } from 'lucide-react'
import toast from 'react-hot-toast'
import { ROUTES } from '../router/types'
import { Notification } from '../interfaces'
import { showNotificationToast } from '../components/shared/NotificationToast'

export const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'booking_request_created':
    case 'new_booking_request':
    case 'booking_approved':
    case 'booking_rejected':
    case 'booking_cancelled':
    case 'booking_checked_in':
    case 'booking_checked_out':
      return <Calendar className="size-4" />
    case 'property_liked':
      return <Heart className="size-4" />
    case 'property_approved':
    case 'property_rejected':
    case 'property_suspended':
    case 'property_submitted':
      return <Home className="size-4" />
    case 'payment_success':
    case 'payment_failed':
    case 'booking_refunded':
    case 'payout_approved':
    case 'payout_rejected':
    case 'payout_paid':
    case 'payout_requested':
      return <Star className="size-4" />
    case 'account_suspended':
    case 'profile_updated':
    case 'account_flagged':
    case 'bulk_action':
      return <MessageCircle className="size-4" />
    case 'dispute_raised':
    case 'system_error':
      return <Bell className="size-4" />
    default:
      return <Bell className="size-4" />
  }
}

export const getTypeColor = (type: string) => {
  switch (type) {
    case 'booking_request_created':
    case 'new_booking_request':
    case 'booking_approved':
    case 'booking_rejected':
    case 'booking_cancelled':
    case 'booking_checked_in':
    case 'booking_checked_out':
      return 'bg-primary-500'
    case 'property_liked':
      return 'bg-red-500'
    case 'property_approved':
    case 'property_rejected':
    case 'property_suspended':
    case 'property_submitted':
      return 'bg-green-500'
    case 'payment_success':
    case 'payment_failed':
    case 'booking_refunded':
    case 'payout_approved':
    case 'payout_rejected':
    case 'payout_paid':
    case 'payout_requested':
      return 'bg-yellow-500'
    case 'account_suspended':
    case 'profile_updated':
    case 'account_flagged':
    case 'bulk_action':
      return 'bg-secondary-500'
    case 'dispute_raised':
    case 'system_error':
      return 'bg-red-600'
    default:
      return 'bg-gray-500'
  }
}

export const getTypeDisplayName = (type: string, t: (key: string) => string) => {
  switch (type) {
    case 'booking_request_created':
    case 'new_booking_request':
      return t('notifications.types.newBookingRequest')
    case 'booking_approved':
      return t('notifications.types.bookingApproved')
    case 'booking_rejected':
      return t('notifications.types.bookingRejected')
    case 'booking_cancelled':
      return t('notifications.types.bookingCancelled')
    case 'booking_checked_in':
      return t('notifications.types.bookingCheckedIn')
    case 'booking_checked_out':
      return t('notifications.types.bookingCheckedOut')
    case 'property_liked':
      return t('notifications.types.propertyLiked')
    case 'property_approved':
      return t('notifications.types.propertyApproved')
    case 'property_rejected':
      return t('notifications.types.propertyRejected')
    case 'property_suspended':
      return t('notifications.types.propertySuspended')
    case 'property_submitted':
      return t('notifications.types.propertySubmitted')
    case 'payment_success':
      return t('notifications.types.paymentSuccess')
    case 'payment_failed':
      return t('notifications.types.paymentFailed')
    case 'booking_refunded':
      return t('notifications.types.bookingRefunded')
    case 'payout_approved':
      return t('notifications.types.payoutApproved')
    case 'payout_rejected':
      return t('notifications.types.payoutRejected')
    case 'payout_paid':
      return t('notifications.types.payoutPaid')
    case 'payout_requested':
      return t('notifications.types.payoutRequested')
    case 'account_suspended':
      return t('notifications.types.accountSuspended')
    case 'profile_updated':
      return t('notifications.types.profileUpdated')
    case 'account_flagged':
      return t('notifications.types.accountFlagged')
    case 'bulk_action':
      return t('notifications.types.bulkAction')
    case 'dispute_raised':
      return t('notifications.types.disputeRaised')
    case 'system_error':
      return t('notifications.types.systemError')
    default:
      return t('notifications.labels.notifications')
  }
}

export const getNavigationRoute = (notification: Notification): string | null => {
  if (!notification.related_type || !notification.related_id) {
    // Handle notifications without related entities
    switch (notification.type) {
      case 'account_suspended':
      case 'profile_updated':
        return null // Could return profile route when available
      case 'system_error':
        return notification.role === 'admin' ? ROUTES.ADMIN : ROUTES.HELP
      default:
        return null
    }
  }

  // Handle notifications with related entities
  switch (notification.related_type) {
    case 'booking':
      // Different routes based on notification type and user role
      if (notification.type === 'booking_request_created' || notification.type === 'new_booking_request') {
        return ROUTES.BOOKING_REQUESTS // Host receiving booking request
      }
      return ROUTES.MY_BOOKINGS // Guest booking updates
    
    case 'property':
      return ROUTES.PROPERTY_DETAIL.replace(':id', notification.related_id)
    
    case 'payout':
    case 'payment':
      return ROUTES.WALLET
    
    case 'user':
      return notification.role === 'admin' ? ROUTES.ADMIN : null
    
    case 'dispute':
      return notification.role === 'admin' ? ROUTES.ADMIN : ROUTES.HELP
    
    case 'system':
      return notification.role === 'admin' ? ROUTES.ADMIN : ROUTES.HELP
    
    default:
      return null
  }
}

export const formatNotificationTime = (dateString: string, t: (key: string, params?: any) => string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return t('notifications.time.justNow')
  if (diffInMinutes < 60) return t('notifications.time.minutesAgo', { minutes: diffInMinutes })
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return t('notifications.time.hoursAgo', { hours: diffInHours })
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return t('notifications.time.daysAgo', { days: diffInDays })
  
  return date.toLocaleDateString()
}


export const shouldShowNotificationActions = (notification: Notification): boolean => {
  return (
    (notification.type === 'booking_request_created' || 
     notification.type === 'new_booking_request') && 
    notification.related_type === 'booking' &&
    notification.role === 'host'
  )
}

// Helper function to get toast duration based on notification type
export const getNotificationToastDuration = (notification: Notification): number => {
  // Longer duration for actionable notifications
  if (shouldShowNotificationActions(notification)) {
    return 10000 // 10 seconds
  }
  
  // Different durations based on importance
  switch (notification.type) {
    case 'payment_failed':
    case 'booking_cancelled':
    case 'account_suspended':
    case 'dispute_raised':
    case 'system_error':
      return 8000 // 8 seconds for important notifications
    
    case 'payment_success':
    case 'booking_approved':
    case 'payout_paid':
      return 6000 // 6 seconds for positive notifications
    
    default:
      return 5000 // 5 seconds for general notifications
  }
}

// Helper function to determine if notification should auto-dismiss
export const shouldAutoMarkAsRead = (notification: Notification): boolean => {
  // Don't auto-mark booking requests as read since they need action
  if (shouldShowNotificationActions(notification)) {
    return false
  }
  
  // Auto-mark informational notifications as read
  switch (notification.type) {
    case 'property_liked':
    case 'profile_updated':
    case 'booking_checked_in':
    case 'booking_checked_out':
      return true
    
    default:
      return false
  }
}

// Main function to show notification toast with appropriate settings
export const showRealtimeNotificationToast = (
  notification: Notification,
  onAction?: (action: 'accept' | 'decline' | 'view') => void
) => {
  const showActions = shouldShowNotificationActions(notification)
  const duration = getNotificationToastDuration(notification)
  
  return showNotificationToast(notification, {
    duration,
    showActions,
    onAction
  })
}

// Function to show simple success/error toasts for notification actions
export const showNotificationActionToast = (
  action: 'accept' | 'decline' | 'mark_read',
  success: boolean,
  message?: string
) => {
  const defaultMessages = {
    accept: success ? 'Booking request accepted!' : 'Failed to accept booking request',
    decline: success ? 'Booking request declined!' : 'Failed to decline booking request',
    mark_read: success ? 'Notification marked as read' : 'Failed to mark notification as read'
  }
  
  const toastMessage = message || defaultMessages[action]
  
  if (success) {
    toast.success(toastMessage, {
      duration: 3000,
      position: 'top-right'
    })
  } else {
    toast.error(toastMessage, {
      duration: 5000,
      position: 'top-right'
    })
  }
}

// Function to show bulk action toasts
export const showBulkNotificationToast = (
  action: 'mark_all_read' | 'clear_all',
  count: number,
  success: boolean
) => {
  const messages = {
    mark_all_read: success 
      ? `Marked ${count} notifications as read`
      : 'Failed to mark notifications as read',
    clear_all: success
      ? `Cleared ${count} notifications`
      : 'Failed to clear notifications'
  }
  
  if (success) {
    toast.success(messages[action], {
      duration: 3000,
      position: 'top-right'
    })
  } else {
    toast.error(messages[action], {
      duration: 5000,
      position: 'top-right'
    })
  }
}