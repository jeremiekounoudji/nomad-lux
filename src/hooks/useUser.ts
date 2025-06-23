import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { User } from '../interfaces/User'

export const useUser = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  console.log('👤 useUser hook initialized')

  const createUser = async (userData: Partial<User>): Promise<User | null> => {
    try {
      console.log('👤 Creating user in database:', userData.email)
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating user:', error)
        setError(error.message)
        return null
      }

      console.log('✅ User created successfully:', data.email)
      return data as User

    } catch (error: any) {
      console.error('❌ Exception in createUser:', error)
      setError(error.message || 'Failed to create user')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserByAuthId = async (authId: string): Promise<User | null> => {
    try {
      console.log('🔍 Fetching user from database for auth_id:', authId)
      setIsLoading(true)
      setError(null)

      // Add detailed logging to debug the query
      console.log('📡 Starting user fetch operation...')

      console.log('🔍 Starting database query...')
      
      // Query with proper error handling
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .single()

      console.log('📊 Query completed with result:', {
        hasData: !!data,
        hasError: !!error,
        errorMessage: error?.message,
        errorCode: error?.code,
        errorDetails: error?.details
      })

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('ℹ️ User not found in database (normal for new users)')
          return null
        } else {
          console.error('❌ Database error:', error)
          console.error('Error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          })
          setError(error.message)
          return null
        }
      }

      if (data) {
        console.log('✅ User found:', {
          id: data.id,
          email: data.email,
          user_role: data.user_role,
          account_status: data.account_status
        })
        return data as User
      }

      console.log('ℹ️ No user data returned')
      return null

    } catch (error: any) {
      console.error('❌ Exception in fetchUserByAuthId:', error)
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        type: typeof error
      })
      setError(error.message || 'Failed to fetch user')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => setError(null)

  return {
    isLoading,
    error,
    createUser,
    fetchUserByAuthId,
    clearError
  }
} 