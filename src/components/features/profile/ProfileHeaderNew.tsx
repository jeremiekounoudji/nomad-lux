import React from 'react'
import { Card, CardBody, Button } from '@heroui/react'
import { Camera, MapPin, Calendar, User } from 'lucide-react'
import { useTranslation } from '../../../lib/stores/translationStore'
import { Profile } from '../../../interfaces/Profile'

interface ProfileHeaderProps {
  profile: Profile
  isUploading: boolean
  onCameraClick: () => void
  onEditProfile: () => void
  propertiesCount?: number
  bookingsCount?: number
  reviewsCount?: number
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isUploading,
  onCameraClick,
  onEditProfile,
  propertiesCount = 0,
  bookingsCount = 0,
  reviewsCount = 0
}) => {
  const { t } = useTranslation(['profile', 'common'])

  return (
    <Card className="w-full border-0 bg-white/80 shadow-sm backdrop-blur-sm">
      <CardBody className="p-0">
        {/* Cover Image */}
        <div className="relative h-40 w-full">
          {profile.avatarUrl ? (
            <img 
              src={profile.avatarUrl} 
              alt="Profile cover"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-blue-400 to-purple-500" />
          )}
          
          {/* Profile Image and Camera Button */}
          <div className="absolute bottom-0 left-4 translate-y-1/2">
            <div className="relative">
              <div className="relative size-24 overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-blue-100 to-purple-100 shadow-lg sm:size-32">
                {profile.avatarUrl ? (
                  <img 
                    src={profile.avatarUrl} 
                    alt={`${profile.firstName} ${profile.lastName} profile picture`}
                    className="size-full rounded-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                    <User className="size-12 text-gray-400 sm:size-16" aria-hidden="true" />
                  </div>
                )}
              </div>
              <Button
                size="sm"
                className="absolute bottom-2 right-0 bg-primary-500 font-semibold text-white hover:bg-primary-600"
                onPress={onCameraClick}
                isLoading={isUploading}
                disabled={isUploading}
                aria-label={t('profile:actions.changePhoto')}
                isIconOnly
              >
                <Camera className="size-4 text-white" />
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="px-4 pb-6 pt-16 sm:px-6">
          <div className="mb-4 flex flex-col">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
              <h2 className="mb-2 text-xl font-bold text-gray-900 sm:mb-0 sm:mr-4 sm:text-2xl">
                {profile.firstName} {profile.lastName}
              </h2>
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  color="primary" 
                  variant="bordered"
                  className="font-semibold"
                  aria-label={t('profile:actions.editPersonalInfo')}
                  onPress={onEditProfile}
                >
                  {t('common:buttons.edit')}
                </Button>
              </div>
            </div>

            {/* Stats Section */}
            <div className="mb-4 flex space-x-8">
              <div className="text-center">
                <span className="block text-lg font-bold">{propertiesCount}</span>
                <span className="text-sm text-gray-600">{t('profile:stats.properties')}</span>
              </div>
              <div className="text-center">
                <span className="block text-lg font-bold">{bookingsCount}</span>
                <span className="text-sm text-gray-600">{t('profile:stats.bookings')}</span>
              </div>
              <div className="text-center">
                <span className="block text-lg font-bold">{reviewsCount}</span>
                <span className="text-sm text-gray-600">{t('profile:stats.reviews')}</span>
              </div>
            </div>

            {/* Bio and Additional Info */}
            <div className="space-y-2">
              <p className="text-gray-900">
                {profile.bio || t('common:messages.notProvided')}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="mr-1 size-4" aria-hidden="true" />
                  <span>{profile.location || t('common:messages.notProvided')}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-1 size-4" aria-hidden="true" />
                  <span>{t('profile:account.memberSince')} {new Date(profile.joinDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export default ProfileHeader