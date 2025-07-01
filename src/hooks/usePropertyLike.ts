import { useEffect } from 'react'
import { usePropertyStore } from '../lib/stores/propertyStore'
import { useAuthStore } from '../lib/stores/authStore'
import toast from 'react-hot-toast'

export const usePropertyLike = () => {
  const { user } = useAuthStore()
  const { 
    likedPropertyIds,
    isLikeLoading,
    toggleLike,
    fetchLikedProperties,
    clearLikedProperties,
    isPropertyLiked
  } = usePropertyStore()

  // Fetch liked properties when user logs in
  useEffect(() => {
    if (user) {
      fetchLikedProperties()
    } else {
      clearLikedProperties()
    }
  }, [user, fetchLikedProperties, clearLikedProperties])

  const handleLike = async (propertyId: string) => {
    if (!user) {
      toast.error('Please sign in to save properties')
      return
    }
    await toggleLike(propertyId)
  }

  return {
    likedPropertyIds,
    isLoading: isLikeLoading,
    isLiked: isPropertyLiked,
    toggleLike: handleLike
  }
} 