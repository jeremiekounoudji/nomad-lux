import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  AdminSettings, 
  PlatformSettings, 
  BookingSettings, 
  NotificationSettings, 
  SecuritySettings, 
  PaymentSettings,
  ContentSettings,
  AdminSettingRecord
} from '../../interfaces/Settings'

interface AdminSettingsStore {
  // State
  settings: AdminSettings | null // Original settings from database
  draftSettings: AdminSettings | null // Local changes not yet saved
  isLoading: boolean
  error: string | null
  lastFetched: number | null
  hasUnsavedChanges: boolean

  // Actions
  setSettings: (settings: AdminSettings) => void
  setDraftSettings: (draftSettings: AdminSettings) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Draft operations
  updateDraftSetting: (
    category: keyof AdminSettings,
    settingKey: string,
    value: any
  ) => void
  resetDrafts: () => void
  clearDrafts: () => void
  
  // Convenience methods for updating draft settings
  updateDraftPlatformSettings: (updates: Partial<PlatformSettings>) => void
  updateDraftBookingSettings: (updates: Partial<BookingSettings>) => void
  updateDraftNotificationSettings: (updates: Partial<NotificationSettings>) => void
  updateDraftSecuritySettings: (updates: Partial<SecuritySettings>) => void
  updateDraftPaymentSettings: (updates: Partial<PaymentSettings>) => void
  updateDraftContentSettings: (updates: Partial<ContentSettings>) => void
  
  // Cache management
  shouldRefresh: () => boolean
  invalidateCache: () => void
  
  // Getters for current values (draft if available, otherwise original)
  getCurrentSettings: () => AdminSettings
}

// Helper function to group database records by category
const groupSettingsByCategory = (records: AdminSettingRecord[]): AdminSettings => {
  console.log('🔄 [AdminSettings] Grouping settings by category:', records.length, 'records');
  
  const grouped: AdminSettings = {
    platform: {} as PlatformSettings,
    booking: {} as BookingSettings,
    notification: {} as NotificationSettings,
    security: {} as SecuritySettings,
    payment: {} as PaymentSettings,
    content: {} as ContentSettings
  }

  records.forEach(record => {
    let categoryKey: keyof AdminSettings
    
    // Map database categories to interface categories
    switch (record.category) {
      case 'general':
        categoryKey = 'platform'
        break
      case 'notifications':
        categoryKey = 'notification'
        break
      case 'content':
        categoryKey = 'content'
        break
      default:
        categoryKey = record.category as keyof AdminSettings
    }

    if (grouped[categoryKey]) {
      // Special handling for property types - convert snake_case to camelCase
      if (record.setting_key === 'allowed_property_types' || record.setting_key === 'property_types') {
        console.log('🏠 [AdminSettings] Processing property types:', record.setting_value);
        (grouped[categoryKey] as any)['propertyTypes'] = record.setting_value
      } else {
        // Convert snake_case to camelCase for other settings
        const camelCaseKey = record.setting_key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
        ;(grouped[categoryKey] as any)[camelCaseKey] = record.setting_value
      }
    }
  })

  console.log('✅ [AdminSettings] Final grouped settings:', grouped);
  return grouped
}

// Deep clone utility
const deepClone = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj)
  if (Array.isArray(obj)) return obj.map(deepClone)
  
  const cloned: any = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

