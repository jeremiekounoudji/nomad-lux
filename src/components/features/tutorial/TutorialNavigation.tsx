import React from 'react';
import { Button } from '@heroui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTutorialStore } from '../../../lib/stores/tutorialStore';
import { useTranslation } from '../../../lib/stores/translationStore';

interface TutorialNavigationProps {
  className?: string;
  onGetStarted?: () => void;
}

const TutorialNavigation: React.FC<TutorialNavigationProps> = ({
  className = '',
  onGetStarted,
}) => {
  const { t } = useTranslation('tutorial');
  const { nextStep, previousStep, completeTutorial, tutorialState } = useTutorialStore();

  // Total steps - this should come from your tutorial configuration
  const totalSteps = 4; // Adjust based on your actual tutorial steps

  // Derive navigation state from tutorial state
  const canGoPrevious = () => tutorialState.currentStep > 0;
  const canGoNext = () => tutorialState.currentStep < totalSteps - 1;
  const isLastStep = () => tutorialState.currentStep === totalSteps - 1;

  const handlePrevious = () => {
    if (canGoPrevious()) {
      previousStep();
    }
  };

  const handleNext = () => {
    if (canGoNext()) {
      nextStep();
    }
  };

  const handleGetStarted = () => {
    completeTutorial();
    if (onGetStarted) {
      onGetStarted();
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent,
    action: 'previous' | 'next' | 'getStarted'
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      switch (action) {
        case 'previous':
          handlePrevious();
          break;
        case 'next':
          handleNext();
          break;
        case 'getStarted':
          handleGetStarted();
          break;
      }
    }
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Previous Button */}
      <Button
        variant="ghost"
        size="lg"
        startContent={<ChevronLeft className="size-5" />}
        onClick={handlePrevious}
        onKeyDown={(e) => handleKeyDown(e, 'previous')}
        isDisabled={!canGoPrevious()}
        className={`
          text-gray-600 transition-all duration-200 hover:bg-main/10 hover:text-main
          ${!canGoPrevious() ? 'invisible' : 'visible'}
        `}
        aria-label={t('navigation.previous')}
      >
        {t('navigation.previous')}
      </Button>

      {/* Next/Get Started Button */}
      {isLastStep() ? (
        <Button
          color="primary"
          size="lg"
          onClick={handleGetStarted}
          onKeyDown={(e) => handleKeyDown(e, 'getStarted')}
          className="min-w-32 bg-main font-semibold text-white hover:bg-main/90"
          aria-label={t('navigation.getStarted')}
        >
          {t('navigation.getStarted')}
        </Button>
      ) : (
        <Button
          color="primary"
          variant="flat"
          size="lg"
          endContent={<ChevronRight className="size-5" />}
          onClick={handleNext}
          onKeyDown={(e) => handleKeyDown(e, 'next')}
          isDisabled={!canGoNext()}
          className="min-w-32 border-main/20 bg-main/10 font-semibold text-main hover:bg-main/20"
          aria-label={t('navigation.next')}
        >
          {t('navigation.next')}
        </Button>
      )}
    </div>
  );
};

export default TutorialNavigation;
