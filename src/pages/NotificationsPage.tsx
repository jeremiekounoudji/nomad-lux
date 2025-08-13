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
        return <Calendar className="w-4 h-4" />
      case 'property_liked':
        return <Heart className="w-4 h-4" />
      case 'property_approved':
      case 'property_rejected':
      case 'property_suspended':
      case 'property_submitted':
        return <Home className="w-4 h-4" />
      case 'payment_success':
      case 'payment_failed':
      case 'booking_refunded':
      case 'payout_approved':
      case 'payout_rejected':
      case 'payout_paid':
      case 'payout_requested':
        return <Star className="w-4 h-4" />
      case 'account_suspended':
      case 'profile_updated':
      case 'account_flagged':
      case 'bulk_action':
        return <MessageCircle className="w-4 h-4" />
      case 'dispute_raised':
      case 'system_error':
        return <Bell className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
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
      await approveBooking(bookingId, 'Booking request approved via notification')
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
      await declineBooking(bookingId, 'Booking request declined via notification')
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
      <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Error Loading Notifications</h2>
          <p>{error}</p>
          <Button 
            color="primary" 
            variant="flat" 
            className="mt-4"
            onClick={() => fetchNotifications()}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-6">
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
              startContent={<CheckCheck className="w-4 h-4" />}
              onClick={handleMarkAllAsRead}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
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
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" color="primary" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && notifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">{t('notifications.labels.noNotifications')}</h3>
            <p className="text-gray-500">{t('notifications.banner.emptyDescription')}</p>
          </div>
        )}

        {/* Notifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer border-0 overflow-hidden ${
                !notification.is_read 
                  ? 'bg-gradient-to-br from-white to-primary-50 shadow-lg ring-2 ring-primary-200' 
                  : 'bg-white shadow-md hover:shadow-xl'
              } ${
                navigatingNotification === notification.id 
                  ? 'opacity-75 scale-95' 
                  : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardBody className="p-0 relative">
                {/* Unread indicator */}
                {!notification.is_read && (
                  <div className="absolute top-3 right-3 w-3 h-3 bg-primary-500 rounded-full animate-pulse z-10 shadow-lg"></div>
                )}

                {/* Header with Avatar and Type */}
                <div className="relative p-4 pb-3">
                  <div className="flex items-center gap-3 mb-3">
                    {/* Avatar */}
                    <div className="relative">
                      {notification.avatar ? (
                        <Avatar
                          src={notification.avatar}
                          size="md"
                          className="ring-2 ring-white shadow-md"
                        />
                      ) : (
                        <div className={`w-12 h-12 ${getTypeColor(notification.type)} rounded-full flex items-center justify-center shadow-lg`}>
                          <div className="text-white">
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>
                      )}
                      
                      {/* Type badge */}
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getTypeColor(notification.type)} rounded-full flex items-center justify-center shadow-md border-2 border-white`}>
                        <div className="text-white text-xs">
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
                  <h3 className={`font-bold text-base leading-tight mb-2 ${
                    !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                  }`}>
                    {notification.title}
                  </h3>

                  {/* Message */}
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-3">
                    {notification.message}
                  </p>

                  {/* Time */}
                  <div className="flex items-center gap-1 text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs font-medium">
                      {formatTime(notification.created_at)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                {(notification.type === 'booking_request_created' || notification.type === 'new_booking_request') && 
                 notification.related_id && notification.related_type === 'booking' && (
                  <div className="px-4 pb-4">
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <Button 
                        size="sm" 
                        color="primary" 
                        variant="solid" 
                        className="flex-1 font-semibold text-xs shadow-md hover:shadow-lg transition-all"
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
                        className="flex-1 font-semibold text-xs border-2 hover:bg-secondary-50 transition-all"
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Load More */}
        {notifications.length > 0 && hasMore && (
          <div className="flex justify-center pt-12 pb-8">
            <div className="relative group">
              {/* Animated background gradient */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 rounded-full opacity-75 group-hover:opacity-100 blur-sm group-hover:blur transition-all duration-300 animate-pulse"></div>
              
              <Button 
                variant="solid" 
                color="primary" 
                size="lg"
                className="relative font-bold px-16 py-4 text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full transform hover:scale-105 active:scale-95"
                onClick={handleLoadMore}
                isLoading={loadingMore}
                disabled={loadingMore}
                startContent={!loadingMore && (
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
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
          <div className="flex justify-center pt-12 pb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Bell className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-lg mb-2">{t('notifications.banner.allCaughtUp')}</p>
              <p className="text-gray-400 text-sm">{t('notifications.banner.noMore')}</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default NotificationsPage 