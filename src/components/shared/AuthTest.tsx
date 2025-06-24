import React from 'react'
import { useAuthStore } from '../../lib/stores/authStore'
import { useAuth } from '../../hooks/useAuth'

export const AuthTest: React.FC = () => {
  const authStore = useAuthStore()
  const { signIn, signOut } = useAuth()

  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded shadow-lg border max-w-sm">
      <h3 className="font-bold mb-2">🔐 Auth Test</h3>
      
      <div className="text-sm space-y-1 mb-3">
        <div>User: {authStore.user?.email || 'None'}</div>
        <div>Authenticated: {authStore.isAuthenticated ? '✅' : '❌'}</div>
        <div>Admin: {authStore.isAdmin ? '✅' : '❌'}</div>
        <div>Loading: {authStore.isLoading ? '⏳' : '✅'}</div>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => signIn('test@example.com', 'password123')}
          className="w-full bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          Test Sign In
        </button>
        <button
          onClick={() => signOut()}
          className="w-full bg-red-500 text-white px-3 py-1 rounded text-sm"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
} 