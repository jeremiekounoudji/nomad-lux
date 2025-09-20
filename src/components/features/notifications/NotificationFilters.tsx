import React from 'react'
import { Tabs, Tab, Chip } from '@heroui/react'
import { useTranslation } from '../../../lib/stores/translationStore'

interface NotificationFiltersProps {
  filter: 'all' | 'unread' | 'read'
  totalCount: number
  unreadCount: number
  onFilterChange: (filter: 'all' | 'unread' | 'read') => void
}

const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  filter,
  totalCount,
  unreadCount,
  onFilterChange
}) => {
  const { t } = useTranslation(['notifications'])

  return (
    <div className="mb-8">
      <Tabs
        selectedKey={filter}
        onSelectionChange={(key) => onFilterChange(key as 'all' | 'unread' | 'read')}
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
                {totalCount}
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
                {totalCount - unreadCount}
              </Chip>
            </div>
          }
        />
      </Tabs>
    </div>
  )
}

export default NotificationFilters