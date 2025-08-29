import React from 'react'
import { Button, Badge, Popover, PopoverTrigger, PopoverContent, Card, CardBody, Divider, useDisclosure } from '@heroui/react'
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
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Get recent unread notifications for preview
  const recentNotifications = notifications
    .filter(n => !n.is_read)
    .slice(0, maxPreviewItems)

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id)
    }
    onClose() // Close the popover
    // Navigate to notifications page
    navigateWithAuth(ROUTES.NOTIFICATIONS)
  }

  const handleViewAll = () => {
    onClose() // Close the popover
    navigateWithAuth(ROUTES.NOTIFICATIONS)
  }

  return (
    <Popover placement="bottom-end" showArrow isOpen={isOpen} onOpenChange={onOpen}>
      <PopoverTrigger>
        <Button
          isIconOnly
          variant={className.includes('bg-primary-600') ? 'solid' : 'light'}
          className={`relative ${className}`}
          aria-label={
            unreadCount > 0
              ? t('notifications.aria.withUnread', { count: unreadCount })
              : t('notifications.aria.noUnread')
          }
        >
          <Bell className={`size-5 ${className.includes('bg-primary-600') ? 'text-white' : ''}`} />
          {showBadge && unreadCount > 0 && (
            <Badge
              content={unreadCount > 99 ? '99+' : unreadCount.toString()}
              color="danger"
              size="sm"
              className="absolute -right-1 -top-1"
            />
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0">
        <Card className="border-0 shadow-lg">
          <CardBody className="p-0">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
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
                <Settings className="size-4" />
              </Button>
            </div>

            {/* Notifications Preview */}
            <div className="max-h-96 overflow-y-auto">
              {recentNotifications.length > 0 ? (
                <>
                  {recentNotifications.map((notification, index) => (
                    <div key={notification.id}>
                      <div 
                        className="cursor-pointer p-3 transition-colors hover:bg-gray-50"
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
                  <Bell className="mx-auto mb-3 size-12 text-gray-300" />
                  <p className="text-sm text-gray-500">{t('notifications.emptyState.noNew')}</p>
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