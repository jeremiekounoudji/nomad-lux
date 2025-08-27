import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../lib/stores/authStore'
import { Profile, ProfileUpdateData } from '../interfaces/Profile'
import { supabase } from '../lib/supabase'
import { useUser } from './useUser'
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
  const { fetchUserByAuthId } = useUser()

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

      // Use the existing fetchUserByAuthId function
      const userData = await fetchUserByAuthId(user.id)

            if (userData) {
        console.log('✅ User data loaded from database:', userData)
        
        // Transform database user data to Profile interface
        const profileData: Profile = {
          id: userData.id,
          userId: userData.auth_id,
          firstName: userData.display_name?.split(' ')[0] || '',
          lastName: userData.display_name?.split(' ').slice(1).join(' ') || '',
          email: userData.email,
          phone: userData.phone || '',
          avatarUrl: userData.avatar_url || '',
          bio: userData.bio || '',
          dateOfBirth: userData.date_of_birth || '',
          location: userData.location || '',
          joinDate: userData.created_at,
          lastUpdated: userData.updated_at,
          isVerified: userData.is_identity_verified || false,
          preferences: {
            language: userData.language_preference || 'en',
            currency: userData.preferred_currency || 'USD',
            timezone: userData.timezone || 'UTC',
            theme: 'auto'
          },
          privacySettings: {
            profileVisibility: 'public', // Default value
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
        
        setProfile(profileData)
        console.log('✅ Profile loaded successfully from database')
      } else {
        console.log('ℹ️ User not found in database, creating profile from auth data')
        
        // Create profile from Supabase auth user data
        const userWithMetadata = user as any // Cast to access user_metadata
        const profileData: Profile = {
          id: user.id,
          userId: user.id,
          firstName: userWithMetadata.user_metadata?.first_name || user.email?.split('@')[0] || '',
          lastName: userWithMetadata.user_metadata?.last_name || '',
          email: user.email || '',
          phone: user.phone || '',
          avatarUrl: userWithMetadata.user_metadata?.avatar_url || '',
          bio: '',
          dateOfBirth: '',
          location: '',
          joinDate: user.created_at,
          lastUpdated: user.updated_at || user.created_at,
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
        
        setProfile(profileData)
        console.log('✅ Profile created from auth data')
      }

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

      // Prepare update data for the users table
      const updateFields: any = {
        updated_at: new Date().toISOString()
      }

      // Map ProfileUpdateData fields to users table fields
      if (updateData.firstName !== undefined || updateData.lastName !== undefined) {
        const firstName = updateData.firstName || profile.firstName
        const lastName = updateData.lastName || profile.lastName
        updateFields.display_name = `${firstName} ${lastName}`.trim()
      }

      if (updateData.phone !== undefined) {
        updateFields.phone = updateData.phone
      }

      if (updateData.bio !== undefined) {
        updateFields.bio = updateData.bio
      }

      if (updateData.dateOfBirth !== undefined) {
        updateFields.date_of_birth = updateData.dateOfBirth
      }

      if (updateData.location !== undefined) {
        updateFields.location = updateData.location
      }

      if (updateData.avatarUrl !== undefined) {
        updateFields.avatar_url = updateData.avatarUrl
      }

      // First, check if user exists in the database
      const existingUser = await fetchUserByAuthId(user.id)

      if (!existingUser) {
        console.log('ℹ️ User not found in database, creating new user record')
        
        // Create new user record with current profile data
        const createFields = {
          auth_id: user.id,
          email: user.email,
          display_name: `${profile.firstName} ${profile.lastName}`.trim(),
          phone: profile.phone || '',
          bio: profile.bio || '',
          date_of_birth: profile.dateOfBirth || '',
          location: profile.location || '',
          avatar_url: profile.avatarUrl || '',
          language_preference: profile.preferences.language || 'en',
          preferred_currency: profile.preferences.currency || 'USD',
          timezone: profile.preferences.timezone || 'UTC',
          is_identity_verified: profile.isVerified || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        // Add the update fields to the create fields
        Object.assign(createFields, updateFields)

        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert(createFields)
          .select()
          .single()

        if (createError) {
          console.error('❌ Error creating user data:', createError)
          throw new Error(createError.message)
        }

        if (newUser) {
          // Transform new user data back to Profile interface
          const newProfileData: Profile = {
            id: newUser.id,
            userId: newUser.auth_id,
            firstName: newUser.display_name?.split(' ')[0] || '',
            lastName: newUser.display_name?.split(' ').slice(1).join(' ') || '',
            email: newUser.email,
            phone: newUser.phone || '',
            avatarUrl: newUser.avatar_url || '',
            bio: newUser.bio || '',
            dateOfBirth: newUser.date_of_birth || '',
            location: newUser.location || '',
            joinDate: newUser.created_at,
            lastUpdated: newUser.updated_at,
            isVerified: newUser.is_identity_verified || false,
            preferences: {
              language: newUser.language_preference || 'en',
              currency: newUser.preferred_currency || 'USD',
              timezone: newUser.timezone || 'UTC',
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

          setProfile(newProfileData)
          console.log('✅ New user profile created and updated successfully')
          toast.success('Profile updated successfully')
          return
        }
      } else {
        console.log('✅ User found in database, updating existing record')
        
        // Update the existing users table record
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update(updateFields)
          .eq('auth_id', user.id)
          .select()
          .single()

        if (updateError) {
          console.error('❌ Error updating user data:', updateError)
          throw new Error(updateError.message)
        }

        if (updatedUser) {
          // Transform updated user data back to Profile interface
          const updatedProfileData: Profile = {
            id: updatedUser.id,
            userId: updatedUser.auth_id,
            firstName: updatedUser.display_name?.split(' ')[0] || '',
            lastName: updatedUser.display_name?.split(' ').slice(1).join(' ') || '',
            email: updatedUser.email,
            phone: updatedUser.phone || '',
            avatarUrl: updatedUser.avatar_url || '',
            bio: updatedUser.bio || '',
            dateOfBirth: updatedUser.date_of_birth || '',
            location: updatedUser.location || '',
            joinDate: updatedUser.created_at,
            lastUpdated: updatedUser.updated_at,
            isVerified: updatedUser.is_identity_verified || false,
            preferences: {
              language: updatedUser.language_preference || 'en',
              currency: updatedUser.preferred_currency || 'USD',
              timezone: updatedUser.timezone || 'UTC',
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

          setProfile(updatedProfileData)
          console.log('✅ Profile updated successfully')
          toast.success('Profile updated successfully')
        }
      }

    } catch (err: any) {
      console.error('❌ Error updating profile:', err)
      toast.error(err.message || 'Failed to update profile')
      throw err
    }
  }, [user, profile, fetchUserByAuthId])

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
