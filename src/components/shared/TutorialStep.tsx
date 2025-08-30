import React, { useState } from 'react';
import { Card, CardBody, Image, Skeleton } from '@heroui/react';
import { useTranslation } from '../../lib/stores/translationStore';
import { TutorialStep as TutorialStepInterface } from '../../interfaces/Tutorial';

interface TutorialStepProps {
  step: TutorialStepInterface;
  stepNumber: number;
  totalSteps: number;
}

export const TutorialStep: React.FC<TutorialStepProps> = ({ step, stepNumber, totalSteps }) => {
  const { t } = useTranslation(['tutorial', 'common']);
  console.log('🎓 TutorialStep received:', {
    step,
    stepNumber,
    totalSteps,
    titleTranslation: t(`tutorial.${step.title}`),
    descTranslation: t(`tutorial.${step.description}`)
  });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  // Create dot indicators
  const renderDotIndicators = () => {
    return (
      <div className="mb-6 flex justify-center gap-2">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={`size-2 rounded-full transition-colors duration-200 ${
              index === stepNumber - 1 ? 'bg-main' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col text-center">
      {/* Step Image */}
      <Card className="mb-6 w-full overflow-hidden border-0 shadow-lg">
        <CardBody className="p-0">
          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Skeleton className="size-full rounded-none" />
              </div>
            )}

            {imageError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600">
                    <svg
                      className="size-8 text-gray-500 dark:text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('tutorial.image.error')}
                  </p>
                </div>
              </div>
            ) : (
              <Image
                src={step.imageUrl}
                alt={t(`tutorial.${step.imageAlt}`)}
                className={`size-full object-cover transition-opacity duration-300 ${
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

      {/* Dot Indicators */}
      {renderDotIndicators()}

      {/* Step Title */}
      <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
        {t(`tutorial.${step.title}`)}
      </h3>

      {/* Step Description */}
      <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
        {t(`tutorial.${step.description}`)}
      </p>

      {/* Highlight Element (if specified) */}
      {step.highlightElement && (
        <div className="mt-6 rounded-lg border border-main/20 bg-main/10 p-4">
          <p className="text-sm text-main dark:text-main">
            <strong>{t('tutorial.highlight')}</strong>
            <span className="ml-1">{step.highlightElement}</span>
          </p>
        </div>
      )}
    </div>
  );
};
