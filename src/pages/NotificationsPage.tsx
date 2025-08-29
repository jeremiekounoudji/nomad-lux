import React, { useState } from 'react'
import { Card, CardBody, Avatar, Button, Chip, Spinner, Tabs, Tab } from '@heroui/react'
import { Bell, Heart, Calendar, MessageCircle, Star, Home, Clock, CheckCheck } from 'lucide-react'
// removed unused MainLayout import
import { NotificationsPageProps, Notification } from '../interfaces'
import { useNotifications } from '../hooks/useNotifications'
import { useNavigation } from '../hooks/useNavigation'
import { useBookingManagement } from '../hooks/useBookingManagement'
import { PageBanner } from '../components/shared'
import { getBannerConfig } from '../utils/bannerConfig'
import { ROUTES } from '../router/types'
import { useTranslation } from '../lib/stores/translationStore'

const NotificationsPage: React.FC<NotificationsPageProps> = () => {
  const { t } = useTranslation(['notifications', 'common'])
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    error, 
    filter,
    hasMore,
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

  // Helper function to determine the best navigation route for a notification
  const getNavigationRoute = (notification: Notification): string | null => {
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
      // Optionally show success message
      console.log('✅ Booking approved successfully')
    } catch (error) {
      console.error('❌ Failed to approve booking:', error)
      // Optionally show error message
    } finally {
      setProcessingBooking(null)
    }
  }

  const handleDeclineBooking = async (bookingId: string, notificationId: string) => {
    try {
      setProcessingBooking(bookingId)
      await declineBooking(bookingId, t('notifications.messages.bookingDeclinedViaNotification'))
      await markNotificationAsRead(notificationId)
      // Optionally show success message
      console.log('✅ Booking declined successfully')
    } catch (error) {
      console.error('❌ Failed to decline booking:', error)
      // Optionally show error message
    } finally {
      setProcessingBooking(null)
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="col-span-1 space-y-6 md:col-span-2 lg:col-span-3">
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
              <h2 className="mb-2 text-lg font-semibold">{t('notifications.errors.loadingError')}</h2>
              <p>{error}</p>
              <Button 
                color="primary" 
                variant="flat" 
                className="mt-4"
                onClick={() => fetchNotifications()}
              >
                {t('notifications.actions.tryAgain')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
            <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-1 space-y-6 md:col-span-2 lg:col-span-3">
          {/* Header Banner */}
          <PageBanner
          backgroundImage={getBannerConfig('notifications').image}
          title={t('notifications.labels.notifications')}
          subtitle={unreadCount > 0 ? t('notifications.banner.subtitleUnread', { count: unreadCount }) : t('notifications.banner.subtitleAllCaughtUp')}
          imageAlt={t('common.pageBanner.notifications')}
          overlayOpacity={getBannerConfig('notifications').overlayOpacity}
          height={getBannerConfig('notifications').height}
          className="mb-8"
        >
          {unreadCount > 0 && (
            <Button
              color="secondary"
              variant="flat"
              startContent={<CheckCheck className="size-4" />}
              onClick={handleMarkAllAsRead}
              className="border-white/30 bg-white/20 text-white hover:bg-white/30"
            >
              {t('notifications.actions.markAllAsRead')}
            </Button>
          )}
        </PageBanner>

        {/* Filter Tabs */}
        <div className="mb-8">
            <Tabs
            selectedKey={filter}
            onSelectionChange={(key) => setFilter(key as 'all' | 'unread' | 'read')}
            variant="underlined"
            color="primary"
            size="lg"
            className="w-full"
            classNames={{
              tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-primary-500",
              tab: "max-w-fit px-0 h-12",
              tabContent: "group-data-[selected=true]:text-primary-500 font-semibold text-base"
            }}
          >
            <Tab
              key="all"
              title={
                <div className="flex items-center space-x-2">
                  <span>{t('notifications.labels.allNotifications')}</span>
                  <Chip size="sm" variant="flat" color="default" className="text-xs">
                    {notifications.length}
                  </Chip>
                </div>
              }
            />
            <Tab
              key="unread"
              title={
                <div className="flex items-center space-x-2">
                  <span>{t('notifications.status.unread')}</span>
                  <Chip size="sm" variant="flat" color="primary" className="text-xs">
                    {unreadCount}
                  </Chip>
                </div>
              }
            />
            <Tab
              key="read"
              title={
                <div className="flex items-center space-x-2">
                  <span>{t('notifications.status.read')}</span>
                  <Chip size="sm" variant="flat" color="default" className="text-xs">
                    {notifications.length - unreadCount}
                  </Chip>
                </div>
              }
            />
          </Tabs>
        </div>

        {/* Loading State */}
        {isLoading && notifications.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" color="primary" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && notifications.length === 0 && (
          <div className="py-12 text-center">
            <Bell className="mx-auto mb-4 size-16 text-gray-300" />
            <h3 className="mb-2 text-xl font-semibold text-gray-600">{t('notifications.labels.noNotifications')}</h3>
            <p className="text-gray-500">{t('notifications.banner.emptyDescription')}</p>
          </div>
        )}

        {/* Notifications Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`group cursor-pointer overflow-hidden border-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                !notification.is_read 
                  ? 'bg-gradient-to-br from-white to-primary-50 shadow-lg ring-2 ring-primary-200' 
                  : 'bg-white shadow-md hover:shadow-xl'
              } ${
                navigatingNotification === notification.id 
                  ? 'scale-95 opacity-75' 
                  : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardBody className="relative p-0">
                {/* Unread indicator */}
                {!notification.is_read && (
                  <div className="absolute right-3 top-3 z-10 size-3 animate-pulse rounded-full bg-primary-500 shadow-lg"></div>
                )}

                {/* Header with Avatar and Type */}
                <div className="relative p-4 pb-3">
                  <div className="mb-3 flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      {notification.avatar ? (
                        <Avatar
                          src={notification.avatar}
                          size="md"
                          className="shadow-md ring-2 ring-white"
                        />
                      ) : (
                        <div className={`size-12 ${getTypeColor(notification.type)} flex items-center justify-center rounded-full shadow-lg`}>
                          <div className="text-white">
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>
                      )}
                      
                      {/* Type badge */}
                      <div className={`absolute -bottom-1 -right-1 size-5 ${getTypeColor(notification.type)} flex items-center justify-center rounded-full border-2 border-white shadow-md`}>
                        <div className="text-xs text-white">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                    </div>

                    {/* Type chip */}
                    <Chip
                      size="sm"
                      variant="flat"
                      className={`text-xs font-semibold ${
                        !notification.is_read 
                          ? 'bg-primary-100 text-primary-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {getTypeDisplayName(notification.type)}
                    </Chip>
                  </div>

                  {/* Title */}
                  <h3 className={`mb-2 text-base font-bold leading-tight ${
                    !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                  }`}>
                    {notification.title}
                  </h3>

                  {/* Message */}
                  <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-gray-600">
                    {notification.message}
                  </p>

                  {/* Time */}
                  <div className="flex items-center gap-1 text-gray-400">
                    <Clock className="size-3" />
                    <span className="text-xs font-medium">
                      {formatTime(notification.created_at)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                {(notification.type === 'booking_request_created' || notification.type === 'new_booking_request') && 
                 notification.related_id && notification.related_type === 'booking' && (
                  <div className="px-4 pb-4">
                    <div className="flex gap-2 border-t border-gray-100 pt-3">
                      <Button 
                        size="sm" 
                        color="primary" 
                        variant="solid" 
                        className="flex-1 text-xs font-semibold shadow-md transition-all hover:shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAcceptBooking(notification.related_id!, notification.id)
                        }}
                        isLoading={processingBooking === notification.related_id}
                        disabled={processingBooking === notification.related_id}
                      >
                        {processingBooking === notification.related_id ? t('notifications.actions.accepting') : t('notifications.actions.accept')}
                      </Button>
                      <Button 
                        size="sm" 
                        color="secondary" 
                        variant="bordered" 
                        className="flex-1 border-2 text-xs font-semibold transition-all hover:bg-secondary-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeclineBooking(notification.related_id!, notification.id)
                        }}
                        isLoading={processingBooking === notification.related_id}
                        disabled={processingBooking === notification.related_id}
                      >
                        {processingBooking === notification.related_id ? t('notifications.actions.declining') : t('notifications.actions.decline')}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Hover effect overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Load More */}
        {notifications.length > 0 && hasMore && (
          <div className="flex justify-center pb-8 pt-12">
            <div className="group relative">
              {/* Animated background gradient */}
              <div className="absolute -inset-1 animate-pulse rounded-full bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 opacity-75 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur"></div>
              
              <Button 
                variant="solid" 
                color="primary" 
                size="lg"
                className="relative rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-16 py-4 font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:from-primary-600 hover:to-primary-700 hover:shadow-2xl active:scale-95"
                onClick={handleLoadMore}
                isLoading={loadingMore}
                disabled={loadingMore}
                startContent={!loadingMore && (
                  <div className="size-2 animate-bounce rounded-full bg-white"></div>
                )}
              >
                <span className="relative z-10">
                  {loadingMore ? t('notifications.actions.loadingMore') : t('notifications.actions.loadMore')}
                </span>
              </Button>
            </div>
          </div>
        )}

        {/* End of notifications indicator */}
        {notifications.length > 0 && !hasMore && (
          <div className="flex justify-center pb-8 pt-12">
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner">
                <Bell className="size-6 text-gray-400" />
              </div>
              <p className="mb-2 text-lg font-medium text-gray-500">{t('notifications.banner.allCaughtUp')}</p>
              <p className="text-sm text-gray-400">{t('notifications.banner.noMore')}</p>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

export default NotificationsPage 