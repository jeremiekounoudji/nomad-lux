import React, { useState, useEffect } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea } from '@heroui/react'
import { User, Mail, Phone, MapPin, Calendar, FileText } from 'lucide-react'
import { useTranslation } from '../../../lib/stores/translationStore'
import { Profile, ProfileUpdateData } from '../../../interfaces/Profile'
import toast from 'react-hot-toast'

interface ProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
  profile: Profile
  onSave: (updateData: ProfileUpdateData) => Promise<void>
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave
}) => {
  const { t } = useTranslation(['profile', 'common'])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<ProfileUpdateData>({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    dateOfBirth: '',
    location: ''
  })

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        dateOfBirth: profile.dateOfBirth || '',
        location: profile.location || ''
      })
    }
  }, [isOpen, profile])

  const handleInputChange = (field: keyof ProfileUpdateData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      await onSave(formData)
      toast.success(t('profile.messages.updateSuccess'))
      onClose()
    } catch (error: any) {
      console.error('❌ Error updating profile:', error)
      toast.error(error.message || t('profile.errors.updateFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary-600" />
            <span>{t('profile.actions.editPersonalInfo')}</span>
          </div>
        </ModalHeader>
        
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label={t('profile.fields.firstName')}
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              startContent={<User className="w-4 h-4 text-gray-400" />}
            />
            <Input
              label={t('profile.fields.lastName')}
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              startContent={<User className="w-4 h-4 text-gray-400" />}
            />
            <Input
              label={t('profile.fields.phone')}
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              startContent={<Phone className="w-4 h-4 text-gray-400" />}
            />
            <Input
              label={t('profile.fields.location')}
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              startContent={<MapPin className="w-4 h-4 text-gray-400" />}
            />
            <Input
              type="date"
              label={t('profile.fields.dateOfBirth')}
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              startContent={<Calendar className="w-4 h-4 text-gray-400" />}
            />
            <div className="md:col-span-2">
              <Textarea
                label={t('profile.fields.bio')}
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                maxLength={500}
                minRows={3}
                startContent={<FileText className="w-4 h-4 text-gray-400 mt-2" />}
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" onPress={onClose} disabled={isLoading}>
            {t('common.buttons.cancel')}
          </Button>
          <Button 
            className="bg-main text-white hover:bg-main/90"
            onPress={handleSave} 
            isLoading={isLoading}
          >
            {t('common.buttons.save')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
