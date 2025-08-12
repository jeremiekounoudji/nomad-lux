import { Notification } from '../interfaces/Notification'
import { showNotificationToast } from '../components/shared/NotificationToast'
import toast from 'react-hot-toast'

// Helper function to determine if a notification should show actions
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