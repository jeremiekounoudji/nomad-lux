import React, { useState, useEffect, useRef } from 'react'
import { Card, CardBody, Button, Spinner, Avatar, Chip } from '@heroui/react'
import { ArrowLeft, User, Settings, Shield, Bell, Camera, Edit3, CheckCircle, MapPin, Calendar, Mail, Phone, Star, Globe, Music, Heart, Clock, Play, Eye, MoreVertical } from 'lucide-react'
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
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleCameraClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file
      const maxSize = 5 * 1024 * 1024 // 5MB
      const acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      
      if (file.size > maxSize) {
        toast.error(t('profile.image.errors.fileTooLarge', { maxSize: 5 }))
        return
      }
      
      if (!acceptedFormats.includes(file.type)) {
        toast.error(t('profile.image.errors.invalidFormat', { formats: 'JPEG, PNG, WebP' }))
        return
      }

      // Create image data and upload
      const imageData = {
        file: file,
        previewUrl: URL.createObjectURL(file),
        cropData: null
      }
      
      handleImageUpload(imageData)
    }
    
    // Reset input value to allow selecting the same file again
    event.target.value = ''
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
      {/* Hidden file input for avatar upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        aria-label={t('profile.image.fileInput')}
      />
      
      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {t('profile.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('profile.subtitle')}
          </p>
        </div>

        {/* Profile Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
          {/* Profile Header Card */}
          <div className="lg:col-span-1">
            <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm h-fit">
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
                      className="absolute -bottom-2 -right-2 shadow-lg hover:scale-110 transition-transform duration-200"
                      onPress={handleCameraClick}
                      aria-label={t('profile.actions.changePhoto')}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {profile.firstName} {profile.lastName}
                    </h2>
                    <div className="flex items-center justify-center space-x-2">
                      {profile.isVerified && (
                        <CheckCircle className="w-4 h-4 text-blue-600" aria-hidden="true" />
                      )}
                      <span className="text-sm text-green-600 font-medium">
                        {profile.isVerified ? t('profile.verified') : t('profile.status.active')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Bio & Details Card */}
          <div className="lg:col-span-2">
            <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm h-fit">
              <CardBody className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      {t('profile.accountDetails')}
                    </h3>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <Button 
                    size="sm" 
                    color="primary" 
                    variant="flat"
                    startContent={<Edit3 className="w-4 h-4" />}
                    className="font-semibold"
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
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" aria-hidden="true" />
                        <span>{t('profile.fields.phone')}</span>
                      </label>
                      <p className="text-base text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {profile.phone || t('common.notProvided')}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500" aria-hidden="true" />
                        <span>{t('profile.fields.location')}</span>
                      </label>
                      <p className="text-base text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {profile.location || t('common.notProvided')}
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
                        <Calendar className="w-4 h-4 text-gray-500" aria-hidden="true" />
                        <span>{t('profile.account.memberSince')}</span>
                      </label>
                      <p className="text-base text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {new Date(profile.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-gray-500" aria-hidden="true" />
                        <span>{t('profile.account.preferredLanguage')}</span>
                      </label>
                      <p className="text-base text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {t(`profile.languages.${profile.preferences.language}`)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                        <Star className="w-4 h-4 text-gray-500" aria-hidden="true" />
                        <span>Status</span>
                      </label>
                      <Chip 
                        size="sm" 
                        color="success"
                        variant="flat"
                        startContent={<div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                      >
                        {t('profile.status.active')}
                      </Chip>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Settings Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Security Card */}
          <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardBody className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {t('profile.sections.security')}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {t('profile.security.description')}
              </p>
              <Button 
                color="success" 
                variant="flat"
                onPress={handlePasswordChange}
                className="w-full font-semibold"
                aria-label={t('profile.actions.changePassword')}
              >
                {t('profile.actions.changePassword')}
              </Button>
            </CardBody>
          </Card>

          {/* Privacy Settings Card */}
          <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardBody className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-purple-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {t('profile.sections.privacy')}
                  </h3>
                </div>
                <Button 
                  size="sm" 
                  color="secondary" 
                  variant="flat"
                  className="font-semibold"
                  aria-label={t('profile.actions.editPrivacySettings')}
                >
                  {t('common.edit')}
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    {t('profile.privacy.profileVisibility')}
                  </span>
                  <Chip 
                    size="sm" 
                    color={profile.privacySettings.profileVisibility === 'public' ? 'success' : 'warning'}
                    variant="flat"
                  >
                    {t(`profile.privacy.visibility.${profile.privacySettings.profileVisibility}`)}
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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-orange-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {t('profile.sections.notifications')}
                  </h3>
                </div>
                <Button 
                  size="sm" 
                  color="warning" 
                  variant="flat"
                  className="font-semibold"
                  aria-label={t('profile.actions.editNotificationSettings')}
                >
                  {t('common.edit')}
                </Button>
              </div>
              <div className="space-y-3">
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
      </main>
    </div>
  )
}

export default ProfilePage
