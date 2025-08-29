import React, { useState } from 'react'
import { Card, CardBody, Button, Input, Textarea } from '@heroui/react'
import { Edit, Save, X, User, Mail, Phone, MapPin, Calendar, FileText, CheckCircle } from 'lucide-react'
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
    const hasError = errors[field as keyof ProfileFormErrors]
    const value = formData[field] || ''

    return (
      <div className="space-y-2">
        <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
          {icon}
          <span>{label}</span>
        </label>
        {type === 'textarea' ? (
          <Textarea
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            className={`min-h-[44px] ${hasError ? 'border-red-500' : ''}`}
            aria-describedby={hasError ? `${field}-error` : undefined}
            aria-invalid={hasError ? 'true' : 'false'}
          />
        ) : (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            className={`min-h-[44px] ${hasError ? 'border-red-500' : ''}`}
            aria-describedby={hasError ? `${field}-error` : undefined}
            aria-invalid={hasError ? 'true' : 'false'}
          />
        )}
        {hasError && (
          <p id={`${field}-error`} className="text-sm text-red-600" role="alert">
            {hasError}
          </p>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full border-0 bg-white/80 shadow-lg backdrop-blur-sm">
      <CardBody className="p-6 sm:p-8">
        <div className="mb-6 flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
              <User className="size-5 text-blue-600" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 sm:text-xl">
              {t('profile.sections.personalInfo')}
            </h3>
          </div>
          {!isEditing ? (
            <Button 
              size="sm" 
              color="primary" 
              variant="flat"
              startContent={<Edit className="size-4" />}
              onPress={handleEdit}
              className="self-start font-semibold sm:self-auto"
              aria-label={t('profile.actions.editPersonalInfo')}
            >
              {t('common.edit')}
            </Button>
          ) : (
            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <Button 
                size="sm" 
                color="success" 
                variant="flat"
                startContent={<Save className="size-4" />}
                onPress={handleSave}
                isLoading={isUpdating}
                className="font-semibold"
                aria-label={t('common.save')}
              >
                {t('common.save')}
              </Button>
              <Button 
                size="sm" 
                color="danger" 
                variant="light"
                startContent={<X className="size-4" />}
                onPress={handleCancel}
                className="font-semibold"
                aria-label={t('common.cancel')}
              >
                {t('common.cancel')}
              </Button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {renderField(
                'firstName',
                t('profile.fields.firstName'),
                <User className="size-4 text-gray-500" aria-hidden="true" />,
                'text',
                t('profile.placeholders.firstName')
              )}
              {renderField(
                'lastName',
                t('profile.fields.lastName'),
                <User className="size-4 text-gray-500" aria-hidden="true" />,
                'text',
                t('profile.placeholders.lastName')
              )}
              {renderField(
                'phone',
                t('profile.fields.phone'),
                <Phone className="size-4 text-gray-500" aria-hidden="true" />,
                'text',
                t('profile.placeholders.phone')
              )}
              {renderField(
                'location',
                t('profile.fields.location'),
                <MapPin className="size-4 text-gray-500" aria-hidden="true" />,
                'text',
                t('profile.placeholders.location')
              )}
            </div>
            {renderField(
              'bio',
              t('profile.fields.bio'),
              <FileText className="size-4 text-gray-500" aria-hidden="true" />,
              'textarea',
              t('profile.placeholders.bio')
            )}
            {renderField(
              'dateOfBirth',
              t('profile.fields.dateOfBirth'),
              <Calendar className="size-4 text-gray-500" aria-hidden="true" />,
              'text',
              t('profile.placeholders.dateOfBirth')
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <User className="size-4 text-gray-500" aria-hidden="true" />
                  <span>{t('profile.fields.firstName')}</span>
                </label>
                <div className="flex items-center space-x-2">
                  <p className="flex-1 rounded-lg bg-gray-50 px-3 py-2 text-base text-gray-900">
                    {profile.firstName || t('common.notProvided')}
                  </p>
                  {profile.firstName && (
                    <CheckCircle className="size-4 text-green-500" aria-hidden="true" />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <Mail className="size-4 text-gray-500" aria-hidden="true" />
                  <span>{t('profile.fields.email')}</span>
                </label>
                <div className="flex items-center space-x-2">
                  <p className="flex-1 break-all rounded-lg bg-gray-50 px-3 py-2 text-base text-gray-900">
                    {profile.email}
                  </p>
                  <CheckCircle className="size-4 text-green-500" aria-hidden="true" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <User className="size-4 text-gray-500" aria-hidden="true" />
                  <span>{t('profile.fields.lastName')}</span>
                </label>
                <div className="flex items-center space-x-2">
                  <p className="flex-1 rounded-lg bg-gray-50 px-3 py-2 text-base text-gray-900">
                    {profile.lastName || t('common.notProvided')}
                  </p>
                  {profile.lastName && (
                    <CheckCircle className="size-4 text-green-500" aria-hidden="true" />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <Phone className="size-4 text-gray-500" aria-hidden="true" />
                  <span>{t('profile.fields.phone')}</span>
                </label>
                <div className="flex items-center space-x-2">
                  <p className="flex-1 rounded-lg bg-gray-50 px-3 py-2 text-base text-gray-900">
                    {profile.phone || t('common.notProvided')}
                  </p>
                  {profile.phone && (
                    <CheckCircle className="size-4 text-green-500" aria-hidden="true" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {!isEditing && profile.bio && (
          <div className="mt-6 space-y-2">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
              <FileText className="size-4 text-gray-500" aria-hidden="true" />
              <span>{t('profile.fields.bio')}</span>
            </label>
            <div className="flex items-start space-x-2">
              <p className="flex-1 rounded-lg bg-gray-50 px-3 py-2 text-base text-gray-900">
                {profile.bio}
              </p>
              <CheckCircle className="mt-2 size-4 text-green-500" aria-hidden="true" />
            </div>
          </div>
        )}

        {!isEditing && profile.location && (
          <div className="mt-6 space-y-2">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
              <MapPin className="size-4 text-gray-500" aria-hidden="true" />
              <span>{t('profile.fields.location')}</span>
            </label>
            <div className="flex items-center space-x-2">
              <p className="flex-1 rounded-lg bg-gray-50 px-3 py-2 text-base text-gray-900">
                {profile.location}
              </p>
              <CheckCircle className="size-4 text-green-500" aria-hidden="true" />
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export default ProfileInfoCard
