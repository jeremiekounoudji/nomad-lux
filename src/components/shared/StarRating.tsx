import React from 'react'
import { Star } from '@heroui/react'
import { useTranslation } from '../../lib/stores/translationStore'

interface StarRatingProps {
  rating: number
  onRatingChange?: (rating: number) => void
  size?: 'sm' | 'md' | 'lg'
  readonly?: boolean
  showLabel?: boolean
  className?: string
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  size = 'md',
  readonly = false,
  showLabel = false,
  className = ''
}) => {
  const { t } = useTranslation(['review', 'common'])

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const getRatingLabel = (rating: number): string => {
    switch (rating) {
      case 1:
        return t('review.rating.terrible')
      case 2:
        return t('review.rating.poor')
      case 3:
        return t('review.rating.average')
      case 4:
        return t('review.rating.good')
      case 5:
        return t('review.rating.excellent')
      default:
        return ''
    }
  }

  const handleStarClick = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent, starRating: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleStarClick(starRating)
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(star)}
            onKeyDown={(e) => handleKeyDown(e, star)}
            disabled={readonly}
            className={`transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            }`}
            aria-label={`${star} ${t('review.rating.stars', { count: star })}`}
            aria-pressed={rating >= star}
          >
            <Star
              className={`${sizeClasses[size]} ${
                rating >= star
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
      
      {showLabel && rating > 0 && (
        <span className="text-sm text-gray-600 font-medium">
          {getRatingLabel(rating)}
        </span>
      )}
      
      <span className="text-sm text-gray-500">
        {rating > 0 ? `${rating} ${t('review.rating.outOf')}` : t('review.rating.outOf')}
      </span>
    </div>
  )
}

export default StarRating
