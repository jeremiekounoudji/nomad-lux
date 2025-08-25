import React, { useState, useEffect } from 'react'
import { Card, CardBody, Button, Spinner } from '@heroui/react'
import { ArrowLeft, User, Settings, Shield, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../lib/stores/translationStore'
import { useAuthStore } from '../lib/stores/authStore'
import { Profile, ProfilePageProps } from '../interfaces/Profile'
import { ROUTES } from '../router/types'
import toast from 'react-hot-toast'

const ProfilePage: React.FC<ProfilePageProps> = ({ 
  onProfileUpdate, 
  onPasswordChange, 
  onImageUpload 
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  const { t } = useTranslation(['profile', 'common'])
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // TODO: Load profile data from API
        // For now, create a mock profile from user data
        if (user) {
          const mockProfile: Profile = {
            id: user.id,
            userId: user.id,
            firstName: user.user_metadata?.first_name || '',
            lastName: user.user_metadata?.last_name || '',
            email: user.email || '',
            phone: user.phone || '',
            avatarUrl: user.user_metadata?.avatar_url || '',
            bio: '',
            dateOfBirth: '',
            location: '',
            joinDate: new Date(user.created_at).toISOString(),
            lastUpdated: new Date().toISOString(),
            isVerified: false,
            preferences: {
              language: 'en',
              currency: 'USD',
              timezone: 'UTC',
              theme: 'auto'
            },
            privacySettings: {
              profileVisibility: 'public',
              showEmail: true,
              showPhone: false,
              showLocation: true,
              allowDataSharing: true,
              allowAnalytics: true
            },
            notificationSettings: {
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
          }
          
          setProfile(mockProfile)
        }
      } catch (err: any) {
        console.error('❌ Error loading profile:', err)
        setError(err.message || t('profile.errors.loadFailed'))
        toast.error(err.message || t('profile.errors.loadFailed'))
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user, t])

  const handleBackToHome = () => {
    navigate(ROUTES.HOME)
  }

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile)
    onProfileUpdate?.(updatedProfile)
    toast.success(t('profile.messages.updateSuccess'))
  }

  const handlePasswordChange = () => {
    onPasswordChange?.()
    toast.success(t('profile.messages.passwordChangeSuccess'))
  }

  const handleImageUpload = (imageData: any) => {
    onImageUpload?.(imageData)
    toast.success(t('profile.messages.imageUploadSuccess'))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardBody className="text-center">
            <div className="text-red-500 mb-4">
              <Shield className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">{t('profile.errors.title')}</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              color="primary" 
              variant="flat"
              onPress={handleBackToHome}
            >
              {t('common.backToHome')}
            </Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardBody className="text-center">
            <div className="text-gray-500 mb-4">
              <User className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">{t('profile.errors.noProfile')}</h2>
            <p className="text-gray-600 mb-4">{t('profile.errors.profileNotFound')}</p>
            <Button 
              color="primary" 
              variant="flat"
              onPress={handleBackToHome}
            >
              {t('common.backToHome')}
            </Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" role="main" aria-label={t('profile.title')}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Button
                isIconOnly
                variant="light"
                onPress={handleBackToHome}
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                aria-label={t('common.back')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  {t('profile.title')}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {t('profile.subtitle')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Profile Info */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            {/* Profile Header Card */}
            <Card className="w-full transition-all duration-200 hover:shadow-md">
              <CardBody className="p-4 sm:p-6">
                <div className="text-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {profile.avatarUrl ? (
                      <img 
                        src={profile.avatarUrl} 
                        alt={`${profile.firstName} ${profile.lastName} profile picture`}
                        className="w-full h-full rounded-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <User className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" aria-hidden="true" />
                    )}
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <p className="text-sm text-gray-600 mb-1">{profile.email}</p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {t('profile.memberSince')} {new Date(profile.joinDate).toLocaleDateString()}
                  </p>
                </div>
              </CardBody>
            </Card>

            {/* Profile Information Card */}
            <Card className="w-full transition-all duration-200 hover:shadow-md">
              <CardBody className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    {t('profile.sections.personalInfo')}
                  </h3>
                  <Button 
                    size="sm" 
                    color="primary" 
                    variant="flat"
                    className="self-start sm:self-auto"
                    aria-label={t('profile.actions.editPersonalInfo')}
                  >
                    {t('common.edit')}
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-700">
                        {t('profile.fields.firstName')}
                      </label>
                      <p className="text-sm sm:text-base text-gray-900">{profile.firstName || t('common.notProvided')}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-700">
                        {t('profile.fields.lastName')}
                      </label>
                      <p className="text-sm sm:text-base text-gray-900">{profile.lastName || t('common.notProvided')}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-700">
                        {t('profile.fields.email')}
                      </label>
                      <p className="text-sm sm:text-base text-gray-900 break-all">{profile.email}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-700">
                        {t('profile.fields.phone')}
                      </label>
                      <p className="text-sm sm:text-base text-gray-900">{profile.phone || t('common.notProvided')}</p>
                    </div>
                  </div>
                  {profile.bio && (
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-700">
                        {t('profile.fields.bio')}
                      </label>
                      <p className="text-sm sm:text-base text-gray-900">{profile.bio}</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Password Change Card */}
            <Card className="w-full transition-all duration-200 hover:shadow-md">
              <CardBody className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-gray-600" aria-hidden="true" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      {t('profile.sections.security')}
                    </h3>
                  </div>
                  <Button 
                    size="sm" 
                    color="primary" 
                    variant="flat"
                    onPress={handlePasswordChange}
                    className="self-start sm:self-auto"
                    aria-label={t('profile.actions.changePassword')}
                  >
                    {t('profile.actions.changePassword')}
                  </Button>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  {t('profile.security.description')}
                </p>
              </CardBody>
            </Card>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-4 sm:space-y-6">
            {/* Privacy Settings Card */}
            <Card className="w-full transition-all duration-200 hover:shadow-md">
              <CardBody className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-gray-600" aria-hidden="true" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      {t('profile.sections.privacy')}
                    </h3>
                  </div>
                  <Button 
                    size="sm" 
                    color="primary" 
                    variant="flat"
                    className="self-start sm:self-auto"
                    aria-label={t('profile.actions.editPrivacySettings')}
                  >
                    {t('common.edit')}
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-700">
                      {t('profile.privacy.profileVisibility')}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 capitalize">
                      {profile.privacySettings.profileVisibility}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-700">
                      {t('profile.privacy.showEmail')}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {profile.privacySettings.showEmail ? t('common.yes') : t('common.no')}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Notification Settings Card */}
            <Card className="w-full transition-all duration-200 hover:shadow-md">
              <CardBody className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-gray-600" aria-hidden="true" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      {t('profile.sections.notifications')}
                    </h3>
                  </div>
                  <Button 
                    size="sm" 
                    color="primary" 
                    variant="flat"
                    className="self-start sm:self-auto"
                    aria-label={t('profile.actions.editNotificationSettings')}
                  >
                    {t('common.edit')}
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-700">
                      {t('profile.notifications.email')}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {profile.notificationSettings.emailNotifications.bookingUpdates ? t('common.on') : t('common.off')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-700">
                      {t('profile.notifications.push')}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {profile.notificationSettings.pushNotifications.bookingUpdates ? t('common.on') : t('common.off')}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProfilePage
