import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../lib/stores/authStore'
import { useUser } from './useUser'

export const useAuthInit = () => {
  const { setAuthData, clearAuth, setLoading } = useAuthStore()
  const { fetchUserByAuthId } = useUser()

  useEffect(() => {
    setLoading(true)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          const userData = await fetchUserByAuthId(session.user.id)
          if (userData) {
            setAuthData(userData, session.user)
          } else {
            // If user is not in our DB, but authenticated, create a minimal user object
            const minimalUser = {
              id: session.user.id,
              auth_id: session.user.id,
              email: session.user.email,
              display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'User',
              username: session.user.user_metadata?.username || session.user.email?.split('@')[0],
              avatar_url: session.user.user_metadata?.avatar_url,
              user_role: 'guest' as const,
              account_status: 'active' as const,
              created_at: session.user.created_at,
              updated_at: new Date().toISOString(),
            };
            setAuthData(minimalUser as any, session.user);
          }
        } else {
          clearAuth()
        }
      } catch (error) {
        console.error('Error during auth state change:', error)
        clearAuth()
      } finally {
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])
} 