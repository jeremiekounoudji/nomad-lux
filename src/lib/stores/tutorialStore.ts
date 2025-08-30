import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  TutorialState, 
  TutorialUserPreferences, 
  TutorialAnalytics, 
  TutorialConfig,
  TutorialEvent 
} from '../../interfaces/Tutorial'

interface TutorialStoreState {
  // State
  tutorialState: TutorialState
  userPreferences: TutorialUserPreferences
  analytics: TutorialAnalytics
  config: TutorialConfig
  events: TutorialEvent[]
  
  // Actions
  startTutorial: () => void
  completeTutorial: () => void
  skipTutorial: () => void
  closeTutorial: () => void
  nextStep: () => void
  previousStep: () => void
  goToStep: (stepId: number) => void
  setNeverShowAgain: (value: boolean) => void
  markStepComplete: (stepId: number, timeSpent: number) => void
  addEvent: (event: TutorialEvent) => void
  resetTutorial: () => void
  updateConfig: (config: Partial<TutorialConfig>) => void
}

const defaultConfig: TutorialConfig = {
  autoStart: true,
  showProgress: true,
  allowSkip: true,
  allowClose: true,
  showNeverShowAgain: true,
  keyboardNavigation: true,
  analyticsEnabled: true
}

const defaultUserPreferences: TutorialUserPreferences = {
  hasCompletedTutorial: false,
  neverShowAgain: false,
  stepCompletionTimes: {}
}

const defaultAnalytics: TutorialAnalytics = {
  tutorialStarted: false,
  tutorialCompleted: false,
  tutorialSkipped: false,
  stepVisits: {},
  timeSpentOnSteps: {},
  totalTimeSpent: 0
}

