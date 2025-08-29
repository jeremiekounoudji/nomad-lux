import React, { useState, useEffect } from 'react'
import { Card, CardBody, Input, Button, Link } from '@heroui/react'
import { Crown, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { useAuthStore } from '../lib/stores/authStore'
import { AdminLoginPageProps } from '../interfaces'
import { useTranslation } from '../lib/stores/translationStore'

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onPageChange }) => {
  const { t } = useTranslation(['admin', 'auth', 'common'])
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
      onPageChange?.(t('admin.navigation.dashboard'))
    }
  }, [isAuthenticated, isAdmin, onPageChange, t])

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
      setError(err.message || t('admin.login.unexpectedError'))
    }
  }

  const handleBackToHome = () => {
    onPageChange?.('home')
  }

  return (
    <div 
      className="fixed inset-0 flex h-screen w-screen items-center justify-center p-4"
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
        className="absolute left-6 top-6 z-20 border border-primary-400/30 bg-primary-500/20 text-white backdrop-blur-md hover:bg-primary-500/30"
        onPress={handleBackToHome}
      >
        <ArrowLeft className="size-5" />
      </Button>

      {/* Admin Login Form */}
      <Card className="z-10 w-full max-w-md border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
        <CardBody className="p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl border border-white/20 bg-primary-600/80 backdrop-blur-md">
              <Crown className="size-8 text-white" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-white">{t('admin.login.title')}</h1>
            <p className="font-script text-sm text-white/80">{t('admin.login.subtitle')}</p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Email Field */}
            <Input
              type="email"
              label={t('admin.login.email')}
              placeholder={t('admin.login.emailPlaceholder')}
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

            {/* Password Field */}
            <Input
              label={t('auth.login.password')}
              placeholder={t('admin.login.passwordPlaceholder')}
              value={password}
              onValueChange={setPassword}
              startContent={<Lock className="size-4 text-white/60" />}
              endContent={
                <button 
                  className="focus:outline-none" 
                  type="button" 
                  onClick={toggleVisibility}
                >
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

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-400/30 bg-red-500/20 p-3 text-center text-sm text-red-300 backdrop-blur-md">
                {error}
              </div>
            )}

            {/* Login Button */}
            <Button
              color="primary"
              size="lg"
              className="w-full bg-primary-600 font-semibold text-white hover:bg-primary-700"
              onPress={handleSubmit}
              isLoading={isLoading}
              isDisabled={!email || !password}
            >
              {isLoading ? t('auth.login.signingIn') : t('admin.login.signIn')}
            </Button>
          </div>

          {/* Development Note */}
          <div className="mt-6 rounded-lg border border-blue-400/30 bg-blue-500/20 p-4 backdrop-blur-md">
            <p className="text-sm text-blue-100">
              <strong>{t('admin.login.infoTitle')}</strong><br />
              {t('admin.login.info')}
            </p>
          </div>

          {/* Admin Register Link */}
          <div className="mt-6 text-center">
            <span className="text-sm text-white/80">
              {t('admin.login.needAccess')}{' '}
              <Link 
                className="font-semibold text-white hover:text-white/80"
                onPress={() => onPageChange?.(t('admin.navigation.register'))}
              >
                {t('admin.login.requestAccess')}
              </Link>
            </span>
          </div>
        </CardBody>
      </Card>
    </div>
  )
} 