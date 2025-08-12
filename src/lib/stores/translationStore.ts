import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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
          // 2. Stored preference in localStorage
          // 3. Browser language
          // 4. Default to English
          
          if (authStore.user?.language_preference) {
            targetLanguage = authStore.user.language_preference as Language
            console.log('🌐 TranslationStore: Using user database preference:', targetLanguage)
          } else {
            // Check localStorage
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
          return i18n.t(fullKey, options)
        } catch (error) {
          console.warn('🌐 TranslationStore: Translation failed for key:', key, error)
          return key // Return key as fallback
        }
      },

      changeLanguage: async (language: Language) => {
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
      })
    }
  )
)

// Helper hook for easier usage in components
export const useTranslation = (namespace?: string) => {
  const { currentLanguage, getTranslation, changeLanguage, isLoading } = useTranslationStore()
  
  const t = (key: string, options?: any) => {
    return getTranslation(key, namespace, options)
  }
  
  return {
    t,
    language: currentLanguage,
    changeLanguage,
    isLoading
  }
}