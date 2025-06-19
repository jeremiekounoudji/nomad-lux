import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAdminSettingsStore, groupSettingsByCategory } from '../lib/stores/adminSettingsStore'
import { 
  AdminSettings, 
  AdminSettingRecord,
  PlatformSettings, 
  BookingSettings, 
  NotificationSettings, 
  SecuritySettings, 
  PaymentSettings 
} from '../interfaces/Settings'

export const useAdminSettings = () => {
  const {
    settings,
    draftSettings,
    isLoading,
    error,
    hasUnsavedChanges,
    setSettings,
    setLoading,
    setError,
    clearError,
    updateDraftPlatformSettings,
    updateDraftBookingSettings,
    updateDraftNotificationSettings,
    updateDraftSecuritySettings,
    updateDraftPaymentSettings,
    resetDrafts,
    clearDrafts,
    getCurrentSettings,
    shouldRefresh,
    invalidateCache
  } = useAdminSettingsStore()

  // Fetch settings from database
  const fetchSettings = async (): Promise<AdminSettings> => {
    // Return cached data if it's still fresh
    if (settings && !shouldRefresh()) {
      console.log('📋 Using cached admin settings')
      return settings
    }

    console.log('📥 Fetching admin settings from database...')
    setLoading(true)
    clearError()
    
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .order('category', { ascending: true })
        .order('setting_key', { ascending: true })

      if (error) {
        console.error('❌ Supabase error fetching settings:', error)
        throw new Error(`Failed to fetch settings: ${error.message}`)
      }

      if (!data) {
        console.warn('⚠️ No settings data returned')
        const emptySettings = {} as AdminSettings
        setSettings(emptySettings)
        setLoading(false)
        return emptySettings
      }

      console.log('✅ Raw settings data fetched:', data)
      
      const groupedSettings = groupSettingsByCategory(data as AdminSettingRecord[])
      console.log('✅ Settings grouped and cached successfully')
      
      setSettings(groupedSettings)
      setLoading(false)
      
      return groupedSettings
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('❌ Failed to fetch settings:', error)
      setError(errorMessage)
      throw error
    }
  }

  // Save all draft changes to database
  const saveAllChanges = async (): Promise<void> => {
    if (!draftSettings || !settings) {
      console.warn('⚠️ No draft settings or original settings available')
      return
    }

    // Ensure we have valid settings objects
    if (typeof draftSettings !== 'object' || typeof settings !== 'object') {
      console.warn('⚠️ Invalid settings objects')
      return
    }

    console.log('💾 Saving all draft changes to database...')
    setLoading(true)
    clearError()

    try {
      // Compare draft with original and collect changes
      const updates: Array<{
        category: string,
        setting_key: string,
        setting_value: any,
        data_type: string
      }> = []

      for (const [categoryKey, categorySettings] of Object.entries(draftSettings)) {
        if (!categorySettings || typeof categorySettings !== 'object') continue

        // Map interface categories back to database categories
        let dbCategory: string
        switch (categoryKey) {
          case 'platform':
            dbCategory = 'general'
            break
          case 'notification':
            dbCategory = 'notifications'
            break
          default:
            dbCategory = categoryKey
        }

        for (const [settingKey, value] of Object.entries(categorySettings)) {
          // Skip null/undefined values
          if (value === null || value === undefined) {
            continue
          }
          
          // Check if value changed
          const originalValue = (settings[categoryKey as keyof AdminSettings] as any)?.[settingKey]
          if (JSON.stringify(originalValue) !== JSON.stringify(value)) {
            let dataType: string = 'string'
            
            if (typeof value === 'number') dataType = 'number'
            else if (typeof value === 'boolean') dataType = 'boolean'
            else if (Array.isArray(value)) dataType = 'array'
            else if (typeof value === 'object') dataType = 'object'

            updates.push({
              category: dbCategory,
              setting_key: settingKey,
              setting_value: value,
              data_type: dataType
            })
          }
        }
      }

      console.log(`💾 Saving ${updates.length} changed settings:`, updates)

      // Only proceed if there are actual changes
      if (updates.length === 0) {
        console.log('ℹ️ No changes to save')
        setLoading(false)
        return
      }

      // Batch update all changes
      const { error } = await supabase
        .from('admin_settings')
        .upsert(
          updates.map(update => ({
            ...update,
            updated_at: new Date().toISOString()
          })), 
          {
            onConflict: 'category,setting_key'
          }
        )

      if (error) {
        console.error('❌ Failed to save settings:', error)
        throw new Error(`Failed to save settings: ${error.message}`)
      }

      console.log('✅ All settings saved successfully')

      // Refresh settings from database to ensure consistency
      await fetchSettings()
      
      // Note: clearDrafts is automatically handled by setSettings in the store
      setLoading(false)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('❌ Error saving settings:', error)
      setError(errorMessage)
      setLoading(false)
      throw error
    }
  }

  // Auto-fetch settings on mount
  useEffect(() => {
    if (!settings) {
      fetchSettings().catch(console.error)
    }
  }, [settings])

  // Return current settings (draft if available, otherwise original)
  const currentSettings = getCurrentSettings()

  return {
    // State
    settings: currentSettings,
    isLoading,
    error,
    hasUnsavedChanges,
    
    // Actions
    fetchSettings,
    saveAllChanges,
    resetDrafts,
    invalidateCache,
    
    // Convenience methods for updating settings
    updatePlatformSettings: updateDraftPlatformSettings,
    updateBookingSettings: updateDraftBookingSettings,
    updateNotificationSettings: updateDraftNotificationSettings,
    updateSecuritySettings: updateDraftSecuritySettings,
    updatePaymentSettings: updateDraftPaymentSettings,
  }
} 