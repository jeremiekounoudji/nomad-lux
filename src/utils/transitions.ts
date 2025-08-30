// Transition and micro-interaction utilities

export interface TransitionConfig {
  duration: number
  easing: string
  delay?: number
}

export const TRANSITION_PRESETS = {
  fast: { duration: 150, easing: 'ease-out' },
  normal: { duration: 250, easing: 'ease-in-out' },
  slow: { duration: 350, easing: 'ease-in-out' },
  bounce: { duration: 300, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
  elastic: { duration: 400, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' }
}

/**
 * Generate CSS transition string
 */
export const generateTransition = (
  properties: string | string[],
  config: TransitionConfig = TRANSITION_PRESETS.normal
): string => {
  const props = Array.isArray(properties) ? properties : [properties]
  const { duration, easing, delay = 0 } = config
  
  return props
    .map(prop => `${prop} ${duration}ms ${easing} ${delay}ms`)
    .join(', ')
}

/**
 * Get transition classes for common interactions
 */
export const getTransitionClasses = {
  // Button interactions
  button: {
    base: 'transition-all duration-200 ease-in-out',
    hover: 'hover:scale-105 hover:shadow-md',
    active: 'active:scale-95',
    focus: 'focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
  },
  
  // Card interactions
  card: {
    base: 'transition-all duration-300 ease-in-out',
    hover: 'hover:shadow-lg hover:-translate-y-1',
    focus: 'focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
  },
  
  // Form interactions
  form: {
    input: 'transition-all duration-200 ease-in-out focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    label: 'transition-all duration-200 ease-in-out',
    error: 'animate-shake'
  },
  
  // Navigation interactions
  nav: {
    item: 'transition-all duration-200 ease-in-out hover:bg-gray-100',
    active: 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
  },
  
  // Modal interactions
  modal: {
    overlay: 'transition-opacity duration-300 ease-in-out',
    content: 'transition-all duration-300 ease-in-out transform'
  },
  
  // Loading states
  loading: {
    spinner: 'animate-spin',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce'
  }
}

/**
 * Micro-interaction utilities
 */
export const microInteractions = {
  // Ripple effect for buttons
  createRipple: (event: React.MouseEvent<HTMLElement>) => {
    const button = event.currentTarget
    const ripple = document.createElement('span')
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2
    
    ripple.style.width = ripple.style.height = `${size}px`
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`
    ripple.classList.add('ripple')
    
    button.appendChild(ripple)
    
    setTimeout(() => {
      ripple.remove()
    }, 600)
  },
  
  // Stagger animation for lists
  staggerChildren: (delay: number = 50) => {
    return {
      '& > *': {
        animationDelay: `${delay}ms`,
        animationFillMode: 'both'
      }
    }
  },
  
  // Fade in animation
  fadeIn: (delay: number = 0) => ({
    opacity: 0,
    transform: 'translateY(10px)',
    animation: `fadeIn 0.5s ease-out ${delay}ms forwards`
  }),
  
  // Slide in animation
  slideIn: (direction: 'left' | 'right' | 'up' | 'down' = 'up', delay: number = 0) => {
    const transforms = {
      left: 'translateX(-20px)',
      right: 'translateX(20px)',
      up: 'translateY(20px)',
      down: 'translateY(-20px)'
    }
    
    return {
      opacity: 0,
      transform: transforms[direction],
      animation: `slideIn 0.5s ease-out ${delay}ms forwards`
    }
  },
  
  // Scale animation
  scale: (scale: number = 1.05, delay: number = 0) => ({
    transform: 'scale(1)',
    animation: `scale ${0.3}s ease-out ${delay}ms forwards`,
    '&:hover': {
      transform: `scale(${scale})`
    }
  })
}

/**
 * CSS keyframes for animations
 */
export const keyframes = {
  fadeIn: `
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  
  slideIn: `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  
  scale: `
    @keyframes scale {
      from {
        transform: scale(1);
      }
      to {
        transform: scale(1.05);
      }
    }
  `,
  
  shake: `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
  `,
  
  bounce: `
    @keyframes bounce {
      0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
      40%, 43% { transform: translate3d(0,-30px,0); }
      70% { transform: translate3d(0,-15px,0); }
      90% { transform: translate3d(0,-4px,0); }
    }
  `,
  
  pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `,
  
  spin: `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `
}

/**
 * Hover effects
 */
export const hoverEffects = {
  lift: 'hover:transform hover:scale-105 hover:shadow-lg transition-all duration-200',
  glow: 'hover:shadow-lg hover:shadow-blue-500/25 transition-shadow duration-200',
  slide: 'hover:transform hover:translate-x-1 transition-transform duration-200',
  color: 'hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200',
  border: 'hover:border-blue-500 transition-colors duration-200'
}

/**
 * Focus effects
 */
export const focusEffects = {
  ring: 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  outline: 'focus:outline-none focus:border-blue-500',
  scale: 'focus:transform focus:scale-105'
}

/**
 * Loading states
 */
export const loadingStates = {
  skeleton: 'animate-pulse bg-gray-200',
  spinner: 'animate-spin',
  dots: 'animate-bounce'
}

/**
 * Success/Error animations
 */
export const feedbackAnimations = {
  success: 'animate-pulse bg-green-100 border-green-500',
  error: 'animate-shake bg-red-100 border-red-500',
  warning: 'animate-pulse bg-yellow-100 border-yellow-500'
}

/**
 * Page transitions
 */
export const pageTransitions = {
  enter: 'animate-fadeIn',
  exit: 'animate-fadeOut',
  stagger: 'animate-stagger'
}

/**
 * Component-specific transitions
 */
export const componentTransitions = {
  // Profile card
  profileCard: {
    container: 'transition-all duration-300 ease-in-out hover:shadow-lg',
    avatar: 'transition-transform duration-200 hover:scale-110',
    button: 'transition-all duration-200 hover:bg-blue-50 hover:text-blue-600'
  },
  
  // Form elements
  form: {
    input: 'transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    label: 'transition-colors duration-200',
    error: 'animate-shake text-red-600',
    success: 'animate-pulse text-green-600'
  },
  
  // Navigation
  navigation: {
    item: 'transition-all duration-200 hover:bg-gray-100',
    active: 'bg-blue-50 text-blue-600 border-r-2 border-blue-600',
    indicator: 'transition-transform duration-200'
  },
  
  // Modal
  modal: {
    overlay: 'transition-opacity duration-300',
    content: 'transition-all duration-300 transform',
    enter: 'opacity-0 scale-95',
    enterActive: 'opacity-100 scale-100',
    exit: 'opacity-100 scale-100',
    exitActive: 'opacity-0 scale-95'
  }
}

/**
 * Utility to combine transition classes
 */
export const combineTransitions = (...classes: string[]): string => {
  return classes.filter(Boolean).join(' ')
}

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get motion-aware transition classes
 */
export const getMotionAwareClasses = (baseClasses: string): string => {
  if (prefersReducedMotion()) {
    // Remove animation and transition classes for users who prefer reduced motion
    return baseClasses
      .replace(/animate-[^\s]+/g, '')
      .replace(/transition-[^\s]+/g, '')
      .replace(/duration-[^\s]+/g, '')
      .replace(/ease-[^\s]+/g, '')
  }
  
  return baseClasses
}
