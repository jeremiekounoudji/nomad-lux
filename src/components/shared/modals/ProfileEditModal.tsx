import React, { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Avatar,
  Select,
  SelectItem,
  Switch,
  Divider
} from '@heroui/react'
import { User, Mail, Phone, MapPin, Calendar, Camera, Eye, EyeOff } from 'lucide-react'
import { ProfileEditModalProps } from '../../../interfaces/Component'
import { useTranslation } from '../../../lib/stores/translationStore'

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave
}) => {
  const { t } = useTranslation(['profile', 'common'])
  const [formData, setFormData] = useState({
    name: user.display_name || '',
    email: user.email || '',
    phone: user.phone || '',
    bio: user.bio || '',
    location: user.location || '',
          dateOfBirth: user.date_of_birth || '',
      preferredLanguage: 'English',
      emailNotifications: true,
      smsNotifications: true,
      profileVisibility: 'public'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  const languageOptions = [
    { key: 'English', label: t('profile.languages.english') },
    { key: 'Spanish', label: t('profile.languages.spanish') },
    { key: 'French', label: t('profile.languages.french') },
    { key: 'German', label: t('profile.languages.german') },
    { key: 'Italian', label: t('profile.languages.italian') },
    { key: 'Portuguese', label: t('profile.languages.portuguese') },
    { key: 'Chinese', label: t('profile.languages.chinese') },
    { key: 'Japanese', label: t('profile.languages.japanese') },
    { key: 'Korean', label: t('profile.languages.korean') },
    { key: 'Arabic', label: t('profile.languages.arabic') },
    { key: 'Hindi', label: t('profile.languages.hindi') },
    { key: 'Russian', label: t('profile.languages.russian') }
  ]

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswords(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Validate password fields if changing password
      if (showPasswordFields) {
        if (!passwords.current || !passwords.new || !passwords.confirm) {
          alert(t('profile.edit.validation.fillAllPasswordFields'))
          return
        }
        if (passwords.new !== passwords.confirm) {
          alert(t('profile.edit.validation.passwordsDoNotMatch'))
          return
        }
        if (passwords.new.length < 8) {
          alert(t('profile.edit.validation.passwordTooShort'))
          return
        }
      }

      const updatedData = { ...formData }
      if (showPasswordFields) {
        // In a real app, you would handle password change separately
        // updatedData.password = passwords.new
      }

      await onSave(updatedData)
      handleClose()
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: user.display_name || '',
      email: user.email || '',
      phone: user.phone || '',
      bio: user.bio || '',
      location: user.location || '',
      dateOfBirth: user.date_of_birth || '',
      preferredLanguage: 'English',
      emailNotifications: true,
      smsNotifications: true,
      profileVisibility: 'public'
    })
    setPasswords({ current: '', new: '', confirm: '' })
    setShowPasswordFields(false)
    onClose()
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <User className="size-6 text-primary-500" />
                <h2 className="text-xl font-bold">{t('profile.edit.title')}</h2>
              </div>
              <p className="text-sm text-gray-600">{t('profile.edit.subtitle')}</p>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-4">
                  <Avatar src={user.avatar_url} size="lg" />
                  <div>
                    <h4 className="font-semibold">{t('profile.edit.picture.title')}</h4>
                    <p className="mb-2 text-sm text-gray-600">{t('profile.edit.picture.upload')}</p>
                    <Button
                      size="sm"
                      variant="flat"
                      color="secondary"
                      startContent={<Camera className="size-4" />}
                    >
                      {t('profile.edit.picture.changePhoto')}
                    </Button>
                  </div>
                </div>

                <Divider />

                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold">{t('profile.edit.basic.title')}</h4>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                      label={t('profile.edit.basic.fullName')}
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      startContent={<User className="size-4 text-gray-400" />}
                      isRequired
                    />
                    
                    <Input
                      label={t('profile.edit.basic.email')}
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      startContent={<Mail className="size-4 text-gray-400" />}
                      isRequired
                    />
                    
                    <Input
                      label={t('profile.edit.basic.phone')}
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      startContent={<Phone className="size-4 text-gray-400" />}
                    />
                    
                    <Input
                      label={t('profile.edit.basic.location')}
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      startContent={<MapPin className="size-4 text-gray-400" />}
                    />
                    
                    <Input
                      label={t('profile.edit.basic.dateOfBirth')}
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      startContent={<Calendar className="size-4 text-gray-400" />}
                    />
                    
                    <Select
                      label={t('profile.edit.basic.preferredLanguage')}
                      selectedKeys={[formData.preferredLanguage]}
                      onSelectionChange={(keys) => handleInputChange('preferredLanguage', Array.from(keys)[0] as string)}
                    >
                      {languageOptions.map((language) => (
                        <SelectItem key={language.key}>
                          {language.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                  
                  <Textarea
                    label={t('profile.edit.basic.bio')}
                    placeholder={t('profile.edit.basic.bioPlaceholder')}
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    minRows={3}
                    maxRows={5}
                  />
                </div>

                <Divider />

                {/* Password Change */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{t('profile.edit.security.title')}</h4>
                    <Switch
                      size="sm"
                      isSelected={showPasswordFields}
                      onValueChange={setShowPasswordFields}
                      color="primary"
                    >
                      {t('profile.edit.security.changePassword')}
                    </Switch>
                  </div>
                  
                  {showPasswordFields && (
                    <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                      <Input
                        label={t('profile.edit.security.currentPassword')}
                        type="password"
                        value={passwords.current}
                        onChange={(e) => handlePasswordChange('current', e.target.value)}
                        startContent={<Eye className="size-4 text-gray-400" />}
                        isRequired
                      />
                      <Input
                        label={t('profile.edit.security.newPassword')}
                        type="password"
                        value={passwords.new}
                        onChange={(e) => handlePasswordChange('new', e.target.value)}
                        startContent={<EyeOff className="size-4 text-gray-400" />}
                        isRequired
                      />
                      <Input
                        label={t('profile.edit.security.confirmNewPassword')}
                        type="password"
                        value={passwords.confirm}
                        onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                        startContent={<EyeOff className="size-4 text-gray-400" />}
                        isRequired
                      />
                    </div>
                  )}
                </div>

                <Divider />

                {/* Privacy & Notifications */}
                <div className="space-y-4">
                  <h4 className="font-semibold">{t('profile.edit.privacy.title')}</h4>
                  
                  <Select
                    label={t('profile.edit.privacy.profileVisibility')}
                    selectedKeys={[formData.profileVisibility]}
                    onSelectionChange={(keys) => handleInputChange('profileVisibility', Array.from(keys)[0] as string)}
                    description={t('profile.edit.privacy.profileVisibilityDescription')}
                  >
                    <SelectItem key="public">{t('profile.edit.privacy.visibility.public')}</SelectItem>
                    <SelectItem key="hosts-only">{t('profile.edit.privacy.visibility.hostsOnly')}</SelectItem>
                    <SelectItem key="private">{t('profile.edit.privacy.visibility.private')}</SelectItem>
                  </Select>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t('profile.edit.privacy.emailNotifications')}</p>
                        <p className="text-sm text-gray-600">{t('profile.edit.privacy.emailDescription')}</p>
                      </div>
                      <Switch
                        isSelected={formData.emailNotifications}
                        onValueChange={(checked) => handleInputChange('emailNotifications', checked)}
                        color="primary"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t('profile.edit.privacy.smsNotifications')}</p>
                        <p className="text-sm text-gray-600">{t('profile.edit.privacy.smsDescription')}</p>
                      </div>
                      <Switch
                        isSelected={formData.smsNotifications}
                        onValueChange={(checked) => handleInputChange('smsNotifications', checked)}
                        color="primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={handleClose}>
                {t('common.buttons.cancel')}
              </Button>
              <Button 
                color="primary" 
                onPress={handleSave}
                isLoading={isLoading}
              >
                {isLoading ? t('common.messages.saving') : t('profile.edit.saveChanges')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
} 