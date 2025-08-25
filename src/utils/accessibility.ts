// Accessibility utilities for the application

/**
 * Check if the user prefers high contrast mode
 */
export const prefersHighContrast = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return window.matchMedia('(prefers-contrast: high)').matches ||
         window.matchMedia('(prefers-contrast: more)').matches
}

/**
 * Check if the user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get high contrast color classes based on user preference
 */
export const getHighContrastClasses = (baseClasses: string): string => {
  if (!prefersHighContrast()) return baseClasses
  
  // Add high contrast variants
  return baseClasses
    .replace(/text-gray-(\d+)/g, 'text-gray-900')
    .replace(/bg-gray-(\d+)/g, 'bg-gray-100')
    .replace(/border-gray-(\d+)/g, 'border-gray-900')
    .replace(/hover:text-gray-(\d+)/g, 'hover:text-gray-900')
    .replace(/hover:bg-gray-(\d+)/g, 'hover:bg-gray-200')
}

/**
 * Get reduced motion classes based on user preference
 */
export const getReducedMotionClasses = (baseClasses: string): string => {
  if (!prefersReducedMotion()) return baseClasses
  
  // Remove transition and animation classes
  return baseClasses
    .replace(/transition-[^\s]+/g, '')
    .replace(/animate-[^\s]+/g, '')
    .replace(/duration-[^\s]+/g, '')
    .replace(/ease-[^\s]+/g, '')
}

/**
 * Get accessibility-focused classes combining all preferences
 */
export const getAccessibilityClasses = (baseClasses: string): string => {
  let classes = baseClasses
  classes = getHighContrastClasses(classes)
  classes = getReducedMotionClasses(classes)
  return classes
}

/**
 * Focus trap utility for modals and dialogs
 */
export const createFocusTrap = (container: HTMLElement) => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }
  }
  
  container.addEventListener('keydown', handleKeyDown)
  
  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * Announce text to screen readers
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Check if element is visible to screen readers
 */
export const isVisibleToScreenReader = (element: HTMLElement): boolean => {
  const style = window.getComputedStyle(element)
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         element.getAttribute('aria-hidden') !== 'true'
}

/**
 * Get accessible color contrast ratio
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  // Simplified contrast ratio calculation
  // In a real implementation, you'd want to use a proper color library
  const luminance1 = getLuminance(color1)
  const luminance2 = getLuminance(color2)
  
  const brightest = Math.max(luminance1, luminance2)
  const darkest = Math.min(luminance1, luminance2)
  
  return (brightest + 0.05) / (darkest + 0.05)
}

/**
 * Calculate relative luminance of a color
 */
const getLuminance = (color: string): number => {
  // Simplified luminance calculation
  // In a real implementation, you'd want to use a proper color library
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16) / 255
  const g = parseInt(hex.substr(2, 2), 16) / 255
  const b = parseInt(hex.substr(4, 2), 16) / 255
  
  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)
  
  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB
}

/**
 * Check if color combination meets WCAG contrast requirements
 */
export const meetsContrastRequirements = (
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' = 'AA'
): boolean => {
  const ratio = getContrastRatio(foreground, background)
  const requirements = {
    AA: { normal: 4.5, large: 3 },
    AAA: { normal: 7, large: 4.5 }
  }
  
  return ratio >= requirements[level].normal
}

/**
 * Generate accessible color variants
 */
export const generateAccessibleColors = (baseColor: string, background: string = '#ffffff') => {
  const variants = {
    primary: baseColor,
    secondary: adjustColor(baseColor, -20),
    tertiary: adjustColor(baseColor, -40),
    hover: adjustColor(baseColor, 10),
    active: adjustColor(baseColor, -10)
  }
  
  // Ensure all variants meet contrast requirements
  Object.entries(variants).forEach(([key, color]) => {
    if (!meetsContrastRequirements(color, background)) {
      variants[key as keyof typeof variants] = adjustColor(color, -30)
    }
  })
  
  return variants
}

/**
 * Adjust color brightness
 */
const adjustColor = (color: string, amount: number): string => {
  const hex = color.replace('#', '')
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount))
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
