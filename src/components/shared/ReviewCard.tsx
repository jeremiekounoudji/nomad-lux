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
    <div className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-gray-300 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <Avatar
            src={review.reviewer_avatar}
            name={getReviewerName()}
            size="md"
            className="flex-shrink-0 ring-2 ring-gray-100"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-base font-semibold text-gray-900 truncate">
                {getReviewerName()}
              </h4>
              
              <Badge
                content={<CheckCircle className="w-3 h-3" />}
                color="success"
                size="sm"
                className="flex-shrink-0"
              >
                <span className="text-xs text-green-600 font-medium">
                  {t('review.reviewCard.verified')}
                </span>
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{formatDate(review.created_at)}</span>
              <span>•</span>
              <span className="bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">
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
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            >
              <MoreVertical className="w-4 h-4" />
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
        <p className="text-sm text-gray-700 leading-relaxed text-left whitespace-pre-wrap">
          {review.review_text}
        </p>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="text-sm text-gray-500 hover:text-main transition-colors duration-200 font-medium"
          >
            {t('review.reviewCard.helpful')}
          </button>
          
          {onReport && (
            <button
              type="button"
              onClick={onReport}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors duration-200 flex items-center gap-1 font-medium"
            >
              <Flag className="w-3 h-3" />
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
                className="bg-blue-500 text-white hover:bg-blue-600 border-0 shadow-sm"
                onPress={onEdit}
              >
                {t('common.buttons.edit')}
              </Button>
            )}
            
            {onEdit && !canEditReview(review) && (
              <span className="text-xs text-gray-400 italic bg-gray-50 px-3 py-1 rounded-full">
                {t('review.reviewCard.editingExpired')}
              </span>
            )}
            
            {onDelete && canDeleteReview(review, user?.id) && (
              <Button
                size="sm"
                className="bg-red-500 text-white hover:bg-red-600 border-0 shadow-sm"
                onPress={onDelete}
                startContent={<Trash2 className="w-3 h-3" />}
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
