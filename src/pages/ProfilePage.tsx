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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                isIconOnly
                variant="light"
                onPress={handleBackToHome}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t('profile.title')}
                </h1>
                <p className="text-sm text-gray-600">
                  {t('profile.subtitle')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header Card */}
            <Card className="w-full">
              <CardBody className="p-6">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                    {profile.avatarUrl ? (
                      <img 
                        src={profile.avatarUrl} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <p className="text-gray-600">{profile.email}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('profile.memberSince')} {new Date(profile.joinDate).toLocaleDateString()}
                  </p>
                </div>
              </CardBody>
            </Card>

            {/* Profile Information Card */}
            <Card className="w-full">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('profile.sections.personalInfo')}
                  </h3>
                  <Button 
                    size="sm" 
                    color="primary" 
                    variant="flat"
                  >
                    {t('common.edit')}
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t('profile.fields.firstName')}
                      </label>
                      <p className="text-gray-900">{profile.firstName || t('common.notProvided')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t('profile.fields.lastName')}
                      </label>
                      <p className="text-gray-900">{profile.lastName || t('common.notProvided')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t('profile.fields.email')}
                      </label>
                      <p className="text-gray-900">{profile.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t('profile.fields.phone')}
                      </label>
                      <p className="text-gray-900">{profile.phone || t('common.notProvided')}</p>
                    </div>
                  </div>
                  {profile.bio && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t('profile.fields.bio')}
                      </label>
                      <p className="text-gray-900">{profile.bio}</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Password Change Card */}
            <Card className="w-full">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t('profile.sections.security')}
                    </h3>
                  </div>
                  <Button 
                    size="sm" 
                    color="primary" 
                    variant="flat"
                    onPress={handlePasswordChange}
                  >
                    {t('profile.actions.changePassword')}
                  </Button>
                </div>
                <p className="text-gray-600 text-sm">
                  {t('profile.security.description')}
                </p>
              </CardBody>
            </Card>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            {/* Privacy Settings Card */}
            <Card className="w-full">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t('profile.sections.privacy')}
                    </h3>
                  </div>
                  <Button 
                    size="sm" 
                    color="primary" 
                    variant="flat"
                  >
                    {t('common.edit')}
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {t('profile.privacy.profileVisibility')}
                    </span>
                    <span className="text-sm text-gray-500 capitalize">
                      {profile.privacySettings.profileVisibility}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {t('profile.privacy.showEmail')}
                    </span>
                    <span className="text-sm text-gray-500">
                      {profile.privacySettings.showEmail ? t('common.yes') : t('common.no')}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Notification Settings Card */}
            <Card className="w-full">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t('profile.sections.notifications')}
                    </h3>
                  </div>
                  <Button 
                    size="sm" 
                    color="primary" 
                    variant="flat"
                  >
                    {t('common.edit')}
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {t('profile.notifications.email')}
                    </span>
                    <span className="text-sm text-gray-500">
                      {profile.notificationSettings.emailNotifications.bookingUpdates ? t('common.on') : t('common.off')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {t('profile.notifications.push')}
                    </span>
                    <span className="text-sm text-gray-500">
                      {profile.notificationSettings.pushNotifications.bookingUpdates ? t('common.on') : t('common.off')}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
