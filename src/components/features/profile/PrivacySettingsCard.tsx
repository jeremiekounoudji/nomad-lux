import React, { useState, useEffect } from 'react'
import { Card, CardBody, Button, Switch, Select, SelectItem, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react'
import { Shield, Bell, Eye, EyeOff, Globe, Users, Settings, AlertTriangle, CheckCircle } from 'lucide-react'
import { useTranslation } from '../../../lib/stores/translationStore'
import { PrivacySettings, NotificationSettings, ProfilePreferences } from '../../../interfaces/Profile'
import toast from 'react-hot-toast'

interface PrivacySettingsCardProps {
  privacySettings: PrivacySettings
  notificationSettings: NotificationSettings
  preferences: ProfilePreferences
  onPrivacySettingsChange: (settings: PrivacySettings) => Promise<void>
  onNotificationSettingsChange: (settings: NotificationSettings) => Promise<void>
  onPreferencesChange: (preferences: ProfilePreferences) => Promise<void>
  isSaving?: boolean
}

const PrivacySettingsCard: React.FC<PrivacySettingsCardProps> = ({
  privacySettings,
  notificationSettings,
  preferences,
  onPrivacySettingsChange,
  onNotificationSettingsChange,
  onPreferencesChange,
  isSaving = false
}) => {
  const [localPrivacySettings, setLocalPrivacySettings] = useState<PrivacySettings>(privacySettings)
  const [localNotificationSettings, setLocalNotificationSettings] = useState<NotificationSettings>(notificationSettings)
  const [localPreferences, setLocalPreferences] = useState<ProfilePreferences>(preferences)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingChanges, setPendingChanges] = useState<{
    privacy?: PrivacySettings
    notifications?: NotificationSettings
    preferences?: ProfilePreferences
  }>({})

  const { t } = useTranslation(['profile', 'common'])

  // Update local state when props change
  useEffect(() => {
    setLocalPrivacySettings(privacySettings)
    setLocalNotificationSettings(notificationSettings)
    setLocalPreferences(preferences)
  }, [privacySettings, notificationSettings, preferences])

  // Handle privacy setting changes
  const handlePrivacyChange = (key: keyof PrivacySettings, value: any) => {
    const newSettings = { ...localPrivacySettings, [key]: value }
    setLocalPrivacySettings(newSettings)
    setPendingChanges(prev => ({ ...prev, privacy: newSettings }))
  }

  // Handle notification setting changes
  const handleNotificationChange = (category: keyof NotificationSettings, key: string, value: boolean) => {
    const newSettings = {
      ...localNotificationSettings,
      [category]: {
        ...localNotificationSettings[category],
        [key]: value
      }
    }
    setLocalNotificationSettings(newSettings)
    setPendingChanges(prev => ({ ...prev, notifications: newSettings }))
  }

  // Handle preference changes
  const handlePreferenceChange = (key: keyof ProfilePreferences, value: any) => {
    const newPreferences = { ...localPreferences, [key]: value }
    setLocalPreferences(newPreferences)
    setPendingChanges(prev => ({ ...prev, preferences: newPreferences }))
  }

  // Save all pending changes
  const saveChanges = async () => {
    try {
      const promises: Promise<void>[] = []

      if (pendingChanges.privacy) {
        promises.push(onPrivacySettingsChange(pendingChanges.privacy))
      }
      if (pendingChanges.notifications) {
        promises.push(onNotificationSettingsChange(pendingChanges.notifications))
      }
      if (pendingChanges.preferences) {
        promises.push(onPreferencesChange(pendingChanges.preferences))
      }

      await Promise.all(promises)
      setPendingChanges({})
      toast.success(t('profile.settings.savedSuccessfully'))
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error(t('profile.settings.saveError'))
    }
  }

  // Reset to defaults
  const resetToDefaults = async () => {
    const defaultPrivacySettings: PrivacySettings = {
      profileVisibility: 'public',
      showEmail: true,
      showPhone: false,
      showLocation: true,
      allowDataSharing: true,
      allowAnalytics: true
    }

    const defaultNotificationSettings: NotificationSettings = {
      emailNotifications: {
        bookingUpdates: true,
        newMessages: true,
        propertyApprovals: true,
        paymentConfirmations: true,
        marketing: false
      },
      pushNotifications: {
        bookingUpdates: true,
        newMessages: true,
        propertyApprovals: true,
        paymentConfirmations: true,
        marketing: false
      },
      smsNotifications: {
        bookingUpdates: false,
        paymentConfirmations: true
      }
    }

    const defaultPreferences: ProfilePreferences = {
      language: 'en',
      currency: 'USD',
      timezone: 'UTC',
      theme: 'auto'
    }

    try {
      await Promise.all([
        onPrivacySettingsChange(defaultPrivacySettings),
        onNotificationSettingsChange(defaultNotificationSettings),
        onPreferencesChange(defaultPreferences)
      ])

      setLocalPrivacySettings(defaultPrivacySettings)
      setLocalNotificationSettings(defaultNotificationSettings)
      setLocalPreferences(defaultPreferences)
      setPendingChanges({})
      setShowResetModal(false)
      toast.success(t('profile.settings.resetSuccessfully'))
    } catch (error) {
      console.error('Error resetting settings:', error)
      toast.error(t('profile.settings.resetError'))
    }
  }

  // Check if there are unsaved changes
  const hasUnsavedChanges = Object.keys(pendingChanges).length > 0

  return (
    <>
      <Card className="w-full">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {t('profile.sections.settings')}
              </h3>
            </div>
            <div className="flex space-x-2">
              {hasUnsavedChanges && (
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  onPress={saveChanges}
                  isLoading={isSaving}
                  disabled={isSaving}
                  startContent={<CheckCircle className="w-4 h-4" />}
                >
                  {t('common.save')}
                </Button>
              )}
              <Button
                size="sm"
                color="default"
                variant="flat"
                onPress={() => setShowResetModal(true)}
                disabled={isSaving}
                startContent={<AlertTriangle className="w-4 h-4" />}
              >
                {t('profile.settings.resetToDefaults')}
              </Button>
            </div>
          </div>

          <div className="space-y-8">
            {/* Privacy Settings */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-5 h-5 text-gray-600" />
                <h4 className="text-md font-semibold text-gray-900">
                  {t('profile.settings.privacy.title')}
                </h4>
              </div>
              
              <div className="space-y-4">
                {/* Profile Visibility */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {t('profile.settings.privacy.profileVisibility')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t('profile.settings.privacy.profileVisibilityDescription')}
                      </p>
                    </div>
                  </div>
                  <Select
                    size="sm"
                    value={localPrivacySettings.profileVisibility}
                    onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                    disabled={isSaving}
                    className="w-32"
                  >
                    <SelectItem key="public" value="public">
                      {t('profile.settings.privacy.visibility.public')}
                    </SelectItem>
                    <SelectItem key="private" value="private">
                      {t('profile.settings.privacy.visibility.private')}
                    </SelectItem>
                    <SelectItem key="friends" value="friends">
                      {t('profile.settings.privacy.visibility.friends')}
                    </SelectItem>
                  </Select>
                </div>

                <Divider />

                {/* Data Sharing Toggles */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {t('profile.settings.privacy.showEmail')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t('profile.settings.privacy.showEmailDescription')}
                        </p>
                      </div>
                    </div>
                    <Switch
                      isSelected={localPrivacySettings.showEmail}
                      onValueChange={(value) => handlePrivacyChange('showEmail', value)}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {t('profile.settings.privacy.showPhone')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t('profile.settings.privacy.showPhoneDescription')}
                        </p>
                      </div>
                    </div>
                    <Switch
                      isSelected={localPrivacySettings.showPhone}
                      onValueChange={(value) => handlePrivacyChange('showPhone', value)}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {t('profile.settings.privacy.showLocation')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t('profile.settings.privacy.showLocationDescription')}
                        </p>
                      </div>
                    </div>
                    <Switch
                      isSelected={localPrivacySettings.showLocation}
                      onValueChange={(value) => handlePrivacyChange('showLocation', value)}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {t('profile.settings.privacy.allowDataSharing')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t('profile.settings.privacy.allowDataSharingDescription')}
                        </p>
                      </div>
                    </div>
                    <Switch
                      isSelected={localPrivacySettings.allowDataSharing}
                      onValueChange={(value) => handlePrivacyChange('allowDataSharing', value)}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Settings className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {t('profile.settings.privacy.allowAnalytics')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t('profile.settings.privacy.allowAnalyticsDescription')}
                        </p>
                      </div>
                    </div>
                    <Switch
                      isSelected={localPrivacySettings.allowAnalytics}
                      onValueChange={(value) => handlePrivacyChange('allowAnalytics', value)}
                      disabled={isSaving}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Divider />

            {/* Notification Settings */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Bell className="w-5 h-5 text-gray-600" />
                <h4 className="text-md font-semibold text-gray-900">
                  {t('profile.settings.notifications.title')}
                </h4>
              </div>

              <div className="space-y-6">
                {/* Email Notifications */}
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-3">
                    {t('profile.settings.notifications.email')}
                  </h5>
                  <div className="space-y-3">
                    {Object.entries(localNotificationSettings.emailNotifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          {t(`profile.settings.notifications.types.${key}`)}
                        </span>
                        <Switch
                          isSelected={value}
                          onValueChange={(newValue) => handleNotificationChange('emailNotifications', key, newValue)}
                          disabled={isSaving}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Divider />

                {/* Push Notifications */}
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-3">
                    {t('profile.settings.notifications.push')}
                  </h5>
                  <div className="space-y-3">
                    {Object.entries(localNotificationSettings.pushNotifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          {t(`profile.settings.notifications.types.${key}`)}
                        </span>
                        <Switch
                          isSelected={value}
                          onValueChange={(newValue) => handleNotificationChange('pushNotifications', key, newValue)}
                          disabled={isSaving}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Divider />

                {/* SMS Notifications */}
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-3">
                    {t('profile.settings.notifications.sms')}
                  </h5>
                  <div className="space-y-3">
                    {Object.entries(localNotificationSettings.smsNotifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          {t(`profile.settings.notifications.types.${key}`)}
                        </span>
                        <Switch
                          isSelected={value}
                          onValueChange={(newValue) => handleNotificationChange('smsNotifications', key, newValue)}
                          disabled={isSaving}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Divider />

            {/* Preferences */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="w-5 h-5 text-gray-600" />
                <h4 className="text-md font-semibold text-gray-900">
                  {t('profile.settings.preferences.title')}
                </h4>
              </div>

              <div className="space-y-4">
                {/* Language */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {t('profile.settings.preferences.language')}
                  </span>
                  <Select
                    size="sm"
                    value={localPreferences.language}
                    onChange={(e) => handlePreferenceChange('language', e.target.value)}
                    disabled={isSaving}
                    className="w-32"
                  >
                    <SelectItem key="en" value="en">English</SelectItem>
                    <SelectItem key="fr" value="fr">Français</SelectItem>
                    <SelectItem key="es" value="es">Español</SelectItem>
                  </Select>
                </div>

                {/* Currency */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {t('profile.settings.preferences.currency')}
                  </span>
                  <Select
                    size="sm"
                    value={localPreferences.currency}
                    onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                    disabled={isSaving}
                    className="w-32"
                  >
                    <SelectItem key="USD" value="USD">USD ($)</SelectItem>
                    <SelectItem key="EUR" value="EUR">EUR (€)</SelectItem>
                    <SelectItem key="GBP" value="GBP">GBP (£)</SelectItem>
                    <SelectItem key="CAD" value="CAD">CAD (C$)</SelectItem>
                  </Select>
                </div>

                {/* Theme */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {t('profile.settings.preferences.theme')}
                  </span>
                  <Select
                    size="sm"
                    value={localPreferences.theme}
                    onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                    disabled={isSaving}
                    className="w-32"
                  >
                    <SelectItem key="light" value="light">
                      {t('profile.settings.preferences.theme.light')}
                    </SelectItem>
                    <SelectItem key="dark" value="dark">
                      {t('profile.settings.preferences.theme.dark')}
                    </SelectItem>
                    <SelectItem key="auto" value="auto">
                      {t('profile.settings.preferences.theme.auto')}
                    </SelectItem>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Reset to Defaults Modal */}
      <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)}>
        <ModalContent>
          <ModalHeader>
            {t('profile.settings.resetModal.title')}
          </ModalHeader>
          <ModalBody>
            <p className="text-gray-600">
              {t('profile.settings.resetModal.description')}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="flat"
              onPress={() => setShowResetModal(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              color="danger"
              variant="flat"
              onPress={resetToDefaults}
              isLoading={isSaving}
              disabled={isSaving}
            >
              {t('profile.settings.resetModal.confirm')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default PrivacySettingsCard
