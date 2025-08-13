import React from 'react'
import { Button, Badge, Popover, PopoverTrigger, PopoverContent, Card, CardBody, Divider } from '@heroui/react'
import { Bell, Settings } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'
import { useNavigation } from '../../hooks/useNavigation'
import { ROUTES } from '../../router/types'
import NotificationToast from './NotificationToast'
import { useTranslation } from '../../lib/stores/translationStore'

interface NotificationCenterProps {
  className?: string
  showBadge?: boolean
  maxPreviewItems?: number
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  className = '',
  showBadge = true,
  maxPreviewItems = 3
}) => {
  const { notifications, unreadCount, markNotificationAsRead } = useNotifications()
  const { navigateWithAuth } = useNavigation()
  const { t } = useTranslation(['notifications', 'common'])

  // Get recent unread notifications for preview
  const recentNotifications = notifications
    .filter(n => !n.is_read)
    .slice(0, maxPreviewItems)

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id)
    }
    // Navigate to notifications page
    navigateWithAuth(ROUTES.NOTIFICATIONS)
  }

  const handleViewAll = () => {
    navigateWithAuth(ROUTES.NOTIFICATIONS)
  }

  return (
    <Popover placement="bottom-end" showArrow>
      <PopoverTrigger>
        <Button
          isIconOnly
          variant="light"
          className={`relative ${className}`}
          aria-label={
            unreadCount > 0
              ? t('notifications.aria.withUnread', { count: unreadCount })
              : t('notifications.aria.noUnread')
          }
        >
          <Bell className="w-5 h-5" />
          {showBadge && unreadCount > 0 && (
            <Badge
              content={unreadCount > 99 ? '99+' : unreadCount.toString()}
              color="danger"
              size="sm"
              className="absolute -top-1 -right-1"
            />
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0">
        <Card className="shadow-lg border-0">
          <CardBody className="p-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-900">{t('notifications.banner.title')}</h3>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-500">{t('notifications.banner.unreadCount', { count: unreadCount })}</p>
                )}
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onClick={handleViewAll}
                aria-label={t('notifications.actions.open', 'Open notifications')}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>

            {/* Notifications Preview */}
            <div className="max-h-96 overflow-y-auto">
              {recentNotifications.length > 0 ? (
                <>
                  {recentNotifications.map((notification, index) => (
                    <div key={notification.id}>
                      <div 
                        className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <NotificationToast
                          notification={notification}
                          showActions={false}
                        />
                      </div>
                      {index < recentNotifications.length - 1 && (
                        <Divider className="mx-3" />
                      )}
                    </div>
                  ))}
                  
                  {notifications.filter(n => !n.is_read).length > maxPreviewItems && (
                    <>
                      <Divider className="mx-3" />
                      <div className="p-3 text-center">
                        <p className="text-sm text-gray-500">
                          +{notifications.filter(n => !n.is_read).length - maxPreviewItems} {t('notifications.labels.moreUnread')}
                        </p>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="p-6 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">{t('notifications.emptyState.noNew')}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {recentNotifications.length > 0 && (
              <>
                <Divider />
                <div className="p-3">
                  <Button
                    variant="flat"
                    color="primary"
                    className="w-full"
                    onClick={handleViewAll}
                  >
                    {t('notifications.actions.viewAll')}
                  </Button>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </PopoverContent>
    </Popover>
  )
}

export default NotificationCenter