import React from 'react'
import { Spinner, Button } from '@heroui/react'
import { Bell } from 'lucide-react'
import { useTranslation } from '../../../lib/stores/translationStore'

interface LoadingStateProps {
  isLoading: boolean
}

export const LoadingState: React.FC<LoadingStateProps> = ({ isLoading }) => {
  if (!isLoading) return null
  
  return (
    <div className="flex items-center justify-center py-12">
      <Spinner size="lg" color="primary" />
    </div>
  )
}

interface EmptyStateProps {
  isLoading: boolean
  hasNotifications: boolean
}

export const EmptyState: React.FC<EmptyStateProps> = ({ isLoading, hasNotifications }) => {
  const { t } = useTranslation(['notifications'])
  
  if (isLoading || hasNotifications) return null
  
  return (
    <div className="py-12 text-center">
      <Bell className="mx-auto mb-4 size-16 text-gray-300" />
      <h3 className="mb-2 text-xl font-semibold text-gray-600">
        {t('notifications.labels.noNotifications')}
      </h3>
      <p className="text-gray-500">
        {t('notifications.banner.emptyDescription')}
      </p>
    </div>
  )
}

interface ErrorStateProps {
  error: string | null
  onRetry: () => void
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  const { t } = useTranslation(['notifications'])
  
  if (!error) return null
  
  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-1 space-y-6 md:col-span-2 lg:col-span-3">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
            <h2 className="mb-2 text-lg font-semibold">
              {t('notifications.errors.loadingError')}
            </h2>
            <p>{error}</p>
            <Button 
              color="primary" 
              variant="flat" 
              className="mt-4"
              onClick={onRetry}
            >
              {t('notifications.actions.tryAgain')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface LoadMoreStateProps {
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
}

export const LoadMoreState: React.FC<LoadMoreStateProps> = ({ 
  hasMore, 
  isLoading, 
  onLoadMore 
}) => {
  const { t } = useTranslation(['notifications'])
  
  if (!hasMore) return null
  
  return (
    <div className="flex justify-center pb-8 pt-12">
      <div className="group relative">
        {/* Animated background gradient */}
        <div className="absolute -inset-1 animate-pulse rounded-full bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 opacity-75 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur"></div>
        
        <Button 
          variant="solid" 
          color="primary" 
          size="lg"
          className="relative rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-16 py-4 font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:from-primary-600 hover:to-primary-700 hover:shadow-2xl active:scale-95"
          onClick={onLoadMore}
          isLoading={isLoading}
          disabled={isLoading}
          startContent={!isLoading && (
            <div className="size-2 animate-bounce rounded-full bg-white"></div>
          )}
        >
          <span className="relative z-10">
            {isLoading ? t('notifications.actions.loadingMore') : t('notifications.actions.loadMore')}
          </span>
        </Button>
      </div>
    </div>
  )
}

interface EndStateProps {
  hasNotifications: boolean
  hasMore: boolean
}

export const EndState: React.FC<EndStateProps> = ({ hasNotifications, hasMore }) => {
  const { t } = useTranslation(['notifications'])
  
  if (!hasNotifications || hasMore) return null
  
  return (
    <div className="flex justify-center pb-8 pt-12">
      <div className="text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner">
          <Bell className="size-6 text-gray-400" />
        </div>
        <p className="mb-2 text-lg font-medium text-gray-500">
          {t('notifications.banner.allCaughtUp')}
        </p>
        <p className="text-sm text-gray-400">
          {t('notifications.banner.noMore')}
        </p>
      </div>
    </div>
  )
}