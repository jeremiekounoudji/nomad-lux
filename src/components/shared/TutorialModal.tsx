import React, { useRef, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Checkbox,
  Divider,
} from '@heroui/react';
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { useTranslation } from '../../lib/stores/translationStore';
import { useTutorial } from '../../hooks/useTutorial';
import { useTutorialAnalytics } from '../../utils/tutorialAnalytics';
import { TutorialStep } from '../../interfaces/Tutorial';
import { TutorialStep as TutorialStepComponent } from './TutorialStep';

interface TutorialModalProps {
  steps: TutorialStep[];
  isOpen: boolean;
  onClose?: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ steps, isOpen, onClose }) => {
  const { t } = useTranslation(['tutorial', 'common']);
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
    setNeverShowAgain,
    getCurrentStep,
    isLastStep,
    isFirstStep,
  } = useTutorial();

  const {
    trackTutorialStarted,
    trackStepCompleted,
    trackTutorialSkipped,
    trackTutorialFinished,
    trackNeverShowAgain,
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

  const handleNeverShowAgainChange = (checked: boolean) => {
    console.log('🎓 TutorialModal: Never show again changed:', checked);
    setNeverShowAgain(checked);
    if (checked) {
      trackNeverShowAgain();
    }
  };

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        base: 'bg-black/60 backdrop-blur-sm',
        wrapper: 'p-4',
        body: 'p-0',
      }}
      aria-labelledby="tutorial-title"
      aria-describedby="tutorial-description"
      role="dialog"
    >
      <ModalContent>
        <div className="overflow-hidden rounded-xl bg-white dark:bg-gray-800">
          {/* Header */}
          <ModalHeader className="flex items-center justify-between border-b border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-4">
              <h2 id="tutorial-title" className="text-xl font-bold text-gray-900 dark:text-white">
                {t('tutorial.title')}
              </h2>
              <span
                id="tutorial-description"
                className="text-sm text-gray-600 dark:text-gray-400"
                aria-live="polite"
              >
                {t('tutorial.stepCounter', {
                  current: tutorialState.currentStep + 1,
                  total: steps.length,
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
                  startContent={<SkipForward className="size-4" />}
                  className="text-gray-600 hover:text-main dark:text-gray-400"
                >
                  {t('tutorial.actions.skip')}
                </Button>
              )}

              {config.allowClose && (
                <Button
                  isIconOnly
                  variant="light"
                  color="default"
                  size="sm"
                  onPress={handleClose}
                  className="text-gray-600 hover:text-main dark:text-gray-400"
                >
                  <X className="size-5" />
                </Button>
              )}
            </div>
          </ModalHeader>

          {/* Content */}
          <ModalBody className="p-6">
            {currentStep ? (
              <TutorialStepComponent
                step={currentStep}
                stepNumber={tutorialState.currentStep + 1}
                totalSteps={steps.length}
              />
            ) : (
              <div className="text-red-500">No current step found!</div>
            )}
          </ModalBody>

          {/* Navigation Footer */}
          <div className="border-t border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
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
                    {t('tutorial.preferences.neverShowAgain')}
                  </span>
                </Checkbox>
              </div>
            )}

            <Divider className="mb-4" />

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {!isFirst && (
                  <Button
                    variant="bordered"
                    color="primary"
                    size="md"
                    onPress={handlePrevious}
                    startContent={<ChevronLeft className="size-4" />}
                    className="border-main text-main hover:bg-main hover:text-white"
                    aria-label={t('tutorial.actions.previousAria')}
                  >
                    {t('tutorial.actions.previous')}
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                {config.allowSkip && !isLast && (
                  <Button
                    variant="light"
                    color="default"
                    size="md"
                    onPress={handleSkip}
                    className="text-gray-600 hover:text-main"
                  >
                    {t('tutorial.actions.skip')}
                  </Button>
                )}

                <Button
                  color="primary"
                  size="md"
                  onPress={handleNext}
                  endContent={!isLast ? <ChevronRight className="size-4" /> : undefined}
                  className="bg-main text-white hover:bg-main/90"
                  aria-label={
                    isLast ? t('tutorial.actions.finishAria') : t('tutorial.actions.nextAria')
                  }
                >
                  {isLast ? t('tutorial.actions.finish') : t('tutorial.actions.next')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};
