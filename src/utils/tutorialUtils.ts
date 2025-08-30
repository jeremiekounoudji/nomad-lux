/**
 * Tutorial utilities for image loading, optimization, and general tutorial functionality
 */

/**
 * Image loading states
 */
export enum ImageLoadingState {
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error'
}

/**
 * Image optimization options
 */
export interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
  lazy?: boolean
}

/**
 * Preload tutorial images for better performance
 * @param imageUrls - Array of image URLs to preload
 * @returns Promise that resolves when all images are loaded
 */
export const preloadTutorialImages = async (imageUrls: string[]): Promise<void> => {
  const preloadPromises = imageUrls.map(url => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
      img.src = url
    })
  })

  try {
    await Promise.all(preloadPromises)
    console.log('🎓 TutorialUtils: All tutorial images preloaded successfully')
  } catch (error) {
    console.warn('🎓 TutorialUtils: Some tutorial images failed to preload:', error)
  }
}

/**
 * Optimize image URL for different screen sizes and formats
 * @param originalUrl - Original image URL
 * @param options - Optimization options
 * @returns Optimized image URL
 */
export const optimizeImageUrl = (
  originalUrl: string
  // options: ImageOptimizationOptions = {} // Commented out to avoid unused variable warning
): string => {
  // For SVG files, return as-is since they're already optimized
  if (originalUrl.endsWith('.svg')) {
    return originalUrl
  }

  // For development, return original URL
  if (process.env.NODE_ENV === 'development') {
    return originalUrl
  }

  // In production, you could integrate with an image optimization service
  // For now, return the original URL
  return originalUrl
}

/**
 * Get responsive image URLs for different screen sizes
 * @param baseUrl - Base image URL
 * @param sizes - Array of sizes to generate
 * @returns Object with size-specific URLs
 */
export const getResponsiveImageUrls = (
  baseUrl: string,
  sizes: number[] = [320, 640, 1024, 1920]
): Record<number, string> => {
  const urls: Record<number, string> = {}

  sizes.forEach(size => {
    urls[size] = optimizeImageUrl(baseUrl)
  })

  return urls
}

/**
 * Generate srcset string for responsive images
 * @param baseUrl - Base image URL
 * @param sizes - Array of sizes to generate
 * @returns Srcset string
 */
export const generateSrcset = (
  baseUrl: string,
  sizes: number[] = [320, 640, 1024, 1920]
): string => {
  return sizes
    .map(size => `${optimizeImageUrl(baseUrl)} ${size}w`)
    .join(', ')
}

/**
 * Check if image is cached in browser
 * @param url - Image URL to check
 * @returns Promise that resolves to true if cached
 */
export const isImageCached = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}

/**
 * Load image with timeout
 * @param url - Image URL to load
 * @param timeout - Timeout in milliseconds
 * @returns Promise that resolves when image loads or rejects on timeout
 */
export const loadImageWithTimeout = (
  url: string,
  timeout: number = 10000
): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const timer = setTimeout(() => {
      reject(new Error(`Image load timeout: ${url}`))
    }, timeout)

    img.onload = () => {
      clearTimeout(timer)
      resolve(img)
    }

    img.onerror = () => {
      clearTimeout(timer)
      reject(new Error(`Failed to load image: ${url}`))
    }

    img.src = url
  })
}

/**
 * Get image dimensions without loading the full image
 * @param url - Image URL
 * @returns Promise that resolves to image dimensions
 */
export const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      reject(new Error(`Failed to get dimensions for: ${url}`))
    }
    img.src = url
  })
}

/**
 * Validate image URL format
 * @param url - Image URL to validate
 * @returns True if valid image URL
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false

  // Check for common image extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
  const hasValidExtension = imageExtensions.some(ext => 
    url.toLowerCase().includes(ext)
  )

  // Check for valid URL format
  try {
    new URL(url)
    return hasValidExtension
  } catch {
    // If it's a relative path, check for valid extension
    return hasValidExtension
  }
}

/**
 * Get fallback image URL
 * @param originalUrl - Original image URL
 * @returns Fallback image URL
 */
export const getFallbackImageUrl = (): string => {
  // Return a placeholder image URL
  return '/src/assets/tutorial/placeholder.svg'
}

/**
 * Create image loading state manager
 * @returns Object with state management functions
 */
export const createImageLoadingManager = () => {
  const loadingStates = new Map<string, ImageLoadingState>()
  const listeners = new Map<string, Set<(state: ImageLoadingState) => void>>()

  const setLoadingState = (url: string, state: ImageLoadingState) => {
    loadingStates.set(url, state)
    const urlListeners = listeners.get(url)
    if (urlListeners) {
      urlListeners.forEach(listener => listener(state))
    }
  }

  const getLoadingState = (url: string): ImageLoadingState => {
    return loadingStates.get(url) || ImageLoadingState.LOADING
  }

  const addListener = (url: string, listener: (state: ImageLoadingState) => void) => {
    if (!listeners.has(url)) {
      listeners.set(url, new Set())
    }
    listeners.get(url)!.add(listener)
  }

  const removeListener = (url: string, listener: (state: ImageLoadingState) => void) => {
    const urlListeners = listeners.get(url)
    if (urlListeners) {
      urlListeners.delete(listener)
    }
  }

  return {
    setLoadingState,
    getLoadingState,
    addListener,
    removeListener
  }
}

/**
 * Debounce function for image loading
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function for image loading
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
