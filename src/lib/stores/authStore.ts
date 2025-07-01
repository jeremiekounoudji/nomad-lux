import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../../interfaces/User'
import { User as SupabaseUser } from '@supabase/supabase-js'

interface AuthState {
  // State
  user: User | null
  supabaseUser: SupabaseUser | null
  isAuthenticated: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  isLoading: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setSupabaseUser: (supabaseUser: SupabaseUser | null) => void
  setLoading: (loading: boolean) => void
  clearAuth: () => void
  setAuthData: (user: User | null, supabaseUser: SupabaseUser | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      supabaseUser: null,
      isAuthenticated: false,
      isAdmin: false,
      isSuperAdmin: false,
      isLoading: false,

      // Actions
      setUser: (user) => {
        console.log('🏪 AuthStore: Setting user:', user?.email || 'null')
        set({
          user,
          isAuthenticated: !!user,
          isAdmin: user?.user_role === 'admin' || user?.user_role === 'super_admin',
          isSuperAdmin: user?.user_role === 'super_admin'
        })
      },

      setSupabaseUser: (supabaseUser) => {
        console.log('🏪 AuthStore: Setting Supabase user:', supabaseUser?.email || 'null')
        set({ supabaseUser })
      },

      setLoading: (isLoading) => {
        console.log('🏪 AuthStore: Setting loading:', isLoading)
        set({ isLoading })
      },

      clearAuth: () => {
        console.log('🏪 AuthStore: Clearing auth data')
        set({
          user: null,
          supabaseUser: null,
          isAuthenticated: false,
          isAdmin: false,
          isSuperAdmin: false,
          isLoading: false
        })
        
        // Also clear from localStorage to prevent persistence issues
        localStorage.removeItem('nomad-lux-auth')
      },

      setAuthData: (user, supabaseUser) => {
        console.log('🏪 AuthStore: Setting complete auth data:', {
          userEmail: user?.email || 'null',
          supabaseEmail: supabaseUser?.email || 'null'
        })
        set({
          user,
          supabaseUser,
          isAuthenticated: !!user && !!supabaseUser,
          isAdmin: user?.user_role === 'admin' || user?.user_role === 'super_admin',
          isSuperAdmin: user?.user_role === 'super_admin'
        })
      }
    }),
    {
      name: 'nomad-lux-auth',
      partialize: (state) => ({
        user: state.user,
        supabaseUser: state.supabaseUser,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
        isSuperAdmin: state.isSuperAdmin
      })
    }
  )
) 