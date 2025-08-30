import React, { useState, useEffect } from 'react'
import { Card, CardBody, Input, Button, Link, Checkbox } from '@heroui/react'
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
// import { useAuthStore } from '../lib/stores/authStore' // Commented out to avoid unused import warning
import { RegisterPageProps } from '../interfaces'
import toast from 'react-hot-toast'
import { useTranslation } from '../lib/stores/translationStore'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../router/types'

const RegisterPage: React.FC<RegisterPageProps> = ({ onPageChange, onRegister: _onRegister }) => {
  const { t } = useTranslation(['auth', 'common'])
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [isConfirmVisible, setIsConfirmVisible] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [error, setError] = useState('')

  const { signUp, isLoading } = useAuth()
  // const { isAuthenticated } = useAuthStore() // Commented out to avoid unused variable warning

  // Note: Removed auto-redirect after registration - users must login manually

  const toggleVisibility = () => setIsVisible(!isVisible)
  const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible)

  const validateForm = () => {
    if (!firstName.trim()) {
      setError(t('auth.signup.firstName') + ' ' + t('common.messages.error'))
      return false
    }
    if (!lastName.trim()) {
      setError(t('auth.signup.lastName') + ' ' + t('common.messages.error'))
      return false
    }
    if (!email.trim()) {
      setError(t('auth.signup.email') + ' ' + t('common.messages.error'))
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('auth.messages.invalidEmail'))
      return false
    }
    if (!password) {
      setError(t('auth.signup.password') + ' ' + t('common.messages.error'))
      return false
    }
    if (password.length < 8) {
      setError(t('auth.messages.passwordTooShort'))
      return false
    }
    if (password !== confirmPassword) {
      setError(t('auth.messages.passwordsDontMatch'))
      return false
    }
    if (!agreeToTerms) {
      setError(t('auth.messages.agreeTerms'))
      return false
    }
    return true
  }

  const handleRegister = async () => {
    setError('')
    
    if (!validateForm()) {
      return
    }

    console.log('📝 User attempting to register:', email)

    try {
      const result = await signUp({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim()
      })

      if (result.error) {
        console.error('❌ User registration failed:', result.error)
        setError(result.error)
        toast.error(result.error)
        return
      }

      console.log('✅ User registration successful!')
      toast.success(t('auth.messages.signupSuccess') + ' ' + t('auth.login.signIn'))
      
      // Redirect to login page after successful registration
      setTimeout(() => {
        if (onPageChange) {
          onPageChange('login')
        } else {
          navigate(ROUTES.LOGIN)
        }
      }, 1500) // Small delay to show the success message

    } catch (err: any) {
      console.error('❌ Exception during user registration:', err)
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



  return (
    <div 
      className="relative flex min-h-screen items-center justify-center p-4"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&h=1080&fit=crop)',
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

      {/* Register Form */}
      <Card className="z-10 w-full max-w-md border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
        <CardBody className="p-8">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary-500">
              <span className="text-xl font-bold text-white">NL</span>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-white">{t('auth.signup.title')}</h1>
            <p className="text-sm text-white/80">{t('auth.signup.subtitle')}</p>
          </div>



          {/* Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="text"
                label={t('auth.signup.firstName')}
                placeholder={t('auth.signup.firstNamePlaceholder')}
                value={firstName}
                onValueChange={setFirstName}
                startContent={<User className="size-4 text-white/60" />}
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
                type="text"
                label={t('auth.signup.lastName')}
                placeholder={t('auth.signup.lastNamePlaceholder')}
                value={lastName}
                onValueChange={setLastName}
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
              type="email"
              label={t('auth.signup.email')}
              placeholder={t('auth.signup.emailPlaceholder')}
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
              label={t('auth.signup.password')}
              placeholder={t('auth.signup.passwordPlaceholder')}
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

            <Input
              label={t('auth.signup.confirmPassword')}
              placeholder={t('auth.signup.confirmPasswordPlaceholder')}
              value={confirmPassword}
              onValueChange={setConfirmPassword}
              startContent={<Lock className="size-4 text-white/60" />}
              endContent={
                <button className="focus:outline-none" type="button" onClick={toggleConfirmVisibility}>
                  {isConfirmVisible ? (
                    <EyeOff className="size-4 text-white/60" />
                  ) : (
                    <Eye className="size-4 text-white/60" />
                  )}
                </button>
              }
              type={isConfirmVisible ? "text" : "password"}
              classNames={{
                base: "max-w-full",
                mainWrapper: "h-full",
                input: "text-white placeholder:text-white/60",
                inputWrapper: "h-12 bg-white/10 backdrop-blur-md border border-white/20 data-[hover=true]:bg-white/20 group-data-[focus=true]:bg-white/20",
                label: "text-white/80"
              }}
              isRequired
            />

            <Checkbox
              isSelected={agreeToTerms}
              onValueChange={setAgreeToTerms}
              classNames={{
                base: "inline-flex max-w-full w-full bg-transparent",
                label: "text-white/80 text-sm",
                wrapper: "before:border-white/30 after:bg-primary-500 after:text-white"
              }}
            >
              {t('auth.signup.agreePrefix')}{' '}
              <Link className="font-semibold text-white hover:text-white/80" href="#">
                {t('auth.signup.terms')}
              </Link>
              {' '}{t('auth.signup.and')}{' '}
              <Link className="font-semibold text-white hover:text-white/80" href="#">
                {t('auth.signup.privacy')}
              </Link>
            </Checkbox>

            <Button
              color="primary"
              size="lg"
              className="w-full bg-primary-600 font-semibold text-white hover:bg-primary-700"
              onPress={handleRegister}
              isLoading={isLoading}
              isDisabled={!firstName || !lastName || !email || !password || !confirmPassword || !agreeToTerms}
            >
              {isLoading ? t('auth.signup.creating') : t('auth.signup.createAccount')}
            </Button>

            <div className="text-center">
              <span className="text-sm text-white/80">
                {t('auth.signup.hasAccount')}{' '}
                <Link 
                  className="cursor-pointer font-semibold text-white hover:text-white/80"
                  onPress={() => {
                    if (onPageChange) {
                      onPageChange('login')
                    } else {
                      navigate(ROUTES.LOGIN)
                    }
                  }}
                >
                  {t('auth.signup.signIn')}
                </Link>
              </span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default RegisterPage 