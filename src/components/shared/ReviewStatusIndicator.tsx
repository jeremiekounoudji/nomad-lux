import React from 'react'
import { Badge, Tooltip } from '@heroui/react'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { useTranslation } from '../../lib/stores/translationStore'

interface ReviewStatusIndicatorProps {
  bookingId: string
  reviewType: string
  hasReview: boolean
  canReview: boolean
  reason?: string
  className?: string
}

const ReviewStatusIndicator: React.FC<ReviewStatusIndicatorProps> = ({
  // bookingId, // Unused parameter
  reviewType,
  hasReview,
  canReview,
  reason,
  className = ''
}) => {
  const { t } = useTranslation(['review', 'common'])

  const getReviewTypeLabel = (type: string) => {
    switch (type) {
      case 'guest_to_host':
        return t('review.reviewType.guestToHost')
      case 'host_to_guest':
        return t('review.reviewType.hostToGuest')
      case 'property':
        return t('review.reviewType.property')
      default:
        return type
    }
  }

  const getStatusConfig = () => {
    if (hasReview) {
      return {
        color: 'success' as const,
        icon: <CheckCircle className="size-3" />,
        label: t('review.status.completed'),
        tooltip: t('review.status.completedTooltip')
      }
    } else if (canReview) {
      return {
        color: 'primary' as const,
        icon: <Clock className="size-3" />,
        label: t('review.status.pending'),
        tooltip: t('review.status.pendingTooltip')
      }
    } else {
      return {
        color: 'danger' as const,
        icon: <AlertCircle className="size-3" />,
        label: t('review.status.unavailable'),
        tooltip: reason || t('review.status.unavailableTooltip')
      }
    }
  }

  const statusConfig = getStatusConfig()

  return (
    <Tooltip content={statusConfig.tooltip}>
      <Badge
        color={statusConfig.color}
        variant="flat"
        size="sm"
        className={`cursor-help ${className}`}
      >
        <div className="flex items-center gap-1">
          {statusConfig.icon}
          <span>{getReviewTypeLabel(reviewType)}: {statusConfig.label}</span>
        </div>
      </Badge>
    </Tooltip>
  )
}

export default ReviewStatusIndicator
