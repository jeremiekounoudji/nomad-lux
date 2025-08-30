import React, { useEffect } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react'
import { X } from 'lucide-react'
import { useTutorialStore } from '../../../lib/stores/tutorialStore'
import { useTranslation } from '../../../lib/stores/translationStore'
import TutorialStep from './TutorialStep'
import TutorialProgress from './TutorialProgress'
import TutorialNavigation from './TutorialNavigation'

interface TutorialModalProps {
  onComplete?: () => void
  onSkip?: () => void
}

const TutorialModal: React.FC<TutorialModalProps> = ({ onComplete, onSkip }) => {
  const { t } = useTranslation('tutorial')
  const { 
    tutorialState, 
    completeTutorial,
    closeTutorial 
  } = useTutorialStore()
  
  const { isVisible, currentStep, isCompleted } = tutorialState

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        event.preventDefault()
        handleClose()
      }
    }

    if (isVisible) {
      document.addEventListener('keydown', handleEscapeKey)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
      document.body.style.overflow = 'unset'
    }
  }, [isVisible])

  // Auto-hide modal when tutorial is completed
  useEffect(() => {
    if (isCompleted && isVisible) {
      closeTutorial()
      if (onComplete) {
        onComplete()
      }
    }
  }, [isCompleted, isVisible, closeTutorial, onComplete])

  const handleClose = () => {
    closeTutorial()
    if (onSkip) {
      onSkip()
    }
  }

  const handleSkipTutorial = () => {
    completeTutorial()
    if (onSkip) {
      onSkip()
    }
  }

  const handleGetStarted = () => {
    if (onComplete) {
      onComplete()
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <Modal
      isOpen={isVisible}
      onClose={handleClose}
      size="2xl"
      placement="center"
      backdrop="blur"
      closeButton={false}
      isDismissable={false}
      hideCloseButton
      classNames={{
        base: "max-h-[90vh]",
        body: "p-6 sm:p-8",
        header: "border-b border-main/20 pb-4",
        footer: "border-t border-main/20 pt-4"
      }}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut"
            }
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn"
            }
          }
        }
      }}
    >
      <ModalContent>
        {() => (
          <>
            {/* Header */}
            <ModalHeader className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-main">
                  {t('modal.title')}
                </h2>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Skip Tutorial Button */}
                <Button
                  variant="light"
                  size="sm"
                  onClick={handleSkipTutorial}
                  className="text-gray-500 hover:text-main transition-colors"
                  aria-label={t('modal.skipTutorial')}
                >
                  {t('modal.skipTutorial')}
                </Button>
                
                {/* Close Button */}
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onClick={handleClose}
                  aria-label={t('modal.close')}
                  className="text-gray-400 hover:text-main transition-colors"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </ModalHeader>

            {/* Body */}
            <ModalBody>
              <div className="space-y-8">
                {/* Progress Indicators */}
                <TutorialProgress className="mb-6" />
                
                {/* Tutorial Step Content */}
                <TutorialStep 
                  stepNumber={currentStep}
                  className="min-h-[400px] flex flex-col justify-center"
                />
              </div>
            </ModalBody>

            {/* Footer */}
            <ModalFooter className="justify-center">
              <TutorialNavigation 
                onGetStarted={handleGetStarted}
                className="w-full max-w-md"
              />
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default TutorialModal