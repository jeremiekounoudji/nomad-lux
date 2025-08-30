import { ProfileUpdateData, ProfileFormErrors } from '../interfaces/Profile'

export interface ValidationRule {
  test: (value: string) => boolean
  message: string
}

export interface ValidationRules {
  [key: string]: ValidationRule[]
}

// Common validation patterns
const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-()]+$/,
  NAME: /^[a-zA-Z\s\-']+$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  URL: /^https?:\/\/.+/
}

// Validation rules for profile fields
export const PROFILE_VALIDATION_RULES: ValidationRules = {
  firstName: [
    {
      test: (value: string) => value.trim().length > 0,
      message: 'First name is required'
    },
    {
      test: (value: string) => value.trim().length >= 2,
      message: 'First name must be at least 2 characters'
    },
    {
      test: (value: string) => value.trim().length <= 50,
      message: 'First name must be less than 50 characters'
    },
    {
      test: (value: string) => PATTERNS.NAME.test(value.trim()),
      message: 'First name contains invalid characters'
    }
  ],
  lastName: [
    {
      test: (value: string) => value.trim().length > 0,
      message: 'Last name is required'
    },
    {
      test: (value: string) => value.trim().length >= 2,
      message: 'Last name must be at least 2 characters'
    },
    {
      test: (value: string) => value.trim().length <= 50,
      message: 'Last name must be less than 50 characters'
    },
    {
      test: (value: string) => PATTERNS.NAME.test(value.trim()),
      message: 'Last name contains invalid characters'
    }
  ],
  phone: [
    {
      test: (value: string) => !value || PATTERNS.PHONE.test(value),
      message: 'Phone number format is invalid'
    },
    {
      test: (value: string) => !value || value.replace(/\D/g, '').length >= 10,
      message: 'Phone number must have at least 10 digits'
    }
  ],
  bio: [
    {
      test: (value: string) => !value || value.length <= 500,
      message: 'Bio must be less than 500 characters'
    }
  ],
  dateOfBirth: [
    {
      test: (value: string) => !value || PATTERNS.DATE.test(value),
      message: 'Date format must be YYYY-MM-DD'
    },
    {
      test: (value: string) => {
        if (!value) return true
        const date = new Date(value)
        const now = new Date()
        const minAge = new Date(now.getFullYear() - 13, now.getMonth(), now.getDate())
        return date <= minAge
      },
      message: 'You must be at least 13 years old'
    }
  ],
  location: [
    {
      test: (value: string) => !value || value.trim().length <= 100,
      message: 'Location must be less than 100 characters'
    }
  ]
}

/**
 * Validates a single field value against its validation rules
 */
export const validateField = (
  field: string,
  value: string,
  rules: ValidationRules = PROFILE_VALIDATION_RULES
): string | null => {
  const fieldRules = rules[field]
  if (!fieldRules) return null

  for (const rule of fieldRules) {
    if (!rule.test(value)) {
      return rule.message
    }
  }

  return null
}

/**
 * Validates all fields in a profile update form
 */
export const validateProfileForm = (
  formData: ProfileUpdateData,
  rules: ValidationRules = PROFILE_VALIDATION_RULES
): ProfileFormErrors => {
  const errors: ProfileFormErrors = {}

  Object.keys(formData).forEach(field => {
    const value = formData[field as keyof ProfileUpdateData] || ''
    const error = validateField(field, value, rules)
    if (error) {
      errors[field as keyof ProfileFormErrors] = error
    }
  })

  return errors
}

/**
 * Checks if a form has any validation errors
 */
export const hasFormErrors = (errors: ProfileFormErrors): boolean => {
  return Object.values(errors).some(error => error !== undefined && error !== '')
}

/**
 * Validates password strength
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean
  score: number
  feedback: string[]
} => {
  const feedback: string[] = []
  let score = 0

  // Length check
  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('Password must be at least 8 characters long')
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Password must contain at least one uppercase letter')
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Password must contain at least one lowercase letter')
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push('Password must contain at least one number')
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1
  } else {
    feedback.push('Password must contain at least one special character')
  }

  const isValid = score >= 4

  return {
    isValid,
    score,
    feedback
  }
}

/**
 * Validates password confirmation
 */
export const validatePasswordConfirmation = (
  password: string,
  confirmPassword: string
): string | null => {
  if (!confirmPassword) {
    return 'Please confirm your password'
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match'
  }

  return null
}

/**
 * Sanitizes form data by trimming whitespace and removing empty strings
 */
export const sanitizeFormData = (formData: ProfileUpdateData): ProfileUpdateData => {
  const sanitized: ProfileUpdateData = {}

  Object.keys(formData).forEach(key => {
    const value = formData[key as keyof ProfileUpdateData]
    if (value !== undefined && value !== null) {
      const trimmed = typeof value === 'string' ? value.trim() : value
      if (trimmed !== '') {
        sanitized[key as keyof ProfileUpdateData] = trimmed
      }
    }
  })

  return sanitized
}

/**
 * Formats validation errors for display
 */
export const formatValidationErrors = (errors: ProfileFormErrors): string[] => {
  return Object.values(errors).filter(error => error !== undefined && error !== '')
}

/**
 * Gets the strength level of a password
 */
export const getPasswordStrengthLevel = (score: number): {
  level: 'weak' | 'medium' | 'strong' | 'very-strong'
  color: string
  label: string
} => {
  if (score <= 2) {
    return { level: 'weak', color: 'text-red-500', label: 'Weak' }
  } else if (score <= 3) {
    return { level: 'medium', color: 'text-yellow-500', label: 'Medium' }
  } else if (score <= 4) {
    return { level: 'strong', color: 'text-blue-500', label: 'Strong' }
  } else {
    return { level: 'very-strong', color: 'text-green-500', label: 'Very Strong' }
  }
}
