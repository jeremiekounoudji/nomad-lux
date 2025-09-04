import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useUser } from './useUser'
import { useAuthStore } from '../lib/stores/authStore'
import { User } from '../interfaces/User'

interface AdminRegistrationData {
  email: string
  password: string
  displayName: string
  bio?: string
  phone?: string
}

export const useAdminAuth = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { createUser } = useUser()
  const { setAuthData, clearAuth, setLoading } = useAuthStore()

  console.log('🔐 useAdminAuth hook initialized')

  const registerAdmin = async ({ email, password, displayName, bio, phone }: AdminRegistrationData) => {
    try {
      console.log('📝 Starting admin registration for:', email)
      setIsLoading(true)
      setLoading(true)
      setError(null)

      // Step 1: Authenticate user with Supabase
      console.log('🔐 Step 1: Creating Supabase auth user...')
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      })
      console.log("data flow pass");
      
      console.log('🔍 Auth response received:', { 
        hasData: !!authData, 
        hasUser: !!authData?.user,
        hasError: !!authError,
        errorMessage: authError?.message,
        userEmail: authData?.user?.email
      })

      if (authError) {
        console.error('❌ Supabase auth failed:', authError.message)
        throw new Error(authError.message)
      }

      if (!authData) {
        console.error('❌ No auth data returned from Supabase')
        throw new Error('Authentication failed - no data returned')
      }

      if (!authData.user) {
        console.error('❌ No auth user returned')
        throw new Error('Authentication failed - no user created')
      }

      console.log('✅ Step 1 complete: Supabase auth user created:', authData.user.email)
      console.log('🔍 User details:', {
        id: authData.user.id,
        email: authData.user.email,
        confirmed_at: authData.user.email_confirmed_at
      })

      // Step 2: Create admin user in database using useUser hook
      console.log('👤 Step 2: Creating admin user in database using useUser hook...')
      const adminUserData: Partial<User> = {
        auth_id: authData.user.id,
        email: authData.user.email!,
        display_name: displayName,
        user_role: 'admin',
        account_status: 'active',
        is_phone_verified: !!phone?.trim(),
        is_email_verified: true,
        is_identity_verified: true,
        is_host: true,
        host_since: new Date().toISOString().split('T')[0],
        response_rate: 0,
        guest_rating: 0.00,
        host_rating: 0.00,
        total_guest_reviews: 0,
        total_host_reviews: 0,
        total_bookings: 0,
        total_properties: 0,
        total_revenue: 0.00,
        preferred_currency: 'USD',
        language_preference: 'en',
        bio: bio || 'Administrator',
        phone: phone?.trim() || undefined
      }

      console.log('📊 Using useUser.createUser with data:', adminUserData)
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay

      const createdUser = await createUser(adminUserData)

      if (!createdUser) {
        console.error('❌ Failed to create user in database')
        throw new Error('Failed to create admin user in database')
      }

      console.log('✅ Step 2 complete: Admin user created in database:', createdUser.email)

      // Step 3: Update Zustand store with authentication data
      console.log('🏪 Step 3: Updating Zustand store...')
      setAuthData(createdUser, authData.user)

      console.log('✅ Admin registration completed successfully!')
      return { user: createdUser, error: null }

    } catch (error: any) {
      console.error('❌ Admin registration failed:', error)
      console.error('❌ Error stack:', error.stack)
      const errorMessage = error.message || 'Admin registration failed'
      setError(errorMessage)
      return { user: null, error: errorMessage }
    } finally {
      console.log('🏁 Finally block reached - cleaning up...')
      setIsLoading(false)
      setLoading(false)
    }
  }

  const signInAdmin = async (email: string, password: string) => {
    try {
      console.log('🔑 Starting admin sign in for:', email)
      setIsLoading(true)
      setLoading(true)
      setError(null)

      // Step 1: Sign in with Supabase
      console.log('🔐 Step 1: Signing in with Supabase...')
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        console.error('❌ Supabase sign in failed:', authError.message)
        throw new Error(authError.message)
      }

      if (!authData.user) {
        console.error('❌ No auth user returned')
        throw new Error('Sign in failed - no user data')
      }

      console.log('✅ Step 1 complete: Supabase sign in successful:', authData.user.email)

      // Step 2: Fetch user from database (this will be handled by useAuthInit)
      // The auth state change will trigger automatic user fetch
      console.log('✅ Admin sign in completed successfully!')
      return { user: null, error: null } // User will be set by auth listener

    } catch (error: any) {
      console.error('❌ Admin sign in failed:', error)
      const errorMessage = error.message || 'Admin sign in failed'
      setError(errorMessage)
      return { user: null, error: errorMessage }
    } finally {
      setIsLoading(false)
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 Signing out admin user...')
      // Don't set loading state for logout - it causes white screen blink
      // setIsLoading(true)
      // setLoading(true)

      // Clear auth state immediately to prevent UI issues
      clearAuth()

      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ Sign out error:', error)
        // Don't throw error, still consider logout successful for UI purposes
        console.log('⚠️ Supabase signOut had error but continuing with logout')
      }

      console.log('✅ Admin signed out successfully')
      return { error: null }

    } catch (error: any) {
      console.error('❌ Sign out failed:', error)
      // Even if there's an error, clear the auth state
      clearAuth()
      const errorMessage = error.message || 'Sign out failed'
      setError(errorMessage)
      return { error: errorMessage }
    }
    // No finally block needed since we're not setting loading state
  }

  const clearError = () => setError(null)

  return {
    isLoading,
    error,
    registerAdmin,
    signInAdmin,
    signOut,
    clearError
  }
} 