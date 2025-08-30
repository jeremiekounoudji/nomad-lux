import { renderHook, act } from '@testing-library/react'
import { useTutorial } from './useTutorial'
import { TutorialStep } from '../interfaces/Tutorial'

// Mock the tutorial store
jest.mock('../lib/stores/tutorialStore', () => ({
  useTutorialStore: jest.fn()
}))

const mockUseTutorialStore = require('../lib/stores/tutorialStore').useTutorialStore

describe('useTutorial', () => {
  const mockSteps: TutorialStep[] = [
    {
      id: 0,
      title: 'Step 1',
      description: 'First step',
      imageUrl: '/step1.jpg',
      imageAlt: 'Step 1 image'
    },
    {
      id: 1,
      title: 'Step 2',
      description: 'Second step',
      imageUrl: '/step2.jpg',
      imageAlt: 'Step 2 image'
    },
    {
      id: 2,
      title: 'Step 3',
      description: 'Third step',
      imageUrl: '/step3.jpg',
      imageAlt: 'Step 3 image'
    }
  ]

  const defaultMockState = {
    tutorialState: {
      isVisible: false,
      currentStep: 0,
      isCompleted: false,
      neverShowAgain: false,
      hasBeenShown: false
    },
    userPreferences: {
      hasCompletedTutorial: false,
      neverShowAgain: false,
      stepCompletionTimes: {}
    },
    analytics: {
      tutorialStarted: false,
      tutorialCompleted: false,
      tutorialSkipped: false,
      stepVisits: {},
      timeSpentOnSteps: {},
      totalTimeSpent: 0
    },
    config: {
      autoStart: true,
      showProgress: true,
      allowSkip: true,
      allowClose: true,
      showNeverShowAgain: true,
      keyboardNavigation: true,
      analyticsEnabled: true
    },
    events: [],
    startTutorial: jest.fn(),
    completeTutorial: jest.fn(),
    skipTutorial: jest.fn(),
    closeTutorial: jest.fn(),
    nextStep: jest.fn(),
    previousStep: jest.fn(),
    goToStep: jest.fn(),
    setNeverShowAgain: jest.fn(),
    markStepComplete: jest.fn(),
    addEvent: jest.fn(),
    resetTutorial: jest.fn(),
    updateConfig: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseTutorialStore.mockReturnValue(defaultMockState)
  })

  describe('Initialization', () => {
    it('should initialize with correct state', () => {
      const { result } = renderHook(() => useTutorial())
      
      expect(result.current.tutorialState).toEqual(defaultMockState.tutorialState)
      expect(result.current.userPreferences).toEqual(defaultMockState.userPreferences)
      expect(result.current.analytics).toEqual(defaultMockState.analytics)
      expect(result.current.config).toEqual(defaultMockState.config)
    })
  })

  describe('Computed Values', () => {
    it('should determine if tutorial should be shown correctly', () => {
      const { result } = renderHook(() => useTutorial())
      
      // Should show when not completed and not set to never show
      expect(result.current.shouldShowTutorial()).toBe(true)
      
      // Should not show when completed and never show again
      mockUseTutorialStore.mockReturnValue({
        ...defaultMockState,
        userPreferences: {
          hasCompletedTutorial: true,
          neverShowAgain: true
        }
      })
      
      const { result: result2 } = renderHook(() => useTutorial())
      expect(result2.current.shouldShowTutorial()).toBe(false)
    })

    it('should get current step correctly', () => {
      const { result } = renderHook(() => useTutorial())
      
      const currentStep = result.current.getCurrentStep(mockSteps)
      expect(currentStep).toEqual(mockSteps[0])
      
      // Change to step 1
      mockUseTutorialStore.mockReturnValue({
        ...defaultMockState,
        tutorialState: {
          ...defaultMockState.tutorialState,
          currentStep: 1
        }
      })
      
      const { result: result2 } = renderHook(() => useTutorial())
      const currentStep2 = result2.current.getCurrentStep(mockSteps)
      expect(currentStep2).toEqual(mockSteps[1])
    })

    it('should check if current step is last step', () => {
      const { result } = renderHook(() => useTutorial())
      
      expect(result.current.isLastStep(3)).toBe(false) // Step 0 of 3
      
      // Change to last step
      mockUseTutorialStore.mockReturnValue({
        ...defaultMockState,
        tutorialState: {
          ...defaultMockState.tutorialState,
          currentStep: 2
        }
      })
      
      const { result: result2 } = renderHook(() => useTutorial())
      expect(result2.current.isLastStep(3)).toBe(true) // Step 2 of 3
    })

    it('should check if current step is first step', () => {
      const { result } = renderHook(() => useTutorial())
      
      expect(result.current.isFirstStep()).toBe(true) // Step 0
      
      // Change to step 1
      mockUseTutorialStore.mockReturnValue({
        ...defaultMockState,
        tutorialState: {
          ...defaultMockState.tutorialState,
          currentStep: 1
        }
      })
      
      const { result: result2 } = renderHook(() => useTutorial())
      expect(result2.current.isFirstStep()).toBe(false) // Step 1
    })

    it('should calculate progress percentage correctly', () => {
      const { result } = renderHook(() => useTutorial())
      
      expect(result.current.getProgressPercentage(3)).toBe(33.33333333333333) // Step 0 of 3
      
      // Change to step 1
      mockUseTutorialStore.mockReturnValue({
        ...defaultMockState,
        tutorialState: {
          ...defaultMockState.tutorialState,
          currentStep: 1
        }
      })
      
      const { result: result2 } = renderHook(() => useTutorial())
      expect(result2.current.getProgressPercentage(3)).toBe(66.66666666666666) // Step 1 of 3
    })
  })

  describe('Analytics', () => {
    it('should get analytics summary correctly', () => {
      const mockAnalytics = {
        tutorialStarted: true,
        tutorialCompleted: true,
        tutorialSkipped: false,
        stepVisits: { 0: 1, 1: 1, 2: 1 },
        timeSpentOnSteps: { 0: 10, 1: 15, 2: 20 },
        totalTimeSpent: 45
      }
      
      mockUseTutorialStore.mockReturnValue({
        ...defaultMockState,
        analytics: mockAnalytics
      })
      
      const { result } = renderHook(() => useTutorial())
      const summary = result.current.getAnalyticsSummary()
      
      expect(summary.totalSteps).toBe(3)
      expect(summary.totalTimeSpent).toBe(45)
      expect(summary.averageTimePerStep).toBe(15)
      expect(summary.completionRate).toBe(100)
      expect(summary.skipRate).toBe(0)
    })

    it('should export analytics data correctly', () => {
      const { result } = renderHook(() => useTutorial())
      const exportData = result.current.exportAnalytics()
      
      expect(exportData).toHaveProperty('summary')
      expect(exportData).toHaveProperty('events')
      expect(exportData).toHaveProperty('stepVisits')
      expect(exportData).toHaveProperty('timeSpentOnSteps')
      expect(exportData).toHaveProperty('userPreferences')
      expect(exportData).toHaveProperty('config')
      expect(exportData).toHaveProperty('exportDate')
    })
  })

  describe('Configuration', () => {
    it('should update tutorial configuration', () => {
      const { result } = renderHook(() => useTutorial())
      
      act(() => {
        result.current.updateTutorialConfig({ autoStart: false, allowSkip: false })
      })
      
      expect(defaultMockState.updateConfig).toHaveBeenCalledWith({
        autoStart: false,
        allowSkip: false
      })
    })

    it('should reset tutorial and preferences', () => {
      const { result } = renderHook(() => useTutorial())
      
      act(() => {
        result.current.resetTutorialAndPreferences()
      })
      
      expect(defaultMockState.resetTutorial).toHaveBeenCalled()
    })
  })

  describe('Action Delegation', () => {
    it('should delegate startTutorial to store', () => {
      const { result } = renderHook(() => useTutorial())
      
      act(() => {
        result.current.startTutorial()
      })
      
      expect(defaultMockState.startTutorial).toHaveBeenCalled()
    })

    it('should delegate completeTutorial to store', () => {
      const { result } = renderHook(() => useTutorial())
      
      act(() => {
        result.current.completeTutorial()
      })
      
      expect(defaultMockState.completeTutorial).toHaveBeenCalled()
    })

    it('should delegate skipTutorial to store', () => {
      const { result } = renderHook(() => useTutorial())
      
      act(() => {
        result.current.skipTutorial()
      })
      
      expect(defaultMockState.skipTutorial).toHaveBeenCalled()
    })

    it('should delegate closeTutorial to store', () => {
      const { result } = renderHook(() => useTutorial())
      
      act(() => {
        result.current.closeTutorial()
      })
      
      expect(defaultMockState.closeTutorial).toHaveBeenCalled()
    })

    it('should delegate navigation actions to store', () => {
      const { result } = renderHook(() => useTutorial())
      
      act(() => {
        result.current.nextStep()
      })
      expect(defaultMockState.nextStep).toHaveBeenCalled()
      
      act(() => {
        result.current.previousStep()
      })
      expect(defaultMockState.previousStep).toHaveBeenCalled()
      
      act(() => {
        result.current.goToStep(2)
      })
      expect(defaultMockState.goToStep).toHaveBeenCalledWith(2)
    })

    it('should delegate preference actions to store', () => {
      const { result } = renderHook(() => useTutorial())
      
      act(() => {
        result.current.setNeverShowAgain(true)
      })
      expect(defaultMockState.setNeverShowAgain).toHaveBeenCalledWith(true)
      
      act(() => {
        result.current.markStepComplete(1, 30)
      })
      expect(defaultMockState.markStepComplete).toHaveBeenCalledWith(1, 30)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty steps array', () => {
      const { result } = renderHook(() => useTutorial())
      
      const currentStep = result.current.getCurrentStep([])
      expect(currentStep).toBeNull()
    })

    it('should handle zero total steps', () => {
      const { result } = renderHook(() => useTutorial())
      
      expect(result.current.getProgressPercentage(0)).toBe(Infinity)
      expect(result.current.isLastStep(0)).toBe(true)
    })

    it('should handle analytics with no step visits', () => {
      const mockAnalytics = {
        tutorialStarted: false,
        tutorialCompleted: false,
        tutorialSkipped: false,
        stepVisits: {},
        timeSpentOnSteps: {},
        totalTimeSpent: 0
      }
      
      mockUseTutorialStore.mockReturnValue({
        ...defaultMockState,
        analytics: mockAnalytics
      })
      
      const { result } = renderHook(() => useTutorial())
      const summary = result.current.getAnalyticsSummary()
      
      expect(summary.averageTimePerStep).toBe(0)
    })
  })
})
