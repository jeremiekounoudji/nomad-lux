import React, { useRef, useEffect, useState } from 'react';
import {
  Modal,
  ModalContent,
  Button,
} from '@heroui/react';
import { X } from 'lucide-react';
import { useTranslation } from '../../lib/stores/translationStore';
import { useTutorial } from '../../hooks/useTutorial';
import { useTutorialAnalytics } from '../../utils/tutorialAnalytics';
import { TutorialStep } from '../../interfaces/Tutorial';

interface TutorialModalProps {
  steps: TutorialStep[];
  isOpen: boolean;
  onClose?: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ steps, isOpen, onClose }) => {
  const { t } = useTranslation(['tutorial', 'common']);
  const [imageError, setImageError] = useState(false);
  
  console.log('🎓 TutorialModal translation test:', {
    title: t('tutorial.title'),
    stepCounter: t('tutorial.stepCounter', { current: 1, total: 4 })
  });
  const {
    tutorialState,
    config,
    startTutorial,
    completeTutorial,
    skipTutorial,
    closeTutorial,
    nextStep,
    previousStep,
    getCurrentStep,
    isLastStep,
    isFirstStep,
  } = useTutorial();

  const {
    trackTutorialStarted,
    trackStepCompleted,
    trackTutorialSkipped,
    trackTutorialFinished,
  } = useTutorialAnalytics();

  const modalRef = useRef<HTMLDivElement>(null);

  console.log('🎓 TutorialModal: Rendering', {
    isOpen,
    currentStep: tutorialState.currentStep,
    totalSteps: steps.length,
    timestamp: new Date().toISOString(),
  });

  // Auto-start tutorial when modal opens
  useEffect(() => {
    if (isOpen && !tutorialState.isVisible) {
      console.log('🎓 TutorialModal: Auto-starting tutorial');
      startTutorial();
      trackTutorialStarted(steps.length);
    }
  }, [isOpen, tutorialState.isVisible, startTutorial, trackTutorialStarted, steps.length]);

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [isOpen, tutorialState.currentStep]);

  const currentStep = getCurrentStep(steps);
  console.log('🎓 TutorialModal currentStep:', currentStep);
  const isLast = isLastStep(steps.length);
  const isFirst = isFirstStep();

  const handleNext = () => {
    console.log('🎓 TutorialModal: Next button clicked');
    if (isLast) {
      completeTutorial();
      trackTutorialFinished(steps.length);
    } else {
      const currentStep = getCurrentStep(steps);
      trackStepCompleted(
        tutorialState.currentStep,
        currentStep?.title || '',
        tutorialState.currentStep + 1,
        steps.length
      );
      nextStep();
    }
  };

  const handlePrevious = () => {
    console.log('🎓 TutorialModal: Previous button clicked');
    previousStep();
  };

  const handleSkip = () => {
    console.log('🎓 TutorialModal: Skip button clicked');
    trackTutorialSkipped(tutorialState.currentStep + 1, steps.length);
    skipTutorial();
  };

  const handleClose = () => {
    console.log('🎓 TutorialModal: Close button clicked');
    closeTutorial();
    onClose?.();
  };

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      scrollBehavior="inside"
      classNames={{
        base: "bg-black/60 backdrop-blur-sm",
        wrapper: "p-4",
        body: "p-0"
      }}
      aria-labelledby="tutorial-title"
      role="dialog"
    >
      <ModalContent>
        <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden max-w-md mx-auto">
          {/* Close Button */}
          <div className="flex justify-end p-4 pb-0">
            <Button
              isIconOnly
              variant="light"
              color="default"
              size="sm"
              onPress={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="size-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            {currentStep ? (
              <>
                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {t(`tutorial.${currentStep.title}`)}
                </h2>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  {t(`tutorial.${currentStep.description}`)}
                </p>

                {/* Tutorial Image */}
                <div className="mb-6">
                  <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    {imageError ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <svg className="size-12 text-gray-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                          <p className="text-sm text-gray-500">{t('tutorial.image.error')}</p>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={currentStep.imageUrl}
                        alt={t(`tutorial.${currentStep.imageAlt}`)}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    )}
                  </div>
                </div>

                {/* Step Progress Dots */}
                <div className="flex justify-center gap-2 mb-6">
                  {Array.from({ length: steps.length }, (_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                        index === tutorialState.currentStep
                          ? 'bg-main'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Step Counter */}
                <div className="text-center mb-6">
                  <span className="text-sm font-medium text-main">
                    {t('tutorial.stepCounter', {
                      current: tutorialState.currentStep + 1,
                      total: steps.length
                    })}
                  </span>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-3">
                  {!isFirst && (
                    <Button
                      variant="bordered"
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                      onPress={handlePrevious}
                    >
                      {t('tutorial.actions.previous')}
                    </Button>
                  )}
                  
                  <Button
                    className={`flex-1 bg-main hover:bg-main/90 text-white ${
                      isFirst ? 'ml-0' : ''
                    }`}
                    onPress={handleNext}
                  >
                    {isLast ? t('tutorial.actions.finish') : t('tutorial.actions.next')}
                  </Button>
                </div>

                {/* Skip Option */}
                {config.allowSkip && (
                  <div className="text-center mt-4">
                    <Button
                      variant="light"
                      size="sm"
                      onPress={handleSkip}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {t('tutorial.actions.skip')}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-red-500">{t('tutorial.errors.noCurrentStep', 'No current step found!')}</p>
              </div>
            )}
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};
