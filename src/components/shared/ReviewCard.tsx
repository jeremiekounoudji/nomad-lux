import React from 'react'
import { Card, CardHeader, CardBody, CardFooter, Avatar, Button, Badge, Divider } from '@heroui/react'
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
    <Card className={`h-full shadow-sm border border-gray-200 ${className}`}>
      <CardHeader className="justify-between">
        <div className="flex gap-3">
          <Avatar
            src={review.reviewer_avatar}
            name={getReviewerName()}
            size="md"
            className="shrink-0 ring-2 ring-gray-100"
          />
          <div className="flex flex-col gap-1 items-start justify-center">
            <div className="flex items-center gap-2">
              <h4 className="text-small font-semibold leading-none text-gray-900 truncate max-w-[200px]">
                {getReviewerName()}
              </h4>
            
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">{formatDate(review.created_at)}</span>
             
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
      </CardHeader>

      <Divider />

      <CardBody className="px-3 py-0 text-small text-gray-600 flex-1">
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
        <p className="line-clamp-4 text-left leading-relaxed text-gray-700">
          {review.review_text}
        </p>
      </CardBody>

      <Divider />

      <CardFooter className="px-3 py-3 gap-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="text-xs font-medium text-gray-500 transition-colors duration-200 hover:text-main"
          >
            {t('review.reviewCard.helpful')}
          </button>
          
          {onReport && (
            <button
              type="button"
              onClick={onReport}
              className="flex items-center gap-1 text-xs font-medium text-gray-500 transition-colors duration-200 hover:text-red-600"
            >
              <Flag className="size-3" />
              {t('review.reviewCard.report')}
            </button>
          )}
        </div>

        {/* Review Category */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="rounded-full bg-main/10 px-2 py-1 text-xs font-medium text-main border border-main/20">
            {getReviewTypeLabel()}
          </span>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex items-center gap-2 ml-auto">
            {onEdit && canEditReview(review) && (
              <Button
                size="sm"
                className="border-0 bg-main text-white shadow-sm hover:bg-main/90"
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
      </CardFooter>
    </Card>
  )
}

export default ReviewCard
