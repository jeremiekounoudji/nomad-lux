import React, { useState } from 'react'
import { Card, CardBody, Input, Button, Link, Select, SelectItem, Textarea } from '@heroui/react'
import { Crown, Mail, Lock, Eye, EyeOff, ArrowLeft, User, Phone, Building2 } from 'lucide-react'

import { AdminRegisterPageProps } from '../interfaces'

export const AdminRegisterPage: React.FC<AdminRegisterPageProps> = ({ onPageChange }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    reason: '',
    password: '',
    confirmPassword: ''
  })
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const roles = [
    { key: 'property-manager', label: 'Property Manager' },
    { key: 'operations-manager', label: 'Operations Manager' },
    { key: 'customer-support', label: 'Customer Support' },
    { key: 'marketing-manager', label: 'Marketing Manager' },
    { key: 'business-development', label: 'Business Development' },
    { key: 'other', label: 'Other' },
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    // Simulate admin registration request
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
    }, 2000)
  }

  const handleBackToLogin = () => {
    onPageChange?.('admin-login')
  }

  if (isSubmitted) {
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
        
        <Card className="w-full max-w-md z-10 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
          <CardBody className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500/80 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Request Submitted</h1>
            <p className="text-white/80 mb-6 text-sm">
              Thank you for requesting admin access. Your application has been submitted and will be reviewed by our team.
              You will receive an email notification once your request has been processed.
            </p>
            <div className="space-y-3">
              <Button
                color="primary"
                size="lg"
                className="w-full font-semibold bg-primary-600 hover:bg-primary-700 text-white"
                onPress={() => onPageChange?.('admin-login')}
              >
                Back to Admin Login
              </Button>
              <Button
                variant="flat"
                size="lg"
                className="w-full bg-primary-500/20 backdrop-blur-md border border-primary-400/30 text-white hover:bg-primary-500/30"
                onPress={() => onPageChange?.('home')}
              >
                Back to Home
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    )
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
            <h1 className="text-2xl font-bold text-white mb-2">Request Admin Access</h1>
            <p className="text-white/80 text-sm font-script text-lg">
              Nomad Lux Administration
            </p>
          </div>

          {/* Registration Form */}
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="text"
                label="Full Name"
                placeholder="Your full name"
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
                type="tel"
                label="Phone Number"
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
                isRequired
              />
            </div>

            {/* Email Field */}
            <Input
              type="email"
              label="Email Address"
              placeholder="your.email@company.com"
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

            {/* Company Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="text"
                label="Company/Organization"
                placeholder="Your company"
                value={formData.company}
                onValueChange={(value) => handleInputChange('company', value)}
                startContent={<Building2 className="w-4 h-4 text-white/60" />}
                classNames={{
                  base: "max-w-full",
                  mainWrapper: "h-full",
                  input: "text-white placeholder:text-white/60",
                  inputWrapper: "h-12 bg-white/10 backdrop-blur-md border border-white/20 data-[hover=true]:bg-white/20 group-data-[focus=true]:bg-white/20",
                  label: "text-white/80"
                }}
                isRequired
              />

              <Select
                label="Role/Position"
                placeholder="Select role"
                selectedKeys={formData.role ? [formData.role] : []}
                onSelectionChange={(keys) => handleInputChange('role', Array.from(keys)[0] as string)}
                classNames={{
                  base: "max-w-full",
                  mainWrapper: "h-full",
                  trigger: "h-12 bg-white/10 backdrop-blur-md border border-white/20 data-[hover=true]:bg-white/20 data-[open=true]:bg-white/20",
                  label: "text-white/80",
                  value: "text-white",
                  selectorIcon: "text-white/60"
                }}
                isRequired
              >
                {roles.map((role) => (
                  <SelectItem key={role.key} value={role.key}>
                    {role.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* Reason for Access */}
            <Textarea
              label="Reason for Admin Access"
              placeholder="Please explain why you need admin access to the platform..."
              value={formData.reason}
              onValueChange={(value) => handleInputChange('reason', value)}
              rows={3}
              classNames={{
                base: "max-w-full",
                mainWrapper: "h-full",
                input: "text-white placeholder:text-white/60",
                inputWrapper: "bg-white/10 backdrop-blur-md border border-white/20 data-[hover=true]:bg-white/20 group-data-[focus=true]:bg-white/20",
                label: "text-white/80"
              }}
              isRequired
            />

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                placeholder="Create password"
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
                label="Confirm Password"
                placeholder="Confirm password"
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
            >
              {isLoading ? 'Submitting Request...' : 'Submit Access Request'}
            </Button>
          </div>

          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <span className="text-white/80 text-sm">
              Already have admin credentials?{' '}
              <Link 
                className="text-white font-semibold hover:text-white/80"
                onPress={() => onPageChange?.('admin-login')}
              >
                Sign In Here
              </Link>
            </span>
          </div>
        </CardBody>
      </Card>
    </div>
  )
} 