export const useAdminSettingsStore = create<AdminSettingsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: null,
      draftSettings: null,
      isLoading: false,
      error: null,
      lastFetched: null,
      hasUnsavedChanges: false,

      // Basic setters
      setSettings: (settings) => {
        console.log('📋 Setting admin settings in store')
        set({ 
          settings, 
          lastFetched: Date.now(),
          error: null,
          // Clear drafts when new settings are loaded to show fresh data
          draftSettings: null,
          hasUnsavedChanges: false
        })
      },

      setDraftSettings: (draftSettings) => {
        console.log('📝 Setting draft settings in store')
        set({ draftSettings })
      },

      setLoading: (isLoading) => {
        set({ isLoading })
      },

      setError: (error) => {
        set({ error, isLoading: false })
      },

      clearError: () => {
        set({ error: null })
      },

      // Update a single draft setting
      updateDraftSetting: (category, settingKey, value) => {
        const { draftSettings, settings } = get()
        
        if (!settings) {
          console.warn('⚠️ No original settings available')
          return
        }

        const newDraftSettings = draftSettings ? deepClone(draftSettings) : deepClone(settings)
        
        if (!newDraftSettings[category]) {
          newDraftSettings[category] = {} as any
        }
        
        (newDraftSettings[category] as any)[settingKey] = value
        
        // Check if there are unsaved changes
        const hasChanges = JSON.stringify(newDraftSettings) !== JSON.stringify(settings)
        
        set({ 
          draftSettings: newDraftSettings,
          hasUnsavedChanges: hasChanges
        })
        
        console.log(`📝 Updated draft ${category}.${settingKey}:`, value)
      },

      // Reset drafts to original settings
      resetDrafts: () => {
        const { settings } = get()
        if (settings) {
          console.log('🔄 Resetting drafts to original settings')
          set({ 
            draftSettings: deepClone(settings),
            hasUnsavedChanges: false
          })
        }
      },

      // Clear drafts after successful save
      clearDrafts: () => {
        console.log('🗑️ Clearing draft settings after successful save')
        set({ 
          draftSettings: null,
          hasUnsavedChanges: false
        })
      },

      // Get current settings (draft if available, otherwise original)
      getCurrentSettings: () => {
        const { draftSettings, settings } = get()
        
        // If no drafts exist but we have original settings, initialize drafts
        if (!draftSettings && settings) {
          const newDrafts = deepClone(settings)
          set({ draftSettings: newDrafts })
          return newDrafts
        }
        
        return draftSettings || settings || {}
      },

      // Check if cache should be refreshed (refresh every 5 minutes)
      shouldRefresh: () => {
        const { lastFetched } = get()
        if (!lastFetched) return true
        const fiveMinutes = 5 * 60 * 1000
        return Date.now() - lastFetched > fiveMinutes
      },

      // Invalidate cache
      invalidateCache: () => {
        console.log('🗑️ Invalidating admin settings cache')
        set({ lastFetched: null })
      },

      // Update multiple draft platform settings
      updateDraftPlatformSettings: (updates) => {
        console.log('📝 Updating draft platform settings:', updates)
        
        for (const [key, value] of Object.entries(updates)) {
          get().updateDraftSetting('platform', key, value)
        }
      },

      // Update multiple draft booking settings
      updateDraftBookingSettings: (updates) => {
        console.log('📝 Updating draft booking settings:', updates)
        
        for (const [key, value] of Object.entries(updates)) {
          get().updateDraftSetting('booking', key, value)
        }
      },

      // Update multiple draft notification settings
      updateDraftNotificationSettings: (updates) => {
        console.log('📝 Updating draft notification settings:', updates)
        
        for (const [key, value] of Object.entries(updates)) {
          get().updateDraftSetting('notification', key, value)
        }
      },

      // Update multiple draft security settings
      updateDraftSecuritySettings: (updates) => {
        console.log('📝 Updating draft security settings:', updates)
        
        for (const [key, value] of Object.entries(updates)) {
          get().updateDraftSetting('security', key, value)
        }
      },

      // Update multiple draft payment settings
      updateDraftPaymentSettings: (updates) => {
        console.log('📝 Updating draft payment settings:', updates)
        
        for (const [key, value] of Object.entries(updates)) {
          get().updateDraftSetting('payment', key, value)
        }
      },

      // Update multiple draft content settings
      updateDraftContentSettings: (updates) => {
        console.log('📝 Updating draft content settings:', updates)
        
        for (const [key, value] of Object.entries(updates)) {
          get().updateDraftSetting('content', key, value)
        }
      },
    }),
    {
      name: 'admin-settings-storage',
      partialize: (state) => ({
        settings: state.settings,
        lastFetched: state.lastFetched,
      }),
    }
  )
)

// Export helper function for use in hooks
export { groupSettingsByCategory } 
