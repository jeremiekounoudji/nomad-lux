import React from 'react'
import { Progress, Button } from '@heroui/react'
import { useTranslation } from '../../lib/stores/translationStore'

interface TutorialProgressProps {
  currentStep: number
  totalSteps: number
  percentage: number
  onStepClick?: (stepIndex: number) => void
  showDots?: boolean
  showProgressBar?: boolean
  showStepButtons?: boolean
}

export const TutorialProgress: React.FC<TutorialProgressProps> = ({
  currentStep,
  totalSteps,
  percentage,
  onStepClick,
  showDots = true,
  showProgressBar = true,
  showStepButtons = false
}) => {
  const { t } = useTranslation(['tutorial', 'common'])

  console.log('🎓 TutorialProgress: Rendering', {
    currentStep,
    totalSteps,
    percentage,
    timestamp: new Date().toISOString()
  })

  const handleStepClick = (stepIndex: number) => {
    if (onStepClick && stepIndex !== currentStep) {
      console.log('🎓 TutorialProgress: Step clicked:', stepIndex)
      onStepClick(stepIndex)
    }
  }

  const renderProgressBar = () => {
    if (!showProgressBar) return null

    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tutorial.progress.label', 'Progress')}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(percentage)}%
          </span>
        </div>
        <Progress
          value={percentage}
          color="primary"
          size="sm"
          className="w-full"
          aria-label={t('tutorial.progress.ariaLabel', 'Tutorial progress')}
        />
      </div>
    )
  }

  const renderDots = () => {
    if (!showDots) return null

    return (
      <div className="flex justify-center items-center gap-2">
        {Array.from({ length: totalSteps }, (_, index) => (
          <button
            key={index}
            onClick={() => handleStepClick(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              index === currentStep
                ? 'bg-primary-600 dark:bg-primary-400 scale-110'
                : index < currentStep
                ? 'bg-primary-300 dark:bg-primary-600 hover:bg-primary-400 dark:hover:bg-primary-500'
                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
            aria-label={t('tutorial.progress.stepAriaLabel', {
              step: index + 1
            })}
            disabled={!onStepClick}
          />
        ))}
      </div>
    )
  }

  const renderStepButtons = () => {
    if (!showStepButtons) return null

    return (
      <div className="flex justify-center items-center gap-2">
        {Array.from({ length: totalSteps }, (_, index) => (
          <Button
            key={index}
            size="sm"
            variant={index === currentStep ? 'solid' : 'bordered'}
            color={index === currentStep ? 'primary' : 'default'}
            onPress={() => handleStepClick(index)}
            className={`min-w-0 px-3 ${
              index === currentStep
                ? 'font-semibold'
                : index < currentStep
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
            disabled={!onStepClick}
          >
            {index + 1}
          </Button>
        ))}
      </div>
    )
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      <span className="font-medium">
        {t('tutorial.progress.stepIndicator', {
          current: currentStep + 1,
          total: totalSteps
        })}
      </span>
      <span className="text-xs">•</span>
      <span>
        {t('tutorial.progress.percentage', {
          percentage: Math.round(percentage)
        })}
      </span>
    </div>
  )

  return (
    <div className="w-full space-y-3">
      {/* Progress Bar */}
      {renderProgressBar()}

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Dots Navigation */}
      {renderDots()}

      {/* Step Buttons */}
      {renderStepButtons()}
    </div>
  )
}
