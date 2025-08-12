import { useEffect } from 'react'
import { useTranslationStore } from '../lib/stores/translationStore'
import { useAuthStore } from '../lib/stores/authStore'

/**
 * Hook to initialize the translation system
 * Should be called once at app startup
 */
export const useTranslationInit = () => {
  const { initializeLanguage, isInitialized } = useTranslationStore()
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    const initialize = async () => {
      if (!isInitialized) {
        console.log('🌐 Initializing translation system...')
        await initializeLanguage()
      }
    }

    initialize()
  }, [initializeLanguage, isInitialized])

  // Re-initialize when user authentication changes
  useEffect(() => {
    const reinitialize = async () => {
      if (isAuthenticated && user && isInitialized) {
        console.log('🌐 Re-initializing translation system for authenticated user...')
        await initializeLanguage()
      }
    }

    reinitialize()
  }, [isAuthenticated, user, initializeLanguage, isInitialized])
}