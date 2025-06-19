import React, { useState } from 'react'
import { Button, Input, Card, CardBody } from '@heroui/react'
import { useAuthContext } from '../../context/AuthContext'
import { useAdminSettings } from '../../hooks/useAdminSettings'
import { config } from '../../lib/config'

export const AuthTest: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isLoading, signIn, signOut } = useAuthContext()
  const { getSettings, error: settingsError, isLoading: settingsLoading } = useAdminSettings()
  
  const [email, setEmail] = useState(config.adminTest.email)
  const [password, setPassword] = useState(config.adminTest.password)
  const [testResults, setTestResults] = useState<string[]>([])

  console.log('🧪 AuthTest component rendered', { 
    isAuthenticated, 
    isAdmin, 
    userEmail: user?.email,
    configEmail: config.adminTest.email,
    timestamp: new Date().toISOString() 
  })

  const handleSignIn = async () => {
    console.log('🔑 Testing sign in')
    const result = await signIn(email, password)
    
    if (result.error) {
      setTestResults(prev => [...prev, `❌ Sign in failed: ${result.error}`])
    } else {
      setTestResults(prev => [...prev, `✅ Sign in successful: ${result.user?.email}`])
    }
  }

  const handleSignOut = async () => {
    console.log('🚪 Testing sign out')
    const result = await signOut()
    
    if (result.error) {
      setTestResults(prev => [...prev, `❌ Sign out failed: ${result.error}`])
    } else {
      setTestResults(prev => [...prev, `✅ Sign out successful`])
    }
  }

  const testAdminSettings = async () => {
    console.log('⚙️ Testing admin settings')
    const settings = await getSettings()
    
    if (settings) {
      setTestResults(prev => [...prev, `✅ Admin settings loaded: ${Object.keys(settings).join(', ')}`])
    } else {
      setTestResults(prev => [...prev, `❌ Admin settings failed: ${settingsError}`])
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto m-4">
        <CardBody>
          <div className="text-center">Loading authentication...</div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto m-4">
      <CardBody className="space-y-4">
        <h3 className="text-lg font-semibold text-center">🧪 Auth Test Component</h3>
        
        {/* Current Status */}
        <div className="space-y-2 p-3 bg-gray-50 rounded">
          <div><strong>Status:</strong> {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}</div>
          <div><strong>User:</strong> {user?.email || 'None'}</div>
          <div><strong>Role:</strong> {user?.user_role || 'None'}</div>
          <div><strong>Is Admin:</strong> {isAdmin ? '✅ Yes' : '❌ No'}</div>
          <div><strong>Environment:</strong> {config.isDevelopment ? '🔧 Development' : '🚀 Production'}</div>
        </div>

        {/* Authentication Controls */}
        {!isAuthenticated ? (
          <div className="space-y-3">
            <Input
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              description="Default admin test email from config"
            />
            <Input
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              description="Default admin test password from config"
            />
            <Button 
              color="primary" 
              onPress={handleSignIn}
              isLoading={isLoading}
              className="w-full"
            >
              Sign In (Test Admin)
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Button 
              color="danger" 
              variant="flat"
              onPress={handleSignOut}
              isLoading={isLoading}
              className="w-full"
            >
              Sign Out
            </Button>
            
            {isAdmin && (
              <Button 
                color="secondary"
                onPress={testAdminSettings}
                isLoading={settingsLoading}
                className="w-full"
              >
                Test Admin Settings
              </Button>
            )}
          </div>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Test Results:</h4>
              <Button size="sm" variant="flat" onPress={clearResults}>
                Clear
              </Button>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1 p-2 bg-gray-50 rounded text-sm">
              {testResults.map((result, index) => (
                <div key={index}>{result}</div>
              ))}
            </div>
          </div>
        )}

        {/* Debug Info */}
        <details className="text-xs">
          <summary className="cursor-pointer font-semibold">Debug Info</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
            {JSON.stringify({
              user: user ? {
                id: user.id,
                email: user.email,
                user_role: user.user_role,
                account_status: user.account_status
              } : null,
              isAuthenticated,
              isAdmin,
              isLoading,
              settingsError,
              settingsLoading,
              config: {
                supabaseUrl: config.supabase.url,
                projectId: config.supabase.projectId,
                isDevelopment: config.isDevelopment,
                adminTestEmail: config.adminTest.email
              }
            }, null, 2)}
          </pre>
        </details>
      </CardBody>
    </Card>
  )
} 