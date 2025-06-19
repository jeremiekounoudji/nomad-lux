import { useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { User, UserRole } from '../interfaces/User'

export const useUserProfile = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  console.log('👤 useUserProfile hook initialized', { timestamp: new Date().toISOString() })

  // Fetch user profile from database with retry logic
  const fetchUserProfile = async (authId: string, retryCount = 0): Promise<User | null> => {
    const maxRetries = 3
    const retryDelay = 1000 // 1 second

    try {
      console.log(`🔍 Fetching user profile for auth_id: ${authId} (attempt ${retryCount + 1}/${maxRetries + 1})`)
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .single()

      if (error) {
        console.error('❌ Error fetching user profile:', error)
        if (error.code === 'PGRST116') {
          console.log('ℹ️ User profile not found - this might be expected for new users')
          
          // Retry if profile not found and we haven't exceeded max retries
          if (retryCount < maxRetries) {
            console.log(`⏳ Retrying in ${retryDelay}ms... (attempt ${retryCount + 2}/${maxRetries + 1})`)
            await new Promise(resolve => setTimeout(resolve, retryDelay))
            return fetchUserProfile(authId, retryCount + 1)
          }
          
          return null
        }
        return null
      }

      console.log('✅ User profile fetched successfully:', { 
        id: data.id, 
        email: data.email,
        user_role: data.user_role
      })
      
      return data as User
    } catch (error) {
      console.error('❌ Exception in fetchUserProfile:', error)
      
      // Retry on exception if we haven't exceeded max retries
      if (retryCount < maxRetries) {
        console.log(`⏳ Retrying after exception in ${retryDelay}ms... (attempt ${retryCount + 2}/${maxRetries + 1})`)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        return fetchUserProfile(authId, retryCount + 1)
      }
      
      return null
    }
  }

  // Create user profile in database after signup
  const createUserProfile = async (
    user: SupabaseUser | Partial<User>, 
    displayName?: string
  ): Promise<User | null> => {
    try {
      console.log('👤 Creating user profile for:', user.email)
      setIsLoading(true)
      setError(null)
      
      // Handle both SupabaseUser and our custom User types
      const isSupabaseUser = 'app_metadata' in user // SupabaseUser has app_metadata
      
      let newUser: Partial<User>
      
      if (isSupabaseUser) {
        // For SupabaseUser, construct the basic user data
        const supabaseUser = user as SupabaseUser
        newUser = {
          auth_id: supabaseUser.id,
          email: supabaseUser.email!,
          display_name: displayName || supabaseUser.email!.split('@')[0],
          user_role: 'guest' as UserRole,
          account_status: 'active',
          is_phone_verified: false,
          is_email_verified: !!supabaseUser.email_confirmed_at,
          is_identity_verified: false,
          is_host: false,
          response_rate: 0,
          guest_rating: 0,
          host_rating: 0,
          total_guest_reviews: 0,
          total_host_reviews: 0,
          total_bookings: 0,
          total_properties: 0,
          total_revenue: 0,
          preferred_currency: 'USD',
          language_preference: 'en'
        }
      } else {
        // For our custom User object, use it directly
        newUser = user as Partial<User>
        console.log('📝 Using provided user object directly')
      }

      console.log('📝 Inserting user profile with data:', newUser)

      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating user profile:', error)
        console.error('❌ Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        setError(error.message)
        throw error
      }

      console.log('✅ User profile created successfully:', { 
        id: data.id, 
        email: data.email 
      })
      
      return data as User
    } catch (error: any) {
      console.error('❌ Exception in createUserProfile:', error)
      setError(error.message || 'Failed to create user profile')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Update user profile
  const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<User | null> => {
    try {
      console.log('📝 Updating user profile:', { userId, updates: Object.keys(updates) })
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('❌ Profile update error:', error)
        setError(error.message)
        return null
      }

      console.log('✅ Profile updated successfully')
      return data as User

    } catch (error: any) {
      console.error('❌ Exception in updateUserProfile:', error)
      setError(error.message || 'Failed to update user profile')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Verify user profile exists (useful for admin registration)
  const verifyUserProfile = async (userId: string): Promise<User | null> => {
    try {
      console.log('🔍 Verifying user profile exists:', userId)
      
      const { data, error } = await supabase
        .from('users')
        .select('id, email, user_role, account_status')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ Error verifying user profile:', error)
        return null
      }

      console.log('✅ User profile verified:', data)
      return data as User
      
    } catch (error) {
      console.error('❌ Exception in verifyUserProfile:', error)
      return null
    }
  }

  // Grant admin privileges to user
  const grantAdminPrivileges = async (userId: string, adminData: {
    bio?: string
    phone?: string
  }): Promise<boolean> => {
    try {
      console.log('🔧 Granting admin privileges to user:', userId)
      setIsLoading(true)
      setError(null)
      
      const updateData: any = {
        user_role: 'admin',
        account_status: 'active',
        is_email_verified: true,
        is_identity_verified: true,
        is_host: true,
        host_since: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      }

      if (adminData.bio) {
        updateData.bio = adminData.bio
      }

      if (adminData.phone?.trim()) {
        updateData.phone = adminData.phone
        updateData.is_phone_verified = true
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)

      if (error) {
        console.error('❌ Failed to grant admin privileges:', error)
        setError(error.message)
        return false
      }

      console.log('✅ Admin privileges granted successfully')
      return true

    } catch (error: any) {
      console.error('❌ Exception in grantAdminPrivileges:', error)
      setError(error.message || 'Failed to grant admin privileges')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Clear error state
  const clearError = () => {
    setError(null)
  }

  return {
    // State
    isLoading,
    error,
    
    // Profile operations
    fetchUserProfile,
    createUserProfile,
    updateUserProfile,
    verifyUserProfile,
    
    // Admin operations
    grantAdminPrivileges,
    
    // Utilities
    clearError
  }
} 