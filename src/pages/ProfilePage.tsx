import React, { useState, useRef, useEffect } from 'react'
import { Card, CardBody, Button, Spinner } from '@heroui/react'
import { User, Shield, Grid3X3, ClipboardList, Calendar as CalendarIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../lib/stores/translationStore'
import { ProfilePageProps, ProfileImageData } from '../interfaces/Profile'
import { ROUTES } from '../router/types'
import { useProfileImage } from '../hooks/useProfileImage'
import { useProfile } from '../hooks/useProfile'
import { useUserListings } from '../hooks/useUserListings'
import { useBookingManagement } from '../hooks/useBookingManagement'
import { ProfileEditModal } from '../components/features/profile/ProfileEditModal'
import { PasswordChangeModal } from '../components/features/profile/PasswordChangeModal'
import { ImagePreviewModal } from '../components/features/profile/ImagePreviewModal'
import toast from 'react-hot-toast'

import { BookingRequest } from '../interfaces/Booking'

// New components for the updated profile page
import ProfileHeader from '../components/features/profile/ProfileHeaderNew'
import TabContent from '../components/features/profile/TabContentNew'
import { Select, SelectItem } from '@heroui/react'

const ProfilePage: React.FC<ProfilePageProps> = ({ 
  onProfileUpdate, 
  onImageUpload 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation(['profile', 'common', 'property', 'booking'])
  const navigate = useNavigate()
  const { isUploading, uploadProgress, uploadImage, processImage } = useProfileImage()
  const { profile, isLoading, error, updateProfile } = useProfile()
  const { filteredListings, fetchUserListings, isLoading: listingsLoading, totalStats } = useUserListings()
  const { loadHostBookingRequests } = useBookingManagement()
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isImagePreviewModalOpen, setIsImagePreviewModalOpen] = useState(false)
  const [previewImageData, setPreviewImageData] = useState<ProfileImageData | null>(null)
  
  // Tab states
  const [activeTab, setActiveTab] = useState<'properties' | 'bookings' | 'requests'>('properties')
  
  // Filter states
  const [sortBy, setSortBy] = useState('newest')
  
  // Booking requests state
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([])
  const [requestsLoading, setRequestsLoading] = useState(false)
  
  // Store the actual file in a ref to avoid serialization issues
  const currentFileRef = useRef<File | null>(null)

  // Load data when component mounts or tab changes
  useEffect(() => {
    if (!profile) return
    
    switch (activeTab) {
      case 'properties':
        fetchUserListings({ force: true })
        break
      case 'requests':
        setRequestsLoading(true)
        loadHostBookingRequests(profile.userId).then((requests) => {
          setBookingRequests(requests || [])
          setRequestsLoading(false)
        }).catch((error) => {
          console.error('Error loading booking requests:', error)
          setRequestsLoading(false)
        })
        break
      case 'bookings':
        // For bookings, we would load guest bookings
        // This would require implementing a loadGuestBookings function
        break
    }
  }, [activeTab, profile, fetchUserListings, loadHostBookingRequests])

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

  const handleFilterChange = (value: any) => {
    setSortBy(value)
    // In a real implementation, we would re-sort the data based on this filter
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

  // Calculate statistics
  const propertiesCount = totalStats ? Object.keys(totalStats).length : 0
  const bookingsCount = 0 // Would be calculated from actual bookings data
  const reviewsCount = 0 // Would be calculated from actual reviews data

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
        {/* Profile Header */}
        <div className="mb-6">
          <ProfileHeader 
            profile={profile} 
            isUploading={isUploading}
            onCameraClick={handleCameraClick}
            onEditProfile={() => setIsEditModalOpen(true)}
            propertiesCount={propertiesCount}
            bookingsCount={bookingsCount}
            reviewsCount={reviewsCount}
          />
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          <Button 
            color="primary" 
            variant="bordered"
            className="font-semibold"
            onPress={handlePasswordChange}
            aria-label={t('profile.actions.changePassword')}
          >
            {t('profile.actions.changePassword')}
          </Button>
          <Button 
            color="primary" 
            variant="bordered"
            className="font-semibold bg-main text-white"
            onPress={() => setIsEditModalOpen(true)}
            aria-label={t('profile.actions.editProfile')}
          >
            {t('profile.actions.editProfile')}
          </Button>
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