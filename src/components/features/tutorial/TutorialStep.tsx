import React, { useState } from 'react'
import React, { useState } from 'react'
import { useTranslation } from '../../../lib/stores/translationStore'
import { TUTORIAL_STEPS } from '../../../lib/stores/tutorialStore'

interface TutorialStepProps {
  stepNumber: number
  className?: string
}

const TutorialStep: React.FC<TutorialStepProps> = ({ stepNumber, className = '' }) => {
  const { t } = useTranslation('tutorial')
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  
  // Get step data (stepNumber is 1-indexed, array is 0-indexed)
  const step = TUTORIAL_STEPS[stepNumber - 1]
  
  if (!step) {
    console.warn(`TutorialStep: Invalid step number ${stepNumber}`)
    return null
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
    console.warn(`TutorialStep: Failed to load image for step ${stepNumber}:`, step.image)
  }

  // Fallback image when original fails to load
  const fallbackImage = '/images/tutorial/fallback-tutorial.svg'
  const imageToDisplay = imageError ? fallbackImage : step.image

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* Image Container */}
      <div className="relative mb-6 w-full max-w-md">
        {/* Loading Skeleton */}
        {imageLoading && (
          <div className="absolute inset-0 animate-pulse rounded-lg bg-gray-200" />
        )}
        
        {/* Main Image */}
        <img
          src={imageToDisplay}
          alt={t(step.imageAlt)}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`
            h-64 w-full rounded-lg object-cover shadow-lg transition-opacity duration-300
            ${imageLoading ? 'opacity-0' : 'opacity-100'}
            ${imageError ? 'border-2 border-dashed border-gray-300' : ''}
          `}
          loading="lazy"
        />
        
        {/* Error State Overlay */}
        {imageError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-gray-100">
            <svg 
              className="mb-2 h-12 w-12 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <span className="text-sm text-gray-500">{t('tutorial:errors.imageUnavailable')}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Title */}
        <h3 className="text-xl font-semibold text-main sm:text-2xl">
          {t(step.titleKey)}
        </h3>
        
        {/* Description */}
        <p className="max-w-md text-gray-600 leading-relaxed">
          {t(step.descriptionKey)}
        </p>
      </div>
      
      {/* Hidden content for screen readers */}
      <div className="sr-only">
        {t('tutorial:progress.step')} {stepNumber} {t('tutorial:progress.of')} {TUTORIAL_STEPS.length}{t('tutorial:progress.colon')} {t(step.titleKey)}
      </div>
    </div>
  )
}

export default TutorialStep