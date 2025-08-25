import { useCallback, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface CancellationSettings {
  freeCancellationHours: number
  partialRefundHours: number
  partialRefundRate: number
  noRefundHours: number
}

interface UseCancellationSettingsReturn {
  settings: CancellationSettings | null
  isLoading: boolean
  error: string | null
  fetchSettings: () => Promise<void>
  clearError: () => void
}

// Default settings as fallback - based on time since booking
const DEFAULT_CANCELLATION_SETTINGS: CancellationSettings = {
  freeCancellationHours: 24,    // 24 hours after booking = 100% refund
  partialRefundHours: 168,      // 7 days after booking = 50% refund
  partialRefundRate: 50,        // 50% refund rate
  noRefundHours: 336           // 14 days after booking = no refund
}

export const useCancellationSettings = (): UseCancellationSettingsReturn => {
  const [settings, setSettings] = useState<CancellationSettings | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const fetchSettings = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('🔄 Fetching cancellation settings...')
      
      const { data, error: fetchError } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'freeCancellationHours',
          'partialRefundHours', 
          'partialRefundRate',
          'noRefundHours'
        ])

      if (fetchError) {
        console.error('❌ Error fetching cancellation settings:', fetchError)
        throw new Error(`Failed to fetch settings: ${fetchError.message}`)
      }

      // Transform the data into our settings object
      const settingsMap = new Map(data?.map(item => [item.setting_key, item.setting_value]) || [])
      
      const cancellationSettings: CancellationSettings = {
        freeCancellationHours: settingsMap.get('freeCancellationHours') || DEFAULT_CANCELLATION_SETTINGS.freeCancellationHours,
        partialRefundHours: settingsMap.get('partialRefundHours') || DEFAULT_CANCELLATION_SETTINGS.partialRefundHours,
        partialRefundRate: settingsMap.get('partialRefundRate') || DEFAULT_CANCELLATION_SETTINGS.partialRefundRate,
        noRefundHours: settingsMap.get('noRefundHours') || DEFAULT_CANCELLATION_SETTINGS.noRefundHours
      }

      console.log('✅ Cancellation settings loaded:', cancellationSettings)
      setSettings(cancellationSettings)

    } catch (error) {
      console.error('❌ Error in fetchSettings:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch cancellation settings'
      setError(errorMessage)
      
      // Use default settings as fallback
      console.log('⚠️ Using default cancellation settings as fallback')
      setSettings(DEFAULT_CANCELLATION_SETTINGS)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Auto-fetch settings on mount
  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return {
    settings,
    isLoading,
    error,
    fetchSettings,
    clearError
  }
}
