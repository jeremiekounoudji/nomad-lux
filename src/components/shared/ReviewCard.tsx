import React from 'react'
import { Button, Avatar, Badge } from '@heroui/react'
import { MoreVertical, CheckCircle, Flag, Trash2 } from 'lucide-react'
import { useTranslation } from '../../lib/stores/translationStore'
import StarRating from './StarRating'
import { ReviewWithUser } from '../../interfaces/Review'
import { useReviewStore } from '../../lib/stores/reviewStore'
import { useAuthStore } from '../../lib/stores/authStore'

interface ReviewCardProps {
  review: ReviewWithUser
  onEdit?: () => void
  onDelete?: () => void
  onReport?: () => void
  showActions?: boolean
  className?: string
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onEdit,
  onDelete,
  onReport,
  showActions = false,
  className = ''
}) => {
  const { t } = useTranslation(['review', 'common'])
  const { user } = useAuthStore()
  const { canEditReview, canDeleteReview } = useReviewStore()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getReviewTypeLabel = () => {
    switch (review.review_type) {
      case 'guest_to_host':
        return t('review.reviewType.guestToHost')
      case 'host_to_guest':
        return t('review.reviewType.hostToGuest')
      case 'property':
        return t('review.reviewType.property')
      default:
        return review.review_type
    }
  }

  const getReviewerName = () => {
    return review.reviewer_display_name || review.reviewer_name || 'Anonymous'
  }

  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-gray-300 hover:shadow-lg ${className}`}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar
            src={review.reviewer_avatar}
            name={getReviewerName()}
            size="md"
            className="shrink-0 ring-2 ring-gray-100"
          />
          
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h4 className="truncate text-base font-semibold text-gray-900">
                {getReviewerName()}
              </h4>
              
              <Badge
                content={<CheckCircle className="size-3" />}
                color="success"
                size="sm"
                className="shrink-0"
              >
                <span className="text-xs font-medium text-green-600">
                  {t('review.reviewCard.verified')}
                </span>
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{formatDate(review.created_at)}</span>
              <span>•</span>
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">
                {getReviewTypeLabel()}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        {showActions && (
          <div className="relative">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            >
              <MoreVertical className="size-4" />
            </Button>
            {/* TODO: Add dropdown menu with edit/delete/report options */}
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="mb-4">
        <StarRating
          rating={review.rating}
          size="md"
          readonly={true}
          showLabel={true}
        />
      </div>

      {/* Review Text */}
      <div className="mb-6">
        <p className="whitespace-pre-wrap text-left text-sm leading-relaxed text-gray-700">
          {review.review_text}
        </p>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="text-sm font-medium text-gray-500 transition-colors duration-200 hover:text-main"
          >
            {t('review.reviewCard.helpful')}
          </button>
          
          {onReport && (
            <button
              type="button"
              onClick={onReport}
              className="flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors duration-200 hover:text-red-600"
            >
              <Flag className="size-3" />
              {t('review.reviewCard.report')}
            </button>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex items-center gap-3">
            {onEdit && canEditReview(review) && (
              <Button
                size="sm"
                className="border-0 bg-blue-500 text-white shadow-sm hover:bg-blue-600"
                onPress={onEdit}
              >
                {t('common.buttons.edit')}
              </Button>
            )}
            
            {onEdit && !canEditReview(review) && (
              <span className="rounded-full bg-gray-50 px-3 py-1 text-xs italic text-gray-400">
                {t('review.reviewCard.editingExpired')}
              </span>
            )}
            
            {onDelete && canDeleteReview(review, user?.id) && (
              <Button
                size="sm"
                className="border-0 bg-red-500 text-white shadow-sm hover:bg-red-600"
                onPress={onDelete}
                startContent={<Trash2 className="size-3" />}
              >
                {t('common.buttons.delete')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewCard
