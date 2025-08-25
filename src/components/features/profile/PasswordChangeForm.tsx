import React, { useState } from 'react'
import { Card, CardBody, Button, Input, Progress } from '@heroui/react'
import { Lock, Eye, EyeOff, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { useTranslation } from '../../../lib/stores/translationStore'
import { validatePasswordStrength, validatePasswordConfirmation, getPasswordStrengthLevel } from '../../../utils/profileValidation'

interface PasswordChangeFormProps {
  onPasswordChange: (currentPassword: string, newPassword: string) => Promise<void>
  isChanging?: boolean
}

const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({
  onPasswordChange,
  isChanging = false
}) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<{
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
  }>({})
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    isValid: false,
    feedback: [] as string[]
  })

  const { t } = useTranslation(['profile', 'common'])

  // Handle input changes
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }

    // Validate password strength for new password
    if (field === 'newPassword') {
      const strength = validatePasswordStrength(value)
      setPasswordStrength(strength)
    }

    // Validate password confirmation
    if (field === 'confirmPassword' && formData.newPassword) {
      const confirmationError = validatePasswordConfirmation(formData.newPassword, value)
      setErrors(prev => ({
        ...prev,
        confirmPassword: confirmationError || undefined
      }))
    }
  }

  // Toggle password visibility
  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    // Validate current password
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = t('profile.password.errors.currentPasswordRequired')
    }

    // Validate new password
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = t('profile.password.errors.newPasswordRequired')
    } else if (!passwordStrength.isValid) {
      newErrors.newPassword = t('profile.password.errors.passwordTooWeak')
    }

    // Validate password confirmation
    const confirmationError = validatePasswordConfirmation(formData.newPassword, formData.confirmPassword)
    if (confirmationError) {
      newErrors.confirmPassword = confirmationError
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await onPasswordChange(formData.currentPassword, formData.newPassword)
      
      // Reset form on success
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setErrors({})
      setPasswordStrength({
        score: 0,
        isValid: false,
        feedback: []
      })
    } catch (error) {
      console.error('Error changing password:', error)
    }
  }

  // Get password strength display
  const strengthLevel = getPasswordStrengthLevel(passwordStrength.score)

  // Render password input field
  const renderPasswordField = (
    field: keyof typeof formData,
    label: string,
    placeholder: string,
    showKey: keyof typeof showPasswords
  ) => {
    const value = formData[field]
    const error = errors[field as keyof typeof errors]
    const isVisible = showPasswords[showKey]
    const fieldId = `${field}-input`
    const errorId = `${field}-error`
    const toggleId = `${field}-toggle`

    return (
      <div className="space-y-2">
        <label htmlFor={fieldId} className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
          <Lock className="w-4 h-4" aria-hidden="true" />
          {label}
        </label>
        <div className="relative">
          <Input
            id={fieldId}
            type={isVisible ? 'text' : 'password'}
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            className={`w-full pr-10 min-h-[44px] ${error ? 'border-red-500' : ''}`}
            disabled={isChanging}
            aria-describedby={error ? errorId : undefined}
            aria-invalid={!!error}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target !== e.currentTarget) {
                e.preventDefault()
                const nextInput = e.currentTarget.parentElement?.nextElementSibling?.querySelector('input')
                if (nextInput) {
                  nextInput.focus()
                }
              }
            }}
          />
          <Button
            id={toggleId}
            isIconOnly
            size="sm"
            variant="light"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 min-h-[44px] min-w-[44px]"
            onPress={() => togglePasswordVisibility(showKey)}
            disabled={isChanging}
            aria-label={isVisible ? t('profile.password.actions.hidePassword') : t('profile.password.actions.showPassword')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                togglePasswordVisibility(showKey)
              }
            }}
          >
            {isVisible ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
          </Button>
        </div>
        {error && (
          <p id={errorId} className="text-xs sm:text-sm text-red-500 flex items-center gap-1" role="alert">
            <AlertCircle className="w-4 h-4" aria-hidden="true" />
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full transition-all duration-200 hover:shadow-md">
      <CardBody className="p-4 sm:p-6">
        <div className="flex items-center space-x-2 mb-4 sm:mb-6">
          <Shield className="w-5 h-5 text-gray-600" aria-hidden="true" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            {t('profile.sections.passwordChange')}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6" role="form" aria-label={t('profile.password.formLabel')}>
          {/* Current Password */}
          {renderPasswordField(
            'currentPassword',
            t('profile.password.fields.currentPassword'),
            t('profile.password.placeholders.currentPassword'),
            'current'
          )}

          {/* New Password */}
          <div className="space-y-2">
            <label htmlFor="newPassword-input" className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
              <Lock className="w-4 h-4" aria-hidden="true" />
              {t('profile.password.fields.newPassword')}
            </label>
            <div className="relative">
              <Input
                id="newPassword-input"
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                placeholder={t('profile.password.placeholders.newPassword')}
                className={`w-full pr-10 min-h-[44px] ${errors.newPassword ? 'border-red-500' : ''}`}
                disabled={isChanging}
                aria-describedby={errors.newPassword ? 'newPassword-error' : 'password-strength'}
                aria-invalid={!!errors.newPassword}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const confirmInput = document.getElementById('confirmPassword-input') as HTMLInputElement
                    if (confirmInput) {
                      confirmInput.focus()
                    }
                  }
                }}
              />
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 min-h-[44px] min-w-[44px]"
                onPress={() => togglePasswordVisibility('new')}
                disabled={isChanging}
                aria-label={showPasswords.new ? t('profile.password.actions.hidePassword') : t('profile.password.actions.showPassword')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    togglePasswordVisibility('new')
                  }
                }}
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
              </Button>
            </div>

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div id="password-strength" className="space-y-2" role="status" aria-live="polite">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">
                    {t('profile.password.strength')}:
                  </span>
                  <span className={`text-xs sm:text-sm font-medium ${strengthLevel.color}`}>
                    {strengthLevel.label}
                  </span>
                </div>
                <Progress
                  value={(passwordStrength.score / 5) * 100}
                  className="w-full"
                  color={passwordStrength.isValid ? 'success' : 'warning'}
                  size="sm"
                  aria-label={`${t('profile.password.strength')}: ${strengthLevel.label}`}
                />
                
                {/* Password Requirements */}
                <div className="space-y-1" role="list" aria-label={t('profile.password.requirements')}>
                  {passwordStrength.feedback.map((feedback, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs" role="listitem">
                      <AlertCircle className="w-3 h-3 text-red-500" aria-hidden="true" />
                      <span className="text-red-600">{feedback}</span>
                    </div>
                  ))}
                  {passwordStrength.isValid && (
                    <div className="flex items-center gap-2 text-xs" role="listitem">
                      <CheckCircle className="w-3 h-3 text-green-500" aria-hidden="true" />
                      <span className="text-green-600">
                        {t('profile.password.strengthValid')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {errors.newPassword && (
              <p id="newPassword-error" className="text-xs sm:text-sm text-red-500 flex items-center gap-1" role="alert">
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                {errors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          {renderPasswordField(
            'confirmPassword',
            t('profile.password.fields.confirmPassword'),
            t('profile.password.placeholders.confirmPassword'),
            'confirm'
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              color="primary"
              variant="flat"
              isLoading={isChanging}
              disabled={isChanging || !passwordStrength.isValid || !formData.confirmPassword}
              startContent={<Shield className="w-4 h-4" aria-hidden="true" />}
              className="min-h-[44px] touch-manipulation"
              aria-label={t('profile.password.actions.changePassword')}
            >
              {t('profile.password.actions.changePassword')}
            </Button>
          </div>

          {/* Security Notice */}
          <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg" role="note" aria-label={t('profile.password.securityNotice.title')}>
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5" aria-hidden="true" />
              <div className="text-xs sm:text-sm text-blue-800">
                <p className="font-medium mb-1">
                  {t('profile.password.securityNotice.title')}
                </p>
                <p className="text-blue-700">
                  {t('profile.password.securityNotice.description')}
                </p>
              </div>
            </div>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}

export default PasswordChangeForm
