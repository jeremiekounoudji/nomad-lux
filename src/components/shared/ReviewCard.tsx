import React from 'react'
import { Button, Avatar, Badge } from '@heroui/react'
import { MoreVertical, CheckCircle, Flag } from 'lucide-react'
import { useTranslation } from '../../lib/stores/translationStore'
import StarRating from './StarRating'
import { ReviewWithUser } from '../../interfaces/Review'

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
    <div className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar
            src={review.reviewer_avatar}
            name={getReviewerName()}
            size="sm"
            className="flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
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
            
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{formatDate(review.created_at)}</span>
              <span>•</span>
              <span>{getReviewTypeLabel()}</span>
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
              className="text-gray-400 hover:text-gray-600"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
            {/* TODO: Add dropdown menu with edit/delete/report options */}
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="mb-3">
        <StarRating
          rating={review.rating}
          size="sm"
          readonly={true}
          showLabel={true}
        />
      </div>

      {/* Review Text */}
      <div className="mb-4">
        <p className="text-sm text-gray-700 leading-relaxed">
          {review.review_text}
        </p>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            {t('review.reviewCard.helpful')}
          </button>
          
          {onReport && (
            <button
              type="button"
              onClick={onReport}
              className="text-xs text-gray-500 hover:text-red-600 transition-colors duration-200 flex items-center gap-1"
            >
              <Flag className="w-3 h-3" />
              {t('review.reviewCard.report')}
            </button>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                size="sm"
                variant="light"
                color="primary"
                onPress={onEdit}
              >
                {t('common.buttons.edit')}
              </Button>
            )}
            
            {onDelete && (
              <Button
                size="sm"
                variant="light"
                color="danger"
                onPress={onDelete}
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
