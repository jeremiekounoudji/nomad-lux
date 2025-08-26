import React, { useState } from 'react'
import { Card, CardBody, Button, Input, Progress, Chip } from '@heroui/react'
import { Eye, EyeOff, Shield, CheckCircle, AlertCircle, Lock, Key } from 'lucide-react'
import { useTranslation } from '../../../lib/stores/translationStore'

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
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [] as string[]
  })

  const { t } = useTranslation(['profile', 'common'])

  const validatePassword = (password: string) => {
    const feedback: string[] = []
    let score = 0

    if (password.length >= 8) {
      score += 1
      feedback.push(t('profile.password.requirements.length'))
    } else {
      feedback.push(t('profile.password.requirements.lengthMissing'))
    }

    if (/[A-Z]/.test(password)) {
      score += 1
      feedback.push(t('profile.password.requirements.uppercase'))
    } else {
      feedback.push(t('profile.password.requirements.uppercaseMissing'))
    }

    if (/[a-z]/.test(password)) {
      score += 1
      feedback.push(t('profile.password.requirements.lowercase'))
    } else {
      feedback.push(t('profile.password.requirements.lowercaseMissing'))
    }

    if (/[0-9]/.test(password)) {
      score += 1
      feedback.push(t('profile.password.requirements.number'))
    } else {
      feedback.push(t('profile.password.requirements.numberMissing'))
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1
      feedback.push(t('profile.password.requirements.special'))
    } else {
      feedback.push(t('profile.password.requirements.specialMissing'))
    }

    return { score, feedback }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }

    // Update password strength for new password
    if (field === 'newPassword') {
      const strength = validatePassword(value)
      setPasswordStrength(strength)
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = t('profile.password.validation.currentRequired')
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = t('profile.password.validation.newRequired')
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = t('profile.password.validation.tooShort')
    } else if (passwordStrength.score < 3) {
      newErrors.newPassword = t('profile.password.validation.tooWeak')
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = t('profile.password.validation.confirmRequired')
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t('profile.password.validation.mismatch')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

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
      setShowPasswords({
        current: false,
        new: false,
        confirm: false
      })
      setErrors({})
      setPasswordStrength({ score: 0, feedback: [] })
    } catch (error) {
      console.error('Error changing password:', error)
    }
  }

  const getStrengthColor = (score: number) => {
    if (score <= 1) return 'danger'
    if (score <= 2) return 'warning'
    if (score <= 3) return 'secondary'
    if (score <= 4) return 'primary'
    return 'success'
  }

  const getStrengthLabel = (score: number) => {
    if (score <= 1) return t('profile.password.strength.veryWeak')
    if (score <= 2) return t('profile.password.strength.weak')
    if (score <= 3) return t('profile.password.strength.fair')
    if (score <= 4) return t('profile.password.strength.good')
    return t('profile.password.strength.strong')
  }

  const renderPasswordField = (
    field: 'currentPassword' | 'newPassword' | 'confirmPassword',
    label: string,
    icon: React.ReactNode,
    placeholder: string,
    showField: 'current' | 'new' | 'confirm'
  ) => {
    const hasError = errors[field]
    const value = formData[field]

    return (
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2" htmlFor={field}>
          {icon}
          <span>{label}</span>
        </label>
        <div className="relative">
          <Input
            id={field}
            type={showPasswords[showField] ? 'text' : 'password'}
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            className={`min-h-[44px] pr-12 ${hasError ? 'border-red-500' : ''}`}
            aria-describedby={hasError ? `${field}-error` : undefined}
            aria-invalid={hasError ? 'true' : 'false'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && field !== 'confirmPassword') {
                e.preventDefault()
                const nextField = field === 'currentPassword' ? 'newPassword' : 'confirmPassword'
                document.getElementById(nextField)?.focus()
              }
            }}
          />
          <Button
            id={`${field}-toggle`}
            isIconOnly
            size="sm"
            variant="light"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 min-h-[44px] min-w-[44px]"
            onPress={() => togglePasswordVisibility(showField)}
            aria-label={showPasswords[showField] ? t('profile.password.hide') : t('profile.password.show')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                togglePasswordVisibility(showField)
              }
            }}
          >
            {showPasswords[showField] ? (
              <EyeOff className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Eye className="w-4 h-4" aria-hidden="true" />
            )}
          </Button>
        </div>
        {hasError && (
          <p id={`${field}-error`} className="text-sm text-red-600 flex items-center space-x-1" role="alert">
            <AlertCircle className="w-4 h-4" aria-hidden="true" />
            <span>{hasError}</span>
          </p>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardBody className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" aria-hidden="true" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              {t('profile.sections.security')}
            </h3>
          </div>
        </div>

        <form role="form" aria-label={t('profile.password.formTitle')} onSubmit={handleSubmit} className="space-y-6">
          {renderPasswordField(
            'currentPassword',
            t('profile.password.fields.current'),
            <Lock className="w-4 h-4 text-gray-500" aria-hidden="true" />,
            t('profile.password.placeholders.current'),
            'current'
          )}

          <div className="space-y-4">
            {renderPasswordField(
              'newPassword',
              t('profile.password.fields.new'),
              <Key className="w-4 h-4 text-gray-500" aria-hidden="true" />,
              t('profile.password.placeholders.new'),
              'new'
            )}

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div id="password-strength" className="space-y-3" role="status" aria-live="polite">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {t('profile.password.strength.label')}
                  </span>
                  <Chip 
                    size="sm" 
                    color={getStrengthColor(passwordStrength.score)}
                    variant="flat"
                  >
                    {getStrengthLabel(passwordStrength.score)}
                  </Chip>
                </div>
                <Progress 
                  value={(passwordStrength.score / 5) * 100} 
                  color={getStrengthColor(passwordStrength.score)}
                  className="w-full"
                  aria-label={`${passwordStrength.score} out of 5 strength requirements met`}
                />
                
                {/* Password Requirements */}
                <div role="list" className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700">
                    {t('profile.password.requirements.title')}
                  </h4>
                  {passwordStrength.feedback.map((feedback, index) => (
                    <div 
                      key={index} 
                      className="flex items-center space-x-2 text-sm"
                      role="listitem"
                    >
                      {feedback.includes('Missing') ? (
                        <AlertCircle className="w-4 h-4 text-red-500" aria-hidden="true" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500" aria-hidden="true" />
                      )}
                      <span className={feedback.includes('Missing') ? 'text-red-600' : 'text-green-600'}>
                        {feedback}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {renderPasswordField(
              'confirmPassword',
              t('profile.password.fields.confirm'),
              <Key className="w-4 h-4 text-gray-500" aria-hidden="true" />,
              t('profile.password.placeholders.confirm'),
              'confirm'
            )}
          </div>

          <Button
            type="submit"
            color="success"
            variant="solid"
            size="lg"
            isLoading={isChanging}
            disabled={isChanging}
            className="w-full font-semibold min-h-[44px] touch-manipulation"
            aria-label={t('profile.password.actions.change')}
          >
            {t('profile.password.actions.change')}
          </Button>
        </form>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg" role="note" aria-label={t('profile.password.security.title')}>
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-blue-900">
                {t('profile.password.security.title')}
              </h4>
              <p className="text-sm text-blue-700 leading-relaxed">
                {t('profile.password.security.description')}
              </p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export default PasswordChangeForm
