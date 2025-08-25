import { useState, useCallback } from 'react'
import { useAuthStore } from '../lib/stores/authStore'
import { ProfileImageData } from '../interfaces/Profile'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

interface UseProfileImageReturn {
  isUploading: boolean
  uploadProgress: number
  error: string | null
  uploadImage: (imageData: ProfileImageData) => Promise<string | null>
  removeImage: () => Promise<void>
  processImage: (file: File) => Promise<ProfileImageData>
}

export const useProfileImage = (): UseProfileImageReturn => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const { user } = useAuthStore()

  // Process image for upload
  const processImage = useCallback(async (file: File): Promise<ProfileImageData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string
        resolve({
          file,
          previewUrl,
          croppedData: undefined
        })
      }
      reader.onerror = () => reject(new Error('Failed to read image file'))
      reader.readAsDataURL(file)
    })
  }, [])

  // Upload image to Supabase Storage
  const uploadImage = useCallback(async (imageData: ProfileImageData): Promise<string | null> => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      setIsUploading(true)
      setError(null)
      setUploadProgress(0)

      console.log('🔄 Starting image upload for user:', user.id)

      // Generate unique filename
      const fileExt = imageData.file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, imageData.file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('❌ Upload error:', uploadError)
        throw new Error(uploadError.message)
      }

      setUploadProgress(50)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName)

      if (!urlData.publicUrl) {
        throw new Error('Failed to get public URL for uploaded image')
      }

      setUploadProgress(100)

      console.log('✅ Image uploaded successfully:', urlData.publicUrl)

      // Update user metadata with new avatar URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: urlData.publicUrl
        }
      })

      if (updateError) {
        console.error('❌ Error updating user metadata:', updateError)
        toast.error('Image uploaded but profile update failed')
      }

      toast.success('Profile image updated successfully')
      return urlData.publicUrl

    } catch (err: any) {
      console.error('❌ Error uploading image:', err)
      setError(err.message || 'Failed to upload image')
      toast.error(err.message || 'Failed to upload image')
      throw err
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }, [user])

  // Remove image
  const removeImage = useCallback(async (): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      console.log('🔄 Removing profile image for user:', user.id)

      // Update user metadata to remove avatar URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: null
        }
      })

      if (updateError) {
        console.error('❌ Error removing avatar from metadata:', updateError)
        throw new Error(updateError.message)
      }

      console.log('✅ Profile image removed successfully')
      toast.success('Profile image removed successfully')

    } catch (err: any) {
      console.error('❌ Error removing image:', err)
      setError(err.message || 'Failed to remove image')
      toast.error(err.message || 'Failed to remove image')
      throw err
    }
  }, [user])

  return {
    isUploading,
    uploadProgress,
    error,
    uploadImage,
    removeImage,
    processImage
  }
}
