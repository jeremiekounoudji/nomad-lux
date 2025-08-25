import React, { useEffect } from 'react'
import { Button, Textarea } from '@heroui/react'
import { useTranslation } from '../../lib/stores/translationStore'
import StarRating from './StarRating'
import { ReviewFormState } from '../../interfaces/Review'

interface ReviewFormProps {
  formState: ReviewFormState
  onFormChange: (state: Partial<ReviewFormState>) => void
  onSubmit: () => void
  onCancel: () => void
  mode: 'create' | 'edit'
  reviewType?: string
  className?: string
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  formState,
  onFormChange,
  onSubmit,
  onCancel,
  mode,
  reviewType,
  className = ''
}) => {
  const { t } = useTranslation(['review', 'common'])

  const handleRatingChange = (rating: number) => {
    onFormChange({ rating, errors: { ...formState.errors, rating: undefined } })
  }

  const handleTextChange = (value: string) => {
    onFormChange({ 
      review_text: value, 
      errors: { ...formState.errors, review_text: undefined } 
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  const getReviewTypeLabel = () => {
    if (!reviewType) return ''
    
    switch (reviewType) {
      case 'guest_to_host':
        return t('review.reviewType.guestToHost')
      case 'host_to_guest':
        return t('review.reviewType.hostToGuest')
      case 'property':
        return t('review.reviewType.property')
      default:
        return reviewType
    }
  }

  const isFormValid = formState.rating > 0 && formState.review_text.trim().length >= 10

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Review Type Display */}
      {reviewType && (
        <div className="bg-gray-50 rounded-lg p-3">
          <span className="text-sm font-medium text-gray-700">
            {t('review.reviewType.title')}: {getReviewTypeLabel()}
          </span>
        </div>
      )}

      {/* Rating Section */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          {t('review.rating.title')} *
        </label>
        
        <StarRating
          rating={formState.rating}
          onRatingChange={handleRatingChange}
          size="lg"
          showLabel={true}
        />
        
        {formState.errors.rating && (
          <p className="text-sm text-red-600">{formState.errors.rating}</p>
        )}
      </div>

      {/* Review Text Section */}
      <div className="space-y-3">
        <label htmlFor="review-text" className="block text-sm font-medium text-gray-700">
          {t('review.reviewText.label')} *
        </label>
        
        <Textarea
          id="review-text"
          value={formState.review_text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={t('review.reviewText.placeholder')}
          minLength={10}
          maxLength={1000}
          rows={4}
          className="w-full"
          isInvalid={!!formState.errors.review_text}
          errorMessage={formState.errors.review_text}
          description={`${formState.review_text.length}/1000 ${t('review.reviewText.charCount', { count: formState.review_text.length })}`}
        />
      </div>

      {/* Character Count and Validation */}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>
          {formState.review_text.length < 10 && (
            <span className="text-red-600">
              {t('review.reviewText.minLength')}
            </span>
          )}
        </span>
        <span>
          {formState.review_text.length}/1000
        </span>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          color="primary"
          isLoading={formState.isSubmitting}
          disabled={!isFormValid || formState.isSubmitting}
          className="flex-1"
        >
          {mode === 'create' 
            ? t('common.buttons.submitReview')
            : t('common.buttons.saveReview')
          }
        </Button>
        
        <Button
          type="button"
          variant="bordered"
          onPress={onCancel}
          disabled={formState.isSubmitting}
          className="flex-1"
        >
          {t('common.buttons.cancelReview')}
        </Button>
      </div>

      {/* General Error Display */}
      {formState.errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{formState.errors.general}</p>
        </div>
      )}
    </form>
  )
}

export default ReviewForm
