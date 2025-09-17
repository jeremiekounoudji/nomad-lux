import React, { useState, useEffect } from 'react'
import { Card, CardBody, Input, Button, Link } from '@heroui/react'
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useAuthStore } from '../lib/stores/authStore'
import { useTranslation } from '../lib/stores/translationStore'
import { LoginPageProps } from '../interfaces'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../router/types'
import toast from 'react-hot-toast'

const LoginPage: React.FC<LoginPageProps> = ({ onPageChange }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [error, setError] = useState('')

  const { signIn, isLoading } = useAuth()
  const { isAuthenticated } = useAuthStore()
  const { t } = useTranslation(['auth', 'common'])
  const navigate = useNavigate()

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('✅ Already authenticated - redirecting to home')
      toast.success(t('auth.messages.loginSuccess'))
      // Don't call onLogin - let the routing system handle the redirect
      // This prevents the page blink/white screen
    }
  }, [isAuthenticated, isLoading, t])

  const toggleVisibility = () => setIsVisible(!isVisible)

  const handleLogin = async () => {
    setError('')
    
    if (!email || !password) {
      setError(t('auth.messages.fillAllFields'))
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
      // Show loading state - the redirect will happen automatically via useEffect when auth state updates
      // and loading is complete
      
    } catch (err: any) {
      console.error('❌ Exception during user sign in:', err)
      setError(err.message || t('auth.messages.unexpectedError'))
      toast.error(err.message || t('auth.messages.unexpectedError'))
    }
  }

  const handleBackToHome = () => {
    if (onPageChange) {
      onPageChange('home')
    } else {
      navigate(ROUTES.HOME)
    }
  }

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const handleForgotPassword = () => {
    // TODO: Implement forgot password functionality
    console.log('Forgot password clicked')
    toast(t('auth.messages.forgotPasswordComingSoon'), { icon: 'ℹ️' })
  }



  return (
    <div 
      className="relative flex min-h-screen items-center justify-center p-4"
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
        className="absolute left-6 top-6 z-20 border border-white/30 bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
        onPress={handleBackToHome}
      >
        <ArrowLeft className="size-5" />
      </Button>

      {/* Login Form */}
      <Card className="z-10 w-full max-w-md border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
        <CardBody className="p-8">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary-500">
              <span className="text-xl font-bold text-white">NL</span>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-white">{t('auth.login.title')}</h1>
            <p className="text-sm text-white/80">{t('auth.login.subtitle')}</p>
          </div>



          {/* Form */}
          <div className="space-y-6">
            <Input
              type="email"
              label={t('auth.login.email')}
              placeholder={t('auth.login.email')}
              value={email}
              onValueChange={setEmail}
              startContent={<Mail className="size-4 text-white/60" />}
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
              label={t('auth.login.password')}
              placeholder={t('auth.login.password')}
              value={password}
              onValueChange={setPassword}
              startContent={<Lock className="size-4 text-white/60" />}
              endContent={
                <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                  {isVisible ? (
                    <EyeOff className="size-4 text-white/60" />
                  ) : (
                    <Eye className="size-4 text-white/60" />
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
                className="cursor-pointer text-sm text-white/80 hover:text-white"
                onPress={handleForgotPassword}
              >
                {t('auth.login.forgotPassword')}
              </Link>
            </div>

            <Button
              color="primary"
              size="lg"
              className="w-full bg-primary-600 font-semibold text-white hover:bg-primary-700"
              onPress={handleLogin}
              isLoading={isLoading}
              isDisabled={!email || !password}
            >
              {isLoading ? t('auth.login.signingIn') : t('auth.login.signIn')}
            </Button>

            <div className="text-center">
              <span className="text-sm text-white/80">
                {t('auth.login.noAccount')}{' '}
                <Link 
                  className="cursor-pointer font-semibold text-white hover:text-white/80"
                  onPress={() => {
                    if (onPageChange) {
                      onPageChange('register')
                    } else {
                      navigate(ROUTES.REGISTER)
                    }
                  }}
                >
                  {t('auth.login.signUp')}
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