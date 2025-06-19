import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../context/AuthContext'

// Admin settings interfaces
interface AdminSetting {
  category: string
  setting_key: string
  setting_value: any
  data_type: string
  description?: string
  is_encrypted: boolean
  updated_at: string
}

interface AdminSettingsResponse {
  [category: string]: {
    [key: string]: any
  }
}

interface UpdateSettingParams {
  category: string
  settingKey: string
  newValue: any
  description?: string
}

export const useAdminSettings = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAdmin, isSuperAdmin } = useAuthContext()

  console.log('⚙️ useAdminSettings hook initialized', { 
    isAdmin, 
    isSuperAdmin,
    timestamp: new Date().toISOString() 
  })

  // Get all admin settings
  const getSettings = useCallback(async (categoryFilter?: string): Promise<AdminSettingsResponse | null> => {
    try {
      console.log('📥 Fetching admin settings', { categoryFilter })
      setIsLoading(true)
      setError(null)

      if (!isAdmin) {
        throw new Error('Admin access required')
      }

      const { data, error } = await supabase.rpc('get_admin_settings', {
        category_filter: categoryFilter || null,
        include_encrypted: false
      })

      if (error) {
        console.error('❌ Error fetching admin settings:', error)
        throw error
      }

      console.log('✅ Admin settings fetched successfully:', Object.keys(data || {}))
      return data || {}

    } catch (err: any) {
      console.error('❌ Exception in getSettings:', err)
      setError(err.message || 'Failed to fetch settings')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin])

  // Update a single setting
  const updateSetting = useCallback(async ({ 
    category, 
    settingKey, 
    newValue, 
    description 
  }: UpdateSettingParams): Promise<boolean> => {
    try {
      console.log('📝 Updating admin setting:', { category, settingKey, newValue })
      setIsLoading(true)
      setError(null)

      if (!isAdmin) {
        throw new Error('Admin access required')
      }

      const { data, error } = await supabase.rpc('update_admin_setting', {
        setting_category: category,
        setting_key: settingKey,
        new_value: newValue,
        setting_description: description || null
      })

      if (error) {
        console.error('❌ Error updating admin setting:', error)
        throw error
      }

      console.log('✅ Admin setting updated successfully:', data)
      return true

    } catch (err: any) {
      console.error('❌ Exception in updateSetting:', err)
      setError(err.message || 'Failed to update setting')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin])

  // Update multiple settings at once
  const updateSettingsBulk = useCallback(async (settingsData: any): Promise<boolean> => {
    try {
      console.log('📝 Bulk updating admin settings:', Object.keys(settingsData))
      setIsLoading(true)
      setError(null)

      if (!isAdmin) {
        throw new Error('Admin access required')
      }

      const { data, error } = await supabase.rpc('update_admin_settings_bulk', {
        settings_data: settingsData
      })

      if (error) {
        console.error('❌ Error bulk updating admin settings:', error)
        throw error
      }

      if (!data.success) {
        console.error('❌ Bulk update had errors:', data.errors)
        throw new Error(`Bulk update failed: ${data.errors?.join(', ')}`)
      }

      console.log('✅ Admin settings bulk updated successfully:', data)
      return true

    } catch (err: any) {
      console.error('❌ Exception in updateSettingsBulk:', err)
      setError(err.message || 'Failed to bulk update settings')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin])

  // Reset settings to default (super admin only)
  const resetSettings = useCallback(async (categoryFilter?: string): Promise<boolean> => {
    try {
      console.log('🔄 Resetting admin settings to default:', { categoryFilter })
      setIsLoading(true)
      setError(null)

      if (!isSuperAdmin) {
        throw new Error('Super admin access required for reset operations')
      }

      const { data, error } = await supabase.rpc('reset_admin_settings', {
        category_filter: categoryFilter || null,
        confirm_reset: true
      })

      if (error) {
        console.error('❌ Error resetting admin settings:', error)
        throw error
      }

      console.log('✅ Admin settings reset successfully:', data)
      return true

    } catch (err: any) {
      console.error('❌ Exception in resetSettings:', err)
      setError(err.message || 'Failed to reset settings')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSuperAdmin])

  // Get settings change history
  const getSettingsHistory = useCallback(async (
    categoryFilter?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[] | null> => {
    try {
      console.log('📜 Fetching settings change history', { categoryFilter, limit, offset })
      setIsLoading(true)
      setError(null)

      if (!isAdmin) {
        throw new Error('Admin access required')
      }

      const { data, error } = await supabase.rpc('get_admin_settings_history', {
        category_filter: categoryFilter || null,
        limit_count: limit,
        offset_count: offset
      })

      if (error) {
        console.error('❌ Error fetching settings history:', error)
        throw error
      }

      console.log('✅ Settings history fetched successfully:', data?.data?.length || 0, 'entries')
      return data?.data || []

    } catch (err: any) {
      console.error('❌ Exception in getSettingsHistory:', err)
      setError(err.message || 'Failed to fetch settings history')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin])

  // Validate current settings
  const validateSettings = useCallback(async (): Promise<{ valid: boolean; errors: string[] } | null> => {
    try {
      console.log('✔️ Validating admin settings')
      setIsLoading(true)
      setError(null)

      if (!isAdmin) {
        throw new Error('Admin access required')
      }

      const { data, error } = await supabase.rpc('validate_admin_settings')

      if (error) {
        console.error('❌ Error validating admin settings:', error)
        throw error
      }

      console.log('✅ Settings validation completed:', data)
      return data

    } catch (err: any) {
      console.error('❌ Exception in validateSettings:', err)
      setError(err.message || 'Failed to validate settings')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // State
    isLoading,
    error,
    
    // Actions
    getSettings,
    updateSetting,
    updateSettingsBulk,
    resetSettings,
    getSettingsHistory,
    validateSettings,
    clearError,
    
    // Permissions
    canRead: isAdmin,
    canWrite: isAdmin,
    canReset: isSuperAdmin
  }
} 