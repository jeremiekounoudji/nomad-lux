import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../lib/stores/authStore'
import { Profile, ProfileUpdateData } from '../interfaces/Profile'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

interface UseProfileReturn {
  profile: Profile | null
  isLoading: boolean
  error: string | null
  updateProfile: (updateData: ProfileUpdateData) => Promise<void>
  refreshProfile: () => Promise<void>
}

export const useProfile = (): UseProfileReturn => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { user } = useAuthStore()

  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      console.log('🔄 Loading profile for user:', user.id)

      // TODO: Replace with actual API call when profile table is created
      // For now, create a mock profile from user data
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
      console.log('✅ Profile loaded successfully')

    } catch (err: any) {
      console.error('❌ Error loading profile:', err)
      setError(err.message || 'Failed to load profile')
      toast.error(err.message || 'Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const updateProfile = useCallback(async (updateData: ProfileUpdateData) => {
    if (!user || !profile) {
      throw new Error('User or profile not available')
    }

    try {
      console.log('🔄 Updating profile:', updateData)

      // TODO: Replace with actual API call when profile table is created
      // For now, simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update the profile with new data
      const updatedProfile: Profile = {
        ...profile,
        ...updateData,
        lastUpdated: new Date().toISOString()
      }

      setProfile(updatedProfile)
      console.log('✅ Profile updated successfully')

      // TODO: Update user metadata in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          first_name: updateData.firstName,
          last_name: updateData.lastName
        }
      })

      if (updateError) {
        console.error('❌ Error updating user metadata:', updateError)
        toast.error('Profile updated but user metadata failed to update')
      }

      toast.success('Profile updated successfully')

    } catch (err: any) {
      console.error('❌ Error updating profile:', err)
      toast.error(err.message || 'Failed to update profile')
      throw err
    }
  }, [user, profile])

  const refreshProfile = useCallback(async () => {
    await loadProfile()
  }, [loadProfile])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    refreshProfile
  }
}
