import { useState, useEffect } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { User, UserRole } from '../interfaces/User'
import { AuthApiResponse } from '../interfaces/Auth'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  console.log('🔐 useAuth hook initialized', { timestamp: new Date().toISOString() })

  // Computed properties
  const isAuthenticated = !!user && !!supabaseUser
  const isAdmin = user?.user_role === 'admin' || user?.user_role === 'super_admin'
  const isSuperAdmin = user?.user_role === 'super_admin'

  // Fetch user profile from database
  const fetchUserProfile = async (authId: string): Promise<User | null> => {
    try {
      console.log('🔍 Fetching user profile for auth_id:', authId)
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .single()

      if (error) {
        console.error('❌ Error fetching user profile:', error)
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
      return null
    }
  }

  // Create user profile in database after signup
  const createUserProfile = async (supabaseUser: SupabaseUser, displayName: string): Promise<User | null> => {
    try {
      console.log('👤 Creating user profile for:', supabaseUser.email)
      
      const newUser: Partial<User> = {
        auth_id: supabaseUser.id,
        email: supabaseUser.email!,
        display_name: displayName,
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

      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating user profile:', error)
        throw error
      }

      console.log('✅ User profile created successfully:', { 
        id: data.id, 
        email: data.email 
      })
      
      return data as User
    } catch (error) {
      console.error('❌ Exception in createUserProfile:', error)
      throw error
    }
  }

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

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        console.error('❌ Profile update error:', error.message)
        return { error: error.message }
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
  useEffect(() => {
    console.log('🔄 Initializing auth state')
    
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          console.log('✅ Active session found for:', session.user.email)
          const userProfile = await fetchUserProfile(session.user.id)
          if (userProfile) {
            setSupabaseUser(session.user)
            setUser(userProfile)
          }
        } else {
          console.log('ℹ️ No active session found')
        }
      } catch (error) {
        console.error('❌ Error getting session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event)
      
      if (session?.user) {
        const userProfile = await fetchUserProfile(session.user.id)
        if (userProfile) {
          setSupabaseUser(session.user)
          setUser(userProfile)
        }
      } else {
        setSupabaseUser(null)
        setUser(null)
      }
      
      setIsLoading(false)
    })

    return () => {
      console.log('🧹 Cleaning up auth subscription')
      subscription.unsubscribe()
    }
  }, [])

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