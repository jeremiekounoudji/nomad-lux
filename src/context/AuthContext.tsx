import React, { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { AuthContextType } from '../interfaces/Auth'

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// AuthProvider component
interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth()

  console.log('🔐 AuthProvider rendering with state:', {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    isAdmin: auth.isAdmin,
    userEmail: auth.user?.email,
    timestamp: new Date().toISOString()
  })

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use the auth context
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    console.error('❌ useAuthContext must be used within an AuthProvider')
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  
  return context
}

// Convenience hooks for specific auth states
export const useUser = () => {
  const { user } = useAuthContext()
  return user
}

export const useIsAuthenticated = () => {
  const { isAuthenticated } = useAuthContext()
  return isAuthenticated
}

export const useIsAdmin = () => {
  const { isAdmin } = useAuthContext()
  return isAdmin
}

export const useIsSuperAdmin = () => {
  const { isSuperAdmin } = useAuthContext()
  return isSuperAdmin
}

// Protected component wrapper
interface ProtectedComponentProps {
  children: ReactNode
  requireAdmin?: boolean
  requireSuperAdmin?: boolean
  fallback?: ReactNode
}

export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  children,
  requireAdmin = false,
  requireSuperAdmin = false,
  fallback = <div>Access denied</div>
}) => {
  const { isAuthenticated, isAdmin, isSuperAdmin, isLoading } = useAuthContext()

  console.log('🔒 ProtectedComponent check:', {
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    requireAdmin,
    requireSuperAdmin,
    isLoading
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    console.log('❌ ProtectedComponent: User not authenticated')
    return <>{fallback}</>
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    console.log('❌ ProtectedComponent: Super admin required but user is not super admin')
    return <>{fallback}</>
  }

  if (requireAdmin && !isAdmin) {
    console.log('❌ ProtectedComponent: Admin required but user is not admin')
    return <>{fallback}</>
  }

  console.log('✅ ProtectedComponent: Access granted')
  return <>{children}</>
} 