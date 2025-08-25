import React, { useState } from 'react'
import { Card, CardBody, Button, Input, Textarea, Chip } from '@heroui/react'
import { Edit, Save, X, User, Mail, Phone, MapPin, Calendar, FileText } from 'lucide-react'
import { useTranslation } from '../../../lib/stores/translationStore'
import { Profile, ProfileUpdateData, ProfileFormErrors } from '../../../interfaces/Profile'

interface ProfileInfoCardProps {
  profile: Profile
  onUpdate: (updateData: ProfileUpdateData) => Promise<void>
  isUpdating?: boolean
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({ 
  profile, 
  onUpdate, 
  isUpdating = false 
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<ProfileUpdateData>({
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone || '',
    bio: profile.bio || '',
    dateOfBirth: profile.dateOfBirth || '',
    location: profile.location || ''
  })
  const [errors, setErrors] = useState<ProfileFormErrors>({})

  const { t } = useTranslation(['profile', 'common'])

  const handleEdit = () => {
    setIsEditing(true)
    setFormData({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone || '',
      bio: profile.bio || '',
      dateOfBirth: profile.dateOfBirth || '',
      location: profile.location || ''
    })
    setErrors({})
  }

  const handleCancel = () => {
    setIsEditing(false)
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: ProfileFormErrors = {}

    if (!formData.firstName?.trim()) {
      newErrors.firstName = t('profile.validation.firstNameRequired')
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = t('profile.validation.lastNameRequired')
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = t('profile.validation.invalidPhone')
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = t('profile.validation.bioTooLong')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    try {
      await onUpdate(formData)
      setIsEditing(false)
      setErrors({})
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleInputChange = (field: keyof ProfileUpdateData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as keyof ProfileFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const renderField = (
    field: keyof ProfileUpdateData,
    label: string,
    icon: React.ReactNode,
    type: 'text' | 'textarea' = 'text',
    placeholder?: string
  ) => {
    const value = formData[field] || ''
    const error = errors[field as keyof ProfileFormErrors]

    return (
      <div className="space-y-2">
        <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
          {icon}
          {label}
        </label>
        {isEditing ? (
          <div className="space-y-1">
            {type === 'textarea' ? (
              <Textarea
                value={value}
                onChange={(e) => handleInputChange(field, e.target.value)}
                placeholder={placeholder}
                className={`w-full min-h-[44px] ${error ? 'border-red-500' : ''}`}
                maxLength={500}
                minRows={3}
                aria-describedby={error ? `${field}-error` : undefined}
                aria-invalid={!!error}
              />
            ) : (
              <Input
                type={type}
                value={value}
                onChange={(e) => handleInputChange(field, e.target.value)}
                placeholder={placeholder}
                className={`w-full min-h-[44px] ${error ? 'border-red-500' : ''}`}
                aria-describedby={error ? `${field}-error` : undefined}
                aria-invalid={!!error}
              />
            )}
            {error && (
              <p id={`${field}-error`} className="text-xs sm:text-sm text-red-500" role="alert">
                {error}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm sm:text-base text-gray-900 break-words">
            {value || t('common.notProvided')}
          </p>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full transition-all duration-200 hover:shadow-md">
      <CardBody className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-gray-600" aria-hidden="true" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              {t('profile.sections.personalInfo')}
            </h3>
          </div>
          {!isEditing ? (
            <Button 
              size="sm" 
              color="primary" 
              variant="flat"
              startContent={<Edit className="w-4 h-4" />}
              onPress={handleEdit}
              className="w-full sm:w-auto min-h-[44px] touch-manipulation"
              aria-label={t('profile.actions.editPersonalInfo')}
            >
              {t('common.edit')}
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <Button 
                size="sm" 
                color="success" 
                variant="flat"
                startContent={<Save className="w-4 h-4" />}
                onPress={handleSave}
                isLoading={isUpdating}
                disabled={isUpdating}
                className="w-full sm:w-auto min-h-[44px] touch-manipulation"
                aria-label={t('profile.actions.saveChanges')}
              >
                {t('common.save')}
              </Button>
              <Button 
                size="sm" 
                color="default" 
                variant="flat"
                startContent={<X className="w-4 h-4" />}
                onPress={handleCancel}
                disabled={isUpdating}
                className="w-full sm:w-auto min-h-[44px] touch-manipulation"
                aria-label={t('profile.actions.cancelChanges')}
              >
                {t('common.cancel')}
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {renderField(
              'firstName',
              t('profile.fields.firstName'),
              <User className="w-4 h-4" aria-hidden="true" />,
              'text',
              t('profile.placeholders.firstName')
            )}
            {renderField(
              'lastName',
              t('profile.fields.lastName'),
              <User className="w-4 h-4" aria-hidden="true" />,
              'text',
              t('profile.placeholders.lastName')
            )}
          </div>

          {/* Contact Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4" aria-hidden="true" />
                {t('profile.fields.email')}
              </label>
              <p className="text-gray-900 break-all">{profile.email}</p>
              <Chip size="sm" color="primary" variant="flat">
                {t('profile.fields.emailReadOnly')}
              </Chip>
            </div>
            {renderField(
              'phone',
              t('profile.fields.phone'),
              <Phone className="w-4 h-4" aria-hidden="true" />,
              'text',
              t('profile.placeholders.phone')
            )}
          </div>

          {/* Location and Date of Birth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {renderField(
              'location',
              t('profile.fields.location'),
              <MapPin className="w-4 h-4" aria-hidden="true" />,
              'text',
              t('profile.placeholders.location')
            )}
            {renderField(
              'dateOfBirth',
              t('profile.fields.dateOfBirth'),
              <Calendar className="w-4 h-4" aria-hidden="true" />,
              'text',
              t('profile.placeholders.dateOfBirth')
            )}
          </div>

          {/* Bio Field */}
          {renderField(
            'bio',
            t('profile.fields.bio'),
            <FileText className="w-4 h-4" aria-hidden="true" />,
            'textarea',
            t('profile.placeholders.bio')
          )}

          {/* Character Count for Bio */}
          {isEditing && formData.bio && (
            <div className="text-right">
              <span className={`text-sm ${formData.bio.length > 450 ? 'text-red-500' : 'text-gray-500'}`}>
                {formData.bio.length}/500
              </span>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  )
}

export default ProfileInfoCard
