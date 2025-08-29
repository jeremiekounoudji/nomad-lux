export interface TutorialStep {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  highlightElement?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export interface TutorialContent {
  steps: TutorialStep[];
  totalSteps: number;
  title: string;
  description: string;
}

export interface TutorialState {
  isVisible: boolean;
  currentStep: number;
  isCompleted: boolean;
  neverShowAgain: boolean;
  hasBeenShown: boolean;
  startTime?: Date;
  completionTime?: Date;
}

export interface TutorialUserPreferences {
  hasCompletedTutorial: boolean;
  neverShowAgain: boolean;
  lastShownDate?: string;
  completionDate?: string;
  stepCompletionTimes?: Record<number, number>; // stepId -> completion time in seconds
}

export interface TutorialAnalytics {
  tutorialStarted: boolean;
  tutorialCompleted: boolean;
  tutorialSkipped: boolean;
  stepVisits: Record<number, number>; // stepId -> visit count
  timeSpentOnSteps: Record<number, number>; // stepId -> time spent in seconds
  totalTimeSpent: number; // total time spent in tutorial in seconds
}

export interface TutorialConfig {
  autoStart: boolean;
  showProgress: boolean;
  allowSkip: boolean;
  allowClose: boolean;
  showNeverShowAgain: boolean;
  keyboardNavigation: boolean;
  analyticsEnabled: boolean;
}

export interface TutorialEvent {
  type: 'start' | 'step_complete' | 'step_skip' | 'complete' | 'skip' | 'close';
  stepId?: number;
  timestamp: Date;
  data?: Record<string, any>;
}
