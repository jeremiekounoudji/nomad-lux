import React, { useState, useEffect } from 'react'
import { Card, CardBody, Input, Button, Link } from '@heroui/react'
import { Crown, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { useAuthStore } from '../lib/stores/authStore'
import { AdminLoginPageProps } from '../interfaces'

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onPageChange }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [error, setError] = useState('')
  
  const { signInAdmin, isLoading } = useAdminAuth()
  const { isAuthenticated, isAdmin } = useAuthStore()

  // Auto-redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      console.log('✅ Already authenticated as admin - redirecting to dashboard')
      onPageChange?.('admin')
    }
  }, [isAuthenticated, isAdmin, onPageChange])

  const toggleVisibility = () => setIsVisible(!isVisible)

  const handleSubmit = async () => {
    setError('')
    
    console.log('🔑 Admin attempting to sign in:', email)

    try {
      const result = await signInAdmin(email, password)
      
      if (result.error) {
        console.error('❌ Admin sign in failed:', result.error)
        setError(result.error)
        return
      }

      console.log('✅ Admin sign in initiated - waiting for auth state update')
      // The redirect will happen automatically via useEffect when auth state updates
      
    } catch (err: any) {
      console.error('❌ Exception during admin sign in:', err)
      setError(err.message || 'An unexpected error occurred')
    }
  }

  const handleBackToHome = () => {
    onPageChange?.('home')
  }

  return (
    <div 
      className="fixed inset-0 w-screen h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&h=1080&fit=crop)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      
      {/* Back Button */}
      <Button
        isIconOnly
        variant="flat"
        className="absolute top-6 left-6 z-20 bg-primary-500/20 backdrop-blur-md border border-primary-400/30 text-white hover:bg-primary-500/30"
        onPress={handleBackToHome}
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>

      {/* Admin Login Form */}
      <Card className="w-full max-w-md z-10 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
        <CardBody className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-600/80 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
            <p className="text-white/80 text-sm font-script text-lg">
              Nomad Lux Administration
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Email Field */}
            <Input
              type="email"
              label="Admin Email"
              placeholder="admin@nomadlux.com"
              value={email}
              onValueChange={setEmail}
              startContent={<Mail className="w-4 h-4 text-white/60" />}
              classNames={{
                base: "max-w-full",
                mainWrapper: "h-full",
                input: "text-white placeholder:text-white/60",
                inputWrapper: "h-12 bg-white/10 backdrop-blur-md border border-white/20 data-[hover=true]:bg-white/20 group-data-[focus=true]:bg-white/20",
                label: "text-white/80"
              }}
              isRequired
            />

            {/* Password Field */}
            <Input
              label="Password"
              placeholder="Enter admin password"
              value={password}
              onValueChange={setPassword}
              startContent={<Lock className="w-4 h-4 text-white/60" />}
              endContent={
                <button 
                  className="focus:outline-none" 
                  type="button" 
                  onClick={toggleVisibility}
                >
                  {isVisible ? (
                    <EyeOff className="w-4 h-4 text-white/60" />
                  ) : (
                    <Eye className="w-4 h-4 text-white/60" />
                  )}
                </button>
              }
              type={isVisible ? "text" : "password"}
              classNames={{
                base: "max-w-full",
                mainWrapper: "h-full",
                input: "text-white placeholder:text-white/60",
                inputWrapper: "h-12 bg-white/10 backdrop-blur-md border border-white/20 data-[hover=true]:bg-white/20 group-data-[focus=true]:bg-white/20",
                label: "text-white/80"
              }}
              isRequired
            />

            {/* Error Message */}
            {error && (
              <div className="text-red-300 text-sm text-center bg-red-500/20 backdrop-blur-md p-3 rounded-lg border border-red-400/30">
                {error}
              </div>
            )}

            {/* Login Button */}
            <Button
              color="primary"
              size="lg"
              className="w-full font-semibold bg-primary-600 hover:bg-primary-700 text-white"
              onPress={handleSubmit}
              isLoading={isLoading}
              isDisabled={!email || !password}
            >
              {isLoading ? 'Signing In...' : 'Sign In to Admin Panel'}
            </Button>
          </div>

          {/* Development Note */}
          <div className="mt-6 p-4 bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-lg">
            <p className="text-sm text-blue-100">
              <strong>Admin Access:</strong><br />
              Only accounts with admin or super_admin roles can access the admin panel.
            </p>
          </div>

          {/* Admin Register Link */}
          <div className="mt-6 text-center">
            <span className="text-white/80 text-sm">
              Need admin access?{' '}
              <Link 
                className="text-white font-semibold hover:text-white/80"
                onPress={() => onPageChange?.('admin-register')}
              >
                Request Access
              </Link>
            </span>
          </div>
        </CardBody>
      </Card>
    </div>
  )
} 