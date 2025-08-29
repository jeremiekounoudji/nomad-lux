import React from 'react'
import { Card, CardBody, Avatar, Button, Chip } from '@heroui/react'
import { Bell, Heart, Calendar, MessageCircle, Star, Home, Clock, X } from 'lucide-react'
import { Notification } from '../../interfaces/Notification'
import toast from 'react-hot-toast'
import { useTranslation } from '../../lib/stores/translationStore'

interface NotificationToastProps {
  notification: Notification
  onDismiss?: () => void
  onAction?: (action: 'accept' | 'decline' | 'view') => void
  showActions?: boolean
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onDismiss,
  onAction,
  showActions = false
}) => {
  const { t } = useTranslation(['notifications', 'common'])
  const getNotificationIcon = (type: string) => {
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

  const getTypeColor = (type: string) => {
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

  const getTypeDisplayName = (type: string) => {
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

  const formatTime = (dateString: string) => {
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

  return (
    <Card className="w-full max-w-sm border-0 bg-white shadow-lg ring-1 ring-gray-200">
      <CardBody className="p-0">
        <div className="flex items-start">
          {/* Left colored indicator */}
          <div className={`h-full w-1 ${getTypeColor(notification.type)} rounded-l-lg`}></div>
          
          <div className="flex-1 p-4">
            <div className="flex items-start gap-3">
              {/* Avatar/Icon Section */}
              <div className="relative shrink-0">
                {notification.avatar ? (
                  <Avatar
                    src={notification.avatar}
                    size="md"
                    className="shadow-md ring-2 ring-white"
                  />
                ) : (
                  <div className={`size-10 ${getTypeColor(notification.type)} flex items-center justify-center rounded-full shadow-md`}>
                    <div className="text-white">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                )}
                
                {/* Notification type badge */}
                <div className={`absolute -bottom-0.5 -right-0.5 size-4 ${getTypeColor(notification.type)} flex items-center justify-center rounded-full border border-white shadow-sm`}>
                  <div className="text-xs text-white">
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="mb-1 text-sm font-semibold leading-tight text-gray-900">
                      {notification.title}
                    </h4>
                    
                    <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-gray-600">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock className="size-3" />
                        <span className="text-xs">
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                      
                      <Chip
                        size="sm"
                        variant="flat"
                        className="bg-gray-100 text-xs text-gray-700"
                      >
                        {getTypeDisplayName(notification.type)}
                      </Chip>
                    </div>
                  </div>

                  {/* Dismiss button */}
                  {onDismiss && (
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      className="size-6 min-w-6 text-gray-400 hover:text-gray-600"
                      onClick={onDismiss}
                    >
                      <X className="size-3" />
                    </Button>
                  )}
                </div>

                {/* Action Buttons */}
                {showActions && onAction && (
                  <div className="flex gap-2 border-t border-gray-100 pt-2">
                    {(notification.type === 'booking_request_created' || notification.type === 'new_booking_request') && (
                      <>
                        <Button 
                          size="sm" 
                          color="primary" 
                          variant="solid" 
                          className="flex-1 text-xs font-semibold"
                          onClick={() => onAction('accept')}
                        >
                          {t('notifications.actions.accept')}
                        </Button>
                        <Button 
                          size="sm" 
                          color="secondary" 
                          variant="bordered" 
                          className="flex-1 text-xs font-semibold"
                          onClick={() => onAction('decline')}
                        >
                          {t('notifications.actions.decline')}
                        </Button>
                      </>
                    )}
                    
                    <Button 
                      size="sm" 
                      color="primary" 
                      variant="flat" 
                      className={`text-xs font-semibold ${
                        (notification.type === 'booking_request_created' || notification.type === 'new_booking_request') 
                          ? 'flex-1' 
                          : 'w-full'
                      }`}
                      onClick={() => onAction('view')}
                    >
                      {t('notifications.actions.viewBooking')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

// Helper function to show notification toast
export const showNotificationToast = (
  notification: Notification,
  options: {
    duration?: number
    showActions?: boolean
    onAction?: (action: 'accept' | 'decline' | 'view') => void
  } = {}
) => {
  const { duration = 6000, showActions = false, onAction } = options

  return toast.custom(
    (t) => (
      <NotificationToast
        notification={notification}
        onDismiss={() => toast.dismiss(t.id)}
        onAction={onAction}
        showActions={showActions}
      />
    ),
    {
      duration,
      position: 'top-right',
      style: {
        background: 'transparent',
        boxShadow: 'none',
        padding: 0,
        margin: 0
      }
    }
  )
}

export default NotificationToast