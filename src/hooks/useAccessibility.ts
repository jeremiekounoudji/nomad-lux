import { useState, useEffect, useCallback } from 'react'
import { 
  prefersHighContrast, 
  prefersReducedMotion, 
  getAccessibilityClasses,
  announceToScreenReader,
  createFocusTrap
} from '../utils/accessibility'

interface AccessibilityState {
  highContrast: boolean
  reducedMotion: boolean
  focusVisible: boolean
}

interface UseAccessibilityReturn {
  accessibility: AccessibilityState
  getClasses: (baseClasses: string) => string
  announce: (message: string, priority?: 'polite' | 'assertive') => void
  createFocusTrapRef: (container: HTMLElement) => () => void
  setFocusVisible: (visible: boolean) => void
}

export const useAccessibility = (): UseAccessibilityReturn => {
  const [accessibility, setAccessibility] = useState<AccessibilityState>({
    highContrast: false,
    reducedMotion: false,
    focusVisible: false
  })

  // Check initial preferences
  useEffect(() => {
    const checkPreferences = () => {
      setAccessibility(prev => ({
        ...prev,
        highContrast: prefersHighContrast(),
        reducedMotion: prefersReducedMotion()
      }))
    }

    checkPreferences()

    // Listen for preference changes
    const highContrastMedia = window.matchMedia('(prefers-contrast: high), (prefers-contrast: more)')
    const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)')

    const handleHighContrastChange = () => {
      setAccessibility(prev => ({
        ...prev,
        highContrast: prefersHighContrast()
      }))
    }

    const handleReducedMotionChange = () => {
      setAccessibility(prev => ({
        ...prev,
        reducedMotion: prefersReducedMotion()
      }))
    }

    highContrastMedia.addEventListener('change', handleHighContrastChange)
    reducedMotionMedia.addEventListener('change', handleReducedMotionChange)

    return () => {
      highContrastMedia.removeEventListener('change', handleHighContrastChange)
      reducedMotionMedia.removeEventListener('change', handleReducedMotionChange)
    }
  }, [])

  // Handle focus visible state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setAccessibility(prev => ({ ...prev, focusVisible: true }))
      }
    }

    const handleMouseDown = () => {
      setAccessibility(prev => ({ ...prev, focusVisible: false }))
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  // Get accessibility-aware classes
  const getClasses = useCallback((baseClasses: string): string => {
    return getAccessibilityClasses(baseClasses)
  }, [])

  // Announce to screen reader
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announceToScreenReader(message, priority)
  }, [])

  // Create focus trap
  const createFocusTrapRef = useCallback((container: HTMLElement) => {
    return createFocusTrap(container)
  }, [])

  // Set focus visible state
  const setFocusVisible = useCallback((visible: boolean) => {
    setAccessibility(prev => ({ ...prev, focusVisible: visible }))
  }, [])

  return {
    accessibility,
    getClasses,
    announce,
    createFocusTrapRef,
    setFocusVisible
  }
}
