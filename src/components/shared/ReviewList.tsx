import React from 'react'
import { Button, Select, SelectItem, Spinner } from '@heroui/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from '../../lib/stores/translationStore'
import ReviewCard from './ReviewCard'
import { ReviewWithUser, ReviewFilters } from '../../interfaces/Review'

interface ReviewListProps {
  reviews: ReviewWithUser[]
  loading: boolean
  error: string | null
  hasMore: boolean
  currentPage: number
  totalCount: number
  averageRating: number
  filters: ReviewFilters
  onFilterChange: (filters: Partial<ReviewFilters>) => void
  onPageChange: (page: number) => void
  onLoadMore: () => void
  onEditReview?: (reviewId: string) => void
  onDeleteReview?: (reviewId: string) => void
  onReportReview?: (reviewId: string) => void
  showActions?: boolean
  className?: string
}

const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  loading,
  error,
  hasMore,
  currentPage,
  totalCount,
  averageRating,
  filters,
  onFilterChange,
  onPageChange,
  onLoadMore,
  onEditReview,
  onDeleteReview,
  onReportReview,
  showActions = false,
  className = ''
}) => {
  const { t } = useTranslation(['review', 'common'])

  const handleSortChange = (value: string) => {
    onFilterChange({ sort_by: value as ReviewFilters['sort_by'] })
  }

  const handlePageSizeChange = (value: string) => {
    onFilterChange({ limit: parseInt(value), page: 1 })
  }

  const totalPages = Math.ceil(totalCount / (filters.limit || 10))

  if (error) {
    return (
      <div className={`py-8 text-center ${className}`}>
        <div className="mb-4 text-red-600">
          <p className="text-lg font-semibold">Error loading reviews</p>
          <p className="text-sm">{error}</p>
        </div>
        <Button
          color="primary"
          variant="bordered"
          onPress={() => onFilterChange({ page: 1 })}
        >
          {t('common.buttons.tryAgain')}
        </Button>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Stats and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('review.reviews.title')}
          </h3>
          
          {totalCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                {t('review.reviews.totalReviews', { count: totalCount })}
              </span>
              <span>•</span>
              <span>
                {t('review.reviews.averageRating', { rating: averageRating.toFixed(1) })}
              </span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Select
            label="Sort by"
            value={filters.sort_by || 'newest'}
            onChange={(e) => handleSortChange(e.target.value)}
            size="sm"
            className="w-32"
          >
            <SelectItem key="newest">
              {t('review.reviews.newestFirst')}
            </SelectItem>
            <SelectItem key="oldest">
              {t('review.reviews.oldestFirst')}
            </SelectItem>
            <SelectItem key="rating_high">
              Highest rated
            </SelectItem>
            <SelectItem key="rating_low">
              Lowest rated
            </SelectItem>
          </Select>

          <Select
            label="Show"
            value={(filters.limit || 10).toString()}
            onChange={(e) => handlePageSizeChange(e.target.value)}
            size="sm"
            className="w-20"
          >
            <SelectItem key="5">5</SelectItem>
            <SelectItem key="10">10</SelectItem>
            <SelectItem key="20">20</SelectItem>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {loading && reviews.length === 0 && (
        <div className="py-8 text-center">
          <Spinner size="lg" />
          <p className="mt-2 text-gray-600">Loading reviews...</p>
        </div>
      )}

      {/* No Reviews State */}
      {!loading && reviews.length === 0 && (
        <div className="py-8 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100">
            <span className="text-2xl text-gray-400">⭐</span>
          </div>
          <h4 className="mb-2 text-lg font-semibold text-gray-900">
            {t('review.reviews.noReviews')}
          </h4>
          <p className="text-gray-600">
            {t('review.reviews.beFirst')}
          </p>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onEdit={onEditReview ? () => onEditReview(review.id) : undefined}
              onDelete={onDeleteReview ? () => onDeleteReview(review.id) : undefined}
              onReport={onReportReview ? () => onReportReview(review.id) : undefined}
              showActions={showActions}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
          <div className="text-sm text-gray-600">
            {t('common.pagination.showing')} {(currentPage - 1) * (filters.limit || 10) + 1} {t('common.pagination.to')} {Math.min(currentPage * (filters.limit || 10), totalCount)} {t('common.pagination.of')} {totalCount} {t('common.pagination.results')}
          </div>

          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              size="sm"
              variant="bordered"
              onPress={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="size-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    size="sm"
                    variant={currentPage === page ? 'solid' : 'bordered'}
                    color={currentPage === page ? 'primary' : 'default'}
                    onPress={() => onPageChange(page)}
                    className="size-8 min-w-0"
                  >
                    {page}
                  </Button>
                )
              })}
            </div>

            <Button
              isIconOnly
              size="sm"
              variant="bordered"
              onPress={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !loading && (
        <div className="pt-4 text-center">
          <Button
            color="primary"
            variant="bordered"
            onPress={onLoadMore}
            isLoading={loading}
          >
            Load more reviews
          </Button>
        </div>
      )}

      {/* Loading More State */}
      {loading && reviews.length > 0 && (
        <div className="py-4 text-center">
          <Spinner size="sm" />
          <p className="mt-2 text-gray-600">Loading more reviews...</p>
        </div>
      )}
    </div>
  )
}

export default ReviewList
