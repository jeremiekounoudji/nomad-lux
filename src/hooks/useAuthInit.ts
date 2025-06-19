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

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔍 Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Error getting initial session:', error)
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
          await fetchAndSetUser(session.user.id, session.user)
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
        
        const userData = await fetchUserByAuthId(authId)
        
        if (userData) {
          console.log('✅ User found, setting auth data:', userData.email)
          setAuthData(userData, supabaseUser)
          setLoading(false)
        } else {
          console.log('ℹ️ No user found, clearing auth')
          clearAuth()
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ Exception in fetchAndSetUser:', error)
        clearAuth()
        setLoading(false)
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