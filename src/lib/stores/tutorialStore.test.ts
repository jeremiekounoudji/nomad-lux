import { renderHook, act } from '@testing-library/react'
import { useTutorialStore } from './tutorialStore'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('TutorialStore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset store to initial state
    act(() => {
      useTutorialStore.getState().resetTutorial()
    })
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useTutorialStore())
      
      expect(result.current.tutorialState).toEqual({
        isVisible: false,
        currentStep: 0,
        isCompleted: false,
        neverShowAgain: false,
        hasBeenShown: false
      })
      
      expect(result.current.userPreferences).toEqual({
        hasCompletedTutorial: false,
        neverShowAgain: false,
        stepCompletionTimes: {}
      })
      
      expect(result.current.analytics).toEqual({
        tutorialStarted: false,
        tutorialCompleted: false,
        tutorialSkipped: false,
        stepVisits: {},
        timeSpentOnSteps: {},
        totalTimeSpent: 0
      })
    })
  })

  describe('Tutorial Actions', () => {
    it('should start tutorial correctly', () => {
      const { result } = renderHook(() => useTutorialStore())
      
      act(() => {
        result.current.startTutorial()
      })
      
      expect(result.current.tutorialState.isVisible).toBe(true)
      expect(result.current.tutorialState.currentStep).toBe(0)
      expect(result.current.tutorialState.startTime).toBeDefined()
      expect(result.current.analytics.tutorialStarted).toBe(true)
      expect(result.current.analytics.stepVisits[0]).toBe(1)
    })

    it('should complete tutorial correctly', () => {
      const { result } = renderHook(() => useTutorialStore())
      
      // Start tutorial first
      act(() => {
        result.current.startTutorial()
      })
      
      // Complete tutorial
      act(() => {
        result.current.completeTutorial()
      })
      
      expect(result.current.tutorialState.isVisible).toBe(false)
      expect(result.current.tutorialState.isCompleted).toBe(true)
      expect(result.current.tutorialState.completionTime).toBeDefined()
      expect(result.current.userPreferences.hasCompletedTutorial).toBe(true)
      expect(result.current.analytics.tutorialCompleted).toBe(true)
    })

    it('should skip tutorial correctly', () => {
      const { result } = renderHook(() => useTutorialStore())
      
      // Start tutorial first
      act(() => {
        result.current.startTutorial()
      })
      
      // Skip tutorial
      act(() => {
        result.current.skipTutorial()
      })
      
      expect(result.current.tutorialState.isVisible).toBe(false)
      expect(result.current.analytics.tutorialSkipped).toBe(true)
    })

    it('should close tutorial correctly', () => {
      const { result } = renderHook(() => useTutorialStore())
      
      // Start tutorial first
      act(() => {
        result.current.startTutorial()
      })
      
      // Close tutorial
      act(() => {
        result.current.closeTutorial()
      })
      
      expect(result.current.tutorialState.isVisible).toBe(false)
    })
  })

  describe('Step Navigation', () => {
    it('should navigate to next step', () => {
      const { result } = renderHook(() => useTutorialStore())
      
      act(() => {
        result.current.startTutorial()
        result.current.nextStep()
      })
      
      expect(result.current.tutorialState.currentStep).toBe(1)
      expect(result.current.analytics.stepVisits[1]).toBe(1)
    })

    it('should navigate to previous step', () => {
      const { result } = renderHook(() => useTutorialStore())
      
      act(() => {
        result.current.startTutorial()
        result.current.nextStep()
        result.current.previousStep()
      })
      
      expect(result.current.tutorialState.currentStep).toBe(0)
    })

    it('should not go below step 0', () => {
      const { result } = renderHook(() => useTutorialStore())
      
      act(() => {
        result.current.startTutorial()
        result.current.previousStep()
      })
      
      expect(result.current.tutorialState.currentStep).toBe(0)
    })

    it('should go to specific step', () => {
      const { result } = renderHook(() => useTutorialStore())
      
      act(() => {
        result.current.startTutorial()
        result.current.goToStep(2)
      })
      
      expect(result.current.tutorialState.currentStep).toBe(2)
      expect(result.current.analytics.stepVisits[2]).toBe(1)
    })
  })

  describe('User Preferences', () => {
    it('should set never show again preference', () => {
      const { result } = renderHook(() => useTutorialStore())
      
      act(() => {
        result.current.setNeverShowAgain(true)
      })
      
      expect(result.current.tutorialState.neverShowAgain).toBe(true)
      expect(result.current.userPreferences.neverShowAgain).toBe(true)
    })

    it('should mark step as complete', () => {
      const { result } = renderHook(() => useTutorialStore())
      
      act(() => {
        result.current.markStepComplete(1, 30)
      })
      
      expect(result.current.userPreferences.stepCompletionTimes[1]).toBe(30)
      expect(result.current.analytics.timeSpentOnSteps[1]).toBe(30)
    })
  })

  describe('Configuration', () => {
    it('should update configuration', () => {
      const { result } = renderHook(() => useTutorialStore())
      
      act(() => {
        result.current.updateConfig({ autoStart: false, allowSkip: false })
      })
      
      expect(result.current.config.autoStart).toBe(false)
      expect(result.current.config.allowSkip).toBe(false)
      expect(result.current.config.showProgress).toBe(true) // Should remain unchanged
    })
  })

  describe('Analytics', () => {
    it('should track events correctly', () => {
      const { result } = renderHook(() => useTutorialStore())
      
      const testEvent = {
        type: 'start' as const,
        timestamp: new Date(),
        data: { test: 'data' }
      }
      
      act(() => {
        result.current.addEvent(testEvent)
      })
      
      expect(result.current.events).toHaveLength(1)
      expect(result.current.events[0]).toEqual(testEvent)
    })

    it('should calculate time spent correctly', () => {
      const { result } = renderHook(() => useTutorialStore())
      
      // Mock Date.now to control timing
      const mockStartTime = 1000000
      const mockEndTime = 1030000 // 30 seconds later
      
      jest.spyOn(Date.prototype, 'getTime')
        .mockReturnValueOnce(mockStartTime)
        .mockReturnValueOnce(mockEndTime)
      
      act(() => {
        result.current.startTutorial()
        result.current.completeTutorial()
      })
      
      expect(result.current.analytics.totalTimeSpent).toBe(30)
    })
  })

  describe('Reset Functionality', () => {
    it('should reset tutorial to initial state', () => {
      const { result } = renderHook(() => useTutorialStore())
      
      // Modify state
      act(() => {
        result.current.startTutorial()
        result.current.nextStep()
        result.current.setNeverShowAgain(true)
        result.current.addEvent({ type: 'start', timestamp: new Date() })
      })
      
      // Reset
      act(() => {
        result.current.resetTutorial()
      })
      
      expect(result.current.tutorialState.isVisible).toBe(false)
      expect(result.current.tutorialState.currentStep).toBe(0)
      expect(result.current.tutorialState.neverShowAgain).toBe(false)
      expect(result.current.events).toHaveLength(0)
    })
  })
})
