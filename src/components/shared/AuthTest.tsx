import React from 'react'
import { useAuthStore } from '../../lib/stores/authStore'
import { useAuth } from '../../hooks/useAuth'
import { useTranslation } from 'react-i18next'

export const AuthTest: React.FC = () => {
  const authStore = useAuthStore()
  const { signIn, signOut } = useAuth()
  const { t } = useTranslation(['auth', 'common'])

  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded shadow-lg border max-w-sm">
      <h3 className="font-bold mb-2">🔐 {t('auth.test.title', 'Auth Test')}</h3>
      
      <div className="text-sm space-y-1 mb-3">
        <div>{t('auth.test.user', 'User')}: {authStore.user?.email || t('common.notProvided', 'Not provided')}</div>
        <div>{t('auth.test.authenticated', 'Authenticated')}: {authStore.isAuthenticated ? '✅' : '❌'}</div>
        <div>{t('auth.test.admin', 'Admin')}: {authStore.isAdmin ? '✅' : '❌'}</div>
        <div>{t('auth.test.loading', 'Loading')}: {authStore.isLoading ? '⏳' : '✅'}</div>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => signIn('test@example.com', 'password123')}
          className="w-full bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          {t('auth.test.signIn', 'Test Sign In')}
        </button>
        <button
          onClick={() => signOut()}
          className="w-full bg-red-500 text-white px-3 py-1 rounded text-sm"
        >
          {t('auth.actions.logout', 'Sign Out')}
        </button>
      </div>
    </div>
  )
} 