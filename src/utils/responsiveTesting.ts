// Responsive design testing utilities

export interface ScreenSize {
  name: string
  width: number
  height: number
  devicePixelRatio?: number
}

export const SCREEN_SIZES: ScreenSize[] = [
  { name: 'Mobile Small', width: 320, height: 568 },
  { name: 'Mobile Medium', width: 375, height: 667 },
  { name: 'Mobile Large', width: 414, height: 896 },
  { name: 'Tablet Small', width: 768, height: 1024 },
  { name: 'Tablet Large', width: 1024, height: 1366 },
  { name: 'Desktop Small', width: 1280, height: 720 },
  { name: 'Desktop Medium', width: 1440, height: 900 },
  { name: 'Desktop Large', width: 1920, height: 1080 },
  { name: 'Ultra Wide', width: 2560, height: 1440 }
]

/**
 * Test responsive breakpoints
 */
export const testResponsiveBreakpoints = () => {
  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  }

  const currentWidth = window.innerWidth
  const activeBreakpoints = Object.entries(breakpoints)
    .filter(([, width]) => currentWidth >= width)
    .map(([name]) => name)

  console.log('Current screen width:', currentWidth)
  console.log('Active breakpoints:', activeBreakpoints)
  
  return { currentWidth, activeBreakpoints }
}

/**
 * Simulate different screen sizes for testing
 */
export const simulateScreenSize = (size: ScreenSize) => {
  // Store original dimensions
  const originalWidth = window.innerWidth
  const originalHeight = window.innerHeight
  
  // Simulate the screen size
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: size.width
  })
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: size.height
  })
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'))
  
  console.log(`Simulated screen size: ${size.name} (${size.width}x${size.height})`)
  
  // Return function to restore original size
  return () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalWidth
    })
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalHeight
    })
    
    window.dispatchEvent(new Event('resize'))
    console.log('Restored original screen size')
  }
}

/**
 * Test component responsiveness
 */
export const testComponentResponsiveness = (
  componentName: string,
  testFunction: (size: ScreenSize) => void
) => {
  console.log(`Testing responsiveness for: ${componentName}`)
  
  SCREEN_SIZES.forEach(size => {
    console.log(`\n--- Testing ${size.name} ---`)
    const restore = simulateScreenSize(size)
    
    try {
      testFunction(size)
    } catch (error) {
      console.error(`Error testing ${size.name}:`, error)
    }
    
    restore()
  })
}

/**
 * Check if element is visible at current screen size
 */
export const isElementVisible = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect()
  const style = window.getComputedStyle(element)
  
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0'
  )
}

/**
 * Check if element is properly responsive
 */
export const checkElementResponsiveness = (element: HTMLElement): {
  isVisible: boolean
  hasProperWidth: boolean
  hasProperHeight: boolean
  isOverflowing: boolean
} => {
  const rect = element.getBoundingClientRect()
  const parentRect = element.parentElement?.getBoundingClientRect()
  
  const isVisible = isElementVisible(element)
  const hasProperWidth = rect.width > 0 && rect.width <= (parentRect?.width || window.innerWidth)
  const hasProperHeight = rect.height > 0 && rect.height <= (parentRect?.height || window.innerHeight)
  const isOverflowing = rect.right > (parentRect?.right || window.innerWidth) || 
                       rect.bottom > (parentRect?.bottom || window.innerHeight)
  
  return {
    isVisible,
    hasProperWidth,
    hasProperHeight,
    isOverflowing
  }
}

/**
 * Generate responsive test report
 */
export const generateResponsiveTestReport = (componentName: string) => {
  const report = {
    component: componentName,
    timestamp: new Date().toISOString(),
    screenSizes: [] as Array<{
      size: ScreenSize
      issues: string[]
    }>
  }
  
  SCREEN_SIZES.forEach(size => {
    const restore = simulateScreenSize(size)
    const issues: string[] = []
    
    // Test common responsive issues
    const elements = document.querySelectorAll('[data-testid], [class*="responsive"], [class*="mobile"]')
    
    elements.forEach(element => {
      const responsiveness = checkElementResponsiveness(element as HTMLElement)
      
      if (!responsiveness.isVisible) {
        issues.push(`Element ${element.tagName} is not visible`)
      }
      
      if (!responsiveness.hasProperWidth) {
        issues.push(`Element ${element.tagName} has width issues`)
      }
      
      if (!responsiveness.hasProperHeight) {
        issues.push(`Element ${element.tagName} has height issues`)
      }
      
      if (responsiveness.isOverflowing) {
        issues.push(`Element ${element.tagName} is overflowing`)
      }
    })
    
    report.screenSizes.push({ size, issues })
    restore()
  })
  
  return report
}

/**
 * Test touch targets for mobile
 */
export const testTouchTargets = (): Array<{
  element: HTMLElement
  size: { width: number; height: number }
  meetsRequirements: boolean
}> => {
  const touchTargets = document.querySelectorAll('button, a, input, select, textarea, [role="button"]')
  const results: Array<{
    element: HTMLElement
    size: { width: number; height: number }
    meetsRequirements: boolean
  }> = []
  
  const MIN_TOUCH_TARGET_SIZE = 44 // 44px minimum for touch targets
  
  touchTargets.forEach(element => {
    const rect = element.getBoundingClientRect()
    const size = { width: rect.width, height: rect.height }
    const meetsRequirements = size.width >= MIN_TOUCH_TARGET_SIZE && size.height >= MIN_TOUCH_TARGET_SIZE
    
    results.push({
      element: element as HTMLElement,
      size,
      meetsRequirements
    })
  })
  
  return results
}

/**
 * Test text readability
 */
export const testTextReadability = (): Array<{
  element: HTMLElement
  fontSize: number
  lineHeight: number
  meetsRequirements: boolean
}> => {
  const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div')
  const results: Array<{
    element: HTMLElement
    fontSize: number
    lineHeight: number
    meetsRequirements: boolean
  }> = []
  
  const MIN_FONT_SIZE = 12 // 12px minimum for readability
  const MIN_LINE_HEIGHT = 1.2 // 1.2 minimum line height
  
  textElements.forEach(element => {
    const style = window.getComputedStyle(element)
    const fontSize = parseFloat(style.fontSize)
    const lineHeight = parseFloat(style.lineHeight) / fontSize
    
    const meetsRequirements = fontSize >= MIN_FONT_SIZE && lineHeight >= MIN_LINE_HEIGHT
    
    results.push({
      element: element as HTMLElement,
      fontSize,
      lineHeight,
      meetsRequirements
    })
  })
  
  return results
}
