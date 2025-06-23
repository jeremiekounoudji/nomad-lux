import React, { useState, useEffect } from 'react'
import { Card, CardBody, Input, Button, Link } from '@heroui/react'
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useAuthStore } from '../lib/stores/authStore'
import { LoginPageProps } from '../interfaces'
import toast from 'react-hot-toast'

const LoginPage: React.FC<LoginPageProps> = ({ onPageChange, onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [error, setError] = useState('')

  const { signIn, isLoading } = useAuth()
  const { isAuthenticated } = useAuthStore()

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ Already authenticated - redirecting to home')
      onLogin?.()
    }
  }, [isAuthenticated, onLogin])

  const toggleVisibility = () => setIsVisible(!isVisible)

  const handleLogin = async () => {
    setError('')
    
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    console.log('🔑 User attempting to sign in:', email)

    try {
      const result = await signIn(email, password)
      
      if (result.error) {
        console.error('❌ User sign in failed:', result.error)
        setError(result.error)
        toast.error(result.error)
        return
      }

      console.log('✅ User sign in initiated - waiting for auth state update')
      toast.success('Welcome back!')
      // The redirect will happen automatically via useEffect when auth state updates
      
    } catch (err: any) {
      console.error('❌ Exception during user sign in:', err)
      setError(err.message || 'An unexpected error occurred')
      toast.error(err.message || 'An unexpected error occurred')
    }
  }

  const handleBackToHome = () => {
    onPageChange?.('home')
  }

  const handleForgotPassword = () => {
    // TODO: Implement forgot password functionality
    console.log('Forgot password clicked')
    toast('Forgot password feature coming soon!', { icon: 'ℹ️' })
  }



  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
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
        className="absolute top-6 left-6 z-20 bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30"
        onPress={handleBackToHome}
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>

      {/* Login Form */}
      <Card className="w-full max-w-md z-10 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
        <CardBody className="p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">NL</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white/80 text-sm">Sign in to your NomadLux account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
              <p className="text-red-100 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            <Input
              type="email"
              label="Email"
              placeholder="Enter your email"
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

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onValueChange={setPassword}
              startContent={<Lock className="w-4 h-4 text-white/60" />}
              endContent={
                <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
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

            <div className="flex items-center justify-between">
              <Link 
                className="text-sm text-white/80 hover:text-white cursor-pointer"
                onPress={handleForgotPassword}
              >
                Forgot password?
              </Link>
            </div>

            <Button
              color="primary"
              size="lg"
              className="w-full font-semibold bg-primary-600 hover:bg-primary-700 text-white"
              onPress={handleLogin}
              isLoading={isLoading}
              isDisabled={!email || !password}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>

            <div className="text-center">
              <span className="text-white/80 text-sm">
                Don't have an account?{' '}
                <Link 
                  className="text-white font-semibold hover:text-white/80 cursor-pointer"
                  onPress={() => onPageChange?.('register')}
                >
                  Sign up
                </Link>
              </span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default LoginPage 