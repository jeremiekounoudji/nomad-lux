import React from 'react'
import { useAuthStore } from '../../lib/stores/authStore'
import { useAuth } from '../../hooks/useAuth'
import { useTranslation } from '../../lib/stores/translationStore'

export const AuthTest: React.FC = () => {
  const authStore = useAuthStore()
  const { signIn, signOut } = useAuth()
  const { t } = useTranslation(['auth', 'common'])

  return (
    <div className="fixed right-4 top-4 max-w-sm rounded border bg-white p-4 shadow-lg">
      <h3 className="mb-2 font-bold">🔐 {t('auth.test.title', 'Auth Test')}</h3>
      
      <div className="mb-3 space-y-1 text-sm">
        <div>{t('auth.test.user', 'User')}: {authStore.user?.email || t('common.notProvided', 'Not provided')}</div>
        <div>{t('auth.test.authenticated', 'Authenticated')}: {authStore.isAuthenticated ? '✅' : '❌'}</div>
        <div>{t('auth.test.admin', 'Admin')}: {authStore.isAdmin ? '✅' : '❌'}</div>
        <div>{t('auth.test.loading', 'Loading')}: {authStore.isLoading ? '⏳' : '✅'}</div>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => signIn(t('auth.test.testEmail'), t('auth.test.testPassword'))}
          className="w-full rounded bg-blue-500 px-3 py-1 text-sm text-white"
        >
          {t('auth.test.signIn', 'Test Sign In')}
        </button>
        <button
          onClick={() => signOut()}
          className="w-full rounded bg-red-500 px-3 py-1 text-sm text-white"
        >
          {t('auth.actions.logout', 'Sign Out')}
        </button>
      </div>
    </div>
  )
} 