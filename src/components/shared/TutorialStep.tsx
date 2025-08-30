import React, { useState } from 'react'
import { Card, CardBody, Image, Skeleton } from '@heroui/react'
import { useTranslation } from '../../lib/stores/translationStore'
import { TutorialStep as TutorialStepInterface } from '../../interfaces/Tutorial'

interface TutorialStepProps {
  step: TutorialStepInterface
  stepNumber: number
  totalSteps: number
}

export const TutorialStep: React.FC<TutorialStepProps> = ({
  step,
  stepNumber,
  totalSteps
}) => {
  const { t } = useTranslation(['tutorial', 'common'])
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  console.log('🎓 TutorialStep: Rendering step', {
    stepId: step.id,
    stepNumber,
    totalSteps,
    timestamp: new Date().toISOString()
  })

  const handleImageLoad = () => {
    console.log('🎓 TutorialStep: Image loaded successfully')
    setImageLoaded(true)
    setImageError(false)
  }

  const handleImageError = () => {
    console.log('🎓 TutorialStep: Image failed to load')
    setImageError(true)
    setImageLoaded(false)
  }

  const getStepPosition = () => {
    switch (step.position) {
      case 'top':
        return 'items-start'
      case 'bottom':
        return 'items-end'
      case 'left':
        return 'justify-start'
      case 'right':
        return 'justify-end'
      case 'center':
      default:
        return 'items-center justify-center'
    }
  }

  return (
    <div className={`w-full max-w-4xl mx-auto flex flex-col ${getStepPosition()}`}>
      {/* Step Header */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 dark:bg-primary-900 rounded-full mb-3 sm:mb-4">
          <span className="text-base sm:text-lg font-bold text-primary-600 dark:text-primary-400">
            {stepNumber}
          </span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t(step.title)}
        </h3>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
          {t(step.description)}
        </p>
      </div>

      {/* Step Image */}
      <Card className="w-full max-w-3xl shadow-xl border-0 overflow-hidden">
        <CardBody className="p-0">
          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Skeleton className="w-full h-full rounded-none" />
              </div>
            )}
            
            {imageError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-gray-500 dark:text-gray-400">📷</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('tutorial.image.error', 'Image could not be loaded')}
                  </p>
                </div>
              </div>
            ) : (
              <Image
                src={step.imageUrl}
                alt={t(step.imageAlt)}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="eager"
                removeWrapper
              />
            )}
          </div>
        </CardBody>
      </Card>

      {/* Step Footer */}
      <div className="text-center mt-6">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>
            {t('tutorial.stepProgress', { current: stepNumber, total: totalSteps })}
          </span>
          <span>•</span>
          <span>
            {t('tutorial.stepId', { id: step.id })}
          </span>
        </div>
      </div>

      {/* Highlight Element (if specified) */}
      {step.highlightElement && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>{t('tutorial.highlight', 'Highlight:')}</strong>{' '}
            {step.highlightElement}
          </p>
        </div>
      )}
    </div>
  )
}
