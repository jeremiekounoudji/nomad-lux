import React, { useState } from 'react'
import { Card, CardBody, Button, Switch, Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react'
import { Settings, Bell, Globe, Save, RotateCcw, AlertTriangle } from 'lucide-react'
import { useTranslation } from '../../../lib/stores/translationStore'
import { PrivacySettings, NotificationSettings, ProfilePreferences } from '../../../interfaces/Profile'
import toast from 'react-hot-toast'

interface PrivacySettingsCardProps {
  onPrivacySettingsChange?: (settings: PrivacySettings) => Promise<void>
  onNotificationSettingsChange?: (settings: NotificationSettings) => Promise<void>
  onPreferencesChange?: (preferences: ProfilePreferences) => Promise<void>
}

const PrivacySettingsCard: React.FC<PrivacySettingsCardProps> = ({
  onPrivacySettingsChange,
  onNotificationSettingsChange,
  onPreferencesChange
}) => {
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showEmail: true,
    showPhone: false,
    showLocation: true,
    allowDataSharing: true,
    allowAnalytics: true
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
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
  })

  const [preferences, setPreferences] = useState<ProfilePreferences>({
    language: 'en',
    currency: 'USD',
    timezone: 'UTC',
    theme: 'auto'
  })

  const [showResetModal, setShowResetModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const { t } = useTranslation(['profile', 'common'])

  const handlePrivacyChange = (key: keyof PrivacySettings, value: any) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }))
  }

  const handleNotificationChange = (type: 'email' | 'push' | 'sms', key: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [`${type}Notifications`]: {
        ...prev[`${type}Notifications` as keyof NotificationSettings],
        [key]: value
      }
    }))
  }

  const handlePreferenceChange = (key: keyof ProfilePreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const saveChanges = async () => {
    setIsSaving(true)
    try {
      const promises = []
      
      if (onPrivacySettingsChange) {
        promises.push(onPrivacySettingsChange(privacySettings))
      }
      
      if (onNotificationSettingsChange) {
        promises.push(onNotificationSettingsChange(notificationSettings))
      }
      
      if (onPreferencesChange) {
        promises.push(onPreferencesChange(preferences))
      }

      await Promise.all(promises)
      toast.success(t('profile.settings.saveSuccess'))
      
      // Focus on save button after success
      const saveButton = document.querySelector('[data-focus-after-save]') as HTMLElement
      if (saveButton) {
        saveButton.focus()
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error(t('profile.settings.saveError'))
    } finally {
      setIsSaving(false)
    }
  }

  const resetToDefaults = () => {
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

    setPrivacySettings(defaultPrivacySettings)
    setNotificationSettings(defaultNotificationSettings)
    setPreferences(defaultPreferences)
    setShowResetModal(false)
    toast.success(t('profile.settings.resetSuccess'))
  }

  const announceToScreenReader = (message: string) => {
    const srAnnouncements = document.getElementById('sr-announcements')
    if (srAnnouncements) {
      srAnnouncements.textContent = message
    }
  }

  return (
    <>
      <Card className="w-full border-0 bg-white/80 shadow-lg backdrop-blur-sm">
        <CardBody className="p-6 sm:p-8">
          <div className="mb-6 flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-purple-100">
                <Settings className="size-5 text-purple-600" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 sm:text-xl">
                {t('profile.sections.privacy')}
              </h3>
            </div>
            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <Button 
                size="sm" 
                color="secondary" 
                variant="flat"
                startContent={<RotateCcw className="size-4" />}
                onPress={() => setShowResetModal(true)}
                className="font-semibold"
                aria-label={t('profile.settings.actions.reset')}
              >
                {t('profile.settings.actions.reset')}
              </Button>
              <Button 
                size="sm" 
                color="primary" 
                variant="flat"
                startContent={<Save className="size-4" />}
                onPress={saveChanges}
                isLoading={isSaving}
                disabled={isSaving}
                data-focus-after-save
                className="min-h-[44px] touch-manipulation font-semibold"
                aria-label={t('profile.settings.actions.save')}
              >
                {t('profile.settings.actions.save')}
              </Button>
            </div>
          </div>

          <div className="space-y-8">
            {/* Privacy Settings */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Globe className="size-5 text-gray-600" aria-hidden="true" />
                <h4 className="text-base font-semibold text-gray-900">
                  {t('profile.privacy.title')}
                </h4>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      {t('profile.privacy.profileVisibility')}
                    </label>
                    <p className="text-xs text-gray-500">
                      {t('profile.privacy.profileVisibilityDescription')}
                    </p>
                  </div>
                  <Select
                    selectedKeys={[privacySettings.profileVisibility]}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string
                      handlePrivacyChange('profileVisibility', value)
                    }}
                    className="w-32"
                    aria-label={t('profile.privacy.profileVisibility')}
                    onFocus={() => announceToScreenReader(`${t('profile.privacy.profileVisibility')}: ${privacySettings.profileVisibility}`)}
                  >
                    <SelectItem key="public">
                      {t('profile.privacy.visibility.public')}
                    </SelectItem>
                    <SelectItem key="private">
                      {t('profile.privacy.visibility.private')}
                    </SelectItem>
                    <SelectItem key="friends">
                      {t('profile.privacy.visibility.friends')}
                    </SelectItem>
                  </Select>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      {t('profile.privacy.showEmail')}
                    </label>
                    <p className="text-xs text-gray-500">
                      {t('profile.privacy.showEmailDescription')}
                    </p>
                  </div>
                  <Switch
                    isSelected={privacySettings.showEmail}
                    onValueChange={(value) => handlePrivacyChange('showEmail', value)}
                    aria-label={t('profile.privacy.showEmail')}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      {t('profile.privacy.showPhone')}
                    </label>
                    <p className="text-xs text-gray-500">
                      {t('profile.privacy.showPhoneDescription')}
                    </p>
                  </div>
                  <Switch
                    isSelected={privacySettings.showPhone}
                    onValueChange={(value) => handlePrivacyChange('showPhone', value)}
                    aria-label={t('profile.privacy.showPhone')}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      {t('profile.privacy.showLocation')}
                    </label>
                    <p className="text-xs text-gray-500">
                      {t('profile.privacy.showLocationDescription')}
                    </p>
                  </div>
                  <Switch
                    isSelected={privacySettings.showLocation}
                    onValueChange={(value) => handlePrivacyChange('showLocation', value)}
                    aria-label={t('profile.privacy.showLocation')}
                  />
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Bell className="size-5 text-gray-600" aria-hidden="true" />
                <h4 className="text-base font-semibold text-gray-900">
                  {t('profile.notifications.title')}
                </h4>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      {t('profile.notifications.email')}
                    </label>
                    <p className="text-xs text-gray-500">
                      {t('profile.notifications.emailDescription')}
                    </p>
                  </div>
                  <Switch
                    isSelected={notificationSettings.emailNotifications.bookingUpdates}
                    onValueChange={(value) => handleNotificationChange('email', 'bookingUpdates', value)}
                    aria-label={t('profile.notifications.email')}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      {t('profile.notifications.push')}
                    </label>
                    <p className="text-xs text-gray-500">
                      {t('profile.notifications.pushDescription')}
                    </p>
                  </div>
                  <Switch
                    isSelected={notificationSettings.pushNotifications.bookingUpdates}
                    onValueChange={(value) => handleNotificationChange('push', 'bookingUpdates', value)}
                    aria-label={t('profile.notifications.push')}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      {t('profile.notifications.sms')}
                    </label>
                    <p className="text-xs text-gray-500">
                      {t('profile.notifications.smsDescription')}
                    </p>
                  </div>
                  <Switch
                    isSelected={notificationSettings.smsNotifications.paymentConfirmations}
                    onValueChange={(value) => handleNotificationChange('sms', 'paymentConfirmations', value)}
                    aria-label={t('profile.notifications.sms')}
                  />
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Settings className="size-5 text-gray-600" aria-hidden="true" />
                <h4 className="text-base font-semibold text-gray-900">
                  {t('profile.preferences.title')}
                </h4>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t('profile.preferences.language')}
                  </label>
                  <Select
                    selectedKeys={[preferences.language]}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string
                      handlePreferenceChange('language', value)
                    }}
                    aria-label={t('profile.preferences.language')}
                    onFocus={() => announceToScreenReader(`${t('profile.preferences.language')}: ${preferences.language}`)}
                  >
                    <SelectItem key="en">English</SelectItem>
                    <SelectItem key="es">Español</SelectItem>
                    <SelectItem key="fr">Français</SelectItem>
                    <SelectItem key="de">Deutsch</SelectItem>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t('profile.preferences.currency')}
                  </label>
                  <Select
                    selectedKeys={[preferences.currency]}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string
                      handlePreferenceChange('currency', value)
                    }}
                    aria-label={t('profile.preferences.currency')}
                    onFocus={() => announceToScreenReader(`${t('profile.preferences.currency')}: ${preferences.currency}`)}
                  >
                    <SelectItem key="USD">USD ($)</SelectItem>
                    <SelectItem key="EUR">EUR (€)</SelectItem>
                    <SelectItem key="GBP">GBP (£)</SelectItem>
                    <SelectItem key="JPY">JPY (¥)</SelectItem>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t('profile.preferences.timezone')}
                  </label>
                  <Select
                    selectedKeys={[preferences.timezone]}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string
                      handlePreferenceChange('timezone', value)
                    }}
                    aria-label={t('profile.preferences.timezone')}
                    onFocus={() => announceToScreenReader(`${t('profile.preferences.timezone')}: ${preferences.timezone}`)}
                  >
                    <SelectItem key="UTC">UTC</SelectItem>
                    <SelectItem key="EST">EST</SelectItem>
                    <SelectItem key="PST">PST</SelectItem>
                    <SelectItem key="GMT">GMT</SelectItem>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t('profile.preferences.theme')}
                  </label>
                  <Select
                    selectedKeys={[preferences.theme]}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string
                      handlePreferenceChange('theme', value)
                    }}
                    aria-label={t('profile.preferences.theme')}
                    onFocus={() => announceToScreenReader(`${t('profile.preferences.theme')}: ${preferences.theme}`)}
                  >
                    <SelectItem key="auto">{t('profile.preferences.theme.auto')}</SelectItem>
                    <SelectItem key="light">{t('profile.preferences.theme.light')}</SelectItem>
                    <SelectItem key="dark">{t('profile.preferences.theme.dark')}</SelectItem>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Screen Reader Announcements */}
          <div id="sr-announcements" className="sr-only" aria-live="polite" aria-atomic="true"></div>
        </CardBody>
      </Card>

      {/* Reset Confirmation Modal */}
      <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)}>
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="size-5 text-orange-600" aria-hidden="true" />
              <h3 className="text-lg font-semibold">{t('profile.settings.resetTitle')}</h3>
            </div>
          </ModalHeader>
          <ModalBody>
            <p className="text-gray-600">
              {t('profile.settings.resetDescription')}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="flat"
              onPress={resetToDefaults}
              className="font-semibold"
            >
              {t('profile.settings.actions.confirmReset')}
            </Button>
            <Button
              color="default"
              variant="light"
              onPress={() => setShowResetModal(false)}
              className="font-semibold"
            >
              {t('common.cancel')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default PrivacySettingsCard
