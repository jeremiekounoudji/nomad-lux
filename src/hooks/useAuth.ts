import { useState, useEffect } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { User, UserRole } from '../interfaces/User'
import { AuthApiResponse } from '../interfaces/Auth'
import { useUserProfile } from './useUserProfile'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Use user profile management hook
  const {fetchUserProfile, createUserProfile, updateUserProfile} = useUserProfile()

  console.log('🔐 useAuth hook initialized', { timestamp: new Date().toISOString() })

  // Computed properties
  const isAuthenticated = !!user && !!supabaseUser
  const isAdmin = user?.user_role === 'admin' || user?.user_role === 'super_admin'
  const isSuperAdmin = user?.user_role === 'super_admin'

  // Use fetchUserProfile from userProfileHook
  // const fetchUserProfile = userProfileHook.fetchUserProfile

  // Use createUserProfile from userProfileHook

  // Sign in function
  const signIn = async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
    try {
      console.log('🔑 Attempting sign in for:', email)
      setIsLoading(true)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('❌ Sign in error:', error.message)
        return { user: null, error: error.message }
      }

      if (!data.user) {
        console.error('❌ No user returned from sign in')
        return { user: null, error: 'No user data received' }
      }

      console.log('✅ Supabase auth successful for:', data.user.email)

      // Fetch user profile
      const userProfile = await fetchUserProfile(data.user.id)
      if (!userProfile) {
        console.error('❌ Failed to fetch user profile after sign in')
        return { user: null, error: 'Failed to load user profile' }
      }

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('auth_id', data.user.id)

      setSupabaseUser(data.user)
      setUser(userProfile)
      
      console.log('✅ Sign in completed successfully for:', userProfile.email)
      return { user: userProfile, error: null }

    } catch (error: any) {
      console.error('❌ Exception in signIn:', error)
      return { user: null, error: error.message || 'An unexpected error occurred' }
    } finally {
      setIsLoading(false)
    }
  }

  // Sign up function
  const signUp = async (email: string, password: string, displayName: string): Promise<{ user: User | null; error: string | null }> => {
    try {
      console.log('📝 Attempting sign up for:', email)
      setIsLoading(true)

      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) {
        console.error('❌ Sign up error:', error.message)
        return { user: null, error: error.message }
      }

      if (!data.user) {
        console.error('❌ No user returned from sign up')
        return { user: null, error: 'No user data received' }
      }

      console.log('✅ Supabase auth signup successful for:', data.user.email)

      // Create user profile
      const userProfile = await createUserProfile(data.user, displayName)
      if (!userProfile) {
        console.error('❌ Failed to create user profile after sign up')
        return { user: null, error: 'Failed to create user profile' }
      }

      setSupabaseUser(data.user)
      setUser(userProfile)
      
      console.log('✅ Sign up completed successfully for:', userProfile.email)
      return { user: userProfile, error: null }

    } catch (error: any) {
      console.error('❌ Exception in signUp:', error)
      return { user: null, error: error.message || 'An unexpected error occurred' }
    } finally {
      setIsLoading(false)
    }
  }

  // Sign out function
  const signOut = async (): Promise<{ error: string | null }> => {
    try {
      console.log('🚪 Attempting sign out')
      setIsLoading(true)

      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ Sign out error:', error.message)
        return { error: error.message }
      }

      setUser(null)
      setSupabaseUser(null)
      
      console.log('✅ Sign out completed successfully')
      return { error: null }

    } catch (error: any) {
      console.error('❌ Exception in signOut:', error)
      return { error: error.message || 'An unexpected error occurred' }
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    try {
      console.log('🔄 Refreshing user data')
      
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (currentUser) {
        const userProfile = await fetchUserProfile(currentUser.id)
        if (userProfile) {
          setUser(userProfile)
          setSupabaseUser(currentUser)
          console.log('✅ User data refreshed successfully')
        }
      } else {
        setUser(null)
        setSupabaseUser(null)
        console.log('ℹ️ No current user found during refresh')
      }
    } catch (error) {
      console.error('❌ Error refreshing user:', error)
    }
  }

  // Update user profile
  const updateProfile = async (updates: Partial<User>): Promise<{ error: string | null }> => {
    try {
      console.log('📝 Updating user profile:', Object.keys(updates))
      
      if (!user) {
        return { error: 'No user logged in' }
      }

      const updatedUser = await updateUserProfile(user.id, updates)
      
      if (!updatedUser) {
        return { error: 'Failed to update profile' }
      }

      // Refresh user data
      await refreshUser()
      
      console.log('✅ Profile updated successfully')
      return { error: null }

    } catch (error: any) {
      console.error('❌ Exception in updateProfile:', error)
      return { error: error.message || 'An unexpected error occurred' }
    }
  }

  // Initialize auth state on mount
  // useEffect(() => {
  //   console.log('🔄 Initializing auth state')
  //   let mounted = true
    
  //   const getSession = async () => {
  //     try {
  //       console.log('🔍 Getting initial session...')
  //       const { data: { session }, error } = await supabase.auth.getSession()
        
  //       if (error) {
  //         console.error('❌ Error getting session:', error)
  //         if (mounted) {
  //           setIsLoading(false)
  //         }
  //         return
  //       }
        
  //       if (session?.user) {
  //         console.log('✅ Active session found for:', session.user.email)
  //         const userProfile = await fetchUserProfile(session.user.id)
  //         if (userProfile && mounted) {
  //           setSupabaseUser(session.user)
  //           setUser(userProfile)
  //         }
  //       } else {
  //         console.log('ℹ️ No active session found')
  //       }
  //     } catch (error) {
  //       console.error('❌ Exception getting session:', error)
  //     } finally {
  //       if (mounted) {
  //         console.log('🔄 Setting loading to false after session check')
  //         setIsLoading(false)
  //       }
  //     }
  //   }

  //   // Set a timeout to ensure loading doesn't get stuck
  //   const timeoutId = setTimeout(() => {
  //     if (mounted) {
  //       console.log('⏰ Timeout reached, forcing loading to false')
  //       setIsLoading(false)
  //     }
  //   }, 5000) // 5 second timeout

  //   getSession()

  //   // Listen for auth changes
  //   console.log('📡 Setting up auth state change listener')
  //   const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
  //     console.log('🔄 Auth state change event:', event, session ? 'with session' : 'no session')
      
  //     try {
  //       if (session?.user) {
  //         const userProfile = await fetchUserProfile(session.user.id)
  //         if (userProfile && mounted) {
  //           setSupabaseUser(session.user)
  //           setUser(userProfile)
  //         }
  //       } else {
  //         if (mounted) {
  //           setSupabaseUser(null)
  //           setUser(null)
  //         }
  //       }
  //     } catch (error) {
  //       console.error('❌ Error in auth state change handler:', error)
  //     } finally {
  //       if (mounted) {
  //         setIsLoading(false)
  //       }
  //     }
  //   })

  //   return () => {
  //     console.log('🧹 Cleaning up auth subscription and timeout')
  //     mounted = false
  //     clearTimeout(timeoutId)
  //     subscription.unsubscribe()
  //   }
  // }, [])

  return {
    // State
    user,
    supabaseUser,
    isLoading,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    
    // Actions
    signIn,
    signUp,
    signOut,
    refreshUser,
    updateProfile
  }
} 