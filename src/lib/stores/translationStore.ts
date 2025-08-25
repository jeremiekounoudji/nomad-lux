import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useMemo } from 'react'
import i18n from '../i18n'
import { useAuthStore } from './authStore'

export type Language = 'en' | 'fr'

interface TranslationState {
  // State
  currentLanguage: Language
  isLoading: boolean
  isInitialized: boolean
  
  // Actions
  setLanguage: (language: Language) => Promise<void>
  initializeLanguage: () => Promise<void>
  getTranslation: (key: string, namespace?: string, options?: any) => string
  changeLanguage: (language: Language) => Promise<void>
}

export const useTranslationStore = create<TranslationState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentLanguage: 'en',
      isLoading: false,
      isInitialized: false,

      // Actions
      setLanguage: async (language: Language) => {
        console.log('🌐 TranslationStore: Setting language to:', language)
        set({ isLoading: true })
        
        try {
          await i18n.changeLanguage(language)
          set({ 
            currentLanguage: language,
            isLoading: false 
          })
          
          // Also update localStorage for immediate persistence
          localStorage.setItem('nomad-lux-language', language)
          
          // Update user preference in database if user is authenticated
          const authStore = useAuthStore.getState()
          if (authStore.user && authStore.user.language_preference !== language) {
            // This will be handled by a separate service to update the database
            console.log('🌐 TranslationStore: User language preference should be updated in database')
          }
        } catch (error) {
          console.error('🌐 TranslationStore: Failed to change language:', error)
          set({ isLoading: false })
        }
      },

      initializeLanguage: async () => {
        console.log('🌐 TranslationStore: Initializing language')
        set({ isLoading: true })
        
        try {
          const authStore = useAuthStore.getState()
          let targetLanguage: Language = 'en'
          
          // Priority order for language detection:
          // 1. User's saved preference in database
          // 2. Stored preference in localStorage (via Zustand persist)
          // 3. Browser language
          // 4. Default to English
          
          if (authStore.user?.language_preference) {
            targetLanguage = authStore.user.language_preference as Language
            console.log('🌐 TranslationStore: Using user database preference:', targetLanguage)
          } else {
            // Check if we have a persisted language from Zustand
            const currentState = get()
            if (currentState.currentLanguage && currentState.currentLanguage !== 'en') {
              targetLanguage = currentState.currentLanguage
              console.log('🌐 TranslationStore: Using persisted Zustand preference:', targetLanguage)
            } else {
              // Check localStorage as fallback
              const storedLanguage = localStorage.getItem('nomad-lux-language')
              if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'fr')) {
                targetLanguage = storedLanguage as Language
                console.log('🌐 TranslationStore: Using localStorage preference:', targetLanguage)
              } else {
                // Check browser language
                const browserLanguage = navigator.language.toLowerCase()
                if (browserLanguage.startsWith('fr')) {
                  targetLanguage = 'fr'
                  console.log('🌐 TranslationStore: Using browser language preference: fr')
                } else {
                  console.log('🌐 TranslationStore: Using default language: en')
                }
              }
            }
          }
          
          await i18n.changeLanguage(targetLanguage)
          set({ 
            currentLanguage: targetLanguage,
            isLoading: false,
            isInitialized: true
          })
          
          console.log('🌐 TranslationStore: Language initialized to:', targetLanguage)
        } catch (error) {
          console.error('🌐 TranslationStore: Failed to initialize language:', error)
          set({ 
            currentLanguage: 'en',
            isLoading: false,
            isInitialized: true
          })
        }
      },

      getTranslation: (key: string, namespace?: string, options?: any) => {
        try {
          const fullKey = namespace ? `${namespace}:${key}` : key
          const result = i18n.t(fullKey, options)
          return typeof result === 'string' ? result : String(result)
        } catch (error) {
          console.warn('🌐 TranslationStore: Translation failed for key:', key, error)
          return key // Return key as fallback
        }
      },

      changeLanguage: async (language: Language) => {
        console.log('🌐 TranslationStore: Changing language to:', language)
        const { setLanguage } = get()
        await setLanguage(language)
        
        // Store in localStorage for persistence
        localStorage.setItem('nomad-lux-language', language)
        
        console.log('🌐 TranslationStore: Language changed to:', language)
      }
    }),
    {
      name: 'nomad-lux-translation',
      partialize: (state) => ({
        currentLanguage: state.currentLanguage
      }),
      // Ensure the store is rehydrated properly
      onRehydrateStorage: () => (state) => {
        console.log('🌐 TranslationStore: Rehydrating from storage:', state?.currentLanguage)
      }
    }
  )
)

// Helper hook for easier usage in components
export const useTranslation = (namespace?: string | string[]) => {
  const currentLanguage = useTranslationStore((state) => state.currentLanguage)
  const isLoading = useTranslationStore((state) => state.isLoading)
  const changeLanguage = useTranslationStore((state) => state.changeLanguage)
  
  const t = useMemo(() => {
    return (key: string, options?: any) => {
      try {
        // Handle cross-namespace keys (e.g., 'common.messages.loading')
        if (key.includes('.') && key.split('.').length > 1) {
          const [ns, ...keyParts] = key.split('.')
          const actualKey = keyParts.join('.')
          const fullKey = `${ns}:${actualKey}`
          const result = i18n.t(fullKey, options)
          return typeof result === 'string' ? result : String(result)
        }
        
        // Use provided namespace
        if (typeof namespace === 'string') {
          const fullKey = `${namespace}:${key}`
          const result = i18n.t(fullKey, options)
          return typeof result === 'string' ? result : String(result)
        }
        
        // If multiple namespaces provided, use the first as default
        if (Array.isArray(namespace) && namespace.length > 0) {
          const fullKey = `${namespace[0]}:${key}`
          const result = i18n.t(fullKey, options)
          return typeof result === 'string' ? result : String(result)
        }
        
        // No namespace
        const result = i18n.t(key, options)
        return typeof result === 'string' ? result : String(result)
      } catch (error) {
        console.warn('🌐 TranslationStore: Translation failed for key:', key, error)
        return key // Return key as fallback
      }
    }
  }, [namespace])
  
  return {
    t,
    language: currentLanguage,
    changeLanguage,
    isLoading
  }
}