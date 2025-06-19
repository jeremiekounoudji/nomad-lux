import { User as SupabaseUser } from '@supabase/supabase-js'
import { User } from './User'

// Auth context state interface
export interface AuthState {
  user: User | null
  supabaseUser: SupabaseUser | null
  isLoading: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  isAuthenticated: boolean
}

// Auth actions interface
export interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>
  signUp: (email: string, password: string, displayName: string) => Promise<{ user: User | null; error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  refreshUser: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<{ error: string | null }>
}

// Combined auth context interface
export interface AuthContextType extends AuthState, AuthActions {}

// Sign in/up form data interfaces
export interface SignInData {
  email: string
  password: string
}

export interface SignUpData {
  email: string
  password: string
  displayName: string
  confirmPassword: string
}

// API response interfaces
export interface AuthApiResponse<T = any> {
  data?: T
  error?: string
  success: boolean
}

// Admin settings related auth interfaces
export interface AdminSettingsAccess {
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
  canReset: boolean
} 