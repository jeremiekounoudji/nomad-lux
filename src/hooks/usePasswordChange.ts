import { useState, useCallback } from 'react'
import { useAuthStore } from '../lib/stores/authStore'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

interface UsePasswordChangeReturn {
  isChanging: boolean
  error: string | null
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  resetError: () => void
}

export const usePasswordChange = (): UsePasswordChangeReturn => {
  const [isChanging, setIsChanging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { user } = useAuthStore()

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      setIsChanging(true)
      setError(null)

      console.log('🔄 Starting password change for user:', user.id)

      // First, verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword
      })

      if (signInError) {
        console.error('❌ Current password verification failed:', signInError)
        throw new Error('Current password is incorrect')
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        console.error('❌ Password update failed:', updateError)
        throw new Error(updateError.message || 'Failed to update password')
      }

      console.log('✅ Password changed successfully')
      toast.success('Password changed successfully')

    } catch (err: any) {
      console.error('❌ Error changing password:', err)
      const errorMessage = err.message || 'Failed to change password'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsChanging(false)
    }
  }, [user])

  const resetError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isChanging,
    error,
    changePassword,
    resetError
  }
}
