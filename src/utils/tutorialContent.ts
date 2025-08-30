import { TutorialStep, TutorialContent } from '../interfaces/Tutorial';

/**
 * Tutorial content configuration for Nomad Lux
 * Contains all tutorial steps with their content, images, and instructions
 */
export const tutorialContent: TutorialContent = {
  title: 'tutorial.title',
  description: 'tutorial.description',
  totalSteps: 4,
  steps: [
    {
      id: 0,
      title: 'steps.bookingProperties.title',
      description: 'steps.bookingProperties.description',
      imageUrl: '/src/assets/tutorial/steps/step1-booking-properties.svg',
      imageAlt: 'steps.bookingProperties.imageAlt',
      highlightElement: '.property-card .book-now-button',
      position: 'center',
    },
    {
      id: 1,
      title: 'steps.propertyCreation.title',
      description: 'steps.propertyCreation.description',
      imageUrl: '/src/assets/tutorial/steps/step2-property-creation.svg',
      imageAlt: 'steps.propertyCreation.imageAlt',
      highlightElement: '.property-form .submit-button',
      position: 'center',
    },
    {
      id: 2,
      title: 'steps.managingSelfBookings.title',
      description: 'steps.managingSelfBookings.description',
      imageUrl: '/src/assets/tutorial/steps/step3-managing-self-bookings.svg',
      imageAlt: 'steps.managingSelfBookings.imageAlt',
      highlightElement: '.booking-dashboard .manage-buttons',
      position: 'center',
    },
    {
      id: 3,
      title: 'steps.bookingRequests.title',
      description: 'steps.bookingRequests.description',
      imageUrl: '/src/assets/tutorial/steps/step4-booking-requests.svg',
      imageAlt: 'steps.bookingRequests.imageAlt',
      highlightElement: '.booking-requests .action-buttons',
      position: 'center',
    },
  ],
};

/**
 * Get tutorial step by ID
 * @param stepId - The ID of the tutorial step
 * @returns The tutorial step or null if not found
 */
export const getTutorialStep = (stepId: number): TutorialStep | null => {
  return tutorialContent.steps.find((step) => step.id === stepId) || null;
};

/**
 * Get all tutorial steps
 * @returns Array of all tutorial steps
 */
export const getAllTutorialSteps = (): TutorialStep[] => {
  return tutorialContent.steps;
};

/**
 * Get tutorial content configuration
 * @returns The complete tutorial content configuration
 */
export const getTutorialContent = (): TutorialContent => {
  return tutorialContent;
};

/**
 * Validate tutorial step data
 * @param step - The tutorial step to validate
 * @returns True if valid, false otherwise
 */
export const validateTutorialStep = (step: TutorialStep): boolean => {
  return !!(step.id >= 0 && step.title && step.description && step.imageUrl && step.imageAlt);
};

/**
 * Get step position class for CSS
 * @param position - The position string
 * @returns CSS class for positioning
 */
export const getStepPositionClass = (position?: string): string => {
  switch (position) {
    case 'top':
      return 'items-start';
    case 'bottom':
      return 'items-end';
    case 'left':
      return 'justify-start';
    case 'right':
      return 'justify-end';
    case 'center':
    default:
      return 'items-center justify-center';
  }
};

/**
 * Get tutorial progress percentage
 * @param currentStep - Current step index
 * @param totalSteps - Total number of steps
 * @returns Progress percentage (0-100)
 */
export const getTutorialProgress = (currentStep: number, totalSteps: number): number => {
  if (totalSteps === 0) return 0;
  return Math.round(((currentStep + 1) / totalSteps) * 100);
};

/**
 * Check if step is the last step
 * @param stepId - Current step ID
 * @param totalSteps - Total number of steps
 * @returns True if last step, false otherwise
 */
export const isLastStep = (stepId: number, totalSteps: number): boolean => {
  return stepId === totalSteps - 1;
};

/**
 * Check if step is the first step
 * @param stepId - Current step ID
 * @returns True if first step, false otherwise
 */
export const isFirstStep = (stepId: number): boolean => {
  return stepId === 0;
};

/**
 * Get next step ID
 * @param currentStepId - Current step ID
 * @param totalSteps - Total number of steps
 * @returns Next step ID or null if at last step
 */
export const getNextStepId = (currentStepId: number, totalSteps: number): number | null => {
  const nextId = currentStepId + 1;
  return nextId < totalSteps ? nextId : null;
};

/**
 * Get previous step ID
 * @param currentStepId - Current step ID
 * @returns Previous step ID or null if at first step
 */
export const getPreviousStepId = (currentStepId: number): number | null => {
  const prevId = currentStepId - 1;
  return prevId >= 0 ? prevId : null;
};

/**
 * Get step navigation info
 * @param currentStepId - Current step ID
 * @param totalSteps - Total number of steps
 * @returns Navigation information object
 */
export const getStepNavigationInfo = (currentStepId: number, totalSteps: number) => {
  return {
    currentStep: currentStepId,
    totalSteps,
    isFirst: isFirstStep(currentStepId),
    isLast: isLastStep(currentStepId, totalSteps),
    hasNext: getNextStepId(currentStepId, totalSteps) !== null,
    hasPrevious: getPreviousStepId(currentStepId) !== null,
    progress: getTutorialProgress(currentStepId, totalSteps),
    nextStepId: getNextStepId(currentStepId, totalSteps),
    previousStepId: getPreviousStepId(currentStepId),
  };
};
