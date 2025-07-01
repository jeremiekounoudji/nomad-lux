import { create } from 'zustand'
import { PropertySettings, PropertySettingsOption, PropertySettingsWithUsage } from '../../interfaces'

interface PropertySettingsState {
  // State
  hostSettings: PropertySettingsOption[]
  currentSettings: PropertySettings | null
  hostSettingsWithUsage: PropertySettingsWithUsage[]
  
  // Loading states
  isLoadingHostSettings: boolean
  isCreatingSettings: boolean
  isUpdatingSettings: boolean
  error: string | null

  // Actions - Pure state management only (no database calls)
  setHostSettings: (settings: PropertySettingsOption[]) => void
  setCurrentSettings: (settings: PropertySettings | null) => void
  setHostSettingsWithUsage: (settings: PropertySettingsWithUsage[]) => void
  
  // Loading state setters
  setIsLoadingHostSettings: (loading: boolean) => void
  setIsCreatingSettings: (loading: boolean) => void
  setIsUpdatingSettings: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Utility actions
  addNewSettings: (settings: PropertySettingsOption) => void
  updateSettings: (settingsId: string, updates: Partial<PropertySettingsOption>) => void
  removeSettings: (settingsId: string) => void
  clearError: () => void
  reset: () => void
}

const initialState = {
  hostSettings: [],
  currentSettings: null,
  hostSettingsWithUsage: [],
  isLoadingHostSettings: false,
  isCreatingSettings: false,
  isUpdatingSettings: false,
  error: null,
}

export const usePropertySettingsStore = create<PropertySettingsState>((set, get) => ({
  ...initialState,

  // State setters
  setHostSettings: (settings) => set({ hostSettings: settings }),
  setCurrentSettings: (settings) => set({ currentSettings: settings }),
  setHostSettingsWithUsage: (settings) => set({ hostSettingsWithUsage: settings }),

  // Loading state setters
  setIsLoadingHostSettings: (loading) => set({ isLoadingHostSettings: loading }),
  setIsCreatingSettings: (loading) => set({ isCreatingSettings: loading }),
  setIsUpdatingSettings: (loading) => set({ isUpdatingSettings: loading }),
  setError: (error) => set({ error }),

  // Utility actions
  addNewSettings: (settings) => {
    const currentSettings = get().hostSettings
    set({ hostSettings: [settings, ...currentSettings] })
  },

  updateSettings: (settingsId, updates) => {
    const currentSettings = get().hostSettings
    const updatedSettings = currentSettings.map(settings =>
      settings.id === settingsId ? { ...settings, ...updates } : settings
    )
    set({ hostSettings: updatedSettings })
  },

  removeSettings: (settingsId) => {
    const currentSettings = get().hostSettings
    const filteredSettings = currentSettings.filter(settings => settings.id !== settingsId)
    set({ hostSettings: filteredSettings })
  },

  clearError: () => set({ error: null }),
  reset: () => set(initialState),
}))

// Selectors for better performance
export const selectHostSettings = (state: PropertySettingsState) => state.hostSettings
export const selectCurrentSettings = (state: PropertySettingsState) => state.currentSettings
export const selectDefaultSettings = (state: PropertySettingsState) => 
  state.hostSettings.find(settings => settings.is_default)
export const selectIsLoadingSettings = (state: PropertySettingsState) => 
  state.isLoadingHostSettings || state.isCreatingSettings || state.isUpdatingSettings 