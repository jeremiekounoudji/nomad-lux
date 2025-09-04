import React, { useState, useEffect, useRef } from 'react';
import { Modal, ModalContent, Button, Checkbox } from '@heroui/react';
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
  const [neverShowAgain, setNeverShowAgainLocal] = useState(false);

  console.log('🎓 TutorialModal translation test:', {
    title: t('tutorial.title'),
    stepCounter: t('tutorial.stepCounter', { current: 1, total: 4 }),
  });
  const {
    tutorialState,
    config,
    startTutorial,
    completeTutorial,
    closeTutorial,
    nextStep,
    previousStep,
    getCurrentStep,
    isLastStep,
    isFirstStep,
    setNeverShowAgain,
  } = useTutorial();

  const { trackTutorialStarted, trackStepCompleted, trackTutorialFinished } =
    useTutorialAnalytics();

  const modalRef = useRef<HTMLDivElement>(null);

  console.log('🎓 TutorialModal: Rendering', {
    isOpen,
    currentStep: tutorialState.currentStep,
    totalSteps: steps.length,
    timestamp: new Date().toISOString(),
  });

  // Auto-start tutorial when modal opens
  useEffect(() => {
    if (isOpen && !tutorialState.isVisible && !tutorialState.isCompleted) {
      console.log('🎓 TutorialModal: Auto-starting tutorial');
      startTutorial();
      trackTutorialStarted(steps.length);
    }
  }, [isOpen, tutorialState.isVisible, tutorialState.isCompleted, startTutorial, trackTutorialStarted, steps.length]);

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
      if (neverShowAgain) {
        console.log('🎓 Setting never show again preference on completion');
      }
      // Close the modal first, then complete the tutorial
      onClose?.();
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
      aria-labelledby="tutorial-title"
      role="dialog"
    >
      <ModalContent>
        <div className="mx-auto flex min-h-[510px] w-full max-w-md flex-col overflow-auto rounded-xl bg-white dark:bg-gray-900">
          {/* Close Button */}

          {/* Content */}
          <div className="m-5 flex flex-1 flex-col justify-between px-2 pb-6">
            {currentStep ? (
              <>
                {/* Title */}
                <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
                  {t(`tutorial.${currentStep.title}`)}
                </h2>

                {/* Description */}
                <p className="mb-6 leading-relaxed text-gray-600 dark:text-gray-400">
                  {t(`tutorial.${currentStep.description}`)}
                </p>

                {/* Tutorial Image - Fixed Height */}
                <div className="mb-6">
                  <div className="relative h-48 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                    {imageError ? (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                          <svg
                            className="mx-auto mb-2 size-12 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="text-sm text-gray-500">{t('tutorial.image.error')}</p>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={currentStep.imageUrl}
                        alt={t(`tutorial.${currentStep.imageAlt}`)}
                        className="size-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    )}
                  </div>
                </div>

                {/* Step Progress Dots */}
                <div className="mb-6 flex justify-center gap-2">
                  {Array.from({ length: steps.length }, (_, index) => (
                    <div
                      key={index}
                      className={`size-2 rounded-full transition-colors duration-200 ${
                        index === tutorialState.currentStep
                          ? 'bg-main'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Never Show Again Checkbox */}
                {config.showNeverShowAgain && (
                  <div className="mb-4 flex items-center justify-center">
                    <Checkbox
                      isSelected={neverShowAgain}
                      onValueChange={(checked) => {
                        setNeverShowAgainLocal(checked);
                        setNeverShowAgain(checked);
                      }}
                      size="sm"
                      className="text-sm text-gray-600 dark:text-gray-400"
                    >
                      {t('tutorial.preferences.neverShowAgain')}
                    </Checkbox>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="mt-auto flex gap-3">
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
                    className={`flex-1 bg-main text-white hover:bg-main/90 ${
                      isFirst ? 'ml-0' : ''
                    }`}
                    onPress={handleNext}
                  >
                    {isLast ? t('tutorial.actions.finish') : t('tutorial.actions.next')}
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="text-red-500">
                  {t('tutorial.errors.noCurrentStep', 'No current step found!')}
                </p>
              </div>
            )}
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};
