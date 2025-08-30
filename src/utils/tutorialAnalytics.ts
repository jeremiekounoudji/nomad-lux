import { useTranslation } from '../lib/stores/translationStore'

/**
 * Tutorial Analytics Event Types
 */
export type TutorialEventType = 
  | 'tutorial_started'
  | 'tutorial_step_completed'
  | 'tutorial_skipped'
  | 'tutorial_finished'
  | 'tutorial_never_show_again'

/**
 * Tutorial Analytics Event Data
 */
export interface TutorialAnalyticsEvent {
  eventType: TutorialEventType
  stepId?: number
  stepTitle?: string
  totalSteps?: number
  currentStep?: number
  timestamp: number
  userId?: string
}

/**
 * Tutorial Analytics Manager
 */
class TutorialAnalyticsManager {
  private events: TutorialAnalyticsEvent[] = []
  private sessionId: string

  constructor() {
    this.sessionId = `tutorial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Track tutorial start
   */
  trackTutorialStarted(totalSteps: number, userId?: string): void {
    const event: TutorialAnalyticsEvent = {
      eventType: 'tutorial_started',
      totalSteps,
      timestamp: Date.now(),
      userId,
    }
    this.logEvent(event)
  }

  /**
   * Track step completion
   */
  trackStepCompleted(stepId: number, stepTitle: string, currentStep: number, totalSteps: number, userId?: string): void {
    const event: TutorialAnalyticsEvent = {
      eventType: 'tutorial_step_completed',
      stepId,
      stepTitle,
      currentStep,
      totalSteps,
      timestamp: Date.now(),
      userId,
    }
    this.logEvent(event)
  }

  /**
   * Track tutorial skipped
   */
  trackTutorialSkipped(currentStep: number, totalSteps: number, userId?: string): void {
    const event: TutorialAnalyticsEvent = {
      eventType: 'tutorial_skipped',
      currentStep,
      totalSteps,
      timestamp: Date.now(),
      userId,
    }
    this.logEvent(event)
  }

  /**
   * Track tutorial finished
   */
  trackTutorialFinished(totalSteps: number, userId?: string): void {
    const event: TutorialAnalyticsEvent = {
      eventType: 'tutorial_finished',
      totalSteps,
      timestamp: Date.now(),
      userId,
    }
    this.logEvent(event)
  }

  /**
   * Track never show again preference
   */
  trackNeverShowAgain(userId?: string): void {
    const event: TutorialAnalyticsEvent = {
      eventType: 'tutorial_never_show_again',
      timestamp: Date.now(),
      userId,
    }
    this.logEvent(event)
  }

  /**
   * Log event to console for debugging
   */
  private logEvent(event: TutorialAnalyticsEvent): void {
    console.log('📊 Tutorial Analytics:', {
      event: event.eventType,
      stepId: event.stepId,
      stepTitle: event.stepTitle,
      currentStep: event.currentStep,
      totalSteps: event.totalSteps,
      sessionId: this.sessionId,
      timestamp: new Date(event.timestamp).toISOString()
    })
  }

  /**
   * Get analytics events for current session
   */
  getEvents(): TutorialAnalyticsEvent[] {
    return [...this.events]
  }

  /**
   * Reset analytics session
   */
  reset(): void {
    this.events = []
  }
}

// Create a singleton instance
export const tutorialAnalytics = new TutorialAnalyticsManager()

/**
 * React hook for tutorial analytics
 */
export const useTutorialAnalytics = () => {
  const { t } = useTranslation(['tutorial'])

  return {
    trackTutorialStarted: (totalSteps: number, userId?: string) => {
      tutorialAnalytics.trackTutorialStarted(totalSteps, userId)
      console.log('🎓', t('tutorial.analytics.started'))
    },

    trackStepCompleted: (stepId: number, stepTitle: string, currentStep: number, totalSteps: number, userId?: string) => {
      tutorialAnalytics.trackStepCompleted(stepId, stepTitle, currentStep, totalSteps, userId)
      console.log('🎓', t('tutorial.analytics.stepCompleted', { step: currentStep }))
    },

    trackTutorialSkipped: (currentStep: number, totalSteps: number, userId?: string) => {
      tutorialAnalytics.trackTutorialSkipped(currentStep, totalSteps, userId)
      console.log('🎓', t('tutorial.analytics.skipped'))
    },

    trackTutorialFinished: (totalSteps: number, userId?: string) => {
      tutorialAnalytics.trackTutorialFinished(totalSteps, userId)
      console.log('🎓', t('tutorial.analytics.finished'))
    },

    trackNeverShowAgain: (userId?: string) => {
      tutorialAnalytics.trackNeverShowAgain(userId)
      console.log('🎓', t('tutorial.analytics.neverShowAgain'))
    },

    getEvents: () => tutorialAnalytics.getEvents(),
    reset: () => tutorialAnalytics.reset()
  }
}
