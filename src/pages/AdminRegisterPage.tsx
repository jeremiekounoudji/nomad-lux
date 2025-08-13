import React, { useState } from 'react'
import { Card, CardBody, Input, Button, Textarea } from '@heroui/react'
import { Crown, Mail, Lock, Eye, EyeOff, ArrowLeft, User, Phone } from 'lucide-react'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { useAuthStore } from '../lib/stores/authStore'
import { AdminRegisterPageProps } from '../interfaces'
import { useTranslation } from '../lib/stores/translationStore'

export const AdminRegisterPage: React.FC<AdminRegisterPageProps> = ({ onPageChange }) => {
  const { t } = useTranslation(['admin', 'auth', 'common'])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    reason: '',
    password: '',
    confirmPassword: ''
  })
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
  const [error, setError] = useState('')

  const { registerAdmin, isLoading } = useAdminAuth()
  const { isAdmin } = useAuthStore()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.messages.passwordsDontMatch'))
      return
    }

    // Validate required fields
    if (!formData.name || !formData.email || !formData.password || !formData.reason) {
      setError(t('common.messages.error'))
      return
    }

    console.log('📝 Creating admin account for:', formData.email)

    try {
      console.log("data flow start to call register admin");
      
      const result = await registerAdmin({
        email: formData.email,
        password: formData.password,
        displayName: formData.name,
        bio: formData.reason,
        phone: formData.phone.trim() || undefined
      })

      if (result.error) {
        console.error('❌ Admin registration failed:', result.error)
        setError(result.error)
        return
      }

      if (!result.user) {
        console.error('❌ No user data received')
        setError('Registration failed - no user data received')
        return
      }

      console.log('✅ Admin account created successfully:', {
        email: result.user.email,
        role: result.user.user_role,
        id: result.user.id
      })

      // Redirect to admin dashboard
      console.log('🚀 Redirecting to admin dashboard')
      onPageChange?.('admin')

    } catch (err: any) {
      console.error('❌ Exception during admin registration:', err)
      setError(err.message || t('auth.messages.unexpectedError'))
    }
  }

  const handleBackToLogin = () => {
    onPageChange?.('admin-login')
  }

  return (
    <div 
      className="fixed inset-0 w-screen h-screen flex items-center justify-center p-4 overflow-y-auto"
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
        onPress={handleBackToLogin}
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>

      {/* Admin Register Form */}
      <Card className="w-full max-w-2xl z-10 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
        <CardBody className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-600/80 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{t('admin.register.title', 'Create Admin Account')}</h1>
            <p className="text-white/80 text-sm font-script">{t('admin.login.subtitle')}</p>
          </div>

          {/* Registration Form */}
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="text"
                label={t('admin.register.fullName', 'Full Name')}
                placeholder={t('admin.register.fullNamePlaceholder', 'Your full name')}
                value={formData.name}
                onValueChange={(value) => handleInputChange('name', value)}
                startContent={<User className="w-4 h-4 text-white/60" />}
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
                type="email"
                label={t('auth.login.email', 'Email Address')}
                placeholder="admin@nomadlux.com"
                value={formData.email}
                onValueChange={(value) => handleInputChange('email', value)}
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
            </div>

            <Input
              type="tel"
              label={t('admin.register.phoneOptional', 'Phone Number (Optional)')}
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onValueChange={(value) => handleInputChange('phone', value)}
              startContent={<Phone className="w-4 h-4 text-white/60" />}
              classNames={{
                base: "max-w-full",
                mainWrapper: "h-full",
                input: "text-white placeholder:text-white/60",
                inputWrapper: "h-12 bg-white/10 backdrop-blur-md border border-white/20 data-[hover=true]:bg-white/20 group-data-[focus=true]:bg-white/20",
                label: "text-white/80"
              }}
            />

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('auth.signup.password')}
                placeholder={t('auth.signup.passwordPlaceholder')}
                value={formData.password}
                onValueChange={(value) => handleInputChange('password', value)}
                startContent={<Lock className="w-4 h-4 text-white/60" />}
                endContent={
                  <button 
                    className="focus:outline-none" 
                    type="button" 
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    {isPasswordVisible ? (
                      <EyeOff className="w-4 h-4 text-white/60" />
                    ) : (
                      <Eye className="w-4 h-4 text-white/60" />
                    )}
                  </button>
                }
                type={isPasswordVisible ? "text" : "password"}
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
                label={t('auth.signup.confirmPassword')}
                placeholder={t('auth.signup.confirmPasswordPlaceholder')}
                value={formData.confirmPassword}
                onValueChange={(value) => handleInputChange('confirmPassword', value)}
                startContent={<Lock className="w-4 h-4 text-white/60" />}
                endContent={
                  <button 
                    className="focus:outline-none" 
                    type="button" 
                    onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                  >
                    {isConfirmPasswordVisible ? (
                      <EyeOff className="w-4 h-4 text-white/60" />
                    ) : (
                      <Eye className="w-4 h-4 text-white/60" />
                    )}
                  </button>
                }
                type={isConfirmPasswordVisible ? "text" : "password"}
                classNames={{
                  base: "max-w-full",
                  mainWrapper: "h-full",
                  input: "text-white placeholder:text-white/60",
                  inputWrapper: "h-12 bg-white/10 backdrop-blur-md border border-white/20 data-[hover=true]:bg-white/20 group-data-[focus=true]:bg-white/20",
                  label: "text-white/80"
                }}
                isRequired
              />
            </div>

            {/* Reason for Admin Access */}
            <Textarea
              label={t('admin.register.reason', 'Reason for Admin Access')}
              placeholder={t('admin.register.reasonPlaceholder', 'Please explain why you need admin access to Nomad Lux...')}
              value={formData.reason}
              onValueChange={(value) => handleInputChange('reason', value)}
              minRows={3}
              classNames={{
                base: "max-w-full",
                input: "text-white placeholder:text-white/60",
                inputWrapper: "bg-white/10 backdrop-blur-md border border-white/20 data-[hover=true]:bg-white/20 group-data-[focus=true]:bg-white/20",
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

            {/* Submit Button */}
            <Button
              color="primary"
              size="lg"
              className="w-full font-semibold bg-primary-600 hover:bg-primary-700 text-white"
              onPress={handleSubmit}
              isLoading={isLoading}
              isDisabled={!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.reason}
            >
              {isLoading ? t('admin.register.creating', 'Creating Admin Account...') : t('admin.register.create', 'Create Admin Account')}
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-lg">
            <p className="text-sm text-blue-100">
              <strong>{t('admin.register.infoTitle', 'Admin Registration:')}</strong><br />
              {t('admin.register.info', 'Your account will be created with full administrative privileges and immediate access to the admin panel.')}
            </p>
          </div>

          {/* Back to Login Link */}
          <div className="text-center mt-6">
            <p className="text-white/60 text-sm">
              {t('admin.register.hasAccount', 'Already have an admin account?')}{' '}
              <Button
                variant="light"
                size="sm"
                className="text-primary-300 hover:text-primary-200 p-0 h-auto min-w-0"
                onPress={handleBackToLogin}
              >
                {t('admin.register.signInHere', 'Sign in here')}
              </Button>
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
} 