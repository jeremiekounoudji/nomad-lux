import React from 'react'
import { Card, CardBody, Button } from '@heroui/react'
import { useAuthContext } from '../../context/AuthContext'
import { useAdminAuth } from '../../hooks/useAdminAuth'

export const LoadingDebug: React.FC = () => {
  const authContext = useAuthContext()
  const adminAuth = useAdminAuth()

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 bg-black/80 text-white">
      <CardBody className="p-4">
        <h3 className="font-bold mb-2">🐛 Loading Debug</h3>
        
        <div className="text-xs space-y-1">
          <div>
            <strong>Auth Context:</strong>
            <div className="ml-2">
              • isLoading: {authContext.isLoading ? '⏳ true' : '✅ false'}
              • isAuthenticated: {authContext.isAuthenticated ? '✅ true' : '❌ false'}
              • isAdmin: {authContext.isAdmin ? '✅ true' : '❌ false'}
              • user: {authContext.user ? `✅ ${authContext.user.email}` : '❌ null'}
            </div>
          </div>
          
          <div>
            <strong>Admin Auth:</strong>
            <div className="ml-2">
              • isLoading: {adminAuth.isLoading ? '⏳ true' : '✅ false'}
              • canAccessAdmin: {adminAuth.canAccessAdmin() ? '✅ true' : '❌ false'}
              • adminUser: {adminAuth.adminUser ? `✅ ${adminAuth.adminUser.email}` : '❌ null'}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <Button 
            size="sm" 
            variant="flat"
            onPress={adminAuth.resetLoading}
            className="text-xs"
          >
            Reset Loading
          </Button>
          <Button 
            size="sm" 
            variant="flat"
            onPress={() => window.location.reload()}
            className="text-xs"
          >
            Reload Page
          </Button>
        </div>

        <div className="text-xs mt-2 opacity-70">
          Timestamp: {new Date().toLocaleTimeString()}
        </div>
      </CardBody>
    </Card>
  )
} 