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

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Lock className="w-4 h-4" />
          {label}
        </label>
        <div className="relative">
          <Input
            type={isVisible ? 'text' : 'password'}
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            className={`w-full pr-10 ${error ? 'border-red-500' : ''}`}
            disabled={isChanging}
          />
          <Button
            isIconOnly
            size="sm"
            variant="light"
            className="absolute right-1 top-1/2 transform -translate-y-1/2"
            onPress={() => togglePasswordVisibility(showKey)}
            disabled={isChanging}
          >
            {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
        {error && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardBody className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Shield className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {t('profile.sections.passwordChange')}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          {renderPasswordField(
            'currentPassword',
            t('profile.password.fields.currentPassword'),
            t('profile.password.placeholders.currentPassword'),
            'current'
          )}

          {/* New Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              {t('profile.password.fields.newPassword')}
            </label>
            <div className="relative">
              <Input
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                placeholder={t('profile.password.placeholders.newPassword')}
                className={`w-full pr-10 ${errors.newPassword ? 'border-red-500' : ''}`}
                disabled={isChanging}
              />
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
                onPress={() => togglePasswordVisibility('new')}
                disabled={isChanging}
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {t('profile.password.strength')}:
                  </span>
                  <span className={`text-sm font-medium ${strengthLevel.color}`}>
                    {strengthLevel.label}
                  </span>
                </div>
                <Progress
                  value={(passwordStrength.score / 5) * 100}
                  className="w-full"
                  color={passwordStrength.isValid ? 'success' : 'warning'}
                  size="sm"
                />
                
                {/* Password Requirements */}
                <div className="space-y-1">
                  {passwordStrength.feedback.map((feedback, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <span className="text-red-600">{feedback}</span>
                    </div>
                  ))}
                  {passwordStrength.isValid && (
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-green-600">
                        {t('profile.password.strengthValid')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {errors.newPassword && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
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
              startContent={<Shield className="w-4 h-4" />}
            >
              {t('profile.password.actions.changePassword')}
            </Button>
          </div>

          {/* Security Notice */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
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
