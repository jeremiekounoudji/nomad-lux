import React, { useState } from 'react'
import { Card, CardBody, Input, Button, Link, Divider, Checkbox } from '@heroui/react'
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react'
import { RegisterPageProps } from '../interfaces'

const RegisterPage: React.FC<RegisterPageProps> = ({ onPageChange, onRegister }) => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [isConfirmVisible, setIsConfirmVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  const toggleVisibility = () => setIsVisible(!isVisible)
  const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible)

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }
    if (!agreeToTerms) {
      alert('Please agree to the terms and conditions')
      return
    }
    
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      onRegister?.()
    }, 1500)
  }

  const handleBackToHome = () => {
    onPageChange?.('home')
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
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
        className="absolute top-6 left-6 z-20 bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30"
        onPress={handleBackToHome}
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>

      {/* Register Form */}
      <Card className="w-full max-w-md z-10 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
        <CardBody className="p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">NL</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-white/80 text-sm">Join NomadLux and start your journey</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="text"
                label="First Name"
                placeholder="John"
                value={firstName}
                onValueChange={setFirstName}
                startContent={<User className="w-4 h-4 text-white/60" />}
                classNames={{
                  base: "max-w-full",
                  mainWrapper: "h-full",
                  input: "text-white placeholder:text-white/60",
                  inputWrapper: "h-12 bg-white/10 backdrop-blur-md border border-white/20 data-[hover=true]:bg-white/20 group-data-[focus=true]:bg-white/20",
                  label: "text-white/80"
                }}
              />
              <Input
                type="text"
                label="Last Name"
                placeholder="Doe"
                value={lastName}
                onValueChange={setLastName}
                classNames={{
                  base: "max-w-full",
                  mainWrapper: "h-full",
                  input: "text-white placeholder:text-white/60",
                  inputWrapper: "h-12 bg-white/10 backdrop-blur-md border border-white/20 data-[hover=true]:bg-white/20 group-data-[focus=true]:bg-white/20",
                  label: "text-white/80"
                }}
              />
            </div>

            <Input
              type="email"
              label="Email"
              placeholder="john.doe@example.com"
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
            />

            <Input
              label="Password"
              placeholder="Create a strong password"
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
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onValueChange={setConfirmPassword}
              startContent={<Lock className="w-4 h-4 text-white/60" />}
              endContent={
                <button className="focus:outline-none" type="button" onClick={toggleConfirmVisibility}>
                  {isConfirmVisible ? (
                    <EyeOff className="w-4 h-4 text-white/60" />
                  ) : (
                    <Eye className="w-4 h-4 text-white/60" />
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
              I agree to the{' '}
              <Link className="text-white font-semibold hover:text-white/80" href="#">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link className="text-white font-semibold hover:text-white/80" href="#">
                Privacy Policy
              </Link>
            </Checkbox>

            <Button
              color="primary"
              size="lg"
              className="w-full font-semibold"
              onPress={handleRegister}
              isLoading={isLoading}
              isDisabled={!firstName || !lastName || !email || !password || !confirmPassword || !agreeToTerms}
            >
              Create Account
            </Button>

            <div className="relative">
              <Divider className="bg-white/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-transparent px-4 text-sm text-white/80">or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="flat"
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
                startContent={
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                }
              >
                Google
              </Button>
              <Button
                variant="flat"
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
                startContent={
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                }
              >
                Facebook
              </Button>
            </div>

            <div className="text-center">
              <span className="text-white/80 text-sm">
                Already have an account?{' '}
                <Link 
                  className="text-white font-semibold hover:text-white/80"
                  onPress={() => onPageChange?.('login')}
                >
                  Sign in
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