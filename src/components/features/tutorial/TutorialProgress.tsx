import React from 'react'
import React from 'react'
import { useTutorialStore } from '../../../lib/stores/tutorialStore'
import { useTranslation } from '../../../lib/stores/translationStore'

interface TutorialProgressProps {
  className?: string
}

const TutorialProgress: React.FC<TutorialProgressProps> = ({ className = '' }) => {
  const { t } = useTranslation('tutorial')
  const { currentStep, totalSteps, goToStep } = useTutorialStore()

  const handleStepClick = (step: number) => {
    goToStep(step)
  }

  const handleKeyDown = (event: React.KeyboardEvent, step: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      goToStep(step)
    }
  }

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const step = index + 1
        const isActive = step === currentStep
        const isCompleted = step < currentStep
        
        return (
          <button
            key={step}
            onClick={() => handleStepClick(step)}
            onKeyDown={(e) => handleKeyDown(e, step)}
            className={`
              relative flex h-3 w-3 items-center justify-center rounded-full 
              transition-all duration-300 ease-in-out focus:outline-none 
              focus:ring-2 focus:ring-main/50 focus:ring-offset-2
              ${isActive 
                ? 'bg-main scale-125 ring-2 ring-main/30' 
                : isCompleted 
                  ? 'bg-main/70 hover:bg-main/80' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }
            `}
            aria-label={t('navigation.stepOf', { current: step, total: totalSteps })}
            aria-current={isActive ? 'step' : undefined}
            tabIndex={0}
          >
            {/* Active step indicator */}
            {isActive && (
              <div className="absolute inset-0 animate-pulse rounded-full bg-main" />
            )}
            
            {/* Completed step checkmark */}
            {isCompleted && (
              <svg 
                className="h-2 w-2 text-white" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                  clipRule="evenodd" 
                />
              </svg>
            )}
          </button>
        )
      })}
      
      {/* Screen reader only text for current progress */}
      <span className="sr-only">
        {t('navigation.stepOf', { current: currentStep, total: totalSteps })}
      </span>
    </div>
  )
}

export default TutorialProgress