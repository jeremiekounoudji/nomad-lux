import React from 'react';
import { Button } from '@heroui/react';
import { CheckCheck } from 'lucide-react';
import { NotificationsPageProps } from '../interfaces';
import { useNotifications } from '../hooks/useNotifications';
import { useNotificationActions } from '../hooks/useNotificationActions';
import { PageBanner } from '../components/shared';
import { getBannerConfig } from '../utils/bannerConfig';
import { useTranslation } from '../lib/stores/translationStore';
import { formatNotificationTime } from '../utils/notificationUtils';

import NotificationCard from '../components/features/notifications/NotificationCard';
import NotificationFilters from '../components/features/notifications/NotificationFilters';
import {
  ErrorState,
  LoadingState,
  EmptyState,
  LoadMoreState,
  EndState,
} from '../components/features/notifications/NotificationStates';

const NotificationsPage: React.FC<NotificationsPageProps> = () => {
  const { t } = useTranslation(['notifications', 'common']);
  const { notifications, unreadCount, isLoading, error, filter, hasMore } = useNotifications();

  const {
    loadingMore,
    // processingBooking,
    navigatingNotification,
    handleNotificationClick,
    handleLoadMore,
    handleMarkAllAsRead,
    // handleAcceptBooking,
    // handleDeclineBooking,
    handleFilterChange,
    handleRetry,
  } = useNotificationActions();

  const formatTime = (dateString: string) => formatNotificationTime(dateString, t);

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-1 space-y-6 md:col-span-2 lg:col-span-3">
          {/* Header Banner */}
          <PageBanner
            backgroundImage={getBannerConfig('notifications').image}
            title={t('notifications.labels.notifications')}
            subtitle={
              unreadCount > 0
                ? t('notifications.banner.subtitleUnread', { count: unreadCount })
                : t('notifications.banner.subtitleAllCaughtUp')
            }
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
          <NotificationFilters
            filter={filter}
            totalCount={notifications.length}
            unreadCount={unreadCount}
            onFilterChange={handleFilterChange}
          />

          {/* Loading State */}
          <LoadingState isLoading={isLoading && notifications.length === 0} />

          {/* Empty State */}
          <EmptyState isLoading={isLoading} hasNotifications={notifications.length > 0} />

          {/* Notifications Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                isNavigating={navigatingNotification === notification.id}
                // isProcessing={processingBooking === notification.related_id}
                onNotificationClick={handleNotificationClick}
                // onAcceptBooking={handleAcceptBooking}
                // onDeclineBooking={handleDeclineBooking}
                formatTime={formatTime}
              />
            ))}
          </div>

          {/* Load More */}
          <LoadMoreState
            hasMore={notifications.length > 0 && hasMore}
            isLoading={loadingMore}
            onLoadMore={handleLoadMore}
          />

          {/* End of notifications indicator */}
          <EndState hasNotifications={notifications.length > 0} hasMore={hasMore} />
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
