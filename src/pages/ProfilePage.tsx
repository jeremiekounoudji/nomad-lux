import React, { useState, useRef } from 'react'
import { Card, CardBody, Button, Spinner, Chip } from '@heroui/react'
import { User, Shield, Camera, Edit3, CheckCircle, MapPin, Calendar, Mail, Phone, Star, Globe } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../lib/stores/translationStore'
import { useAuthStore } from '../lib/stores/authStore'
import { ProfilePageProps, ProfileImageData } from '../interfaces/Profile'
import { ROUTES } from '../router/types'
import { useProfileImage } from '../hooks/useProfileImage'
import { useProfile } from '../hooks/useProfile'
import { ProfileEditModal } from '../components/features/profile/ProfileEditModal'
import { PasswordChangeModal } from '../components/features/profile/PasswordChangeModal'
import { ImagePreviewModal } from '../components/features/profile/ImagePreviewModal'
import toast from 'react-hot-toast'

const ProfilePage: React.FC<ProfilePageProps> = ({ 
  onProfileUpdate, 
  // onPasswordChange, // Commented out to avoid unused variable warning 
  onImageUpload 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { t } = useTranslation(['profile', 'common'])
  // const { user } = useAuthStore() // Commented out to avoid unused variable warning
  const navigate = useNavigate()
  const { isUploading, uploadProgress, uploadImage, processImage } = useProfileImage()
  const { profile, isLoading, error, updateProfile } = useProfile()
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isImagePreviewModalOpen, setIsImagePreviewModalOpen] = useState(false)
  const [previewImageData, setPreviewImageData] = useState<ProfileImageData | null>(null)
  
  // Store the actual file in a ref to avoid serialization issues
  const currentFileRef = useRef<File | null>(null)

  // Profile loading is handled by the useProfile hook

  const handleBackToHome = () => {
    navigate(ROUTES.HOME)
  }

  const handleProfileUpdate = async (updateData: any) => {
    try {
      await updateProfile(updateData)
      onProfileUpdate?.(profile!)
    } catch (error) {
      console.error('❌ Error updating profile:', error)
    }
  }

  const handlePasswordChange = () => {
    setIsPasswordModalOpen(true)
  }

  const handleImageUpload = async (imageData: ProfileImageData) => {
    try {
      // Get the file from ref - this is the original, uncorrupted File object
      const fileToUpload = currentFileRef.current
      
      if (!fileToUpload) {
        throw new Error('No file available for upload')
      }
      
      console.log('🚀 Starting image upload from ProfilePage:', {
        fileName: fileToUpload.name,
        fileType: fileToUpload.type,
        fileSize: fileToUpload.size,
        isFile: fileToUpload instanceof File
      })
      
      // Create a new ProfileImageData with the original file
      const freshImageData: ProfileImageData = {
        file: fileToUpload,
        previewUrl: imageData.previewUrl,
        croppedData: imageData.croppedData
      }
      
      // Upload image to Supabase Storage and update user metadata
      const uploadedUrl = await uploadImage(freshImageData)
      
      if (uploadedUrl && profile) {
        // Update the profile with new avatar URL using the hook
        await updateProfile({
          avatarUrl: uploadedUrl
        })
      }
      
      // Call the parent handler if provided
      await onImageUpload?.(imageData)
      
      // Close the preview modal
      setIsImagePreviewModalOpen(false)
      setPreviewImageData(null)
      currentFileRef.current = null
      
      toast.success(t('profile.messages.imageUploadSuccess'))
      
    } catch (error: any) {
      console.error('❌ Error uploading image:', error)
      toast.error(error.message || t('profile.image.errors.uploadFailed'))
    }
  }

  const handleCameraClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        console.log('📁 Selected file:', {
          name: file.name,
          type: file.type,
          size: file.size
        })

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(t('profile.image.errors.invalidFormat'))
          return
        }

        // Process the image using the hook
        const imageData = await processImage(file)
        
         console.log('🖼️ Processed image data:', {
           fileName: imageData.file?.name || 'No file name',
           fileType: imageData.file?.type || 'No file type',
           fileSize: imageData.file?.size || 'No file size',
           hasPreview: !!imageData.previewUrl
         })
         
         // Validate the processed image data
         if (!imageData.file || !(imageData.file instanceof File) || !imageData.file.size) {
           throw new Error('Invalid file data after processing')
         }
         
         // Store the original file in ref to avoid serialization issues
         currentFileRef.current = file
         
         // Store only the preview data in state (not the file object)
         setPreviewImageData({
           file: null, // Don't store file in state
           previewUrl: imageData.previewUrl,
           croppedData: imageData.croppedData
         })
         setIsImagePreviewModalOpen(true)
        
      } catch (error: any) {
        console.error('❌ Error processing image:', error)
        toast.error(error.message || t('profile.image.errors.uploadFailed'))
      }
    }
    
    // Reset input value to allow selecting the same file again
    event.target.value = ''
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative">
            <Spinner size="lg" className="mx-auto mb-4 text-blue-600" />
            <div className="absolute inset-0 animate-pulse rounded-full border-4 border-blue-200"></div>
          </div>
          <p className="font-medium text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardBody className="p-8 text-center">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-red-100">
              <Shield className="size-8 text-red-600" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-gray-900">{t('profile.errors.title')}</h2>
            <p className="mb-6 leading-relaxed text-gray-600">{error}</p>
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardBody className="p-8 text-center">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-gray-100">
              <User className="size-8 text-gray-600" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-gray-900">{t('profile.errors.noProfile')}</h2>
            <p className="mb-6 leading-relaxed text-gray-600">{t('profile.errors.profileNotFound')}</p>
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
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        aria-label={t('profile.image.fileInput')}
      />
      
      {/* Main Content */}
      <main className="w-full">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            {t('profile.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('profile.subtitle')}
          </p>
        </div>

        {/* Profile Cards Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Profile Header Card - Full Height */}
          <div className="lg:col-span-1">
            <Card className="size-full border-0 bg-white/80 shadow-lg backdrop-blur-sm">
              <CardBody className="flex flex-col justify-center p-6 sm:p-8">
                <div className="text-center">
                  <div className="mb-6 text-center">
                                         <div className="mx-auto mb-4 flex size-56 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-blue-100 to-purple-100 shadow-sm sm:size-64">
                       {profile.avatarUrl ? (
                         <img 
                           src={profile.avatarUrl} 
                           alt={`${profile.firstName} ${profile.lastName} profile picture`}
                           className="size-full rounded-full object-cover"
                           loading="lazy"
                         />
                       ) : (
                         <User className="size-28 text-gray-400 sm:size-32" aria-hidden="true" />
                       )}
                     </div>
                    <Button
                      size="sm"
                      className="bg-main font-semibold text-white hover:bg-main/90"
                      startContent={<Camera className="size-4 text-white" />}
                      onPress={handleCameraClick}
                      isLoading={isUploading}
                      disabled={isUploading}
                      aria-label={t('profile.actions.changePhoto')}
                    >
                      {t('profile.actions.changePhoto')}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                      {profile.firstName} {profile.lastName}
                    </h2>
                    <div className="flex items-center justify-center space-x-2">
                      {profile.isVerified && (
                        <CheckCircle className="size-4 text-blue-600" aria-hidden="true" />
                      )}
                      <span className="text-sm font-medium text-green-600">
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
            <Card className="h-fit w-full border-0 bg-white/80 shadow-lg backdrop-blur-sm">
              <CardBody className="p-6 sm:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-gray-900 sm:text-xl">
                      {t('profile.accountDetails')}
                    </h3>
                    <div className="size-2 rounded-full bg-green-500"></div>
                  </div>
                                     <Button 
                     size="sm" 
                     color="primary" 
                     variant="flat"
                     startContent={<Edit3 className="size-4" />}
                     className="font-semibold"
                     aria-label={t('profile.actions.editPersonalInfo')}
                     onPress={() => setIsEditModalOpen(true)}
                   >
                     {t('common.edit')}
                   </Button>
                </div>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                        <User className="size-4 text-gray-500" aria-hidden="true" />
                        <span>{t('profile.fields.firstName')}</span>
                      </label>
                      <p className="rounded-lg bg-gray-50 px-3 py-2 text-base text-gray-900">
                        {profile.firstName || t('common.notProvided')}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                        <Mail className="size-4 text-gray-500" aria-hidden="true" />
                        <span>{t('profile.fields.email')}</span>
                      </label>
                      <p className="break-all rounded-lg bg-gray-50 px-3 py-2 text-base text-gray-900">
                        {profile.email}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                        <Phone className="size-4 text-gray-500" aria-hidden="true" />
                        <span>{t('profile.fields.phone')}</span>
                      </label>
                      <p className="rounded-lg bg-gray-50 px-3 py-2 text-base text-gray-900">
                        {profile.phone || t('common.notProvided')}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                        <MapPin className="size-4 text-gray-500" aria-hidden="true" />
                        <span>{t('profile.fields.location')}</span>
                      </label>
                      <p className="rounded-lg bg-gray-50 px-3 py-2 text-base text-gray-900">
                        {profile.location || t('common.notProvided')}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                        <User className="size-4 text-gray-500" aria-hidden="true" />
                        <span>{t('profile.fields.lastName')}</span>
                      </label>
                      <p className="rounded-lg bg-gray-50 px-3 py-2 text-base text-gray-900">
                        {profile.lastName || t('common.notProvided')}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                        <Calendar className="size-4 text-gray-500" aria-hidden="true" />
                        <span>{t('profile.account.memberSince')}</span>
                      </label>
                      <p className="rounded-lg bg-gray-50 px-3 py-2 text-base text-gray-900">
                        {new Date(profile.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                        <Globe className="size-4 text-gray-500" aria-hidden="true" />
                        <span>{t('profile.account.preferredLanguage')}</span>
                      </label>
                      <p className="rounded-lg bg-gray-50 px-3 py-2 text-base text-gray-900">
                        {t(`profile.languages.${profile.preferences.language}`)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                        <Star className="size-4 text-gray-500" aria-hidden="true" />
                        <span>{t('profile.fields.status')}</span>
                      </label>
                      <Chip 
                        size="sm" 
                        color="success"
                        variant="flat"
                        startContent={<div className="size-2 rounded-full bg-green-500"></div>}
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-1 lg:grid-cols-1">
          {/* Security Card */}
          <Card className="w-full border-0 bg-white/80 shadow-lg backdrop-blur-sm">
            <CardBody className="p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-green-100">
                    <Shield className="size-5 text-green-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {t('profile.sections.security')}
                  </h3>
                </div>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-gray-600">
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
                 </div>
       </main>

       {/* Modals */}
       <ProfileEditModal
         isOpen={isEditModalOpen}
         onClose={() => setIsEditModalOpen(false)}
         profile={profile!}
         onSave={handleProfileUpdate}
       />

       <PasswordChangeModal
         isOpen={isPasswordModalOpen}
         onClose={() => setIsPasswordModalOpen(false)}
       />

       <ImagePreviewModal
         isOpen={isImagePreviewModalOpen}
         onClose={() => {
           setIsImagePreviewModalOpen(false)
           setPreviewImageData(null)
           currentFileRef.current = null
         }}
         imageData={previewImageData}
         onConfirm={handleImageUpload}
         isUploading={isUploading}
         uploadProgress={uploadProgress}
       />
     </div>
   )
 }

export default ProfilePage


