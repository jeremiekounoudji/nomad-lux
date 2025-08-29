import { useEffect, useCallback, useRef } from 'react'
import { useTutorialStore } from '../lib/stores/tutorialStore'
import { TutorialStep, TutorialEvent } from '../interfaces/Tutorial'

export const useTutorial = () => {
  const {
    tutorialState,
    userPreferences,
    analytics,
    config,
    events,
    startTutorial,
    completeTutorial,
    skipTutorial,
    closeTutorial,
    nextStep,
    previousStep,
    goToStep,
    setNeverShowAgain,
    markStepComplete,
    addEvent,
    resetTutorial,
    updateConfig
  } = useTutorialStore()

  const stepStartTimeRef = useRef<number>(Date.now())

  console.log('🎓 useTutorial hook initialized', {
    timestamp: new Date().toISOString(),
    currentStep: tutorialState.currentStep,
    isVisible: tutorialState.isVisible
  })

  // Track step time when step changes
  useEffect(() => {
    if (tutorialState.isVisible) {
      const currentTime = Date.now()
      const timeSpent = Math.floor((currentTime - stepStartTimeRef.current) / 1000)
      
      if (tutorialState.currentStep > 0) {
        // Mark previous step as complete
        markStepComplete(tutorialState.currentStep - 1, timeSpent)
      }
      
      // Reset timer for new step
      stepStartTimeRef.current = currentTime
      
      console.log('🎓 Step changed:', {
        step: tutorialState.currentStep,
        timeSpent,
        timestamp: new Date().toISOString()
      })
    }
  }, [tutorialState.currentStep, tutorialState.isVisible, markStepComplete])

  // Check if tutorial should be shown
  const shouldShowTutorial = useCallback(() => {
    if (userPreferences.hasCompletedTutorial && userPreferences.neverShowAgain) {
      return false
    }
    
    if (userPreferences.hasCompletedTutorial && !config.autoStart) {
      return false
    }
    
    return !tutorialState.hasBeenShown
  }, [userPreferences, config.autoStart, tutorialState.hasBeenShown])

  // Auto-start tutorial if configured
  useEffect(() => {
    if (config.autoStart && shouldShowTutorial() && !tutorialState.isVisible) {
      console.log('🎓 Auto-starting tutorial')
      startTutorial()
    }
  }, [config.autoStart, shouldShowTutorial, tutorialState.isVisible, startTutorial])

  // Handle keyboard navigation
  useEffect(() => {
    if (!config.keyboardNavigation || !tutorialState.isVisible) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
        case ' ':
          event.preventDefault()
          nextStep()
          break
        case 'ArrowLeft':
          event.preventDefault()
          previousStep()
          break
        case 'Escape':
          event.preventDefault()
          closeTutorial()
          break
        case 'Enter':
          event.preventDefault()
          if (tutorialState.currentStep === 3) { // Last step
            completeTutorial()
          } else {
            nextStep()
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [config.keyboardNavigation, tutorialState.isVisible, tutorialState.currentStep, nextStep, previousStep, closeTutorial, completeTutorial])

  // Get current step data
  const getCurrentStep = useCallback((steps: TutorialStep[]) => {
    return steps[tutorialState.currentStep] || null
  }, [tutorialState.currentStep])

  // Check if current step is the last step
  const isLastStep = useCallback((totalSteps: number) => {
    return tutorialState.currentStep === totalSteps - 1
  }, [tutorialState.currentStep])

  // Check if current step is the first step
  const isFirstStep = useCallback(() => {
    return tutorialState.currentStep === 0
  }, [tutorialState.currentStep])

  // Get progress percentage
  const getProgressPercentage = useCallback((totalSteps: number) => {
    return ((tutorialState.currentStep + 1) / totalSteps) * 100
  }, [tutorialState.currentStep])

  // Get analytics summary
  const getAnalyticsSummary = useCallback(() => {
    return {
      totalSteps: Object.keys(analytics.stepVisits).length,
      totalTimeSpent: analytics.totalTimeSpent,
      averageTimePerStep: analytics.totalTimeSpent / Math.max(Object.keys(analytics.stepVisits).length, 1),
      completionRate: analytics.tutorialCompleted ? 100 : 0,
      skipRate: analytics.tutorialSkipped ? 100 : 0
    }
  }, [analytics])

  // Export analytics data
  const exportAnalytics = useCallback(() => {
    const summary = getAnalyticsSummary()
    const exportData = {
      summary,
      events,
      stepVisits: analytics.stepVisits,
      timeSpentOnSteps: analytics.timeSpentOnSteps,
      userPreferences,
      config,
      exportDate: new Date().toISOString()
    }
    
    console.log('🎓 Analytics export:', exportData)
    return exportData
  }, [getAnalyticsSummary, events, analytics, userPreferences, config])

  // Reset tutorial and preferences
  const resetTutorialAndPreferences = useCallback(() => {
    console.log('🎓 Resetting tutorial and preferences')
    resetTutorial()
  }, [resetTutorial])

  // Update tutorial configuration
  const updateTutorialConfig = useCallback((newConfig: Partial<typeof config>) => {
    console.log('🎓 Updating tutorial config:', newConfig)
    updateConfig(newConfig)
  }, [updateConfig])

  return {
    // State
    tutorialState,
    userPreferences,
    analytics,
    config,
    events,
    
    // Actions
    startTutorial,
    completeTutorial,
    skipTutorial,
    closeTutorial,
    nextStep,
    previousStep,
    goToStep,
    setNeverShowAgain,
    markStepComplete,
    addEvent,
    resetTutorial,
    updateConfig,
    
    // Computed values
    shouldShowTutorial,
    getCurrentStep,
    isLastStep,
    isFirstStep,
    getProgressPercentage,
    getAnalyticsSummary,
    
    // Utilities
    exportAnalytics,
    resetTutorialAndPreferences,
    updateTutorialConfig
  }
}
