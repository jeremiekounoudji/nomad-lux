import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/stores/authStore';
import { useUser } from './useUser';
import type { Session } from '@supabase/supabase-js';

export const useAuthInit = () => {
  const { setAuthData, clearAuth, setLoading } = useAuthStore();
  const { fetchUserByAuthId } = useUser();

  useEffect(() => {
    setLoading(true);

    const handleSessionUpdate = async (session: Session | null) => {
      try {
        if (session?.user) {
          const userData = await fetchUserByAuthId(session.user.id);
          if (userData) {
            setAuthData(userData, session.user);
          } else {
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
          clearAuth();
        }
      } catch (error) {
        console.error('Error during auth state change processing:', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    // Fetch the current session immediately on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSessionUpdate(session);
    });

    // Listen for sign-in/out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          handleSessionUpdate(session);
        } else if (event === 'SIGNED_OUT') {
          // For logout, just clear auth without setting loading state
          clearAuth();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
    // The dependencies are the functions used within the effect.
    // Zustand setters are stable, so we can disable the lint warning.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUserByAuthId]);
}; 