import React from 'react';
import { Card, CardBody, Avatar, Chip } from '@heroui/react';
import { Clock } from 'lucide-react';
import { Notification } from '../../../interfaces';
import { useTranslation } from '../../../lib/stores/translationStore';
import {
  getNotificationIcon,
  getTypeColor,
  getTypeDisplayName,
} from '../../../utils/notificationUtils';

interface NotificationCardProps {
  notification: Notification;
  isNavigating: boolean;
  onNotificationClick: (notification: Notification) => void;
  formatTime: (dateString: string) => string;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  isNavigating,
  onNotificationClick,
  formatTime,
}) => {
  const { t } = useTranslation(['notifications']);

  return (
    <Card
      className={`group cursor-pointer overflow-hidden border-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
        !notification.is_read
          ? 'bg-gradient-to-br from-white to-primary-50 shadow-lg ring-2 ring-primary-200'
          : 'bg-white shadow-md hover:shadow-xl'
      } ${isNavigating ? 'scale-95 opacity-75' : ''}`}
      onClick={() => onNotificationClick(notification)}
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
                <div
                  className={`size-12 ${getTypeColor(notification.type)} flex items-center justify-center rounded-full shadow-lg`}
                >
                  <div className="text-white">{getNotificationIcon(notification.type)}</div>
                </div>
              )}

              {/* Type badge */}
              <div
                className={`absolute -bottom-1 -right-1 size-5 ${getTypeColor(notification.type)} flex items-center justify-center rounded-full border-2 border-white shadow-md`}
              >
                <div className="text-xs text-white">{getNotificationIcon(notification.type)}</div>
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
              {getTypeDisplayName(notification.type, t)}
            </Chip>
          </div>

          {/* Title */}
          <h3
            className={`mb-2 text-base font-bold leading-tight ${
              !notification.is_read ? 'text-gray-900' : 'text-gray-700'
            }`}
          >
            {notification.title}
          </h3>

          {/* Message */}
          <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-gray-600">
            {notification.message}
          </p>

          {/* Time */}
          <div className="flex items-center gap-1 text-gray-400">
            <Clock className="size-3" />
            <span className="text-xs font-medium">{formatTime(notification.created_at)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        {/* {(notification.type === 'booking_request_created' ||
          notification.type === 'new_booking_request') &&
          notification.related_id &&
          notification.related_type === 'booking' && (
            <div className="px-4 pb-4">
              <div className="flex gap-2 border-t border-gray-100 pt-3">
                <Button
                  size="sm"
                  color="primary"
                  variant="solid"
                  className="flex-1 text-xs font-semibold shadow-md transition-all hover:shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAcceptBooking(notification.related_id!, notification.id);
                  }}
                  isLoading={isProcessing}
                  disabled={isProcessing}
                >
                  {isProcessing
                    ? t('notifications.actions.accepting')
                    : t('notifications.actions.accept')}
                </Button>
                <Button
                  size="sm"
                  color="secondary"
                  variant="bordered"
                  className="flex-1 border-2 text-xs font-semibold transition-all hover:bg-secondary-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeclineBooking(notification.related_id!, notification.id);
                  }}
                  isLoading={isProcessing}
                  disabled={isProcessing}
                >
                  {isProcessing
                    ? t('notifications.actions.declining')
                    : t('notifications.actions.decline')}
                </Button>
              </div>
            </div>
          )} */}

        {/* Hover effect overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
      </CardBody>
    </Card>
  );
};

export default NotificationCard;
