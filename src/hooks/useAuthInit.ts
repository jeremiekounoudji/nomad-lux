import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../lib/stores/authStore'
import { useUser } from './useUser'

export const useAuthInit = () => {
  const { setAuthData, clearAuth, setLoading } = useAuthStore()
  const { createUser, fetchUserByAuthId } = useUser()

  useEffect(() => {
    console.log('🔐 Initializing auth state listener...')
    setLoading(true)

    // Add a safety timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('⏰ Loading timeout reached, forcing loading to false')
      setLoading(false)
    }, 8000) // 8 seconds max loading time

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔍 Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Error getting initial session:', error)
          clearTimeout(loadingTimeout)
          setLoading(false)
          return
        }

        if (session?.user) {
          console.log('🔍 Found initial session for:', session.user.email)
          await fetchAndSetUser(session.user.id, session.user)
        } else {
          console.log('ℹ️ No initial session found')
          clearAuth()
        }
      } catch (error) {
        console.error('❌ Exception getting initial session:', error)
        clearAuth()
      } finally {
        clearTimeout(loadingTimeout)
        setLoading(false)
      }
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session ? 'with session' : 'no session')

      try {
        if (event === 'SIGNED_OUT') {
          console.log('🚪 User signed out, clearing auth state')
          clearAuth()
          setLoading(false)
          return
        }

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('👤 User signed in, fetching user data...')
          // Add retries for database user fetch during registration
          let retries = 3
          let delay = 1000 // Start with 1 second delay
          
          while (retries > 0) {
            try {
              await fetchAndSetUser(session.user.id, session.user)
              // If we get here without an error, the user was found and set
              console.log('✅ User data fetched successfully')
              break
              console.log(`⏳ User not found in database, retrying... (${retries} attempts left)`)
              await new Promise(resolve => setTimeout(resolve, delay))
              delay *= 2 // Double the delay for each retry
              retries--
            } catch (error) {
              console.error('❌ Error fetching user:', error)
              retries--
              if (retries === 0) throw error
            }
          }
        } else if (!session?.user) {
          console.log('🚪 No session found, clearing auth state')
          clearAuth()
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ Error in auth state change handler:', error)
        clearAuth()
        setLoading(false)
      }
    })

    // Fetch user from database and update store
    const fetchAndSetUser = async (authId: string, supabaseUser: any) => {
      try {
        console.log('👤 Starting fetchAndSetUser for auth_id:', authId)
        
        // Add a small delay to allow network/auth to stabilize
        console.log('⏳ Waiting 2 seconds before fetching user data...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        console.log('✅ Wait complete, now fetching user data')
        
        // Add timeout for database query
        const fetchTimeout = setTimeout(() => {
          console.log('⏰ Database fetch timeout, proceeding with minimal user data')
        }, 10000)
        
        const userData = await fetchUserByAuthId(authId)
        clearTimeout(fetchTimeout)
        
        if (userData) {
          console.log('✅ User found, setting auth data:', userData.email)
          setAuthData(userData, supabaseUser)
          setLoading(false)
        } else {
          console.log('⚠️ No user found in database, but keeping Supabase session')
          // Don't clear auth if we have a valid Supabase session
          // This handles cases where the database query fails but the user is still authenticated
          if (supabaseUser) {
            console.log('📦 Creating minimal user data from Supabase user')
            const minimalUser = {
              id: supabaseUser.id,
              auth_id: supabaseUser.id,
              email: supabaseUser.email,
              display_name: supabaseUser.user_metadata?.display_name || supabaseUser.email?.split('@')[0] || 'User',
              username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0],
              avatar_url: supabaseUser.user_metadata?.avatar_url,
              phone: supabaseUser.user_metadata?.phone,
              bio: undefined,
              location: undefined,
              date_of_birth: undefined,
              is_phone_verified: false,
              is_email_verified: supabaseUser.email_confirmed_at ? true : false,
              is_identity_verified: false,
              user_role: 'guest' as const,
              account_status: 'active' as const,
              is_host: false,
              host_since: undefined,
              response_rate: 0,
              response_time: undefined,
              guest_rating: 0,
              host_rating: 0,
              total_guest_reviews: 0,
              total_host_reviews: 0,
              total_bookings: 0,
              total_properties: 0,
              total_revenue: 0,
              preferred_currency: 'USD',
              language_preference: 'en',
              timezone: undefined,
              last_login: new Date().toISOString(),
              created_at: supabaseUser.created_at,
              updated_at: new Date().toISOString()
            }
            setAuthData(minimalUser, supabaseUser)
          } else {
            clearAuth()
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ Exception in fetchAndSetUser:', error)
        // Don't clear auth on database errors if we have a valid Supabase session
        if (supabaseUser) {
          console.log('⚠️ Database error but keeping Supabase session active')
          setLoading(false)
        } else {
          clearAuth()
          setLoading(false)
        }
      }
    }

    // Initialize
    getInitialSession()

    // Cleanup subscription on unmount
    return () => {
      console.log('🧹 Cleaning up auth subscription')
      subscription.unsubscribe()
    }
  }, [])
} 