import React, { useEffect, useRef } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Checkbox,
  Divider
} from '@heroui/react'
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react'
import { useTranslation } from '../../lib/stores/translationStore'
import { useTutorial } from '../../hooks/useTutorial'
import { TutorialStep } from '../../interfaces/Tutorial'
import { TutorialStep as TutorialStepComponent } from './TutorialStep'
import { TutorialProgress } from './TutorialProgress'

interface TutorialModalProps {
  steps: TutorialStep[]
  isOpen: boolean
  onClose?: () => void
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  steps,
  isOpen,
  onClose
}) => {
  const { t } = useTranslation(['tutorial', 'common'])
  const {
    tutorialState,
    config,
    startTutorial,
    completeTutorial,
    skipTutorial,
    closeTutorial,
    nextStep,
    previousStep,
    setNeverShowAgain,
    getCurrentStep,
    isLastStep,
    isFirstStep,
    getProgressPercentage
  } = useTutorial()

  const modalRef = useRef<HTMLDivElement>(null)

  console.log('🎓 TutorialModal: Rendering', {
    isOpen,
    currentStep: tutorialState.currentStep,
    totalSteps: steps.length,
    timestamp: new Date().toISOString()
  })

  // Auto-start tutorial when modal opens
  useEffect(() => {
    if (isOpen && !tutorialState.isVisible) {
      console.log('🎓 TutorialModal: Auto-starting tutorial')
      startTutorial()
    }
  }, [isOpen, tutorialState.isVisible, startTutorial])

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusableElements.length > 0) {
        ;(focusableElements[0] as HTMLElement).focus()
      }
    }
  }, [isOpen, tutorialState.currentStep])

  const currentStep = getCurrentStep(steps)
  const progressPercentage = getProgressPercentage(steps.length)
  const isLast = isLastStep(steps.length)
  const isFirst = isFirstStep()

  const handleNext = () => {
    console.log('🎓 TutorialModal: Next button clicked')
    if (isLast) {
      completeTutorial()
    } else {
      nextStep()
    }
  }

  const handlePrevious = () => {
    console.log('🎓 TutorialModal: Previous button clicked')
    previousStep()
  }

  const handleSkip = () => {
    console.log('🎓 TutorialModal: Skip button clicked')
    skipTutorial()
  }

  const handleClose = () => {
    console.log('🎓 TutorialModal: Close button clicked')
    closeTutorial()
    onClose?.()
  }

  const handleNeverShowAgainChange = (checked: boolean) => {
    console.log('🎓 TutorialModal: Never show again changed:', checked)
    setNeverShowAgain(checked)
  }

  // Don't render if not open
  if (!isOpen) {
    return null
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="full"
      scrollBehavior="inside"
      classNames={{
        base: "bg-black/80 backdrop-blur-sm",
        wrapper: "p-0",
        body: "p-0"
      }}
      aria-labelledby="tutorial-title"
      aria-describedby="tutorial-description"
      role="dialog"
    >
      <ModalContent ref={modalRef}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          {/* Header */}
          <ModalHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <h2 
                id="tutorial-title"
                className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"
              >
                {t('tutorial.title', 'Welcome to Nomad Lux')}
              </h2>
              <span 
                id="tutorial-description"
                className="text-sm text-gray-600 dark:text-gray-400"
                aria-live="polite"
              >
                {t('tutorial.stepCounter', 'Step {{current}} of {{total}}', {
                  current: tutorialState.currentStep + 1,
                  total: steps.length
                })}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {config.allowSkip && (
                <Button
                  variant="light"
                  color="default"
                  size="sm"
                  onPress={handleSkip}
                  startContent={<SkipForward className="w-4 h-4" />}
                  className="text-gray-600 dark:text-gray-400"
                >
                  {t('tutorial.actions.skip', 'Skip')}
                </Button>
              )}
              
              {config.allowClose && (
                <Button
                  isIconOnly
                  variant="light"
                  color="default"
                  size="sm"
                  onPress={handleClose}
                  className="text-gray-600 dark:text-gray-400"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
          </ModalHeader>

          {/* Progress Bar */}
          {config.showProgress && (
            <div className="px-6 py-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
              <TutorialProgress
                currentStep={tutorialState.currentStep}
                totalSteps={steps.length}
                percentage={progressPercentage}
              />
            </div>
          )}

          {/* Content */}
          <ModalBody className="flex-1 p-0">
            <div className="flex flex-col h-full">
                        {/* Step Content */}
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
            {currentStep && (
              <TutorialStepComponent
                step={currentStep}
                stepNumber={tutorialState.currentStep + 1}
                totalSteps={steps.length}
              />
            )}
          </div>

              {/* Navigation Footer */}
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  {/* Never Show Again Checkbox */}
                  {config.showNeverShowAgain && (
                    <div className="mb-4">
                      <Checkbox
                        isSelected={tutorialState.neverShowAgain}
                        onValueChange={handleNeverShowAgainChange}
                        color="primary"
                        size="sm"
                      >
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {t('tutorial.preferences.neverShowAgain', 'Don\'t show this tutorial again')}
                        </span>
                      </Checkbox>
                    </div>
                  )}

                  <Divider className="mb-4" />

                  {/* Navigation Buttons */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex gap-2">
                      {!isFirst && (
                        <Button
                          variant="bordered"
                          color="primary"
                          size="md"
                          sm="lg"
                          onPress={handlePrevious}
                          startContent={<ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />}
                          className="w-full sm:w-auto"
                          aria-label={t('tutorial.actions.previousAria', 'Go to previous step')}
                        >
                          {t('tutorial.actions.previous', 'Previous')}
                        </Button>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      {config.allowSkip && !isLast && (
                        <Button
                          variant="light"
                          color="default"
                          size="md"
                          sm="lg"
                          onPress={handleSkip}
                          className="w-full sm:w-auto"
                        >
                          {t('tutorial.actions.skip', 'Skip Tutorial')}
                        </Button>
                      )}
                      
                      <Button
                        color="primary"
                        size="md"
                        sm="lg"
                        onPress={handleNext}
                        endContent={!isLast ? <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" /> : undefined}
                        className="w-full sm:w-auto"
                        aria-label={isLast 
                          ? t('tutorial.actions.finishAria', 'Complete tutorial')
                          : t('tutorial.actions.nextAria', 'Go to next step')
                        }
                      >
                        {isLast 
                          ? t('tutorial.actions.finish', 'Finish Tutorial')
                          : t('tutorial.actions.next', 'Next')
                        }
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
        </div>
      </ModalContent>
    </Modal>
  )
}