export const useTutorialStore = create<TutorialStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      tutorialState: {
        isVisible: false,
        currentStep: 0,
        isCompleted: false,
        neverShowAgain: false,
        hasBeenShown: false
      },
      userPreferences: defaultUserPreferences,
      analytics: defaultAnalytics,
      config: defaultConfig,
      events: [],

      // Actions
      startTutorial: () => {
        console.log('🏪 TutorialStore: Starting tutorial')
        const startTime = new Date()
        set((state) => ({
          tutorialState: {
            ...state.tutorialState,
            isVisible: true,
            currentStep: 0,
            startTime
          },
          analytics: {
            ...state.analytics,
            tutorialStarted: true,
            stepVisits: { ...state.analytics.stepVisits, 0: 1 }
          }
        }))
        
        // Add start event
        get().addEvent({
          type: 'start',
          timestamp: startTime
        })
      },

      completeTutorial: () => {
        console.log('🏪 TutorialStore: Completing tutorial')
        const completionTime = new Date()
        const { tutorialState } = get()
        const timeSpent = tutorialState.startTime 
          ? Math.floor((completionTime.getTime() - tutorialState.startTime.getTime()) / 1000)
          : 0

        set((state) => ({
          tutorialState: {
            ...state.tutorialState,
            isVisible: false,
            isCompleted: true,
            completionTime
          },
          userPreferences: {
            ...state.userPreferences,
            hasCompletedTutorial: true,
            completionDate: completionTime.toISOString()
          },
          analytics: {
            ...state.analytics,
            tutorialCompleted: true,
            totalTimeSpent: timeSpent
          }
        }))

        // Add completion event
        get().addEvent({
          type: 'complete',
          timestamp: completionTime,
          data: { timeSpent }
        })
      },

      skipTutorial: () => {
        console.log('🏪 TutorialStore: Skipping tutorial')
        const skipTime = new Date()
        const { tutorialState } = get()
        const timeSpent = tutorialState.startTime 
          ? Math.floor((skipTime.getTime() - tutorialState.startTime.getTime()) / 1000)
          : 0

        set((state) => ({
          tutorialState: {
            ...state.tutorialState,
            isVisible: false
          },
          analytics: {
            ...state.analytics,
            tutorialSkipped: true,
            totalTimeSpent: timeSpent
          }
        }))

        // Add skip event
        get().addEvent({
          type: 'skip',
          timestamp: skipTime,
          data: { timeSpent }
        })
      },

      closeTutorial: () => {
        console.log('🏪 TutorialStore: Closing tutorial')
        set((state) => ({
          tutorialState: {
            ...state.tutorialState,
            isVisible: false
          }
        }))

        // Add close event
        get().addEvent({
          type: 'close',
          timestamp: new Date()
        })
      },

      nextStep: () => {
        const { tutorialState /*, analytics*/ } = get()
        const nextStepId = tutorialState.currentStep + 1
        
        console.log('🏪 TutorialStore: Moving to next step:', nextStepId)
        
        set((state) => ({
          tutorialState: {
            ...state.tutorialState,
            currentStep: nextStepId
          },
          analytics: {
            ...state.analytics,
            stepVisits: {
              ...state.analytics.stepVisits,
              [nextStepId]: (state.analytics.stepVisits[nextStepId] || 0) + 1
            }
          }
        }))
      },

      previousStep: () => {
        const { tutorialState } = get()
        const prevStepId = Math.max(0, tutorialState.currentStep - 1)
        
        console.log('🏪 TutorialStore: Moving to previous step:', prevStepId)
        
        set((state) => ({
          tutorialState: {
            ...state.tutorialState,
            currentStep: prevStepId
          }
        }))
      },

      goToStep: (stepId: number) => {
        console.log('🏪 TutorialStore: Going to step:', stepId)
        set((state) => ({
          tutorialState: {
            ...state.tutorialState,
            currentStep: stepId
          },
          analytics: {
            ...state.analytics,
            stepVisits: {
              ...state.analytics.stepVisits,
              [stepId]: (state.analytics.stepVisits[stepId] || 0) + 1
            }
          }
        }))
      },

      setNeverShowAgain: (value: boolean) => {
        console.log('🏪 TutorialStore: Setting never show again:', value)
        set((state) => ({
          tutorialState: {
            ...state.tutorialState,
            neverShowAgain: value
          },
          userPreferences: {
            ...state.userPreferences,
            neverShowAgain: value
          }
        }))
      },

      markStepComplete: (stepId: number, timeSpent: number) => {
        console.log('🏪 TutorialStore: Marking step complete:', stepId, 'time:', timeSpent)
        set((state) => ({
          userPreferences: {
            ...state.userPreferences,
            stepCompletionTimes: {
              ...state.userPreferences.stepCompletionTimes,
              [stepId]: timeSpent
            }
          },
          analytics: {
            ...state.analytics,
            timeSpentOnSteps: {
              ...state.analytics.timeSpentOnSteps,
              [stepId]: timeSpent
            }
          }
        }))

        // Add step completion event
        get().addEvent({
          type: 'step_complete',
          stepId,
          timestamp: new Date(),
          data: { timeSpent }
        })
      },

      addEvent: (event: TutorialEvent) => {
        console.log('🏪 TutorialStore: Adding event:', event.type)
        set((state) => ({
          events: [...state.events, event]
        }))
      },

      resetTutorial: () => {
        console.log('🏪 TutorialStore: Resetting tutorial')
        set({
          tutorialState: {
            isVisible: false,
            currentStep: 0,
            isCompleted: false,
            neverShowAgain: false,
            hasBeenShown: false
          },
          userPreferences: defaultUserPreferences,
          analytics: defaultAnalytics,
          events: []
        })
      },

      updateConfig: (config: Partial<TutorialConfig>) => {
        console.log('🏪 TutorialStore: Updating config:', config)
        set((state) => ({
          config: { ...state.config, ...config }
        }))
      }
    }),
    {
      name: 'nomad-lux-tutorial',
      partialize: (state) => ({
        tutorialState: state.tutorialState,
        userPreferences: state.userPreferences,
        analytics: state.analytics,
        config: state.config
      })
    }
  )
)
