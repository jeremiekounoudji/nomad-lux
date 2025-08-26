import React, { useState, useEffect } from 'react'
import { Card, CardBody, Button, Spinner, Avatar, Chip } from '@heroui/react'
import { ArrowLeft, User, Settings, Shield, Bell, Camera, Edit3, CheckCircle, MapPin, Calendar, Mail, Phone } from 'lucide-react'
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative">
            <Spinner size="lg" className="mx-auto mb-4 text-blue-600" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-pulse"></div>
          </div>
          <p className="text-gray-600 font-medium">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardBody className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('profile.errors.title')}</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
            <Button 
              color="primary" 
              variant="solid"
              size="lg"
              onPress={handleBackToHome}
              className="w-full font-semibold"
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardBody className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('profile.errors.noProfile')}</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">{t('profile.errors.profileNotFound')}</p>
            <Button 
              color="primary" 
              variant="solid"
              size="lg"
              onPress={handleBackToHome}
              className="w-full font-semibold"
            >
              {t('common.backToHome')}
            </Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" role="main" aria-label={t('profile.title')}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Button
                isIconOnly
                variant="light"
                onPress={handleBackToHome}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 rounded-full"
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header Card */}
            <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardBody className="p-6 sm:p-8">
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden shadow-lg border-4 border-white">
                      {profile.avatarUrl ? (
                        <img 
                          src={profile.avatarUrl} 
                          alt={`${profile.firstName} ${profile.lastName} profile picture`}
                          className="w-full h-full rounded-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" aria-hidden="true" />
                      )}
                    </div>
                    <Button
                      isIconOnly
                      size="sm"
                      color="primary"
                      variant="solid"
                      className="absolute -bottom-2 -right-2 shadow-lg"
                      aria-label={t('profile.actions.changePhoto')}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                        {profile.firstName} {profile.lastName}
                      </h2>
                      {profile.isVerified && (
                        <CheckCircle className="w-5 h-5 text-blue-600" aria-hidden="true" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 flex items-center justify-center space-x-1">
                      <Mail className="w-4 h-4" aria-hidden="true" />
                      <span>{profile.email}</span>
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" aria-hidden="true" />
                        <span>{t('profile.memberSince')} {new Date(profile.joinDate).toLocaleDateString()}</span>
                      </span>
                      {profile.location && (
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" aria-hidden="true" />
                          <span>{profile.location}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Profile Information Card */}
            <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardBody className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      {t('profile.sections.personalInfo')}
                    </h3>
                  </div>
                  <Button 
                    size="sm" 
                    color="primary" 
                    variant="flat"
                    startContent={<Edit3 className="w-4 h-4" />}
                    className="self-start sm:self-auto font-semibold"
                    aria-label={t('profile.actions.editPersonalInfo')}
                  >
                    {t('common.edit')}
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" aria-hidden="true" />
                        <span>{t('profile.fields.firstName')}</span>
                      </label>
                      <p className="text-base text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {profile.firstName || t('common.notProvided')}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-500" aria-hidden="true" />
                        <span>{t('profile.fields.email')}</span>
                      </label>
                      <p className="text-base text-gray-900 bg-gray-50 px-3 py-2 rounded-lg break-all">
                        {profile.email}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" aria-hidden="true" />
                        <span>{t('profile.fields.lastName')}</span>
                      </label>
                      <p className="text-base text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {profile.lastName || t('common.notProvided')}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" aria-hidden="true" />
                        <span>{t('profile.fields.phone')}</span>
                      </label>
                      <p className="text-base text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {profile.phone || t('common.notProvided')}
                      </p>
                    </div>
                  </div>
                </div>
                {profile.bio && (
                  <div className="mt-6 space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      {t('profile.fields.bio')}
                    </label>
                    <p className="text-base text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {profile.bio}
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Password Change Card */}
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
                  <Button 
                    size="sm" 
                    color="success" 
                    variant="flat"
                    onPress={handlePasswordChange}
                    className="self-start sm:self-auto font-semibold"
                    aria-label={t('profile.actions.changePassword')}
                  >
                    {t('profile.actions.changePassword')}
                  </Button>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t('profile.security.description')}
                </p>
              </CardBody>
            </Card>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            {/* Privacy Settings Card */}
            <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardBody className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Settings className="w-5 h-5 text-purple-600" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      {t('profile.sections.privacy')}
                    </h3>
                  </div>
                  <Button 
                    size="sm" 
                    color="secondary" 
                    variant="flat"
                    className="self-start sm:self-auto font-semibold"
                    aria-label={t('profile.actions.editPrivacySettings')}
                  >
                    {t('common.edit')}
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      {t('profile.privacy.profileVisibility')}
                    </span>
                    <Chip 
                      size="sm" 
                      color={profile.privacySettings.profileVisibility === 'public' ? 'success' : 'warning'}
                      variant="flat"
                    >
                      {profile.privacySettings.profileVisibility}
                    </Chip>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      {t('profile.privacy.showEmail')}
                    </span>
                    <Chip 
                      size="sm" 
                      color={profile.privacySettings.showEmail ? 'success' : 'danger'}
                      variant="flat"
                    >
                      {profile.privacySettings.showEmail ? t('common.yes') : t('common.no')}
                    </Chip>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Notification Settings Card */}
            <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardBody className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-orange-600" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      {t('profile.sections.notifications')}
                    </h3>
                  </div>
                  <Button 
                    size="sm" 
                    color="warning" 
                    variant="flat"
                    className="self-start sm:self-auto font-semibold"
                    aria-label={t('profile.actions.editNotificationSettings')}
                  >
                    {t('common.edit')}
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      {t('profile.notifications.email')}
                    </span>
                    <Chip 
                      size="sm" 
                      color={profile.notificationSettings.emailNotifications.bookingUpdates ? 'success' : 'default'}
                      variant="flat"
                    >
                      {profile.notificationSettings.emailNotifications.bookingUpdates ? t('common.on') : t('common.off')}
                    </Chip>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      {t('profile.notifications.push')}
                    </span>
                    <Chip 
                      size="sm" 
                      color={profile.notificationSettings.pushNotifications.bookingUpdates ? 'success' : 'default'}
                      variant="flat"
                    >
                      {profile.notificationSettings.pushNotifications.bookingUpdates ? t('common.on') : t('common.off')}
                    </Chip>
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
