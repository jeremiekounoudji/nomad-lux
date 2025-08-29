import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { 
  PropertySettings, 
  PropertySettingsFormData, 
  PropertySettingsOption 
} from '../interfaces'
import { usePropertySettingsStore } from '../lib/stores/propertySettingsStore'

export const usePropertySettings = () => {
  const {
    setHostSettings,
    setCurrentSettings,
    setHostSettingsWithUsage,
    setIsLoadingHostSettings,
    setIsCreatingSettings,
    setIsUpdatingSettings,
    setError,
    addNewSettings,
    updateSettings,
    removeSettings,
    clearError
  } = usePropertySettingsStore()

  /**
   * Load host's property settings profiles using RPC function
   */
  const loadHostSettingsProfiles = useCallback(async (hostId: string) => {
    setIsLoadingHostSettings(true)
    clearError()
    
    try {
      console.log('🔄 Loading host settings profiles...')
      
      // Use RPC function for complex query with filters
      const { data, error } = await supabase
        .rpc('get_host_settings_profiles', { host_id: hostId })
      
      if (error) {
        throw new Error(`Failed to load settings: ${error.message}`)
      }
      
      console.log('✅ Host settings loaded:', data)
      setHostSettings(data || [])
      return data
      
    } catch (error) {
      console.error('❌ Error loading host settings:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load settings'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoadingHostSettings(false)
    }
  }, [setHostSettings, setIsLoadingHostSettings, setError, clearError])

  /**
   * Get property settings by property ID using RPC function
   */
  const getPropertySettings = useCallback(async (propertyId: string) => {
    clearError()
    
    try {
      console.log('🔄 Getting property settings...')
      
      // Use RPC function for complex JOIN query
      const { data, error } = await supabase
        .rpc('get_property_settings', { property_id: propertyId })
      
      if (error) {
        throw new Error(`Failed to get property settings: ${error.message}`)
      }
      
      console.log('✅ Property settings loaded:', data)
      
      if (data && data.length > 0) {
        const settingsData = data[0]
        setCurrentSettings(settingsData)
        return settingsData
      }
      
      return null
      
    } catch (error) {
      console.error('❌ Error getting property settings:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to get property settings'
      setError(errorMessage)
      throw error
    }
  }, [setCurrentSettings, setError, clearError])

  /**
   * Create new property settings using direct Supabase API
   */
  const createPropertySettings = useCallback(async (
    hostId: string, 
    settingsData: PropertySettingsFormData
  ): Promise<PropertySettings> => {
    setIsCreatingSettings(true)
    clearError()
    
    try {
      console.log('🔄 Creating property settings...', settingsData)
      
      // If this is set as default, unset other defaults first
      if (settingsData.is_default) {
        await supabase
          .from('host_property_settings')
          .update({ is_default: false })
          .eq('host_id', hostId)
      }
      
      // Use direct API for INSERT operation (following Nomad Lux rules)
      const { data, error } = await supabase
        .from('host_property_settings')
        .insert({
          host_id: hostId,
          ...settingsData
        })
        .select()
        .single()
      
      if (error) {
        throw new Error(`Failed to create settings: ${error.message}`)
      }
      
      console.log('✅ Property settings created:', data)
      
      // Add to store
      const newSettingsOption: PropertySettingsOption = {
        id: data.id,
        settings_name: data.settings_name,
        is_default: data.is_default,
        min_stay_nights: data.min_stay_nights,
        max_stay_nights: data.max_stay_nights,
        payment_timing: data.payment_timing,
        auto_approve_bookings: data.auto_approve_bookings,
        checkin_time: data.checkin_time,
        checkout_time: data.checkout_time,
        created_at: data.created_at
      }
      
      addNewSettings(newSettingsOption)
      return data
      
    } catch (error) {
      console.error('❌ Error creating property settings:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create settings'
      setError(errorMessage)
      throw error
    } finally {
      setIsCreatingSettings(false)
    }
  }, [setIsCreatingSettings, setError, clearError, addNewSettings])

  /**
   * Update property settings using direct Supabase API
   */
  const updatePropertySettings = useCallback(async (
    settingsId: string,
    updates: Partial<PropertySettingsFormData>
  ): Promise<PropertySettings> => {
    setIsUpdatingSettings(true)
    clearError()
    
    try {
      console.log('🔄 Updating property settings...', updates)
      
      // Use direct API for UPDATE operation (following Nomad Lux rules)
      const { data, error } = await supabase
        .from('host_property_settings')
        .update(updates)
        .eq('id', settingsId)
        .select()
        .single()
      
      if (error) {
        throw new Error(`Failed to update settings: ${error.message}`)
      }
      
      console.log('✅ Property settings updated:', data)
      
      // Update in store
      updateSettings(settingsId, {
        settings_name: data.settings_name,
        is_default: data.is_default,
        min_stay_nights: data.min_stay_nights,
        max_stay_nights: data.max_stay_nights,
        payment_timing: data.payment_timing,
        auto_approve_bookings: data.auto_approve_bookings,
        checkin_time: data.checkin_time,
        checkout_time: data.checkout_time
      })
      
      return data
      
    } catch (error) {
      console.error('❌ Error updating property settings:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update settings'
      setError(errorMessage)
      throw error
    } finally {
      setIsUpdatingSettings(false)
    }
  }, [setIsUpdatingSettings, setError, clearError, updateSettings])

  /**
   * Delete property settings using direct Supabase API
   */
  const deletePropertySettings = useCallback(async (settingsId: string) => {
    clearError()
    
    try {
      console.log('🔄 Deleting property settings...')
      
      // Check if any properties are using this settings
      const { data: propertiesUsingSettings, error: checkError } = await supabase
        .from('properties')
        .select('id')
        .eq('property_settings_id', settingsId)
      
      if (checkError) {
        throw new Error(`Failed to check settings usage: ${checkError.message}`)
      }
      
      if (propertiesUsingSettings && propertiesUsingSettings.length > 0) {
        throw new Error(`Cannot delete settings. ${propertiesUsingSettings.length} properties are using these settings.`)
      }
      
      // Use direct API for DELETE operation (following Nomad Lux rules)
      const { error } = await supabase
        .from('host_property_settings')
        .delete()
        .eq('id', settingsId)
      
      if (error) {
        throw new Error(`Failed to delete settings: ${error.message}`)
      }
      
      console.log('✅ Property settings deleted')
      
      // Remove from store
      removeSettings(settingsId)
      
    } catch (error) {
      console.error('❌ Error deleting property settings:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete settings'
      setError(errorMessage)
      throw error
    }
  }, [setError, clearError, removeSettings])

  return {
    // Data loading
    loadHostSettingsProfiles,
    getPropertySettings,
    
    // CRUD operations
    createPropertySettings,
    updatePropertySettings,
    deletePropertySettings,
    
    // Utility
    clearError
  }
} 