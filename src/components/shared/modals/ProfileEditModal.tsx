import React, { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Avatar,
  Select,
  SelectItem,
  Switch,
  Divider
} from '@heroui/react'
import { User, Mail, Phone, MapPin, Calendar, Camera, Eye, EyeOff } from 'lucide-react'
import { ProfileEditModalProps } from '../../../interfaces/Component'

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: user.display_name || '',
    email: user.email || '',
    phone: user.phone || '',
    bio: user.bio || '',
    location: user.location || '',
    dateOfBirth: user.dateOfBirth || '',
    preferredLanguage: user.preferredLanguage || 'English',
    emailNotifications: user.emailNotifications !== false,
    smsNotifications: user.smsNotifications !== false,
    profileVisibility: user.profileVisibility || 'public'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  const languageOptions = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
    'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian'
  ]

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswords(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Validate password fields if changing password
      if (showPasswordFields) {
        if (!passwords.current || !passwords.new || !passwords.confirm) {
          alert('Please fill all password fields')
          return
        }
        if (passwords.new !== passwords.confirm) {
          alert('New passwords do not match')
          return
        }
        if (passwords.new.length < 8) {
          alert('New password must be at least 8 characters')
          return
        }
      }

      const updatedData = { ...formData }
      if (showPasswordFields) {
        // In a real app, you would handle password change separately
        // updatedData.password = passwords.new
      }

      await onSave(updatedData)
      handleClose()
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: user.display_name || '',
      email: user.email || '',
      phone: user.phone || '',
      bio: user.bio || '',
      location: user.location || '',
      dateOfBirth: user.dateOfBirth || '',
      preferredLanguage: user.preferredLanguage || 'English',
      emailNotifications: user.emailNotifications !== false,
      smsNotifications: user.smsNotifications !== false,
      profileVisibility: user.profileVisibility || 'public'
    })
    setPasswords({ current: '', new: '', confirm: '' })
    setShowPasswordFields(false)
    onClose()
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <User className="w-6 h-6 text-primary-500" />
                <h2 className="text-xl font-bold">Edit Profile</h2>
              </div>
              <p className="text-sm text-gray-600">Update your personal information and preferences</p>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-4">
                  <Avatar src={user.avatar_url} size="lg" />
                  <div>
                    <h4 className="font-semibold">Profile Picture</h4>
                    <p className="text-sm text-gray-600 mb-2">Upload a new profile picture</p>
                    <Button
                      size="sm"
                      variant="flat"
                      color="secondary"
                      startContent={<Camera className="w-4 h-4" />}
                    >
                      Change Photo
                    </Button>
                  </div>
                </div>

                <Divider />

                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Basic Information</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      startContent={<User className="w-4 h-4 text-gray-400" />}
                      isRequired
                    />
                    
                    <Input
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      startContent={<Mail className="w-4 h-4 text-gray-400" />}
                      isRequired
                    />
                    
                    <Input
                      label="Phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      startContent={<Phone className="w-4 h-4 text-gray-400" />}
                    />
                    
                    <Input
                      label="Location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      startContent={<MapPin className="w-4 h-4 text-gray-400" />}
                    />
                    
                    <Input
                      label="Date of Birth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      startContent={<Calendar className="w-4 h-4 text-gray-400" />}
                    />
                    
                    <Select
                      label="Preferred Language"
                      selectedKeys={[formData.preferredLanguage]}
                      onSelectionChange={(keys) => handleInputChange('preferredLanguage', Array.from(keys)[0] as string)}
                    >
                      {languageOptions.map((language) => (
                        <SelectItem key={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                  
                  <Textarea
                    label="Bio"
                    placeholder="Tell others about yourself..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    minRows={3}
                    maxRows={5}
                  />
                </div>

                <Divider />

                {/* Password Change */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Security</h4>
                    <Switch
                      size="sm"
                      isSelected={showPasswordFields}
                      onValueChange={setShowPasswordFields}
                      color="primary"
                    >
                      Change Password
                    </Switch>
                  </div>
                  
                  {showPasswordFields && (
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                      <Input
                        label="Current Password"
                        type="password"
                        value={passwords.current}
                        onChange={(e) => handlePasswordChange('current', e.target.value)}
                        startContent={<Eye className="w-4 h-4 text-gray-400" />}
                        isRequired
                      />
                      <Input
                        label="New Password"
                        type="password"
                        value={passwords.new}
                        onChange={(e) => handlePasswordChange('new', e.target.value)}
                        startContent={<EyeOff className="w-4 h-4 text-gray-400" />}
                        isRequired
                      />
                      <Input
                        label="Confirm New Password"
                        type="password"
                        value={passwords.confirm}
                        onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                        startContent={<EyeOff className="w-4 h-4 text-gray-400" />}
                        isRequired
                      />
                    </div>
                  )}
                </div>

                <Divider />

                {/* Privacy & Notifications */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Privacy & Notifications</h4>
                  
                  <Select
                    label="Profile Visibility"
                    selectedKeys={[formData.profileVisibility]}
                    onSelectionChange={(keys) => handleInputChange('profileVisibility', Array.from(keys)[0] as string)}
                    description="Control who can see your profile information"
                  >
                    <SelectItem key="public">Public - Visible to everyone</SelectItem>
                    <SelectItem key="hosts-only">Hosts Only - Only property hosts can see details</SelectItem>
                    <SelectItem key="private">Private - Only basic info visible</SelectItem>
                  </Select>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive booking updates and messages via email</p>
                      </div>
                      <Switch
                        isSelected={formData.emailNotifications}
                        onValueChange={(checked) => handleInputChange('emailNotifications', checked)}
                        color="primary"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-gray-600">Receive urgent notifications via SMS</p>
                      </div>
                      <Switch
                        isSelected={formData.smsNotifications}
                        onValueChange={(checked) => handleInputChange('smsNotifications', checked)}
                        color="primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={handleClose}>
                Cancel
              </Button>
              <Button 
                color="primary" 
                onPress={handleSave}
                isLoading={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
} 